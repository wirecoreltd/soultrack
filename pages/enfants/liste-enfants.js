"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import supabase from "../../lib/supabaseClient";
import HeaderPages from "../../components/HeaderPages";
import Footer from "../../components/Footer";
import ProtectedRoute from "../../components/ProtectedRoute";
import { useLang } from "../../hooks/useLang";

// ─── COULEURS PAR TRANCHE D'ÂGE ──────────────────────────────────────────────
function getTranche(dateNaissance) {
  if (!dateNaissance) return { label: "—", color: "#e5e7eb" };
  const age = Math.floor((new Date() - new Date(dateNaissance)) / (1000 * 60 * 60 * 24 * 365.25));
 
  if (age <= 6)  return { label: "3-6 ans",   color: "#FCD34D" };
  if (age <=13) return { label: "7-12 ans",  color: "#6EE7B7" };
  return          { label: "14-15 ans", color: "#93C5FD" };
}

// ─── CALCUL DE L'ÂGE ─────────────────────────────────────────────────────────
function getAge(dateNaissance, lang) {
  if (!dateNaissance) return "—";
  const age = Math.floor((new Date() - new Date(dateNaissance)) / (1000 * 60 * 60 * 24 * 365.25));
  return lang === "en" ? `${age} years old` : `${age} ans`;
}

