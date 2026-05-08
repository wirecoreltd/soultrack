"use client";

import { useState, useEffect, useMemo } from "react";
import supabase from "../../lib/supabaseClient";
import HeaderPages from "../../components/HeaderPages";
import Footer from "../../components/Footer";
import ProtectedRoute from "../../components/ProtectedRoute";
import dynamic from "next/dynamic";

const Line = dynamic(
  () => import("react-chartjs-2").then(async (mod) => {
    const { Chart, CategoryScale, LinearScale, PointElement,
            LineElement, Title, Tooltip, Legend, Filler } = await import("chart.js");
    Chart.register(CategoryScale, LinearScale, PointElement,
                   LineElement, Title, Tooltip, Legend, Filler);
    return mod.Line;
  }),
  { ssr: false }
);

const Bar = dynamic(
  () => import("react-chartjs-2").then(async (mod) => {
    const { Chart, CategoryScale, LinearScale, BarElement,
            Title, Tooltip, Legend } = await import("chart.js");
    Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);
    return mod.Bar;
  }),
  { ssr: false }
);

// Doughnut chart inline (pas de dépendance externe)
const Doughnut = dynamic(
  () => import("react-chartjs-2").then(async (mod) => {
    const { Chart, ArcElement, Tooltip, Legend } = await import("chart.js");
    Chart.register(ArcElement, Tooltip, Legend);
    return mod.Doughnut;
  }),
  { ssr: false }
);

export default function RapportPresencePage() {
  return (
    <ProtectedRoute allowedRoles={[
      "Administrateur","ResponsableSuivi","SuperviseurCellule",
      "SuperviseurFamille","ResponsableCellule","ResponsableFamilles",
    ]}>
      <RapportPresence />
    </ProtectedRoute>
  );
}

// ── constantes ───────────────────────────────────────────────────────────────
const AGE_TRANCHES = [
  "Moins de 13 ans","13-17 ans","18-25 ans","26-30 ans",
  "31-40 ans","41-50 ans","51-60 ans","Plus de 60 ans","Non renseigné",
];

const normalizeAge = (age) => {
  const map = {
    "Moins de 13 ans":"Moins de 13 ans",
    "12-17 ans":"13-17 ans","13-17 ans":"13-17 ans",
    "18-25 ans":"18-25 ans","26-30 ans":"26-30 ans","31-40 ans":"31-40 ans",
    "41-55 ans":"41-50 ans","41-50 ans":"41-50 ans",
    "51-60 ans":"51-60 ans",
    "56-69 ans":"Plus de 60 ans","Plus de 60 ans":"Plus de 60 ans",
  };
  if (!age) return "Non renseigné";
  return map[age] || "Non renseigné";
};

const fmt      = (d) => `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}`;
const fmtMois  = (d) => {
  const M = ["Jan","Fév","Mar","Avr","Mai","Jun","Jul","Aoû","Sep","Oct","Nov","Déc"];
  return `${M[d.getMonth()]} ${d.getFullYear()}`;
};
const weekKey  = (d) => { const t=new Date(d); t.setHours(0,0,0,0); t.setDate(t.getDate()-t.getDay()+1); return t.toISOString().slice(0,10); };
const monthKey = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;

const IconFamille = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const IconCellule = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);

