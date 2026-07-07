"use client";

import { useEffect, useState, useRef } from "react";
import supabase from "../lib/supabaseClient";
import { useLang } from "../hooks/useLang";

/* ============================================================
   TRADUCTIONS
   ============================================================ */
const translations = {
  fr: {
    titre: "Évaluation du leader",
    nouvelleEval: "Nouvelle évaluation",
    modifierEval: "Modifier l'évaluation",
    historique: "📅 Historique des évaluations",
    nouvelleEvalSection: "📋 Nouvelle évaluation",
    modifierEvalSection: "📋 Modifier l'évaluation",
    modificationDu: "✏️ Modification de l'évaluation du",
    annuler: "Annuler",
    date: "Date",
    succesAjout: "✅ Évaluation ajoutée avec succès",
    succesMaj: "✅ Évaluation mise à jour avec succès",

    // Section 1
    s1_titre: "1. Construction personnelle du leader",
    s1_niveau: "Niveau",
    niveau_dev: "En développement",
    niveau_bon: "Bon niveau",
    niveau_tresBon: "Très bon niveau",
    observation: "Observation",

    // Section 2
    s2_titre: "2. Responsabilité et maturité",
    s2_items: [
      "Assume ses responsabilités",
      "Tient ses engagements",
      "Accepte la correction",
      "Prend des initiatives",
      "Cherche des solutions face aux difficultés",
      "Cherche souvent des excuses face aux difficultés",
      "Reconnaît ses erreurs",
      "Fait preuve de stabilité",
    ],

    // Section 3
    s3_titre: "3. Cœur de serviteur",
    s3_items: [
      "Sert avec humilité",
      "Aide les autres sans chercher la reconnaissance",
      "Est disponible pour aider",
      "Porte les besoins des autres",
      "Montre un esprit de sacrifice",
    ],

    // Section 4
    s4_titre: "4. Capacité à construire les autres",
    s4_items: [
      "Encourage les autres à suivre Dieu",
      "Accompagne spirituellement les personnes",
      "Encourage les personnes découragées",
      "Aide les nouveaux à progresser",
      "Influence positivement son entourage",
    ],

    // Section 5
    s5_titre: "5. Vision et engagement",
    s5_items: [
      "Comprend la vision de l'église",
      "Comprend la vision des cellules",
      "Porte la mission avec conviction",
      "S'implique activement",
      "Transmet la vision aux autres",
    ],

    // Section 6
    s6_titre: "6. Leadership relationnel",
    s6_items: [
      "Écoute les autres",
      "Communique clairement",
      "Crée un climat de confiance",
      "Gère les désaccords avec maturité",
      "Travaille bien en équipe",
    ],

    // Section 7
    s7_titre: "7. Fidélité et discipline",
    s7_items: [
      "Fidèle dans son engagement",
      "Respecte ses responsabilités",
      "Est ponctuel et organisé",
      "Est constant sans supervision",
      "Développe une discipline personnelle",
      "Persévère dans les difficultés",
      "Est digne de confiance",
    ],

    // Section 8
    s8_titre: "8. Capacité d'apprentissage",
    s8_items: [
      "Reçoit les enseignements",
      "Accepte les conseils",
      "Applique les corrections",
      "Cherche continuellement à progresser",
    ],

    // Section 9
    s9_titre: "9. Domaine principal à développer",
    s9_items: [
      "Caractère",
      "Discipline personnelle",
      "Confiance en soi",
      "Communication",
      "Vision spirituelle",
      "Gestion des personnes",
      "Vie spirituelle",
      "Prise de décision",
      "Leadership d'équipe",
      "Gestion des émotions",
    ],

    // Section 10
    s10_titre: "10. Prochaine étape",
    s10_items: [
      "Diriger une partie de cellule",
      "Accompagner un nouveau membre",
      "Former quelqu'un",
      "Prendre une responsabilité",
      "Animer une réunion de cellule",
      "Préparer un partage biblique",
      "Accompagner un autre leader en formation",
      "Se préparer à ouvrir une nouvelle cellule",
    ],
    objectif: "Objectif",
    dateProchainSuivi: "Date du prochain suivi",

    autres: "Autres",

    // Parcours
    parcoursTitre: "🌱 Parcours de développement du leader",
    parcours: [
      { key: "potentiel", emoji: "🌱", label: "Potentiel identifié", desc: "La personne montre un potentiel de leadership." },
      { key: "croissance", emoji: "🌿", label: "Leader en croissance", desc: "La personne progresse dans son caractère, service et influence." },
      { key: "developpement", emoji: "🌳", label: "Leader en développement", desc: "La personne commence à accompagner des personnes et prendre des responsabilités." },
      { key: "mature", emoji: "🌲", label: "Leader mature", desc: "La personne peut conduire, former et multiplier d'autres leaders." },
    ],
    choisirEtape: "Choisis une étape pour la mettre à jour",

    // Historique
    aucuneEval: "Aucune évaluation pour le moment",
    modifier: "✏️ Modifier",
    enCours: "✏️ En cours...",
    voirMoins: "▲ Voir moins",
    voirDetails: "▼ Voir le détail de l'évaluation",

    // Footer
    fermer: "Fermer",
    ajouterEval: "Ajouter l'évaluation",
    enregistrer: "💾 Enregistrer les modifications",
    ajoutEnCours: "Ajout...",
    miseAJour: "Mise à jour...",

    // Alerts
    alerteChamps: "La date est obligatoire",
    alerteSession: "Session introuvable. Veuillez vous déconnecter et vous reconnecter.",
    erreur: "Erreur : ",
  },

  en: {
    titre: "Leader Evaluation",
    nouvelleEval: "New evaluation",
    modifierEval: "Edit evaluation",
    historique: "📅 Evaluation history",
    nouvelleEvalSection: "📋 New evaluation",
    modifierEvalSection: "📋 Edit evaluation",
    modificationDu: "✏️ Editing evaluation from",
    annuler: "Cancel",
    succesAjout: "✅ Evaluation added successfully",
    succesMaj: "✅ Evaluation updated successfully", 
    date: "Date",

    s1_titre: "1. Leader's personal foundation",
    s1_niveau: "Level",
    niveau_dev: "Developing",
    niveau_bon: "Good level",
    niveau_tresBon: "Very good level",
    observation: "Observation",

    s2_titre: "2. Responsibility and maturity",
    s2_items: [
      "Takes responsibility",
      "Honors commitments",
      "Accepts correction",
      "Takes initiative",
      "Looks for solutions when facing difficulties",
      "Often makes excuses when facing difficulties",
      "Acknowledges mistakes",
      "Shows stability",
    ],

    s3_titre: "3. Servant's heart",
    s3_items: [
      "Serves with humility",
      "Helps others without seeking recognition",
      "Is available to help",
      "Carries others' needs",
      "Shows a spirit of sacrifice",
    ],

    s4_titre: "4. Ability to build up others",
    s4_items: [
      "Encourages others to follow God",
      "Provides spiritual accompaniment",
      "Encourages discouraged people",
      "Helps newcomers grow",
      "Positively influences those around them",
    ],

    s5_titre: "5. Vision and commitment",
    s5_items: [
      "Understands the church's vision",
      "Understands the cell groups' vision",
      "Carries the mission with conviction",
      "Actively gets involved",
      "Passes the vision on to others",
    ],

    s6_titre: "6. Relational leadership",
    s6_items: [
      "Listens to others",
      "Communicates clearly",
      "Creates an atmosphere of trust",
      "Handles disagreements maturely",
      "Works well in a team",
    ],

    s7_titre: "7. Faithfulness and discipline",
    s7_items: [
      "Faithful in commitment",
      "Honors responsibilities",
      "Punctual and organized",
      "Consistent without supervision",
      "Develops personal discipline",
      "Perseveres through difficulties",
      "Trustworthy",
    ],

    s8_titre: "8. Ability to learn",
    s8_items: [
      "Receives teaching well",
      "Accepts advice",
      "Applies corrections",
      "Continually seeks to grow",
    ],

    s9_titre: "9. Main area to develop",
    s9_items: [
      "Character",
      "Personal discipline",
      "Self-confidence",
      "Communication",
      "Spiritual vision",
      "People management",
      "Spiritual life",
      "Decision-making",
      "Team leadership",
      "Emotional management",
    ],

    s10_titre: "10. Next step",
    s10_items: [
      "Lead part of a cell group",
      "Mentor a new member",
      "Train someone",
      "Take on a responsibility",
      "Lead a cell group meeting",
      "Prepare a Bible teaching",
      "Mentor another leader in training",
      "Prepare to open a new cell group",
    ],
    objectif: "Goal",
    dateProchainSuivi: "Next follow-up date",

    autres: "Other",

    parcoursTitre: "🌱 Leader's development path",
    parcours: [
      { key: "potentiel", emoji: "🌱", label: "Potential identified", desc: "This person shows leadership potential." },
      { key: "croissance", emoji: "🌿", label: "Growing leader", desc: "This person is growing in character, service and influence." },
      { key: "developpement", emoji: "🌳", label: "Developing leader", desc: "This person is beginning to mentor others and take on responsibilities." },
      { key: "mature", emoji: "🌲", label: "Mature leader", desc: "This person can lead, train, and multiply other leaders." },
    ],
    choisirEtape: "Choose a stage to update it",

    aucuneEval: "No evaluations yet",
    modifier: "✏️ Edit",
    enCours: "✏️ Editing...",
    voirMoins: "▲ Show less",
    voirDetails: "▼ View evaluation details",

    fermer: "Close",
    ajouterEval: "Add evaluation",
    enregistrer: "💾 Save changes",
    ajoutEnCours: "Adding...",
    miseAJour: "Updating...",

    alerteChamps: "Date is required",
    alerteSession: "Session not found. Please log out and log back in.",
    erreur: "Error: ",
  },
};

