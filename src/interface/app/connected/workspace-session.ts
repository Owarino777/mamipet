import {
  type DemoSessionRole,
  setDemoSessionById,
  setLocalDemoSession,
  type useDemoSession,
} from "@/interface/shared/demo-session-client";
import { demoWorkspaceActions } from "@/interface/shared/demo-workspace-client";

export type WorkspaceKind = DemoSessionRole;

type DemoSessionSnapshot = ReturnType<typeof useDemoSession>;

type SessionProfile = {
  activeRole: WorkspaceKind;
  enabledRoles: WorkspaceKind[];
};

type ApiFailure = {
  error?: {
    message?: string;
  } | null;
};

const devFixturePassword = "Mamipet2026!";

const devFixtureLogins: Record<
  string,
  {
    demoSessionId?: "admin" | "owner" | "petSitter";
    name: string;
    petSitterSubscriptionPlan?: "none" | "premium";
    petSitterValidatedTests?: string[];
    role: WorkspaceKind;
  }
> = {
  "admin@mamipet.test": {
    demoSessionId: "admin",
    name: "Admin MamiPet",
    role: "admin",
  },
  "amelie.sitter@mamipet.test": {
    name: "Amelie Bernard",
    petSitterSubscriptionPlan: "none",
    petSitterValidatedTests: ["dogs", "cats"],
    role: "petSitter",
  },
  "hugo.sitter@mamipet.test": {
    name: "Hugo Martin",
    petSitterSubscriptionPlan: "none",
    petSitterValidatedTests: ["dogs", "cats"],
    role: "petSitter",
  },
  "olivia.owner@mamipet.test": {
    demoSessionId: "owner",
    name: "Olivia Carter",
    role: "owner",
  },
  "sarah.sitter@mamipet.test": {
    demoSessionId: "petSitter",
    name: "Sarah Johnson",
    petSitterSubscriptionPlan: "premium",
    petSitterValidatedTests: ["dogs", "cats", "senior"],
    role: "petSitter",
  },
};

export function hasWorkspaceAccess(
  session: DemoSessionSnapshot,
  role: WorkspaceKind,
): boolean {
  if (!session?.enabledRoles?.includes(role)) {
    return false;
  }

  if (role === "petSitter") {
    return isPetSitterProfilePublished(session);
  }

  return true;
}

export function isPetSitterProfilePublished(
  session: DemoSessionSnapshot,
): boolean {
  return Boolean(
    session?.enabledRoles?.includes("petSitter") &&
    session.petSitterProfileStatus === "published",
  );
}

export function getWorkspaceKindFromRoleLabel(
  roleLabel: string,
): WorkspaceKind {
  const normalizedRole = roleLabel.toLowerCase();

  if (normalizedRole.includes("admin")) {
    return "admin";
  }

  if (normalizedRole.includes("pet-sitter")) {
    return "petSitter";
  }

  return "owner";
}

export function getDefaultWorkspaceRoute(role: WorkspaceKind): string {
  if (role === "admin") {
    return "/admin/dashboard";
  }

  if (role === "petSitter") {
    return "/pet-sitter/dashboard";
  }

  return "/dashboard";
}

export function getWorkspaceAccessTitle(expectedRole: WorkspaceKind): string {
  if (expectedRole === "admin") {
    return "Cet espace est réservé à l'administration.";
  }

  if (expectedRole === "petSitter") {
    return "Cet espace est réservé aux pet-sitters.";
  }

  return "Cet espace est réservé aux propriétaires.";
}

export async function resolveSessionProfile(
  preferredRole: WorkspaceKind,
): Promise<SessionProfile> {
  const response = await fetch("/api/me", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) {
    return {
      activeRole: preferredRole,
      enabledRoles: [preferredRole],
    };
  }

  const payload = (await response.json()) as {
    data?: {
      isAdmin: boolean;
      roles: {
        admin?: boolean;
        owner: boolean;
        petSitter: boolean;
      };
    };
  };
  const enabledRoles = getEnabledRolesFromApi(payload.data);

  if (enabledRoles.includes(preferredRole)) {
    return {
      activeRole: preferredRole,
      enabledRoles,
    };
  }

  return {
    activeRole: enabledRoles[0] ?? "owner",
    enabledRoles,
  };
}

function getEnabledRolesFromApi(
  data:
    | {
        isAdmin: boolean;
        roles: {
          admin?: boolean;
          owner: boolean;
          petSitter: boolean;
        };
      }
    | undefined,
): WorkspaceKind[] {
  if (!data) {
    return ["owner"];
  }

  if (data.roles.admin || data.isAdmin) {
    return ["admin"];
  }

  const roles: WorkspaceKind[] = [];

  if (data.roles.owner) {
    roles.push("owner");
  }

  if (data.roles.petSitter) {
    roles.push("petSitter");
  }

  return roles.length > 0 ? roles : ["owner"];
}

export function completeLocalRegistration(input: {
  email: string;
  firstName: string;
  role: "owner" | "petSitter";
}) {
  const roleKind: WorkspaceKind =
    input.role === "owner" ? "owner" : "petSitter";
  const route =
    roleKind === "petSitter" ? "/pet-sitter/onboarding" : "/dashboard";

  setLocalDemoSession({
    activeRole: roleKind,
    enabledRoles: [roleKind],
    id: buildLocalSessionId(roleKind, input.email),
    name: input.firstName,
    petSitterProfileStatus: roleKind === "petSitter" ? "draft" : undefined,
    roleLabel: getRoleLabelFromWorkspaceKind(roleKind),
    route,
  });
  demoWorkspaceActions.startEmptyWorkspace();
}

