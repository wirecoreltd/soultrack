"use client";

import { useState, useEffect, useRef } from "react";
import supabase from "../../lib/supabaseClient";
import HeaderPages from "../../components/HeaderPages";
import Footer from "../../components/Footer";
import { useLang } from "../../hooks/useLang";

// ─── PAYS (code interne unique → { fr, en, flagCode }) ───────────────────────
const PAYS_DATA = [
  { code: "af", fr: "Afghanistan",                en: "Afghanistan"              },
  { code: "za", fr: "Afrique du Sud",             en: "South Africa"             },
  { code: "al", fr: "Albanie",                    en: "Albania"                  },
  { code: "dz", fr: "Algérie",                    en: "Algeria"                  },
  { code: "de", fr: "Allemagne",                  en: "Germany"                  },
  { code: "ao", fr: "Angola",                     en: "Angola"                   },
  { code: "sa", fr: "Arabie Saoudite",            en: "Saudi Arabia"             },
  { code: "ae", fr: "Émirats Arabes Unis",        en: "United Arab Emirates"     },
  { code: "ar", fr: "Argentine",                  en: "Argentina"                },
  { code: "au", fr: "Australie",                  en: "Australia"                },
  { code: "at", fr: "Autriche",                   en: "Austria"                  },
  { code: "be", fr: "Belgique",                   en: "Belgium"                  },
  { code: "bj", fr: "Bénin",                      en: "Benin"                    },
  { code: "mm", fr: "Birmanie",                   en: "Myanmar"                  },
  { code: "bo", fr: "Bolivie",                    en: "Bolivia"                  },
  { code: "br", fr: "Brésil",                     en: "Brazil"                   },
  { code: "bf", fr: "Burkina Faso",               en: "Burkina Faso"             },
  { code: "bi", fr: "Burundi",                    en: "Burundi"                  },
  { code: "cm", fr: "Cameroun",                   en: "Cameroon"                 },
  { code: "ca", fr: "Canada",                     en: "Canada"                   },
  { code: "cl", fr: "Chili",                      en: "Chile"                    },
  { code: "cn", fr: "Chine",                      en: "China"                    },
  { code: "co", fr: "Colombie",                   en: "Colombia"                 },
  { code: "cg", fr: "Congo",                      en: "Congo"                    },
  { code: "kr", fr: "Corée du Sud",               en: "South Korea"              },
  { code: "ci", fr: "Côte d'Ivoire",              en: "Ivory Coast"              },
  { code: "cu", fr: "Cuba",                       en: "Cuba"                     },
  { code: "dk", fr: "Danemark",                   en: "Denmark"                  },
  { code: "eg", fr: "Egypte",                     en: "Egypt"                    },
  { code: "es", fr: "Espagne",                    en: "Spain"                    },
  { code: "us", fr: "États-Unis",                 en: "United States"            },
  { code: "et", fr: "Ethiopie",                   en: "Ethiopia"                 },
  { code: "fi", fr: "Finlande",                   en: "Finland"                  },
  { code: "fr", fr: "France",                     en: "France"                   },
  { code: "ga", fr: "Gabon",                      en: "Gabon"                    },
  { code: "gh", fr: "Ghana",                      en: "Ghana"                    },
  { code: "gr", fr: "Grèce",                      en: "Greece"                   },
  { code: "gn", fr: "Guinée",                     en: "Guinea"                   },
  { code: "ht", fr: "Haïti",                      en: "Haiti"                    },
  { code: "hu", fr: "Hongrie",                    en: "Hungary"                  },
  { code: "in", fr: "Inde",                       en: "India"                    },
  { code: "id", fr: "Indonésie",                  en: "Indonesia"                },
  { code: "ir", fr: "Iran",                       en: "Iran"                     },
  { code: "ie", fr: "Irlande",                    en: "Ireland"                  },
  { code: "il", fr: "Israël",                     en: "Israel"                   },
  { code: "it", fr: "Italie",                     en: "Italy"                    },
  { code: "jm", fr: "Jamaïque",                   en: "Jamaica"                  },
  { code: "jp", fr: "Japon",                      en: "Japan"                    },
  { code: "ke", fr: "Kenya",                      en: "Kenya"                    },
  { code: "lb", fr: "Liban",                      en: "Lebanon"                  },
  { code: "lu", fr: "Luxembourg",                 en: "Luxembourg"               },
  { code: "mg", fr: "Madagascar",                 en: "Madagascar"               },
  { code: "ml", fr: "Mali",                       en: "Mali"                     },
  { code: "ma", fr: "Maroc",                      en: "Morocco"                  },
  { code: "mq", fr: "Martinique",                 en: "Martinique"               },
  { code: "mu", fr: "Maurice",                    en: "Mauritius",  flagCode: "mu" },
  { code: "mr", fr: "Mauritanie",                 en: "Mauritania"               },
  { code: "mx", fr: "Mexique",                    en: "Mexico"                   },
  { code: "mz", fr: "Mozambique",                 en: "Mozambique"               },
  { code: "na", fr: "Namibie",                    en: "Namibia"                  },
  { code: "ne", fr: "Niger",                      en: "Niger"                    },
  { code: "ng", fr: "Nigeria",                    en: "Nigeria"                  },
  { code: "no", fr: "Norvège",                    en: "Norway"                   },
  { code: "nz", fr: "Nouvelle-Zélande",           en: "New Zealand"              },
  { code: "ug", fr: "Ouganda",                    en: "Uganda"                   },
  { code: "pk", fr: "Pakistan",                   en: "Pakistan"                 },
  { code: "nl", fr: "Pays-Bas",                   en: "Netherlands"              },
  { code: "pe", fr: "Pérou",                      en: "Peru"                     },
  { code: "ph", fr: "Philippines",                en: "Philippines"              },
  { code: "pl", fr: "Pologne",                    en: "Poland"                   },
  { code: "pt", fr: "Portugal",                   en: "Portugal"                 },
  { code: "cd", fr: "RDC",                        en: "DR Congo"                 },
  { code: "do", fr: "République Dominicaine",     en: "Dominican Republic"       },
  { code: "rod", fr: "Rodrigues",                 en: "Rodrigues",  flagCode: "mu" },
  { code: "ro", fr: "Roumanie",                   en: "Romania"                  },
  { code: "gb", fr: "Royaume-Uni",                en: "United Kingdom"           },
  { code: "rw", fr: "Rwanda",                     en: "Rwanda"                   },
  { code: "sn", fr: "Sénégal",                    en: "Senegal"                  },
  { code: "sl", fr: "Sierra Leone",               en: "Sierra Leone"             },
  { code: "sg", fr: "Singapour",                  en: "Singapore"                },
  { code: "so", fr: "Somalie",                    en: "Somalia"                  },
  { code: "sd", fr: "Soudan",                     en: "Sudan"                    },
  { code: "se", fr: "Suède",                      en: "Sweden"                   },
  { code: "ch", fr: "Suisse",                     en: "Switzerland"              },
  { code: "tz", fr: "Tanzanie",                   en: "Tanzania"                 },
  { code: "td", fr: "Tchad",                      en: "Chad"                     },
  { code: "tg", fr: "Togo",                       en: "Togo"                     },
  { code: "tn", fr: "Tunisie",                    en: "Tunisia"                  },
  { code: "tr", fr: "Turquie",                    en: "Turkey"                   },
  { code: "ua", fr: "Ukraine",                    en: "Ukraine"                  },
  { code: "uy", fr: "Uruguay",                    en: "Uruguay"                  },
  { code: "ve", fr: "Venezuela",                  en: "Venezuela"                },
  { code: "vn", fr: "Vietnam",                    en: "Vietnam"                  },
  { code: "zw", fr: "Zimbabwe",                   en: "Zimbabwe"                 },
];

