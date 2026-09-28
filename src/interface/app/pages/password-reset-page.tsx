"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { createSupabaseBrowserClient } from "@/shared/supabase/browser-client";
import { clearDemoSession } from "@/interface/shared/demo-session-client";

export function PasswordResetPage() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  return (
    <main className="login-screen">
      <section className="login-panel">
        <Link className="login-logo" href="/" aria-label="Accueil MamiPet">
          <Image
            src="/figma/login-logo-mamipet.avif"
            alt=""
            width={294}
            height={294}
            priority
          />
        </Link>
        <div className="login-action-card login-action-card--form">
          {done ? (
            <>
              <p role="status">Votre mot de passe a été modifié.</p>
              <Link className="login-primary-action" href="/login">
                Se connecter
              </Link>
            </>
          ) : (
            <form
              className="login-form"
              onSubmit={async (event) => {
                event.preventDefault();
                if (busy) return;
                const data = new FormData(event.currentTarget);
                const password = String(data.get("password") ?? "");
                if (
                  password.length < 12 ||
                  password !== data.get("confirmation")
                ) {
                  setError(
                    "Utilisez au moins 12 caractères et confirmez le même mot de passe.",
                  );
                  return;
                }
                setBusy(true);
                setError("");
                try {
                  const supabase = createSupabaseBrowserClient();
                  const { data: auth, error: authError } =
                    await supabase.auth.getUser();
                  if (
                    new URL(window.location.href).searchParams.has("error") ||
                    authError ||
                    !auth.user
                  )
                    throw new Error(
                      "Lien expiré ou invalide. Demandez un nouveau lien depuis la connexion.",
                    );
                  const { error: updateError } = await supabase.auth.updateUser(
                    { password },
                  );
                  if (updateError)
                    throw new Error(
                      "Le mot de passe n’a pas pu être modifié. Vérifiez les règles du compte et réessayez.",
                    );
                  await supabase.auth.signOut();
                  clearDemoSession();
                  setDone(true);
                } catch (reason) {
                  setError(
                    reason instanceof Error
                      ? reason.message
                      : "La modification a échoué.",
                  );
                } finally {
                  setBusy(false);
                }
              }}
            >
              <h1>Nouveau mot de passe</h1>
              <label>
                Mot de passe (12 caractères minimum)
                <input
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  minLength={12}
                  required
                />
              </label>
              <label>
                Confirmer le mot de passe
                <input
                  name="confirmation"
                  type="password"
                  autoComplete="new-password"
                  minLength={12}
                  required
                />
              </label>
              <button
                className="login-primary-action"
                type="submit"
                disabled={busy}
              >
                {busy ? "Enregistrement…" : "Enregistrer"}
              </button>
              {error ? (
                <p className="workspace-status" role="alert">
                  {error}
                </p>
              ) : null}
              <Link className="login-forgot-action" href="/login">
                Retour à la connexion
              </Link>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}
