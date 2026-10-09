/*
 |--------------------------------------------------------------------------
 | Dictionnaires de traduction du site public (landing + consultation).
 |--------------------------------------------------------------------------
 | Le français sert de référence : le dictionnaire malgache est typé
 | `typeof dictFr`, donc tout clé manquante est une erreur de compilation.
 | Les titres utilisent la syntaxe riche de i18n.tsx : *emphase* et \n.
 */

export const dictFr = {
  code: "fr",
  name: "Français",
  common: {
    login: "Se connecter",
    openDashboard: "Ouvrir le tableau de bord",
    home: "Accueil",
    privacy: "Confidentialité",
    legal: "Mentions légales",
    devBy: "Développement :",
    leadDev: "Lead Développeur",
  },
  landing: {
    brandAria: "FJKM Gestionnaire — accueil",
    nav: ["Fonctionnalités", "Sécurité", "Verset du jour", "Équipe", "FAQ"],
    mainNavAria: "Navigation principale",
    menuOpen: "Ouvrir le menu",
    menuClose: "Fermer le menu",
    skipLink: "Aller au contenu",
    hero: {
      eyebrowPre: "REGISTRE COMMUNAUTAIRE",
      eyebrowOrg: "FJKM MALAZA GILEADA",
      title: "Une gestion claire\npour une *communauté engagée.*",
      description:
        "Suivez les obligations, les contributions, les fidèles et les projets de votre paroisse dans un même espace de confiance.",
      ctaConsult: "Consulter les flux publics",
      ctaFeatures: "Découvrir les fonctionnalités",
      note: "Gestion réservée aux membres habilités · flux agrégés consultables par tous, en lecture seule",
    },
    preview: {
      aria: "Aperçu illustratif de l’application, avec des libellés génériques",
      space: "ESPACE PAROISSIAL",
      live: "Espace de gestion",
      overline: "VOTRE PAROISSE · EN UN SEUL ESPACE",
      rowsAria: "Exemples de modules",
      title: "Le registre, avec\nplus de sérénité.",
      copy: "Des outils pour servir la communauté au quotidien.",
      rows: [
        { name: "Adidy", sub: "Suivi des obligations", status: "À jour" },
        { name: "Mouvements", sub: "Entrées & sorties", status: "Registre" },
        { name: "Projets", sub: "Avancement partagé", status: "En cours" },
      ],
      footnote: "Des informations accessibles aux personnes habilitées",
      floatTop: ["Un seul espace", "Pour votre communauté"],
      floatBottom: ["Foi & gestion", "Au service de l’église"],
    },
    features: {
      eyebrow: "LES OUTILS DU QUOTIDIEN",
      title: "Tout le registre de la paroisse,\n*un seul outil.*",
      lead:
        "Du suivi des obligations aux projets de l’église, chaque module aide les responsables à travailler avec clarté et à mieux servir la communauté.",
      modules: [
        {
          title: "Obligations · adidy",
          copy: "Suivez les adidy mois par mois, avec relances et soldes calculés automatiquement.",
        },
        {
          title: "Entrées & sorties",
          copy: "Enregistrez chaque mouvement de caisse et visualisez la trésorerie en temps réel.",
        },
        {
          title: "Fidèles",
          copy: "Un annuaire complet : matricule, groupe, baptême, communion et coordonnées.",
        },
        {
          title: "Communion",
          copy: "Paiements de communion par période, avec tableaux de bord dédiés.",
        },
        {
          title: "Projets",
          copy: "Créez les projets de l’église et suivez budgets, dépenses et avancement.",
        },
        {
          title: "Rapports & exports",
          copy: "Rapports filtrables et exports PDF et Excel pour les responsables.",
        },
      ],
    },
    security: {
      eyebrow: "CONFIANCE & RESPONSABILITÉ",
      title: "Des données réservées\naux utilisateurs *autorisés.*",
      copy: "La rigueur dans la gestion va de pair avec le respect de la confiance confiée à chaque responsable.",
      privacyLink: "Lire la politique de confidentialité",
      safeguards: [
        "Mots de passe hachés et sessions sécurisées",
        "Rôles distincts : ADMIN, USER, VISITEUR",
        "Journalisation des actions pour un suivi clair",
        "Protection CSRF, XSS et injection SQL",
      ],
      seal: "PROTÉGER\n& SERVIR",
      aria: "Mesures de sécurité",
    },
    process: {
      eyebrow: "SIMPLE ET BIEN ORDONNÉ",
      title: "Prêt en *trois étapes.*",
      lead: "Un parcours clair, au service de la gestion de votre paroisse.",
      steps: [
        { title: "Connexion", copy: "Chaque membre reçoit ses accès depuis l’administration." },
        { title: "Saisie", copy: "Enregistrez obligations, entrées, sorties et communion au fil de l’eau." },
        { title: "Suivi", copy: "Consultez tableaux de bord, rapports et exports quand vous en avez besoin." },
      ],
    },
    faq: {
      eyebrow: "VOUS ACCOMPAGNER",
      title: "Questions\n*fréquentes.*",
      lead: "Quelques repères pour accéder à votre espace et l’utiliser au quotidien.",
      ctaAuthed: "Ouvrir mon espace",
      ctaGuest: "Accéder à mon espace",
      questions: [
        {
          question: "Qui peut accéder à l’application ?",
          answer:
            "La gestion (saisie, modification, rapports détaillés) est réservée aux membres habilités de FJKM Malaza Gileada, avec les rôles ADMIN, USER et VISITEUR. Un espace public de consultation permet à chacun de suivre les grands flux d’entrées et sorties d’argent, en lecture seule et sans mot de passe.",
        },
        {
          question: "Que se passe-t-il si j’oublie mon mot de passe ?",
          answer: "Contactez un administrateur : la réinitialisation est gérée uniquement par l’ADMIN.",
        },
        {
          question: "Les données sont-elles sécurisées ?",
          answer:
            "L’application applique des protections des comptes, des accès et des opérations décrites dans la section Sécurité. Consultez également la politique de confidentialité.",
        },
        {
          question: "Puis-je exporter les rapports ?",
          answer:
            "Oui. Les rapports peuvent être imprimés ou exportés aux formats PDF, Excel et CSV pour faciliter le suivi des responsables.",
        },
        {
          question: "L’application fonctionne-t-elle sur mobile ?",
          answer:
            "Oui. L’interface est responsive et s’adapte aux écrans mobiles. L’application est également conçue pour un usage de type PWA.",
        },
      ],
      privacyInline: "Consulter la politique de confidentialité.",
    },
    dev: {
      initials: "NR",
      eyebrow: "LE PROJET ET SON ARTISAN",
      name: "Narindra Ranjalahy",
      role: "Lead Développeur — FJKM Gestionnaire",
      copy:
        "À la conception et au développement de cet outil de gestion, du premier écran jusqu’à la mise en ligne. Une question sur le fonctionnement ou une envie de faire évoluer l’application ? Il est à l’écoute de la communauté.",
      contacts: { email: "E-mail", whatsapp: "WhatsApp", portfolio: "Portfolio" },
    },
    closing: {
      eyebrow: "AU SERVICE DE LA COMMUNAUTÉ",
      title: "Rejoignez l’espace de gestion\n*de votre communauté.*",
      copy: "Accès réservé aux membres habilités de FJKM Malaza Gileada.",
      altPre: "Pas de compte ? ",
      altLink: "Consulter l’aperçu public des flux",
    },
    footer: {
      parish: "FJKM Malaza Gileada\nAntananarivo · Madagascar",
      information: "INFORMATIONS",
      valuesLabel: "UNE GESTION AU SERVICE DE L’ÉGLISE",
      valuesCopy: "Un outil de confiance pour une communauté engagée.",
      creditPre: "Développement : ",
      creditName: "Narindra Ranjalahy",
      creditRole: ", Lead Développeur",
      rights: "© {year} FJKM Malaza Gileada",
      corpus:
        "Corpus biblique : dépôt baiboly-json de RaveloMevaSoavina · édition et droits de reproduction à confirmer avant diffusion.",
      motto: "Foi · Ordre · Communauté",
    },
  },
  flux: {
    docTitle: "Consultation publique des flux · FJKM Gestionnaire",
    headerTitle: "Consultation publique",
    headerSub: "FJKM Malaza Gileada",
    months: ["Janv.", "Févr.", "Mars", "Avr.", "Mai", "Juin", "Juil.", "Août", "Sept.", "Oct.", "Nov.", "Déc."],
    hero: {
      eyebrowPre: "ESPACE PUBLIC",
      eyebrowTag: "LECTURE SEULE",
      title: "Les flux d’argent de la paroisse,\n*clairs et vérifiables.*",
      copy:
        "Consultez les entrées et les sorties sans créer de compte ni saisir de mot de passe. Seules des informations agrégées sont publiées : montants, catégories et mois — jamais de noms ni de détails internes.",
      yearsAria: "Choisir l’année",
      refresh: "Actualiser",
      loading: "Chargement des données publiques…",
    },
    kpi: {
      entries: "Total des entrées {year}",
      exits: "Total des sorties {year}",
      balance: "Solde de l’année",
      entriesNote: "Contributions, communion, obligations et projets réunis.",
      exitsNote: "Dépenses de fonctionnement et de la vie communautaire.",
      balancePositive: "Les entrées couvrent les sorties de la période.",
      balanceNegative: "Les sorties dépassent les entrées sur la période.",
    },
    chart: {
      eyebrow: "MOIS PAR MOIS",
      title: "Entrées et sorties d’argent · {year}",
      legendIn: "Entrées",
      legendOut: "Sorties",
      tooltipIn: "Entrées",
      tooltipOut: "Sorties",
    },
    categories: {
      eyebrowIn: "DÉTAIL DES RECETTES",
      titleIn: "Catégories d’entrées",
      eyebrowOut: "DÉTAIL DES DÉPENSES",
      titleOut: "Catégories de sorties",
      operations: "opération|opérations",
      emptyIn: "Aucune entrée de caisse catégorisée cette année.",
      emptyOut: "Aucune sortie de caisse catégorisée cette année.",
    },
    movements: {
      eyebrow: "DERNIERS MOUVEMENTS",
      title: "Les 12 derniers enregistrements · {year}",
      readonly: "Lecture seule",
      columns: ["Date", "Type", "Catégorie", "Montant"],
      entree: "Entrée",
      sortie: "Sortie",
      note:
        "Pour protéger la vie privée des fidèles, ni les noms, ni les libellés internes, ni les références ne sont publiés.",
    },
    privacy: {
      strong: "Un espace de consultation, pas de gestion.",
      copy: " Les données affichées sont en lecture seule et ne peuvent être modifiées ici. Pour saisir ou corriger un mouvement, passez par l’espace des membres habilités.",
      cta: "Accéder à mon espace",
    },
    empty: {
      eyebrow: "ANNÉE {year}",
      title: "Aucun flux publié pour l’instant",
      copy: "Les enregistrements de {year} apparaîtront ici dès la première saisie validée par les responsables.",
    },
    errors: {
      unavailable: "Service temporairement indisponible.",
      unexpected: "Réponse inattendue du service public.",
      load: "Erreur de chargement.",
      retry: "Réessayer",
    },
    footerNote: "Consultation publique en lecture seule",
  },
};

