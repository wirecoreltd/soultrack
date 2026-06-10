cat > /home/claude/rapport-presence-enfants.jsx << 'ENDOFFILE'
"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import supabase from "../../lib/supabaseClient";
import HeaderPages from "../../components/HeaderPages";
import ProtectedRoute from "../../components/ProtectedRoute";
import Footer from "../../components/Footer";
import { useLang } from "../../hooks/useLang";

// ─── TRANCHES D'ÂGE ──────────────────────────────────────────────────────────
function getTranche(dateNaissance) {
  if (!dateNaissance) return { label: "—", color: "#e5e7eb" };
  const age = Math.floor((new Date() - new Date(dateNaissance)) / (1000 * 60 * 60 * 24 * 365.25));
  if (age <= 6)  return { label: "3-6 ans",   color: "#FCD34D" };
  if (age <= 13) return { label: "7-12 ans",  color: "#6EE7B7" };
  return                { label: "13-14 ans", color: "#93C5FD" };
}

// ─── TRADUCTIONS ──────────────────────────────────────────────────────────────
const translations = {
  fr: {
    pageTitle: "Rapport de présences",
    pageSubtitle: "Suivi des enfants & indicateurs de fidélité",
    periodLabel: "Période :",
    typeLabel: "Type :",
    tous: "Tous",
    periods: [
      { label: "7 j",   val: "7"   },
      { label: "30 j",  val: "30"  },
      { label: "90 j",  val: "90"  },
      { label: "6 mois",val: "180" },
    ],
    tabKpi:      "Vue d'ensemble",
    tabSessions: "Par session",
    noSession: "Aucune session sur cette période",
    kpiSessions:    "Sessions",
    kpiSessionsSub: "sur la période",
    kpiTauxMoyen:   "Taux moyen",
    kpiTauxSub:     "de présence",
    kpiEnfants:     "Enfants suivis",
    kpiEnfantsSub:  "actifs",
    kpiAlertes:     "En alerte",
    kpiAlertesSub:  "≥ 3 abs. consécutives",
    sectionOverview:    "Vue d'ensemble",
    sectionSegmentation:"Segmentation fidélité — cliquer pour voir la liste",
    sectionAlertes:     "Alertes — à visiter en priorité",
    sectionTauxType:    "Taux de présence par type de temps",
    sectionTendance:    "Tendance hebdomadaire",
    sectionTopFideles:  "Top fidèles",
    sectionTranches:    "Répartition par tranche d'âge",
    sectionBesoins:     "Besoins spéciaux — vue globale",
    reguliers:        "Réguliers",
    irreguliers:      "Irréguliers",
    decrocheurs:      "Décrocheurs",
    absentsChroniques:"Absents chroniques",
    vuLe:         (date) => `Vu le ${date}`,
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
    tranche36:   "3-6 ans",
    tranche712:  "7-12 ans",
    tranche1314: "13-14 ans",
    nonRenseigne: "Non renseigné",
    presents: (n) => `✔ Présents (${n})`,
    absents:  (n) => `✗ Absents (${n})`,
    aucun:        "Aucun",
    aucunEnfant:  "Aucun enfant",
    tendanceStable: "→ stable",
    aucunBesoin: "Aucun besoin renseigné",
  },
  en: {
    pageTitle: "Attendance Report",
    pageSubtitle: "Children follow-up & loyalty indicators",
    periodLabel: "Period:",
    typeLabel: "Type:",
    tous: "All",
    periods: [
      { label: "7 d",  val: "7"   },
      { label: "30 d", val: "30"  },
      { label: "90 d", val: "90"  },
      { label: "6 mo", val: "180" },
    ],
    tabKpi:      "Overview",
    tabSessions: "By session",
    noSession: "No session for this period",
    kpiSessions:    "Sessions",
    kpiSessionsSub: "for the period",
    kpiTauxMoyen:   "Average rate",
    kpiTauxSub:     "attendance",
    kpiEnfants:     "Tracked children",
    kpiEnfantsSub:  "active",
    kpiAlertes:     "On alert",
    kpiAlertesSub:  "≥ 3 consecutive abs.",
    sectionOverview:    "Overview",
    sectionSegmentation:"Loyalty segmentation — click to see list",
    sectionAlertes:     "Alerts — priority visits",
    sectionTauxType:    "Attendance rate by session type",
    sectionTendance:    "Weekly trend",
    sectionTopFideles:  "Top regulars",
    sectionTranches:    "Breakdown by age group",
    sectionBesoins:     "Special needs — global view",
    reguliers:        "Regulars",
    irreguliers:      "Irregulars",
    decrocheurs:      "Dropping off",
    absentsChroniques:"Chronic absents",
    vuLe:         (date) => `Last seen ${date}`,
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
    tranche36:   "3-6 yrs",
    tranche712:  "7-12 yrs",
    tranche1314: "13-14 yrs",
    nonRenseigne: "Not specified",
    presents: (n) => `✔ Present (${n})`,
    absents:  (n) => `✗ Absent (${n})`,
    aucun:       "None",
    aucunEnfant: "No children",
    tendanceStable: "→ stable",
    aucunBesoin: "No needs recorded",
  },
};