/* ============================================================
   CONFIG DES SECTIONS À CHECKBOXES
   key           -> nom de colonne (array) en base
   autresKey     -> nom de colonne texte libre ("Autres" ou "Observation")
   autresLabel   -> "autres" | "observation"
   exclusivePairs-> paires d'index mutuellement exclusives dans items
   ============================================================ */
const SECTION_CONFIG = [
  { key: "responsabilite", itemsKey: "s2_items", titleKey: "s2_titre", autresKey: "responsabilite_autres", autresLabel: "autres", exclusivePairs: [[4, 5]] },
  { key: "coeur_serviteur", itemsKey: "s3_items", titleKey: "s3_titre", autresKey: "coeur_serviteur_autres", autresLabel: "autres" },
  { key: "capacite_construire", itemsKey: "s4_items", titleKey: "s4_titre", autresKey: "capacite_construire_autres", autresLabel: "autres" },
  { key: "vision_engagement", itemsKey: "s5_items", titleKey: "s5_titre", autresKey: "vision_engagement_autres", autresLabel: "autres" },
  { key: "leadership_relationnel", itemsKey: "s6_items", titleKey: "s6_titre", autresKey: "leadership_relationnel_observation", autresLabel: "observation" },
  { key: "fidelite_discipline", itemsKey: "s7_items", titleKey: "s7_titre", autresKey: "fidelite_discipline_autres", autresLabel: "autres" },
  { key: "capacite_apprentissage", itemsKey: "s8_items", titleKey: "s8_titre", autresKey: "capacite_apprentissage_observation", autresLabel: "observation" },
  { key: "domaine_developper", itemsKey: "s9_items", titleKey: "s9_titre", autresKey: "domaine_developper_autres", autresLabel: "autres" },
];

