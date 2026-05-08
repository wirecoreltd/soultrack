"use client";

import { useState, useEffect, useMemo } from "react";
import supabase from "../../lib/supabaseClient";
import HeaderPages from "../../components/HeaderPages";
import Footer from "../../components/Footer";
import ProtectedRoute from "../../components/ProtectedRoute";
import { CiviliteDonut, TranchesDonut } from "../../components/DonutCharts";
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

// ── composant principal ──────────────────────────────────────────────────────
function RapportPresence() {
  const [userProfile, setUserProfile] = useState(null);
  const [userRole,    setUserRole]    = useState(null);

  // listes de référence
  const [familles, setFamilles] = useState([]);
  const [cellules, setCellules] = useState([]);

  // mes cellules/familles (pour les responsables)
  const [mesCellules, setMesCellules] = useState([]); // cellules dont je suis responsable
  const [mesFamilles, setMesFamilles] = useState([]); // familles dont je suis responsable

  // filtres
  const [dateDebut,      setDateDebut]      = useState("");
  const [dateFin,        setDateFin]        = useState("");
  const [filterCellule,  setFilterCellule]  = useState(""); // id cellule sélectionnée
  const [filterFamille,  setFilterFamille]  = useState(""); // id famille sélectionnée

  // données brutes chargées
  // presencesRaw : [{membre_id, date, attendance_id, membres_complets:{sexe,age,cellule_id,famille_id}}]
  const [presencesRaw, setPresencesRaw] = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [message,      setMessage]      = useState("");
  const [activeTab,    setActiveTab]    = useState("evolution");

  // comparaison : voir plus
  const [showAllComp, setShowAllComp] = useState(false);

  // drill évolution
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

      // familles
      const { data: fa } = await supabase
        .from("familles")
        .select("id, famille, famille_full, eglise_id, responsable_id")
        .eq("eglise_id", egliseId);
      setFamilles(fa || []);

      // cellules (eglise_id parfois null → filtre côté client)
      const { data: ce } = await supabase
        .from("cellules")
        .select("id, cellule, cellule_full, eglise_id, responsable_id, superviseur_id");
      const ceOk = (ce || []).filter(c => c.eglise_id === egliseId);
      setCellules(ceOk);

      // restriction par rôle
      const uid  = profile.id;
      const role = profile.role;

      if (role === "ResponsableCellule") {
        const mine = ceOk.filter(c => c.responsable_id === uid);
        setMesCellules(mine);
        // auto-sélectionner la première si une seule
        if (mine.length === 1) setFilterCellule(mine[0].id);
      } else if (role === "ResponsableFamilles") {
        const mine = (fa || []).filter(f => f.responsable_id === uid);
        setMesFamilles(mine);
        if (mine.length === 1) setFilterFamille(mine[0].id);
      } else if (["SuperviseurCellule","SuperviseurFamille"].includes(role)) {
        const mine = ceOk.filter(c => c.superviseur_id === uid);
        setMesCellules(mine);
      }
      // Administrateur/ResponsableSuivi → voit tout, pas de restriction
    })();
  }, []);

  // ── listes visibles dans les selects selon rôle ──────────────────────────
  const cellulesSelect = useMemo(() => {
    if (userRole === "ResponsableCellule") return mesCellules;
    if (userRole === "SuperviseurCellule" || userRole === "SuperviseurFamille") return mesCellules;
    return cellules; // Admin voit tout
  }, [userRole, mesCellules, cellules]);

  const famillesSelect = useMemo(() => {
    if (userRole === "ResponsableFamilles") return mesFamilles;
    return familles; // Admin/autres voient tout
  }, [userRole, mesFamilles, familles]);

  // Doit-on afficher les selects ?
  const showCelluleSelect = !["ResponsableFamilles"].includes(userRole);
  const showFamilleSelect = !["ResponsableCellule", "SuperviseurCellule"].includes(userRole);

  // ── fetch ─────────────────────────────────────────────────────────────────
  const fetchRapport = async () => {
    if (!userProfile?.eglise_id) return;
    setLoading(true);
    setMessage("⏳ Chargement...");
    setPresencesRaw([]);
    setDrillMois(null);
    setDrillSemaine(null);
    setActiveTab("evolution");
    setShowAllComp(false);

    try {
      // 1. Récupérer les attendance_ids de cette église sur la période
      let aq = supabase
        .from("attendance")
        .select("id, date")
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

      // 2. Récupérer les presences liées à ces attendances
      //    avec join membres_complets pour sexe, age, cellule_id, famille_id
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

      // 3. Filtrer selon restriction rôle
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

  // ── presences filtrées par le select cellule/famille ─────────────────────
  const presencesFiltrees = useMemo(() => {
    let src = presencesRaw;
    if (filterCellule) {
      src = src.filter(p => p.membres_complets?.cellule_id === filterCellule);
    } else if (filterFamille) {
      src = src.filter(p => p.membres_complets?.famille_id === filterFamille);
    }
    return src;
  }, [presencesRaw, filterCellule, filterFamille]);

  // ── métriques principales ─────────────────────────────────────────────────
  // Dédoublonner par membre_id (un membre peut apparaître plusieurs fois sur la période)
  // pour les totaux on compte TOUTES les présences (pas unique par membre)
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

  // ── évolution par date ────────────────────────────────────────────────────
  // Grouper les presences par date pour avoir H/F par jour
  const presencesParDate = useMemo(() => {
    const map = {};
    presencesFiltrees.forEach(p => {
      if (!map[p.date]) map[p.date] = { date: p.date, hommes: 0, femmes: 0, total: 0 };
      map[p.date].total++;
      if (p.membres_complets?.sexe === "Homme") map[p.date].hommes++;
      else if (p.membres_complets?.sexe === "Femme") map[p.date].femmes++;
    });
    return Object.values(map).sort((a, b) => a.date.localeCompare(b.date));
  }, [presencesFiltrees]);

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

  // ── comparaison cellules ──────────────────────────────────────────────────
  const comparaisonCellules = useMemo(() => {
    const map = {};
    presencesRaw.forEach(p => {
      const cid = p.membres_complets?.cellule_id;
      if (!cid) return;
      if (!map[cid]) map[cid] = { id: cid, total: 0, hommes: 0, femmes: 0 };
      map[cid].total++;
      if (p.membres_complets?.sexe === "Homme") map[cid].hommes++;
      else if (p.membres_complets?.sexe === "Femme") map[cid].femmes++;
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
      if (!map[fid]) map[fid] = { id: fid, total: 0, hommes: 0, femmes: 0 };
      map[fid].total++;
      if (p.membres_complets?.sexe === "Homme") map[fid].hommes++;
      else if (p.membres_complets?.sexe === "Femme") map[fid].femmes++;
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

  const topCellules  = showAllComp ? comparaisonCellules  : comparaisonCellules.slice(0,15);
  const topFamilles  = showAllComp ? comparaisonFamilles  : comparaisonFamilles.slice(0,15);
  const hasMoreComp  = comparaisonCellules.length > 15 || comparaisonFamilles.length > 15;

  // bar chart comparaison cellules
  const barCellulesData = {
    labels: topCellules.map(c => c.label.length > 20 ? c.label.slice(0,18)+"…" : c.label),
    datasets: [
      { label:"Hommes", data:topCellules.map(c=>c.hommes), backgroundColor:"#3b82f6" },
      { label:"Femmes", data:topCellules.map(c=>c.femmes), backgroundColor:"#ec4899" },
    ],
  };
  const barFamillesData = {
    labels: topFamilles.map(f => f.label.length > 20 ? f.label.slice(0,18)+"…" : f.label),
    datasets: [
      { label:"Hommes", data:topFamilles.map(f=>f.hommes), backgroundColor:"#3b82f6" },
      { label:"Femmes", data:topFamilles.map(f=>f.femmes), backgroundColor:"#ec4899" },
    ],
  };
  const barOptions = {
    responsive: true, maintainAspectRatio: false, indexAxis: "y",
    plugins: { legend:{ labels:{ color:"#fff", font:{size:11} } } },
    scales: {
      x: { stacked:false, ticks:{color:"#fff"}, grid:{color:"rgba(255,255,255,0.08)"} },
      y: { ticks:{color:"#fff",font:{size:10}}, grid:{display:false} },
    },
  };

  // ── tableau détaillé ──────────────────────────────────────────────────────
  const tableRows = useMemo(() => {
    // regrouper par date
    const map = {};
    presencesFiltrees.forEach(p => {
      if (!map[p.date]) map[p.date] = { date: p.date, total: 0, hommes: 0, femmes: 0 };
      map[p.date].total++;
      if (p.membres_complets?.sexe === "Homme") map[p.date].hommes++;
      else if (p.membres_complets?.sexe === "Femme") map[p.date].femmes++;
    });
    const sorted = Object.values(map).sort((a, b) => a.date.localeCompare(b.date));
    return sorted.map((row, i) => {
      const prev = i > 0 ? sorted[i-1] : null;
      const pct  = prev && prev.total > 0
        ? (((row.total - prev.total) / prev.total) * 100).toFixed(1)
        : null;
      return { ...row, pct };
    });
  }, [presencesFiltrees]);

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

  // ── filtre affiché (label) ────────────────────────────────────────────────
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

        {/* Filtres cellule + famille — visibles après génération */}
        {hasData && (
          <div className="mt-4 pt-4 border-t border-white/20 flex flex-wrap gap-3 items-end">

            {/* Filtre Cellule */}
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

            {/* Filtre Famille */}
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

          {/* Filtre actif */}
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
              { key:"evolution",    label:"Évolution" },
              { key:"repartition",  label:"Répartition" },
              { key:"comparaison",  label:"Comparaison" },
              { key:"tableau",      label:"Tableau détaillé" },
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

              {/* Compteur centré */}
              <div className="flex justify-center mb-5">
                <div className="bg-white/10 border border-white/10 rounded-xl px-6 py-4 text-center">
                  <p className="text-xs text-white/50 mb-1">Total</p>
                  <p className="text-4xl font-bold text-white">{totalPresences}</p>
                  <p className="text-xs text-white/40 mt-1">
                    <span className="text-blue-300 font-semibold">{totalH} H</span>
                    {" · "}
                    <span className="text-pink-300 font-semibold">{totalF} F</span>
                  </p>
                </div>
              </div>

              {/* 2 donuts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                  <p className="text-white/80 text-sm font-semibold mb-4 text-center">Par civilité</p>
                  <div className="w-full" style={{ minHeight:260 }}>
                    <CiviliteDonut hommes={totalH} femmes={totalF} />
                  </div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                  <p className="text-white/80 text-sm font-semibold mb-4 text-center">Par tranche d'âge</p>
                  {tranchesData.length === 0 ? (
                    <div className="flex items-center justify-center" style={{ minHeight:260 }}>
                      <p className="text-white/30 text-xs text-center">Aucune tranche d'âge<br/>renseignée</p>
                    </div>
                  ) : (
                    <div className="w-full" style={{ minHeight:260 }}>
                      <TranchesDonut data={tranchesData} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── TAB COMPARAISON ── */}
          {activeTab === "comparaison" && (
            <div className="bg-white/10 border border-white/20 rounded-xl p-4 flex flex-col gap-6">
              <p className="text-white font-semibold">Comparaison des présences</p>

              {/* Cellules */}
              {comparaisonCellules.length > 0 && (
                <div>
                  <p className="text-white/70 text-sm font-medium mb-3 flex items-center gap-2">
                    <span className="text-amber-300"><IconCellule /></span>
                    Par cellule ({comparaisonCellules.length})
                  </p>
                  <div style={{ height: Math.max(200, topCellules.length * 32) }}>
                    <Bar data={barCellulesData} options={barOptions} />
                  </div>
                  {/* Tableau récap */}
                  <div className="mt-3 overflow-x-auto">
                    <table className="w-full text-xs text-white">
                      <thead>
                        <tr className="border-b border-white/10 text-white/40 uppercase">
                          <th className="py-1.5 pr-3 text-left">Cellule</th>
                          <th className="py-1.5 pr-3 text-blue-300">H</th>
                          <th className="py-1.5 pr-3 text-pink-300">F</th>
                          <th className="py-1.5 text-orange-400">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topCellules.map(c => (
                          <tr key={c.id} className="border-t border-white/10 hover:bg-white/5">
                            <td className="py-1.5 pr-3 text-white/80">{c.label}</td>
                            <td className="py-1.5 pr-3 text-blue-300">{c.hommes}</td>
                            <td className="py-1.5 pr-3 text-pink-300">{c.femmes}</td>
                            <td className="py-1.5 text-orange-400 font-semibold">{c.total}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Familles */}
              {comparaisonFamilles.length > 0 && (
                <div>
                  <p className="text-white/70 text-sm font-medium mb-3 flex items-center gap-2">
                    <span className="text-emerald-300"><IconFamille /></span>
                    Par famille ({comparaisonFamilles.length})
                  </p>
                  <div style={{ height: Math.max(200, topFamilles.length * 32) }}>
                    <Bar data={barFamillesData} options={barOptions} />
                  </div>
                  <div className="mt-3 overflow-x-auto">
                    <table className="w-full text-xs text-white">
                      <thead>
                        <tr className="border-b border-white/10 text-white/40 uppercase">
                          <th className="py-1.5 pr-3 text-left">Famille</th>
                          <th className="py-1.5 pr-3 text-blue-300">H</th>
                          <th className="py-1.5 pr-3 text-pink-300">F</th>
                          <th className="py-1.5 text-orange-400">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topFamilles.map(f => (
                          <tr key={f.id} className="border-t border-white/10 hover:bg-white/5">
                            <td className="py-1.5 pr-3 text-white/80">{f.label}</td>
                            <td className="py-1.5 pr-3 text-blue-300">{f.hommes}</td>
                            <td className="py-1.5 pr-3 text-pink-300">{f.femmes}</td>
                            <td className="py-1.5 text-orange-400 font-semibold">{f.total}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {comparaisonCellules.length === 0 && comparaisonFamilles.length === 0 && (
                <p className="text-white/40 text-sm text-center py-8">
                  Aucune donnée de comparaison disponible.<br/>
                  <span className="text-xs">Les présences doivent être rattachées à des membres avec cellule/famille.</span>
                </p>
              )}

              {/* Voir plus */}
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
                    <th className="px-3 py-2 text-blue-300">H</th>
                    <th className="px-3 py-2 text-pink-300">F</th>
                    <th className="px-3 py-2 text-orange-400">Total</th>
                    <th className="px-3 py-2 text-white/60">Évolution</th>
                  </tr>
                </thead>
                <tbody>
                  {tableRows.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-3 py-6 text-center text-white/40">Aucune donnée</td>
                    </tr>
                  ) : tableRows.map(row => {
                    const pn = parseFloat(row.pct);
                    const pc = pn > 0 ? "#4ade80" : pn < 0 ? "#f87171" : "rgba(255,255,255,0.4)";
                    return (
                      <tr key={row.date} className="border-t border-white/10 hover:bg-white/5">
                        <td className="px-3 py-2">{new Date(row.date).toLocaleDateString("fr-FR")}</td>
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
