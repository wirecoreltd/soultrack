// ═══════════════════════════════════════════════════════════════
// PAGE : Rapport de Présences & Statistiques (AttendancePage)
// ═══════════════════════════════════════════════════════════════
// Description : Gère les rapports de présence aux rassemblements
// (cultes, prières, etc.) : saisie des effectifs (hommes, femmes,
// jeunes, enfants, connectés), suivi des nouveaux venus et convertis,
// gestion dynamique des types de temps, et vue d'ensemble (KPI,
// provenance des nouveaux venus, tendance hebdomadaire, fréquentation
// par type). Permet aussi la modification et la suppression des
// rapports existants.
//
// Tables Supabase utilisées :
// - profiles          (lecture)             → eglise_id de l'utilisateur connecté
// - attendance        (lecture + écriture)  → rapports de présence (création, modification, suppression)
//                                              et liste des types de temps existants
// - membres_complets  (lecture)             → champ "venu" des nouveaux venus, filtré sur date_premiere_visite,
//                                              pour la section "Provenance des nouveaux venus"
// ═══════════════════════════════════════════════════════════════

"use client";

import { useState, useEffect, useRef } from "react";
import supabase from "../../lib/supabaseClient";
import HeaderPages from "../../components/HeaderPages";
import Footer from "../../components/Footer";
import ProtectedRoute from "../../components/ProtectedRoute";
import { useLang } from "../../hooks/useLang";

