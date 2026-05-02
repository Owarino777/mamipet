create or replace function public.is_current_account_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.compte_utilisateur
    where id_compte = auth.uid()
    and est_administrateur = true
    and statut_compte = 'active'
  );
$$;

create policy "admins can read accounts" on public.compte_utilisateur
  for select using (public.is_current_account_admin());

create policy "admins can manage owner profiles" on public.profil_proprietaire
  for all using (public.is_current_account_admin())
  with check (public.is_current_account_admin());

create policy "admins can manage pet sitter profiles" on public.profil_pet_sitter
  for all using (public.is_current_account_admin())
  with check (public.is_current_account_admin());

create policy "owners can create review after completed reservation" on public.avis
  for insert with check (
    exists (
      select 1 from public.reservation r
      join public.profil_proprietaire pp
        on pp.id_profil_proprietaire = r.id_profil_proprietaire
      where r.id_reservation = avis.id_reservation
      and r.statut_reservation = 'completed'
      and pp.id_compte = auth.uid()
    )
  );

create policy "reservation parties can read reviews" on public.avis
  for select using (
    exists (
      select 1 from public.reservation r
      left join public.profil_proprietaire pp
        on pp.id_profil_proprietaire = r.id_profil_proprietaire
      left join public.profil_pet_sitter ps
        on ps.id_profil_pet_sitter = r.id_profil_pet_sitter
      where r.id_reservation = avis.id_reservation
      and (pp.id_compte = auth.uid() or ps.id_compte = auth.uid())
    )
    or public.is_current_account_admin()
  );

create policy "pet sitters can reply to own reviews" on public.avis
  for update using (
    exists (
      select 1 from public.reservation r
      join public.profil_pet_sitter ps
        on ps.id_profil_pet_sitter = r.id_profil_pet_sitter
      where r.id_reservation = avis.id_reservation
      and ps.id_compte = auth.uid()
    )
    or public.is_current_account_admin()
  )
  with check (
    exists (
      select 1 from public.reservation r
      join public.profil_pet_sitter ps
        on ps.id_profil_pet_sitter = r.id_profil_pet_sitter
      where r.id_reservation = avis.id_reservation
      and ps.id_compte = auth.uid()
    )
    or public.is_current_account_admin()
  );

create policy "admins can manage reviews" on public.avis
  for all using (public.is_current_account_admin())
  with check (public.is_current_account_admin());

create policy "accounts can create reports" on public.signalement
  for insert with check (id_compte_createur = auth.uid());

create policy "accounts can read own reports" on public.signalement
  for select using (id_compte_createur = auth.uid() or public.is_current_account_admin());

create policy "admins can manage reports" on public.signalement
  for all using (public.is_current_account_admin())
  with check (public.is_current_account_admin());

create policy "admins can manage professional documents" on public.document_professionnel
  for all using (public.is_current_account_admin())
  with check (public.is_current_account_admin());

create policy "pet sitters can read own professional documents" on public.document_professionnel
  for select using (
    exists (
      select 1 from public.profil_pet_sitter ps
      where ps.id_profil_pet_sitter = document_professionnel.id_profil_pet_sitter
      and ps.id_compte = auth.uid()
    )
  );

create policy "pet sitters can create own professional documents" on public.document_professionnel
  for insert with check (
    exists (
      select 1 from public.profil_pet_sitter ps
      where ps.id_profil_pet_sitter = document_professionnel.id_profil_pet_sitter
      and ps.id_compte = auth.uid()
    )
  );

create policy "admins can manage badges" on public.profil_pet_sitter_badge_public
  for all using (public.is_current_account_admin())
  with check (public.is_current_account_admin());

create policy "admins can manage reservations" on public.reservation
  for all using (public.is_current_account_admin())
  with check (public.is_current_account_admin());

create policy "admins can read payments" on public.paiement
  for select using (public.is_current_account_admin());

grant execute on function public.is_current_account_admin() to anon, authenticated;
grant select, insert, update on public.avis to authenticated;
grant select, insert, update on public.signalement to authenticated;
grant select, insert, update on public.document_professionnel to authenticated;
grant select, insert, update on public.profil_pet_sitter_badge_public to authenticated;

notify pgrst, 'reload schema';