const translations = {
  fr: {
    // En-tête
    titre: "Invitations & Liens",
    titreAccent: "d'Eglises",

    // Intro
    intro1: "Relier une église vous permet de placer une église sous votre supervision et de voir ses statistiques dans",
    intro1Accent: "Stats Globales",
    intro2: "Dans cette",
    intro2Accent: "interface",
    intro2Suite: ", vous pouvez :",
    listeActions: [
      { icon: "✉️", text: "Envoyer une invitation", color: "text-green-400", desc: " à une église" },
      { icon: "🔗", text: "Casser le lien", color: "text-gray-400", desc: " avec une église supervisée" },
      { icon: "🗑️", text: "Supprimer", color: "text-red-500", desc: " une invitation envoyée" },
      { icon: "🔄", text: "Renvoyer le lien", color: "text-green-400", desc: " si nécessaire" },
      { icon: "⏳", text: "Envoyer un rappel", color: "text-yellow-300", desc: " pour une invitation en attente" },
    ],
    introBas: "Toutes les actions sont suivies ici et visibles dans votre tableau.",

    // Formulaire
    formTitreRappel: (denom) => `📨 Rappel — ${denom}`,
    formTitreRenvoyer: (denom) => `🔄 Renvoyer — ${denom}`,
    formTitreDefaut: "Envoyer à",
    annuler: "✕ Annuler",

    labelPrenom: "Prénom du responsable",
    placeholderPrenom: "Prénom *",
    labelNom: "Nom du responsable",
    placeholderNom: "Nom *",
    labelDenomination: "Dénomination",
    placeholderDenomination: "Dénomination *",
    labelNomEglise: "Nom de l'église",
    placeholderNomEglise: "Nom église",
    labelBranche: "Branche de l'église",
    placeholderBranche: "Branche église",
    labelVille: "Ville",
    placeholderVille: "Ville",
    labelPays: "Pays",
    placeholderPays: "Pays *",
    searchCountry: "Rechercher un pays...",
    labelModeEnvoi: "Mode d'envoi",
    placeholderModeEnvoi: "Choisir un mode d'envoi",
    modeWhatsapp: "WhatsApp",
    modeEmail: "Email",
    
    modalCasserTitre: "🔗 Confirmer la rupture du lien",
    modalCasserTexte: "Le lien avec cette église sera rompu et vous ne verrez plus ses statistiques dans Stats Globales. Cette action est réversible : vous pourrez renvoyer une invitation plus tard.",
    modalCasserConfirmer: "Casser le lien",
    
    champsObligatoires: "* Champs obligatoires",
    erreurChamp: "Ce champ est obligatoire",

    btnRappel: "📨 Renvoyer un rappel",
    btnRenvoyer: "🔄 Renvoyer l'invitation",
    btnEnvoyer: "✉️ Envoyer l'invitation",

    // Tableau
    tableauTitre: "Liste des églises supervisées",
    colDenomination: "Dénomination",
    colNom: "Nom",
    colBranche: "Branche",
    colVille: "Ville",
    colPays: "Pays",
    colStatut: "Statut",
    colAction: "Action",

    // Actions tableau
    actionRappel: "⏳ Rappel",
    actionSupprimer: "🗑️ Supprimer",
    actionCasser: "🔗 Casser",
    actionRenvoyer: "🔄 Renvoyer",

    // Statuts
    statutAcceptee: "Accepté",
    statutRefusee: "Refusée",
    statutLienCasse: "Lien Cassé",
    statutPending: "En Attente",
    statutExpired: "Lien Expiré",

    // Modal suppression
    modalTitre: "🗑️ Confirmer la suppression",
    modalTexte: "Cette invitation sera définitivement supprimée. Cette action est irréversible.",
    modalAnnuler: "Annuler",
    modalSupprimer: "Supprimer",

    // Alert doublon
    alertDoublon: (statut) => `Une invitation existe déjà pour cette église (statut : ${statut}). Utilisez le bouton correspondant dans le tableau.`,

    // Message d'invitation
    msgBonjour: (dest) => `Bonjour ${dest},`,
    msgNouveauInvite: (sup) => `${sup} invite votre église à être sous sa supervision.`,
    msgRappelInvite: (sup) => `${sup} vous renvoie un rappel pour la supervision de votre église.`,
    msgLien: "🔗 Cliquez ici pour accepter :",
    msgSignature: "Que Dieu vous guide puissamment.\nAvec amour en Christ ❤️",
    msgSujetEmail: "Invitation Spirituelle",
  },
  en: {
    // En-tête
    titre: "Invitations & Church",
    titreAccent: "Links",

    // Intro
    intro1: "Linking a church allows you to place it under your supervision and view its statistics in",
    intro1Accent: "Global Stats",
    intro2: "In this",
    intro2Accent: "interface",
    intro2Suite: ", you can:",
    listeActions: [
      { icon: "✉️", text: "Send an invitation", color: "text-green-400", desc: " to a church" },
      { icon: "🔗", text: "Break the link", color: "text-gray-400", desc: " with a supervised church" },
      { icon: "🗑️", text: "Delete", color: "text-red-500", desc: " a sent invitation" },
      { icon: "🔄", text: "Resend the link", color: "text-green-400", desc: " if needed" },
      { icon: "⏳", text: "Send a reminder", color: "text-yellow-300", desc: " for a pending invitation" },
    ],
    introBas: "All actions are tracked here and visible in your table.",

    // Formulaire
    formTitreRappel: (denom) => `📨 Reminder — ${denom}`,
    formTitreRenvoyer: (denom) => `🔄 Resend — ${denom}`,
    formTitreDefaut: "Send to",
    annuler: "✕ Cancel",

    labelPrenom: "Leader's first name",
    placeholderPrenom: "First name *",
    labelNom: "Leader's last name",
    placeholderNom: "Last name *",
    labelDenomination: "Denomination",
    placeholderDenomination: "Denomination *",
    labelNomEglise: "Church name",
    placeholderNomEglise: "Church name",
    labelBranche: "Church branch",
    placeholderBranche: "Church branch",
    labelVille: "City",
    placeholderVille: "City",
    labelPays: "Country",   
    placeholderPays: "Country *",
    searchCountry: "Search a country...",
    labelModeEnvoi: "Sending method",
    placeholderModeEnvoi: "Choose a sending method",
    modeWhatsapp: "WhatsApp",
    modeEmail: "Email",   
    modalCasserTitre: "🔗 Confirm breaking the link",
    modalCasserTexte: "The link with this church will be broken and you will no longer see its statistics in Global Stats. This action is reversible: you can send a new invitation later.",
    modalCasserConfirmer: "Break the link",
    champsObligatoires: "* Required fields",
    erreurChamp: "This field is required",

    btnRappel: "📨 Resend a reminder",
    btnRenvoyer: "🔄 Resend invitation",
    btnEnvoyer: "✉️ Send invitation",

    // Tableau
    tableauTitre: "List of supervised churches",
    colDenomination: "Denomination",
    colNom: "Name",
    colBranche: "Branch",
    colVille: "City",
    colPays: "Country",
    colStatut: "Status",
    colAction: "Action",

    // Actions tableau
    actionRappel: "⏳ Reminder",
    actionSupprimer: "🗑️ Delete",
    actionCasser: "🔗 Break",
    actionRenvoyer: "🔄 Resend",

    // Statuts
    statutAcceptee: "Accepted",
    statutRefusee: "Refused",
    statutLienCasse: "Link Broken",
    statutPending: "Pending",
    statutExpired: "Link Expired",

    // Modal suppression
    modalTitre: "🗑️ Confirm deletion",
    modalTexte: "This invitation will be permanently deleted. This action is irreversible.",
    modalAnnuler: "Cancel",
    modalSupprimer: "Delete",

    // Alert doublon
    alertDoublon: (statut) => `An invitation already exists for this church (status: ${statut}). Use the corresponding button in the table.`,

    // Message d'invitation
    msgBonjour: (dest) => `Hello ${dest},`,
    msgNouveauInvite: (sup) => `${sup} invites your church to come under their supervision.`,
    msgRappelInvite: (sup) => `${sup} is sending you a reminder about the supervision of your church.`,
    msgLien: "🔗 Click here to accept:",
    msgSignature: "May God guide you powerfully.\nWith love in Christ ❤️",
    msgSujetEmail: "Spiritual Invitation",
  },
};

