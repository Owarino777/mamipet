import { describe, expect, it } from "vitest";
import { z } from "zod";
import { assertSameOrigin } from "@/shared/http/same-origin";
import { readLimitedBody } from "@/shared/http/read-limited-body";
import { parseJsonBody } from "@/shared/http/request-json";
import { safeReturnPath } from "@/shared/auth/safe-return-path";
import { jsonError, jsonOk } from "@/shared/http/route-response";
import { HttpError } from "@/shared/errors/http-error";

describe("HTTP boundaries", () => {
  it("rejects cross-site writes while allowing same-origin forms", () => {
    expect(() =>
      assertSameOrigin(
        new Request("https://mamipet.test/api", {
          method: "POST",
          headers: { origin: "https://evil.test" },
        }),
      ),
    ).toThrow();
    expect(() =>
      assertSameOrigin(
        new Request("https://mamipet.test/api", {
          method: "PATCH",
          headers: { "sec-fetch-site": "cross-site" },
        }),
      ),
    ).toThrow();
    expect(() =>
      assertSameOrigin(
        new Request("https://mamipet.test/api", {
          method: "POST",
          headers: { origin: "https://mamipet.test" },
        }),
      ),
    ).not.toThrow();
  });
  it("bounds bytes even when content-length is missing or false", async () => {
    await expect(
      readLimitedBody(
        new Request("https://example.test", {
          method: "POST",
          body: "abcdef",
          headers: { "content-length": "1" },
        }),
        5,
      ),
    ).rejects.toMatchObject({ status: 413 });
    const bytes = await readLimitedBody(
      new Request("https://example.test", { method: "POST", body: "abcde" }),
      5,
    );
    expect(new TextDecoder().decode(bytes)).toBe("abcde");
  });
  it("separates malformed JSON and schema failures", async () => {
    await expect(
      parseJsonBody(
        new Request("https://example.test", { method: "POST", body: "{" }),
        z.object({}),
      ),
    ).rejects.toMatchObject({ code: "INVALID_JSON" });
    await expect(
      parseJsonBody(
        new Request("https://example.test", {
          method: "POST",
          body: '{"role":"admin"}',
        }),
        z.object({}).strict(),
      ),
    ).rejects.toMatchObject({ code: "VALIDATION_ERROR" });
  });
  it("never caches account responses or exposes technical errors", async () => {
    expect(jsonOk({ id: "private" }).headers.get("cache-control")).toBe(
      "private, no-store",
    );
    const response = jsonError(
      new HttpError("private database information", 500, "DATABASE"),
    );
    expect(await response.text()).not.toContain("private database information");
    expect(response.headers.get("cache-control")).toBe("private, no-store");
  });
  it("keeps login redirects on this site", () => {
    for (const path of [
      "https://evil.test",
      "//evil.test",
      "/\\evil.test",
      "/login",
      "/\nevil.test",
    ])
      expect(safeReturnPath(path, "/dashboard")).toBe("/dashboard");
    expect(safeReturnPath("/admin/blog?tab=drafts", "/dashboard")).toBe(
      "/admin/blog?tab=drafts",
    );
  });
});