export type Dict = typeof dictFr;

export const dictMg: Dict = {
  code: "mg",
  name: "Malagasy",
  common: {
    login: "Hiditra",
    openDashboard: "Hanokatra ny sehatra fitantanana",
    home: "Fandraisana",
    privacy: "Fiainana manokana",
    legal: "Fanamafisana ara-dalàna",
    devBy: "Fampandrosoana :",
    leadDev: "Mpitarika ny mpamorona",
  },
  landing: {
    brandAria: "FJKM Gestionnaire — pejy fandraisana",
    nav: ["Fahaiza-manao", "Fahazoana antoka", "Andiniteny androany", "Antokona", "Fanontanina"],
    mainNavAria: "Fitetezena lehibe",
    menuOpen: "Hanokatra ny menu",
    menuClose: "Hanidy ny menu",
    skipLink: "Mandeha mankany amin'ny votoaty",
    hero: {
      eyebrowPre: "RAKITRA FIANGONANA",
      eyebrowOrg: "FJKM MALAZA GILEADA",
      title: "Fitantanana mazava\nho an'ny *fiangonana mandray anjara.*",
      description:
        "Ariao ny adidy, ny vatorna, ny mpino ary ny asa tanteraka ao an'ny paroisinao ao anaty sehatra iray feno fahatokisana.",
      ctaConsult: "Jereo ny vola miditra sy mivoahana",
      ctaFeatures: "Hahafantatra ny fahaiza-manao",
      note: "Fitantanana voaaro ho an'ny mpikambana manana alalana ihany · ny tatiny vola dia azon'ny rehetra jerena, famakiana ihany",
    },
    preview: {
      aria: "Sary ozatra mampiseho ny fampiharana, amin'ny lohateny iombonana",
      space: "SEHATRA PAROISY",
      live: "Sehatra fitantanana",
      overline: "NY PAROISINAO · SEHATRA TOKANA",
      rowsAria: "Ohatra de module",
      title: "Ny rakitra, amin'ny\n*fandriam-pahalemana bebe kokoa.*",
      copy: "Fitaovana hampiasa ny fiangonana isan'andro.",
      rows: [
        { name: "Adidy", sub: "Fijerana ny adidy", status: "Voafarany" },
        { name: "Fihetsika", sub: "Fidiram-bola sy famoaharana", status: "Rejesy" },
        { name: "Asa tanteraka", sub: "Fandrosoana zaraina", status: "Mandeha" },
      ],
      footnote: "Angona azo amin'ny olona manana alalana",
      floatTop: ["Sehatra tokana", "Ho an'ny fiangonana miaraka"],
      floatBottom: ["Finozana & fitantanana", "Miasa ho an'ny Fiangonana"],
    },
    features: {
      eyebrow: "NY FITAOVANA ANDANDEFRANO",
      title: "Ny rakitra rehetra an'ny paroisy,\n*fitaovana tokana.*",
      lead:
        "Manomboka amin'ny fijerana ny adidy ka hatramin'ny asa tanteraka an'ny Fiangonana, ny module rehetra dia manampy ny mpitantana handeha mazava sy hampiasa ny fiangonana tsara kokoa.",
      modules: [
        {
          title: "Adidy",
          copy: "Ariao ny adidy isam-bolana, miaraka amin'ny fampahafantarana sy ny sisa voamarina ho azy.",
        },
        {
          title: "Fidiram-bola sy famoaharana",
          copy: "Soraty ny vola miditra sy mivoahana tsirairay ary jereno mivantana ny kaositra.",
        },
        {
          title: "Mpino",
          copy: "Rejesy feno : anisam-pikambana, antokona, baptaozy, komiionia sy ny fifandraisana.",
        },
        {
          title: "Komiionia",
          copy: "Fandoavana ny komiionia isam-potoana, miaraka amin'ny sehatra fanarana manokana.",
        },
        {
          title: "Asa tanteraka",
          copy: "Mamorona ny asa tanteraka an'ny Fiangonana ary ariao ny tetibola, ny fandaniana sy ny fandrosoana.",
        },
        {
          title: "Tatiny sy export",
          copy: "Tatiny azo sivina ary export amin'ny PDF sy Excel ho an'ny mpitantana.",
        },
      ],
    },
    security: {
      eyebrow: "FAHATOKISANA & VATOANDRAIKITRA",
      title: "Angona voaaro ho an'ny\n*mpampiasa nahazo alalana fotsiny.*",
      copy: "Ny fahatsimbarana amin'ny fitantanana dia mandeha am-piaraha-miasa amin'ny fahamatorana ny fahatokisana nataho ny mpitantana tsirairay.",
      privacyLink: "Mamaky ny politika momba ny fiainana manokana",
      safeguards: [
        "Teny miahy voa-hachitra ary sesy azo antoka",
        "Anjara mifandimby : ADMIN, USER, VISITEUR",
        "Fisoratana ny hetsika rehetra ho amin'ny fanaraha-maso mazava",
        "Fiarovana CSRF, XSS sy injection SQL",
      ],
      seal: "HIARO\n& HIASA",
      aria: "Fiarovana ampiasaina",
    },
    process: {
      eyebrow: "MANGINTSY SY MIRINDRA",
      title: "Vonona *amin'ny dingana telo.*",
      lead: "Lalana mangintsy, ho amin'ny fitantanana ny paroisinao.",
      steps: [
        { title: "Fidirana", copy: "Ny mpikambana tsirairay mahazo ny alalan'ny fidirana amin'ny fitantanana." },
        { title: "Fisoratana", copy: "Record ny adidy, fidiram-bola, famoaharana sy komiionia isaky ny miseho." },
        { title: "Fijerana", copy: "Jereo ny sehatra, ny tatiny sy ny export rehefa mila azy ianao." },
      ],
    },
    faq: {
      eyebrow: "HANOHANA ANAO",
      title: "Fanontanina\n*matetika.*",
      lead: "Torohevitra kely hanamboarana ny sehatinao sy hanampiana anao hampiasa azy isan'andro.",
      ctaAuthed: "Hanokatra ny sehatiko",
      ctaGuest: "Hiditra amin'ny sehatiko",
      questions: [
        {
          question: "Iza no mahazo miditra amin'ny fampiharana?",
          answer:
            "Ny fitantanana (fisoratana, fanovana, tatiny mahalalavitra) dia voaaro ho an'ny mpikambana manana alalana ao FJKM Malaza Gileada, ny anjara ADMIN, USER ary VISITEUR. Misy sehatra famakiana ho an'ny besinimaro izay ahitan'ny rehetra ny fidiram-bola sy ny famoaharana lehibe, amin'ny famakiana ihany, fa tsy mila teny miahy.",
        },
        {
          question: "Inona no mety rahateo very teny miahy aho?",
          answer: "Mifandraisa amin'ny mpitantana : ny ADMIN ihany no mamaha ny fanamboarana indray.",
        },
        {
          question: "Voaaro ve ny angona?",
          answer:
            "Eny, apetraka ny fiarovana ny kaositra, ny fidirana ary ny hetsika rehetra voalaza ao amin'ny faritra Fahazoana antoka. Jereo koa ny politika momba ny fiainana manokana.",
        },
        {
          question: "Azoko atao ve ny manao export ny tatiny?",
          answer:
            "Eny. Azon'ny mpitantana atsingana na exported amin'ny endrika PDF, Excel sy CSV ny tatiny mba hanatevenana ny fanaraha-maso.",
        },
        {
          question: "Miasave ny fampiharana amin'ny finday?",
          answer:
            "Eny. Miova arakaraka ny habetsaky ny efijery ny fampiharana. Natao koa ho an'ny fampiasana karazana PWA izy.",
        },
      ],
      privacyInline: "Jereo ny politika momba ny fiainana manokana.",
    },
    dev: {
      initials: "NR",
      eyebrow: "NY TETIKASA SY NY MPAMORONA",
      name: "Narindra Ranjalahy",
      role: "Mpitarika ny mpamorona — FJKM Gestionnaire",
      copy:
        "Izy no nanolotra sy namorona itao fitaovana fitantanana itao, manomboka amin'ny efijery voalohany ka hatramin'ny napetraka ao anaty aterineto io. Fanontanina momba ny fomba fiasa na te hanatsara ny fampiharana ve ianao? Mifehy sofina ho an'ny fiangonana izy.",
      contacts: { email: "Mailaka", whatsapp: "WhatsApp", portfolio: "Portfolio" },
    },
    closing: {
      eyebrow: "HO AMIN'NY FIOMBINAN'NY FIANGONANA",
      title: "Mankafizo ny sehatra\n*fitantanana an'ny fiangonanao.*",
      copy: "Fidirana voaaro ho an'ny mpikambana manana alalana ao FJKM Malaza Gileada.",
      altPre: "Tsy manana kaonty? ",
      altLink: "Jereo ny tatiny ho an'ny besinimaro",
    },
    footer: {
      parish: "FJKM Malaza Gileada\nAntananarivo · Madagasikara",
      information: "ZAVATRA MANGATAKA",
      valuesLabel: "FITANTANANA MANOMPO NY FIANGONANA",
      valuesCopy: "Fitaovana azo itokisana ho an'ny fiangonana mandray anjara.",
      creditPre: "Fampandrosoana : ",
      creditName: "Narindra Ranjalahy",
      creditRole: ", Mpitarika ny mpamorona",
      rights: "© {year} FJKM Malaza Gileada",
      corpus:
        "Rakitra Baiboly : tangala baiboly-json an'i RaveloMevaSoavina · tokony ho hamarinina ny fanontana sy ny zon'ny fandindaana alohan'ny famoahana.",
      motto: "Finozana · Filaminana · Fiangonana",
    },
  },
  flux: {
    docTitle: "Famakiana ho an'ny besinimaro · FJKM Gestionnaire",
    headerTitle: "Famakiana ho an'ny besinimaro",
    headerSub: "FJKM Malaza Gileada",
    months: ["Jan.", "Feb.", "Mar.", "Apr.", "May", "Jona", "Jolay", "Aog.", "Sep.", "Okt.", "Nov.", "Des."],
    hero: {
      eyebrowPre: "SEHATRA IOMBONANA",
      eyebrowTag: "FAMAKIANA IHANY",
      title: "Ny fiovelan'ny vola an'ny paroisy,\n*mangintsy sy azo hamarinina.*",
      copy:
        "Jereo ny fidiram-bola sy ny famoaharana tsy mila kaonty na teny miahy. Angona voapisa ihany no amboarina : isa, sokajy ary volana — tsy misy anarana na antsipiriany anatiny.",
      yearsAria: "Safidio ny taona",
      refresh: "Hasofotina",
      loading: "Am-pidirana ny angona ho an'ny besinimaro…",
    },
    kpi: {
      entries: "Fidiram-bola {year}",
      exits: "Famoaharana {year}",
      balance: "Sisan'ny taona",
      entriesNote: "Vatorna, komiionia, adidy sy asa tanteraka ariaraina.",
      exitsNote: "Fandaniana fiasa sy fiainana fiangonana.",
      balancePositive: "Faika ny famoaharana ny fidiram-bola nandritra ny fotoana.",
      balanceNegative: "Mihoatra ny fidiram-bola ny famoaharana nandritra ny fotoana.",
    },
    chart: {
      eyebrow: "ISAN-BOLANA",
      title: "Fidiram-bola sy famoaharana · {year}",
      legendIn: "Fidiram-bola",
      legendOut: "Famoaharana",
      tooltipIn: "Fidiram-bola",
      tooltipOut: "Famoaharana",
    },
    categories: {
      eyebrowIn: "ANTSIPRIRY NY VOLA MIDITRA",
      titleIn: "Sokajin'ny fidiram-bola",
      eyebrowOut: "ANTSIPRIRY NY VOLA MIVOAHANA",
      titleOut: "Sokajin'ny famoaharana",
      operations: "fihetsika|fihetsika",
      emptyIn: "Tsy mbola misy fidiram-bola voasokajy amin'ity taona ity.",
      emptyOut: "Tsy mbola misy famoaharana voasokajy amin'ity taona ity.",
    },
    movements: {
      eyebrow: "FIHETSIKA FARANY",
      title: "Fisoratana 12 farany · {year}",
      readonly: "Famakiana ihany",
      columns: ["Daty", "Karazana", "Sokajy", "Isa"],
      entree: "Fiditra",
      sortie: "Mivoaka",
      note:
        "Mba hiarovana ny fiainana manokan'ny mpino, tsy amboarina ny anarana, ny lohateny anatiny na ny marika fampahafantarana.",
    },
    privacy: {
      strong: "Sehatra famakiana, tsy fitantanana.",
      copy:
        " Angona amin'ny famakiana ihany no atao eto, tsy azo ovana eto. Ho an'ny fisoratana na fanamboarana fihetsika, mankany amin'ny sehatry ny mpikambana manana alalana.",
      cta: "Hiditra amin'ny sehatiko",
    },
    empty: {
      eyebrow: "TAONA {year}",
      title: "Tsy mbola misy angona amboarina",
      copy: "Ho hita eto ny fisoratana an'i {year} rehefa voamariky ny mpitantana ny fisoratana voalohany.",
    },
    errors: {
      unavailable: "Itoa serivisy tsy mety mandritra ny fotoana kely.",
      unexpected: "Valiny tsy ampoizina avy amin'ny serivisy iombonana.",
      load: "Tsy nahomby ny ampidirana angona.",
      retry: "Andramo indray",
    },
    footerNote: "Famakiana ho an'ny besinimaro, famakiana ihany",
  },
};
