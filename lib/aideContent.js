// ── Catégories du centre d'aide ─────────────────────────────────────────────
export const categories = {
  fr: [
    { slug: "mise-en-route", emoji: "🚀", title: "Mise en route", description: "Créer votre église, se connecter, télécharger l'app", count: 1 },
    { slug: "membres", emoji: "🧭", title: "Membres", description: "Suivi des membres", count: 9 },
    { slug: "evangelisation", emoji: "✝️", title: "Évangélisation", description: "Suivre les nouvelles âmes et leur parcours", count: 4 },
    { slug: "cellules", emoji: "🏠", title: "Cellules", description: "Créer et gérer vos cellules et responsables", count: 6 },
    { slug: "conseiller", emoji: "🤝", title: "Conseiller", description: "Accompagner les membres dans leur parcours", count: 4 },
    { slug: "familles", emoji: "👑", title: "Familles", description: "Organiser et suivre les familles", count: 4 },
    { slug: "espace-enfants", emoji: "🦁", title: "Espace enfants", description: "Gérer le ministère enfants", count: 3 },
    { slug: "presences", emoji: "✍🏻", title: "Registre de présences", description: "Check-in et suivi des présences", count: 3 },
    { slug: "rapports", emoji: "📊", title: "Rapports", description: "Statistiques, exports et vision globale", count: 5 },
    { slug: "baptemes", emoji: "💧", title: "Baptêmes", description: "Suivre les baptêmes et leur préparation", count: 2 },
    { slug: "espace-administrateur", emoji: "⚙️", title: "Espace administrateur", description: "Paramètres et gestion de l'église", count: 4 },
  ],
  en: [
    { slug: "mise-en-route", emoji: "🚀", title: "Getting started", description: "Create your church, log in, download the app", count: 1 },
    { slug: "membres", emoji: "🧭", title: "Members", description: "Member tracking", count: 9 },
    { slug: "evangelisation", emoji: "✝️", title: "Evangelism", description: "Follow up new souls and their journey", count: 4 },
    { slug: "cellules", emoji: "🏠", title: "Cell groups", description: "Create and manage cell groups and leaders", count: 6 },
    { slug: "conseiller", emoji: "🤝", title: "Counsellor", description: "Accompany members through their journey", count: 4 },
    { slug: "familles", emoji: "👑", title: "Families", description: "Organise and follow up families", count: 4 },
    { slug: "espace-enfants", emoji: "🦁", title: "Children's space", description: "Manage the children's ministry", count: 3 },
    { slug: "presences", emoji: "✍🏻", title: "Attendance register", description: "Check-in and attendance tracking", count: 3 },
    { slug: "rapports", emoji: "📊", title: "Reports", description: "Statistics, exports and overview", count: 5 },
    { slug: "baptemes", emoji: "💧", title: "Baptisms", description: "Track baptisms and their preparation", count: 2 },
    { slug: "espace-administrateur", emoji: "⚙️", title: "Admin space", description: "Church settings and administration", count: 4 },
  ],
};

