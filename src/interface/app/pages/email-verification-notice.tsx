"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "@/shared/supabase/browser-client";

type EmailVerificationNoticeProps = {
  email: string;
  onVerified: () => Promise<void> | void;
};

type VerificationState = "checking" | "waiting" | "verified" | "error";

export function EmailVerificationNotice({
  email,
  onVerified,
}: EmailVerificationNoticeProps) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const hasCompletedRef = useRef(false);
  const [state, setState] = useState<VerificationState>("checking");
  const [message, setMessage] = useState(
    "On vérifie automatiquement la validation de ton email.",
  );

  useEffect(() => {
    let isMounted = true;

    async function runAutomaticCheck() {
      const result = await resolveEmailVerification(supabase, email);

      if (!isMounted) {
        return;
      }

      if (result.verified) {
        setState("verified");
        setMessage("Email validé, on prépare la suite.");
        await completeOnce();
        return;
      }

      setState("waiting");
      setMessage("Garde cette page ouverte, on détecte la validation automatiquement.");
    }

    const completeOnce = async () => {
      if (hasCompletedRef.current) {
        return;
      }

      hasCompletedRef.current = true;
      await onVerified();
    };

    void runAutomaticCheck();

    const intervalId = window.setInterval(() => {
      void runAutomaticCheck();
    }, 3000);

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void runAutomaticCheck();
    });

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
      subscription.unsubscribe();
    };
  }, [email, onVerified, supabase]);

  async function handleManualCheck() {
    setState("checking");
    setMessage("Vérification en cours...");

    const result = await resolveEmailVerification(supabase, email);

    if (result.verified) {
      setState("verified");
      setMessage("Email validé, on prépare la suite.");

      if (!hasCompletedRef.current) {
        hasCompletedRef.current = true;
        await onVerified();
      }

      return;
    }

    setState("error");
    setMessage(
      "On n’a pas encore détecté de validation mail. Clique bien sur le lien reçu par email, puis reviens ici.",
    );
  }

  return (
    <div
      className="register-email-verification"
      role="status"
      aria-live="polite"
    >
      <p className="section-kicker">Dernière étape</p>
      <h2>Valide ton adresse mail</h2>
      <p>
        On vient d’envoyer un lien de confirmation à <strong>{email}</strong>.
        Clique dessus pour activer ton compte MamiPet.
      </p>
      <p>{message}</p>
      <button
        className="register-submit"
        type="button"
        disabled={state === "checking" || state === "verified"}
        onClick={() => {
          void handleManualCheck();
        }}
      >
        {state === "checking" ? "Vérification..." : "J’ai validé mon email"}
      </button>
    </div>
  );
}

async function resolveEmailVerification(
  supabase: ReturnType<typeof createSupabaseBrowserClient>,
  expectedEmail: string,
): Promise<{ verified: boolean; session: Session | null }> {
  await exchangeEmailCodeFromUrl(supabase);

  const { data } = await supabase.auth.getSession();
  const session = data.session;
  const user = session?.user;

  if (!user?.email || user.email.toLowerCase() !== expectedEmail.toLowerCase()) {
    return { verified: false, session };
  }

  return {
    verified: Boolean(session),
    session,
  };
}

async function exchangeEmailCodeFromUrl(
  supabase: ReturnType<typeof createSupabaseBrowserClient>,
) {
  const url = new URL(window.location.href);
  const code = url.searchParams.get("code");

  if (!code) {
    return;
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (!error) {
    url.searchParams.delete("code");
    window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
  }
}
