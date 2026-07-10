"use client";

import { useEffect, useState, useRef } from "react";
import supabase from "../../lib/supabaseClient";
import HeaderPages from "../../components/HeaderPages";
import Footer from "../../components/Footer";
import ProtectedRoute from "../../components/ProtectedRoute";
import { useLang } from "../../hooks/useLang";

// ─── TRADUCTIONS ───────────────────────────────────────────────
const translations = {
  fr: {
    pageTitle: "Rapport de",
    pageTitleAccent: "Formations",
    pageSubtitleCreez: "Créez et pilotez",
    pageSubtitleText1: "les rapports de formation.",
    pageSubtitleCentralisez: "Centralisez",
    pageSubtitleText2: "les données, suivez la participation hommes / femmes et analysez l'impact des formations pour accompagner la",
    pageSubtitleCroissance: "croissance spirituelle et le développement des membres",

    perioderapide: "Période rapide",
    tranchedates: "Tranche de dates",
    periode: "Période :",
    j7: "7 j",
    j30: "30 j",
    j90: "90 j",
    mois6: "6 mois",
    an1: "1 an",
    dateDebut: "Date de début",
    dateFin: "Date de fin",
    genererRapport: "Générer le rapport",

    vueEnsemble: "Vue d'ensemble",
    parFormation: "Par formation",
    saisie: "Saisie",

    aucuneFormation: "Aucune formation sur cette période",
    ajouterFormation: "➕ Ajouter une formation",

    sectionVueEnsemble: "Vue d'ensemble",
    sectionGenre: "Répartition H / F",
    sectionTendance: "Tendance mensuelle (participants)",
    sectionParFormation: "Participation par formation",

    kpiFormations: "Formations",
    kpiSub: "sur la période",
    kpiTotalParticipants: "Total participants",
    kpiHplusF: "H + F",
    kpiMoyFormation: "Moy. par formation",
    kpiParticipants: "participants",
    kpiDureeMoy: "Durée moyenne",
    kpiParFormation: "par formation",
    kpiHommes: "Hommes",
    kpiFemmes: "Femmes",
    kpiTotal2: "total",

    hommes: "Hommes",
    femmes: "Femmes",
    totalParticipants: "participants au total",

    tendanceVs: "vs mois préc.",
    tendanceFormation: "formation",
    tendanceFormations: "formations",
    tendanceInsuffisant: "Données insuffisantes (≥ 2 mois)",

    aucuneDonnee: "Aucune donnée",
    sess: "sess.",
    sansNom: "Sans nom",

    formation: "Formation",
    modifier: "✏️ Modifier",
    supprimer: "🗑️ Supprimer",
    confirmSupprimer: "Supprimer cette formation ?",
    labelHommes: "Hommes",
    labelFemmes: "Femmes",
    labelTotal: "Total",
    labelDuree: "Durée",

    modifierFormation: "✏️ Modifier la formation",
    nouvelleFormation: "➕ Nouvelle formation",
    annuler: "Annuler",
    labelDateDebut: "Date de début",
    labelDateFin: "Date de fin",
    nomFormation: "Nom de la formation",
    nomFormationPlaceholder: "Ex: Formation des leaders",
    labelHommesForm: "Hommes",
    labelFemmesForm: "Femmes",
    totalParticipantsForm: "Total participants :",
    mettrAJour: "Mettre à jour",
    ajouterLaFormation: "Ajouter la formation",
    champRequis: "❌ Date de début et nom de formation requis.",
    enregistrement: "⏳ Enregistrement...",
    formationMiseAJour: "✅ Formation mise à jour !",
    formationAjoutee: "✅ Formation ajoutée !",

    ajouterModifier: "➕ Ajouter / modifier une formation",
    nouvelleFormationBtn: "➕ Nouvelle formation",
  },
  en: {
    pageTitle: "Training",
    pageTitleAccent: "Report",
    pageSubtitleCreez: "Create and manage",
    pageSubtitleText1: "training reports.",
    pageSubtitleCentralisez: "Centralize",
    pageSubtitleText2: "data, track male/female participation and analyze training impact to support",
    pageSubtitleCroissance: "spiritual growth and member development",

    perioderapide: "Quick period",
    tranchedates: "Date range",
    periode: "Period:",
    j7: "7 d",
    j30: "30 d",
    j90: "90 d",
    mois6: "6 mo",
    an1: "1 yr",
    dateDebut: "Start date",
    dateFin: "End date",
    genererRapport: "Generate report",

    vueEnsemble: "Overview",
    parFormation: "By training",
    saisie: "Add data",

    aucuneFormation: "No training for this period",
    ajouterFormation: "➕ Add training",

    sectionVueEnsemble: "Overview",
    sectionGenre: "M / F breakdown",
    sectionTendance: "Monthly trend (participants)",
    sectionParFormation: "Participation by training",

    kpiFormations: "Trainings",
    kpiSub: "for the period",
    kpiTotalParticipants: "Total participants",
    kpiHplusF: "M + F",
    kpiMoyFormation: "Avg. per training",
    kpiParticipants: "participants",
    kpiDureeMoy: "Avg. duration",
    kpiParFormation: "per training",
    kpiHommes: "Men",
    kpiFemmes: "Women",
    kpiTotal2: "total",

    hommes: "Men",
    femmes: "Women",
    totalParticipants: "total participants",

    tendanceVs: "vs prev. month",
    tendanceFormation: "training",
    tendanceFormations: "trainings",
    tendanceInsuffisant: "Insufficient data (≥ 2 months)",

    aucuneDonnee: "No data",
    sess: "sess.",
    sansNom: "Unnamed",

    formation: "Training",
    modifier: "✏️ Edit",
    supprimer: "🗑️ Delete",
    confirmSupprimer: "Delete this training?",
    labelHommes: "Men",
    labelFemmes: "Women",
    labelTotal: "Total",
    labelDuree: "Duration",

    modifierFormation: "✏️ Edit training",
    nouvelleFormation: "➕ New training",
    annuler: "Cancel",
    labelDateDebut: "Start date",
    labelDateFin: "End date",
    nomFormation: "Training name",
    nomFormationPlaceholder: "E.g.: Leaders training",
    labelHommesForm: "Men",
    labelFemmesForm: "Women",
    totalParticipantsForm: "Total participants:",
    mettrAJour: "Update",
    ajouterLaFormation: "Add training",
    champRequis: "❌ Start date and training name are required.",
    enregistrement: "⏳ Saving...",
    formationMiseAJour: "✅ Training updated!",
    formationAjoutee: "✅ Training added!",

    ajouterModifier: "➕ Add / edit training",
    nouvelleFormationBtn: "➕ New training",
  },
};

