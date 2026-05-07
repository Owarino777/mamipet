"use client";

import Link from "next/link";
import type React from "react";
import { useSyncExternalStore } from "react";

export type DemoSessionRole = "owner" | "petSitter" | "admin";

export type DemoSession = {
  activeRole?: DemoSessionRole;
  enabledRoles?: DemoSessionRole[];
  id: string;
  name: string;
  petSitterProfileStatus?: "draft" | "published";
  petSitterValidatedTests?: string[];
  roleLabel: string;
  route: string;
  source?: "fixture" | "local";
};

export const demoSessionStorageKey = "mamipet.demoSession";

export const demoSessions: Record<string, DemoSession> = {
  owner: {
    activeRole: "owner",
    enabledRoles: ["owner"],
    id: "owner",
    name: "Olivia Carter",
    roleLabel: "Propriétaire",
    route: "/dashboard",
    source: "fixture",
  },
  petSitter: {
    activeRole: "petSitter",
    enabledRoles: ["petSitter"],
    id: "petSitter",
    name: "Sarah Johnson",
    petSitterProfileStatus: "published",
    petSitterValidatedTests: ["dogs", "cats", "senior"],
    roleLabel: "Pet-sitter",
    route: "/pet-sitter/dashboard",
    source: "fixture",
  },
  admin: {
    activeRole: "admin",
    enabledRoles: ["admin"],
    id: "admin",
    name: "Admin MamiPet",
    roleLabel: "Administration",
    route: "/admin/dashboard",
    source: "fixture",
  },
};

export function setDemoSessionById(sessionId: keyof typeof demoSessions) {
  window.localStorage.setItem(
    demoSessionStorageKey,
    JSON.stringify(demoSessions[sessionId]),
  );
  window.dispatchEvent(new Event("mamipet-demo-session"));
}

export function setLocalDemoSession(session: {
  activeRole?: DemoSessionRole;
  enabledRoles?: DemoSessionRole[];
  id: string;
  name: string;
  petSitterProfileStatus?: DemoSession["petSitterProfileStatus"];
  petSitterValidatedTests?: string[];
  roleLabel: string;
  route: string;
}) {
  const activeRole = session.activeRole ?? getRoleFromLabel(session.roleLabel);
  const enabledRoles = session.enabledRoles ?? [activeRole];

  window.localStorage.setItem(
    demoSessionStorageKey,
    JSON.stringify({
      ...session,
      activeRole,
      enabledRoles,
      petSitterProfileStatus:
        session.petSitterProfileStatus ??
        (activeRole === "petSitter" ? "draft" : undefined),
      petSitterValidatedTests: session.petSitterValidatedTests ?? [],
      source: "local" satisfies DemoSession["source"],
    }),
  );
  window.dispatchEvent(new Event("mamipet-demo-session"));
}

export function switchDemoSessionRole(role: DemoSessionRole) {
  const session = parseDemoSession(window.localStorage.getItem(demoSessionStorageKey) ?? "");

  if (!session || !session.enabledRoles?.includes(role)) {
    return;
  }

  window.localStorage.setItem(
    demoSessionStorageKey,
    JSON.stringify({
      ...session,
      activeRole: role,
      roleLabel: getRoleLabel(role),
      route: getRouteForRole(role),
    }),
  );
  window.dispatchEvent(new Event("mamipet-demo-session"));
}

export function activateDemoSessionRole(role: DemoSessionRole) {
  const session = parseDemoSession(window.localStorage.getItem(demoSessionStorageKey) ?? "");

  if (!session) {
    return;
  }

  const enabledRoles = Array.from(new Set([...(session.enabledRoles ?? []), role]));

  window.localStorage.setItem(
    demoSessionStorageKey,
    JSON.stringify({
      ...session,
      activeRole: role,
      enabledRoles,
      roleLabel: getRoleLabel(role),
      route: getRouteForRole(role),
    }),
  );
  window.dispatchEvent(new Event("mamipet-demo-session"));
}

export function publishDemoPetSitterProfile(validatedTests: string[]) {
  const session = parseDemoSession(window.localStorage.getItem(demoSessionStorageKey) ?? "");

  if (!session) {
    return;
  }

  const enabledRoles = Array.from(new Set([...(session.enabledRoles ?? []), "petSitter"]));

  window.localStorage.setItem(
    demoSessionStorageKey,
    JSON.stringify({
      ...session,
      activeRole: "petSitter",
      enabledRoles,
      petSitterProfileStatus: "published",
      petSitterValidatedTests: Array.from(new Set(validatedTests)),
      roleLabel: getRoleLabel("petSitter"),
      route: getRouteForRole("petSitter"),
    }),
  );
  window.dispatchEvent(new Event("mamipet-demo-session"));
}

