import { describe, expect, it } from "vitest";
import { demoPetSitters } from "@/interface/shared/product-data";
import {
  containsForbiddenPublicFields,
  filterPublicPetSitters,
} from "@/interface/public/hooks/use-pet-sitter-search";
import { mapAreas } from "@/interface/public/hooks/use-map-viewport";

describe("pet-sitter public search", () => {
  it("filters by sensitive-care need without exposing unrelated profiles", () => {
    const results = filterPublicPetSitters(demoPetSitters, {
      activeQuickFilters: [],
      need: "medication",
      species: "all",
      viewport: mapAreas.caen.viewport,
    });

    expect(results.length).toBeGreaterThan(0);
    expect(
      results.every((profile) =>
        profile.careCapabilities.some((capability) => capability.code === "medication"),
      ),
    ).toBe(true);
  });

  it("combines species, badge and viewport filters", () => {
    const results = filterPublicPetSitters(demoPetSitters, {
      activeQuickFilters: ["verified_identity", "sitter_home"],
      need: "all",
      species: "dog",
      viewport: mapAreas.caen.viewport,
    });

    expect(results.map((profile) => profile.id)).toContain("sarah-johnson");
    expect(
      results.every(
        (profile) =>
          profile.verificationStatus !== "published_unverified" &&
          profile.species.some((species) => species.code === "dog") &&
          profile.careLocations.some((location) => location.code === "sitter_home"),
      ),
    ).toBe(true);
  });

  it("detects forbidden public fields before mapping search payloads", () => {
    expect(
      containsForbiddenPublicFields({
        id: "profile-1",
        firstName: "Sarah",
        phone: "0600000000",
      }),
    ).toBe(true);
    expect(
      containsForbiddenPublicFields({
        id: "profile-1",
        firstName: "Sarah",
        approximateLocation: { label: "Caen", lat: 49.18, lng: -0.36 },
      }),
    ).toBe(false);
  });
});
