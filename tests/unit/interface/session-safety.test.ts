import { afterEach, describe, expect, it, vi } from "vitest";
import {
  completeLocalDevFixtureLogin,
  resolveSessionProfile,
} from "@/interface/app/connected/workspace-session";
import { demoWorkspaceActions } from "@/interface/shared/demo-workspace-client";
import {
  initialDemoWorkspaceState,
  emptyDemoWorkspaceState,
} from "@/interface/shared/demo-workspace-state";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});
describe("workspace boundaries", () => {
  it("keeps demo fixture credentials on local development only", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("NEXT_PUBLIC_MAMIPET_DEV_FIXTURE_PASSWORD", "local-test-only");
    vi.stubGlobal("window", { location: { hostname: "example.test" } });
    const credentials = { email: "admin@mamipet.test", password: "local-test-only" };
    expect(completeLocalDevFixtureLogin(credentials)).toBeNull();

    vi.stubGlobal("window", { location: { hostname: "localhost" } });
    expect(completeLocalDevFixtureLogin({ ...credentials, password: "mamipet-local-fixture-only" }))
      .toBeNull();

    vi.stubEnv("NODE_ENV", "production");
    expect(completeLocalDevFixtureLogin(credentials)).toBeNull();
  });
  it("does not invent a role when the server refuses the session", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("{}", { status: 403 })),
    );
    await expect(resolveSessionProfile("admin")).rejects.toThrow();
  });
  it("does not turn a role-less account into an owner", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          Response.json({
            data: { isAdmin: false, roles: { owner: false, petSitter: false } },
          }),
        ),
    );
    expect((await resolveSessionProfile("owner")).enabledRoles).toEqual([]);
  });
  it("keeps local account bookings out of other users' browser workspaces", () => {
    const entries = new Map<string, string>();
    const storage = {
      getItem: (key: string) => entries.get(key) ?? null,
      setItem: (key: string, value: string) => entries.set(key, value),
      key: (index: number) => [...entries.keys()][index] ?? null,
      get length() {
        return entries.size;
      },
    };
    vi.stubGlobal("window", {
      localStorage: storage,
      dispatchEvent: () => true,
    });
    const foreignKey = "mamipet.demoWorkspaceState:fixture:petSitter";
    const currentKey = "mamipet.demoWorkspaceState:local:local-owner-account-a";
    storage.setItem(
      "mamipet.demoSession",
      JSON.stringify({
        id: "local-owner-account-a",
        name: "A",
        roleLabel: "Propriétaire",
        route: "/dashboard",
        enabledRoles: ["owner"],
        source: "local",
      }),
    );
    storage.setItem(currentKey, JSON.stringify(initialDemoWorkspaceState));
    storage.setItem(foreignKey, JSON.stringify(emptyDemoWorkspaceState));
    demoWorkspaceActions.createBooking({
      petIds: ["pet-luna"],
      petSitterId: "sarah-johnson",
      petSitterName: "Sarah J.",
      startDate: "2030-06-10",
      endDate: "2030-06-12",
      careType: "Garde",
      instructions: "Privé",
      baseAmountCents: 10800,
      insuranceLevel: "standard",
    });
    expect(storage.getItem(foreignKey)).toBe(
      JSON.stringify(emptyDemoWorkspaceState),
    );
    expect(
      JSON.parse(storage.getItem(currentKey)!).bookings[0].instructions,
    ).toBe("Privé");
  });
});
