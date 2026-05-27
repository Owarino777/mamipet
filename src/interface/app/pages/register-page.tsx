"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthBackButton } from "@/interface/shared/auth-back-button";
import {
  completeVerifiedOwnerRegistration,
  defaultOwnerPetImageUrl,
  OwnerRegistrationFlow,
  type OwnerAccountDraft,
  type OwnerAnimalDraft,
  type PendingOwnerRegistration,
  type OwnerRegistrationStep,
} from "@/interface/app/owner-registration-flow";
import { EmailVerificationNotice } from "@/interface/app/pages/email-verification-notice";
import { isLocalEmailVerificationBypassEnabled } from "@/shared/config/auth-public-env";
import { createSupabaseBrowserClient } from "@/shared/supabase/browser-client";
import { navigateBack } from "@/interface/app/connected/navigation";
import {
  completeLocalRegistration,
  ensurePetSitterProfile,
  isAuthRateLimitError,
} from "@/interface/app/connected/workspace-session";
import { getErrorMessage } from "@/interface/app/connected/workspace-formatters";

type PendingPetSitterRegistration = {
  city: string;
  email: string;
  firstName: string;
  postalCode: string;
  role: "petSitter";
};

type PendingEmailVerification =
  | PendingOwnerRegistration
  | PendingPetSitterRegistration;