export default function LinkEglise() {
  const { lang } = useLang();
  const t = translations[lang];

  const formRef = useRef(null);

  const [superviseur, setSuperviseur] = useState({
    prenom: "",
    nom: "",
    eglise_id: null,
    eglise_nom: "",
    eglise_denomination: "",
    eglise_ville: "",
    eglise_pays: "",
    eglise_branche: "",
  });

  const [responsable, setResponsable] = useState({ prenom: "", nom: "" });

  const [eglise, setEglise] = useState({
    id: null,
    nom: "",
    denomination: "",
    ville: "",
    pays: "",
    branche: "",
  });

  const [canal, setCanal] = useState("");
  const [invitations, setInvitations] = useState([]);
  const [modeAction, setModeAction] = useState(null);
  const [selectedInvitation, setSelectedInvitation] = useState(null);
  const [errors, setErrors] = useState({});
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [confirmCasser, setConfirmCasser] = useState(null);

  const [paysOpen, setPaysOpen] = useState(false);
  const [paysSearch, setPaysSearch] = useState("");
  
  const paysTries = [...PAYS_DATA].sort((a, b) => a[lang].localeCompare(b[lang]));
  const paysFiltres = paysTries.filter((p) =>
    p[lang].toLowerCase().includes(paysSearch.toLowerCase()) ||
    p.fr.toLowerCase().includes(paysSearch.toLowerCase()) ||
    p.en.toLowerCase().includes(paysSearch.toLowerCase())
  );
  const paysSelectionne = PAYS_DATA.find((p) => p.code === eglise.pays) || null;

  useEffect(() => {
    const loadSuperviseur = async () => {
      const { data: { session } } = await supabase.auth.getSession();
console.log("SESSION AU CLIC:", session);
if (!session) {
  alert("Pas de session trouvée localement.");
  return;
}
const user = session.user;

      const { data, error } = await supabase
        .from("profiles")
        .select(`prenom, nom, eglise_id, eglises(nom, denomination, ville, pays, branche)`)
        .eq("id", user.id)
        .single();

      if (!error && data) {
        setSuperviseur({
          prenom: data.prenom,
          nom: data.nom,
          eglise_id: data.eglise_id,
          eglise_nom: data.eglises?.nom || "",
          eglise_denomination: data.eglises?.denomination || "",
          eglise_ville: data.eglises?.ville || "",
          eglise_pays: data.eglises?.pays || "",
          eglise_branche: data.eglises?.branche || "",
        });
      }
    };
    loadSuperviseur();
  }, []);

  const getStatusLabel = (statut) => {
    switch (statut?.toLowerCase()) {
      case "acceptee": return t.statutAcceptee;
      case "refusee": return t.statutRefusee;
      case "lien_casse": return t.statutLienCasse;
      case "pending": return t.statutPending;
      case "expired": return t.statutExpired;
      default: return statut;
    }
  };

  const getStatusStyle = (statut) => {
    switch (statut?.toLowerCase()) {
      case "acceptee": return { text: "text-green-400", border: "border-green-500" };
      case "refusee": return { text: "text-red-400", border: "border-red-500" };
      case "lien_casse": return { text: "text-gray-400", border: "border-gray-400" };
      case "pending": return { text: "text-orange-400", border: "border-orange-400" };
      default: return { text: "text-white", border: "border-white/20" };
    }
  };

  const loadInvitations = async () => {
    if (!superviseur.eglise_id) return;
    const { data, error } = await supabase
      .from("eglise_supervisions")
      .select("*")
      .eq("superviseur_eglise_id", superviseur.eglise_id)
      .order("created_at", { ascending: false });
    if (!error) setInvitations(data || []);
  };

  useEffect(() => {
    loadInvitations();
  }, [superviseur.eglise_id]);

  const handleSelectInvitation = (inv, mode) => {
    setSelectedInvitation(inv);
    setModeAction(mode);
    setResponsable({
      prenom: inv.responsable_prenom || "",
      nom: inv.responsable_nom || "",
    });
    const codeInterne = PAYS_DATA.find((p) => p.fr === inv.eglise_pays)?.code || "";
    setEglise({
      id: null,
      nom: inv.eglise_nom || "",
      denomination: inv.eglise_denomination || "",
      ville: inv.eglise_ville || "",
      pays: codeInterne,
      branche: inv.eglise_branche || "",
    });
    setErrors({});
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const resetForm = () => {
    setResponsable({ prenom: "", nom: "" });
    setEglise({ id: null, nom: "", denomination: "", ville: "", pays: "", branche: "" });
    setCanal("");
    setSelectedInvitation(null);
    setModeAction(null);
    setErrors({});
  };

  const handleDelete = async (id) => {
    const { error } = await supabase
      .from("eglise_supervisions")
      .delete()
      .eq("id", id);
    if (!error) {
      setConfirmDelete(null);
      loadInvitations();
    }
  };

    const handleCasser = async (inv) => {
    const { error } = await supabase
      .from("eglise_supervisions")
      .update({ statut: "lien_casse" })
      .eq("id", inv.id);
    if (!error) {
      setConfirmCasser(null);
      loadInvitations();
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!responsable.prenom.trim()) newErrors.prenom = true;
    if (!responsable.nom.trim()) newErrors.nom = true;
    if (!eglise.denomination.trim()) newErrors.denomination = true;
    if (!eglise.pays.trim()) newErrors.pays = true;
    if (!canal.trim()) newErrors.canal = true;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const buildMessage = (token, mode = "nouveau") => {
    const branche = superviseur.eglise_branche ? `, ${superviseur.eglise_branche}` : "";
    const superviseurInfo = `${superviseur.prenom} ${superviseur.nom} de ${superviseur.eglise_denomination}, ${superviseur.eglise_nom}${branche}, ${superviseur.eglise_ville}`;
    const destinataire = `${responsable.prenom} ${responsable.nom}`;
    const lien = `https://www.soultrack.org/accept-invitation?token=${token}`;

    const salut = t.msgBonjour(destinataire);
    const corps = mode === "rappel" ? t.msgRappelInvite(superviseurInfo) : t.msgNouveauInvite(superviseurInfo);

    return `${salut}\n\n${corps}\n\n${t.msgLien}\n${lien}\n\n${t.msgSignature}`;
  };

  const sendMessage = (message) => {
    if (canal === "whatsapp") {
      window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
    } else if (canal === "email") {
      window.location.href = `mailto:?subject=${encodeURIComponent(t.msgSujetEmail)}&body=${encodeURIComponent(message)}`;
    }
  };

  const handleAction = async () => {
    if (!validate()) return;

    const nomFRpays = PAYS_DATA.find((p) => p.code === eglise.pays)?.fr || eglise.pays;

    try {
      const token = crypto.randomUUID();
      const expireAt = new Date();
      expireAt.setDate(expireAt.getDate() + 7);

      if (modeAction === "rappel" && selectedInvitation) {
        await supabase
          .from("eglise_supervisions")
          .update({
            invitation_token: token,
            statut: "pending",
            expire_at: expireAt.toISOString(),
          })
          .eq("id", selectedInvitation.id);

        const message = buildMessage(token, "rappel");
        sendMessage(message);
        resetForm();
        loadInvitations();
        return;
      }

      if (modeAction === "renvoyer" && selectedInvitation) {
        await supabase
          .from("eglise_supervisions")
          .update({
            statut: "pending",
            invitation_token: token,
            expire_at: expireAt.toISOString(),
            responsable_prenom: responsable.prenom,
            responsable_nom: responsable.nom,
            eglise_nom: eglise.nom,
            eglise_denomination: eglise.denomination,
            eglise_ville: eglise.ville,
            eglise_pays: nomFRpays,
            eglise_branche: eglise.branche,
          })
          .eq("id", selectedInvitation.id);

        const message = buildMessage(token, "nouveau");
        sendMessage(message);
        resetForm();
        loadInvitations();
        return;
      }

      const { data: existing } = await supabase
        .from("eglise_supervisions")
        .select("id, statut")
        .eq("superviseur_eglise_id", superviseur.eglise_id)
        .eq("eglise_denomination", eglise.denomination)
        .eq("eglise_pays", nomFRpays)
        .maybeSingle();

      if (existing) {
        alert(t.alertDoublon(getStatusLabel(existing.statut)));
        return;
      }

      await supabase.from("eglise_supervisions").insert([{
        superviseur_eglise_id: superviseur.eglise_id,
        responsable_prenom: responsable.prenom,
        responsable_nom: responsable.nom,
        eglise_nom: eglise.nom,
        eglise_denomination: eglise.denomination,
        eglise_ville: eglise.ville,
        eglise_pays: nomFRpays,
        eglise_branche: eglise.branche,
        statut: "pending",
        invitation_token: token,
        expire_at: expireAt.toISOString(),
      }]);

      const message = buildMessage(token, "nouveau");
      sendMessage(message);
      resetForm();
      loadInvitations();

    } catch (err) {
      console.error(err);
    }
  };

  const inputClass = (hasError) =>
    `w-full p-2 text-black rounded ${hasError ? "border-2 border-red-500" : ""}`;

  const LabelField = ({ children, required }) => (
    <label className="block text-sm text-white/70 mb-1">
      {children}{required && <span className="text-red-400 ml-1">*</span>}
    </label>
  );

  const buttonLabel = () => {
    if (modeAction === "rappel") return t.btnRappel;
    if (modeAction === "renvoyer") return t.btnRenvoyer;
    return t.btnEnvoyer;
  };

  const formTitre = () => {
    if (modeAction === "rappel") return t.formTitreRappel(eglise.denomination || "...");
    if (modeAction === "renvoyer") return t.formTitreRenvoyer(eglise.denomination || "...");
    return t.formTitreDefaut;
  };

  return (
    <div className="min-h-screen bg-[#333699] text-white p-4 flex flex-col items-center">
      <HeaderPages />

      {/* INTRO */}
      <div className="w-full flex flex-col items-center mb-8">
        <h1 className="text-2xl font-bold mt-4 mb-6 text-center text-white">
          {t.titre} <span className="text-emerald-300">{t.titreAccent}</span>
        </h1>
        <div className="max-w-3xl w-full text-center">
          <p className="italic text-base text-white/90 mb-4">
            {t.intro1}{" "}
            <span className="text-blue-300 font-semibold">{t.intro1Accent}</span>.
          </p>
          <p className="italic text-base text-white/90 mb-4">
            {t.intro2} <span className="text-blue-300 font-semibold">{t.intro2Accent}</span>{t.intro2Suite}
          </p>
          <ul className="list-none space-y-3 text-base">
            {t.listeActions.map((item, i) => (
              <li key={i} className={`${item.color} italic${i === 0 ? " mt-3" : ""}`}>
                {item.icon} <strong>{item.text}</strong>{item.desc}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-gray-300 text-sm italic">{t.introBas}</p>
        </div>
      </div>

      {/* FORM */}
      <div ref={formRef} className="w-full max-w-md bg-white/10 p-6 rounded-xl space-y-4">

        <div className="flex items-center justify-between border-b border-white/20 pb-2">
          <h2 className="text-lg font-semibold text-emerald-300">{formTitre()}</h2>
          {modeAction && (
            <button onClick={resetForm} className="text-xs text-white/50 hover:text-white underline">
              {t.annuler}
            </button>
          )}
        </div>

        <div>
          <LabelField required>{t.labelPrenom}</LabelField>
          <input className={inputClass(errors.prenom)} placeholder={t.placeholderPrenom}
            value={responsable.prenom}
            onChange={(e) => setResponsable({ ...responsable, prenom: e.target.value })}
          />
          {errors.prenom && <p className="text-red-400 text-xs mt-1">{t.erreurChamp}</p>}
        </div>

        <div>
          <LabelField required>{t.labelNom}</LabelField>
          <input className={inputClass(errors.nom)} placeholder={t.placeholderNom}
            value={responsable.nom}
            onChange={(e) => setResponsable({ ...responsable, nom: e.target.value })}
          />
          {errors.nom && <p className="text-red-400 text-xs mt-1">{t.erreurChamp}</p>}
        </div>

        <div>
          <LabelField required>{t.labelDenomination}</LabelField>
          <input className={inputClass(errors.denomination)} placeholder={t.placeholderDenomination}
            value={eglise.denomination}
            onChange={(e) => setEglise({ ...eglise, denomination: e.target.value })}
          />
          {errors.denomination && <p className="text-red-400 text-xs mt-1">{t.erreurChamp}</p>}
        </div>

        <div>
          <LabelField>{t.labelNomEglise}</LabelField>
          <input className={inputClass(false)} placeholder={t.placeholderNomEglise}
            value={eglise.nom}
            onChange={(e) => setEglise({ ...eglise, nom: e.target.value })}
          />
        </div>

        <div>
          <LabelField>{t.labelBranche}</LabelField>
          <input className={inputClass(false)} placeholder={t.placeholderBranche}
            value={eglise.branche}
            onChange={(e) => setEglise({ ...eglise, branche: e.target.value })}
          />
        </div>

        <div>
          <LabelField>{t.labelVille}</LabelField>
          <input className={inputClass(false)} placeholder={t.placeholderVille}
            value={eglise.ville}
            onChange={(e) => setEglise({ ...eglise, ville: e.target.value })}
          />
        </div>

        <div style={{ position: "relative" }}>
          <LabelField required>{t.labelPays}</LabelField>
          <div
            onClick={() => { setPaysOpen(!paysOpen); setPaysSearch(""); }}
            className={`w-full p-2 rounded flex items-center gap-2 cursor-pointer bg-white ${
              errors.pays ? "border-2 border-red-500" : ""
            }`}
            style={{ color: paysSelectionne ? "black" : "#6b7280" }}
          >
            {paysSelectionne && (
              <img
                src={`https://flagcdn.com/w40/${paysSelectionne.flagCode || paysSelectionne.code}.png`}
                alt={paysSelectionne[lang]}
                style={{ width: "24px", height: "16px", borderRadius: "2px", flexShrink: 0 }}
              />
            )}
            <span style={{ flex: 1, fontSize: "14px" }}>
              {paysSelectionne ? paysSelectionne[lang] : t.placeholderPays}
            </span>
            <span style={{ color: "#9ca3af", fontSize: "12px" }}>{paysOpen ? "▲" : "▼"}</span>
          </div>
        
          {paysOpen && (
            <div style={{
              position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0,
              background: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.12)", zIndex: 50,
              maxHeight: "220px", overflow: "hidden",
              display: "flex", flexDirection: "column",
            }}>
              <div style={{ padding: "8px" }}>
                <input
                  autoFocus
                  placeholder={t.searchCountry}
                  value={paysSearch}
                  onChange={(e) => setPaysSearch(e.target.value)}
                  style={{
                    width: "100%", border: "1px solid #e5e7eb", borderRadius: "8px",
                    padding: "7px 10px", fontSize: "13px", outline: "none", color: "black",
                  }}
                />
              </div>
              <div style={{ overflowY: "auto", flex: 1 }}>
                {paysFiltres.map((pays) => (
                  <div
                    key={pays.code}
                    onClick={() => {
                      setEglise({ ...eglise, pays: pays.code });
                      setPaysOpen(false);
                      setPaysSearch("");
                    }}
                    style={{
                      display: "flex", alignItems: "center", gap: "10px",
                      padding: "9px 12px", cursor: "pointer", color: "black",
                      background: paysSelectionne?.code === pays.code ? "#eff6ff" : "transparent",
                      fontSize: "14px",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "#f9fafb"}
                    onMouseLeave={(e) => e.currentTarget.style.background = paysSelectionne?.code === pays.code ? "#eff6ff" : "transparent"}
                  >
                    <img
                      src={`https://flagcdn.com/w40/${pays.flagCode || pays.code}.png`}
                      alt={pays[lang]}
                      style={{ width: "24px", height: "16px", borderRadius: "2px", flexShrink: 0 }}
                    />
                    <span style={{ flex: 1 }}>{pays[lang]}</span>
                    <span style={{ fontSize: "11px", color: "#9ca3af" }}>
                      {lang === "fr" ? pays.en : pays.fr}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {errors.pays && <p className="text-red-400 text-xs mt-1">{t.erreurChamp}</p>}
        </div>

        <div>
          <LabelField required>{t.labelModeEnvoi}</LabelField>
          <select
            className={`w-full p-2 text-black rounded ${errors.canal ? "border-2 border-red-500" : ""}`}
            value={canal}
            onChange={(e) => setCanal(e.target.value)}
          >
            <option value="">{t.placeholderModeEnvoi}</option>
            <option value="whatsapp">{t.modeWhatsapp}</option>
            <option value="email">{t.modeEmail}</option>
          </select>
          {errors.canal && <p className="text-red-400 text-xs mt-1">{t.erreurChamp}</p>}
        </div>

        <p className="text-white/50 text-xs">{t.champsObligatoires}</p>

        <button onClick={handleAction}
          className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded font-semibold transition-colors"
        >
          {buttonLabel()}
        </button>
      </div>

      {/* TABLE */}
      <h3 className="w-full max-w-5xl text-center text-2xl font-bold text-amber-300 mb-6 mt-10">
        {t.tableauTitre}
      </h3>

      <div className="w-full max-w-5xl overflow-x-auto">
        <div className="hidden md:grid md:grid-cols-[1.3fr_1fr_1fr_1fr_1fr_0.8fr_1fr] text-sm font-semibold uppercase border-b border-white/40 pb-2 gap-x-3 px-4">
          <div>{t.colDenomination}</div>
          <div>{t.colNom}</div>
          <div>{t.colBranche}</div>
          <div>{t.colVille}</div>
          <div>{t.colPays}</div>
          <div>{t.colStatut}</div>
          <div className="text-center">{t.colAction}</div>
        </div>

        {invitations.map((inv) => {
          const statusStyle = getStatusStyle(inv.statut);
          return (
            <div key={inv.id}
              className={`grid grid-cols-1 md:grid-cols-[1.3fr_1fr_1fr_1fr_1fr_0.8fr_1fr] gap-x-3 px-4 py-3 mt-3 items-center border-l-4 ${statusStyle.border} bg-white/5 rounded-lg`}
            >
              <div>
                <span className="block text-xs text-white/50 uppercase md:hidden">{t.colDenomination}</span>
                {inv.eglise_denomination}
              </div>
              <div>
                <span className="block text-xs text-white/50 uppercase md:hidden">{t.colNom}</span>
                {inv.eglise_nom}
              </div>
              <div>
                <span className="block text-xs text-white/50 uppercase md:hidden">{t.colBranche}</span>
                {inv.eglise_branche}
              </div>
              <div>
                <span className="block text-xs text-white/50 uppercase md:hidden">{t.colVille}</span>
                {inv.eglise_ville}
              </div>
              <div>
                <span className="block text-xs text-white/50 uppercase md:hidden">{t.colPays}</span>
                {inv.eglise_pays}
              </div>
              <div className={`font-semibold ${statusStyle.text}`}>
                <span className="block text-xs text-white/50 uppercase md:hidden">{t.colStatut}</span>
                {getStatusLabel(inv.statut)}
              </div>

              <div className="flex flex-wrap justify-start md:justify-center gap-2 text-sm mt-2 md:mt-0">
                {inv.statut === "pending" && (
                  <>
                    <button
                      onClick={() => handleSelectInvitation(inv, "rappel")}
                      className="text-yellow-300 hover:underline whitespace-nowrap"
                    >
                      {t.actionRappel}
                    </button>
                    <button
                      onClick={() => setConfirmDelete(inv.id)}
                      className="text-red-400 hover:underline whitespace-nowrap"
                    >
                      {t.actionSupprimer}
                    </button>
                  </>
                )}
                  {inv.statut === "acceptee" && (
                    <button
                      onClick={() => setConfirmCasser(inv)}
                      className="text-gray-300 hover:underline whitespace-nowrap"
                    >
                      {t.actionCasser}
                    </button>
                  )}
                {(inv.statut === "refusee" || inv.statut === "lien_casse") && (
                  <button
                    onClick={() => handleSelectInvitation(inv, "renvoyer")}
                    className="text-green-300 hover:underline whitespace-nowrap"
                  >
                    {t.actionRenvoyer}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL SUPPRESSION */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-[#1e2a7a] border border-red-500 rounded-xl p-6 max-w-sm w-full text-center space-y-4">
            <p className="text-lg font-semibold text-white">{t.modalTitre}</p>
            <p className="text-white/70 text-sm">{t.modalTexte}</p>
            <div className="flex gap-3 justify-center mt-2">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 rounded bg-white/10 hover:bg-white/20 text-white text-sm"
              >
                {t.modalAnnuler}
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white text-sm font-semibold"
              >
                {t.modalSupprimer}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CASSER LE LIEN */}
        {confirmCasser && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
            <div className="bg-[#1e2a7a] border border-orange-400 rounded-xl p-6 max-w-sm w-full text-center space-y-4">
              <p className="text-lg font-semibold text-white">{t.modalCasserTitre}</p>
              <p className="text-white/70 text-sm">{t.modalCasserTexte}</p>
              <div className="flex gap-3 justify-center mt-2">
                <button
                  onClick={() => setConfirmCasser(null)}
                  className="px-4 py-2 rounded bg-white/10 hover:bg-white/20 text-white text-sm"
                >
                  {t.modalAnnuler}
                </button>
                <button
                  onClick={() => handleCasser(confirmCasser)}
                  className="px-4 py-2 rounded bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold"
                >
                  {t.modalCasserConfirmer}
                </button>
              </div>
            </div>
          </div>
        )}

      <Footer />
    </div>
  );
}
