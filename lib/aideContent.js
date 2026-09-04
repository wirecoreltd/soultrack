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
        { slug: "formulaire-nouveau-membre", emoji: "📤", title: "Envoyer le formulaire d'église pour enregistrer un Nouveau membre" },
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
        { slug: "formulaire-nouveau-membre", emoji: "📤", title: "Send Church form to register a New member" },
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

    "membres/formulaire-nouveau-membre": {
    fr: {
      title: "Envoyer le formulaire d'église pour enregistrer un Nouveau membre",
      subtitle: "",
      steps: [
        {
          title: "Aller dans **l'Espace Membres**",
          description: "Depuis le tableau de bord, ouvrez la section **Espace Membres**.",
        },
        {
          title: 'Cliquer sur **"Envoyer formulaire Église – Nouveau membre"**',
          description: "Le bouton se trouve en bas de la page.",
        },
        {
          title: "Saisir un numéro (optionnel)",
          description: "Tapez un numéro WhatsApp dans le champ prévu, ou laissez-le vide pour choisir directement un contact dans **WhatsApp**.",
        },
        {
          title: 'Cliquer sur **"Envoyer"**',
          description: "**WhatsApp** s'ouvre avec un message pré-rempli contenant le nom de l'église et le lien du formulaire.",
        },
        {
          title: "Choisir le destinataire dans **WhatsApp**",
          description: "Si aucun numéro n'a été saisi, sélectionnez le contact à qui envoyer le message.",
        },
        {
          title: "Le destinataire ouvre le lien reçu",
          description: 'Le lien affiche le formulaire **"Ajouter un nouveau membre"** avec le logo et le nom de l\'église déjà remplis.',
        },
        {
          title: "Le destinataire remplit et envoie le formulaire",
          description: 'Une fois complété, il clique sur **"Ajouter"** : le nouveau membre est enregistré directement dans l\'église.',
        },
      ],
    },
    en: {
      title: "Send Church form to register a New member",
      subtitle: "",
      steps: [
        {
          title: "Go to the **Members Space**",
          description: "From the dashboard, open the **Members Space** section.",
        },
        {
          title: 'Click **"Send Church form – New member"**',
          description: "The button is located at the bottom of the page.",
        },
        {
          title: "Enter a phone number (optional)",
          description: "Type a WhatsApp number in the field, or leave it blank to pick a contact directly in **WhatsApp**.",
        },
        {
          title: 'Click **"Send"**',
          description: "**WhatsApp** opens with a pre-filled message containing the church name and the form link.",
        },
        {
          title: "Choose the recipient in **WhatsApp**",
          description: "If no number was entered, select the contact to send the message to.",
        },
        {
          title: "The recipient opens the link",
          description: 'The link shows the **"Add a new member"** form with the church logo and name already filled in.',
        },
        {
          title: "The recipient fills in and submits the form",
          description: 'Once completed, they click **"Add"**: the new member is registered directly in the church.',
        },
      ],
    },
  },

  "membres/list-members": {
    fr: {
      title: "Gérer les membres",
      subtitle: "Retrouvez, filtrez et gérez tous vos membres au quotidien.",
      steps: [
        { title: "Rechercher un membre", description: "Utilisez la barre de recherche pour retrouver un membre par prénom ou nom." },
        { title: "Filtrer par état de contact", description: "Affichez uniquement les nouveaux contacts, les membres existants ou les inactifs." },
        { title: 'Cliquer sur "Ajouter un membre"', description: "Ouvre le formulaire d'ajout manuel d'un nouveau contact." },
        { title: 'Cliquer sur "Importer une liste"', description: "Permet d'importer plusieurs membres en une fois depuis un fichier." },
        { title: "Ouvrir le menu du téléphone", description: "Cliquez sur le numéro pour appeler, envoyer un SMS ou contacter par WhatsApp." },
        { title: "Envoyer le contact en suivi", description: "Choisissez une cellule, un conseiller, une famille ou un numéro, puis envoyez le contact." },
        { title: "Marquer comme membre existant", description: "Sur un nouveau contact, faites-le passer dans les membres existants." },
        { title: "Afficher les détails du membre", description: "Cliquez sur \"Détails\" pour voir l'identité, le suivi, la vie spirituelle et le parcours." },
        { title: "Exporter la fiche en PDF", description: "Générez un document PDF reprenant les informations du membre." },
        { title: "Ajouter ou consulter les suivis", description: "Ouvrez le suivi pastoral du membre pour enregistrer un accompagnement." },
        { title: "Suivre la progression en leadership", description: "Pour les membres en développement, ouvrez leur suivi de progression." },
        { title: "Modifier le contact", description: "Éditez l'ensemble des informations de la fiche membre." },
        { title: "Marquer l'intégration comme terminée", description: "Détache le contact du conseiller une fois son intégration achevée." },
        { title: "Supprimer le contact", description: "Supprime définitivement la fiche et tout son historique (action irréversible)." },
      ],
    },
    en: {
      title: "Manage members",
      subtitle: "Find, filter and manage all your members day to day.",
      steps: [
        { title: "Search for a member", description: "Use the search bar to find a member by first or last name." },
        { title: "Filter by contact state", description: "Show only new contacts, existing members, or inactive contacts." },
        { title: 'Click "Add a member"', description: "Opens the form to manually add a new contact." },
        { title: 'Click "Import a list"', description: "Lets you import several members at once from a file." },
        { title: "Open the phone menu", description: "Click the number to call, text, or contact via WhatsApp." },
        { title: "Send the contact for follow-up", description: "Choose a cell group, counsellor, family or number, then send the contact." },
        { title: "Mark as existing member", description: "Move a new contact into existing members." },
        { title: "View member details", description: "Click \"Details\" to see identity, follow-up, spiritual life and journey." },
        { title: "Export the record as PDF", description: "Generate a PDF document with the member's information." },
        { title: "Add or view follow-ups", description: "Open the pastoral follow-up to log an accompaniment." },
        { title: "Track leadership progress", description: "For members in development, open their leadership progress tracking." },
        { title: "Edit the contact", description: "Edit all the information on the member's record." },
        { title: "Mark integration as complete", description: "Detaches the contact from the counsellor once integration is finished." },
        { title: "Delete the contact", description: "Permanently deletes the record and its whole history (irreversible)." },
      ],
    },
  },

  "membres/suivis-membres": {
    fr: {
      title: "Envoyer un membre en suivi",
      subtitle: "Cinq étapes pour transmettre un contact par WhatsApp.",
      steps: [
        { title: 'Cliquer sur "Envoyer par WhatsApp"', description: "Depuis la fiche du membre, après avoir choisi une cellule, un conseiller ou une famille." },
        { title: "Vérification automatique des doublons", description: "Le système vérifie si le numéro du contact existe déjà." },
        { title: "Confirmer l'envoi malgré un doublon", description: "Si un doublon est détecté, choisissez d'envoyer quand même ou d'annuler." },
        { title: "Vérifier le nom et le numéro du responsable", description: "Contrôlez ou corrigez les informations avant l'envoi final." },
        { title: 'Cliquer sur "Envoyer"', description: "WhatsApp s'ouvre avec le message pré-rempli et le contact passe en \"existant\"." },
      ],
    },
    en: {
      title: "Send a member for follow-up",
      subtitle: "Five steps to forward a contact via WhatsApp.",
      steps: [
        { title: 'Click "Send via WhatsApp"', description: "From the member's record, after choosing a cell group, counsellor or family." },
        { title: "Automatic duplicate check", description: "The system checks whether the contact's number already exists." },
        { title: "Confirm sending despite a duplicate", description: "If a duplicate is found, choose to send anyway or cancel." },
        { title: "Check the recipient's name and number", description: "Review or correct the details before the final send." },
        { title: 'Click "Send"', description: "WhatsApp opens with the pre-filled message and the contact becomes \"existing\"." },
      ],
    },
  },
};
