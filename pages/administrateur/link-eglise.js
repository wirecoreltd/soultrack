"use client";

import { useState, useEffect, useRef } from "react";
import supabase from "../../lib/supabaseClient";
import HeaderPages from "../../components/HeaderPages";
import Footer from "../../components/Footer";
import { useLang } from "../../hooks/useLang";

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
    labelModeEnvoi: "Mode d'envoi",
    placeholderModeEnvoi: "Choisir un mode d'envoi",
    modeWhatsapp: "WhatsApp",
    modeEmail: "Email",
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
    labelModeEnvoi: "Sending method",
    placeholderModeEnvoi: "Choose a sending method",
    modeWhatsapp: "WhatsApp",
    modeEmail: "Email",
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
    setEglise({
      id: null,
      nom: inv.eglise_nom || "",
      denomination: inv.eglise_denomination || "",
      ville: inv.eglise_ville || "",
      pays: inv.eglise_pays || "",
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
    if (!error) loadInvitations();
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
            eglise_pays: eglise.pays,
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
        .eq("eglise_pays", eglise.pays)
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
        eglise_pays: eglise.pays,
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

        <div>
          <LabelField required>{t.labelPays}</LabelField>
          <input className={inputClass(errors.pays)} placeholder={t.placeholderPays}
            value={eglise.pays}
            onChange={(e) => setEglise({ ...eglise, pays: e.target.value })}
          />
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
                    onClick={() => handleCasser(inv)}
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

      <Footer />
    </div>
  );
}
