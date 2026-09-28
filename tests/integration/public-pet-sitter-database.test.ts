import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const owner = "11111111-1111-4111-8111-111111111111";
const visitor = "22222222-2222-4222-8222-222222222222";
const admin = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";
const visibleProfile = "33333333-3333-4333-8333-333333333333";
const draftProfile = "44444444-4444-4444-8444-444444444444";
const ownerProfile = "55555555-5555-4555-8555-555555555555";
const careLocation = "66666666-6666-4666-8666-666666666666";
const careFormat = "77777777-7777-4777-8777-777777777777";
const reservation = "88888888-8888-4888-8888-888888888888";
const secondOwnerProfile = "99999999-9999-4999-8999-999999999999";
const species = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const privateAnimal = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const otherSitter = "dddddddd-dddd-4ddd-8ddd-dddddddddddd";
const verifiedSitter = "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee";
const professionalSitter = "ffffffff-ffff-4fff-8fff-ffffffffffff";
const suspendedSitter = "12121212-1212-4121-8121-121212121212";
const rejectedSitter = "13131313-1313-4131-8131-131313131313";
const legacyDraftSitter = "14141414-1414-4141-8141-141414141414";
const invisibleProfile = "21212121-2121-4121-8121-212121212121";
const verifiedProfile = "23232323-2323-4232-8232-232323232323";
const professionalProfile = "24242424-2424-4242-8242-242424242424";
const suspendedProfile = "25252525-2525-4252-8252-252525252525";
const rejectedProfile = "26262626-2626-4262-8262-262626262626";
const careCapability = "27272727-2727-4272-8272-272727272727";
const extraService = "28282828-2828-4282-8282-282828282828";
const publicBadge = "29292929-2929-4292-8292-292929292929";
const inactiveBadge = "30303030-3030-4303-8303-303030303030";
const legacyDraftProfile = "31313131-3131-4313-8313-313131313131";
let db: PGlite;

async function asAuthenticated(accountId: string) {
  await db.exec("reset role");
  await db.query("select set_config('request.jwt.claim.sub', $1, false)", [accountId]);
  await db.exec("set role authenticated");
}

