-- Manual unavailability and accepted reservations must never overlap.
-- Locking the sitter row serializes this check with reservation acceptance.
create or replace function public.guard_unavailable_slot_overlap()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if new.statut_disponibilite not in ('unavailable', 'blocked_reservation') then
    return new;
  end if;
  perform 1 from public.profil_pet_sitter
  where id_profil_pet_sitter = new.id_profil_pet_sitter for update;
  if exists (
    select 1 from public.disponibilite existing
    where existing.id_profil_pet_sitter = new.id_profil_pet_sitter
      and existing.id_disponibilite <> new.id_disponibilite
      and existing.statut_disponibilite in ('unavailable', 'blocked_reservation')
      and existing.date_debut_disponibilite < new.date_fin_disponibilite
      and existing.date_fin_disponibilite > new.date_debut_disponibilite
  ) then
    raise exception 'Unavailable slots cannot overlap' using errcode = '23514';
  end if;
  return new;
end;
$$;

create trigger guard_unavailable_slot_overlap
before insert or update on public.disponibilite
for each row execute function public.guard_unavailable_slot_overlap();
