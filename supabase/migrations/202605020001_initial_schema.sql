create extension if not exists pgcrypto;

create table public.compte_utilisateur (
  id_compte uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  statut_compte text not null default 'active' check (statut_compte in ('active', 'suspended', 'deleted')),
  est_administrateur boolean not null default false,
  date_creation timestamptz not null default now()
);

create table public.profil_proprietaire (
  id_profil_proprietaire uuid primary key default gen_random_uuid(),
  id_compte uuid not null unique references public.compte_utilisateur(id_compte) on delete cascade,
  pseudo text,
  prenom text not null,
  telephone text,
  adresse_ligne1 text,
  adresse_ligne2 text,
  code_postal text,
  ville text not null,
  pays text not null default 'France',
  latitude numeric(9,6),
  longitude numeric(9,6),
  date_creation timestamptz not null default now()
);

create table public.profil_pet_sitter (
  id_profil_pet_sitter uuid primary key default gen_random_uuid(),
  id_compte uuid not null unique references public.compte_utilisateur(id_compte) on delete cascade,
  pseudo text,
  prenom text not null,
  telephone text,
  photo_url text,
  description text,
  adresse_ligne1 text,
  adresse_ligne2 text,
  code_postal text,
  ville text not null,
  pays text not null default 'France',
  latitude numeric(9,6),
  longitude numeric(9,6),
  tarif_base numeric(10,2) not null check (tarif_base >= 0),
  rayon_km integer not null check (rayon_km >= 0),
  statut_verification text not null default 'draft' check (
    statut_verification in (
      'draft',
      'published_unverified',
      'identity_verified',
      'professional_verified',
      'suspended',
      'rejected'
    )
  ),
  visibilite_publique boolean not null default false,
  date_creation timestamptz not null default now()
);

create table public.espece (
  id_espece uuid primary key default gen_random_uuid(),
  code_espece text not null unique,
  libelle_espece text not null unique
);

create table public.capacite_soin (
  id_capacite_soin uuid primary key default gen_random_uuid(),
  code_capacite_soin text not null unique,
  libelle_capacite_soin text not null unique
);

create table public.lieu_garde (
  id_lieu_garde uuid primary key default gen_random_uuid(),
  code_lieu_garde text not null unique,
  libelle_lieu_garde text not null unique
);

create table public.format_garde (
  id_format_garde uuid primary key default gen_random_uuid(),
  code_format_garde text not null unique,
  libelle_format_garde text not null unique
);

create table public.service_additionnel (
  id_service_additionnel uuid primary key default gen_random_uuid(),
  code_service_additionnel text not null unique,
  libelle_service_additionnel text not null unique
);

create table public.badge_public (
  id_badge_public uuid primary key default gen_random_uuid(),
  code_badge_public text not null unique,
  libelle_badge_public text not null unique
);

create table public.animal (
  id_animal uuid primary key default gen_random_uuid(),
  id_profil_proprietaire uuid not null references public.profil_proprietaire(id_profil_proprietaire) on delete cascade,
  id_espece uuid not null references public.espece(id_espece),
  nom text not null,
  sexe text,
  date_naissance date,
  couleur text,
  poids_kg numeric(5,2) check (poids_kg is null or poids_kg >= 0),
  temperament text,
  besoins_specifiques text,
  date_creation timestamptz not null default now(),
  constraint uq_animal_proprietaire unique (id_animal, id_profil_proprietaire)
);

create table public.dossier_medical (
  id_dossier_medical uuid primary key default gen_random_uuid(),
  id_animal uuid not null unique references public.animal(id_animal) on delete cascade,
  protocole_soin text,
  frequence text,
  consignes_confidentielles text,
  date_creation timestamptz not null default now()
);

create table public.document_animal (
  id_document_animal uuid primary key default gen_random_uuid(),
  id_dossier_medical uuid not null references public.dossier_medical(id_dossier_medical) on delete cascade,
  type_document text not null,
  nom_fichier text,
  chemin_fichier text,
  date_depot timestamptz not null default now()
);

create table public.profil_pet_sitter_espece (
  id_profil_pet_sitter uuid not null references public.profil_pet_sitter(id_profil_pet_sitter) on delete cascade,
  id_espece uuid not null references public.espece(id_espece) on delete restrict,
  primary key (id_profil_pet_sitter, id_espece)
);

create table public.profil_pet_sitter_capacite_soin (
  id_profil_pet_sitter uuid not null references public.profil_pet_sitter(id_profil_pet_sitter) on delete cascade,
  id_capacite_soin uuid not null references public.capacite_soin(id_capacite_soin) on delete restrict,
  primary key (id_profil_pet_sitter, id_capacite_soin)
);

