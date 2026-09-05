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
  evangelisation: {
    fr: {
      subtitle:
        "Centralisez vos contacts évangélisés, suivez leur parcours et générez des rapports détaillés.",
      items: [
        { slug: "liste-evangelises", emoji: "🌿", title: "Liste des évangélisés" },
        { slug: "suivis-evangelisation", emoji: "💗", title: "Suivis des évangélisés" },
        { slug: "rapport-evangelisation", emoji: "🗒️", title: "Rapport Évangélisation" },        
      ],
    },
    en: {
      subtitle:
        "Centralise your evangelised contacts, track their journey and generate detailed reports.",
      items: [
        { slug: "liste-evangelises", emoji: "🌿", title: "Evangelised list" },
        { slug: "suivis-evangelisation", emoji: "💗", title: "Evangelism follow-up" },
        { slug: "rapport-evangelisation", emoji: "🗒️", title: "Evangelism report" },        
      ],
    },
  },
};

// ── Sous-tutoriels d'un tutoriel (3ᵉ niveau de navigation) ──────────────────
// Clé : "categorieSlug/tutorielSlug" → { fr: {subtitle, items}, en: {...} }
// Les "items" pointent vers des clés déjà existantes dans tutorialDetails,
// sous la forme "categorieSlug/sousTutorielSlug".
export const subTutorials = {
  "membres/list-members": {
    fr: {
      subtitle: "Retrouvez, filtrez et gérez tous vos membres au quotidien.",
      items: [
        { slug: "rechercher-filtrer-membres", emoji: "🔍", title: "Rechercher et filtrer les membres" },
        { slug: "importer-liste-membres", emoji: "📥", title: "Importer une liste de membres" },
        { slug: "contacter-telephone", emoji: "📞", title: "Contacter un membre par téléphone" },
        { slug: "details-membre", emoji: "🪪", title: "Consulter la fiche d'un membre" },
        { slug: "presence-membre", emoji: "🟢", title: "Voir la présence d'un membre" },
        { slug: "marquer-membre-existant", emoji: "✅", title: "Marquer comme membre existant" },
        { slug: "suivi-pastoral", emoji: "💡", title: "Ajouter un suivi pastoral" },
        { slug: "progression-leadership", emoji: "🏆", title: "Suivre la progression en leadership" },
        { slug: "definir-serviteur", emoji: "⭐", title: "Définir un membre en tant que serviteur" },
        { slug: "modifier-contact", emoji: "✏️", title: "Modifier un contact" },
        { slug: "supprimer-contact", emoji: "🗑️", title: "Supprimer un contact" },
      ],
    },
    en: {
      subtitle: "Find, filter and manage all your members day to day.",
      items: [
        { slug: "rechercher-filtrer-membres", emoji: "🔍", title: "Search and filter members" },
        { slug: "importer-liste-membres", emoji: "📥", title: "Import a list of members" },
        { slug: "contacter-telephone", emoji: "📞", title: "Contact a member by phone" },
        { slug: "details-membre", emoji: "🪪", title: "View a member's record" },
        { slug: "presence-membre", emoji: "🟢", title: "View a member's attendance" },
        { slug: "marquer-membre-existant", emoji: "✅", title: "Mark as existing member" },
        { slug: "suivi-pastoral", emoji: "💡", title: "Add a pastoral follow-up" },
        { slug: "progression-leadership", emoji: "🏆", title: "Track leadership progress" },
        { slug: "definir-serviteur", emoji: "⭐", title: "Set a member as a servant" },
        { slug: "modifier-contact", emoji: "✏️", title: "Edit a contact" },
        { slug: "supprimer-contact", emoji: "🗑️", title: "Delete a contact" },
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
      subtitle: "Transformez un serviteur disponible en Conseiller au sein de votre équipe.",
      steps: [
        {
          title: "Choisir un serviteur",
          description:
            "Dans le menu déroulant, sélectionnez un membre marqué comme **serviteur**. Seuls les serviteurs qui ne sont **pas encore conseillers** apparaissent dans la liste.",
        },
        {
          title: "Vérifier les informations pré-remplies",
          description:
            "**Prénom**, **nom** et **téléphone** se remplissent automatiquement depuis la fiche du membre sélectionné (lecture seule).",
        },
        {
          title: "Saisir l'email et le mot de passe",
          description: "Ce sont les identifiants de connexion que le futur conseiller utilisera pour se connecter à SoulTrack.",
        },
        {
          title: 'Cliquer sur **"Créer"**',
          description: "Le compte conseiller est créé et un message de confirmation s'affiche.",
        },
      ],
    },
    en: {
      title: "Create a Counselor",
      subtitle: "Transform an available servant into a Counselor within your team.",
      steps: [
        {
          title: "Choose a Servant",
          description:
            "In the dropdown, select a member marked as a **servant**. Only servants who are **not yet counselors** appear in the list.",
        },
        {
          title: "Check the pre-filled information",
          description:
            "**First name**, **last name** and **phone** are filled in automatically from the selected member's record (read-only).",
        },
        {
          title: "Enter the email and password",
          description: "These are the login credentials the new counselor will use to sign in to SoulTrack.",
        },
        {
          title: 'Click **"Create"**',
          description: "The counselor account is created and a confirmation message appears.",
        },
      ],
    },
  },

  "membres/list-conseillers": {
    fr: {
      title: "Liste des conseillers",
      subtitle: "Retrouvez tous les conseillers de votre assemblée en un seul endroit.",
      steps: [
        {
          title: "Rechercher un conseiller",
          description: "Utilisez la **barre de recherche** pour retrouver un conseiller par prénom ou nom.",
        },
        {
          title: "Consulter une fiche conseiller",
          description:
            "Chaque carte affiche son **téléphone**, son **email**, son **responsable**, et le **nombre de contacts** (membres) qui lui sont assignés.",
        },
        {
          title: "Voir les contacts d'un conseiller",
          description: 'Cliquez sur **"Voir les contacts"** pour ouvrir la liste des membres qui lui sont assignés.',
        },
        {
          title: "Ajouter un nouveau conseiller",
          description: 'Cliquez sur **"➕ Ajouter un Conseiller"** pour ouvrir le formulaire de création.',
        },
      ],
    },
    en: {
      title: "Counselors list",
      subtitle: "Find all the Counselors of your church in one place.",
      steps: [
        {
          title: "Search for a counselor",
          description: "Use the **search bar** to find a counselor by first or last name.",
        },
        {
          title: "View a counselor's card",
          description:
            "Each card shows their **phone**, **email**, **supervisor**, and the **number of contacts** (members) they follow.",
        },
        {
          title: "View a counselor's contacts",
          description: 'Click **"View contacts"** to open the list of members assigned to them.',
        },
        {
          title: "Add a new counselor",
          description: 'Click **"➕ Add a Counselor"** to open the creation form.',
        },
      ],
    },
  },

     "membres/baptemes": {
    fr: {
      title: "Baptêmes",
      subtitle: "Consultez le rapport des baptêmes et enregistrez une nouvelle cérémonie.",
      steps: [
        // ── Partie 1 : Consulter le rapport ──────────────────────────
        {
          title: "📊 Partie 1 — Consulter le rapport",
          description: "Retrouvez la vue d'ensemble et le détail des cérémonies déjà enregistrées.",
        },
        {
          title: "Choisir la période à analyser",
          description:
            "Sélectionnez une **Période rapide** (30j, 90j, 6 mois, 1 an, 2 ans) ou une **Tranche de dates** personnalisée, puis cliquez sur **\"Générer le rapport\"**.",
        },
        {
          title: "Consulter la vue d'ensemble",
          description:
            "Retrouvez le **total de baptisés**, le **nombre de sessions**, la **répartition Hommes/Femmes**, la **tendance mensuelle** et le **classement par officiant**.",
        },
        {
          title: "Voir le détail par session",
          description:
            'Dans l\'onglet **"Par session"**, retrouvez la liste des cérémonies passées. Cliquez sur une carte pour l\'ouvrir et voir le détail, ou pour la modifier.',
        },

        // ── Partie 2 : Saisir un baptême ─────────────────────────────
        {
          title: "✅ Partie 2 — Saisir un baptême",
          description: "Enregistrez une nouvelle cérémonie et les personnes qui viennent d'être baptisées.",
        },
        {
          title: "Sélectionner les personnes qui ont été baptisées",
          description:
            'Dans l\'onglet **"Saisie"**, la liste vient directement de la fiche des membres : dans **Modifier un contact**, si **Baptême d\'eau = Non**, une case **"Veut se faire baptiser"** apparaît. Une fois cochée, le membre apparaît ici. Cochez les personnes qui **viennent d\'être baptisées** lors de la cérémonie que vous enregistrez.',
        },
        {
          title: 'Ajouter une personne manquante',
          description:
            'Si une personne n\'apparaît pas dans la liste, cliquez sur **"➕ Ajouter un baptisé"** pour la renseigner manuellement.',
        },
        {
          title: "Renseigner la date et l'officiant",
          description:
            'Indiquez la **date** de la cérémonie. Le nombre **Hommes/Femmes** se calcule automatiquement selon les personnes cochées. Le champ **"Baptisé par"** est obligatoire.',
        },
        {
          title: 'Enregistrer le rapport',
          description:
            'Cliquez sur **"Ajouter le rapport"**. Chaque personne sélectionnée est automatiquement marquée **baptisée** dans sa fiche membre, et le rapport apparaît désormais dans les onglets **"Vue d\'ensemble"** et **"Par session"**.',
        },
        {
          title: "Bon à savoir : liste filtrée selon votre rôle",
          description:
            "**Administrateur** et **Responsable Intégration** voient tous les candidats ; **superviseur**, **responsable de cellule** ou **de famille** voient leurs candidats ; **conseiller** voit les siens.",
        },
      ],
    },
    en: {
      title: "Baptisms",
      subtitle: "View the baptism report and record a new ceremony.",
      steps: [
        // ── Part 1: View the report ──────────────────────────────────
        {
          title: "📊 Part 1 — View the report",
          description: "Find the overview and the detail of ceremonies already recorded.",
        },
        {
          title: "Choose the period to analyse",
          description:
            "Select a **Quick period** (30d, 90d, 6 months, 1 year, 2 years) or a custom **Date range**, then click **\"Generate report\"**.",
        },
        {
          title: "View the overview",
          description:
            "See the **total baptised**, the **number of sessions**, the **Male/Female breakdown**, the **monthly trend** and the **ranking by officiant**.",
        },
        {
          title: "View the detail by session",
          description:
            'In the **"By session"** tab, find the list of past ceremonies. Click a card to open it and see the detail, or to edit it.',
        },

        // ── Part 2: Record a baptism ─────────────────────────────────
        {
          title: "✅ Part 2 — Record a baptism",
          description: "Record a new ceremony and the people who have just been baptised.",
        },
        {
          title: "Select the people who were baptised",
          description:
            'In the **"Entry"** tab, the list comes directly from the members\' records: in **Edit a contact**, if **Water baptism = No**, a **"Wants to be baptised"** checkbox appears. Once checked, the member appears here. Check the people who **have just been baptised** at the ceremony you are recording.',
        },
        {
          title: "Add a missing person",
          description:
            'If a person does not appear in the list, click **"➕ Add a baptised person"** to enter them manually.',
        },
        {
          title: "Enter the date and the officiant",
          description:
            'Enter the **date** of the ceremony. The **Male/Female** count is calculated automatically from the people checked. The **"Baptised by"** field is required.',
        },
        {
          title: "Save the report",
          description:
            'Click **"Add report"**. Each selected person is automatically marked as **baptised** on their member record, and the report now appears in the **"Overview"** and **"By session"** tabs.',
        },
        {
          title: "Good to know: list filtered by your role",
          description:
            "**Administrator** and **Integration manager** see all candidates; **supervisor**, **cell group leader** or **family leader** see their own candidates; **counsellor** sees theirs.",
        },
      ],
    },
  },

    "membres/attendance": {
    fr: {
      title: "Présences aux réunions",
      subtitle: "Consultez le rapport de présences et enregistrez une nouvelle session.",
      steps: [
        // ── Partie 1 : Consulter le rapport ──────────────────────────
        {
          title: "📊 Partie 1 — Consulter le rapport",
          description: "Retrouvez la vue d'ensemble et le détail des sessions déjà enregistrées.",
        },
        {
          title: "Choisir la période à analyser",
          description:
            "Sélectionnez une **Période rapide** (7j, 30j, 90j, 6 mois, 1 an) ou une **Tranche de dates** personnalisée, puis cliquez sur **\"Générer le rapport\"**.",
        },
        {
          title: "Filtrer par type de temps",
          description:
            'Utilisez le menu **"Type"** pour n\'afficher qu\'un type de réunion précis (Culte, Prière, etc.).',
        },
        {
          title: "Consulter la vue d'ensemble",
          description:
            "Retrouvez le **nombre de sessions**, la **moyenne de présents**, les **nouveaux venus**, les **convertis**, la répartition **Hommes/Femmes/Jeunes/Enfants/Connectés** et le **total global**.",
        },
        {
          title: "Voir la provenance des nouveaux venus",
          description:
            "Répartition des nouveaux venus par **Invité**, **Réseaux**, **Évangélisation** ou **Autre**, avec leur pourcentage.",
        },
        {
          title: "Voir la fréquentation par type de temps",
          description:
            "Comparez le **total de présents**, les **nouveaux venus** et les **convertis** pour chaque type de réunion.",
        },
        {
          title: "Voir la tendance hebdomadaire",
          description:
            "Graphique des présents sur les **8 dernières semaines**, avec la variation par rapport à la semaine précédente.",
        },
        {
          title: "Consulter le détail d'une session",
          description:
            'Dans l\'onglet **"Par session"**, cliquez sur une carte pour l\'ouvrir et voir tous les chiffres détaillés.',
        },
        {
          title: "Modifier ou supprimer une session",
          description:
            'Depuis le détail d\'une carte, cliquez sur **"✏️ Modifier"** pour l\'éditer, ou sur **"🗑️ Supprimer"** pour la retirer définitivement.',
        },

        // ── Partie 2 : Saisir un rapport ──────────────────────────────
        {
          title: "✅ Partie 2 — Saisir un rapport",
          description: "Enregistrez une nouvelle session de présence.",
        },
        {
          title: 'Cliquer sur **"➕ Ajouter un rapport"**',
          description: "Ouvre le formulaire de saisie.",
        },
        {
          title: "Renseigner la date",
          description: "Indiquez la date de la réunion ou du culte.",
        },
        {
          title: "Choisir le type de temps",
          description:
            'Sélectionnez un type existant dans la liste, ou cliquez sur **"+ Ajouter un temps"** pour en créer un nouveau. Cochez **"Enregistrer ce temps pour le futur"** pour le retrouver la prochaine fois.',
        },
        {
          title: "Choisir le numéro de culte",
          description:
            'Si le type sélectionné est **"Culte"**, précisez s\'il s\'agit du 1er au 7ème culte.',
        },
        {
          title: "Renseigner les effectifs",
          description:
            "Complétez **Hommes**, **Femmes**, **Jeunes**, **Enfants**, **Connectés**, **Nouveaux venus** et **Nouveaux convertis**.",
        },
        {
          title: 'Cliquer sur **"Ajouter le rapport"**',
          description:
            "Le rapport est enregistré et apparaît immédiatement dans les onglets **\"Vue d'ensemble\"** et **\"Par session\"**.",
        },
      ],
    },
    en: {
      title: "Meeting Attendance Entry & Tracking",
      subtitle: "View the attendance report and record a new session.",
      steps: [
        // ── Part 1: View the report ──────────────────────────────────
        {
          title: "📊 Part 1 — View the report",
          description: "Find the overview and the detail of sessions already recorded.",
        },
        {
          title: "Choose the period to analyse",
          description:
            "Select a **Quick period** (7d, 30d, 90d, 6 months, 1 year) or a custom **Date range**, then click **\"Generate report\"**.",
        },
        {
          title: "Filter by service type",
          description:
            'Use the **"Type"** menu to show only one specific meeting type (Service, Prayer, etc.).',
        },
        {
          title: "View the overview",
          description:
            "Find the **number of sessions**, **average attendance**, **newcomers**, **converts**, the **Men/Women/Youth/Children/Online** breakdown, and the **grand total**.",
        },
        {
          title: "View newcomer sources",
          description:
            "Breakdown of newcomers by **Invited**, **Social media**, **Evangelism** or **Other**, with their percentage.",
        },
        {
          title: "View attendance by service type",
          description:
            "Compare the **total attendance**, **newcomers** and **converts** for each type of meeting.",
        },
        {
          title: "View the weekly trend",
          description:
            "Chart of attendance over the **last 8 weeks**, with the change compared to the previous week.",
        },
        {
          title: "View a session's detail",
          description:
            'In the **"By session"** tab, click a card to open it and see all the detailed figures.',
        },
        {
          title: "Edit or delete a session",
          description:
            'From a card\'s detail, click **"✏️ Edit"** to edit it, or **"🗑️ Delete"** to remove it permanently.',
        },

        // ── Part 2: Record a session ──────────────────────────────────
        {
          title: "✅ Part 2 — Record a session",
          description: "Log a new attendance session.",
        },
        {
          title: 'Click **"➕ Add a report"**',
          description: "Opens the entry form.",
        },
        {
          title: "Enter the date",
          description: "Enter the date of the meeting or service.",
        },
        {
          title: "Choose the service type",
          description:
            'Select an existing type from the list, or click **"+ Add a type"** to create a new one. Check **"Save this type for future use"** to find it again next time.',
        },
        {
          title: "Choose the service number",
          description:
            'If the selected type is **"Service"**, specify whether it is the 1st through 7th service.',
        },
        {
          title: "Enter the headcount",
          description:
            "Fill in **Men**, **Women**, **Youth**, **Children**, **Online**, **Newcomers** and **Converts**.",
        },
        {
          title: 'Click **"Add report"**',
          description:
            "The report is saved and immediately appears in the **\"Overview\"** and **\"By session\"** tabs.",
        },
      ],
    },
  },

    "membres/presence": {
    fr: {
      title: "Enregistrement individuel des présences",
      subtitle: "Démarrez une session et pointez les présents en temps réel.",
      steps: [
        // ── Partie 1 : Démarrer ou rejoindre une session ──────────────
        {
          title: "▶️ Partie 1 — Démarrer ou rejoindre une session",
          description: "Avant de pointer les présences, il faut une session active pour aujourd'hui.",
        },
        {
          title: "Rejoindre une session déjà en cours",
          description:
            'Si une session a déjà été créée aujourd\'hui, elle apparaît en haut avec le badge **"EN COURS"**. Cliquez dessus pour la **rejoindre**.',
        },
        {
          title: "Créer une nouvelle session",
          description:
            'S\'il n\'y a pas encore de session aujourd\'hui, remplissez directement le formulaire. S\'il y en a déjà une, cliquez sur **"➕ Créer une nouvelle session"**.',
        },
        {
          title: "Renseigner la date et l'heure",
          description: "Par défaut, la date et l'heure actuelles sont pré-remplies.",
        },
        {
          title: "Choisir le type de temps",
          description:
            'Sélectionnez un type existant (**Culte**, etc.), ou cliquez sur **"➕ Nouveau type..."** pour en créer un. Cochez **"Enregistrer ce type pour une prochaine fois"** pour le retrouver ensuite.',
        },
        {
          title: "Préciser le numéro de culte",
          description:
            'Si le type choisi est un **culte**, indiquez s\'il s\'agit du 1er au 7ème culte (champ obligatoire).',
        },
        {
          title: 'Cliquer sur **"▶ Démarrer la prise de présence"**',
          description: "La session est créée et tous les membres sont automatiquement marqués absents au départ.",
        },

        // ── Partie 2 : Prendre les présences ──────────────────────────
        {
          title: "✅ Partie 2 — Prendre les présences",
          description: "Pointez les membres présents pendant la session.",
        },
        {
          title: 'Basculer entre **"Absents"** et **"Présents"**',
          description: "Utilisez les deux boutons en haut pour changer de vue, avec le compteur à jour.",
        },
        {
          title: "Rechercher un membre",
          description: "Utilisez la **barre de recherche** pour retrouver rapidement un nom.",
        },
        {
          title: "Marquer un membre présent",
          description: 'Dans la vue **"Absents"**, cliquez sur le nom du membre : il passe instantanément en présent.',
        },
        {
          title: "Annuler une présence",
          description: 'Dans la vue **"Présents"**, cliquez sur **"Absent"** à côté du nom pour annuler le pointage.',
        },
        {
          title: "Activer la liste visible par l'équipe",
          description:
            'Par défaut, la liste de vos membres est **privée** : les Administrateurs et Responsables Intégration ne la voient pas. Activez **"👁 Liste visible par l\'équipe"** pour la leur rendre visible. Ce réglage repart à **privé par défaut** à chaque nouvelle session : il faut donc le réactiver à chaque fois si besoin.',
        },
        {
          title: "Inclure les cellules filles (Responsable de cellule)",
          description:
            'Activez **"🏠 Cellules filles incluses"** pour voir aussi les membres des cellules rattachées à la vôtre.',
        },
        {
          title: "Modifier les informations de la session",
          description:
            "Cliquez sur l'encadré affichant le type et la date de la session pour la modifier (date, heure, type, numéro de culte).",
        },

        // ── Partie 3 : Consulter d'anciennes sessions ──────────────────
        {
          title: "🕘 Partie 3 — Consulter d'anciennes sessions",
          description: "Retrouvez les sessions des 30 derniers jours.",
        },
        {
          title: "Ouvrir les sessions modifiables",
          description:
            'Les sessions de **moins de 7 jours** apparaissent dans **"Sessions modifiables"** : vous pouvez encore corriger les présences.',
        },
        {
          title: "Ouvrir les sessions archivées",
          description:
            'Les sessions de **plus de 7 jours** apparaissent dans **"Sessions archivées"** : elles sont visibles mais **en lecture seule**.',
        },
        {
          title: "Démarrer une nouvelle session",
          description:
            'Depuis l\'écran de présence, cliquez sur **"↩ Nouvelle session"** pour revenir à l\'écran de démarrage.',
        },
      ],
    },
    en: {
      title: "Individual Attendance Entry",
      subtitle: "Start a session and check people in in real time.",
      steps: [
        // ── Part 1: Start or join a session ────────────────────────────
        {
          title: "▶️ Part 1 — Start or join a session",
          description: "Before checking people in, you need an active session for today.",
        },
        {
          title: "Join a session already in progress",
          description:
            'If a session has already been created today, it appears at the top with the **"IN PROGRESS"** badge. Click it to **join**.',
        },
        {
          title: "Create a new session",
          description:
            'If there\'s no session yet today, fill in the form directly. If there\'s already one, click **"➕ Create a new session"**.',
        },
        {
          title: "Enter the date and time",
          description: "By default, the current date and time are pre-filled.",
        },
        {
          title: "Choose the session type",
          description:
            'Select an existing type (**Service**, etc.), or click **"➕ New type..."** to create one. Check **"Save this type for next time"** to find it again later.',
        },
        {
          title: "Specify the service number",
          description:
            'If the chosen type is a **service**, indicate whether it is the 1st through 7th service (required field).',
        },
        {
          title: 'Click **"▶ Start attendance"**',
          description: "The session is created and all members are automatically marked absent at first.",
        },

        // ── Part 2: Take attendance ──────────────────────────────────────
        {
          title: "✅ Part 2 — Take attendance",
          description: "Check in the members present during the session.",
        },
        {
          title: 'Switch between **"Absent"** and **"Present"**',
          description: "Use the two buttons at the top to switch views, with the counter kept up to date.",
        },
        {
          title: "Search for a member",
          description: "Use the **search bar** to quickly find a name.",
        },
        {
          title: "Mark a member present",
          description: 'In the **"Absent"** view, click the member\'s name: they instantly switch to present.',
        },
        {
          title: "Undo a check-in",
          description: 'In the **"Present"** view, click **"Absent"** next to the name to undo the check-in.',
        },
        {
          title: "Enable the team-visible list",
          description:
            'By default, your members\' list is **private**: Admins and Integration Managers cannot see it. Turn on **"👁 List visible to the team"** to make it visible to them. This setting resets to **private by default** for every new session, so it needs to be turned back on each time if needed.',
        },
        {
          title: "Include child cells (Cell group leader)",
          description:
            'Turn on **"🏠 Child cells included"** to also see members from cells linked to yours.',
        },
        {
          title: "Edit the session's information",
          description:
            "Click the box showing the session's type and date to edit it (date, time, type, service number).",
        },

        // ── Part 3: View past sessions ────────────────────────────────
        {
          title: "🕘 Part 3 — View past sessions",
          description: "Find sessions from the last 30 days.",
        },
        {
          title: "Open editable sessions",
          description:
            'Sessions **less than 7 days old** appear under **"Editable sessions"**: you can still correct attendance.',
        },
        {
          title: "Open archived sessions",
          description:
            'Sessions **more than 7 days old** appear under **"Archived sessions"**: visible but **read-only**.',
        },
        {
          title: "Start a new session",
          description:
            'From the attendance screen, click **"↩ New session"** to return to the start screen.',
        },
      ],
    },
  },

    "membres/rapport-presence": {
    fr: {
      title: "Statistiques de présence individuelle",
      subtitle: "Suivez la fidélité de vos membres et repérez ceux qui décrochent.",
      steps: [
        // ── Partie 1 : Filtrer et lire la vue d'ensemble ──────────────
        {
          title: "🔍 Partie 1 — Filtrer et lire la vue d'ensemble",
          description: "Choisissez la période à analyser puis consultez les indicateurs clés.",
        },
        {
          title: "Choisir la période",
          description:
            "Sélectionnez **7 jours**, **30 jours**, **90 jours** ou **6 mois**.",
        },
        {
          title: "Filtrer par type de session",
          description:
            'Utilisez les boutons de type (**Culte**, etc.) pour n\'analyser qu\'un type de réunion précis, ou **"Tous"** pour tout inclure.',
        },
        {
          title: "Lire les indicateurs clés",
          description:
            "Retrouvez le nombre de **sessions**, le **taux moyen de présence**, le nombre de **membres suivis** et ceux **en alerte** (3 absences consécutives ou plus).",
        },

        // ── Partie 2 : Segmentation et alertes ────────────────────────
        {
          title: "🚦 Partie 2 — Segmentation et alertes pastorales",
          description: "Identifiez les membres à accompagner en priorité.",
        },
        {
          title: "Consulter la segmentation par fidélité",
          description:
            "Les membres sont classés en 4 groupes : **Réguliers** (≥75%), **Irréguliers** (40-74%), **Décrocheurs** (15-39%) et **Absents chroniques** (<15%). Cliquez sur un groupe pour voir la liste complète.",
        },
        {
          title: "Consulter les alertes pastorales",
          description:
            "Liste des membres ayant **3 absences consécutives ou plus**, triés par gravité, avec la date de leur dernière présence.",
        },

        // ── Partie 3 : Analyses complémentaires ───────────────────────
        {
          title: "📊 Partie 3 — Analyses complémentaires",
          description: "Approfondissez votre lecture avec des vues par type, tendance, classement et genre.",
        },
        {
          title: "Voir le taux par type de temps",
          description: "Comparez le taux de présence moyen pour chaque type de réunion (Culte, Prière, etc.).",
        },
        {
          title: "Voir la tendance hebdomadaire",
          description: "Graphique du taux de présence sur les **8 dernières semaines**, avec la variation par rapport à la semaine précédente.",
        },
        {
          title: "Voir le Top fidèles",
          description: "Classement des membres avec le meilleur taux de présence sur la période.",
        },
        {
          title: "Voir la répartition par genre",
          description: "Répartition Hommes/Femmes des présents lors de la **dernière session** enregistrée.",
        },

        // ── Partie 4 : Comparer les cellules et familles ──────────────
        {
          title: "🏠 Partie 4 — Comparer les cellules et familles",
          description: "Visible uniquement si les modules **Cellules** et/ou **Familles** sont activés.",
        },
        {
          title: 'Ouvrir l\'onglet **"Cellules"** ou **"Familles"**',
          description: "Affiche le classement des groupes par taux de présence, avec leur tendance (▲ progression / ▼ régression).",
        },
        {
          title: "Trier les groupes",
          description:
            'Utilisez les filtres **"Meilleur taux"**, **"Moins bon taux"**, **"En progression"** ou **"En régression"**.',
        },
        {
          title: "Ouvrir le détail d'un groupe",
          description: "Cliquez sur une cellule ou une famille pour voir le taux de présence individuel de chaque membre qui la compose.",
        },

        // ── Partie 5 : Détail par session ──────────────────────────────
        {
          title: "📅 Partie 5 — Détail par session",
          description: "Consultez chaque session individuellement.",
        },
        {
          title: 'Ouvrir l\'onglet **"Par session"**',
          description: "Liste toutes les sessions de la période, avec leur taux de présence.",
        },
        {
          title: "Cliquer sur une session",
          description:
            'Ouvre le détail avec deux onglets : **"Présents"** et **"Absents"**, chacun listant les membres concernés.',
        },
      ],
    },
    en: {
      title: "Individual Attendance Statistics",
      subtitle: "Track your members' loyalty and spot who's falling off.",
      steps: [
        // ── Part 1: Filter and read the overview ──────────────────────
        {
          title: "🔍 Part 1 — Filter and read the overview",
          description: "Choose the period to analyse, then check the key indicators.",
        },
        {
          title: "Choose the period",
          description:
            "Select **7 days**, **30 days**, **90 days** or **6 months**.",
        },
        {
          title: "Filter by session type",
          description:
            'Use the type buttons (**Service**, etc.) to analyse only one specific meeting type, or **"All"** to include everything.',
        },
        {
          title: "Read the key indicators",
          description:
            "Find the number of **sessions**, the **average attendance rate**, the number of **tracked members**, and those **on alert** (3 or more consecutive absences).",
        },

        // ── Part 2: Segmentation and alerts ────────────────────────────
        {
          title: "🚦 Part 2 — Segmentation and pastoral alerts",
          description: "Identify members to prioritise for follow-up.",
        },
        {
          title: "View the loyalty segmentation",
          description:
            "Members are grouped into 4 categories: **Regulars** (≥75%), **Irregulars** (40-74%), **Dropping off** (15-39%) and **Chronic absents** (<15%). Click a group to see the full list.",
        },
        {
          title: "View pastoral alerts",
          description:
            "List of members with **3 or more consecutive absences**, sorted by severity, with the date of their last attendance.",
        },

        // ── Part 3: Additional analyses ─────────────────────────────────
        {
          title: "📊 Part 3 — Additional analyses",
          description: "Dig deeper with views by type, trend, ranking and gender.",
        },
        {
          title: "View the rate by service type",
          description: "Compare the average attendance rate for each type of meeting (Service, Prayer, etc.).",
        },
        {
          title: "View the weekly trend",
          description: "Chart of the attendance rate over the **last 8 weeks**, with the change compared to the previous week.",
        },
        {
          title: "View the Top regulars",
          description: "Ranking of members with the best attendance rate over the period.",
        },
        {
          title: "View the gender breakdown",
          description: "Male/Female breakdown of those present at the **most recent session** recorded.",
        },

        // ── Part 4: Compare cell groups and families ────────────────────
        {
          title: "🏠 Part 4 — Compare cell groups and families",
          description: "Only visible if the **Cell groups** and/or **Families** modules are enabled.",
        },
        {
          title: 'Open the **"Cells"** or **"Families"** tab',
          description: "Shows the ranking of groups by attendance rate, with their trend (▲ progressing / ▼ declining).",
        },
        {
          title: "Sort the groups",
          description:
            'Use the **"Best rate"**, **"Lowest rate"**, **"Progressing"** or **"Declining"** filters.',
        },
        {
          title: "Open a group's detail",
          description: "Click a cell group or family to see the individual attendance rate of each member in it.",
        },

        // ── Part 5: Detail by session ────────────────────────────────────
        {
          title: "📅 Part 5 — Detail by session",
          description: "Review each session individually.",
        },
        {
          title: 'Open the **"By session"** tab',
          description: "Lists all sessions for the period, with their attendance rate.",
        },
        {
          title: "Click a session",
          description:
            'Opens the detail with two tabs: **"Present"** and **"Absent"**, each listing the relevant members.',
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

  "evangelisation/liste-evangelises": {
    fr: {
      title: "Liste des évangélisés",
      subtitle: "Centralisez tous les contacts évangélisés et facilitez la gestion de leur suivi.",
      steps: [
        {
          title: "🌱 Partie 1 — Ajouter un évangélisé",
          description: "Deux façons d'enregistrer une personne rencontrée lors d'une évangélisation.",
        },
        {
          title: "Envoyer le formulaire par lien",
          description:
            'Cliquez sur **"Envoyer formulaire – Évangélisation"** pour partager un lien (WhatsApp) que la personne, ou l\'évangéliste, remplit directement.',
        },
        {
          title: "Ou l'ajouter manuellement",
          description:
            "Renseignez la **date** et le **type d'évangélisation** (Individuel, Sortie de groupe, Campagne, Rue, Maison, Stade), l'**identité** (civilité, prénom, nom, âge, téléphone, ville, WhatsApp), la **prière du salut** (Oui/Non + type de conversion si Oui) et les **besoins**.",
        },
        {
          title: "Le contact apparaît dans la liste",
          description: "Une fois envoyé, le contact apparaît directement dans la **liste des évangélisés**.",
        },
        {
          title: "🤝 Partie 2 — Gérer un contact évangélisé",
          description: "Transmettez le contact en suivi ou intégrez-le directement à l'église.",
        },
        {
          title: "Envoyer en suivi",
          description:
            'Choisissez une cible (**Cellule**, **Famille** ou **Conseiller**), cochez les contacts à transmettre, puis cliquez sur **"📤 Envoyer WhatsApp"**. Le système détecte automatiquement les **doublons** déjà suivis.',
        },
        {
          title: "Intégrer directement à l'église",
          description:
            'Cliquez sur **"✅ Intégrer à l\'église"** pour transformer le contact en membre, sans passer par le suivi.',
        },
        {
          title: "Consulter les détails",
          description: "Identité, vie spirituelle, besoins.",
        },
        {
          title: "Modifier ou supprimer",
          description: "Éditez ou supprimez le contact depuis ses détails.",
        },
      ],
    },
    en: {
      title: "Evangelised list",
      subtitle: "Centralise all evangelised contacts and simplify their follow-up management.",
      steps: [
        {
          title: "🌱 Part 1 — Add an evangelised contact",
          description: "Two ways to record a person met during evangelism.",
        },
        {
          title: "Send the form via link",
          description:
            'Click **"Send form – Evangelism"** to share a link (WhatsApp) that the person, or the evangelist, fills in directly.',
        },
        {
          title: "Or add them manually",
          description:
            "Enter the **date** and the **type of outreach** (Individual, Group outing, Campaign, Street, House, Stadium), their **identity** (title, first/last name, age, phone, city, WhatsApp), the **salvation prayer** (Yes/No + conversion type if Yes) and their **needs**.",
        },
        {
          title: "The contact appears in the list",
          description: "Once submitted, the contact appears directly in the **evangelised list**.",
        },
        {
          title: "🤝 Part 2 — Manage an evangelised contact",
          description: "Send the contact for follow-up or integrate them directly into the church.",
        },
        {
          title: "Send for follow-up",
          description:
            'Choose a target (**Cell group**, **Family** or **Counsellor**), check the contacts to send, then click **"📤 Send via WhatsApp"**. The system automatically detects **duplicates** already being followed.',
        },
        {
          title: "Integrate directly into the church",
          description:
            'Click **"✅ Integrate to church"** to turn the contact into a member, without going through follow-up.',
        },
        {
          title: "View the details",
          description: "Identity, spiritual life, needs.",
        },
        {
          title: "Edit or delete",
          description: "Edit or delete the contact from their details.",
        },
      ],
    },
  },

    "evangelisation/suivis-evangelisation": {
    fr: {
      title: "Suivis des évangélisés",
      subtitle: "Suivez facilement tous vos contacts évangélisés et leur progression.",
      steps: [
        {
          title: "Mettre à jour le commentaire et le statut",
          description:
            'Modifiez le **Commentaire Suivis**, puis choisissez un statut dans le menu déroulant : **En Suivis** (accompagnement en cours), **Intégrer** (transforme automatiquement le contact en **membre** de l\'église, avec transfert de son conseiller assigné) ou **Refus**. Cliquez sur **"Sauvegarder"** pour enregistrer.',
        },
        {
          title: "Afficher ou masquer les refus",
          description:
            'En haut de la page, cliquez sur **"Voir les refus"** pour n\'afficher que les contacts au statut **Refus**, ou sur **"Voir tous les suivis"** pour revenir à la liste normale. En mode refus, le commentaire et le statut sont **verrouillés** ; seul le bouton **"🔄 Réactiver"** reste disponible.',
        },
        {
          title: "Consulter les détails",
          description:
            "Identité, **vie spirituelle** (prière du salut, type de conversion), **parcours** (type et date d'évangélisation) et **besoins pastoraux**.",
        },
        {
          title: "Ajouter un suivi pastoral",
          description: 'Depuis les détails, cliquez sur **"💡 Ajouter / Voir suivis"** pour enregistrer un accompagnement.',
        },
        {
          title: "Modifier le contact",
          description: 'Depuis les détails, cliquez sur **"✏️ Modifier le contact"** pour éditer sa fiche.',
        },
        {
          title: "Bon à savoir : liste filtrée selon votre rôle",
          description:
            "Un **conseiller** voit uniquement ses assignations, un **responsable de cellule** voit sa cellule (et ses cellules filles), un **responsable de familles** voit ses familles.",
        },
      ],
    },
    en: {
      title: "Evangelism follow-up",
      subtitle: "Easily track all your evangelised contacts and their progress.",
      steps: [
        {
          title: "Update the comment and status",
          description:
            'Edit the **Follow-up comment**, then choose a status from the dropdown: **In follow-up** (active accompaniment), **Integrate** (automatically turns the contact into a **member** of the church, transferring their assigned counsellor) or **Refusal**. Click **"Save"** to confirm.',
        },
        {
          title: "Show or hide refusals",
          description:
            'At the top of the page, click **"View refusals"** to show only contacts with **Refusal** status, or **"View all follow-ups"** to return to the normal list. In refusal view, the comment and status are **locked**; only the **"🔄 Reactivate"** button remains available.',
        },
        {
          title: "View the details",
          description:
            "Identity, **spiritual life** (salvation prayer, conversion type), **journey** (type and date of evangelism) and **pastoral needs**.",
        },
        {
          title: "Add a pastoral follow-up",
          description: 'From the details, click **"💡 Add / View follow-ups"** to log an accompaniment.',
        },
        {
          title: "Edit the contact",
          description: 'From the details, click **"✏️ Edit contact"** to edit their record.',
        },
        {
          title: "Good to know: list filtered by your role",
          description:
            "A **counsellor** only sees their own assignments, a **cell group leader** sees their cell group (and its sub-cells), a **family leader** sees their families.",
        },
      ],
    },
  },
  
    "evangelisation/rapport-evangelisation": {
    fr: {
      title: "Rapport Évangélisation",
      subtitle: "Suivez et analysez facilement vos activités d'évangélisation.",
      steps: [
        {
          title: "Alimentation automatique du rapport",
          description:
            "Il n'y a pas de saisie manuelle ici : chaque personne enregistrée via le **formulaire d'évangélisation** (lien envoyé ou ajout manuel) alimente **automatiquement** ce rapport. Les KPIs et graphiques se recalculent en temps réel selon les contacts déjà présents dans la **liste des évangélisés**.",
        },
        {
          title: "Choisir la période à analyser",
          description:
            'Sélectionnez une **Période rapide** (7j, 30j, 90j, 6 mois, 1 an) ou une **Tranche de dates** personnalisée, puis cliquez sur **"Générer le rapport"**.',
        },
        {
          title: "Filtrer par type d'évangélisation",
          description:
            'Utilisez le menu **"Type"** pour n\'analyser qu\'un type précis (Individuel, Sortie de groupe, Campagne, Rue, Maison, Stade), ou **"Tous les types"**.',
        },
        {
          title: "Consulter la vue d'ensemble",
          description:
            "Retrouvez les KPIs : **Évangélisés**, **Convertis** (%), **Intégrés** (%), **En cours**, **Envoyés au suivi**, **Non envoyés**, **Refus**, **Intégrés en cellule** et **Intégrés à l'église**. Chaque KPI est **cliquable** et renvoie vers la page de suivi des âmes avec le filtre correspondant déjà appliqué.",
        },
        {
          title: "Lire l'entonnoir de conversion",
          description:
            "Suivez le parcours **Évangélisés → Envoyés au suivi → Convertis → Intégrés**, avec le pourcentage à chaque étape.",
        },
        {
          title: "Voir la tendance mensuelle",
          description:
            "Graphique **Évangélisés vs Convertis** sur les 8 derniers mois, avec la variation par rapport au mois précédent.",
        },
        {
          title: "Voir les résultats par type d'évangélisation",
          description: "Classement des types avec le nombre de personnes touchées et le taux de conversion de chacun.",
        },
        {
          title: 'Ouvrir l\'onglet **"Par type"**',
          description:
            "Regroupe les **rapports/sessions détaillés** par type d'évangélisation : Hommes, Femmes, Total, Prières du salut, Nouveaux convertis, Réconciliations, Moissonneurs.",
        },
        {
          title: "Modifier un rapport",
          description: 'Depuis une carte de session, cliquez sur **"✏️ Modifier"** pour corriger les chiffres.',
        },
      ],
    },
    en: {
      title: "Evangelism report",
      subtitle: "Easily track and analyse your evangelism activities.",
      steps: [
        {
          title: "The report fills in automatically",
          description:
            "There's no manual entry here: every person recorded through the **evangelism form** (shared link or manual entry) automatically feeds into this report. KPIs and charts recalculate in real time based on the contacts already in the **evangelised list**.",
        },
        {
          title: "Choose the period to analyse",
          description:
            'Select a **Quick period** (7d, 30d, 90d, 6 months, 1 year) or a custom **Date range**, then click **"Generate report"**.',
        },
        {
          title: "Filter by evangelism type",
          description:
            'Use the **"Type"** menu to analyse only one specific type (Individual, Group outing, Campaign, Street, House, Stadium), or **"All types"**.',
        },
        {
          title: "View the overview",
          description:
            "Find the KPIs: **Evangelized**, **Converted** (%), **Integrated** (%), **In progress**, **Sent to follow-up**, **Not sent**, **Refused**, **Integrated in cell** and **Integrated in church**. Each KPI is **clickable** and takes you to the soul-tracking page with the matching filter already applied.",
        },
        {
          title: "Read the conversion funnel",
          description:
            "Follow the journey **Evangelized → Sent to follow-up → Converted → Integrated**, with the percentage at each stage.",
        },
        {
          title: "View the monthly trend",
          description:
            "Chart of **Evangelized vs Converted** over the last 8 months, with the change compared to the previous month.",
        },
        {
          title: "View results by evangelism type",
          description: "Ranking of types with the number of people reached and each one's conversion rate.",
        },
        {
          title: 'Open the **"By type"** tab',
          description:
            "Groups the **detailed reports/sessions** by evangelism type: Men, Women, Total, Salvation prayers, New converts, Reconciliations, Harvesters.",
        },
        {
          title: "Edit a report",
          description: 'From a session card, click **"✏️ Edit"** to correct the figures.',
        },
      ],
    },
  },
  
