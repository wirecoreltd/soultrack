"use client";

import { useState, useEffect } from "react";
import supabase from "../../lib/supabaseClient";
import HeaderPages from "../../components/HeaderPages";
import ProtectedRoute from "../../components/ProtectedRoute";
import Footer from "../../components/Footer";
import { useLang } from "../../hooks/useLang";

const translations = {
  fr: {
    titreRapport: "Rapport",
    titreAccent: "Statistiques Globales",
    intro: "Pilotez votre assemblée avec une vision",
    introAccent1: "globale et structurée",
    intro2: ". Gardez une vue d'ensemble sur les églises sous votre",
    introAccent2: "supervision",
    intro3: ", suivez les",
    introAccent3: "indicateurs clés",
    intro4: "et accompagnez le",
    introAccent4: "développement",
    intro5: "de chaque communauté.",
    parametres: "Paramètres du rapport",
    periodeRapide: "Période rapide",
    trancheDates: "Tranche de dates",
    periode: "Période :",
    periodes: [
      { label: "7 j", val: "7" },
      { label: "30 j", val: "30" },
      { label: "90 j", val: "90" },
      { label: "6 mois", val: "180" },
      { label: "1 an", val: "365" },
    ],
    dateDebut: "Date de début",
    dateFin: "Date de fin",
    generer: "Générer le rapport",
    generation: "Génération…",
    ongletEnsemble: "Vue d'ensemble",
    ongletEglises: "Par église",
    placeholder: "Choisissez une période et cliquez sur « Générer le rapport »",
    synthese: "Synthèse du réseau",
    eglise: "église",
    eglises: "églises",
    affichee: "affichée",
    affichees: "affichées",
    filtrerEglise: "Filtrer par église",
    toutesEglises: "Toutes les églises",
    rechercherEglise: "Rechercher une église…",
    besoinPrincipal: "Besoin principal",
    aucunBesoin: "Aucun besoin",
    superviseePar: "Supervisée par",
    egliseSuperviseure: "Église superviseure",
    triAlphabetique: "Trier : Alphabétique",
    triParticipation: "Trier : Participation",
    voirDetail: "Voir le détail complet",
    voirMoins: "Réduire",
    kpiEglisesSup: "Églises supervisées",
    kpiEglisesSubSup: "dans le réseau",
    kpiMembresActifs: "Membres actifs",
    kpiMembresActifsSub: "de votre église",
    kpiTauxPresence: "Taux de présence",
    kpiTauxPresenceSub: "moyenne par culte",
    kpiTotalCulte: "Participation totale aux services",
    kpiTotalCulteSub: "H+F+J+Enf+Conn.",
    kpiMoyParEglise: "Moy. par église",
    kpiMoyParEgliseSub: "présences/église",
    kpiCellules: "Cellules actives",
    kpiCellulesSub: "avec ≥1 membre actif",
    kpiEvangelises: "Évangélisés",
    kpiEvangelisesSub: "âmes touchées",
    kpiBaptemes: "Baptêmes",
    kpiBaptemesSub: "cette période",
    kpiTauxConversion: "Taux conversion",
    kpiTauxConversionSub: "conversions / présences culte",
    kpiFamillesActives: "Familles actives",
    kpiFamillesActivesSub: "avec ≥1 membre actif",
    kpiPiliers: "Piliers",
    kpiPiliersSub: "Église",
    leadersTitle: "Leaders en développement",
    leadersPotentiel: "Potentiel identifié",
    leadersCroissance: "Serviteur fidèle",
    leadersDeveloppement: "Leader en croissance",
    leadersMature: "Leader confirmé",
    leadersSansEvaluation: "Sans évaluation",
    sectionConversions: "Conversions (prière du salut)",
    conversionsSourceEglise: "Âmes accueillies à l'église",
    conversionsSourceEvang: "Âmes rencontrées en évangélisation",
    chipNouveauxConvertis: "Nouveaux convertis",
    chipReconciliations: "Réconciliations",
    conversionsTotal: "Total conversions",
    kpiServiteurs: "Serviteurs",
    kpiServiteursSubFn: (pct) => `${pct}% des membres`,
    vsPeriodePrecedente: "vs période préc.",
    repartitionTitle: "H / F / J (Participation Services)",
    hommes: "Hommes",
    femmes: "Femmes",
    jeunes: "Jeunes",
    entonnoirTitle: "Entonnoir de croissance (réseau)",
    entonnoirReseau: "Entonnoir",
    presencesCulte: "Présences culte",
    evangelises: "Évangélisés",
    baptises: "Baptisés",
    serviteurs: "Serviteurs",
    top5Title: "🆘 Top besoins",
    top5Cas: (n) => `${n} cas`,
    top5Resolus: (pct) => `${pct}% résolus`,
    besoinPlusFrequentFn: (b) => `Besoin dominant : ${b}`,
    totalGeneralFn: (nom) => `Total général ${nom}`,
    totalProprefn: (nom) => `Total ${nom}`,
    classementTitle: "Classement des églises (présences culte)",
    egliseBadgeFn: (n) => `${n} église${n > 1 ? "s" : ""}`,
    totalGeneral: "Total général",
    culte: "Culte",
    formation: "Formation",
    bapteme: "Baptême",
    evangelisation: "Évangélisation",
    serviteursRow: "Serviteurs",
    entonnoir: "Entonnoir",
    chipHommes: "Hommes",
    chipFemmes: "Femmes",
    chipJeunes: "Jeunes",
    chipTotalHFJ: "Total H+F+J",
    chipEnfants: "Enfants",
    chipConnectes: "Connectés",
    chipNvVenus: "Nv Venus",
    chipNvConvertis: "Nv Convertis",
    chipMoissonneurs: "Moissonneurs",
    chipTotalGlobal: "Total Global",
    chipTotal: "Total",
    chipPriere: "Prière",
    chipReconciliation: "Réconciliation",
    totalPresences: "total présences",
    amesTouchees: "âmes touchées",
    cettePeriode: "cette période",
    cellulesActives: "cellules actives",
  },
  en: {
    titreRapport: "Report",
    titreAccent: "Global Statistics",
    intro: "Manage your assembly with a",
    introAccent1: "global and structured view",
    intro2: ". Keep an overview of the churches under your",
    introAccent2: "supervision",
    intro3: ", track",
    introAccent3: "key indicators",
    intro4: "and support the",
    introAccent4: "development",
    intro5: "of each community.",
    parametres: "Report parameters",
    periodeRapide: "Quick period",
    trancheDates: "Date range",
    periode: "Period:",
    periodes: [
      { label: "7 d", val: "7" },
      { label: "30 d", val: "30" },
      { label: "90 d", val: "90" },
      { label: "6 mo", val: "180" },
      { label: "1 yr", val: "365" },
    ],
    dateDebut: "Start date",
    dateFin: "End date",
    generer: "Generate report",
    generation: "Generating…",
    ongletEnsemble: "Overview",
    ongletEglises: "By church",
    placeholder: "Choose a period and click « Generate report »",
    synthese: "Network summary",
    eglise: "church",
    eglises: "churches",
    affichee: "displayed",
    affichees: "displayed",
    filtrerEglise: "Filter by church",
    toutesEglises: "All churches",
    rechercherEglise: "Search a church…",
    besoinPrincipal: "Top need",
    aucunBesoin: "No need",
    superviseePar: "Supervised by",
    egliseSuperviseure: "Supervising church",
    triAlphabetique: "Sort: Alphabetical",
    triParticipation: "Sort: Attendance",
    voirDetail: "View full detail",
    voirMoins: "Collapse",
    kpiEglisesSup: "Supervised churches",
    kpiEglisesSubSup: "in the network",
    kpiMembresActifs: "Active members",
    kpiMembresActifsSub: "in your church",
    kpiTauxPresence: "Attendance rate",
    kpiTauxPresenceSub: "average per service",
    kpiTotalCulte: "Total Service Attendance",
    kpiTotalCulteSub: "M+F+Y+Ch+Online",
    kpiMoyParEglise: "Avg. per church",
    kpiMoyParEgliseSub: "attendance/church",
    kpiCellules: "Active cell groups",
    kpiCellulesSub: "with ≥1 active member",
    kpiEvangelises: "Evangelized",
    kpiEvangelisesSub: "souls reached",
    kpiBaptemes: "Baptisms",
    kpiBaptemesSub: "this period",
    kpiTauxConversion: "Conversion rate",
    kpiTauxConversionSub: "conversions / worship attendance",
    sectionConversions: "Conversions (salvation prayer)",
    conversionsSourceEglise: "Souls welcomed at church",
    conversionsSourceEvang: "Souls reached through outreach",
    chipNouveauxConvertis: "New converts",
    chipReconciliations: "Reconciliations",
    conversionsTotal: "Total conversions",
    kpiServiteurs: "Servants",
    kpiServiteursSubFn: (pct) => `${pct}% of members`,
    kpiFamillesActives: "Active families",
    kpiFamillesActivesSub: "with ≥1 active member",
    kpiPiliers: "Pillars",
    kpiPiliersSub: "Chruch",
    leadersTitle: "Emerging leaders",
    leadersPotentiel: "Potential identified",
    leadersCroissance: "Faithful Servant",
    leadersDeveloppement: "Growing leader",
    leadersMature: "Established Leader",
    leadersSansEvaluation: "No evaluation",
    vsPeriodePrecedente: "vs prev. period",
    repartitionTitle: "M / F / Y Attendance Breakdown",
    hommes: "Men",
    femmes: "Women",
    jeunes: "Youth",
    entonnoirTitle: "Growth funnel (network)",
    entonnoirReseau: "Funnel",
    presencesCulte: "Worship attendance",
    evangelises: "Evangelized",
    baptises: "Baptized",
    serviteurs: "Servants",
    top5Title: "🆘 Top needs",
    top5Cas: (n) => `${n} cases`,
    top5Resolus: (pct) => `${pct}% resolved`,
    besoinPlusFrequentFn: (b) => `Top need: ${b}`,
    totalGeneralFn: (nom) => `Overall total ${nom}`,
    totalProprefn: (nom) => `Total ${nom}`,
    classementTitle: "Church ranking (worship attendance)",
    egliseBadgeFn: (n) => `${n} church${n > 1 ? "es" : ""}`,
    totalGeneral: "Overall total",
    culte: "Worship",
    formation: "Training",
    bapteme: "Baptism",
    evangelisation: "Evangelization",
    serviteursRow: "Servants",
    entonnoir: "Funnel",
    chipHommes: "Men",
    chipFemmes: "Women",
    chipJeunes: "Youth",
    chipTotalHFJ: "Total M+F+Y",
    chipEnfants: "Children",
    chipConnectes: "Online",
    chipNvVenus: "New Visitors",
    chipNvConvertis: "New Converts",
    chipMoissonneurs: "Reapers",
    chipTotalGlobal: "Global Total",
    chipTotal: "Total",
    chipPriere: "Prayer",
    chipReconciliation: "Reconciliation",
    totalPresences: "total attendance",
    amesTouchees: "souls reached",
    cettePeriode: "this period",
    cellulesActives: "active cell groups",
  },
};

