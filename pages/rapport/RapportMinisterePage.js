"use client";

import { useEffect, useState, useMemo } from "react";
import supabase from "../../lib/supabaseClient";
import HeaderPages from "../../components/HeaderPages";
import Footer from "../../components/Footer";
import ProtectedRoute from "../../components/ProtectedRoute";
import { useLang } from "../../hooks/useLang";
import { useFeature } from "../../components/FeaturesContext";

// ─── TRANSLATIONS ───────────────────────────────────────────────
const translations = {
  fr: {
    title: "Rapport", titleAccent: "Ministère",
    subtitle: "Vision vivante de vos serviteurs — fidélité, engagement, alertes",
    // onglets
    ongletVision: "Vision globale",
    ongletBerger: "Vue Berger",
    ongletMinisteres: "Ministères",
    // filtres
    perioderapide: "Période rapide", tranchedates: "Dates", periode: "Période :",
    tout: "Tout", j30: "30 j", j90: "90 j", mois6: "6 mois", an1: "1 an",
    dateDebut: "Début", dateFin: "Fin", genererRapport: "Générer",
    // KPIs
    serviteursActifs: "Serviteurs actifs",
    totalMembres: "Membres",
    hommes: "Hommes", femmes: "Femmes",
    engages: "Engagés", nonEngages: "Non engagés",
    ministeresActifs: "Ministères actifs",
    // fidélité
    fidelite: "Fidélité",
    stables: "Stables", irreguliers: "Irréguliers", inactifs: "Inactifs",
    stablesDesc: "≥3 activités / 30j",
    irreguliersDesc: "1–2 activités / 30j",
    inactifsDesc: "0 activité / 30j",
    // alertes
    alertes: "Alertes pastorales",
    alerteInactifs: (n) => `${n} serviteur${n > 1 ? "s" : ""} inactif${n > 1 ? "s" : ""} depuis 30j`,
    alerteSurcharge: (m) => `${m} en surcharge potentielle`,
    alerteSousDote: (m) => `${m} sous-doté (< 3 serviteurs)`,
    alertePolyvalent: (n) => `${n} serviteur${n > 1 ? "s" : ""} sur 5+ ministères`,
    // vue berger
    repartitionParEglise: "Répartition des leaders par église",
    totalRattachesEglise: "Rattachés directement à l'église",
    aSuivreAujourdhui: "À suivre aujourd'hui",
    inactifsRecents: "Inactifs récents",
    irreguliersSuivi: "Irréguliers à encourager",
    stableRecents: "Serviteurs stables",
    polyvalentsSurchages: "Polyvalents à risque",
    pasDeServiteur: "Aucun serviteur dans cette catégorie.",
    piliers: "Piliers",
    listePiliers: "Liste des piliers",
    pasDePilier: "Aucun pilier enregistré.",
    actionAppeler: "📞 Appeler",
    actionEncourager: "💬 Encourager",
    actionReassigner: "🔀 Réassigner",
    actionFormer: "📚 Former",
    dernierService: "Dernier service :",
    ministereCount: (n) => `${n} ministère${n > 1 ? "s" : ""}`,
    // ministères
    tousMinisteres: "Tous les ministères",
    top10polyvalents: "Top 10 — plus polyvalents",
    serviteurLabel: "ministère", serviteursLabel: "ministères",
    totalServiteurs: "Total serviteurs",
    autres: "Autres",
    sectionRepartitionTop5: "Répartition top 5",
    premierMinistere: "1er ministère",
    serviteurs_count: "serviteurs",
    sectionClassement: "Classement",
    // états
    chargementUser: "Chargement...",
    chargement: "Chargement...",
    aucunServiteur: "Aucun serviteur sur cette période.",
    pctMembres: "% membres",
    niveauFort: "Fort", niveauMoyen: "Moyen", niveauFaible: "Faible",
    engagementLabel: "Niveau d'engagement",
    // Leaders en développement
    ongletLeaders: "Leaders en développement",
    leadersEnDeveloppement: "Leaders en développement",
    totalLeaders: "Total leaders",
    parcoursStages: {
      potentiel:     { emoji: "🌱", label: "Potentiel identifié" },
      croissance:    { emoji: "🌿", label: "Leader en croissance" },
      developpement: { emoji: "🌳", label: "Leader en développement" },
      mature:        { emoji: "🌲", label: "Leader mature" },
    },
    aucuneEvaluation: "Sans évaluation",
    pasDeLeader: "Aucun leader dans cette catégorie.",
    rattacheEglise: "Rattaché directement à l'église",
    sansCellule: "Sans cellule",
    sansFamille: "Sans famille",
    repartitionParCellule: "Répartition des leaders par cellule",
    repartitionParFamille: "Répartition des leaders par famille",
  },
  en: {
    title: "Report", titleAccent: "Ministry",
    subtitle: "Living view of your servants — faithfulness, engagement, alerts",
    ongletVision: "Overview",
    ongletBerger: "Shepherd view",
    ongletMinisteres: "Ministries",
    perioderapide: "Quick", tranchedates: "Dates", periode: "Period:",
    tout: "All", j30: "30d", j90: "90d", mois6: "6mo", an1: "1yr",
    dateDebut: "Start", dateFin: "End", genererRapport: "Generate",
    serviteursActifs: "Active servants",
    totalMembres: "Members",
    hommes: "Men", femmes: "Women",
    engages: "Engaged", nonEngages: "Not engaged",
    ministeresActifs: "Active ministries",
    fidelite: "Faithfulness",
    stables: "Stable", irreguliers: "Irregular", inactifs: "Inactive",
    stablesDesc: "≥3 activities / 30d",
    irreguliersDesc: "1–2 activities / 30d",
    inactifsDesc: "0 activity / 30d",
    alertes: "Pastoral alerts",
    alerteInactifs: (n) => `${n} inactive servant${n > 1 ? "s" : ""} for 30d`,
    alerteSurcharge: (m) => `${m} potentially overloaded`,
    alerteSousDote: (m) => `${m} understaffed (< 3 servants)`,
    alertePolyvalent: (n) => `${n} servant${n > 1 ? "s" : ""} in 5+ ministries`,
    repartitionParEglise: "Leaders distribution by church",
    totalRattachesEglise: "Directly attached to the church",
    aSuivreAujourdhui: "To follow today",
    inactifsRecents: "Recent inactive servants",
    irreguliersSuivi: "Irregular servants to encourage",
    stableRecents: "Stable servants",
    polyvalentsSurchages: "Overloaded polyvalents",
    pasDeServiteur: "No servants in this category.",
    piliers: "Pillars",
    listePiliers: "Pillars list",
    pasDePilier: "No pillar registered.",
    actionAppeler: "📞 Call",
    actionEncourager: "💬 Encourage",
    actionReassigner: "🔀 Reassign",
    actionFormer: "📚 Train",
    dernierService: "Last service:",
    ministereCount: (n) => `${n} ministr${n > 1 ? "ies" : "y"}`,
    tousMinisteres: "All ministries",
    top10polyvalents: "Top 10 — most polyvalent",
    serviteurLabel: "ministry", serviteursLabel: "ministries",
    totalServiteurs: "Total servants",
    autres: "Others",
    sectionRepartitionTop5: "Top 5 distribution",
    premierMinistere: "Top ministry",
    serviteurs_count: "servants",
    sectionClassement: "Ranking",
    chargementUser: "Loading...",
    chargement: "Loading...",
    aucunServiteur: "No servants for this period.",
    pctMembres: "% members",
    niveauFort: "Strong", niveauMoyen: "Medium", niveauFaible: "Weak",
    engagementLabel: "Engagement level",
    ongletLeaders: "Development leaders",
    leadersEnDeveloppement: "Development leaders",
    totalLeaders: "Total leaders",
    parcoursStages: {
      potentiel:     { emoji: "🌱", label: "Potential identified" },
      croissance:    { emoji: "🌿", label: "Growing leader" },
      developpement: { emoji: "🌳", label: "Developing leader" },
      mature:        { emoji: "🌲", label: "Mature leader" },
    },
    aucuneEvaluation: "No evaluation",
    pasDeLeader: "No leader in this category.",
    rattacheEglise: "Directly attached to the church",
    sansCellule: "No cell group",
    sansFamille: "No family",
    repartitionParCellule: "Leaders distribution by cell group",
    repartitionParFamille: "Leaders distribution by family",
  },
};

