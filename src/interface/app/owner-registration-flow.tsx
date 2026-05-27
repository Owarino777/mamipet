"use client";

import Image from "next/image";
import { demoWorkspaceActions } from "@/interface/shared/demo-workspace-client";
import { isLocalEmailVerificationBypassEnabled } from "@/shared/config/auth-public-env";
import { createSupabaseBrowserClient } from "@/shared/supabase/browser-client";

const defaultOwnerPetImageUrl =
  "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=1200&q=82";

export type OwnerRegistrationStep = "account" | "animal" | "preferences";

export type OwnerAccountDraft = {
  addressLine1: string;
  age: string;
  city: string;
  email: string;
  firstName: string;
  identityKind: string;
  lastName: string;
  password: string;
  postalCode: string;
};

export type OwnerAnimalDraft = {
  age: string;
  hasBitten: boolean;
  hasHealthIssues: boolean;
  healthDocumentName: string;
  healthNotes: string;
  name: string;
  photoPreview: string;
  sex: string;
  speciesCode: string;
  speciesLabel: string;
  temperament: string[];
  weightKg: string;
};

export type OwnerPreferenceDraft = {
  budget: string;
  careTypes: string[];
  showBeginnerPetSitters: boolean;
  showConfirmedPetSitters: boolean;
  showProfessionalPetSitters: boolean;
};

export type PendingOwnerRegistration = {
  account: OwnerAccountDraft;
  animal: OwnerAnimalDraft;
  email: string;
  preferences: OwnerPreferenceDraft;
  role: "owner";
};

type OwnerRegistrationFlowProps = {
  accountDraft: OwnerAccountDraft | null;
  animalDraft: OwnerAnimalDraft | null;
  imagePreview: string;
  isSubmitting: boolean;
  onAccountDraftChange: (draft: OwnerAccountDraft) => void;
  onAnimalDraftChange: (draft: OwnerAnimalDraft) => void;
  onCompleteLocalRegistration: (input: {
    email: string;
    firstName: string;
    role: "owner";
  }) => void;
  onError: (message: string | null) => void;
  onEmailVerificationRequired: (registration: PendingOwnerRegistration) => void;
  onImagePreviewChange: (preview: string) => void;
  onStepChange: (step: OwnerRegistrationStep) => void;
  onSubmittingChange: (isSubmitting: boolean) => void;
  onSuccess: (message: string | null) => void;
  onNavigate: (href: string) => void;
  step: OwnerRegistrationStep;
};

export { defaultOwnerPetImageUrl };

