"use client";

import Link from "next/link";
import type React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  activateDemoSessionRole,
  clearDemoSession,
  ConnectedShellIdentity,
  setLocalDemoSession,
  switchDemoSessionRole,
  useDemoSession,
} from "@/interface/shared/demo-session-client";
import { demoWorkspaceActions } from "@/interface/shared/demo-workspace-client";
import { ButtonLink } from "@/interface/shared/product-ui";
import { createSupabaseBrowserClient } from "@/shared/supabase/browser-client";
import {
  buildLocalSessionId,
  getDefaultWorkspaceRoute,
  getDisplayNameFromAuth,
  getRoleLabelFromWorkspaceKind,
  getShortRoleLabel,
  getWorkspaceAccessTitle,
  getWorkspaceKindFromRoleLabel,
  hasWorkspaceAccess,
  isPetSitterProfilePublished,
  resolveSessionProfile,
  type WorkspaceKind,
} from "@/interface/app/connected/workspace-session";

export function ConnectedShell({
  role,

  active,

  children,
}: {
  role: string;

  active: string;

  children: React.ReactNode;
}) {
  const session = useDemoSession();
  const [sessionError, setSessionError] = useState("");
  const [verified, setVerified] = useState(false);

  const router = useRouter();

  const links = getConnectedLinks(session, role);

  const sessionActiveRole = session?.activeRole;

  const sessionEnabledRolesKey = session?.enabledRoles?.join("|") ?? "";

  function handleSignOut() {
    const supabase = createSupabaseBrowserClient();
    void supabase.auth.signOut();
    clearDemoSession();
    router.push("/login");
  }

  useEffect(() => {
    let isMounted = true;

    const supabase = createSupabaseBrowserClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") { setVerified(false); clearDemoSession(); router.replace("/login"); router.refresh(); }
    });

    const renderedRole = getWorkspaceKindFromRoleLabel(role);

    void supabase.auth

      .getUser()

      .then(async ({ data }) => {
        const user = data.user;

        if (!isMounted) return;
        if (!user?.email) { clearDemoSession(); router.replace("/login"); return; }

        const sessionProfile = await resolveSessionProfile(renderedRole);
        if (!isMounted) return;
        setVerified(true);
        setSessionError("");

        const roleKind = sessionProfile.activeRole;

        const nextSession = {
          activeRole: roleKind,

          enabledRoles: sessionProfile.enabledRoles,

          id: buildLocalSessionId(roleKind, user.email),

          name: getDisplayNameFromAuth(user.email, user.user_metadata),

          roleLabel: getRoleLabelFromWorkspaceKind(roleKind),

          route: getDefaultWorkspaceRoute(roleKind),
        };

        if (
          session?.source === "local" &&
          session.id === nextSession.id &&
          session.name === nextSession.name &&
          session.route === nextSession.route &&
          sessionEnabledRolesKey === nextSession.enabledRoles.join("|")
        ) {
          return;
        }

        setLocalDemoSession(nextSession);

        demoWorkspaceActions.ensureWorkspaceForCurrentSession();
      })

      .catch(() => {
        if (isMounted) { setVerified(false); setSessionError("Impossible de vérifier votre session. Rechargez la page pour réessayer."); }
      });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [
    active,

    role,

    sessionActiveRole,

    sessionEnabledRolesKey,

    session?.id,

    session?.name,

    session?.route,

    session?.source,
    router,
  ]);

  return (
    <div className="connected-shell">
      <aside className="connected-sidebar">
        <Link className="brand-mark" href="/">
          <span className="brand-symbol" aria-hidden="true">
            M
          </span>

          <span>
            Mami<span>Pet</span>
          </span>
        </Link>

        <ConnectedShellIdentity workspaceRole={role} />

        {session && (session.enabledRoles?.length ?? 0) > 1 ? (
          <div
            className="connected-role-switcher"
            aria-label="Changer de profil actif"
          >
            {session.enabledRoles?.map((enabledRole) => (
              <button
                className={
                  session.activeRole === enabledRole
                    ? "connected-role-switcher__button connected-role-switcher__button--active"
                    : "connected-role-switcher__button"
                }
                type="button"
                key={enabledRole}
                onClick={() => {
                  switchDemoSessionRole(enabledRole);

                  router.push(getDefaultWorkspaceRoute(enabledRole));
                }}
              >
                {getShortRoleLabel(enabledRole)}
              </button>
            ))}
          </div>
        ) : null}

        <nav className="connected-desktop-nav" aria-label="Navigation espace connecté">
          {links.map(([label, href]) => (
            <Link
              className={active === label ? "active" : ""}
              href={href}
              key={href}
            >
              {label}
            </Link>
          ))}
        </nav>

        <details className="connected-mobile-nav">
          <summary><span>{active}</span><span>Menu</span></summary>
          <nav aria-label="Navigation espace connecté">
            {links.map(([label, href]) => (
              <Link className={active === label ? "active" : ""} href={href} key={href}>
                {label}
              </Link>
            ))}
          </nav>
          {session ? <ConnectedAccountActions active={active} onSignOut={handleSignOut} /> : null}
        </details>

        {session ? <div className="connected-desktop-actions"><ConnectedAccountActions active={active} onSignOut={handleSignOut} /></div> : null}
      </aside>

      {verified && !sessionError ? children : <main className="workspace-main"><p role={sessionError ? "alert" : "status"}>{sessionError || "Vérification de votre session…"}</p></main>}
    </div>
  );
}

