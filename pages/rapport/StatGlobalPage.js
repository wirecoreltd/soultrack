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
    kpiEglisesSup: "Églises supervisées",
    kpiEglisesSubSup: "dans le réseau",
    kpiMembresActifs: "Membres actifs",
    kpiMembresActifsSub: "dans le réseau",
    kpiTauxPresence: "Taux de présence",
    kpiTauxPresenceSub: "moyenne par culte",
    kpiTotalCulte: "Participation totale aux services",
    kpiTotalCulteSub: "H+F+J+Enf+Conn.",
    kpiMoyParEglise: "Moy. par église",
    kpiMoyParEgliseSub: "présences/église",
    kpiCellules: "Cellules actives",
    kpiCellulesSub: "avec contacts, réseau",
    kpiEvangelises: "Évangélisés",
    kpiEvangelisesSub: "âmes touchées",
    kpiBaptemes: "Baptêmes",
    kpiBaptemesSub: "cette période",
    kpiTauxConversion: "Taux conversion",
    kpiTauxConversionSub: "conversions / présences culte",
    sectionConversions: "Conversions (prière du salut)",
    conversionsSourceEglise: "Église (nouveaux membres)",
    conversionsSourceEvang: "Évangélisation",
    chipNouveauxConvertis: "Nouveaux convertis",
    chipReconciliations: "Réconciliations",
    conversionsTotal: "Total conversions",
    kpiServiteurs: "Serviteurs",
    kpiServiteursSubFn: (pct) => `${pct}% des présents`,
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
    top5Title: "🆘 Top 5 difficultés",
    top5Cas: (n) => `${n} cas`,
    top5Resolus: (pct) => `${pct}% résolus`,
    top5Aggrege: "Agrégé sur toutes les églises supervisées",
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
    kpiEglisesSup: "Supervised churches",
    kpiEglisesSubSup: "in the network",
    kpiMembresActifs: "Active members",
    kpiMembresActifsSub: "in the network",
    kpiTauxPresence: "Attendance rate",
    kpiTauxPresenceSub: "average per service",
    kpiTotalCulte: "Total Service Attendance",
    kpiTotalCulteSub: "M+F+Y+Ch+Online",
    kpiMoyParEglise: "Avg. per church",
    kpiMoyParEgliseSub: "attendance/church",
    kpiCellules: "Active cell groups",
    kpiCellulesSub: "with contacts, network",
    kpiEvangelises: "Evangelized",
    kpiEvangelisesSub: "souls reached",
    kpiBaptemes: "Baptisms",
    kpiBaptemesSub: "this period",
    kpiTauxConversion: "Conversion rate",
    kpiTauxConversionSub: "conversions / worship attendance",
    sectionConversions: "Conversions (salvation prayer)",
    conversionsSourceEglise: "Church (new members)",
    conversionsSourceEvang: "Outreach",
    chipNouveauxConvertis: "New converts",
    chipReconciliations: "Reconciliations",
    conversionsTotal: "Total conversions",
    kpiServiteurs: "Servants",
    kpiServiteursSubFn: (pct) => `${pct}% of attendees`,
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
    top5Title: "🆘 Top 5 needs",
    top5Cas: (n) => `${n} cases`,
    top5Resolus: (pct) => `${pct}% resolved`,
    top5Aggrege: "Aggregated across all supervised churches",
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

function toYearMonth(dateStr) {
  if (!dateStr) return dateStr;
  return dateStr.substring(0, 7) + "-01";
}

