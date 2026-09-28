-- Reservation writes go through checked, transactional functions only.
alter function public.create_reservation_with_animals(
  uuid, uuid, uuid, uuid, uuid, timestamptz, timestamptz, text, integer, text, uuid[]
) security definer;
alter function public.accept_reservation_and_block_slot(uuid) security definer;

create or replace function public.transition_reservation(
  p_id_reservation uuid,
  p_action text,
  p_reason text default null
) returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_reservation public.reservation%rowtype;
  v_is_owner boolean;
  v_is_sitter boolean;
begin
  if auth.uid() is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  select * into v_reservation from public.reservation
  where id_reservation = p_id_reservation for update;
  if not found then
    raise exception 'Reservation not found' using errcode = 'P0002';
  end if;
  select exists (
    select 1 from public.profil_proprietaire
    where id_profil_proprietaire = v_reservation.id_profil_proprietaire
      and id_compte = auth.uid()
  ) into v_is_owner;
  select exists (
    select 1 from public.profil_pet_sitter
    where id_profil_pet_sitter = v_reservation.id_profil_pet_sitter
      and id_compte = auth.uid()
  ) into v_is_sitter;

  if p_action = 'refuse' then
    if not v_is_sitter then
      raise exception 'Only the pet-sitter can refuse' using errcode = '42501';
    end if;
    if v_reservation.statut_reservation <> 'awaiting_response' then
      raise exception 'Invalid reservation transition' using errcode = '23514';
    end if;
    if nullif(btrim(p_reason), '') is null then
      raise exception 'A reason is required' using errcode = '22023';
    end if;
    update public.reservation set statut_reservation = 'refused',
      motif_refus = p_reason, date_reponse = now()
    where id_reservation = p_id_reservation;
  elsif p_action = 'cancel' then
    if not (v_is_owner or v_is_sitter) then
      raise exception 'Only a reservation party can cancel' using errcode = '42501';
    end if;
    if v_reservation.statut_reservation not in ('awaiting_response', 'accepted', 'awaiting_payment') then
      raise exception 'Invalid reservation transition' using errcode = '23514';
    end if;
    if nullif(btrim(p_reason), '') is null then
      raise exception 'A reason is required' using errcode = '22023';
    end if;
    delete from public.disponibilite where id_reservation = p_id_reservation;
    update public.reservation set statut_reservation = 'cancelled',
      motif_annulation = p_reason
    where id_reservation = p_id_reservation;
  elsif p_action = 'complete' then
    if not public.is_current_account_admin() then
      raise exception 'Only an administrator can complete' using errcode = '42501';
    end if;
    if v_reservation.statut_reservation <> 'paid' then
      raise exception 'Invalid reservation transition' using errcode = '23514';
    end if;
    update public.reservation set statut_reservation = 'completed'
    where id_reservation = p_id_reservation;
  else
    raise exception 'Unknown reservation action' using errcode = '22023';
  end if;
  return p_id_reservation;
end;
$$;

revoke all on function public.transition_reservation(uuid, text, text) from public, anon;
grant execute on function public.transition_reservation(uuid, text, text) to authenticated;

-- An authenticated Supabase client can call PostgREST directly. Grants must
-- prevent bypassing the API's status checks and atomic write functions.
revoke insert, update, delete on public.reservation from public, anon, authenticated;
revoke insert, update, delete on public.reservation_animal from public, anon, authenticated;
revoke insert, update, delete on public.paiement from public, anon, authenticated;
revoke insert, update, delete on public.contrat_recapitulatif from public, anon, authenticated;

drop policy if exists "pet sitters can manage own availability" on public.disponibilite;
create policy "pet sitters can read own availability" on public.disponibilite
  for select using (exists (
    select 1 from public.profil_pet_sitter ps
    where ps.id_profil_pet_sitter = disponibilite.id_profil_pet_sitter
      and ps.id_compte = auth.uid()
  ));
create policy "pet sitters can create manual availability" on public.disponibilite
  for insert with check (
    id_reservation is null and statut_disponibilite in ('available', 'unavailable')
    and exists (
      select 1 from public.profil_pet_sitter ps
      where ps.id_profil_pet_sitter = disponibilite.id_profil_pet_sitter
        and ps.id_compte = auth.uid()
    )
  );
create policy "pet sitters can update manual availability" on public.disponibilite
  for update using (
    id_reservation is null and exists (
      select 1 from public.profil_pet_sitter ps
      where ps.id_profil_pet_sitter = disponibilite.id_profil_pet_sitter
        and ps.id_compte = auth.uid()
    )
  ) with check (
    id_reservation is null and statut_disponibilite in ('available', 'unavailable')
    and exists (
      select 1 from public.profil_pet_sitter ps
      where ps.id_profil_pet_sitter = disponibilite.id_profil_pet_sitter
        and ps.id_compte = auth.uid()
    )
  );
create policy "pet sitters can delete manual availability" on public.disponibilite
  for delete using (
    id_reservation is null and exists (
      select 1 from public.profil_pet_sitter ps
      where ps.id_profil_pet_sitter = disponibilite.id_profil_pet_sitter
        and ps.id_compte = auth.uid()
    )
  );

notify pgrst, 'reload schema';
