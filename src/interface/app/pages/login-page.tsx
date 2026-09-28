"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthBackButton } from "@/interface/shared/auth-back-button";
import { createSupabaseBrowserClient } from "@/shared/supabase/browser-client";
import { navigateBack } from "@/interface/app/connected/navigation";
import {
  completeLocalLogin,
  resolveDashboardRoute,
} from "@/interface/app/connected/workspace-session";
import { getErrorMessage } from "@/interface/app/connected/workspace-formatters";
import { safeReturnPath } from "@/shared/auth/safe-return-path";
import { PasswordRecoveryForm } from "./password-recovery-form";

export function LoginPage() {
  const router = useRouter();

  const [mode, setMode] = useState<"login" | "recovery">("login");

  const [loginError, setLoginError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <main className="login-screen">
      <AuthBackButton onClick={() => navigateBack(router, "/")} />
      <section className="login-panel" aria-label="Accès au compte MamiPet">
        <Link
          className="login-logo"
          href="/"
          aria-label="Accueil MamiPet"
        >
          <Image
            alt=""
            height={294}
            priority
            src="/figma/login-logo-mamipet.avif"
            width={294}
          />
        </Link>

        <div className="login-action-card login-action-card--form">
          {mode === "recovery" ? <PasswordRecoveryForm onBack={() => setMode("login")} /> : (
            <form
              className="login-form"
              onSubmit={async (event) => {
                event.preventDefault();
                if (isSubmitting) return;

                const formData = new FormData(event.currentTarget);

                const email = String(formData.get("email") ?? "")
                  .trim()
                  .toLowerCase();

                const password = String(formData.get("password") ?? "");

                if (!email || !password) {
                  setLoginError("Renseigne ton email et ton mot de passe.");

                  return;
                }

                setIsSubmitting(true);

                setLoginError(null);

                try {
                  const supabase = createSupabaseBrowserClient();

                  const { error } = await supabase.auth.signInWithPassword({
                    email,

                    password,
                  });

                  if (error) {
                    setLoginError(error.message);

                    return;
                  }

                  const dashboardRoute = await resolveDashboardRoute();

                  const { data } = await supabase.auth.getUser();

                  completeLocalLogin({
                    email,

                    metadata: data.user?.user_metadata,

                    route: dashboardRoute,
                  });

                  router.push(safeReturnPath(new URL(window.location.href).searchParams.get("next"), dashboardRoute));
                  router.refresh();

                  return;
                } catch (error) {
                  setLoginError(getErrorMessage(error));
                } finally {
                  setIsSubmitting(false);
                }
              }}
            >
              <h1 id="login-title">Connexion</h1>
              <label>
                Email
                <input
                  autoComplete="email"
                  name="email"
                  placeholder="Ex. camille@example.com"
                  type="email"
                  required
                />
              </label>

              <label>
                Mot de passe
                <input
                  autoComplete="current-password"
                  name="password"
                  placeholder="Ex. votre mot de passe"
                  type="password"
                  required
                />
              </label>

              <button
                className="login-primary-action"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Connexion..." : "Se connecter"}
              </button>

              {loginError ? (
                <p className="workspace-status" role="alert">{loginError}</p>
              ) : null}

              <div className="login-form-links">
                <button
                  className="login-forgot-action"
                  type="button"
                  onClick={() => setMode("recovery")}
                >
                  Mot de passe oublié ?
                </button>
                <Link href="/register">Créer un compte</Link>
              </div>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}
