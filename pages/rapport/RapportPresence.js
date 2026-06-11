"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import supabase from "../../lib/supabaseClient";
import HeaderPages from "../../components/HeaderPages";
import ProtectedRoute from "../../components/ProtectedRoute";
import Footer from "../../components/Footer";
import { useLang } from "../../hooks/useLang";
import { useFeature } from "../../components/FeaturesContext";

const translations = {
  fr: {
    pageTitle: "Rapport de présences",
    pageSubtitle: "Suivi pastoral & indicateurs de fidélité",
    periodLabel: "Période :",
    typeLabel: "Type :",
    tous: "Tous",
    periods: [
      { label: "7 j", val: "7" },
      { label: "30 j", val: "30" },
      { label: "90 j", val: "90" },
      { label: "6 mois", val: "180" },
    ],
    tabKpi: "Vue d'ensemble",
    tabCellules: "Cellules",
    tabFamilles: "Familles",
    tabSessions: "Par session",
    noSession: "Aucune session sur cette période",
    kpiSessions: "Sessions",
    kpiSessionsSub: "sur la période",
    kpiTauxMoyen: "Taux moyen",
    kpiTauxSub: "de présence",
    kpiMembres: "Membres suivis",
    kpiMembresSub: "actifs",
    kpiAlertes: "En alerte",
    kpiAlertesSub: "≥ 3 abs. consécutives",
    sectionOverview: "Vue d'ensemble",
    sectionSegmentation: "Segmentation fidélité — cliquer pour voir la liste",
    sectionAlertes: "Alertes pastorales — à visiter en priorité",
    sectionTauxType: "Taux de présence par type de temps",
    sectionTendance: "Tendance hebdomadaire",
    sectionTopFideles: "Top fidèles",
    sectionGenre: "Répartition par genre",
    reguliers: "Réguliers",
    irreguliers: "Irréguliers",
    decrocheurs: "Décrocheurs",
    absentsChroniques: "Absents chroniques",
    vuLe: (date) => `Vu le ${date}`,
    jamaisPresent: "Jamais présent(e)",
    showMore: (n) => `▼ Voir ${n} de plus`,
    reduce: "▲ Réduire",
    absences: (n) => `${n} abs.`,
    vsSemPrec: (delta, sign) => `${sign} ${Math.abs(delta)}% vs sem. préc.`,
    insuffisantData: "Données insuffisantes (≥ 2 semaines)",
    noData: "Aucune donnée",
    sessions_count: (n) => `${n} sess.`,
    topNoData: "Aucune donnée",
    lastSession: (date) => `Dernière session · ${date}`,
    hommes: "Hommes",
    femmes: "Femmes",
    nonRenseigne: "Non renseigné",
    presents: (n) => `✔ Présents (${n})`,
    absents: (n) => `✗ Absents (${n})`,
    aucun: "Aucun",
    membre: (n) => `${n} membre${n > 1 ? "s" : ""}`,
    aucunMembre: "Aucun membre",
    compCellules: "Comparaison des cellules",
    aucuneCellule: "Aucune cellule visible",
    compFamilles: "Comparaison des familles",
    aucuneFamille: "Aucune famille visible",
    meilleurTaux: "Meilleur taux",
    moinsBonTaux: "Moins bon taux",
    enProgression: "En progression ▲",
    enRegression: "En régression ▼",
    stable: "→ stable",
    tendanceStable: "→ stable",
  },
  en: {
    pageTitle: "Attendance Report",
    pageSubtitle: "Pastoral follow-up & loyalty indicators",
    periodLabel: "Period:",
    typeLabel: "Type:",
    tous: "All",
    periods: [
      { label: "7 d", val: "7" },
      { label: "30 d", val: "30" },
      { label: "90 d", val: "90" },
      { label: "6 mo", val: "180" },
    ],
    tabKpi: "Overview",
    tabCellules: "Cells",
    tabFamilles: "Families",
    tabSessions: "By session",
    noSession: "No session for this period",
    kpiSessions: "Sessions",
    kpiSessionsSub: "for the period",
    kpiTauxMoyen: "Average rate",
    kpiTauxSub: "attendance",
    kpiMembres: "Tracked members",
    kpiMembresSub: "active",
    kpiAlertes: "On alert",
    kpiAlertesSub: "≥ 3 consecutive abs.",
    sectionOverview: "Overview",
    sectionSegmentation: "Loyalty segmentation — click to see list",
    sectionAlertes: "Pastoral alerts — priority visits",
    sectionTauxType: "Attendance rate by time type",
    sectionTendance: "Weekly trend",
    sectionTopFideles: "Top regulars",
    sectionGenre: "Gender breakdown",
    reguliers: "Regulars",
    irreguliers: "Irregulars",
    decrocheurs: "Dropping off",
    absentsChroniques: "Chronic absents",
    vuLe: (date) => `Last seen ${date}`,
    jamaisPresent: "Never present",
    showMore: (n) => `▼ See ${n} more`,
    reduce: "▲ Reduce",
    absences: (n) => `${n} abs.`,
    vsSemPrec: (delta, sign) => `${sign} ${Math.abs(delta)}% vs prev. week`,
    insuffisantData: "Insufficient data (≥ 2 weeks)",
    noData: "No data",
    sessions_count: (n) => `${n} sess.`,
    topNoData: "No data",
    lastSession: (date) => `Last session · ${date}`,
    hommes: "Men",
    femmes: "Women",
    nonRenseigne: "Not specified",
    presents: (n) => `✔ Present (${n})`,
    absents: (n) => `✗ Absent (${n})`,
    aucun: "None",
    membre: (n) => `${n} member${n > 1 ? "s" : ""}`,
    aucunMembre: "No members",
    compCellules: "Cell comparison",
    aucuneCellule: "No cell visible",
    compFamilles: "Family comparison",
    aucuneFamille: "No family visible",
    meilleurTaux: "Best rate",
    moinsBonTaux: "Lowest rate",
    enProgression: "Progressing ▲",
    enRegression: "Declining ▼",
    stable: "→ stable",
    tendanceStable: "→ stable",
  },
};