create table public.profil_pet_sitter_lieu_garde (
  id_profil_pet_sitter uuid not null references public.profil_pet_sitter(id_profil_pet_sitter) on delete cascade,
  id_lieu_garde uuid not null references public.lieu_garde(id_lieu_garde) on delete restrict,
  primary key (id_profil_pet_sitter, id_lieu_garde)
);

create table public.profil_pet_sitter_format_garde (
  id_profil_pet_sitter uuid not null references public.profil_pet_sitter(id_profil_pet_sitter) on delete cascade,
  id_format_garde uuid not null references public.format_garde(id_format_garde) on delete restrict,
  primary key (id_profil_pet_sitter, id_format_garde)
);

create table public.profil_pet_sitter_service_additionnel (
  id_profil_pet_sitter uuid not null references public.profil_pet_sitter(id_profil_pet_sitter) on delete cascade,
  id_service_additionnel uuid not null references public.service_additionnel(id_service_additionnel) on delete restrict,
  primary key (id_profil_pet_sitter, id_service_additionnel)
);

create table public.document_professionnel (
  id_document_professionnel uuid primary key default gen_random_uuid(),
  id_profil_pet_sitter uuid not null references public.profil_pet_sitter(id_profil_pet_sitter) on delete cascade,
  type_document_professionnel text not null,
  statut_document text not null default 'submitted' check (statut_document in ('submitted', 'validated', 'rejected', 'expired')),
  nom_fichier text,
  chemin_fichier text,
  date_soumission timestamptz not null default now(),
  date_validation timestamptz,
  commentaire_admin text
);

create table public.test_validation (
  id_test_validation uuid primary key default gen_random_uuid(),
  id_profil_pet_sitter uuid not null references public.profil_pet_sitter(id_profil_pet_sitter) on delete cascade,
  id_espece uuid references public.espece(id_espece),
  id_capacite_soin uuid references public.capacite_soin(id_capacite_soin),
  type_perimetre text not null check (type_perimetre in ('species', 'care_capability')),
  statut_test text not null default 'to_take' check (statut_test in ('to_take', 'passed', 'failed', 'expired')),
  score numeric(5,2) check (score is null or (score >= 0 and score <= 100)),
  date_passage timestamptz,
  date_validation timestamptz,
  date_expiration timestamptz,
  commentaire_admin text,
  constraint ck_test_validation_target_xor check (
    (type_perimetre = 'species' and id_espece is not null and id_capacite_soin is null)
    or
    (type_perimetre = 'care_capability' and id_espece is null and id_capacite_soin is not null)
  )
);

create table public.profil_pet_sitter_badge_public (
  id_profil_pet_sitter_badge_public uuid primary key default gen_random_uuid(),
  id_profil_pet_sitter uuid not null references public.profil_pet_sitter(id_profil_pet_sitter) on delete cascade,
  id_badge_public uuid not null references public.badge_public(id_badge_public) on delete restrict,
  origine_badge text not null,
  actif boolean not null default true,
  date_obtention timestamptz not null default now(),
  date_retrait timestamptz
);

create unique index uq_active_pet_sitter_badge
  on public.profil_pet_sitter_badge_public (id_profil_pet_sitter, id_badge_public)
  where actif;

create table public.abonnement_pet_sitter (
  id_abonnement_pet_sitter uuid primary key default gen_random_uuid(),
  id_profil_pet_sitter uuid not null references public.profil_pet_sitter(id_profil_pet_sitter) on delete cascade,
  formule_abonnement text not null,
  statut_abonnement text not null check (statut_abonnement in ('trial', 'active', 'cancelled', 'expired')),
  date_debut_abonnement timestamptz not null,
  date_fin_abonnement timestamptz not null,
  assurance_premium_incluse boolean not null default false,
  montant_abonnement numeric(10,2) check (montant_abonnement is null or montant_abonnement >= 0),
  reference_paiement_externe text,
  constraint ck_subscription_dates check (date_fin_abonnement > date_debut_abonnement)
);

create unique index uq_active_pet_sitter_subscription
  on public.abonnement_pet_sitter (id_profil_pet_sitter)
  where statut_abonnement in ('trial', 'active');

