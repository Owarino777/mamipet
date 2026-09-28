import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { createEmptyArticle } from "@/modules/blog/domain/article";

const admin = "11111111-1111-4111-8111-111111111111";
const member = "22222222-2222-4222-8222-222222222222";
let db: PGlite;
const article = {
  ...createEmptyArticle(),
  slug: "preparer-une-garde",
  title: "Préparer une garde",
  excerpt: "Quelques conseils",
  blocks: [{ type: "paragraph", text: "Le texte public." }],
};

beforeAll(async () => {
  db = new PGlite();
  await db.exec(`
    create role anon; create role authenticated;
    create schema auth; create schema storage;
    grant usage on schema public, auth, storage to anon, authenticated;
    create table auth.users(id uuid primary key);
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    create function auth.jwt() returns jsonb language sql stable as $$ select jsonb_build_object('email', current_setting('request.jwt.claim.email', true)) $$;
    create table public.compte_utilisateur(id_compte uuid primary key references auth.users, email text unique not null, statut_compte text not null default 'active', est_administrateur boolean not null default false);
    alter table public.compte_utilisateur enable row level security;
    grant select, insert, update, delete on public.compte_utilisateur to authenticated;
    create policy own_account on public.compte_utilisateur for select using (id_compte = auth.uid());
    create table storage.buckets(id text primary key, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]);
    create table storage.objects(id uuid default gen_random_uuid(), bucket_id text, name text);
    alter table storage.objects enable row level security;
    grant select, insert on storage.objects to authenticated;
    insert into auth.users values ('${admin}'), ('${member}');
    insert into compte_utilisateur values ('${admin}', 'admin@test.example', 'active', true), ('${member}', 'member@test.example', 'active', false);
  `);
  // Use the actual project's administrator predicate, not an always-true mock.
  const adminMigration = await readFile(
    "supabase/migrations/202605020004_trust_admin_access.sql",
    "utf8",
  );
  await db.exec(
    adminMigration.slice(0, adminMigration.indexOf("create policy")),
  );
  await db.exec(
    await readFile("supabase/migrations/202609230006_blog.sql", "utf8"),
  );
  await db.exec(
    await readFile(
      "supabase/migrations/202609230007_account_creation_access.sql",
      "utf8",
    ),
  );
}, 30000);

afterAll(async () => {
  await db?.close();
});
beforeEach(async () => {
  await db.exec(
    "reset role; truncate blog_publications, blog_posts; update compte_utilisateur set statut_compte = 'active';",
  );
  await asUser(admin);
});
async function asUser(id: string) {
  await db.exec("reset role");
  await db.query("select set_config('request.jwt.claim.sub', $1, false)", [id]);
  await db.query("select set_config('request.jwt.claim.email', $1, false)", [
    id === admin ? "admin@test.example" : "member@test.example",
  ]);
  await db.exec("set role authenticated");
}
async function createDraft(document = article) {
  const result = await db.query<{ id: string }>(
    "insert into blog_posts(document, updated_by) values ($1, auth.uid()) returning id",
    [JSON.stringify(document)],
  );
  return result.rows[0]!.id;
}
async function publish(id: string, version: number, value = true) {
  await db.query("select set_blog_publication($1,$2,$3)", [id, version, value]);
}

