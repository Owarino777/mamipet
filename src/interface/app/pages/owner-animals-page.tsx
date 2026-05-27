"use client";

import Image from "next/image";
import { useState } from "react";
import {
  demoWorkspaceActions,
  useDemoWorkspace,
} from "@/interface/shared/demo-workspace-client";
import {
  CareCapabilityTag,
  SensitiveDataNotice,
  TrustBadge,
} from "@/interface/shared/product-ui";
import {
  ConnectedShell,
  useRoleAccess,
} from "@/interface/app/connected/connected-shell";
import { PetMiniCard } from "@/interface/app/connected/workspace-components";
import { getErrorMessage } from "@/interface/app/connected/workspace-formatters";

const defaultPetImageUrl =
  "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=1200&q=82";

export function OwnerAnimalsPage() {
  const workspace = useDemoWorkspace();

  const [isAddingPet, setIsAddingPet] = useState(false);

  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const [petImagePreview, setPetImagePreview] = useState(defaultPetImageUrl);

  const blockedContent = useRoleAccess("owner");

  if (blockedContent) {
    return blockedContent;
  }

  return (
    <ConnectedShell role="Propriétaire" active="Mes animaux">
      <main className="workspace-main">
        <div className="workspace-heading">
          <div>
            <p className="section-kicker">Animaux</p>

            <h1>
              Les besoins de chaque animal restent visibles au bon moment.
            </h1>
          </div>

          <button
            className="primary-button"
            type="button"
            onClick={() => {
              setIsAddingPet((current) => !current);

              setStatusMessage(null);
            }}
          >
            Ajouter un animal
          </button>
        </div>

        {isAddingPet ? (
          <form
            className="workspace-card inline-workspace-form"
            onSubmit={(event) => {
              event.preventDefault();

              const formData = new FormData(event.currentTarget);

              const name = String(formData.get("name") ?? "").trim();

              const species = String(formData.get("species") ?? "").trim();

              const age = String(formData.get("age") ?? "").trim();

              const imageUrl = String(formData.get("imageUrl") ?? "").trim();

              const needs = String(formData.get("needs") ?? "")
                .split(",")

                .map((need) => need.trim())

                .filter(Boolean);

              try {
                demoWorkspaceActions.addPet({
                  name,

                  species,

                  age,

                  needs: needs.length > 0 ? needs : ["Consignes à compléter"],

                  image: imageUrl.startsWith("https://images.unsplash.com/")
                    ? imageUrl
                    : petImagePreview,
                });

                setStatusMessage(
                  `${name} a été ajouté au dossier propriétaire.`,
                );

                event.currentTarget.reset();

                setPetImagePreview(defaultPetImageUrl);

                setIsAddingPet(false);
              } catch (error) {
                setStatusMessage(getErrorMessage(error));
              }
            }}
          >
            <label>
              Nom
              <input name="name" placeholder="Nala" />
            </label>

            <label>
              Espèce
              <input name="species" placeholder="Chien, chat, lapin..." />
            </label>

            <label>
              Âge
              <input name="age" placeholder="4 ans" />
            </label>

            <label>
              Besoins, séparés par des virgules
              <input name="needs" placeholder="Sous traitement, anxieux" />
            </label>

            <label>
              Photo de l&apos;animal
              <input
                type="file"
                accept="image/*"
                onChange={(event) => {
                  const file = event.target.files?.[0];

                  if (!file) {
                    return;
                  }

                  if (file.size > 900_000) {
                    setStatusMessage(
                      "Image trop lourde pour la démo locale. Utilisez une image de moins de 900 Ko.",
                    );

                    event.target.value = "";

                    return;
                  }

                  const reader = new FileReader();

                  reader.addEventListener("load", () => {
                    if (typeof reader.result === "string") {
                      setPetImagePreview(reader.result);

                      setStatusMessage(null);
                    }
                  });

                  reader.readAsDataURL(file);
                }}
              />
            </label>

            <label>
              URL Unsplash optionnelle
              <input
                name="imageUrl"
                placeholder="https://images.unsplash.com/..."
              />
            </label>

            <div className="pet-image-preview" aria-label="Aperçu de la photo">
              <Image
                src={petImagePreview}
                alt="Aperçu de l'animal"
                fill
                sizes="180px"
              />
            </div>

            <button className="primary-button" type="submit">
              Enregistrer l&apos;animal
            </button>
          </form>
        ) : null}

        {statusMessage ? (
          <p className="workspace-status">{statusMessage}</p>
        ) : null}

        {workspace.pets.length > 0 ? (
          <section className="workspace-grid">
            {workspace.pets.map((pet) => (
              <article
                className="workspace-card animal-detail-card"
                key={pet.id}
              >
                <PetMiniCard pet={pet} />

                <h2>Dossier médical {pet.name}</h2>

                <div className="tag-row">
                  {pet.needs.map((need) => (
                    <CareCapabilityTag key={need} label={need} />
                  ))}
                </div>

                <TrustBadge
                  label={
                    pet.medicalRecordStatus === "complete"
                      ? "Dossier complet"
                      : "Dossier à compléter"
                  }
                />

                <SensitiveDataNotice />
              </article>
            ))}
          </section>
        ) : (
          <section className="workspace-card workspace-empty-state">
            <h2>Votre espace est vide</h2>

            <p>
              Ajoutez votre premier animal pour préparer une réservation avec
              ses besoins, consignes et informations de soin.
            </p>
          </section>
        )}
      </main>
    </ConnectedShell>
  );
}
