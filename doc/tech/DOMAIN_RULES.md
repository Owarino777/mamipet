# Règles métier

Toutes les règles sont numerotees pour être transformees en tests.

## 1. Identité et comptes

`ID-001` Un compte applicatif correspond a un utilisateur Supabase Auth.

`ID-002` Le schéma applicatif ne stocké jamais de mot de passe.

`ID-003` Un email correspond a un seul compte Supabase.

`ID-004` Un compte peut avoir zero ou un profil propriétaire.

`ID-005` Un compte peut avoir zero ou un profil pet-sitter.

`ID-006` Un compte peut avoir les deux profils.

`ID-007` Un compte admin est identifie par `is_admin = true`.

## 2. Profils

`PR-001` Le profil propriétaire et le profil pet-sitter sont deux objets métier distincts.

`PR-002` Le profil pet-sitter peut être visible sans être pleinement vérifié.

`PR-003` Un profil pet-sitter suspendu ou rejete ne doit pas être mis en avant dans la recherche publique.

`PR-004` Le statut de vérification n'est pas un badge public.

`PR-005` Le badge Expert n'est pas un statut de profil.

## 3. Referentiels

`REF-001` Les espèces, capacités de soin, lieux de garde, formats de garde et services additionnels sont séparés.

`REF-002` Un animal appartient a une seule espèce.

`REF-003` Un pet-sitter peut accepter plusieurs espèces.

`REF-004` Un pet-sitter peut maîtriser plusieurs capacités de soin.

## 4. Animaux et données médicales

`AN-001` Un animal appartient a un seul propriétaire.

`AN-002` Un propriétaire peut créer plusieurs animaux.

`AN-003` Un animal peut avoir zero ou un dossier médical.

`AN-004` Un dossier médical appartient a un seul animal.

`AN-005` Les documents animaux ne sont jamais publics.

`AN-006` Les données médicales détaillées sont visibles seulement par le propriétaire, l'admin ou un pet-sitter autorisé par contexte de réservation.

## 5. Pet-sitter et qualification

`QS-001` Un document professionnel appartient a un seul profil pet-sitter.

`QS-002` Un document professionnel a un statut parmi `submitted`, `validated`, `rejected`, `expired`.

`QS-003` Un test de validation cible soit une espèce soit une capacité de soin.

`QS-004` Un test de validation ne peut jamais cibler à la fois une espèce et une capacité.

`QS-005` Un badge actif ne peut pas être duplique pour le même pet-sitter.

`QS-006` Un abonnement actif ou trial ne peut pas être duplique pour le même pet-sitter.

`QS-007` Un badge Pro peut être attribue après validation documentaire pertinente.

`QS-008` Un badge Verified Identity peut être attribue après validation d'identité.

`QS-009` Un badge Expert dépend d'une compétence validée par test.

## 6. Disponibilités

`AV-001` Une disponibilité appartient a un seul pet-sitter.

`AV-002` La date de fin d'une disponibilité est strictement après sa date de debut.

`AV-003` Une disponibilité libre ne pointe pas vers une réservation.

`AV-004` Une disponibilité liee a une réservation doit avoir un statut de blocage.

`AV-005` Une réservation acceptée doit bloquer un créneau.

## 7. Réservation

`RS-001` Une réservation relie exactement un propriétaire et un pet-sitter.

`RS-002` Une réservation concerné au moins un animal.

`RS-003` Tous les animaux d'une réservation appartiennent au propriétaire de la réservation.

`RS-004` La date de fin d'une réservation est strictement après sa date de debut.

`RS-005` Le statut initial d'une réservation est `awaiting_response`.

`RS-006` Seul le pet-sitter concerné peut accepter ou refuser une réservation.

`RS-007` Une réservation refusee peut garder un motif de refus.

`RS-008` Une réservation acceptée passe ensuite en attente de paiement après blocage du créneau.

`RS-009` Une réservation ne peut pas être payée si elle n'est pas en attente de paiement.

`RS-010` Une réservation payée peut passer à terminée après prestation.

`RS-011` Une réservation peut passer à incident signale si un probleme est declare.

`RS-012` Une réservation annulee garde un motif si disponible.

`RS-013` Le taux de commission applique est stocké sur la réservation.

`RS-014` Le montant réel de commission appartient au paiement.

## 8. Paiement

`PY-001` Le paiement est distinct de la réservation.

`PY-002` Une réservation MVP a au plus un paiement principal.

`PY-003` Les statuts de paiement ne remplacent pas les statuts de réservation.

`PY-004` Le montant total est supérieur ou égal à la commission plateforme.

`PY-005` Le montant prestataire vaut montant total moins commission plateforme.

`PY-006` La commission MVP est de 15 %.

`PY-007` Stripe Connect est préparé mais le paiement MVP peut être simulé en mode test.

## 9. Contrat

`CT-001` Le contrat récapitulatif est généré a partir d'une réservation.

`CT-002` Une réservation MVP a au plus un contrat principal.

`CT-003` Le contrat contient parties, animaux, dates, lieu, format, tarif, commission, assurance, consignes et clauses standard.

`CT-004` Le contrat est stocké dans un bucket privé.

## 10. Avis

`RV-001` Un avis dépend d'une réservation.

`RV-002` Un avis ne dépend pas directement du paiement.

`RV-003` Le propriétaire et le pet-sitter d'un avis sont deduits de la réservation.

`RV-004` Un avis est unique par réservation.

`RV-005` Un avis ne peut être créé qu'après réservation terminée.

`RV-006` Le pet-sitter concerné peut répondre à l'avis.

`RV-007` La date de réponse ne peut pas être antérieure à la date d'avis.

## 11. Signalement

`RP-001` Un signalement a un créateur.

`RP-002` Un signalement ouvre un ticket traçable.

`RP-003` Un signalement peut être général.

`RP-004` Un signalement peut cibler au plus une réservation, un profil pet-sitter ou un avis.

`RP-005` La date de résolution ne peut pas être antérieure à la date de signalement.

## 12. Données publiques et privées

`SEC-001` Les profils publics n'exposent jamais email, téléphone brut, adresse complète ou documents.

`SEC-002` Les coordonnées exactes ne sont pas exposees publiquement.

`SEC-003` Les documents professionnels ne sont jamais publics.

`SEC-004` Les données médicales ne sont jamais publiques.

`SEC-005` Les actions admin sensibles sont tracees.