function formatDate(dateStr, lang) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  const months = lang === "en"
    ? ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
    : ["Janv","Févr","Mars","Avr","Mai","Juin","Juil","Août","Sept","Oct","Nov","Déc"];
  return `${d.getDate().toString().padStart(2,"0")} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

// ─── BESOINS SPÉCIAUX (cases à cocher) ───────────────────────────────────────
// Clés stables (toujours en FR) pour le stockage en base
const BESOINS_KEYS = [
  "Santé",
  "École / Études",
  "Famille",
  "Amitiés",
  "Confiance en soi",
  "Émotions / Tristesse",
  "Peur / Anxiété",
  "Comportement",
  "Harcèlement",
  "Sécurité / Protection",
  "Loisirs / Activités",
  "Difficultés d'apprentissage",
  "Handicap / Besoins spéciaux",
  "Sommeil",
  "Spiritualité / Foi",
  "Prière pour un miracle",
];

const BESOINS_LABELS = {
  fr: {
    "Santé": "Santé",
    "École / Études": "École / Études",
    "Famille": "Famille",
    "Amitiés": "Amitiés",
    "Confiance en soi": "Confiance en soi",
    "Émotions / Tristesse": "Émotions / Tristesse",
    "Peur / Anxiété": "Peur / Anxiété",
    "Comportement": "Comportement",
    "Harcèlement": "Harcèlement",
    "Sécurité / Protection": "Sécurité / Protection",
    "Loisirs / Activités": "Loisirs / Activités",
    "Difficultés d'apprentissage": "Difficultés d'apprentissage",
    "Handicap / Besoins spéciaux": "Handicap / Besoins spéciaux",
    "Sommeil": "Sommeil",
    "Spiritualité / Foi": "Spiritualité / Foi",
    "Prière pour un miracle": "Prière pour un miracle",
  },
  en: {
    "Santé": "Health",
    "École / Études": "School / Studies",
    "Famille": "Family",
    "Amitiés": "Friendships",
    "Confiance en soi": "Self-confidence",
    "Émotions / Tristesse": "Emotions / Sadness",
    "Peur / Anxiété": "Fear / Anxiety",
    "Comportement": "Behaviour",
    "Harcèlement": "Bullying",
    "Sécurité / Protection": "Safety / Protection",
    "Loisirs / Activités": "Hobbies / Activities",
    "Difficultés d'apprentissage": "Learning difficulties",
    "Handicap / Besoins spéciaux": "Disability / Special needs",
    "Sommeil": "Sleep",
    "Spiritualité / Foi": "Spirituality / Faith",
    "Prière pour un miracle": "Prayer for a miracle",
  },
};

// ─── TRADUCTIONS ──────────────────────────────────────────────────────────────
const translations = {
  fr: {
    title: "Liste des",
    titleHighlight: "Enfants",
    intro: "Consultez et gérez facilement les fiches de tous les enfants.",
    introAccent1: "Recherchez",
    introMid: ", filtrez par tranche d'âge,",
    introAccent2: "accédez aux détails complets",
    introEnd: "et mettez à jour les informations.",
    search: "🔍 Rechercher...",
    allAges: "-- Toutes les tranches --",
    addChild: "➕ Ajouter un enfant",
    loading: "Chargement...",
    noChild: "Aucun enfant trouvé",
    count: (n) => `${n} enfant${n > 1 ? "s" : ""}`,
    details: "Détails",
    closeDetails: "Fermer",
    dob: "📅 Né(e) le",
    age: "⏳ Âge",
    allergies: "⚠️ Allergies",
    sante: "🏥 Santé",
    comportement: "💬 Comportement",
    besoins: "✨ Besoins spéciaux",
    parent1: "👨 Parent 1",
    parent2: "👩 Parent 2",
    tel: "📞",
    edit: "✏️ Modifier",
    delete: "🗑️ Supprimer",
    confirmDelete: "Voulez-vous vraiment supprimer cet enfant ?",
    none: "—",
    call: "📞 Appeler",
    sms: "✉️ SMS",
    whatsapp: "💬 WhatsApp",
    // Popup ajout/édition
    popupTitleAdd: "Ajouter un enfant",
    popupTitleEdit: "Modifier l'enfant",
    prenom: "Prénom",
    nom: "Nom",
    dateNaissance: "Date de naissance",
    allergiesLabel: "Allergies",
    santeLabel: "Notes de santé",
    comportementLabel: "Notes comportementales",
    besoinsLabel: "Besoins spéciaux",
    parent1NomLabel: "Nom parent 1",
    parent1TelLabel: "Tél parent 1",
    parent2NomLabel: "Nom parent 2",
    parent2TelLabel: "Tél parent 2",
    searchParent: "Rechercher un membre comme parent...",
    cancel: "Annuler",
    save: "💾 Sauvegarder",
    saving: "Enregistrement...",
    errPrenom: "❌ Le prénom est obligatoire.",
    errNom: "❌ Le nom est obligatoire.",
    errSave: "❌ Erreur lors de l'enregistrement.",
    succes: "✅ Enregistré !",
  },
  en: {
    title: "Children",
    titleHighlight: "List",
    intro: "Easily view and manage all children's profiles.",
    introAccent1: "Search",
    introMid: ", filter by age group,",
    introAccent2: "access full details",
    introEnd: "and update information.",
    search: "🔍 Search...",
    allAges: "-- All age groups --",
    addChild: "➕ Add a child",
    loading: "Loading...",
    noChild: "No child found",
    count: (n) => `${n} child${n > 1 ? "ren" : ""}`,
    details: "Details",
    closeDetails: "Close",
    dob: "📅 Born on",
    age: "⏳ Age",
    allergies: "⚠️ Allergies",
    sante: "🏥 Health",
    comportement: "💬 Behaviour",
    besoins: "✨ Special needs",
    parent1: "👨 Parent 1",
    parent2: "👩 Parent 2",
    tel: "📞",
    edit: "✏️ Edit",
    delete: "🗑️ Delete",
    confirmDelete: "Do you really want to delete this child?",
    none: "—",
    call: "📞 Call",
    sms: "✉️ SMS",
    whatsapp: "💬 WhatsApp",
    popupTitleAdd: "Add a child",
    popupTitleEdit: "Edit child",
    prenom: "First name",
    nom: "Last name",
    dateNaissance: "Date of birth",
    allergiesLabel: "Allergies",
    santeLabel: "Health notes",
    comportementLabel: "Behavioural notes",
    besoinsLabel: "Special needs",
    parent1NomLabel: "Parent 1 name",
    parent1TelLabel: "Parent 1 phone",
    parent2NomLabel: "Parent 2 name",
    parent2TelLabel: "Parent 2 phone",
    searchParent: "Search a member as parent...",
    cancel: "Cancel",
    save: "💾 Save",
    saving: "Saving...",
    errPrenom: "❌ First name is required.",
    errNom: "❌ Last name is required.",
    errSave: "❌ An error occurred while saving.",
    succes: "✅ Saved!",
  },
};

// ─── POPUP AJOUT / ÉDITION ────────────────────────────────────────────────────
function EnfantPopup({ enfant, egliseId, onClose, onSaved, t, lang }) {
  const isEdit = !!enfant;

  // Parse besoins_speciaux from JSON string or array
  const parseBesoins = (val) => {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    try { return JSON.parse(val); } catch { return []; }
  };

  const [form, setForm] = useState({
    prenom: enfant?.prenom || "",
    nom: enfant?.nom || "",
    date_naissance: enfant?.date_naissance || "",
    allergies: enfant?.allergies || "",
    sante_notes: enfant?.sante_notes || "",
    comportement_notes: enfant?.comportement_notes || "",
    besoins_speciaux: parseBesoins(enfant?.besoins_speciaux),
    parent1_nom: enfant?.parent1_nom || "",
    parent1_telephone: enfant?.parent1_telephone || "",
    parent2_nom: enfant?.parent2_nom || "",
    parent2_telephone: enfant?.parent2_telephone || "",
    parent1_membre_id: enfant?.parent1_membre_id || null,
    parent2_membre_id: enfant?.parent2_membre_id || null,
  });

  const [search1, setSearch1] = useState("");
  const [search2, setSearch2] = useState("");
  const [membres, setMembres] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchMembres = async () => {
      const { data } = await supabase
        .from("membres_complets")
        .select("id, prenom, nom, telephone")
        .eq("eglise_id", egliseId)
        .order("nom");
      setMembres(data || []);
    };
    fetchMembres();
  }, [egliseId]);

  const filtered1 = membres.filter(m =>
    `${m.prenom} ${m.nom}`.toLowerCase().includes(search1.toLowerCase())
  );
  const filtered2 = membres.filter(m =>
    `${m.prenom} ${m.nom}`.toLowerCase().includes(search2.toLowerCase())
  );

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const toggleBesoin = (option) => {
    setForm(prev => {
      const current = prev.besoins_speciaux;
      const updated = current.includes(option)
        ? current.filter(b => b !== option)
        : [...current, option];
      return { ...prev, besoins_speciaux: updated };
    });
  };

  const handleSubmit = async () => {
    if (!form.prenom.trim()) return setMessage(t.errPrenom);
    if (!form.nom.trim()) return setMessage(t.errNom);
    setLoading(true);
    try {
      // Store besoins_speciaux as JSON string
      const payload = {
        ...form,
        besoins_speciaux: JSON.stringify(form.besoins_speciaux),
        eglise_id: egliseId,
      };
      let error;
      if (isEdit) {
        ({ error } = await supabase.from("enfants").update(payload).eq("id", enfant.id));
      } else {
        ({ error } = await supabase.from("enfants").insert(payload));
      }
      if (error) throw error;
      setMessage(t.succes);
      setTimeout(() => { onSaved(); onClose(); }, 1000);
    } catch {
      setMessage(t.errSave);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ background: "rgba(30,35,90,0.4)", backdropFilter: "blur(6px)" }}>
      <div className="relative w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden bg-white">

        {/* Header */}
        <div className="px-6 pt-6 pb-4"
          style={{ background: "linear-gradient(135deg, #2E3192 0%, #4f54c9 100%)" }}>
          <button onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-white font-bold text-sm"
            style={{ background: "rgba(255,255,255,0.2)" }}>✕</button>
          <h2 className="text-xl font-bold text-white pr-10">
            {isEdit ? `✏️ ${enfant.prenom} ${enfant.nom}` : `➕ ${t.popupTitleAdd}`}
          </h2>
          <p className="text-blue-100 text-sm mt-1 opacity-80">
            {isEdit ? t.popupTitleEdit : t.popupTitleAdd}
          </p>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-6 py-5 flex flex-col gap-4" style={{ maxHeight: "68vh" }}>

          {/* Identité */}
          {[
            { name: "prenom", label: t.prenom },
            { name: "nom", label: t.nom },
          ].map(({ name, label }) => (
            <div key={name} className="flex flex-col gap-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</label>
              <input name={name} value={form[name]} onChange={handleChange} className="inp" />
            </div>
          ))}

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">{t.dateNaissance}</label>
            <input type="date" name="date_naissance" value={form.date_naissance} onChange={handleChange} className="inp" />
          </div>

          {/* Santé */}
          {[
            { name: "allergies", label: t.allergiesLabel },
            { name: "sante_notes", label: t.santeLabel },
            { name: "comportement_notes", label: t.comportementLabel },
          ].map(({ name, label }) => (
            <div key={name} className="flex flex-col gap-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</label>
              <textarea name={name} value={form[name]} onChange={handleChange} className="inp" rows={2} />
            </div>
          ))}

          {/* Besoins spéciaux — cases à cocher */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">{t.besoinsLabel}</label>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              {BESOINS_KEYS.map(key => (
                <label key={key} className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 select-none">
                  <input
                    type="checkbox"
                    checked={form.besoins_speciaux.includes(key)}
                    onChange={() => toggleBesoin(key)}
                    className="w-4 h-4 rounded accent-[#2E3192] cursor-pointer"
                  />
                  {BESOINS_LABELS[lang][key]}
                </label>
              ))}
            </div>
          </div>

          {/* Parent 1 */}
          <div className="flex items-center gap-2 pt-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#2E3192]">👨 Parent 1</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">{t.searchParent}</label>
            <input type="text" value={search1} onChange={e => setSearch1(e.target.value)} placeholder={t.searchParent} className="inp" />
            {search1 && (
              <div className="max-h-32 overflow-y-auto rounded-xl border border-gray-200 divide-y">
                {filtered1.map(m => (
                  <div key={m.id}
                    onClick={() => {
                      setForm(prev => ({ ...prev, parent1_membre_id: m.id, parent1_nom: `${m.prenom} ${m.nom}`, parent1_telephone: m.telephone || "" }));
                      setSearch1("");
                    }}
                    className="px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 text-gray-700">
                    {m.prenom} {m.nom} {m.telephone ? `· ${m.telephone}` : ""}
                  </div>
                ))}
                {filtered1.length === 0 && <p className="text-xs text-gray-400 px-3 py-2">Aucun résultat</p>}
              </div>
            )}
          </div>

          {[
            { name: "parent1_nom", label: t.parent1NomLabel },
            { name: "parent1_telephone", label: t.parent1TelLabel },
          ].map(({ name, label }) => (
            <div key={name} className="flex flex-col gap-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</label>
              <input name={name} value={form[name]} onChange={handleChange} className="inp" />
            </div>
          ))}

          {/* Parent 2 */}
          <div className="flex items-center gap-2 pt-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#2E3192]">👩 Parent 2</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">{t.searchParent}</label>
            <input type="text" value={search2} onChange={e => setSearch2(e.target.value)} placeholder={t.searchParent} className="inp" />
            {search2 && (
              <div className="max-h-32 overflow-y-auto rounded-xl border border-gray-200 divide-y">
                {filtered2.map(m => (
                  <div key={m.id}
                    onClick={() => {
                      setForm(prev => ({ ...prev, parent2_membre_id: m.id, parent2_nom: `${m.prenom} ${m.nom}`, parent2_telephone: m.telephone || "" }));
                      setSearch2("");
                    }}
                    className="px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 text-gray-700">
                    {m.prenom} {m.nom} {m.telephone ? `· ${m.telephone}` : ""}
                  </div>
                ))}
                {filtered2.length === 0 && <p className="text-xs text-gray-400 px-3 py-2">Aucun résultat</p>}
              </div>
            )}
          </div>

          {[
            { name: "parent2_nom", label: t.parent2NomLabel },
            { name: "parent2_telephone", label: t.parent2TelLabel },
          ].map(({ name, label }) => (
            <div key={name} className="flex flex-col gap-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</label>
              <input name={name} value={form[name]} onChange={handleChange} className="inp" />
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row gap-3">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-gray-600 bg-white border border-gray-200 hover:bg-gray-100 transition-all">
            {t.cancel}
          </button>
          <button onClick={handleSubmit} disabled={loading}
            className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-white transition-all disabled:opacity-60"
            style={{ background: loading ? "#a0a0c0" : "linear-gradient(135deg, #2E3192 0%, #4f54c9 100%)" }}>
            {loading ? t.saving : t.save}
          </button>
        </div>

        {message && (
          <p className="text-center text-sm font-semibold px-6 pb-4"
            style={{ color: message.includes("❌") ? "#dc2626" : "#2E3192" }}>
            {message}
          </p>
        )}

        <style jsx>{`
          .inp {
            width: 100%;
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            padding: 10px 12px;
            background: #f8fafc;
            color: #1e293b;
            font-size: 14px;
            outline: none;
            transition: border-color 0.2s;
          }
          .inp:focus { border-color: #2E3192; background: #fff; }
        `}</style>
      </div>
    </div>
  );
}

// ─── PAGE PRINCIPALE ──────────────────────────────────────────────────────────
export default function ListeEnfants() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur", "ResponsableEnfants"]}>
      <ListeEnfantsContent />
    </ProtectedRoute>
  );
}

function ListeEnfantsContent() {
  const { lang } = useLang();
  const t = translations[lang];

  const [enfants, setEnfants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterAge, setFilterAge] = useState("");
  const [detailsOpen, setDetailsOpen] = useState({});
  const [openPhoneId, setOpenPhoneId] = useState(null);
  const [popupEnfant, setPopupEnfant] = useState(null); // null = fermé, false = ajout, object = édition
  const [egliseId, setEgliseId] = useState(null);
  const [userRoles, setUserRoles] = useState([]);

  const isAdmin = userRoles.includes("Administrateur");

  useEffect(() => {
    const handleClick = (e) => {
      if (!e.target.closest(".phone-menu-container")) setOpenPhoneId(null);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const fetchEnfants = useCallback(async (eid) => {
    const id = eid || egliseId;
    if (!id) return;
    const { data } = await supabase
      .from("enfants")
      .select("*")
      .eq("eglise_id", id)
      .order("nom");
    setEnfants(data || []);
    setLoading(false);
  }, [egliseId]);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase
        .from("profiles")
        .select("eglise_id, roles")
        .eq("id", user.id)
        .single();
      if (!profile) return;
      setEgliseId(profile.eglise_id);
      setUserRoles(Array.isArray(profile.roles) ? profile.roles : [profile.roles]);
      await fetchEnfants(profile.eglise_id);
    };
    init();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm(t.confirmDelete)) return;
    await supabase.from("enfants").delete().eq("id", id);
    setEnfants(prev => prev.filter(e => e.id !== id));
  };

  const filteredEnfants = enfants.filter(e => {
    const tranche = getTranche(e.date_naissance).label;
    const matchAge = !filterAge || tranche === filterAge;
    const matchSearch = !search ||
      `${e.prenom} ${e.nom}`.toLowerCase().includes(search.toLowerCase());
    return matchAge && matchSearch;
  });

  // Parse besoins from stored JSON string
  const parseBesoins = (val) => {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    try { return JSON.parse(val); } catch { return []; }
  };

  const tranches = ["3-6 ans", "7-13 ans"];

  return (
    <div className="min-h-screen flex flex-col items-center p-4 sm:p-6" style={{ background: "#333699" }}>
      <HeaderPages />

      <h1 className="text-2xl font-bold mt-4 mb-2 text-center text-white">
        {t.title} <span className="text-emerald-300">{t.titleHighlight}</span>
      </h1>

      <div className="max-w-3xl w-full mb-6 text-center">
        <p className="italic text-base text-white/90">
          {t.intro}
          <span className="text-blue-300 font-semibold"> {t.introAccent1}</span>
          {t.introMid}{" "}
          <span className="text-blue-300 font-semibold">{t.introAccent2}</span>
          {t.introEnd}
        </p>
      </div>

      {/* Filtres */}
      <div className="w-full max-w-4xl flex flex-wrap gap-3 justify-center mb-4">
        <input
          type="text"
          placeholder={t.search}
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="px-3 py-1.5 rounded-md border text-black text-sm w-full sm:w-64"
        />
        <select
          value={filterAge}
          onChange={e => setFilterAge(e.target.value)}
          className="px-3 py-1.5 rounded-md border text-black text-sm"
        >
          <option value="">{t.allAges}</option>
          {tranches.map(tr => <option key={tr} value={tr}>{tr}</option>)}
        </select>
        <span className="text-white text-sm self-center">{t.count(filteredEnfants.length)}</span>
      </div>

      {/* Bouton ajouter */}
      {isAdmin && (
        <div className="w-full max-w-6xl flex justify-end mb-4">
          <button
            onClick={() => setPopupEnfant(false)}
            className="text-white font-semibold px-4 py-2 rounded shadow text-sm bg-white/10 hover:bg-white/20 transition"
          >
            {t.addChild}
          </button>
        </div>
      )}

      {/* Grille */}
      {loading ? (
        <p className="text-white text-center">{t.loading}</p>
      ) : filteredEnfants.length === 0 ? (
        <p className="text-white text-center">{t.noChild}</p>
      ) : (
        <div className="w-full max-w-6xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredEnfants.map(enfant => {
            const tranche = getTranche(enfant.date_naissance);
            const isOpen = detailsOpen[enfant.id];
            const besoins = parseBesoins(enfant.besoins_speciaux);

            return (
              <div
                key={enfant.id}
                className="bg-white rounded-2xl shadow-lg border-l-4 p-4 transition-all hover:shadow-2xl"
                style={{ borderLeftColor: tranche.color }}
              >
                {/* Badge tranche */}
                <div className="flex justify-between items-start mb-2">
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ background: tranche.color, color: "#1e293b" }}
                  >
                    {tranche.label}
                  </span>
                </div>

                {/* Nom */}
                <h2 className="font-bold text-black text-base text-center mb-1">
                  {enfant.prenom} {enfant.nom}
                </h2>

                {/* 1. Âge à la place de 📅 Born... */}
                <p className="text-center text-sm text-gray-500 mb-2">
                  ⏳ {getAge(enfant.date_naissance, lang)}
                </p>

                {/* Bouton détails */}
                <button
                  onClick={() => setDetailsOpen(prev => ({ ...prev, [enfant.id]: !prev[enfant.id] }))}
                  className="text-orange-500 underline text-sm mt-3 block mx-auto"
                >
                  {isOpen ? t.closeDetails : t.details}
                </button>

                {/* Détails */}
                {isOpen && (
                  <div className="text-black text-sm mt-3 space-y-3">
                    <hr />
                    <div>
                      <p className="font-bold text-[#2E3192] mb-1">👶 Infos</p>
                      {enfant.allergies && <p>{t.allergies} : {enfant.allergies}</p>}
                      {enfant.sante_notes && <p>{t.sante} : {enfant.sante_notes}</p>}
                      {enfant.comportement_notes && <p>{t.comportement} : {enfant.comportement_notes}</p>}
                      {besoins.length > 0 && (
                        <div className="mt-1">
                          <p className="font-semibold text-gray-700 mb-1">{t.besoins} :</p>
                          <div className="flex flex-wrap gap-1">
                            {besoins.map(b => (
                              <span key={b} className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-medium">
                                {BESOINS_LABELS[lang]?.[b] ?? b}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <hr />
                    {/* 3. Parent 1 : nom sur une ligne, téléphone sur une autre */}
                    <div>
                      <p className="font-bold text-[#2E3192] mb-1">👨‍👩‍👦 Parents</p>
                      {enfant.parent1_nom && (
                        <div className="mb-1">
                          <p>{t.parent1} : {enfant.parent1_nom}</p>
                          {enfant.parent1_telephone && (
                            <p className="pl-6 text-gray-600">📞 {enfant.parent1_telephone}</p>
                          )}
                        </div>
                      )}
                      {enfant.parent2_nom && (
                        <div>
                          <p>{t.parent2} : {enfant.parent2_nom}</p>
                          {enfant.parent2_telephone && (
                            <p className="pl-6 text-gray-600">📞 {enfant.parent2_telephone}</p>
                          )}
                        </div>
                      )}
                    </div>

                    {isAdmin && (
                      <div className="flex flex-col gap-2 mt-3">
                        <button
                          onClick={() => setPopupEnfant(enfant)}
                          className="w-full py-1.5 rounded-lg text-sm font-semibold text-orange-500 border border-orange-200 hover:bg-orange-50 transition"
                        >
                          {t.edit}
                        </button>
                        <button
                          onClick={() => handleDelete(enfant.id)}
                          className="w-full py-1.5 rounded-lg text-xs font-semibold text-red-500 hover:bg-red-50 transition"
                        >
                          {t.delete}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Popup */}
      {popupEnfant !== null && (
        <EnfantPopup
          enfant={popupEnfant || null}
          egliseId={egliseId}
          onClose={() => setPopupEnfant(null)}
          onSaved={() => fetchEnfants()}
          t={t}
          lang={lang}
        />
      )}

      <Footer />
    </div>
  );
}