// ─── COULEURS MINISTÈRES ─────────────────────────────────────────
const MINISTERE_CONFIG = {
  Intercession:   { bar: "bg-purple-400",  dot: "#a78bfa" },
  Louange:        { bar: "bg-pink-400",    dot: "#ec4899" },
  Administration: { bar: "bg-blue-400",    dot: "#60a5fa" },
  Technique:      { bar: "bg-cyan-400",    dot: "#22d3ee" },
  Communication:  { bar: "bg-indigo-400",  dot: "#818cf8" },
  "Les Enfants":  { bar: "bg-yellow-400",  dot: "#fbbf24" },
  "Les ados":     { bar: "bg-orange-400",  dot: "#fb923c" },
  "Les jeunes":   { bar: "bg-red-400",     dot: "#f87171" },
  Finance:        { bar: "bg-green-400",   dot: "#4ade80" },
  Nettoyage:      { bar: "bg-slate-400",   dot: "#94a3b8" },
  Conseiller:     { bar: "bg-emerald-400", dot: "#34d399" },
  Compassion:     { bar: "bg-rose-400",    dot: "#fb7185" },
  Visite:         { bar: "bg-amber-400",   dot: "#fbbf24" },
  Berger:         { bar: "bg-lime-400",    dot: "#a3e635" },
  Modération:     { bar: "bg-sky-400",     dot: "#38bdf8" },
};
const DEFAULT_CFG = { bar: "bg-white/40", dot: "#ffffff50" };
const getCfg = (m) => MINISTERE_CONFIG[m] || DEFAULT_CFG;

const AVATAR_COLORS = [
  { bg: "#dbeafe", color: "#1e40af" }, { bg: "#fce7f3", color: "#9d174d" },
  { bg: "#d1fae5", color: "#065f46" }, { bg: "#fef3c7", color: "#92400e" },
  { bg: "#ede9fe", color: "#5b21b6" }, { bg: "#fee2e2", color: "#991b1b" },
  { bg: "#e0f2fe", color: "#0c4a6e" }, { bg: "#fdf4ff", color: "#701a75" },
  { bg: "#f0fdf4", color: "#14532d" }, { bg: "#fff7ed", color: "#7c2d12" },
];

// ─── SOUS-COMPOSANTS ─────────────────────────────────────────────

function SectionTitle({ children, icon, total }) {
  return (
    <div className="flex items-center justify-between gap-2 mb-3">
      <div className="flex items-center gap-2">
        {icon && <span className="text-base">{icon}</span>}
        <p className="text-[11px] font-bold tracking-widest text-white/40 uppercase">{children}</p>
      </div>
      {total !== undefined && (
        <span className="text-sm font-bold text-white">{total}</span>
      )}
    </div>
  );
}

