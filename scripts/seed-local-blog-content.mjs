import pg from "pg";

const LOCAL_SUPABASE_DB_URL = "postgresql://postgres:postgres@127.0.0.1:54322/postgres";
const connectionString = process.env.SUPABASE_DB_URL?.trim() || LOCAL_SUPABASE_DB_URL;
const databaseUrl = new URL(connectionString);
const isLocalHost = ["127.0.0.1", "localhost", "[::1]"].includes(databaseUrl.hostname);
if (!isLocalHost || !["postgres:", "postgresql:"].includes(databaseUrl.protocol)) {
  throw new Error("The editorial seed is restricted to a local database.");
}

const articles = [
  {
    slug: "preparer-premiere-garde-animal",
    title: "Préparer la première garde de son animal",
    excerpt: "Les repères essentiels pour organiser une première garde sereine, pour vous comme pour votre animal.",
    blocks: [
      ["heading", "Commencer par une rencontre"],
      ["paragraph", "Une première garde se prépare mieux autour d’un échange simple qu’avec une longue liste d’instructions. Présentez les habitudes de votre animal, ses signaux de stress, ses repas et ce qui l’apaise."],
      ["paragraph", "Prévoyez une rencontre dans un lieu calme. Observez la façon dont le pet-sitter entre en relation avec votre animal et vérifiez que vous vous sentez libre de poser vos questions."],
      ["heading", "Transmettre les informations utiles"],
      ["paragraph", "Notez les horaires importants, les coordonnées du vétérinaire, les traitements éventuels et la personne à joindre en cas d’imprévu. Les consignes doivent être accessibles, datées et faciles à relire."],
    ],
  },
  {
    slug: "checklist-depart-garde-animaux",
    title: "La checklist du départ pour une garde d’animaux",
    excerpt: "Une liste courte et pratique pour ne rien oublier le jour où votre animal est confié.",
    blocks: [
      ["heading", "Le nécessaire du quotidien"],
      ["list", "Alimentation habituelle\nTraitement et ordonnance si nécessaire\nLaisse, harnais ou caisse de transport\nObjet familier et coordonnées utiles"],
      ["paragraph", "Préparez les quantités plutôt que de laisser le pet-sitter deviner. Une étiquette lisible sur les sacs et une routine écrite réduisent les erreurs lors des premiers jours."],
      ["heading", "Le dernier échange"],
      ["paragraph", "Avant de partir, confirmez les horaires, le moyen de contact et les règles concernant les sorties. Demandez quand vous recevrez des nouvelles et prévenez si votre téléphone change."],
    ],
  },
  {
    slug: "garder-animal-age-en-toute-serenite",
    title: "Garder un animal âgé en toute sérénité",
    excerpt: "Adapter l’environnement, le rythme et les échanges pour respecter les besoins d’un animal senior.",
    blocks: [
      ["heading", "Conserver les repères"],
      ["paragraph", "Un animal âgé peut être plus sensible aux changements de lieu, de bruit ou d’horaires. Gardez autant que possible ses heures de repas, son couchage et ses habitudes de sortie."],
      ["paragraph", "Expliquez les signes qui doivent attirer l’attention : fatigue inhabituelle, difficulté à se lever, perte d’appétit ou comportement différent. Un suivi régulier vaut mieux qu’une intervention tardive."],
      ["heading", "Aménager sans surprotéger"],
      ["paragraph", "Un sol glissant, un accès difficile à l’eau ou des escaliers peuvent compliquer la garde. Sécurisez les passages tout en laissant l’animal conserver une part d’autonomie."],
    ],
  },
  {
    slug: "organiser-traitement-animal-pendant-garde",
    title: "Organiser un traitement pendant la garde",
    excerpt: "Comment transmettre une consigne de soin claire et sécurisée quand votre animal suit un traitement.",
    blocks: [
      ["heading", "Une consigne vérifiable"],
      ["paragraph", "Indiquez le nom du traitement, la dose prescrite, l’horaire et la façon de l’administrer. L’ordonnance ou les instructions du vétérinaire doivent accompagner le traitement."],
      ["paragraph", "Demandez au pet-sitter de reformuler la consigne. Cette étape simple permet de vérifier que la dose, la fréquence et les précautions ont été comprises."],
      ["heading", "Prévoir le suivi"],
      ["paragraph", "Convenez du type de nouvelle attendu après la prise : message court, tableau de suivi ou photo du pilulier. En cas de doute ou de réaction inhabituelle, le vétérinaire reste la référence."],
    ],
  },
  {
    slug: "animal-anxieux-preparer-garde",
    title: "Préparer la garde d’un animal anxieux",
    excerpt: "Des méthodes concrètes pour réduire les changements brusques et aider un animal anxieux à trouver ses repères.",
    blocks: [
      ["heading", "Décrire les déclencheurs"],
      ["paragraph", "Expliquez ce qui provoque l’inquiétude : bruits, solitude, inconnus, autres animaux ou changements de routine. Décrire les signaux précoces aide le pet-sitter à agir avant que le stress augmente."],
      ["paragraph", "Un objet portant l’odeur de la maison, une pièce refuge et des horaires réguliers peuvent rendre le nouvel environnement plus prévisible."],
      ["heading", "Laisser le temps"],
      ["paragraph", "Ne forcez pas le contact. Une présence calme, des déplacements lents et des interactions choisies par l’animal créent davantage de confiance qu’une sollicitation permanente."],
    ],
  },
  {
    slug: "choisir-garde-domicile-ou-chez-pet-sitter",
    title: "Garde à domicile ou chez le pet-sitter : comment choisir",
    excerpt: "Comparer les deux formats de garde selon le tempérament, les soins et les habitudes de votre animal.",
    blocks: [
      ["heading", "Quand le domicile est préférable"],
      ["paragraph", "La garde à domicile conserve les odeurs, les trajets et les repères de l’animal. Elle peut convenir à un chat territorial, à un animal anxieux ou à une routine de soins très précise."],
      ["heading", "Quand un autre environnement convient"],
      ["paragraph", "Le domicile du pet-sitter peut être adapté à un chien sociable ou à un animal qui apprécie la présence humaine. Vérifiez alors les espaces disponibles, les autres animaux et le rythme des sorties."],
      ["paragraph", "Le meilleur format est celui qui répond aux besoins réels de l’animal et aux capacités du pet-sitter, pas celui qui semble le plus pratique sur le papier."],
    ],
  },
  {
    slug: "questions-a-poser-pet-sitter",
    title: "Les bonnes questions à poser à un pet-sitter",
    excerpt: "Un échange bien préparé permet de vérifier rapidement si la garde correspond à votre animal.",
    blocks: [
      ["heading", "Comprendre son expérience"],
      ["list", "A-t-il déjà gardé la même espèce ?\nComment réagit-il face à une urgence ?\nCombien d’animaux garde-t-il en même temps ?\nQuel rythme de nouvelles propose-t-il ?"],
      ["paragraph", "Demandez des exemples concrets plutôt qu’une réponse générale. La façon de raconter une situation difficile révèle souvent mieux l’organisation et les limites du pet-sitter."],
      ["paragraph", "Terminez par les points pratiques : horaires, annulation, matériel à fournir et personnes autorisées à récupérer l’animal."],
    ],
  },
  {
    slug: "securiser-maison-pour-garde-animal",
    title: "Sécuriser la maison avant une garde",
    excerpt: "Les vérifications simples qui réduisent les risques dans un logement où un animal va être gardé.",
    blocks: [
      ["heading", "Repérer les accès sensibles"],
      ["paragraph", "Vérifiez les fenêtres, balcons, portes de jardin, produits ménagers et plantes toxiques. Indiquez clairement les pièces accessibles et celles qui doivent rester fermées."],
      ["paragraph", "Rangez les petits objets, les aliments dangereux et les câbles accessibles. Pour un animal nouvellement arrivé, la prévention doit primer sur la confiance dans ses habitudes."],
      ["heading", "Préparer un espace calme"],
      ["paragraph", "Un couchage, une gamelle d’eau et une zone de retrait permettent à l’animal de se poser. Un espace simple et stable est souvent plus utile qu’un grand nombre d’accessoires."],
    ],
  },
  {
    slug: "bien-vivre-retour-de-garde",
    title: "Bien vivre le retour après une garde",
    excerpt: "Retrouver son animal, observer son état et reprendre la routine sans créer de pression inutile.",
    blocks: [
      ["heading", "Observer avant d’interpréter"],
      ["paragraph", "Après une garde, un animal peut dormir davantage, être très excité ou chercher du calme. Observez son appétit, son comportement et ses habitudes avant de conclure qu’il a mal vécu la séparation."],
      ["paragraph", "Demandez au pet-sitter un retour factuel : repas pris, sorties, sommeil, incidents et moments appréciés. Ces informations sont plus utiles qu’une impression générale."],
      ["heading", "Reprendre progressivement"],
      ["paragraph", "Reprenez les horaires habituels, laissez une période calme et évitez d’enchaîner immédiatement les changements. Une routine stable aide l’animal à retrouver ses repères."],
    ],
  },
  {
    slug: "preparer-plan-urgence-garde",
    title: "Préparer un plan d’urgence pour la garde",
    excerpt: "Les informations à transmettre pour qu’un pet-sitter sache quoi faire si une situation imprévue survient.",
    blocks: [
      ["heading", "Les contacts indispensables"],
      ["list", "Vétérinaire habituel et clinique de garde\nPersonne de confiance joignable\nCoordonnées du propriétaire\nAdresse et moyen de transport prévu"],
      ["paragraph", "Écrivez à l’avance ce qui constitue une urgence pour votre animal et ce qui peut attendre votre retour. Le pet-sitter ne doit pas avoir à chercher ces informations dans plusieurs messages."],
      ["paragraph", "Un plan clair ne remplace pas l’avis vétérinaire. Il permet simplement de gagner du temps et de réduire les hésitations lorsqu’une décision doit être prise."],
    ],
  },
];