// ─── TRADUCTIONS ───────────────────────────────────────────────
const translations = {
  fr: {
    // Page
    pageTitle: "Rapport de",
    pageTitleAccent: "Présences & Statistiques",
    pageSubtitle: "Suivez et gérez facilement les",
    pageSubtitlePresences: "présences",
    pageSubtitleDe: "de tous les rassemblements spirituels. Enregistrez l'ensemble des",
    pageSubtitleParticipants: "participants",
    pageSubtitleYc: ", y compris les",
    pageSubtitleNouveaux: "nouveaux venus",
    pageSubtitleEt: "et les",
    pageSubtitleConvertis: "convertis",
    pageSubtitleEt2: ", et générez des",
    pageSubtitleRapports: "rapports clairs",
    pageSubtitlePour: "pour mieux accompagner chaque membre.",

    // Filtres
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
    type: "Type :",
    tous: "Tous",

    // Onglets
    vueEnsemble: "Vue d'ensemble",
    parSession: "Par session",
    saisie: "Saisie",

    // Boutons actions
    ajouterRapport: "➕ Ajouter un rapport",
    modifierRapport: "✏️ Modifier un rapport",

    // Vide
    aucunRapport: "Aucun rapport sur cette période",

    // Sections KPI
    sectionVueEnsemble: "Vue d'ensemble",
    sectionProvenance: "Provenance des nouveaux venus",
    sectionParType: "Fréquentation par type de temps",
    sectionTendance: "Tendance hebdomadaire (présents H+F+J)",

    // KPI labels
    kpiSessions: "Sessions",
    kpiSessionsSub: "sur la période",
    kpiMoyPresents: "Moy. présents",
    kpiMoyPresentsSub: "par session (H+F+J)",
    kpiNouveauxVenus: "Nouveaux venus",
    kpiNVSub: "sur la période",
    kpiConvertis: "Convertis",
    kpiConvSub: "sur la période",
    kpiHommes: "Hommes",
    kpiFemmes: "Femmes",
    kpiJeunes: "Jeunes",
    kpiEnfants: "Enfants",
    kpiConnectes: "Connectés (en ligne)",
    kpiTotal: "Total global",
    kpiTotalSub: "H+F+J+Enfants+Connectés",
    kpiTotal2: "total",

    // Genre bloc
    hommes: "Hommes",
    femmes: "Femmes",
    jeunes: "Jeunes",

    // Provenance bloc
    provInvite: "Invité",
    provReseaux: "Réseaux",
    provEvangelisation: "Évangélisation",
    provAutre: "Autre",

    // Tendance
    tendanceVs: "vs sem. préc.",
    tendanceInsuffisant: "Données insuffisantes (≥ 2 semaines)",

    // Par type
    sess: "sess.",
    aucuneDonnee: "Aucune donnée",
    voirPlus: "Voir plus",
    voirMoins: "Voir moins",

    // Évangélisation
    nouveauxVenus: "Nouveaux venus",
    moy: "Moy:",
    convertis: "Convertis",
    tauxConv: "Taux conv.",
    nvConv: "NV → Conv.",
    legendNV: "Nouveaux venus",
    legendConv: "Convertis",

    // Carte session
    nv: "Nv. venus",
    totalGlobal: "Total global",
    modifier: "✏️ Modifier",
    supprimer: "🗑️ Supprimer",
    confirmSupprimer: "Supprimer ce rapport ?",

    // Formulaire
    modifierRapportTitre: "✏️ Modifier le rapport",
    saisieRapport: "Saisie du rapport",
    annuler: "Annuler",
    dateLabel: "Date du culte",
    typeTempsLabel: "Type de temps",
    selectionnerTemps: "Sélectionner un temps",
    ajouterTemps: "+ Ajouter un temps",
    nomTemps: "Nom du temps",
    nomTempsPlaceholder: "Ex: ADP",
    enregistrerTemps: "Enregistrer ce temps pour le futur",
    numeroCulte: "Numéro de culte",
    selectionner: "--- Sélectionner ---",
    culte: "Culte",
    er: "er",
    eme: "ème",
    nomTempsRequis: "❌ Nom du temps requis.",
    enregistrement: "⏳ Enregistrement...",
    rapportMisAJour: "✅ Rapport mis à jour !",
    rapportAjoute: "✅ Rapport ajouté !",
    mettrAJour: "Mettre à jour",
    ajouterLeRapport: "Ajouter le rapport",
    fHommes: "Hommes",
    fFemmes: "Femmes",
    fJeunes: "Jeunes",
    fEnfants: "Enfants",
    fConnectes: "Connectés",
    fNouveauxVenus: "Nouveaux venus",
    fNouveauxConvertis: "Nouveaux convertis",
  },
  en: {
    // Page
    pageTitle: "Report of",
    pageTitleAccent: "Attendance & Statistics",
    pageSubtitle: "Easily track and manage",
    pageSubtitlePresences: "attendance",
    pageSubtitleDe: "for all spiritual gatherings. Record all",
    pageSubtitleParticipants: "participants",
    pageSubtitleYc: ", including",
    pageSubtitleNouveaux: "newcomers",
    pageSubtitleEt: "and",
    pageSubtitleConvertis: "converts",
    pageSubtitleEt2: ", and generate",
    pageSubtitleRapports: "clear reports",
    pageSubtitlePour: "to better support every member.",

    // Filtres
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
    type: "Type:",
    tous: "All",

    // Onglets
    vueEnsemble: "Overview",
    parSession: "By session",
    saisie: "Add data",

    // Boutons actions
    ajouterRapport: "➕ Add a report",
    modifierRapport: "✏️ Edit a report",

    // Vide
    aucunRapport: "No reports for this period",

    // Sections KPI
    sectionVueEnsemble: "Overview",
    sectionProvenance: "Newcomer source",
    sectionParType: "Attendance by service type",
    sectionTendance: "Weekly trend (M+F+Y present)",

    // KPI labels
    kpiSessions: "Sessions",
    kpiSessionsSub: "for the period",
    kpiMoyPresents: "Avg. present",
    kpiMoyPresentsSub: "per session (M+F+Y)",
    kpiNouveauxVenus: "Newcomers",
    kpiNVSub: "for the period",
    kpiConvertis: "Converts",
    kpiConvSub: "for the period",
    kpiHommes: "Men",
    kpiFemmes: "Women",
    kpiJeunes: "Youth",
    kpiEnfants: "Children",
    kpiConnectes: "Online (connected)",
    kpiTotal: "Grand total",
    kpiTotalSub: "M+F+Y+Children+Online",
    kpiTotal2: "total",

    // Genre bloc
    hommes: "Men",
    femmes: "Women",
    jeunes: "Youth",

    // Provenance bloc
    provInvite: "Invited",
    provReseaux: "Social media",
    provEvangelisation: "Evangelism",
    provAutre: "Other",

    // Tendance
    tendanceVs: "vs prev. week",
    tendanceInsuffisant: "Insufficient data (≥ 2 weeks)",

    // Par type
    sess: "sess.",
    aucuneDonnee: "No data",
    voirPlus: "Show more",
    voirMoins: "Show less",

    // Évangélisation
    nouveauxVenus: "Newcomers",
    moy: "Avg:",
    convertis: "Converts",
    tauxConv: "Conv. rate",
    nvConv: "New → Conv.",
    legendNV: "Newcomers",
    legendConv: "Converts",

    // Carte session
    nv: "Newcomers",
    totalGlobal: "Grand total",
    modifier: "✏️ Edit",
    supprimer: "🗑️ Delete",
    confirmSupprimer: "Delete this report?",

    // Formulaire
    modifierRapportTitre: "✏️ Edit report",
    saisieRapport: "Enter report",
    annuler: "Cancel",
    dateLabel: "Service date",
    typeTempsLabel: "Service type",
    selectionnerTemps: "Select a type",
    ajouterTemps: "+ Add a type",
    nomTemps: "Type name",
    nomTempsPlaceholder: "E.g.: Prayer",
    enregistrerTemps: "Save this type for future use",
    numeroCulte: "Service number",
    selectionner: "--- Select ---",
    culte: "Service",
    er: "st",
    eme: "th",
    nomTempsRequis: "❌ Service type name required.",
    enregistrement: "⏳ Saving...",
    rapportMisAJour: "✅ Report updated!",
    rapportAjoute: "✅ Report added!",
    mettrAJour: "Update",
    ajouterLeRapport: "Add report",
    fHommes: "Men",
    fFemmes: "Women",
    fJeunes: "Youth",
    fEnfants: "Children",
    fConnectes: "Online",
    fNouveauxVenus: "Newcomers",
    fNouveauxConvertis: "Converts",
  },
};

export default function AttendancePage() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur", "ResponsableIntegration"]}>
      <Attendance />
    </ProtectedRoute>
  );
}

