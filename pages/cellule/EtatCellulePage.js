"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "../../lib/supabaseClient";
import HeaderPages from "../../components/HeaderPages";
import Footer from "../../components/Footer";
import ProtectedRoute from "../../components/ProtectedRoute";
import DetailsEtatConsEvangePopup from "../../components/DetailsEtatConsEvangePopup";
import EditMemberCellulePopup from "../../components/EditMemberCellulePopup";
import DetailsEtatConseillerPopup from "../../components/DetailsEtatConseillerPopup";
import { useLang } from "../../hooks/useLang";
import { useFeature } from "../../components/FeaturesContext";

const translations = {
  fr: {
    // Page
    pageTitle: "L'Évolution des Âmes par",
    pageTitleHighlight: "Cellule",
    subtitle1: "Outil de vision et de gestion spirituelle.",
    subtitle2: "Les âmes viennent de",
    subtitle3: "l'évangélisation ou de l'église",
    subtitle4: ", puis sont orientées vers les cellules pour grandir.",
    subtitle5: "Chaque donnée représente une vie précieuse",
    subtitle6: ", chaque progression témoigne de",
    subtitle7: "l'œuvre de Dieu",
    // Filtres
    quickPeriod: "Période rapide",
    dateRange: "Tranche de dates",
    periodLabel: "Période :",
    periods: [
      { label: "7 j", val: "7" },
      { label: "30 j", val: "30" },
      { label: "90 j", val: "90" },
      { label: "6 mois", val: "180" },
      { label: "1 an", val: "365" },
    ],
    startDate: "Date de début",
    endDate: "Date de fin",
    generateReport: "Générer le rapport",
    celluleLabel: "Cellule",
    allCellules: "Toutes les cellules",
    // Onglets
    tabOverview: "Vue d'ensemble",
    tabCellules: "Par cellule",
    tabMois: "Par mois",
    // Loading / empty
    loading: "Chargement...",
    emptyPerso: "Choisissez une plage de dates et cliquez sur « Générer le rapport »",
    emptyPeriod: "Aucune donnée sur cette période",
    // KPI labels
    kpiEvangelises: "Évangélisés",
    kpiEvangelisesSub: "contacts évangélisation",
    kpiVenus: "Venus à l'église",
    kpiVenusSub: "contacts intégration",
    kpiIntegres: "Intégrés",
    kpiBaptemes: "Baptêmes",
    kpiMinistere: "Ministère",
    kpiMinistereSub: "début ministère",
    kpiEncours: "En cours",
    kpiEncoursSub: "suivi actif",
    kpiAttente: "En attente",
    kpiAttenteSub: "à traiter",
    kpiRefus: "Refus",
    kpiOfTotal: (pct) => `${pct}% du total`,
    // Entonnoir
    funnelTitle: "Entonnoir de progression",
    funnelTotalAmes: "Total âmes",
    funnelIntegres: "Intégrés",
    funnelBaptises: "Baptisés",
    funnelMinistere: "En ministère",
    // Section titles
    sectionOverview: "Vue d'ensemble",
    sectionPerformance: "Performance par cellule",
    // Leaders en développement
    tabLeaders: "Leaders en développement",
    ongletLeaders: "Classement par étape",
    leadersEnDeveloppement: "🏆 Leaders en développement",
    totalLeaders: "Total leaders",
    parcoursStages: {
      potentiel: { emoji: "🌱", label: "Potentiel identifié" },
      croissance: { emoji: "🌿", label: "Serviteur fidèle" },
      developpement: { emoji: "🌳", label: "Leader en croissance" },
      mature: { emoji: "🌲", label: "Leader confirmé" },
    },
    aucuneEvaluation: "Sans évaluation",
    pasDeLeader: "Aucun leader",
    sansCellule: "Sans cellule",
    repartitionParCellule: "Répartition par cellule",
    // BlocParCellule
    noData: "Aucune donnée",
    // CarteLigne
    seeDetails: "Voir les détails",
    cellule: "Cellule",
    responsable: "Responsable",
    assignedOn: "Assigné le",
    dateEvolution: "Date évolution",
    bapteme: "Baptême",
    debutMinistere: "Début ministère",
    piliersLabel: "Piliers",
    pasDePilier: "Aucun pilier enregistré.",
    // OngletParMois
    noDataPeriod: "Aucune donnée sur cette période",
    persons: (n) => `${n} personne${n > 1 ? "s" : ""}`,
    // OngletParCelluleDetail
    noDataCellule: "Aucune donnée",
    integrated: (pct) => `${pct}% intégrées`,
    baptises: "Baptisés",
    ministere: "Ministère",
    encours: "En cours",
    refus: "Refus",
    // Statut labels
    integre: "Intégré",
    enAttente: "En attente",
    refusLabel: "Refus",
    enCours: "En cours",
    // Months
    months: ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"],
  },
  en: {
    pageTitle: "The Evolution of Souls by",
    pageTitleHighlight: "Cell",
    subtitle1: "Spiritual vision and management tool.",
    subtitle2: "Souls come from",
    subtitle3: "evangelisation or the church",
    subtitle4: ", then are directed to cells to grow.",
    subtitle5: "Each data point represents a precious life",
    subtitle6: ", each progression testifies to",
    subtitle7: "the work of God",
    quickPeriod: "Quick period",
    dateRange: "Date range",
    periodLabel: "Period:",
    periods: [
      { label: "7 d", val: "7" },
      { label: "30 d", val: "30" },
      { label: "90 d", val: "90" },
      { label: "6 mo", val: "180" },
      { label: "1 yr", val: "365" },
    ],
    startDate: "Start date",
    endDate: "End date",
    generateReport: "Generate report",
    celluleLabel: "Cell",
    allCellules: "All cells",
    tabOverview: "Overview",
    tabCellules: "By cell",
    tabMois: "By month",
    loading: "Loading...",
    emptyPerso: "Choose a date range and click \"Generate report\"",
    emptyPeriod: "No data for this period",
    kpiEvangelises: "Evangelised",
    kpiEvangelisesSub: "evangelisation contacts",
    kpiVenus: "Came to church",
    kpiVenusSub: "integration contacts",
    kpiIntegres: "Integrated",
    kpiBaptemes: "Baptisms",
    kpiMinistere: "Ministry",
    kpiMinistereSub: "started ministry",
    kpiEncours: "In progress",
    kpiEncoursSub: "active follow-up",
    kpiAttente: "Pending",
    kpiAttenteSub: "to process",
    kpiRefus: "Refused",
    kpiOfTotal: (pct) => `${pct}% of total`,
    funnelTitle: "Progression funnel",
    funnelTotalAmes: "Total souls",
    funnelIntegres: "Integrated",
    funnelBaptises: "Baptised",
    funnelMinistere: "In ministry",
    sectionOverview: "Overview",
    sectionPerformance: "Performance by cell",
    tabLeaders: "Emerging Leaders",
    ongletLeaders: "Ranking by stage",
    leadersEnDeveloppement: "🏆 Development leaders",
    totalLeaders: "Total leaders",
    parcoursStages: {
      potentiel: { emoji: "🌱", label: "Potential identified" },
      croissance: { emoji: "🌿", label: "Faithful Servant" },
      developpement: { emoji: "🌳", label: "Growing leader" },
      mature: { emoji: "🌲", label: "Established Leader" },
    },
    aucuneEvaluation: "No evaluation",
    pasDeLeader: "No leaders",
    sansCellule: "No cell group",
    repartitionParCellule: "By cell",
    noData: "No data",
    seeDetails: "See details",
    cellule: "Cell",
    responsable: "Leader",
    assignedOn: "Assigned on",
    dateEvolution: "Evolution date",
    bapteme: "Baptism",
    debutMinistere: "Ministry start",
    piliersLabel: "Pillars",
    pasDePilier: "No pillar registered.",
    noDataPeriod: "No data for this period",
    persons: (n) => `${n} person${n > 1 ? "s" : ""}`,
    noDataCellule: "No data",
    integrated: (pct) => `${pct}% integrated`,
    baptises: "Baptised",
    ministere: "Ministry",
    encours: "In progress",
    refus: "Refused",
    integre: "Integrated",
    enAttente: "Pending",
    refusLabel: "Refused",
    enCours: "In progress",
    months: ["January","February","March","April","May","June","July","August","September","October","November","December"],
  },
};

