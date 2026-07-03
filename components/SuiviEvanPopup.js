"use client";

import { useEffect, useState, useRef } from "react";
import supabase from "../lib/supabaseClient";
import PastoralAssistant from "../components/PastoralAssistant";
import { useLang } from "../hooks/useLang";

const translations = {
  fr: {
    headerTitle: (prenom, nom) => `🌍 Suivi évangélisation — ${prenom} ${nom}`,
    headerSub: "Ajouter ou modifier un suivi",
    notFoundWarning: "⚠️ Ce membre n'est pas encore enregistré dans la liste des évangélisés. Les suivis d'évangélisation ne peuvent pas être ajoutés.",
    checkingProfile: "🔄 Vérification du profil évangélisé...",
    editingSuiviLabel: (date) => `✏️ Modification du suivi du ${date}`,
    cancel: "Annuler",
    newOrEditTitle: (isEditing) => (isEditing ? "Modifier le suivi" : "Nouveau suivi"),
    dateLabel: "Date",
    typeLabel: "Type d'action",
    typeDefault: "-- Type d'action --",
    typeAppel: "Appel",
    typeVisite: "Visite",
    typeEntretien: "Entretien",
    typeMessage: "Message",
    sectionBesoins: "🙏 Besoins",
    besoinsOptions: [
      "Finances", "Santé", "Travail / Études", "Famille / Enfants",
      "Relations / Conflits", "Addictions / Dépendances", "Guidance spirituelle",
      "Logement / Sécurité", "Communauté / Isolement", "Dépression / Santé mentale",
    ],
    statutResolu: "✓ Résolu",
    statutEnSuivi: "En suivi",
    sectionHistorique: "📅 Historique",
    noHistorique: "Aucun suivi pour le moment",
    editButton: "✏️ Modifier",
    editingButton: "✏️ En cours...",
    besoinsLabel: "Besoins :",
    commentaireLabel: "Commentaire : ",
    voirMoins: "▲ Voir moins",
    voirEntretien: "▼ Voir les réponses d'entretien",
    sectionEntretien: "🗣️ Questions d'entretien",
    commentaireField: "Commentaire",
    commentairePlaceholder: "Commentaire...",
    close: "Fermer",
    updating: "Mise à jour...",
    adding: "Ajout...",
    saveChanges: "💾 Enregistrer les modifications",
    addSuivi: "Ajouter suivi",
    alertDateType: "Date et type sont obligatoires",
    alertNoSession: "Session introuvable. Veuillez vous déconnecter et vous reconnecter.",
    alertNoEvangelise: "Ce membre ne possède pas encore d'entrée dans la table des évangélisés.\nVeuillez d'abord l'enregistrer comme évangélisé avant d'ajouter un suivi.",
    errorPrefix: "Erreur : ",
    successMessage: "✅ Suivi enregistré avec succès !",
    notesPlaceholder: "Notes...",
    questions: [
      { key: "etat_actuel", emoji: "❤️", section: "1. État actuel", question: "Comment vas-tu vraiment en ce moment ?" },
      { key: "situation_actuelle", emoji: "🧭", section: "1. État actuel", question: "Qu'est-ce que tu traverses actuellement dans ta vie ?" },
      { key: "relation_avec_dieu", emoji: "🔍", section: "2. Vie spirituelle", question: "Est-ce que tu as déjà réfléchi à ta relation avec Dieu après notre échange ?" },
      { key: "perception_spirituelle", emoji: "🌿", section: "2. Vie spirituelle", question: "Qu'est-ce que Dieu représente pour toi aujourd'hui ?" },
      { key: "besoins_principaux", emoji: "💔", section: "3. Besoins & situation", question: "Y a-t-il un domaine où tu ressens un besoin ou une difficulté en ce moment ?" },
      { key: "preoccupations", emoji: "🧠", section: "3. Besoins & situation", question: "Qu'est-ce qui te préoccupe le plus actuellement ?" },
      { key: "ouverture_spirituelle", emoji: "✝️", section: "4. Ouverture à Dieu", question: "Est-ce que tu aimerais que Dieu intervienne dans une situation de ta vie ?" },
      { key: "ouverture_priere", emoji: "🙏", section: "4. Ouverture à Dieu", question: "Est-ce que tu serais ouvert à prier ensemble pour cela ?" },
      { key: "accompagnement_suivi", emoji: "🌱", section: "5. Suivi", question: "Est-ce que tu serais d'accord pour qu'on continue à avancer ensemble dans ce cheminement ?" },
      { key: "etudes_parole", emoji: "📖", section: "5. Suivi", question: "Est-ce que tu aimerais découvrir davantage la Parole de Dieu avec nous ?" },
    ],
    months: ["Janv","Févr","Mars","Avr","Mai","Juin","Juil","Août","Sept","Oct","Nov","Déc"],
  },
  en: {
    headerTitle: (prenom, nom) => `🌍 Evangelism follow-up — ${prenom} ${nom}`,
    headerSub: "Add or edit a follow-up",
    notFoundWarning: "⚠️ This member is not yet registered in the evangelised list. Evangelism follow-ups cannot be added.",
    checkingProfile: "🔄 Checking evangelised profile...",
    editingSuiviLabel: (date) => `✏️ Editing the follow-up from ${date}`,
    cancel: "Cancel",
    newOrEditTitle: (isEditing) => (isEditing ? "Edit follow-up" : "New follow-up"),
    dateLabel: "Date",
    typeLabel: "Action type",
    typeDefault: "-- Action type --",
    typeAppel: "Call",
    typeVisite: "Visit",
    typeEntretien: "Interview",
    typeMessage: "Message",
    sectionBesoins: "🙏 Needs",
    besoinsOptions: [
      "Finances", "Health", "Work / Studies", "Family / Children",
      "Relationships / Conflicts", "Addictions / Dependencies", "Spiritual guidance",
      "Housing / Safety", "Community / Isolation", "Depression / Mental health",
    ],
    statutResolu: "✓ Resolved",
    statutEnSuivi: "In follow-up",
    sectionHistorique: "📅 History",
    noHistorique: "No follow-up yet",
    editButton: "✏️ Edit",
    editingButton: "✏️ In progress...",
    besoinsLabel: "Needs:",
    commentaireLabel: "Comment: ",
    voirMoins: "▲ See less",
    voirEntretien: "▼ View interview answers",
    sectionEntretien: "🗣️ Interview questions",
    commentaireField: "Comment",
    commentairePlaceholder: "Comment...",
    close: "Close",
    updating: "Updating...",
    adding: "Adding...",
    saveChanges: "💾 Save changes",
    addSuivi: "Add follow-up",
    alertDateType: "Date and type are required",
    alertNoSession: "Session not found. Please log out and log back in.",
    alertNoEvangelise: "This member does not yet have an entry in the evangelised table.\nPlease register them as evangelised first before adding a follow-up.",
    errorPrefix: "Error: ",
    successMessage: "✅ Follow-up saved successfully!",
    notesPlaceholder: "Notes...",
    questions: [
      { key: "etat_actuel", emoji: "❤️", section: "1. Current state", question: "How are you really doing right now?" },
      { key: "situation_actuelle", emoji: "🧭", section: "1. Current state", question: "What are you currently going through in your life?" },
      { key: "relation_avec_dieu", emoji: "🔍", section: "2. Spiritual life", question: "Have you thought about your relationship with God since our last conversation?" },
      { key: "perception_spirituelle", emoji: "🌿", section: "2. Spiritual life", question: "What does God represent to you today?" },
      { key: "besoins_principaux", emoji: "💔", section: "3. Needs & situation", question: "Is there an area where you feel a need or difficulty right now?" },
      { key: "preoccupations", emoji: "🧠", section: "3. Needs & situation", question: "What concerns you the most right now?" },
      { key: "ouverture_spirituelle", emoji: "✝️", section: "4. Openness to God", question: "Would you like God to intervene in a situation in your life?" },
      { key: "ouverture_priere", emoji: "🙏", section: "4. Openness to God", question: "Would you be open to praying together about this?" },
      { key: "accompagnement_suivi", emoji: "🌱", section: "5. Follow-up", question: "Would you be willing to continue this journey together with us?" },
      { key: "etudes_parole", emoji: "📖", section: "5. Follow-up", question: "Would you like to discover more of God's Word with us?" },
    ],
    months: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
  },
};

