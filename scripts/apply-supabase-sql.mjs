import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import { resolve } from "node:path";
import pg from "pg";

function parseEnvFile(content) {
  const entries = new Map();
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex < 0) continue;
    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    entries.set(key, value);
  }
  return entries;
}

async function readDatabaseUrl() {
  const env = parseEnvFile(await readFile(resolve(".env.local"), "utf8"));
  const databaseUrl = env.get("SUPABASE_DB_URL");
  if (!databaseUrl || databaseUrl.includes("[YOUR-PASSWORD]")) {
    throw new Error("SUPABASE_DB_URL must be filled in .env.local.");
  }
  return databaseUrl;
}

async function main() {
  const databaseUrl = await readDatabaseUrl();
  const hostname = new URL(databaseUrl).hostname;
  const isLocalDatabase = ["localhost", "127.0.0.1", "::1"].includes(hostname);
  const client = new pg.Client({
    connectionString: databaseUrl,
    ssl: isLocalDatabase ? false : { rejectUnauthorized: true },
  });
  await client.connect();
  try {
    const { rows: [state] } = await client.query(`
      select to_regclass('public.compte_utilisateur') is not null as has_schema,
             to_regclass('mamipet_internal.migration_history') is not null as has_history
    `);
    if (state.has_schema && !state.has_history) {
      throw new Error(
        "Existing schema has no migration history. Stop and reconcile applied SQL files manually before using db:apply.",
      );
    }
    if (!state.has_history) {
      await client.query("create schema mamipet_internal");
      await client.query(`
        create table mamipet_internal.migration_history (
          name text primary key,
          sha256 text not null,
          applied_at timestamptz not null default now()
        )
      `);
    }

    const files = (await readdir(resolve("supabase/migrations")))
      .filter((name) => name.endsWith(".sql"))
      .sort();
    const { rows } = await client.query(
      "select name, sha256 from mamipet_internal.migration_history",
    );
    const applied = new Map(rows.map((row) => [row.name, row.sha256]));

    for (const name of files) {
      const sql = await readFile(resolve("supabase/migrations", name), "utf8");
      const sha256 = createHash("sha256").update(sql).digest("hex");
      if (applied.has(name)) {
        if (applied.get(name) !== sha256) {
          throw new Error(`Applied migration was modified: ${name}`);
        }
        continue;
      }
      await client.query("begin");
      try {
        await client.query(sql);
        await client.query(
          "insert into mamipet_internal.migration_history(name, sha256) values ($1, $2)",
          [name, sha256],
        );
        await client.query("commit");
        console.log(`Applied ${name}`);
      } catch (error) {
        await client.query("rollback");
        throw error;
      }
    }
    console.log("All migrations are applied. Reference seeds are separate.");
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