export default function StatGlobalPageWrapper() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur", "Responsable"]}>
      <StatGlobalPage />
    </ProtectedRoute>
  );
}

// ─── HELPERS ──────────────────────────────────────────────────
function calcDelta(current, previous) {
  if (!previous || previous === 0) return null;
  return Math.round(((current - previous) / previous) * 100);
}

// Total culte "global" (H+F+J+Enfants+Connectés) d'une église, à partir de
// son objet stats. Centralisé ici pour éviter les recalculs dispersés.
function culteGlobalDe(eglise) {
  const c = eglise.stats.culte;
  return c.hommes + c.femmes + c.jeunes + c.enfants + c.connectes;
}

// ─── FORMAT NOM / DÉNOMINATION DES ÉGLISES ─────────────────────
function abbreviateDenomination(denomination) {
  if (!denomination) return "";
  const mots = denomination.trim().split(/\s+/).filter(Boolean);
  if (mots.length <= 1) return mots[0] || "";
  return mots.map((m) => m[0].toUpperCase()).join("");
}

function formatEgliseTitre(eglise) {
  if (!eglise) return "";
  const parts = [eglise.denomination, eglise.ville, eglise.pays].filter(Boolean);
  return parts.length > 0 ? parts.join(" - ") : (eglise.nom || "");
}

function formatSupervisionLabel(parentEglise) {
  if (!parentEglise) return null;
  const abbrev = abbreviateDenomination(parentEglise.denomination);
  const parts = [abbrev, parentEglise.ville, parentEglise.pays].filter(Boolean);
  return parts.length > 0 ? parts.join(" - ") : (parentEglise.nom || null);
}

// ─── ARBRE : parent + regroupement enfants (partagé hiérarchie / totaux) ──
function getParentEgliseId(e) {
  return (
    e.parent_eglise_id ??
    e.parent_id ??
    e.eglise_mere_id ??
    e.eglise_parent_id ??
    e.superviseur_id ??
    null
  );
}

// Construit une map { parentId -> [enfants] } sur l'ensemble du réseau
// (rootId inclus comme parent racine par défaut si aucun parent résolu).
function buildChildrenMap(eglises, rootId) {
  const byId = {};
  eglises.forEach((e) => {
    byId[e.id] = e;
  });
  const childrenMap = {};
  eglises.forEach((e) => {
    if (e.id === rootId) return;
    const pid = getParentEgliseId(e);
    const parentKey = pid && byId[pid] ? pid : rootId;
    if (!childrenMap[parentKey]) childrenMap[parentKey] = [];
    childrenMap[parentKey].push(e);
  });
  return childrenMap;
}

// ── Totaux "par parent" (une église + toutes ses églises filles, en
// cascade) pour les indicateurs globaux de la carte compacte : Membres
// actifs, Cellules actives, Serviteurs, Leaders, Évangélisés. Les besoins
// (point 6) restent volontairement EXCLUS de cette agrégation : ils
// continuent à être affichés uniquement au niveau de l'église elle-même. ──
function computeSubtreeTotals(eglise, childrenMap, membresActifsParEglise, leadersStatsParEglise) {
  const stats = eglise.stats;
  let totals = {
    membresActifs: membresActifsParEglise[eglise.id] || 0,
    cellules: stats.cellules.total,
    serviteurs: stats.serviteurs.hommes + stats.serviteurs.femmes,
    evangelises: stats.evangelisation.hommes + stats.evangelisation.femmes,
    leadersTotal: leadersStatsParEglise[eglise.id]?.total || 0,
  };

  const enfants = childrenMap[eglise.id] || [];
  enfants.forEach((enfant) => {
    const t = computeSubtreeTotals(enfant, childrenMap, membresActifsParEglise, leadersStatsParEglise);
    totals.membresActifs += t.membresActifs;
    totals.cellules += t.cellules;
    totals.serviteurs += t.serviteurs;
    totals.evangelises += t.evangelises;
    totals.leadersTotal += t.leadersTotal;
  });

  return totals;
}

