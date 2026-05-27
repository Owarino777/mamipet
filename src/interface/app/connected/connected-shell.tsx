"use client";

import Link from "next/link";
import type React from "react";
import { useEffect } from "react";
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

  const router = useRouter();

  const links = getConnectedLinks(session, role);

  const sessionActiveRole = session?.activeRole;

  const sessionEnabledRolesKey = session?.enabledRoles?.join("|") ?? "";

  useEffect(() => {
    let isMounted = true;

    const supabase = createSupabaseBrowserClient();

    const renderedRole = getWorkspaceKindFromRoleLabel(role);

    const isPetSitterActivationPage =
      renderedRole === "petSitter" && active === "Tests & profil";

    if (session?.source === "local" && isPetSitterActivationPage) {
      if (!sessionEnabledRolesKey.split("|").includes("petSitter")) {
        activateDemoSessionRole("petSitter");
      } else if (sessionActiveRole !== "petSitter") {
        switchDemoSessionRole("petSitter");
      }

      return;
    }

    if (
      session?.source === "local" &&
      sessionEnabledRolesKey.split("|").includes(renderedRole)
    ) {
      if (sessionActiveRole !== renderedRole) {
        switchDemoSessionRole(renderedRole);
      }

      return;
    }

    void supabase.auth

      .getUser()

      .then(async ({ data }) => {
        const user = data.user;

        if (!isMounted || !user?.email) {
          return;
        }

        const sessionProfile = await resolveSessionProfile(renderedRole);

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
          session.route === nextSession.route
        ) {
          return;
        }

        setLocalDemoSession(nextSession);

        demoWorkspaceActions.ensureWorkspaceForCurrentSession();
      })

      .catch(() => {
        // Connected demo state remains usable when Supabase is unavailable locally.
      });

    return () => {
      isMounted = false;
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

        <nav aria-label="Navigation espace connecté">
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

        {session ? (
          <div className="connected-sidebar-actions">
            <button
              className="secondary-button"
              type="button"
              onClick={() => demoWorkspaceActions.reset()}
            >
              Réinitialiser l&apos;espace
            </button>

            <button
              className="ghost-button"
              type="button"
              onClick={() => {
                const supabase = createSupabaseBrowserClient();

                void supabase.auth.signOut();

                clearDemoSession();

                router.push("/login");
              }}
            >
              Déconnexion
            </button>
          </div>
        ) : null}
      </aside>

      {children}
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

  return (
    <ConnectedShell role={session.roleLabel} active="Tableau de bord">
      <main className="workspace-main">
        <section className="workspace-card workspace-empty-state">
          <p className="section-kicker">Accès non actif</p>

          <h1>{getWorkspaceAccessTitle(expectedRole)}</h1>

          <p>
            Votre session actuelle est un espace {session.roleLabel}. Pour
            garder une séparation claire des rôles, MamiPet ne mélange pas les
            données propriétaire, pet-sitter et administration dans le même
            dashboard.
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
                ? "Passer les tests pet-sitter"
                : "Activer ce rôle sur mon compte"}
            </button>
          ) : null}

          <ButtonLink href={currentRoute} variant="secondary">
            Revenir à mon espace
          </ButtonLink>
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
    return [["Tableau de bord", "/admin/dashboard"]];
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
