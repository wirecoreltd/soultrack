"use client";

import { useState, useEffect, useMemo } from "react";
import supabase from "../../lib/supabaseClient";
import HeaderPages from "../../components/HeaderPages";
import Footer from "../../components/Footer";
import ProtectedRoute from "../../components/ProtectedRoute";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function RapportPresencePage() {
  return (
    <ProtectedRoute
      allowedRoles={[
        "Administrateur",
        "ResponsableSuivi",
        "SuperviseurCellule",
        "SuperviseurFamille",
        "ResponsableCellule",
        "ResponsableFamilles",
      ]}
    >
      <RapportPresence />
    </ProtectedRoute>
  );
}

// ── helpers ────────────────────────────────────────────────────────────────
const AGE_TRANCHES = [
  "Moins de 13 ans",
  "13-17 ans",
  "18-25 ans",
  "26-30 ans",
  "31-40 ans",
  "41-50 ans",
  "51-60 ans",
  "Plus de 60 ans",
  "Non renseigné",
];

// Mapping des tranches membres_complets → AGE_TRANCHES normalisés
const normalizeAge = (age) => {
  if (!age) return "Non renseigné";
  const map = {
    "12-17 ans":  "13-17 ans",
    "13-17 ans":  "13-17 ans",
    "18-25 ans":  "18-25 ans",
    "26-30 ans":  "26-30 ans",
    "31-40 ans":  "31-40 ans",
    "41-55 ans":  "41-50 ans",
    "41-50 ans":  "41-50 ans",
    "51-60 ans":  "51-60 ans",
    "56-69 ans":  "Plus de 60 ans",
    "Plus de 60 ans": "Plus de 60 ans",
    "Moins de 13 ans": "Moins de 13 ans",
  };
  return map[age] || "Non renseigné";
};

