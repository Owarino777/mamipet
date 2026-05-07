"use client";

import Link from "next/link";
import type React from "react";
import { useSyncExternalStore } from "react";

export type DemoSession = {
  id: string;
  name: string;
  roleLabel: string;
  route: string;
};

const storageKey = "mamipet.demoSession";

export const demoSessions: Record<string, DemoSession> = {
  owner: {
    id: "owner",
    name: "Olivia Carter",
    roleLabel: "Propriétaire",
    route: "/dashboard",
  },
  petSitter: {
    id: "petSitter",
    name: "Sarah Johnson",
    roleLabel: "Pet-sitter",
    route: "/pet-sitter/dashboard",
  },
  admin: {
    id: "admin",
    name: "Admin MamiPet",
    roleLabel: "Administration",
    route: "/admin/dashboard",
  },
};

export function setDemoSessionById(sessionId: keyof typeof demoSessions) {
  window.localStorage.setItem(storageKey, JSON.stringify(demoSessions[sessionId]));
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
          window.localStorage.removeItem(storageKey);
          window.dispatchEvent(new Event("mamipet-demo-session"));
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

function subscribeToDemoSession(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener("mamipet-demo-session", onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener("mamipet-demo-session", onStoreChange);
  };
}

function getDemoSessionSnapshot(): string {
  return window.localStorage.getItem(storageKey) ?? "";
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

    return parsedSession as DemoSession;
  } catch {
    return null;
  }
}
