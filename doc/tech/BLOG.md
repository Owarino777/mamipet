# Journal MamiPet : utilisation et mise en service

## Pour la personne qui rédige

1. Se connecter avec un vrai compte administrateur, puis ouvrir **Articles** dans l’espace d’administration, ou `/admin/blog`.
2. Choisir **Rédiger un article**. Remplir le titre, le résumé et l’auteur.
3. Ajouter des paragraphes, sous-titres, listes ou citations. Les boutons Monter/Descendre permettent de réordonner les blocs ; aucune connaissance du HTML n’est nécessaire.
4. Importer éventuellement une couverture JPEG, PNG ou WebP de **4 Mo maximum** et décrire son contenu dans le champ prévu.
5. **Enregistrer le brouillon** conserve le travail en privé. L’enregistrement est manuel ; un avertissement prévient une navigation qui perdrait les modifications.
6. **Voir l’aperçu**, relire, puis **Publier l’article**. Il apparaît sur `/blog` et dans le sitemap.
7. Pour modifier un article en ligne, enregistrer les corrections puis choisir **Publier les modifications**. La version en ligne reste inchangée tant que ce bouton n’est pas utilisé.
8. **Retirer du site** dépublie immédiatement l’article ; le brouillon reste disponible. L’adresse ne peut plus changer après la première publication, même après retrait.

Les champs SEO sont facultatifs : par défaut, les moteurs reçoivent le titre et le résumé. Rédiger des titres précis, un contenu original et utile, et des descriptions fidèles. Une balise SEO ne garantit ni indexation ni classement.

En cas de conflit entre deux rédacteurs, l’enregistrement est refusé avec un message. Copier le texte non enregistré avant de recharger la dernière version. Le texte reste dans l’éditeur après une erreur réseau ; il n’existe pas de récupération garantie après fermeture brutale du navigateur.

**Images :** le bucket `blog-images` est public dès l’import, même si le texte de l’article est encore un brouillon. Importer seulement des images destinées à être publiques, jamais des documents médicaux ou d’identité. Retirer une couverture de l’article ne supprime pas le fichier du stockage, car il peut encore servir à une version publiée.

## Mise en service technique

- Aucun CMS externe, abonnement éditorial ou paiement Stripe requis.
- Variables existantes : `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_APP_URL`. Cette dernière doit être l’origine publique réelle en déploiement, sans chemin, pour les liens canoniques et le sitemap. Les clés et mots de passe restent dans les variables d’environnement.
- Appliquer les migrations existantes dans l’ordre, puis `202609230006_blog.sql` et `202609230007_account_creation_access.sql` **sur une base de test**. La première crée les tables, les règles RLS, la fonction atomique de publication et le bucket ; la seconde autorise l’initialisation de son propre compte sans droit d’attribution des rôles.
- `npm run db:apply` utilise `SUPABASE_DB_URL` dans `.env.local`. Il refuse un schéma préexistant sans historique : rapprocher d’abord les migrations effectivement appliquées, sans relancer tout le schéma initial sur une base existante.
- Le compte administrateur est un utilisateur Supabase Auth réel, avec une ligne active dans `compte_utilisateur` et `est_administrateur = true`. L’attribution initiale se fait par l’exploitant dans Supabase, sur l’UUID vérifié du compte. Aucun bouton public, métadonnée d’inscription ou stockage navigateur ne permet d’accorder ce droit.
- Pour charger les dix articles éditoriaux sur une base locale migrée avec un compte administrateur actif : `npm.cmd run db:seed:local-blog`. Le script utilise `SUPABASE_DB_URL` si défini, sinon la base Supabase locale sur `127.0.0.1:54322`. Il préserve les articles déjà présents, y compris les corrections faites dans l’admin. Ne pas l’exécuter sur une base de production.
- Après installation ou mise à jour des dépendances : `npm ci`, `npm run quality`, puis `npm run dev`. Sous PowerShell, `npm.cmd` fonctionne aussi.
- Tester la connexion d’un admin, d’un compte ordinaire et d’un visiteur. Vérifier que les deux derniers ne peuvent pas écrire/lire les brouillons via les API **ni directement via Supabase**.
- Configurer les URL de redirection Auth autorisées : `http://localhost:3000/auth/callback` pour le développement et `https://VOTRE-DOMAINE/auth/callback` pour le déploiement. Vérifier aussi Site URL et les URL du parcours d’inscription. Le bouton de mot de passe oublié utilise le flux PKCE Supabase : ouvrir l’email dans le navigateur où la demande a été faite.

