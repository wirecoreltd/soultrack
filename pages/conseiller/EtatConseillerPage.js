"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "../../lib/supabaseClient";
import HeaderPages from "../../components/HeaderPages";
import Footer from "../../components/Footer";
import ProtectedRoute from "../../components/ProtectedRoute";
import DetailsEtatConsEvangePopup from "../../components/DetailsEtatConsEvangePopup";
import DetailsEtatConseillerPopup from "../../components/DetailsEtatConseillerPopup";
import { useLang } from "../../hooks/useLang";

const translations = {
  fr: {
    // Page
    pageTitle1: "L'Évolution des Âmes par",
    pageTitle2: "Conseiller",
    intro1: "Suivez l'évolution",
    introMid:
      " des personnes accompagnées par les conseillers. Visualisez les étapes, ",
    intro2: "analysez les parcours et mesurez les progrès dans le temps",
    introEnd: ", pour mieux comprendre, ajuster et faire ",
    intro3: "progresser chaque accompagnement",

    // Filtres
    periodRapide: "Période rapide",
    trancheDates: "Tranche de dates",
    periode: "Période :",
    periods: [
      { label: "7 j", val: "7" },
      { label: "30 j", val: "30" },
      { label: "90 j", val: "90" },
      { label: "6 mois", val: "180" },
      { label: "1 an", val: "365" },
    ],
    dateDebut: "Date de début",
    dateFin: "Date de fin",
    genererRapport: "Générer le rapport",
    tousConseillers: "Tous les conseillers",
    conseillerLabel: "Conseiller",

    // Onglets
    tabKpi: "Vue d'ensemble",
    tabConseillers: "Par conseiller",
    tabMois: "Par mois",

    // KPI labels
    kpiEvangelises: "Évangélisés",
    kpiEvangelisesSub: "contacts évangélisation",
    kpiVenus: "Venus à l'église",
    kpiVenusSub: "contacts intégration",
    kpiIntegres: "Intégrés",
    kpiBaptemes: "Baptêmes",
    kpiMinistere: "Ministère",
    kpiMinistereSub: "début ministère",
    kpiEnCours: "En cours",
    kpiEnCoursSub: "suivi actif",
    kpiEnAttente: "En attente",
    kpiEnAttenteSub: "à traiter",
    kpiRefus: "Refus",
    kpiPctTotal: "% du total",

    // Sections
    sectionVue: "Vue d'ensemble",
    sectionPerf: "Performance par conseiller",

    // États
    loading: "Chargement...",
    noDataPerso:
      "Choisissez une plage de dates et cliquez sur « Générer le rapport »",
    noDataPeriod: "Aucune donnée sur cette période",
    noData: "Aucune donnée",

    // Statuts
    integre: "Intégré",
    enAttente: "En attente",
    refus: "Refus",
    enCours: "En cours",

    // Carte ligne
    conseillerField: "Conseiller",
    assigneLeField: "Assigné le",
    dateEvolution: "Date évolution",
    bapteme: "Baptême",
    debutMinistere: "Début ministère",
    type: "Type",
    voirDetails: "Voir les détails",

    // Par mois
    personnes: "personnes",
    personne: "personne",
    pctIntegres: "% intégrées",

    // Non assigné
    nonAssigne: "Non assigné",

    // Barre progression
    pctIntLabel: "% intégrés",
  },
  en: {
    // Page
    pageTitle1: "Soul Progress by",
    pageTitle2: "Counsellor",
    intro1: "Track the progress",
    introMid:
      " of people accompanied by counsellors. Visualise each stage, ",
    intro2: "analyse journeys and measure progress over time",
    introEnd: ", to better understand, adjust, and ",
    intro3: "advance every accompaniment",

    // Filtres
    periodRapide: "Quick period",
    trancheDates: "Date range",
    periode: "Period:",
    periods: [
      { label: "7 d", val: "7" },
      { label: "30 d", val: "30" },
      { label: "90 d", val: "90" },
      { label: "6 mo", val: "180" },
      { label: "1 yr", val: "365" },
    ],
    dateDebut: "Start date",
    dateFin: "End date",
    genererRapport: "Generate report",
    tousConseillers: "All counsellors",
    conseillerLabel: "Counsellor",

    // Onglets
    tabKpi: "Overview",
    tabConseillers: "By counsellor",
    tabMois: "By month",

    // KPI labels
    kpiEvangelises: "Evangelised",
    kpiEvangelisesSub: "evangelisation contacts",
    kpiVenus: "Came to church",
    kpiVenusSub: "integration contacts",
    kpiIntegres: "Integrated",
    kpiBaptemes: "Baptisms",
    kpiMinistere: "Ministry",
    kpiMinistereSub: "ministry started",
    kpiEnCours: "In progress",
    kpiEnCoursSub: "active follow-up",
    kpiEnAttente: "Pending",
    kpiEnAttenteSub: "to process",
    kpiRefus: "Refusals",
    kpiPctTotal: "% of total",

    // Sections
    sectionVue: "Overview",
    sectionPerf: "Performance by counsellor",

    // États
    loading: "Loading...",
    noDataPerso:
      "Choose a date range and click « Generate report »",
    noDataPeriod: "No data for this period",
    noData: "No data",

    // Statuts
    integre: "Integrated",
    enAttente: "Pending",
    refus: "Refusal",
    enCours: "In progress",

    // Carte ligne
    conseillerField: "Counsellor",
    assigneLeField: "Assigned on",
    dateEvolution: "Progress date",
    bapteme: "Baptism",
    debutMinistere: "Ministry start",
    type: "Type",
    voirDetails: "View details",

    // Par mois
    personnes: "people",
    personne: "person",
    pctIntegres: "% integrated",

    // Non assigné
    nonAssigne: "Unassigned",

    // Barre progression
    pctIntLabel: "% integrated",
  },
};