export default function RapportPresencePage() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur", "ResponsableIntegration", "Conseiller", "ResponsableCellule", "ResponsableFamilles"]}>
      <RapportPresence />
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
function sessionLabel(s) {
  const culte = s.numero_culte ? ` — ${s.numero_culte}${s.numero_culte === 1 ? "er" : "ème"} culte` : "";
  return `${s.typeTemps}${culte}`;
}
function getInitials(prenom, nom) {
  return `${(prenom || "?")[0]}${(nom || "?")[0]}`.toUpperCase();
}
function absencesConsecutives(membreId, sessionsTriees, presencesParSession) {
  let count = 0;
  for (const s of sessionsTriees) {
    const p = (presencesParSession[s.id] || []).find(p => p.membre_id === membreId);
    if (!p || p.statut === "absent") count++;
    else break;
  }
  return count;
}
function derniereDatePresence(membreId, sessionsTriees, presencesParSession) {
  for (const s of sessionsTriees) {
    const p = (presencesParSession[s.id] || []).find(p => p.membre_id === membreId && p.statut === "present");
    if (p) return s.date;
  }
  return null;
}
function tauxPresence(membreId, sessions, presencesParSession) {
  if (!sessions.length) return 0;
  let presents = 0;
  for (const s of sessions) {
    const p = (presencesParSession[s.id] || []).find(p => p.membre_id === membreId);
    if (p && p.statut === "present") presents++;
  }
  return Math.round((presents / sessions.length) * 100);
}
function tauxGroupe(membreIds, sessions, presencesParSession) {
  if (!sessions.length || !membreIds.length) return 0;
  let presents = 0, total = 0;
  for (const s of sessions) {
    const pres = presencesParSession[s.id] || [];
    for (const id of membreIds) {
      const p = pres.find(p => p.membre_id === id);
      if (p) { total++; if (p.statut === "present") presents++; }
    }
  }
  return total > 0 ? Math.round((presents / total) * 100) : 0;
}
function tendanceGroupe(membreIds, sessions, presencesParSession) {
  if (sessions.length < 2 || !membreIds.length) return 0;
  const triees = [...sessions].sort((a, b) => a.date.localeCompare(b.date));
  const mid = Math.floor(triees.length / 2);
  return tauxGroupe(membreIds, triees.slice(mid), presencesParSession) - tauxGroupe(membreIds, triees.slice(0, mid), presencesParSession);
}

const AVATAR_COLORS = [
  "bg-blue-100 text-blue-700", "bg-emerald-100 text-emerald-700",
  "bg-purple-100 text-purple-700", "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700", "bg-teal-100 text-teal-700",
];
function avatarColor(str) {
  let hash = 0;
  for (let c of (str || "")) hash = c.charCodeAt(0) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

// ─── UI ATOMS ─────────────────────────────────────────────────
function SectionTitle({ children }) {
  return <p className="text-[11px] font-semibold uppercase tracking-widest text-white/40 mb-3">{children}</p>;
}
function KpiCard({ label, value, sub, accent }) {
  const c = { green: "text-emerald-400", red: "text-red-400", amber: "text-amber-400", white: "text-white" };
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
    gray: "bg-white/10 text-white/50",
  };
  return <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${m[color] || m.gray}`}>{children}</span>;
}
function Avatar({ prenom, nom }) {
  const initials = getInitials(prenom, nom);
  return (
    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 ${avatarColor(initials)}`}>
      {initials}
    </span>
  );
}
function BarreProgression({ pct }) {
  const col = pct >= 70 ? "bg-emerald-400" : pct >= 40 ? "bg-amber-400" : "bg-red-400";
  return (
    <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
      <div className={`h-full rounded-full transition-all ${col}`} style={{ width: `${pct}%` }} />
    </div>
  );
}
function TendancePuce({ delta, t }) {
  if (delta === 0) return <span className="text-[11px] text-white/30">{t.tendanceStable}</span>;
  return (
    <span className={`text-[11px] font-semibold ${delta > 0 ? "text-emerald-400" : "text-red-400"}`}>
      {delta > 0 ? "▲" : "▼"} {Math.abs(delta)}%
    </span>
  );
}

// ─── BLOC KPI GLOBAUX ──────────────────────────────────────────
function BlocKpiGlobaux({ sessions, presencesParSession, allMembres, t }) {
  const totalSessions = sessions.length;
  const totalMembres  = allMembres.length;
  const tauxMoyen = !totalSessions || !totalMembres ? 0 : Math.round(
    sessions.reduce((acc, s) => {
      const pres = presencesParSession[s.id] || [];
      return acc + (pres.filter(p => p.statut === "present").length / totalMembres) * 100;
    }, 0) / totalSessions
  );
  const sessionsTriees = [...sessions].sort((a, b) => b.date.localeCompare(a.date));
  const enAlerte = allMembres.filter(m => absencesConsecutives(m.id, sessionsTriees, presencesParSession) >= 3).length;
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <KpiCard label={t.kpiSessions} value={totalSessions} sub={t.kpiSessionsSub} accent="white" />
      <KpiCard label={t.kpiTauxMoyen} value={`${tauxMoyen}%`} sub={t.kpiTauxSub} accent={tauxMoyen >= 70 ? "green" : tauxMoyen >= 50 ? "amber" : "red"} />
      <KpiCard label={t.kpiMembres} value={totalMembres} sub={t.kpiMembresSub} accent="white" />
      <KpiCard label={t.kpiAlertes} value={enAlerte} sub={t.kpiAlertesSub} accent={enAlerte > 0 ? "red" : "green"} />
    </div>
  );
}