const EMPTY_FORM = {
  date_action: "",
  construction_niveau: "",
  construction_observation: "",
  responsabilite: [],
  responsabilite_autres: "",
  coeur_serviteur: [],
  coeur_serviteur_autres: "",
  capacite_construire: [],
  capacite_construire_autres: "",
  vision_engagement: [],
  vision_engagement_autres: "",
  leadership_relationnel: [],
  leadership_relationnel_observation: "",
  fidelite_discipline: [],
  fidelite_discipline_autres: "",
  capacite_apprentissage: [],
  capacite_apprentissage_observation: "",
  domaine_developper: [],
  domaine_developper_autres: "",
  prochaine_etape: [],
  prochaine_etape_objectif: "",
  prochaine_etape_date: "",
  parcours_etape: "",
};

function parseArr(val) {
  if (!val) return [];
  try {
    const parsed = typeof val === "string" ? JSON.parse(val) : val;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/* ============================================================
   COMPOSANT PRINCIPAL
   ============================================================ */
export default function EvaluationLeaderPopup({ member, onClose, user, onSaved }) {
  const { lang } = useLang();
  const t = translations[lang];

  const [loading, setLoading] = useState(false);
  const [evaluations, setEvaluations] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentUserName, setCurrentUserName] = useState("");
  const [editingEval, setEditingEval] = useState(null);
  const [expandedEvals, setExpandedEvals] = useState({});
  const [form, setForm] = useState(EMPTY_FORM);
  const currentStageKey = evaluations[0]?.parcours_etape || form.parcours_etape;
  const currentStageEmoji = t.parcours.find((s) => s.key === currentStageKey)?.emoji || "🌱";
  const [successMsg, setSuccessMsg] = useState("");

  const formTopRef = useRef(null);
  const modalRef = useRef(null);

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
        }
      } catch (e) {}
    };
    resolveUser();
  }, [user]);

  useEffect(() => { fetchEvaluations(); }, []);

   useEffect(() => {
  if (!editingEval && evaluations.length > 0) {
    setForm((p) => ({ ...p, parcours_etape: evaluations[0].parcours_etape || "" }));
  }
}, [evaluations]);

  const fetchEvaluations = async () => {
    const { data } = await supabase
      .from("evaluations_leader")
      .select("*, profiles:created_by(prenom, nom)")
      .eq("membre_id", member.id)
      .order("date_action", { ascending: false });
    setEvaluations(data || []);
  };

  const handleEditEval = (e) => {
    setEditingEval(e);
    setForm({
      date_action: e.date_action || "",
      construction_niveau: e.construction_niveau || "",
      construction_observation: e.construction_observation || "",
      responsabilite: parseArr(e.responsabilite),
      responsabilite_autres: e.responsabilite_autres || "",
      coeur_serviteur: parseArr(e.coeur_serviteur),
      coeur_serviteur_autres: e.coeur_serviteur_autres || "",
      capacite_construire: parseArr(e.capacite_construire),
      capacite_construire_autres: e.capacite_construire_autres || "",
      vision_engagement: parseArr(e.vision_engagement),
      vision_engagement_autres: e.vision_engagement_autres || "",
      leadership_relationnel: parseArr(e.leadership_relationnel),
      leadership_relationnel_observation: e.leadership_relationnel_observation || "",
      fidelite_discipline: parseArr(e.fidelite_discipline),
      fidelite_discipline_autres: e.fidelite_discipline_autres || "",
      capacite_apprentissage: parseArr(e.capacite_apprentissage),
      capacite_apprentissage_observation: e.capacite_apprentissage_observation || "",
      domaine_developper: parseArr(e.domaine_developper),
      domaine_developper_autres: e.domaine_developper_autres || "",
      prochaine_etape: parseArr(e.prochaine_etape),
      prochaine_etape_objectif: e.prochaine_etape_objectif || "",
      prochaine_etape_date: e.prochaine_etape_date || "",
      parcours_etape: e.parcours_etape || "",
    });
    setTimeout(() => formTopRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  const handleCancelEdit = () => {
    setEditingEval(null);
    setForm(EMPTY_FORM);
  };

  const handleSubmit = async () => {
    if (!form.date_action) { alert(t.alerteChamps); return; }
    if (!currentUserId) { alert(t.alerteSession); return; }
    setLoading(true);

    const payload = {
      date_action: form.date_action,
      construction_niveau: form.construction_niveau || null,
      construction_observation: form.construction_observation || null,
      responsabilite: form.responsabilite.length ? JSON.stringify(form.responsabilite) : null,
      responsabilite_autres: form.responsabilite_autres || null,
      coeur_serviteur: form.coeur_serviteur.length ? JSON.stringify(form.coeur_serviteur) : null,
      coeur_serviteur_autres: form.coeur_serviteur_autres || null,
      capacite_construire: form.capacite_construire.length ? JSON.stringify(form.capacite_construire) : null,
      capacite_construire_autres: form.capacite_construire_autres || null,
      vision_engagement: form.vision_engagement.length ? JSON.stringify(form.vision_engagement) : null,
      vision_engagement_autres: form.vision_engagement_autres || null,
      leadership_relationnel: form.leadership_relationnel.length ? JSON.stringify(form.leadership_relationnel) : null,
      leadership_relationnel_observation: form.leadership_relationnel_observation || null,
      fidelite_discipline: form.fidelite_discipline.length ? JSON.stringify(form.fidelite_discipline) : null,
      fidelite_discipline_autres: form.fidelite_discipline_autres || null,
      capacite_apprentissage: form.capacite_apprentissage.length ? JSON.stringify(form.capacite_apprentissage) : null,
      capacite_apprentissage_observation: form.capacite_apprentissage_observation || null,
      domaine_developper: form.domaine_developper.length ? JSON.stringify(form.domaine_developper) : null,
      domaine_developper_autres: form.domaine_developper_autres || null,
      prochaine_etape: form.prochaine_etape.length ? JSON.stringify(form.prochaine_etape) : null,
      prochaine_etape_objectif: form.prochaine_etape_objectif || null,
      prochaine_etape_date: form.prochaine_etape_date || null,
      parcours_etape: form.parcours_etape || null,
    };

    if (editingEval) {
      const { error } = await supabase.from("evaluations_leader").update(payload).eq("id", editingEval.id);
      if (error) { setLoading(false); alert(t.erreur + error.message); return; }
      setEvaluations((prev) => prev.map((e) => e.id === editingEval.id ? { ...e, ...payload } : e));
    } else {
      const { error } = await supabase.from("evaluations_leader").insert({ ...payload, membre_id: member.id, created_by: currentUserId });
      if (error) { setLoading(false); alert(t.erreur + error.message); return; }
      await fetchEvaluations();
    }

    if (typeof onSaved === "function") {
      onSaved(member.id, form.parcours_etape);
    }

    const wasEditing = !!editingEval;

    setEditingEval(null);
    setLoading(false);
    setForm(EMPTY_FORM);

    setSuccessMsg(wasEditing ? t.succesMaj : t.succesAjout);
    setTimeout(() => setSuccessMsg(""), 4000);
    setTimeout(() => formTopRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
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

  const toggleExpand = (id) => setExpandedEvals((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: "rgba(30,35,90,0.35)", backdropFilter: "blur(6px)" }}>
      <div ref={modalRef} className="relative w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden" style={{ background: "#ffffff", border: "1px solid #e2e8f0" }}>

        {/* HEADER */}
        <div ref={formTopRef} className="px-6 pt-6 pb-4 relative" style={{ background: "linear-gradient(135deg, #2E3192 0%, #4f54c9 100%)" }}>
          <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-white font-bold text-sm" style={{ background: "rgba(255,255,255,0.2)" }}>✕</button>
          <h2 className="text-xl font-bold text-white pr-10">{currentStageEmoji} {member.prenom} {member.nom}</h2>
          <p className="text-blue-100 text-sm mt-1 opacity-80">{t.titre}</p>
        </div>

        {/* BODY */}
        <div className="overflow-y-auto px-6 py-5 flex flex-col gap-5" style={{ maxHeight: "68vh" }}>

           {successMsg && (
             <div
               className="rounded-xl px-4 py-2 text-sm font-semibold text-center"
               style={{ background: "#dcfce7", color: "#15803d", border: "1px solid #86efac" }}
             >
               {successMsg}
             </div>
           )}

         {/* PARCOURS DE DEVELOPPEMENT - tout en haut */}   
           <SectionTitle>{t.parcoursTitre}</SectionTitle>
           <ParcoursWidget
             stages={t.parcours}
             selected={form.parcours_etape}
             onSelect={(key) => setForm((p) => ({ ...p, parcours_etape: key }))}
             hint={t.choisirEtape}
           />

          {editingEval && (
            <div className="flex items-center justify-between bg-orange-50 border border-orange-300 rounded-xl px-4 py-2">
              <p className="text-orange-700 text-sm font-semibold">{t.modificationDu} {formatDate(editingEval.date_action)}</p>
              <button onClick={handleCancelEdit} className="text-xs text-gray-500 underline hover:text-gray-700">{t.annuler}</button>
            </div>
          )}

          <SectionTitle>{editingEval ? t.modifierEvalSection : t.nouvelleEvalSection}</SectionTitle>

          <Field label={t.date}>
            <input type="date" value={formatDateForInput(form.date_action)} onChange={(e) => setForm((p) => ({ ...p, date_action: e.target.value }))} className="inp" />
          </Field>

          {/* SECTION 1 */}
          <SectionBlock title={t.s1_titre}>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#64748b" }}>{t.s1_niveau}</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: t.niveau_dev, label: t.niveau_dev },
                  { value: t.niveau_bon, label: t.niveau_bon },
                  { value: t.niveau_tresBon, label: t.niveau_tresBon },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, construction_niveau: opt.value }))}
                    className={`text-xs px-3 py-1.5 rounded-full border font-semibold transition-colors ${form.construction_niveau === opt.value ? "text-white" : "bg-white border-gray-300 text-gray-600"}`}
                    style={form.construction_niveau === opt.value ? { background: "#2E3192", borderColor: "#2E3192" } : {}}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <TextArea label={t.observation} value={form.construction_observation} onChange={(v) => setForm((p) => ({ ...p, construction_observation: v }))} />
          </SectionBlock>

          {/* SECTIONS 2 A 9 (checkboxes generiques) */}
          {SECTION_CONFIG.map((cfg) => (
            <SectionBlock key={cfg.key} title={t[cfg.titleKey]}>
              <CheckboxGroup
                items={t[cfg.itemsKey]}
                selected={form[cfg.key]}
                exclusivePairs={cfg.exclusivePairs}
                onToggle={(item) => {
                  setForm((prev) => {
                    const current = prev[cfg.key];
                    const isChecked = current.includes(item);
                    let next = isChecked ? current.filter((i) => i !== item) : [...current, item];

                    if (!isChecked && cfg.exclusivePairs) {
                      cfg.exclusivePairs.forEach(([aIdx, bIdx]) => {
                        const itemsList = t[cfg.itemsKey];
                        const a = itemsList[aIdx];
                        const b = itemsList[bIdx];
                        if (item === a) next = next.filter((i) => i !== b);
                        if (item === b) next = next.filter((i) => i !== a);
                      });
                    }
                    return { ...prev, [cfg.key]: next };
                  });
                }}
              />
              <TextArea
                label={cfg.autresLabel === "autres" ? t.autres : t.observation}
                value={form[cfg.autresKey]}
                onChange={(v) => setForm((p) => ({ ...p, [cfg.autresKey]: v }))}
              />
            </SectionBlock>
          ))}

          {/* SECTION 10 */}
          <SectionBlock title={t.s10_titre}>
            <CheckboxGroup
              items={t.s10_items}
              selected={form.prochaine_etape}
              onToggle={(item) => {
                setForm((prev) => {
                  const isChecked = prev.prochaine_etape.includes(item);
                  return {
                    ...prev,
                    prochaine_etape: isChecked
                      ? prev.prochaine_etape.filter((i) => i !== item)
                      : [...prev.prochaine_etape, item],
                  };
                });
              }}
            />
            <TextArea label={t.objectif} value={form.prochaine_etape_objectif} onChange={(v) => setForm((p) => ({ ...p, prochaine_etape_objectif: v }))} rows={2} />
            <Field label={t.dateProchainSuivi}>
              <input
                type="date"
                value={formatDateForInput(form.prochaine_etape_date)}
                onChange={(e) => setForm((p) => ({ ...p, prochaine_etape_date: e.target.value }))}
                className="inp"
              />
            </Field>
          </SectionBlock>

          {currentUserName && <p className="text-center text-sm text-gray-400">👤 {currentUserName}</p>}          

          {/* HISTORIQUE */}
          <SectionTitle>{t.historique}</SectionTitle>

          {evaluations.length === 0 && <p className="text-sm text-gray-400 italic">{t.aucuneEval}</p>}

          {evaluations.map((ev) => {
            const isBeingEdited = editingEval?.id === ev.id;
            const isExpanded = expandedEvals[ev.id];
            const stageInfo = t.parcours.find((s) => s.key === ev.parcours_etape);

            return (
              <div key={ev.id} className={`rounded-xl px-4 py-3 text-sm space-y-1 border transition-colors ${isBeingEdited ? "bg-orange-50 border-orange-300" : "bg-gray-50 border-gray-200"}`}>
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-gray-800">📅 {formatDate(ev.date_action)}</p>
                  <button onClick={() => handleEditEval(ev)} className={`text-xs px-2 py-1 rounded-lg font-semibold border transition-colors ${isBeingEdited ? "bg-orange-100 border-orange-400 text-orange-700" : "bg-white border-gray-300 text-gray-600 hover:bg-orange-50 hover:border-orange-300 hover:text-orange-600"}`}>
                    {isBeingEdited ? t.enCours : t.modifier}
                  </button>
                </div>

                {stageInfo && (
                  <p className="text-gray-700">
                    {stageInfo.emoji} <span className="font-semibold" style={{ color: "#2E3192" }}>{stageInfo.label}</span>
                  </p>
                )}

                {ev.construction_niveau && (
                  <p className="text-gray-600">{t.s1_niveau} : <span className="font-semibold">{ev.construction_niveau}</span></p>
                )}

                <button
                  onClick={() => toggleExpand(ev.id)}
                  className="text-xs font-semibold mt-1 flex items-center gap-1"
                  style={{ color: "#2E3192", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                >
                  {isExpanded ? t.voirMoins : t.voirDetails}
                </button>

                {isExpanded && (
                  <div className="mt-2 space-y-3 pt-2 border-t border-gray-200">
                    {ev.construction_observation && (
                      <DetailBlock label={t.observation} value={ev.construction_observation} />
                    )}
                    {SECTION_CONFIG.map((cfg) => {
                      const items = parseArr(ev[cfg.key]);
                      const autres = ev[cfg.autresKey];
                      if (items.length === 0 && !autres) return null;
                      return (
                        <div key={cfg.key}>
                          <p style={{ fontSize: 10, fontWeight: 700, color: "#2E3192", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 3 }}>
                            {t[cfg.titleKey]}
                          </p>
                          {items.map((it, i) => <p key={i} className="text-gray-700">• {it}</p>)}
                          {autres && <DetailBlock label={cfg.autresLabel === "autres" ? t.autres : t.observation} value={autres} />}
                        </div>
                      );
                    })}
                    {(parseArr(ev.prochaine_etape).length > 0 || ev.prochaine_etape_objectif || ev.prochaine_etape_date) && (
                      <div>
                        <p style={{ fontSize: 10, fontWeight: 700, color: "#2E3192", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 3 }}>
                          {t.s10_titre}
                        </p>
                        {parseArr(ev.prochaine_etape).map((it, i) => <p key={i} className="text-gray-700">• {it}</p>)}
                        {ev.prochaine_etape_objectif && <DetailBlock label={t.objectif} value={ev.prochaine_etape_objectif} />}
                        {ev.prochaine_etape_date && <p className="text-gray-600 text-xs mt-1">{t.dateProchainSuivi} : {formatDate(ev.prochaine_etape_date)}</p>}
                      </div>
                    )}
                  </div>
                )}

                <p className="text-gray-400 text-xs pt-1">👤 {ev.profiles?.prenom} {ev.profiles?.nom}</p>
              </div>
            );
          })}

        </div>

        {/* FOOTER */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row gap-3">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-gray-600 bg-white border border-gray-200 hover:bg-gray-100 transition-all">{t.fermer}</button>
          <button type="button" onClick={handleSubmit} disabled={loading} className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-white transition-all disabled:opacity-60"
            style={{ background: loading ? "#a0a0c0" : editingEval ? "linear-gradient(135deg, #f97316 0%, #ea580c 100%)" : "linear-gradient(135deg, #2E3192 0%, #4f54c9 100%)" }}>
            {loading
              ? (editingEval ? t.miseAJour : t.ajoutEnCours)
              : (editingEval ? t.enregistrer : t.ajouterEval)
            }
          </button>
        </div>

        <style jsx>{`
          .inp { width:100%; border:1px solid #e2e8f0; border-radius:10px; padding:10px 12px; background:#f8fafc; color:#1e293b; font-size:14px; outline:none; transition:border-color .2s; }
          .inp:focus { border-color:#2E3192; background:#fff; }
        `}</style>
      </div>
    </div>
  );
}

/* ============================================================
   SOUS-COMPOSANTS
   ============================================================ */

function CheckboxGroup({ items, selected, onToggle }) {
  return (
    <div className="space-y-2 mt-1">
      {items.map((item) => {
        const isChecked = selected.includes(item);
        return (
          <label key={item} className="flex items-center gap-2 text-sm cursor-pointer select-none" onClick={() => onToggle(item)}>
            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${isChecked ? "bg-orange-400 border-orange-400" : "bg-white border-gray-300"}`}>
              {isChecked && (
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <span className="text-gray-700">{item}</span>
          </label>
        );
      })}
    </div>
  );
}

function TextArea({ label, value, onChange, rows = 2 }) {
  return (
    <div className="flex flex-col gap-1 mt-2">
      <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#64748b" }}>{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="inp"
        style={{ resize: "vertical" }}
      />
    </div>
  );
}

function SectionBlock({ title, children }) {
  return (
    <div className="rounded-xl p-4 border" style={{ background: "#f8fafc", borderColor: "#e2e8f0" }}>
      <p className="text-sm font-bold mb-2" style={{ color: "#2E3192" }}>{title}</p>
      <div className="flex flex-col gap-1">{children}</div>
    </div>
  );
}

function DetailBlock({ label, value }) {
  return (
    <div className="mt-1">
      <p style={{ fontSize: 11, color: "#6b7280", fontStyle: "italic" }}>{label}</p>
      <p style={{ fontSize: 13, color: "#374151", background: "#f0f4ff", borderRadius: 6, padding: "5px 8px" }}>{value}</p>
    </div>
  );
}

      function ParcoursWidget({ stages, selected, onSelect, hint }) {      
        const activeStage = stages.find((s) => s.key === selected);
      
        return (
          <div className="rounded-2xl p-4 border" style={{ background: "linear-gradient(135deg, #f8faff 0%, #f0f4ff 100%)", borderColor: "#c7cef5" }}>
            {!activeStage && <p className="text-xs text-gray-400 italic mb-3">{hint}</p>}
      
            <div className="flex items-stretch justify-between gap-2">
              {stages.map((stage) => {
                const isActive = stage.key === selected;
                const isDimmed = !!selected && !isActive;
      
                return (
                  <button
                    key={stage.key}
                    type="button"
                    onClick={() => {                    
                      onSelect(stage.key);
                    }}
             
                    className="flex-1 flex flex-col items-center gap-1 rounded-xl px-2 py-3 transition-all active:scale-95"
                    style={{
                      background: isActive ? "#2E3192" : isDimmed ? "#f1f5f9" : "#ffffff",
                      border: `2px solid ${isActive ? "#2E3192" : "#e2e8f0"}`,
                      opacity: isDimmed ? 0.45 : 1,
                      boxShadow: isActive
                        ? "0 4px 10px rgba(46,49,146,0.35)"
                        : "0 1px 3px rgba(0,0,0,0.10)",
                    }}
                  >
                    <span className="text-2xl leading-none">{stage.emoji}</span>
                    <span
                      className="text-xs font-semibold text-center leading-tight"
                      style={{ color: isActive ? "#ffffff" : isDimmed ? "#94a3b8" : "#334155" }}
                    >
                      {stage.label}
                    </span>
                  </button>
                );
              })}
            </div>
      
            {activeStage && (
              <p className="text-xs text-gray-600 mt-3 text-center leading-relaxed">{activeStage.desc}</p>
            )}
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