export function clearDemoSession() {
  window.localStorage.removeItem(demoSessionStorageKey);
  window.dispatchEvent(new Event("mamipet-demo-session"));
}

export function useDemoSession() {
  const sessionSnapshot = useSyncExternalStore(
    subscribeToDemoSession,
    getDemoSessionSnapshot,
    () => "",
  );

  return parseDemoSession(sessionSnapshot);
}

export function DemoSessionHeaderAction() {
  const session = useDemoSession();

  if (!session) {
    return (
      <Link className="ghost-button" href="/login">
        Connexion
      </Link>
    );
  }

  return (
    <div className="demo-session-pill">
      <Link href={session.route}>
        <span>{session.name}</span>
        <small>{session.roleLabel}</small>
      </Link>
      <button
        type="button"
        onClick={() => {
          clearDemoSession();
        }}
      >
        Déconnexion
      </button>
    </div>
  );
}

export function DemoSessionGreeting({
  fallbackName,
  className,
}: {
  fallbackName: string;
  className?: string;
}) {
  const session = useDemoSession();
  const firstName = session ? getFirstName(session.name) : fallbackName;

  return <p className={className}>Bonjour {firstName}</p>;
}

export function ConnectedShellIdentity({
  workspaceRole,
}: {
  workspaceRole: string;
}) {
  const session = useDemoSession();

  if (!session) {
    return <p>{workspaceRole}</p>;
  }

  return (
    <p className="connected-identity">
      <span>{session.name}</span>
      <small>{session.roleLabel} · espace {workspaceRole}</small>
    </p>
  );
}

export function DemoSessionLink({
  sessionId,
  href,
  children,
  className,
}: {
  sessionId: keyof typeof demoSessions;
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      className={className}
      href={href}
      onClick={() => {
        setDemoSessionById(sessionId);
      }}
    >
      {children}
    </Link>
  );
}

function getFirstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? name;
}

function getRoleFromLabel(roleLabel: string): DemoSessionRole {
  const normalizedRole = roleLabel.toLowerCase();

  if (normalizedRole.includes("admin")) {
    return "admin";
  }

  if (normalizedRole.includes("pet-sitter")) {
    return "petSitter";
  }

  return "owner";
}

function getRoleLabel(role: DemoSessionRole): string {
  if (role === "admin") {
    return "Administration";
  }

  if (role === "petSitter") {
    return "Pet-sitter";
  }

  return "Propriétaire";
}

function getRouteForRole(role: DemoSessionRole): string {
  if (role === "admin") {
    return "/admin/dashboard";
  }

  if (role === "petSitter") {
    return "/pet-sitter/dashboard";
  }

  return "/dashboard";
}

function subscribeToDemoSession(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener("mamipet-demo-session", onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener("mamipet-demo-session", onStoreChange);
  };
}

function getDemoSessionSnapshot(): string {
  return window.localStorage.getItem(demoSessionStorageKey) ?? "";
}

function parseDemoSession(rawSession: string): DemoSession | null {
  try {
    if (!rawSession) {
      return null;
    }

    const parsedSession = JSON.parse(rawSession) as Partial<DemoSession>;

    if (
      typeof parsedSession.id !== "string" ||
      typeof parsedSession.name !== "string" ||
      typeof parsedSession.roleLabel !== "string" ||
      typeof parsedSession.route !== "string"
    ) {
      return null;
    }

    const role = parsedSession.activeRole ?? getRoleFromLabel(parsedSession.roleLabel);

    const source = parsedSession.source === "fixture" ? "fixture" : "local";
    const enabledRoles =
      Array.isArray(parsedSession.enabledRoles) && parsedSession.enabledRoles.length > 0
        ? parsedSession.enabledRoles
        : [role];

    return {
      ...parsedSession,
      activeRole: role,
      enabledRoles,
      petSitterProfileStatus:
        parsedSession.petSitterProfileStatus ??
        (source === "fixture" && enabledRoles.includes("petSitter")
          ? "published"
          : "draft"),
      petSitterValidatedTests: Array.isArray(parsedSession.petSitterValidatedTests)
        ? parsedSession.petSitterValidatedTests
        : [],
      source,
    } as DemoSession;
  } catch {
    return null;
  }
}
