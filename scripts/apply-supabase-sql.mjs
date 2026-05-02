import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import pg from "pg";

const sqlFiles = [
  "supabase/migrations/202605020001_initial_schema.sql",
  "supabase/seeds/001_reference_data.sql",
];

function parseEnvFile(content) {
  const entries = new Map();

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    entries.set(key, value);
  }

  return entries;
}

async function readDatabaseUrl() {
  const envContent = await readFile(resolve(".env.local"), "utf8");
  const env = parseEnvFile(envContent);
  const databaseUrl = env.get("SUPABASE_DB_URL");

  if (!databaseUrl || databaseUrl.includes("[YOUR-PASSWORD]")) {
    throw new Error("SUPABASE_DB_URL must be filled in .env.local.");
  }

  return normalizeDatabaseUrl(databaseUrl);
}

function normalizeDatabaseUrl(databaseUrl) {
  const match = databaseUrl.match(/^(postgres(?:ql)?:\/\/)([^:]+):(.+)@([^/@]+:\d+\/.*)$/);

  if (!match) {
    return databaseUrl;
  }

  const [, protocol, user, rawPassword, hostAndPath] = match;
  let decodedPassword = rawPassword;

  try {
    decodedPassword = decodeURIComponent(rawPassword);
  } catch {
    decodedPassword = rawPassword;
  }

  return `${protocol}${user}:${encodeURIComponent(decodedPassword)}@${hostAndPath}`;
}

async function main() {
  const databaseUrl = await readDatabaseUrl();
  const client = new pg.Client({
    connectionString: databaseUrl,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  await client.connect();

  try {
    for (const file of sqlFiles) {
      const sql = await readFile(resolve(file), "utf8");
      await client.query(sql);
      console.log(`Applied ${file}`);
    }
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
