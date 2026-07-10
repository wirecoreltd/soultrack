// ═══════════════════════════════════════════════════════════════
// PAGE : Tableau de Bord Évangélisation (RapportEvangelisation)
// ═══════════════════════════════════════════════════════════════
// (commentaires d'en-tête inchangés — voir version originale)
// ═══════════════════════════════════════════════════════════════

"use client";

import { useEffect, useState, useRef } from "react";
import supabase from "../../lib/supabaseClient";
import EditEvanRapportLine from "../../components/EditEvanRapportLine";
import HeaderPages from "../../components/HeaderPages";
import Footer from "../../components/Footer";
import { useRouter } from "next/navigation";
import { useLang } from "../../hooks/useLang";

const translations = {
  fr: {
    pageTitle: "Tableau de Bord",
    pageTitleAccent: " Évangélisation",
    pageIntro: "Suivez et analysez facilement vos activités d'évangélisation. Filtrez par date et type, visualisez les rapports détaillés et consultez rapidement les KPIs :",
    pageIntroAccent: "évangélisés, convertis, intégrés en cellule ou à l'église, et suivis en cours",

    periodeRapide: "Période rapide",
    trancheDates: "Tranche de dates",
    periode: "Période :",
    dateDebut: "Date de début",
    dateFin: "Date de fin",
    genererRapport: "Générer le rapport",
    typeEvangelisation: "Type :",
    tousTypes: "Tous les types",
    periodes: [
      { label: "7 j", val: "7" },
      { label: "30 j", val: "30" },
      { label: "90 j", val: "90" },
      { label: "6 mois", val: "180" },
      { label: "1 an", val: "365" },
    ],

    ongletKpi: "Vue d'ensemble",
    ongletType: "Par type",

    sectionVue: "Vue d'ensemble",
    sectionEntonnoir: "Entonnoir de conversion",
    sectionTendance: "Tendance mensuelle",
    sectionParType: "Résultats par type d'évangélisation",

    kpiEvangelises: "Évangélisés",
    kpiConvertis: "Convertis",
    kpiIntegres: "Intégrés",
    kpiEnCours: "En cours",
    kpiEnvoyes: "Envoyés au suivi",
    kpiNonEnvoyes: "Non envoyés",
    kpiRefus: "Refus",
    kpiMoissonneurs: "Moissonneurs",
    kpiIntegreCellule: "Intégrés en cellule",
    kpiIntegreEglise: "Intégrés à l'église",
    surPeriode: "sur la période",
    prieresLabel: "prières du salut",
    personnes: "personnes",
    desSuivi: "de suivi",
    desEvangelises: "des évangélisés",
    desSuivis: "des suivis",
    impliques: "impliqués",

    entonnoirEvangelises: "Évangélisés",
    entonnoirEnvoyes: "Envoyés au suivi",
    entonnoirConvertis: "Convertis",
    entonnoirIntegres: "Intégrés",
    aucuneDonnee: "Aucune donnée",
    donneesInsuffisantes: "Données insuffisantes (≥ 2 mois)",

    vsMoisPrec: "vs mois préc.",
    legendeEvangelises: "Évangélisés",
    legendeConvertis: "Convertis",

    nonDefini: "Non défini",
    modifier: "✏️ Modifier",
    rapportPluriel: "rapport",
    rapportPlurielS: "rapports",
    hommes: "Hommes",
    femmes: "Femmes",
    total: "Total",
    priereSalut: "Prière du salut",
    nvConvertis: "Nv. convertis",
    reconciliation: "Réconciliation",
    moissonneurs: "Moissonneurs",
    prieres: "Prières",
    nvConv: "Nv. conv.",
    moiss: "Moiss.",

    aucuneDonneePeriode: "Aucune donnée sur cette période",
    aucunRapport: "Aucun rapport sur cette période",
    rapportMaj: "✅ Rapport mis à jour !",

    typesEvangelisation: [
      "Individuel",
      "Sortie de groupe",
      "Campagne d'évangélisation",
      "Évangélisation de rue",
      "Évangélisation maison",
      "Évangélisation stade",
    ],
    typeEvangOptions: {
      "Individuel": "Individuel",
      "Sortie de groupe": "Sortie de groupe",
      "Campagne d'évangélisation": "Campagne d'évangélisation",
      "Évangélisation de rue": "Évangélisation de rue",
      "Évangélisation maison": "Évangélisation maison",
      "Évangélisation stade": "Évangélisation stade",
    },

    mois: ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"],
  },
  en: {
    pageTitle: "Dashboard",
    pageTitleAccent: " Evangelism",
    pageIntro: "Easily track and analyze your evangelism activities. Filter by date and type, view detailed reports and quickly check KPIs:",
    pageIntroAccent: "evangelized, converted, integrated in cell or church, and follow-ups in progress",

    periodeRapide: "Quick period",
    trancheDates: "Date range",
    periode: "Period:",
    dateDebut: "Start date",
    dateFin: "End date",
    genererRapport: "Generate report",
    typeEvangelisation: "Type:",
    tousTypes: "All types",
    periodes: [
      { label: "7 d", val: "7" },
      { label: "30 d", val: "30" },
      { label: "90 d", val: "90" },
      { label: "6 mo", val: "180" },
      { label: "1 yr", val: "365" },
    ],

    ongletKpi: "Overview",
    ongletType: "By type",

    sectionVue: "Overview",
    sectionEntonnoir: "Conversion funnel",
    sectionTendance: "Monthly trend",
    sectionParType: "Results by evangelism type",

    kpiEvangelises: "Evangelized",
    kpiConvertis: "Converted",
    kpiIntegres: "Integrated",
    kpiEnCours: "In progress",
    kpiEnvoyes: "Sent to follow-up",
    kpiNonEnvoyes: "Not sent",
    kpiRefus: "Refused",
    kpiMoissonneurs: "Harvesters",
    kpiIntegreCellule: "Integrated in cell",
    kpiIntegreEglise: "Integrated in church",
    surPeriode: "over the period",
    prieresLabel: "salvation prayers",
    personnes: "people",
    desSuivi: "in follow-up",
    desEvangelises: "of evangelized",
    desSuivis: "of follow-ups",
    impliques: "involved",

    entonnoirEvangelises: "Evangelized",
    entonnoirEnvoyes: "Sent to follow-up",
    entonnoirConvertis: "Converted",
    entonnoirIntegres: "Integrated",
    aucuneDonnee: "No data",
    donneesInsuffisantes: "Insufficient data (≥ 2 months)",

    vsMoisPrec: "vs prev. month",
    legendeEvangelises: "Evangelized",
    legendeConvertis: "Converted",

    nonDefini: "Not defined",
    modifier: "✏️ Edit",
    rapportPluriel: "report",
    rapportPlurielS: "reports",
    hommes: "Men",
    femmes: "Women",
    total: "Total",
    priereSalut: "Salvation prayer",
    nvConvertis: "New converts",
    reconciliation: "Reconciliation",
    moissonneurs: "Harvesters",
    prieres: "Prayers",
    nvConv: "New conv.",
    moiss: "Harv.",

    aucuneDonneePeriode: "No data for this period",
    aucunRapport: "No reports for this period",
    rapportMaj: "✅ Report updated!",

    typesEvangelisation: [
      "Individuel",
      "Sortie de groupe",
      "Campagne d'évangélisation",
      "Évangélisation de rue",
      "Évangélisation maison",
      "Évangélisation stade",
    ],
    typeEvangOptions: {
      "Individuel": "Individual",
      "Sortie de groupe": "Group outing",
      "Campagne d'évangélisation": "Evangelism campaign",
      "Évangélisation de rue": "Street evangelism",
      "Évangélisation maison": "House evangelism",
      "Évangélisation stade": "Stadium evangelism",
    },

    mois: ["January","February","March","April","May","June","July","August","September","October","November","December"],
  },
};