const client = new pg.Client({ connectionString });
await client.connect();
try {
  const { rows } = await client.query(`
    select account.id_compte
    from public.compte_utilisateur account
    where account.est_administrateur = true and account.statut_compte = 'active'
    order by account.id_compte
    limit 1
  `);
  const admin = rows[0]?.id_compte;
  if (!admin) {
    throw new Error("Create an active local administrator account before seeding articles.");
  }

  await client.query("begin");
  await client.query("select set_config('request.jwt.claim.sub', $1, false)", [admin]);
  let createdCount = 0;
  for (const article of articles) {
    const document = {
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      authorName: "Équipe MamiPet",
      coverImageUrl: "",
      coverImageAlt: "",
      seoTitle: article.title,
      seoDescription: article.excerpt,
      blocks: article.blocks.map(([type, text]) => ({ type, text })),
    };
    const existing = await client.query(
      "select id, version from public.blog_posts where document->>'slug' = $1 limit 1",
      [article.slug],
    );
    if (existing.rows[0]) {
      continue;
    }
    const inserted = await client.query(
      "insert into public.blog_posts(document, updated_by) values ($1, $2) returning id, version",
      [document, admin],
    );
    await client.query(
      "select public.set_blog_publication($1, $2, true)",
      [inserted.rows[0].id, inserted.rows[0].version],
    );
    createdCount += 1;
  }
  await client.query("commit");
  console.log(`Created ${createdCount} local articles; ${articles.length - createdCount} already existed.`);
} catch (error) {
  await client.query("rollback");
  throw error;
} finally {
  await client.end();
}