// ── Pie chart civilité inline ─────────────────────────────────────────────────
function CivilitePie({ hommes, femmes }) {
  const total = hommes + femmes;
  if (total === 0) return <p className="text-white/30 text-xs text-center">Aucune donnée</p>;

  const pctH = ((hommes / total) * 100).toFixed(1);
  const pctF = ((femmes / total) * 100).toFixed(1);

  const data = {
    labels: [`Hommes — ${hommes} (${pctH}%)`, `Femmes — ${femmes} (${pctF}%)`],
    datasets: [{
      data: [hommes, femmes],
      backgroundColor: ["#3b82f6", "#ec4899"],
      borderColor: ["#1d4ed8", "#be185d"],
      borderWidth: 2,
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "right",
        labels: {
          color: "#fff",
          font: { size: 12 },
          padding: 16,
          usePointStyle: true,
          pointStyleWidth: 12,
        },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${ctx.label}`,
        },
      },
    },
  };

  return (
    <div style={{ height: 220 }}>
      <Doughnut data={data} options={options} />
    </div>
  );
}

// ── Pie chart tranches d'âge inline ──────────────────────────────────────────
const AGE_COLORS = [
  "#f59e0b","#10b981","#3b82f6","#ec4899",
  "#8b5cf6","#06b6d4","#ef4444","#84cc16","#94a3b8",
];

function TranchePie({ data }) {
  if (!data || data.length === 0) return <p className="text-white/30 text-xs text-center">Aucune tranche d'âge renseignée</p>;

  const total = data.reduce((s, d) => s + d.count, 0);

  const chartData = {
    labels: data.map(d => `${d.tranche} — ${d.count} (${((d.count/total)*100).toFixed(1)}%)`),
    datasets: [{
      data: data.map(d => d.count),
      backgroundColor: data.map((_, i) => AGE_COLORS[i % AGE_COLORS.length]),
      borderColor: "rgba(255,255,255,0.15)",
      borderWidth: 1,
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "right",
        labels: {
          color: "#fff",
          font: { size: 11 },
          padding: 10,
          usePointStyle: true,
          pointStyleWidth: 10,
        },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${ctx.label}`,
        },
      },
    },
  };

  return (
    <div style={{ height: Math.max(220, data.length * 28) }}>
      <Doughnut data={chartData} options={options} />
    </div>
  );
}

