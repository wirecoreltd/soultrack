"use client";

import { useEffect, useState } from "react";
import supabase from "../../lib/supabaseClient";
import HeaderPages from "../../components/HeaderPages";
import Footer from "../../components/Footer";
import ProtectedRoute from "../../components/ProtectedRoute";
import { useLang } from "../../hooks/useLang";

const translations = {
  fr: {
    title: "Rapport", titleAccent: "Ministère",
    intro1: "Suivez en un coup d'œil le nombre", intro2: "total de serviteurs",
    intro3: ", leur", intro4: "répartition par ministère", intro5: "et le",
    intro6: "niveau d'engagement global", intro7: ". Analysez le poids de chaque ministère et le",
    intro8: "pourcentage de serviteurs", intro9: "pour renforcer la", intro10: "dynamique du service",
    perioderapide: "Période rapide", tranchedates: "Tranche de dates", periode: "Période :",
    tout: "Tout", j30: "30 j", j90: "90 j", mois6: "6 mois", an1: "1 an",
    dateDebut: "Date de début", dateFin: "Date de fin", genererRapport: "Générer le rapport",
    vueEnsemble: "Vue d'ensemble", parMinistere: "Par ministère",
    sectionMinisteresActifs: "Ministères actifs",
    serviteursActifs: "Serviteurs actifs", totalMembres: "Total membres",
    hommes: "Hommes", femmes: "Femmes",
    sectionEngagement: "Engagement des membres",
    engages: "Engagés", nonEngages: "Non engagés",
    ministeresActifs: "Ministères actifs", representes: "représentés",
    premierMinistere: "1er ministère", serviteurs_count: "serviteurs",
    sectionRepartitionTop5: "Répartition par ministère (top 5)",
    sectionClassement: "Classement des ministères", autres: "Autres",
    top10polyvalents: "Top 10 — plus de ministères",
    tousMinisteres: "Tous les ministères",
    totalServiteurs: "Total serviteurs",
    serviteurLabel: "ministère", serviteursLabel: "ministères",
    chargementUser: "⏳ Chargement des informations utilisateur...",
    selectionnezPeriode: "Sélectionnez une période pour générer le rapport.",
    aucunServiteur: "Aucun serviteur enregistré sur cette période.",
    chargement: "⏳ Chargement...",
    pctMembres: "% des membres",
  },
  en: {
    title: "Report", titleAccent: "Ministry",
    intro1: "Track at a glance the number of", intro2: "total servants",
    intro3: ", their", intro4: "distribution by ministry", intro5: "and the",
    intro6: "overall engagement level", intro7: ". Analyze each ministry's weight and the",
    intro8: "percentage of servants", intro9: "to strengthen the", intro10: "service dynamic",
    perioderapide: "Quick period", tranchedates: "Date range", periode: "Period:",
    tout: "All", j30: "30 d", j90: "90 d", mois6: "6 mo", an1: "1 yr",
    dateDebut: "Start date", dateFin: "End date", genererRapport: "Generate report",
    vueEnsemble: "Overview", parMinistere: "By ministry",
    sectionMinisteresActifs: "Active ministries",
    serviteursActifs: "Active servants", totalMembres: "Total members",
    hommes: "Men", femmes: "Women",
    sectionEngagement: "Member engagement",
    engages: "Engaged", nonEngages: "Not engaged",
    ministeresActifs: "Active ministries", representes: "represented",
    premierMinistere: "Top ministry", serviteurs_count: "servants",
    sectionRepartitionTop5: "Distribution by ministry (top 5)",
    sectionClassement: "Ministry ranking", autres: "Others",
    top10polyvalents: "Top 10 — most ministries",
    tousMinisteres: "All ministries",
    totalServiteurs: "Total servants",
    serviteurLabel: "ministry", serviteursLabel: "ministries",
    chargementUser: "⏳ Loading user information...",
    selectionnezPeriode: "Select a period to generate the report.",
    aucunServiteur: "No servants recorded for this period.",
    chargement: "⏳ Loading...",
    pctMembres: "% of members",
  },
};

export default function RapportMinisterePage() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur", "ResponsableIntegration"]}>
      <RapportMinistere />
    </ProtectedRoute>
  );
}

function SectionTitle({ children }) {
  return (
    <p className="text-[11px] font-bold uppercase tracking-widest text-white/40 mb-3">
      {children}
    </p>
  );
}

