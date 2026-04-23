# Regles metier

Toutes les regles sont numerotees pour etre transformees en tests.

## 1. Identite et comptes

`ID-001` Un compte applicatif correspond a un utilisateur Supabase Auth.

`ID-002` Le schema applicatif ne stocke jamais de mot de passe.

`ID-003` Un email correspond a un seul compte Supabase.

`ID-004` Un compte peut avoir zero ou un profil proprietaire.

`ID-005` Un compte peut avoir zero ou un profil pet-sitter.

`ID-006` Un compte peut avoir les deux profils.

`ID-007` Un compte admin est identifie par `is_admin = true`.

## 2. Profils

`PR-001` Le profil proprietaire et le profil pet-sitter sont deux objets metier distincts.

`PR-002` Le profil pet-sitter peut etre visible sans etre pleinement verifie.

`PR-003` Un profil pet-sitter suspendu ou rejete ne doit pas etre mis en avant dans la recherche publique.

`PR-004` Le statut de verification n'est pas un badge public.

`PR-005` Le badge Expert n'est pas un statut de profil.

## 3. Referentiels

`REF-001` Les especes, capacites de soin, lieux de garde, formats de garde et services additionnels sont separes.

`REF-002` Un animal appartient a une seule espece.

`REF-003` Un pet-sitter peut accepter plusieurs especes.

`REF-004` Un pet-sitter peut maitriser plusieurs capacites de soin.

## 4. Animaux et donnees medicales

`AN-001` Un animal appartient a un seul proprietaire.

`AN-002` Un proprietaire peut creer plusieurs animaux.

`AN-003` Un animal peut avoir zero ou un dossier medical.

`AN-004` Un dossier medical appartient a un seul animal.

`AN-005` Les documents animaux ne sont jamais publics.

`AN-006` Les donnees medicales detaillees sont visibles seulement par le proprietaire, l'admin ou un pet-sitter autorise par contexte de reservation.

## 5. Pet-sitter et qualification

`QS-001` Un document professionnel appartient a un seul profil pet-sitter.

`QS-002` Un document professionnel a un statut parmi `submitted`, `validated`, `rejected`, `expired`.

`QS-003` Un test de validation cible soit une espece soit une capacite de soin.

`QS-004` Un test de validation ne peut jamais cibler a la fois une espece et une capacite.

`QS-005` Un badge actif ne peut pas etre duplique pour le meme pet-sitter.

`QS-006` Un abonnement actif ou trial ne peut pas etre duplique pour le meme pet-sitter.

`QS-007` Un badge Pro peut etre attribue apres validation documentaire pertinente.

`QS-008` Un badge Verified Identity peut etre attribue apres validation d'identite.

`QS-009` Un badge Expert depend d'une competence validee par test.

## 6. Disponibilites

`AV-001` Une disponibilite appartient a un seul pet-sitter.

`AV-002` La date de fin d'une disponibilite est strictement apres sa date de debut.

`AV-003` Une disponibilite libre ne pointe pas vers une reservation.

`AV-004` Une disponibilite liee a une reservation doit avoir un statut de blocage.

`AV-005` Une reservation acceptee doit bloquer un creneau.

## 7. Reservation

`RS-001` Une reservation relie exactement un proprietaire et un pet-sitter.

`RS-002` Une reservation concerne au moins un animal.

`RS-003` Tous les animaux d'une reservation appartiennent au proprietaire de la reservation.

`RS-004` La date de fin d'une reservation est strictement apres sa date de debut.

`RS-005` Le statut initial d'une reservation est `awaiting_response`.

`RS-006` Seul le pet-sitter concerne peut accepter ou refuser une reservation.

`RS-007` Une reservation refusee peut garder un motif de refus.

`RS-008` Une reservation acceptee passe ensuite en attente de paiement apres blocage du creneau.

`RS-009` Une reservation ne peut pas etre payee si elle n'est pas en attente de paiement.

`RS-010` Une reservation payee peut passer a terminee apres prestation.

`RS-011` Une reservation peut passer a incident signale si un probleme est declare.

`RS-012` Une reservation annulee garde un motif si disponible.

`RS-013` Le taux de commission applique est stocke sur la reservation.

`RS-014` Le montant reel de commission appartient au paiement.

## 8. Paiement

`PY-001` Le paiement est distinct de la reservation.

`PY-002` Une reservation MVP a au plus un paiement principal.

`PY-003` Les statuts de paiement ne remplacent pas les statuts de reservation.

`PY-004` Le montant total est superieur ou egal a la commission plateforme.

`PY-005` Le montant prestataire vaut montant total moins commission plateforme.

`PY-006` La commission MVP est de 15 %.

`PY-007` Stripe Connect est prepare mais le paiement MVP peut etre simule en mode test.

## 9. Contrat

`CT-001` Le contrat recapitulatif est genere a partir d'une reservation.

`CT-002` Une reservation MVP a au plus un contrat principal.

`CT-003` Le contrat contient parties, animaux, dates, lieu, format, tarif, commission, assurance, consignes et clauses standard.

`CT-004` Le contrat est stocke dans un bucket prive.

## 10. Avis

`RV-001` Un avis depend d'une reservation.

`RV-002` Un avis ne depend pas directement du paiement.

`RV-003` Le proprietaire et le pet-sitter d'un avis sont deduits de la reservation.

`RV-004` Un avis est unique par reservation.

`RV-005` Un avis ne peut etre cree qu'apres reservation terminee.

`RV-006` Le pet-sitter concerne peut repondre a l'avis.

`RV-007` La date de reponse ne peut pas etre anterieure a la date d'avis.

## 11. Signalement

`RP-001` Un signalement a un createur.

`RP-002` Un signalement ouvre un ticket tracable.

`RP-003` Un signalement peut etre general.

`RP-004` Un signalement peut cibler au plus une reservation, un profil pet-sitter ou un avis.

`RP-005` La date de resolution ne peut pas etre anterieure a la date de signalement.

## 12. Donnees publiques et privees

`SEC-001` Les profils publics n'exposent jamais email, telephone brut, adresse complete ou documents.

`SEC-002` Les coordonnees exactes ne sont pas exposees publiquement.

`SEC-003` Les documents professionnels ne sont jamais publics.

`SEC-004` Les donnees medicales ne sont jamais publiques.

`SEC-005` Les actions admin sensibles sont tracees.