// ─── BLOC SEGMENTATION ─────────────────────────────────────────
function BlocSegmentation({ sessions, presencesParSession, allMembres, onVoirSegment, t }) {
  const segments = [
    { key: "reguliers",   label: t.reguliers,        min: 75, max: 100, badge: "green" },
    { key: "irreguliers", label: t.irreguliers,       min: 40, max: 74,  badge: "blue"  },
    { key: "decrocheurs", label: t.decrocheurs,       min: 15, max: 39,  badge: "amber" },
    { key: "absents",     label: t.absentsChroniques, min: 0,  max: 14,  badge: "red"   },
  ];
  const mbParSeg = segments.reduce((acc, seg) => {
    acc[seg.key] = allMembres.filter(m => {
      const tx = tauxPresence(m.id, sessions, presencesParSession);
      return tx >= seg.min && tx <= seg.max;
    });
    return acc;
  }, {});
  return (
    <div className="grid grid-cols-2 gap-3">
      {segments.map(seg => {
        const membres = mbParSeg[seg.key];
        return (
          <button key={seg.key} onClick={() => onVoirSegment(seg.label, membres)}
            className="bg-white/10 hover:bg-white/15 rounded-2xl px-4 py-4 flex flex-col gap-2 text-left transition active:scale-95">
            <div className="flex items-center justify-between">
              <p className="text-xs text-white/50">{seg.label}</p>
              <Badge color={seg.badge}>{seg.min === 0 ? `< ${seg.max+1}%` : seg.max === 100 ? `≥ ${seg.min}%` : `${seg.min}–${seg.max}%`}</Badge>
            </div>
            <p className="text-2xl font-bold text-white">{membres.length}</p>
            {membres.length > 0 && (
              <p className="text-[11px] text-white/40 truncate">
                {membres.slice(0, 3).map(m => `${m.prenom} ${m.nom}`).join(", ")}
                {membres.length > 3 ? ` … +${membres.length - 3}` : ""}
              </p>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ─── BLOC ALERTES ─────────────────────────────────────────────
function BlocAlertes({ sessions, presencesParSession, allMembres, t }) {
  const [showAll, setShowAll] = useState(false);
  const sessionsTriees = [...sessions].sort((a, b) => b.date.localeCompare(a.date));
  const alertes = allMembres
    .map(m => ({
      ...m,
      consec: absencesConsecutives(m.id, sessionsTriees, presencesParSession),
      derniereDate: derniereDatePresence(m.id, sessionsTriees, presencesParSession),
    }))
    .filter(m => m.consec >= 3)
    .sort((a, b) => b.consec - a.consec);

  if (alertes.length === 0) return null;

  const affichees = showAll ? alertes : alertes.slice(0, 5);
  return (
    <div className="flex flex-col gap-2">
      {affichees.map(m => (
        <div key={m.id} className={`flex items-center gap-3 px-4 py-3 rounded-xl border-l-2 ${m.consec >= 5 ? "bg-red-950/40 border-red-500" : "bg-amber-950/30 border-amber-500"}`}>
          <Avatar prenom={m.prenom} nom={m.nom} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{m.prenom} {m.nom}</p>
            <p className="text-[11px] text-white/40">
              {m.derniereDate ? t.vuLe(formatDateFr(m.derniereDate)) : t.jamaisPresent}
            </p>
          </div>
          <Badge color={m.consec >= 5 ? "red" : "amber"}>{t.absences(m.consec)}</Badge>
        </div>
      ))}
      {alertes.length > 5 && (
        <button onClick={() => setShowAll(v => !v)} className="text-xs text-white/40 hover:text-white/70 text-center py-1 transition">
          {showAll ? t.reduce : t.showMore(alertes.length - 5)}
        </button>
      )}
    </div>
  );
}

// ─── BLOC TAUX PAR TYPE ────────────────────────────────────────
function BlocTauxParType({ sessions, presencesParSession, totalMembres, t }) {
  const parType = {};
  sessions.forEach(s => {
    const type = s.typeTemps || "Autre";
    if (!parType[type]) parType[type] = { presents: 0, total: 0, nb: 0 };
    const pres = presencesParSession[s.id] || [];
    parType[type].presents += pres.filter(p => p.statut === "present").length;
    parType[type].total    += totalMembres;
    parType[type].nb++;
  });
  const lignes = Object.entries(parType)
    .map(([type, { presents, total, nb }]) => ({ type, nb, taux: total > 0 ? Math.round((presents / total) * 100) : 0 }))
    .sort((a, b) => b.taux - a.taux);
  if (!lignes.length) return <p className="text-white/30 text-sm text-center py-4">{t.noData}</p>;
  return (
    <div className="flex flex-col gap-2">
      {lignes.map(({ type, taux, nb }) => (
        <div key={type} className="bg-white/10 rounded-xl px-4 py-3 flex items-center gap-3">
          <p className="text-sm text-white w-36 flex-shrink-0 truncate">{type}</p>
          <BarreProgression pct={taux} />
          <p className="text-sm font-bold text-white w-10 text-right">{taux}%</p>
          <p className="text-[11px] text-white/30 w-14 text-right flex-shrink-0">{t.sessions_count(nb)}</p>
        </div>
      ))}
    </div>
  );
}

// ─── BLOC TENDANCE HEBDO ───────────────────────────────────────
function BlocTendance({ sessions, presencesParSession, totalMembres, t }) {
  const parSemaine = {};
  sessions.forEach(s => {
    const d = new Date(s.date + "T00:00:00");
    const jan = new Date(d.getFullYear(), 0, 1);
    const sem = `${d.getFullYear()}-S${String(Math.ceil(((d - jan) / 86400000 + jan.getDay() + 1) / 7)).padStart(2, "0")}`;
    if (!parSemaine[sem]) parSemaine[sem] = { presents: 0, total: 0, dates: [] };
    const pres = presencesParSession[s.id] || [];
    parSemaine[sem].presents += pres.filter(p => p.statut === "present").length;
    parSemaine[sem].total    += totalMembres;
    parSemaine[sem].dates.push(s.date);
  });
  const semaines = Object.entries(parSemaine)
    .sort(([a], [b]) => a.localeCompare(b)).slice(-8)
    .map(([sem, { presents, total, dates }]) => ({
      sem, taux: total > 0 ? Math.round((presents / total) * 100) : 0,
      label: dates.length > 0 ? formatDateCourt(dates[0]) : sem,
    }));
  if (semaines.length < 2) return <p className="text-white/30 text-sm text-center py-4">{t.insuffisantData}</p>;
  const delta = semaines[semaines.length - 1].taux - semaines[semaines.length - 2].taux;
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <span className="text-2xl font-bold text-white">{semaines[semaines.length - 1].taux}%</span>
        <span className={`text-sm font-semibold ${delta >= 0 ? "text-emerald-400" : "text-red-400"}`}>
          {t.vsSemPrec(delta, delta >= 0 ? "▲" : "▼")}
        </span>
      </div>
      <div className="flex items-end gap-1 h-16">
        {semaines.map(({ sem, taux, label }) => (
          <div key={sem} className="flex-1 flex flex-col items-center gap-1">
            <div className={`w-full rounded-t-sm ${taux >= 70 ? "bg-emerald-500" : taux >= 40 ? "bg-amber-500" : "bg-red-500"}`}
              style={{ height: `${Math.max(4, taux)}%` }} />
            <p className="text-[9px] text-white/30 truncate w-full text-center">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── BLOC TOP FIDÈLES ──────────────────────────────────────────
function BlocTopFideles({ sessions, presencesParSession, allMembres, t }) {
  const [showAll, setShowAll] = useState(false);
  const ranked = allMembres
    .map(m => ({ ...m, taux: tauxPresence(m.id, sessions, presencesParSession) }))
    .sort((a, b) => b.taux - a.taux)
    .slice(0, 30);
  const affichees = showAll ? ranked : ranked.slice(0, 5);
  if (!ranked.length) return <p className="text-white/30 text-sm text-center py-4">{t.topNoData}</p>;
  return (
    <div className="flex flex-col gap-2">
      {affichees.map((m, i) => (
        <div key={m.id} className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-2.5">
          <span className="text-xs text-white/30 w-5 text-center flex-shrink-0">{i + 1}</span>
          <Avatar prenom={m.prenom} nom={m.nom} />
          <p className="text-sm text-white flex-1 truncate">{m.prenom} {m.nom}</p>
          <BarreProgression pct={m.taux} />
          <Badge color={m.taux >= 75 ? "green" : m.taux >= 40 ? "amber" : "red"}>{m.taux}%</Badge>
        </div>
      ))}
      {ranked.length > 5 && (
        <button onClick={() => setShowAll(v => !v)} className="text-xs text-white/40 hover:text-white/70 text-center py-1 transition">
          {showAll ? t.reduce : t.showMore(ranked.length - 5)}
        </button>
      )}
    </div>
  );
}

// ─── BLOC GENRE ────────────────────────────────────────────────
function BlocGenre({ sessions, presencesParSession, allMembres, t }) {
  const derniereSess = [...sessions].sort((a, b) => b.date.localeCompare(a.date))[0];
  if (!derniereSess) return null;
  const pres       = (presencesParSession[derniereSess.id] || []).filter(p => p.statut === "present");
  const presentIds = new Set(pres.map(p => p.membre_id));
  const presents   = allMembres.filter(m => presentIds.has(m.id));
  const hommes     = presents.filter(m => m.sexe?.toLowerCase() === "homme").length;
  const femmes     = presents.filter(m => m.sexe?.toLowerCase() === "femme").length;
  const inconnus   = presents.length - hommes - femmes;
  const total      = presents.length;
  const pctH = total > 0 ? Math.round((hommes / total) * 100) : 0;
  const pctF = total > 0 ? Math.round((femmes / total) * 100) : 0;
  return (
    <div className="flex flex-col gap-3">
      <p className="text-[11px] text-white/40">{t.lastSession(formatDateFr(derniereSess.date))}</p>
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-blue-900/40 rounded-xl px-3 py-3 text-center">
          <p className="text-xl font-bold text-blue-300">{hommes}</p>
          <p className="text-[11px] text-blue-400/70">{t.hommes}</p>
          <p className="text-[10px] text-blue-500/50">{pctH}%</p>
        </div>
        <div className="bg-pink-900/40 rounded-xl px-3 py-3 text-center">
          <p className="text-xl font-bold text-pink-300">{femmes}</p>
          <p className="text-[11px] text-pink-400/70">{t.femmes}</p>
          <p className="text-[10px] text-pink-500/50">{pctF}%</p>
        </div>
        <div className="bg-white/10 rounded-xl px-3 py-3 text-center">
          <p className="text-xl font-bold text-white/40">{inconnus}</p>
          <p className="text-[11px] text-white/30">{t.nonRenseigne}</p>
        </div>
      </div>
      {total > 0 && (
        <div className="flex h-2 rounded-full overflow-hidden gap-0.5">
          <div className="bg-blue-400 rounded-l-full" style={{ width: `${pctH}%` }} />
          <div className="bg-pink-400 rounded-r-full" style={{ width: `${pctF}%` }} />
        </div>
      )}
    </div>
  );
}

// ─── CARTE SESSION ─────────────────────────────────────────────
function CarteSession({ session, presences, allMembres, t }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab]   = useState("presents");
  const presentIds = new Set(presences.filter(p => p.statut === "present").map(p => p.membre_id));
  const presents   = allMembres.filter(m => presentIds.has(m.id)).sort((a, b) => a.nom.localeCompare(b.nom, "fr"));
  const absents    = allMembres.filter(m => !presentIds.has(m.id)).sort((a, b) => a.nom.localeCompare(b.nom, "fr"));
  const taux       = allMembres.length > 0 ? Math.round((presents.length / allMembres.length) * 100) : 0;
  return (
    <div className="bg-white/10 rounded-2xl overflow-hidden">
      <button onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-4 hover:bg-white/5 transition text-left gap-3">
        <div className="flex flex-col gap-0.5">
          <span className="font-semibold text-white text-sm">{sessionLabel(session)}</span>
          <span className="text-[11px] text-white/40">{formatDateFr(session.date)}{session.heure ? ` · ${session.heure}` : ""}</span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${taux >= 70 ? "bg-emerald-400" : taux >= 40 ? "bg-amber-400" : "bg-red-400"}`} style={{ width: `${taux}%` }} />
            </div>
            <span className="text-xs text-white/50 w-8 text-right">{taux}%</span>
          </div>
          <Badge color="green">{presents.length} ✔</Badge>
          <Badge color="red">{absents.length} ✗</Badge>
          <span className="text-white/30 text-xs">{open ? "▲" : "▼"}</span>
        </div>
      </button>
      {open && (
        <div className="border-t border-white/10 px-4 pb-4 pt-3 flex flex-col gap-3">
          <div className="flex gap-2">
            <button onClick={() => setTab("presents")} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${tab === "presents" ? "bg-emerald-600 text-white" : "bg-white/10 text-white/50 hover:bg-white/15"}`}>
              {t.presents(presents.length)}
            </button>
            <button onClick={() => setTab("absents")} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${tab === "absents" ? "bg-red-700 text-white" : "bg-white/10 text-white/50 hover:bg-white/15"}`}>
              {t.absents(absents.length)}
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {(tab === "presents" ? presents : absents).map(m => (
              <div key={m.id} className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg">
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${tab === "presents" ? "bg-emerald-400" : "bg-red-400"}`} />
                <span className="text-sm text-white/80 truncate">{m.prenom} {m.nom}</span>
                {m.sexe && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0 ${m.sexe.toLowerCase() === "homme" ? "bg-blue-900/60 text-blue-300" : "bg-pink-900/60 text-pink-300"}`}>
                    {m.sexe.toLowerCase() === "homme" ? "H" : "F"}
                  </span>
                )}
              </div>
            ))}
            {(tab === "presents" ? presents : absents).length === 0 && (
              <p className="text-white/30 text-sm col-span-2 text-center py-2">{t.aucun}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── CARTE GROUPE ─────────────────────────────────────────────
function CarteGroupe({ groupe, sessions, presencesParSession, allMembres, t }) {
  const [open, setOpen] = useState(false);
  const membres  = allMembres.filter(m => groupe.membreIds.includes(m.id));
  const taux     = tauxGroupe(groupe.membreIds, sessions, presencesParSession);
  const delta    = tendanceGroupe(groupe.membreIds, sessions, presencesParSession);

  const membresAvecTaux = membres
    .map(m => ({ ...m, taux: tauxPresence(m.id, sessions, presencesParSession) }))
    .sort((a, b) => b.taux - a.taux);

  return (
    <div className="bg-white/10 rounded-2xl overflow-hidden">
      <button onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-4 hover:bg-white/5 transition text-left gap-3">
        <div className="flex flex-col gap-0.5 flex-1 min-w-0">
          <span className="font-semibold text-white text-sm truncate">{groupe.icon} {groupe.label}</span>
          <span className="text-[11px] text-white/40">{t.membre(membres.length)}</span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <TendancePuce delta={delta} t={t} />
          <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${taux >= 70 ? "bg-emerald-400" : taux >= 40 ? "bg-amber-400" : "bg-red-400"}`} style={{ width: `${taux}%` }} />
          </div>
          <span className="text-sm font-bold text-white w-10 text-right">{taux}%</span>
          <span className="text-white/30 text-xs">{open ? "▲" : "▼"}</span>
        </div>
      </button>
      {open && (
        <div className="border-t border-white/10 px-4 pb-4 pt-3 flex flex-col gap-2">
          {membresAvecTaux.map(m => (
            <div key={m.id} className="flex items-center gap-3 py-1.5 border-b border-white/5 last:border-0">
              <Avatar prenom={m.prenom} nom={m.nom} />
              <p className="text-sm text-white flex-1 truncate">{m.prenom} {m.nom}</p>
              {m.sexe && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0 ${m.sexe.toLowerCase() === "homme" ? "bg-blue-900/60 text-blue-300" : "bg-pink-900/60 text-pink-300"}`}>
                  {m.sexe.toLowerCase() === "homme" ? "H" : "F"}
                </span>
              )}
              <BarreProgression pct={m.taux} />
              <Badge color={m.taux >= 75 ? "green" : m.taux >= 40 ? "amber" : "red"}>{m.taux}%</Badge>
            </div>
          ))}
          {membresAvecTaux.length === 0 && <p className="text-white/30 text-sm text-center py-2">{t.aucunMembre}</p>}
        </div>
      )}
    </div>
  );
}

// ─── ONGLET CELLULES ───────────────────────────────────────────
function OngletCellules({ sessions, presencesParSession, allMembres, cellules, t }) {
  const [tri, setTri] = useState("taux_desc");

  const groupes = cellules.map(c => {
    const membreIds = allMembres.filter(m => m.cellule_id === c.id).map(m => m.id);
    const taux      = tauxGroupe(membreIds, sessions, presencesParSession);
    const delta     = tendanceGroupe(membreIds, sessions, presencesParSession);
    return { ...c, icon: "🏠", label: c.cellule_full || `${c.ville} – ${c.cellule}`, membreIds, taux, delta };
  }).filter(g => g.membreIds.length > 0);

  const triOptions = [
    { val: "taux_desc", label: t.meilleurTaux },
    { val: "taux_asc",  label: t.moinsBonTaux },
    { val: "progress",  label: t.enProgression },
    { val: "regress",   label: t.enRegression },
  ];

  const groupesTries = [...groupes].sort((a, b) => {
    if (tri === "taux_desc") return b.taux - a.taux;
    if (tri === "taux_asc")  return a.taux - b.taux;
    if (tri === "progress")  return b.delta - a.delta;
    if (tri === "regress")   return a.delta - b.delta;
    return 0;
  });

  if (!groupes.length) return <p className="text-white/30 text-sm text-center py-8">{t.aucuneCellule}</p>;

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white/10 rounded-2xl p-4 flex flex-col gap-3">
        <p className="text-xs text-white/40 font-semibold uppercase tracking-wider">{t.compCellules}</p>
        <div className="flex flex-col gap-2">
          {[...groupes].sort((a, b) => b.taux - a.taux).map((g, i) => (
            <div key={g.id} className="flex items-center gap-3">
              <span className="text-xs text-white/30 w-4 flex-shrink-0">{i + 1}</span>
              <p className="text-xs text-white/80 w-28 flex-shrink-0 truncate">{g.label}</p>
              <BarreProgression pct={g.taux} />
              <span className="text-xs font-bold text-white w-8 text-right">{g.taux}%</span>
              <TendancePuce delta={g.delta} t={t} />
            </div>
          ))}
        </div>
      </div>
      <div className="flex gap-2 flex-wrap">
        {triOptions.map(opt => (
          <button key={opt.val} onClick={() => setTri(opt.val)}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition ${tri === opt.val ? "bg-[#222580] text-white" : "bg-white/10 text-white/50 hover:bg-white/15"}`}>
            {opt.label}
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-3">
        {groupesTries.map(g => (
          <CarteGroupe key={g.id} groupe={g} sessions={sessions} presencesParSession={presencesParSession} allMembres={allMembres} t={t} />
        ))}
      </div>
    </div>
  );
}

// ─── ONGLET FAMILLES ───────────────────────────────────────────
function OngletFamilles({ sessions, presencesParSession, allMembres, familles, t }) {
  const [tri, setTri] = useState("taux_desc");

  const groupes = familles.map(f => {
    const membreIds = allMembres.filter(m => m.famille_id === f.id).map(m => m.id);
    const taux      = tauxGroupe(membreIds, sessions, presencesParSession);
    const delta     = tendanceGroupe(membreIds, sessions, presencesParSession);
    return { ...f, icon: "👨‍👩‍👦", label: f.famille_full || `${f.ville} – ${f.famille}`, membreIds, taux, delta };
  }).filter(g => g.membreIds.length > 0);

  const triOptions = [
    { val: "taux_desc", label: t.meilleurTaux },
    { val: "taux_asc",  label: t.moinsBonTaux },
    { val: "progress",  label: t.enProgression },
    { val: "regress",   label: t.enRegression },
  ];

  const groupesTries = [...groupes].sort((a, b) => {
    if (tri === "taux_desc") return b.taux - a.taux;
    if (tri === "taux_asc")  return a.taux - b.taux;
    if (tri === "progress")  return b.delta - a.delta;
    if (tri === "regress")   return a.delta - b.delta;
    return 0;
  });

  if (!groupes.length) return <p className="text-white/30 text-sm text-center py-8">{t.aucuneFamille}</p>;

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white/10 rounded-2xl p-4 flex flex-col gap-3">
        <p className="text-xs text-white/40 font-semibold uppercase tracking-wider">{t.compFamilles}</p>
        <div className="flex flex-col gap-2">
          {[...groupes].sort((a, b) => b.taux - a.taux).map((g, i) => (
            <div key={g.id} className="flex items-center gap-3">
              <span className="text-xs text-white/30 w-4 flex-shrink-0">{i + 1}</span>
              <p className="text-xs text-white/80 w-28 flex-shrink-0 truncate">{g.label}</p>
              <BarreProgression pct={g.taux} />
              <span className="text-xs font-bold text-white w-8 text-right">{g.taux}%</span>
              <TendancePuce delta={g.delta} t={t} />
            </div>
          ))}
        </div>
      </div>
      <div className="flex gap-2 flex-wrap">
        {triOptions.map(opt => (
          <button key={opt.val} onClick={() => setTri(opt.val)}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition ${tri === opt.val ? "bg-[#222580] text-white" : "bg-white/10 text-white/50 hover:bg-white/15"}`}>
            {opt.label}
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-3">
        {groupesTries.map(g => (
          <CarteGroupe key={g.id} groupe={g} sessions={sessions} presencesParSession={presencesParSession} allMembres={allMembres} t={t} />
        ))}
      </div>
    </div>
  );
}

// ─── DRAWER SEGMENT ────────────────────────────────────────────
function DrawerSegment({ segment, onClose, t }) {
  if (!segment) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative bg-[#2a2d80] rounded-t-3xl sm:rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden shadow-2xl"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <p className="font-bold text-white">
            {segment.label}
            <span className="text-white/40 font-normal text-sm ml-2">({segment.membres.length})</span>
          </p>
          <button onClick={onClose} className="text-white/40 hover:text-white transition text-xl leading-none">×</button>
        </div>
        <div className="overflow-y-auto flex-1 px-5 py-3 flex flex-col gap-2">
          {segment.membres.sort((a, b) => a.nom.localeCompare(b.nom, "fr")).map(m => (
            <div key={m.id} className="flex items-center gap-3 py-2 border-b border-white/5">
              <Avatar prenom={m.prenom} nom={m.nom} />
              <p className="text-sm text-white flex-1">{m.prenom} {m.nom}</p>
              {m.sexe && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${m.sexe.toLowerCase() === "homme" ? "bg-blue-900/60 text-blue-300" : "bg-pink-900/60 text-pink-300"}`}>
                  {m.sexe.toLowerCase() === "homme" ? "H" : "F"}
                </span>
              )}
            </div>
          ))}
          {segment.membres.length === 0 && <p className="text-white/30 text-sm text-center py-6">{t.aucunMembre}</p>}
        </div>
      </div>
    </div>
  );
}

// ─── PAGE PRINCIPALE ───────────────────────────────────────────
function RapportPresence() {
  const { lang } = useLang();
  const t = translations[lang];

  // ─── FEATURES ─────────────────────────────────────────────────
  const cellulesActive = useFeature("cellules");
  const famillesActive = useFeature("familles");

  const [sessions, setSessions]                       = useState([]);
  const [presencesParSession, setPresencesParSession] = useState({});
  const [allMembres, setAllMembres]                   = useState([]);
  const [cellules, setCellules]                       = useState([]);
  const [familles, setFamilles]                       = useState([]);
  const [loading, setLoading]                         = useState(true);
  const [filtrePeriode, setFiltrePeriode]             = useState("30");
  const [filtreType, setFiltreType]                   = useState("");
  const [onglet, setOnglet]                           = useState("kpi");
  const [segmentOuvert, setSegmentOuvert]             = useState(null);

  const profileRef = useRef(null);

  // ─── Onglets conditionnels selon features ─────────────────────
  const onglets = [
    { key: "kpi",      label: t.tabKpi },
    ...(cellulesActive ? [{ key: "cellules", label: t.tabCellules }] : []),
    ...(famillesActive ? [{ key: "familles", label: t.tabFamilles }] : []),
    { key: "sessions", label: t.tabSessions },
  ];

  // Si l'onglet actif est masqué par une feature désactivée, revenir à "kpi"
  useEffect(() => {
    const keys = onglets.map(o => o.key);
    if (!keys.includes(onglet)) setOnglet("kpi");
  }, [cellulesActive, famillesActive]);

  const initProfile = useCallback(async () => {
    if (profileRef.current) return;
    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile }  = await supabase.from("profiles").select("eglise_id, role, roles").eq("id", user.id).single();
    profileRef.current = { ...profile, uid: user.id };
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      await initProfile();
      const profile = profileRef.current;
      const isAdmin = profile.roles?.includes("Administrateur") || profile.roles?.includes("ResponsableIntegration");

      const depuis = new Date();
      depuis.setDate(depuis.getDate() - Number(filtrePeriode));
      const depuisStr = depuis.toISOString().split("T")[0];

      // ── Sessions ────────────────────────────────────────────
      let sessQuery = supabase.from("attendance")
        .select("id, typeTemps, date, heure, numero_culte")
        .eq("eglise_id", profile.eglise_id)
        .gte("date", depuisStr)
        .order("date", { ascending: false })
        .order("created_at", { ascending: false });
      if (filtreType) sessQuery = sessQuery.eq("typeTemps", filtreType);
      const { data: sessionsData } = await sessQuery;
      const sess = sessionsData || [];
      setSessions(sess);

      if (!sess.length) {
        setAllMembres([]); setPresencesParSession({}); setCellules([]); setFamilles([]);
        setLoading(false); return;
      }

      // ── Calcul des IDs membres visibles (non-admin) ──────────
      let myIds = null;
      if (!isAdmin) {
        let ids = new Set();

        const asgnProm = profile.roles?.includes("Conseiller")
          ? supabase.from("suivi_assignments").select("membre_id").eq("conseiller_id", profile.uid).eq("statut", "actif")
          : Promise.resolve({ data: [] });

        const cellProm = profile.roles?.includes("ResponsableCellule")
          ? supabase.from("cellules")
              .select("id, responsable_id, cellule_mere_id")
              .eq("eglise_id", profile.eglise_id)
          : Promise.resolve({ data: [] });

        const famProm = profile.roles?.includes("ResponsableFamilles")
          ? supabase.from("familles").select("id").eq("responsable_id", profile.uid)
          : Promise.resolve({ data: [] });

        const [asgn, allCellulesEglise, fam] = await Promise.all([asgnProm, cellProm, famProm]);

        asgn.data?.forEach(a => ids.add(a.membre_id));

        if (allCellulesEglise.data?.length) {
          const toutesLesCellules = allCellulesEglise.data;
          const mesCellulesIds = new Set(
            toutesLesCellules.filter(c => c.responsable_id === profile.uid).map(c => c.id)
          );
          const cellulesVisibles = new Set(mesCellulesIds);
          toutesLesCellules.forEach(c => {
            if (c.cellule_mere_id === profile.uid) cellulesVisibles.add(c.id);
          });
          if (cellulesVisibles.size > 0) {
            const { data: cm } = await supabase.from("membres_complets")
              .select("id")
              .in("cellule_id", [...cellulesVisibles])
              .in("etat_contact", ["existant", "nouveau"]);
            cm?.forEach(m => ids.add(m.id));
          }
        }

        if (fam.data?.length) {
          const { data: fm } = await supabase.from("membres_complets")
            .select("id")
            .in("famille_id", fam.data.map(f => f.id))
            .in("etat_contact", ["existant", "nouveau"]);
          fm?.forEach(m => ids.add(m.id));
        }

        myIds = [...ids];
        if (!myIds.length) {
          setAllMembres([]); setPresencesParSession({}); setCellules([]); setFamilles([]);
          setLoading(false); return;
        }
      }

      // ── Membres ─────────────────────────────────────────────
      let membresQuery = supabase.from("membres_complets")
        .select("id, prenom, nom, sexe, cellule_id, famille_id")
        .eq("eglise_id", profile.eglise_id)
        .in("etat_contact", ["existant", "nouveau"]);
      if (myIds) membresQuery = membresQuery.in("id", myIds);
      const { data: membresData } = await membresQuery.order("nom");
      setAllMembres(membresData || []);

      // ── Cellules et familles (conditionnées par feature) ─────
      let cellulesRes = { data: [] };
      let famillesRes = { data: [] };

      if (cellulesActive) {
        if (isAdmin) {
          cellulesRes = await supabase.from("cellules")
            .select("id, cellule_full, cellule, ville")
            .eq("eglise_id", profile.eglise_id);
        } else if (profile.roles?.includes("ResponsableCellule")) {
          const { data: toutesLesCellules } = await supabase.from("cellules")
            .select("id, cellule_full, cellule, ville, responsable_id, cellule_mere_id")
            .eq("eglise_id", profile.eglise_id);
          const all = toutesLesCellules || [];
          const mesCellulesIds = new Set(
            all.filter(c => c.responsable_id === profile.uid).map(c => c.id)
          );
          const cellulesVisiblesIds = new Set(mesCellulesIds);
          all.forEach(c => {
            if (c.cellule_mere_id === profile.uid) cellulesVisiblesIds.add(c.id);
          });
          cellulesRes = { data: all.filter(c => cellulesVisiblesIds.has(c.id)) };
        }
      }

      if (famillesActive) {
        if (isAdmin) {
          famillesRes = await supabase.from("familles")
            .select("id, famille_full, famille, ville")
            .eq("eglise_id", profile.eglise_id);
        } else if (profile.roles?.includes("ResponsableFamilles")) {
          famillesRes = await supabase.from("familles")
            .select("id, famille_full, famille, ville")
            .eq("responsable_id", profile.uid);
        }
      }

      setCellules(cellulesRes.data || []);
      setFamilles(famillesRes.data || []);

      // ── Présences ────────────────────────────────────────────
      const sessIds = sess.map(s => s.id);
      const { data: presData } = await supabase
        .from("presences").select("attendance_id, membre_id, statut").in("attendance_id", sessIds);
      const grouped = {};
      (presData || []).forEach(p => {
        if (!grouped[p.attendance_id]) grouped[p.attendance_id] = [];
        grouped[p.attendance_id].push(p);
      });
      setPresencesParSession(grouped);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [initProfile, filtrePeriode, filtreType, cellulesActive, famillesActive]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const typesDistincts = [...new Set(sessions.map(s => s.typeTemps).filter(Boolean))];

  return (
    <div className="min-h-screen flex flex-col items-center p-4 sm:p-6" style={{ background: "#333699" }}>
      <HeaderPages />

      <div className="w-full max-w-2xl mt-6 flex flex-col gap-5 mb-10">

        {/* En-tête */}
        <div>
          <h1 className="text-2xl font-bold text-white">{t.pageTitle}</h1>
          <p className="text-white/50 text-sm mt-0.5">{t.pageSubtitle}</p>
        </div>

        {/* Filtres */}
        <div className="bg-white/10 rounded-2xl p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-white/50 flex-shrink-0">{t.periodLabel}</span>
            {t.periods.map(p => (
              <button key={p.val} onClick={() => setFiltrePeriode(p.val)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition ${filtrePeriode === p.val ? "bg-white text-[#333699]" : "bg-white/15 text-white/70 hover:bg-white/20"}`}>
                {p.label}
              </button>
            ))}
          </div>
          {typesDistincts.length > 1 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-white/50 flex-shrink-0">{t.typeLabel}</span>
              <button onClick={() => setFiltreType("")}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition ${!filtreType ? "bg-white text-[#333699]" : "bg-white/15 text-white/70 hover:bg-white/20"}`}>
                {t.tous}
              </button>
              {typesDistincts.map(type => (
                <button key={type} onClick={() => setFiltreType(type)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition ${filtreType === type ? "bg-white text-[#333699]" : "bg-white/15 text-white/70 hover:bg-white/20"}`}>
                  {type}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Onglets */}
        <div className="flex gap-1 bg-white/10 rounded-xl p-1 overflow-x-auto">
          {onglets.map(o => (
            <button key={o.key} onClick={() => setOnglet(o.key)}
              className={`flex-1 min-w-fit py-2 px-3 rounded-lg text-sm font-semibold transition whitespace-nowrap ${onglet === o.key ? "bg-white text-[#333699]" : "text-white/50 hover:text-white/80"}`}>
              {o.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="bg-white/10 rounded-2xl p-8 text-center text-white/40 text-sm">
            {t.noSession}
          </div>
        ) : onglet === "kpi" ? (
          <div className="flex flex-col gap-7">
            <div>
              <SectionTitle>{t.sectionOverview}</SectionTitle>
              <BlocKpiGlobaux sessions={sessions} presencesParSession={presencesParSession} allMembres={allMembres} t={t} />
            </div>
            <div>
              <SectionTitle>{t.sectionSegmentation}</SectionTitle>
              <BlocSegmentation sessions={sessions} presencesParSession={presencesParSession} allMembres={allMembres}
                onVoirSegment={(label, membres) => setSegmentOuvert({ label, membres })} t={t} />
            </div>
            {(() => {
              const sessionsTriees = [...sessions].sort((a, b) => b.date.localeCompare(a.date));
              const hasAlertes = allMembres.some(m => absencesConsecutives(m.id, sessionsTriees, presencesParSession) >= 3);
              return hasAlertes ? (
                <div>
                  <SectionTitle>{t.sectionAlertes}</SectionTitle>
                  <BlocAlertes sessions={sessions} presencesParSession={presencesParSession} allMembres={allMembres} t={t} />
                </div>
              ) : null;
            })()}
            <div>
              <SectionTitle>{t.sectionTauxType}</SectionTitle>
              <BlocTauxParType sessions={sessions} presencesParSession={presencesParSession} totalMembres={allMembres.length} t={t} />
            </div>
            <div>
              <SectionTitle>{t.sectionTendance}</SectionTitle>
              <div className="bg-white/10 rounded-2xl px-4 py-4">
                <BlocTendance sessions={sessions} presencesParSession={presencesParSession} totalMembres={allMembres.length} t={t} />
              </div>
            </div>
            <div>
              <SectionTitle>{t.sectionTopFideles}</SectionTitle>
              <BlocTopFideles sessions={sessions} presencesParSession={presencesParSession} allMembres={allMembres} t={t} />
            </div>
            <div>
              <SectionTitle>{t.sectionGenre}</SectionTitle>
              <div className="bg-white/10 rounded-2xl px-4 py-4">
                <BlocGenre sessions={sessions} presencesParSession={presencesParSession} allMembres={allMembres} t={t} />
              </div>
            </div>
          </div>

        ) : onglet === "cellules" ? (
          <OngletCellules sessions={sessions} presencesParSession={presencesParSession} allMembres={allMembres} cellules={cellules} t={t} />

        ) : onglet === "familles" ? (
          <OngletFamilles sessions={sessions} presencesParSession={presencesParSession} allMembres={allMembres} familles={familles} t={t} />

        ) : (
          <div className="flex flex-col gap-3">
            {sessions.map(s => (
              <CarteSession key={s.id} session={s} presences={presencesParSession[s.id] || []} allMembres={allMembres} t={t} />
            ))}
          </div>
        )}

      </div>

      <DrawerSegment segment={segmentOuvert} onClose={() => setSegmentOuvert(null)} t={t} />
      <Footer />
    </div>
  );
}
