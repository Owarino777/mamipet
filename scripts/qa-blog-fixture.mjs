// Isolated UI fixture. No real Supabase connection, credentials or persisted data.
// Run manually with: node scripts/qa-blog-fixture.mjs
import { createServer } from "node:http";
import { randomUUID } from "node:crypto";

const qaRole = ["admin", "owner", "petSitter"].includes(process.env.MAMIPET_QA_ROLE)
  ? process.env.MAMIPET_QA_ROLE
  : "admin";
const user = {
  id: "11111111-1111-4111-8111-111111111111",
  email: qaRole === "owner" ? "olivia.owner@mamipet.test" : qaRole === "petSitter" ? "sarah.sitter@mamipet.test" : "editor@example.test",
  role: "authenticated",
  aud: "authenticated",
  app_metadata: {},
  user_metadata: { firstName: qaRole === "owner" ? "Olivia" : qaRole === "petSitter" ? "Sarah" : "Camille" },
  created_at: "2026-09-23T12:00:00Z",
};
const drafts = new Map();
const publications = new Map();
const server = createServer(async (request, response) => {
  response.setHeader("Access-Control-Allow-Origin", "http://localhost:3100");
  response.setHeader(
    "Access-Control-Allow-Headers",
    "apikey,authorization,content-type,x-client-info,x-supabase-api-version",
  );
  response.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,OPTIONS");
  if (request.method === "OPTIONS") {
    response.writeHead(204).end();
    return;
  }
  const url = new URL(request.url, "http://localhost:54329");
  const send = (value, status = 200) => {
    response.writeHead(status, { "Content-Type": "application/json" });
    response.end(JSON.stringify(value));
  };
  if (url.pathname === "/auth/v1/user") return send(user);
  if (url.pathname === "/auth/v1/logout") return send({});
  if (url.pathname === "/rest/v1/compte_utilisateur")
    return send({
      id_compte: user.id,
      email: user.email,
      statut_compte: "active",
      est_administrateur: qaRole === "admin",
    });
  if (url.pathname === "/rest/v1/profil_proprietaire")
    return send(qaRole === "owner" ? { id_profil_proprietaire: user.id } : null);
  if (url.pathname === "/rest/v1/profil_pet_sitter")
    return send(qaRole === "petSitter" ? { id_profil_pet_sitter: user.id } : null);
  let body = "";
  for await (const chunk of request) body += chunk;
  const input = body ? JSON.parse(body) : null;
  const id = url.searchParams.get("id")?.replace(/^eq\./, "");
  if (url.pathname === "/rest/v1/blog_posts") {
    if (request.method === "POST") {
      const row = {
        id: randomUUID(),
        ...input,
        version: 1,
        public_slug: null,
        published_at: null,
        updated_at: new Date().toISOString(),
      };
      drafts.set(row.id, row);
      return send(row, 201);
    }
    const row = drafts.get(id);
    if (request.method === "PATCH") {
      if (
        !row ||
        row.version !==
          Number(url.searchParams.get("version")?.replace(/^eq\./, ""))
      )
        return send(null);
      Object.assign(row, input, { updated_at: new Date().toISOString() });
      return send(row);
    }
    if (id) return send(row ?? null);
    response.setHeader(
      "Content-Range",
      `0-${Math.max(0, drafts.size - 1)}/${drafts.size}`,
    );
    return send([...drafts.values()]);
  }
  if (url.pathname === "/rest/v1/rpc/set_blog_publication") {
    const row = drafts.get(input.p_id);
    if (!row || row.version !== input.p_version)
      return send({ code: "40001", message: "Version conflict" }, 409);
    if (input.p_publish) {
      row.public_slug = row.document.slug;
      row.published_at ??= new Date().toISOString();
      publications.set(
        row.id,
        structuredClone({
          post_id: row.id,
          slug: row.public_slug,
          document: row.document,
          published_at: row.published_at,
          updated_at: new Date().toISOString(),
        }),
      );
    } else {
      publications.delete(row.id);
      row.published_at = null;
    }
    row.version += 1;
    return send(null);
  }
  if (url.pathname === "/rest/v1/blog_publications") {
    const slug = url.searchParams.get("slug")?.replace(/^eq\./, "");
    if (slug)
      return send(
        [...publications.values()].find((row) => row.slug === slug) ?? null,
      );
    response.setHeader(
      "Content-Range",
      `0-${Math.max(0, publications.size - 1)}/${publications.size}`,
    );
    return send([...publications.values()]);
  }
  return send([]);
});
server.listen(54329, "127.0.0.1", () =>
  console.log("Isolated blog fixture ready on 127.0.0.1:54329"),
);