function KpiCard({ label, value, sub, colorClass, icon }) {
  const colors = {
    blue:   { bg: "bg-blue-100",    label: "text-blue-700",    value: "text-blue-900",    sub: "text-blue-500"    },
    teal:   { bg: "bg-emerald-100", label: "text-emerald-700", value: "text-emerald-900", sub: "text-emerald-500" },
    purple: { bg: "bg-purple-100",  label: "text-purple-700",  value: "text-purple-900",  sub: "text-purple-500"  },
    pink:   { bg: "bg-pink-100",    label: "text-pink-700",    value: "text-pink-900",    sub: "text-pink-500"    },
    amber:  { bg: "bg-amber-100",   label: "text-amber-700",   value: "text-amber-900",   sub: "text-amber-500"   },
    green:  { bg: "bg-green-100",   label: "text-green-700",   value: "text-green-900",   sub: "text-green-500"   },
    red:    { bg: "bg-red-100",     label: "text-red-700",     value: "text-red-900",     sub: "text-red-500"     },
    gray:   { bg: "bg-white/10",    label: "text-white/60",    value: "text-white",       sub: "text-white/40"    },
  };
  const c = colors[colorClass] || colors.gray;
  return (
    <div className={`${c.bg} rounded-2xl px-4 py-4 flex flex-col gap-1`}>
      {icon && <span className="text-lg mb-1">{icon}</span>}
      <p className={`text-xs ${c.label}`}>{label}</p>
      <p className={`text-2xl font-bold leading-none ${c.value}`}>{value}</p>
      {sub && <p className={`text-[11px] mt-0.5 ${c.sub}`}>{sub}</p>}
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

function AlerteBadge({ type, message }) {
  const styles = {
    danger:  "bg-red-500/20 border border-red-400/40 text-red-200",
    warning: "bg-amber-500/20 border border-amber-400/40 text-amber-200",
    info:    "bg-blue-500/20 border border-blue-400/40 text-blue-200",
  };
  const icons = { danger: "🚨", warning: "⚠️", info: "ℹ️" };
  return (
    <div className={`rounded-xl px-4 py-3 flex items-center gap-3 text-sm ${styles[type]}`}>
      <span className="flex-shrink-0 text-base">{icons[type]}</span>
      <span>{message}</span>
    </div>
  );
}

function NiveauBadge({ niveau }) {
  if (niveau === "fort")   return <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/20 text-green-300 border border-green-500/30">🟢 Fort</span>;
  if (niveau === "moyen")  return <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">🟡 Moyen</span>;
  return <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30">🔴 Faible</span>;
}

function ServiteurCard({ membre, sousTitre, actions, ministeres, derniereDate, idx }) {
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
        {ministeres && ministeres.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {ministeres.slice(0, 3).map(m => {
              const cfg = getCfg(m);
              return (
                <span key={m} className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/70"
                  style={{ borderLeft: `2px solid ${cfg.dot}` }}>
                  {m}
                </span>
              );
            })}
            {ministeres.length > 3 && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/40">+{ministeres.length - 3}</span>
            )}
          </div>
        )}
      </div>
      {derniereDate && (
        <div className="text-right flex-shrink-0">
          <p className="text-[10px] text-white/40">dernier</p>
          <p className="text-[11px] text-white/60">{derniereDate}</p>
        </div>
      )}
      {actions && (
        <div className="flex gap-1 flex-shrink-0">
          {actions.map(a => (
            <button key={a.label} onClick={a.onClick}
              className="text-[11px] px-2 py-1 rounded-lg bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-colors border border-white/10">
              {a.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── EXPORT ─────────────────────────────────────────────────────
export default function RapportMinisterePage() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur", "ResponsableIntegration"]}>
      <RapportMinistere />
    </ProtectedRoute>
  );
}

// ─── COMPOSANT PRINCIPAL ─────────────────────────────────────────
function RapportMinistere() {
  const { lang } = useLang();
  const t = translations[lang];

  const cellulesActive = useFeature("cellules");
  const famillesActive = useFeature("familles");

  const [cellules, setCellules] = useState([]);
  const [familles, setFamilles] = useState([]);

  const [egliseId, setEgliseId]     = useState(null);
  const [loading, setLoading]       = useState(false);
  const [hasData, setHasData]       = useState(false);
  const [message, setMessage]       = useState("");
  const [filtrePeriode, setFiltrePeriode] = useState("tout");
  const [modePerso, setModePerso]   = useState(false);
  const [dateDebut, setDateDebut]   = useState("");
  const [dateFin, setDateFin]       = useState("");
  const [onglet, setOnglet]         = useState("vision");
  const [openMinistere, setOpenMinistere] = useState(null);
  const [openPiliers, setOpenPiliers] = useState(false);
  const [openLeaderStage, setOpenLeaderStage] = useState(null);

  // Données brutes
  const [totalMembres, setTotalMembres] = useState(0);
  const [rapports, setRapports] = useState({
    lignes: [], serviteursCount: 0, hommes: 0, femmes: 0, polyvalents: [],
    serviteursData: [],
    piliers: [],
    leadersDeveloppement: [],
  });

  // ─── CHARGEMENT UTILISATEUR ──────────────────────────────────
  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("profiles").select("eglise_id").eq("id", user.id).single();
      if (data) setEgliseId(data.eglise_id);
    };
    loadUser();
  }, []);

  // ─── CHARGEMENT CELLULES / FAMILLES (selon features actives) ──
useEffect(() => {
  if (!egliseId) return;

  const loadCellulesFamilles = async () => {
    if (cellulesActive) {
      const { data } = await supabase
        .from("cellules")
        .select("id, cellule_full")
        .eq("eglise_id", egliseId);
      setCellules(data || []);
    }
    if (famillesActive) {
      const { data } = await supabase
        .from("familles")
        .select("id, famille_full")
        .eq("eglise_id", egliseId);
      setFamilles(data || []);
    }
  };

  loadCellulesFamilles();
}, [egliseId, cellulesActive, famillesActive]);
  
  // ─── FETCH RAPPORT ───────────────────────────────────────────
  const fetchRapport = async (overrideModePerso = null) => {
    if (!egliseId) return;
    setLoading(true);
    setMessage(t.chargement);
    const isPerso = overrideModePerso !== null ? overrideModePerso : modePerso;

    try {
      // Membres
      const { data: membresData } = await supabase
  .from("membres_complets")
  .select("id, etat_contact, star, pilier, sexe, prenom, nom, leader_developpement, cellule_id, famille_id")
  .eq("eglise_id", egliseId);
      
      const piliers = (membresData || []).filter(m => m.pilier === true);
      
      // ── Leaders en développement ──
      const leadersMembres = (membresData || []).filter(m => m.leader_developpement === true);
      let leadersDeveloppement = [];
      
      if (leadersMembres.length > 0) {
        const leaderIds = leadersMembres.map(m => m.id);
        const { data: evalsLeader } = await supabase
          .from("evaluations_leader")
          .select("membre_id, parcours_etape, date_action")
          .in("membre_id", leaderIds)
          .order("date_action", { ascending: false });
      
        const leadersParcoursMap = {};
        (evalsLeader || []).forEach(e => {
          if (!leadersParcoursMap[e.membre_id]) {
            leadersParcoursMap[e.membre_id] = {
              etape: e.parcours_etape || null,
              date: e.date_action,
            };
          }
        });
      
        leadersDeveloppement = leadersMembres.map(m => ({
          membre: m,
          etape: leadersParcoursMap[m.id]?.etape || null,
          derniereDate: leadersParcoursMap[m.id]?.date || null,
        }));
      }      

      const actifs = (membresData || []).filter(m =>
        ["existant", "nouveau"].includes(m.etat_contact?.toLowerCase())
      );
      setTotalMembres(actifs.length);

      const serviteurs = (membresData || []).filter(m => m.star === true);
      const membresStarIds = new Set(serviteurs.map(m => m.id));
      const membreMap = {};
      (membresData || []).forEach(m => { membreMap[m.id] = m; });

      const totalHommes = actifs.filter(m => m.sexe === "Homme").length;
      const totalFemmes = actifs.filter(m => m.sexe === "Femme").length;

      // Stats ministères (période choisie)
      let query = supabase
        .from("stats_ministere_besoin")
        .select("membre_id, valeur, type, date_action")
        .eq("eglise_id", egliseId)
        .eq("type", "ministere");

      if (isPerso) {
        if (dateDebut) query = query.gte("date_action", dateDebut);
        if (dateFin)   query = query.lte("date_action", dateFin);
      } else if (filtrePeriode !== "tout") {
        const depuis = new Date();
        depuis.setDate(depuis.getDate() - Number(filtrePeriode));
        query = query.gte("date_action", depuis.toISOString().split("T")[0]);
      }
      const { data: statsData, error } = await query;
      if (error) throw error;

      // Stats 30 derniers jours (pour fidélité — toujours fixe)
      const depuis30 = new Date();
      depuis30.setDate(depuis30.getDate() - 30);
      const { data: stats30 } = await supabase
        .from("stats_ministere_besoin")
        .select("membre_id, date_action")
        .eq("eglise_id", egliseId)
        .eq("type", "ministere")
        .gte("date_action", depuis30.toISOString().split("T")[0]);

      // Comptage activités 30j par membre
      const activites30 = {};
      const derniereDate30 = {};
      (stats30 || []).forEach(s => {
        if (!membresStarIds.has(s.membre_id)) return;
        activites30[s.membre_id] = (activites30[s.membre_id] || 0) + 1;
        const d = s.date_action;
        if (!derniereDate30[s.membre_id] || d > derniereDate30[s.membre_id]) {
          derniereDate30[s.membre_id] = d;
        }
      });

      // Agrégation ministères (période choisie)
      const seen = new Set();
      const counts = {};
      const ministereMembers = {};
      const membreMinistereSet = {};
      const membreDerniereDate = {};

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
          if (!membreMinistereSet[s.membre_id]) membreMinistereSet[s.membre_id] = new Set();
          membreMinistereSet[s.membre_id].add(ministere);
          const d = s.date_action;
          if (!membreDerniereDate[s.membre_id] || d > membreDerniereDate[s.membre_id]) {
            membreDerniereDate[s.membre_id] = d;
          }
        });
      });

      const lignes = Object.entries(counts)
        .map(([ministere, total]) => ({ ministere, total, membres: ministereMembers[ministere] || [] }))
        .sort((a, b) => b.total - a.total);

      // Polyvalents
      const polyvalents = Object.entries(membreMinistereSet)
        .map(([id, set]) => ({ membre: membreMap[id], count: set.size, ministeres: [...set] }))
        .filter(x => x.membre)
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // serviteursData enrichi
      const serviteursData = serviteurs.map(m => {
        const nb30 = activites30[m.id] || 0;
        const dernDate = membreDerniereDate[m.id] || derniereDate30[m.id] || null;
        const ministeresList = membreMinistereSet[m.id] ? [...membreMinistereSet[m.id]] : [];
        let fidelite = "inactif";
        if (nb30 >= 3) fidelite = "stable";
        else if (nb30 >= 1) fidelite = "irregulier";
        return { membre: m, nb30, dernDate, ministeres: ministeresList, fidelite };
      });

      setRapports({
        lignes,
        serviteursCount: serviteurs.length,
        hommes: totalHommes,
        femmes: totalFemmes,
        polyvalents,
        serviteursData,
        piliers,
        leadersDeveloppement,
      });
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

  // ─── CALCULS DÉRIVÉS ─────────────────────────────────────────
  const { stables, irreguliers, inactifs } = useMemo(() => {
    const s = rapports.serviteursData.filter(x => x.fidelite === "stable");
    const ir = rapports.serviteursData.filter(x => x.fidelite === "irregulier");
    const in_ = rapports.serviteursData.filter(x => x.fidelite === "inactif");
    return { stables: s, irreguliers: ir, inactifs: in_ };
  }, [rapports.serviteursData]);

  //─────────────────────────────────────────
  const leadersParStage = useMemo(() => {
  const stagesOrder = ["potentiel", "croissance", "developpement", "mature", "none"];
  const groups = {};
  stagesOrder.forEach(s => (groups[s] = []));
  rapports.leadersDeveloppement.forEach(l => {
    const key = l.etape && groups[l.etape] ? l.etape : "none";
    groups[key].push(l);
  });
  return groups;
}, [rapports.leadersDeveloppement]);

  const leadersParCellule = useMemo(() => {
  if (!cellulesActive) return [];
  const map = {};
  rapports.leadersDeveloppement.forEach((l) => {
    const cid = l.membre.cellule_id;
    if (!cid) return; // compté dans "Répartition par église"
    if (!map[cid]) map[cid] = 0;
    map[cid]++;
  });
  return Object.entries(map)
    .map(([id, count]) => ({
      id,
      nom: cellules.find((c) => c.id === id)?.cellule_full || "—",
      count,
    }))
    .sort((a, b) => b.count - a.count);
}, [rapports.leadersDeveloppement, cellules, cellulesActive]);

const leadersParFamille = useMemo(() => {
  if (!famillesActive) return [];
  const map = {};
  rapports.leadersDeveloppement.forEach((l) => {
    const fid = l.membre.famille_id;
    if (!fid) return; // compté dans "Répartition par église"
    if (!map[fid]) map[fid] = 0;
    map[fid]++;
  });
  return Object.entries(map)
    .map(([id, count]) => ({
      id,
      nom: familles.find((f) => f.id === id)?.famille_full || "—",
      count,
    }))
    .sort((a, b) => b.count - a.count);
}, [rapports.leadersDeveloppement, familles, famillesActive]);

  const leadersRattachesEglise = useMemo(() => {
  if (!cellulesActive && !famillesActive) return 0;
  return rapports.leadersDeveloppement.filter(
    (l) => !l.membre.cellule_id && !l.membre.famille_id
  ).length;
}, [rapports.leadersDeveloppement, cellulesActive, famillesActive]);

  const alertes = useMemo(() => {
    const a = [];
    if (inactifs.length > 0)
      a.push({ type: "danger", message: t.alerteInactifs(inactifs.length) });
    const sousDotes = rapports.lignes.filter(l => l.total < 3);
    sousDotes.slice(0, 2).forEach(l =>
      a.push({ type: "warning", message: t.alerteSousDote(l.ministere) })
    );
    const surcharges = rapports.polyvalents.filter(p => p.count >= 5);
    if (surcharges.length > 0)
      a.push({ type: "warning", message: t.alertePolyvalent(surcharges.length) });
    return a;
  }, [inactifs, rapports.lignes, rapports.polyvalents]);

  const periodes = [
    { label: t.tout, val: "tout" }, { label: t.j30, val: "30" },
    { label: t.j90, val: "90" }, { label: t.mois6, val: "180" }, { label: t.an1, val: "365" },
  ];

  const pctEngages = totalMembres > 0 ? Math.round((rapports.serviteursCount / totalMembres) * 100) : 0;
  const pctH = totalMembres > 0 ? Math.round((rapports.hommes / totalMembres) * 100) : 0;
  const pctF = totalMembres > 0 ? Math.round((rapports.femmes / totalMembres) * 100) : 0;
  const nonEngages = Math.max(0, totalMembres - rapports.serviteursCount);
  const topMinistere = rapports.lignes[0] || null;
  const top5 = rapports.lignes.slice(0, 5);
  const resteTotal = rapports.lignes.slice(5).reduce((a, l) => a + l.total, 0);
  const totalAll = rapports.lignes.reduce((a, l) => a + l.total, 0);
  const maxTotal = Math.max(...rapports.lignes.map(l => l.total), 1);

  const formatDate = (d) => {
    if (!d) return "—";
    const dt = new Date(d);
    return dt.toLocaleDateString(lang === "fr" ? "fr-FR" : "en-GB", { day: "numeric", month: "short" });
  };

  const getLeaderAttachment = (membre) => {
  if (cellulesActive && membre.cellule_id) {
    const c = cellules.find((c) => c.id === membre.cellule_id);
    return { emoji: "🏠", label: c?.cellule_full || "—" };
  }
  if (famillesActive && membre.famille_id) {
    const f = familles.find((f) => f.id === membre.famille_id);
    return { emoji: "👑", label: f?.famille_full || "—" };
  }
  if (cellulesActive || famillesActive) {
    return { emoji: "🛐", label: t.rattacheEglise };
  }
  return null; // aucune feature active → pas de ligne affichée
};

  const actionsBerger = (type) => {
    if (type === "inactif") return [{ label: t.actionAppeler }, { label: t.actionEncourager }];
    if (type === "irregulier") return [{ label: t.actionEncourager }];
    if (type === "polyvalent") return [{ label: t.actionReassigner }, { label: t.actionFormer }];
    return [];
  };

  // ─── RENDU ────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col items-center p-4 sm:p-6" style={{ background: "#333699" }}>
      <HeaderPages />

      <div className="w-full max-w-3xl flex flex-col gap-6">

        {/* En-tête */}
        <div className="text-center mt-4">
          <h1 className="text-2xl font-bold mb-2 text-white">
            {t.title} <span className="text-emerald-300">{t.titleAccent}</span>
          </h1>
          <p className="text-sm text-white/60 italic">{t.subtitle}</p>
        </div>        

        {/* Filtres */}
        <div className="bg-white/8 rounded-2xl p-4 flex flex-col gap-3 border border-white/10">
          <div className="flex gap-1 bg-white/10 rounded-xl p-1 w-fit">
            <button onClick={() => setModePerso(false)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${!modePerso ? "bg-white text-[#1e1b4b]" : "text-white/50 hover:text-white/80"}`}>
              {t.perioderapide}
            </button>
            <button onClick={() => setModePerso(true)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${modePerso ? "bg-white text-[#1e1b4b]" : "text-white/50 hover:text-white/80"}`}>
              {t.tranchedates}
            </button>
          </div>
          {!modePerso && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-white/60">{t.periode}</span>
              {periodes.map(p => (
                <button key={p.val} onClick={() => setFiltrePeriode(p.val)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition ${filtrePeriode === p.val ? "bg-emerald-500 text-white" : "bg-white/10 text-white/70 hover:bg-white/20"}`}>
                  {p.label}
                </button>
              ))}
            </div>
          )}
          {modePerso && (
            <div className="flex flex-col gap-2">
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-white/60">{t.dateDebut}</label>
                  <input type="date" value={dateDebut} onChange={e => setDateDebut(e.target.value)}
                    className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-400/60" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-white/60">{t.dateFin}</label>
                  <input type="date" value={dateFin} onChange={e => setDateFin(e.target.value)}
                    className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-400/60" />
                </div>
              </div>
              <button onClick={() => fetchRapport(true)} disabled={!egliseId || loading}
                className="w-full py-2 rounded-xl bg-emerald-500/80 hover:bg-emerald-500 text-white text-sm font-semibold transition active:scale-95 disabled:opacity-50">
                {t.genererRapport}
              </button>
            </div>
          )}
        </div>

        {/* Onglets */}
        <div className="flex gap-1 bg-white/8 rounded-xl p-1 border border-white/10">
          {[
            { key: "vision",     label: t.ongletVision},
            { key: "berger",     label: t.ongletBerger},
            { key: "ministeres", label: t.ongletMinisteres},
            { key: "leaders",    label: t.ongletLeaders},
          ].map(o => (
            <button key={o.key} onClick={() => setOnglet(o.key)}
              className={`flex-1 py-2 px-2 rounded-lg text-[10px] sm:text-sm font-semibold transition whitespace-nowrap flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1 ${onglet === o.key ? "bg-white text-[#1e1b4b]" : "text-white/70 hover:text-white"}`}>
              <span>{o.icon}</span><span className="leading-tight text-center">{o.label}</span>
            </button>
          ))}
        </div>

        {/* ─── ÉTATS ─── */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-white/20 border-t-emerald-400 rounded-full animate-spin" />
          </div>
        ) : !hasData ? (
          <div className="bg-white/8 rounded-2xl p-8 text-center border border-white/10">
            <p className="text-white/60 text-sm">{!egliseId ? t.chargementUser : "Sélectionnez une période pour générer le rapport."}</p>
          </div>
       ) : rapports.lignes.length === 0 && rapports.piliers.length === 0 && onglet !== "berger" && onglet !== "leaders" ? (
          <div className="bg-white/8 rounded-2xl p-8 text-center border border-white/10">
            <p className="text-white/60 text-sm">{t.aucunServiteur}</p>
          </div>
        ) : (

          /* ══════════════════════════════════════════
             ONGLET 1 — VISION GLOBALE
          ══════════════════════════════════════════ */
          onglet === "vision" ? (
            <div className="flex flex-col gap-7">

              {/* KPIs principaux */}
              <div>
                <SectionTitle icon="📈">Vue d'ensemble</SectionTitle>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <KpiCard colorClass="blue"   label={t.serviteursActifs} value={rapports.serviteursCount} sub={`${pctEngages}% ${t.pctMembres}`} />
                  <KpiCard colorClass="teal"   label={t.totalMembres}     value={totalMembres}             sub="existants + nouveaux" />
                  <KpiCard colorClass="purple" label={t.hommes}           value={rapports.hommes}          sub={`${pctH}%`} />
                  <KpiCard colorClass="pink"   label={t.femmes}           value={rapports.femmes}          sub={`${pctF}%`} />
                  <KpiCard colorClass="amber"  label={t.piliers}          value={rapports.piliers.length}
                    sub={totalMembres > 0 ? `${Math.round((rapports.piliers.length / totalMembres) * 100)}% ${t.pctMembres}` : ""}                  
                  />
                </div>
              </div>

              {/* Fidélité 30j */}
              <div>
                <SectionTitle icon="❤️">{t.fidelite} — 30 derniers jours</SectionTitle>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-green-500/15 border border-green-500/30 rounded-2xl px-4 py-4 flex flex-col gap-1">
                    <p className="text-xs text-green-400 font-semibold">{t.stables}</p>
                    <p className="text-2xl font-bold text-green-300">{stables.length}</p>
                    <p className="text-[10px] text-green-500/70">{t.stablesDesc}</p>
                  </div>
                  <div className="bg-amber-500/15 border border-amber-500/30 rounded-2xl px-4 py-4 flex flex-col gap-1">
                    <p className="text-xs text-amber-400 font-semibold">{t.irreguliers}</p>
                    <p className="text-2xl font-bold text-amber-300">{irreguliers.length}</p>
                    <p className="text-[10px] text-amber-500/70">{t.irreguliersDesc}</p>
                  </div>
                  <div className="bg-red-500/15 border border-red-500/30 rounded-2xl px-4 py-4 flex flex-col gap-1">
                    <p className="text-xs text-red-400 font-semibold">{t.inactifs}</p>
                    <p className="text-2xl font-bold text-red-300">{inactifs.length}</p>
                    <p className="text-[10px] text-red-500/70">{t.inactifsDesc}</p>
                  </div>
                </div>
                {/* Barre de fidélité */}
                {rapports.serviteursCount > 0 && (
                  <div className="mt-3 flex h-2.5 rounded-full overflow-hidden gap-0.5">
                    <div className="bg-green-500 rounded-l-full transition-all" style={{ width: `${(stables.length / rapports.serviteursCount) * 100}%` }} />
                    <div className="bg-amber-400 transition-all" style={{ width: `${(irreguliers.length / rapports.serviteursCount) * 100}%` }} />
                    <div className="bg-red-500/70 rounded-r-full transition-all" style={{ width: `${(inactifs.length / rapports.serviteursCount) * 100}%` }} />
                  </div>
                )}
              </div>

              {/* Engagement */}
              <div>
                <SectionTitle icon="🔥">Engagement</SectionTitle>
                <div className="bg-white/8 rounded-2xl px-4 py-4 border border-white/10">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                    <div className="bg-amber-100 rounded-xl px-3 py-3 text-center">
                      <p className="text-xl font-bold text-amber-900">{rapports.serviteursCount}</p>
                      <p className="text-[11px] text-amber-700 mt-1">{t.engages}</p>
                      <p className="text-[10px] text-amber-500">{pctEngages}%</p>
                    </div>
                    <div className="bg-white/10 rounded-xl px-3 py-3 text-center">
                      <p className="text-xl font-bold text-white">{nonEngages}</p>
                      <p className="text-[11px] text-white/70 mt-1">{t.nonEngages}</p>
                      <p className="text-[10px] text-white/40">{100 - pctEngages}%</p>
                    </div>
                    <div className="bg-green-100 rounded-xl px-3 py-3 text-center">
                      <p className="text-xl font-bold text-green-900">{rapports.lignes.length}</p>
                      <p className="text-[11px] text-green-700 mt-1">{t.ministeresActifs}</p>
                    </div>
                    {topMinistere && (
                      <div className="bg-orange-100 rounded-xl px-3 py-3 text-center">
                        <p className="text-sm font-bold text-orange-900 truncate">{topMinistere.ministere}</p>
                        <p className="text-[11px] text-orange-700 mt-1">{t.premierMinistere}</p>
                        <p className="text-[10px] text-orange-500">{topMinistere.total} {t.serviteurs_count}</p>
                      </div>
                    )}
                  </div>
                  {totalMembres > 0 && (
                    <div className="flex h-2 rounded-full overflow-hidden gap-0.5">
                      <div className="bg-amber-400 rounded-l-full transition-all" style={{ width: `${pctEngages}%` }} />
                      <div className="bg-white/10 rounded-r-full transition-all" style={{ width: `${100 - pctEngages}%` }} />
                    </div>
                  )}
                </div>
              </div>

              {/* Répartition top 5 */}
              {rapports.lignes.length > 0 && (
                <div>
                  <SectionTitle icon="🎨">{t.sectionRepartitionTop5}</SectionTitle>
                  <div className="bg-white/8 rounded-2xl px-4 py-4 border border-white/10">
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
                            <span className="text-[11px] text-white/80">{ministere}</span>
                            <span className="text-[11px] text-white/40">{pct}%</span>
                          </div>
                        );
                      })}
                      {resteTotal > 0 && (
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-white/20" />
                          <span className="text-[11px] text-white/80">{t.autres}</span>
                          <span className="text-[11px] text-white/40">{totalAll > 0 ? Math.round((resteTotal / totalAll) * 100) : 0}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Classement */}
              <div>
                <SectionTitle icon="📋">{t.sectionClassement}</SectionTitle>
                <div className="flex flex-col gap-2">
                  {rapports.lignes.map(({ ministere, total }, idx) => {
                    const cfg = getCfg(ministere);
                    return (
                      <div key={ministere} className="bg-white/8 rounded-xl px-4 py-3 flex items-center gap-3 border border-white/10">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: cfg.dot }} />
                        <p className="text-sm text-white truncate flex-1">{ministere}</p>
                        <BarreProgression pct={(total / maxTotal) * 100} color={cfg.bar} />
                        <p className="text-sm font-bold text-white w-8 text-right">{total}</p>
                        <p className="text-[11px] text-white/40 w-8 text-right">#{idx + 1}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

                 {/* ── Piliers ── */}
                <div>
                  <SectionTitle icon="🎖️">{t.listePiliers}</SectionTitle>
                  <div className="rounded-xl overflow-hidden border border-white/10 bg-white/8">
                    <div
                      onClick={() => setOpenPiliers(!openPiliers)}
                      className="px-4 py-3 flex items-center gap-3 cursor-pointer hover:bg-white/5 transition-colors"
                    >
                      <span className="text-sm font-semibold text-white flex-1">{t.piliers}</span>
                      <span className="text-xl font-bold text-white">{rapports.piliers.length}</span>
                      <svg
                        className={`w-4 h-4 text-white/50 transition-transform flex-shrink-0 ${openPiliers ? "rotate-180" : ""}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                    {openPiliers && (
                      <div className="px-4 pb-3 border-t border-white/10 pt-2">
                        {rapports.piliers.length === 0 ? (
                          <p className="text-sm text-white/40 italic px-1">{t.pasDePilier}</p>
                        ) : (
                          <div className="flex flex-col gap-2">
                            {rapports.piliers.map((m, idx) => (
                              <ServiteurCard key={m.id} idx={idx} membre={m} />
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

          /* ══════════════════════════════════════════
             ONGLET 2 — VUE BERGER
          ══════════════════════════════════════════ */
          ) : onglet === "berger" ? (
            <div className="flex flex-col gap-7">

              {/* Inactifs récents */}
              <div>
                <SectionTitle icon="🔴">
                  {t.inactifsRecents}{" "}
                  <span className="italic normal-case text-emerald-300 font-normal">
                    {lang === "fr"
                      ? "(Aucune présence enregistrée depuis plus de 2 mois)"
                      : "(No recorded attendance for more than 2 months)"}
                  </span>
                </SectionTitle>
                {inactifs.length === 0 ? (
                  <p className="text-sm text-white/40 italic px-1">{t.pasDeServiteur}</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {inactifs.map((s, idx) => (
                      <ServiteurCard
                        key={s.membre.id}
                        idx={idx}
                        membre={s.membre}
                        sousTitre={`0 activité / 30j`}
                        ministeres={s.ministeres}
                        derniereDate={formatDate(s.dernDate)}
                        actions={actionsBerger("inactif")}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Irréguliers */}
              <div>
                <SectionTitle icon="🟡">
                  {t.irreguliersSuivi}{" "}
                  <span className="italic normal-case text-emerald-300 font-normal">
                    {lang === "fr"
                      ? "(Présence occasionnelle ou inférieure à une fois par semaine)"
                      : "(Attends occasionally or less than once per week)"}
                  </span>
                </SectionTitle>
                {irreguliers.length === 0 ? (
                  <p className="text-sm text-white/40 italic px-1">{t.pasDeServiteur}</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {irreguliers.map((s, idx) => (
                      <ServiteurCard
                        key={s.membre.id}
                        idx={idx}
                        membre={s.membre}
                        sousTitre={`${s.nb30} activité${s.nb30 > 1 ? "s" : ""} / 30j`}
                        ministeres={s.ministeres}
                        derniereDate={formatDate(s.dernDate)}
                        actions={actionsBerger("irregulier")}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Polyvalents surchargés */}
              <div>
                <SectionTitle icon="⚡">{t.polyvalentsSurchages} (5+ ministères)</SectionTitle>
                {rapports.polyvalents.filter(p => p.count >= 5).length === 0 ? (
                  <p className="text-sm text-white/40 italic px-1">{t.pasDeServiteur}</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {rapports.polyvalents.filter(p => p.count >= 5).map(({ membre, count, ministeres }, idx) => (
                      <ServiteurCard
                        key={membre.id}
                        idx={idx}
                        membre={membre}
                        sousTitre={`${count} ministères actifs`}
                        ministeres={ministeres}
                        actions={actionsBerger("polyvalent")}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Stables — encouragement */}
              <div>
                <SectionTitle icon="🟢">
                  {t.stableRecents}{" "}
                  <span className="italic normal-case text-emerald-300 font-normal">
                    {lang === "fr"
                      ? "(Stable : au moins une présence par semaine)"
                      : "(Attends at least once per week)"}
                  </span>
                </SectionTitle>              
                {stables.length === 0 ? (
                  <p className="text-sm text-white/40 italic px-1">{t.pasDeServiteur}</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {stables.slice(0, 10).map((s, idx) => (
                      <ServiteurCard
                        key={s.membre.id}
                        idx={idx}
                        membre={s.membre}
                        sousTitre={`${s.nb30} activités / 30j — stable`}
                        ministeres={s.ministeres}
                        derniereDate={formatDate(s.dernDate)}
                      />
                    ))}
                    {stables.length > 10 && (
                      <p className="text-xs text-white/40 text-center pt-1">+{stables.length - 10} autres serviteurs stables</p>
                    )}
                  </div>
                )}
              </div>
            </div>

              /* ══════════════════════════════════════════
                 ONGLET 3 — LEADERS EN DÉVELOPPEMENT
              ══════════════════════════════════════════ */
              ) : onglet === "leaders" ? (
                <div className="flex flex-col gap-7">
              
                  {/* KPIs */}
                  <div>
                    <SectionTitle icon="🌱">{t.leadersEnDeveloppement}</SectionTitle>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                      <KpiCard
                        colorClass="green"
                        label={t.totalLeaders}
                        value={rapports.leadersDeveloppement.length}
                        sub={totalMembres > 0 ? `${Math.round((rapports.leadersDeveloppement.length / totalMembres) * 100)}% ${t.pctMembres}` : ""}
                      />
                      {["potentiel", "croissance", "developpement", "mature"].map((stage) => {
                        const colorMap = { potentiel: "teal", croissance: "green", developpement: "blue", mature: "purple" };
                        return (
                          <KpiCard
                            key={stage}
                            colorClass={colorMap[stage]}
                            label={t.parcoursStages[stage].label}
                            value={leadersParStage[stage].length}
                            icon={t.parcoursStages[stage].emoji}
                          />
                        );
                      })}
                    </div>
                  </div>
              
                  {/* Répartition par étape — accordéons cliquables */}
                  <div>
                    <SectionTitle icon="📋">{t.sectionClassement}</SectionTitle>
                    <div className="flex flex-col gap-2">
                      {["potentiel", "croissance", "developpement", "mature", "none"].map((stage) => {
                        const list = leadersParStage[stage];
                        if (stage === "none" && list.length === 0) return null;
              
                        const isOpen = openLeaderStage === stage;
                        const label = stage === "none" ? t.aucuneEvaluation : t.parcoursStages[stage].label;
const emoji = stage === "none" ? "❔" : t.parcoursStages[stage].emoji;
              
                        return (
                          <div key={stage} className="rounded-xl overflow-hidden border border-white/10 bg-white/8">
                            <div
                              onClick={() => setOpenLeaderStage(isOpen ? null : stage)}
                              className="px-4 py-3 flex items-center gap-3 cursor-pointer hover:bg-white/5 transition-colors"
                            >
                              <span className="text-base">{emoji}</span>
                              <span className="text-sm font-semibold text-white flex-1">{label}</span>
                              <span className="text-sm font-bold text-white">{list.length}</span>
                              <svg
                                className={`w-4 h-4 text-white/50 transition-transform flex-shrink-0 ${isOpen ? "rotate-180" : ""}`}
                                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                            {isOpen && (
                              <div className="px-4 pb-3 border-t border-white/10 pt-2">
                                {list.length === 0 ? (
                                  <p className="text-sm text-white/40 italic px-1">{t.pasDeLeader}</p>
                                ) : (
                                  <div className="flex flex-col gap-2">
                                    {list.map((l, idx) => {
                                      const attach = getLeaderAttachment(l.membre);
                                      return (
                                        <ServiteurCard
                                          key={l.membre.id}
                                          idx={idx}
                                          membre={l.membre}
                                          sousTitre={attach ? `${attach.emoji} ${attach.label}` : undefined}
                                        />
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
              
                  {/* Répartition par cellule */}
                  {{cellulesActive && leadersParCellule.length > 0 && (
  <div>
    <SectionTitle icon="🏠" total={leadersParCellule.reduce((a, x) => a + x.count, 0)}>
      {t.repartitionParCellule}
    </SectionTitle>
    <div className="flex flex-col gap-2">
      {leadersParCellule.map(({ id, nom, count }) => {
        const maxC = Math.max(...leadersParCellule.map((x) => x.count), 1);
        return (
          <div key={id} className="bg-white/8 rounded-xl px-4 py-3 flex items-center gap-3 border border-white/10">
            <span className="text-sm text-white truncate flex-1">{nom}</span>
            <BarreProgression pct={(count / maxC) * 100} color="bg-emerald-400" />
            <p className="text-sm font-bold text-white w-6 text-right">{count}</p>
          </div>
        );
      })}
    </div>
  </div>
)}
              
                  {/* Répartition par famille */}
                  {famillesActive && leadersParFamille.length > 0 && (
  <div>
    <SectionTitle icon="👑" total={leadersParFamille.reduce((a, x) => a + x.count, 0)}>
      {t.repartitionParFamille}
    </SectionTitle>
    <div className="flex flex-col gap-2">
                        {leadersParFamille.map(({ id, nom, count }) => {
                          const maxF = Math.max(...leadersParFamille.map((x) => x.count), 1);
                          return (
                            <div key={id} className="bg-white/8 rounded-xl px-4 py-3 flex items-center gap-3 border border-white/10">
                              <span className="text-sm text-white truncate flex-1">
                                {id === "none" ? "🛐" : "👑"} {nom}
                              </span>
                              <BarreProgression pct={(count / maxF) * 100} color="bg-purple-400" />
                              <p className="text-sm font-bold text-white w-6 text-right">{count}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}     
                {/* Répartition par église */}
                {/* Répartition par église */}
{(cellulesActive || famillesActive) && leadersRattachesEglise > 0 && (
  <div>
    <SectionTitle icon="🛐" total={leadersRattachesEglise}>
      {t.repartitionParEglise}
    </SectionTitle>
    <div className="bg-white/8 rounded-xl px-4 py-3 flex items-center border border-white/10">
      <span className="text-sm text-white flex-1">{t.totalRattachesEglise}</span>
    </div>
  </div>
)}
                </div>
                
          /* ══════════════════════════════════════════
             ONGLET 3 — MINISTÈRES
          ══════════════════════════════════════════ */
          ) : (
            <div className="flex flex-col gap-5">

              {/* Top 10 polyvalents */}
              <div>
                <SectionTitle icon="🏆">{t.top10polyvalents}</SectionTitle>
                <div className="flex flex-col gap-2">
                  {rapports.polyvalents.map(({ membre, count, ministeres }, idx) => {
                    const ac = AVATAR_COLORS[idx % AVATAR_COLORS.length];
                    const initiales = `${(membre.prenom || "")[0] || ""}${(membre.nom || "")[0] || ""}`.toUpperCase();
                    return (
                      <div key={membre.id} className="bg-white/8 rounded-xl px-4 py-3 flex items-center gap-3 border border-white/10">
                        <span className="text-[11px] text-white/40 w-5 flex-shrink-0">#{idx + 1}</span>
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0"
                          style={{ background: ac.bg, color: ac.color }}>
                          {initiales}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white truncate">{membre.prenom} {membre.nom}</p>
                          <div className="flex flex-wrap gap-1 mt-0.5">
                            {ministeres.slice(0, 4).map(m => {
                              const cfg = getCfg(m);
                              return (
                                <span key={m} className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10 text-white/60"
                                  style={{ borderLeft: `2px solid ${cfg.dot}` }}>
                                  {m}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                        <span className="text-xs text-white/70 flex-shrink-0">
                          {count} {count > 1 ? t.serviteursLabel : t.serviteurLabel}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Tous les ministères */}
              <div>
                <SectionTitle icon="⛪">{t.tousMinisteres}</SectionTitle>
                <div className="flex flex-col gap-2">
                  {rapports.lignes.map(({ ministere, total, membres }) => {
                    const cfg = getCfg(ministere);
                    const isOpen = openMinistere === ministere;
                    const pct = rapports.serviteursCount > 0 ? Math.round((total / rapports.serviteursCount) * 100) : 0;
                    const isSousDote = total < 3;
                    return (
                      <div key={ministere} className={`rounded-xl overflow-hidden border ${isSousDote ? "border-red-500/30 bg-red-500/5" : "border-white/10 bg-white/8"}`}>
                        <div onClick={() => setOpenMinistere(isOpen ? null : ministere)}
                          className="px-4 py-3 flex items-center gap-3 cursor-pointer hover:bg-white/5 transition-colors">
                          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: cfg.dot }} />
                          <span className="text-sm font-semibold text-white flex-1">{ministere}</span>
                          {isSousDote && <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30">⚠️ sous-doté</span>}
                          <span className="text-xl font-bold text-white">{total}</span>
                          <span className="text-[11px] text-white/40 w-8 text-right">{pct}%</span>
                          <svg className={`w-4 h-4 text-white/50 transition-transform flex-shrink-0 ${isOpen ? "rotate-180" : ""}`}
                            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                        {isOpen && (
                          <div className="px-4 pb-3 border-t border-white/10 pt-2">
                            <div className="flex flex-wrap gap-2">
                              {membres.map(m => {
                                const sd = rapports.serviteursData.find(x => x.membre.id === m.id);
                                return (
                                  <div key={m.id} className="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1">
                                    <span className="text-[12px] text-white">{m.prenom} {m.nom}</span>
                                    {sd && <NiveauBadge niveau={sd.fidelite === "stable" ? "fort" : sd.fidelite === "irregulier" ? "moyen" : "faible"} />}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 bg-white/8 rounded-2xl px-4 py-3 flex items-center justify-between border border-white/15">
                  <span className="text-sm text-white font-semibold uppercase tracking-wide">{t.totalServiteurs}</span>
                  <span className="text-xl font-bold text-emerald-300">{rapports.serviteursCount}</span>
                </div>
              </div>

            </div>
          )
        )}

        {message && !loading && (
          <p className="text-center text-sm text-white/60">{message}</p>
        )}
      </div>

      <Footer />
    </div>
  );
}