// ─── HELPERS ──────────────────────────────────────────────────
function formatDateFr(dateStr) {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "2-digit", month: "short", year: "numeric",
  });
}
function getMonthName(monthIndex, moisArray) {
  return moisArray[monthIndex] || "";
}
function getMapLabel(map, value) {
  if (!value) return "—";
  return map[value] || value;
}

// ─── UI ATOMS ─────────────────────────────────────────────────
function SectionTitle({ children }) {
  return <p className="text-sm font-semibold uppercase tracking-widest text-white/80 mb-3">{children}</p>;
}
function KpiCard({ label, value, sub, accent, onClick }) {
  const c = {
    green: "text-emerald-400", red: "text-red-400", amber: "text-amber-400",
    white: "text-white", blue: "text-blue-300", pink: "text-pink-300",
    purple: "text-purple-300", teal: "text-teal-300", orange: "text-orange-300", gray: "text-white/80",
  };
  return (
    <div onClick={onClick}
      className={`bg-white/10 rounded-2xl px-4 py-4 flex flex-col gap-1 ${onClick ? "cursor-pointer hover:bg-white/15 active:scale-95 transition" : ""}`}>
      <p className="text-sm text-white">{label}</p>
      <p className={`text-2xl font-bold leading-none ${c[accent] || "text-white"}`}>{value}</p>
      {sub && <p className="text-xs text-white/60 mt-0.5">{sub}</p>}
    </div>
  );
}
function Badge({ children, color }) {
  const m = {
    green: "bg-emerald-900/60 text-emerald-300", red: "bg-red-900/60 text-red-300",
    amber: "bg-amber-900/60 text-amber-300", blue: "bg-blue-900/60 text-blue-300",
    purple: "bg-purple-900/60 text-purple-300", gray: "bg-white/10 text-white/50",
    pink: "bg-pink-900/60 text-pink-300", teal: "bg-teal-900/60 text-teal-300",
    orange: "bg-orange-900/60 text-orange-300",
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

// ─── CALCUL TOTAUX ─────────────────────────────────────────────
function getTotals(reports) {
  let hommes = 0, femmes = 0, priere = 0, nouveau = 0, reconciliation = 0, moissonneurs = 0;
  (reports || []).forEach(r => {
    hommes += Number(r.hommes) || 0;
    femmes += Number(r.femmes) || 0;
    priere += Number(r.priere) || 0;
    nouveau += Number(r.nouveau_converti) || 0;
    reconciliation += Number(r.reconciliation) || 0;
    moissonneurs += Number(r.moissonneurs) || 0;
  });
  return { hommes, femmes, total: hommes + femmes, priere, nouveau, reconciliation, moissonneurs };
}

// ─── BLOC KPI GLOBAUX ──────────────────────────────────────────
function BlocKpiGlobaux({ filteredEvangelises, filteredSuivis, rapports, onKpiClick, onCelluleClick, onConseillerClick, t }) {
  const totalEvangelises = filteredEvangelises.length;
  const totalEnvoyes = filteredEvangelises.filter(e => e.status_suivi === "Envoyé").length;
  const totalNonEnvoyes = filteredEvangelises.filter(e => e.status_suivi !== "Envoyé").length;
  const totalConvertis = filteredEvangelises.filter(e => e.priere_salut === true).length;
  const normalize = (str) => (str ? str.trim() : "");
  const totalIntegres = filteredSuivis.filter(s => normalize(s.status_suivis_evangelises) === "Intégré").length;
  const totalEncours = filteredSuivis.filter(s => normalize(s.status_suivis_evangelises) === "En cours").length;
  const totalRefus = filteredSuivis.filter(s => normalize(s.status_suivis_evangelises) === "Refus").length;
  const totalCellule = filteredSuivis.filter(s => s.cellule_id != null).length;
  const totalEglise = filteredSuivis.filter(s => s.conseiller_id != null).length;
  const pct = (n) => totalEvangelises > 0 ? Math.round((n / totalEvangelises) * 100) : 0;

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiCard label={t.kpiEvangelises} value={totalEvangelises} sub={t.surPeriode} accent="white" onClick={() => onKpiClick(null)} />
        <KpiCard label={t.kpiConvertis} value={`${pct(totalConvertis)}%`} sub={`${totalConvertis} ${t.prieresLabel}`} accent="pink" onClick={() => onKpiClick("Converti")} />
        <KpiCard label={t.kpiIntegres} value={`${pct(totalIntegres)}%`} sub={`${totalIntegres} ${t.personnes}`} accent="green" onClick={() => onKpiClick("Intégré")} />
        <KpiCard label={t.kpiEnCours} value={totalEncours} sub={t.desSuivi} accent="amber" onClick={() => onKpiClick("En cours")} />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiCard label={t.kpiEnvoyes} value={totalEnvoyes} sub={`${pct(totalEnvoyes)}% ${t.desEvangelises}`} accent="purple" onClick={() => onKpiClick("Envoyé")} />
        <KpiCard label={t.kpiNonEnvoyes} value={totalNonEnvoyes} sub={`${pct(totalNonEnvoyes)}%`} accent="gray" onClick={() => onKpiClick("NonEnvoye")} />
        <KpiCard label={t.kpiRefus} value={totalRefus} sub={`${pct(totalRefus)}%`} accent="red" onClick={() => onKpiClick("Refus")} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <KpiCard label={t.kpiIntegreCellule} value={totalCellule} sub={filteredSuivis.length > 0 ? `${Math.round((totalCellule / filteredSuivis.length) * 100)}% ${t.desSuivis}` : "—"} accent="blue" onClick={onCelluleClick} />
        <KpiCard label={t.kpiIntegreEglise} value={totalEglise} sub={filteredSuivis.length > 0 ? `${Math.round((totalEglise / filteredSuivis.length) * 100)}% ${t.desSuivis}` : "—"} accent="teal" onClick={onConseillerClick} />
      </div>
    </div>
  );
}

// ─── BLOC ENTONNOIR ─────────────────────────────────────────────
function BlocEntonnoir({ filteredEvangelises, filteredSuivis, t }) {
  const total = filteredEvangelises.length;
  if (!total) return <p className="text-white/30 text-sm text-center py-4">{t.aucuneDonnee}</p>;
  const normalize = (str) => (str ? str.trim() : "");
  const envoyes = filteredEvangelises.filter(e => e.status_suivi === "Envoyé").length;
  const integres = filteredSuivis.filter(s => normalize(s.status_suivis_evangelises) === "Intégré").length;
  const convertis = filteredEvangelises.filter(e => e.priere_salut === true).length;

  const etapes = [
    { label: t.entonnoirEvangelises, val: total, pct: 100, color: "bg-blue-400" },
    { label: t.entonnoirEnvoyes, val: envoyes, pct: Math.round((envoyes / total) * 100), color: "bg-purple-400" },
    { label: t.entonnoirConvertis, val: convertis, pct: Math.round((convertis / total) * 100), color: "bg-pink-400" },
    { label: t.entonnoirIntegres, val: integres, pct: Math.round((integres / total) * 100), color: "bg-emerald-400" },
  ];

  return (
    <div className="flex flex-col gap-2">
      {etapes.map(({ label, val, pct, color }) => (
        <div key={label} className="flex items-center gap-3">
          <p className="text-sm text-white/80 w-36 flex-shrink-0">{label}</p>
          <BarreProgression pct={pct} color={color} />
          <span className="text-xs font-bold text-white w-8 text-right">{val}</span>
          <span className="text-[11px] text-white/80 w-9 text-right">{pct}%</span>
        </div>
      ))}
    </div>
  );
}

// ─── BLOC PAR TYPE D'ÉVANGÉLISATION ────────────────────────────
function BlocParType({ filteredEvangelises, rapports, t }) {
  const parType = {};
  filteredEvangelises.forEach(e => {
    const type = e.type_evangelisation || t.nonDefini;
    if (!parType[type]) parType[type] = { nb: 0, convertis: 0 };
    parType[type].nb++;
    if (e.priere_salut) parType[type].convertis++;
  });
  const max = Math.max(...Object.values(parType).map(v => v.nb), 1);
  const lignes = Object.entries(parType).sort((a, b) => b[1].nb - a[1].nb);
  if (!lignes.length) return <p className="text-white/30 text-sm text-center py-4">{t.aucuneDonnee}</p>;

  return (
    <div className="flex flex-col gap-2">
      {lignes.map(([type, { nb, convertis }]) => (
        <div key={type} className="bg-white/10 rounded-xl px-4 py-3 flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <p className="text-sm text-white w-40 flex-shrink-0 truncate">{type === t.nonDefini ? type : getMapLabel(t.typeEvangOptions, type)}</p>
            <BarreProgression pct={(nb / max) * 100} color="bg-blue-400" />
            <span className="text-sm font-bold text-white w-8 text-right">{nb}</span>
          </div>
          <div className="flex gap-2 ml-40">
            <Badge color="pink">{t.kpiConvertis}: {convertis}</Badge>
            <Badge color="green">{nb > 0 ? Math.round((convertis / nb) * 100) : 0}%</Badge>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── BLOC TENDANCE MENSUELLE ───────────────────────────────────
function BlocTendance({ filteredEvangelises, t }) {
  const parMois = {};
  filteredEvangelises.forEach(e => {
    if (!e.date_evangelise) return;
    const d = new Date(e.date_evangelise);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!parMois[key]) parMois[key] = { nb: 0, convertis: 0, label: `${getMonthName(d.getMonth(), t.mois).slice(0, 3)} ${d.getFullYear()}` };
    parMois[key].nb++;
    if (e.priere_salut) parMois[key].convertis++;
  });
  const mois = Object.entries(parMois).sort(([a], [b]) => a.localeCompare(b)).slice(-8);
  if (mois.length < 2) return <p className="text-white/30 text-sm text-center py-4">{t.donneesInsuffisantes}</p>;
  const maxNb = Math.max(...mois.map(([, v]) => v.nb), 1);
  const derniere = mois[mois.length - 1][1];
  const avantDerniere = mois[mois.length - 2][1];
  const delta = derniere.nb - avantDerniere.nb;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <span className="text-2xl font-bold text-white">{derniere.nb}</span>
        <span className={`text-sm font-semibold ${delta >= 0 ? "text-emerald-400" : "text-red-400"}`}>
          {delta >= 0 ? "▲" : "▼"} {Math.abs(delta)} {t.vsMoisPrec}
        </span>
      </div>
      <div className="flex items-end gap-1 h-16">
        {mois.map(([key, { nb, convertis, label }]) => (
          <div key={key} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full flex gap-0.5 items-end" style={{ height: "52px" }}>
              <div className="flex-1 bg-blue-500/70 rounded-t-sm" style={{ height: `${Math.max(3, (nb / maxNb) * 52)}px` }} />
              <div className="flex-1 bg-pink-500/70 rounded-t-sm" style={{ height: `${Math.max(2, (convertis / maxNb) * 52)}px` }} />
            </div>
            <p className="text-[9px] text-white/30 truncate w-full text-center">{label}</p>
          </div>
        ))}
      </div>
      <div className="flex gap-3 text-[11px] text-white/40">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-blue-500/70 inline-block" /> {t.legendeEvangelises}</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-pink-500/70 inline-block" /> {t.legendeConvertis}</span>
      </div>
    </div>
  );
}

// ─── CARTE SESSION ─────────────────────────────────────────────
function CarteSession({ r, onEdit, t }) {
  const [open, setOpen] = useState(false);
  const total = (Number(r.hommes) || 0) + (Number(r.femmes) || 0);
  return (
    <div className="bg-white/10 rounded-2xl overflow-hidden">
      <button onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition text-left gap-3">
        <div className="flex flex-col gap-0.5">
          <span className="font-semibold text-white text-sm">{getMapLabel(t.typeEvangOptions, r.type_evangelisation) || t.nonDefini}</span>
          <span className="text-[11px] text-white/60">{formatDateFr(r.date_evangelise)}</span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Badge color="blue">H {r.hommes ?? 0}</Badge>
          <Badge color="pink">F {r.femmes ?? 0}</Badge>
          <Badge color="amber">{t.total} {total}</Badge>
          <span className="text-white/30 text-xs">{open ? "▲" : "▼"}</span>
        </div>
      </button>
      {open && (
        <div className="border-t border-white/10 px-4 pb-4 pt-3 flex flex-col gap-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              { label: t.hommes, value: r.hommes, color: "text-blue-300" },
              { label: t.femmes, value: r.femmes, color: "text-pink-300" },
              { label: t.total, value: total, color: "text-amber-300 font-bold" },
              { label: t.priereSalut, value: r.priere, color: "text-emerald-300" },
              { label: t.nvConvertis, value: r.nouveau_converti, color: "text-white" },
              { label: t.reconciliation, value: r.reconciliation, color: "text-white" },
              { label: t.moissonneurs, value: r.moissonneurs, color: "text-teal-300" },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-white/5 rounded-xl px-3 py-2 flex flex-col">
                <p className="text-[10px] text-white/40">{label}</p>
                <p className={`text-lg font-bold ${color}`}>{value ?? 0}</p>
              </div>
            ))}
          </div>
          <button onClick={() => onEdit(r)}
            className="w-full py-2 rounded-xl bg-blue-600/40 hover:bg-blue-600/60 text-blue-300 text-sm font-semibold transition">
            {t.modifier}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── ONGLET PAR TYPE ──────────────────────────────────────────
function OngletParType({ rapports, onEdit, t }) {
  const [expandedTypes, setExpandedTypes] = useState({});

  const grouped = {};
  rapports.forEach(r => {
    const type = r.type_evangelisation || t.nonDefini;
    if (!grouped[type]) grouped[type] = [];
    grouped[type].push(r);
  });

  if (!Object.keys(grouped).length) return <p className="text-white/30 text-sm text-center py-8">{t.aucunRapport}</p>;

  return (
    <div className="flex flex-col gap-3">
      {Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b, "fr")).map(([type, rows]) => {
        const isOpen = expandedTypes[type];
        const typeTotals = getTotals(rows);
        return (
          <div key={type} className="bg-white/10 rounded-2xl overflow-hidden">
            <button onClick={() => setExpandedTypes(p => ({ ...p, [type]: !p[type] }))}
              className="w-full flex items-center justify-between px-4 py-4 hover:bg-white/5 transition text-left gap-3">
              <div className="flex flex-col gap-0.5">
                <span className="font-semibold text-white text-sm">{type === t.nonDefini ? type : getMapLabel(t.typeEvangOptions, type)}</span>
                <span className="text-[11px] text-white/60">
                  {rows.length} {rows.length > 1 ? t.rapportPlurielS : t.rapportPluriel}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Badge color="blue">H {typeTotals.hommes}</Badge>
                <Badge color="pink">F {typeTotals.femmes}</Badge>
                <Badge color="amber">{t.total} {typeTotals.total}</Badge>
                <Badge color="green">🙏 {typeTotals.priere}</Badge>
                <span className="text-white/30 text-xs">{isOpen ? "▲" : "▼"}</span>
              </div>
            </button>
            {isOpen && (
              <div className="border-t border-white/10 px-4 pb-4 pt-3 flex flex-col gap-2">
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-2">
                  {[
                    { label: t.hommes, value: typeTotals.hommes, color: "text-blue-300" },
                    { label: t.femmes, value: typeTotals.femmes, color: "text-pink-300" },
                    { label: t.total, value: typeTotals.total, color: "text-amber-300 font-bold" },
                    { label: t.prieres, value: typeTotals.priere, color: "text-emerald-300" },
                    { label: t.nvConv, value: typeTotals.nouveau, color: "text-white" },
                    { label: t.moiss, value: typeTotals.moissonneurs, color: "text-teal-300" },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="bg-white/5 rounded-xl px-2 py-2 text-center">
                      <p className="text-[10px] text-white/40">{label}</p>
                      <p className={`text-base font-bold ${color}`}>{value}</p>
                    </div>
                  ))}
                </div>
                {rows.sort((a, b) => new Date(b.date_evangelise) - new Date(a.date_evangelise)).map(r => (
                  <CarteSession key={r.id} r={r} onEdit={onEdit} t={t} />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── PAGE PRINCIPALE ───────────────────────────────────────────
export default function RapportEvangelisation() {
  const router = useRouter();
  const { lang } = useLang();
  const t = translations[lang];

  const [rapports, setRapports] = useState([]);
  const [allEvangelises, setAllEvangelises] = useState([]);
  const [filteredEvangelises, setFilteredEvangelises] = useState([]);
  const [filteredSuivis, setFilteredSuivis] = useState([]);
  const [loading, setLoading] = useState(false);
  const [egliseId, setEgliseId] = useState(null);
  const [onglet, setOnglet] = useState("kpi");

  const [modePerso, setModePerso] = useState(false);
  const [filtrePeriode, setFiltrePeriode] = useState("30");
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [filtreType, setFiltreType] = useState("");

  const [editOpen, setEditOpen] = useState(false);
  const [selectedRapport, setSelectedRapport] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;
      if (!user) return;
      const { data: profile } = await supabase.from("profiles").select("eglise_id").eq("id", user.id).single();
      if (profile) setEgliseId(profile.eglise_id);
    };
    fetchProfile();
  }, []);

  const fetchRapports = async (overrideModePerso = null) => {
    if (!egliseId) return;
    setLoading(true);
    const isPerso = overrideModePerso !== null ? overrideModePerso : modePerso;

    let startDate = null;
    let endDate = null;
    if (isPerso) {
      if (dateDebut) startDate = new Date(dateDebut);
      if (dateFin) { endDate = new Date(dateFin); endDate.setHours(23, 59, 59, 999); }
    } else {
      startDate = new Date();
      startDate.setDate(startDate.getDate() - Number(filtrePeriode));
    }

    try {
      const { data: evangelisesData } = await supabase
        .from("evangelises")
        .select("id, eglise_id, date_evangelise, type_evangelisation, status_suivi, priere_salut")
        .eq("eglise_id", egliseId).neq("status_suivi", "supprime");
      setAllEvangelises(evangelisesData || []);

      const filtered = (evangelisesData || []).filter(e => {
        const d = e.date_evangelise ? new Date(e.date_evangelise) : null;
        const afterStart = !startDate || (d && d >= startDate);
        const beforeEnd = !endDate || (d && d <= endDate);
        const typeOk = !filtreType || filtreType === "Tous" || e.type_evangelisation === filtreType;
        return afterStart && beforeEnd && typeOk;
      });
      setFilteredEvangelises(filtered);

      let query = supabase
        .from("rapport_evangelisation")
        .select(
          "id, eglise_id, evangelise_member_id, date_evangelise, type_evangelisation, hommes, femmes, priere, nouveau_converti, reconciliation, moissonneurs"
        )
        .eq("eglise_id", egliseId)
        .in("evangelise_member_id", filtered.map(e => e.id))
        .order("date_evangelise", { ascending: false });
      if (startDate) query = query.gte("date_evangelise", startDate.toISOString());
      if (endDate) query = query.lte("date_evangelise", endDate.toISOString());
      const { data: rapportsData } = await query;
      setRapports(rapportsData || []);

      const { data: suivisData } = await supabase
        .from("suivis_des_evangelises")
        .select("id, eglise_id, evangelise_id, date_suivi, type_evangelisation, status_suivis_evangelises, cellule_id, conseiller_id")
        .eq("eglise_id", egliseId);
      const evangeliseIds = new Set(filtered.map(e => e.id));
      const filteredSuivisFinal = (suivisData || []).filter(s => {
        const d = s.date_suivi ? new Date(s.date_suivi) : null;
        const afterStart = !startDate || (d && d >= startDate);
        const beforeEnd = !endDate || (d && d <= endDate);
        const typeOk = !filtreType || filtreType === "Tous" || s.type_evangelisation === filtreType;
        return evangeliseIds.has(s.evangelise_id) && afterStart && beforeEnd && typeOk;
      });
      setFilteredSuivis(filteredSuivisFinal);

    } catch (err) {
      console.error("Erreur fetchRapports:", err);
    }
    setLoading(false);
  };

  useEffect(() => { if (egliseId && !modePerso) fetchRapports(false); }, [egliseId, filtrePeriode, filtreType, modePerso]);

  const handleSaveRapport = async (updated) => {
    await supabase.from("rapport_evangelisation").upsert(updated);
    fetchRapports();
    setMessage(t.rapportMaj);
    setTimeout(() => setMessage(""), 3000);
  };

  const handleEdit = (r) => { setSelectedRapport(r); setEditOpen(true); };

  const handleKpiClick = (status) => {
    const ids = filteredEvangelises.map(e => e.id);
    router.push({ pathname: "/SuiviAmesPage", query: { status: status || "all", ids: ids.join(",") } });
  };

  const onglets = [
    { key: "kpi", label: t.ongletKpi },
    { key: "type", label: t.ongletType },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center p-4 sm:p-6" style={{ background: "#333699" }}>
      <HeaderPages />

      <div className="w-full max-w-2xl mt-6 flex flex-col gap-5 mb-10">

        {/* En-tête */}
        <div className="text-center">
          <h1 className="text-2xl font-bold mt-4 mb-2 text-blue-300 text-center text-white">
            {t.pageTitle}<span className="text-emerald-300">{t.pageTitleAccent}</span>
          </h1>
          <p className="italic text-base text-white/90">
            {t.pageIntro}{" "}
            <span className="text-blue-300 font-semibold">{t.pageIntroAccent}</span>.
          </p>
        </div>

        {/* Filtres */}
        <div className="bg-white/10 rounded-2xl p-4 flex flex-col gap-3">
          <div className="flex gap-1 bg-white/10 rounded-xl p-1 w-fit">
            <button onClick={() => setModePerso(false)}
              className={`px-3 py-1 rounded-lg text-sm font-semibold transition ${!modePerso ? "bg-white text-[#333699]" : "text-white/60 hover:text-white/80"}`}>
              {t.periodeRapide}
            </button>
            <button onClick={() => setModePerso(true)}
              className={`px-3 py-1 rounded-lg text-sm font-semibold transition ${modePerso ? "bg-white text-[#333699]" : "text-white/60 hover:text-white/80"}`}>
              {t.trancheDates}
            </button>
          </div>

          {!modePerso && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-white/60 flex-shrink-0">{t.periode}</span>
              <div className="flex gap-1 bg-white/10 rounded-xl p-1 flex-wrap">
                {t.periodes.map(p => (
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
              <button onClick={() => fetchRapports(true)}
                className="w-full py-2 rounded-xl bg-amber-500/80 hover:bg-amber-500 text-white text-sm font-semibold transition active:scale-95">
                {t.genererRapport}
              </button>
            </div>
          )}

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-white/80 flex-shrink-0">{t.typeEvangelisation}</span>
            <select value={filtreType} onChange={e => setFiltreType(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-xl px-3 py-1.5 text-white text-sm focus:outline-none focus:border-white/40 appearance-none cursor-pointer">
              <option value="" className="bg-[#2a2d80]">{t.tousTypes}</option>
              {t.typesEvangelisation.map(type => (
                <option key={type} value={type} className="bg-[#2a2d80]">{getMapLabel(t.typeEvangOptions, type)}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Onglets */}
        <div className="flex gap-1 bg-white/10 rounded-xl p-1">
          {onglets.map(o => (
            <button key={o.key} onClick={() => setOnglet(o.key)}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition whitespace-nowrap ${onglet === o.key ? "bg-white text-[#333699]" : "text-white/80 hover:text-white"}`}>
              {o.label}
            </button>
          ))}
        </div>

        {/* Contenu */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
          </div>
        ) : filteredEvangelises.length === 0 ? (
          <div className="bg-white/10 rounded-2xl p-8 text-center text-white/60 text-sm">
            {t.aucuneDonneePeriode}
          </div>
        ) : onglet === "kpi" ? (
          <div className="flex flex-col gap-7">

            <div>
              <SectionTitle>{t.sectionVue}</SectionTitle>
              <BlocKpiGlobaux
                filteredEvangelises={filteredEvangelises}
                filteredSuivis={filteredSuivis}
                rapports={rapports}
                onKpiClick={handleKpiClick}
                onCelluleClick={() => router.push("/SuiviAmesPage?cellule=true")}
                onConseillerClick={() => router.push("/SuiviAmesPage?conseiller=true")}
                t={t}
              />
            </div>

            <div>
              <SectionTitle>{t.sectionEntonnoir}</SectionTitle>
              <div className="bg-white/10 rounded-2xl px-4 py-4">
                <BlocEntonnoir filteredEvangelises={filteredEvangelises} filteredSuivis={filteredSuivis} t={t} />
              </div>
            </div>

            <div>
              <SectionTitle>{t.sectionTendance}</SectionTitle>
              <div className="bg-white/10 rounded-2xl px-4 py-4">
                <BlocTendance filteredEvangelises={filteredEvangelises} t={t} />
              </div>
            </div>

            <div>
              <SectionTitle>{t.sectionParType}</SectionTitle>
              <BlocParType filteredEvangelises={filteredEvangelises} rapports={rapports} t={t} />
            </div>

          </div>

        ) : (
          <OngletParType rapports={rapports} onEdit={handleEdit} t={t} />
        )}

        {message && <p className="text-center text-sm font-medium text-white/80 mt-2">{message}</p>}

      </div>

      {selectedRapport && (
        <EditEvanRapportLine
          isOpen={editOpen}
          onClose={() => setEditOpen(false)}
          rapport={selectedRapport}
          onSave={handleSaveRapport}
        />
      )}

      <Footer />
    </div>
  );
}