create table public.reservation (
  id_reservation uuid primary key default gen_random_uuid(),
  id_profil_proprietaire uuid not null references public.profil_proprietaire(id_profil_proprietaire) on delete restrict,
  id_profil_pet_sitter uuid not null references public.profil_pet_sitter(id_profil_pet_sitter) on delete restrict,
  id_lieu_garde uuid not null references public.lieu_garde(id_lieu_garde),
  id_format_garde uuid not null references public.format_garde(id_format_garde),
  date_demande timestamptz not null default now(),
  date_debut_reservation timestamptz not null,
  date_fin_reservation timestamptz not null,
  statut_reservation text not null default 'awaiting_response' check (
    statut_reservation in (
      'awaiting_response',
      'accepted',
      'refused',
      'awaiting_payment',
      'paid',
      'cancelled',
      'completed',
      'incident_reported'
    )
  ),
  niveau_assurance_applique text not null check (niveau_assurance_applique in ('standard', 'premium')),
  tarif_convenu numeric(10,2) not null check (tarif_convenu >= 0),
  taux_commission_plateforme numeric(5,4) not null default 0.1500 check (taux_commission_plateforme >= 0 and taux_commission_plateforme <= 1),
  consignes_reservation text,
  motif_refus text,
  motif_annulation text,
  date_reponse timestamptz,
  constraint ck_reservation_dates check (date_fin_reservation > date_debut_reservation),
  constraint uq_reservation_proprietaire unique (id_reservation, id_profil_proprietaire)
);

create table public.disponibilite (
  id_disponibilite uuid primary key default gen_random_uuid(),
  id_profil_pet_sitter uuid not null references public.profil_pet_sitter(id_profil_pet_sitter) on delete cascade,
  id_reservation uuid unique references public.reservation(id_reservation) on delete set null,
  date_debut_disponibilite timestamptz not null,
  date_fin_disponibilite timestamptz not null,
  statut_disponibilite text not null check (statut_disponibilite in ('available', 'unavailable', 'blocked_reservation')),
  commentaire text,
  constraint ck_availability_dates check (date_fin_disponibilite > date_debut_disponibilite),
  constraint ck_blocked_availability_reservation check (
    (id_reservation is null and statut_disponibilite <> 'blocked_reservation')
    or
    (id_reservation is not null and statut_disponibilite = 'blocked_reservation')
  )
);

create table public.reservation_animal (
  id_reservation uuid not null,
  id_animal uuid not null,
  id_profil_proprietaire uuid not null,
  tarif_animal numeric(10,2) not null check (tarif_animal >= 0),
  notes_animal_reservation text,
  primary key (id_reservation, id_animal),
  foreign key (id_reservation, id_profil_proprietaire)
    references public.reservation(id_reservation, id_profil_proprietaire)
    on delete cascade,
  foreign key (id_animal, id_profil_proprietaire)
    references public.animal(id_animal, id_profil_proprietaire)
    on delete restrict
);

create table public.reservation_service_additionnel (
  id_reservation uuid not null references public.reservation(id_reservation) on delete cascade,
  id_service_additionnel uuid not null references public.service_additionnel(id_service_additionnel) on delete restrict,
  prix_service numeric(10,2) not null default 0 check (prix_service >= 0),
  primary key (id_reservation, id_service_additionnel)
);

create table public.paiement (
  id_paiement uuid primary key default gen_random_uuid(),
  id_reservation uuid not null unique references public.reservation(id_reservation) on delete restrict,
  statut_paiement text not null default 'pending' check (statut_paiement in ('pending', 'succeeded', 'failed', 'refunded', 'partially_refunded', 'expired')),
  montant_total numeric(10,2) not null check (montant_total >= 0),
  commission_plateforme numeric(10,2) not null check (commission_plateforme >= 0),
  montant_prestataire numeric(10,2) generated always as (montant_total - commission_plateforme) stored,
  stripe_payment_intent_id text unique,
  stripe_transfer_group text,
  date_paiement timestamptz,
  date_expiration timestamptz,
  date_remboursement timestamptz,
  constraint ck_payment_amounts check (montant_total >= commission_plateforme)
);

create table public.contrat_recapitulatif (
  id_contrat_recapitulatif uuid primary key default gen_random_uuid(),
  id_reservation uuid not null unique references public.reservation(id_reservation) on delete restrict,
  date_generation timestamptz not null default now(),
  niveau_assurance text not null check (niveau_assurance in ('standard', 'premium')),
  clauses_standard text not null,
  chemin_fichier text,
  hash_document text unique
);

create table public.avis (
  id_avis uuid primary key default gen_random_uuid(),
  id_reservation uuid not null unique references public.reservation(id_reservation) on delete restrict,
  note_globale smallint not null check (note_globale between 1 and 5),
  commentaire text,
  note_ponctualite smallint check (note_ponctualite is null or note_ponctualite between 1 and 5),
  note_communication smallint check (note_communication is null or note_communication between 1 and 5),
  note_soins smallint check (note_soins is null or note_soins between 1 and 5),
  note_confiance smallint check (note_confiance is null or note_confiance between 1 and 5),
  date_avis timestamptz not null default now(),
  reponse_pet_sitter text,
  date_reponse_pet_sitter timestamptz,
  constraint ck_review_reply_after_review check (
    date_reponse_pet_sitter is null or date_reponse_pet_sitter >= date_avis
  )
);