// ─── HELPERS ──────────────────────────────────────────────────
function formatDateFR(dateStr, lang = "fr") {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  // Both locales use DD/MM/YYYY; keep consistent
  return `${day}/${month}/${year}`;
}

function getMonthLabel(monthIndex, lang) {
  const fr = [
    "Janvier","Février","Mars","Avril","Mai","Juin",
    "Juillet","Août","Septembre","Octobre","Novembre","Décembre",
  ];
  const en = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December",
  ];
  return (lang === "en" ? en : fr)[monthIndex] || "";
}

function getStatutNormalise(statut) {
  if (!statut) return "";
  const s = statut.toLowerCase();
  if (s.includes("envoy")) return "en attente";
  return s;
}

function formatStatut(statut, t) {
  if (!statut) return "—";
  const s = statut.toLowerCase();
  if (s.includes("envoy")) return t.enAttente;
  return statut;
}

// ─── UI ATOMS ─────────────────────────────────────────────────
function SectionTitle({ children }) {
  return (
    <p className="text-sm font-semibold uppercase tracking-widest text-white/80 mb-3">
      {children}
    </p>
  );
}

function KpiCard({ label, value, sub, accent, onClick }) {
  const c = {
    green: "text-emerald-400", red: "text-red-400", amber: "text-amber-400",
    white: "text-white", blue: "text-blue-300", pink: "text-pink-300",
    purple: "text-purple-300", teal: "text-teal-300", orange: "text-orange-300",
    gray: "text-white/40", indigo: "text-indigo-300", yellow: "text-yellow-300",
  };
  return (
    <div
      onClick={onClick}
      className={`bg-white/10 rounded-2xl px-4 py-4 flex flex-col gap-1 ${
        onClick ? "cursor-pointer hover:bg-white/15 active:scale-95 transition" : ""
      }`}
    >
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
    purple: "bg-purple-900/60 text-purple-300",
    gray: "bg-white/10 text-white/50",
    orange: "bg-orange-900/60 text-orange-300",
    yellow: "bg-yellow-900/60 text-yellow-300",
    indigo: "bg-indigo-900/60 text-indigo-300",
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

// ─── STATUT CONFIG ─────────────────────────────────────────────
function statutConfig(statutNorm, t) {
  switch (statutNorm) {
    case "intégré":
    case "integre":
      return { border: "border-emerald-500", badge: "green", label: t.integre };
    case "en attente":
      return { border: "border-white/20", badge: "gray", label: t.enAttente };
    case "refus":
      return { border: "border-red-500", badge: "red", label: t.refus };
    case "en cours":
    case "en suivis":
      return { border: "border-amber-500", badge: "amber", label: t.enCours };
    default:
      return {
        border: "border-white/20",
        badge: "gray",
        label: formatStatut(statutNorm, t),
      };
  }
}

// ─── BLOC KPI ─────────────────────────────────────────────────
function BlocKpi({ kpis, t }) {
  const total = kpis.totalEvangelises + kpis.totalVenus;
  const pct = (n) => (total > 0 ? Math.round((n / total) * 100) : 0);

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiCard label={t.kpiEvangelises} value={kpis.totalEvangelises} sub={t.kpiEvangelisesSub} accent="blue" />
        <KpiCard label={t.kpiVenus} value={kpis.totalVenus} sub={t.kpiVenusSub} accent="purple" />
        <KpiCard label={t.kpiIntegres} value={kpis.totalIntegration} sub={`${pct(kpis.totalIntegration)}% ${t.kpiPctTotal}`} accent="green" />
        <KpiCard label={t.kpiBaptemes} value={kpis.totalBapteme} sub={`${pct(kpis.totalBapteme)}% ${t.kpiPctTotal}`} accent="indigo" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiCard label={t.kpiMinistere} value={kpis.totalMinistere} sub={t.kpiMinistereSub} accent="teal" />
        <KpiCard label={t.kpiEnCours} value={kpis.totalEncours} sub={t.kpiEnCoursSub} accent="amber" />
        <KpiCard label={t.kpiEnAttente} value={kpis.totalAttente} sub={t.kpiEnAttenteSub} accent="gray" />
        <KpiCard label={t.kpiRefus} value={kpis.totalRefus} sub={`${pct(kpis.totalRefus)}% ${t.kpiPctTotal}`} accent="red" />
      </div>
    </div>
  );
}

// ─── BLOC PAR CONSEILLER ───────────────────────────────────────
function BlocParConseiller({ displayedReports, t }) {
  const parConseiller = {};
  displayedReports.forEach((r) => {
    const c = r.conseiller || t.nonAssigne;
    if (!parConseiller[c])
      parConseiller[c] = { total: 0, integres: 0, encours: 0, refus: 0 };
    parConseiller[c].total++;
    const s = getStatutNormalise(r.statut);
    if (s === "integre" || s === "intégré") parConseiller[c].integres++;
    else if (s === "en cours" || s === "en suivis") parConseiller[c].encours++;
    else if (s === "refus") parConseiller[c].refus++;
  });

  const max = Math.max(...Object.values(parConseiller).map((v) => v.total), 1);
  const lignes = Object.entries(parConseiller).sort((a, b) => b[1].total - a[1].total);

  if (!lignes.length)
    return (
      <p className="text-white/30 text-sm text-center py-4">{t.noData}</p>
    );

  return (
    <div className="flex flex-col gap-2">
      {lignes.map(([conseiller, { total, integres, encours, refus }]) => (
        <div
          key={conseiller}
          className="bg-white/10 rounded-xl px-4 py-3 flex flex-col gap-2"
        >
          <div className="flex items-center gap-3">
            <p className="text-sm text-white w-36 flex-shrink-0 truncate">
              {conseiller}
            </p>
            <BarreProgression pct={(total / max) * 100} color="bg-blue-400" />
            <span className="text-sm font-bold text-white w-6 text-right">
              {total}
            </span>
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

// ─── CARTE LIGNE ──────────────────────────────────────────────
function CarteLigne({ r, onDetails, t, lang }) {
  const [open, setOpen] = useState(false);
  const sn = getStatutNormalise(r.statut);
  const cfg = statutConfig(sn, t);

  const fields = [
    { label: t.conseillerField, value: r.conseiller },
    { label: t.assigneLeField, value: formatDateFR(r.envoyer_au_suivi_le, lang) },
    { label: t.dateEvolution, value: formatDateFR(r.date_integration, lang) },
    { label: t.bapteme, value: formatDateFR(r.date_baptise, lang) },
    { label: t.debutMinistere, value: formatDateFR(r.debut_ministere, lang) },
    { label: t.type, value: r.type_evangelisation },
  ];

  return (
    <div className={`bg-white/10 rounded-xl overflow-hidden border-l-2 ${cfg.border}`}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition text-left gap-3"
      >
        <div className="flex flex-col gap-0.5 flex-1 min-w-0">
          <span className="text-sm font-semibold text-white truncate">
            {r.nom_complet}
          </span>
          <span className="text-[11px] text-white/60">
            {r.type_evangelisation} · {formatDateFR(r.date_depart, lang)}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Badge color={cfg.badge}>{cfg.label}</Badge>
          <span className="text-white/30 text-xs">{open ? "▲" : "▼"}</span>
        </div>
      </button>

      {open && (
        <div className="border-t border-white/10 px-4 pb-4 pt-3 flex flex-col gap-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {fields.map(({ label, value }) => (
              <div key={label} className="bg-white/5 rounded-xl px-3 py-2">
                <p className="text-sm text-white/80">{label}</p>
                <p className="text-sm text-white/80">{value || "—"}</p>
              </div>
            ))}
          </div>
          <button
            onClick={() => onDetails(r)}
            className="w-full py-2 rounded-xl bg-amber-500/30 hover:bg-amber-500/50 text-amber-300 text-sm font-semibold transition"
          >
            {t.voirDetails}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── ONGLET PAR MOIS ──────────────────────────────────────────
function OngletParMois({ displayedReports, onDetails, t, lang }) {
  const [expandedMonths, setExpandedMonths] = useState({});

  const grouped = {};
  displayedReports.forEach((r) => {
    const d = new Date(r.date_depart);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (!grouped[key])
      grouped[key] = {
        label: `${getMonthLabel(d.getMonth(), lang)} ${d.getFullYear()}`,
        rows: [],
      };
    grouped[key].rows.push(r);
  });

  const sorted = Object.entries(grouped).sort((a, b) => {
    const [yA, mA] = a[0].split("-").map(Number);
    const [yB, mB] = b[0].split("-").map(Number);
    return new Date(yB, mB) - new Date(yA, mA);
  });

  if (!sorted.length)
    return (
      <p className="text-white/30 text-sm text-center py-8">
        {t.noDataPeriod}
      </p>
    );

  return (
    <div className="flex flex-col gap-3">
      {sorted.map(([key, { label, rows }]) => {
        const isOpen = expandedMonths[key];
        const integres = rows.filter((r) =>
          ["integre", "intégré"].includes(getStatutNormalise(r.statut))
        ).length;
        return (
          <div key={key} className="bg-white/10 rounded-2xl overflow-hidden">
            <button
              onClick={() =>
                setExpandedMonths((p) => ({ ...p, [key]: !p[key] }))
              }
              className="w-full flex items-center justify-between px-4 py-4 hover:bg-white/5 transition text-left gap-3"
            >
              <span className="font-semibold text-white">{label}</span>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Badge color="gray">
                  {rows.length}{" "}
                  {rows.length > 1 ? t.personnes : t.personne}
                </Badge>
                <Badge color="green">✔ {integres}</Badge>
                <span className="text-white/30 text-xs">
                  {isOpen ? "▲" : "▼"}
                </span>
              </div>
            </button>
            {isOpen && (
              <div className="border-t border-white/10 px-4 pb-4 pt-3 flex flex-col gap-2">
                {rows.map((r, i) => (
                  <CarteLigne key={i} r={r} onDetails={onDetails} t={t} lang={lang} />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── ONGLET PAR CONSEILLER ────────────────────────────────────
function OngletParConseillerDetail({ displayedReports, onDetails, t, lang }) {
  const [expandedConseillers, setExpandedConseillers] = useState({});

  const grouped = {};
  displayedReports.forEach((r) => {
    const c = r.conseiller || t.nonAssigne;
    if (!grouped[c]) grouped[c] = [];
    grouped[c].push(r);
  });

  const sorted = Object.entries(grouped).sort((a, b) => b[1].length - a[1].length);

  if (!sorted.length)
    return (
      <p className="text-white/30 text-sm text-center py-8">{t.noData}</p>
    );

  return (
    <div className="flex flex-col gap-3">
      {sorted.map(([conseiller, rows]) => {
        const isOpen = expandedConseillers[conseiller];
        const integres = rows.filter((r) =>
          ["integre", "intégré"].includes(getStatutNormalise(r.statut))
        ).length;
        const encours = rows.filter((r) =>
          ["en cours", "en suivis"].includes(getStatutNormalise(r.statut))
        ).length;
        const refus = rows.filter(
          (r) => getStatutNormalise(r.statut) === "refus"
        ).length;
        const pctInt =
          rows.length > 0 ? Math.round((integres / rows.length) * 100) : 0;

        return (
          <div
            key={conseiller}
            className="bg-white/10 rounded-2xl overflow-hidden"
          >
            <button
              onClick={() =>
                setExpandedConseillers((p) => ({
                  ...p,
                  [conseiller]: !p[conseiller],
                }))
              }
              className="w-full flex items-center justify-between px-4 py-4 hover:bg-white/5 transition text-left gap-3"
            >
              <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                <span className="font-semibold text-white truncate">
                  {conseiller}
                </span>
                <span className="text-[11px] text-white/60">
                  {rows.length}{" "}
                  {rows.length > 1 ? t.personnes : t.personne} ·{" "}
                  {pctInt}% {t.pctIntegres}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Badge color="green">✔ {integres}</Badge>
                <Badge color="amber">⏳ {encours}</Badge>
                <Badge color="red">✗ {refus}</Badge>
                <span className="text-white/30 text-xs">
                  {isOpen ? "▲" : "▼"}
                </span>
              </div>
            </button>
            {isOpen && (
              <div className="border-t border-white/10 px-4 pb-4 pt-3 flex flex-col gap-2">
                <div className="flex items-center gap-2 mb-2">
                  <BarreProgression pct={pctInt} color="bg-emerald-400" />
                  <span className="text-xs text-white/50">
                    {pctInt}% {t.pctIntLabel}
                  </span>
                </div>
                {rows.map((r, i) => (
                  <CarteLigne key={i} r={r} onDetails={onDetails} t={t} lang={lang} />
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
export default function EtatConseillerPage() {
  return (
    <ProtectedRoute
      allowedRoles={["Administrateur", "Conseiller", "ResponsableIntegration"]}
    >
      <EtatConseiller />
    </ProtectedRoute>
  );
}

function EtatConseiller() {
  const { lang } = useLang();
  const t = translations[lang];

  const router = useRouter();
  const [reports, setReports] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  // Filtres
  const [modePerso, setModePerso] = useState(false);
  const [filtrePeriode, setFiltrePeriode] = useState("30");
  const [filterDebut, setFilterDebut] = useState("");
  const [filterFin, setFilterFin] = useState("");
  const [filterConseiller, setFilterConseiller] = useState("");
  const [availableConseillers, setAvailableConseillers] = useState([]);

  // Onglets
  const [onglet, setOnglet] = useState("kpi");

  // Popups
  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedEvangelise, setSelectedEvangelise] = useState(null);

  // KPIs
  const [kpis, setKpis] = useState({
    totalEvangelises: 0, totalVenus: 0, totalIntegration: 0,
    totalBapteme: 0, totalMinistere: 0, totalRefus: 0,
    totalEncours: 0, totalAttente: 0,
  });

  // ─── Profil ─────────────────────────────────────
  useEffect(() => {
    const fetchProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (data) setUserProfile(data);
    };
    fetchProfile();
  }, []);

  // ─── Fetch ──────────────────────────────────────
  const fetchReports = async (overrideModePerso = null) => {
    if (!userProfile) return;
    setLoading(true);
    const isPerso =
      overrideModePerso !== null ? overrideModePerso : modePerso;
    const isAdmin = userProfile.roles?.includes("Administrateur");

    try {
      let query = supabase
        .from("vue_flow_conseillers")
        .select("*")
        .eq("eglise_id", userProfile.eglise_id)
        .order("date_depart", { ascending: false });

      if (!isAdmin) query = query.eq("conseiller_id", userProfile.id);

      const { data, error } = await query;
      if (error) throw error;

      let filtered = data || [];

      if (isPerso) {
        if (filterDebut)
          filtered = filtered.filter(
            (r) => new Date(r.date_depart) >= new Date(filterDebut)
          );
        if (filterFin)
          filtered = filtered.filter(
            (r) => new Date(r.date_depart) <= new Date(filterFin)
          );
      } else {
        const depuis = new Date();
        depuis.setDate(depuis.getDate() - Number(filtrePeriode));
        filtered = filtered.filter(
          (r) => new Date(r.date_depart) >= depuis
        );
      }

      setReports(filtered);
      setAvailableConseillers([
        ...new Set(filtered.map((r) => r.conseiller).filter(Boolean)),
      ]);
      setFilterConseiller("");
    } catch (err) {
      console.error("Erreur fetch:", err);
      setReports([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (userProfile && !modePerso) fetchReports(false);
  }, [userProfile, filtrePeriode, modePerso]);

  // ─── KPIs ────────────────────────────────────────
  const displayedReports = filterConseiller
    ? reports.filter((r) => r.conseiller === filterConseiller)
    : reports;

  useEffect(() => {
    const normalize = (text) =>
      text
        ?.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") || "";

    setKpis({
      totalEvangelises: displayedReports.filter((r) =>
        [
          "individuel","sortie de groupe","campagne d'evangelisation",
          "evangelisation de rue","evangelisation maison","evangelisation stade","evangelisation",
        ].some((t) => normalize(r.type_evangelisation).includes(normalize(t)))
      ).length,
      totalVenus: displayedReports.filter((r) =>
        normalize(r.type_evangelisation).includes("integration")
      ).length,
      totalIntegration: displayedReports.filter(
        (r) => normalize(r.statut) === "integre"
      ).length,
      totalBapteme: displayedReports.filter((r) => r.date_baptise).length,
      totalMinistere: displayedReports.filter((r) => r.debut_ministere).length,
      totalRefus: displayedReports.filter(
        (r) => normalize(r.statut) === "refus"
      ).length,
      totalEncours: displayedReports.filter((r) =>
        normalize(r.statut).includes("cours")
      ).length,
      totalAttente: displayedReports.filter((r) => {
        const s = normalize(r.statut);
        return s.includes("attente") || s.includes("envoye");
      }).length,
    });
  }, [displayedReports]);

  // ─── Details ─────────────────────────────────────
  const handleDetailsClick = async (row) => {
    if (!row?.personne_id) return;
    try {
      if (row.source === "evangelisation") {
        const { data } = await supabase
          .from("suivis_des_evangelises")
          .select("*")
          .eq("evangelise_id", row.personne_id)
          .maybeSingle();
        setSelectedEvangelise({ ...row, ...data });
      } else if (row.source === "integration") {
        const { data } = await supabase
          .from("membres_complets")
          .select("*")
          .eq("id", row.personne_id)
          .maybeSingle();
        if (data) setSelectedMember(data);
      }
    } catch (err) {
      console.error("Erreur details:", err);
    }
  };

  const onglets = [
    { key: "kpi", label: t.tabKpi },
    { key: "conseillers", label: t.tabConseillers },
    { key: "mois", label: t.tabMois },
  ];

  const hasData = reports.length > 0;

  return (
    <div
      className="min-h-screen flex flex-col items-center p-4 sm:p-6"
      style={{ background: "#333699" }}
    >
      <HeaderPages />

      <div className="w-full max-w-2xl mt-6 flex flex-col gap-5 mb-10">

        {/* En-tête */}
        <div className="text-center">
          <h1 className="text-2xl font-bold mt-4 mb-2 text-blue-300 text-center text-white">
            {t.pageTitle1}{" "}
            <span className="text-emerald-300">{t.pageTitle2}</span>
          </h1>
          <p className="italic text-base text-white/90">
            <span className="text-blue-300 font-semibold">{t.intro1}</span>
            {t.introMid}
            <span className="text-blue-300 font-semibold">{t.intro2}</span>
            {t.introEnd}
            <span className="text-blue-300 font-semibold">{t.intro3}</span>.
          </p>
        </div>

        {/* Filtres */}
        <div className="bg-white/10 rounded-2xl p-4 flex flex-col gap-3">
          {/* Toggle mode */}
          <div className="flex gap-1 bg-white/10 rounded-xl p-1 w-fit">
            <button
              onClick={() => setModePerso(false)}
              className={`px-3 py-1 rounded-lg text-sm font-semibold transition ${
                !modePerso
                  ? "bg-white text-[#333699]"
                  : "text-white/60 hover:text-white/80"
              }`}
            >
              {t.periodRapide}
            </button>
            <button
              onClick={() => setModePerso(true)}
              className={`px-3 py-1 rounded-lg text-sm font-semibold transition ${
                modePerso
                  ? "bg-white text-[#333699]"
                  : "text-white/60 hover:text-white/80"
              }`}
            >
              {t.trancheDates}
            </button>
          </div>

          {/* Période rapide */}
          {!modePerso && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-white/60 flex-shrink-0">
                {t.periode}
              </span>
              <div className="flex gap-1 bg-white/10 rounded-xl p-1 flex-wrap">
                {t.periods.map((p) => (
                  <button
                    key={p.val}
                    onClick={() => setFiltrePeriode(p.val)}
                    className={`px-3 py-1 rounded-lg text-sm font-semibold transition ${
                      filtrePeriode === p.val
                        ? "bg-white text-[#333699]"
                        : "text-white/60 hover:text-white/80"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tranche personnalisée */}
          {modePerso && (
            <div className="flex flex-col gap-2">
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-white/80">{t.dateDebut}</label>
                  <input
                    type="date"
                    value={filterDebut}
                    onChange={(e) => setFilterDebut(e.target.value)}
                    className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-white/40"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-white/80">{t.dateFin}</label>
                  <input
                    type="date"
                    value={filterFin}
                    onChange={(e) => setFilterFin(e.target.value)}
                    className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-white/40"
                  />
                </div>
              </div>
              <button
                onClick={() => fetchReports(true)}
                className="w-full py-2 rounded-xl bg-amber-500/80 hover:bg-amber-500 text-white text-sm font-semibold transition active:scale-95"
              >
                {t.genererRapport}
              </button>
            </div>
          )}

          {/* Filtre conseiller */}
          {hasData && availableConseillers.length > 1 && (
            <div className="flex flex-col gap-1">
              <label className="text-sm text-white/80">{t.conseillerLabel}</label>
              <select
                value={filterConseiller}
                onChange={(e) => setFilterConseiller(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-white/40 appearance-none cursor-pointer"
              >
                <option value="" className="bg-[#2a2d80]">
                  {t.tousConseillers}
                </option>
                {availableConseillers.map((c, i) => (
                  <option key={i} value={c} className="bg-[#2a2d80]">
                    {c}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Onglets */}
        <div className="flex gap-1 bg-white/10 rounded-xl p-1">
          {onglets.map((o) => (
            <button
              key={o.key}
              onClick={() => setOnglet(o.key)}
              className={`flex-1 py-2 px-2 rounded-lg text-sm font-semibold transition whitespace-nowrap ${
                onglet === o.key
                  ? "bg-white text-[#333699]"
                  : "text-white/80 hover:text-white"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>

        {/* Contenu */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
          </div>
        ) : !hasData ? (
          <div className="bg-white/10 rounded-2xl p-8 text-center text-white/40 text-sm">
            {modePerso ? t.noDataPerso : t.noDataPeriod}
          </div>
        ) : onglet === "kpi" ? (
          <div className="flex flex-col gap-7">
            <div>
              <SectionTitle>{t.sectionVue}</SectionTitle>
              <BlocKpi kpis={kpis} t={t} />
            </div>
            <div>
              <SectionTitle>{t.sectionPerf}</SectionTitle>
              <BlocParConseiller displayedReports={displayedReports} t={t} />
            </div>
          </div>
        ) : onglet === "conseillers" ? (
          <OngletParConseillerDetail
            displayedReports={displayedReports}
            onDetails={handleDetailsClick}
            t={t}
            lang={lang}
          />
        ) : (
          <OngletParMois
            displayedReports={displayedReports}
            onDetails={handleDetailsClick}
            t={t}
            lang={lang}
          />
        )}
      </div>

      {/* Popups */}
      {selectedEvangelise && (
        <DetailsEtatConseillerPopup
          member={selectedEvangelise}
          onClose={() => setSelectedEvangelise(null)}
          onUpdate={(id, updates) =>
            setReports((prev) =>
              prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
            )
          }
        />
      )}
      {selectedMember && (
        <DetailsEtatConsEvangePopup
          member={selectedMember}
          onClose={() => setSelectedMember(null)}
        />
      )}

      <Footer />
    </div>
  );
}