function KpiCard({ label, value, sub }) {
  return (
    <div className="bg-white/10 rounded-2xl px-4 py-4 flex flex-col gap-1">
      <p className="text-xs text-white/50">{label}</p>
      <p className="text-2xl font-bold leading-none text-white">{value}</p>
      {sub && <p className="text-[11px] text-white/40 mt-0.5">{sub}</p>}
    </div>
  );
}

function BarreProgression({ pct, color }) {
  return (
    <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
      <div className={`h-full rounded-full transition-all ${color || "bg-amber-400"}`}
        style={{ width: `${Math.min(pct, 100)}%` }} />
    </div>
  );
}

const MINISTERE_CONFIG = {
  Intercession:   { bar: "bg-purple-400", dot: "#a78bfa" },
  Louange:        { bar: "bg-pink-400",   dot: "#ec4899" },
  Administration: { bar: "bg-blue-400",   dot: "#60a5fa" },
  Technique:      { bar: "bg-cyan-400",   dot: "#22d3ee" },
  Communication:  { bar: "bg-indigo-400", dot: "#818cf8" },
  "Les Enfants":  { bar: "bg-yellow-400", dot: "#fbbf24" },
  "Les ados":     { bar: "bg-orange-400", dot: "#fb923c" },
  "Les jeunes":   { bar: "bg-red-400",    dot: "#f87171" },
  Finance:        { bar: "bg-green-400",  dot: "#4ade80" },
  Nettoyage:      { bar: "bg-slate-400",  dot: "#94a3b8" },
  Conseiller:     { bar: "bg-emerald-400",dot: "#34d399" },
  Compassion:     { bar: "bg-rose-400",   dot: "#fb7185" },
  Visite:         { bar: "bg-amber-400",  dot: "#fbbf24" },
  Berger:         { bar: "bg-lime-400",   dot: "#a3e635" },
  Modération:     { bar: "bg-sky-400",    dot: "#38bdf8" },
};
const DEFAULT_CFG = { bar: "bg-white/50", dot: "#ffffff50" };
const getCfg = (m) => MINISTERE_CONFIG[m] || DEFAULT_CFG;

const AVATAR_COLORS = [
  { bg: "#dbeafe", color: "#1e40af" }, { bg: "#fce7f3", color: "#9d174d" },
  { bg: "#d1fae5", color: "#065f46" }, { bg: "#fef3c7", color: "#92400e" },
  { bg: "#ede9fe", color: "#5b21b6" }, { bg: "#fee2e2", color: "#991b1b" },
  { bg: "#e0f2fe", color: "#0c4a6e" }, { bg: "#fdf4ff", color: "#701a75" },
  { bg: "#f0fdf4", color: "#14532d" }, { bg: "#fff7ed", color: "#7c2d12" },
];