// ─── HELPERS ──────────────────────────────────────────────────
function formatDateFr(dateStr) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("fr-FR", {
    day: "2-digit", month: "short", year: "numeric",
  });
}
function formatDateCourt(dateStr) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("fr-FR", {
    day: "2-digit", month: "short",
  });
}
// Retourne le lundi (00:00) de la semaine contenant dateStr, sous forme "YYYY-MM-DD".
// Utilisé comme clé de regroupement hebdomadaire : le tri lexicographique de cette
// clé correspond exactement à l'ordre chronologique, ce qui évite les erreurs de
// numérotation de semaine (ISO) qui empêchaient l'affichage du graphique.
function getMondayKey(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  const day = d.getDay(); // 0 = dimanche ... 6 = samedi
  const diff = (day === 0 ? -6 : 1) - day; // décalage jusqu'au lundi de cette semaine
  const monday = new Date(d);
  monday.setDate(d.getDate() + diff);
  const yyyy = monday.getFullYear();
  const mm = String(monday.getMonth() + 1).padStart(2, "0");
  const dd = String(monday.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
// Normalise le champ "venu" de membres_complets : les valeurs existantes en
// base sont incohérentes en casse/accents ("Évangélisation", "evangélisation",
// "réseaux", "autre"...). On regroupe par mot-clé plutôt que par égalité stricte.
function normalizeVenu(v) {
  if (!v) return "autre";
  const s = v.toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (s.includes("invite")) return "invite";
  if (s.includes("reseau")) return "reseaux";
  if (s.includes("evangel")) return "evangelisation";
  return "autre";
}

// ─── UI ATOMS ─────────────────────────────────────────────────
function SectionTitle({ children }) {
  return <p className="text-sm font-semibold uppercase tracking-widest text-white/80 mb-3">{children}</p>;
}
function KpiCard({ label, value, sub, accent }) {
  const c = { green: "text-emerald-400", red: "text-red-400", amber: "text-amber-400", white: "text-white", blue: "text-blue-300", pink: "text-pink-300",cyan: "text-cyan-300",
  lime: "text-lime-300" };
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
    gray: "bg-white/10 text-white/50",
  };
  return <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${m[color] || m.gray}`}>{children}</span>;
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
function BlocKpiGlobaux({ reports, membresProvenance, t }) {
  const totalSessions = reports.length;
  const totalHommes = reports.reduce((a, r) => a + Number(r.hommes || 0), 0);
  const totalFemmes = reports.reduce((a, r) => a + Number(r.femmes || 0), 0);
  const totalJeunes = reports.reduce((a, r) => a + Number(r.jeunes || 0), 0);
  const totalEnfants = reports.reduce((a, r) => a + Number(r.enfants || 0), 0);
  const totalConnectes = reports.reduce((a, r) => a + Number(r.connectes || 0), 0);
  // Aligné sur le bloc "Provenance des nouveaux venus" : on compte les membres
  // réels (membres_complets) dont date_premiere_visite tombe dans la période,
  // plutôt que le champ saisi manuellement par rapport (attendance.nouveauxVenus),
  // pour que les deux chiffres affichés correspondent toujours.
  const totalNV = membresProvenance.length;
  const totalNC = reports.reduce((a, r) => a + Number(r.nouveauxConvertis || 0), 0);
  const totalPresents = totalHommes + totalFemmes + totalJeunes;
  const totalGlobal = totalPresents + totalEnfants + totalConnectes;
  const moyenneParSession = totalSessions > 0 ? Math.round(totalPresents / totalSessions) : 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiCard label={t.kpiSessions} value={totalSessions} sub={t.kpiSessionsSub} accent="lime" />
        <KpiCard label={t.kpiMoyPresents} value={moyenneParSession} sub={t.kpiMoyPresentsSub} accent="amber" />
        <KpiCard label={t.kpiNouveauxVenus} value={totalNV} sub={t.kpiNVSub} accent="blue" />
        <KpiCard label={t.kpiConvertis} value={totalNC} sub={t.kpiConvSub} accent="green" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiCard label={t.kpiHommes} value={totalHommes} sub={t.kpiTotal2} accent="blue" />
        <KpiCard label={t.kpiFemmes} value={totalFemmes} sub={t.kpiTotal2} accent="pink" />
        <KpiCard label={t.kpiJeunes} value={totalJeunes} sub={t.kpiTotal2} accent="amber" />
        <KpiCard label={t.kpiEnfants} value={totalEnfants} sub={t.kpiTotal2} accent="cyan" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <KpiCard label={t.kpiConnectes} value={totalConnectes} sub={t.kpiTotal2} accent="amber" />
        <KpiCard label={t.kpiTotal} value={totalGlobal} sub={t.kpiTotalSub} accent="green" />
      </div>
    </div>
  );
}

// ─── BLOC PROVENANCE DES NOUVEAUX VENUS ────────────────────────
// Source : membres_complets.venu, sur les membres dont date_premiere_visite
// tombe dans la période/tranche sélectionnée. Regroupé via normalizeVenu()
// pour absorber les variantes de casse/accents déjà présentes en base.
function BlocProvenance({ membres, t }) {
  const categories = [
    { key: "invite", label: t.provInvite, bg: "bg-blue-900/40", txt: "text-blue-300", sub: "text-blue-400/70", bar: "bg-blue-400" },
    { key: "reseaux", label: t.provReseaux, bg: "bg-pink-900/40", txt: "text-pink-300", sub: "text-pink-400/70", bar: "bg-pink-400" },
    { key: "evangelisation", label: t.provEvangelisation, bg: "bg-emerald-900/40", txt: "text-emerald-300", sub: "text-emerald-400/70", bar: "bg-emerald-400" },
    { key: "autre", label: t.provAutre, bg: "bg-amber-900/40", txt: "text-amber-300", sub: "text-amber-400/70", bar: "bg-amber-400" },
  ];
  const counts = { invite: 0, reseaux: 0, evangelisation: 0, autre: 0 };
  membres.forEach(m => { counts[normalizeVenu(m.venu)]++; });
  const total = membres.length;

  if (!total) return <p className="text-white/30 text-sm text-center py-4">{t.aucuneDonnee}</p>;

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {categories.map(({ key, label, bg, txt, sub }) => {
          const val = counts[key];
          const pct = total > 0 ? Math.round((val / total) * 100) : 0;
          return (
            <div key={key} className={`${bg} rounded-xl px-3 py-3 text-center`}>
              <p className="text-xl font-bold text-white/80">{val}</p>
              <p className={`text-[11px] ${sub}`}>{label}</p>
              <p className="text-[10px] text-white/40">{pct}%</p>
            </div>
          );
        })}
      </div>
      <div className="flex h-2 rounded-full overflow-hidden gap-0.5">
        {categories.map(({ key, bar }) => (
          <div key={key} className={`${bar} transition-all`} style={{ width: `${total > 0 ? (counts[key] / total) * 100 : 0}%` }} />
        ))}
      </div>
    </div>
  );
}

// ─── BLOC TENDANCE ─────────────────────────────────────────────
// Regroupement par semaine calendaire (clé = lundi de la semaine, format
// "YYYY-MM-DD"). Ce format se trie lexicographiquement dans l'ordre
// chronologique et évite les décalages de numérotation ISO qui empêchaient
// le graphique de s'afficher.
function BlocTendance({ reports, t }) {
  const parSemaine = {};
  reports.forEach(r => {
    const key = getMondayKey(r.date);
    if (!parSemaine[key]) parSemaine[key] = { total: 0, nv: 0, nc: 0 };
    parSemaine[key].total += Number(r.hommes || 0) + Number(r.femmes || 0) + Number(r.jeunes || 0);
    parSemaine[key].nv += Number(r.nouveauxVenus || 0);
    parSemaine[key].nc += Number(r.nouveauxConvertis || 0);
  });
  const semaines = Object.entries(parSemaine)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-8)
    .map(([key, v]) => ({ sem: key, ...v, label: formatDateCourt(key) }));

  if (semaines.length < 2) return <p className="text-white/30 text-sm text-center py-4">{t.tendanceInsuffisant}</p>;

  const maxTotal = Math.max(...semaines.map(s => s.total), 1);
  const derniere = semaines[semaines.length - 1];
  const avantDerniere = semaines[semaines.length - 2];
  const delta = derniere.total - avantDerniere.total;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <span className="text-2xl font-bold text-white">{derniere.total}</span>
        <span className={`text-sm font-semibold ${delta >= 0 ? "text-emerald-400" : "text-red-400"}`}>
          {delta >= 0 ? "▲" : "▼"} {Math.abs(delta)} {t.tendanceVs}
        </span>
      </div>
      <div className="flex items-end gap-1 h-16">
        {semaines.map(({ sem, total, label }) => (
          <div key={sem} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full bg-blue-500/70 rounded-t-sm transition-all"
              style={{ height: `${Math.max(4, (total / maxTotal) * 100)}%` }} />
            <p className="text-[9px] text-white/30 truncate w-full text-center">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── BLOC TAUX PAR TYPE ────────────────────────────────────────
// Limité à 10 lignes par défaut, avec bouton "Voir plus" pour afficher le reste.
const LIMITE_PAR_TYPE = 10;
function BlocParType({ reports, t }) {
  const [showAll, setShowAll] = useState(false);
  const parType = {};
  reports.forEach(r => {
    const type = r.typeTemps || "Autre";
    if (!parType[type]) parType[type] = { total: 0, nv: 0, nc: 0, nb: 0 };
    parType[type].total += Number(r.hommes || 0) + Number(r.femmes || 0) + Number(r.jeunes || 0);
    parType[type].nv += Number(r.nouveauxVenus || 0);
    parType[type].nc += Number(r.nouveauxConvertis || 0);
    parType[type].nb++;
  });
  const maxTotal = Math.max(...Object.values(parType).map(v => v.total), 1);
  const lignesTotal = Object.entries(parType).sort((a, b) => b[1].total - a[1].total);
  if (!lignesTotal.length) return <p className="text-white/30 text-sm text-center py-4">{t.aucuneDonnee}</p>;

  const lignes = showAll ? lignesTotal : lignesTotal.slice(0, LIMITE_PAR_TYPE);
  const resteACacher = lignesTotal.length - LIMITE_PAR_TYPE;

  return (
    <div className="flex flex-col gap-2">
      {lignes.map(([type, { total, nv, nc, nb }]) => (
        <div key={type} className="bg-white/10 rounded-xl px-4 py-3 flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <p className="text-sm text-white w-32 flex-shrink-0 truncate">{type}</p>
            <BarreProgression pct={(total / maxTotal) * 100} color="bg-blue-400" />
            <p className="text-sm font-bold text-white w-12 text-right">{total}</p>
            <p className="text-[11px] text-white/30 w-14 text-right flex-shrink-0">{nb} {t.sess}</p>
          </div>
          <div className="flex gap-3 ml-32">
            <Badge color="blue">NV: {nv}</Badge>
            <Badge color="green">Conv: {nc}</Badge>
          </div>
        </div>
      ))}
      {resteACacher > 0 && (
        <button
          onClick={() => setShowAll(v => !v)}
          className="mt-1 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/70 text-xs font-semibold transition active:scale-95"
        >
          {showAll ? t.voirMoins : `${t.voirPlus} (+${resteACacher})`}
        </button>
      )}
    </div>
  );
}

// ─── CARTE SESSION ─────────────────────────────────────────────
function CarteSession({ r, onEdit, onDelete, t }) {
  const [open, setOpen] = useState(false);
  const total = Number(r.hommes || 0) + Number(r.femmes || 0) + Number(r.jeunes || 0);
  const totalGlobal = total + Number(r.enfants || 0) + Number(r.connectes || 0);
  const label = r.typeTemps + (r.numero_culte ? ` — ${r.numero_culte}${r.numero_culte === 1 ? t.er : t.eme} culte` : "");

  return (
    <div className="bg-white/10 rounded-2xl overflow-hidden">
      <button onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-4 hover:bg-white/5 transition text-left gap-3">
        <div className="flex flex-col gap-0.5">
          <span className="font-semibold text-white text-sm">{label}</span>
          <span className="text-[11px] text-white/60">{formatDateFr(r.date)}</span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Badge color="blue">H {r.hommes}</Badge>
          <Badge color="pink">F {r.femmes}</Badge>
          <Badge color="amber">J {r.jeunes}</Badge>
          <Badge color="gray">Total {total}</Badge>
          <span className="text-white/30 text-xs">{open ? "▲" : "▼"}</span>
        </div>
      </button>
      {open && (
        <div className="border-t border-white/10 px-4 pb-4 pt-3 flex flex-col gap-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { label: t.hommes, value: r.hommes },
              { label: t.femmes, value: r.femmes },
              { label: t.jeunes, value: r.jeunes },
              { label: t.kpiEnfants, value: r.enfants },
              { label: t.fConnectes, value: r.connectes },
              { label: t.nv, value: r.nouveauxVenus },
              { label: t.convertis, value: r.nouveauxConvertis },
              { label: t.totalGlobal, value: totalGlobal },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white/5 rounded-xl px-3 py-2 flex flex-col">
                <p className="text-sm text-white/80">{label}</p>
                <p className="text-sm text-white/80">{value || 0}</p>
              </div>
            ))}
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={() => onEdit(r)}
              className="flex-1 py-2 rounded-xl bg-blue-600/40 hover:bg-blue-600/60 text-blue-300 text-sm font-semibold transition">
              {t.modifier}
            </button>
            <button onClick={() => onDelete(r.id)}
              className="flex-1 py-2 rounded-xl bg-red-900/40 hover:bg-red-900/60 text-red-300 text-sm font-semibold transition">
              {t.supprimer}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── FORMULAIRE ────────────────────────────────────────────────
function FormulaireSaisie({ egliseId, tempsOptions, setTempsOptions, onSaved, editData, onCancelEdit, t }) {
  const [formData, setFormData] = useState({
    date: "", typeTemps: "", nouveauTemps: "", enregistrerTemps: false,
    numero_culte: "", hommes: 0, femmes: 0, jeunes: 0, enfants: 0,
    connectes: 0, nouveauxVenus: 0, nouveauxConvertis: 0,
  });
  const [message, setMessage] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const selectRef = useRef(null);

  useEffect(() => {
    if (editData) {
      setFormData({
        date: editData.date,
        typeTemps: tempsOptions.includes(editData.typeTemps) ? editData.typeTemps : "AUTRE",
        nouveauTemps: !tempsOptions.includes(editData.typeTemps) ? editData.typeTemps : "",
        numero_culte: editData.numero_culte || "",
        hommes: editData.hommes || 0, femmes: editData.femmes || 0,
        jeunes: editData.jeunes || 0, enfants: editData.enfants || 0,
        connectes: editData.connectes || 0, nouveauxVenus: editData.nouveauxVenus || 0,
        nouveauxConvertis: editData.nouveauxConvertis || 0, enregistrerTemps: false,
      });
    } else {
      setFormData({
        date: "", typeTemps: "", nouveauTemps: "", enregistrerTemps: false,
        numero_culte: "", hommes: 0, femmes: 0, jeunes: 0, enfants: 0,
        connectes: 0, nouveauxVenus: 0, nouveauxConvertis: 0,
      });
    }
  }, [editData]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (selectRef.current && !selectRef.current.contains(e.target)) setDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const numericFields = ["hommes","femmes","jeunes","enfants","connectes","nouveauxVenus","nouveauxConvertis"];
    setFormData(prev => ({ ...prev, [name]: numericFields.includes(name) ? Number(value) || 0 : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(t.enregistrement);
    let typeTempsFinal = formData.typeTemps === "AUTRE" ? formData.nouveauTemps.trim() : formData.typeTemps;
    if (!typeTempsFinal) { setMessage(t.nomTempsRequis); return; }

    const payload = {
      date: formData.date, typeTemps: typeTempsFinal, eglise_id: egliseId,
      hommes: Number(formData.hommes) || 0, femmes: Number(formData.femmes) || 0,
      jeunes: Number(formData.jeunes) || 0, enfants: Number(formData.enfants) || 0,
      connectes: Number(formData.connectes) || 0, nouveauxVenus: Number(formData.nouveauxVenus) || 0,
      nouveauxConvertis: Number(formData.nouveauxConvertis) || 0,
      ...(formData.numero_culte ? { numero_culte: Number(formData.numero_culte) } : {}),
    };

    try {
      if (editData) {
        const { error } = await supabase.from("attendance").update(payload).eq("id", editData.id);
        if (error) throw error;
        setMessage(t.rapportMisAJour);
      } else {
        const { error } = await supabase.from("attendance").insert([payload]);
        if (error) throw error;
        if (formData.enregistrerTemps && formData.typeTemps === "AUTRE" && !tempsOptions.includes(typeTempsFinal)) {
          setTempsOptions(prev => [...prev, typeTempsFinal]);
        }
        setMessage(t.rapportAjoute);
      }
      setFormData({ date:"", typeTemps:"", nouveauTemps:"", enregistrerTemps:false, numero_culte:"", hommes:0, femmes:0, jeunes:0, enfants:0, connectes:0, nouveauxVenus:0, nouveauxConvertis:0 });
      setTimeout(() => setMessage(""), 3000);
      onSaved();
    } catch (err) {
      setMessage("❌ " + err.message);
    }
  };

  const fields = [
    { name: "hommes", label: t.fHommes },
    { name: "femmes", label: t.fFemmes },
    { name: "jeunes", label: t.fJeunes },
    { name: "enfants", label: t.fEnfants },
    { name: "connectes", label: t.fConnectes },
    { name: "nouveauxVenus", label: t.fNouveauxVenus },
    { name: "nouveauxConvertis", label: t.fNouveauxConvertis },
  ];

  return (
    <div className="bg-white/10 rounded-2xl p-5 flex flex-col gap-4 mt-6">
      <div className="flex items-center justify-between">
        <p className="text-white font-semibold">{editData ? t.modifierRapportTitre : t.saisieRapport}</p>
        {editData && (
          <button onClick={onCancelEdit} className="text-sm text-white/80 hover:text-white transition">{t.annuler}</button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Date */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-white/80">{t.dateLabel}</label>
          <input type="date" name="date" value={formData.date} onChange={handleChange} required
            className="bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-white/40" />
        </div>

        {/* Type de temps */}
        <div className="flex flex-col gap-1" ref={selectRef}>
          <label className="text-sm text-white/60">{t.typeTempsLabel}</label>
          <div onClick={() => setDropdownOpen(v => !v)}
            className="bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-white text-sm flex justify-between items-center cursor-pointer hover:bg-white/15 transition">
            <span className={formData.typeTemps ? "text-white" : "text-white/30"}>
              {formData.typeTemps || t.selectionnerTemps}
            </span>
            <span className="text-white/30">{dropdownOpen ? "▲" : "▼"}</span>
          </div>
          {dropdownOpen && (
            <div className="relative z-10">
              <div className="absolute top-1 left-0 w-full bg-[#2a2d80] border border-white/20 rounded-xl shadow-2xl overflow-hidden">
                {tempsOptions.map(tp => (
                  <div key={tp} onClick={() => { setFormData(p => ({ ...p, typeTemps: tp })); setDropdownOpen(false); }}
                    className="px-4 py-2.5 text-sm text-white hover:bg-white/10 cursor-pointer transition flex justify-between items-center">
                    <span>{tp}</span>
                  </div>
                ))}
                <div onClick={() => { setFormData(p => ({ ...p, typeTemps: "AUTRE", nouveauTemps: "" })); setDropdownOpen(false); }}
                  className="px-4 py-2.5 text-sm text-blue-300 hover:bg-white/10 cursor-pointer transition border-t border-white/10">
                  {t.ajouterTemps}
                </div>
              </div>
            </div>
          )}
        </div>

        {formData.typeTemps === "AUTRE" && (
          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-sm text-white/80">{t.nomTemps}</label>
              <input type="text" name="nouveauTemps" value={formData.nouveauTemps}
                onChange={e => setFormData(p => ({ ...p, nouveauTemps: e.target.value.slice(0, 30) }))}
                placeholder={t.nomTempsPlaceholder} maxLength={30}
                className="bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-white/40 placeholder:text-white/20" />
            </div>
            <label className="flex items-center gap-2 text-sm text-white/80 cursor-pointer">
              <input type="checkbox" checked={formData.enregistrerTemps}
                onChange={e => setFormData(p => ({ ...p, enregistrerTemps: e.target.checked }))} />
              {t.enregistrerTemps}
            </label>
          </div>
        )}

        {formData.typeTemps === "Culte" && (
          <div className="flex flex-col gap-1">
            <label className="text-sm text-white/80">{t.numeroCulte}</label>
            <select name="numero_culte" value={formData.numero_culte} onChange={handleChange}
              className="bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-white/40 appearance-none cursor-pointer">
              <option value="" className="bg-[#2a2d80]">{t.selectionner}</option>
              {[1,2,3,4,5,6,7].map(n => (
                <option key={n} value={n} className="bg-[#2a2d80]">
                  {n}{n === 1 ? t.er : t.eme} {t.culte}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Champs numériques */}
        <style>{`
          input.no-spinner::-webkit-outer-spin-button,
          input.no-spinner::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
          input.no-spinner[type=number] { -moz-appearance: textfield; }
        `}</style>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {fields.map(({ name, label }) => (
            <div key={name} className="flex flex-col gap-1">
              <label className="text-sm text-white/80">{label}</label>
              <input type="number" name={name} value={formData[name]} onChange={handleChange} min={0}
                onFocus={e => e.target.select()}
                className="no-spinner bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-white/40 text-center" />
            </div>
          ))}
        </div>

        <button type="submit"
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold text-sm hover:from-blue-600 hover:to-indigo-700 transition-all active:scale-95">
          {editData ? t.mettrAJour : t.ajouterLeRapport}
        </button>

        {message && <p className="text-center text-sm font-medium text-white/80">{message}</p>}
      </form>
    </div>
  );
}

// ─── PAGE PRINCIPALE ───────────────────────────────────────────
function Attendance() {
  const { lang } = useLang();
  const t = translations[lang];

  const [reports, setReports] = useState([]);
  const [membresProvenance, setMembresProvenance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [egliseId, setEgliseId] = useState(null);
  const [tempsOptions, setTempsOptions] = useState(["Culte"]);
  const [filtrePeriode, setFiltrePeriode] = useState("30");
  const [filtreType, setFiltreType] = useState("");
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

  useEffect(() => {
    if (!egliseId) return;
    const loadTemps = async () => {
      const { data } = await supabase.from("attendance").select("typeTemps").eq("eglise_id", egliseId).not("typeTemps", "is", null);
      if (data) {
        const unique = ["Culte", ...new Set(data.map(tp => tp.typeTemps?.trim()).filter(tp => tp && tp !== "Culte"))];
        setTempsOptions(unique);
      }
    };
    loadTemps();
  }, [egliseId]);

  const fetchReports = async (overrideModePerso = null) => {
    if (!egliseId) return;
    setLoading(true);
    const isPerso = overrideModePerso !== null ? overrideModePerso : modePerso;
    let query = supabase
    .from("attendance")
    .select("id, date, typeTemps, numero_culte, eglise_id, hommes, femmes, jeunes, enfants, connectes, nouveauxVenus, nouveauxConvertis")
    .eq("eglise_id", egliseId)
    .order("date", { ascending: false });
    if (isPerso) {
      if (dateDebut) query = query.gte("date", dateDebut);
      if (dateFin)   query = query.lte("date", dateFin);
    } else {
      const depuis = new Date();
      depuis.setDate(depuis.getDate() - Number(filtrePeriode));
      query = query.gte("date", depuis.toISOString().split("T")[0]);
    }
    if (filtreType) query = query.eq("typeTemps", filtreType);
    const { data } = await query;
    setReports(data || []);
    setLoading(false);
  };

  // Récupère le champ "venu" des nouveaux venus (membres_complets) sur la même
  // fenêtre temporelle que les rapports, filtré sur date_premiere_visite.
  const fetchProvenance = async (overrideModePerso = null) => {
    if (!egliseId) return;
    const isPerso = overrideModePerso !== null ? overrideModePerso : modePerso;
    let query = supabase
      .from("membres_complets")
      .select("id, venu")
      .eq("eglise_id", egliseId);
    if (isPerso) {
      if (dateDebut) query = query.gte("date_premiere_visite", dateDebut);
      if (dateFin)   query = query.lte("date_premiere_visite", dateFin);
    } else {
      const depuis = new Date();
      depuis.setDate(depuis.getDate() - Number(filtrePeriode));
      query = query.gte("date_premiere_visite", depuis.toISOString().split("T")[0]);
    }
    const { data } = await query;
    setMembresProvenance(data || []);
  };

  useEffect(() => {
    if (!modePerso) {
      fetchReports(false);
      fetchProvenance(false);
    }
  }, [egliseId, filtrePeriode, filtreType, modePerso]);

  const handleDelete = async (id) => {
    if (!confirm(t.confirmSupprimer)) return;
    await supabase.from("attendance").delete().eq("id", id);
    fetchReports();
  };

  const handleEdit = (r) => {
    setEditData(r);
    setOnglet("saisie");
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  };

  const handleAjouter = () => {
    setEditData(null);
    setOnglet("saisie");
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  };

  const handleModifier = () => {
    setEditData(null);
    setOnglet("sessions");
  };

  const typesDistincts = [...new Set(reports.map(s => s.typeTemps).filter(Boolean))];

  const onglets = [
    { key: "kpi", label: t.vueEnsemble },
    { key: "sessions", label: t.parSession },
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

      <div>
        {/* En-tête */}
        <h1 className="text-2xl font-bold mt-4 mb-6 text-blue-300 text-center text-white">
          {t.pageTitle} <span className="text-emerald-300">{t.pageTitleAccent}</span>
        </h1>
        <div className="max-w-3xl w-full mb-6 text-center">
          <p className="italic text-base text-white/90">
            {t.pageSubtitle} <span className="text-blue-300 font-semibold">{t.pageSubtitlePresences} </span>
            {t.pageSubtitleDe} <span className="text-blue-300 font-semibold">{t.pageSubtitleParticipants}</span>
            {t.pageSubtitleYc} <span className="text-blue-300 font-semibold">{t.pageSubtitleNouveaux}</span>{" "}
            {t.pageSubtitleEt} <span className="text-blue-300 font-semibold">{t.pageSubtitleConvertis}</span>
            {t.pageSubtitleEt2} <span className="text-blue-300 font-semibold">{t.pageSubtitleRapports}</span>{" "}
            {t.pageSubtitlePour}
          </p>
        </div>

        {/* Filtres */}
        <div className="bg-white/10 rounded-2xl p-4 flex flex-col gap-3">
          <div className="flex gap-1 bg-white/10 rounded-xl p-1 w-fit">
            <button onClick={() => setModePerso(false)}
              className={`px-3 py-1 rounded-lg text-sm font-semibold transition ${!modePerso ? "bg-white text-[#333699]" : "text-white/60 hover:text-white/80"}`}>
              {t.perioderapide}
            </button>
            <button onClick={() => setModePerso(true)}
              className={`px-3 py-1 rounded-lg text-sm font-semibold transition ${modePerso ? "bg-white text-[#333699]" : "text-white/60 hover:text-white/80"}`}>
              {t.tranchedates}
            </button>
          </div>
          
          {!modePerso && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-white/60 flex-shrink-0">{t.periode}</span>
              <div className="flex gap-1 bg-white/10 rounded-xl p-1 flex-wrap">
                {periodes.map(p => (
                  <button key={p.val} onClick={() => setFiltrePeriode(p.val)}
                    className={`px-3 py-1 rounded-lg text-sm font-semibold transition ${filtrePeriode === p.val ? "bg-white text-[#333699]" : "text-white/60 hover:text-white/80"}`}>
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
                  <input type="date" value={dateDebut} onChange={e => setDateDebut(e.target.value)}
                    className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-white/40" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-white/80">{t.dateFin}</label>
                  <input type="date" value={dateFin} onChange={e => setDateFin(e.target.value)}
                    className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-white/40" />
                </div>
              </div>
              <button onClick={() => { fetchReports(true); fetchProvenance(true); }}
                className="w-full py-2 rounded-xl bg-amber-500/80 hover:bg-amber-500 text-white text-sm font-semibold transition active:scale-95">
                {t.genererRapport}
              </button>
            </div>
          )}

          {typesDistincts.length > 1 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-white/80 flex-shrink-0">{t.type}</span>
              <select
                value={filtreType}
                onChange={e => setFiltreType(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-xl px-3 py-1.5 text-white text-sm focus:outline-none focus:border-white/40 appearance-none cursor-pointer"
              >
                <option value="" className="bg-[#2a2d80]">{t.tous}</option>
                {typesDistincts.map(tp => (
                  <option key={tp} value={tp} className="bg-[#2a2d80]">
                    {tp}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Onglets */}
        <div className="flex gap-1 bg-white/10 rounded-xl p-1 mt-4">
          {onglets.map(o => (
            <button key={o.key} onClick={() => setOnglet(o.key)}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition whitespace-nowrap ${onglet === o.key ? "bg-white text-[#333699]" : "text-white/80 hover:text-white"}`}>
              {o.label}
            </button>
          ))}
        </div>

        {/* Boutons actions */}
        <div className="flex gap-2 mt-3">
          <button onClick={handleAjouter}
            className="flex-1 py-2 rounded-xl bg-emerald-600/40 hover:bg-emerald-600/60 text-white/80 text-sm font-semibold transition active:scale-95">
            {t.ajouterRapport}
          </button>
          <button onClick={handleModifier}
            className="flex-1 py-2 rounded-xl bg-blue-600/40 hover:bg-blue-600/60 text-white/80 text-sm font-semibold transition active:scale-95">
            {t.modifierRapport}
          </button>
        </div>

        {/* Contenu */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
          </div>
        ) : onglet === "saisie" ? (
          <div ref={formRef}>
            <FormulaireSaisie
              egliseId={egliseId}
              tempsOptions={tempsOptions}
              setTempsOptions={setTempsOptions}
              onSaved={() => { fetchReports(); setEditData(null); setOnglet("kpi"); }}
              editData={editData}
              onCancelEdit={() => setEditData(null)}
              t={t}
            />
          </div>
        ) : reports.length === 0 ? (
          <div className="bg-white/10 rounded-2xl p-8 text-center flex flex-col gap-3 mt-4">
            <p className="text-white text-sm">{t.aucunRapport}</p>
            <button onClick={handleAjouter}
              className="mx-auto px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-semibold transition">
              {t.ajouterRapport}
            </button>
          </div>
        ) : onglet === "kpi" ? (
          <div className="flex flex-col gap-7 mt-4">
            <div>
              <SectionTitle>{t.sectionVueEnsemble}</SectionTitle>
              <BlocKpiGlobaux reports={reports} membresProvenance={membresProvenance} t={t} />
            </div>
            <div>
              <SectionTitle>{t.sectionProvenance}</SectionTitle>
              <div className="bg-white/10 rounded-2xl px-4 py-4">
                <BlocProvenance membres={membresProvenance} t={t} />
              </div>
            </div>
            <div>
              <SectionTitle>{t.sectionParType}</SectionTitle>
              <BlocParType reports={reports} t={t} />
            </div>
            <div>
              <SectionTitle>{t.sectionTendance}</SectionTitle>
              <div className="bg-white/10 rounded-2xl px-4 py-4">
                <BlocTendance reports={reports} t={t} />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3 mt-4">
            {reports.map(r => (
              <CarteSession key={r.id} r={r} onEdit={handleEdit} onDelete={handleDelete} t={t} />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