export default function RapportFormationPage() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur", "ResponsableFormation"]}>
      <RapportFormation />
    </ProtectedRoute>
  );
}

// ─── HELPERS ──────────────────────────────────────────────────
function formatDateFr(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr + "T00:00:00").toLocaleDateString("fr-FR", {
    day: "2-digit", month: "short", year: "numeric",
  });
}
function getMonthNameFR(monthIndex) {
  return ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"][monthIndex] || "";
}
function getMonthNameEN(monthIndex) {
  return ["January","February","March","April","May","June","July","August","September","October","November","December"][monthIndex] || "";
}

// ─── UI ATOMS ──────────────────────────────────────────────────
function SectionTitle({ children }) {
  return (
    <p className="text-sm font-semibold uppercase tracking-widest text-white/80 mb-3">
      {children}
    </p>
  );
}
function KpiCard({ label, value, sub, accent }) {
  const c = {
    green: "text-emerald-400", red: "text-red-400", amber: "text-amber-400",
    white: "text-white", blue: "text-blue-300", pink: "text-pink-300",
    purple: "text-purple-300", orange: "text-orange-300",
  };
  return (
    <div className="bg-white/10 rounded-2xl px-4 py-4 flex flex-col gap-1">
      <p className="text-sm text-white">{label}</p>
      <p className={`text-2xl font-bold leading-none ${c[accent] || "text-white"}`}>{value}</p>
      {sub && <p className="text-xs text-white/60 mt-0.5">{sub}</p>}
    </div>
  );
}
function Badge({ children, color }) {
  const m = {
    green: "bg-emerald-900/60 text-emerald-300",
    red: "bg-red-900/60 text-red-300",
    amber: "bg-amber-900/60 text-amber-300",
    blue: "bg-blue-900/60 text-blue-300",
    pink: "bg-pink-900/60 text-pink-300",
    purple: "bg-purple-900/60 text-purple-300",
    orange: "bg-orange-900/60 text-orange-300",
    gray: "bg-white/10 text-white/50",
  };
  return (
    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${m[color] || m.gray}`}>
      {children}
    </span>
  );
}
function BarreProgression({ pct, color }) {
  const col = color || (pct >= 70 ? "bg-emerald-400" : pct >= 40 ? "bg-amber-400" : "bg-red-400");
  return (
    <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
      <div className={`h-full rounded-full transition-all ${col}`} style={{ width: `${Math.min(pct, 100)}%` }} />
    </div>
  );
}

// ─── BLOC KPI GLOBAUX ──────────────────────────────────────────
function BlocKpiGlobaux({ rapports, t }) {
  const totalFormations = rapports.length;
  const totalHommes = rapports.reduce((a, r) => a + Number(r.hommes || 0), 0);
  const totalFemmes = rapports.reduce((a, r) => a + Number(r.femmes || 0), 0);
  const totalParticipants = totalHommes + totalFemmes;
  const moyParFormation = totalFormations > 0 ? Math.round(totalParticipants / totalFormations) : 0;

  const durees = rapports.map(r => {
    if (!r.date_debut || !r.date_fin) return 0;
    const diff = new Date(r.date_fin) - new Date(r.date_debut);
    return Math.max(0, Math.round(diff / 86400000));
  });
  const moyDuree = durees.length > 0 ? Math.round(durees.reduce((a, b) => a + b, 0) / durees.length) : 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiCard label={t.kpiFormations} value={totalFormations} sub={t.kpiSub} accent="white" />
        <KpiCard label={t.kpiTotalParticipants} value={totalParticipants} sub={t.kpiHplusF} accent="amber" />
        <KpiCard label={t.kpiMoyFormation} value={moyParFormation} sub={t.kpiParticipants} accent="blue" />
        <KpiCard label={t.kpiDureeMoy} value={`${moyDuree}j`} sub={t.kpiParFormation} accent="purple" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <KpiCard label={t.kpiHommes} value={totalHommes} sub={t.kpiTotal2} accent="blue" />
        <KpiCard label={t.kpiFemmes} value={totalFemmes} sub={t.kpiTotal2} accent="pink" />
      </div>
    </div>
  );
}

// ─── BLOC RÉPARTITION GENRE ────────────────────────────────────
function BlocGenre({ rapports, t }) {
  const totalHommes = rapports.reduce((a, r) => a + Number(r.hommes || 0), 0);
  const totalFemmes = rapports.reduce((a, r) => a + Number(r.femmes || 0), 0);
  const total = totalHommes + totalFemmes;
  const pctH = total > 0 ? Math.round((totalHommes / total) * 100) : 0;
  const pctF = total > 0 ? 100 - pctH : 0;

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-blue-900/40 rounded-xl px-3 py-3 text-center">
          <p className="text-2xl font-bold text-blue-300">{totalHommes}</p>
          <p className="text-[11px] text-blue-400/70">{t.hommes}</p>
          <p className="text-[10px] text-white/40">{pctH}%</p>
        </div>
        <div className="bg-pink-900/40 rounded-xl px-3 py-3 text-center">
          <p className="text-2xl font-bold text-pink-300">{totalFemmes}</p>
          <p className="text-[11px] text-pink-400/70">{t.femmes}</p>
          <p className="text-[10px] text-white/40">{pctF}%</p>
        </div>
      </div>
      {total > 0 && (
        <div className="flex h-2 rounded-full overflow-hidden gap-0.5">
          <div className="bg-blue-400 rounded-l-full transition-all" style={{ width: `${pctH}%` }} />
          <div className="bg-pink-400 rounded-r-full transition-all" style={{ width: `${pctF}%` }} />
        </div>
      )}
      <p className="text-[11px] text-white/60 text-center">{total} {t.totalParticipants}</p>
    </div>
  );
}

// ─── BLOC TENDANCE MENSUELLE ───────────────────────────────────
function BlocTendance({ rapports, t, lang }) {
  const parMois = {};
  rapports.forEach(r => {
    if (!r.date_debut) return;
    const d = new Date(r.date_debut + "T00:00:00");
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const monthName = lang === "en"
      ? `${getMonthNameEN(d.getMonth()).slice(0, 3)} ${d.getFullYear()}`
      : `${getMonthNameFR(d.getMonth()).slice(0, 3)} ${d.getFullYear()}`;
    if (!parMois[key]) parMois[key] = { total: 0, nb: 0, label: monthName };
    parMois[key].total += Number(r.hommes || 0) + Number(r.femmes || 0);
    parMois[key].nb++;
  });

  const mois = Object.entries(parMois)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-8)
    .map(([key, v]) => ({ key, ...v }));

  if (mois.length < 2) return (
    <p className="text-white/30 text-sm text-center py-4">{t.tendanceInsuffisant}</p>
  );

  const maxTotal = Math.max(...mois.map(m => m.total), 1);
  const dernier = mois[mois.length - 1];
  const avantDernier = mois[mois.length - 2];
  const delta = dernier.total - avantDernier.total;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <span className="text-2xl font-bold text-white">{dernier.total}</span>
        <span className={`text-sm font-semibold ${delta >= 0 ? "text-emerald-400" : "text-red-400"}`}>
          {delta >= 0 ? "▲" : "▼"} {Math.abs(delta)} {t.tendanceVs}
        </span>
        <span className="text-[11px] text-white/60">
          {dernier.nb} {dernier.nb > 1 ? t.tendanceFormations : t.tendanceFormation}
        </span>
      </div>
      <div className="flex items-end gap-1 h-16">
        {mois.map(({ key, total, label }) => (
          <div key={key} className="flex-1 flex flex-col items-center gap-1">
            <div
              className="w-full bg-amber-500/70 rounded-t-sm transition-all"
              style={{ height: `${Math.max(4, (total / maxTotal) * 100)}%` }}
            />
            <p className="text-[9px] text-white/30 truncate w-full text-center">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── BLOC PAR FORMATION ────────────────────────────────────────
function BlocParFormation({ rapports, t }) {
  const parNom = {};
  rapports.forEach(r => {
    const nom = r.nom_formation || t.sansNom;
    if (!parNom[nom]) parNom[nom] = { total: 0, hommes: 0, femmes: 0, nb: 0 };
    parNom[nom].total += Number(r.hommes || 0) + Number(r.femmes || 0);
    parNom[nom].hommes += Number(r.hommes || 0);
    parNom[nom].femmes += Number(r.femmes || 0);
    parNom[nom].nb++;
  });

  const lignes = Object.entries(parNom).sort((a, b) => b[1].total - a[1].total);
  const maxTotal = Math.max(...lignes.map(([, v]) => v.total), 1);

  if (!lignes.length) return <p className="text-white/30 text-sm text-center py-4">{t.aucuneDonnee}</p>;

  return (
    <div className="flex flex-col gap-2">
      {lignes.map(([nom, { total, hommes, femmes, nb }]) => (
        <div key={nom} className="bg-white/10 rounded-xl px-4 py-3 flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <p className="text-sm text-white w-36 flex-shrink-0 truncate">{nom}</p>
            <BarreProgression pct={(total / maxTotal) * 100} color="bg-amber-400" />
            <p className="text-sm font-bold text-white w-10 text-right">{total}</p>
            <p className="text-[11px] text-white/30 w-14 text-right flex-shrink-0">{nb} {t.sess}</p>
          </div>
          <div className="flex gap-3 ml-36">
            <Badge color="blue">H: {hommes}</Badge>
            <Badge color="pink">F: {femmes}</Badge>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── CARTE RAPPORT (par session) ───────────────────────────────
function CarteRapport({ r, onEdit, onDelete, t }) {
  const [open, setOpen] = useState(false);
  const total = Number(r.hommes || 0) + Number(r.femmes || 0);
  const duree = r.date_debut && r.date_fin
    ? Math.max(0, Math.round((new Date(r.date_fin) - new Date(r.date_debut)) / 86400000))
    : null;

  return (
    <div className="bg-white/10 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-4 hover:bg-white/5 transition text-left gap-3"
      >
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="font-semibold text-white text-sm truncate">{r.nom_formation || t.formation}</span>
          <span className="text-[11px] text-white/60">
            {formatDateFr(r.date_debut)}
            {r.date_fin && r.date_fin !== r.date_debut ? ` → ${formatDateFr(r.date_fin)}` : ""}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Badge color="blue">H {r.hommes || 0}</Badge>
          <Badge color="pink">F {r.femmes || 0}</Badge>
          <Badge color="amber">{t.labelTotal} {total}</Badge>
          <span className="text-white/30 text-xs">{open ? "▲" : "▼"}</span>
        </div>
      </button>

      {open && (
        <div className="border-t border-white/10 px-4 pb-4 pt-3 flex flex-col gap-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { label: t.labelHommes, value: r.hommes || 0, color: "text-blue-300" },
              { label: t.labelFemmes, value: r.femmes || 0, color: "text-pink-300" },
              { label: t.labelTotal, value: total, color: "text-amber-300 font-bold" },
              { label: t.labelDuree, value: duree !== null ? `${duree}j` : "—", color: "text-purple-300" },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-white/5 rounded-xl px-3 py-2 flex flex-col">
                <p className="text-[10px] text-white/40">{label}</p>
                <p className={`text-lg font-bold ${color}`}>{value}</p>
              </div>
            ))}
          </div>
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => onEdit(r)}
              className="flex-1 py-2 rounded-xl bg-blue-600/40 hover:bg-blue-600/60 text-blue-300 text-sm font-semibold transition"
            >
              {t.modifier}
            </button>
            <button
              onClick={() => onDelete(r.id)}
              className="flex-1 py-2 rounded-xl bg-red-900/40 hover:bg-red-900/60 text-red-300 text-sm font-semibold transition"
            >
              {t.supprimer}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── FORMULAIRE ────────────────────────────────────────────────
function FormulaireFormation({ egliseId, onSaved, editData, onCancelEdit, t }) {
  const [formData, setFormData] = useState({
    date_debut: "", date_fin: "", nom_formation: "", hommes: 0, femmes: 0,
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (editData) {
      setFormData({
        date_debut: editData.date_debut || "",
        date_fin: editData.date_fin || "",
        nom_formation: editData.nom_formation || "",
        hommes: editData.hommes || 0,
        femmes: editData.femmes || 0,
      });
    }
  }, [editData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const numericFields = ["hommes", "femmes"];
    setFormData(prev => ({
      ...prev,
      [name]: numericFields.includes(name) ? Number(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.date_debut || !formData.nom_formation.trim()) {
      setMessage(t.champRequis);
      return;
    }
    setMessage(t.enregistrement);

    const payload = {
      date_debut: formData.date_debut,
      date_fin: formData.date_fin || formData.date_debut,
      nom_formation: formData.nom_formation.trim(),
      hommes: Number(formData.hommes) || 0,
      femmes: Number(formData.femmes) || 0,
      eglise_id: egliseId,
    };

    try {
      if (editData) {
        const { error } = await supabase.from("formations").update(payload).eq("id", editData.id);
        if (error) throw error;
        setMessage(t.formationMiseAJour);
      } else {
        const { error } = await supabase.from("formations").insert([payload]);
        if (error) throw error;
        setMessage(t.formationAjoutee);
      }
      setFormData({ date_debut: "", date_fin: "", nom_formation: "", hommes: 0, femmes: 0 });
      setTimeout(() => setMessage(""), 3000);
      onSaved();
    } catch (err) {
      setMessage("❌ " + err.message);
    }
  };

  return (
    <div className="bg-white/10 rounded-2xl p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-white font-semibold">
          {editData ? t.modifierFormation : t.nouvelleFormation}
        </p>
        {editData && (
          <button onClick={onCancelEdit} className="text-sm text-white/80 hover:text-white transition">
            {t.annuler}
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Dates */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-sm text-white/80">{t.labelDateDebut}</label>
            <input
              type="date" name="date_debut" value={formData.date_debut}
              onChange={handleChange} required
              className="bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-white/40"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-white/80">{t.labelDateFin}</label>
            <input
              type="date" name="date_fin" value={formData.date_fin}
              onChange={handleChange}
              className="bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-white/40"
            />
          </div>
        </div>

        {/* Nom */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-white/80">{t.nomFormation}</label>
          <input
            type="text" name="nom_formation" value={formData.nom_formation}
            onChange={handleChange} required placeholder={t.nomFormationPlaceholder}
            className="bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-white/40 placeholder:text-white/20"
          />
        </div>

        {/* Participants */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-sm text-blue-300">{t.labelHommesForm}</label>
            <input
              type="number" name="hommes" value={formData.hommes}
              onChange={handleChange} min={0}
              className="bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-white/40 text-center"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-pink-300">{t.labelFemmesForm}</label>
            <input
              type="number" name="femmes" value={formData.femmes}
              onChange={handleChange} min={0}
              className="bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-white/40 text-center"
            />
          </div>
        </div>

        {/* Résumé total */}
        {(Number(formData.hommes) + Number(formData.femmes)) > 0 && (
          <div className="bg-white/5 rounded-xl px-4 py-2 flex items-center justify-center gap-3">
            <span className="text-[11px] text-white/40">{t.totalParticipantsForm}</span>
            <span className="text-lg font-bold text-amber-300">
              {Number(formData.hommes) + Number(formData.femmes)}
            </span>
          </div>
        )}

        <button
          type="submit"
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-sm hover:from-amber-600 hover:to-orange-600 transition-all active:scale-95"
        >
          {editData ? t.mettrAJour : t.ajouterLaFormation}
        </button>

        {message && (
          <p className="text-center text-sm font-medium text-white/80">{message}</p>
        )}
      </form>
    </div>
  );
}

// ─── PAGE PRINCIPALE ───────────────────────────────────────────
function RapportFormation() {
  const { lang } = useLang();
  const t = translations[lang];

  const [rapports, setRapports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [egliseId, setEgliseId] = useState(null);
  const [filtrePeriode, setFiltrePeriode] = useState("90");
  const [modePerso, setModePerso] = useState(false);
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [onglet, setOnglet] = useState("kpi");
  const [editData, setEditData] = useState(null);
  const formRef = useRef(null);

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("profiles").select("eglise_id").eq("id", user.id).single();
      if (data) setEgliseId(data.eglise_id);
    };
    loadUser();
  }, []);

  const fetchRapports = async (overrideModePerso = null) => {
    if (!egliseId) return;
    setLoading(true);
    const isPerso = overrideModePerso !== null ? overrideModePerso : modePerso;

    let query = supabase
      .from("formations")
      .select("*")
      .eq("eglise_id", egliseId)
      .order("date_debut", { ascending: false });

    if (isPerso) {
      if (dateDebut) query = query.gte("date_debut", dateDebut);
      if (dateFin) query = query.lte("date_debut", dateFin);
    } else {
      const depuis = new Date();
      depuis.setDate(depuis.getDate() - Number(filtrePeriode));
      query = query.gte("date_debut", depuis.toISOString().split("T")[0]);
    }

    const { data } = await query;
    setRapports(data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (!modePerso) fetchRapports(false);
  }, [egliseId, filtrePeriode, modePerso]);

  const handleDelete = async (id) => {
    if (!confirm(t.confirmSupprimer)) return;
    await supabase.from("formations").delete().eq("id", id);
    fetchRapports();
  };

  const handleEdit = (r) => {
    setEditData(r);
    setOnglet("saisie");
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  };

  const onglets = [
    { key: "kpi", label: t.vueEnsemble },
    { key: "sessions", label: t.parFormation },
    { key: "saisie", label: t.saisie },
  ];

  const periodes = [
    { label: t.j7, val: "7" },
    { label: t.j30, val: "30" },
    { label: t.j90, val: "90" },
    { label: t.mois6, val: "180" },
    { label: t.an1, val: "365" },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center p-4 sm:p-6" style={{ background: "#333699" }}>
      <HeaderPages />

      <div className="w-full max-w-3xl flex flex-col gap-6">
        {/* ─── EN-TÊTE ─── */}
        <div className="text-center mt-4">
          <h1 className="text-2xl font-bold mb-3 text-white">
            {t.pageTitle}{" "}
            <span className="text-emerald-300">{t.pageTitleAccent}</span>
          </h1>
          <p className="italic text-base text-white/90 max-w-2xl mx-auto">
            <span className="text-blue-300 font-semibold">{t.pageSubtitleCreez}</span> {t.pageSubtitleText1}{" "}
            <span className="text-blue-300 font-semibold">{t.pageSubtitleCentralisez}</span> {t.pageSubtitleText2}{" "}
            <span className="text-blue-300 font-semibold">{t.pageSubtitleCroissance}</span>.
          </p>
        </div>

        {/* ─── FILTRES ─── */}
        <div className="bg-white/10 rounded-2xl p-4 flex flex-col gap-3">
          <div className="flex gap-1 bg-white/10 rounded-xl p-1 w-fit">
            <button
              onClick={() => setModePerso(false)}
              className={`px-3 py-1 rounded-lg text-sm font-semibold transition ${!modePerso ? "bg-white text-[#333699]" : "text-white/60 hover:text-white/80"}`}
            >
              {t.perioderapide}
            </button>
            <button
              onClick={() => setModePerso(true)}
              className={`px-3 py-1 rounded-lg text-sm font-semibold transition ${modePerso ? "bg-white text-[#333699]" : "text-white/60 hover:text-white/80"}`}
            >
              {t.tranchedates}
            </button>
          </div>

          {!modePerso && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-white/60 flex-shrink-0">{t.periode}</span>
              <div className="flex gap-1 bg-white/10 rounded-xl p-1 flex-wrap">
                {periodes.map(p => (
                  <button
                    key={p.val} onClick={() => setFiltrePeriode(p.val)}
                    className={`px-3 py-1 rounded-lg text-sm font-semibold transition ${filtrePeriode === p.val ? "bg-white text-[#333699]" : "text-white/60 hover:text-white/80"}`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {modePerso && (
            <div className="flex flex-col gap-2">
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-white/80">{t.dateDebut}</label>
                  <input
                    type="date" value={dateDebut}
                    onChange={e => setDateDebut(e.target.value)}
                    className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-white/40"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-white/80">{t.dateFin}</label>
                  <input
                    type="date" value={dateFin}
                    onChange={e => setDateFin(e.target.value)}
                    className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-white/40"
                  />
                </div>
              </div>
              <button
                onClick={() => fetchRapports(true)}
                className="w-full py-2 rounded-xl bg-amber-500/80 hover:bg-amber-500 text-white text-sm font-semibold transition active:scale-95"
              >
                {t.genererRapport}
              </button>
            </div>
          )}
        </div>

        {/* ─── ONGLETS ─── */}
        <div className="flex gap-1 bg-white/10 rounded-xl p-1">
          {onglets.map(o => (
            <button
              key={o.key} onClick={() => setOnglet(o.key)}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition whitespace-nowrap ${onglet === o.key ? "bg-white text-[#333699]" : "text-white/80 hover:text-white"}`}
            >
              {o.label}
            </button>
          ))}
        </div>

        {/* ─── CONTENU ─── */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
          </div>
        ) : onglet === "saisie" ? (
          <div ref={formRef}>
            <FormulaireFormation
              egliseId={egliseId}
              onSaved={() => { fetchRapports(); setEditData(null); }}
              editData={editData}
              onCancelEdit={() => setEditData(null)}
              t={t}
            />
          </div>
        ) : rapports.length === 0 ? (
          <div className="bg-white/10 rounded-2xl p-8 text-center flex flex-col gap-3">
            <p className="text-white text-sm">{t.aucuneFormation}</p>
            <button
              onClick={() => setOnglet("saisie")}
              className="mx-auto px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-semibold transition"
            >
              {t.ajouterFormation}
            </button>
          </div>
        ) : onglet === "kpi" ? (
          <div className="flex flex-col gap-7">
            <div>
              <SectionTitle>{t.sectionVueEnsemble}</SectionTitle>
              <BlocKpiGlobaux rapports={rapports} t={t} />
            </div>
            <div>
              <SectionTitle>{t.sectionGenre}</SectionTitle>
              <div className="bg-white/10 rounded-2xl px-4 py-4">
                <BlocGenre rapports={rapports} t={t} />
              </div>
            </div>
            <div>
              <SectionTitle>{t.sectionTendance}</SectionTitle>
              <div className="bg-white/10 rounded-2xl px-4 py-4">
                <BlocTendance rapports={rapports} t={t} lang={lang} />
              </div>
            </div>
            <div>
              <SectionTitle>{t.sectionParFormation}</SectionTitle>
              <BlocParFormation rapports={rapports} t={t} />
            </div>
            <div className="flex justify-center">
              <button
                onClick={() => setOnglet("saisie")}
                className="px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-sm font-semibold transition active:scale-95"
              >
                {t.ajouterModifier}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex justify-end">
              <button
                onClick={() => setOnglet("saisie")}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-semibold transition"
              >
                {t.nouvelleFormationBtn}
              </button>
            </div>
            {rapports.map(r => (
              <CarteRapport
                key={r.id} r={r}
                onEdit={handleEdit}
                onDelete={handleDelete}
                t={t}
              />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
