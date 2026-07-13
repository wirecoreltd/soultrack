"use client";

import { useEffect, useState } from "react";
import supabase from "../../lib/supabaseClient";
import HeaderPages from "../../components/HeaderPages";
import Footer from "../../components/Footer";
import ProtectedRoute from "../../components/ProtectedRoute";
import { useLang } from "../../hooks/useLang";
import { useFeature } from "../../components/FeaturesContext";

const translations = {
  fr: {
    // Page
    pageTitle: "Le Développement des",
    pageTitleHighlight: "Leaders",
    subtitle1: "Outil de vision et de suivi spirituel.",
    subtitle2: "Chaque leader est",
    subtitle3: "identifié, accompagné et évalué",
    subtitle4: ", qu'il soit rattaché à une",
    subtitle5: "cellule",
    subtitle6: ", une",
    subtitle7: "famille",
    subtitle8: ", ou directement à",
    subtitle9: "l'église",
    subtitle10: ".",
    // Onglets
    tabOverview: "Vue d'ensemble",
    tabClassement: "Par étape",
    tabCellules: "Par cellule",
    tabFamilles: "Par famille",
    // Loading / empty
    loading: "Chargement...",
    emptyData: "Aucun leader en développement pour le moment",
    // KPI
    totalLeaders: "Total leaders",
    ofMembers: (pct) => `${pct}% des membres`,
    parcoursStages: {
      potentiel: { emoji: "🌱", label: "Potentiel identifié" },
      croissance: { emoji: "🌿", label: "Serviteur fidèle" },
      developpement: { emoji: "🌳", label: "Leader en croissance" },
      mature: { emoji: "🌲", label: "Leader confirmé" },
    },
    aucuneEvaluation: "Sans évaluation",
    pasDeLeader: "Aucun leader",
    // Rattachement
    repartitionRattachement: "Répartition par rattachement",
    rattacheCellule: "🏠 En cellule",
    rattacheFamille: "👑 En famille",
    rattacheEglise: "🛐 Rattaché à l'église",
    rattachementLabelEglise: "Rattaché directement à l'église",
    sansCellule: "Sans cellule",
    sansFamille: "Sans famille",
    // Répartition par cellule / famille
    repartitionParCellule: "🏠 Répartition par cellule",
    repartitionParFamille: "👑 Répartition par famille",
    noData: "Aucune donnée",
    ongletLeaders: "Classement par étape",
    leadersEnDeveloppement: "🏆 Leaders en développement",
  },
  en: {
    pageTitle: "The Development of",
    pageTitleHighlight: "Leaders",
    subtitle1: "Spiritual vision and follow-up tool.",
    subtitle2: "Every leader is",
    subtitle3: "identified, supported and evaluated",
    subtitle4: ", whether attached to a",
    subtitle5: "cell group",
    subtitle6: ", a",
    subtitle7: "family",
    subtitle8: ", or directly to the",
    subtitle9: "church",
    subtitle10: ".",
    tabOverview: "Overview",
    tabClassement: "By stage",
    tabCellules: "By cell",
    tabFamilles: "By family",
    loading: "Loading...",
    emptyData: "No leaders in development yet",
    totalLeaders: "Total leaders",
    ofMembers: (pct) => `${pct}% of members`,
    parcoursStages: {
      potentiel: { emoji: "🌱", label: "Potential identified" },
      croissance: { emoji: "🌿", label: "Faithful Servant" },
      developpement: { emoji: "🌳", label: "Growing leader" },
      mature: { emoji: "🌲", label: "Established Leader" },
    },
    aucuneEvaluation: "No evaluation",
    pasDeLeader: "No leaders",
    repartitionRattachement: "Breakdown by attachment",
    rattacheCellule: "In cell group",
    rattacheFamille: "In family",
    rattacheEglise: "Attached to church",
    rattachementLabelEglise: "Directly attached to the church",
    sansCellule: "No cell group",
    sansFamille: "No family",
    repartitionParCellule: "🏠 By cell group",
    repartitionParFamille: "👑 By family",
    noData: "No data",
    ongletLeaders: "Ranking by stage",
    leadersEnDeveloppement: "🏆 Leaders in development",
  },
};

