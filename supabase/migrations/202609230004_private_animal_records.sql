-- Medical records stay private to the owner. RLS was enabled in the initial
-- schema but had no policies, so legitimate owner access was denied as well.
create policy "owners can manage own animal medical records"
on public.dossier_medical for all
using (exists (
  select 1 from public.animal a
  join public.profil_proprietaire pp
    on pp.id_profil_proprietaire = a.id_profil_proprietaire
  where a.id_animal = dossier_medical.id_animal
    and pp.id_compte = auth.uid()
))
with check (exists (
  select 1 from public.animal a
  join public.profil_proprietaire pp
    on pp.id_profil_proprietaire = a.id_profil_proprietaire
  where a.id_animal = dossier_medical.id_animal
    and pp.id_compte = auth.uid()
));

create policy "owners can manage own animal document metadata"
on public.document_animal for all
using (exists (
  select 1 from public.dossier_medical dm
  join public.animal a on a.id_animal = dm.id_animal
  join public.profil_proprietaire pp
    on pp.id_profil_proprietaire = a.id_profil_proprietaire
  where dm.id_dossier_medical = document_animal.id_dossier_medical
    and pp.id_compte = auth.uid()
))
with check (exists (
  select 1 from public.dossier_medical dm
  join public.animal a on a.id_animal = dm.id_animal
  join public.profil_proprietaire pp
    on pp.id_profil_proprietaire = a.id_profil_proprietaire
  where dm.id_dossier_medical = document_animal.id_dossier_medical
    and pp.id_compte = auth.uid()
));

notify pgrst, 'reload schema';
