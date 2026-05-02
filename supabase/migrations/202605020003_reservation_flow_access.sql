create policy "owners can create reservations" on public.reservation
  for insert with check (
    exists (
      select 1 from public.profil_proprietaire pp
      where pp.id_profil_proprietaire = reservation.id_profil_proprietaire
      and pp.id_compte = auth.uid()
    )
  );

create policy "reservation parties can update reservations" on public.reservation
  for update using (
    exists (
      select 1 from public.profil_proprietaire pp
      where pp.id_profil_proprietaire = reservation.id_profil_proprietaire
      and pp.id_compte = auth.uid()
    )
    or exists (
      select 1 from public.profil_pet_sitter ps
      where ps.id_profil_pet_sitter = reservation.id_profil_pet_sitter
      and ps.id_compte = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.profil_proprietaire pp
      where pp.id_profil_proprietaire = reservation.id_profil_proprietaire
      and pp.id_compte = auth.uid()
    )
    or exists (
      select 1 from public.profil_pet_sitter ps
      where ps.id_profil_pet_sitter = reservation.id_profil_pet_sitter
      and ps.id_compte = auth.uid()
    )
  );

create policy "reservation parties can read reservation animals" on public.reservation_animal
  for select using (
    exists (
      select 1 from public.reservation r
      left join public.profil_proprietaire pp
        on pp.id_profil_proprietaire = r.id_profil_proprietaire
      left join public.profil_pet_sitter ps
        on ps.id_profil_pet_sitter = r.id_profil_pet_sitter
      where r.id_reservation = reservation_animal.id_reservation
      and (pp.id_compte = auth.uid() or ps.id_compte = auth.uid())
    )
  );

create policy "owners can create reservation animals" on public.reservation_animal
  for insert with check (
    exists (
      select 1 from public.profil_proprietaire pp
      where pp.id_profil_proprietaire = reservation_animal.id_profil_proprietaire
      and pp.id_compte = auth.uid()
    )
  );

create policy "reservation pet sitters can read booked animals" on public.animal
  for select using (
    exists (
      select 1 from public.reservation_animal ra
      join public.reservation r on r.id_reservation = ra.id_reservation
      join public.profil_pet_sitter ps on ps.id_profil_pet_sitter = r.id_profil_pet_sitter
      where ra.id_animal = animal.id_animal
      and ps.id_compte = auth.uid()
    )
  );

create policy "pet sitters can manage own availability" on public.disponibilite
  for all using (
    exists (
      select 1 from public.profil_pet_sitter ps
      where ps.id_profil_pet_sitter = disponibilite.id_profil_pet_sitter
      and ps.id_compte = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.profil_pet_sitter ps
      where ps.id_profil_pet_sitter = disponibilite.id_profil_pet_sitter
      and ps.id_compte = auth.uid()
    )
  );

create policy "reservation parties can read payments" on public.paiement
  for select using (
    exists (
      select 1 from public.reservation r
      left join public.profil_proprietaire pp
        on pp.id_profil_proprietaire = r.id_profil_proprietaire
      left join public.profil_pet_sitter ps
        on ps.id_profil_pet_sitter = r.id_profil_pet_sitter
      where r.id_reservation = paiement.id_reservation
      and (pp.id_compte = auth.uid() or ps.id_compte = auth.uid())
    )
  );

create policy "owners can create payments" on public.paiement
  for insert with check (
    exists (
      select 1 from public.reservation r
      join public.profil_proprietaire pp
        on pp.id_profil_proprietaire = r.id_profil_proprietaire
      where r.id_reservation = paiement.id_reservation
      and pp.id_compte = auth.uid()
    )
  );

create policy "reservation parties can read contracts" on public.contrat_recapitulatif
  for select using (
    exists (
      select 1 from public.reservation r
      left join public.profil_proprietaire pp
        on pp.id_profil_proprietaire = r.id_profil_proprietaire
      left join public.profil_pet_sitter ps
        on ps.id_profil_pet_sitter = r.id_profil_pet_sitter
      where r.id_reservation = contrat_recapitulatif.id_reservation
      and (pp.id_compte = auth.uid() or ps.id_compte = auth.uid())
    )
  );

create policy "owners can create contracts" on public.contrat_recapitulatif
  for insert with check (
    exists (
      select 1 from public.reservation r
      join public.profil_proprietaire pp
        on pp.id_profil_proprietaire = r.id_profil_proprietaire
      where r.id_reservation = contrat_recapitulatif.id_reservation
      and pp.id_compte = auth.uid()
    )
  );

grant select, insert, update, delete on public.disponibilite to authenticated;
grant select, insert on public.paiement to authenticated;
grant select, insert on public.contrat_recapitulatif to authenticated;

notify pgrst, 'reload schema';
