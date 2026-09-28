-- Account creation must work for verified identities without granting role/status writes.
revoke insert, update, delete on public.compte_utilisateur from anon, authenticated;
grant insert(id_compte, email) on public.compte_utilisateur to authenticated;
create policy "authenticated users initialize their account" on public.compte_utilisateur
  for insert to authenticated with check (
    id_compte = (select auth.uid())
    and email = (select auth.jwt()->>'email')
    and statut_compte = 'active'
    and est_administrateur = false
  );