// ─── Table canonique des besoins ───
// Le FRANÇAIS est toujours la valeur stockée en base (colonne `besoin`),
// quelle que soit la langue de l'interface au moment de la saisie.
// Cela évite d'avoir des données mixtes FR/EN en base selon la langue active,
// et permet de traduire correctement à l'affichage, y compris les anciennes
// entrées qui auraient déjà été stockées en anglais.
export const besoinTranslationMap = translations.fr.besoinsOptions.reduce((acc, frLabel, i) => {
  const enLabel = translations.en.besoinsOptions[i];
  acc[frLabel] = { fr: frLabel, en: enLabel };
  acc[enLabel] = { fr: frLabel, en: enLabel };
  return acc;
}, {});

export const translateBesoin = (label, lang) => besoinTranslationMap[label]?.[lang] || label;

const EMPTY_INTERVIEW = {
  etat_actuel: "",
  situation_actuelle: "",
  relation_avec_dieu: "",
  perception_spirituelle: "",
  besoins_principaux: "",
  preoccupations: "",
  ouverture_spirituelle: "",
  ouverture_priere: "",
  accompagnement_suivi: "",
  etudes_parole: "",
};

export default function SuiviEvanPopup({ member, onClose, user }) {
  const { lang } = useLang();
  const t = translations[lang];

  const [loading, setLoading] = useState(false);
  const [suivis, setSuivis] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentUserName, setCurrentUserName] = useState("");
  const [editingSuivi, setEditingSuivi] = useState(null);
  const [expandedSuivis, setExpandedSuivis] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  const [evangeliseId, setEvangeliseId] = useState(null);
  const [evangeliseNotFound, setEvangeliseNotFound] = useState(false);

  const formTopRef = useRef(null);

  const parseBesoinsList = (val) => {
    if (!val) return [];
    try {
      const parsed = typeof val === "string" ? JSON.parse(val) : val;
      return Array.isArray(parsed) ? parsed : [];
    } catch { return []; }
  };

  const [memberBesoins, setMemberBesoins] = useState(parseBesoinsList(member?.besoin));

  const initStatuts = (besoins) => {
    const s = {};
    besoins.forEach((b) => { s[b] = "En suivi"; });
    return s;
  };

  const emptyForm = {
    date_action: "",
    type: "",
    besoin: parseBesoinsList(member?.besoin),
    besoinStatuts: initStatuts(parseBesoinsList(member?.besoin)),
    commentaire: "",
    ...EMPTY_INTERVIEW,
  };

  const [form, setForm] = useState(emptyForm);
  const [resolvedBesoins, setResolvedBesoins] = useState([]);

  // Toujours utiliser la liste FR comme valeurs canoniques (clés stockées en base).
  // On affiche la traduction via translateBesoin(b, lang) au rendu.
  const besoinsOptions = translations.fr.besoinsOptions;

  // ─── Résolution evangelise_id ───
  useEffect(() => {
    const resolveEvangeliseId = async () => {
      if (!member?.id) return;

      const { data: direct } = await supabase.from("evangelises").select("id").eq("id", member.id).maybeSingle();
      if (direct?.id) { setEvangeliseId(direct.id); return; }

      const { data: byMembreId } = await supabase.from("evangelises").select("id").eq("membre_id", member.id).maybeSingle();
      if (byMembreId?.id) { setEvangeliseId(byMembreId.id); return; }

      if (member.telephone) {
        const { data: byPhone } = await supabase.from("evangelises").select("id").eq("telephone", member.telephone).maybeSingle();
        if (byPhone?.id) { setEvangeliseId(byPhone.id); return; }
      }

      if (member.prenom && member.nom) {
        const { data: byName } = await supabase.from("evangelises").select("id").eq("prenom", member.prenom).eq("nom", member.nom).maybeSingle();
        if (byName?.id) { setEvangeliseId(byName.id); return; }
      }

      console.warn("[SuiviEvanPopup] Aucun evangelise_id trouvé pour member.id =", member.id);
      setEvangeliseNotFound(true);
    };
    resolveEvangeliseId();
  }, [member]);

  // ─── Résolution utilisateur ───
  useEffect(() => {
    const resolveUser = async () => {
      if (user?.id) {
        setCurrentUserId(user.id);
        if (user.prenom || user.nom) { setCurrentUserName(`${user.prenom || ""} ${user.nom || ""}`.trim()); return; }
        const { data } = await supabase.from("profiles").select("prenom, nom").eq("id", user.id).single();
        if (data) setCurrentUserName(`${data.prenom || ""} ${data.nom || ""}`.trim());
        return;
      }
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData?.session?.user?.id) {
          const uid = sessionData.session.user.id;
          setCurrentUserId(uid);
          const { data } = await supabase.from("profiles").select("prenom, nom").eq("id", uid).single();
          if (data) setCurrentUserName(`${data.prenom || ""} ${data.nom || ""}`.trim());
          else setCurrentUserName(sessionData.session.user.email || "");
          return;
        }
      } catch (e) {}
      try {
        const keys = Object.keys(localStorage);
        const authKey = keys.find((k) => k.startsWith("sb-") && k.endsWith("-auth-token"));
        if (authKey) {
          const stored = JSON.parse(localStorage.getItem(authKey));
          if (stored?.user?.id) {
            const uid = stored.user.id;
            setCurrentUserId(uid);
            const { data } = await supabase.from("profiles").select("prenom, nom").eq("id", uid).single();
            if (data) setCurrentUserName(`${data.prenom || ""} ${data.nom || ""}`.trim());
            else setCurrentUserName(stored.user.email || "");
          }
        }
      } catch (e) {}
    };
    resolveUser();
  }, [user]);

  useEffect(() => { if (evangeliseId) fetchSuivis(); }, [evangeliseId]);

  const fetchSuivis = async () => {
    if (!evangeliseId) return;
    const { data } = await supabase
      .from("suivis_evangelises")
      .select("*, profiles:created_by(prenom, nom)")
      .eq("evangelise_id", evangeliseId)
      .order("date_action", { ascending: false });
    setSuivis(data || []);
  };

  const parseHistoriqueBesoin = (besoinJson) => {
    if (!besoinJson) return [];
    try {
      const parsed = JSON.parse(besoinJson);
      if (!Array.isArray(parsed)) return [];
      if (parsed.length > 0 && typeof parsed[0] === "object" && parsed[0].label) return parsed;
      return parsed.map((b) => ({ label: b, statut: "En suivi" }));
    } catch { return []; }
  };

  const handleEditSuivi = (s) => {
    const besoinsArr = parseHistoriqueBesoin(s.besoin);
    const besoinChecked = [], besoinStatuts = {}, resolved = [];
    besoinsArr.forEach(({ label, statut }) => {
      // Normalisation : quelle que soit la langue déjà stockée, on retombe sur le FR canonique
      const canonicalLabel = translateBesoin(label, "fr");
      if (statut === "Résolu") resolved.push(canonicalLabel);
      else { besoinChecked.push(canonicalLabel); besoinStatuts[canonicalLabel] = statut || "En suivi"; }
    });
    setEditingSuivi(s);
    setResolvedBesoins(resolved);
    setForm({
      date_action: s.date_action || "",
      type: s.action_type || s.type || "",
      besoin: besoinChecked,
      besoinStatuts,
      commentaire: s.commentaire || "",
      etat_actuel: s.etat_actuel || "",
      situation_actuelle: s.situation_actuelle || "",
      relation_avec_dieu: s.relation_avec_dieu || "",
      perception_spirituelle: s.perception_spirituelle || "",
      besoins_principaux: s.besoins_principaux || "",
      preoccupations: s.preoccupations || "",
      ouverture_spirituelle: s.ouverture_spirituelle || "",
      ouverture_priere: s.ouverture_priere || "",
      accompagnement_suivi: s.accompagnement_suivi || "",
      etudes_parole: s.etudes_parole || "",
    });
    setTimeout(() => formTopRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  const handleCancelEdit = () => {
    setEditingSuivi(null);
    setResolvedBesoins([]);
    setForm(emptyForm);
  };

  const toggleBesoin = (value) => {
    const isChecked = form.besoin.includes(value);
    const isResolved = resolvedBesoins.includes(value);
    if (isResolved) {
      setResolvedBesoins((prev) => prev.filter((b) => b !== value));
      setForm((prev) => ({ ...prev, besoin: [...prev.besoin, value], besoinStatuts: { ...prev.besoinStatuts, [value]: "En suivi" } }));
      return;
    }
    if (isChecked) {
      setResolvedBesoins((prev) => [...prev, value]);
      setForm((prev) => ({ ...prev, besoin: prev.besoin.filter((b) => b !== value), besoinStatuts: Object.fromEntries(Object.entries(prev.besoinStatuts).filter(([k]) => k !== value)) }));
      return;
    }
    setForm((prev) => ({ ...prev, besoin: [...prev.besoin, value], besoinStatuts: { ...prev.besoinStatuts, [value]: "En suivi" } }));
  };

  const toggleStatutBesoin = (besoin) => {
    setForm((prev) => ({
      ...prev,
      besoinStatuts: { ...prev.besoinStatuts, [besoin]: prev.besoinStatuts[besoin] === "Résolu" ? "En suivi" : "Résolu" },
    }));
  };

  const handleSubmit = async () => {
    if (!form.date_action || !form.type) { alert(t.alertDateType); return; }
    if (!currentUserId) { alert(t.alertNoSession); return; }
    if (!evangeliseId) {
      alert(t.alertNoEvangelise);
      return;
    }
    setLoading(true);

    const resolvedFromChecked = form.besoin.filter((b) => form.besoinStatuts[b] === "Résolu");
    const allResolved = [...new Set([...resolvedBesoins, ...resolvedFromChecked])];
    const newMemberBesoins = [
      ...memberBesoins.filter((b) => !allResolved.includes(b)),
      ...form.besoin.filter((b) => !memberBesoins.includes(b) && form.besoinStatuts[b] !== "Résolu"),
    ];
    const besoinAvecStatut = [
      ...form.besoin.map((b) => ({ label: b, statut: form.besoinStatuts[b] || "En suivi" })),
      ...resolvedBesoins.map((b) => ({ label: b, statut: "Résolu" })),
    ];

    const interviewFields = {
      etat_actuel: form.etat_actuel || null,
      situation_actuelle: form.situation_actuelle || null,
      relation_avec_dieu: form.relation_avec_dieu || null,
      perception_spirituelle: form.perception_spirituelle || null,
      besoins_principaux: form.besoins_principaux || null,
      preoccupations: form.preoccupations || null,
      ouverture_spirituelle: form.ouverture_spirituelle || null,
      ouverture_priere: form.ouverture_priere || null,
      accompagnement_suivi: form.accompagnement_suivi || null,
      etudes_parole: form.etudes_parole || null,
    };

    const payload = {
      type: form.type,
      action_type: form.type,
      statut: allResolved.length > 0 && form.besoin.filter((b) => form.besoinStatuts[b] !== "Résolu").length === 0 ? "Résolu" : "En suivi",
      besoin: besoinAvecStatut.length ? JSON.stringify(besoinAvecStatut) : null,
      commentaire: form.commentaire,
      date_action: form.date_action,
      ...interviewFields,
    };

    if (editingSuivi) {
      const { error } = await supabase.from("suivis_evangelises").update(payload).eq("id", editingSuivi.id);
      if (error) { setLoading(false); alert(t.errorPrefix + error.message); return; }
      setSuivis((prev) => prev.map((s) => s.id === editingSuivi.id ? { ...s, ...payload } : s));
    } else {
      const { error } = await supabase.from("suivis_evangelises").insert({ ...payload, evangelise_id: evangeliseId, created_by: currentUserId });
      if (error) { setLoading(false); alert(t.errorPrefix + error.message); return; }
      await fetchSuivis();
    }

    // ── Synchronisation avec evangelises (source des besoins du profil) ──
    await supabase.from("evangelises").update({ besoin: JSON.stringify(newMemberBesoins) }).eq("id", evangeliseId);

    // ── Synchronisation avec suivis_des_evangelises (affichage carte principale) ──
    await supabase
      .from("suivis_des_evangelises")
      .update({ besoin: JSON.stringify(newMemberBesoins) })
      .eq("evangelise_id", evangeliseId);

    setMemberBesoins(newMemberBesoins);
    setResolvedBesoins([]);
    setEditingSuivi(null);
    setLoading(false);
    const newStatuts = {};
    newMemberBesoins.forEach((b) => { newStatuts[b] = "En suivi"; });
    setForm({ date_action: "", type: "", besoin: newMemberBesoins, besoinStatuts: newStatuts, commentaire: "", ...EMPTY_INTERVIEW });

    setSuccessMessage(t.successMessage);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const formatDateForInput = (date) => (!date ? "" : date.split("T")[0]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      return `${d.getDate().toString().padStart(2, "0")} ${t.months[d.getMonth()]} ${d.getFullYear()}`;
    } catch { return dateStr; }
  };

  const statutColor = (statut) => {
    if (statut === "Résolu") return "text-green-600 font-semibold";
    if (statut === "En suivi") return "text-blue-600 font-semibold";
    return "text-orange-500 font-semibold";
  };

  const statutLabel = (statut) => {
    if (statut === "Résolu") return t.statutResolu.replace("✓ ", "");
    if (statut === "En suivi") return t.statutEnSuivi;
    return statut;
  };

  const toggleExpand = (id) => setExpandedSuivis((prev) => ({ ...prev, [id]: !prev[id] }));
  const hasInterviewData = (s) => t.questions.some((q) => s[q.key]);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[60] p-4" style={{ background: "rgba(30,35,90,0.45)", backdropFilter: "blur(6px)" }}>
      <div className="relative w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden" style={{ background: "#ffffff", border: "1px solid #e2e8f0" }}>

        {/* HEADER */}
        <div ref={formTopRef} className="px-6 pt-6 pb-4" style={{ background: "linear-gradient(135deg, #2E3192 0%, #4f54c9 100%)" }}>
          <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-white font-bold text-sm" style={{ background: "rgba(255,255,255,0.2)" }}>✕</button>
          <h2 className="text-xl font-bold text-white pr-10">{t.headerTitle(member.prenom, member.nom)}</h2>
          <p className="text-blue-100 text-sm mt-1 opacity-80">{t.headerSub}</p>
        </div>

        {/* BODY */}
        <div className="overflow-y-auto px-6 py-5 flex flex-col gap-5" style={{ maxHeight: "72vh" }}>

          {evangeliseNotFound && (
            <div className="bg-red-50 border border-red-300 rounded-xl px-4 py-3 text-sm text-red-700">
              {t.notFoundWarning}
            </div>
          )}

          {!evangeliseId && !evangeliseNotFound && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-600">
              {t.checkingProfile}
            </div>
          )}

          {editingSuivi && (
            <div className="flex items-center justify-between bg-orange-50 border border-orange-300 rounded-xl px-4 py-2">
              <p className="text-orange-700 text-sm font-semibold">{t.editingSuiviLabel(formatDate(editingSuivi.date_action))}</p>
              <button onClick={handleCancelEdit} className="text-xs text-gray-500 underline hover:text-gray-700">{t.cancel}</button>
            </div>
          )}

          {successMessage && (
            <div className="bg-green-50 border border-green-300 rounded-xl px-4 py-3 text-sm text-green-700 font-semibold text-center animate-pulse">
              {successMessage}
            </div>
          )}

          {/* FORMULAIRE */}
          {!evangeliseNotFound && (
            <>
              <SectionTitle>📋 {t.newOrEditTitle(!!editingSuivi)}</SectionTitle>

              <Field label={t.dateLabel}>
                <input type="date" value={formatDateForInput(form.date_action)} onChange={(e) => setForm((p) => ({ ...p, date_action: e.target.value }))} className="inp" />
              </Field>

              <Field label={t.typeLabel}>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="inp">
                  <option value="">{t.typeDefault}</option>
                  <option value="Appel">{t.typeAppel}</option>
                  <option value="Visite">{t.typeVisite}</option>
                  <option value="Entretien">{t.typeEntretien}</option>
                  <option value="Message">{t.typeMessage}</option>
                </select>
              </Field>

              <SectionTitle>{t.sectionBesoins}</SectionTitle>
              <div className="flex flex-col gap-2">
                {besoinsOptions.map((b) => {
                  const isChecked = form.besoin.includes(b);
                  const isResolved = resolvedBesoins.includes(b);
                  const statut = form.besoinStatuts[b] || "En suivi";
                  let boxStyle = "bg-white border-gray-300";
                  let showTick = false;
                  if (isResolved) boxStyle = "bg-green-500 border-green-500";
                  else if (isChecked) { boxStyle = "bg-orange-400 border-orange-400"; showTick = true; }
                  return (
                    <div key={b} className="flex items-center gap-3">
                      <label className="flex items-center gap-2 text-sm cursor-pointer select-none flex-1 text-gray-700" onClick={() => toggleBesoin(b)}>
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${boxStyle}`}>
                          {showTick && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                        </div>
                        <span className={isResolved ? "line-through text-gray-400" : ""}>{translateBesoin(b, lang)}</span>
                      </label>
                      {isChecked && (
                        <button type="button" onClick={() => toggleStatutBesoin(b)} className={`text-xs px-2 py-0.5 rounded-full border font-semibold transition-colors whitespace-nowrap ${statut === "Résolu" ? "bg-green-100 border-green-400 text-green-700" : "bg-blue-50 border-blue-300 text-blue-600"}`}>
                          {statut === "Résolu" ? t.statutResolu : t.statutEnSuivi}
                        </button>
                      )}
                      {isResolved && <span className="text-xs px-2 py-0.5 rounded-full border bg-green-100 border-green-400 text-green-700 font-semibold whitespace-nowrap">{t.statutResolu}</span>}
                    </div>
                  );
                })}
              </div>

              {currentUserName && <p className="text-center text-sm text-gray-400">👤 {currentUserName}</p>}
            </>
          )}

          {/* ASSISTANT PASTORAL */}
          <PastoralAssistant membre={member} suivis={suivis} />

          {/* HISTORIQUE */}
          <SectionTitle>{t.sectionHistorique}</SectionTitle>

          {suivis.length === 0 && <p className="text-sm text-gray-400 text-center py-2">{t.noHistorique}</p>}

          <div className="flex flex-col gap-3">
            {suivis.map((s) => {
              const besoinsArr = parseHistoriqueBesoin(s.besoin);
              const isBeingEdited = editingSuivi?.id === s.id;
              const isExpanded = expandedSuivis[s.id];
              const hasInterview = hasInterviewData(s);

              return (
                <div key={s.id} className={`rounded-xl border px-4 py-3 text-sm flex flex-col gap-1 transition-colors ${isBeingEdited ? "bg-orange-50 border-orange-300" : "bg-gray-50 border-gray-200"}`}>
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-gray-800">📅 {formatDate(s.date_action)} — {s.action_type}</p>
                    <button onClick={() => handleEditSuivi(s)} className={`text-xs px-2 py-1 rounded-lg font-semibold border transition-colors ${isBeingEdited ? "bg-orange-100 border-orange-400 text-orange-700" : "bg-white border-gray-300 text-gray-600 hover:bg-orange-50 hover:border-orange-300 hover:text-orange-600"}`}>
                      {isBeingEdited ? t.editingButton : t.editButton}
                    </button>
                  </div>

                  {besoinsArr.length > 0 && (
                    <div>
                      <p className="text-gray-400 text-xs mb-0.5">{t.besoinsLabel}</p>
                      {besoinsArr.map((item, i) => (
                        <p key={i} className="text-gray-700">{translateBesoin(item.label, lang)} — <span className={statutColor(item.statut)}>{statutLabel(item.statut)}</span></p>
                      ))}
                    </div>
                  )}

                  {s.commentaire && <p className="text-gray-600">{t.commentaireLabel}{s.commentaire}</p>}

                  {/* VOIR PLUS / MOINS */}
                  {hasInterview && (
                    <>
                      <button
                        onClick={() => toggleExpand(s.id)}
                        className="text-xs font-semibold mt-1 flex items-center gap-1"
                        style={{ color: "#2E3192", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                      >
                        {isExpanded ? t.voirMoins : t.voirEntretien}
                      </button>

                      {isExpanded && (
                        <div className="mt-2 space-y-2 pt-2 border-t border-gray-200">
                          {t.questions.filter((q) => s[q.key]).map((q) => (
                            <div key={q.key} style={{ paddingLeft: q.indent ? 12 : 0 }}>
                              {q.section && (
                                <p style={{ fontSize: 10, fontWeight: 700, color: "#2E3192", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 1 }}>
                                  {q.emoji} {q.section}
                                </p>
                              )}
                              <p style={{ fontSize: 11, color: "#6b7280", fontStyle: "italic", marginBottom: 2 }}>{q.question}</p>
                              <p style={{ fontSize: 13, color: "#374151", background: "#f0f4ff", borderRadius: 6, padding: "5px 8px" }}>{s[q.key]}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}

                  <p className="text-gray-400 text-xs">👤 {s.profiles?.prenom} {s.profiles?.nom}</p>
                </div>
              );
            })}
          </div>

          {/* QUESTIONS D'ENTRETIEN */}
          {!evangeliseNotFound && (
            <>
              <SectionTitle>{t.sectionEntretien}</SectionTitle>
              {t.questions.map((q, i) => {
                const isFirstInSection = i === 0 || t.questions[i - 1].section !== q.section;
                return (
                  <InterviewField
                    key={q.key}
                    emoji={q.emoji}
                    section={isFirstInSection ? q.section : null}
                    question={q.question}
                    indent={q.indent}
                    value={form[q.key]}
                    onChange={(v) => setForm((p) => ({ ...p, [q.key]: v }))}
                    notesPlaceholder={t.notesPlaceholder}
                  />
                );
              })}

              <Field label={t.commentaireField}>
                <textarea placeholder={t.commentairePlaceholder} value={form.commentaire} onChange={(e) => setForm({ ...form, commentaire: e.target.value })} className="inp" rows={3} />
              </Field>
            </>
          )}

        </div>

        {/* FOOTER */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row gap-3">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-gray-600 bg-white border border-gray-200 hover:bg-gray-100 transition-all">{t.close}</button>
          <button type="button" onClick={handleSubmit} disabled={loading || !evangeliseId} className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-white transition-all disabled:opacity-60"
            style={{ background: loading ? "#a0a0c0" : editingSuivi ? "linear-gradient(135deg, #f97316 0%, #ea580c 100%)" : "linear-gradient(135deg, #2E3192 0%, #4f54c9 100%)" }}>
            {loading ? (editingSuivi ? t.updating : t.adding) : editingSuivi ? t.saveChanges : t.addSuivi}
          </button>
        </div>

        <style jsx>{`
          .inp { width:100%; border:1px solid #e2e8f0; border-radius:10px; padding:10px 12px; background:#f8fafc; color:#1e293b; font-size:14px; outline:none; transition:border-color .2s; }
          .inp:focus { border-color:#2E3192; background:#fff; }
          select.inp option { background:white; color:#1e293b; }
        `}</style>
      </div>
    </div>
  );
}

function InterviewField({ emoji, section, question, value, onChange, indent = false, notesPlaceholder }) {
  return (
    <div style={{ background: indent ? "#fafafa" : "#f0f4ff", borderRadius: 10, padding: "10px 12px", border: `1px solid ${indent ? "#e8eaf6" : "#c7cef5"}`, marginLeft: indent ? 16 : 0 }}>
      {section && (
        <p style={{ fontSize: 11, fontWeight: 700, color: "#2E3192", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.07em" }}>
          {emoji} {section}
        </p>
      )}
      <p style={{ fontSize: 13, color: "#4b5563", marginBottom: 6, fontStyle: "italic" }}>{question}</p>
      <textarea
        placeholder={notesPlaceholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={2}
        style={{ width: "100%", border: "1px solid #dde1f5", borderRadius: 8, padding: "8px 10px", background: "#fff", color: "#1e293b", fontSize: 13, outline: "none", resize: "vertical", fontFamily: "inherit" }}
        onFocus={(e) => (e.target.style.borderColor = "#2E3192")}
        onBlur={(e) => (e.target.style.borderColor = "#dde1f5")}
      />
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <div className="flex items-center gap-2 pt-1">
      <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#2E3192" }}>{children}</span>
      <div className="flex-1 h-px" style={{ background: "#e2e8f0" }} />
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#64748b" }}>{label}</label>
      {children}
    </div>
  );
}
