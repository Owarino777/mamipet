import { describe, expect, it } from "vitest";
import {
  mapPetSitterPublicProfileRow,
  type PetSitterProfileRow,
} from "@/modules/pet-sitters/presentation/pet-sitter-profile.mapper";

describe("public pet-sitter DTO", () => {
  it("hides private fields and only exposes approximate coordinates", () => {
    const dto = mapPetSitterPublicProfileRow(createProfileRow());

    expect(dto).not.toHaveProperty("phone");
    expect(dto).not.toHaveProperty("addressLine");
    expect(dto.latitude).toBe(49.18);
    expect(dto.longitude).toBe(-0.36);
  });
});

function createProfileRow(): PetSitterProfileRow {
  return {
    id_profil_pet_sitter: "profile-1",
    pseudo: "Sarah",
    prenom: "Sarah",
    telephone: "0600000000",
    photo_url: null,
    description: "Profil public",
    adresse_ligne1: "12 rue privée",
    ville: "Caen",
    pays: "France",
    latitude: 49.184247,
    longitude: -0.361995,
    tarif_base: 28,
    rayon_km: 8,
    statut_verification: "identity_verified",
    visibilite_publique: true,
    date_creation: "2026-05-01T12:00:00.000Z",
    profil_pet_sitter_espece: [],
    profil_pet_sitter_capacite_soin: [],
    profil_pet_sitter_lieu_garde: [],
    profil_pet_sitter_format_garde: [],
    profil_pet_sitter_service_additionnel: [],
    profil_pet_sitter_badge_public: [],
  };
}
