import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const confirmToken = "mamipet-test-clean";

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

function parseArguments(argv) {
  const options = {
    confirm: "",
    createdAfter: "",
    emailLikes: [],
    emails: [],
    execute: false,
  };

  for (const argument of argv) {
    if (argument === "--execute") {
      options.execute = true;
      continue;
    }

    const [name, ...valueParts] = argument.split("=");
    const value = valueParts.join("=");

    if (name === "--email" && value) {
      options.emails.push(value.toLowerCase());
      continue;
    }

    if (name === "--email-like" && value) {
      options.emailLikes.push(value);
      continue;
    }

    if (name === "--created-after" && value) {
      options.createdAfter = value;
      continue;
    }

    if (name === "--confirm" && value) {
      options.confirm = value;
    }
  }

  if (
    options.emails.length === 0 &&
    options.emailLikes.length === 0 &&
    !options.createdAfter
  ) {
    throw new Error(
      "Provide at least one filter: --email=, --email-like=, or --created-after=.",
    );
  }

  return options;
}

async function readSupabaseAdminConfig() {
  const envContent = await readFile(resolve(".env.local"), "utf8");
  const env = parseEnvFile(envContent);
  const url = env.get("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!url) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL must be filled in .env.local.");
  }

  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY must be filled in .env.local.");
  }

  return { serviceRoleKey, url };
}

function likePatternToRegex(pattern) {
  const escapedPattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regexPattern = `^${escapedPattern.replaceAll("%", ".*").replaceAll("_", ".")}$`;

  return new RegExp(regexPattern, "i");
}

function matchesFilters(user, options) {
  const email = user.email?.toLowerCase() ?? "";
  const createdAt = user.created_at ? new Date(user.created_at) : null;

  if (options.emails.length > 0 && !options.emails.includes(email)) {
    return false;
  }

  if (options.emailLikes.length > 0) {
    const matchesPattern = options.emailLikes.some((pattern) =>
      likePatternToRegex(pattern).test(email),
    );

    if (!matchesPattern) {
      return false;
    }
  }

  if (options.createdAfter) {
    const threshold = new Date(options.createdAfter);

    if (!createdAt || Number.isNaN(threshold.getTime()) || createdAt < threshold) {
      return false;
    }
  }

  return true;
}

async function listAllUsers(supabase) {
  const users = [];
  let page = 1;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: 1000,
    });

    if (error) {
      throw error;
    }

    users.push(...data.users);

    if (data.users.length < 1000) {
      return users;
    }

    page += 1;
  }
}

async function main() {
  const options = parseArguments(process.argv.slice(2));
  const { serviceRoleKey, url } = await readSupabaseAdminConfig();
  const supabase = createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
  const users = await listAllUsers(supabase);
  const matchingUsers = users.filter((user) => matchesFilters(user, options));

  if (matchingUsers.length === 0) {
    console.log("No matching Supabase Auth users found.");
    return;
  }

  console.table(
    matchingUsers.map((user) => ({
      id: user.id,
      email: user.email,
      created_at: user.created_at,
    })),
  );

  if (!options.execute) {
    console.log(
      `Dry run only. Add --execute --confirm=${confirmToken} to delete these users and their cascading app data.`,
    );
    return;
  }

  if (options.confirm !== confirmToken) {
    throw new Error(`Deletion requires --confirm=${confirmToken}.`);
  }

  for (const user of matchingUsers) {
    const { error } = await supabase.auth.admin.deleteUser(user.id);

    if (error) {
      throw error;
    }
  }

  console.log(`Deleted ${matchingUsers.length} Supabase Auth user(s).`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
