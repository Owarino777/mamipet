"use client";
import { useState } from "react";
import { createSupabaseBrowserClient } from "@/shared/supabase/browser-client";

export function PasswordRecoveryForm({ onBack }: { onBack: () => void }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  return (
    <form
      className="login-form"
      onSubmit={async (event) => {
        event.preventDefault();
        if (busy) return;
        const email = String(
          new FormData(event.currentTarget).get("email") ?? "",
        )
          .trim()
          .toLowerCase();
        setBusy(true);
        setError("");
        setMessage("");
        try {
          const { error } =
            await createSupabaseBrowserClient().auth.resetPasswordForEmail(
              email,
              { redirectTo: `${window.location.origin}/auth/callback` },
            );
          if (error) throw error;
          setMessage(
            "Si un compte correspond à cette adresse, un lien de réinitialisation vous sera envoyé. Ouvrez-le dans ce navigateur.",
          );
        } catch {
          setError("L’envoi a échoué. Attendez un instant puis réessayez.");
        } finally {
          setBusy(false);
        }
      }}
    >
      <h1>Mot de passe oublié</h1>
      <label>
        Email
        <input type="email" name="email" autoComplete="email" required />
      </label>
      <button className="login-primary-action" type="submit" disabled={busy}>
        {busy ? "Envoi…" : "Recevoir le lien"}
      </button>
      {message ? (
        <p className="workspace-status" role="status">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="workspace-status" role="alert">
          {error}
        </p>
      ) : null}
      <button className="login-forgot-action" type="button" onClick={onBack}>
        Retour
      </button>
    </form>
  );
}