export default function EtatLeadersPage() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur"]}>
      <EtatLeaders />
    </ProtectedRoute>
  );
}

// ─── UI ATOMS (identiques à EtatCellule) ───────────────────────
function SectionTitle({ children, icon, total, className = "" }) {
  return (
    <div className={`flex items-center justify-between mb-3 ${className}`}>
      <p className="text-sm font-semibold tracking-widest text-white flex items-center gap-1.5">
        {icon && <span className="text-sm">{icon}</span>}
        {children}
      </p>
      {total !== undefined && (
        <span className="text-sm font-bold text-white">{total}</span>
      )}
    </div>
  );
}

function BarreProgression({ pct, color, className = "flex-1" }) {
  const col = color || (pct >= 70 ? "bg-emerald-400" : pct >= 40 ? "bg-amber-400" : "bg-red-400");
  return (
    <div className={`h-1.5 bg-white/10 rounded-full overflow-hidden min-w-0 ${className}`}>
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
      className="rounded-2xl px-2.5 sm:px-3 py-2.5 flex flex-col justify-between overflow-hidden min-w-0"
      style={{ background: c.bg, height: "82px", boxSizing: "border-box" }}
    >
      <div className="flex items-start gap-1 min-w-0">
        <span className="text-sm leading-tight flex-shrink-0">{emoji}</span>
        <span className="text-xs sm:text-sm font-medium leading-tight line-clamp-2" style={{ color: c.text }}>
          {label}
        </span>
      </div>
      <span className="text-lg sm:text-xl font-bold leading-none text-center" style={{ color: c.text }}>
        {value}
      </span>
    </div>
  );
}

function TotalLeadersCard({ label, value, sub }) {
  return (
    <div
      className="bg-white/10 rounded-2xl px-2.5 sm:px-3 py-2.5 flex flex-col justify-between items-center overflow-hidden min-w-0"
      style={{ height: "82px", boxSizing: "border-box" }}
    >
      <span className="text-xs sm:text-sm text-white truncate w-full text-center">{label}</span>
      <div className="flex flex-col items-center leading-tight">
        <span className="text-lg sm:text-xl font-bold text-white">{value}</span>
        {sub && <span className="text-[11px] sm:text-xs text-white/80 whitespace-nowrap">{sub}</span>}
      </div>
    </div>
  );
}

const AVATAR_COLORS = [
  { bg: "#dbeafe", color: "#1e40af" }, { bg: "#fce7f3", color: "#9d174d" },
  { bg: "#d1fae5", color: "#065f46" }, { bg: "#fef3c7", color: "#92400e" },
  { bg: "#ede9fe", color: "#5b21b6" }, { bg: "#fee2e2", color: "#991b1b" },
  { bg: "#e0f2fe", color: "#0c4a6e" }, { bg: "#fdf4ff", color: "#701a75" },
  { bg: "#f0fdf4", color: "#14532d" }, { bg: "#fff7ed", color: "#7c2d12" },
];

function ServiteurCard({ membre, sousTitre, idx = 0 }) {
  const ac = AVATAR_COLORS[idx % AVATAR_COLORS.length];
  const initiales = `${(membre.prenom || "")[0] || ""}${(membre.nom || "")[0] || ""}`.toUpperCase();
  return (
    <div className="bg-white/10 rounded-xl px-3 sm:px-4 py-3 flex items-center gap-3 hover:bg-white/15 transition-colors">
      <div className="w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-bold flex-shrink-0"
        style={{ background: ac.bg, color: ac.color }}>
        {initiales}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white truncate">{membre.prenom} {membre.nom}</p>
        <p className="text-xs text-white truncate">{sousTitre}</p>
      </div>
    </div>
  );
}

// ─── STAGES CONFIG ──────────────────────────────────────────
const STAGES_ORDER = ["potentiel", "croissance", "developpement", "mature", "none"];