// ── composant principal ──────────────────────────────────────────────────────
function RapportPresence() {
  const [userProfile, setUserProfile] = useState(null);
  const [userRole,    setUserRole]    = useState(null);

  const [familles, setFamilles] = useState([]);
  const [cellules, setCellules] = useState([]);
  const [mesCellules, setMesCellules] = useState([]);
  const [mesFamilles, setMesFamilles] = useState([]);

  const [dateDebut,      setDateDebut]      = useState("");
  const [dateFin,        setDateFin]        = useState("");
  const [filterCellule,  setFilterCellule]  = useState("");
  const [filterFamille,  setFilterFamille]  = useState("");

  const [presencesRaw, setPresencesRaw]   = useState([]);
  // MODIF : on stocke aussi les attendance pour regrouper
  const [attendanceMap, setAttendanceMap] = useState({}); // id → {date, typeTemps, numero_culte}

  const [loading,   setLoading]   = useState(false);
  const [message,   setMessage]   = useState("");
  const [activeTab, setActiveTab] = useState("evolution");

  const [showAllComp, setShowAllComp] = useState(false);

  const [evGranularity, setEvGranularity] = useState("auto");
  const [drillMois,     setDrillMois]     = useState(null);
  const [drillSemaine,  setDrillSemaine]  = useState(null);

  // ── init ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      if (!sess?.session?.user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("id, role, eglise_id, branche_id, superviseur_id")
        .eq("id", sess.session.user.id)
        .single();

      setUserProfile(profile);
      setUserRole(profile?.role);
      const egliseId = profile?.eglise_id;
      if (!egliseId) return;

      const { data: fa } = await supabase
        .from("familles")
        .select("id, famille, famille_full, eglise_id, responsable_id")
        .eq("eglise_id", egliseId);
      setFamilles(fa || []);

      const { data: ce } = await supabase
        .from("cellules")
        .select("id, cellule, cellule_full, eglise_id, responsable_id, superviseur_id");
      const ceOk = (ce || []).filter(c => c.eglise_id === egliseId);
      setCellules(ceOk);

      const uid  = profile.id;
      const role = profile.role;

      if (role === "ResponsableCellule") {
        const mine = ceOk.filter(c => c.responsable_id === uid);
        setMesCellules(mine);
        if (mine.length === 1) setFilterCellule(mine[0].id);
      } else if (role === "ResponsableFamilles") {
        const mine = (fa || []).filter(f => f.responsable_id === uid);
        setMesFamilles(mine);
        if (mine.length === 1) setFilterFamille(mine[0].id);
      } else if (["SuperviseurCellule","SuperviseurFamille"].includes(role)) {
        const mine = ceOk.filter(c => c.superviseur_id === uid);
        setMesCellules(mine);
      }
    })();
  }, []);

  const cellulesSelect = useMemo(() => {
    if (userRole === "ResponsableCellule") return mesCellules;
    if (userRole === "SuperviseurCellule" || userRole === "SuperviseurFamille") return mesCellules;
    return cellules;
  }, [userRole, mesCellules, cellules]);

  const famillesSelect = useMemo(() => {
    if (userRole === "ResponsableFamilles") return mesFamilles;
    return familles;
  }, [userRole, mesFamilles, familles]);

  const showCelluleSelect = !["ResponsableFamilles"].includes(userRole);
  const showFamilleSelect = !["ResponsableCellule", "SuperviseurCellule"].includes(userRole);

  // ── fetch ─────────────────────────────────────────────────────────────────
  const fetchRapport = async () => {
    if (!userProfile?.eglise_id) return;
    setLoading(true);
    setMessage("⏳ Chargement...");
    setPresencesRaw([]);
    setAttendanceMap({});
    setDrillMois(null);
    setDrillSemaine(null);
    setActiveTab("evolution");
    setShowAllComp(false);

    try {
      let aq = supabase
        .from("attendance")
        .select("id, date, typeTemps, numero_culte")
        .eq("eglise_id", userProfile.eglise_id);
      if (dateDebut) aq = aq.gte("date", dateDebut);
      if (dateFin)   aq = aq.lte("date", dateFin);
      const { data: attData, error: attErr } = await aq;
      if (attErr) throw attErr;

      const attIds = (attData || []).map(a => a.id);
      if (attIds.length === 0) {
        setMessage("Aucune session trouvée sur cette période.");
        setLoading(false);
        return;
      }

      // Construire la map attendance id → {date, typeTemps, numero_culte}
      const aMap = {};
      (attData || []).forEach(a => { aMap[a.id] = a; });
      setAttendanceMap(aMap);

      let pq = supabase
        .from("presences")
        .select(`
          id,
          membre_id,
          date,
          attendance_id,
          membres_complets (
            id,
            sexe,
            age,
            cellule_id,
            famille_id
          )
        `)
        .in("attendance_id", attIds);

      const { data: pData, error: pErr } = await pq;
      if (pErr) throw pErr;

      let filtered = pData || [];

      if (userRole === "ResponsableCellule" && mesCellules.length > 0) {
        const ids = new Set(mesCellules.map(c => c.id));
        filtered = filtered.filter(p => ids.has(p.membres_complets?.cellule_id));
      } else if (userRole === "ResponsableFamilles" && mesFamilles.length > 0) {
        const ids = new Set(mesFamilles.map(f => f.id));
        filtered = filtered.filter(p => ids.has(p.membres_complets?.famille_id));
      }

      setPresencesRaw(filtered);
      setMessage("");
    } catch (err) {
      console.error(err);
      setMessage("❌ Erreur lors du chargement : " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const presencesFiltrees = useMemo(() => {
    let src = presencesRaw;
    if (filterCellule) {
      src = src.filter(p => p.membres_complets?.cellule_id === filterCellule);
    } else if (filterFamille) {
      src = src.filter(p => p.membres_complets?.famille_id === filterFamille);
    }
    return src;
  }, [presencesRaw, filterCellule, filterFamille]);

  // ── REGROUPEMENT : sessions même date + même typeTemps + même numero_culte ─
  // On crée une clé de groupe pour chaque présence : "date|typeTemps|numero_culte"
  // Toutes les présences d'un même groupe sont fusionnées dans l'évolution/tableau
  const presencesAvecGroupe = useMemo(() => {
    return presencesFiltrees.map(p => {
      const att = attendanceMap[p.attendance_id];
      const groupKey = att
        ? `${att.date}|${att.typeTemps || ""}|${att.numero_culte || ""}`
        : `${p.date}||`;
      return { ...p, groupKey, attDate: att?.date || p.date };
    });
  }, [presencesFiltrees, attendanceMap]);

  // ── métriques ─────────────────────────────────────────────────────────────
  const totalPresences = presencesFiltrees.length;
  const totalH = presencesFiltrees.filter(p => p.membres_complets?.sexe === "Homme").length;
  const totalF = presencesFiltrees.filter(p => p.membres_complets?.sexe === "Femme").length;

  // ── tranches d'âge ────────────────────────────────────────────────────────
  const tranchesData = useMemo(() => {
    const counts = {};
    AGE_TRANCHES.forEach(t => { counts[t] = 0; });
    presencesFiltrees.forEach(p => {
      counts[normalizeAge(p.membres_complets?.age)]++;
    });
    return AGE_TRANCHES
      .map(t => ({ tranche: t, count: counts[t] }))
      .filter(t => t.count > 0);
  }, [presencesFiltrees]);

  // ── évolution : groupée par (date|typeTemps|numero_culte) ─────────────────
  const presencesParDate = useMemo(() => {
    // Regrouper par groupKey (fusionner les sessions du même type le même jour)
    const map = {};
    presencesAvecGroupe.forEach(p => {
      const k = p.groupKey;
      const d = p.attDate;
      if (!map[k]) map[k] = { date: d, hommes: 0, femmes: 0, total: 0 };
      map[k].total++;
      if (p.membres_complets?.sexe === "Homme") map[k].hommes++;
      else if (p.membres_complets?.sexe === "Femme") map[k].femmes++;
    });
    // Ensuite re-grouper par date (pour l'axe X de l'évolution)
    const byDate = {};
    Object.values(map).forEach(g => {
      if (!byDate[g.date]) byDate[g.date] = { date: g.date, hommes: 0, femmes: 0, total: 0 };
      byDate[g.date].hommes += g.hommes;
      byDate[g.date].femmes += g.femmes;
      byDate[g.date].total  += g.total;
    });
    return Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date));
  }, [presencesAvecGroupe]);

  const rangeDays = useMemo(() => {
    if (!dateDebut || !dateFin) return 0;
    return (new Date(dateFin) - new Date(dateDebut)) / 86400000;
  }, [dateDebut, dateFin]);

  const effectiveGran = useMemo(() => {
    if (drillSemaine) return "jour";
    if (drillMois)    return "semaine";
    if (evGranularity !== "auto") return evGranularity;
    return rangeDays > 31 ? "mois" : "jour";
  }, [evGranularity, rangeDays, drillMois, drillSemaine]);

  const dataDrill = useMemo(() => {
    let src = presencesParDate;
    if (drillSemaine) {
      const lu = new Date(drillSemaine), di = new Date(lu);
      di.setDate(di.getDate() + 6);
      src = src.filter(a => { const d = new Date(a.date); return d >= lu && d <= di; });
    } else if (drillMois) {
      src = src.filter(a => a.date.startsWith(drillMois));
    }
    return src;
  }, [presencesParDate, drillMois, drillSemaine]);

  const evGrouped = useMemo(() => {
    const map = {};
    dataDrill.forEach(a => {
      const d   = new Date(a.date);
      const k   = effectiveGran === "mois" ? monthKey(d) : effectiveGran === "semaine" ? weekKey(d) : a.date;
      if (!map[k]) map[k] = { key: k, hommes: 0, femmes: 0, total: 0 };
      map[k].hommes += a.hommes;
      map[k].femmes += a.femmes;
      map[k].total  += a.total;
    });
    return Object.values(map).sort((a, b) => a.key.localeCompare(b.key));
  }, [dataDrill, effectiveGran]);

  const evLabels = evGrouped.map(g => {
    if (effectiveGran === "mois") { const [y,m] = g.key.split("-"); return fmtMois(new Date(+y,+m-1,1)); }
    if (effectiveGran === "semaine") return `Sem. ${fmt(new Date(g.key))}`;
    return fmt(new Date(g.key));
  });

  const lineData = {
    labels: evLabels,
    datasets: [
      { label:"Hommes", data:evGrouped.map(g=>g.hommes), borderColor:"#3b82f6", backgroundColor:"rgba(59,130,246,0.12)", tension:0.4, pointRadius:4, borderWidth:2, fill:true },
      { label:"Femmes", data:evGrouped.map(g=>g.femmes), borderColor:"#ec4899", backgroundColor:"rgba(236,72,153,0.12)", tension:0.4, pointRadius:4, borderWidth:2, fill:true },
    ],
  };
  const lineOptions = {
    responsive: true, maintainAspectRatio: false,
    onClick: (_, els) => {
      if (!els.length) return;
      const g = evGrouped[els[0].index];
      if (effectiveGran === "mois")    { setDrillMois(g.key); setDrillSemaine(null); }
      if (effectiveGran === "semaine") setDrillSemaine(g.key);
    },
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { footer: effectiveGran !== "jour" ? () => "Cliquez pour zoomer" : undefined } },
    },
    scales: {
      y: { beginAtZero: true, ticks:{color:"#fff",font:{size:11}}, grid:{color:"rgba(255,255,255,0.08)"} },
      x: { ticks:{color:"#fff",font:{size:11},maxRotation:45,autoSkip:true,maxTicksLimit:14}, grid:{display:false} },
    },
  };

  // ── comparaison : total seulement ─────────────────────────────────────────
  const comparaisonCellules = useMemo(() => {
    const map = {};
    presencesRaw.forEach(p => {
      const cid = p.membres_complets?.cellule_id;
      if (!cid) return;
      if (!map[cid]) map[cid] = { id: cid, total: 0 };
      map[cid].total++;
    });
    return Object.values(map)
      .map(c => ({
        ...c,
        label: cellules.find(x => x.id === c.id)?.cellule_full
            || cellules.find(x => x.id === c.id)?.cellule
            || "Cellule inconnue",
      }))
      .sort((a, b) => b.total - a.total);
  }, [presencesRaw, cellules]);

  const comparaisonFamilles = useMemo(() => {
    const map = {};
    presencesRaw.forEach(p => {
      const fid = p.membres_complets?.famille_id;
      if (!fid) return;
      if (!map[fid]) map[fid] = { id: fid, total: 0 };
      map[fid].total++;
    });
    return Object.values(map)
      .map(f => ({
        ...f,
        label: familles.find(x => x.id === f.id)?.famille_full
            || familles.find(x => x.id === f.id)?.famille
            || "Famille inconnue",
      }))
      .sort((a, b) => b.total - a.total);
  }, [presencesRaw, familles]);

  const topCellules = showAllComp ? comparaisonCellules : comparaisonCellules.slice(0, 15);
  const topFamilles = showAllComp ? comparaisonFamilles : comparaisonFamilles.slice(0, 15);
  const hasMoreComp = comparaisonCellules.length > 15 || comparaisonFamilles.length > 15;

  const maxCellule = topCellules[0]?.total || 1;
  const maxFamille = topFamilles[0]?.total || 1;

  // ── tableau détaillé : groupé par (date + typeTemps + numero_culte) ───────
  const tableRows = useMemo(() => {
    // Grouper par groupKey
    const map = {};
    presencesAvecGroupe.forEach(p => {
      const k = p.groupKey;
      const att = attendanceMap[p.attendance_id];
      if (!map[k]) map[k] = {
        date: p.attDate,
        typeTemps: att?.typeTemps || "",
        numero_culte: att?.numero_culte || null,
        total: 0, hommes: 0, femmes: 0,
      };
      map[k].total++;
      if (p.membres_complets?.sexe === "Homme") map[k].hommes++;
      else if (p.membres_complets?.sexe === "Femme") map[k].femmes++;
    });
    const sorted = Object.values(map).sort((a, b) => a.date.localeCompare(b.date));
    return sorted.map((row, i) => {
      const prev = i > 0 ? sorted[i - 1] : null;
      const pct = prev && prev.total > 0
        ? (((row.total - prev.total) / prev.total) * 100).toFixed(1)
        : null;
      return { ...row, pct };
    });
  }, [presencesAvecGroupe, attendanceMap]);

  // ── granularité ───────────────────────────────────────────────────────────
  const GranBtns = () => {
    const back = drillSemaine ? () => setDrillSemaine(null) : drillMois ? () => setDrillMois(null) : null;
    return (
      <div className="flex items-center gap-2 flex-wrap mb-3">
        {back && (
          <button onClick={back} className="px-3 py-1 rounded-full text-xs border border-white/30 text-white/70 hover:border-white">
            ← Retour
          </button>
        )}
        {!drillMois && !drillSemaine && ["mois","semaine","jour"].map(g => (
          <button key={g} onClick={() => setEvGranularity(g)}
            className={`px-3 py-1 rounded-full text-xs border transition ${
              (evGranularity==="auto"?effectiveGran:evGranularity)===g
                ? "bg-emerald-400 text-white border-emerald-400"
                : "border-white/30 text-white/70 hover:border-white"
            }`}>
            {g.charAt(0).toUpperCase()+g.slice(1)}
          </button>
        ))}
        {drillMois && !drillSemaine && (
          <span className="text-white/60 text-xs">{fmtMois(new Date(drillMois+"-01"))} — cliquez une semaine</span>
        )}
        {drillSemaine && (
          <span className="text-white/60 text-xs">Semaine du {fmt(new Date(drillSemaine))}</span>
        )}
      </div>
    );
  };

  const filterLabel = useMemo(() => {
    if (filterCellule) {
      const c = cellules.find(x => x.id === filterCellule);
      return c ? `🏠 ${c.cellule_full || c.cellule}` : "";
    }
    if (filterFamille) {
      const f = familles.find(x => x.id === filterFamille);
      return f ? `👨‍👩‍👧 ${f.famille_full || f.famille}` : "";
    }
    return "Tout";
  }, [filterCellule, filterFamille, cellules, familles]);

  const hasData = presencesRaw.length > 0;

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-[#333699]">
      <HeaderPages />

      <h1 className="text-2xl font-bold mt-4 mb-2 text-center text-white">
        Rapport <span className="text-emerald-300">Présences</span>
      </h1>
      <p className="italic text-sm text-white/80 mb-6 text-center max-w-2xl">
        Analysez vos présences par période, cellule ou famille.
      </p>

      {/* ── FORMULAIRE ── */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 shadow-lg rounded-xl p-4 md:p-6 w-full max-w-2xl mx-auto text-white mb-6">
        <p className="text-sm font-semibold text-red-400 text-center mb-4">Choisissez les paramètres</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex flex-col">
            <label className="text-sm text-center mb-1">Date de Début</label>
            <input type="date" value={dateDebut} onChange={e => setDateDebut(e.target.value)}
              className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white"/>
          </div>
          <div className="flex flex-col">
            <label className="text-sm text-center mb-1">Date de Fin</label>
            <input type="date" value={dateFin} onChange={e => setDateFin(e.target.value)}
              className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white"/>
          </div>
        </div>

        <button onClick={fetchRapport} disabled={loading}
          className="w-full mt-4 h-10 bg-amber-300 text-white font-semibold rounded-lg hover:bg-amber-400 transition disabled:opacity-60">
          {loading ? "⏳ Chargement..." : "Générer"}
        </button>

        {hasData && (
          <div className="mt-4 pt-4 border-t border-white/20 flex flex-wrap gap-3 items-end">
            {showCelluleSelect && cellulesSelect.length > 0 && (
              <div className="flex flex-col flex-1 min-w-[160px]">
                <label className="text-xs text-white/60 mb-1 flex items-center gap-1">
                  <span className="text-amber-300"><IconCellule /></span> Cellule
                </label>
                <select
                  value={filterCellule}
                  onChange={e => { setFilterCellule(e.target.value); setFilterFamille(""); }}
                  className="border border-white/30 rounded-lg px-3 py-1.5 bg-white text-black text-sm"
                >
                  <option value="">Toutes les cellules</option>
                  {cellulesSelect.map(c => (
                    <option key={c.id} value={c.id}>{c.cellule_full || c.cellule}</option>
                  ))}
                </select>
              </div>
            )}

            {showFamilleSelect && famillesSelect.length > 0 && (
              <div className="flex flex-col flex-1 min-w-[160px]">
                <label className="text-xs text-white/60 mb-1 flex items-center gap-1">
                  <span className="text-emerald-300"><IconFamille /></span> Famille
                </label>
                <select
                  value={filterFamille}
                  onChange={e => { setFilterFamille(e.target.value); setFilterCellule(""); }}
                  className="border border-white/30 rounded-lg px-3 py-1.5 bg-white text-black text-sm"
                >
                  <option value="">Toutes les familles</option>
                  {famillesSelect.map(f => (
                    <option key={f.id} value={f.id}>{f.famille_full || f.famille}</option>
                  ))}
                </select>
              </div>
            )}

            {(filterCellule || filterFamille) && (
              <button
                onClick={() => { setFilterCellule(""); setFilterFamille(""); }}
                className="text-xs text-white/50 hover:text-white border border-white/20 rounded-lg px-3 py-1.5 self-end"
              >
                Réinitialiser
              </button>
            )}
          </div>
        )}
      </div>

      {message && <p className="text-white mb-4 text-center">{message}</p>}

      {hasData && (
        <div className="w-full max-w-4xl">

          {(filterCellule || filterFamille) && (
            <div className="mb-3 flex items-center gap-2">
              <span className="text-xs text-white/50">Filtre actif :</span>
              <span className="text-xs bg-white/20 text-white px-3 py-1 rounded-full font-medium">{filterLabel}</span>
            </div>
          )}

          {/* ── MÉTRIQUES ── */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { label:"Total présences", value:totalPresences.toLocaleString("fr-FR"), color:"text-white" },
              { label:"Hommes",          value:totalH,                                  color:"text-blue-300" },
              { label:"Femmes",          value:totalF,                                  color:"text-pink-300" },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-white/10 border border-white/20 rounded-xl p-3 text-center text-white">
                <p className="text-xs text-white/60 mb-1">{label}</p>
                <p className={`text-xl font-bold ${color}`}>{value}</p>
              </div>
            ))}
          </div>

          {/* ── ONGLETS ── */}
          <div className="flex gap-2 mb-4 flex-wrap">
            {[
              { key:"evolution",   label:"Évolution" },
              { key:"repartition", label:"Répartition" },
              { key:"comparaison", label:"Comparaison" },
              { key:"tableau",     label:"Tableau détaillé" },
            ].map(({ key, label }) => (
              <button key={key} onClick={() => setActiveTab(key)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition ${
                  activeTab === key
                    ? "bg-white text-[#333699] border-white"
                    : "border-white/30 text-white/70 hover:border-white"
                }`}>
                {label}
              </button>
            ))}
          </div>

          {/* ── TAB ÉVOLUTION ── */}
          {activeTab === "evolution" && (
            <div className="bg-white/10 border border-white/20 rounded-xl p-4">
              <p className="text-white font-semibold mb-2">Évolution des présences</p>
              <GranBtns />
              <div className="flex flex-wrap gap-3 mb-3 text-xs text-white/70">
                {[["Hommes","#3b82f6"],["Femmes","#ec4899"]].map(([l,c]) => (
                  <span key={l} className="flex items-center gap-1">
                    <span style={{ background:c }} className="w-3 h-3 rounded-sm inline-block"/>
                    {l}
                  </span>
                ))}
                {effectiveGran !== "jour" && (
                  <span className="text-white/40 ml-auto">💡 Cliquez pour zoomer</span>
                )}
              </div>
              <div style={{ height:280 }}>
                <Line data={lineData} options={lineOptions}/>
              </div>
            </div>
          )}

          {/* ── TAB RÉPARTITION ── */}
          {activeTab === "repartition" && (
            <div className="bg-white/10 border border-white/20 rounded-xl p-4">
              <p className="text-white font-semibold mb-4">Répartition des présences</p>

              {/* 2 donuts — sans carré total, sans légende externe */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                  <p className="text-white/80 text-sm font-semibold mb-4 text-center">Par civilité</p>
                  <CivilitePie hommes={totalH} femmes={totalF} />
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                  <p className="text-white/80 text-sm font-semibold mb-4 text-center">Par tranche d'âge</p>
                  <TranchePie data={tranchesData} />
                </div>
              </div>
            </div>
          )}

          {/* ── TAB COMPARAISON ── */}
          {activeTab === "comparaison" && (
            <div className="bg-white/10 border border-white/20 rounded-xl p-4 flex flex-col gap-6">
              <p className="text-white font-semibold">Comparaison des présences</p>

              {/* Cellules — barchart total uniquement */}
              {comparaisonCellules.length > 0 && (
                <div>
                  <p className="text-white/70 text-sm font-medium mb-4 flex items-center gap-2">
                    <span className="text-amber-300"><IconCellule /></span>
                    Par cellule ({comparaisonCellules.length})
                  </p>
                  <div className="flex flex-col gap-2">
                    {topCellules.map((c, i) => (
                      <div key={c.id} className="flex items-center gap-3">
                        <span className="text-white/40 text-xs w-4 text-right flex-shrink-0">{i + 1}</span>
                        <span className="text-white text-xs w-32 sm:w-48 truncate flex-shrink-0">{c.label}</span>
                        <div className="flex-1 bg-white/10 rounded-full h-5 overflow-hidden">
                          <div
                            className="h-5 rounded-full bg-amber-400 transition-all duration-500"
                            style={{ width: `${(c.total / maxCellule) * 100}%` }}
                          />
                        </div>
                        <span className="text-amber-300 font-bold text-sm w-8 text-right flex-shrink-0">{c.total}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Familles — barchart total uniquement */}
              {comparaisonFamilles.length > 0 && (
                <div>
                  <p className="text-white/70 text-sm font-medium mb-4 flex items-center gap-2">
                    <span className="text-emerald-300"><IconFamille /></span>
                    Par famille ({comparaisonFamilles.length})
                  </p>
                  <div className="flex flex-col gap-2">
                    {topFamilles.map((f, i) => (
                      <div key={f.id} className="flex items-center gap-3">
                        <span className="text-white/40 text-xs w-4 text-right flex-shrink-0">{i + 1}</span>
                        <span className="text-white text-xs w-32 sm:w-48 truncate flex-shrink-0">{f.label}</span>
                        <div className="flex-1 bg-white/10 rounded-full h-5 overflow-hidden">
                          <div
                            className="h-5 rounded-full bg-emerald-400 transition-all duration-500"
                            style={{ width: `${(f.total / maxFamille) * 100}%` }}
                          />
                        </div>
                        <span className="text-emerald-300 font-bold text-sm w-8 text-right flex-shrink-0">{f.total}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {comparaisonCellules.length === 0 && comparaisonFamilles.length === 0 && (
                <p className="text-white/40 text-sm text-center py-8">
                  Aucune donnée de comparaison disponible.<br/>
                  <span className="text-xs">Les présences doivent être rattachées à des membres avec cellule/famille.</span>
                </p>
              )}

              {hasMoreComp && (
                <div className="flex justify-center">
                  <button
                    onClick={() => setShowAllComp(v => !v)}
                    className="px-4 py-2 border border-white/30 text-white/70 hover:text-white hover:border-white rounded-full text-sm transition"
                  >
                    {showAllComp ? "Voir moins" : `Voir tout (${Math.max(comparaisonCellules.length, comparaisonFamilles.length)} entrées)`}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── TAB TABLEAU ── */}
          {activeTab === "tableau" && (
            <div className="overflow-x-auto rounded-xl border border-white/20">
              <table className="w-full text-sm text-white text-left">
                <thead>
                  <tr className="bg-white/10 text-xs uppercase">
                    <th className="px-3 py-2 text-white/60">Date</th>
                    <th className="px-3 py-2 text-white/60">Session</th>
                    <th className="px-3 py-2 text-blue-300">H</th>
                    <th className="px-3 py-2 text-pink-300">F</th>
                    <th className="px-3 py-2 text-orange-400">Total</th>
                    <th className="px-3 py-2 text-white/60">Évolution</th>
                  </tr>
                </thead>
                <tbody>
                  {tableRows.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-3 py-6 text-center text-white/40">Aucune donnée</td>
                    </tr>
                  ) : tableRows.map((row, idx) => {
                    const pn = parseFloat(row.pct);
                    const pc = pn > 0 ? "#4ade80" : pn < 0 ? "#f87171" : "rgba(255,255,255,0.4)";
                    const sessionLabel = [
                      row.typeTemps,
                      row.numero_culte ? `${row.numero_culte}${row.numero_culte === 1 ? "er" : "ème"} culte` : null,
                    ].filter(Boolean).join(" — ");
                    return (
                      <tr key={idx} className="border-t border-white/10 hover:bg-white/5">
                        <td className="px-3 py-2">{new Date(row.date).toLocaleDateString("fr-FR")}</td>
                        <td className="px-3 py-2 text-white/60 text-xs">{sessionLabel}</td>
                        <td className="px-3 py-2 text-blue-300">{row.hommes}</td>
                        <td className="px-3 py-2 text-pink-300">{row.femmes}</td>
                        <td className="px-3 py-2 text-orange-400 font-semibold">{row.total}</td>
                        <td className="px-3 py-2">
                          {row.pct !== null && (
                            <span style={{ color:pc, fontWeight:500 }}>
                              {pn > 0 ? "+" : ""}{row.pct}%
                            </span>
                          )}
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

      <Footer />
    </div>
  );
}