export function OwnerRegistrationFlow(props: OwnerRegistrationFlowProps) {
  if (props.step === "animal") {
    return (
      <form
        className="register-form owner-onboarding-form"
        onSubmit={(event) => {
          event.preventDefault();
          const draft = createOwnerAnimalDraft(
            new FormData(event.currentTarget),
            props.imagePreview,
          );

          props.onError(null);
          props.onSuccess(null);

          if (!draft.name || !draft.age || !draft.speciesCode) {
            props.onError("Type d'animal, nom et âge sont requis.");
            return;
          }

          props.onAnimalDraftChange(draft);
          props.onStepChange("preferences");
        }}
      >
        <div className="owner-form-grid">
          <label className="owner-field-wide">
            Type d’animal
            <select
              name="speciesCode"
              defaultValue={props.animalDraft?.speciesCode ?? "cat"}
            >
              {ownerAnimalSpeciesOptions.map((option) => (
                <option key={option.code} value={option.code}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Nom
            <input
              name="name"
              type="text"
              defaultValue={props.animalDraft?.name ?? ""}
              placeholder="Opale"
              required
            />
          </label>
          <label>
            Âge
            <input
              name="age"
              type="number"
              min="0"
              defaultValue={props.animalDraft?.age ?? ""}
              placeholder="6"
              required
            />
          </label>
          <label>
            Sexe
            <select name="sex" defaultValue={props.animalDraft?.sex ?? ""}>
              <option value="">Non renseigné</option>
              <option value="female">Femelle</option>
              <option value="male">Mâle</option>
            </select>
          </label>
          <label>
            Poids
            <input
              name="weightKg"
              type="number"
              min="0"
              step="0.1"
              defaultValue={props.animalDraft?.weightKg ?? ""}
              placeholder="4.2 kg"
            />
          </label>
          <label className="owner-field-wide">
            Photo de l’animal
            <input
              name="animalPhoto"
              type="file"
              accept="image/*"
              onChange={(event) => handleOwnerPetPhotoChange(event, props)}
            />
          </label>
          <div className="owner-photo-preview" aria-label="Aperçu photo animal">
            <Image
              src={props.imagePreview}
              alt="Aperçu de l'animal"
              fill
              sizes="96px"
            />
          </div>
        </div>

        <fieldset className="owner-fieldset">
          <legend>Caractère</legend>
          <div className="owner-chip-list">
            {ownerTemperamentOptions.map((option) => (
              <label className="owner-mini-chip" key={option}>
                <input
                  name="temperament"
                  type="checkbox"
                  value={option}
                  defaultChecked={(
                    props.animalDraft?.temperament ?? [
                      "Calme",
                      "Solitaire",
                      "Joueur",
                    ]
                  ).includes(option)}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="owner-fieldset">
          <legend>A-t-il déjà mordu, griffé, poussé, etc&nbsp;?</legend>
          <div className="owner-radio-row">
            <label>
              <input
                name="hasBitten"
                type="radio"
                value="yes"
                defaultChecked={props.animalDraft?.hasBitten ?? true}
              />{" "}
              Oui
            </label>
            <label>
              <input
                name="hasBitten"
                type="radio"
                value="no"
                defaultChecked={props.animalDraft?.hasBitten === false}
              />{" "}
              Non
            </label>
          </div>
        </fieldset>

        <label>
          Carnet de santé
          <input
            name="healthDocument"
            type="file"
            accept="application/pdf,image/jpeg,image/png"
          />
        </label>

        <fieldset className="owner-fieldset">
          <legend>A-t-il des problèmes de santé&nbsp;?</legend>
          <div className="owner-radio-row">
            <label>
              <input
                name="hasHealthIssues"
                type="radio"
                value="yes"
                defaultChecked={props.animalDraft?.hasHealthIssues === true}
              />{" "}
              Oui
            </label>
            <label>
              <input
                name="hasHealthIssues"
                type="radio"
                value="no"
                defaultChecked={props.animalDraft?.hasHealthIssues !== true}
              />{" "}
              Non
            </label>
          </div>
        </fieldset>

        <label>
          Si oui, explique
          <input
            name="healthNotes"
            type="text"
            defaultValue={props.animalDraft?.healthNotes ?? ""}
            placeholder="Décris la maladie, les soins, etc..."
          />
        </label>

        <button className="register-submit" type="submit">
          Valider
        </button>
      </form>
    );
  }

  if (props.step === "preferences") {
    return <OwnerPreferencesForm {...props} />;
  }

  return <OwnerAccountForm {...props} />;
}

function OwnerAccountForm(props: OwnerRegistrationFlowProps) {
  return (
    <form
      className="register-form"
      onSubmit={(event) => {
        event.preventDefault();
        const draft = createOwnerAccountDraft(
          new FormData(event.currentTarget),
        );

        props.onError(null);
        props.onSuccess(null);

        if (!draft.firstName || !draft.email || !draft.password) {
          props.onError("Prénom, email et mot de passe sont requis.");
          return;
        }

        props.onAccountDraftChange(draft);
        props.onStepChange("animal");
      }}
    >
      <fieldset className="register-kind-fieldset">
        <legend>Je suis...</legend>
        <div className="register-kind-options">
          {["Maman", "Papa", "Ami"].map((option, index) => (
            <label className="register-chip" key={option}>
              <input
                defaultChecked={index === 0}
                name="identityKind"
                type="radio"
                value={option}
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="register-form-grid">
        <label>
          Prénom
          <input
            name="firstName"
            type="text"
            placeholder="Margo"
            defaultValue={props.accountDraft?.firstName ?? ""}
            required
          />
        </label>
        <label>
          Nom
          <input
            name="lastName"
            type="text"
            placeholder="Da Silva"
            defaultValue={props.accountDraft?.lastName ?? ""}
            required
          />
        </label>
        <label className="register-field-wide">
          Adresse mail
          <input
            name="email"
            type="email"
            placeholder="margo.mamipet@gmail.com"
            defaultValue={props.accountDraft?.email ?? ""}
            required
          />
        </label>
        <label>
          Âge
          <input
            name="age"
            type="number"
            min="16"
            placeholder="24"
            defaultValue={props.accountDraft?.age ?? ""}
          />
        </label>
        <label>
          Ville
          <input
            name="city"
            type="text"
            placeholder="Caen"
            defaultValue={props.accountDraft?.city ?? ""}
          />
        </label>
        <label>
          Code postale
          <input
            name="postalCode"
            type="text"
            inputMode="numeric"
            placeholder="14000"
            defaultValue={props.accountDraft?.postalCode ?? ""}
          />
        </label>
        <label className="register-field-wide">
          Adresse
          <input
            name="addressLine1"
            type="text"
            placeholder="12 rue des Lilas"
            defaultValue={props.accountDraft?.addressLine1 ?? ""}
          />
        </label>
        <label className="register-password-field">
          Mot de passe
          <input
            name="password"
            type="password"
            placeholder="********"
            minLength={8}
            required
          />
        </label>
      </div>

      <button className="register-submit" type="submit">
        Créer mon compte
      </button>
    </form>
  );
}

function OwnerPreferencesForm(props: OwnerRegistrationFlowProps) {
  return (
    <form
      className="register-form owner-onboarding-form"
      onSubmit={async (event) => {
        event.preventDefault();
        const preferenceDraft = createOwnerPreferenceDraft(
          new FormData(event.currentTarget),
        );

        props.onError(null);
        props.onSuccess(null);

        if (preferenceDraft.careTypes.length === 0) {
          props.onError("Sélectionne au moins un type de garde.");
          return;
        }

        if (!props.accountDraft || !props.animalDraft) {
          props.onError("Le parcours propriétaire est incomplet.");
          props.onStepChange("account");
          return;
        }

        props.onSubmittingChange(true);

        try {
          const completion = await completeOwnerRegistration({
            account: props.accountDraft,
            animal: props.animalDraft,
            onCompleteLocalRegistration: props.onCompleteLocalRegistration,
            preferences: preferenceDraft,
          });

          if (completion.requiresEmailVerification) {
            props.onEmailVerificationRequired({
              account: props.accountDraft,
              animal: props.animalDraft,
              email: props.accountDraft.email,
              preferences: preferenceDraft,
              role: "owner",
            });
            return;
          }

          props.onNavigate("/pet-sitters");
        } catch (error) {
          props.onError(getErrorMessage(error));
        } finally {
          props.onSubmittingChange(false);
        }
      }}
    >
      <fieldset className="owner-fieldset owner-care-fieldset">
        <legend>Quelles gardes souhaites-tu réserver&nbsp;?</legend>
        <div className="owner-check-list">
          {ownerCareTypeOptions.map((option) => (
            <label key={option}>
              <input name="careTypes" type="checkbox" value={option} />
              <span>{option}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {ownerVisibilityPreferenceOptions.map((option) => (
        <fieldset className="owner-fieldset" key={option.name}>
          <legend>{option.label}</legend>
          <div className="owner-radio-row">
            <label>
              <input
                name={option.name}
                type="radio"
                value="yes"
                defaultChecked
              />{" "}
              Oui
            </label>
            <label>
              <input name={option.name} type="radio" value="no" /> Non
            </label>
          </div>
        </fieldset>
      ))}

      <label>
        Budget
        <select name="budget" defaultValue="25 €/jour">
          <option>25 €/jour</option>
          <option>35 €/jour</option>
          <option>50 €/jour</option>
          <option>Budget flexible</option>
        </select>
      </label>

      <button
        className="register-submit"
        type="submit"
        disabled={props.isSubmitting}
      >
        {props.isSubmitting ? "Création en cours..." : "Valider"}
      </button>
    </form>
  );
}

const ownerAnimalSpeciesOptions = [
  { code: "cat", label: "Chat" },
  { code: "dog", label: "Chien" },
  { code: "small_mammal", label: "Petit mammifère" },
  { code: "bird", label: "Oiseau" },
  { code: "reptile", label: "Reptile" },
  { code: "farm_animal", label: "Animal de la ferme" },
] as const;

const ownerTemperamentOptions = [
  "Calme",
  "Solitaire",
  "Joueur",
  "Anxieux",
  "Sociable",
] as const;

const ownerCareTypeOptions = [
  "Visites à domicile",
  "Garde à domicile",
  "Garde chez le propriétaire",
  "Promenades",
  "Garderie",
] as const;

const ownerVisibilityPreferenceOptions = [
  {
    label: "Afficher les petsitters débutants",
    name: "showBeginnerPetSitters",
  },
  {
    label: "Afficher les petsitters confirmés",
    name: "showConfirmedPetSitters",
  },
  {
    label: "Afficher les petsitters professionnels",
    name: "showProfessionalPetSitters",
  },
] as const;

function handleOwnerPetPhotoChange(
  event: React.ChangeEvent<HTMLInputElement>,
  props: Pick<OwnerRegistrationFlowProps, "onError" | "onImagePreviewChange">,
) {
  const file = event.target.files?.[0];

  if (!file) {
    return;
  }

  if (file.size > 900_000) {
    props.onError(
      "Image trop lourde pour la démo locale. Utilisez une image de moins de 900 Ko.",
    );
    event.target.value = "";
    return;
  }

  const reader = new FileReader();
  reader.addEventListener("load", () => {
    if (typeof reader.result === "string") {
      props.onImagePreviewChange(reader.result);
      props.onError(null);
    }
  });
  reader.readAsDataURL(file);
}

function createOwnerAccountDraft(formData: FormData): OwnerAccountDraft {
  return {
    addressLine1: String(formData.get("addressLine1") ?? "").trim(),
    age: String(formData.get("age") ?? "").trim(),
    city: String(formData.get("city") ?? "").trim() || "Caen",
    email: String(formData.get("email") ?? "")
      .trim()
      .toLowerCase(),
    firstName: String(formData.get("firstName") ?? "").trim(),
    identityKind: String(formData.get("identityKind") ?? "").trim() || "Maman",
    lastName: String(formData.get("lastName") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
    postalCode: String(formData.get("postalCode") ?? "").trim(),
  };
}

function createOwnerAnimalDraft(
  formData: FormData,
  photoPreview: string,
): OwnerAnimalDraft {
  const speciesCode = String(formData.get("speciesCode") ?? "cat");
  const speciesLabel =
    ownerAnimalSpeciesOptions.find((option) => option.code === speciesCode)
      ?.label ?? "Chat";
  const healthDocument = formData.get("healthDocument");

  return {
    age: String(formData.get("age") ?? "").trim(),
    hasBitten: formData.get("hasBitten") !== "no",
    hasHealthIssues: formData.get("hasHealthIssues") === "yes",
    healthDocumentName:
      healthDocument instanceof File ? healthDocument.name : "",
    healthNotes: String(formData.get("healthNotes") ?? "").trim(),
    name: String(formData.get("name") ?? "").trim(),
    photoPreview,
    sex: String(formData.get("sex") ?? "").trim(),
    speciesCode,
    speciesLabel,
    temperament: formData
      .getAll("temperament")
      .map((value) => String(value).trim())
      .filter(Boolean),
    weightKg: String(formData.get("weightKg") ?? "").trim(),
  };
}

function createOwnerPreferenceDraft(formData: FormData): OwnerPreferenceDraft {
  return {
    budget: String(formData.get("budget") ?? "25 €/jour"),
    careTypes: formData
      .getAll("careTypes")
      .map((value) => String(value).trim())
      .filter(Boolean),
    showBeginnerPetSitters: formData.get("showBeginnerPetSitters") !== "no",
    showConfirmedPetSitters: formData.get("showConfirmedPetSitters") !== "no",
    showProfessionalPetSitters:
      formData.get("showProfessionalPetSitters") !== "no",
  };
}

async function completeOwnerRegistration(input: {
  account: OwnerAccountDraft;
  animal: OwnerAnimalDraft;
  onCompleteLocalRegistration: OwnerRegistrationFlowProps["onCompleteLocalRegistration"];
  preferences: OwnerPreferenceDraft;
}): Promise<{ requiresEmailVerification: boolean }> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase.auth.signUp({
    email: input.account.email,
    password: input.account.password,
    options: {
      emailRedirectTo: `${window.location.origin}/register`,
      data: {
        age: input.account.age,
        firstName: input.account.firstName,
        identityKind: input.account.identityKind,
        lastName: input.account.lastName,
        postalCode: input.account.postalCode,
        role: "owner",
        city: input.account.city,
        ownerPreferences: input.preferences,
      },
    },
  });

  if (error && !isAuthRateLimitError(error)) {
    throw new Error(error.message);
  }

  if (!error && !isLocalEmailVerificationBypassEnabled()) {
    if (data.session) {
      await supabase.auth.signOut();
    }

    return { requiresEmailVerification: true };
  }

  input.onCompleteLocalRegistration({
    email: input.account.email,
    firstName: input.account.firstName,
    role: "owner",
  });
  demoWorkspaceActions.startEmptyWorkspace();
  demoWorkspaceActions.addPet({
    age: `${input.animal.age} ans`,
    image: input.animal.photoPreview,
    name: input.animal.name,
    needs: buildOwnerPetNeeds(input.animal),
    species: input.animal.speciesLabel,
  });
  saveOwnerRegistrationPreferences(input.preferences);

  if (!data.session || error) {
    return { requiresEmailVerification: false };
  }

  await ensureOwnerProfile({
    addressLine1: input.account.addressLine1,
    city: input.account.city,
    firstName: input.account.firstName,
    postalCode: input.account.postalCode,
  });
  const animalId = await createOwnerAnimal(input.animal);

  if (
    animalId &&
    (input.animal.hasHealthIssues ||
      input.animal.healthNotes ||
      input.animal.healthDocumentName)
  ) {
    await upsertOwnerAnimalMedicalRecord(animalId, input.animal);
  }

  return { requiresEmailVerification: false };
}

export async function completeVerifiedOwnerRegistration(input: {
  account: OwnerAccountDraft;
  animal: OwnerAnimalDraft;
  onCompleteLocalRegistration: OwnerRegistrationFlowProps["onCompleteLocalRegistration"];
  preferences: OwnerPreferenceDraft;
}) {
  input.onCompleteLocalRegistration({
    email: input.account.email,
    firstName: input.account.firstName,
    role: "owner",
  });
  demoWorkspaceActions.startEmptyWorkspace();
  demoWorkspaceActions.addPet({
    age: `${input.animal.age} ans`,
    image: input.animal.photoPreview,
    name: input.animal.name,
    needs: buildOwnerPetNeeds(input.animal),
    species: input.animal.speciesLabel,
  });
  saveOwnerRegistrationPreferences(input.preferences);

  await ensureOwnerProfile({
    addressLine1: input.account.addressLine1,
    city: input.account.city,
    firstName: input.account.firstName,
    postalCode: input.account.postalCode,
  });
  const animalId = await createOwnerAnimal(input.animal);

  if (
    animalId &&
    (input.animal.hasHealthIssues ||
      input.animal.healthNotes ||
      input.animal.healthDocumentName)
  ) {
    await upsertOwnerAnimalMedicalRecord(animalId, input.animal);
  }
}

function buildOwnerPetNeeds(animal: OwnerAnimalDraft): string[] {
  const needs = [
    ...animal.temperament,
    animal.hasBitten ? "Interactions à surveiller" : "Pas d'incident signalé",
    animal.hasHealthIssues ? "Santé à surveiller" : "",
  ].filter(Boolean);

  return needs.length > 0 ? needs : ["Consignes à compléter"];
}

function saveOwnerRegistrationPreferences(preferences: OwnerPreferenceDraft) {
  window.localStorage.setItem(
    "mamipet.ownerRegistrationPreferences",
    JSON.stringify(preferences),
  );
}

async function createOwnerAnimal(
  animal: OwnerAnimalDraft,
): Promise<string | null> {
  const species = await fetchReferenceItems("/api/reference-data/species");
  const speciesId = species.find(
    (item) => item.code === animal.speciesCode,
  )?.id;

  if (!speciesId) {
    return null;
  }

  const weightKg = animal.weightKg ? Number(animal.weightKg) : null;
  const response = await fetch("/api/animals", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      name: animal.name,
      photoUrl: animal.photoPreview.startsWith("https://")
        ? animal.photoPreview
        : null,
      sex: animal.sex || null,
      speciesId,
      specificNeeds: buildOwnerPetNeeds(animal).join(", "),
      temperament: animal.temperament.join(", ") || null,
      weightKg: Number.isFinite(weightKg) ? weightKg : null,
    }),
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as { data?: { id?: string } };

  return payload.data?.id ?? null;
}

type ReferenceItem = {
  code: string;
  id: string;
  label: string;
};

async function fetchReferenceItems(endpoint: string): Promise<ReferenceItem[]> {
  const response = await fetch(endpoint, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) {
    return [];
  }

  const payload = (await response.json()) as { data?: ReferenceItem[] };

  return payload.data ?? [];
}

async function upsertOwnerAnimalMedicalRecord(
  animalId: string,
  animal: OwnerAnimalDraft,
) {
  await fetch(`/api/animals/${animalId}/medical-record`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      careProtocol: animal.healthNotes || null,
      confidentialInstructions: animal.healthDocumentName
        ? `Carnet de santé fourni : ${animal.healthDocumentName}`
        : null,
      frequency: null,
    }),
  });
}

async function ensureOwnerProfile(input: {
  addressLine1?: string;
  firstName: string;
  city: string;
  postalCode: string;
}) {
  const response = await fetch("/api/profiles/owner", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      firstName: input.firstName,
      addressLine1: input.addressLine1 || null,
      city: input.city,
      postalCode: input.postalCode || null,
      country: "France",
    }),
  });

  if (response.ok || response.status === 409) {
    return;
  }

  const payload = (await response.json()) as ApiFailure;
  throw new Error(
    payload.error?.message ?? "Impossible de créer le profil propriétaire.",
  );
}

type ApiFailure = {
  error?: {
    message?: string;
  } | null;
};

function isAuthRateLimitError(error: {
  message?: string | undefined;
  status?: number | undefined;
}) {
  const message = error.message?.toLowerCase() ?? "";

  return error.status === 429 || message.includes("rate limit");
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Une erreur est survenue.";
}
