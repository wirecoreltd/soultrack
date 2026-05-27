"use client";

import { useEffect, useState } from "react";
import supabase from "../../lib/supabaseClient";
import HeaderPages from "../../components/HeaderPages";
import Footer from "../../components/Footer";
import ProtectedRoute from "../../components/ProtectedRoute";
import { useLang } from "../../hooks/useLang";

// ─── TRADUCTIONS ───────────────────────────────────────────────
const translations = {
  fr: {
    title: "Rapport",
    titleAccent: "Ministère",
    intro1: "Suivez en un coup d'œil le nombre",
    intro2: "total de serviteurs",
    intro3: ", leur",
    intro4: "répartition par ministère",
    intro5: "et le",
    intro6: "niveau d'engagement global",
    intro7: ". Analysez le poids de chaque ministère et le",
    intro8: "pourcentage de serviteurs",
    intro9: "pour renforcer la",
    intro10: "dynamique du service",
    perioderapide: "Période rapide",
    tranchedates: "Tranche de dates",
    periode: "Période :",
    tout: "Tout",
    j30: "30 j",
    j90: "90 j",
    mois6: "6 mois",
    an1: "1 an",
    dateDebut: "Date de début",
    dateFin: "Date de fin",
    genererRapport: "Générer le rapport",
    vueEnsemble: "Vue d'ensemble",
    parMinistere: "Par ministère",
    serviteursActifs: "Serviteurs actifs",
    surLaPeriode: "sur la période",
    pctMembres: "% des membres",
    engagesAuService: "engagés au service",
    ministeresActifs: "Ministères actifs",
    representes: "représentés",
    premierMinistere: "1er ministère",
    serviteurs_count: "serviteurs",
    serviteurs: "Serviteurs",
    nonEngages: "Non engagés",
    totalMembres: "Total membres",
    sectionVueEnsemble: "Vue d'ensemble",
    sectionEngagement: "Engagement des membres",
    sectionRepartitionTop5: "Répartition par ministère (top 5)",
    sectionClassement: "Classement des ministères",
    autres: "Autres",
    pctMembresEngages: "% membres engagés",
    sur: "sur",
    membres: "membres",
    serviteurLabel: "serviteur",
    serviteursLabel: "serviteurs",
    totalServiteurs: "Total serviteurs",
    chargementUser: "⏳ Chargement des informations utilisateur...",
    selectionnezPeriode: "Sélectionnez une période pour générer le rapport.",
    aucunServiteur: "Aucun serviteur enregistré sur cette période.",
    chargement: "⏳ Chargement...",
  },
  en: {
    title: "Report",
    titleAccent: "Ministry",
    intro1: "Track at a glance the number of",
    intro2: "total servants",
    intro3: ", their",
    intro4: "distribution by ministry",
    intro5: "and the",
    intro6: "overall engagement level",
    intro7: ". Analyze each ministry's weight and the",
    intro8: "percentage of servants",
    intro9: "to strengthen the",
    intro10: "service dynamic",
    perioderapide: "Quick period",
    tranchedates: "Date range",
    periode: "Period:",
    tout: "All",
    j30: "30 d",
    j90: "90 d",
    mois6: "6 mo",
    an1: "1 yr",
    dateDebut: "Start date",
    dateFin: "End date",
    genererRapport: "Generate report",
    vueEnsemble: "Overview",
    parMinistere: "By ministry",
    serviteursActifs: "Active servants",
    surLaPeriode: "for the period",
    pctMembres: "% of members",
    engagesAuService: "engaged in service",
    ministeresActifs: "Active ministries",
    representes: "represented",
    premierMinistere: "Top ministry",
    serviteurs_count: "servants",
    serviteurs: "Servants",
    nonEngages: "Not engaged",
    totalMembres: "Total members",
    sectionVueEnsemble: "Overview",
    sectionEngagement: "Member engagement",
    sectionRepartitionTop5: "Distribution by ministry (top 5)",
    sectionClassement: "Ministry ranking",
    autres: "Others",
    pctMembresEngages: "% engaged members",
    sur: "out of",
    membres: "members",
    serviteurLabel: "servant",
    serviteursLabel: "servants",
    totalServiteurs: "Total servants",
    chargementUser: "⏳ Loading user information...",
    selectionnezPeriode: "Select a period to generate the report.",
    aucunServiteur: "No servants recorded for this period.",
    chargement: "⏳ Loading...",
  },
};