// ─── UI ATOMS ─────────────────────────────────────────────────
function SectionTitle({ children }) {
  return (
    <p className="text-sm font-semibold tracking-widest text-white mb-3">
      {children}
    </p>
  );
}

function KpiCard({ label, value, sub, accent, delta }) {
  const c = {
    green: "text-emerald-400",
    red: "text-red-400",
    amber: "text-amber-400",
    white: "text-white",
    blue: "text-blue-300",
    pink: "text-pink-300",
    purple: "text-purple-300",
    teal: "text-teal-300",
    orange: "text-orange-300",
    gray: "text-white/70",
    indigo: "text-indigo-300",
    yellow: "text-yellow-300",
  };
  return (
    <div className="bg-white/10 rounded-2xl px-4 py-4 flex flex-col gap-1">
      <p className="text-sm text-white">{label}</p>
      <p className={`text-lg font-bold leading-none ${c[accent] || "text-white"}`}>{value}</p>
      {sub && <p className="text-xs text-white mt-0.5">{sub}</p>}
      {delta !== null && delta !== undefined && (
        <p
          className={`text-sm font-semibold mt-0.5 ${
            delta > 0 ? "text-emerald-400" : delta < 0 ? "text-red-400" : "text-white/70"
          }`}
        >
          {delta > 0 ? "▲" : delta < 0 ? "▼" : "→"} {Math.abs(delta)}%
        </p>
      )}
    </div>
  );
}

function Badge({ children, color }) {
  const m = {
    green: "bg-emerald-900/60 text-emerald-300",
    red: "bg-red-900/60 text-red-300",
    amber: "bg-amber-900/60 text-amber-300",
    blue: "bg-blue-900/60 text-blue-300",
    purple: "bg-purple-900/60 text-purple-300",
    gray: "bg-white/10 text-white/70",
    orange: "bg-orange-900/60 text-orange-300",
    yellow: "bg-yellow-900/60 text-yellow-300",
    indigo: "bg-indigo-900/60 text-indigo-300",
    pink: "bg-pink-900/60 text-pink-300",
  };
  return (
    <span className={`text-sm font-semibold px-2 py-0.5 rounded-full ${m[color] || m.gray}`}>
      {children}
    </span>
  );
}

