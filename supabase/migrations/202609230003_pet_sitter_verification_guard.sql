-- A sitter may publish a draft, but may not award themselves verification.
create or replace function public.guard_pet_sitter_verification()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if tg_op = 'UPDATE' then
    if new.id_profil_pet_sitter is distinct from old.id_profil_pet_sitter
       or new.id_compte is distinct from old.id_compte then
      raise exception 'Profile identity cannot be changed' using errcode = '42501';
    end if;
    if new.visibilite_publique and old.statut_verification = 'draft'
       and new.statut_verification = 'draft' then
      new.statut_verification := 'published_unverified';
    end if;
    if new.statut_verification is distinct from old.statut_verification
       and not public.is_current_account_admin()
       and not (
         old.statut_verification = 'draft'
         and new.statut_verification = 'published_unverified'
         and new.id_compte = auth.uid()
       ) then
      raise exception 'Verification status requires an administrator' using errcode = '42501';
    end if;
  else
    if not public.is_current_account_admin()
       and new.statut_verification not in ('draft', 'published_unverified') then
      raise exception 'Verification status requires an administrator' using errcode = '42501';
    end if;
    if new.visibilite_publique and new.statut_verification = 'draft' then
      new.statut_verification := 'published_unverified';
    end if;
  end if;
  return new;
end;
$$;

create trigger guard_pet_sitter_verification
before insert or update on public.profil_pet_sitter
for each row execute function public.guard_pet_sitter_verification();

-- Draft profiles must not appear in public search even if older rows have
-- inconsistent visibility values.
drop policy if exists "visible pet sitter profiles are public" on public.profil_pet_sitter;
create policy "visible pet sitter profiles are public" on public.profil_pet_sitter
  for select using (
    visibilite_publique = true
    and statut_verification in (
      'published_unverified', 'identity_verified', 'professional_verified'
    )
  );

notify pgrst, 'reload schema';