// ── Fonctionnalités / tutoriels par catégorie ───────────────────────────────
// Chaque entrée devient une carte sur /aide/[slug], qui pointera ensuite vers
// /aide/[slug]/[tutorial] pour le tutoriel détaillé pas-à-pas.
export const tutorials = {
  "mise-en-route": {
    fr: {
      subtitle:
        "Tout ce qu'il faut pour démarrer avec SoulTrack : créer votre église, vous connecter et télécharger l'application.",
      items: [
        { slug: "creer-eglise", emoji: "⛪", title: "Créer mon église" },
      ],
    },
    en: {
      subtitle:
        "Everything you need to get started with SoulTrack: create your church, log in and download the app.",
      items: [
        { slug: "creer-eglise", emoji: "⛪", title: "Create my church" },
      ],
    },
  },
  membres: {
    fr: {
      subtitle:
        "Retrouvez ici tous les tutoriels pour gérer vos membres au quotidien : ajout et suivi des membres, création de conseillers, baptêmes et présences aux réunions.",
      items: [
        { slug: "formulaire-nouveau-membre", emoji: "📤", title: "Envoyer le formulaire d'église — Nouveau membre" },
        { slug: "list-members", emoji: "🏛️", title: "Gérer les membres" },
        { slug: "suivis-membres", emoji: "💌", title: "Suivi des membres" },
        { slug: "create-conseiller", emoji: "➕", title: "Créer un conseiller" },
        { slug: "list-conseillers", emoji: "🗃️", title: "Liste des conseillers" },
        { slug: "baptemes", emoji: "💧", title: "Baptêmes" },
        { slug: "attendance-reunion", emoji: "🛐", title: "Saisie et suivi des présences aux réunions" },
        { slug: "presence-individuelle", emoji: "✍🏻", title: "Saisie de présence individuelle" },
        { slug: "statistiques-presence", emoji: "✅", title: "Statistiques de présence individuelle" },
      ],
    },
    en: {
      subtitle:
        "Find every tutorial for managing your members day to day: adding and tracking members, creating counselors, baptisms and meeting attendance.",
      items: [
        { slug: "formulaire-nouveau-membre", emoji: "📤", title: "Send church form — New member" },
        { slug: "list-members", emoji: "🏛️", title: "Manage members" },
        { slug: "suivis-membres", emoji: "💌", title: "Member follow-up" },
        { slug: "create-conseiller", emoji: "➕", title: "Create a counselor" },
        { slug: "list-conseillers", emoji: "🗃️", title: "Counselors list" },
        { slug: "baptemes", emoji: "💧", title: "Baptisms" },
        { slug: "attendance-reunion", emoji: "🛐", title: "Meeting attendance entry & tracking" },
        { slug: "presence-individuelle", emoji: "✍🏻", title: "Individual attendance entry" },
        { slug: "statistiques-presence", emoji: "✅", title: "Individual attendance statistics" },
      ],
    },
  },
};

// ── Contenu détaillé pas-à-pas d'un tutoriel ────────────────────────────────
// Clé : "categorieSlug/tutorielSlug" → { fr: {...}, en: {...} }
export const tutorialDetails = {
  "mise-en-route/creer-eglise": {
    fr: {
      title: "Créer mon église",
      subtitle: "Cinq étapes pour mettre en place votre église sur SoulTrack.",
      steps: [
        {
          title: 'Cliquer sur "Créer mon église"',
          description: 'Depuis la page d\'accueil ou le menu du site, cliquez sur le bouton "Créer mon église".',
        },
        {
          title: "Choisir le plan",
          description: "Sélectionnez la formule qui correspond à la taille et aux besoins de votre église.",
        },
        {
          title: 'Cliquer sur "Commencer"',
          description: "Validez votre choix de plan pour lancer le formulaire d'inscription.",
        },
        {
          title: "Remplir les informations nécessaires",
          description: "Nom de l'église, pays, email de l'administrateur et mot de passe.",
        },
        {
          title: "Créer l'église",
          description: "Confirmez pour finaliser la création et accéder à votre tableau de bord.",
        },
      ],
    },
    en: {
      title: "Create my church",
      subtitle: "Five steps to set up your church on SoulTrack.",
      steps: [
        {
          title: 'Click "Create my church"',
          description: 'From the homepage or the site menu, click the "Create my church" button.',
        },
        {
          title: "Choose the plan",
          description: "Select the plan that fits the size and needs of your church.",
        },
        {
          title: 'Click "Get started"',
          description: "Confirm your plan choice to open the sign-up form.",
        },
        {
          title: "Fill in the required information",
          description: "Church name, country, administrator email and password.",
        },
        {
          title: "Create the church",
          description: "Confirm to finish creating your church and access your dashboard.",
        },
      ],
    },
  },
};
