export type CompetencyAnswer = {
  label: string;
  isCorrect: boolean;
  feedback: string;
};

export type CompetencyQuestion = {
  scenario: string;
  answers: CompetencyAnswer[];
};

export type CompetencyTrack = {
  detail: string;
  id: string;
  label: string;
  publicBadge: string;
  questions: CompetencyQuestion[];
};


export const petSitterCompetencyTests: CompetencyTrack[] = [
  {
    id: "dogs",
    label: "Chiens",
    detail: "Promenades, signaux de stress, rappel des consignes.",
    publicBadge: "Expert chiens",
    questions: [
      {
        scenario:
          "Le propriétaire signale que son chien devient anxieux quand il croise d'autres chiens. Pendant la promenade, le chien se fige et tire vers l'arrière. Que faites-vous ?",
        answers: [
          {
            label:
              "Je réduis la distance, je garde une laisse détendue et je contacte le propriétaire si la consigne manque.",
            isCorrect: true,
            feedback:
              "Bonne réponse : vous protégez l'animal, respectez ses limites et restez dans le cadre des consignes.",
          },
          {
            label:
              "Je force la promenade pour respecter la durée prévue et éviter d'inquiéter le propriétaire.",
            isCorrect: false,
            feedback:
              "À éviter : forcer un animal anxieux peut aggraver le stress et créer un risque de fuite ou de morsure.",
          },
          {
            label:
              "Je détache le chien pour qu'il se calme plus vite et choisisse lui-même son chemin.",
            isCorrect: false,
            feedback:
              "Non : un chien anxieux ne doit pas être détaché sans autorisation explicite et environnement maîtrisé.",
          },
        ],
      },
      {
        scenario:
          "Le chien refuse sa gamelle ce matin alors que le propriétaire ne signale aucun changement de régime. Il semble apathique. Comment réagissez-vous ?",
        answers: [
          {
            label:
              "J'observe et je note les comportements, je donne de l'eau fraîche, et je contacte le propriétaire pour signaler le changement.",
            isCorrect: true,
            feedback:
              "Bonne réponse : signaler rapidement tout changement de comportement alimentaire est essentiel.",
          },
          {
            label:
              "Je lui propose de la nourriture humaine pour relancer l'appétit, car l'essentiel est qu'il mange quelque chose.",
            isCorrect: false,
            feedback:
              "À éviter : modifier le régime sans autorisation peut aggraver les troubles digestifs.",
          },
          {
            label:
              "Je ne dis rien au propriétaire pour éviter de l'inquiéter si c'est passager.",
            isCorrect: false,
            feedback:
              "Non : le propriétaire doit toujours être informé de tout changement de comportement ou d'alimentation.",
          },
        ],
      },
      {
        scenario:
          "Au retour d'une promenade, vous remarquez que le chien boite légèrement d'une patte arrière. Il n'a pas crié et continue de marcher. Que faites-vous ?",
        answers: [
          {
            label:
              "Je le laisse se reposer et continue les promenades habituelles le lendemain sans changer le programme.",
            isCorrect: false,
            feedback:
              "À éviter : continuer une activité normale peut aggraver une blessure non diagnostiquée.",
          },
          {
            label:
              "Je cesse l'effort, j'examine visuellement la patte, je note la symptomatologie et je préviens le propriétaire immédiatement.",
            isCorrect: true,
            feedback:
              "Bonne réponse : toute boiterie soudaine doit être signalée sans délai pour évaluation vétérinaire si nécessaire.",
          },
          {
            label:
              "Je lui mets un bandage avec du matériel disponible sur place pour éviter d'aggraver.",
            isCorrect: false,
            feedback:
              "Non : appliquer un bandage sans diagnostic peut masquer la blessure ou gêner la circulation.",
          },
        ],
      },
      {
        scenario:
          "Un livreur sonne à la porte. Le chien aboie fortement et saute vers la sortie dès que vous entrouvrez. Il n'y a pas de consigne spéciale dans le dossier. Que faites-vous ?",
        answers: [
          {
            label:
              "Je maîtrise le chien avant d'ouvrir, demande au livreur de déposer le colis et ne laisse pas entrer de visiteur non prévu.",
            isCorrect: true,
            feedback:
              "Bonne réponse : sécuriser l'animal avant toute ouverture de porte est une règle fondamentale.",
          },
          {
            label:
              "J'ouvre la porte en laissant le chien accueillir le livreur pour le socialiser.",
            isCorrect: false,
            feedback:
              "À éviter : exposer un chien excité à un inconnu sans consigne préalable est un risque de morsure ou de fuite.",
          },
          {
            label:
              "Je laisse le livreur entrer pour montrer que le chien est inoffensif.",
            isCorrect: false,
            feedback:
              "Non : vous n'avez pas l'autorisation d'introduire des tiers dans le domicile sans consigne du propriétaire.",
          },
        ],
      },
      {
        scenario:
          "Vous gardez deux chiens qui vivent normalement ensemble. Dans le jardin, ils s'élancent l'un vers l'autre avec des grognements intenses. Que faites-vous ?",
        answers: [
          {
            label:
              "Je me glisse entre les deux pour les séparer manuellement et immédiatement.",
            isCorrect: false,
            feedback:
              "Dangereux : s'interposer physiquement lors d'un conflit canin est la principale cause de morsures accidentelles.",
          },
          {
            label:
              "Je fais du bruit fort pour interrompre le conflit, j'utilise un obstacle (chaise, panneau) et j'alerte le propriétaire sans retard.",
            isCorrect: true,
            feedback:
              "Bonne réponse : une distraction sonore et un obstacle physique permettent une séparation sécurisée.",
          },
          {
            label:
              "J'attends qu'ils se calment seuls, car les chiens du même foyer se réconcillient toujours d'eux-mêmes.",
            isCorrect: false,
            feedback:
              "À éviter : sans intervention sécurisée, un conflit peut s'aggraver et blesser les deux animaux.",
          },
        ],
      },
    ],
  },
  {
    id: "cats",
    label: "Chats",
    detail: "Territoire, litière, alimentation, manipulation douce.",
    publicBadge: "Expert chats",
    questions: [
      {
        scenario:
          "Vous arrivez pour une visite à domicile. Le chat sous traitement se cache sous un meuble et refuse le contact. Quelle est la meilleure conduite ?",
        answers: [
          {
            label:
              "Je vérifie le protocole, je limite les gestes brusques et je préviens le propriétaire si la prise n'est pas faisable sereinement.",
            isCorrect: true,
            feedback:
              "Bonne réponse : la sécurité et la traçabilité priment, surtout avec un traitement médical.",
          },
          {
            label:
              "Je le sors rapidement de sa cachette pour terminer la visite dans le temps prévu.",
            isCorrect: false,
            feedback:
              "À éviter : sortir un chat de force peut provoquer griffures, fuite et perte de confiance.",
          },
          {
            label:
              "Je publie la situation sur un groupe pour demander comment donner le médicament.",
            isCorrect: false,
            feedback:
              "Non : les informations médicales et le domicile restent confidentiels.",
          },
        ],
      },
      {
        scenario:
          "Le chat urine à côté de sa litière depuis votre arrivée, alors que le propriétaire ne mentionne pas ce comportement. Que faites-vous ?",
        answers: [
          {
            label:
              "Je nettoie avec un produit adapté, je note la fréquence et je signale au propriétaire ; si cela persiste, je mentionne la possibilité d'une consultation.",
            isCorrect: true,
            feedback:
              "Bonne réponse : tout changement éliminatoire doit être tracé et signalé au propriétaire.",
          },
          {
            label:
              "Je pense que c'est une erreur ponctuelle et j'attends la fin de la garde pour en parler.",
            isCorrect: false,
            feedback:
              "À éviter : attendre peut laisser passer un signe d'infection urinaire ou de stress pathologique.",
          },
          {
            label:
              "Je change complètement la position et le type de litière pour corriger le problème moi-même.",
            isCorrect: false,
            feedback:
              "Non : modifier l'environnement sans consigne peut aggraver le comportement et perturber davantage le chat.",
          },
        ],
      },
      {
        scenario:
          "En arrivant pour la visite du soir, vous observez que le chat respire vite, en ouvrant légèrement la bouche. Il n'y a pas de consigne spécifique dans le dossier. Que faites-vous ?",
        answers: [
          {
            label:
              "Je suppose que c'est du stress lié à ma présence et je pars après avoir changé la gamelle.",
            isCorrect: false,
            feedback:
              "Dangereux : une respiration buccale chez un chat peut indiquer une détresse respiratoire grave nécessitant une urgence.",
          },
          {
            label:
              "Je contacte immédiatement le propriétaire et, si non joignable, j'appelle un vétérinaire d'urgence.",
            isCorrect: true,
            feedback:
              "Bonne réponse : la respiration buccale est une alerte vétérinaire prioritaire chez le chat.",
          },
          {
            label:
              "Je mets le chat dans une pièce sombre pour qu'il se calme, en attendant de voir si ça passe.",
            isCorrect: false,
            feedback:
              "Non : isoler un chat en détresse respiratoire retarde la prise en charge urgente.",
          },
        ],
      },
      {
        scenario:
          "Chaque fois que vous entrez par la porte principale, le chat se précipite vers la sortie. Le propriétaire ne mentionne pas de gestion spécifique. Comment évitez-vous la fugue ?",
        answers: [
          {
            label:
              "J'entre en deux temps : je bloque d'abord le passage avec mon corps, je dépose mes affaires, puis j'ouvre pleinement une fois l'espace maîtrisé.",
            isCorrect: true,
            feedback:
              "Bonne réponse : anticiper le comportement de fuite et contrôler l'espace permet d'éviter l'accident.",
          },
          {
            label:
              "Je laisse la porte entrouverte pour ne pas stresser le chat avec un bruit de claquement.",
            isCorrect: false,
            feedback:
              "À éviter : une porte entrouverte est une invitation à s'échapper pour un chat curieux ou stressé.",
          },
          {
            label:
              "Je laisse le chat sortir un court moment et je le rappelle ensuite.",
            isCorrect: false,
            feedback:
              "Non : laisser sortir un chat sans autorisation vous rend responsable de toute fugue ou accident.",
          },
        ],
      },
      {
        scenario:
          "Lors d'une caresse, le chat se retourne brutalement et vous griffe profondément la main. Il siffle et recule dans un coin. Quelle est votre réaction ?",
        answers: [
          {
            label:
              "Je ne le suis pas, je désinfecte la blessure, je note l'heure et le comportement, et je préviens le propriétaire.",
            isCorrect: true,
            feedback:
              "Bonne réponse : ne pas forcer le contact et documenter l'incident est la conduite professionnelle attendue.",
          },
          {
            label:
              "Je punis verbalement le chat pour qu'il comprenne que ce comportement est inacceptable.",
            isCorrect: false,
            feedback:
              "À éviter : punir un chat l'agresse davantage et peut provoquer une nouvelle agression.",
          },
          {
            label:
              "Je ne préviens pas le propriétaire car une égratignure de chat est normale.",
            isCorrect: false,
            feedback:
              "Non : tout incident, même mineur, doit être documenté et signalé pour traçabilité et sécurité.",
          },
        ],
      },
    ],
  },
  {
    id: "birds",
    label: "Oiseaux",
    detail: "Cage, sorties contrôlées, prévention des fuites.",
    publicBadge: "Expert oiseaux",
    questions: [
      {
        scenario:
          "Un propriétaire demande une sortie quotidienne pour son oiseau. En arrivant, une fenêtre est entrouverte. Que faites-vous avant d'ouvrir la cage ?",
        answers: [
          {
            label:
              "Je sécurise la pièce, ferme les ouvertures, vérifie les consignes puis seulement ensuite j'ouvre la cage.",
            isCorrect: true,
            feedback:
              "Bonne réponse : l'environnement doit être sécurisé avant toute manipulation.",
          },
          {
            label:
              "J'ouvre la cage tout de suite pour respecter l'habitude de sortie.",
            isCorrect: false,
            feedback:
              "À éviter : une ouverture non sécurisée suffit pour perdre l'animal.",
          },
          {
            label:
              "Je déplace la cage dans une autre pièce sans prévenir, même si ce n'est pas prévu.",
            isCorrect: false,
            feedback:
              "Non : modifier l'environnement sans consigne peut stresser l'animal.",
          },
        ],
      },
      {
        scenario:
          "En arrivant le matin, vous trouvez l'oiseau au fond de la cage. Il est debout mais ne monte pas sur son perchoir et reste immobile. Que faites-vous ?",
        answers: [
          {
            label:
              "Je contacte immédiatement le propriétaire et je surveille l'évolution en documentant les signes observés, sans manipuler l'oiseau.",
            isCorrect: true,
            feedback:
              "Bonne réponse : un oiseau immobile au fond de sa cage est un signe d'alerte ; le documenter et alerter est la bonne conduite.",
          },
          {
            label:
              "Je sors l'oiseau de la cage et je le tiens dans mes mains pour l'aider à récupérer.",
            isCorrect: false,
            feedback:
              "À éviter : manipuler un oiseau affaibli peut aggraver son état de stress et masquer les symptômes.",
          },
          {
            label:
              "Je lui donne de l'eau sucrée car c'est souvent suffisant pour les oiseaux affaiblis.",
            isCorrect: false,
            feedback:
              "Non : administrer quoi que ce soit sans consigne vétérinaire est interdit dans le protocole de garde.",
          },
        ],
      },
      {
        scenario:
          "L'oiseau n'a pas touché à ses graines depuis deux repas. Sa mangeoire est pleine et l'eau est fraîche. Comment réagissez-vous ?",
        answers: [
          {
            label:
              "J'ajoute une friandise sucrée non prévue pour relancer l'appétit.",
            isCorrect: false,
            feedback:
              "À éviter : modifier l'alimentation sans consigne peut déséquilibrer le régime d'un oiseau fragile.",
          },
          {
            label:
              "Je note la durée sans alimentation, vérifie que tout est en ordre et signale au propriétaire en mentionnant d'autres signes éventuels.",
            isCorrect: true,
            feedback:
              "Bonne réponse : chez les oiseaux, un jeûne de deux repas doit toujours être signalé au propriétaire.",
          },
          {
            label:
              "Je pense que l'oiseau fait un caprice et j'attends la fin de la garde sans intervenir.",
            isCorrect: false,
            feedback:
              "Non : les oiseaux dissimulent souvent leurs symptômes ; ne pas signaler une anorexie peut être dangereux.",
          },
        ],
      },
      {
        scenario:
          "Vous remarquez que l'oiseau tire sur ses propres plumes depuis votre arrivée, créant de petites zones dégarnies. Le dossier ne mentionne pas ce comportement. Que faites-vous ?",
        answers: [
          {
            label:
              "Je note le comportement, j'évite de stresser davantage l'animal, et je préviens le propriétaire car le plumage peut signaler stress ou pathologie.",
            isCorrect: true,
            feedback:
              "Bonne réponse : le plumage compulsif est un indicateur important de stress ou de maladie à signaler sans délai.",
          },
          {
            label:
              "Je rajoute des jouets dans la cage pour que l'oiseau se distraie et arrête.",
            isCorrect: false,
            feedback:
              "À éviter : introduire des objets non prévus peut perturber davantage un oiseau déjà stressé.",
          },
          {
            label:
              "C'est normal en période de mue : je ne dis rien au propriétaire pour ne pas l'inquiéter.",
            isCorrect: false,
            feedback:
              "Non : le plumage auto-infligé n'est pas de la mue normale ; confondre les deux peut retarder un traitement nécessaire.",
          },
        ],
      },
      {
        scenario:
          "En observant l'oiseau sur son perchoir, vous remarquez qu'il tient une patte de manière anormale et sautille sur l'autre. Il semble par ailleurs actif. Que faites-vous ?",
        answers: [
          {
            label:
              "Je préviens rapidement le propriétaire en décrivant précisément la posture, et je demande s'il y a des instructions d'urgence à suivre.",
            isCorrect: true,
            feedback:
              "Bonne réponse : toute anomalie de posture chez un oiseau doit être signalée ; seul le propriétaire ou le vétérinaire peut évaluer la suite.",
          },
          {
            label:
              "Je stabilise la patte moi-même avec un peu de ruban adhésif pour éviter qu'il l'aggrave.",
            isCorrect: false,
            feedback:
              "Dangereux : manipuler et ligaturer la patte d'un oiseau sans formation peut causer une nécrose ou aggraver la blessure.",
          },
          {
            label:
              "Je pense que c'est une position habituelle et j'attends la fin de la garde.",
            isCorrect: false,
            feedback:
              "À éviter : ignorer un comportement anormal retarde une prise en charge pouvant être urgente.",
          },
        ],
      },
    ],
  },
  {
    id: "nacs",
    label: "NAC",
    detail: "Lapins, rongeurs, reptiles, température et alimentation.",
    publicBadge: "Expert NAC",
    questions: [
      {
        scenario:
          "Vous gardez un lapin. Il mange peu depuis le matin et reste immobile, alors que le propriétaire indique qu'il mange normalement beaucoup de foin. Quelle réaction est attendue ?",
        answers: [
          {
            label:
              "Je signale rapidement le changement, je suis les consignes d'urgence et je ne modifie pas l'alimentation au hasard.",
            isCorrect: true,
            feedback:
              "Bonne réponse : chez les NAC, une baisse d'alimentation peut devenir urgente.",
          },
          {
            label:
              "J'attends le lendemain, car les petits animaux changent souvent de rythme.",
            isCorrect: false,
            feedback:
              "À éviter : attendre peut être dangereux, surtout pour un lapin qui ne s'alimente plus.",
          },
          {
            label:
              "Je donne une friandise non prévue pour relancer l'appétit.",
            isCorrect: false,
            feedback:
              "Non : l'alimentation spécifique doit respecter les consignes du propriétaire.",
          },
        ],
      },
      {
        scenario:
          "Le cochon d'Inde émet des couinements inhabituels et répétés depuis plusieurs minutes. Il ne semble pas blessé mais est très agité. Que faites-vous ?",
        answers: [
          {
            label:
              "Je vérifie son environnement (température, eau, nourriture), je note les comportements et je contacte le propriétaire pour obtenir des consignes précises.",
            isCorrect: true,
            feedback:
              "Bonne réponse : une vocalisation inhabituelle peut indiquer de la douleur, du stress ou un besoin urgent de soins.",
          },
          {
            label:
              "Je couvre la cage pour le calmer, car les rongeurs ont souvent besoin d'obscurité.",
            isCorrect: false,
            feedback:
              "À éviter : couvrir la cage peut aggraver le stress si l'animal souffre, et retarder l'identification du problème.",
          },
          {
            label:
              "Je pense que c'est normal et j'attends qu'il se calme sans intervenir.",
            isCorrect: false,
            feedback:
              "Non : ignorer une vocalisation inhabituelle prolongée peut laisser passer une urgence médicale.",
          },
        ],
      },
      {
        scenario:
          "En arrivant, vous constatez que la lampe chauffante du terrarium est éteinte. Le reptile est au fond, immobile. La température est en dessous des normes indiquées dans le dossier. Que faites-vous ?",
        answers: [
          {
            label:
              "Je prends le reptile dans mes mains pour le réchauffer en attendant de trouver une solution.",
            isCorrect: false,
            feedback:
              "À éviter : manipuler un reptile hypothermique peut le stresser encore davantage et aggraver son état.",
          },
          {
            label:
              "Je contacte immédiatement le propriétaire, je ne manipule pas l'animal et je tente de rétablir la source de chaleur selon les consignes du dossier.",
            isCorrect: true,
            feedback:
              "Bonne réponse : les reptiles sont ectothermes ; une panne de chauffage est une urgence à traiter selon le protocole.",
          },
          {
            label:
              "Je mets le terrarium en plein soleil pour compenser rapidement la chaleur manquante.",
            isCorrect: false,
            feedback:
              "Non : une chaleur directe non contrôlée peut tuer un reptile ; seul le dispositif prévu doit être utilisé.",
          },
        ],
      },
      {
        scenario:
          "Le hamster ne se réveille pas alors qu'il devrait être actif. Il est froid au toucher, immobile et ne réagit pas au bruit. La pièce est à 16 °C. Que faites-vous ?",
        answers: [
          {
            label:
              "Je note l'heure, je vérifie la température de la pièce (possible torpeur), je contacte le propriétaire sans déplacer l'animal brutalement.",
            isCorrect: true,
            feedback:
              "Bonne réponse : à basse température un hamster peut entrer en torpeur ; un réchauffement progressif sous consigne est nécessaire.",
          },
          {
            label:
              "Je pose l'animal directement sous une lampe chauffante pour le réchauffer vite.",
            isCorrect: false,
            feedback:
              "Dangereux : un réchauffement trop rapide peut être fatal pour un petit rongeur en torpeur.",
          },
          {
            label:
              "Je suppose qu'il est mort et je l'enterre dans le jardin avant de prévenir le propriétaire.",
            isCorrect: false,
            feedback:
              "Non : agir sans vérification est une faute grave ; un animal en torpeur peut être sauvé si pris en charge correctement.",
          },
        ],
      },
      {
        scenario:
          "En arrivant, vous constatez que le furet a échappé de son enclos et se cache quelque part dans la maison. Le propriétaire n'est pas joignable immédiatement. Que faites-vous ?",
        answers: [
          {
            label:
              "Je ferme toutes les pièces pour limiter ses déplacements, je le retrouve calmement avec sa récompense habituelle, et je laisse un message détaillé au propriétaire.",
            isCorrect: true,
            feedback:
              "Bonne réponse : limiter la zone de recherche et utiliser les repères olfactifs connus de l'animal est la méthode la plus efficace.",
          },
          {
            label:
              "Je laisse la maison ouverte pour qu'il sorte si nécessaire et revienne de lui-même.",
            isCorrect: false,
            feedback:
              "Non : laisser la maison ouverte expose le furet à un risque de fugue permanente et vous engage en responsabilité.",
          },
          {
            label:
              "Je ne fais rien et j'attends le retour du propriétaire car les furets retrouvent toujours leur chemin.",
            isCorrect: false,
            feedback:
              "À éviter : un furet peut se blesser ou s'échapper définitivement si on ne sécurise pas la situation immédiatement.",
          },
        ],
      },
    ],
  },
  {
    id: "senior",
    label: "Animaux âgés",
    detail: "Mobilité, traitement, surveillance et fatigue.",
    publicBadge: "Expert animaux âgés",
    questions: [
      {
        scenario:
          "Un chien âgé sous surveillance renforcée se lève difficilement et semble plus fatigué que d'habitude. Que devez-vous faire ?",
        answers: [
          {
            label:
              "Je note l'évolution, j'adapte l'effort, je respecte le protocole et je préviens le propriétaire si l'état change.",
            isCorrect: true,
            feedback:
              "Bonne réponse : les animaux âgés demandent une observation calme, documentée et prudente.",
          },
          {
            label:
              "Je maintiens exactement la même activité pour éviter de changer ses habitudes.",
            isCorrect: false,
            feedback:
              "À éviter : une routine doit rester adaptée à l'état réel de l'animal.",
          },
          {
            label:
              "Je lui donne un médicament que j'ai déjà utilisé pour un autre animal âgé.",
            isCorrect: false,
            feedback:
              "Non : aucun traitement ne doit être donné hors protocole vétérinaire transmis.",
          },
        ],
      },
      {
        scenario:
          "Le chien âgé a vomi deux fois depuis le matin. Il a bu de l'eau mais refusé sa gamelle. Le protocole ne mentionne pas de traitement anti-nausée. Comment agissez-vous ?",
        answers: [
          {
            label:
              "Je cesse de proposer de la nourriture solide, je surveille l'hydratation, je note la fréquence des vomissements et j'avertis le propriétaire.",
            isCorrect: true,
            feedback:
              "Bonne réponse : les vomissements répétés chez un animal âgé doivent être signalés rapidement et l'alimentation adaptée.",
          },
          {
            label:
              "Je lui donne de l'eau gazeuse pour aider la digestion car c'est souvent efficace chez les chiens.",
            isCorrect: false,
            feedback:
              "Non : l'eau gazeuse peut aggraver les troubles digestifs et n'est pas un traitement reconnu en garde animale.",
          },
          {
            label:
              "J'augmente la ration alimentaire pour compenser la perte et maintenir son poids.",
            isCorrect: false,
            feedback:
              "À éviter : forcer l'alimentation d'un animal nauséeux peut provoquer de nouveaux vomissements.",
          },
        ],
      },
      {
        scenario:
          "Le chien âgé a fait ses besoins à l'intérieur alors que vous veniez juste de rentrer d'une sortie. C'est la première fois. Que faites-vous ?",
        answers: [
          {
            label:
              "Je nettoie sans le gronder, je note l'heure et la fréquence, je propose des sorties plus régulières et je préviens le propriétaire de cet épisode.",
            isCorrect: true,
            feedback:
              "Bonne réponse : un accident isolé chez un animal âgé peut être le premier signe d'une incontinence à surveiller ou d'une infection.",
          },
          {
            label:
              "Je réprimande le chien pour qu'il comprenne que ce n'est pas acceptable à l'intérieur.",
            isCorrect: false,
            feedback:
              "À éviter : punir un animal âgé pour un accident involontaire est contre-productif et peut aggraver l'anxiété.",
          },
          {
            label:
              "Je ne note rien car c'est ponctuel et ne mérite pas d'être signalé au propriétaire.",
            isCorrect: false,
            feedback:
              "Non : tout incident doit être documenté ; chez un animal âgé, un premier accident peut annoncer un suivi médical nécessaire.",
          },
        ],
      },
      {
        scenario:
          "La chatte âgée n'a pas touché à sa gamelle depuis hier soir. Elle reste couchée et ne réagit plus à ses jouets habituels. Que faites-vous ?",
        answers: [
          {
            label:
              "Je contacte le propriétaire pour signaler la situation, je surveille la respiration et l'hydratation, et je demande s'il faut consulter un vétérinaire.",
            isCorrect: true,
            feedback:
              "Bonne réponse : chez un animal âgé, une anorexie combinée à une léthargie est une urgence potentielle à signaler sans délai.",
          },
          {
            label:
              "Je change son alimentation par une autre marque plus appétente que j'ai à disposition.",
            isCorrect: false,
            feedback:
              "Non : modifier le régime sans consigne peut perturber un animal âgé dont la digestion est souvent sensible.",
          },
          {
            label:
              "J'attends un jour de plus car les chats âgés ont souvent des variations d'appétit normales.",
            isCorrect: false,
            feedback:
              "À éviter : attendre face à une anorexie prolongée chez un animal âgé peut laisser passer un état grave.",
          },
        ],
      },
      {
        scenario:
          "Le chien âgé marche en cercle, semble désorienté et ne reconnaît pas les pièces habituelles de la maison. Il n'a pas eu de choc apparent. Que faites-vous ?",
        answers: [
          {
            label:
              "Je contacte immédiatement le propriétaire et, si non joignable, le vétérinaire indiqué dans le protocole ; je reste avec l'animal et j'empêche qu'il se blesse.",
            isCorrect: true,
            feedback:
              "Bonne réponse : une désorientation soudaine chez un animal âgé peut indiquer un accident vasculaire ou une crise neurologique nécessitant une urgence vétérinaire.",
          },
          {
            label:
              "Je pense que c'est de la vieillesse normale et j'évite d'inquiéter le propriétaire inutilement.",
            isCorrect: false,
            feedback:
              "Non : une désorientation soudaine n'est pas normale ; confondre un symptôme neurologique avec la vieillesse peut coûter la vie à l'animal.",
          },
          {
            label:
              "Je lui donne un médicament calmant disponible dans la maison pour éviter qu'il se blesse.",
            isCorrect: false,
            feedback:
              "Dangereux : administrer un médicament non prescrit à un animal en crise peut interagir fatalement avec ses traitements actuels.",
          },
        ],
      },
    ],
  },
];