beforeAll(async () => {
  db = new PGlite();
  await db.exec(`
    create role anon; create role authenticated;
    create schema auth;
    grant usage on schema public, auth to anon, authenticated;
    create table auth.users(id uuid primary key);
    create function auth.uid() returns uuid language sql stable as $$
      select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
    $$;
    create function auth.jwt() returns jsonb language sql stable as $$
      select jsonb_build_object('email', current_setting('request.jwt.claim.email', true))
    $$;
  `);
  for (const name of [
    "202605020001_initial_schema.sql",
    "202605020002_pet_sitter_offer_access.sql",
    "202605020004_trust_admin_access.sql",
    "202609230001_atomic_reservations.sql",
    "202609230002_reservation_write_access.sql",
    "202609230003_pet_sitter_verification_guard.sql",
    "202609230004_private_animal_records.sql",
    "202609230005_availability_overlap_guard.sql",
    "202609230007_account_creation_access.sql",
    "202609230008_public_pet_sitter_projection.sql",
    "202609230009_trust_write_guards.sql",
  ]) {
    const sql = await readFile(`supabase/migrations/${name}`, "utf8");
    // PGlite has gen_random_uuid() built in, but does not package pgcrypto.
    await db.exec(sql.replace("create extension if not exists pgcrypto;", ""));
  }
  await db.exec(`
    insert into auth.users values ('${owner}'), ('${visitor}'), ('${admin}'),
      ('${otherSitter}'), ('${verifiedSitter}'), ('${professionalSitter}'),
      ('${suspendedSitter}'), ('${rejectedSitter}'), ('${legacyDraftSitter}');
    insert into compte_utilisateur(id_compte,email) values
      ('${owner}','owner@example.test'), ('${visitor}','visitor@example.test'),
      ('${otherSitter}','other-sitter@example.test'),
      ('${verifiedSitter}','verified@example.test'),
      ('${professionalSitter}','professional@example.test'),
      ('${suspendedSitter}','suspended@example.test'),
      ('${rejectedSitter}','rejected@example.test'),
      ('${legacyDraftSitter}','legacy-draft@example.test');
    insert into compte_utilisateur(id_compte,email,est_administrateur)
      values ('${admin}','admin@example.test',true);
    select set_config('request.jwt.claim.sub', '${admin}', false);
    insert into profil_pet_sitter(
      id_profil_pet_sitter,id_compte,prenom,telephone,adresse_ligne1,
      ville,latitude,longitude,tarif_base,rayon_km,statut_verification,visibilite_publique
    ) values
      ('${visibleProfile}','${owner}','Sarah','0600000000','12 rue privée',
       'Caen',49.184247,-0.361995,28,8,'published_unverified',true),
      ('${draftProfile}','${visitor}','Draft','0700000000','99 rue privée',
       'Paris',48.8566,2.3522,30,8,'draft',false),
      ('${invisibleProfile}','${otherSitter}','Hidden',null,null,
       'Lyon',45.764,4.8357,30,8,'published_unverified',false),
      ('${verifiedProfile}','${verifiedSitter}','Verified',null,null,
       'Lille',50.6292,3.0573,30,8,'identity_verified',true),
      ('${professionalProfile}','${professionalSitter}','Professional',null,null,
       'Tours',47.3941,0.6848,30,8,'professional_verified',true),
      ('${suspendedProfile}','${suspendedSitter}','Suspended',null,null,
       'Rennes',48.1173,-1.6778,30,8,'suspended',true),
      ('${rejectedProfile}','${rejectedSitter}','Rejected',null,null,
       'Rouen',49.4432,1.0993,30,8,'rejected',true);
    -- Model a legacy inconsistent row; current writes normally promote a visible draft.
    alter table profil_pet_sitter disable trigger guard_pet_sitter_verification;
    insert into profil_pet_sitter(
      id_profil_pet_sitter,id_compte,prenom,ville,tarif_base,rayon_km,
      statut_verification,visibilite_publique
    ) values ('${legacyDraftProfile}','${legacyDraftSitter}','Legacy','Caen',30,8,'draft',true);
    alter table profil_pet_sitter enable trigger guard_pet_sitter_verification;
    select set_config('request.jwt.claim.sub', '', false);
    insert into profil_proprietaire(id_profil_proprietaire,id_compte,prenom,ville)
      values ('${ownerProfile}','${visitor}','Client','Paris'),
      ('${secondOwnerProfile}','${owner}','Sarah','Caen');
    insert into espece(id_espece,code_espece,libelle_espece)
      values ('${species}','dog','Chien');
    insert into profil_pet_sitter_espece(id_profil_pet_sitter,id_espece)
      values ('${visibleProfile}','${species}');
    insert into animal(id_animal,id_profil_proprietaire,id_espece,nom)
      values ('${privateAnimal}','${secondOwnerProfile}','${species}','Rex');
    insert into dossier_medical(id_animal,consignes_confidentielles)
      values ('${privateAnimal}','Traitement confidentiel');
    insert into lieu_garde(id_lieu_garde,code_lieu_garde,libelle_lieu_garde)
      values ('${careLocation}','home','Domicile');
    insert into format_garde(id_format_garde,code_format_garde,libelle_format_garde)
      values ('${careFormat}','day','Journée');
    insert into capacite_soin(id_capacite_soin,code_capacite_soin,libelle_capacite_soin)
      values ('${careCapability}','medicine','Médicaments');
    insert into service_additionnel(id_service_additionnel,code_service_additionnel,libelle_service_additionnel)
      values ('${extraService}','walk','Promenade');
    insert into badge_public(id_badge_public,code_badge_public,libelle_badge_public)
      values ('${publicBadge}','verified','Vérifié'),
      ('${inactiveBadge}','inactive','Retiré');
    insert into profil_pet_sitter_capacite_soin values ('${visibleProfile}','${careCapability}');
    insert into profil_pet_sitter_lieu_garde values ('${visibleProfile}','${careLocation}');
    insert into profil_pet_sitter_format_garde values ('${visibleProfile}','${careFormat}');
    insert into profil_pet_sitter_service_additionnel values ('${visibleProfile}','${extraService}');
    insert into profil_pet_sitter_badge_public(id_profil_pet_sitter,id_badge_public,origine_badge)
      values ('${visibleProfile}','${publicBadge}','internal-verification-source');
    insert into profil_pet_sitter_badge_public(id_profil_pet_sitter,id_badge_public,origine_badge,actif)
      values ('${visibleProfile}','${inactiveBadge}','former-internal-source',false);
    insert into reservation(id_reservation,id_profil_proprietaire,id_profil_pet_sitter,
      id_lieu_garde,id_format_garde,date_debut_reservation,date_fin_reservation,
      statut_reservation,niveau_assurance_applique,tarif_convenu)
      values ('${reservation}','${ownerProfile}','${visibleProfile}',
      '${careLocation}','${careFormat}',now() + interval '1 day',
      now() + interval '2 days','completed','standard',28);
    insert into avis(id_reservation,note_globale,commentaire)
      values ('${reservation}',5,'Merci');
    insert into document_professionnel(id_profil_pet_sitter,type_document_professionnel)
      values ('${visibleProfile}','insurance');
  `);
}, 30000);

afterAll(async () => {
  await db?.close();
});