function ConnectedAccountActions({ active, onSignOut }: { active: string; onSignOut: () => void }) {
  return (
    <div className="connected-sidebar-actions">
      {active !== "Articles" ? <button className="secondary-button" type="button" onClick={() => {
        if (window.confirm("Réinitialiser les données de cet espace ?")) demoWorkspaceActions.reset();
      }}>Réinitialiser l&apos;espace</button> : null}
      <button className="ghost-button" type="button" onClick={onSignOut}>Déconnexion</button>
    </div>
  );
}

export function useRoleAccess(
  expectedRole: WorkspaceKind,
): React.ReactNode | null {
  const session = useDemoSession();

  const router = useRouter();

  if (!session || hasWorkspaceAccess(session, expectedRole)) {
    return null;
  }

  const currentRole = getWorkspaceKindFromRoleLabel(session.roleLabel);

  const currentRoute = getDefaultWorkspaceRoute(currentRole);
  const needsPetSitterActivation = expectedRole === "petSitter" &&
    session.enabledRoles?.includes("petSitter") &&
    !isPetSitterProfilePublished(session);

  return (
    <ConnectedShell role={session.roleLabel} active="Tableau de bord">
      <main className="workspace-main">
        <section className="workspace-card workspace-empty-state">
          <p className="section-kicker">{needsPetSitterActivation ? "Profil à activer" : "Accès non actif"}</p>

          <h1>{needsPetSitterActivation ? "Terminez votre profil pet-sitter" : getWorkspaceAccessTitle(expectedRole)}</h1>

          <p>
            {needsPetSitterActivation
              ? "Choisissez vos gardes et terminez les étapes de validation pour accéder à votre espace."
              : `Ce compte utilise actuellement l’espace ${session.roleLabel}. Activez le rôle requis pour continuer.`}
          </p>

          {expectedRole !== "admin" ? (
            <button
              className="primary-button"
              type="button"
              onClick={() => {
                if (expectedRole === "petSitter") {
                  router.push("/pet-sitter/onboarding");

                  return;
                }

                activateDemoSessionRole(expectedRole);

                router.push(getDefaultWorkspaceRoute(expectedRole));
              }}
            >
              {expectedRole === "petSitter"
                ? "Configurer mon profil"
                : "Activer ce rôle sur mon compte"}
            </button>
          ) : null}

          {currentRoute !== getDefaultWorkspaceRoute(expectedRole) ? (
            <ButtonLink href={currentRoute} variant="secondary">Revenir à mon espace</ButtonLink>
          ) : null}
        </section>
      </main>
    </ConnectedShell>
  );
}

function getConnectedLinks(
  session: ReturnType<typeof useDemoSession>,

  fallbackRole: string,
): Array<[string, string]> {
  const workspaceKind = session
    ? (session.activeRole ?? getWorkspaceKindFromRoleLabel(session.roleLabel))
    : getWorkspaceKindFromRoleLabel(fallbackRole);

  const enabledRoles = session?.enabledRoles ?? [];

  if (workspaceKind === "admin") {
    return [["Tableau de bord", "/admin/dashboard"], ["Articles", "/admin/blog"]];
  }

  if (workspaceKind === "petSitter") {
    const links: Array<[string, string]> = [
      ["Tableau de bord", "/pet-sitter/dashboard"],

      ["Tests & profil", "/pet-sitter/onboarding"],

      ["Recherche", "/pet-sitters"],
    ];

    if (!enabledRoles.includes("owner")) {
      links.push(["Activer propriétaire", "/owner/animals"]);
    }

    return links;
  }

  const links: Array<[string, string]> = [
    ["Tableau de bord", "/dashboard"],

    ["Mes animaux", "/owner/animals"],

    ["Recherche", "/pet-sitters"],

    ["Réservation", "/reservations/new"],
  ];

  if (!isPetSitterProfilePublished(session)) {
    links.push([
      enabledRoles.includes("petSitter")
        ? "Finaliser profil pet-sitter"
        : "Devenir pet-sitter",

      "/pet-sitter/onboarding",
    ]);
  }

  return links;
}