const fmt = (d) =>
  `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;

const fmtMois = (d) => {
  const mois = ["Jan","Fév","Mar","Avr","Mai","Jun","Jul","Aoû","Sep","Oct","Nov","Déc"];
  return `${mois[d.getMonth()]} ${d.getFullYear()}`;
};

const weekKey = (d) => {
  const tmp = new Date(d);
  tmp.setHours(0, 0, 0, 0);
  tmp.setDate(tmp.getDate() - tmp.getDay() + 1);
  return tmp.toISOString().slice(0, 10);
};

const monthKey = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

// Icônes SVG inline
const IconFamille = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const IconCellule = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);

// ───────────────────────────────────────────────────────────────────────────
function RapportPresence() {
  const [userRole, setUserRole] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  const [vue, setVue] = useState("eglise");
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");

  const [branches, setBranches] = useState([]);
  const [familles, setFamilles] = useState([]);
  const [cellules, setCellules] = useState([]);

  // Familles/cellules attachées au user (pour restriction)
  const [myFamilleIds, setMyFamilleIds] = useState([]);
  const [myCelluleIds, setMyCelluleIds] = useState([]);

  const [brancheId, setBrancheId] = useState("");
  const [familleId, setFamilleId] = useState("");
  const [celluleId, setCelluleId] = useState("");

  // filtre tableau détaillé
  const [tblFamilleId, setTblFamilleId] = useState("");
  const [tblCelluleId, setTblCelluleId] = useState("");

  // filtre répartition
  const [repartFamilleId, setRepartFamilleId] = useState("");
  const [repartCelluleId, setRepartCelluleId] = useState("");

  const [attendances, setAttendances] = useState([]);
  const [presences, setPresences] = useState([]);
  const [membres, setMembres] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("evolution");

  const [evGranularity, setEvGranularity] = useState("auto");
  const [drillMois, setDrillMois] = useState(null);
  const [drillSemaine, setDrillSemaine] = useState(null);

  // ── init ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session?.user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("id, role, eglise_id, branche_id, famille_id, cellule_id")
        .eq("id", sessionData.session.user.id)
        .single();

      setUserProfile(profile);
      setUserRole(profile?.role);
      if (!profile?.eglise_id) return;

      const { data: br } = await supabase
        .from("branches")
        .select("id, nom")
        .eq("eglise_id", profile.eglise_id)
        .order("nom");
      setBranches(br || []);

      const { data: fa } = await supabase
        .from("familles")
        .select("id, famille, famille_full, branche_id, responsable_id, eglise_id")
        .eq("eglise_id", profile.eglise_id)
        .order("famille");
      setFamilles(fa || []);

      const { data: ce } = await supabase
        .from("cellules")
        .select("id, cellule, cellule_full, famille_id, branche_id, responsable_id, superviseur_id, eglise_id")
        .eq("eglise_id", profile.eglise_id)
        .order("cellule");
      setCellules(ce || []);

      // Calcul des familles/cellules attachées à l'utilisateur
      const role = profile?.role;
      const uid = profile?.id;

      if (role === "ResponsableFamilles") {
        const myFam = (fa || []).filter((f) => f.responsable_id === uid).map((f) => f.id);
        setMyFamilleIds(myFam);
        const myCel = (ce || []).filter((c) => myFam.includes(c.famille_id)).map((c) => c.id);
        setMyCelluleIds(myCel);
      } else if (role === "ResponsableCellule") {
        const myCel = (ce || []).filter((c) => c.responsable_id === uid).map((c) => c.id);
        setMyCelluleIds(myCel);
        setMyFamilleIds([]);
      } else if (role === "SuperviseurCellule" || role === "SuperviseurFamille") {
        const myCel = (ce || []).filter((c) => c.superviseur_id === uid).map((c) => c.id);
        setMyCelluleIds(myCel);
        const myFam = (fa || []).filter((f) => f.superviseur_id === uid).map((f) => f.id);
        setMyFamilleIds(myFam);
      }

      // Charger membres avec leurs cellule_id et famille_id
      const { data: mb, error: mbErr } = await supabase
        .from("membres_complets")
        .select("id, age, sexe, cellule_id, famille_id, eglise_id")
        .eq("eglise_id", profile.eglise_id);
      console.log("Membres chargés:", mb?.length, mbErr);
      setMembres(mb || []);
    };
    init();
  }, []);

  // ── familles/cellules visibles selon rôle ────────────────────────────────
  const famillesVisibles = useMemo(() => {
    if (!userRole) return familles;
    if (["Administrateur", "ResponsableSuivi", "SuperviseurCellule", "SuperviseurFamille"].includes(userRole))
      return familles;
    if (userRole === "ResponsableFamilles")
      return familles.filter((f) => myFamilleIds.includes(f.id));
    if (userRole === "ResponsableCellule")
      return familles; // voit les familles pour info mais filtré par cellule
    return familles;
  }, [familles, userRole, myFamilleIds]);

  const cellulesVisibles = useMemo(() => {
    if (!userRole) return cellules;
    if (["Administrateur", "ResponsableSuivi", "SuperviseurCellule", "SuperviseurFamille"].includes(userRole))
      return cellules;
    if (userRole === "ResponsableFamilles")
      return cellules.filter((c) => myCelluleIds.includes(c.id));
    if (userRole === "ResponsableCellule")
      return cellules.filter((c) => myCelluleIds.includes(c.id));
    return cellules;
  }, [cellules, userRole, myCelluleIds]);

  const famillesFiltrees = brancheId
    ? famillesVisibles.filter((f) => f.branche_id === brancheId)
    : famillesVisibles;

  const cellulesFiltrees = familleId
    ? cellulesVisibles.filter((c) => c.famille_id === familleId)
    : brancheId
    ? cellulesVisibles.filter((c) => c.branche_id === brancheId)
    : cellulesVisibles;

  const tblCellulesFiltrees = tblFamilleId
    ? cellulesVisibles.filter((c) => c.famille_id === tblFamilleId)
    : cellulesVisibles;

  const repartCellulesFiltrees = repartFamilleId
    ? cellulesVisibles.filter((c) => c.famille_id === repartFamilleId)
    : cellulesVisibles;

  const getVuesAccessibles = () => {
    if (!userRole) return [];
    if (userRole === "Administrateur") return ["eglise", "branche", "famille", "cellule"];
    if (["SuperviseurCellule", "SuperviseurFamille"].includes(userRole)) return ["branche", "famille", "cellule"];
    if (["ResponsableCellule", "ResponsableFamilles"].includes(userRole)) return ["famille", "cellule"];
    return ["eglise"];
  };

  const vueLabels = {
    eglise: "Église globale",
    branche: "Par branche",
    famille: "Par famille",
    cellule: "Par cellule",
  };

  // ── fetch ────────────────────────────────────────────────────────────────
  const fetchRapport = async () => {
    setLoading(true);
    setMessage("⏳ Chargement...");
    setAttendances([]);
    setPresences([]);
    setDrillMois(null);
    setDrillSemaine(null);
    setRepartFamilleId("");
    setRepartCelluleId("");

    try {
      let q = supabase
        .from("attendance")
        .select("*")
        .order("date", { ascending: true });

      if (userProfile?.eglise_id) q = q.eq("eglise_id", userProfile.eglise_id);

      // Restriction rôle sur attendance (par superviseur_id ou branche_id)
      if (userRole === "ResponsableFamilles" && myFamilleIds.length > 0) {
        // On filtre via les cellules attachées — l'attendance n'a pas famille_id
        // On laisse passer tout puis on filtre via membres
      }
      if (userRole === "ResponsableCellule" && myCelluleIds.length > 0) {
        // même approche
      }

      // Filtres sélectionnés par l'utilisateur
      if (celluleId) q = q.eq("cellule_id", celluleId);
      else if (familleId) q = q.eq("famille_id", familleId);
      else if (brancheId) q = q.eq("branche_id", brancheId);

      if (dateDebut) q = q.gte("date", dateDebut);
      if (dateFin) q = q.lte("date", dateFin);

      const { data, error } = await q;
      if (error) throw error;

      // Regrouper par date + numero_culte
      const grouped = {};
      (data || []).forEach((a) => {
        const key = `${a.date}_${a.numero_culte || ""}`;
        if (!grouped[key]) grouped[key] = { ...a };
        else {
          grouped[key].hommes = (grouped[key].hommes || 0) + (a.hommes || 0);
          grouped[key].femmes = (grouped[key].femmes || 0) + (a.femmes || 0);
        }
      });
      setAttendances(Object.values(grouped));

      // Presences pour tranches d'âge
      const attendanceIds = (data || []).map((a) => a.id);
      if (attendanceIds.length > 0) {
        let pq = supabase
          .from("presences")
          .select("id, membre_id, date, attendance_id")
          .in("attendance_id", attendanceIds)
          .order("date", { ascending: true });
        if (dateDebut) pq = pq.gte("date", dateDebut);
        if (dateFin) pq = pq.lte("date", dateFin);
        const { data: pdata } = await pq;
        setPresences(pdata || []);
      } else {
        setPresences([]);
      }

      setMessage("");
    } catch (err) {
      console.error(err);
      setMessage("❌ Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  // ── métriques filtrées par repartition filter ────────────────────────────
  const membresFiltrés = useMemo(() => {
    let src = membres;

    // Restriction rôle
    if (userRole === "ResponsableCellule" && myCelluleIds.length > 0)
      src = src.filter((m) => myCelluleIds.includes(m.cellule_id));
    else if (userRole === "ResponsableFamilles" && myFamilleIds.length > 0)
      src = src.filter((m) => myFamilleIds.includes(m.famille_id) || myCelluleIds.includes(m.cellule_id));

    // Filtre répartition
    if (repartCelluleId) src = src.filter((m) => m.cellule_id === repartCelluleId);
    else if (repartFamilleId) src = src.filter((m) => m.famille_id === repartFamilleId);

    return src;
  }, [membres, userRole, myCelluleIds, myFamilleIds, repartFamilleId, repartCelluleId]);

  // IDs des membres présents (filtré par presences liées aux attendances)
  const presentMemberIds = useMemo(
    () => new Set(presences.map((p) => p.membre_id)),
    [presences]
  );

  // Si on a des presences individuelles → on filtre, sinon on prend tous les membres filtrés
  const membresPresents = useMemo(() => {
    if (presentMemberIds.size > 0) {
      return membresFiltrés.filter((m) => presentMemberIds.has(m.id));
    }
    // Fallback: tous les membres filtrés (par cellule/famille si filtre actif)
    return membresFiltrés;
  }, [membresFiltrés, presentMemberIds]);

  // Métriques globales (basées sur attendances, pas sur le filtre répartition)
  const totalH = attendances.reduce((s, a) => s + (a.hommes || 0), 0);
  const totalF = attendances.reduce((s, a) => s + (a.femmes || 0), 0);
  const totalPresences = totalH + totalF;

  // Métriques répartition (basées sur membresPresents filtrés)
  const repartH = membresPresents.filter((m) => m.sexe === "Homme").length;
  const repartF = membresPresents.filter((m) => m.sexe === "Femme").length;
  const repartTotal = membresPresents.length;

  // Utiliser les totaux attendance si pas de données presences individuelles
  const hasPresencesIndividuelles = presentMemberIds.size > 0;
  const displayH = hasPresencesIndividuelles ? repartH : totalH;
  const displayF = hasPresencesIndividuelles ? repartF : totalF;

  // ── évolution ────────────────────────────────────────────────────────────
  const rangeDays = useMemo(() => {
    if (!dateDebut || !dateFin) return 0;
    return (new Date(dateFin) - new Date(dateDebut)) / 86400000;
  }, [dateDebut, dateFin]);

  const effectiveGranularity = useMemo(() => {
    if (drillSemaine) return "jour";
    if (drillMois) return "semaine";
    if (evGranularity !== "auto") return evGranularity;
    return rangeDays > 31 ? "mois" : "jour";
  }, [evGranularity, rangeDays, drillMois, drillSemaine]);

  const attendancesDrill = useMemo(() => {
    let src = attendances;
    if (drillSemaine) {
      const lundi = new Date(drillSemaine);
      const dimanche = new Date(lundi);
      dimanche.setDate(dimanche.getDate() + 6);
      src = src.filter((a) => {
        const d = new Date(a.date);
        return d >= lundi && d <= dimanche;
      });
    } else if (drillMois) {
      src = src.filter((a) => a.date.startsWith(drillMois));
    }
    return src;
  }, [attendances, drillMois, drillSemaine]);

  const evGrouped = useMemo(() => {
    const map = {};
    attendancesDrill.forEach((a) => {
      const d = new Date(a.date);
      let key;
      if (effectiveGranularity === "mois") key = monthKey(d);
      else if (effectiveGranularity === "semaine") key = weekKey(d);
      else key = a.date;

      if (!map[key]) map[key] = { key, hommes: 0, femmes: 0 };
      map[key].hommes += a.hommes || 0;
      map[key].femmes += a.femmes || 0;
    });
    return Object.values(map).sort((a, b) => a.key.localeCompare(b.key));
  }, [attendancesDrill, effectiveGranularity]);

  const evLabels = evGrouped.map((g) => {
    if (effectiveGranularity === "mois") {
      const [y, m] = g.key.split("-");
      return fmtMois(new Date(+y, +m - 1, 1));
    }
    if (effectiveGranularity === "semaine") {
      return `Sem. ${fmt(new Date(g.key))}`;
    }
    return fmt(new Date(g.key));
  });

  const handleEvBarClick = (elements) => {
    if (!elements.length) return;
    const idx = elements[0].index;
    const grp = evGrouped[idx];
    if (effectiveGranularity === "mois") {
      setDrillMois(grp.key);
      setDrillSemaine(null);
    } else if (effectiveGranularity === "semaine") {
      setDrillSemaine(grp.key);
    }
  };

  const lineData = {
    labels: evLabels,
    datasets: [
      {
        label: "Hommes",
        data: evGrouped.map((g) => g.hommes),
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59,130,246,0.12)",
        tension: 0.4,
        pointRadius: 4,
        borderWidth: 2,
        fill: true,
      },
      {
        label: "Femmes",
        data: evGrouped.map((g) => g.femmes),
        borderColor: "#ec4899",
        backgroundColor: "rgba(236,72,153,0.12)",
        tension: 0.4,
        pointRadius: 4,
        borderWidth: 2,
        fill: true,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    onClick: (_, elements) => handleEvBarClick(elements),
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          footer: effectiveGranularity !== "jour" ? () => "Cliquez pour zoomer" : undefined,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        ticks: { color: "#fff", font: { size: 11 } },
        grid: { color: "rgba(255,255,255,0.08)" },
      },
      x: {
        ticks: { color: "#fff", font: { size: 11 }, maxRotation: 45, autoSkip: true, maxTicksLimit: 14 },
        grid: { display: false },
      },
    },
  };

  // ── Pie chart civilité ───────────────────────────────────────────────────
  const civiliteData = {
    labels: ["Hommes", "Femmes"],
    datasets: [
      {
        data: [displayH, displayF],
        backgroundColor: ["#3b82f6", "#ec4899"],
        borderWidth: 0,
        hoverOffset: 6,
      },
    ],
  };

  // ── Pie chart tranches d'âge ─────────────────────────────────────────────
  const tranchesData = useMemo(() => {
    const counts = {};
    AGE_TRANCHES.forEach((t) => { counts[t] = 0; });

    membresPresents.forEach((m) => {
      const bucket = normalizeAge(m.age);
      counts[bucket]++;
    });

    return AGE_TRANCHES.map((t) => ({ tranche: t, count: counts[t] })).filter(
      (t) => t.count > 0
    );
  }, [membresPresents]);

  const tranchesPieData = {
    labels: tranchesData.map((t) => t.tranche),
    datasets: [
      {
        data: tranchesData.map((t) => t.count),
        backgroundColor: [
          "#6366f1","#3b82f6","#06b6d4","#10b981",
          "#f59e0b","#ef4444","#ec4899","#8b5cf6","#64748b",
        ],
        borderWidth: 0,
        hoverOffset: 6,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: { color: "#fff", font: { size: 10 }, boxWidth: 10, padding: 8 },
      },
    },
  };

  // ── tableau détaillé ─────────────────────────────────────────────────────
  const tableRows = useMemo(() => {
    let src = attendances;
    if (tblCelluleId) src = src.filter((a) => a.cellule_id === tblCelluleId);
    else if (tblFamilleId) src = src.filter((a) => a.famille_id === tblFamilleId);

    const grouped = {};
    src.forEach((a) => {
      const key = `${a.date}_${a.numero_culte || ""}`;
      if (!grouped[key]) grouped[key] = { ...a };
      else {
        grouped[key].hommes = (grouped[key].hommes || 0) + (a.hommes || 0);
        grouped[key].femmes = (grouped[key].femmes || 0) + (a.femmes || 0);
      }
    });

    const sorted = Object.values(grouped).sort((a, b) => a.date.localeCompare(b.date));
    return sorted.map((a, i) => {
      const total = (a.hommes || 0) + (a.femmes || 0);
      const prev = i > 0 ? sorted[i - 1] : null;
      const prevTotal = prev ? (prev.hommes || 0) + (prev.femmes || 0) : null;
      const pct =
        prevTotal && prevTotal > 0
          ? (((total - prevTotal) / prevTotal) * 100).toFixed(1)
          : null;
      return { ...a, total, pct };
    });
  }, [attendances, tblFamilleId, tblCelluleId]);

  // ── granularity buttons ──────────────────────────────────────────────────
  const granularityBtns = () => {
    const back = drillSemaine
      ? () => setDrillSemaine(null)
      : drillMois
      ? () => setDrillMois(null)
      : null;

    return (
      <div className="flex items-center gap-2 flex-wrap mb-3">
        {back && (
          <button
            onClick={back}
            className="px-3 py-1 rounded-full text-xs border border-white/30 text-white/70 hover:border-white flex items-center gap-1"
          >
            ← Retour
          </button>
        )}
        {!drillMois && !drillSemaine &&
          ["mois", "semaine", "jour"].map((g) => (
            <button
              key={g}
              onClick={() => setEvGranularity(g)}
              className={`px-3 py-1 rounded-full text-xs border transition ${
                (evGranularity === "auto" ? effectiveGranularity : evGranularity) === g
                  ? "bg-emerald-400 text-white border-emerald-400"
                  : "border-white/30 text-white/70 hover:border-white"
              }`}
            >
              {g.charAt(0).toUpperCase() + g.slice(1)}
            </button>
          ))}
        {drillMois && !drillSemaine && (
          <span className="text-white/60 text-xs">
            {fmtMois(new Date(drillMois + "-01"))} — cliquez une semaine pour zoomer
          </span>
        )}
        {drillSemaine && (
          <span className="text-white/60 text-xs">
            Semaine du {fmt(new Date(drillSemaine))}
          </span>
        )}
      </div>
    );
  };

  const vuesAccessibles = getVuesAccessibles();

  // ── Filtre répartition ───────────────────────────────────────────────────
  const FilterRepartition = () => (
    <div className="flex flex-wrap gap-3 mb-4 items-end">
      {/* Famille */}
      <div className="flex flex-col">
        <label className="text-xs text-white/60 mb-1 flex items-center gap-1">
          <span className="text-emerald-300"><IconFamille /></span>
          Famille
        </label>
        <select
          value={repartFamilleId}
          onChange={(e) => { setRepartFamilleId(e.target.value); setRepartCelluleId(""); }}
          className="border border-white/20 rounded-lg px-3 py-1.5 bg-white/10 text-white text-sm min-w-[160px]"
        >
          <option value="">Toutes les familles</option>
          {famillesVisibles.map((f) => (
            <option key={f.id} value={f.id}>{f.famille_full || f.famille || f.id}</option>
          ))}
        </select>
      </div>

      {/* Cellule */}
      <div className="flex flex-col">
        <label className="text-xs text-white/60 mb-1 flex items-center gap-1">
          <span className="text-amber-300"><IconCellule /></span>
          Cellule
        </label>
        <select
          value={repartCelluleId}
          onChange={(e) => setRepartCelluleId(e.target.value)}
          className="border border-white/20 rounded-lg px-3 py-1.5 bg-white/10 text-white text-sm min-w-[160px]"
        >
          <option value="">Toutes les cellules</option>
          {repartCellulesFiltrees.map((c) => (
            <option key={c.id} value={c.id}>{c.cellule_full || c.cellule || c.id}</option>
          ))}
        </select>
      </div>

      {(repartFamilleId || repartCelluleId) && (
        <button
          onClick={() => { setRepartFamilleId(""); setRepartCelluleId(""); }}
          className="text-xs text-white/50 hover:text-white border border-white/20 rounded-lg px-3 py-1.5 self-end"
        >
          Réinitialiser
        </button>
      )}
    </div>
  );

  // ───────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-[#333699]">
      <HeaderPages />

      <h1 className="text-2xl font-bold mt-4 mb-2 text-center text-white">
        Rapport <span className="text-emerald-300">Présences</span>
      </h1>
      <p className="italic text-sm text-white/80 mb-6 text-center max-w-2xl">
        Suivez l'évolution des présences par église, branche, famille ou cellule.
        Analysez la croissance et les tendances au fil du temps.
      </p>

      {/* FILTRES PRINCIPAUX */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 shadow-lg rounded-xl p-4 md:p-6 w-full max-w-2xl mx-auto text-white mb-6">
        <p className="text-sm font-semibold text-red-400 text-center mb-4">
          Choisissez les paramètres pour générer le rapport
        </p>

        {vuesAccessibles.length > 1 && (
          <div className="flex flex-wrap gap-2 justify-center mb-4">
            {vuesAccessibles.map((v) => (
              <button
                key={v}
                onClick={() => { setVue(v); setBrancheId(""); setFamilleId(""); setCelluleId(""); }}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition ${
                  vue === v
                    ? "bg-emerald-400 text-white border-emerald-400"
                    : "border-white/30 text-white/70 hover:border-white"
                }`}
              >
                {vueLabels[v]}
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {["branche", "famille", "cellule"].includes(vue) && (
            <div className="flex flex-col">
              <label className="text-sm text-center mb-1">Branche</label>
              <select
                value={brancheId}
                onChange={(e) => { setBrancheId(e.target.value); setFamilleId(""); setCelluleId(""); }}
                className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white"
              >
                <option value="">Toutes les branches</option>
                {branches.map((b) => <option key={b.id} value={b.id}>{b.nom}</option>)}
              </select>
            </div>
          )}

          {["famille", "cellule"].includes(vue) && (
            <div className="flex flex-col">
              <label className="text-sm text-center mb-1 flex items-center justify-center gap-1">
                <IconFamille /> Famille
              </label>
              <select
                value={familleId}
                onChange={(e) => { setFamilleId(e.target.value); setCelluleId(""); }}
                className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white"
              >
                <option value="">Toutes les familles</option>
                {famillesFiltrees.map((f) => (
                  <option key={f.id} value={f.id}>{f.famille_full || f.famille}</option>
                ))}
              </select>
            </div>
          )}

          {vue === "cellule" && (
            <div className="flex flex-col">
              <label className="text-sm text-center mb-1 flex items-center justify-center gap-1">
                <IconCellule /> Cellule
              </label>
              <select
                value={celluleId}
                onChange={(e) => setCelluleId(e.target.value)}
                className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white"
              >
                <option value="">Toutes les cellules</option>
                {cellulesFiltrees.map((c) => (
                  <option key={c.id} value={c.id}>{c.cellule_full || c.cellule}</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex flex-col">
            <label className="text-sm text-center mb-1">Date de Début</label>
            <input
              type="date"
              value={dateDebut}
              onChange={(e) => setDateDebut(e.target.value)}
              className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm text-center mb-1">Date de Fin</label>
            <input
              type="date"
              value={dateFin}
              onChange={(e) => setDateFin(e.target.value)}
              className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white"
            />
          </div>
        </div>

        <button
          onClick={fetchRapport}
          disabled={loading}
          className="w-full mt-4 h-10 bg-amber-300 text-white font-semibold rounded-lg hover:bg-amber-400 transition disabled:opacity-60"
        >
          {loading ? "⏳ Chargement..." : "Générer"}
        </button>
      </div>

      {message && <p className="text-white mb-4">{message}</p>}

      {attendances.length > 0 && (
        <div className="w-full max-w-4xl">

          {/* MÉTRIQUES */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { label: "Total présences", value: totalPresences.toLocaleString("fr-FR"), color: "text-white" },
              { label: "Hommes", value: totalH, color: "text-blue-300" },
              { label: "Femmes", value: totalF, color: "text-pink-300" },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-white/10 border border-white/20 rounded-xl p-3 text-center text-white">
                <p className="text-xs text-white/60 mb-1">{label}</p>
                <p className={`text-xl font-bold ${color}`}>{value}</p>
              </div>
            ))}
          </div>

          {/* ONGLETS */}
          <div className="flex gap-2 mb-4 flex-wrap">
            {[
              { key: "evolution", label: "Évolution" },
              { key: "repartition", label: "Répartition" },
              { key: "tableau", label: "Tableau détaillé" },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition ${
                  activeTab === key
                    ? "bg-white text-[#333699] border-white"
                    : "border-white/30 text-white/70 hover:border-white"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* ── TAB ÉVOLUTION ── */}
          {activeTab === "evolution" && (
            <div className="bg-white/10 border border-white/20 rounded-xl p-4">
              <p className="text-white font-semibold mb-2">Évolution des présences</p>
              {granularityBtns()}
              <div className="flex flex-wrap gap-3 mb-3 text-xs text-white/70">
                {[["Hommes", "#3b82f6"], ["Femmes", "#ec4899"]].map(([l, c]) => (
                  <span key={l} className="flex items-center gap-1">
                    <span style={{ background: c }} className="w-3 h-3 rounded-sm inline-block"></span>
                    {l}
                  </span>
                ))}
                {effectiveGranularity !== "jour" && (
                  <span className="text-white/40 ml-auto">💡 Cliquez sur un point pour zoomer</span>
                )}
              </div>
              <div style={{ height: 280 }}>
                <Line data={lineData} options={lineOptions} />
              </div>
            </div>
          )}

          {/* ── TAB RÉPARTITION (civilité + tranches d'âge fusionnées) ── */}
          {activeTab === "repartition" && (
            <div className="bg-white/10 border border-white/20 rounded-xl p-4">
              <p className="text-white font-semibold mb-4">Répartition des présences</p>

              {/* Filtre famille / cellule */}
              <FilterRepartition />

              {/* Compteurs filtrés */}
              <div className="grid grid-cols-3 gap-3 mb-5">
                {[
                  { label: "Total", value: hasPresencesIndividuelles ? repartTotal : totalPresences, color: "text-white" },
                  { label: "Hommes", value: displayH, color: "text-blue-300" },
                  { label: "Femmes", value: displayF, color: "text-pink-300" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="bg-white/10 border border-white/10 rounded-xl p-3 text-center">
                    <p className="text-xs text-white/50 mb-1">{label}</p>
                    <p className={`text-lg font-bold ${color}`}>{value}</p>
                  </div>
                ))}
              </div>

              {!hasPresencesIndividuelles && (repartFamilleId || repartCelluleId) && (
                <p className="text-white/40 text-xs text-center mb-3">
                  ℹ️ Données individuelles non disponibles pour ce filtre — affichage des totaux globaux
                </p>
              )}

              {/* Deux pie charts côte à côte */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Civilité */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <p className="text-white/70 text-sm font-medium mb-3 text-center">Par civilité</p>
                  <div style={{ height: 200 }}>
                    <Doughnut data={civiliteData} options={doughnutOptions} />
                  </div>
                  <div className="flex justify-center gap-4 mt-3 text-xs">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-blue-400 inline-block"></span>
                      <span className="text-blue-300 font-semibold">{displayH}</span>
                      <span className="text-white/50">H</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-pink-400 inline-block"></span>
                      <span className="text-pink-300 font-semibold">{displayF}</span>
                      <span className="text-white/50">F</span>
                    </span>
                  </div>
                </div>

                {/* Tranches d'âge */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <p className="text-white/70 text-sm font-medium mb-3 text-center">Par tranche d'âge</p>
                  {tranchesData.length === 0 ? (
                    <div className="flex items-center justify-center h-[200px]">
                      <p className="text-white/30 text-xs text-center">
                        Aucune tranche d'âge<br/>renseignée pour ces membres
                      </p>
                    </div>
                  ) : (
                    <>
                      <div style={{ height: 200 }}>
                        <Doughnut data={tranchesPieData} options={doughnutOptions} />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Tableau récap tranches */}
              {tranchesData.length > 0 && (
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-sm text-white text-left">
                    <thead>
                      <tr className="text-xs uppercase text-white/40 border-b border-white/10">
                        <th className="py-2 pr-4">Tranche d'âge</th>
                        <th className="py-2 pr-4 text-orange-400">Nb</th>
                        <th className="py-2 text-white/40">%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tranchesData.map((t) => {
                        const totalGlobal = tranchesData.reduce((s, x) => s + x.count, 0);
                        return (
                          <tr key={t.tranche} className="border-t border-white/10 hover:bg-white/5">
                            <td className="py-1.5 pr-4 text-white/80">{t.tranche}</td>
                            <td className="py-1.5 pr-4 text-orange-400 font-semibold">{t.count}</td>
                            <td className="py-1.5 text-white/40 text-xs">
                              {totalGlobal > 0 ? ((t.count / totalGlobal) * 100).toFixed(1) : 0}%
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── TAB TABLEAU DÉTAILLÉ ── */}
          {activeTab === "tableau" && (
            <div>
              <div className="flex flex-wrap gap-3 mb-3 items-end">
                <div className="flex flex-col">
                  <label className="text-xs text-white/60 mb-1 flex items-center gap-1">
                    <IconFamille /> Filtrer par famille
                  </label>
                  <select
                    value={tblFamilleId}
                    onChange={(e) => { setTblFamilleId(e.target.value); setTblCelluleId(""); }}
                    className="border border-gray-400 rounded-lg px-3 py-1.5 bg-white/10 text-white text-sm"
                  >
                    <option value="">Toutes les familles</option>
                    {famillesVisibles.map((f) => (
                      <option key={f.id} value={f.id}>{f.famille_full || f.famille}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className="text-xs text-white/60 mb-1 flex items-center gap-1">
                    <IconCellule /> Filtrer par cellule
                  </label>
                  <select
                    value={tblCelluleId}
                    onChange={(e) => setTblCelluleId(e.target.value)}
                    className="border border-gray-400 rounded-lg px-3 py-1.5 bg-white/10 text-white text-sm"
                  >
                    <option value="">Toutes les cellules</option>
                    {tblCellulesFiltrees.map((c) => (
                      <option key={c.id} value={c.id}>{c.cellule_full || c.cellule}</option>
                    ))}
                  </select>
                </div>
                {(tblFamilleId || tblCelluleId) && (
                  <button
                    onClick={() => { setTblFamilleId(""); setTblCelluleId(""); }}
                    className="text-xs text-white/50 hover:text-white border border-white/20 rounded-lg px-3 py-1.5"
                  >
                    Réinitialiser
                  </button>
                )}
              </div>

              <div className="overflow-x-auto rounded-xl border border-white/20">
                <table className="w-full text-sm text-white text-left">
                  <thead>
                    <tr className="bg-white/10 text-xs uppercase">
                      <th className="px-3 py-2 text-white/60">Date</th>
                      <th className="px-3 py-2 text-white/60">Culte #</th>
                      <th className="px-3 py-2 text-blue-300">H</th>
                      <th className="px-3 py-2 text-pink-300">F</th>
                      <th className="px-3 py-2 text-orange-400">Total</th>
                      <th className="px-3 py-2 text-white/60">Évolution</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableRows.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-3 py-6 text-center text-white/40">
                          Aucune donnée pour ce filtre
                        </td>
                      </tr>
                    ) : (
                      tableRows.map((a) => {
                        const pctNum = parseFloat(a.pct);
                        const pctColor =
                          pctNum > 0 ? "#4ade80" : pctNum < 0 ? "#f87171" : "rgba(255,255,255,0.4)";
                        return (
                          <tr
                            key={`${a.date}_${a.numero_culte}`}
                            className="border-t border-white/10 hover:bg-white/5"
                          >
                            <td className="px-3 py-2">
                              {new Date(a.date).toLocaleDateString("fr-FR")}
                            </td>
                            <td className="px-3 py-2">{a.numero_culte || ""}</td>
                            <td className="px-3 py-2 text-blue-300">{a.hommes || ""}</td>
                            <td className="px-3 py-2 text-pink-300">{a.femmes || ""}</td>
                            <td className="px-3 py-2 text-orange-400 font-semibold">{a.total || ""}</td>
                            <td className="px-3 py-2">
                              {a.pct !== null ? (
                                <span style={{ color: pctColor, fontWeight: 500 }}>
                                  {pctNum > 0 ? "+" : ""}{a.pct}%
                                </span>
                              ) : ""}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      <Footer />
    </div>
  );
}
