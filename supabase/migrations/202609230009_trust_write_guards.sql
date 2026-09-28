-- Direct PostgREST writes must obey the same trust rules as Route Handlers.
drop policy if exists "pet sitters can create own professional documents" on public.document_professionnel;
create policy "pet sitters can create own professional documents" on public.document_professionnel
  for insert to authenticated with check (
    statut_document = 'submitted'
    and date_validation is null
    and commentaire_admin is null
    and exists (
      select 1 from public.profil_pet_sitter ps
      where ps.id_profil_pet_sitter = document_professionnel.id_profil_pet_sitter
        and ps.id_compte = (select auth.uid())
    )
  );

drop policy if exists "owners can create review after completed reservation" on public.avis;
create policy "owners can create review after completed reservation" on public.avis
  for insert to authenticated with check (
    reponse_pet_sitter is null and date_reponse_pet_sitter is null
    and exists (
      select 1 from public.reservation r
      join public.profil_proprietaire pp
        on pp.id_profil_proprietaire = r.id_profil_proprietaire
      where r.id_reservation = avis.id_reservation
        and r.statut_reservation = 'completed'
        and pp.id_compte = (select auth.uid())
    )
  );

-- The sitter may answer a review, but cannot alter its score or reservation.
revoke update on public.avis from authenticated;
grant update(reponse_pet_sitter, date_reponse_pet_sitter) on public.avis to authenticated;

drop policy if exists "accounts can create reports" on public.signalement;
create policy "accounts can create reports" on public.signalement
  for insert to authenticated with check (
    id_compte_createur = (select auth.uid())
    and statut_ticket = 'open'
    and commentaire_resolution is null
    and date_resolution is null
  );

notify pgrst, 'reload schema';
