# MamiPet - MCD conceptuel Merise

Ce MCD est volontairement conceptuel :

- les entites portent les informations metier utiles ;
- les associations sont nommees avec des verbes ;
- les details techniques PostgreSQL, Supabase Storage et Stripe sont reserves au MPD ;
- les redondances evitables sont supprimees, notamment autour des avis.

```mermaid
flowchart LR
    classDef ent fill:#f8fbff,stroke:#4f81bd,stroke-width:1.4px,color:#111;
    classDef ref fill:#f4fff7,stroke:#4f9d69,stroke-width:1.3px,color:#111;
    classDef qual fill:#fffdf2,stroke:#c99700,stroke-width:1.3px,color:#111;
    classDef tx fill:#fff8f3,stroke:#d07a46,stroke-width:1.3px,color:#111;
    classDef assoc fill:#fff7e6,stroke:#d98c00,stroke-width:1.2px,color:#111;
    classDef note fill:#fdf6ff,stroke:#a066cc,stroke-width:1.1px,stroke-dasharray: 4 4,color:#111;

    subgraph P1["1. Identite et profils"]
        CU["COMPTE_UTILISATEUR<br/>_id_compte_<br/>email<br/>statut_compte<br/>est_administrateur<br/>date_creation"]:::ent
        PP["PROFIL_PROPRIETAIRE<br/>_id_profil_proprietaire_<br/>pseudo<br/>prenom<br/>telephone<br/>ville<br/>pays<br/>localisation<br/>date_creation"]:::ent
        PS["PROFIL_PET_SITTER<br/>_id_profil_pet_sitter_<br/>pseudo<br/>prenom<br/>telephone<br/>photo<br/>description<br/>ville<br/>pays<br/>localisation<br/>tarif_base<br/>rayon_intervention<br/>statut_verification<br/>visibilite_publique<br/>date_creation"]:::ent
    end

    subgraph P2["2. Referentiels et animaux"]
        ES["ESPECE<br/>_id_espece_<br/>code_espece<br/>libelle_espece"]:::ref
        CS["CAPACITE_SOIN<br/>_id_capacite_soin_<br/>code_capacite_soin<br/>libelle_capacite_soin"]:::ref
        LG["LIEU_GARDE<br/>_id_lieu_garde_<br/>code_lieu_garde<br/>libelle_lieu_garde"]:::ref
        FG["FORMAT_GARDE<br/>_id_format_garde_<br/>code_format_garde<br/>libelle_format_garde"]:::ref
        SA["SERVICE_ADDITIONNEL<br/>_id_service_additionnel_<br/>code_service_additionnel<br/>libelle_service_additionnel"]:::ref
        AN["ANIMAL<br/>_id_animal_<br/>nom<br/>sexe<br/>date_naissance<br/>couleur<br/>poids<br/>temperament<br/>besoins_specifiques<br/>date_creation"]:::ref
        DM["DOSSIER_MEDICAL<br/>_id_dossier_medical_<br/>protocole_soin<br/>frequence<br/>consignes_confidentielles<br/>date_creation"]:::ref
        DA["DOCUMENT_ANIMAL<br/>_id_document_animal_<br/>type_document<br/>date_depot"]:::ref
    end

    subgraph P3["3. Qualification pet-sitter"]
        DI["DISPONIBILITE<br/>_id_disponibilite_<br/>date_debut<br/>date_fin<br/>statut_disponibilite<br/>commentaire"]:::qual
        DP["DOCUMENT_PROFESSIONNEL<br/>_id_document_professionnel_<br/>type_document<br/>statut_document<br/>date_soumission<br/>date_validation<br/>commentaire_admin"]:::qual
        TV["TEST_VALIDATION<br/>_id_test_validation_<br/>statut_test<br/>score<br/>date_passage<br/>date_validation<br/>date_expiration<br/>commentaire_admin"]:::qual
        BP["BADGE_PUBLIC<br/>_id_badge_public_<br/>code_badge<br/>libelle_badge"]:::qual
        AB["ABONNEMENT_PET_SITTER<br/>_id_abonnement_pet_sitter_<br/>formule_abonnement<br/>statut_abonnement<br/>date_debut<br/>date_fin<br/>montant_abonnement<br/>assurance_premium_incluse"]:::qual
    end

    subgraph P4["4. Reservation, paiement et confiance"]
        RE["RESERVATION<br/>_id_reservation_<br/>date_demande<br/>date_debut<br/>date_fin<br/>statut_reservation<br/>niveau_assurance<br/>tarif_convenu<br/>taux_commission<br/>consignes<br/>motif_refus<br/>motif_annulation<br/>date_reponse"]:::tx
        PA["PAIEMENT<br/>_id_paiement_<br/>statut_paiement<br/>montant_total<br/>commission_plateforme<br/>montant_prestataire<br/>date_paiement<br/>date_expiration<br/>date_remboursement"]:::tx
        CR["CONTRAT_RECAPITULATIF<br/>_id_contrat_recapitulatif_<br/>date_generation<br/>niveau_assurance<br/>clauses_standard"]:::tx
        AV["AVIS<br/>_id_avis_<br/>note_globale<br/>commentaire<br/>note_ponctualite<br/>note_communication<br/>note_soins<br/>note_confiance<br/>reponse_pet_sitter<br/>date_avis"]:::tx
        SI["SIGNALEMENT<br/>_id_signalement_<br/>categorie_signalement<br/>motif<br/>statut_ticket<br/>commentaire_resolution<br/>date_signalement<br/>date_resolution"]:::tx
    end

    ACT_PP("Activer"):::assoc
    ACT_PS("Activer"):::assoc
    POS_AN("Posseder"):::assoc
    APP_ES("Appartenir"):::assoc
    DIS_DM("Disposer"):::assoc
    JOI_DA("Joindre"):::assoc

    ACC_ES("Accepter"):::assoc
    MAI_CS("Maitriser"):::assoc
    PRO_LG("Proposer"):::assoc
    PRO_FG("Proposer"):::assoc
    PRO_SA("Proposer"):::assoc
    DEC_DI("Declarer"):::assoc
    BLO_DI("Bloquer"):::assoc
    DEP_DP("Deposer"):::assoc
    PAS_TV("Passer"):::assoc
    CIB_ES("Cibler espece"):::assoc
    CIB_CS("Cibler capacite"):::assoc
    OBT_BP("Obtenir<br/>origine_badge<br/>actif<br/>date_obtention<br/>date_retrait"):::assoc
    SOU_AB("Souscrire"):::assoc

    EFF_RE("Effectuer"):::assoc
    REC_RE("Recevoir"):::assoc
    RET_LG("Retenir"):::assoc
    RET_FG("Retenir"):::assoc
    CON_AN("Concerner<br/>tarif_animal<br/>notes_animal"):::assoc
    INC_SA("Inclure<br/>prix_service"):::assoc
    GEN_PA("Generer"):::assoc
    GEN_CR("Generer"):::assoc
    DON_AV("Donner lieu"):::assoc
    CRE_SI("Creer"):::assoc
    CON_RE("Concerner reservation"):::assoc
    CON_PS("Concerner profil"):::assoc
    CON_AV("Concerner avis"):::assoc

    CU ---|"0,1"| ACT_PP
    ACT_PP ---|"1,1"| PP
    CU ---|"0,1"| ACT_PS
    ACT_PS ---|"1,1"| PS

    PP ---|"0,n"| POS_AN
    POS_AN ---|"1,1"| AN
    AN ---|"1,1"| APP_ES
    APP_ES ---|"0,n"| ES
    AN ---|"0,1"| DIS_DM
    DIS_DM ---|"1,1"| DM
    DM ---|"0,n"| JOI_DA
    JOI_DA ---|"1,1"| DA

    PS ---|"0,n"| ACC_ES
    ACC_ES ---|"0,n"| ES
    PS ---|"0,n"| MAI_CS
    MAI_CS ---|"0,n"| CS
    PS ---|"0,n"| PRO_LG
    PRO_LG ---|"0,n"| LG
    PS ---|"0,n"| PRO_FG
    PRO_FG ---|"0,n"| FG
    PS ---|"0,n"| PRO_SA
    PRO_SA ---|"0,n"| SA
    PS ---|"0,n"| DEC_DI
    DEC_DI ---|"1,1"| DI
    RE ---|"0,1"| BLO_DI
    BLO_DI ---|"0,1"| DI
    PS ---|"0,n"| DEP_DP
    DEP_DP ---|"1,1"| DP
    PS ---|"0,n"| PAS_TV
    PAS_TV ---|"1,1"| TV
    TV ---|"0,1"| CIB_ES
    CIB_ES ---|"0,n"| ES
    TV ---|"0,1"| CIB_CS
    CIB_CS ---|"0,n"| CS
    PS ---|"0,n"| OBT_BP
    OBT_BP ---|"0,n"| BP
    PS ---|"0,n"| SOU_AB
    SOU_AB ---|"1,1"| AB

    PP ---|"0,n"| EFF_RE
    EFF_RE ---|"1,1"| RE
    PS ---|"0,n"| REC_RE
    REC_RE ---|"1,1"| RE
    RE ---|"1,1"| RET_LG
    RET_LG ---|"0,n"| LG
    RE ---|"1,1"| RET_FG
    RET_FG ---|"0,n"| FG
    RE ---|"1,n"| CON_AN
    CON_AN ---|"0,n"| AN
    RE ---|"0,n"| INC_SA
    INC_SA ---|"0,n"| SA
    RE ---|"0,1"| GEN_PA
    GEN_PA ---|"1,1"| PA
    RE ---|"0,1"| GEN_CR
    GEN_CR ---|"1,1"| CR
    RE ---|"0,1"| DON_AV
    DON_AV ---|"1,1"| AV
    CU ---|"0,n"| CRE_SI
    CRE_SI ---|"1,1"| SI
    SI ---|"0,1"| CON_RE
    CON_RE ---|"0,n"| RE
    SI ---|"0,1"| CON_PS
    CON_PS ---|"0,n"| PS
    SI ---|"0,1"| CON_AV
    CON_AV ---|"0,n"| AV

    NOTE_AUTH["Authentification geree par Supabase Auth.<br/>Le MCD ne stocke pas de mot de passe."]:::note
    NOTE_XOR["Un TEST_VALIDATION cible soit une ESPECE,<br/>soit une CAPACITE_SOIN, jamais les deux."]:::note
    NOTE_AVIS["Un avis depend d'une reservation terminee.<br/>Le proprietaire et le pet-sitter sont deduits de la reservation."]:::note
    NOTE_HORS_MVP["Demandes publiques, messagerie et notifications<br/>sont prevues hors MVP critique."]:::note

    NOTE_AUTH -.-> CU
    NOTE_XOR -.-> TV
    NOTE_AVIS -.-> AV
    NOTE_HORS_MVP -.-> SI
```

## Decisions conceptuelles

1. `COMPTE_UTILISATEUR` represente le compte applicatif ; l'authentification est portee par Supabase Auth au niveau physique.
2. `PROFIL_PROPRIETAIRE` et `PROFIL_PET_SITTER` restent separes pour ne pas melanger l'identite du compte et les donnees metier.
3. `AVIS` depend uniquement de `RESERVATION` : le proprietaire auteur et le pet-sitter evalue sont deduits de la reservation.
4. `DISPONIBILITE` reste un creneau declare par un pet-sitter ; une reservation acceptee peut bloquer un creneau.
5. `SIGNALEMENT` peut viser une reservation, un profil pet-sitter ou un avis, sans imposer la messagerie complete dans le MVP.
