alter table public.profil_pet_sitter_espece enable row level security;
alter table public.profil_pet_sitter_capacite_soin enable row level security;
alter table public.profil_pet_sitter_lieu_garde enable row level security;
alter table public.profil_pet_sitter_format_garde enable row level security;
alter table public.profil_pet_sitter_service_additionnel enable row level security;

create policy "visible pet sitter profiles are public" on public.profil_pet_sitter
  for select using (
    visibilite_publique = true
    and statut_verification not in ('suspended', 'rejected')
  );

create policy "pet sitters can manage own species offer" on public.profil_pet_sitter_espece
  for all using (
    exists (
      select 1 from public.profil_pet_sitter ps
      where ps.id_profil_pet_sitter = profil_pet_sitter_espece.id_profil_pet_sitter
      and ps.id_compte = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.profil_pet_sitter ps
      where ps.id_profil_pet_sitter = profil_pet_sitter_espece.id_profil_pet_sitter
      and ps.id_compte = auth.uid()
    )
  );

create policy "visible species offers are public" on public.profil_pet_sitter_espece
  for select using (
    exists (
      select 1 from public.profil_pet_sitter ps
      where ps.id_profil_pet_sitter = profil_pet_sitter_espece.id_profil_pet_sitter
      and ps.visibilite_publique = true
      and ps.statut_verification not in ('suspended', 'rejected')
    )
  );

create policy "pet sitters can manage own care capability offer" on public.profil_pet_sitter_capacite_soin
  for all using (
    exists (
      select 1 from public.profil_pet_sitter ps
      where ps.id_profil_pet_sitter = profil_pet_sitter_capacite_soin.id_profil_pet_sitter
      and ps.id_compte = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.profil_pet_sitter ps
      where ps.id_profil_pet_sitter = profil_pet_sitter_capacite_soin.id_profil_pet_sitter
      and ps.id_compte = auth.uid()
    )
  );

create policy "visible care capability offers are public" on public.profil_pet_sitter_capacite_soin
  for select using (
    exists (
      select 1 from public.profil_pet_sitter ps
      where ps.id_profil_pet_sitter = profil_pet_sitter_capacite_soin.id_profil_pet_sitter
      and ps.visibilite_publique = true
      and ps.statut_verification not in ('suspended', 'rejected')
    )
  );

create policy "pet sitters can manage own care location offer" on public.profil_pet_sitter_lieu_garde
  for all using (
    exists (
      select 1 from public.profil_pet_sitter ps
      where ps.id_profil_pet_sitter = profil_pet_sitter_lieu_garde.id_profil_pet_sitter
      and ps.id_compte = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.profil_pet_sitter ps
      where ps.id_profil_pet_sitter = profil_pet_sitter_lieu_garde.id_profil_pet_sitter
      and ps.id_compte = auth.uid()
    )
  );

create policy "visible care location offers are public" on public.profil_pet_sitter_lieu_garde
  for select using (
    exists (
      select 1 from public.profil_pet_sitter ps
      where ps.id_profil_pet_sitter = profil_pet_sitter_lieu_garde.id_profil_pet_sitter
      and ps.visibilite_publique = true
      and ps.statut_verification not in ('suspended', 'rejected')
    )
  );

create policy "pet sitters can manage own care format offer" on public.profil_pet_sitter_format_garde
  for all using (
    exists (
      select 1 from public.profil_pet_sitter ps
      where ps.id_profil_pet_sitter = profil_pet_sitter_format_garde.id_profil_pet_sitter
      and ps.id_compte = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.profil_pet_sitter ps
      where ps.id_profil_pet_sitter = profil_pet_sitter_format_garde.id_profil_pet_sitter
      and ps.id_compte = auth.uid()
    )
  );

create policy "visible care format offers are public" on public.profil_pet_sitter_format_garde
  for select using (
    exists (
      select 1 from public.profil_pet_sitter ps
      where ps.id_profil_pet_sitter = profil_pet_sitter_format_garde.id_profil_pet_sitter
      and ps.visibilite_publique = true
      and ps.statut_verification not in ('suspended', 'rejected')
    )
  );

create policy "pet sitters can manage own additional service offer" on public.profil_pet_sitter_service_additionnel
  for all using (
    exists (
      select 1 from public.profil_pet_sitter ps
      where ps.id_profil_pet_sitter = profil_pet_sitter_service_additionnel.id_profil_pet_sitter
      and ps.id_compte = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.profil_pet_sitter ps
      where ps.id_profil_pet_sitter = profil_pet_sitter_service_additionnel.id_profil_pet_sitter
      and ps.id_compte = auth.uid()
    )
  );

create policy "visible additional service offers are public" on public.profil_pet_sitter_service_additionnel
  for select using (
    exists (
      select 1 from public.profil_pet_sitter ps
      where ps.id_profil_pet_sitter = profil_pet_sitter_service_additionnel.id_profil_pet_sitter
      and ps.visibilite_publique = true
      and ps.statut_verification not in ('suspended', 'rejected')
    )
  );

grant select on public.profil_pet_sitter to anon, authenticated;
grant select on public.profil_pet_sitter_espece to anon, authenticated;
grant select on public.profil_pet_sitter_capacite_soin to anon, authenticated;
grant select on public.profil_pet_sitter_lieu_garde to anon, authenticated;
grant select on public.profil_pet_sitter_format_garde to anon, authenticated;
grant select on public.profil_pet_sitter_service_additionnel to anon, authenticated;

grant select, insert, delete on public.profil_pet_sitter_espece to authenticated;
grant select, insert, delete on public.profil_pet_sitter_capacite_soin to authenticated;
grant select, insert, delete on public.profil_pet_sitter_lieu_garde to authenticated;
grant select, insert, delete on public.profil_pet_sitter_format_garde to authenticated;
grant select, insert, delete on public.profil_pet_sitter_service_additionnel to authenticated;

notify pgrst, 'reload schema';
