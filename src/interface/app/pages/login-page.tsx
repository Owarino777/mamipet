"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthBackButton } from "@/interface/shared/auth-back-button";
import { createSupabaseBrowserClient } from "@/shared/supabase/browser-client";
import { navigateBack } from "@/interface/app/connected/navigation";
import {
  completeLocalDevFixtureLogin,
  completeLocalLogin,
  resolveDashboardRoute,
} from "@/interface/app/connected/workspace-session";
import { getErrorMessage } from "@/interface/app/connected/workspace-formatters";

export function LoginPage() {
  const router = useRouter();

  const [mode, setMode] = useState<"choice" | "login">("choice");

  const [loginError, setLoginError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <main className="login-screen">
      <AuthBackButton onClick={() => navigateBack(router, "/")} />
      <div className="login-device-notch" aria-hidden="true" />
      <section className="login-panel" aria-labelledby="login-title">
        <Link
          className="login-logo"
          href="/"
          aria-label="Accueil MamiPet"
          id="login-title"
        >
          <Image
            alt=""
            height={294}
            priority
            src="/figma/login-logo-mamipet.avif"
            width={294}
          />
        </Link>

        <div
          className={
            mode === "choice"
              ? "login-action-card"
              : "login-action-card login-action-card--form"
          }
        >
          {mode === "choice" ? (
            <>
              <Link className="login-primary-action" href="/register">
                S&rsquo;inscrire
              </Link>

              <button
                className="login-secondary-action"
                type="button"
                onClick={() => {
                  setLoginError(null);

                  setMode("login");
                }}
              >
                Se Connecter
              </button>

              <button className="login-forgot-action" type="button">
                Mot de passe oublié ?
              </button>
            </>
          ) : (
            <form
              className="login-form"
              onSubmit={async (event) => {
                event.preventDefault();

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
                    const fixtureRoute = completeLocalDevFixtureLogin({
                      email,
                      password,
                    });

                    if (fixtureRoute) {
                      router.push(fixtureRoute);

                      return;
                    }

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

                  router.push(dashboardRoute);

                  return;
                } catch (error) {
                  const fixtureRoute = completeLocalDevFixtureLogin({
                    email,
                    password,
                  });

                  if (fixtureRoute) {
                    router.push(fixtureRoute);

                    return;
                  }

                  setLoginError(getErrorMessage(error));
                } finally {
                  setIsSubmitting(false);
                }
              }}
            >
              <label>
                Email
                <input
                  autoComplete="email"
                  name="email"
                  placeholder="Ex. camille@example.com"
                  type="email"
                />
              </label>

              <label>
                Mot de passe
                <input
                  autoComplete="current-password"
                  name="password"
                  placeholder="Ex. votre mot de passe"
                  type="password"
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
                <p className="workspace-status">{loginError}</p>
              ) : null}

              <button
                className="login-forgot-action"
                type="button"
                onClick={() => setMode("choice")}
              >
                Retour
              </button>
            </form>
          )}

          <Link className="login-close-action" href="/" aria-label="Fermer">
            <span aria-hidden="true" />
          </Link>
        </div>
      </section>
    </main>
  );
}