describe("blog SQL authorization and publication", () => {
  it("does not expose drafts to members or anonymous visitors", async () => {
    await createDraft();
    await asUser(member);
    expect((await db.query("select * from blog_posts")).rows).toEqual([]);
    await expect(createDraft()).rejects.toMatchObject({ code: "42501" });
    await db.exec("reset role; set role anon");
    await expect(db.query("select * from blog_posts")).rejects.toMatchObject({
      code: "42501",
    });
    expect((await db.query("select * from blog_publications")).rows).toEqual(
      [],
    );
  });
  it("keeps edits private until republishing, then removes the public snapshot on withdrawal", async () => {
    const id = await createDraft();
    await publish(id, 1);
    await db.query(
      "update blog_posts set document = jsonb_set(document, '{title}', '\"Private revision\"'), version = 3 where id = $1 and version = 2",
      [id],
    );
    await db.exec("reset role; set role anon");
    expect(
      (
        await db.query<{ title: string }>(
          "select document->>'title' as title from blog_publications",
        )
      ).rows[0]?.title,
    ).toBe(article.title);
    await asUser(admin);
    await publish(id, 3);
    expect(
      (
        await db.query<{ title: string }>(
          "select document->>'title' as title from blog_publications",
        )
      ).rows[0]?.title,
    ).toBe("Private revision");
    await publish(id, 4, false);
    expect((await db.query("select * from blog_publications")).rows).toEqual(
      [],
    );
    expect((await db.query("select * from blog_posts")).rows).toHaveLength(1);
  });
  it("rejects stale versions, direct publication writes and changing a published URL", async () => {
    const id = await createDraft();
    await publish(id, 1);
    await expect(publish(id, 1)).rejects.toMatchObject({ code: "40001" });
    await expect(db.query("select set_blog_publication($1, null, true)", [id])).rejects.toMatchObject({ code: "22023" });
    await expect(db.query("update blog_posts set updated_by = auth.uid() where id = $1", [id])).rejects.toMatchObject({ code: "40001" });
    await expect(
      db.query(
        "update blog_publications set slug = 'forged' where post_id = $1",
        [id],
      ),
    ).rejects.toMatchObject({ code: "42501" });
    await expect(
      db.query("update blog_posts set public_slug = 'forged' where id = $1", [
        id,
      ]),
    ).rejects.toMatchObject({ code: "42501" });
    await expect(
      db.query(
        "update blog_posts set document = jsonb_set(document, '{slug}', '\"changed-url\"') where id = $1",
        [id],
      ),
    ).rejects.toMatchObject({ code: "23514" });
  });
  it("rolls back a conflicting slug without losing either draft", async () => {
    const first = await createDraft();
    const second = await createDraft();
    await publish(first, 1);
    await expect(publish(second, 1)).rejects.toMatchObject({ code: "23505" });
    expect(
      (
        await db.query<{ version: number }>(
          "select version from blog_posts where id = $1",
          [second],
        )
      ).rows[0]?.version,
    ).toBe(1);
    expect(
      (await db.query("select * from blog_publications")).rows,
    ).toHaveLength(1);
  });
  it("denies member and suspended administrator publication", async () => {
    const id = await createDraft();
    await asUser(member);
    await expect(publish(id, 1)).rejects.toMatchObject({ code: "42501" });
    await db.exec(
      `reset role; update compte_utilisateur set statut_compte = 'suspended' where id_compte = '${admin}'`,
    );
    await asUser(admin);
    await expect(publish(id, 1)).rejects.toMatchObject({ code: "42501" });
  });
  it("rejects an empty article and invalid block shape in SQL", async () => {
    const empty = await createDraft({ ...article, title: "" });
    await expect(publish(empty, 1)).rejects.toMatchObject({ code: "23514" });
    await db.query(
      "update blog_posts set document = jsonb_set(document, '{blocks}', '{}'), version = version + 1 where id = $1",
      [empty],
    );
    await expect(publish(empty, 2)).rejects.toMatchObject({ code: "23514" });
  });
  it("allows self initialization without allowing admin elevation or account reactivation", async () => {
    await db.exec(
      `reset role; delete from compte_utilisateur where id_compte = '${member}';`,
    );
    await asUser(member);
    await db.query(
      "insert into compte_utilisateur(id_compte,email) values(auth.uid(),'member@test.example')",
    );
    await expect(
      db.query(
        "update compte_utilisateur set est_administrateur = true where id_compte = auth.uid()",
      ),
    ).rejects.toMatchObject({ code: "42501" });
    await expect(
      db.query(
        "update compte_utilisateur set statut_compte = 'active' where id_compte = auth.uid()",
      ),
    ).rejects.toMatchObject({ code: "42501" });
  });
});
