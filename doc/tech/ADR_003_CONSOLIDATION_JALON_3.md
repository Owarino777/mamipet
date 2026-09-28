# ADR 003 — Frontière publique et paiement après consolidation

- Date : 29 septembre 2026
- Statut : accepté dans le code local ; déploiement Supabase à valider.

## Contexte

Le schéma initial rendait les profils pet-sitters publiés lisibles en entier via l'API Supabase, y compris téléphone, adresse et coordonnées exactes. Le DTO Next.js masquait ces champs, mais un client pouvait interroger la table directement. Le code hérité a aussi fermé Checkout : il manque un webhook signé, l'idempotence et le circuit Connect nécessaire à un encaissement fiable. Les écrans applicatifs utilisent encore des données locales de démonstration.

## Décision

La migration `202609230008` retire la lecture publique de la table `profil_pet_sitter` et ajoute `pet_sitter_public_profile`, projection explicite contenant seulement les données diffusables et des coordonnées arrondies. Les deux routes publiques lisent cette vue. La migration `202609230009` protège les champs de validation des documents, la note des avis et les statuts de signalement contre les écritures directes via PostgREST. Les migrations déjà versionnées restent inchangées.

### Modèle de sécurité de la projection publique

La vue est volontairement créée sans `security_invoker=true`. PostgreSQL vérifie donc les privilèges des tables sous-jacentes et leurs RLS selon le propriétaire de la vue ; dans une migration Supabase exécutée par `postgres`, ce propriétaire peut contourner la RLS. **La vue constitue elle-même la frontière publique** : liste de colonnes et objets JSON explicites, filtre `visibilite_publique = true` et trois statuts autorisés, arrondi des coordonnées à deux décimales, puis `GRANT SELECT` sur la seule vue à `anon` et `authenticated`. `security_barrier=true` fait évaluer le filtre avant les conditions non `LEAKPROOF` ajoutées par l'appelant ; il ne remplace ni ce filtre ni la revue des colonnes. Aucun numéro de téléphone, adresse précise, champ médical ou provenance de badge n'est sélectionné. Les jointures ne construisent que les identifiants et libellés des offres et les badges actifs.

Le `SELECT` direct de `anon` sur `profil_pet_sitter` est révoqué. Un compte `authenticated` peut encore lire sa propre ligne complète selon la RLS de la table, et un administrateur conserve ses droits particuliers ; la vue leur fournit exactement la même projection publique qu'à `anon`, sans accès supplémentaire à une autre ligne privée. Passer cette vue en `security_invoker=true` imposerait au visiteur les droits sur la table source qui lui ont été retirés et appliquerait les RLS de l'appelant : la recherche publique ne fonctionnerait plus selon ce contrat. Ce choix exige de tester toute évolution de la vue et des jointures avant déploiement. Références : [PostgreSQL CREATE VIEW](https://www.postgresql.org/docs/current/sql-createview.html) et [Supabase Views](https://supabase.com/docs/guides/database/views).

Pour `avis`, la policy `UPDATE` limite la ligne au pet-sitter de la réservation ou à l'administrateur ; le `GRANT UPDATE(reponse_pet_sitter, date_reponse_pet_sitter)` limite les colonnes pour **tous** les comptes `authenticated`, administrateur compris. La RLS seule ne protège pas les autres colonnes d'une ligne autorisée. Les tests PostgreSQL embarqués vérifient ces deux couches.

La fixture de session locale n'est pas une authentification Supabase : son mot de passe public de démonstration peut être fourni par `NEXT_PUBLIC_MAMIPET_DEV_FIXTURE_PASSWORD`, avec une valeur de secours réservée à `next dev` sur une origine locale. Ne jamais y placer un mot de passe réel. Le seed éditorial accepte une URL PostgreSQL de boucle locale seulement et utilise par défaut le port Supabase local ; une redirection ou un tunnel local vers une base distante relève de la configuration de l'exploitant et ne peut être identifié par le nom d'hôte seul.

Le paiement en ligne reste fermé avec une réponse `409`. Aucun statut `paid` ni contrat ne doit être déduit d'un retour navigateur. La simulation dans l'interface est une fixture locale, distincte d'un paiement serveur. La mise en service de l'encaissement demande une décision métier et une implémentation testée de Connect, des webhooks signés et des remboursements.

## Alternatives étudiées

- Garder uniquement le DTO public : insuffisant car Supabase expose la table directement.
- Retirer toute lecture publique : protège les données mais supprime la recherche.
- Mettre la vue en `security_invoker=true` : requiert le `SELECT` sur les tables source par `anon` et ferait dépendre la projection publique de la RLS de l'appelant, contrairement au contrat retenu.
- Réactiver Checkout pour la démonstration : un succès de redirection ne garantit pas le paiement.

## Conséquences

Les migrations `008` et `009` doivent être appliquées avant de déployer les routes publiques correspondantes. L'authentification, le Storage réel, les migrations sur un projet distant et le parcours E2E complet restent à vérifier sur une préproduction dédiée. Les tests PostgreSQL embarqués couvrent la projection et quelques refus d'accès, pas le comportement du service Supabase hébergé.