export default function RapportPresenceEnfantsPage() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur", "ResponsableEnfants"]}>
      <RapportPresenceEnfants />
    </ProtectedRoute>
  );
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
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
function absencesConsecutives(enfantId, sessionsTriees, presencesParSession) {
  let count = 0;
  for (const s of sessionsTriees) {
    const p = (presencesParSession[s.id] || []).find(p => p.enfant_id === enfantId);
    if (!p || p.statut === "absent") count++;
    else break;
  }
  return count;
}
function derniereDatePresence(enfantId, sessionsTriees, presencesParSession) {
  for (const s of sessionsTriees) {
    const p = (presencesParSession[s.id] || []).find(p => p.enfant_id === enfantId && p.statut === "present");
    if (p) return s.date;
  }
  return null;
}
function tauxPresence(enfantId, sessions, presencesParSession) {
  if (!sessions.length) return 0;
  let presents = 0;
  for (const s of sessions) {
    const p = (presencesParSession[s.id] || []).find(p => p.enfant_id === enfantId);
    if (p && p.statut === "present") presents++;
  }
  return Math.round((presents / sessions.length) * 100);
}
function parseBesoins(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  try { return JSON.parse(val); } catch { return []; }
}

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

const AVATAR_COLORS = [
  "bg-yellow-100 text-yellow-700", "bg-emerald-100 text-emerald-700",
  "bg-blue-100 text-blue-700",     "bg-purple-100 text-purple-700",
  "bg-rose-100 text-rose-700",     "bg-teal-100 text-teal-700",
];
function avatarColor(str) {
  let hash = 0;
  for (let c of (str || "")) hash = c.charCodeAt(0) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

// ─── UI ATOMS ─────────────────────────────────────────────────────────────────
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
    amber: "bg-amber-900/60 text-amber-300",     blue: "bg-blue-900/60 text-blue-300",
    yellow:"bg-yellow-900/60 text-yellow-300",   gray: "bg-white/10 text-white/50",
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
function TrancheBadge({ dateNaissance }) {
  const tr = getTranche(dateNaissance);
  if (tr.label === "—") return null;
  return (
    <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold text-gray-800 flex-shrink-0"
      style={{ background: tr.color }}>
      {tr.label}
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

// ─── BLOC KPI GLOBAUX ─────────────────────────────────────────────────────────
function BlocKpiGlobaux({ sessions, presencesParSession, allEnfants, t }) {
  const totalSessions = sessions.length;
  const totalEnfants  = allEnfants.length;
  const tauxMoyen = !totalSessions || !totalEnfants ? 0 : Math.round(
    sessions.reduce((acc, s) => {
      const pres = presencesParSession[s.id] || [];
      return acc + (pres.filter(p => p.statut === "present").length / totalEnfants) * 100;
    }, 0) / totalSessions
  );
  const sessionsTriees = [...sessions].sort((a, b) => b.date.localeCompare(a.date));
  const enAlerte = allEnfants.filter(e => absencesConsecutives(e.id, sessionsTriees, presencesParSession) >= 3).length;
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <KpiCard label={t.kpiSessions}  value={totalSessions} sub={t.kpiSessionsSub} accent="white" />
      <KpiCard label={t.kpiTauxMoyen} value={`${tauxMoyen}%`} sub={t.kpiTauxSub}
        accent={tauxMoyen >= 70 ? "green" : tauxMoyen >= 50 ? "amber" : "red"} />
      <KpiCard label={t.kpiEnfants}   value={totalEnfants} sub={t.kpiEnfantsSub} accent="white" />
      <KpiCard label={t.kpiAlertes}   value={enAlerte} sub={t.kpiAlertesSub}
        accent={enAlerte > 0 ? "red" : "green"} />
    </div>
  );
}

// ─── BLOC SEGMENTATION ────────────────────────────────────────────────────────
function BlocSegmentation({ sessions, presencesParSession, allEnfants, onVoirSegment, t }) {
  const segments = [
    { key: "reguliers",   label: t.reguliers,         min: 75, max: 100, badge: "green" },
    { key: "irreguliers", label: t.irreguliers,        min: 40, max: 74,  badge: "blue"  },
    { key: "decrocheurs", label: t.decrocheurs,        min: 15, max: 39,  badge: "amber" },
    { key: "absents",     label: t.absentsChroniques,  min: 0,  max: 14,  badge: "red"   },
  ];
  const enParSeg = segments.reduce((acc, seg) => {
    acc[seg.key] = allEnfants.filter(e => {
      const tx = tauxPresence(e.id, sessions, presencesParSession);
      return tx >= seg.min && tx <= seg.max;
    });
    return acc;
  }, {});
  return (
    <div className="grid grid-cols-2 gap-3">
      {segments.map(seg => {
        const enfants = enParSeg[seg.key];
        return (
          <button key={seg.key} onClick={() => onVoirSegment(seg.label, enfants)}
            className="bg-white/10 hover:bg-white/15 rounded-2xl px-4 py-4 flex flex-col gap-2 text-left transition active:scale-95">
            <div className="flex items-center justify-between">
              <p className="text-xs text-white/50">{seg.label}</p>
              <Badge color={seg.badge}>
                {seg.min === 0 ? `< ${seg.max + 1}%` : seg.max === 100 ? `≥ ${seg.min}%` : `${seg.min}–${seg.max}%`}
              </Badge>
            </div>
            <p className="text-2xl font-bold text-white">{enfants.length}</p>
            {enfants.length > 0 && (
              <p className="text-[11px] text-white/40 truncate">
                {enfants.slice(0, 3).map(e => `${e.prenom} ${e.nom}`).join(", ")}
                {enfants.length > 3 ? ` … +${enfants.length - 3}` : ""}
              </p>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ─── BLOC ALERTES ─────────────────────────────────────────────────────────────
function BlocAlertes({ sessions, presencesParSession, allEnfants, t }) {
  const [showAll, setShowAll] = useState(false);
  const sessionsTriees = [...sessions].sort((a, b) => b.date.localeCompare(a.date));
  const alertes = allEnfants
    .map(e => ({
      ...e,
      consec:      absencesConsecutives(e.id, sessionsTriees, presencesParSession),
      derniereDate:derniereDatePresence(e.id, sessionsTriees, presencesParSession),
    }))
    .filter(e => e.consec >= 3)
    .sort((a, b) => b.consec - a.consec);

  if (!alertes.length) return null;
  const affichees = showAll ? alertes : alertes.slice(0, 5);
  return (
    <div className="flex flex-col gap-2">
      {affichees.map(e => (
        <div key={e.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl border-l-2 ${e.consec >= 5 ? "bg-red-950/40 border-red-500" : "bg-amber-950/30 border-amber-500"}`}>
          <Avatar prenom={e.prenom} nom={e.nom} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{e.prenom} {e.nom}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <TrancheBadge dateNaissance={e.date_naissance} />
              <p className="text-[11px] text-white/40">
                {e.derniereDate ? t.vuLe(formatDateFr(e.derniereDate)) : t.jamaisPresent}
              </p>
            </div>
          </div>
          <Badge color={e.consec >= 5 ? "red" : "amber"}>{t.absences(e.consec)}</Badge>
        </div>
      ))}
      {alertes.length > 5 && (
        <button onClick={() => setShowAll(v => !v)}
          className="text-xs text-white/40 hover:text-white/70 text-center py-1 transition">
          {showAll ? t.reduce : t.showMore(alertes.length - 5)}
        </button>
      )}
    </div>
  );
}

// ─── BLOC TAUX PAR TYPE ───────────────────────────────────────────────────────
function BlocTauxParType({ sessions, presencesParSession, totalEnfants, t }) {
  const parType = {};
  sessions.forEach(s => {
    const type = s.typeTemps || "Autre";
    if (!parType[type]) parType[type] = { presents: 0, total: 0, nb: 0 };
    const pres = presencesParSession[s.id] || [];
    parType[type].presents += pres.filter(p => p.statut === "present").length;
    parType[type].total    += totalEnfants;
    parType[type].nb++;
  });
  const lignes = Object.entries(parType)
    .map(([type, { presents, total, nb }]) => ({
      type, nb, taux: total > 0 ? Math.round((presents / total) * 100) : 0,
    }))
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

// ─── BLOC TENDANCE HEBDO ──────────────────────────────────────────────────────
function BlocTendance({ sessions, presencesParSession, totalEnfants, t }) {
  const parSemaine = {};
  sessions.forEach(s => {
    const d   = new Date(s.date + "T00:00:00");
    const jan = new Date(d.getFullYear(), 0, 1);
    const sem = `${d.getFullYear()}-S${String(Math.ceil(((d - jan) / 86400000 + jan.getDay() + 1) / 7)).padStart(2, "0")}`;
    if (!parSemaine[sem]) parSemaine[sem] = { presents: 0, total: 0, dates: [] };
    const pres = presencesParSession[s.id] || [];
    parSemaine[sem].presents += pres.filter(p => p.statut === "present").length;
    parSemaine[sem].total    += totalEnfants;
    parSemaine[sem].dates.push(s.date);
  });
  const semaines = Object.entries(parSemaine)
    .sort(([a], [b]) => a.localeCompare(b)).slice(-8)
    .map(([sem, { presents, total, dates }]) => ({
      sem, taux: total > 0 ? Math.round((presents / total) * 100) : 0,
      label: dates.length > 0 ? formatDateCourt(dates[0]) : sem,
    }));
  if (semaines.length < 2)
    return <p className="text-white/30 text-sm text-center py-4">{t.insuffisantData}</p>;
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
            <div
              className={`w-full rounded-t-sm ${taux >= 70 ? "bg-emerald-500" : taux >= 40 ? "bg-amber-500" : "bg-red-500"}`}
              style={{ height: `${Math.max(4, taux)}%` }}
            />
            <p className="text-[9px] text-white/30 truncate w-full text-center">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── BLOC TOP FIDÈLES ─────────────────────────────────────────────────────────
function BlocTopFideles({ sessions, presencesParSession, allEnfants, t }) {
  const [showAll, setShowAll] = useState(false);
  const ranked = allEnfants
    .map(e => ({ ...e, taux: tauxPresence(e.id, sessions, presencesParSession) }))
    .sort((a, b) => b.taux - a.taux)
    .slice(0, 30);
  const affichees = showAll ? ranked : ranked.slice(0, 5);
  if (!ranked.length)
    return <p className="text-white/30 text-sm text-center py-4">{t.topNoData}</p>;
  return (
    <div className="flex flex-col gap-2">
      {affichees.map((e, i) => (
        <div key={e.id} className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-2.5">
          <span className="text-xs text-white/30 w-5 text-center flex-shrink-0">{i + 1}</span>
          <Avatar prenom={e.prenom} nom={e.nom} />
          <p className="text-sm text-white flex-1 truncate">{e.prenom} {e.nom}</p>
          <TrancheBadge dateNaissance={e.date_naissance} />
          <BarreProgression pct={e.taux} />
          <Badge color={e.taux >= 75 ? "green" : e.taux >= 40 ? "amber" : "red"}>{e.taux}%</Badge>
        </div>
      ))}
      {ranked.length > 5 && (
        <button onClick={() => setShowAll(v => !v)}
          className="text-xs text-white/40 hover:text-white/70 text-center py-1 transition">
          {showAll ? t.reduce : t.showMore(ranked.length - 5)}
        </button>
      )}
    </div>
  );
}

// ─── BLOC TRANCHES D'ÂGE ─────────────────────────────────────────────────────
function BlocTranches({ sessions, presencesParSession, allEnfants, t }) {
  const derniereSess = [...sessions].sort((a, b) => b.date.localeCompare(a.date))[0];
  if (!derniereSess) return null;
  const pres       = (presencesParSession[derniereSess.id] || []).filter(p => p.statut === "present");
  const presentIds = new Set(pres.map(p => p.enfant_id));
  const presents   = allEnfants.filter(e => presentIds.has(e.id));

  const tranches = [
    { label: "3-6 ans",   tKey: "tranche36",   color: "#FCD34D", textColor: "#92400e" },
    { label: "7-12 ans",  tKey: "tranche712",  color: "#6EE7B7", textColor: "#065f46" },
    { label: "13-14 ans", tKey: "tranche1314", color: "#93C5FD", textColor: "#1e40af" },
  ];
  const total = presents.length;

  return (
    <div className="flex flex-col gap-3">
      <p className="text-[11px] text-white/40">{t.lastSession(formatDateFr(derniereSess.date))}</p>
      <div className="grid grid-cols-3 gap-2">
        {tranches.map(tr => {
          const n   = presents.filter(e => getTranche(e.date_naissance).label === tr.label).length;
          const pct = total > 0 ? Math.round((n / total) * 100) : 0;
          return (
            <div key={tr.label} className="rounded-xl px-3 py-3 text-center"
              style={{ background: tr.color + "30" }}>
              <p className="text-xl font-bold" style={{ color: tr.color }}>{n}</p>
              <p className="text-[11px] mt-0.5" style={{ color: tr.color + "cc" }}>{t[tr.tKey]}</p>
              <p className="text-[10px] mt-0.5 text-white/30">{pct}%</p>
            </div>
          );
        })}
      </div>
      {total > 0 && (
        <div className="flex h-2 rounded-full overflow-hidden gap-0.5">
          {tranches.map(tr => {
            const n   = presents.filter(e => getTranche(e.date_naissance).label === tr.label).length;
            const pct = total > 0 ? Math.round((n / total) * 100) : 0;
            return pct > 0 ? (
              <div key={tr.label} className="rounded-full" style={{ width: `${pct}%`, background: tr.color }} />
            ) : null;
          })}
        </div>
      )}
    </div>
  );
}

// ─── BLOC BESOINS ─────────────────────────────────────────────────────────────
function BlocBesoins({ allEnfants, lang, t }) {
  const compteur = {};
  allEnfants.forEach(e => {
    parseBesoins(e.besoins_speciaux).forEach(b => {
      compteur[b] = (compteur[b] || 0) + 1;
    });
  });
  const lignes = Object.entries(compteur).sort((a, b) => b[1] - a[1]);
  if (!lignes.length)
    return <p className="text-white/30 text-sm text-center py-4">{t.aucunBesoin}</p>;
  const max = lignes[0][1];
  return (
    <div className="flex flex-col gap-2">
      {lignes.map(([besoin, count]) => (
        <div key={besoin} className="bg-white/10 rounded-xl px-4 py-3 flex items-center gap-3">
          <p className="text-sm text-white w-48 flex-shrink-0 truncate">
            {BESOINS_LABELS[lang]?.[besoin] ?? besoin}
          </p>
          <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-blue-400 transition-all"
              style={{ width: `${Math.round((count / max) * 100)}%` }} />
          </div>
          <span className="text-sm font-bold text-white w-6 text-right">{count}</span>
        </div>
      ))}
    </div>
  );
}

// ─── CARTE SESSION ────────────────────────────────────────────────────────────
function CarteSession({ session, presences, allEnfants, lang, t }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab]   = useState("presents");

  const presentIds = new Set(presences.filter(p => p.statut === "present").map(p => p.enfant_id));
  const presents   = allEnfants.filter(e => presentIds.has(e.id)).sort((a, b) => a.nom.localeCompare(b.nom, "fr"));
  const absents    = allEnfants.filter(e => !presentIds.has(e.id)).sort((a, b) => a.nom.localeCompare(b.nom, "fr"));
  const taux       = allEnfants.length > 0 ? Math.round((presents.length / allEnfants.length) * 100) : 0;

  return (
    <div className="bg-white/10 rounded-2xl overflow-hidden">
      <button onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-4 hover:bg-white/5 transition text-left gap-3">
        <div className="flex flex-col gap-0.5">
          <span className="font-semibold text-white text-sm">{sessionLabel(session)}</span>
          <span className="text-[11px] text-white/40">
            {formatDateFr(session.date)}{session.heure ? ` · ${session.heure}` : ""}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${taux >= 70 ? "bg-emerald-400" : taux >= 40 ? "bg-amber-400" : "bg-red-400"}`}
                style={{ width: `${taux}%` }} />
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
            <button onClick={() => setTab("presents")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${tab === "presents" ? "bg-emerald-600 text-white" : "bg-white/10 text-white/50 hover:bg-white/15"}`}>
              {t.presents(presents.length)}
            </button>
            <button onClick={() => setTab("absents")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${tab === "absents" ? "bg-red-700 text-white" : "bg-white/10 text-white/50 hover:bg-white/15"}`}>
              {t.absents(absents.length)}
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {(tab === "presents" ? presents : absents).map(e => {
              const besoins = parseBesoins(e.besoins_speciaux);
              return (
                <div key={e.id} className="flex flex-col gap-1 px-3 py-2 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${tab === "presents" ? "bg-emerald-400" : "bg-red-400"}`} />
                    <span className="text-sm text-white/80 truncate flex-1">{e.prenom} {e.nom}</span>
                    <TrancheBadge dateNaissance={e.date_naissance} />
                  </div>
                  {besoins.length > 0 && (
                    <div className="flex flex-wrap gap-1 pl-3.5">
                      {besoins.map(b => (
                        <span key={b} className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-900/60 text-blue-300 font-medium">
                          {BESOINS_LABELS[lang]?.[b] ?? b}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            {(tab === "presents" ? presents : absents).length === 0 && (
              <p className="text-white/30 text-sm col-span-2 text-center py-2">{t.aucun}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── DRAWER SEGMENT ───────────────────────────────────────────────────────────
function DrawerSegment({ segment, onClose, lang, t }) {
  if (!segment) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative bg-[#2a2d80] rounded-t-3xl sm:rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden shadow-2xl"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <p className="font-bold text-white">
            {segment.label}
            <span className="text-white/40 font-normal text-sm ml-2">({segment.enfants.length})</span>
          </p>
          <button onClick={onClose} className="text-white/40 hover:text-white transition text-xl leading-none">×</button>
        </div>
        <div className="overflow-y-auto flex-1 px-5 py-3 flex flex-col gap-2">
          {segment.enfants.sort((a, b) => a.nom.localeCompare(b.nom, "fr")).map(e => {
            const besoins = parseBesoins(e.besoins_speciaux);
            return (
              <div key={e.id} className="flex flex-col gap-1.5 py-2 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <Avatar prenom={e.prenom} nom={e.nom} />
                  <p className="text-sm text-white flex-1">{e.prenom} {e.nom}</p>
                  <TrancheBadge dateNaissance={e.date_naissance} />
                </div>
                {besoins.length > 0 && (
                  <div className="flex flex-wrap gap-1 pl-11">
                    {besoins.map(b => (
                      <span key={b} className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-900/60 text-blue-300 font-medium">
                        {BESOINS_LABELS[lang]?.[b] ?? b}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          {segment.enfants.length === 0 && (
            <p className="text-white/30 text-sm text-center py-6">{t.aucunEnfant}</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── PAGE PRINCIPALE ──────────────────────────────────────────────────────────
function RapportPresenceEnfants() {
  const { lang } = useLang();
  const t = translations[lang];

  const [sessions, setSessions]                       = useState([]);
  const [presencesParSession, setPresencesParSession] = useState({});
  const [allEnfants, setAllEnfants]                   = useState([]);
  const [loading, setLoading]                         = useState(true);
  const [filtrePeriode, setFiltrePeriode]             = useState("30");
  const [filtreType, setFiltreType]                   = useState("");
  const [onglet, setOnglet]                           = useState("kpi");
  const [segmentOuvert, setSegmentOuvert]             = useState(null);

  const profileRef = useRef(null);

  const initProfile = useCallback(async () => {
    if (profileRef.current) return;
    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile }  = await supabase
      .from("profiles").select("eglise_id, roles").eq("id", user.id).single();
    profileRef.current = { ...profile, uid: user.id };
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      await initProfile();
      const profile = profileRef.current;

      const depuis = new Date();
      depuis.setDate(depuis.getDate() - Number(filtrePeriode));
      const depuisStr = depuis.toISOString().split("T")[0];

      // ── Sessions ─────────────────────────────────────────────
      let sessQuery = supabase
        .from("attendance_enfants")
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
        setAllEnfants([]); setPresencesParSession({});
        setLoading(false); return;
      }

      // ── Enfants ───────────────────────────────────────────────
      const { data: enfantsData } = await supabase
        .from("enfants")
        .select("id, prenom, nom, date_naissance, besoins_speciaux")
        .eq("eglise_id", profile.eglise_id)
        .order("nom");
      setAllEnfants(enfantsData || []);

      // ── Présences ─────────────────────────────────────────────
      const sessIds = sess.map(s => s.id);
      const { data: presData } = await supabase
        .from("presences_enfants")
        .select("attendance_enfant_id, enfant_id, statut")
        .in("attendance_enfant_id", sessIds);
      const grouped = {};
      (presData || []).forEach(p => {
        if (!grouped[p.attendance_enfant_id]) grouped[p.attendance_enfant_id] = [];
        grouped[p.attendance_enfant_id].push(p);
      });
      setPresencesParSession(grouped);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [initProfile, filtrePeriode, filtreType]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const typesDistincts = [...new Set(sessions.map(s => s.typeTemps).filter(Boolean))];

  const onglets = [
    { key: "kpi",      label: t.tabKpi },
    { key: "sessions", label: t.tabSessions },
  ];

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
        <div className="flex gap-1 bg-white/10 rounded-xl p-1">
          {onglets.map(o => (
            <button key={o.key} onClick={() => setOnglet(o.key)}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition ${onglet === o.key ? "bg-white text-[#333699]" : "text-white/50 hover:text-white/80"}`}>
              {o.label}
            </button>
          ))}
        </div>

        {/* Contenu */}
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
              <BlocKpiGlobaux sessions={sessions} presencesParSession={presencesParSession} allEnfants={allEnfants} t={t} />
            </div>

            <div>
              <SectionTitle>{t.sectionSegmentation}</SectionTitle>
              <BlocSegmentation
                sessions={sessions} presencesParSession={presencesParSession} allEnfants={allEnfants}
                onVoirSegment={(label, enfants) => setSegmentOuvert({ label, enfants })} t={t} />
            </div>

            {(() => {
              const sessionsTriees = [...sessions].sort((a, b) => b.date.localeCompare(a.date));
              const hasAlertes = allEnfants.some(e => absencesConsecutives(e.id, sessionsTriees, presencesParSession) >= 3);
              return hasAlertes ? (
                <div>
                  <SectionTitle>{t.sectionAlertes}</SectionTitle>
                  <BlocAlertes sessions={sessions} presencesParSession={presencesParSession} allEnfants={allEnfants} t={t} />
                </div>
              ) : null;
            })()}

            <div>
              <SectionTitle>{t.sectionTauxType}</SectionTitle>
              <BlocTauxParType sessions={sessions} presencesParSession={presencesParSession} totalEnfants={allEnfants.length} t={t} />
            </div>

            <div>
              <SectionTitle>{t.sectionTendance}</SectionTitle>
              <div className="bg-white/10 rounded-2xl px-4 py-4">
                <BlocTendance sessions={sessions} presencesParSession={presencesParSession} totalEnfants={allEnfants.length} t={t} />
              </div>
            </div>

            <div>
              <SectionTitle>{t.sectionTopFideles}</SectionTitle>
              <BlocTopFideles sessions={sessions} presencesParSession={presencesParSession} allEnfants={allEnfants} t={t} />
            </div>

            <div>
              <SectionTitle>{t.sectionTranches}</SectionTitle>
              <div className="bg-white/10 rounded-2xl px-4 py-4">
                <BlocTranches sessions={sessions} presencesParSession={presencesParSession} allEnfants={allEnfants} t={t} />
              </div>
            </div>

            <div>
              <SectionTitle>{t.sectionBesoins}</SectionTitle>
              <BlocBesoins allEnfants={allEnfants} lang={lang} t={t} />
            </div>

          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {sessions.map(s => (
              <CarteSession key={s.id} session={s} presences={presencesParSession[s.id] || []} allEnfants={allEnfants} lang={lang} t={t} />
            ))}
          </div>
        )}

      </div>

      <DrawerSegment segment={segmentOuvert} onClose={() => setSegmentOuvert(null)} lang={lang} t={t} />
      <Footer />
    </div>
  );
}