export default function RapportMinisterePage() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur", "ResponsableIntegration"]}>
      <RapportMinistere />
    </ProtectedRoute>
  );
}

// ─── HELPERS ──────────────────────────────────────────────────
function getMonthNameFR(monthIndex) {
  return ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"][monthIndex] || "";
}

// ─── UI ATOMS ──────────────────────────────────────────────────
function SectionTitle({ children }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-widest text-white/40 mb-3">
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
      <p className="text-xs text-white/50">{label}</p>
      <p className={`text-2xl font-bold leading-none ${c[accent] || "text-white"}`}>{value}</p>
      {sub && <p className="text-[11px] text-white/40 mt-0.5">{sub}</p>}
    </div>
  );
}

function Badge({ children, color }) {
  const m = {
    green: "bg-emerald-900/60 text-emerald-300",
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
  const col = color || "bg-amber-400";
  return (
    <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all ${col}`}
        style={{ width: `${Math.min(pct, 100)}%` }}
      />
    </div>
  );
}

// ─── COULEURS PAR MINISTÈRE ────────────────────────────────────
const MINISTERE_CONFIG = {
  Intercession:    { bar: "bg-purple-400",  badge: "purple", dot: "bg-purple-400" },
  Louange:         { bar: "bg-pink-400",    badge: "pink",   dot: "bg-pink-400" },
  Administration:  { bar: "bg-blue-400",    badge: "blue",   dot: "bg-blue-400" },
  Technique:       { bar: "bg-cyan-400",    badge: "blue",   dot: "bg-cyan-400" },
  Communication:   { bar: "bg-indigo-400",  badge: "purple", dot: "bg-indigo-400" },
  "Les Enfants":   { bar: "bg-yellow-400",  badge: "amber",  dot: "bg-yellow-400" },
  "Les ados":      { bar: "bg-orange-400",  badge: "orange", dot: "bg-orange-400" },
  "Les jeunes":    { bar: "bg-red-400",     badge: "orange", dot: "bg-red-400" },
  Finance:         { bar: "bg-green-400",   badge: "green",  dot: "bg-green-400" },
  Nettoyage:       { bar: "bg-slate-400",   badge: "gray",   dot: "bg-slate-400" },
  Conseiller:      { bar: "bg-emerald-400", badge: "green",  dot: "bg-emerald-400" },
  Compassion:      { bar: "bg-rose-400",    badge: "pink",   dot: "bg-rose-400" },
  Visite:          { bar: "bg-amber-400",   badge: "amber",  dot: "bg-amber-400" },
  Berger:          { bar: "bg-lime-400",    badge: "green",  dot: "bg-lime-400" },
  Modération:      { bar: "bg-sky-400",     badge: "blue",   dot: "bg-sky-400" },
};
const DEFAULT_CONFIG = { bar: "bg-white/60", badge: "gray", dot: "bg-white/60" };

function getConfig(ministere) {
  return MINISTERE_CONFIG[ministere] || DEFAULT_CONFIG;
}

// ─── BLOC KPI GLOBAUX ──────────────────────────────────────────
function BlocKpiGlobaux({ rapports, totalMembres, t }) {
  const totalServiteurs = rapports.serviteursCount;
  const totalMinisteres = rapports.lignes.length;
  const pct = totalMembres > 0 ? ((totalServiteurs / totalMembres) * 100).toFixed(1) : 0;
  const topMinistere = rapports.lignes.length > 0 ? rapports.lignes[0] : null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <KpiCard label={t.serviteursActifs} value={totalServiteurs} sub={t.surLaPeriode} accent="orange" />
      <KpiCard label={t.pctMembres} value={`${pct}%`} sub={t.engagesAuService} accent="amber" />
      <KpiCard label={t.ministeresActifs} value={totalMinisteres} sub={t.representes} accent="blue" />
      {topMinistere && (
        <KpiCard label={t.premierMinistere} value={topMinistere.ministere} sub={`${topMinistere.total} ${t.serviteurs_count}`} accent="green" />
      )}
    </div>
  );
}

// ─── BLOC ENGAGEMENT ──────────────────────────────────────────
function BlocEngagement({ rapports, totalMembres, t }) {
  const totalServiteurs = rapports.serviteursCount;
  const pct = totalMembres > 0 ? Math.round((totalServiteurs / totalMembres) * 100) : 0;
  const nonServiteurs = Math.max(0, totalMembres - totalServiteurs);

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-orange-900/40 rounded-xl px-3 py-3 text-center">
          <p className="text-xl font-bold text-orange-300">{totalServiteurs}</p>
          <p className="text-[11px] text-orange-400/70">{t.serviteurs}</p>
          <p className="text-[10px] text-orange-500/50">{pct}%</p>
        </div>
        <div className="bg-white/5 rounded-xl px-3 py-3 text-center">
          <p className="text-xl font-bold text-white/50">{nonServiteurs}</p>
          <p className="text-[11px] text-white/30">{t.nonEngages}</p>
          <p className="text-[10px] text-white/20">{100 - pct}%</p>
        </div>
        <div className="bg-white/10 rounded-xl px-3 py-3 text-center">
          <p className="text-xl font-bold text-white">{totalMembres}</p>
          <p className="text-[11px] text-white/50">{t.totalMembres}</p>
        </div>
      </div>
      {totalMembres > 0 && (
        <div className="flex h-2 rounded-full overflow-hidden gap-0.5">
          <div className="bg-orange-400 rounded-l-full transition-all" style={{ width: `${pct}%` }} />
          <div className="bg-white/10 rounded-r-full transition-all" style={{ width: `${100 - pct}%` }} />
        </div>
      )}
    </div>
  );
}

// ─── BLOC CLASSEMENT MINISTÈRES ────────────────────────────────
function BlocClassement({ rapports }) {
  const { lignes } = rapports;
  const maxTotal = Math.max(...lignes.map(l => l.total), 1);

  if (!lignes.length) return (
    <p className="text-white/30 text-sm text-center py-4">—</p>
  );

  return (
    <div className="flex flex-col gap-2">
      {lignes.map(({ ministere, total }, idx) => {
        const cfg = getConfig(ministere);
        return (
          <div key={ministere} className="bg-white/10 rounded-xl px-4 py-3 flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 w-40 flex-shrink-0">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
                <p className="text-sm text-white truncate">{ministere}</p>
              </div>
              <BarreProgression pct={(total / maxTotal) * 100} color={cfg.bar} />
              <p className="text-sm font-bold text-white w-8 text-right">{total}</p>
              <p className="text-[11px] text-white/30 w-8 text-right flex-shrink-0">
                #{idx + 1}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── BLOC RÉPARTITION VISUELLE ─────────────────────────────────
function BlocRepartition({ rapports, t }) {
  const { lignes } = rapports;
  const total = lignes.reduce((a, l) => a + l.total, 0);

  if (!lignes.length || total === 0) return (
    <p className="text-white/30 text-sm text-center py-4">—</p>
  );

  const top5 = lignes.slice(0, 5);
  const reste = lignes.slice(5).reduce((a, l) => a + l.total, 0);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
        {top5.map(({ ministere, total: t_ }) => {
          const cfg = getConfig(ministere);
          return (
            <div
              key={ministere}
              className={`${cfg.bar} rounded-sm transition-all`}
              style={{ width: `${(t_ / total) * 100}%` }}
              title={`${ministere}: ${t_}`}
            />
          );
        })}
        {reste > 0 && (
          <div className="bg-white/20 rounded-r-full" style={{ width: `${(reste / total) * 100}%` }} />
        )}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1.5">
        {top5.map(({ ministere, total: t_ }) => {
          const cfg = getConfig(ministere);
          const pct = Math.round((t_ / total) * 100);
          return (
            <div key={ministere} className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
              <span className="text-[11px] text-white/60">{ministere}</span>
              <span className="text-[11px] text-white/30">{pct}%</span>
            </div>
          );
        })}
        {reste > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-white/20" />
            <span className="text-[11px] text-white/60">{t.autres}</span>
            <span className="text-[11px] text-white/30">{Math.round((reste / total) * 100)}%</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── PAGE PRINCIPALE ───────────────────────────────────────────
function RapportMinistere() {
  const { lang } = useLang();
  const t = translations[lang];

  const [egliseId, setEgliseId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [totalMembres, setTotalMembres] = useState(0);
  const [rapports, setRapports] = useState({ lignes: [], serviteursCount: 0 });
  const [hasData, setHasData] = useState(false);
  const [message, setMessage] = useState("");

  const [filtrePeriode, setFiltrePeriode] = useState("tout");
  const [modePerso, setModePerso] = useState(false);
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [onglet, setOnglet] = useState("kpi");

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("profiles").select("eglise_id").eq("id", user.id).single();
      if (data) setEgliseId(data.eglise_id);
    };
    loadUser();
  }, []);

  const fetchRapport = async (overrideModePerso = null) => {
    if (!egliseId) return;
    setLoading(true);
    setMessage(t.chargement);

    const isPerso = overrideModePerso !== null ? overrideModePerso : modePerso;

    try {
      const { data: membresData } = await supabase
        .from("membres_complets")
        .select("id, etat_contact, star")
        .eq("eglise_id", egliseId);

      const totalMembresLocal = (membresData || []).filter(m =>
        ["existant", "nouveau"].includes(m.etat_contact?.toLowerCase())
      ).length;
      setTotalMembres(totalMembresLocal);

      let query = supabase
        .from("stats_ministere_besoin")
        .select("membre_id, valeur, type, date_action")
        .eq("eglise_id", egliseId)
        .eq("type", "ministere");

      if (isPerso) {
        if (dateDebut) query = query.gte("date_action", dateDebut);
        if (dateFin) query = query.lte("date_action", dateFin);
      } else if (filtrePeriode !== "tout") {
        const depuis = new Date();
        depuis.setDate(depuis.getDate() - Number(filtrePeriode));
        query = query.gte("date_action", depuis.toISOString().split("T")[0]);
      }

      const { data: statsData, error } = await query;
      if (error) throw error;

      const serviteursSet = new Set();
      const seen = new Set();
      const counts = {};

      const membresStarIds = new Set(
  (membresData || []).filter(m => m.star === true).map(m => m.id)
);

(statsData || []).forEach(s => {
  if (!s.membre_id || !s.valeur) return;
  if (!membresStarIds.has(s.membre_id)) return;

  serviteursSet.add(s.membre_id);

  // Déduplique par (membre_id + ministere) pour le classement
  const ministeres = s.valeur.split(",").map(m => m.trim()).filter(Boolean);
  ministeres.forEach(ministere => {
    const key = `${s.membre_id}__${ministere}`;
    if (seen.has(key)) return;
    seen.add(key);
    counts[ministere] = (counts[ministere] || 0) + 1;
  });
});

      const lignes = Object.entries(counts)
        .map(([ministere, total]) => ({ ministere, total }))
        .sort((a, b) => b.total - a.total);

      setRapports({ lignes, serviteursCount: serviteursSet.size });
      setHasData(true);
      setMessage("");
    } catch (err) {
      setMessage("❌ " + err.message);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (!modePerso && egliseId) fetchRapport(false);
  }, [egliseId, filtrePeriode, modePerso]);

  const onglets = [
    { key: "kpi", label: t.vueEnsemble },
    { key: "classement", label: t.parMinistere },
  ];

  const periodes = [
    { label: t.tout, val: "tout" },
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
            {t.title} <span className="text-emerald-300">{t.titleAccent}</span>
          </h1>
          <p className="italic text-base text-white/90 max-w-2xl mx-auto">
            {t.intro1}{" "}
            <span className="text-blue-300 font-semibold">{t.intro2}</span>
            {t.intro3}{" "}
            <span className="text-blue-300 font-semibold">{t.intro4}</span>{" "}
            {t.intro5}{" "}
            <span className="text-blue-300 font-semibold">{t.intro6}</span>
            {t.intro7}{" "}
            <span className="text-blue-300 font-semibold">{t.intro8}</span>{" "}
            {t.intro9}{" "}
            <span className="text-blue-300 font-semibold">{t.intro10}</span>.
          </p>
        </div>

        {/* ─── FILTRES ─── */}
        <div className="bg-white/10 rounded-2xl p-4 flex flex-col gap-3">
          <div className="flex gap-1 bg-white/10 rounded-xl p-1 w-fit">
            <button
              onClick={() => setModePerso(false)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${!modePerso ? "bg-white text-[#333699]" : "text-white/50 hover:text-white/80"}`}
            >
              {t.perioderapide}
            </button>
            <button
              onClick={() => setModePerso(true)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${modePerso ? "bg-white text-[#333699]" : "text-white/50 hover:text-white/80"}`}
            >
              {t.tranchedates}
            </button>
          </div>

          {!modePerso && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-white/50 flex-shrink-0">{t.periode}</span>
              {periodes.map(p => (
                <button
                  key={p.val}
                  onClick={() => setFiltrePeriode(p.val)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition ${filtrePeriode === p.val ? "bg-white text-[#333699]" : "bg-white/15 text-white/70 hover:bg-white/20"}`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          )}

          {modePerso && (
            <div className="flex flex-col gap-2">
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-white/50">{t.dateDebut}</label>
                  <input
                    type="date" value={dateDebut}
                    onChange={e => setDateDebut(e.target.value)}
                    className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-white/40"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-white/50">{t.dateFin}</label>
                  <input
                    type="date" value={dateFin}
                    onChange={e => setDateFin(e.target.value)}
                    className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-white/40"
                  />
                </div>
              </div>
              <button
                onClick={() => fetchRapport(true)}
                disabled={!egliseId || loading}
                className="w-full py-2 rounded-xl bg-amber-500/80 hover:bg-amber-500 text-white text-sm font-semibold transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
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
              key={o.key}
              onClick={() => setOnglet(o.key)}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition whitespace-nowrap ${onglet === o.key ? "bg-white text-[#333699]" : "text-white/50 hover:text-white/80"}`}
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
        ) : !hasData ? (
          <div className="bg-white/10 rounded-2xl p-8 text-center">
            <p className="text-white/40 text-sm">
              {!egliseId ? t.chargementUser : t.selectionnezPeriode}
            </p>
          </div>
        ) : rapports.lignes.length === 0 ? (
          <div className="bg-white/10 rounded-2xl p-8 text-center">
            <p className="text-white/40 text-sm">{t.aucunServiteur}</p>
          </div>
        ) : onglet === "kpi" ? (
          <div className="flex flex-col gap-7">
            <div>
              <SectionTitle>{t.sectionVueEnsemble}</SectionTitle>
              <BlocKpiGlobaux rapports={rapports} totalMembres={totalMembres} t={t} />
            </div>
            <div>
              <SectionTitle>{t.sectionEngagement}</SectionTitle>
              <div className="bg-white/10 rounded-2xl px-4 py-4">
                <BlocEngagement rapports={rapports} totalMembres={totalMembres} t={t} />
              </div>
            </div>
            <div>
              <SectionTitle>{t.sectionRepartitionTop5}</SectionTitle>
              <div className="bg-white/10 rounded-2xl px-4 py-4">
                <BlocRepartition rapports={rapports} t={t} />
              </div>
            </div>
            <div>
              <SectionTitle>{t.sectionClassement}</SectionTitle>
              <BlocClassement rapports={rapports} />
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <KpiCard label={t.serviteurs} value={rapports.serviteursCount} sub={t.surLaPeriode} accent="orange" />
              <KpiCard
                label={t.pctMembresEngages}
                value={totalMembres > 0 ? `${((rapports.serviteursCount / totalMembres) * 100).toFixed(1)}%` : "—"}
                sub={`${t.sur} ${totalMembres} ${t.membres}`}
                accent="amber"
              />
            </div>

            {rapports.lignes.map(({ ministere, total }, idx) => {
              const cfg = getConfig(ministere);
              const pct = rapports.serviteursCount > 0
                ? Math.round((total / rapports.serviteursCount) * 100)
                : 0;
              return (
                <div key={ministere} className="bg-white/10 rounded-2xl px-4 py-4 flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-[11px] text-white/30 w-5">#{idx + 1}</span>
                      <span className={`w-2.5 h-2.5 rounded-full ${cfg.dot}`} />
                    </div>
                    <p className="text-sm font-semibold text-white flex-1 truncate">{ministere}</p>
                    <p className="text-xl font-bold text-white">{total}</p>
                    <Badge color={cfg.badge}>{pct}%</Badge>
                  </div>
                  <div className="flex items-center gap-2 pl-9">
                    <BarreProgression
                      pct={(total / Math.max(...rapports.lignes.map(l => l.total), 1)) * 100}
                      color={cfg.bar}
                    />
                    <span className="text-[11px] text-white/30 w-20 text-right flex-shrink-0">
                      {total} {total > 1 ? t.serviteursLabel : t.serviteurLabel}
                    </span>
                  </div>
                </div>
              );
            })}

            <div className="bg-white/5 rounded-2xl px-4 py-3 flex items-center justify-between border border-white/10">
              <span className="text-sm text-white/50 font-semibold uppercase tracking-wide">{t.totalServiteurs}</span>
              <span className="text-xl font-bold text-orange-300">{rapports.serviteursCount}</span>
            </div>
          </div>
        )}

        {message && !loading && (
          <p className="text-center text-sm text-white/60">{message}</p>
        )}
      </div>

      <Footer />
    </div>
  );
}
