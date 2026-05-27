import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";
import pg from "pg";

const fixturePassword = "Mamipet2026!";

const fixtureAccounts = [
  {
    city: "Caen",
    email: "olivia.owner@mamipet.test",
    firstName: "Olivia",
    isAdmin: false,
    kind: "owner",
    metadataRole: "owner",
    name: "Olivia Carter",
    postalCode: "14000",
  },
  {
    basePrice: 28,
    city: "Caen",
    email: "sarah.sitter@mamipet.test",
    firstName: "Sarah",
    isAdmin: false,
    kind: "petSitter",
    latitude: 49.1842,
    longitude: -0.3619,
    metadataRole: "pet_sitter",
    name: "Sarah Johnson",
    postalCode: "14000",
    publicVisibility: true,
    verificationStatus: "professional_verified",
  },
  {
    basePrice: 34,
    city: "Paris",
    email: "amelie.sitter@mamipet.test",
    firstName: "Amelie",
    isAdmin: false,
    kind: "petSitter",
    latitude: 48.8867,
    longitude: 2.3431,
    metadataRole: "pet_sitter",
    name: "Amelie Bernard",
    postalCode: "75018",
    publicVisibility: true,
    verificationStatus: "professional_verified",
  },
  {
    basePrice: 31,
    city: "Lyon",
    email: "hugo.sitter@mamipet.test",
    firstName: "Hugo",
    isAdmin: false,
    kind: "petSitter",
    latitude: 45.774,
    longitude: 4.832,
    metadataRole: "pet_sitter",
    name: "Hugo Martin",
    postalCode: "69004",
    publicVisibility: true,
    verificationStatus: "identity_verified",
  },
  {
    city: "France",
    email: "admin@mamipet.test",
    firstName: "Admin",
    isAdmin: true,
    kind: "admin",
    metadataRole: "admin",
    name: "Admin MamiPet",
    postalCode: null,
  },
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

async function readConfig() {
  const envContent = await readFile(resolve(".env.local"), "utf8");
  const env = parseEnvFile(envContent);
  const databaseUrl = env.get("SUPABASE_DB_URL");
  const publishableKey =
    env.get("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY") ??
    env.get("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  const serviceRoleKey = env.get("SUPABASE_SERVICE_ROLE_KEY");
  const url = env.get("NEXT_PUBLIC_SUPABASE_URL");

  if (!url) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL must be filled in .env.local.");
  }

  if (!publishableKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY must be filled in .env.local.",
    );
  }

  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY must be filled in .env.local.");
  }

  if (!databaseUrl || databaseUrl.includes("[YOUR-PASSWORD]")) {
    throw new Error("SUPABASE_DB_URL must be filled in .env.local.");
  }

  return {
    databaseUrl: normalizeDatabaseUrl(databaseUrl),
    publishableKey,
    serviceRoleKey,
    url,
  };
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

async function upsertAuthUser(supabase, account, existingUsers) {
  const existingUser = existingUsers.find(
    (user) => user.email?.toLowerCase() === account.email,
  );
  const userAttributes = {
    email: account.email,
    password: fixturePassword,
    user_metadata: {
      firstName: account.firstName,
      full_name: account.name,
      role: account.metadataRole,
    },
  };

  if (existingUser) {
    const { data, error } = await supabase.auth.admin.updateUserById(
      existingUser.id,
      {
        ...userAttributes,
        email_confirm: true,
      },
    );

    if (error) {
      throw error;
    }

    return data.user;
  }

  const { data, error } = await supabase.auth.admin.createUser({
    ...userAttributes,
    email_confirm: true,
  });

  if (error) {
    throw error;
  }

  return data.user;
}

async function upsertAccount(client, account, userId) {
  await client.query(
    `
      insert into public.compte_utilisateur
        (id_compte, email, statut_compte, est_administrateur)
      values ($1, $2, 'active', $3)
      on conflict (id_compte) do update set
        email = excluded.email,
        statut_compte = 'active',
        est_administrateur = excluded.est_administrateur
    `,
    [userId, account.email, account.isAdmin],
  );
}

async function upsertOwnerProfile(client, account, userId) {
  await client.query(
    `
      insert into public.profil_proprietaire
        (id_compte, pseudo, prenom, code_postal, ville, pays)
      values ($1, $2, $3, $4, $5, 'France')
      on conflict (id_compte) do update set
        pseudo = excluded.pseudo,
        prenom = excluded.prenom,
        code_postal = excluded.code_postal,
        ville = excluded.ville,
        pays = excluded.pays
    `,
    [userId, account.name, account.firstName, account.postalCode, account.city],
  );
}

async function upsertPetSitterProfile(client, account, userId) {
  const { rows } = await client.query(
    `
      insert into public.profil_pet_sitter
        (
          id_compte,
          pseudo,
          prenom,
          description,
          code_postal,
          ville,
          pays,
          latitude,
          longitude,
          tarif_base,
          rayon_km,
          statut_verification,
          visibilite_publique
        )
      values ($1, $2, $3, $4, $5, $6, 'France', $7, $8, $9, 15, $10, $11)
      on conflict (id_compte) do update set
        pseudo = excluded.pseudo,
        prenom = excluded.prenom,
        description = excluded.description,
        code_postal = excluded.code_postal,
        ville = excluded.ville,
        pays = excluded.pays,
        latitude = excluded.latitude,
        longitude = excluded.longitude,
        tarif_base = excluded.tarif_base,
        rayon_km = excluded.rayon_km,
        statut_verification = excluded.statut_verification,
        visibilite_publique = excluded.visibilite_publique
      returning id_profil_pet_sitter
    `,
    [
      userId,
      account.name,
      account.firstName,
      `Fixture locale pour ${account.name}.`,
      account.postalCode,
      account.city,
      account.latitude,
      account.longitude,
      account.basePrice,
      account.verificationStatus,
      account.publicVisibility,
    ],
  );

  return rows[0].id_profil_pet_sitter;
}

async function verifyPasswordLogin(url, publishableKey, account) {
  const supabase = createClient(url, publishableKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
  const { error } = await supabase.auth.signInWithPassword({
    email: account.email,
    password: fixturePassword,
  });

  if (error) {
    throw new Error(`${account.email}: ${error.message}`);
  }
}

async function main() {
  const config = await readConfig();
  const adminClient = createClient(config.url, config.serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
  const dbClient = new pg.Client({
    connectionString: config.databaseUrl,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  await dbClient.connect();

  try {
    const existingUsers = await listAllUsers(adminClient);

    for (const account of fixtureAccounts) {
      const authUser = await upsertAuthUser(adminClient, account, existingUsers);

      if (!authUser?.id) {
        throw new Error(`Unable to seed auth user for ${account.email}.`);
      }

      await upsertAccount(dbClient, account, authUser.id);

      if (account.kind === "owner") {
        await upsertOwnerProfile(dbClient, account, authUser.id);
      }

      if (account.kind === "petSitter") {
        await upsertPetSitterProfile(dbClient, account, authUser.id);
      }

      await verifyPasswordLogin(config.url, config.publishableKey, account);

      console.log(`Seeded and verified ${account.email}`);
    }
  } finally {
    await dbClient.end();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