export function completeLocalLogin(input: {
  email: string;
  metadata: Record<string, unknown> | undefined;
  route: string;
}) {
  const roleKind = getWorkspaceKindFromRoute(input.route);
  const petSitterFixture = getPetSitterFixtureLoginState(input.email);

  setLocalDemoSession({
    activeRole: roleKind,
    enabledRoles: [roleKind],
    id: buildLocalSessionId(roleKind, input.email),
    name: getDisplayNameFromAuth(input.email, input.metadata),
    petSitterProfileStatus:
      roleKind === "petSitter" ? "published" : undefined,
    ...(petSitterFixture
      ? {
          petSitterSubscriptionPlan: petSitterFixture.subscriptionPlan,
          petSitterValidatedTests: petSitterFixture.validatedTests,
        }
      : {}),
    roleLabel: getRoleLabelFromWorkspaceKind(roleKind),
    route: input.route,
  });
  demoWorkspaceActions.ensureWorkspaceForCurrentSession();
}

export function completeLocalDevFixtureLogin(input: {
  email: string;
  password: string;
}): string | null {
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  const email = input.email.toLowerCase();
  const fixture = devFixtureLogins[email];

  if (!fixture || input.password !== devFixturePassword) {
    return null;
  }

  if (fixture.demoSessionId) {
    setDemoSessionById(fixture.demoSessionId);

    return getDefaultWorkspaceRoute(fixture.role);
  }

  const route = getDefaultWorkspaceRoute(fixture.role);

  setLocalDemoSession({
    activeRole: fixture.role,
    enabledRoles: [fixture.role],
    id: buildLocalSessionId(fixture.role, email),
    name: fixture.name,
    petSitterProfileStatus:
      fixture.role === "petSitter" ? "published" : undefined,
    ...(fixture.petSitterSubscriptionPlan
      ? {
          petSitterSubscriptionPlan: fixture.petSitterSubscriptionPlan,
        }
      : {}),
    ...(fixture.petSitterValidatedTests
      ? {
          petSitterValidatedTests: fixture.petSitterValidatedTests,
        }
      : {}),
    roleLabel: getRoleLabelFromWorkspaceKind(fixture.role),
    route,
  });
  demoWorkspaceActions.ensureWorkspaceForCurrentSession();

  return route;
}

function getPetSitterFixtureLoginState(email: string):
  | {
      subscriptionPlan: "none" | "premium";
      validatedTests: string[];
    }
  | undefined {
  const normalizedEmail = email.toLowerCase();

  if (normalizedEmail === "sarah.sitter@mamipet.test") {
    return {
      subscriptionPlan: "premium",
      validatedTests: ["dogs", "cats", "senior"],
    };
  }

  if (
    normalizedEmail === "amelie.sitter@mamipet.test" ||
    normalizedEmail === "hugo.sitter@mamipet.test"
  ) {
    return {
      subscriptionPlan: "none",
      validatedTests: ["dogs", "cats"],
    };
  }

  return undefined;
}

export function buildLocalSessionId(
  role: WorkspaceKind,
  email: string,
): string {
  return `local-${role}-${email.toLowerCase()}`;
}

export function getWorkspaceKindFromRoute(route: string): WorkspaceKind {
  if (route.startsWith("/admin")) {
    return "admin";
  }

  if (route.startsWith("/pet-sitter")) {
    return "petSitter";
  }

  return "owner";
}

export function getRoleLabelFromWorkspaceKind(role: WorkspaceKind): string {
  if (role === "admin") {
    return "Administration";
  }

  if (role === "petSitter") {
    return "Pet-sitter";
  }

  return "Propriétaire";
}

export function getShortRoleLabel(role: WorkspaceKind): string {
  if (role === "admin") {
    return "Admin";
  }

  if (role === "petSitter") {
    return "Pet-sitter";
  }

  return "Propriétaire";
}

export function getDisplayNameFromAuth(
  email: string,
  metadata: Record<string, unknown> | undefined,
): string {
  const firstName = metadata?.firstName;
  const fullName = metadata?.full_name ?? metadata?.name;

  if (typeof firstName === "string" && firstName.trim()) {
    return firstName.trim();
  }

  if (typeof fullName === "string" && fullName.trim()) {
    return fullName.trim();
  }

  const emailName = email.split("@")[0] ?? "Compte MamiPet";

  return emailName
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function isAuthRateLimitError(error: {
  message?: string | undefined;
  status?: number | undefined;
}): boolean {
  const message = error.message?.toLowerCase() ?? "";

  return error.status === 429 || message.includes("rate limit");
}

export async function resolveDashboardRoute(): Promise<string> {
  const response = await fetch("/api/me", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) {
    return "/dashboard";
  }

  const payload = (await response.json()) as {
    data?: {
      isAdmin: boolean;
      roles: {
        owner: boolean;
        petSitter: boolean;
      };
    };
  };

  if (payload.data?.isAdmin) {
    return "/admin/dashboard";
  }

  if (payload.data?.roles.owner) {
    return "/dashboard";
  }

  if (payload.data?.roles.petSitter) {
    return "/pet-sitter/dashboard";
  }

  return "/dashboard";
}

export async function ensurePetSitterProfile(input: {
  firstName: string;
  city: string;
  postalCode: string;
}) {
  const response = await fetch("/api/profiles/pet-sitter", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      firstName: input.firstName,
      city: input.city,
      postalCode: input.postalCode || null,
      country: "France",
      basePriceCents: 2800,
      interventionRadiusKm: 15,
      publicVisibility: false,
      description: "Profil créé depuis le parcours d'inscription.",
    }),
  });

  if (response.ok || response.status === 409) {
    return;
  }

  const payload = (await response.json()) as ApiFailure;
  throw new Error(
    payload.error?.message ?? "Impossible de créer le profil pet-sitter.",
  );
}