function RapportMinistere() {
  const { lang } = useLang();
  const t = translations[lang];

  const [egliseId, setEgliseId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [totalMembres, setTotalMembres] = useState(0);
  const [rapports, setRapports] = useState({ lignes: [], serviteursCount: 0, hommes: 0, femmes: 0, polyvalents: [] });
  const [hasData, setHasData] = useState(false);
  const [message, setMessage] = useState("");
  const [filtrePeriode, setFiltrePeriode] = useState("tout");
  const [modePerso, setModePerso] = useState(false);
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [onglet, setOnglet] = useState("kpi");
  const [openMinistere, setOpenMinistere] = useState(null);

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
        .select("id, etat_contact, star, sexe, prenom, nom")
        .eq("eglise_id", egliseId);

      const actifs = (membresData || []).filter(m =>
        ["existant", "nouveau"].includes(m.etat_contact?.toLowerCase())
      );
      setTotalMembres(actifs.length);

      const serviteurs = (membresData || []).filter(m => m.star === true);
      const serviteursCount = serviteurs.length;
      const hommes = serviteurs.filter(m => m.sexe === "Homme").length;
      const femmes = serviteurs.filter(m => m.sexe === "Femme").length;

      const membresStarIds = new Set(serviteurs.map(m => m.id));
      const membreMap = {};
      (membresData || []).forEach(m => { membreMap[m.id] = m; });

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

      const seen = new Set();
      const counts = {};
      const ministereMembers = {};
      const membreMinistereCount = {};

      (statsData || []).forEach(s => {
        if (!s.membre_id || !s.valeur) return;
        if (!membresStarIds.has(s.membre_id)) return;

        const ministeres = s.valeur.split(",").map(m => m.trim()).filter(Boolean);
        ministeres.forEach(ministere => {
          const key = `${s.membre_id}__${ministere}`;
          if (seen.has(key)) return;
          seen.add(key);
          counts[ministere] = (counts[ministere] || 0) + 1;
          if (!ministereMembers[ministere]) ministereMembers[ministere] = [];
          const membre = membreMap[s.membre_id];
          if (membre && !ministereMembers[ministere].find(x => x.id === s.membre_id)) {
            ministereMembers[ministere].push(membre);
          }
          membreMinistereCount[s.membre_id] = (membreMinistereCount[s.membre_id] || 0) + 1;
        });
      });

      const lignes = Object.entries(counts)
        .map(([ministere, total]) => ({ ministere, total, membres: ministereMembers[ministere] || [] }))
        .sort((a, b) => b.total - a.total);

      const polyvalents = Object.entries(membreMinistereCount)
        .map(([id, count]) => ({ membre: membreMap[id], count }))
        .filter(x => x.membre)
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      setRapports({ lignes, serviteursCount, hommes, femmes, polyvalents });
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

  const periodes = [
    { label: t.tout, val: "tout" }, { label: t.j30, val: "30" },
    { label: t.j90, val: "90" }, { label: t.mois6, val: "180" }, { label: t.an1, val: "365" },
  ];

  const pctEngages = totalMembres > 0 ? Math.round((rapports.serviteursCount / totalMembres) * 100) : 0;
  const pctH = rapports.serviteursCount > 0 ? Math.round((rapports.hommes / rapports.serviteursCount) * 100) : 0;
  const pctF = rapports.serviteursCount > 0 ? Math.round((rapports.femmes / rapports.serviteursCount) * 100) : 0;
  const nonEngages = Math.max(0, totalMembres - rapports.serviteursCount);
  const topMinistere = rapports.lignes[0] || null;
  const top5 = rapports.lignes.slice(0, 5);
  const resteTotal = rapports.lignes.slice(5).reduce((a, l) => a + l.total, 0);
  const totalAll = rapports.lignes.reduce((a, l) => a + l.total, 0);
  const maxTotal = Math.max(...rapports.lignes.map(l => l.total), 1);

  const getInitials = (m) => `${(m.prenom || "")[0] || ""}${(m.nom || "")[0] || ""}`.toUpperCase();

  return (
    <div className="min-h-screen flex flex-col items-center p-4 sm:p-6" style={{ background: "#333699" }}>
      <HeaderPages />

      <div className="w-full max-w-3xl flex flex-col gap-6">
        <div className="text-center mt-4">
          <h1 className="text-2xl font-bold mb-3 text-white">
            {t.title} <span className="text-emerald-300">{t.titleAccent}</span>
          </h1>
          <p className="italic text-base text-white/90 max-w-2xl mx-auto">
            {t.intro1} <span className="text-blue-300 font-semibold">{t.intro2}</span>
            {t.intro3} <span className="text-blue-300 font-semibold">{t.intro4}</span> {t.intro5}{" "}
            <span className="text-blue-300 font-semibold">{t.intro6}</span>
            {t.intro7} <span className="text-blue-300 font-semibold">{t.intro8}</span> {t.intro9}{" "}
            <span className="text-blue-300 font-semibold">{t.intro10}</span>.
          </p>
        </div>

        {/* Filtres */}
        <div className="bg-white/10 rounded-2xl p-4 flex flex-col gap-3">
          <div className="flex gap-1 bg-white/10 rounded-xl p-1 w-fit">
            <button onClick={() => setModePerso(false)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${!modePerso ? "bg-white text-[#333699]" : "text-white/50 hover:text-white/80"}`}>
              {t.perioderapide}
            </button>
            <button onClick={() => setModePerso(true)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${modePerso ? "bg-white text-[#333699]" : "text-white/50 hover:text-white/80"}`}>
              {t.tranchedates}
            </button>
          </div>
          {!modePerso && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-white/50 flex-shrink-0">{t.periode}</span>
              {periodes.map(p => (
                <button key={p.val} onClick={() => setFiltrePeriode(p.val)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition ${filtrePeriode === p.val ? "bg-white text-[#333699]" : "bg-white/15 text-white/70 hover:bg-white/20"}`}>
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
                  <input type="date" value={dateDebut} onChange={e => setDateDebut(e.target.value)}
                    className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-white/40" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-white/50">{t.dateFin}</label>
                  <input type="date" value={dateFin} onChange={e => setDateFin(e.target.value)}
                    className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-white/40" />
                </div>
              </div>
              <button onClick={() => fetchRapport(true)} disabled={!egliseId || loading}
                className="w-full py-2 rounded-xl bg-amber-500/80 hover:bg-amber-500 text-white text-sm font-semibold transition active:scale-95 disabled:opacity-50">
                {t.genererRapport}
              </button>
            </div>
          )}
        </div>

        {/* Onglets */}
        <div className="flex gap-1 bg-white/10 rounded-xl p-1">
          {[{ key: "kpi", label: t.vueEnsemble }, { key: "classement", label: t.parMinistere }].map(o => (
            <button key={o.key} onClick={() => setOnglet(o.key)}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition whitespace-nowrap ${onglet === o.key ? "bg-white text-[#333699]" : "text-white/50 hover:text-white/80"}`}>
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
          <div className="bg-white/10 rounded-2xl p-8 text-center">
            <p className="text-white/40 text-sm">{!egliseId ? t.chargementUser : t.selectionnezPeriode}</p>
          </div>
        ) : rapports.lignes.length === 0 ? (
          <div className="bg-white/10 rounded-2xl p-8 text-center">
            <p className="text-white/40 text-sm">{t.aucunServiteur}</p>
          </div>
        ) : onglet === "kpi" ? (
          <div className="flex flex-col gap-7">

            {/* Section 1 — Ministères actifs */}
            <div>
              <SectionTitle>{t.sectionMinisteresActifs}</SectionTitle>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <KpiCard label={t.serviteursActifs} value={rapports.serviteursCount} sub={`${pctEngages}% ${t.pctMembres}`} />
                <KpiCard label={t.totalMembres} value={totalMembres} sub="existants + nouveaux" />
                <KpiCard label={t.hommes} value={rapports.hommes} sub={`${pctH}%`} />
                <KpiCard label={t.femmes} value={rapports.femmes} sub={`${pctF}%`} />
              </div>
            </div>

            {/* Section 2 — Engagement */}
            <div>
              <SectionTitle>{t.sectionEngagement}</SectionTitle>
              <div className="bg-white/10 rounded-2xl px-4 py-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  <div className="bg-orange-900/40 rounded-xl px-3 py-3 text-center">
                    <p className="text-xl font-bold text-orange-300">{rapports.serviteursCount}</p>
                    <p className="text-[11px] text-orange-400/70 mt-1">{t.engages}</p>
                    <p className="text-[10px] text-orange-500/50">{pctEngages}%</p>
                  </div>
                  <div className="bg-white/5 rounded-xl px-3 py-3 text-center">
                    <p className="text-xl font-bold text-white/50">{nonEngages}</p>
                    <p className="text-[11px] text-white/30 mt-1">{t.nonEngages}</p>
                    <p className="text-[10px] text-white/20">{100 - pctEngages}%</p>
                  </div>
                  <div className="bg-white/10 rounded-xl px-3 py-3 text-center">
                    <p className="text-xl font-bold text-white">{rapports.lignes.length}</p>
                    <p className="text-[11px] text-white/50 mt-1">{t.ministeresActifs}</p>
                    <p className="text-[10px] text-white/30">{t.representes}</p>
                  </div>
                  {topMinistere && (
                    <div className="bg-white/10 rounded-xl px-3 py-3 text-center">
                      <p className="text-sm font-bold text-emerald-300 truncate">{topMinistere.ministere}</p>
                      <p className="text-[11px] text-white/50 mt-1">{t.premierMinistere}</p>
                      <p className="text-[10px] text-white/30">{topMinistere.total} {t.serviteurs_count}</p>
                    </div>
                  )}
                </div>
                {totalMembres > 0 && (
                  <div className="flex h-2 rounded-full overflow-hidden gap-0.5">
                    <div className="bg-orange-400 rounded-l-full transition-all" style={{ width: `${pctEngages}%` }} />
                    <div className="bg-white/10 rounded-r-full transition-all" style={{ width: `${100 - pctEngages}%` }} />
                  </div>
                )}
              </div>
            </div>

            {/* Section 3 — Répartition top 5 */}
            <div>
              <SectionTitle>{t.sectionRepartitionTop5}</SectionTitle>
              <div className="bg-white/10 rounded-2xl px-4 py-4">
                {totalAll > 0 && (
                  <div className="flex h-3 rounded-full overflow-hidden gap-0.5 mb-3">
                    {top5.map(({ ministere, total }) => {
                      const cfg = getCfg(ministere);
                      return (
                        <div key={ministere} className={`${cfg.bar} rounded-sm transition-all`}
                          style={{ width: `${(total / totalAll) * 100}%` }} title={`${ministere}: ${total}`} />
                      );
                    })}
                    {resteTotal > 0 && (
                      <div className="bg-white/20 rounded-r-full" style={{ width: `${(resteTotal / totalAll) * 100}%` }} />
                    )}
                  </div>
                )}
                <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                  {top5.map(({ ministere, total }) => {
                    const cfg = getCfg(ministere);
                    const pct = totalAll > 0 ? Math.round((total / totalAll) * 100) : 0;
                    return (
                      <div key={ministere} className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: cfg.dot }} />
                        <span className="text-[11px] text-white/60">{ministere}</span>
                        <span className="text-[11px] text-white/30">{pct}%</span>
                      </div>
                    );
                  })}
                  {resteTotal > 0 && (
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-white/20" />
                      <span className="text-[11px] text-white/60">{t.autres}</span>
                      <span className="text-[11px] text-white/30">{totalAll > 0 ? Math.round((resteTotal / totalAll) * 100) : 0}%</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Section 4 — Classement */}
            <div>
              <SectionTitle>{t.sectionClassement}</SectionTitle>
              <div className="flex flex-col gap-2">
                {rapports.lignes.map(({ ministere, total }, idx) => {
                  const cfg = getCfg(ministere);
                  return (
                    <div key={ministere} className="bg-white/10 rounded-xl px-4 py-3 flex items-center gap-3">
                      <div className="flex items-center gap-2 w-40 flex-shrink-0">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: cfg.dot }} />
                        <p className="text-sm text-white truncate">{ministere}</p>
                      </div>
                      <BarreProgression pct={(total / maxTotal) * 100} color={cfg.bar} />
                      <p className="text-sm font-bold text-white w-8 text-right">{total}</p>
                      <p className="text-[11px] text-white/30 w-8 text-right flex-shrink-0">#{idx + 1}</p>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        ) : (
          /* ─── ONGLET PAR MINISTÈRE ─── */
          <div className="flex flex-col gap-5">

            {/* Top 10 polyvalents */}
            <div>
              <SectionTitle>{t.top10polyvalents}</SectionTitle>
              <div className="flex flex-col gap-2">
                {rapports.polyvalents.map(({ membre, count }, idx) => {
                  const ac = AVATAR_COLORS[idx % AVATAR_COLORS.length];
                  return (
                    <div key={membre.id} className="bg-white/10 rounded-xl px-4 py-3 flex items-center gap-3">
                      <span className="text-[11px] text-white/30 w-5 flex-shrink-0">#{idx + 1}</span>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0"
                        style={{ background: ac.bg, color: ac.color }}>
                        {getInitials(membre)}
                      </div>
                      <span className="text-sm text-white flex-1 truncate">{membre.prenom} {membre.nom}</span>
                      <span className="text-xs text-white/50 flex-shrink-0">
                        {count} {count > 1 ? t.serviteursLabel : t.serviteurLabel}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Tous les ministères cliquables */}
            <div>
              <SectionTitle>{t.tousMinisteres}</SectionTitle>
              <div className="flex flex-col gap-2">
                {rapports.lignes.map(({ ministere, total, membres }) => {
                  const cfg = getCfg(ministere);
                  const isOpen = openMinistere === ministere;
                  const pct = rapports.serviteursCount > 0 ? Math.round((total / rapports.serviteursCount) * 100) : 0;
                  return (
                    <div key={ministere} className="bg-white/10 rounded-xl overflow-hidden">
                      <div onClick={() => setOpenMinistere(isOpen ? null : ministere)}
                        className="px-4 py-3 flex items-center gap-3 cursor-pointer hover:bg-white/5 transition-colors">
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: cfg.dot }} />
                        <span className="text-sm font-semibold text-white flex-1">{ministere}</span>
                        <span className="text-xl font-bold text-white">{total}</span>
                        <span className="text-[11px] text-white/40 w-8 text-right">{pct}%</span>
                        <svg className={`w-4 h-4 text-white/40 transition-transform flex-shrink-0 ${isOpen ? "rotate-180" : ""}`}
                          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                      {isOpen && (
                        <div className="px-4 pb-3">
                          <div className="flex flex-wrap gap-2 pt-1">
                            {membres.map(m => (
                              <span key={m.id}
                                className="text-[12px] px-3 py-1 rounded-full bg-white/10 text-white/80 border border-white/10">
                                {m.prenom} {m.nom}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 bg-white/5 rounded-2xl px-4 py-3 flex items-center justify-between border border-white/10">
                <span className="text-sm text-white/50 font-semibold uppercase tracking-wide">{t.totalServiteurs}</span>
                <span className="text-xl font-bold text-orange-300">{rapports.serviteursCount}</span>
              </div>
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
