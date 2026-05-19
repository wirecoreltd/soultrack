"use client";

import { useEffect, useState, useRef } from "react";
import supabase from "../lib/supabaseClient";
import PastoralAssistant from "../components/PastoralAssistant";
import { useLang } from "../hooks/useLang";

const translations = {
  fr: {
    // Header
    suiviPastoral: "Suivi pastoral",

    // Section titles
    nouveauSuivi: "Nouveau suivi",
    modifierSuivi: "Modifier le suivi",
    historique: "📅 Historique",
    questionsEntretien: "🗣️ Questions d'entretien",
    nouveauSuiviSection: "📋 Nouveau suivi",
    modifierSuiviSection: "📋 Modifier le suivi",

    // Edit banner
    modificationDu: "✏️ Modification du suivi du",
    annuler: "Annuler",

    // Form fields
    date: "Date",
    typeAction: "Type d'action",
    selectionner: "-- Sélectionner --",
    appel: "Appel",
    visite: "Visite",
    entretien: "Entretien",
    besoins: "Besoins",
    commentaire: "Commentaire",
    commentairePlaceholder: "Commentaire...",

    // Besoins options
    finances: "Finances",
    sante: "Santé",
    travailEtudes: "Travail / Études",
    familleEnfants: "Famille / Enfants",
    miracle: "Miracle",
    delivrance: "Délivrance",
    relationsConflits: "Relations / Conflits",
    addictions: "Addictions / Dépendances",
    guidanceSpirituelle: "Guidance spirituelle",
    logement: "Logement / Sécurité",
    communaute: "Communauté / Isolement",
    depression: "Dépression / Santé mentale",

    // Statuts
    enSuivi: "En suivi",
    resolu: "Résolu",
    resoluTick: "✓ Résolu",

    // Historique
    aucunSuivi: "Aucun suivi pour le moment",
    besoinLabel: "Besoin :",
    commentaireLabel: " Commentaire :",
    voirMoins: "▲ Voir moins",
    voirReponses: "▼ Voir les réponses de l'entretien",
    modifier: "✏️ Modifier",
    enCours: "✏️ En cours...",

    // Interview questions
    q_etat_general_section: "1. État général",
    q_etat_general_question: "Comment vas-tu vraiment en ce moment ?",
    q_vie_spirituelle_section: "2. Vie spirituelle",
    q_vie_spirituelle_question: "Comment est ta relation avec Dieu ces derniers temps ?",
    q_intention_priere_question: "Dans quoi aimerais-tu voir Dieu intervenir dans ta vie ?",
    q_combats_luttes_section: "3. Combats & blocages",
    q_combats_luttes_question: "Est-ce qu'il y a une lutte ou un défi actuellement ?",
    q_blocages_question: "Qu'est-ce qui te bloque aujourd'hui pour avancer ?",
    q_vie_personnelle_section: "4. Vie personnelle",
    q_vie_personnelle_question: "Comment ça se passe dans ta vie personnelle (famille, travail…) ?",
    q_besoins_avancement_section: "5. Besoins",
    q_besoins_avancement_question: "De quoi aurais-tu besoin pour aller mieux ou progresser ?",
    q_talents_section: "6. Talents & potentiel",
    q_talents_question: "Qu'est-ce que tu fais naturellement bien ?",
    q_domaine_service_question: "Dans quel domaine aimerais-tu servir ou te développer ?",
    notesPl: "Notes...",

    // Footer buttons
    fermer: "Fermer",
    ajouterSuivi: "Ajouter suivi",
    enregistrer: "💾 Enregistrer les modifications",
    ajoutEnCours: "Ajout...",
    miseAJour: "Mise à jour...",

    // Alerts
    alerteChamps: "Date et type sont obligatoires",
    alerteSession: "Session introuvable. Veuillez vous déconnecter et vous reconnecter.",
    erreur: "Erreur : ",
  },
  en: {
    // Header
    suiviPastoral: "Pastoral Follow-up",

    // Section titles
    nouveauSuivi: "New follow-up",
    modifierSuivi: "Edit follow-up",
    historique: "📅 History",
    questionsEntretien: "🗣️ Interview Questions",
    nouveauSuiviSection: "📋 New follow-up",
    modifierSuiviSection: "📋 Edit follow-up",

    // Edit banner
    modificationDu: "✏️ Editing follow-up from",
    annuler: "Cancel",

    // Form fields
    date: "Date",
    typeAction: "Action type",
    selectionner: "-- Select --",
    appel: "Call",
    visite: "Visit",
    entretien: "Meeting",
    besoins: "Needs",
    commentaire: "Comment",
    commentairePlaceholder: "Comment...",

    // Besoins options
    finances: "Finances",
    sante: "Health",
    travailEtudes: "Work / Studies",
    familleEnfants: "Family / Children",
    miracle: "Miracle",
    delivrance: "Deliverance",
    relationsConflits: "Relationships / Conflicts",
    addictions: "Addictions / Dependencies",
    guidanceSpirituelle: "Spiritual Guidance",
    logement: "Housing / Safety",
    communaute: "Community / Isolation",
    depression: "Depression / Mental Health",

    // Statuts
    enSuivi: "In follow-up",
    resolu: "Resolved",
    resoluTick: "✓ Resolved",

    // Historique
    aucunSuivi: "No follow-ups yet",
    besoinLabel: "Need:",
    commentaireLabel: " Comment:",
    voirMoins: "▲ Show less",
    voirReponses: "▼ View interview answers",
    modifier: "✏️ Edit",
    enCours: "✏️ Editing...",

    // Interview questions
    q_etat_general_section: "1. General state",
    q_etat_general_question: "How are you really doing right now?",
    q_vie_spirituelle_section: "2. Spiritual life",
    q_vie_spirituelle_question: "How is your relationship with God lately?",
    q_intention_priere_question: "Where would you like to see God intervene in your life?",
    q_combats_luttes_section: "3. Struggles & blocks",
    q_combats_luttes_question: "Is there a struggle or challenge right now?",
    q_blocages_question: "What is holding you back from moving forward today?",
    q_vie_personnelle_section: "4. Personal life",
    q_vie_personnelle_question: "How is your personal life going (family, work…)?",
    q_besoins_avancement_section: "5. Needs",
    q_besoins_avancement_question: "What would you need to feel better or grow?",
    q_talents_section: "6. Talents & potential",
    q_talents_question: "What do you naturally do well?",
    q_domaine_service_question: "In what area would you like to serve or develop yourself?",
    notesPl: "Notes...",

    // Footer buttons
    fermer: "Close",
    ajouterSuivi: "Add follow-up",
    enregistrer: "💾 Save changes",
    ajoutEnCours: "Adding...",
    miseAJour: "Updating...",

    // Alerts
    alerteChamps: "Date and type are required",
    alerteSession: "Session not found. Please log out and log back in.",
    erreur: "Error: ",
  },
};

