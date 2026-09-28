-- A public row policy on the base table exposes every column through PostgREST.
-- Keep full rows for the sitter/admin and expose only this explicit public view.
drop policy if exists "visible pet sitter profiles are public" on public.profil_pet_sitter;
revoke select on public.profil_pet_sitter from anon;

create view public.pet_sitter_public_profile
with (security_barrier = true) as
select
  ps.id_profil_pet_sitter,
  ps.pseudo,
  ps.prenom,
  ps.photo_url,
  ps.description,
  ps.ville,
  ps.pays,
  round(ps.latitude, 2) as latitude,
  round(ps.longitude, 2) as longitude,
  ps.tarif_base,
  ps.rayon_km,
  ps.statut_verification,
  ps.date_creation,
  coalesce(species.items, '[]'::jsonb) as profil_pet_sitter_espece,
  coalesce(species.ids, '{}'::uuid[]) as species_ids,
  coalesce(capabilities.items, '[]'::jsonb) as profil_pet_sitter_capacite_soin,
  coalesce(capabilities.ids, '{}'::uuid[]) as care_capability_ids,
  coalesce(locations.items, '[]'::jsonb) as profil_pet_sitter_lieu_garde,
  coalesce(locations.ids, '{}'::uuid[]) as care_location_ids,
  coalesce(formats.items, '[]'::jsonb) as profil_pet_sitter_format_garde,
  coalesce(formats.ids, '{}'::uuid[]) as care_format_ids,
  coalesce(services.items, '[]'::jsonb) as profil_pet_sitter_service_additionnel,
  coalesce(badges.items, '[]'::jsonb) as profil_pet_sitter_badge_public
from public.profil_pet_sitter ps
left join lateral (
  select jsonb_agg(jsonb_build_object('espece', jsonb_build_object(
    'id_espece', e.id_espece, 'code_espece', e.code_espece,
    'libelle_espece', e.libelle_espece))) as items,
    array_agg(e.id_espece) as ids
  from public.profil_pet_sitter_espece x
  join public.espece e on e.id_espece = x.id_espece
  where x.id_profil_pet_sitter = ps.id_profil_pet_sitter
) species on true
left join lateral (
  select jsonb_agg(jsonb_build_object('capacite_soin', jsonb_build_object(
    'id_capacite_soin', c.id_capacite_soin, 'code_capacite_soin', c.code_capacite_soin,
    'libelle_capacite_soin', c.libelle_capacite_soin))) as items,
    array_agg(c.id_capacite_soin) as ids
  from public.profil_pet_sitter_capacite_soin x
  join public.capacite_soin c on c.id_capacite_soin = x.id_capacite_soin
  where x.id_profil_pet_sitter = ps.id_profil_pet_sitter
) capabilities on true
left join lateral (
  select jsonb_agg(jsonb_build_object('lieu_garde', jsonb_build_object(
    'id_lieu_garde', l.id_lieu_garde, 'code_lieu_garde', l.code_lieu_garde,
    'libelle_lieu_garde', l.libelle_lieu_garde))) as items,
    array_agg(l.id_lieu_garde) as ids
  from public.profil_pet_sitter_lieu_garde x
  join public.lieu_garde l on l.id_lieu_garde = x.id_lieu_garde
  where x.id_profil_pet_sitter = ps.id_profil_pet_sitter
) locations on true
left join lateral (
  select jsonb_agg(jsonb_build_object('format_garde', jsonb_build_object(
    'id_format_garde', f.id_format_garde, 'code_format_garde', f.code_format_garde,
    'libelle_format_garde', f.libelle_format_garde))) as items,
    array_agg(f.id_format_garde) as ids
  from public.profil_pet_sitter_format_garde x
  join public.format_garde f on f.id_format_garde = x.id_format_garde
  where x.id_profil_pet_sitter = ps.id_profil_pet_sitter
) formats on true
left join lateral (
  select jsonb_agg(jsonb_build_object('service_additionnel', jsonb_build_object(
    'id_service_additionnel', s.id_service_additionnel, 'code_service_additionnel', s.code_service_additionnel,
    'libelle_service_additionnel', s.libelle_service_additionnel))) as items
  from public.profil_pet_sitter_service_additionnel x
  join public.service_additionnel s on s.id_service_additionnel = x.id_service_additionnel
  where x.id_profil_pet_sitter = ps.id_profil_pet_sitter
) services on true
left join lateral (
  select jsonb_agg(jsonb_build_object('actif', true, 'badge_public', jsonb_build_object(
    'id_badge_public', b.id_badge_public, 'code_badge_public', b.code_badge_public,
    'libelle_badge_public', b.libelle_badge_public))) as items
  from public.profil_pet_sitter_badge_public x
  join public.badge_public b on b.id_badge_public = x.id_badge_public
  where x.id_profil_pet_sitter = ps.id_profil_pet_sitter and x.actif = true
) badges on true
where ps.visibilite_publique = true
  and ps.statut_verification in (
    'published_unverified', 'identity_verified', 'professional_verified'
  );

revoke all on public.pet_sitter_public_profile from public;
grant select on public.pet_sitter_public_profile to anon, authenticated;
notify pgrst, 'reload schema';