describe("public pet-sitter database projection", () => {
  it("keeps the owner-privilege view behind a security barrier", async () => {
    await db.exec("reset role");
    const result = await db.query<{ reloptions: string[] }>(
      "select reloptions from pg_class where oid = 'public.pet_sitter_public_profile'::regclass",
    );
    expect(result.rows[0]?.reloptions).toContain("security_barrier=true");
    expect(result.rows[0]?.reloptions).not.toContain("security_invoker=true");
  });

  it("exposes exactly the approved columns and eligible profiles to anonymous clients", async () => {
    await db.exec("set role anon");
    await expect(db.query("select * from profil_pet_sitter")).rejects.toMatchObject({ code: "42501" });
    await expect(db.query("select telephone from profil_pet_sitter")).rejects.toMatchObject({ code: "42501" });
    await expect(db.query("select origine_badge from profil_pet_sitter_badge_public")).rejects.toMatchObject({ code: "42501" });
    const result = await db.query<Record<string, unknown>>(
      "select * from pet_sitter_public_profile",
    );
    expect(result.rows.map((row) => row.id_profil_pet_sitter).sort()).toEqual(
      [visibleProfile, verifiedProfile, professionalProfile].sort(),
    );
    expect(result.fields.map((field) => field.name)).toEqual([
      "id_profil_pet_sitter", "pseudo", "prenom", "photo_url", "description",
      "ville", "pays", "latitude", "longitude", "tarif_base", "rayon_km",
      "statut_verification", "date_creation", "profil_pet_sitter_espece",
      "species_ids", "profil_pet_sitter_capacite_soin", "care_capability_ids",
      "profil_pet_sitter_lieu_garde", "care_location_ids",
      "profil_pet_sitter_format_garde", "care_format_ids",
      "profil_pet_sitter_service_additionnel", "profil_pet_sitter_badge_public",
    ]);
    await expect(db.query("select telephone from pet_sitter_public_profile"))
      .rejects.toMatchObject({ code: "42703" });
    const visible = result.rows.find((row) => row.id_profil_pet_sitter === visibleProfile);
    expect(visible).toMatchObject({
      id_profil_pet_sitter: visibleProfile,
      ville: "Caen",
    });
    expect(Number(visible?.latitude)).toBe(49.18);
    expect(Number(visible?.longitude)).toBe(-0.36);
    expect(visible?.species_ids).toEqual([species]);
    expect(visible?.profil_pet_sitter_espece).toEqual([
      { espece: { id_espece: species, code_espece: "dog", libelle_espece: "Chien" } },
    ]);
    expect(visible?.profil_pet_sitter_capacite_soin).toEqual([
      { capacite_soin: { id_capacite_soin: careCapability, code_capacite_soin: "medicine", libelle_capacite_soin: "Médicaments" } },
    ]);
    expect(visible?.profil_pet_sitter_lieu_garde).toEqual([
      { lieu_garde: { id_lieu_garde: careLocation, code_lieu_garde: "home", libelle_lieu_garde: "Domicile" } },
    ]);
    expect(visible?.profil_pet_sitter_format_garde).toEqual([
      { format_garde: { id_format_garde: careFormat, code_format_garde: "day", libelle_format_garde: "Journée" } },
    ]);
    expect(visible?.profil_pet_sitter_service_additionnel).toEqual([
      { service_additionnel: { id_service_additionnel: extraService, code_service_additionnel: "walk", libelle_service_additionnel: "Promenade" } },
    ]);
    expect(visible?.profil_pet_sitter_badge_public).toEqual([
      { actif: true, badge_public: { id_badge_public: publicBadge, code_badge_public: "verified", libelle_badge_public: "Vérifié" } },
    ]);
    expect(JSON.stringify(visible)).not.toMatch(/0600000000|12 rue privée|internal-verification-source|former-internal-source|Retiré/);
  });

  it("keeps the public projection identical for authenticated callers", async () => {
    await db.exec("reset role");
    await db.exec("set role anon");
    const publicRows = (await db.query<Record<string, unknown>>(
      "select * from pet_sitter_public_profile order by id_profil_pet_sitter",
    )).rows;
    await db.exec("reset role");
    await db.query("select set_config('request.jwt.claim.sub', $1, false)", [visitor]);
    await db.exec("set role authenticated");
    const result = await db.query<{ id_profil_pet_sitter: string }>(
      "select id_profil_pet_sitter from profil_pet_sitter",
    );
    expect(result.rows.map((row) => row.id_profil_pet_sitter)).toEqual([draftProfile]);
    expect((await db.query(
      "select * from pet_sitter_public_profile order by id_profil_pet_sitter",
    )).rows).toEqual(publicRows);
    await asAuthenticated(owner);
    expect((await db.query(
      "select * from pet_sitter_public_profile order by id_profil_pet_sitter",
    )).rows).toEqual(publicRows);
    expect((await db.query(
      "select telephone from profil_pet_sitter where id_profil_pet_sitter = $1",
      [visibleProfile],
    )).rows).toHaveLength(1);
    await asAuthenticated(admin);
    expect((await db.query(
      "select * from pet_sitter_public_profile order by id_profil_pet_sitter",
    )).rows).toEqual(publicRows);
  });

  it("rejects a sitter's forged document validation", async () => {
    await db.exec("reset role");
    await db.query("select set_config('request.jwt.claim.sub', $1, false)", [owner]);
    await db.exec("set role authenticated");
    await expect(db.query(
      "insert into document_professionnel(id_profil_pet_sitter,type_document_professionnel,statut_document) values ($1,'diploma','validated')",
      [visibleProfile],
    )).rejects.toMatchObject({ code: "42501" });
    await db.query(
      "insert into document_professionnel(id_profil_pet_sitter,type_document_professionnel) values ($1,'diploma')",
      [visibleProfile],
    );
  });

  it("allows only the reservation's pet-sitter to answer the review", async () => {
    await asAuthenticated(visitor);
    const ownerAttempt = await db.query(
      "update avis set reponse_pet_sitter = 'forged owner reply', date_reponse_pet_sitter = now() where id_reservation = $1 returning id_avis",
      [reservation],
    );
    expect(ownerAttempt.rows).toHaveLength(0);

    await asAuthenticated(otherSitter);
    const unrelatedAttempt = await db.query(
      "update avis set reponse_pet_sitter = 'forged sitter reply', date_reponse_pet_sitter = now() where id_reservation = $1 returning id_avis",
      [reservation],
    );
    expect(unrelatedAttempt.rows).toHaveLength(0);

    await asAuthenticated(owner);
    const sitterReply = await db.query<{
      id_reservation: string;
      note_globale: number;
      commentaire: string;
      reponse_pet_sitter: string;
      date_reponse_pet_sitter: string;
    }>(
      "update avis set reponse_pet_sitter = 'Merci', date_reponse_pet_sitter = now() where id_reservation = $1 returning id_reservation, note_globale, commentaire, reponse_pet_sitter, date_reponse_pet_sitter",
      [reservation],
    );
    expect(sitterReply.rows).toHaveLength(1);
    expect(sitterReply.rows[0]).toMatchObject({
      id_reservation: reservation,
      note_globale: 5,
      commentaire: "Merci",
      reponse_pet_sitter: "Merci",
    });
    expect(sitterReply.rows[0]?.date_reponse_pet_sitter).toBeTruthy();
  });

  it("denies changes to the review score, comment and reservation for every authenticated role", async () => {
    for (const accountId of [owner, visitor, otherSitter, admin]) {
      await asAuthenticated(accountId);
      for (const statement of [
        "update avis set note_globale = 1 where id_reservation = $1",
        "update avis set commentaire = 'forged' where id_reservation = $1",
        "update avis set id_reservation = id_reservation where id_reservation = $1",
      ]) {
        await expect(db.query(statement, [reservation]))
          .rejects.toMatchObject({ code: "42501" });
      }
    }
  });

  it("allows an administrator to validate a submitted document", async () => {
    await db.exec("reset role");
    await db.query("select set_config('request.jwt.claim.sub', $1, false)", [admin]);
    await db.exec("set role authenticated");
    const result = await db.query<{ statut_document: string }>(
      "update document_professionnel set statut_document = 'validated', date_validation = now() where id_profil_pet_sitter = $1 returning statut_document",
      [visibleProfile],
    );
    expect(result.rows[0]?.statut_document).toBe("validated");
  });

  it("denies another owner animal and medical access, including direct SQL reads", async () => {
    await db.exec("reset role");
    await db.query("select set_config('request.jwt.claim.sub', $1, false)", [visitor]);
    await db.exec("set role authenticated");
    expect((await db.query("select * from animal where id_animal = $1", [privateAnimal])).rows).toEqual([]);
    expect((await db.query("select * from dossier_medical where id_animal = $1", [privateAnimal])).rows).toEqual([]);
    await db.exec("reset role; set role anon");
    await expect(db.query("select * from dossier_medical")).rejects.toMatchObject({ code: "42501" });
  });

  it("denies acceptance by an unrelated pet-sitter, even through the database function", async () => {
    await db.exec("reset role");
    await db.query("select set_config('request.jwt.claim.sub', $1, false)", [visitor]);
    await db.exec("set role authenticated");
    await expect(db.query("select accept_reservation_and_block_slot($1)", [reservation]))
      .rejects.toMatchObject({ code: "42501" });
  });
});