function parseHistoriqueBesoin(besoinJson) {
  if (!besoinJson) return [];
  try {
    const parsed = JSON.parse(besoinJson);
    if (!Array.isArray(parsed)) return [];
    if (parsed.length > 0 && typeof parsed[0] === "object" && parsed[0].label) {
      return parsed;
    }
    return parsed.map((b) => ({ label: b, statut: "En suivi" }));
  } catch {
    return [];
  }
}

export default function SuiviPopup({ member, onClose, user }) {
  const { lang } = useLang();
  const t = translations[lang];

  // Build interview questions from translations (keeps data-driven pattern)
  const INTERVIEW_QUESTIONS = [
    { key: "etat_general",       emoji: "🧭", section: t.q_etat_general_section,        question: t.q_etat_general_question },
    { key: "vie_spirituelle",    emoji: "🙏", section: t.q_vie_spirituelle_section,      question: t.q_vie_spirituelle_question },
    { key: "intention_priere",   emoji: "🙏", section: null,                             question: t.q_intention_priere_question, indent: true },
    { key: "combats_luttes",     emoji: "⚔️", section: t.q_combats_luttes_section,      question: t.q_combats_luttes_question },
    { key: "blocages",           emoji: "⚔️", section: null,                             question: t.q_blocages_question, indent: true },
    { key: "vie_personnelle",    emoji: "👨‍👩‍👧", section: t.q_vie_personnelle_section,  question: t.q_vie_personnelle_question },
    { key: "besoins_avancement", emoji: "🎯", section: t.q_besoins_avancement_section,  question: t.q_besoins_avancement_question },
    { key: "talents",            emoji: "🌱", section: t.q_talents_section,              question: t.q_talents_question },
    { key: "domaine_service",    emoji: "🌱", section: null,                             question: t.q_domaine_service_question, indent: true },
  ];

  const EMPTY_INTERVIEW = {
    etat_general: "", vie_spirituelle: "", intention_priere: "",
    combats_luttes: "", blocages: "", vie_personnelle: "",
    besoins_avancement: "", talents: "", domaine_service: "",
  };

  const besoinsOptions = [
    t.finances, t.sante, t.travailEtudes, t.familleEnfants, t.miracle, t.delivrance,
    t.relationsConflits, t.addictions, t.guidanceSpirituelle,
    t.logement, t.communaute, t.depression,
  ];

  const [loading, setLoading] = useState(false);
  const [suivis, setSuivis] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentUserName, setCurrentUserName] = useState("");
  const [editingSuivi, setEditingSuivi] = useState(null);
  const [expandedSuivis, setExpandedSuivis] = useState({});

  const formTopRef = useRef(null);
  const modalRef = useRef(null);

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
    besoins.forEach((b) => { s[b] = t.enSuivi; });
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

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  useEffect(() => {
    const resolveUser = async () => {
      if (user?.id) {
        setCurrentUserId(user.id);
        if (user.prenom || user.nom) {
          setCurrentUserName(`${user.prenom || ""} ${user.nom || ""}`.trim());
          return;
        }
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

  useEffect(() => { fetchSuivis(); }, []);

  const fetchSuivis = async () => {
    const { data } = await supabase
      .from("suivis")
      .select("*, profiles:created_by(prenom, nom)")
      .eq("membre_id", member.id)
      .order("date_action", { ascending: false });
    setSuivis(data || []);
  };

  const handleEditSuivi = (s) => {
    const besoinsArr = parseHistoriqueBesoin(s.besoin);
    const besoinChecked = [], besoinStatuts = {}, resolved = [];
    besoinsArr.forEach(({ label, statut }) => {
      if (statut === "Résolu") resolved.push(label);
      else { besoinChecked.push(label); besoinStatuts[label] = statut || t.enSuivi; }
    });
    setEditingSuivi(s);
    setResolvedBesoins(resolved);
    setForm({
      date_action: s.date_action || "",
      type: s.action_type || s.type || "",
      besoin: besoinChecked,
      besoinStatuts,
      commentaire: s.commentaire || "",
      etat_general: s.etat_general || "",
      vie_spirituelle: s.vie_spirituelle || "",
      intention_priere: s.intention_priere || "",
      combats_luttes: s.combats_luttes || "",
      blocages: s.blocages || "",
      vie_personnelle: s.vie_personnelle || "",
      besoins_avancement: s.besoins_avancement || "",
      talents: s.talents || "",
      domaine_service: s.domaine_service || "",
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
      setForm((prev) => ({ ...prev, besoin: [...prev.besoin, value], besoinStatuts: { ...prev.besoinStatuts, [value]: t.enSuivi } }));
      return;
    }
    if (isChecked) {
      setResolvedBesoins((prev) => [...prev, value]);
      setForm((prev) => ({ ...prev, besoin: prev.besoin.filter((b) => b !== value), besoinStatuts: Object.fromEntries(Object.entries(prev.besoinStatuts).filter(([k]) => k !== value)) }));
      return;
    }
    setForm((prev) => ({ ...prev, besoin: [...prev.besoin, value], besoinStatuts: { ...prev.besoinStatuts, [value]: t.enSuivi } }));
  };

  const toggleStatutBesoin = (besoin) => {
    setForm((prev) => ({
      ...prev,
      besoinStatuts: { ...prev.besoinStatuts, [besoin]: prev.besoinStatuts[besoin] === t.resolu ? t.enSuivi : t.resolu },
    }));
  };

  const handleSubmit = async () => {
    if (!form.date_action || !form.type) { alert(t.alerteChamps); return; }
    if (!currentUserId) { alert(t.alerteSession); return; }
    setLoading(true);

    const resolvedFromChecked = form.besoin.filter((b) => form.besoinStatuts[b] === t.resolu);
    const allResolved = [...new Set([...resolvedBesoins, ...resolvedFromChecked])];
    const newMemberBesoins = [
      ...memberBesoins.filter((b) => !allResolved.includes(b)),
      ...form.besoin.filter((b) => !memberBesoins.includes(b) && form.besoinStatuts[b] !== t.resolu),
    ];
    const besoinAvecStatut = [
      ...form.besoin.map((b) => ({ label: b, statut: form.besoinStatuts[b] || t.enSuivi })),
      ...resolvedBesoins.map((b) => ({ label: b, statut: "Résolu" })),
    ];

    const interviewFields = {
      etat_general: form.etat_general || null,
      vie_spirituelle: form.vie_spirituelle || null,
      intention_priere: form.intention_priere || null,
      combats_luttes: form.combats_luttes || null,
      blocages: form.blocages || null,
      vie_personnelle: form.vie_personnelle || null,
      besoins_avancement: form.besoins_avancement || null,
      talents: form.talents || null,
      domaine_service: form.domaine_service || null,
    };

    const payload = {
      type: form.type,
      action_type: form.type,
      statut: allResolved.length > 0 && form.besoin.filter((b) => form.besoinStatuts[b] !== t.resolu).length === 0 ? "Résolu" : "En suivi",
      besoin: besoinAvecStatut.length ? JSON.stringify(besoinAvecStatut) : null,
      commentaire: form.commentaire,
      date_action: form.date_action,
      ...interviewFields,
    };

    if (editingSuivi) {
      const { error } = await supabase.from("suivis").update(payload).eq("id", editingSuivi.id);
      if (error) { setLoading(false); alert(t.erreur + error.message); return; }
      setSuivis((prev) => prev.map((s) => s.id === editingSuivi.id ? { ...s, ...payload } : s));
    } else {
      const { error } = await supabase.from("suivis").insert({ ...payload, membre_id: member.id, created_by: currentUserId });
      if (error) { setLoading(false); alert(t.erreur + error.message); return; }
      await fetchSuivis();
    }

    await supabase.from("membres_complets").update({ besoin: JSON.stringify(newMemberBesoins) }).eq("id", member.id);
    setMemberBesoins(newMemberBesoins);
    setResolvedBesoins([]);
    setEditingSuivi(null);
    setLoading(false);
    const newStatuts = {};
    newMemberBesoins.forEach((b) => { newStatuts[b] = t.enSuivi; });
    setForm({ date_action: "", type: "", besoin: newMemberBesoins, besoinStatuts: newStatuts, commentaire: "", ...EMPTY_INTERVIEW });
  };

  const formatDateForInput = (date) => date ? date.split("T")[0] : "";

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      const months = lang === "en"
        ? ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
        : ["Janv","Févr","Mars","Avr","Mai","Juin","Juil","Août","Sept","Oct","Nov","Déc"];
      return `${d.getDate().toString().padStart(2,"0")} ${months[d.getMonth()]} ${d.getFullYear()}`;
    } catch { return dateStr; }
  };

  const statutColor = (statut) => {
    if (statut === "Résolu" || statut === t.resolu) return "text-green-600 font-semibold";
    if (statut === "En suivi" || statut === t.enSuivi) return "text-blue-600 font-semibold";
    return "text-orange-500 font-semibold";
  };

  const toggleExpand = (id) => setExpandedSuivis((prev) => ({ ...prev, [id]: !prev[id] }));

  const hasInterviewData = (s) => INTERVIEW_QUESTIONS.some((q) => s[q.key]);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: "rgba(30,35,90,0.35)", backdropFilter: "blur(6px)" }}>
      <div ref={modalRef} className="relative w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden" style={{ background: "#ffffff", border: "1px solid #e2e8f0" }}>

        {/* HEADER */}
        <div ref={formTopRef} className="px-6 pt-6 pb-4 relative" style={{ background: "linear-gradient(135deg, #2E3192 0%, #4f54c9 100%)" }}>
          <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-white font-bold text-sm" style={{ background: "rgba(255,255,255,0.2)" }}>✕</button>
          <h2 className="text-xl font-bold text-white pr-10">💡 {member.prenom} {member.nom}</h2>
          <p className="text-blue-100 text-sm mt-1 opacity-80">{t.suiviPastoral}</p>
        </div>

        {/* BODY */}
        <div className="overflow-y-auto px-6 py-5 flex flex-col gap-5" style={{ maxHeight: "68vh" }}>

          {editingSuivi && (
            <div className="flex items-center justify-between bg-orange-50 border border-orange-300 rounded-xl px-4 py-2">
              <p className="text-orange-700 text-sm font-semibold">{t.modificationDu} {formatDate(editingSuivi.date_action)}</p>
              <button onClick={handleCancelEdit} className="text-xs text-gray-500 underline hover:text-gray-700">{t.annuler}</button>
            </div>
          )}

          <SectionTitle>{editingSuivi ? t.modifierSuiviSection : t.nouveauSuiviSection}</SectionTitle>

          <Field label={t.date}>
            <input type="date" value={formatDateForInput(form.date_action)} onChange={(e) => setForm((p) => ({ ...p, date_action: e.target.value }))} className="inp" />
          </Field>

          <Field label={t.typeAction}>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="inp">
              <option value="">{t.selectionner}</option>
              <option value="Appel">{t.appel}</option>
              <option value="Visite">{t.visite}</option>
              <option value="Entretien">{t.entretien}</option>
            </select>
          </Field>

          <Field label={t.besoins}>
            <div className="space-y-2 mt-1">
              {besoinsOptions.map((b) => {
                const isChecked = form.besoin.includes(b);
                const isResolved = resolvedBesoins.includes(b);
                const statut = form.besoinStatuts[b] || t.enSuivi;
                let boxStyle = "bg-white border-gray-300";
                let showTick = false;
                if (isResolved) boxStyle = "bg-green-500 border-green-500";
                else if (isChecked) { boxStyle = "bg-orange-400 border-orange-400"; showTick = true; }
                return (
                  <div key={b} className="flex items-center gap-3">
                    <label className="flex items-center gap-2 text-sm cursor-pointer select-none flex-1" onClick={() => toggleBesoin(b)}>
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${boxStyle}`}>
                        {showTick && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                      </div>
                      <span className={isResolved ? "line-through text-gray-400" : "text-gray-700"}>{b}</span>
                    </label>
                    {isChecked && (
                      <button type="button" onClick={() => toggleStatutBesoin(b)} className={`text-xs px-2 py-0.5 rounded-full border font-semibold transition-colors whitespace-nowrap ${statut === t.resolu ? "bg-green-100 border-green-400 text-green-700" : "bg-blue-50 border-blue-300 text-blue-600"}`}>
                        {statut === t.resolu ? t.resoluTick : t.enSuivi}
                      </button>
                    )}
                    {isResolved && <span className="text-xs px-2 py-0.5 rounded-full border bg-green-100 border-green-400 text-green-700 font-semibold whitespace-nowrap">{t.resoluTick}</span>}
                  </div>
                );
              })}
            </div>
          </Field>

          {currentUserName && <p className="text-center text-sm text-gray-400">👤 {currentUserName}</p>}

          {/* ASSISTANT PASTORAL */}
          <PastoralAssistant membre={member} suivis={suivis} />

          {/* HISTORIQUE */}
          <SectionTitle>{t.historique}</SectionTitle>

          {suivis.length === 0 && <p className="text-sm text-gray-400 italic">{t.aucunSuivi}</p>}

          {suivis.map((s) => {
            const besoinsArr = parseHistoriqueBesoin(s.besoin);
            const isBeingEdited = editingSuivi?.id === s.id;
            const isExpanded = expandedSuivis[s.id];
            const hasInterview = hasInterviewData(s);

            return (
              <div key={s.id} className={`rounded-xl px-4 py-3 text-sm space-y-1 border transition-colors ${isBeingEdited ? "bg-orange-50 border-orange-300" : "bg-gray-50 border-gray-200"}`}>
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-gray-800">📅 {formatDate(s.date_action)} — {s.action_type}</p>
                  <button onClick={() => handleEditSuivi(s)} className={`text-xs px-2 py-1 rounded-lg font-semibold border transition-colors ${isBeingEdited ? "bg-orange-100 border-orange-400 text-orange-700" : "bg-white border-gray-300 text-gray-600 hover:bg-orange-50 hover:border-orange-300 hover:text-orange-600"}`}>
                    {isBeingEdited ? t.enCours : t.modifier}
                  </button>
                </div>

                {besoinsArr.length > 0 && (
                  <div className="mt-1">
                    <p className="text-gray-400 text-xs mb-0.5">{t.besoinLabel}</p>
                    {besoinsArr.map((item, i) => (
                      <p key={i} className="text-gray-700">{item.label} — <span className={statutColor(item.statut)}>{item.statut}</span></p>
                    ))}
                  </div>
                )}

                {s.commentaire && <p className="text-gray-600 mt-2">{t.commentaireLabel} {s.commentaire}</p>}

                {hasInterview && (
                  <>
                    <button
                      onClick={() => toggleExpand(s.id)}
                      className="text-xs font-semibold mt-1 flex items-center gap-1"
                      style={{ color: "#2E3192", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                    >
                      {isExpanded ? t.voirMoins : t.voirReponses}
                    </button>

                    {isExpanded && (
                      <div className="mt-2 space-y-2 pt-2 border-t border-gray-200">
                        {INTERVIEW_QUESTIONS.filter((q) => s[q.key]).map((q) => (
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

          {/* QUESTIONS D'ENTRETIEN */}
          <SectionTitle>{t.questionsEntretien}</SectionTitle>
          {INTERVIEW_QUESTIONS.map((q) => (
            <InterviewField
              key={q.key}
              emoji={q.emoji}
              section={q.section}
              question={q.question}
              indent={q.indent}
              value={form[q.key]}
              onChange={(v) => setForm((p) => ({ ...p, [q.key]: v }))}
              placeholder={t.notesPl}
            />
          ))}

          {/* COMMENTAIRE */}
          <Field label={t.commentaire}>
            <textarea placeholder={t.commentairePlaceholder} value={form.commentaire} onChange={(e) => setForm({ ...form, commentaire: e.target.value })} className="inp" rows={3} />
          </Field>

        </div>

        {/* FOOTER */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row gap-3">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-gray-600 bg-white border border-gray-200 hover:bg-gray-100 transition-all">{t.fermer}</button>
          <button type="button" onClick={handleSubmit} disabled={loading} className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-white transition-all disabled:opacity-60"
            style={{ background: loading ? "#a0a0c0" : editingSuivi ? "linear-gradient(135deg, #f97316 0%, #ea580c 100%)" : "linear-gradient(135deg, #2E3192 0%, #4f54c9 100%)" }}>
            {loading
              ? (editingSuivi ? t.miseAJour : t.ajoutEnCours)
              : (editingSuivi ? t.enregistrer : t.ajouterSuivi)
            }
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

function InterviewField({ emoji, section, question, value, onChange, indent = false, placeholder = "Notes..." }) {
  return (
    <div style={{ background: indent ? "#fafafa" : "#f0f4ff", borderRadius: 10, padding: "10px 12px", border: `1px solid ${indent ? "#e8eaf6" : "#c7cef5"}`, marginLeft: indent ? 16 : 0 }}>
      {section && (
        <p style={{ fontSize: 11, fontWeight: 700, color: "#2E3192", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.07em" }}>
          {emoji} {section}
        </p>
      )}
      <p style={{ fontSize: 13, color: "#4b5563", marginBottom: 6, fontStyle: "italic" }}>{question}</p>
      <textarea
        placeholder={placeholder}
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
    <div className="flex items-center gap-2 pt-2">
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
