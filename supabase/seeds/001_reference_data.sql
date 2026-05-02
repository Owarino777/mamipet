insert into public.espece (code_espece, libelle_espece) values
  ('dog', 'Chien'),
  ('cat', 'Chat'),
  ('bird', 'Oiseau'),
  ('small_mammal', 'Petit mammifère'),
  ('reptile', 'Reptile'),
  ('invertebrate', 'Invertébré'),
  ('amphibian', 'Amphibien'),
  ('farm_animal', 'Animal de la ferme')
on conflict (code_espece) do nothing;

insert into public.capacite_soin (code_capacite_soin, libelle_capacite_soin) values
  ('senior_animal', 'Animal âgé'),
  ('medical_treatment', 'Sous traitement'),
  ('disabled_animal', 'Animal handicapé'),
  ('anxious_sensitive', 'Anxieux ou sensible'),
  ('specific_diet', 'Alimentation spécifique'),
  ('enhanced_monitoring', 'Surveillance renforcée'),
  ('light_veterinary_protocol', 'Protocole vétérinaire léger')
on conflict (code_capacite_soin) do nothing;

insert into public.lieu_garde (code_lieu_garde, libelle_lieu_garde) values
  ('pet_sitter_home', 'Chez le pet-sitter'),
  ('owner_home', 'Chez le propriétaire'),
  ('visit', 'Visite')
on conflict (code_lieu_garde) do nothing;

insert into public.format_garde (code_format_garde, libelle_format_garde) values
  ('day', 'Journée'),
  ('night', 'Nuit'),
  ('weekend', 'Week-end'),
  ('long_stay', 'Longue durée')
on conflict (code_format_garde) do nothing;

insert into public.service_additionnel (code_service_additionnel, libelle_service_additionnel) values
  ('medication_administration', 'Administration de traitement'),
  ('photo_video_update', 'Suivi photo/vidéo'),
  ('extra_walk', 'Promenade supplémentaire'),
  ('transport', 'Transport'),
  ('specific_cleaning', 'Nettoyage spécifique')
on conflict (code_service_additionnel) do nothing;

insert into public.badge_public (code_badge_public, libelle_badge_public) values
  ('verified_identity', 'Verified Identity'),
  ('pro', 'Pro'),
  ('expert', 'Expert')
on conflict (code_badge_public) do nothing;