export function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<"owner" | "petSitter">("petSitter");
  const [ownerStep, setOwnerStep] = useState<OwnerRegistrationStep>("account");
  const [ownerAccountDraft, setOwnerAccountDraft] =
    useState<OwnerAccountDraft | null>(null);
  const [ownerAnimalDraft, setOwnerAnimalDraft] =
    useState<OwnerAnimalDraft | null>(null);
  const [ownerPetImagePreview, setOwnerPetImagePreview] = useState(
    defaultOwnerPetImageUrl,
  );
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [registerSuccess, setRegisterSuccess] = useState<string | null>(null);
  const [pendingVerification, setPendingVerification] =
    useState<PendingEmailVerification | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const code = new URL(window.location.href).searchParams.get("code");

    if (!code) {
      return;
    }

    const supabase = createSupabaseBrowserClient();
    void supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
      if (error) {
        setRegisterError(error.message);
        return;
      }

      const url = new URL(window.location.href);
      url.searchParams.delete("code");
      window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
    });
  }, []);
  function selectRole(nextRole: "owner" | "petSitter") {
    setRole(nextRole);
    setOwnerStep("account");
    setPendingVerification(null);
    setRegisterError(null);
    setRegisterSuccess(null);
  }

  function showEmailVerificationNotice(verification: PendingEmailVerification) {
    setPendingVerification(verification);
    setRegisterError(null);
    setRegisterSuccess(null);
  }

  async function completeVerifiedRegistration(
    verification: PendingEmailVerification,
  ) {
    setIsSubmitting(true);
    setRegisterError(null);

    try {
      if (verification.role === "owner") {
        await completeVerifiedOwnerRegistration({
          account: verification.account,
          animal: verification.animal,
          onCompleteLocalRegistration: completeLocalRegistration,
          preferences: verification.preferences,
        });
        router.push("/pet-sitters");
        return;
      }

      completeLocalRegistration({
        email: verification.email,
        firstName: verification.firstName,
        role: "petSitter",
      });
      await ensurePetSitterProfile({
        city: verification.city,
        firstName: verification.firstName,
        postalCode: verification.postalCode,
      });
      router.push("/pet-sitter/onboarding");
    } catch (error) {
      setRegisterError(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  const isEmailVerificationPending = Boolean(pendingVerification);
  const isFocusedPanel =
    isEmailVerificationPending || (role === "owner" && ownerStep !== "account");

  const kinshipOptions =
    role === "petSitter"
      ? ["Mamipet", "Papipet", "Amipet"]
      : ["Maman", "Papa", "Ami"];

  return (
    <main className="register-screen">
      <AuthBackButton onClick={() => navigateBack(router, "/login")} />
      <div className="register-animal register-animal--left" aria-hidden="true">
        <Image
          alt=""
          fill
          sizes="(min-width: 1024px) 30vw, 0px"
          src="/figma/register-pet-left.avif"
        />
      </div>

      <div
        className="register-animal register-animal--right"
        aria-hidden="true"
      >
        <Image
          alt=""
          fill
          sizes="(min-width: 1024px) 30vw, 0px"
          src="/figma/register-pet-right.avif"
        />
      </div>

      <section
        className={`register-panel${isFocusedPanel ? " register-panel--focused" : ""}`}
        aria-labelledby="register-title"
      >
        {isFocusedPanel ? null : (
          <h1 id="register-title">
            Rejoindre
            <span>en tant que...</span>
          </h1>
        )}

        {isFocusedPanel ? null : (
          <div
            className="register-role-tabs"
            aria-label="Choisir un type de compte"
          >
            <button
              className={
                role === "petSitter"
                  ? "register-role-tab is-active"
                  : "register-role-tab"
              }
              type="button"
              aria-pressed={role === "petSitter"}
              onPointerDown={(event) => {
                event.preventDefault();

                selectRole("petSitter");
              }}
              onClick={() => selectRole("petSitter")}
            >
              Petsitter
            </button>

            <button
              className={
                role === "owner"
                  ? "register-role-tab is-active"
                  : "register-role-tab"
              }
              type="button"
              aria-pressed={role === "owner"}
              onPointerDown={(event) => {
                event.preventDefault();

                selectRole("owner");
              }}
              onClick={() => selectRole("owner")}
            >
              Propriétaire
            </button>
          </div>
        )}

        <section
          className={`register-card${
            isEmailVerificationPending
              ? " register-card--email-verification"
              : role === "owner"
                ? ` register-card--owner-${ownerStep}`
                : ""
          }`}
          key={pendingVerification ? "email-verification" : `${role}-${ownerStep}`}
        >
          {pendingVerification ? (
            <EmailVerificationNotice
              email={pendingVerification.email}
              onVerified={() => completeVerifiedRegistration(pendingVerification)}
            />
          ) : role === "owner" ? (
            <OwnerRegistrationFlow
              accountDraft={ownerAccountDraft}
              animalDraft={ownerAnimalDraft}
              imagePreview={ownerPetImagePreview}
              isSubmitting={isSubmitting}
              onAccountDraftChange={setOwnerAccountDraft}
              onAnimalDraftChange={setOwnerAnimalDraft}
              onCompleteLocalRegistration={completeLocalRegistration}
              onEmailVerificationRequired={showEmailVerificationNotice}
              onError={setRegisterError}
              onImagePreviewChange={setOwnerPetImagePreview}
              onNavigate={(href) => router.push(href)}
              onSubmittingChange={setIsSubmitting}
              onSuccess={setRegisterSuccess}
              onStepChange={setOwnerStep}
              step={ownerStep}
            />
          ) : (
            <form
              className="register-form"
              onSubmit={async (event) => {
                event.preventDefault();

                const formData = new FormData(event.currentTarget);

                const firstName = String(
                  formData.get("firstName") ?? "",
                ).trim();

                const lastName = String(formData.get("lastName") ?? "").trim();

                const email = String(formData.get("email") ?? "")
                  .trim()
                  .toLowerCase();

                const password = String(formData.get("password") ?? "");

                const age = String(formData.get("age") ?? "").trim();

                const city =
                  String(formData.get("city") ?? "").trim() || "Caen";

                const postalCode = String(
                  formData.get("postalCode") ?? "",
                ).trim();

                const identityKind = String(
                  formData.get("identityKind") ?? "",
                ).trim();

                setRegisterError(null);

                setRegisterSuccess(null);

                if (!firstName || !email || !password) {
                  setRegisterError(
                    "Prénom, email et mot de passe sont requis.",
                  );

                  return;
                }

                setIsSubmitting(true);

                try {
                  const supabase = createSupabaseBrowserClient();

                  const { data, error } = await supabase.auth.signUp({
                    email,

                    password,

                    options: {
                      emailRedirectTo: `${window.location.origin}/register`,
                      data: {
                        age,

                        firstName,

                        identityKind,

                        lastName,

                        postalCode,

                        role,

                        city,
                      },
                    },
                  });

                  if (error) {
                    if (isAuthRateLimitError(error)) {
                      completeLocalRegistration({
                        email,

                        firstName,

                        role,
                      });

                      router.push("/pet-sitter/onboarding");
                      return;
                    }

                    setRegisterError(error.message);

                    return;
                  }

                  if (isLocalEmailVerificationBypassEnabled()) {
                    completeLocalRegistration({
                      email,
                      firstName,
                      role,
                    });

                    if (data.session) {
                      await ensurePetSitterProfile({ firstName, city, postalCode });
                    }

                    router.push("/pet-sitter/onboarding");
                    return;
                  }

                  if (data.session) {
                    await supabase.auth.signOut();
                  }

                  showEmailVerificationNotice({
                    city,
                    email,
                    firstName,
                    postalCode,
                    role: "petSitter",
                  });
                  return;
                } catch (error) {
                  setRegisterError(getErrorMessage(error));
                } finally {
                  setIsSubmitting(false);
                }
              }}
            >
              <fieldset className="register-kind-fieldset">
                <legend>Je suis...</legend>

                <div className="register-kind-options">
                  {kinshipOptions.map((option, index) => (
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
                    required
                  />
                </label>

                <label>
                  Nom
                  <input
                    name="lastName"
                    type="text"
                    placeholder="Da Silva"
                    required
                  />
                </label>

                <label className="register-field-wide">
                  Adresse mail
                  <input
                    name="email"
                    type="email"
                    placeholder="margo.mamipet@gmail.com"
                    required
                  />
                </label>

                <label>
                  Âge
                  <input name="age" type="number" min="16" placeholder="24" />
                </label>

                <label>
                  Ville
                  <input name="city" type="text" placeholder="Caen" />
                </label>

                <label>
                  Code postale
                  <input
                    name="postalCode"
                    type="text"
                    inputMode="numeric"
                    placeholder="14000"
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

              <button
                className="register-submit"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? "Création en cours..."
                  : role === "petSitter"
                    ? "Devenir mamipet"
                    : "Créer mon compte"}
              </button>
            </form>
          )}
          {registerError ? (
            <p className="workspace-status">{registerError}</p>
          ) : null}

          {registerSuccess ? (
            <p className="workspace-status">{registerSuccess}</p>
          ) : null}
        </section>
      </section>
    </main>
  );
}