function BarreProgression({ pct, color }) {
  const col =
    color ||
    (pct >= 70 ? "bg-emerald-400" : pct >= 40 ? "bg-amber-400" : "bg-red-400");
  return (
    <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all ${col}`}
        style={{ width: `${Math.min(pct || 0, 100)}%` }}
      />
    </div>
  );
}

function StatRow({ label, color, children }) {
  return (
    <div className={`bg-white/10 rounded-xl px-4 py-3 border-l-2 ${color}`}>
      <p className="text-sm font-semibold tracking-widest text-white/70 mb-2">
        {label}
      </p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function StatChip({ label, value, accent }) {
  const c = {
    green: "text-emerald-400",
    blue: "text-blue-300",
    purple: "text-purple-300",
    pink: "text-pink-300",
    yellow: "text-yellow-300",
    orange: "text-orange-300",
    amber: "text-amber-300",
    indigo: "text-indigo-300",
    white: "text-white/70",
  };
  return (
    <div className="bg-white/5 rounded-xl px-3 py-2 flex flex-col items-center min-w-[70px]">
      <p className={`text-lg font-bold leading-none ${c[accent] || "text-white"}`}>{value}</p>
      <p className="text-sm text-white mt-0.5 text-center">{label}</p>
    </div>
  );
}

// ─── BESOIN CONFIG ────────────────────────────────────────────
const BESOIN_CONFIG = {
  Finances: { bar: "bg-green-400", dot: "bg-green-400", badge: "green" },
  "Santé": { bar: "bg-red-400", dot: "bg-red-400", badge: "red" },
  "Travail / Études": { bar: "bg-blue-400", dot: "bg-blue-400", badge: "blue" },
  "Famille / Enfants": { bar: "bg-pink-400", dot: "bg-pink-400", badge: "pink" },
  "Relations / Conflits": { bar: "bg-orange-400", dot: "bg-orange-400", badge: "orange" },
  "Addictions / Dépendances": { bar: "bg-purple-400", dot: "bg-purple-400", badge: "gray" },
  "Guidance spirituelle": { bar: "bg-indigo-400", dot: "bg-indigo-400", badge: "blue" },
  "Logement / Sécurité": { bar: "bg-yellow-400", dot: "bg-yellow-400", badge: "yellow" },
  "Communauté / Isolement": { bar: "bg-cyan-400", dot: "bg-cyan-400", badge: "blue" },
  "Dépression / Santé mentale": { bar: "bg-rose-500", dot: "bg-rose-500", badge: "red" },
  Miracle: { bar: "bg-violet-400", dot: "bg-violet-400", badge: "blue" },
  "Délivrance": { bar: "bg-fuchsia-400", dot: "bg-fuchsia-400", badge: "pink" },
  Autres: { bar: "bg-white/60", dot: "bg-white/40", badge: "gray" },
};
function getCfg(b) {
  return BESOIN_CONFIG[b] || BESOIN_CONFIG["Autres"];
}

// ─── CARTE TOP BESOINS ────────────────────────────────────────
// Titre générique "Top besoins" (le nombre affiché varie selon les
// données, pas forcément 5). Carte volontairement compacte : une seule
// indication en pied de carte (le besoin dominant), pas de sous-titre
// ni de mention du périmètre. Aucun total "par parent" n'est appliqué
// ici : les besoins affichés sont toujours ceux de `besoinsGlobaux` tel
// que fourni par l'appelant (propre au réseau ou à une église seule).
function CarteTop5Besoins({ besoinsGlobaux, t }) {
  if (!besoinsGlobaux || Object.keys(besoinsGlobaux).length === 0) return null;
  const top5 = Object.entries(besoinsGlobaux)
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 5);
  const maxTotal = Math.max(...top5.map(([, v]) => v.total), 1);
  const totalTous = top5.reduce((a, [, v]) => a + v.total, 0);
  const totalResolus = top5.reduce((a, [, v]) => a + (v.resolu || 0), 0);
  const tauxGlobal = totalTous > 0 ? Math.round((totalResolus / totalTous) * 100) : 0;
  const topBesoinNom = top5[0]?.[0] || null;

  return (
    <div className="bg-white/10 rounded-2xl px-3 py-3 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-white/70">{t.top5Title}</p>
        <div className="flex items-center gap-2">
          <Badge color="orange">{t.top5Cas(totalTous)}</Badge>
          <Badge color={tauxGlobal >= 50 ? "green" : "amber"}>{t.top5Resolus(tauxGlobal)}</Badge>
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        {top5.map(([besoin, data], index) => {
          const cfg = getCfg(besoin);
          const pct = Math.round((data.total / maxTotal) * 100);
          const pctResolu =
            data.total > 0 ? Math.round(((data.resolu || 0) / data.total) * 100) : 0;
          return (
            <div key={besoin} className="flex flex-col gap-0.5">
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-white/70 w-4 flex-shrink-0">
                  #{index + 1}
                </span>
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
                <p className="text-sm text-white/70 flex-1 truncate">{besoin}</p>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <Badge color="orange">{data.total}</Badge>
                  <Badge color={pctResolu >= 50 ? "green" : "amber"}>{pctResolu}%✓</Badge>
                </div>
              </div>
              <div className="ml-7 flex items-center gap-2">
                <BarreProgression pct={pct} color={cfg.bar} />
              </div>
            </div>
          );
        })}
      </div>
      {topBesoinNom && (
        <p className="text-sm text-amber-300 text-center font-semibold">
          {t.besoinPlusFrequentFn(topBesoinNom)}
        </p>
      )}
    </div>
  );
}

// ─── CARTE LEADERS EN DÉVELOPPEMENT ───────────────────────────
function CarteLeadersDeveloppement({ leadersStats, t }) {
  if (!leadersStats || leadersStats.total === 0) return null;
  const { total, potentiel, croissance, developpement, mature, sansEvaluation } = leadersStats;
  const stages = [
    { value: potentiel, label: t.leadersPotentiel, color: "text-teal-300" },
    { value: croissance, label: t.leadersCroissance, color: "text-emerald-300" },
    { value: developpement, label: t.leadersDeveloppement, color: "text-blue-300" },
    { value: mature, label: t.leadersMature, color: "text-purple-300" },
    ...(sansEvaluation >= 1
      ? [{ value: sansEvaluation, label: t.leadersSansEvaluation, color: "text-white/70" }]
      : []),
  ];
  const gridColsClass =
    stages.length === 5
      ? "grid-cols-2 sm:grid-cols-5"
      : stages.length === 4
      ? "grid-cols-2 sm:grid-cols-4"
      : "grid-cols-2 sm:grid-cols-3";

  return (
    <div className="bg-white/10 rounded-2xl px-4 py-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-white">{t.leadersTitle}</p>
        <p className="text-lg font-bold leading-none text-yellow-300">{total}</p>
      </div>
      <div className={`grid ${gridColsClass} gap-2`}>
        {stages.map((s) => (
          <div key={s.label} className="bg-white/5 rounded-xl px-3 py-3 text-center">
            <p className={`text-lg font-bold leading-none ${s.color}`}>{s.value}</p>
            <p className="text-xs text-white mt-1">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── CARTE CONVERSIONS (réutilisable : réseau ou par église) ──
function CarteConversions({ cd, t }) {
  if (!cd) return null;
  return (
    <div className="bg-white/10 rounded-2xl px-4 py-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-white">{t.sectionConversions}</p>
        <p className="text-lg font-bold leading-none text-yellow-300">{cd.total}</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <p className="text-sm tracking-wide text-orange-300">{t.conversionsSourceEglise}</p>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-white/5 rounded-xl px-2 py-2 text-center">
            <p className="text-lg font-bold leading-none text-yellow-300">{cd.egliseNC}</p>
            <p className="text-xs text-white mt-1">{t.chipNouveauxConvertis}</p>
          </div>
          <div className="bg-white/5 rounded-xl px-2 py-2 text-center">
            <p className="text-lg font-bold leading-none text-blue-300">{cd.egliseRecon}</p>
            <p className="text-xs text-white mt-1">{t.chipReconciliations}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <p className="text-sm tracking-wide text-orange-300">{t.conversionsSourceEvang}</p>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-white/5 rounded-xl px-2 py-2 text-center">
            <p className="text-lg font-bold leading-none text-yellow-300">{cd.evangNC}</p>
            <p className="text-sm text-white mt-1">{t.chipNouveauxConvertis}</p>
          </div>
          <div className="bg-white/5 rounded-xl px-2 py-2 text-center">
            <p className="text-lg font-bold leading-none text-blue-300">{cd.evangRecon}</p>
            <p className="text-sm text-white mt-1">{t.chipReconciliations}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── BLOC VUE D'ENSEMBLE ─────────────────────────────────────
// IMPORTANT : ce bloc affiche les statistiques de l'ÉGLISE CONNECTÉE
// UNIQUEMENT (rootEglise), pas la somme du réseau. Seul le nombre
// d'"Églises supervisées" reste une info de niveau réseau (comptage).
// Le classement des églises a été retiré (point 1).
function BlocVueEnsemble({
  allEglises,
  rootEglise,
  besoinsGlobaux,
  totalMembresActifs,
  tauxPresenceMoyen,
  conversionsDetail,
  prevTotaux,
  rootId,
  totalFamillesActives,
  totalPiliers,
  famillesFeatureActive,
  leadersStats,
  t,
}) {
  const s = rootEglise?.stats;
  const totaux = s
    ? {
        culteHommes: s.culte.hommes,
        culteFemmes: s.culte.femmes,
        culteJeunes: s.culte.jeunes,
        culteEnfants: s.culte.enfants,
        culteConnectes: s.culte.connectes,
        culteNV: s.culte.nouveaux_venus,
        culteNC: s.culte.nouveau_converti,
        baptemeH: s.bapteme.hommes,
        baptemeF: s.bapteme.femmes,
        evangH: s.evangelisation.hommes,
        evangF: s.evangelisation.femmes,
        evangNC: s.evangelisation.nouveau_converti,
        servH: s.serviteurs.hommes,
        servF: s.serviteurs.femmes,
        cellules: s.cellules.total,
      }
    : {
        culteHommes: 0, culteFemmes: 0, culteJeunes: 0, culteEnfants: 0,
        culteConnectes: 0, culteNV: 0, culteNC: 0,
        baptemeH: 0, baptemeF: 0,
        evangH: 0, evangF: 0, evangNC: 0,
        servH: 0, servF: 0, cellules: 0,
      };

  const totalCulte = totaux.culteHommes + totaux.culteFemmes + totaux.culteJeunes;
  const totalCulteGlobal = totalCulte + totaux.culteEnfants + totaux.culteConnectes;
  const totalBapteme = totaux.baptemeH + totaux.baptemeF;
  const totalEvangelisation = totaux.evangH + totaux.evangF;
  const totalServiteurs = totaux.servH + totaux.servF;

  const nbEglisesSupervisees = allEglises.filter((e) => e.id !== rootId).length;

  const cd = conversionsDetail || { egliseNC: 0, egliseRecon: 0, evangNC: 0, evangRecon: 0, total: 0 };
  const tauxEngagement =
    totalMembresActifs > 0 ? Math.round((totalServiteurs / totalMembresActifs) * 100) : 0;

  const tauxPresence = tauxPresenceMoyen || 0;

  const d = prevTotaux;
  const prevCulteGlobal = d
    ? d.culteHommes + d.culteFemmes + d.culteJeunes + d.culteEnfants + d.culteConnectes
    : null;
  const prevServiteurs = d ? d.servH + d.servF : null;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiCard label={t.kpiMembresActifs} value={totalMembresActifs} sub={t.kpiMembresActifsSub} accent="white" />
        <KpiCard
          label={t.kpiTauxPresence}
          value={`${tauxPresence}%`}
          sub={t.kpiTauxPresenceSub}
          accent={tauxPresence >= 70 ? "green" : tauxPresence >= 40 ? "amber" : "red"}
        />
        <KpiCard label={t.kpiCellules} value={totaux.cellules} sub={t.kpiCellulesSub} accent="orange" />
        {famillesFeatureActive && (
          <KpiCard label={t.kpiFamillesActives} value={totalFamillesActives} sub={t.kpiFamillesActivesSub} accent="blue" />
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiCard label={t.kpiEglisesSup} value={nbEglisesSupervisees} sub={t.kpiEglisesSubSup} accent="amber" />
        <KpiCard
          label={t.kpiTotalCulte}
          value={totalCulteGlobal}
          sub={t.kpiTotalCulteSub}
          accent="green"
          delta={calcDelta(totalCulteGlobal, prevCulteGlobal)}
        />
        <KpiCard label={t.kpiEvangelises} value={totalEvangelisation} sub={t.kpiEvangelisesSub} accent="pink" />
        <KpiCard label={t.kpiBaptemes} value={totalBapteme} sub={t.kpiBaptemesSub} accent="purple" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <KpiCard
          label={t.kpiServiteurs}
          value={totalServiteurs}
          sub={t.kpiServiteursSubFn(tauxEngagement)}
          accent="teal"
          delta={calcDelta(totalServiteurs, prevServiteurs)}
        />
        {famillesFeatureActive && (
          <KpiCard label={t.kpiPiliers} value={totalPiliers} sub={t.kpiPiliersSub} accent="indigo" />
        )}
      </div>

      {/* Point 4 : la carte besoins passe avant "Leaders en développement" */}
      <CarteTop5Besoins besoinsGlobaux={besoinsGlobaux} modeReseau={true} t={t} />

      <CarteLeadersDeveloppement leadersStats={leadersStats} t={t} />

      <CarteConversions cd={cd} t={t} />

      <div className="bg-white/10 rounded-2xl px-4 py-4 flex flex-col gap-3">
        <p className="text-sm text-white font-semibold">{t.repartitionTitle}</p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: t.hommes, val: totaux.culteHommes, color: "text-blue-300", bg: "bg-blue-900/40" },
            { label: t.femmes, val: totaux.culteFemmes, color: "text-pink-300", bg: "bg-pink-900/40" },
            { label: t.jeunes, val: totaux.culteJeunes, color: "text-amber-300", bg: "bg-amber-900/40" },
          ].map(({ label, val, color, bg }) => {
            const pct = totalCulte > 0 ? Math.round((val / totalCulte) * 100) : 0;
            return (
              <div key={label} className={`${bg} rounded-xl px-3 py-3 text-center`}>
                <p className={`text-lg font-bold ${color}`}> {val}</p>
                <p className="text-sm text-white mt-1"> {label}</p>
                <p className="text-sm text-white mt-0.5"> {pct}%</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Point 1 : section "Classement des églises (présences culte)" supprimée */}
    </div>
  );
}

// ─── CARTE TOTAUX (RÉSEAU) ─────────────────────────────────────
// Carte séparée, affichée UNE SEULE FOIS au-dessus de la liste en
// cascade (parent / enfant / enfants). Elle montre les totaux agrégés
// (l'église connectée + toutes ses églises supervisées), bien distincts
// des chiffres propres à chaque église affichés ensuite dans leur carte
// individuelle.
function CarteTotauxReseau({ totals, t }) {
  if (!totals) return null;
  return (
    <div className="bg-white/10 rounded-2xl px-4 py-4 flex flex-col gap-3 border border-white/20">
      <p className="text-sm font-semibold tracking-widest text-white">{t.totauxReseauTitle}</p>
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
        <StatChip label={t.kpiMembresActifs} value={totals.membresActifs} accent="white" />
        <StatChip label={t.kpiCellules} value={totals.cellules} accent="orange" />
        <StatChip label={t.serviteurs} value={totals.serviteurs} accent="yellow" />
        <StatChip label={t.leadersTitle} value={totals.leadersTotal} accent="purple" />
        <StatChip label={t.evangelises} value={totals.evangelises} accent="pink" />
      </div>
    </div>
  );
}

// ─── BLOC STATS EGLISE (détail complet, réutilisé par église) ─
function BlocStatsEglise({ stats, t }) {
  const totalCulte = stats.culte.hommes + stats.culte.femmes + stats.culte.jeunes;
  const totalCulteGlobal = totalCulte + stats.culte.enfants + stats.culte.connectes;
  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-1">
        <KpiCard label={t.culte} value={totalCulteGlobal} sub={t.totalPresences} accent="green" />
        <KpiCard label={t.evangelisation} value={stats.evangelisation.hommes + stats.evangelisation.femmes} sub={t.amesTouchees} accent="pink" />
        <KpiCard label={t.bapteme} value={stats.bapteme.hommes + stats.bapteme.femmes} sub={t.cettePeriode} accent="purple" />
        <KpiCard label={t.kpiCellules} value={stats.cellules.total} sub={t.cellulesActives} accent="orange" />
      </div>
      <StatRow label={t.culte} color="border-emerald-500">
        <StatChip label={t.chipHommes} value={stats.culte.hommes} accent="blue" />
        <StatChip label={t.chipFemmes} value={stats.culte.femmes} accent="pink" />
        <StatChip label={t.chipJeunes} value={stats.culte.jeunes} accent="amber" />
        <StatChip label={t.chipTotalHFJ} value={totalCulte} accent="orange" />
        <StatChip label={t.chipEnfants} value={stats.culte.enfants} accent="green" />
        <StatChip label={t.chipConnectes} value={stats.culte.connectes} accent="indigo" />
        <StatChip label={t.chipNvVenus} value={stats.culte.nouveaux_venus} accent="purple" />
        <StatChip label={t.chipNvConvertis} value={stats.culte.nouveau_converti} accent="yellow" />
        <StatChip label={t.chipMoissonneurs} value={stats.culte.moissonneurs} accent="white" />
        <StatChip label={t.chipTotalGlobal} value={totalCulteGlobal} accent="orange" />
      </StatRow>
      <StatRow label={t.formation} color="border-blue-500">
        <StatChip label={t.chipHommes} value={stats.formation.hommes} accent="blue" />
        <StatChip label={t.chipFemmes} value={stats.formation.femmes} accent="pink" />
        <StatChip label={t.chipTotal} value={stats.formation.hommes + stats.formation.femmes} accent="orange" />
      </StatRow>
      <StatRow label={t.bapteme} color="border-purple-500">
        <StatChip label={t.chipHommes} value={stats.bapteme.hommes} accent="blue" />
        <StatChip label={t.chipFemmes} value={stats.bapteme.femmes} accent="pink" />
        <StatChip label={t.chipTotal} value={stats.bapteme.hommes + stats.bapteme.femmes} accent="orange" />
      </StatRow>
      <StatRow label={t.evangelisation} color="border-pink-500">
        <StatChip label={t.chipHommes} value={stats.evangelisation.hommes} accent="blue" />
        <StatChip label={t.chipFemmes} value={stats.evangelisation.femmes} accent="pink" />
        <StatChip label={t.chipTotal} value={stats.evangelisation.hommes + stats.evangelisation.femmes} accent="orange" />
        <StatChip label={t.chipPriere} value={stats.evangelisation.priere} accent="indigo" />
        <StatChip label={t.chipNvConvertis} value={stats.evangelisation.nouveau_converti} accent="yellow" />
        <StatChip label={t.chipReconciliation} value={stats.evangelisation.reconciliation} accent="green" />
        <StatChip label={t.chipMoissonneurs} value={stats.evangelisation.moissonneurs} accent="white" />
      </StatRow>
      <StatRow label={t.serviteursRow} color="border-yellow-500">
        <StatChip label={t.chipHommes} value={stats.serviteurs.hommes} accent="blue" />
        <StatChip label={t.chipFemmes} value={stats.serviteurs.femmes} accent="pink" />
        <StatChip label={t.chipTotal} value={stats.serviteurs.hommes + stats.serviteurs.femmes} accent="orange" />
      </StatRow>
      {totalCulteGlobal > 0 && (
        <div className="bg-white/10 rounded-xl p-3 flex flex-col gap-2 mt-1">
          <SectionTitle>{t.entonnoir}</SectionTitle>
          {[
            { label: t.presencesCulte, val: totalCulteGlobal, color: "bg-emerald-400" },
            { label: t.evangelises, val: stats.evangelisation.hommes + stats.evangelisation.femmes, color: "bg-pink-400" },
            { label: t.baptises, val: stats.bapteme.hommes + stats.bapteme.femmes, color: "bg-purple-400" },
            { label: t.serviteurs, val: stats.serviteurs.hommes + stats.serviteurs.femmes, color: "bg-yellow-400" },
          ].map(({ label, val, color }) => (
            <div key={label} className="flex items-center gap-3">
              <p className="text-sm text-white w-28 flex-shrink-0">{label}</p>
              <BarreProgression pct={Math.round((val / totalCulteGlobal) * 100)} color={color} />
              <span className="text-lg text-white font-semibold w-8 text-right">{val}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── CARTE ÉGLISE COMPACTE (liste plate, scalable à 100+ églises) ──
// Chaque carte n'affiche QUE les chiffres propres à cette église (pas de
// cumul avec ses filles) : les totaux agrégés par parent sont séparés
// dans leur propre carte "Totaux (réseau)" au-dessus de la liste, afin de
// ne jamais mélanger un total de sous-réseau avec le chiffre individuel
// d'une église précise.
// Expanded ("Voir le détail complet") : détail complet, propre à
// l'église uniquement, bouton repositionné à droite sous les cartes KPI
// (point 2).
function CarteEgliseCompacte({
  eglise, membresActifs, tauxPresence, leaders, evangelises, conversions, besoins, isRoot, parentLabel, t,
}) {
  const [expanded, setExpanded] = useState(false);
  const stats = eglise.stats;
  const serviteursTotal = stats.serviteurs.hommes + stats.serviteurs.femmes;
  const cellulesTotal = stats.cellules.total;
  const titre = formatEgliseTitre(eglise);

  const topBesoinEntry =
    besoins && Object.keys(besoins).length > 0
      ? Object.entries(besoins).sort((a, b) => b[1].total - a[1].total)[0]
      : null;
  const topBesoinLabel = topBesoinEntry ? topBesoinEntry[0] : t.aucunBesoin;
  const topBesoinValue = topBesoinEntry ? topBesoinEntry[1].total : 0;

  return (
    <div className="bg-white/10 rounded-2xl overflow-hidden">
      <div className="px-4 py-4">
        <div className="mb-1">
          <span className="text-sm font-semibold text-white truncate">{titre}</span>
        </div>
        {/* "Église superviseure" badge supprimé : le rang de l'église racine
            est désormais visible via sa position en tête + l'indentation
            en cascade des églises filles. */}
        {!isRoot && parentLabel && (
          <div className="mb-3">
            <span className="text-xs text-yellow-400">
              {t.superviseePar} <span className="text-yellow-400 font-semibold">{parentLabel}</span>
            </span>
          </div>
        )}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-3">
          <StatChip label={t.kpiMembresActifs} value={membresActifs} accent="white" />
          <StatChip label={t.kpiCellules} value={cellulesTotal} accent="orange" />
          <StatChip label={t.serviteurs} value={serviteursTotal} accent="yellow" />
          <StatChip label={t.leadersTitle} value={leaders?.total || 0} accent="purple" />
          <StatChip label={t.evangelises} value={evangelises} accent="pink" />
          <StatChip label={topBesoinLabel} value={topBesoinValue} accent="amber" />
        </div>
        <div className="flex justify-end">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition flex-shrink-0"
          >
            {expanded ? t.voirMoins : t.voirDetail} {expanded ? "▲" : "▼"}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-white/10 px-4 pb-4 pt-3 flex flex-col gap-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <KpiCard
              label={t.kpiTauxPresence}
              value={`${tauxPresence}%`}
              sub={t.kpiTauxPresenceSub}
              accent={tauxPresence >= 70 ? "green" : tauxPresence >= 40 ? "amber" : "red"}
            />
          </div>
          <BlocStatsEglise stats={stats} t={t} />
          {/* Point 4 : carte besoins avant "Leaders en développement".
              Point 6 : besoins propres à cette église, non cumulés. */}
          <CarteTop5Besoins besoinsGlobaux={besoins} modeReseau={false} t={t} />
          <CarteLeadersDeveloppement leadersStats={leaders} t={t} />
          <CarteConversions cd={conversions} t={t} />
        </div>
      )}
    </div>
  );
}

// ─── ARBRE HIÉRARCHIQUE DES ÉGLISES (onglet "Par église") ─────
function buildEgliseHierarchy(eglises, rootId, triEglise, searchTerm) {
  const byId = {};
  eglises.forEach((e) => {
    byId[e.id] = e;
  });

  const term = (searchTerm || "").trim().toLowerCase();
  let visibleIds = null;
  if (term) {
    visibleIds = new Set();
    eglises.forEach((e) => {
      if (!formatEgliseTitre(e)?.toLowerCase().includes(term)) return;
      let cur = e;
      let guard = 0;
      while (cur && guard < 50) {
        visibleIds.add(cur.id);
        if (cur.id === rootId) break;
        const pid = getParentEgliseId(cur);
        cur = pid ? byId[pid] : null;
        guard++;
      }
    });
    if (byId[rootId]) visibleIds.add(rootId);
  }

  const childrenMap = {};
  eglises.forEach((e) => {
    if (e.id === rootId) return;
    if (visibleIds && !visibleIds.has(e.id)) return;
    const pid = getParentEgliseId(e);
    const parentKey = pid && byId[pid] ? pid : rootId;
    if (!childrenMap[parentKey]) childrenMap[parentKey] = [];
    childrenMap[parentKey].push(e);
  });

  const sortSiblings = (list) =>
    [...list].sort((a, b) => {
      if (triEglise === "alphabetique") return formatEgliseTitre(a).localeCompare(formatEgliseTitre(b));
      return culteGlobalDe(b) - culteGlobalDe(a);
    });

  const flat = [];
  const visit = (id, depth) => {
    const node = byId[id];
    if (!node) return;
    if (visibleIds && !visibleIds.has(id)) return;
    flat.push({ eglise: node, depth });
    sortSiblings(childrenMap[id] || []).forEach((k) => visit(k.id, depth + 1));
  };
  if (byId[rootId]) visit(rootId, 0);

  const dejaVisitees = new Set(flat.map((f) => f.eglise.id));
  eglises.forEach((e) => {
    if (dejaVisitees.has(e.id)) return;
    if (visibleIds && !visibleIds.has(e.id)) return;
    flat.push({ eglise: e, depth: 0 });
  });

  return flat;
}

// ─── PAGE PRINCIPALE ──────────────────────────────────────────
function StatGlobalPage() {
  const { lang } = useLang();
  const t = translations[lang];

  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [loading, setLoading] = useState(false);
  const [allEglises, setAllEglises] = useState([]);
  const [rootId, setRootId] = useState(null);
  const [onglet, setOnglet] = useState("ensemble");
  const [modePerso, setModePerso] = useState(false);
  const [filtrePeriode, setFiltrePeriode] = useState("30");
  const [hasData, setHasData] = useState(false);
  const [prevTotaux, setPrevTotaux] = useState(null);

  const [totalFamillesActives, setTotalFamillesActives] = useState(0);
  const [totalPiliers, setTotalPiliers] = useState(0);
  const [famillesFeatureActive, setFamillesFeatureActive] = useState(false);

  const [rechercheEglise, setRechercheEglise] = useState("");
  const [triEglise, setTriEglise] = useState("alphabetique"); // "alphabetique" | "participation"

  const [membresActifsParEglise, setMembresActifsParEglise] = useState({});
  const [tauxPresenceParEglise, setTauxPresenceParEglise] = useState({});
  const [leadersStatsParEglise, setLeadersStatsParEglise] = useState({});
  const [conversionsParEglise, setConversionsParEglise] = useState({});
  const [besoinsParEglise, setBesoinsParEglise] = useState({});

  useEffect(() => {
    fetchStats(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchBesoins = async (egliseIds, debut, fin) => {
    const { data: membresActifsData } = await supabase
      .from("membres_complets")
      .select("id, eglise_id")
      .in("eglise_id", egliseIds)
      .in("etat_contact", ["existant", "nouveau"]);

    if (!membresActifsData?.length) return {};

    const membreIds = membresActifsData.map((m) => m.id);
    const egliseMap = {};
    membresActifsData.forEach((m) => {
      egliseMap[m.id] = m.eglise_id;
    });

    let suivisQuery = supabase
      .from("suivis")
      .select("membre_id, besoin, date_action")
      .in("membre_id", membreIds);
    if (debut) suivisQuery = suivisQuery.gte("date_action", debut);
    if (fin) suivisQuery = suivisQuery.lte("date_action", fin);
    const { data: suivisData } = await suivisQuery;

    const countParEglise = {};
    (suivisData || []).forEach((s) => {
      if (!s.besoin) return;
      const egId = egliseMap[s.membre_id];
      let items = [];
      try {
        items = Array.isArray(s.besoin) ? s.besoin : JSON.parse(s.besoin);
      } catch {
        return;
      }
      items.forEach((item) => {
        const label = typeof item === "string" ? item.trim() : item?.label?.trim();
        const statut = typeof item === "string" ? null : item?.statut;
        if (!label) return;
        if (egId) {
          if (!countParEglise[egId]) countParEglise[egId] = {};
          if (!countParEglise[egId][label]) countParEglise[egId][label] = { total: 0, resolu: 0 };
          countParEglise[egId][label].total++;
          if (statut === "Résolu") countParEglise[egId][label].resolu++;
        }
      });
    });

    return countParEglise;
  };

  const resetState = () => {
    setAllEglises([]);
    setPrevTotaux(null);
    setHasData(false);
    setTotalFamillesActives(0);
    setTotalPiliers(0);
    setFamillesFeatureActive(false);
    setMembresActifsParEglise({});
    setTauxPresenceParEglise({});
    setLeadersStatsParEglise({});
    setConversionsParEglise({});
    setBesoinsParEglise({});
  };

  const fetchStats = async (overrideModePerso = null) => {
    setLoading(true);
    const isPerso = overrideModePerso !== null ? overrideModePerso : modePerso;

    let debut = dateDebut;
    let fin = dateFin;
    if (!isPerso) {
      const depuis = new Date();
      depuis.setDate(depuis.getDate() - Number(filtrePeriode));
      debut = depuis.toISOString().split("T")[0];
      fin = "";
    }

    let prevDebut = null;
    let prevFin = null;
    if (!isPerso) {
      const jours = Number(filtrePeriode);
      const finPrec = new Date();
      finPrec.setDate(finPrec.getDate() - jours);
      const debutPrec = new Date(finPrec);
      debutPrec.setDate(debutPrec.getDate() - jours);
      prevDebut = debutPrec.toISOString().split("T")[0];
      prevFin = finPrec.toISOString().split("T")[0];
    } else if (debut && fin) {
      const d1 = new Date(debut);
      const d2 = new Date(fin);
      const duree = Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
      const finPrec = new Date(d1);
      finPrec.setDate(finPrec.getDate() - 1);
      const debutPrec = new Date(finPrec);
      debutPrec.setDate(debutPrec.getDate() - duree);
      prevDebut = debutPrec.toISOString().split("T")[0];
      prevFin = finPrec.toISOString().split("T")[0];
    }

    const todayStr = new Date().toISOString().split("T")[0];
    const effectiveDateFinServiteurs = isPerso && fin ? fin : todayStr;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profileData } = await supabase
        .from("profiles")
        .select("eglise_id")
        .eq("id", user.id)
        .single();

      const rootIdValue = profileData.eglise_id;
      setRootId(rootIdValue);

      const { data: reseauData, error: reseauError } = await supabase.rpc(
        "get_stats_reseau",
        {
          p_root_id: rootIdValue,
          p_debut: debut || null,
          p_fin: fin || null,
          p_serviteurs_fin: effectiveDateFinServiteurs,
        }
      );
      if (reseauError) throw reseauError;

      const eglisesMap = reseauData?.eglises || {};
      const egliseIds = Object.keys(eglisesMap);

      if (!egliseIds.length) {
        resetState();
        setRootId(rootIdValue);
        setLoading(false);
        return;
      }

      const membresActifsMap = {};
      const tauxParEgliseMap = {};
      const leadersParEgliseValue = {};
      const conversionsParEgliseValue = {};
      const allEglisesValue = egliseIds.map((id) => {
        const e = eglisesMap[id];
        membresActifsMap[id] = e.membresActifs || 0;
        tauxParEgliseMap[id] = e.tauxPresence || 0;
        leadersParEgliseValue[id] = e.leadersStats;
        conversionsParEgliseValue[id] = e.conversions;
        return {
          id,
          nom: e.nom,
          denomination: e.denomination,
          ville: e.ville,
          pays: e.pays,
          parent_eglise_id: e.parent_eglise_id,
          stats: e.stats,
        };
      });

      setMembresActifsParEglise(membresActifsMap);
      setTauxPresenceParEglise(tauxParEgliseMap);
      setLeadersStatsParEglise(leadersParEgliseValue);
      setConversionsParEglise(conversionsParEgliseValue);
      setAllEglises(allEglisesValue);

      const rootData = eglisesMap[rootIdValue];
      setFamillesFeatureActive(!!rootData?.famillesFeatureActive);
      setTotalFamillesActives(rootData?.famillesActives || 0);
      setTotalPiliers(rootData?.piliers || 0);

      if (prevDebut && prevFin) {
        const { data: prevData, error: prevError } = await supabase.rpc(
          "get_stats_eglise_precedente",
          {
            p_eglise_id: rootIdValue,
            p_debut: prevDebut,
            p_fin: prevFin,
            p_serviteurs_fin: prevFin,
          }
        );
        if (prevError) throw prevError;
        setPrevTotaux(prevData || null);
      } else {
        setPrevTotaux(null);
      }

      const besoinsData = await fetchBesoins(egliseIds, debut, fin);
      setBesoinsParEglise(besoinsData);

      setHasData(true);
    } catch (err) {
      console.error("Erreur fetch stats:", err);
      resetState();
    }
    setLoading(false);
  };

  const handlePeriodeChange = (val) => {
    setFiltrePeriode(val);
    setModePerso(false);
  };

  const onglets = [
    { key: "ensemble", label: t.ongletEnsemble },
    { key: "eglises", label: t.ongletEglises },
  ];

  const hierarchieEglises = buildEgliseHierarchy(allEglises, rootId, triEglise, rechercheEglise);

  const eglisesMapById = {};
  allEglises.forEach((e) => {
    eglisesMapById[e.id] = e;
  });

  const rootEglise = eglisesMapById[rootId] || null;

  // ── Map { parentId -> [enfants] } + totaux réseau (racine + toutes ses
  // filles en cascade), calculés UNE FOIS et affichés dans leur propre
  // carte "Totaux (réseau)" — séparée des cartes individuelles, qui elles
  // n'affichent que les chiffres propres à chaque église. ──
  const childrenMapGlobal = buildChildrenMap(allEglises, rootId);
  const totauxReseau = rootEglise
    ? computeSubtreeTotals(rootEglise, childrenMapGlobal, membresActifsParEglise, leadersStatsParEglise)
    : null;

  return (
    <div
      className="min-h-screen flex flex-col items-center p-4 sm:p-6"
      style={{ background: "#333699" }}
    >
      <HeaderPages />

      <div className="w-full max-w-2xl mt-6 flex flex-col gap-5 mb-10">

        <div className="text-center">
          <h1 className="text-2xl font-bold mt-4 mb-2 text-white">
            {t.titreRapport}{" "}
            <span className="text-emerald-300">{t.titreAccent}</span>
          </h1>
          <p className="italic text-base text-white/90">
            {t.intro}{" "}
            <span className="text-blue-300 font-semibold">{t.introAccent1}</span>
            {t.intro2}{" "}
            <span className="text-blue-300 font-semibold">{t.introAccent2}</span>
            {t.intro3}{" "}
            <span className="text-blue-300 font-semibold">{t.introAccent3}</span>{" "}
            {t.intro4}{" "}
            <span className="text-blue-300 font-semibold">{t.introAccent4}</span>{" "}
            {t.intro5}
          </p>
        </div>

        <div className="bg-white/10 rounded-2xl p-4 flex flex-col gap-3">
          <SectionTitle>{t.parametres}</SectionTitle>
          <div className="flex gap-1 bg-white/10 rounded-xl p-1 w-fit">
            <button
              onClick={() => setModePerso(false)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${!modePerso ? "bg-white text-[#333699]" : "text-white/50 hover:text-white"}`}
            >
              {t.periodeRapide}
            </button>
            <button
              onClick={() => setModePerso(true)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${modePerso ? "bg-white text-[#333699]" : "text-white/50 hover:text-white"}`}
            >
              {t.trancheDates}
            </button>
          </div>

          {!modePerso && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-white/50 flex-shrink-0">{t.periode}</span>
                {t.periodes.map((p) => (
                  <button
                    key={p.val}
                    onClick={() => handlePeriodeChange(p.val)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                      filtrePeriode === p.val ? "bg-white text-[#333699]" : "bg-white/15 text-white/70 hover:bg-white/20"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              <button
                onClick={() => fetchStats(false)}
                className="w-full py-2 rounded-xl bg-amber-500/80 hover:bg-amber-500 text-white text-sm font-semibold transition active:scale-95"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {t.generation}
                  </span>
                ) : t.generer}
              </button>
            </div>
          )}

          {modePerso && (
            <div className="flex flex-col gap-2">
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-white/50">{t.dateDebut}</label>
                  <input type="date" value={dateDebut} onChange={(e) => setDateDebut(e.target.value)}
                    className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-white/40" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-white/50">{t.dateFin}</label>
                  <input type="date" value={dateFin} onChange={(e) => setDateFin(e.target.value)}
                    className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-white/40" />
                </div>
              </div>
              <button
                onClick={() => fetchStats(true)}
                className="w-full py-2 rounded-xl bg-amber-500/80 hover:bg-amber-500 text-white text-sm font-semibold transition active:scale-95"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {t.generation}
                  </span>
                ) : t.generer}
              </button>
            </div>
          )}
        </div>

        {hasData && (
          <div className="flex gap-1 bg-white/10 rounded-xl p-1">
            {onglets.map((o) => (
              <button
                key={o.key}
                onClick={() => setOnglet(o.key)}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition ${
                  onglet === o.key ? "bg-white text-[#333699]" : "text-white/50 hover:text-white"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
          </div>
        ) : !hasData ? (
          <div className="bg-white/10 rounded-2xl p-8 text-center text-white/40 text-sm">
            {t.placeholder}
          </div>
        ) : onglet === "ensemble" ? (
          <div className="flex flex-col gap-4">
            <SectionTitle>
              <p className="text-white text-sm font-semibold">
                {t.synthese} — {allEglises.length}{" "}
                {allEglises.length > 1 ? t.eglises : t.eglise}
              </p>
            </SectionTitle>
            <BlocVueEnsemble
              allEglises={allEglises}
              rootEglise={rootEglise}
              besoinsGlobaux={besoinsParEglise[rootId] || {}}
              totalMembresActifs={membresActifsParEglise[rootId] || 0}
              tauxPresenceMoyen={tauxPresenceParEglise[rootId] || 0}
              conversionsDetail={conversionsParEglise[rootId]}
              prevTotaux={prevTotaux}
              rootId={rootId}
              totalFamillesActives={totalFamillesActives}
              totalPiliers={totalPiliers}
              famillesFeatureActive={famillesFeatureActive}
              leadersStats={leadersStatsParEglise[rootId]}
              t={t}
            />
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={rechercheEglise}
                onChange={(e) => setRechercheEglise(e.target.value)}
                placeholder={t.rechercherEglise}
                className="flex-1 bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm placeholder-white/40 focus:outline-none focus:border-white/40"
              />
              <select
                value={triEglise}
                onChange={(e) => setTriEglise(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-white/40 appearance-none cursor-pointer"
              >
                <option value="alphabetique" className="bg-[#2a2d80]">{t.triAlphabetique}</option>
                <option value="participation" className="bg-[#2a2d80]">{t.triParticipation}</option>
              </select>
            </div>

            <CarteTotauxReseau totals={totauxReseau} t={t} />

            <SectionTitle>
              {hierarchieEglises.length}{" "}
              {hierarchieEglises.length > 1 ? t.eglises : t.eglise}{" "}
              {hierarchieEglises.length > 1 ? t.affichees : t.affichee}
            </SectionTitle>

            {hierarchieEglises.map(({ eglise, depth }) => {
              const isRoot = eglise.id === rootId;
              const parentId = getParentEgliseId(eglise);
              const parentEglise = isRoot
                ? null
                : eglisesMapById[parentId] || eglisesMapById[rootId] || null;
              const parentLabel = formatSupervisionLabel(parentEglise);

              return (
                <div
                  key={eglise.id}
                  style={depth > 0 ? { marginLeft: depth * 20 } : undefined}
                  className={depth > 0 ? "border-l-2 border-white/10 pl-3" : ""}
                >
                  <CarteEgliseCompacte
                    eglise={eglise}
                    isRoot={isRoot}
                    parentLabel={parentLabel}
                    membresActifs={membresActifsParEglise[eglise.id] || 0}
                    tauxPresence={tauxPresenceParEglise[eglise.id] || 0}
                    leaders={leadersStatsParEglise[eglise.id]}
                    evangelises={eglise.stats.evangelisation.hommes + eglise.stats.evangelisation.femmes}
                    conversions={conversionsParEglise[eglise.id]}
                    besoins={besoinsParEglise[eglise.id]}
                    t={t}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