Les migrations distantes, l’envoi d’emails et l’import d’images sur le vrai Storage restent à vérifier avec un projet de test configuré. Les tests locaux n’utilisent aucun secret ni compte réel.

## Contrats et protections

Contrat machine : [blog.openapi.yaml](blog.openapi.yaml), référencé par [openapi.yaml](openapi.yaml).

| Méthode / route | Entrée | Résultat |
| --- | --- | --- |
| `GET /api/admin/blog?page=1` | Page entière, 1 à 4000 | 20 brouillons maximum et total |
| `POST /api/admin/blog` | `ArticleDocument` complet | Brouillon, version 1 |
| `GET /api/admin/blog/{id}` | UUID | Brouillon courant |
| `PATCH /api/admin/blog/{id}` | `{version, document}` | Version suivante, ou conflit 409 |
| `POST /api/admin/blog/{id}/publication` | `{version, publish: boolean}` | Publication/retrait atomique et version suivante |
| `POST /api/admin/blog/images` | Octets de l’image, corps brut | URL publique de l’image |

Toutes ces routes requièrent un administrateur actif authentifié par les cookies Supabase SSR. Les réponses suivent `{data, meta, error}` et sont `private, no-store`. Erreurs : 400 entrée invalide, 401 anonyme, 403 droits/origine, 404 absent, 409 révision/adresse en conflit, 413 taille dépassée, 422 publication incomplète, 5xx panne technique sans détails internes.

Le document contient `title`, `slug`, `excerpt`, `authorName`, `coverImageUrl`, `coverImageAlt`, `seoTitle`, `seoDescription`, `blocks`. Les blocs sont des objets stricts `{type, text}` : `paragraph`, `heading`, `quote` ou `list`. Les listes utilisent une ligne par élément. Les champs facultatifs éditoriaux sont des chaînes vides dans le contrat, pas des propriétés manquantes.

- Taille JSON : 1 Mio maximum, lecture du flux bornée avant parsing.
- Images : signatures JPEG/PNG/WebP vérifiées, 4 Mio maximum avant stockage. Cette limite reste sous les [4,5 Mo des fonctions Vercel](https://vercel.com/docs/functions/limitations#request-body-size).
- Le serveur n’accepte une URL de couverture que dans le bucket du projet, compatible avec la liste d’images autorisées Next.js.
- Pas de HTML ou script utilisateur : rendu des blocs en texte React échappé. JSON-LD encodé contre la fermeture d’une balise script.
- Les lectures publiques utilisent un client Supabase anonyme et exclusivement `blog_publications`. Les brouillons vivent dans `blog_posts` sous RLS admin.
- Les conflits utilisent une version entière et un verrou SQL lors de la publication. Les écritures directes de publications et métadonnées de publication sont interdites aux clients.
- Pagination publique : 12 articles par page. Rendu serveur dynamique et déduplication d’une lecture d’article dans la requête, pour que le retrait n’attende pas l’expiration d’un cache partagé.
- Pas de suppression définitive dans l’éditeur, de planification ni d’historique complet des versions. `updated_by`, `version` et dates assurent le suivi du dernier changement, pas un journal d’audit exhaustif.

## Vérification et exploitation

`npm test` exécute notamment les migrations 006 et 007 dans PostgreSQL embarqué (PGlite), avec schémas Auth/Storage minimaux et la vraie fonction `is_current_account_admin` du projet. Tests : séparation public/privé, refus aux membres/admin suspendu, conflits, adresse immuable, retrait, publication incomplète, initialisation de compte sans élévation de privilège. Cela ne remplace pas un test du vrai service Supabase Auth/Storage, ni une simulation de concurrence multi-connexion.

Le parcours navigateur est reproductible avec `scripts/qa-blog-fixture.mjs` et `scripts/qa-blog-browser.mjs` ; il simule le transport Supabase, pas les règles SQL (testées séparément). Voir [QA_BLOG.md](QA_BLOG.md).

En cas de mauvais contenu, retirer l’article depuis l’éditeur. En cas de panne SQL, conserver les tables et corriger la migration/configuration ; ne pas supprimer les données pour réinstaller. Sauvegarder séparément les tables et le bucket, puis tester la restauration. Les fichiers inutilisés se nettoient seulement après vérification de leur absence dans les brouillons et publications.

Pour une annulation du déploiement, revenir au code précédent en conservant les nouvelles tables et fichiers. Les migrations sont additives. Ne pas supprimer le bucket pour faire un rollback applicatif.
