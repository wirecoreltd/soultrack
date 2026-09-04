// ── Catégories du centre d'aide ─────────────────────────────────────────────
export const categories = {
  fr: [
    { slug: "mise-en-route", emoji: "🚀", title: "Mise en route", description: "Créer votre église, se connecter, télécharger l'app", count: 1 },
    { slug: "membres", emoji: "🧭", title: "Membres", description: "Suivi des membres, conseillers, baptêmes et présences", count: 8 },
    { slug: "evangelisation", emoji: "✝️", title: "Évangélisation", description: "Suivre les nouvelles âmes et leur parcours", count: 4 },
    { slug: "cellules", emoji: "🏠", title: "Cellules", description: "Créer et gérer vos cellules et responsables", count: 6 },
    { slug: "conseiller", emoji: "🤝", title: "Conseiller", description: "Accompagner les membres dans leur parcours", count: 4 },
    { slug: "familles", emoji: "👑", title: "Familles", description: "Organiser et suivre les familles", count: 4 },
    { slug: "espace-enfants", emoji: "🦁", title: "Espace enfants", description: "Gérer le ministère enfants", count: 3 },
    { slug: "rapports", emoji: "📊", title: "Rapports", description: "Statistiques, exports et vision globale", count: 5 },
    { slug: "espace-administrateur", emoji: "⚙️", title: "Espace administrateur", description: "Paramètres et gestion de l'église", count: 4 },
  ],
  en: [
    { slug: "mise-en-route", emoji: "🚀", title: "Getting started", description: "Create your church, log in, download the app", count: 1 },
    { slug: "membres", emoji: "🧭", title: "Members", description: "Member tracking, counsellors, baptisms and attendance", count: 8 },
    { slug: "evangelisation", emoji: "✝️", title: "Evangelism", description: "Follow up new souls and their journey", count: 4 },
    { slug: "cellules", emoji: "🏠", title: "Cell groups", description: "Create and manage cell groups and leaders", count: 6 },
    { slug: "conseiller", emoji: "🤝", title: "Counsellor", description: "Accompany members through their journey", count: 4 },
    { slug: "familles", emoji: "👑", title: "Families", description: "Organise and follow up families", count: 4 },
    { slug: "espace-enfants", emoji: "🦁", title: "Children's space", description: "Manage the children's ministry", count: 3 },
    { slug: "rapports", emoji: "📊", title: "Reports", description: "Statistics, exports and overview", count: 5 },
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
        "Gérez vos membres, conseillers, baptêmes et présences depuis un seul endroit.",
      items: [
        { slug: "list-members", emoji: "🏛️", title: "Gérer les membres" },
        { slug: "suivis-membres", emoji: "💌", title: "Suivi des membres" },
        { slug: "create-conseiller", emoji: "➕", title: "Créer un conseiller" },
        { slug: "list-conseillers", emoji: "🗃️", title: "Liste des conseillers" },
        { slug: "baptemes", emoji: "💧", title: "Baptêmes" },
        { slug: "attendance", emoji: "🛐", title: "Présences aux réunions" },
        { slug: "presence", emoji: "✍🏻", title: "Enregistrement individuel des présences" },
        { slug: "rapport-presence", emoji: "✅", title: "Statistiques de présence individuelle" },
      ],
    },
    en: {
      subtitle:
        "Manage your members, counsellors, baptisms and attendance all in one place.",
      items: [
        { slug: "list-members", emoji: "🏛️", title: "Manage members" },
        { slug: "suivis-membres", emoji: "💌", title: "Member follow-up" },
        { slug: "create-conseiller", emoji: "➕", title: "Create a Counselor" },
        { slug: "list-conseillers", emoji: "🗃️", title: "Counselors list" },
        { slug: "baptemes", emoji: "💧", title: "Baptisms" },
        { slug: "attendance", emoji: "🛐", title: "Meeting Attendance Entry & Tracking" },
        { slug: "presence", emoji: "✍🏻", title: "Individual Attendance Entry" },
        { slug: "rapport-presence", emoji: "✅", title: "Individual Attendance Statistics" },
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
          title: 'Cliquer sur **"Créer mon église"**',
          description: 'Depuis la page d\'accueil ou le menu du site, cliquez sur le bouton **"Créer mon église"**.',
        },
        {
          title: "Choisir le **plan**",
          description: "Sélectionnez la formule qui correspond à la taille et aux besoins de votre église.",
        },
        {
          title: 'Cliquer sur **"Commencer"**',
          description: "Validez votre choix de plan pour lancer le formulaire d'inscription.",
        },
        {
          title: "Remplir les informations nécessaires",
          description: "Nom de l'église, pays, email de l'administrateur et mot de passe.",
        },
        {
          title: "Créer l'église",
          description: "Confirmez pour finaliser la création et accéder à votre **tableau de bord**.",
        },
      ],
    },
    en: {
      title: "Create my church",
      subtitle: "Five steps to set up your church on SoulTrack.",
      steps: [
        {
          title: 'Click **"Create my church"**',
          description: 'From the homepage or the site menu, click the **"Create my church"** button.',
        },
        {
          title: "Choose the **plan**",
          description: "Select the plan that fits the size and needs of your church.",
        },
        {
          title: 'Click **"Get started"**',
          description: "Confirm your plan choice to open the sign-up form.",
        },
        {
          title: "Fill in the required information",
          description: "Church name, country, administrator email and password.",
        },
        {
          title: "Create the church",
          description: "Confirm to finish creating your church and access your **dashboard**.",
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
      title: "Gérer le statut de suivi d'un membre",
      subtitle: "",
      steps: [
        {
          title: "Mettre à jour le statut de suivi",
          description:
            'Dans le menu déroulant **Statut Intégration**, choisissez **En Suivis** (accompagnement en cours), **Intégrer** (le parcours d\'intégration est terminé — pour une cellule ou une famille, le contact rejoint alors officiellement la liste des membres et devient visible dans le **module Cellules** ou **Familles**) ou **Refus** (le membre a décliné le suivi). Cliquez sur **"Sauvegarder"** pour enregistrer. Ce statut est aussi visible directement sur la **fiche du contact dans l\'Espace Membres**.',
        },
        {
          title: 'Afficher ou masquer les membres refusés',
          description:
            'En haut de la page, cliquez sur **"Voir les refus"** pour n\'afficher que les membres au statut **Refus**, ou sur **"Voir tous les suivis"** pour revenir à la liste normale. En mode refus, le commentaire et le statut sont **verrouillés** ; seul le bouton **Réactiver** reste disponible pour reprendre le suivi.',
        },
        {
          title: 'Modifier le contact',
          description: 'Depuis les détails (hors mode refus), cliquez sur **"✏️ Modifier le contact"** pour éditer sa fiche.',
        },
        {
          title: "Ajouter un suivi pastoral depuis les détails",
          description:
            'Dans la section Soin pastoral, cliquez sur **"💡 Ajouter / Voir suivis"** : renseignez la date et le type d\'action (**Appel**, **Visite**, **Entretien**), cochez les besoins avec leur statut (**En suivi** / **Résolu**), répondez aux questions d\'entretien si besoin, ajoutez un commentaire, puis cliquez sur **"Ajouter suivi"**.',
        },
        {
          title: "Bon à savoir : liste filtrée selon votre rôle",
          description:
            "Cette page n'affiche que les membres qui vous sont **attribués** : un **conseiller** voit uniquement ses assignations, un **responsable de cellule** voit sa cellule (et ses cellules filles), un **responsable de familles** voit ses familles.",
        },
      ],
    },
    en: {
      title: "Manage a member's follow-up status",
      subtitle: "",
      steps: [
        {
          title: "Update the follow-up status",
          description:
            'In the **Integration Status** dropdown, choose **In Follow-up** (active accompaniment), **Integrated** (the integration path is complete — for a cell group or family, the contact then officially joins the member list and becomes visible in the **Cell groups** or **Families module**) or **Declined** (the member declined follow-up). Click **"Save"** to confirm. This status is also visible directly on the contact\'s record in the **Members space**.',
        },
        {
          title: "Show or hide declined members",
          description:
            'At the top of the page, click **"View declined"** to show only members with **Declined** status, or **"View all follow-ups"** to return to the normal list. In declined view, the comment and status are **locked** (read-only); only the **Reactivate** button remains available to resume follow-up.',
        },
        {
          title: "Edit the contact",
          description: 'From the details (outside declined view), click **"✏️ Edit contact"** to edit their record.',
        },
        {
          title: "Add a pastoral follow-up from the details",
          description:
            'In the Pastoral care section, click **"💡 Add / View follow-ups"**: enter the date and action type (**Call**, **Visit**, **Meeting**), check the needs with their status (**In follow-up** / **Resolved**), answer the interview questions if needed, add a comment, then click **"Add follow-up"**.',
        },
        {
          title: "Good to know: list filtered by your role",
          description:
            "This page only shows members **assigned to you**: a **counsellor** sees only their own assignments, a **cell group leader** sees their cell group (and its sub-cells), a **family leader** sees their families.",
        },
      ],
    },
  },

  "membres/rechercher-filtrer-membres": {
    fr: {
      title: "Rechercher et filtrer les membres",
      subtitle: "",
      steps: [
        {
          title: "Rechercher un membre",
          description: "Utilisez la **barre de recherche** pour retrouver un membre par prénom ou nom.",
        },
        {
          title: "Filtrer par état de contact",
          description: "Utilisez le menu déroulant pour n'afficher que les **nouveaux**, les **existants** ou les **inactifs**.",
        },
      ],
    },
    en: {
      title: "Search and filter members",
      subtitle: "",
      steps: [
        {
          title: "Search for a member",
          description: "Use the **search bar** to find a member by first or last name.",
        },
        {
          title: "Filter by contact state",
          description: "Use the dropdown to show only **new**, **existing** or **inactive** contacts.",
        },
      ],
    },
  },

  "membres/importer-liste-membres": {
    fr: {
      title: "Importer une liste de membres",
      subtitle: "",
      steps: [
        {
          title: 'Cliquer sur **"Importer une liste"**',
          description: "Le bouton se trouve en haut de la page Liste des membres.",
        },
        {
          title: "Sélectionner le fichier",
          description: "Choisissez le fichier contenant la liste de vos membres à importer.",
        },
        {
          title: "Vérifier et valider l'importation",
          description: "Contrôlez les données détectées puis confirmez pour ajouter les membres à votre église.",
        },
      ],
    },
    en: {
      title: "Import a list of members",
      subtitle: "",
      steps: [
        {
          title: 'Click **"Import a list"**',
          description: "The button is at the top of the Members list page.",
        },
        {
          title: "Select the file",
          description: "Choose the file containing the list of members to import.",
        },
        {
          title: "Review and confirm the import",
          description: "Check the detected data, then confirm to add the members to your church.",
        },
      ],
    },
  },

  "membres/contacter-telephone": {
    fr: {
      title: "Contacter un membre par téléphone",
      subtitle: "",
      steps: [
        {
          title: "Cliquer sur le numéro de téléphone",
          description: "Sous la fiche du membre, cliquez sur son **numéro de téléphone**.",
        },
        {
          title: "Choisir une option",
          description: "Sélectionnez **Appeler**, **SMS**, **Appel WhatsApp** ou **Message WhatsApp**.",
        },
      ],
    },
    en: {
      title: "Contact a member by phone",
      subtitle: "",
      steps: [
        {
          title: "Click the phone number",
          description: "Under the member's record, click their **phone number**.",
        },
        {
          title: "Choose an option",
          description: "Select **Call**, **SMS**, **WhatsApp Call** or **WhatsApp Message**.",
        },
      ],
    },
  },

  "membres/details-membre": {
    fr: {
      title: "Consulter la fiche d'un membre",
      subtitle: "",
      steps: [
        {
          title: 'Cliquer sur **"Détails"**',
          description: "Sous la fiche du membre, ouvre l'ensemble de ses informations.",
        },
        {
          title: "Parcourir les sections",
          description: "Identité, suivi, **vie spirituelle**, parcours et soin pastoral.",
        },
        {
          title: "Exporter la fiche en PDF",
          description: "Cliquez sur le bouton d'export pour générer un document reprenant toutes les informations du membre.",
        },
      ],
    },
    en: {
      title: "View a member's record",
      subtitle: "",
      steps: [
        {
          title: 'Click **"Details"**',
          description: "Under the member's record, opens all their information.",
        },
        {
          title: "Browse the sections",
          description: "Identity, follow-up, **spiritual life**, journey and pastoral care.",
        },
        {
          title: "Export the record as PDF",
          description: "Click the export button to generate a document with all the member's information.",
        },
      ],
    },
  },

  "membres/presence-membre": {
    fr: {
      title: "Voir la présence d'un membre",
      subtitle: "",
      steps: [
        {
          title: "Repérer le point de présence",
          description: "À côté du nom du membre, un petit **point coloré** indique son statut de présence.",
        },
        {
          title: "Cliquer sur le point",
          description: "Ouvre le détail de sa présence sur les **5 dernières semaines**.",
        },
        {
          title: "Consulter le détail par semaine",
          description: "Voyez à quel **temps de l'église** (culte, réunion…) il a assisté chaque semaine.",
        },
      ],
    },
    en: {
      title: "View a member's attendance",
      subtitle: "",
      steps: [
        {
          title: "Find the attendance dot",
          description: "Next to the member's name, a small **coloured dot** shows their attendance status.",
        },
        {
          title: "Click the dot",
          description: "Opens their attendance detail over the **last 5 weeks**.",
        },
        {
          title: "View the weekly detail",
          description: "See which **church service** they attended each week.",
        },
      ],
    },
  },

  "membres/marquer-membre-existant": {
    fr: {
      title: "Marquer comme membre existant",
      subtitle: "",
      steps: [
        {
          title: 'Repérer un contact **"Nouveau"**',
          description: "Dans la liste des membres, repérez un contact avec le badge **Nouveau**.",
        },
        {
          title: 'Cliquer sur **"✅ Marquer comme membre"**',
          description: "Le contact passe directement en **membre existant**, sans être rattaché à une cellule, un conseiller ou une famille.",
        },
        {
          title: "Confirmer",
          description: "Validez le message de confirmation pour appliquer le changement.",
        },
        {
          title: "Bon à savoir",
          description: "Un membre déjà **existant** peut lui aussi être **envoyé en suivi** vers une cellule, un conseiller ou une famille à tout moment.",
        },
      ],
    },
    en: {
      title: "Mark as existing member",
      subtitle: "",
      steps: [
        {
          title: 'Find a **"New"** contact',
          description: "In the members list, look for a contact with the **New** badge.",
        },
        {
          title: 'Click **"✅ Mark as member"**',
          description: "The contact becomes an **existing member** directly, without being attached to a cell group, counsellor or family.",
        },
        {
          title: "Confirm",
          description: "Confirm the message to apply the change.",
        },
        {
          title: "Good to know",
          description: "An **existing** member can also be **sent for follow-up** to a cell group, counsellor or family at any time.",
        },
      ],
    },
  },

  "membres/suivi-pastoral": {
    fr: {
      title: "Ajouter un suivi pastoral",
      subtitle: "",
      steps: [
        {
          title: 'Cliquer sur **"💡 Ajouter / Voir suivis"**',
          description: "Depuis les détails du membre, dans la section Soin pastoral.",
        },
        {
          title: "Renseigner la date et le type d'action",
          description: "Choisissez la date, puis **Appel**, **Visite** ou **Entretien**.",
        },
        {
          title: "Cocher les besoins exprimés",
          description: "Sélectionnez un ou plusieurs besoins et indiquez leur statut : **En suivi** ou **Résolu**.",
        },
        {
          title: "Répondre aux questions d'entretien",
          description: "Optionnel : notez les réponses aux questions sur l'état général, la vie spirituelle, les combats, etc.",
        },
        {
          title: "Ajouter un commentaire",
          description: "Complétez avec un commentaire libre si besoin.",
        },
        {
          title: 'Cliquer sur **"Ajouter suivi"**',
          description: "Le suivi est enregistré et apparaît dans l'historique du membre.",
        },
      ],
    },
    en: {
      title: "Add a pastoral follow-up",
      subtitle: "",
      steps: [
        {
          title: 'Click **"💡 Add / View follow-ups"**',
          description: "From the member's details, in the Pastoral care section.",
        },
        {
          title: "Enter the date and action type",
          description: "Choose the date, then **Call**, **Visit** or **Meeting**.",
        },
        {
          title: "Check the needs expressed",
          description: "Select one or more needs and set their status: **In follow-up** or **Resolved**.",
        },
        {
          title: "Answer the interview questions",
          description: "Optional: note the answers about general state, spiritual life, struggles, etc.",
        },
        {
          title: "Add a comment",
          description: "Add a free comment if needed.",
        },
        {
          title: 'Click **"Add follow-up"**',
          description: "The follow-up is saved and appears in the member's history.",
        },
      ],
    },
  },

  "membres/progression-leadership": {
    fr: {
      title: "Suivre la progression en leadership",
      subtitle: "",
      steps: [
        {
          title: 'Cliquer sur **"🏆 Suivi de la progression en leadership"**',
          description: "Visible uniquement si le membre est en **parcours de développement**.",
        },
        {
          title: "Choisir l'étape actuelle du parcours",
          description: "**Potentiel identifié**, **Serviteur fidèle**, **Leader en croissance** ou **Leader confirmé**.",
        },
        {
          title: "Renseigner la date du suivi",
          description: "Sélectionnez la date de cette évaluation.",
        },
        {
          title: "Cocher les observations par section",
          description: "Responsabilité, cœur de serviteur, vision, leadership relationnel, fidélité, capacité d'apprentissage, zone de transformation…",
        },
        {
          title: "Définir la prochaine étape",
          description: "Choisissez une action à venir, un objectif et une date de prochain suivi.",
        },
        {
          title: 'Cliquer sur **"Ajouter un suivi"**',
          description: "L'évaluation est enregistrée dans l'historique du membre.",
        },
      ],
    },
    en: {
      title: "Track leadership progress",
      subtitle: "",
      steps: [
        {
          title: 'Click **"🏆 Leadership Growth Tracking"**',
          description: "Only visible if the member is in a **development path**.",
        },
        {
          title: "Choose the current stage",
          description: "**Potential identified**, **Faithful Servant**, **Growing leader** or **Established Leader**.",
        },
        {
          title: "Enter the follow-up date",
          description: "Select the date for this evaluation.",
        },
        {
          title: "Check observations by section",
          description: "Responsibility, servant's heart, vision, relational leadership, faithfulness, ability to learn, growth zone…",
        },
        {
          title: "Set the next step",
          description: "Choose an upcoming action, a goal, and a date for the next follow-up.",
        },
        {
          title: 'Click **"Add follow up"**',
          description: "The evaluation is saved in the member's history.",
        },
      ],
    },
  },

  "membres/definir-serviteur": {
    fr: {
      title: "Définir un membre en tant que serviteur",
      subtitle: "",
      steps: [
        {
          title: "Ouvrir la fiche du membre en modification",
          description: 'Cliquez sur **"✏️ Modifier le contact"** depuis ses détails.',
        },
        {
          title: 'Cocher **"⭐ Définir en tant que serviteur"**',
          description: "La liste des ministères apparaît automatiquement.",
        },
        {
          title: "Sélectionner un ou plusieurs ministères",
          description: "Cochez tous les ministères dans lesquels le membre sert.",
        },
        {
          title: 'Préciser si **"Autre"** est coché',
          description: "Indiquez le nom du ministère dans le champ texte qui apparaît.",
        },
        {
          title: 'Cliquer sur **"💾 Sauvegarder"**',
          description: "Le statut de serviteur et ses ministères sont enregistrés.",
        },
      ],
    },
    en: {
      title: "Set a member as a servant",
      subtitle: "",
      steps: [
        {
          title: "Open the member's record for editing",
          description: 'Click **"✏️ Edit contact"** from their details.',
        },
        {
          title: 'Check **"⭐ Define as a servant"**',
          description: "The list of ministries appears automatically.",
        },
        {
          title: "Select one or more ministries",
          description: "Check every ministry the member serves in.",
        },
        {
          title: 'Specify if **"Other"** is checked',
          description: "Enter the ministry name in the text field that appears.",
        },
        {
          title: 'Click **"💾 Save"**',
          description: "The servant status and their ministries are saved.",
        },
      ],
    },
  },

  "membres/modifier-contact": {
    fr: {
      title: "Modifier un contact",
      subtitle: "",
      steps: [
        {
          title: "Baptême d'eau",
          description: 'Répondre **Oui** ou **Non** ; si "Non", une option **"Veut se faire baptiser"** apparaît à cocher. Les noms cochés apparaissent automatiquement dans le **rapport des baptêmes**.',
        },
        {
          title: "Statut de suivi",
          description: "Choisir **En Attente**, **Intégrer** ou **Refus**.",
        },
        {
          title: 'Définir en tant que **"Pilier"**',
          description: "Cocher la case pour marquer le membre comme pilier de l'église.",
        },
        {
          title: "Activer le parcours de croissance leadership",
          description: "Cocher la case fait apparaître les 4 étapes du parcours à choisir. Voir le tutoriel **\"Suivre la progression en leadership\"** pour le détail.",
        },
      ],
    },
    en: {
      title: "Edit a contact",
      subtitle: "",
      steps: [
        {
          title: "Water baptism",
          description: 'Answer **Yes** or **No**; if "No", a **"Wants to be baptised"** option appears to check. Checked names automatically appear in the **baptism report**.',
        },
        {
          title: "Follow-up status",
          description: "Choose **Pending**, **Integrate** or **Refused**.",
        },
        {
          title: 'Define as **"Pillar"**',
          description: "Check the box to mark the member as a pillar of the church.",
        },
        {
          title: "Enable the leadership growth path",
          description: 'Checking the box shows the 4 stages of the path to choose from. See the **"Track leadership progress"** tutorial for details.',
        },
      ],
    },
  },

  "membres/create-conseiller": {
    fr: {
      title: "Créer un conseiller",
      subtitle: "Tutoriel détaillé à venir.",
      steps: [
        {
          title: "Contenu à venir",
          description: "Ce tutoriel sera complété avec les étapes détaillées prochainement.",
        },
      ],
    },
    en: {
      title: "Create a Counselor",
      subtitle: "Detailed tutorial coming soon.",
      steps: [
        {
          title: "Content coming soon",
          description: "This tutorial will be completed with detailed steps soon.",
        },
      ],
    },
  },

  "membres/list-conseillers": {
    fr: {
      title: "Liste des conseillers",
      subtitle: "Tutoriel détaillé à venir.",
      steps: [
        {
          title: "Contenu à venir",
          description: "Ce tutoriel sera complété avec les étapes détaillées prochainement.",
        },
      ],
    },
    en: {
      title: "Counselors list",
      subtitle: "Detailed tutorial coming soon.",
      steps: [
        {
          title: "Content coming soon",
          description: "This tutorial will be completed with detailed steps soon.",
        },
      ],
    },
  },

  "membres/baptemes": {
    fr: {
      title: "Baptêmes",
      subtitle: "Tutoriel détaillé à venir.",
      steps: [
        {
          title: "Contenu à venir",
          description: "Ce tutoriel sera complété avec les étapes détaillées prochainement.",
        },
      ],
    },
    en: {
      title: "Baptisms",
      subtitle: "Detailed tutorial coming soon.",
      steps: [
        {
          title: "Content coming soon",
          description: "This tutorial will be completed with detailed steps soon.",
        },
      ],
    },
  },

  "membres/attendance": {
    fr: {
      title: "Présences aux réunions",
      subtitle: "Tutoriel détaillé à venir.",
      steps: [
        {
          title: "Contenu à venir",
          description: "Ce tutoriel sera complété avec les étapes détaillées prochainement.",
        },
      ],
    },
    en: {
      title: "Meeting Attendance Entry & Tracking",
      subtitle: "Detailed tutorial coming soon.",
      steps: [
        {
          title: "Content coming soon",
          description: "This tutorial will be completed with detailed steps soon.",
        },
      ],
    },
  },

  "membres/presence": {
    fr: {
      title: "Enregistrement individuel des présences",
      subtitle: "Tutoriel détaillé à venir.",
      steps: [
        {
          title: "Contenu à venir",
          description: "Ce tutoriel sera complété avec les étapes détaillées prochainement.",
        },
      ],
    },
    en: {
      title: "Individual Attendance Entry",
      subtitle: "Detailed tutorial coming soon.",
      steps: [
        {
          title: "Content coming soon",
          description: "This tutorial will be completed with detailed steps soon.",
        },
      ],
    },
  },

  "membres/rapport-presence": {
    fr: {
      title: "Statistiques de présence individuelle",
      subtitle: "Tutoriel détaillé à venir.",
      steps: [
        {
          title: "Contenu à venir",
          description: "Ce tutoriel sera complété avec les étapes détaillées prochainement.",
        },
      ],
    },
    en: {
      title: "Individual Attendance Statistics",
      subtitle: "Detailed tutorial coming soon.",
      steps: [
        {
          title: "Content coming soon",
          description: "This tutorial will be completed with detailed steps soon.",
        },
      ],
    },
  },

  "membres/supprimer-contact": {
    fr: {
      title: "Supprimer un contact",
      subtitle: "",
      steps: [
        {
          title: "Ouvrir les détails du membre",
          description: 'Cliquez sur **"Détails"** sous la fiche du membre.',
        },
        {
          title: 'Cliquer sur **"🗑️ Supprimer le contact"**',
          description: "En bas de la fiche, dans la zone d'actions.",
        },
        {
          title: "Confirmer la suppression",
          description: "Cette action est **irréversible** : elle supprime aussi tout l'historique du contact.",
        },
      ],
    },
    en: {
      title: "Delete a contact",
      subtitle: "",
      steps: [
        {
          title: "Open the member's details",
          description: 'Click **"Details"** under the member\'s record.',
        },
        {
          title: 'Click **"🗑️ Delete contact"**',
          description: "At the bottom of the record, in the actions area.",
        },
        {
          title: "Confirm the deletion",
          description: "This action is **irreversible**: it also deletes the entire contact history.",
        },
      ],
    },
  },
};
