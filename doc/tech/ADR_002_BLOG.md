# ADR 002 — Blog dans l’application existante

- Date : 23 septembre 2026
- Statut : accepté pour cette implémentation ; validation Supabase distante à effectuer.

## Contexte

Projet scolaire, budget limité, Next.js et Supabase déjà utilisés. Le besoin est de permettre à un administrateur non développeur de rédiger, prévisualiser, publier et retirer des articles. Les pages existantes et les références Figma doivent conserver leur identité graphique.

## Décision

Ajouter un module `blog` avec schémas métier Zod, repository injectant le client Supabase, routes REST administrateur, pages publiques rendues sur le serveur et éditeur de blocs de texte. Utiliser les composants et couleurs existants, avec CSS limité aux nouvelles pages.

Séparer le brouillon privé et la copie publique dans deux tables avec RLS. Une fonction SQL avec verrou et vérification de version publie ou retire atomiquement. Une simple sauvegarde n’affecte jamais la copie publique. Garder l’URL stable après première publication.

Le texte est structuré et échappé : aucun HTML arbitraire ni extension d’éditeur lourd. Les images utilisent un bucket public réservé au blog. Les documents personnels restent hors de ce bucket.

## Alternatives

- CMS externe : interface éditoriale plus riche, mais service et permissions supplémentaires à exploiter.
- Articles Markdown dans Git : simple pour les développeurs, inadapté au rédacteur demandé.
- Table unique publique avec statut : fragile si une lecture oublie de filtrer les brouillons et ne sépare pas les corrections privées d’un article déjà en ligne.

## Conséquences

Pas de nouvel abonnement. Les coûts et quotas existants de stockage, trafic et hébergement s’appliquent. L’éditeur couvre la rédaction simple, sans collaboration temps réel, programmation ni historique complet. Les pages lisent la version publiée à chaque requête ; un cache avec invalidation fiable pourra être ajouté si les mesures de trafic le justifient.

PGlite est une dépendance de développement pour vérifier les politiques SQL sans Docker ni service distant. Les tests navigateur utilisent un transport simulé isolé. Une validation Auth/Storage réelle reste un préalable à la livraison.
