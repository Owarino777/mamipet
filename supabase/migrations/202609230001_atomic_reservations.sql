-- Keep reservation creation and slot acceptance atomic under the caller's RLS rights.
create or replace function public.create_reservation_with_animals(
  p_id_reservation uuid,
  p_id_profil_proprietaire uuid,
  p_id_profil_pet_sitter uuid,
  p_id_lieu_garde uuid,
  p_id_format_garde uuid,
  p_date_debut timestamptz,
  p_date_fin timestamptz,
  p_niveau_assurance text,
  p_tarif_centimes integer,
  p_consignes text,
  p_animaux uuid[]
) returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_animal uuid;
  v_index integer := 0;
  v_count integer := cardinality(p_animaux);
  v_base integer;
  v_remainder integer;
begin
  if auth.uid() is null or not exists (
    select 1 from public.profil_proprietaire
    where id_profil_proprietaire = p_id_profil_proprietaire and id_compte = auth.uid()
  ) then
    raise exception 'Not authorized to create this reservation' using errcode = '42501';
  end if;
  if v_count is null or v_count = 0 or v_count <> (
    select count(distinct animal_id) from unnest(p_animaux) as animal_id
  ) or p_tarif_centimes < v_count or p_date_debut <= now() then
    raise exception 'Invalid reservation animals or price' using errcode = '22023';
  end if;
  if (select count(*) from public.animal
      where id_animal = any(p_animaux) and id_profil_proprietaire = p_id_profil_proprietaire) <> v_count then
    raise exception 'Reservation animals must belong to the owner' using errcode = '22023';
  end if;
  if not exists (
    select 1 from public.profil_pet_sitter
    where id_profil_pet_sitter = p_id_profil_pet_sitter
      and visibilite_publique = true
      and statut_verification not in ('suspended', 'rejected', 'draft')
  ) then
    raise exception 'Pet-sitter is not available for booking' using errcode = '23514';
  end if;
  if not exists (
    select 1 from public.profil_pet_sitter_lieu_garde
    where id_profil_pet_sitter = p_id_profil_pet_sitter
      and id_lieu_garde = p_id_lieu_garde
  ) or not exists (
    select 1 from public.profil_pet_sitter_format_garde
    where id_profil_pet_sitter = p_id_profil_pet_sitter
      and id_format_garde = p_id_format_garde
  ) or exists (
    select 1 from public.animal a
    where a.id_animal = any(p_animaux)
      and not exists (
        select 1 from public.profil_pet_sitter_espece pse
        where pse.id_profil_pet_sitter = p_id_profil_pet_sitter
          and pse.id_espece = a.id_espece
      )
  ) then
    raise exception 'Pet-sitter offer does not match this request' using errcode = '23514';
  end if;

  insert into public.reservation (
    id_reservation, id_profil_proprietaire, id_profil_pet_sitter,
    id_lieu_garde, id_format_garde, date_debut_reservation,
    date_fin_reservation, niveau_assurance_applique, tarif_convenu,
    taux_commission_plateforme, consignes_reservation
  ) values (
    p_id_reservation, p_id_profil_proprietaire, p_id_profil_pet_sitter,
    p_id_lieu_garde, p_id_format_garde, p_date_debut,
    p_date_fin, p_niveau_assurance, p_tarif_centimes / 100.0,
    0.1500, p_consignes
  );

  v_base := p_tarif_centimes / v_count;
  v_remainder := p_tarif_centimes % v_count;
  foreach v_animal in array p_animaux loop
    v_index := v_index + 1;
    insert into public.reservation_animal (
      id_reservation, id_animal, id_profil_proprietaire, tarif_animal
    ) values (
      p_id_reservation, v_animal, p_id_profil_proprietaire,
      (v_base + case when v_index <= v_remainder then 1 else 0 end) / 100.0
    );
  end loop;
  return p_id_reservation;
end;
$$;

create or replace function public.accept_reservation_and_block_slot(p_id_reservation uuid)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_sitter uuid;
  v_reservation public.reservation%rowtype;
begin
  select id_profil_pet_sitter into v_sitter
  from public.reservation where id_reservation = p_id_reservation;
  if v_sitter is null or not exists (
    select 1 from public.profil_pet_sitter
    where id_profil_pet_sitter = v_sitter and id_compte = auth.uid()
  ) then
    raise exception 'Not authorized to accept this reservation' using errcode = '42501';
  end if;

  -- Serializes acceptances for the same sitter before checking overlapping slots.
  perform 1 from public.profil_pet_sitter
  where id_profil_pet_sitter = v_sitter for update;
  select * into v_reservation from public.reservation
  where id_reservation = p_id_reservation for update;
  if v_reservation.statut_reservation <> 'awaiting_response' then
    raise exception 'Reservation is not awaiting response' using errcode = '23514';
  end if;
  if exists (
    select 1 from public.disponibilite
    where id_profil_pet_sitter = v_sitter
      and statut_disponibilite in ('unavailable', 'blocked_reservation')
      and date_debut_disponibilite < v_reservation.date_fin_reservation
      and date_fin_disponibilite > v_reservation.date_debut_reservation
  ) then
    raise exception 'The requested slot is unavailable' using errcode = '23514';
  end if;

  insert into public.disponibilite (
    id_profil_pet_sitter, id_reservation, date_debut_disponibilite,
    date_fin_disponibilite, statut_disponibilite
  ) values (
    v_sitter, p_id_reservation, v_reservation.date_debut_reservation,
    v_reservation.date_fin_reservation, 'blocked_reservation'
  );
  update public.reservation
  set statut_reservation = 'accepted', date_reponse = now()
  where id_reservation = p_id_reservation;
  return p_id_reservation;
end;
$$;

revoke all on function public.create_reservation_with_animals(uuid, uuid, uuid, uuid, uuid, timestamptz, timestamptz, text, integer, text, uuid[]) from public, anon;
revoke all on function public.accept_reservation_and_block_slot(uuid) from public, anon;
grant execute on function public.create_reservation_with_animals(uuid, uuid, uuid, uuid, uuid, timestamptz, timestamptz, text, integer, text, uuid[]) to authenticated;
grant execute on function public.accept_reservation_and_block_slot(uuid) to authenticated;