// ─── UI ATOMS ─────────────────────────────────────────────────
function SectionTitle({ children }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-widest text-white mb-3">
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
    gray: "text-white/40",
    indigo: "text-indigo-300",
    yellow: "text-yellow-300",
  };
  return (
    <div className="bg-white/10 rounded-2xl px-4 py-4 flex flex-col gap-1">
      <p className="text-xs text-white">{label}</p>
      <p className={`text-2xl font-bold leading-none ${c[accent] || "text-white"}`}>{value}</p>
      {sub && <p className="text-[11px] text-white mt-0.5">{sub}</p>}
      {delta !== null && delta !== undefined && (
        <p
          className={`text-[11px] font-semibold mt-0.5 ${
            delta > 0 ? "text-emerald-400" : delta < 0 ? "text-red-400" : "text-white/30"
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
    gray: "bg-white/10 text-white/50",
    orange: "bg-orange-900/60 text-orange-300",
    yellow: "bg-yellow-900/60 text-yellow-300",
    indigo: "bg-indigo-900/60 text-indigo-300",
    pink: "bg-pink-900/60 text-pink-300",
  };
  return (
    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${m[color] || m.gray}`}>
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
      <p className="text-[11px] font-semibold uppercase tracking-widest text-white/80 mb-2">
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
    white: "text-white",
  };
  return (
    <div className="bg-white/5 rounded-xl px-3 py-2 flex flex-col items-center min-w-[70px]">
      <p className={`text-lg font-bold leading-none ${c[accent] || "text-white"}`}>{value}</p>
      <p className="text-[10px] text-white/40 mt-0.5 text-center">{label}</p>
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

// ─── CARTE TOP 5 BESOINS ──────────────────────────────────────
function CarteTop5Besoins({ besoinsGlobaux, t }) {
  if (!besoinsGlobaux || Object.keys(besoinsGlobaux).length === 0) return null;
  const top5 = Object.entries(besoinsGlobaux)
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 5);
  const maxTotal = Math.max(...top5.map(([, v]) => v.total), 1);
  const totalTous = top5.reduce((a, [, v]) => a + v.total, 0);
  const totalResolus = top5.reduce((a, [, v]) => a + v.resolu, 0);
  const tauxGlobal = totalTous > 0 ? Math.round((totalResolus / totalTous) * 100) : 0;
  return (
    <div className="bg-white/10 rounded-2xl px-4 py-4 flex flex-col gap-3">
      <div className="flex items-center justify-between mb-1">
        <p className="text-sm font-semibold text-white">{t.top5Title}</p>
        <div className="flex items-center gap-2">
          <Badge color="orange">{t.top5Cas(totalTous)}</Badge>
          <Badge color={tauxGlobal >= 50 ? "green" : "amber"}>{t.top5Resolus(tauxGlobal)}</Badge>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {top5.map(([besoin, data], index) => {
          const cfg = getCfg(besoin);
          const pct = Math.round((data.total / maxTotal) * 100);
          const pctResolu =
            data.total > 0 ? Math.round((data.resolu / data.total) * 100) : 0;
          return (
            <div key={besoin} className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-bold text-white/30 w-4 flex-shrink-0">
                  #{index + 1}
                </span>
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
                <p className="text-xs text-white flex-1 truncate">{besoin}</p>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <Badge color="orange">{data.total}</Badge>
                  <Badge color={pctResolu >= 50 ? "green" : "amber"}>{pctResolu}%✓</Badge>
                </div>
              </div>
              <div className="ml-9 flex items-center gap-2">
                <BarreProgression pct={pct} color={cfg.bar} />
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-[10px] text-white/20 text-center mt-1">{t.top5Aggrege}</p>
    </div>
  );
}

// ─── BLOC VUE D'ENSEMBLE ─────────────────────────────────────
// rootId est passé pour exclure l'église du superviseur du KPI "Supervised churches"
// tauxPresenceMoyen est calculé en amont (dans fetchStats) à partir de la table `presences`
function BlocVueEnsemble({
  allEglises,
  besoinsGlobaux,
  totalMembresActifs,
  tauxPresenceMoyen,
  conversionsDetail,
  prevTotaux,
  rootId,
  t,
}) {
  const totaux = allEglises.reduce(
    (acc, e) => {
      const s = e.stats;
      acc.culteHommes += s.culte.hommes;
      acc.culteFemmes += s.culte.femmes;
      acc.culteJeunes += s.culte.jeunes;
      acc.culteEnfants += s.culte.enfants;
      acc.culteConnectes += s.culte.connectes;
      acc.culteNV += s.culte.nouveaux_venus;
      acc.culteNC += s.culte.nouveau_converti;
      acc.baptemeH += s.bapteme.hommes;
      acc.baptemeF += s.bapteme.femmes;
      acc.evangH += s.evangelisation.hommes;
      acc.evangF += s.evangelisation.femmes;
      acc.evangNC += s.evangelisation.nouveau_converti;
      acc.servH += s.serviteurs.hommes;
      acc.servF += s.serviteurs.femmes;
      acc.cellules += s.cellules.total;
      return acc;
    },
    {
      culteHommes: 0, culteFemmes: 0, culteJeunes: 0, culteEnfants: 0,
      culteConnectes: 0, culteNV: 0, culteNC: 0,
      baptemeH: 0, baptemeF: 0,
      evangH: 0, evangF: 0, evangNC: 0,
      servH: 0, servF: 0, cellules: 0,
    }
  );

  const totalCulte = totaux.culteHommes + totaux.culteFemmes + totaux.culteJeunes;
  const totalCulteGlobal = totalCulte + totaux.culteEnfants + totaux.culteConnectes;
  const totalBapteme = totaux.baptemeH + totaux.baptemeF;
  const totalEvangelisation = totaux.evangH + totaux.evangF;
  const totalServiteurs = totaux.servH + totaux.servF;

  // ── CORRECTION #5 : exclure le root du compte "Églises supervisées"
  const nbEglisesSupervisees = allEglises.filter((e) => e.id !== rootId).length;
  // Toutes les églises (y compris root) pour les calculs de moyennes
  const nbEglisesTotal = allEglises.length;

  const moyenneCulteParEglise =
    nbEglisesTotal > 0 ? Math.round(totalCulteGlobal / nbEglisesTotal) : 0;

  // ── Conversions réelles : basées sur "priere_salut" dans membres_complets (nouveaux membres
  // rejoignant l'église) et dans evangelises (personnes touchées lors de l'évangélisation).
  // On distingue "Nouveau converti" (première fois) de "Réconciliation" (retour à la foi).
  const cd = conversionsDetail || { egliseNC: 0, egliseRecon: 0, evangNC: 0, evangRecon: 0, total: 0 };
  const totalConversionsEglise = cd.egliseNC + cd.egliseRecon;
  const totalConversionsEvang = cd.evangNC + cd.evangRecon;
  const tauxConversion =
    totalCulteGlobal > 0 ? Math.round((cd.total / totalCulteGlobal) * 100) : 0;
  const tauxEngagement =
    totalCulteGlobal > 0 ? Math.round((totalServiteurs / totalCulteGlobal) * 100) : 0;

  // ── Taux de présence : calculé en amont dans fetchStats à partir de la table `presences`
  // (moyenne, sur chaque culte, du % de membres actifs réellement présents)
  const tauxPresence = tauxPresenceMoyen || 0;

  const d = prevTotaux;
  const prevCulteGlobal = d
    ? d.culteHommes + d.culteFemmes + d.culteJeunes + d.culteEnfants + d.culteConnectes
    : null;
  const prevEvangelisation = d ? d.evangH + d.evangF : null;
  const prevBapteme = d ? d.baptemeH + d.baptemeF : null;
  const prevServiteurs = d ? d.servH + d.servF : null;
  const prevMoy = d && nbEglisesTotal > 0 ? Math.round(prevCulteGlobal / nbEglisesTotal) : null;

  return (
    <div className="flex flex-col gap-4">

      {/* Ligne 1 : Membres actifs + Taux de présence + Églises supervisées + Cellules */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiCard
          label={t.kpiMembresActifs}
          value={totalMembresActifs}
          sub={t.kpiMembresActifsSub}
          accent="white"
        />
        <KpiCard
          label={t.kpiTauxPresence}
          value={`${tauxPresence}%`}
          sub={t.kpiTauxPresenceSub}
          accent={tauxPresence >= 70 ? "green" : tauxPresence >= 40 ? "amber" : "red"}
        />
        <KpiCard
          label={t.kpiEglisesSup}
          value={nbEglisesSupervisees}
          sub={t.kpiEglisesSubSup}
          accent="amber"
        />
        <KpiCard
          label={t.kpiCellules}
          value={totaux.cellules}
          sub={t.kpiCellulesSub}
          accent="orange"
        />
      </div>

      {/* Ligne 2 : Total culte + Moy. par église + Évangélisés + Baptêmes */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiCard
          label={t.kpiTotalCulte}
          value={totalCulteGlobal}
          sub={t.kpiTotalCulteSub}
          accent="green"
          delta={calcDelta(totalCulteGlobal, prevCulteGlobal)}
        />
        <KpiCard
          label={t.kpiMoyParEglise}
          value={moyenneCulteParEglise}
          sub={t.kpiMoyParEgliseSub}
          accent="blue"
          delta={calcDelta(moyenneCulteParEglise, prevMoy)}
        />
        <KpiCard
          label={t.kpiEvangelises}
          value={totalEvangelisation}
          sub={t.kpiEvangelisesSub}
          accent="pink"
          delta={calcDelta(totalEvangelisation, prevEvangelisation)}
        />
        <KpiCard
          label={t.kpiBaptemes}
          value={totalBapteme}
          sub={t.kpiBaptemesSub}
          accent="purple"
          delta={calcDelta(totalBapteme, prevBapteme)}
        />
      </div>

      {/* Ligne 3 : Taux conversion + Serviteurs */}
      <div className="grid grid-cols-2 gap-3">
        <KpiCard
          label={t.kpiTauxConversion}
          value={`${tauxConversion}%`}
          sub={t.kpiTauxConversionSub}
          accent="yellow"
        />
        <KpiCard
          label={t.kpiServiteurs}
          value={totalServiteurs}
          sub={t.kpiServiteursSubFn(tauxEngagement)}
          accent="teal"
          delta={calcDelta(totalServiteurs, prevServiteurs)}
        />
      </div>

      {/* Répartition H/F/J */}
      <div className="bg-white/10 rounded-2xl px-4 py-4 flex flex-col gap-3">
        <p className="text-sm text-white/50 font-semibold">{t.repartitionTitle}</p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: t.hommes, val: totaux.culteHommes, color: "text-blue-300", bg: "bg-blue-900/40" },
            { label: t.femmes, val: totaux.culteFemmes, color: "text-pink-300", bg: "bg-pink-900/40" },
            { label: t.jeunes, val: totaux.culteJeunes, color: "text-amber-300", bg: "bg-amber-900/40" },
          ].map(({ label, val, color, bg }) => {
            const pct = totalCulte > 0 ? Math.round((val / totalCulte) * 100) : 0;
            return (
              <div key={label} className={`${bg} rounded-xl px-3 py-3 text-center`}>
                <p className={`text-xl font-bold ${color}`}>{val}</p>
                <p className={`text-[11px] ${color}/70`}>{label}</p>
                <p className={`text-[10px] ${color}/50`}>{pct}%</p>
              </div>
            );
          })}
        </div>
        {totalCulte > 0 && (
          <div className="flex h-6 rounded-full overflow-hidden gap-0.5">
            <div className="bg-blue-400 rounded-l-full flex items-center justify-center text-white text-sm font-semibold transition-all"
              style={{ width: `${Math.round((totaux.culteHommes / totalCulte) * 100)}%` }}>{Math.round((totaux.culteHommes / totalCulte) * 100)}%
            </div>        
            <div className="bg-pink-400 flex items-center justify-center text-white text-sm font-semibold transition-all" style={{ width: `${Math.round((totaux.culteFemmes / totalCulte) * 100)}%` }}
            > {Math.round((totaux.culteFemmes / totalCulte) * 100)}% </div>        
            <div className="bg-amber-400 rounded-r-full flex items-center justify-center text-white text-sm font-semibold transition-all"
              style={{ width: `${Math.round((totaux.culteJeunes / totalCulte) * 100)}%` }}>
              {Math.round((totaux.culteJeunes / totalCulte) * 100)}%
            </div>
          </div>
        )}
      </div>

      {/* Entonnoir */}
      {totalCulteGlobal > 0 && (
        <div className="bg-white/10 rounded-2xl px-4 py-4 flex flex-col gap-2">
          <p className="text-xs text-white/50 font-semibold mb-1">{t.entonnoirTitle}</p>
          {[
            { label: t.presencesCulte, val: totalCulteGlobal, color: "bg-emerald-400" },
            { label: t.evangelises, val: totalEvangelisation, color: "bg-pink-400" },
            { label: t.baptises, val: totalBapteme, color: "bg-purple-400" },
            { label: t.serviteurs, val: totalServiteurs, color: "bg-yellow-400" },
          ].map(({ label, val, color }) => (
            <div key={label} className="flex items-center gap-3">
              <p className="text-xs text-white/50 w-28 flex-shrink-0">{label}</p>
              <BarreProgression pct={Math.round((val / totalCulteGlobal) * 100)} color={color} />
              <span className="text-xs text-white font-semibold w-8 text-right">{val}</span>
              <span className="text-[10px] text-white/30 w-8 text-right">
                {Math.round((val / totalCulteGlobal) * 100)}%
              </span>
            </div>
          ))}
        </div>
      )}

      <CarteTop5Besoins besoinsGlobaux={besoinsGlobaux} t={t} />

      {/* Classement des églises */}
      {allEglises.length > 1 && (
        <div className="bg-white/10 rounded-2xl px-4 py-4 flex flex-col gap-2">
          <p className="text-xs text-white/50 font-semibold mb-1">{t.classementTitle}</p>
          {[...allEglises]
            .sort((a, b) => {
              const totA = a.stats.culte.hommes + a.stats.culte.femmes + a.stats.culte.jeunes + a.stats.culte.enfants + a.stats.culte.connectes;
              const totB = b.stats.culte.hommes + b.stats.culte.femmes + b.stats.culte.jeunes + b.stats.culte.enfants + b.stats.culte.connectes;
              return totB - totA;
            })
            .map((e, index) => {
              const tot = e.stats.culte.hommes + e.stats.culte.femmes + e.stats.culte.jeunes + e.stats.culte.enfants + e.stats.culte.connectes;
              const pct = totalCulteGlobal > 0 ? Math.round((tot / totalCulteGlobal) * 100) : 0;
              return (
                <div key={e.id} className="flex items-center gap-3">
                  <span className="text-[11px] font-bold text-white/30 w-4 flex-shrink-0">#{index + 1}</span>
                  <p className="text-xs text-white w-32 flex-shrink-0 truncate">{e.nom}</p>
                  <BarreProgression pct={pct} color="bg-blue-400" />
                  <span className="text-xs text-white font-semibold w-8 text-right">{tot}</span>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}

// ─── BLOC STATS EGLISE ────────────────────────────────────────
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
              <p className="text-xs text-white/50 w-28 flex-shrink-0">{label}</p>
              <BarreProgression pct={Math.round((val / totalCulteGlobal) * 100)} color={color} />
              <span className="text-xs text-white font-semibold w-8 text-right">{val}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── CARTE EGLISE ─────────────────────────────────────────────
function CarteEglise({ eglise, level, expandedEglises, toggleExpand, t }) {
  const isExpanded = expandedEglises.includes(eglise.id);
  const hasChildren = eglise.enfants?.length > 0;
  const totalStats =
    hasChildren && !isExpanded
      ? eglise.enfants.reduce(
          (acc, child) => {
            acc.culte.hommes += child.stats.culte.hommes;
            acc.culte.femmes += child.stats.culte.femmes;
            acc.culte.jeunes += child.stats.culte.jeunes;
            acc.culte.enfants += child.stats.culte.enfants;
            acc.culte.connectes += child.stats.culte.connectes;
            acc.culte.nouveaux_venus += child.stats.culte.nouveaux_venus;
            acc.culte.nouveau_converti += child.stats.culte.nouveau_converti;
            acc.culte.moissonneurs += child.stats.culte.moissonneurs;
            acc.formation.hommes += child.stats.formation.hommes;
            acc.formation.femmes += child.stats.formation.femmes;
            acc.bapteme.hommes += child.stats.bapteme.hommes;
            acc.bapteme.femmes += child.stats.bapteme.femmes;
            acc.evangelisation.hommes += child.stats.evangelisation.hommes;
            acc.evangelisation.femmes += child.stats.evangelisation.femmes;
            acc.evangelisation.priere += child.stats.evangelisation.priere;
            acc.evangelisation.nouveau_converti += child.stats.evangelisation.nouveau_converti;
            acc.evangelisation.reconciliation += child.stats.evangelisation.reconciliation;
            acc.evangelisation.moissonneurs += child.stats.evangelisation.moissonneurs;
            acc.serviteurs.hommes += child.stats.serviteurs.hommes;
            acc.serviteurs.femmes += child.stats.serviteurs.femmes;
            acc.cellules.total += child.stats.cellules.total;
            return acc;
          },
          {
            culte: { ...eglise.stats.culte },
            formation: { ...eglise.stats.formation },
            bapteme: { ...eglise.stats.bapteme },
            evangelisation: { ...eglise.stats.evangelisation },
            serviteurs: { ...eglise.stats.serviteurs },
            cellules: { ...eglise.stats.cellules },
          }
        )
      : eglise.stats;
  const totalCulte = totalStats.culte.hommes + totalStats.culte.femmes + totalStats.culte.jeunes;
  return (
    <div className="flex flex-col gap-2">
      <div
        className={`bg-white/10 rounded-2xl overflow-hidden border-l-2 ${hasChildren ? "border-amber-400" : "border-blue-400"}`}
        style={{ marginLeft: level * 12 }}
      >
        <button
          onClick={() => toggleExpand(eglise.id)}
          className="w-full flex items-center justify-between px-4 py-4 hover:bg-white/5 transition text-left gap-3"
        >
          <div className="flex flex-col gap-0.5 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className={`font-semibold ${hasChildren ? "text-amber-300" : "text-white"}`}>
                {eglise.nom}
              </span>
              {hasChildren && <Badge color="amber">{t.egliseBadgeFn(eglise.enfants.length)}</Badge>}
              {hasChildren && !isExpanded && <Badge color="gray">{t.totalGeneral}</Badge>}
            </div>
            <span className="text-[11px] text-white/40">
              {t.culte} : {totalCulte} · {t.bapteme} : {totalStats.bapteme.hommes + totalStats.bapteme.femmes} · {t.kpiCellules} : {totalStats.cellules.total}
            </span>
          </div>
          <span className="text-white/30 text-xs flex-shrink-0">{isExpanded ? "▲" : "▼"}</span>
        </button>
        {isExpanded && (
          <div className="border-t border-white/10 px-4 pb-4 pt-3">
            <BlocStatsEglise stats={totalStats} t={t} />
          </div>
        )}
      </div>
      {isExpanded &&
        eglise.enfants?.map((child) => (
          <CarteEglise
            key={child.id}
            eglise={child}
            level={level + 1}
            expandedEglises={expandedEglises}
            toggleExpand={toggleExpand}
            t={t}
          />
        ))}
    </div>
  );
}

// ─── PAGE PRINCIPALE ──────────────────────────────────────────
function StatGlobalPage() {
  const { lang } = useLang();
  const t = translations[lang];

  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [eglisesTree, setEglisesTree] = useState([]);
  const [loading, setLoading] = useState(false);
  const [parentFilter, setParentFilter] = useState("");
  const [allEglises, setAllEglises] = useState([]);
  const [rootId, setRootId] = useState(null);
  const [expandedEglises, setExpandedEglises] = useState([]);
  const [onglet, setOnglet] = useState("ensemble");
  const [modePerso, setModePerso] = useState(false);
  const [filtrePeriode, setFiltrePeriode] = useState("30");
  const [hasData, setHasData] = useState(false);
  const [besoinsGlobaux, setBesoinsGlobaux] = useState({});
  const [totalMembresActifs, setTotalMembresActifs] = useState(0);
  const [prevTotaux, setPrevTotaux] = useState(null);
  // ── Taux de présence calculé à partir de la table `presences`
  // (% moyen de membres actifs réellement présents à chaque culte)
  const [tauxPresenceMoyen, setTauxPresenceMoyen] = useState(0);

  useEffect(() => {
    fetchStats(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleExpand = (egliseId) => {
    setExpandedEglises((prev) =>
      prev.includes(egliseId) ? prev.filter((id) => id !== egliseId) : [...prev, egliseId]
    );
  };

  // ── CORRECTION #1 : Cellules actives = cellules avec au moins un membre
  // (statut_suivis = 3, etat_contact != 'supprime'), sans filtre de date.
  const getCellulesActives = async (egliseIds) => {
    const { data: toutesCellules } = await supabase
      .from("cellules")
      .select("id, eglise_id")
      .in("eglise_id", egliseIds);

    if (!toutesCellules?.length) return [];

    const celluleIds = toutesCellules.map((c) => c.id);

    const { data: membresActifs } = await supabase
      .from("membres_complets")
      .select("cellule_id")
      .in("cellule_id", celluleIds)
      .eq("statut_suivis", 3)
      .neq("etat_contact", "supprime");

    const cellulesAvecMembres = new Set((membresActifs || []).map((m) => m.cellule_id));
    return toutesCellules.filter((c) => cellulesAvecMembres.has(c.id));
  };

  // ── Agréger les stats ──
  const buildStatsFromData = (
    egliseIds, attendanceData, formationData, baptemeData,
    evangeData, cellulesActivesData, serviteurData
  ) => {
    const statsMap = {};
    egliseIds.forEach((id) => {
      statsMap[id] = {
        culte: { hommes: 0, femmes: 0, jeunes: 0, enfants: 0, connectes: 0, nouveaux_venus: 0, nouveau_converti: 0, moissonneurs: 0 },
        formation: { hommes: 0, femmes: 0 },
        bapteme: { hommes: 0, femmes: 0 },
        evangelisation: { hommes: 0, femmes: 0, priere: 0, nouveau_converti: 0, reconciliation: 0, moissonneurs: 0 },
        serviteurs: { hommes: 0, femmes: 0 },
        cellules: { total: 0 },
      };
    });

    attendanceData.forEach((s) => {
      const a = statsMap[s.eglise_id]?.culte;
      if (!a) return;
      a.hommes += Number(s.hommes) || 0;
      a.femmes += Number(s.femmes) || 0;
      a.jeunes += Number(s.jeunes) || 0;
      a.enfants += Number(s.enfants) || 0;
      a.connectes += Number(s.connectes) || 0;
      a.nouveaux_venus += Number(s.nouveaux_venus) || 0;
      a.nouveau_converti += Number(s.nouveau_converti) || 0;
      a.moissonneurs += Number(s.moissonneurs) || 0;
    });

    formationData.forEach((f) => {
      const form = statsMap[f.eglise_id]?.formation;
      if (!form) return;
      form.hommes += Number(f.hommes) || 0;
      form.femmes += Number(f.femmes) || 0;
    });

    baptemeData.forEach((b) => {
      const bap = statsMap[b.eglise_id]?.bapteme;
      if (!bap) return;
      bap.hommes += Number(b.hommes) || 0;
      bap.femmes += Number(b.femmes) || 0;
    });

    evangeData.forEach((e) => {
      const ev = statsMap[e.eglise_id]?.evangelisation;
      if (!ev) return;
      ev.hommes += Number(e.hommes) || 0;
      ev.femmes += Number(e.femmes) || 0;
      ev.priere += Number(e.priere) || 0;
      ev.nouveau_converti += Number(e.nouveau_converti) || 0;
      ev.reconciliation += Number(e.reconciliation) || 0;
      ev.moissonneurs += Number(e.moissonneurs) || 0;
    });

    const unique = new Map();
    serviteurData?.forEach((row) => {
      if (row.type !== "ministere") return;
      const key = `${row.eglise_id}_${row.membre_id}`;
      if (!unique.has(key)) unique.set(key, row);
    });
    unique.forEach((row) => {
      if (!row.sexe) return;
      const serv = statsMap[row.eglise_id]?.serviteurs;
      if (!serv) return;
      const sexe = row.sexe.trim().toLowerCase();
      if (sexe === "homme") serv.hommes += 1;
      else if (sexe === "femme") serv.femmes += 1;
    });

    cellulesActivesData.forEach((c) => {
      if (c.eglise_id && statsMap[c.eglise_id]) statsMap[c.eglise_id].cellules.total++;
    });

    return statsMap;
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

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profileData } = await supabase
        .from("profiles")
        .select("eglise_id")
        .eq("id", user.id)
        .single();

      const rootIdValue = profileData.eglise_id;
      setRootId(rootIdValue);

      // La RPC retourne le root + ses descendants — on les garde tous pour les données.
      // Le KPI "Églises supervisées" exclura le root dans BlocVueEnsemble.
      const { data: filteredEglisesData } = await supabase.rpc(
        "get_descendant_eglises",
        { root_id: rootIdValue }
      );

      if (!filteredEglisesData?.length) {
        setEglisesTree([]);
        setAllEglises([]);
        setBesoinsGlobaux({});
        setTotalMembresActifs(0);
        setPrevTotaux(null);
        setTauxPresenceMoyen(0);
        setHasData(false);
        setLoading(false);
        return;
      }

      const egliseIds = filteredEglisesData.map((e) => e.id);

      // ── Membres actifs ──
      const { data: membresActifsData } = await supabase
        .from("membres_complets")
        .select("id, eglise_id, sexe")
        .in("eglise_id", egliseIds)
        .in("etat_contact", ["existant", "nouveau"]);
      setTotalMembresActifs(membresActifsData?.length || 0);

      const tableFetch = async (table, dateField, deb, fi) => {
        let query = supabase.from(table).select("*").in("eglise_id", egliseIds);
        const fmt = (d) => table === "attendance_stats" && d ? toYearMonth(d) : d;
        if (deb) query = query.gte(dateField, fmt(deb));
        if (fi) query = query.lte(dateField, fmt(fi));
        const { data } = await query;
        return data || [];
      };

      // ── Fetch période courante ──
      const [attendanceData, formationData, baptemeData, evangeData, cellulesActivesData] =
        await Promise.all([
          tableFetch("attendance_stats", "mois", debut, fin),
          tableFetch("formations", "date_debut", debut, fin),
          tableFetch("baptemes", "date", debut, fin),
          tableFetch("rapport_evangelisation", "date", debut, fin),
          getCellulesActives(egliseIds),
        ]);

      // ── Taux de présence réel : basé sur la table `presences` ──
      // (une ligne par membre par session de culte, avec statut "present"/"absent")
      const { data: sessionsData } = await supabase
        .from("attendance")
        .select("id, date")
        .in("eglise_id", egliseIds)
        .gte("date", debut || "1900-01-01")
        .lte("date", fin || "2100-01-01");

      const sessionIds = sessionsData?.map((s) => s.id) || [];
      const nombreCultes = sessionIds.length;

      let totalPresents = 0;
      if (sessionIds.length > 0) {
        const { data: presData } = await supabase
          .from("presences")
          .select("statut, attendance_id")
          .in("attendance_id", sessionIds);
        totalPresents = (presData || []).filter((p) => p.statut === "present").length;
      }

      const tauxCalcule =
        membresActifsData?.length > 0 && nombreCultes > 0
          ? Math.round((totalPresents / (membresActifsData.length * nombreCultes)) * 100)
          : 0;
      setTauxPresenceMoyen(tauxCalcule);

      const { data: serviteurData } = await supabase
        .from("stats_ministere_besoin")
        .select("membre_id, eglise_id, sexe, type")
        .in("eglise_id", egliseIds);

      const statsMap = buildStatsFromData(
        egliseIds, attendanceData, formationData, baptemeData,
        evangeData, cellulesActivesData, serviteurData
      );

      // ── Fetch période précédente ──
      if (prevDebut && prevFin) {
        const [pAtt, pForm, pBap, pEvang] = await Promise.all([
          tableFetch("attendance_stats", "mois", prevDebut, prevFin),
          tableFetch("formations", "date_debut", prevDebut, prevFin),
          tableFetch("baptemes", "date", prevDebut, prevFin),
          tableFetch("rapport_evangelisation", "date", prevDebut, prevFin),
        ]);
        const prevMap = buildStatsFromData(
          egliseIds, pAtt, pForm, pBap, pEvang, [], serviteurData
        );
        const pt = {
          culteHommes: 0, culteFemmes: 0, culteJeunes: 0, culteEnfants: 0, culteConnectes: 0,
          baptemeH: 0, baptemeF: 0, evangH: 0, evangF: 0, servH: 0, servF: 0,
        };
        Object.values(prevMap).forEach((s) => {
          pt.culteHommes += s.culte.hommes;
          pt.culteFemmes += s.culte.femmes;
          pt.culteJeunes += s.culte.jeunes;
          pt.culteEnfants += s.culte.enfants;
          pt.culteConnectes += s.culte.connectes;
          pt.baptemeH += s.bapteme.hommes;
          pt.baptemeF += s.bapteme.femmes;
          pt.evangH += s.evangelisation.hommes;
          pt.evangF += s.evangelisation.femmes;
          pt.servH += s.serviteurs.hommes;
          pt.servF += s.serviteurs.femmes;
        });
        setPrevTotaux(pt);
      } else {
        setPrevTotaux(null);
      }

      // ── Besoins ──
      if (membresActifsData?.length) {
        const membreIds = membresActifsData.map((m) => m.id);
        const sexeMap = {};
        membresActifsData.forEach((m) => {
          sexeMap[m.id] = m.sexe?.toLowerCase() === "homme" ? "hommes" : "femmes";
        });
        let suivisQuery = supabase
          .from("suivis")
          .select("membre_id, besoin, date_action")
          .in("membre_id", membreIds);
        if (debut) suivisQuery = suivisQuery.gte("date_action", debut);
        if (fin) suivisQuery = suivisQuery.lte("date_action", fin);
        const { data: suivisData } = await suivisQuery;
        const count = {};
        (suivisData || []).forEach((s) => {
          if (!s.besoin) return;
          const sexe = sexeMap[s.membre_id] || "femmes";
          let items = [];
          try {
            items = Array.isArray(s.besoin) ? s.besoin : JSON.parse(s.besoin);
          } catch { return; }
          items.forEach((item) => {
            const label = typeof item === "string" ? item.trim() : item?.label?.trim();
            const statut = typeof item === "string" ? null : item?.statut;
            if (!label) return;
            if (!count[label]) count[label] = { total: 0, hommes: 0, femmes: 0, enSuivi: 0, resolu: 0 };
            count[label].total++;
            if (sexe === "hommes") count[label].hommes++;
            else count[label].femmes++;
            if (statut === "Résolu") count[label].resolu++;
            else count[label].enSuivi++;
          });
        });
        setBesoinsGlobaux(count);
      }

      // ── Arbre des églises ──
      const map = {};
      filteredEglisesData.forEach((e) => {
        map[e.id] = { ...e, stats: statsMap[e.id], enfants: [] };
      });
      const tree = [];
      Object.values(map).forEach((e) => {
        if (e.parent_eglise_id && map[e.parent_eglise_id])
          map[e.parent_eglise_id].enfants.push(e);
        else tree.push(e);
      });

      setEglisesTree(tree);
      setAllEglises(Object.values(map));
      setHasData(true);
    } catch (err) {
      console.error("Erreur fetch stats:", err);
      setEglisesTree([]);
      setAllEglises([]);
      setBesoinsGlobaux({});
      setTotalMembresActifs(0);
      setPrevTotaux(null);
      setTauxPresenceMoyen(0);
      setHasData(false);
    }
    setLoading(false);
  };

  const handlePeriodeChange = (val) => {
    setFiltrePeriode(val);
    setModePerso(false);
  };

  const parentOptions = allEglises.filter((e) => e.parent_eglise_id === rootId);

  const filteredEglises = (() => {
    if (!parentFilter) return eglisesTree;
    const find = (tree) => {
      for (let e of tree) {
        if (e.id === parentFilter) return e;
        const found = find(e.enfants || []);
        if (found) return found;
      }
      return null;
    };
    const found = find(eglisesTree);
    return found ? [found] : [];
  })();

  const onglets = [
    { key: "ensemble", label: t.ongletEnsemble },
    { key: "eglises", label: t.ongletEglises },
  ];

  return (
    <div
      className="min-h-screen flex flex-col items-center p-4 sm:p-6"
      style={{ background: "#333699" }}
    >
      <HeaderPages />

      <div className="w-full max-w-2xl mt-6 flex flex-col gap-5 mb-10">

        {/* En-tête */}
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

        {/* Filtres */}
        <div className="bg-white/10 rounded-2xl p-4 flex flex-col gap-3">
          <SectionTitle>{t.parametres}</SectionTitle>
          <div className="flex gap-1 bg-white/10 rounded-xl p-1 w-fit">
            <button
              onClick={() => setModePerso(false)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${!modePerso ? "bg-white text-[#333699]" : "text-white/50 hover:text-white/80"}`}
            >
              {t.periodeRapide}
            </button>
            <button
              onClick={() => setModePerso(true)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${modePerso ? "bg-white text-[#333699]" : "text-white/50 hover:text-white/80"}`}
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

        {/* Onglets */}
        {hasData && (
          <div className="flex gap-1 bg-white/10 rounded-xl p-1">
            {onglets.map((o) => (
              <button
                key={o.key}
                onClick={() => setOnglet(o.key)}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition ${
                  onglet === o.key ? "bg-white text-[#333699]" : "text-white/50 hover:text-white/80"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        )}

        {/* Contenu */}
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
              {t.synthese} — {allEglises.length}{" "}
              {allEglises.length > 1 ? t.eglises : t.eglise}
            </SectionTitle>
            <BlocVueEnsemble
              allEglises={allEglises}
              besoinsGlobaux={besoinsGlobaux}
              totalMembresActifs={totalMembresActifs}
              tauxPresenceMoyen={tauxPresenceMoyen}
              prevTotaux={prevTotaux}
              rootId={rootId}
              t={t}
            />
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {parentOptions.length > 0 && (
              <div className="flex flex-col gap-1">
                <label className="text-xs text-white/50">{t.filtrerEglise}</label>
                <select
                  value={parentFilter}
                  onChange={(e) => setParentFilter(e.target.value)}
                  className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-white/40 appearance-none cursor-pointer"
                >
                  <option value="" className="bg-[#2a2d80]">{t.toutesEglises}</option>
                  {parentOptions.map((e) => (
                    <option key={e.id} value={e.id} className="bg-[#2a2d80]">{e.nom}</option>
                  ))}
                </select>
              </div>
            )}
            <SectionTitle>
              {filteredEglises.length}{" "}
              {filteredEglises.length > 1 ? t.eglises : t.eglise}{" "}
              {filteredEglises.length > 1 ? t.affichees : t.affichee}
            </SectionTitle>
            {filteredEglises.map((eglise) => (
              <CarteEglise
                key={eglise.id}
                eglise={eglise}
                level={0}
                expandedEglises={expandedEglises}
                toggleExpand={toggleExpand}
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