export default function EtatCellulePage() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur", "SuperviseurCellule", "ResponsableCellule"]}>
      <EtatCellule />
    </ProtectedRoute>
  );
}

// ─── HELPERS ──────────────────────────────────────────────────
function formatDateFR(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}
function getStatutNormalise(statut) {
  if (!statut) return "";
  const s = statut.toLowerCase();
  if (s.includes("envoy")) return "en attente";
  return s;
}
function formatStatut(statut) {
  if (!statut) return "—";
  const s = statut.toLowerCase();
  if (s.includes("envoy")) return "En attente";
  return statut;
}

// ─── UI ATOMS ─────────────────────────────────────────────────
function SectionTitle({ children, icon, total, className = "" }) {
  return (
    <div className={`flex items-center justify-between mb-3 ${className}`}>
      <p className="text-[11px] font-semibold uppercase tracking-widest text-white/40 flex items-center gap-1.5">
        {icon && <span className="text-sm">{icon}</span>}
        {children}
      </p>
      {total !== undefined && (
        <span className="text-sm font-bold text-white">{total}</span>
      )}
    </div>
  );
}

function KpiCard({ label, value, sub, accent }) {
  const c = {
    green: "text-emerald-400", red: "text-red-400", amber: "text-amber-400",
    white: "text-white", blue: "text-blue-300", pink: "text-pink-300",
    purple: "text-purple-300", teal: "text-teal-300", orange: "text-orange-300",
    gray: "text-white/40", indigo: "text-indigo-300", yellow: "text-yellow-300",
  };
  return (
    <div className="bg-white/10 rounded-2xl px-4 py-4 flex flex-col gap-1">
      <p className="text-xs text-white/50">{label}</p>
      <p className={`text-2xl font-bold leading-none ${c[accent] || "text-white"}`}>{value}</p>
      {sub && <p className="text-[11px] text-white/40 mt-0.5">{sub}</p>}
    </div>
  );
}
function Badge({ children, color }) {
  const m = {
    green: "bg-emerald-900/60 text-emerald-300", red: "bg-red-900/60 text-red-300",
    amber: "bg-amber-900/60 text-amber-300", blue: "bg-blue-900/60 text-blue-300",
    purple: "bg-purple-900/60 text-purple-300", gray: "bg-white/10 text-white/50",
    orange: "bg-orange-900/60 text-orange-300", yellow: "bg-yellow-900/60 text-yellow-300",
    indigo: "bg-indigo-900/60 text-indigo-300",
  };
  return <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${m[color] || m.gray}`}>{children}</span>;
}
function BarreProgression({ pct, color }) {
  const col = color || (pct >= 70 ? "bg-emerald-400" : pct >= 40 ? "bg-amber-400" : "bg-red-400");
  return (
    <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
      <div className={`h-full rounded-full transition-all ${col}`} style={{ width: `${Math.min(pct || 0, 100)}%` }} />
    </div>
  );
}

const LEADER_STAGE_COLORS = {
  potentiel:     { bg: "#E6F1FB", text: "#042C53" },
  croissance:    { bg: "#B5D4F4", text: "#042C53" },
  developpement: { bg: "#85B7EB", text: "#042C53" },
  mature:        { bg: "#378ADD", text: "#E6F1FB" },
};

function LeaderStageCard({ emoji, label, value, stage }) {
  const c = LEADER_STAGE_COLORS[stage] || { bg: "#E6F1FB", text: "#042C53" };
  return (
    <div
      className="rounded-2xl px-3 py-2.5 flex flex-col justify-between overflow-hidden"
      style={{ background: c.bg, height: "82px", boxSizing: "border-box" }}
    >
      <div className="flex items-start gap-1">
        <span className="text-sm leading-tight flex-shrink-0">{emoji}</span>
        <span className="text-sm font-medium leading-tight" style={{ color: c.text }}>
          {label}
        </span>
      </div>
      <span className="text-xl font-bold leading-none text-center" style={{ color: c.text }}>
        {value}
      </span>
    </div>
  );
}

function TotalLeadersCard({ label, value, sub }) {
  return (
    <div
      className="bg-white/10 rounded-2xl px-3 py-2.5 flex flex-col justify-between items-center overflow-hidden"
      style={{ height: "82px", boxSizing: "border-box" }}
    >
      <span className="text-sm text-white/60">{label}</span>
      <div className="flex flex-col items-center leading-tight">
        <span className="text-xl font-bold text-white">{value}</span>
        {sub && <span className="text-[11px] text-white/40">{sub}</span>}
      </div>
    </div>
  );
}

// ─── STATUT CONFIG ─────────────────────────────────────────────
function statutConfig(statutNorm, t) {
  switch (statutNorm) {
    case "intégré":
    case "integre": return { border: "border-emerald-500", badge: "green", label: t.integre };
    case "en attente": return { border: "border-white/20", badge: "gray", label: t.enAttente };
    case "refus": return { border: "border-red-500", badge: "red", label: t.refusLabel };
    case "en cours":
    case "en suivis": return { border: "border-amber-500", badge: "amber", label: t.enCours };
    default: return { border: "border-white/20", badge: "gray", label: formatStatut(statutNorm) };
  }
}

const AVATAR_COLORS = [
  { bg: "#dbeafe", color: "#1e40af" }, { bg: "#fce7f3", color: "#9d174d" },
  { bg: "#d1fae5", color: "#065f46" }, { bg: "#fef3c7", color: "#92400e" },
  { bg: "#ede9fe", color: "#5b21b6" }, { bg: "#fee2e2", color: "#991b1b" },
  { bg: "#e0f2fe", color: "#0c4a6e" }, { bg: "#fdf4ff", color: "#701a75" },
  { bg: "#f0fdf4", color: "#14532d" }, { bg: "#fff7ed", color: "#7c2d12" },
];

// ─── BLOC KPI ─────────────────────────────────────────────────
function BlocKpi({ kpis, totalAmes, t }) {
  const pct = (n) => totalAmes > 0 ? Math.round((n / totalAmes) * 100) : 0;

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiCard label={t.kpiEvangelises} value={kpis.totalEvangelises} sub={t.kpiEvangelisesSub} accent="blue" />
        <KpiCard label={t.kpiVenus} value={kpis.totalVenus} sub={t.kpiVenusSub} accent="purple" />
        <KpiCard label={t.kpiIntegres} value={kpis.totalIntegration} sub={t.kpiOfTotal(pct(kpis.totalIntegration))} accent="green" />
        <KpiCard label={t.kpiBaptemes} value={kpis.totalBapteme} sub={t.kpiOfTotal(pct(kpis.totalBapteme))} accent="indigo" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiCard label={t.kpiMinistere} value={kpis.totalMinistere} sub={t.kpiMinistereSub} accent="teal" />
        <KpiCard label={t.kpiEncours} value={kpis.totalEncours} sub={t.kpiEncoursSub} accent="amber" />
        <KpiCard label={t.kpiAttente} value={kpis.totalAttente} sub={t.kpiAttenteSub} accent="gray" />
        <KpiCard label={t.kpiRefus} value={kpis.totalRefus} sub={t.kpiOfTotal(pct(kpis.totalRefus))} accent="red" />
      </div>

      {totalAmes > 0 && (
        <div className="bg-white/10 rounded-2xl p-4 flex flex-col gap-3 mt-1">
          <SectionTitle>{t.funnelTitle}</SectionTitle>
          {[
            { label: t.funnelTotalAmes, val: totalAmes, color: "bg-blue-400" },
            { label: t.funnelIntegres, val: kpis.totalIntegration, color: "bg-emerald-400" },
            { label: t.funnelBaptises, val: kpis.totalBapteme, color: "bg-indigo-400" },
            { label: t.funnelMinistere, val: kpis.totalMinistere, color: "bg-pink-400" },
          ].map(({ label, val, color }) => (
            <div key={label} className="flex items-center gap-3">
              <p className="text-xs text-white/50 w-28 flex-shrink-0">{label}</p>
              <BarreProgression pct={Math.round((val / totalAmes) * 100)} color={color} />
              <span className="text-xs text-white font-semibold w-8 text-right">{val}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── BLOC PAR CELLULE ─────────────────────────────────────────
function BlocParCellule({ displayedReports, t }) {
  const parCellule = {};
  displayedReports.forEach(r => {
    const c = r.cellule_full || "Non assignée";
    if (!parCellule[c]) parCellule[c] = { total: 0, integres: 0, encours: 0, refus: 0 };
    parCellule[c].total++;
    const s = getStatutNormalise(r.statut);
    if (s === "integre" || s === "intégré") parCellule[c].integres++;
    else if (s === "en cours" || s === "en suivis") parCellule[c].encours++;
    else if (s === "refus") parCellule[c].refus++;
  });
  const max = Math.max(...Object.values(parCellule).map(v => v.total), 1);
  const lignes = Object.entries(parCellule).sort((a, b) => b[1].total - a[1].total);
  if (!lignes.length) return <p className="text-white/30 text-sm text-center py-4">{t.noData}</p>;

  return (
    <div className="flex flex-col gap-2">
      {lignes.map(([cellule, { total, integres, encours, refus }]) => (
        <div key={cellule} className="bg-white/10 rounded-xl px-4 py-3 flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <p className="text-sm text-white w-36 flex-shrink-0 truncate">{cellule}</p>
            <BarreProgression pct={(total / max) * 100} color="bg-blue-400" />
            <span className="text-sm font-bold text-white w-6 text-right">{total}</span>
          </div>
          <div className="flex gap-2 ml-36">
            <Badge color="green">✔ {integres}</Badge>
            <Badge color="amber">⏳ {encours}</Badge>
            <Badge color="red">✗ {refus}</Badge>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── BLOC PAR PILIER ─────────────────────────────────────────
function PilierCard({ membre, celluleNom, idx }) {
  const ac = AVATAR_COLORS[idx % AVATAR_COLORS.length];
  const initiales = `${(membre.prenom || "")[0] || ""}${(membre.nom || "")[0] || ""}`.toUpperCase();
  return (
    <div className="bg-white/10 rounded-xl px-4 py-3 flex items-center gap-3 hover:bg-white/15 transition-colors">
      <div className="w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-bold flex-shrink-0"
        style={{ background: ac.bg, color: ac.color }}>
        {initiales}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white truncate">{membre.prenom} {membre.nom}</p>
        <p className="text-[11px] text-white/50 truncate">{celluleNom}</p>
      </div>
    </div>
  );
}

function BlocPiliers({ piliers, cellulesMap, filterCellule, t, open, setOpen }) {
  const filtered = filterCellule
    ? piliers.filter(p => cellulesMap[p.cellule_id] === filterCellule)
    : piliers;

  return (
    <div className="rounded-xl overflow-hidden border border-white/10 bg-white/8">
      <div onClick={() => setOpen(!open)}
        className="px-4 py-3 flex items-center gap-3 cursor-pointer hover:bg-white/5 transition-colors">
        <span className="text-sm font-semibold text-white flex-1">{t.piliersLabel}</span>
        <span className="text-xl font-bold text-white">{filtered.length}</span>
        <svg className={`w-4 h-4 text-white/50 transition-transform flex-shrink-0 ${open ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      {open && (
        <div className="px-4 pb-3 border-t border-white/10 pt-2">
          {filtered.length === 0 ? (
            <p className="text-sm text-white/40 italic px-1">{t.pasDePilier}</p>
          ) : (
            <div className="flex flex-col gap-2">
              {filtered.map((m, idx) => (
                <PilierCard key={m.id} idx={idx} membre={m} celluleNom={cellulesMap[m.cellule_id] || "—"} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── STAGES CONFIG ──────────────────────────────────────────
const STAGES_ORDER = ["potentiel", "croissance", "developpement", "mature", "none"];
const STAGE_COLOR = { potentiel: "teal", croissance: "green", developpement: "blue", mature: "purple", none: "gray" };

// ─── SERVITEUR CARD ─────────────────────────────────────────
function ServiteurCard({ membre, sousTitre, idx = 0 }) {
  const ac = AVATAR_COLORS[idx % AVATAR_COLORS.length];
  const initiales = `${(membre.prenom || "")[0] || ""}${(membre.nom || "")[0] || ""}`.toUpperCase();
  return (
    <div className="bg-white/10 rounded-xl px-4 py-3 flex items-center gap-3 hover:bg-white/15 transition-colors">
      <div className="w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-bold flex-shrink-0"
        style={{ background: ac.bg, color: ac.color }}>
        {initiales}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white truncate">{membre.prenom} {membre.nom}</p>
        <p className="text-[11px] text-white/80 truncate">{sousTitre}</p>
      </div>
    </div>
  );
}

// ─── BLOC KPI LEADERS ───────────────────────────────────────
function BlocLeadersKpi({ leadersDeveloppement, totalMembres, t }) {
  const counts = { potentiel: 0, croissance: 0, developpement: 0, mature: 0, none: 0 };
  leadersDeveloppement.forEach(l => { counts[l.etape || "none"]++; });

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
      <TotalLeadersCard
        label={t.totalLeaders}
        value={leadersDeveloppement.length}
        sub={totalMembres > 0 ? `${Math.round((leadersDeveloppement.length / totalMembres) * 100)}% membres` : ""}
      />
      {STAGES_ORDER.filter(s => s !== "none").map(stage => (
        <LeaderStageCard
          key={stage}
          stage={stage}
          emoji={t.parcoursStages[stage].emoji}
          label={t.parcoursStages[stage].label}
          value={counts[stage]}
        />
      ))}
    </div>
  );
}

// ─── CLASSEMENT PAR ÉTAPE (accordéon) ────────────────────────
function BlocClassementLeaders({ leadersDeveloppement, openStages, setOpenStages, getAttachment, t }) {
  const grouped = {};
  STAGES_ORDER.forEach(s => { grouped[s] = []; });
  leadersDeveloppement.forEach(l => { grouped[l.etape || "none"].push(l); });

  return (
    <div className="flex flex-col gap-2">
      {STAGES_ORDER.map(stage => {
        const list = grouped[stage];
        const isOpen = openStages[stage];
        const label = stage === "none" ? t.aucuneEvaluation : t.parcoursStages[stage].label;
        const emoji = stage === "none" ? "❔" : t.parcoursStages[stage].emoji;
        return (
          <div key={stage} className="rounded-xl overflow-hidden border border-white/10 bg-white/8">
            <button onClick={() => setOpenStages(p => ({ ...p, [stage]: !p[stage] }))}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition text-left">
              <span className="text-sm font-semibold text-white flex items-center gap-2">
                <span>{emoji}</span>{label}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">{list.length}</span>
                <svg className={`w-4 h-4 text-white/50 transition-transform ${isOpen ? "rotate-180" : ""}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>
            {isOpen && (
              <div className="px-4 pb-3 border-t border-white/10 pt-2 flex flex-col gap-2">
                {list.length === 0 ? (
                  <p className="text-sm text-white/40 italic px-1">{t.pasDeLeader}</p>
                ) : (
                  list.map((l, idx) => {
                    const attach = getAttachment(l.membre);
                    return (
                      <ServiteurCard
                        key={l.membre.id}
                        idx={idx}
                        membre={l.membre}
                        sousTitre={attach ? `${attach.emoji} ${attach.label}` : undefined}
                      />
                    );
                  })
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── RÉPARTITION (cellule / famille) ─────────────────────────
function BlocRepartitionLeaders({ leadersDeveloppement, refList, idKey, labelKey, t }) {
  const map = {};
  leadersDeveloppement.forEach(l => {
    const fid = l.membre[idKey];
    if (!fid) return;
    map[fid] = (map[fid] || 0) + 1;
  });
  const lignes = Object.entries(map)
    .map(([id, count]) => ({
      id,
      nom: refList.find(x => x.id === id)?.[labelKey] || "—",
      count,
    }))
    .sort((a, b) => b.count - a.count);

  if (!lignes.length) return <p className="text-white/30 text-sm text-center py-4 px-4">{t.noData}</p>;
  const max = Math.max(...lignes.map(l => l.count), 1);

  return (
    <div className="flex flex-col gap-2 px-4">
      {lignes.map(({ id, nom, count }) => (
        <div key={id} className="bg-white/10 rounded-xl px-4 py-3 flex items-center gap-3">
          <p className="text-sm text-white w-36 flex-shrink-0 truncate">{nom}</p>
          <BarreProgression pct={(count / max) * 100} color="bg-blue-400" />
          <span className="text-sm font-bold text-white w-6 text-right">{count}</span>
        </div>
      ))}
    </div>
  );
}

// ─── CARTE LIGNE ──────────────────────────────────────────────
function CarteLigne({ r, onDetails, t }) {
  const [open, setOpen] = useState(false);
  const sn = getStatutNormalise(r.statut);
  const cfg = statutConfig(sn, t);

  return (
    <div className={`bg-white/10 rounded-xl overflow-hidden border-l-2 ${cfg.border}`}>
      <button onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition text-left gap-3">
        <div className="flex flex-col gap-0.5 flex-1 min-w-0">
          <span className="text-sm font-semibold text-white truncate">{r.nom_complet}</span>
          <span className="text-[11px] text-white/40">{r.type_evangelisation} · {formatDateFR(r.date_depart)}</span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Badge color={cfg.badge}>{cfg.label}</Badge>
          <span className="text-white/30 text-xs">{open ? "▲" : "▼"}</span>
        </div>
      </button>
      {open && (
        <div className="border-t border-white/10 px-4 pb-4 pt-3 flex flex-col gap-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              { label: t.cellule, value: r.cellule_full },
              { label: t.responsable, value: r.responsable },
              { label: t.assignedOn, value: formatDateFR(r.envoyer_au_suivi_le) },
              { label: t.dateEvolution, value: formatDateFR(r.date_integration) },
              { label: t.bapteme, value: formatDateFR(r.date_baptise) },
              { label: t.debutMinistere, value: formatDateFR(r.debut_ministere) },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white/5 rounded-xl px-3 py-2">
                <p className="text-[10px] text-white/40">{label}</p>
                <p className="text-sm text-white font-medium">{value || "—"}</p>
              </div>
            ))}
          </div>
          <button onClick={() => onDetails(r)}
            className="w-full py-2 rounded-xl bg-amber-500/30 hover:bg-amber-500/50 text-amber-300 text-sm font-semibold transition">
            {t.seeDetails}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── ONGLET PAR MOIS ──────────────────────────────────────────
function OngletParMois({ displayedReports, onDetails, t }) {
  const [expandedMonths, setExpandedMonths] = useState({});

  const grouped = {};
  displayedReports.forEach(r => {
    const d = new Date(r.date_depart);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (!grouped[key]) grouped[key] = { label: `${t.months[d.getMonth()]} ${d.getFullYear()}`, rows: [] };
    grouped[key].rows.push(r);
  });

  const sorted = Object.entries(grouped).sort((a, b) => {
    const [yA, mA] = a[0].split("-").map(Number);
    const [yB, mB] = b[0].split("-").map(Number);
    return new Date(yB, mB) - new Date(yA, mA);
  });

  if (!sorted.length) return <p className="text-white/30 text-sm text-center py-8">{t.noDataPeriod}</p>;

  return (
    <div className="flex flex-col gap-3">
      {sorted.map(([key, { label, rows }]) => {
        const isOpen = expandedMonths[key];
        const integres = rows.filter(r => ["integre","intégré"].includes(getStatutNormalise(r.statut))).length;
        return (
          <div key={key} className="bg-white/10 rounded-2xl overflow-hidden">
            <button onClick={() => setExpandedMonths(p => ({ ...p, [key]: !p[key] }))}
              className="w-full flex items-center justify-between px-4 py-4 hover:bg-white/5 transition text-left gap-3">
              <span className="font-semibold text-white">{label}</span>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Badge color="gray">{t.persons(rows.length)}</Badge>
                <Badge color="green">✔ {integres}</Badge>
                <span className="text-white/30 text-xs">{isOpen ? "▲" : "▼"}</span>
              </div>
            </button>
            {isOpen && (
              <div className="border-t border-white/10 px-4 pb-4 pt-3 flex flex-col gap-2">
                {rows.map((r, i) => <CarteLigne key={i} r={r} onDetails={onDetails} t={t} />)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── ONGLET PAR CELLULE DÉTAIL ────────────────────────────────
function OngletParCelluleDetail({ displayedReports, onDetails, t }) {
  const [expandedCellules, setExpandedCellules] = useState({});

  const grouped = {};
  displayedReports.forEach(r => {
    const c = r.cellule_full || "Non assignée";
    if (!grouped[c]) grouped[c] = { rows: [], responsable: r.responsable || "—" };
    grouped[c].rows.push(r);
  });

  const sorted = Object.entries(grouped).sort((a, b) => b[1].rows.length - a[1].rows.length);
  if (!sorted.length) return <p className="text-white/30 text-sm text-center py-8">{t.noDataCellule}</p>;

  return (
    <div className="flex flex-col gap-3">
      {sorted.map(([cellule, { rows, responsable }]) => {
        const isOpen = expandedCellules[cellule];
        const integres = rows.filter(r => ["integre","intégré"].includes(getStatutNormalise(r.statut))).length;
        const encours = rows.filter(r => ["en cours","en suivis"].includes(getStatutNormalise(r.statut))).length;
        const refus = rows.filter(r => getStatutNormalise(r.statut) === "refus").length;
        const baptises = rows.filter(r => r.date_baptise).length;
        const ministeres = rows.filter(r => r.debut_ministere).length;
        const pctInt = rows.length > 0 ? Math.round((integres / rows.length) * 100) : 0;

        return (
          <div key={cellule} className="bg-white/10 rounded-2xl overflow-hidden">
            <button onClick={() => setExpandedCellules(p => ({ ...p, [cellule]: !p[cellule] }))}
              className="w-full flex items-center justify-between px-4 py-4 hover:bg-white/5 transition text-left gap-3">
              <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                <span className="font-semibold text-white truncate">{cellule}</span>
                <span className="text-[11px] text-white/40">
                  {responsable} · {t.persons(rows.length)} · {t.integrated(pctInt)}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Badge color="green">✔ {integres}</Badge>
                <Badge color="amber">⏳ {encours}</Badge>
                <Badge color="red">✗ {refus}</Badge>
                <span className="text-white/30 text-xs">{isOpen ? "▲" : "▼"}</span>
              </div>
            </button>
            {isOpen && (
              <div className="border-t border-white/10 px-4 pb-4 pt-3 flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <BarreProgression pct={pctInt} color="bg-emerald-400" />
                  <span className="text-xs text-white/50">{t.integrated(pctInt)}</span>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: t.baptises, val: baptises, color: "text-indigo-300" },
                    { label: t.ministere, val: ministeres, color: "text-pink-300" },
                    { label: t.encours, val: encours, color: "text-amber-300" },
                    { label: t.refus, val: refus, color: "text-red-300" },
                  ].map(({ label, val, color }) => (
                    <div key={label} className="bg-white/5 rounded-xl px-3 py-2 text-center">
                      <p className={`text-sm font-bold ${color}`}>{val}</p>
                      <p className="text-[10px] text-white/40">{label}</p>
                    </div>
                  ))}
                </div>

                {rows.map((r, i) => <CarteLigne key={i} r={r} onDetails={onDetails} t={t} />)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── PAGE PRINCIPALE ───────────────────────────────────────────
function EtatCellule() {
  const { lang } = useLang();
  const t = translations[lang];
  const router = useRouter();

  const [reports, setReports] = useState([]);
  const [allReports, setAllReports] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  const [modePerso, setModePerso] = useState(false);
  const [filtrePeriode, setFiltrePeriode] = useState("30");
  const [filterDebut, setFilterDebut] = useState("");
  const [filterFin, setFilterFin] = useState("");
  const [filterCellule, setFilterCellule] = useState("");
  const [availableCellules, setAvailableCellules] = useState([]);

  const [onglet, setOnglet] = useState("kpi");

  const [selectedMember, setSelectedMember] = useState(null);
  const [editMember, setEditMember] = useState(null);
  const [selectedEvangelise, setSelectedEvangelise] = useState(null);

  const [piliers, setPiliers] = useState([]);
  const [cellulesMap, setCellulesMap] = useState({});
  const [openPiliers, setOpenPiliers] = useState(false);

  // ── Leaders en développement ──
  const [leadersDeveloppement, setLeadersDeveloppement] = useState([]);
  const [openStages, setOpenStages] = useState({});
  const [cellules, setCellules] = useState([]);
  const [familles, setFamilles] = useState([]);

  const cellulesActive = useFeature("cellules");
  const famillesActive = useFeature("familles");

  const [kpis, setKpis] = useState({
    totalEvangelises: 0, totalVenus: 0, totalIntegration: 0,
    totalBapteme: 0, totalMinistere: 0, totalRefus: 0,
    totalEncours: 0, totalAttente: 0,
  });

  // ─── Utilisateur ───
  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (data) setUserProfile(data);
    };
    fetchProfile();
  }, []);

  // ─── Cellules / Familles (pour affichage des noms des leaders) ───
  useEffect(() => {
    if (!userProfile) return;
    const loadCellulesFamilles = async () => {
      if (cellulesActive) {
        const { data } = await supabase
          .from("cellules")
          .select("id, cellule_full")
          .eq("eglise_id", userProfile.eglise_id);
        setCellules(data || []);
      }
      if (famillesActive) {
        const { data } = await supabase
          .from("familles")
          .select("id, famille_full")
          .eq("eglise_id", userProfile.eglise_id);
        setFamilles(data || []);
      }
    };
    loadCellulesFamilles();
  }, [userProfile, cellulesActive, famillesActive]);

  // ─── Rapports (évangélisation / cellules) ───
  const fetchReports = async (overrideModePerso = null) => {
    if (!userProfile) return;
    setLoading(true);
    const isPerso = overrideModePerso !== null ? overrideModePerso : modePerso;

    const isAdmin        = userProfile.roles?.includes("Administrateur") || userProfile.roles?.includes("Superadmin");
    const isSuperviseur  = userProfile.roles?.includes("SuperviseurCellule");
    const isResponsable  = userProfile.roles?.includes("ResponsableCellule");

    let scopeCelluleIds = null; // null = pas de restriction (admin/superviseur)

    try {
      let query = supabase
        .from("vue_flow_personnes")
        .select("*")
        .eq("eglise_id", userProfile.eglise_id)
        .order("date_depart", { ascending: false });

      if (isAdmin) {
        // pas de filtre
      } else if (isSuperviseur) {
        // pas de filtre
      } else if (isResponsable) {
        const { data: mesCellules } = await supabase
          .from("cellules").select("id")
          .eq("responsable_id", userProfile.id)
          .eq("eglise_id", userProfile.eglise_id);
        const mesIds = (mesCellules || []).map(c => c.id);

        const { data: filles } = await supabase
          .from("cellules").select("id")
          .eq("cellule_mere_id", userProfile.id)
          .eq("eglise_id", userProfile.eglise_id);
        const fillesIds = (filles || []).map(c => c.id);

        scopeCelluleIds = [...new Set([...mesIds, ...fillesIds])];

        if (scopeCelluleIds.length > 0) {
          query = query.in("cellule_id", scopeCelluleIds);
        } else {
          query = query.eq("cellule_id", "00000000-0000-0000-0000-000000000000");
        }
      } else {
        setReports([]); setAllReports([]); setPiliers([]);
        setLoading(false);
        return;
      }

      const { data, error } = await query;
      if (error) throw error;

      let filtered = data || [];
      if (isPerso) {
        if (filterDebut) filtered = filtered.filter(r => new Date(r.date_depart) >= new Date(filterDebut));
        if (filterFin)   filtered = filtered.filter(r => new Date(r.date_depart) <= new Date(filterFin));
      } else {
        const depuis = new Date();
        depuis.setDate(depuis.getDate() - Number(filtrePeriode));
        filtered = filtered.filter(r => new Date(r.date_depart) >= depuis);
      }

      setAllReports(filtered);
      setReports(filtered);
      setAvailableCellules([...new Set(filtered.map(r => r.cellule_full).filter(Boolean))].sort());
      setFilterCellule("");
      updateKpis(filtered);

      // ── Piliers (indépendant de la période, état actuel) ──
      let pilierQuery = supabase
        .from("membres_complets")
        .select("id, nom, prenom, cellule_id")
        .eq("eglise_id", userProfile.eglise_id)
        .eq("pilier", true)
        .not("cellule_id", "is", null); // ← uniquement les piliers rattachés à une cellule

      if (scopeCelluleIds !== null) {
        if (scopeCelluleIds.length > 0) pilierQuery = pilierQuery.in("cellule_id", scopeCelluleIds);
        else pilierQuery = pilierQuery.eq("cellule_id", "00000000-0000-0000-0000-000000000000");
      }

      const [{ data: pilierData }, { data: cellulesData }] = await Promise.all([
        pilierQuery,
        supabase.from("cellules").select("id, nom").eq("eglise_id", userProfile.eglise_id),
      ]);

      const cMap = {};
      (cellulesData || []).forEach(c => { cMap[c.id] = c.nom; });
      setCellulesMap(cMap);
      setPiliers(pilierData || []);

    } catch (err) {
      console.error("Erreur fetch:", err);
      setReports([]); setAllReports([]); setPiliers([]);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (userProfile && !modePerso) fetchReports(false);
  }, [userProfile, filtrePeriode, modePerso]);

  const displayedReports = filterCellule
    ? allReports.filter(r => r.cellule_full === filterCellule)
    : allReports;

  const updateKpis = (filtered) => {
    const normalize = (text) =>
      text?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") || "";

    setKpis({
      totalEvangelises: filtered.filter(r =>
        ["individuel","sortie de groupe","campagne d'evangelisation","evangelisation de rue","evangelisation maison","evangelisation stade","evangelisation"]
          .some(t => normalize(r.type_evangelisation).includes(normalize(t)))
      ).length,
      totalVenus: filtered.filter(r => normalize(r.type_evangelisation).includes("integration")).length,
      totalIntegration: filtered.filter(r => normalize(r.statut) === "integre").length,
      totalBapteme: filtered.filter(r => r.date_baptise).length,
      totalMinistere: filtered.filter(r => r.debut_ministere).length,
      totalRefus: filtered.filter(r => normalize(r.statut) === "refus").length,
      totalEncours: filtered.filter(r => normalize(r.statut).includes("cours")).length,
      totalAttente: filtered.filter(r => {
        const s = normalize(r.statut);
        return s.includes("attente") || s.includes("envoye");
      }).length,
    });
  };

  useEffect(() => {
    updateKpis(displayedReports);
  }, [filterCellule, allReports]);

  const handleDetailsClick = async (row) => {
    setSelectedEvangelise(row);
  };

  // ─── Leaders en développement — fetch ───
  const fetchLeadersDeveloppement = async () => {
    if (!userProfile) return;
    try {
      const { data: membresData, error } = await supabase
        .from("membres_complets")
        .select("id, nom, prenom, leader_developpement, cellule_id, famille_id")
        .eq("eglise_id", userProfile.eglise_id)
        .eq("leader_developpement", true);

      if (error) throw error;

      const leadersMembres = membresData || [];
      const leaderIds = leadersMembres.map(m => m.id);

      const evalsMap = {};
      if (leaderIds.length > 0) {
        const { data: evalsLeader } = await supabase
          .from("evaluations_leader")
          .select("membre_id, parcours_etape, date_action")
          .in("membre_id", leaderIds)
          .order("date_action", { ascending: false });

        (evalsLeader || []).forEach(e => {
          if (!evalsMap[e.membre_id]) evalsMap[e.membre_id] = e.parcours_etape;
        });
      }

      setLeadersDeveloppement(
        leadersMembres.map(m => ({
          membre: m,
          etape: evalsMap[m.id] || null,
        }))
      );
    } catch (err) {
      console.error("Erreur fetch leaders développement:", err);
      setLeadersDeveloppement([]);
    }
  };

  useEffect(() => {
    if (userProfile) fetchLeadersDeveloppement();
  }, [userProfile]);

  // ─── Leaders en développement — uniquement ceux rattachés à une cellule ───
  const leadersDeveloppementAvecCellule = leadersDeveloppement.filter(l => l.membre.cellule_id);

  // ─── Leaders en développement — attachement (uniquement cellule sur cette page) ───
  const getLeaderAttachment = (membre) => {
    if (!membre.cellule_id) return { emoji: "🏠", label: t.sansCellule };
    const c = cellules.find(c => c.id === membre.cellule_id);
    return { emoji: "🏠", label: c?.cellule_full || "—" };
  };

  const hasData = allReports.length > 0;
  const totalAmes = kpis.totalEvangelises + kpis.totalVenus;

  const onglets = [
    { key: "kpi", label: t.tabOverview },
    { key: "cellules", label: t.tabCellules },
    { key: "mois", label: t.tabMois },
    { key: "leaders", label: t.tabLeaders },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center p-4 sm:p-6" style={{ background: "#333699" }}>
      <HeaderPages />

      <div className="w-full max-w-2xl mt-6 flex flex-col gap-5 mb-10">

        {/* En-tête */}
        <div className="text-center">
          <h1 className="text-2xl font-bold mt-4 mb-2 text-blue-300 text-center text-white">
            {t.pageTitle} <span className="text-emerald-300">{t.pageTitleHighlight}</span>
          </h1>
          <p className="italic text-base text-white/90">
            <span className="text-blue-300 font-semibold">{t.subtitle1}</span>{" "}
            {t.subtitle2} <span className="text-blue-300 font-semibold">{t.subtitle3}</span>
            {t.subtitle4}{" "}
            <span className="text-blue-300 font-semibold">{t.subtitle5}</span>
            {t.subtitle6} <span className="text-blue-300 font-semibold">{t.subtitle7}</span>.
          </p>
        </div>

        {/* Filtres */}
        <div className="bg-white/10 rounded-2xl p-4 flex flex-col gap-3">
          {/* Toggle mode */}
          <div className="flex gap-1 bg-white/10 rounded-xl p-1 w-fit">
            <button onClick={() => setModePerso(false)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${!modePerso ? "bg-white text-[#333699]" : "text-white/50 hover:text-white/80"}`}>
              {t.quickPeriod}
            </button>
            <button onClick={() => setModePerso(true)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${modePerso ? "bg-white text-[#333699]" : "text-white/50 hover:text-white/80"}`}>
              {t.dateRange}
            </button>
          </div>

          {/* Période rapide */}
          {!modePerso && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-white/50 flex-shrink-0">{t.periodLabel}</span>
              {t.periods.map(p => (
                <button key={p.val} onClick={() => setFiltrePeriode(p.val)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition ${filtrePeriode === p.val ? "bg-white text-[#333699]" : "bg-white/15 text-white/70 hover:bg-white/20"}`}>
                  {p.label}
                </button>
              ))}
            </div>
          )}

          {/* Tranche personnalisée */}
          {modePerso && (
            <div className="flex flex-col gap-2">
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-white/50">{t.startDate}</label>
                  <input type="date" value={filterDebut} onChange={e => setFilterDebut(e.target.value)}
                    className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-white/40" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-white/50">{t.endDate}</label>
                  <input type="date" value={filterFin} onChange={e => setFilterFin(e.target.value)}
                    className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-white/40" />
                </div>
              </div>
              <button onClick={() => fetchReports(true)}
                className="w-full py-2 rounded-xl bg-amber-500/80 hover:bg-amber-500 text-white text-sm font-semibold transition active:scale-95">
                {t.generateReport}
              </button>
            </div>
          )}

          {/* Filtre cellule */}
          {hasData && availableCellules.length > 1 && (
            <div className="flex flex-col gap-1">
              <label className="text-xs text-white/50">{t.celluleLabel}</label>
              <select value={filterCellule} onChange={e => setFilterCellule(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-white/40 appearance-none cursor-pointer">
                <option value="" className="bg-[#2a2d80]">{t.allCellules}</option>
                {availableCellules.map((c, i) => (
                  <option key={i} value={c} className="bg-[#2a2d80]">{c}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Onglets */}
        <div className="flex gap-1 bg-white/10 rounded-xl p-1">
          {onglets.map(o => (
            <button key={o.key} onClick={() => setOnglet(o.key)}
              className={`flex-1 py-2 px-2 rounded-lg text-sm font-semibold transition whitespace-nowrap ${onglet === o.key ? "bg-white text-[#333699]" : "text-white/50 hover:text-white/80"}`}>
              {o.label}
            </button>
          ))}
        </div>

        {/* Contenu */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
          </div>
        ) : onglet === "leaders" ? (
          /* ══════════════════════════════════════════
             ONGLET — LEADERS EN DÉVELOPPEMENT
             (indépendant de hasData : il a son propre fetch)
             → n'affiche que les leaders rattachés à une cellule
          ══════════════════════════════════════════ */
          <div className="flex flex-col gap-7">
            <div>
              <SectionTitle>{t.leadersEnDeveloppement}</SectionTitle>
              <BlocLeadersKpi leadersDeveloppement={leadersDeveloppementAvecCellule} t={t} />
            </div>

            <div>
              <SectionTitle>{t.ongletLeaders}</SectionTitle>
              <BlocClassementLeaders
                leadersDeveloppement={leadersDeveloppementAvecCellule}
                openStages={openStages}
                setOpenStages={setOpenStages}
                getAttachment={getLeaderAttachment}
                t={t}
              />
            </div>

            {cellulesActive && (
              <div>
                <SectionTitle
                  icon="🏠"
                  total={leadersDeveloppementAvecCellule.length}
                  className="px-8"
                >
                  {t.repartitionParCellule}
                </SectionTitle>
                <BlocRepartitionLeaders
                  leadersDeveloppement={leadersDeveloppementAvecCellule}
                  refList={cellules}
                  idKey="cellule_id"
                  labelKey="cellule_full"
                  t={t}
                />
              </div>
            )}
          </div>
        ) : !hasData ? (
          <div className="bg-white/10 rounded-2xl p-8 text-center text-white/40 text-sm">
            {modePerso ? t.emptyPerso : t.emptyPeriod}
          </div>
        ) : onglet === "kpi" ? (
          <div className="flex flex-col gap-7">
            <div>
              <SectionTitle>{t.sectionOverview}</SectionTitle>
              <BlocKpi kpis={kpis} totalAmes={totalAmes} t={t} />
            </div>
            <div>
              <SectionTitle>{t.sectionPerformance}</SectionTitle>
              <BlocParCellule displayedReports={displayedReports} t={t} />
            </div>
            <div>
              <SectionTitle>{t.piliersLabel}</SectionTitle>
              <BlocPiliers
                piliers={piliers}
                cellulesMap={cellulesMap}
                filterCellule={filterCellule}
                t={t}
                open={openPiliers}
                setOpen={setOpenPiliers}
              />
            </div>
          </div>
        ) : onglet === "cellules" ? (
          <OngletParCelluleDetail displayedReports={displayedReports} onDetails={handleDetailsClick} t={t} />
        ) : (
          <OngletParMois displayedReports={displayedReports} onDetails={handleDetailsClick} t={t} />
        )}

      </div>

      {/* Popups */}
      {selectedEvangelise && (
        <DetailsEtatConseillerPopup
          member={selectedEvangelise}
          onClose={() => setSelectedEvangelise(null)}
          onUpdate={(id, updates) => {
            setAllReports(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
            setReports(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
          }}
        />
      )}
      {selectedMember && (
        <DetailsEtatConsEvangePopup
          member={selectedMember}
          onClose={() => setSelectedMember(null)}
          onEdit={(member) => setEditMember(member)}
        />
      )}
      {editMember && (
        <EditMemberCellulePopup
          member={editMember}
          onClose={() => setEditMember(null)}
        />
      )}

      <Footer />
    </div>
  );
}