create table public.signalement (
  id_signalement uuid primary key default gen_random_uuid(),
  id_compte_createur uuid not null references public.compte_utilisateur(id_compte) on delete restrict,
  id_reservation uuid references public.reservation(id_reservation) on delete set null,
  id_profil_pet_sitter uuid references public.profil_pet_sitter(id_profil_pet_sitter) on delete set null,
  id_avis uuid references public.avis(id_avis) on delete set null,
  categorie_signalement text not null check (categorie_signalement in ('reservation', 'profile', 'review', 'incident', 'other')),
  motif text not null,
  statut_ticket text not null default 'open' check (statut_ticket in ('open', 'in_progress', 'processed', 'rejected', 'closed')),
  commentaire_resolution text,
  date_signalement timestamptz not null default now(),
  date_resolution timestamptz,
  constraint ck_report_single_target check (
    num_nonnulls(id_reservation, id_profil_pet_sitter, id_avis) <= 1
  ),
  constraint ck_report_resolution_date check (
    date_resolution is null or date_resolution >= date_signalement
  )
);

create index idx_pet_sitter_search on public.profil_pet_sitter (visibilite_publique, statut_verification, ville, tarif_base);
create index idx_reservation_owner on public.reservation (id_profil_proprietaire, statut_reservation);
create index idx_reservation_pet_sitter on public.reservation (id_profil_pet_sitter, statut_reservation);
create index idx_availability_pet_sitter_dates on public.disponibilite (id_profil_pet_sitter, date_debut_disponibilite, date_fin_disponibilite);

alter table public.compte_utilisateur enable row level security;
alter table public.profil_proprietaire enable row level security;
alter table public.profil_pet_sitter enable row level security;
alter table public.animal enable row level security;
alter table public.dossier_medical enable row level security;
alter table public.document_animal enable row level security;
alter table public.document_professionnel enable row level security;
alter table public.test_validation enable row level security;
alter table public.profil_pet_sitter_badge_public enable row level security;
alter table public.abonnement_pet_sitter enable row level security;
alter table public.disponibilite enable row level security;
alter table public.reservation enable row level security;
alter table public.reservation_animal enable row level security;
alter table public.reservation_service_additionnel enable row level security;
alter table public.paiement enable row level security;
alter table public.contrat_recapitulatif enable row level security;
alter table public.avis enable row level security;
alter table public.signalement enable row level security;

create policy "reference data is public" on public.espece for select using (true);
create policy "care capabilities are public" on public.capacite_soin for select using (true);
create policy "care locations are public" on public.lieu_garde for select using (true);
create policy "care formats are public" on public.format_garde for select using (true);
create policy "additional services are public" on public.service_additionnel for select using (true);
create policy "public badges are public" on public.badge_public for select using (true);

create policy "accounts can read themselves" on public.compte_utilisateur
  for select using (id_compte = auth.uid());

create policy "owners can manage own profile" on public.profil_proprietaire
  for all using (id_compte = auth.uid())
  with check (id_compte = auth.uid());

create policy "pet sitters can manage own profile" on public.profil_pet_sitter
  for all using (id_compte = auth.uid())
  with check (id_compte = auth.uid());

create policy "owners can manage own animals" on public.animal
  for all using (
    exists (
      select 1 from public.profil_proprietaire pp
      where pp.id_profil_proprietaire = animal.id_profil_proprietaire
      and pp.id_compte = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.profil_proprietaire pp
      where pp.id_profil_proprietaire = animal.id_profil_proprietaire
      and pp.id_compte = auth.uid()
    )
  );

create policy "owners can read own reservations" on public.reservation
  for select using (
    exists (
      select 1 from public.profil_proprietaire pp
      where pp.id_profil_proprietaire = reservation.id_profil_proprietaire
      and pp.id_compte = auth.uid()
    )
    or exists (
      select 1 from public.profil_pet_sitter ps
      where ps.id_profil_pet_sitter = reservation.id_profil_pet_sitter
      and ps.id_compte = auth.uid()
    )
  );

grant select on public.espece to anon, authenticated;
grant select on public.capacite_soin to anon, authenticated;
grant select on public.lieu_garde to anon, authenticated;
grant select on public.format_garde to anon, authenticated;
grant select on public.service_additionnel to anon, authenticated;
grant select on public.badge_public to anon, authenticated;

grant select, insert, update, delete on public.compte_utilisateur to authenticated;
grant select, insert, update, delete on public.profil_proprietaire to authenticated;
grant select, insert, update, delete on public.profil_pet_sitter to authenticated;
grant select, insert, update, delete on public.animal to authenticated;
grant select, insert, update, delete on public.dossier_medical to authenticated;
grant select, insert, update, delete on public.document_animal to authenticated;
grant select, insert, update, delete on public.reservation to authenticated;
grant select, insert, update, delete on public.reservation_animal to authenticated;

notify pgrst, 'reload schema';