// ─── LOGIQUE DE RATTACHEMENT (respecte les features ON/OFF) ──
// Si la feature cellule est désactivée, un leader n'est JAMAIS considéré
// "en cellule" même s'il a un cellule_id en base : il retombe sur famille,
// puis sur "eglise" si la feature famille est également désactivée (ou absente).
function getRattachementType(membre, cellulesActive, famillesActive) {
  if (cellulesActive && membre.cellule_id) return "cellule";
  if (famillesActive && membre.famille_id) return "famille";
  return "eglise";
}

function getRattachementLabel(membre, type, cellulesMap, famillesMap, t) {
  if (type === "cellule") return { emoji: "🏠", label: cellulesMap[membre.cellule_id] || t.sansCellule };
  if (type === "famille") return { emoji: "👑", label: famillesMap[membre.famille_id] || t.sansFamille };
  return { emoji: "🛐", label: t.rattachementLabelEglise };
}

// ─── BLOC KPI LEADERS (total + par étape) ────────────────────
function BlocLeadersKpi({ leaders, totalMembres, t }) {
  const counts = { potentiel: 0, croissance: 0, developpement: 0, mature: 0, none: 0 };
  leaders.forEach(l => { counts[l.etape || "none"]++; });

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3">
      <TotalLeadersCard
        label={t.totalLeaders}
        value={leaders.length}
        sub={totalMembres > 0 ? t.ofMembers(Math.round((leaders.length / totalMembres) * 100)) : ""}
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

// ─── BLOC RÉPARTITION PAR RATTACHEMENT ───────────────────────
function BlocRepartitionRattachement({ leaders, cellulesActive, famillesActive, t }) {
  const counts = { cellule: 0, famille: 0, eglise: 0 };
  leaders.forEach(l => { counts[l.rattachementType]++; });

  const lignes = [
    ...(cellulesActive ? [{ key: "cellule", label: t.rattacheCellule, val: counts.cellule, color: "bg-blue-400" }] : []),
    ...(famillesActive ? [{ key: "famille", label: t.rattacheFamille, val: counts.famille, color: "bg-pink-400" }] : []),
    { key: "eglise", label: t.rattacheEglise, val: counts.eglise, color: "bg-emerald-400" },
  ];
  const max = Math.max(...lignes.map(l => l.val), 1);

  return (
    <div className="bg-white/10 rounded-2xl p-3 sm:p-4 flex flex-col gap-3">
      <SectionTitle>{t.repartitionRattachement}</SectionTitle>
      {lignes.map(({ key, label, val, color }) => (
        <div key={key} className="flex items-center gap-2 sm:gap-3">
          <p className="text-xs sm:text-sm text-white w-28 sm:w-36 flex-shrink-0 truncate">{label}</p>
          <BarreProgression pct={(val / max) * 100} color={color} />
          <span className="text-xs sm:text-sm text-white font-semibold w-8 flex-shrink-0 text-right">{val}</span>
        </div>
      ))}
    </div>
  );
}

// ─── CLASSEMENT PAR ÉTAPE (accordéon) ────────────────────────
function BlocClassementLeaders({ leaders, openStages, setOpenStages, cellulesMap, famillesMap, t }) {
  const grouped = {};
  STAGES_ORDER.forEach(s => { grouped[s] = []; });
  leaders.forEach(l => { grouped[l.etape || "none"].push(l); });

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
              className="w-full flex items-center justify-between px-3 sm:px-4 py-3 hover:bg-white/5 transition text-left gap-2">
              <span className="text-sm font-semibold text-white flex items-center gap-2 min-w-0 truncate">
                <span className="flex-shrink-0">{emoji}</span><span className="truncate">{label}</span>
              </span>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-sm font-bold text-white">{list.length}</span>
                <svg className={`w-4 h-4 text-white/50 transition-transform ${isOpen ? "rotate-180" : ""}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>
            {isOpen && (
              <div className="px-3 sm:px-4 pb-3 border-t border-white/10 pt-2 flex flex-col gap-2">
                {list.length === 0 ? (
                  <p className="text-sm text-white/40 italic px-1">{t.pasDeLeader}</p>
                ) : (
                  list.map((l, idx) => {
                    const attach = getRattachementLabel(l.membre, l.rattachementType, cellulesMap, famillesMap, t);
                    return (
                      <ServiteurCard
                        key={l.membre.id}
                        idx={idx}
                        membre={l.membre}
                        sousTitre={`${attach.emoji} ${attach.label}`}
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

// ─── RÉPARTITION (cellule ou famille) ────────────────────────
function BlocRepartitionParGroupe({ leaders, refList, labelKey, t }) {
  const map = {};
  leaders.forEach(l => {
    const nom = refList.find(x => x.id === l.groupeId)?.[labelKey];
    if (!nom) return;
    map[l.groupeId] = map[l.groupeId] || { nom, count: 0 };
    map[l.groupeId].count++;
  });
  const lignes = Object.entries(map).map(([id, v]) => ({ id, ...v })).sort((a, b) => b.count - a.count);

  if (!lignes.length) return <p className="text-white/30 text-sm text-center py-4 px-4">{t.noData}</p>;
  const max = Math.max(...lignes.map(l => l.count), 1);

  return (
    <div className="flex flex-col gap-2">
      {lignes.map(({ id, nom, count }) => (
        <div key={id} className="bg-white/10 rounded-xl px-3 sm:px-4 py-3 flex items-center gap-2 sm:gap-3">
          <p className="text-sm text-white flex-1 min-w-0 truncate">{nom}</p>
          <BarreProgression pct={(count / max) * 100} color="bg-blue-400" className="w-16 sm:w-32 flex-shrink-0" />
          <span className="text-sm font-semibold text-white w-6 flex-shrink-0 text-right">{count}</span>
        </div>
      ))}
    </div>
  );
}

// ─── PAGE PRINCIPALE ───────────────────────────────────────────
function EtatLeaders() {
  const { lang } = useLang();
  const t = translations[lang];

  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  const [onglet, setOnglet] = useState("kpi");
  const [openStages, setOpenStages] = useState({});

  const [leaders, setLeaders] = useState([]); // { membre, etape, rattachementType, groupeId }
  const [totalMembres, setTotalMembres] = useState(0);
  const [cellulesMap, setCellulesMap] = useState({});
  const [famillesMap, setFamillesMap] = useState({});
  const [cellules, setCellules] = useState([]);
  const [familles, setFamilles] = useState([]);

  const cellulesActive = useFeature("cellules");
  const famillesActive = useFeature("familles");

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

  // ─── Fetch leaders (tous rattachements, éche entière — Admin) ───
  const fetchLeaders = async () => {
    if (!userProfile) return;
    setLoading(true);
    try {
      // ── Cellules / familles (pour affichage des noms), uniquement si feature active ──
      let cellulesData = [];
      let famillesData = [];
      if (cellulesActive) {
        const { data } = await supabase
          .from("cellules")
          .select("id, cellule_full")
          .eq("eglise_id", userProfile.eglise_id);
        cellulesData = data || [];
      }
      if (famillesActive) {
        const { data } = await supabase
          .from("familles")
          .select("id, famille_full")
          .eq("eglise_id", userProfile.eglise_id);
        famillesData = data || [];
      }
      setCellules(cellulesData);
      setFamilles(famillesData);

      const cMap = {};
      cellulesData.forEach(c => { cMap[c.id] = c.cellule_full; });
      setCellulesMap(cMap);

      const fMap = {};
      famillesData.forEach(f => { fMap[f.id] = f.famille_full; });
      setFamillesMap(fMap);

      // ── Membres actifs (dénominateur, toute l'église) ──
      const { data: membresData, error } = await supabase
        .from("membres_complets")
        .select("id, nom, prenom, leader_developpement, cellule_id, famille_id, etat_contact")
        .eq("eglise_id", userProfile.eglise_id);
      if (error) throw error;

      const actifs = (membresData || []).filter(m =>
        ["existant", "nouveau"].includes(m.etat_contact?.toLowerCase())
      );
      setTotalMembres(actifs.length);

      const leadersMembres = (membresData || []).filter(m => m.leader_developpement === true);
      const leaderIds = leadersMembres.map(m => m.id);

      // ── Étapes du parcours ──
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

      setLeaders(
        leadersMembres.map(m => {
          const rattachementType = getRattachementType(m, cellulesActive, famillesActive);
          const groupeId = rattachementType === "cellule" ? m.cellule_id
                          : rattachementType === "famille" ? m.famille_id
                          : null;
          return {
            membre: m,
            etape: evalsMap[m.id] || null,
            rattachementType,
            groupeId,
          };
        })
      );
    } catch (err) {
      console.error("Erreur fetch leaders:", err);
      setLeaders([]);
      setTotalMembres(0);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (userProfile) fetchLeaders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userProfile, cellulesActive, famillesActive]);

  const hasData = leaders.length > 0;

  const onglets = [
    { key: "kpi", label: t.tabOverview },
    { key: "classement", label: t.tabClassement },
    ...(cellulesActive ? [{ key: "cellules", label: t.tabCellules }] : []),
    ...(famillesActive ? [{ key: "familles", label: t.tabFamilles }] : []),
  ];

  const leadersCellule = leaders.filter(l => l.rattachementType === "cellule");
  const leadersFamille = leaders.filter(l => l.rattachementType === "famille");

  return (
    <div className="min-h-screen flex flex-col items-center p-3 sm:p-6" style={{ background: "#333699" }}>
      <HeaderPages />

      <div className="w-full max-w-2xl mt-6 flex flex-col gap-5 mb-10">

        {/* En-tête */}
        <div className="text-center px-1">
          <h1 className="text-xl sm:text-2xl font-bold mt-4 mb-2 text-blue-300 text-center text-white">
            {t.pageTitle} <span className="text-emerald-300">{t.pageTitleHighlight}</span>
          </h1>
          <p className="italic text-sm sm:text-base text-white/90">
            <span className="text-blue-300 font-semibold">{t.subtitle1}</span>{" "}
            {t.subtitle2} <span className="text-blue-300 font-semibold">{t.subtitle3}</span>
            {t.subtitle4}{" "}
            <span className="text-blue-300 font-semibold">{t.subtitle5}</span>
            {t.subtitle6}{" "}
            <span className="text-blue-300 font-semibold">{t.subtitle7}</span>
            {t.subtitle8}{" "}
            <span className="text-blue-300 font-semibold">{t.subtitle9}</span>{t.subtitle10}
          </p>
        </div>

        {/* Onglets */}
        <div className="flex gap-1 bg-white/10 rounded-xl p-1 overflow-x-auto">
          {onglets.map(o => (
            <button key={o.key} onClick={() => setOnglet(o.key)}
              className={`flex-shrink-0 sm:flex-1 py-2 px-2.5 sm:px-2 rounded-lg text-xs sm:text-sm font-semibold transition whitespace-nowrap ${onglet === o.key ? "bg-white text-[#333699]" : "text-white/50 hover:text-white"}`}>
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
            {t.emptyData}
          </div>
        ) : onglet === "kpi" ? (
          <div className="flex flex-col gap-7">
            <div>
              <SectionTitle>{t.leadersEnDeveloppement}</SectionTitle>
              <BlocLeadersKpi leaders={leaders} totalMembres={totalMembres} t={t} />
            </div>
            <BlocRepartitionRattachement
              leaders={leaders}
              cellulesActive={cellulesActive}
              famillesActive={famillesActive}
              t={t}
            />
          </div>
        ) : onglet === "classement" ? (
          <div>
            <SectionTitle>{t.ongletLeaders}</SectionTitle>
            <BlocClassementLeaders
              leaders={leaders}
              openStages={openStages}
              setOpenStages={setOpenStages}
              cellulesMap={cellulesMap}
              famillesMap={famillesMap}
              t={t}
            />
          </div>
        ) : onglet === "cellules" ? (
          <div>
            <SectionTitle total={leadersCellule.length}>{t.repartitionParCellule}</SectionTitle>
            <BlocRepartitionParGroupe leaders={leadersCellule} refList={cellules} labelKey="cellule_full" t={t} />
          </div>
        ) : (
          <div>
            <SectionTitle total={leadersFamille.length}>{t.repartitionParFamille}</SectionTitle>
            <BlocRepartitionParGroupe leaders={leadersFamille} refList={familles} labelKey="famille_full" t={t} />
          </div>
        )}

      </div>

      <Footer />
    </div>
  );
}
