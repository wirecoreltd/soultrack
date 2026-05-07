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
import { Line, Doughnut, Bar } from "react-chartjs-2";

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
        "ResponsableFamille",
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

const fmt = (d) =>
  `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;

const fmtMois = (d) => {
  const mois = ["Jan","Fév","Mar","Avr","Mai","Jun","Jul","Aoû","Sep","Oct","Nov","Déc"];
  return `${mois[d.getMonth()]} ${d.getFullYear()}`;
};

const weekKey = (d) => {
  const tmp = new Date(d);
  tmp.setHours(0,0,0,0);
  tmp.setDate(tmp.getDate() - tmp.getDay() + 1); // lundi
  return tmp.toISOString().slice(0,10);
};

const monthKey = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;

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

  const [brancheId, setBrancheId] = useState("");
  const [familleId, setFamilleId] = useState("");
  const [celluleId, setCelluleId] = useState("");

  // filtre tableau détaillé
  const [tblFamilleId, setTblFamilleId] = useState("");
  const [tblCelluleId, setTblCelluleId] = useState("");

  const [attendances, setAttendances] = useState([]);
  const [presences, setPresences]     = useState([]); // pour tranches d'âge
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("evolution");

  // drill-down évolution : "mois" | "semaine" | "jour"
  const [evGranularity, setEvGranularity] = useState("auto"); // auto | mois | semaine | jour
  const [drillMois, setDrillMois]   = useState(null); // "2026-04" cliqué
  const [drillSemaine, setDrillSemaine] = useState(null); // "2026-04-07" (lundi)

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

      const { data: br } = await supabase.from("branches").select("id, nom").eq("eglise_id", profile.eglise_id).order("nom");
      setBranches(br || []);

      const { data: fa } = await supabase.from("familles").select("id, nom, branche_id").eq("eglise_id", profile.eglise_id).order("nom");
      setFamilles(fa || []);

      const { data: ce } = await supabase.from("cellules").select("id, nom, famille_id, branche_id").eq("eglise_id", profile.eglise_id).order("nom");
      setCellules(ce || []);
    };
    init();
  }, []);

  const famillesFiltrees = brancheId ? familles.filter((f) => f.branche_id === brancheId) : familles;
  const cellulesFiltrees = familleId
    ? cellules.filter((c) => c.famille_id === familleId)
    : brancheId
    ? cellules.filter((c) => c.branche_id === brancheId)
    : cellules;

  // cellules filtrées pour le tableau détaillé
  const tblCellulesFiltrees = tblFamilleId
    ? cellules.filter((c) => c.famille_id === tblFamilleId)
    : cellules;

  const getVuesAccessibles = () => {
    if (!userRole) return [];
    if (userRole === "Administrateur") return ["eglise","branche","famille","cellule"];
    if (["SuperviseurCellule","SuperviseurFamille"].includes(userRole)) return ["branche","famille","cellule"];
    if (["ResponsableCellule","ResponsableFamille"].includes(userRole)) return ["famille","cellule"];
    return ["eglise"];
  };

  const vueLabels = { eglise:"Église globale", branche:"Par branche", famille:"Par famille", cellule:"Par cellule" };

  // ── fetch ────────────────────────────────────────────────────────────────
  const fetchRapport = async () => {
    setLoading(true);
    setMessage("⏳ Chargement...");
    setAttendances([]);
    setPresences([]);
    setDrillMois(null);
    setDrillSemaine(null);

    try {
      // --- attendance ---
      let q = supabase.from("attendance").select("*").order("date", { ascending: true });
      if (userProfile?.eglise_id) q = q.eq("eglise_id", userProfile.eglise_id);
      if (["SuperviseurCellule","SuperviseurFamille"].includes(userRole) && userProfile?.branche_id)
        q = q.eq("branche_id", userProfile.branche_id);
      if (["ResponsableCellule","ResponsableFamille"].includes(userRole) && userProfile?.id)
        q = q.eq("superviseur_id", userProfile.id);
      if (celluleId) q = q.eq("cellule_id", celluleId);
      else if (familleId) q = q.eq("famille_id", familleId);
      else if (brancheId) q = q.eq("branche_id", brancheId);
      if (dateDebut) q = q.gte("date", dateDebut);
      if (dateFin)   q = q.lte("date", dateFin);

      const { data, error } = await q;
      if (error) throw error;

      // regroup par date + numero_culte (pour évolution)
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

      // --- presences (pour tranches d'âge) ---
      let pq = supabase
        .from("presences")
        .select("id, membre_id, date, attendance_id")
        .order("date", { ascending: true });
      if (dateDebut) pq = pq.gte("date", dateDebut);
      if (dateFin)   pq = pq.lte("date", dateFin);

      const { data: pdata } = await pq;
      setPresences(pdata || []);

      setMessage("");
    } catch (err) {
      console.error(err);
      setMessage("❌ Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  // ── métriques globales ───────────────────────────────────────────────────
  const totalH = attendances.reduce((s, a) => s + (a.hommes || 0), 0);
  const totalF = attendances.reduce((s, a) => s + (a.femmes || 0), 0);
  const totalPresences = totalH + totalF;

  // ── évolution — logique granularité ──────────────────────────────────────
  const rangeDays = useMemo(() => {
    if (!dateDebut || !dateFin) return 0;
    return (new Date(dateFin) - new Date(dateDebut)) / 86400000;
  }, [dateDebut, dateFin]);

  const effectiveGranularity = useMemo(() => {
    if (drillSemaine) return "jour";
    if (drillMois)    return "semaine";
    if (evGranularity !== "auto") return evGranularity;
    return rangeDays > 31 ? "mois" : "jour";
  }, [evGranularity, rangeDays, drillMois, drillSemaine]);

  // données filtrées pour drill
  const attendancesDrill = useMemo(() => {
    let src = attendances;
    if (drillSemaine) {
      const lundi = new Date(drillSemaine);
      const dimanche = new Date(lundi); dimanche.setDate(dimanche.getDate() + 6);
      src = src.filter(a => {
        const d = new Date(a.date);
        return d >= lundi && d <= dimanche;
      });
    } else if (drillMois) {
      src = src.filter(a => a.date.startsWith(drillMois));
    }
    return src;
  }, [attendances, drillMois, drillSemaine]);

  // agréger selon granularité
  const evGrouped = useMemo(() => {
    const map = {};
    attendancesDrill.forEach(a => {
      const d = new Date(a.date);
      let key;
      if (effectiveGranularity === "mois")    key = monthKey(d);
      else if (effectiveGranularity === "semaine") key = weekKey(d);
      else key = a.date;

      if (!map[key]) map[key] = { key, hommes: 0, femmes: 0 };
      map[key].hommes += (a.hommes || 0);
      map[key].femmes += (a.femmes || 0);
    });
    return Object.values(map).sort((a,b) => a.key.localeCompare(b.key));
  }, [attendancesDrill, effectiveGranularity]);

  const evLabels = evGrouped.map(g => {
    if (effectiveGranularity === "mois") {
      const [y,m] = g.key.split("-");
      return fmtMois(new Date(+y, +m-1, 1));
    }
    if (effectiveGranularity === "semaine") {
      const d = new Date(g.key);
      return `Sem. ${fmt(d)}`;
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
      { label:"Hommes", data: evGrouped.map(g=>g.hommes), borderColor:"#3b82f6", backgroundColor:"rgba(59,130,246,0.12)", tension:0.4, pointRadius:4, borderWidth:2, fill:true },
      { label:"Femmes", data: evGrouped.map(g=>g.femmes), borderColor:"#ec4899", backgroundColor:"rgba(236,72,153,0.12)", tension:0.4, pointRadius:4, borderWidth:2, fill:true },
    ],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    onClick: (_,elements) => handleEvBarClick(elements),
    plugins: { legend:{ display:false }, tooltip:{ callbacks:{ footer: effectiveGranularity !== "jour" ? ()=>"Cliquez pour zoomer" : undefined }}},
    scales: {
      y: { beginAtZero:false, ticks:{ color:"#fff", font:{size:11} }, grid:{ color:"rgba(255,255,255,0.08)" }},
      x: { ticks:{ color:"#fff", font:{size:11}, maxRotation:45, autoSkip:true, maxTicksLimit:14 }, grid:{ display:false }},
    },
  };

  // ── répartition civilité ─────────────────────────────────────────────────
  const civiliteData = {
    labels: ["Hommes","Femmes"],
    datasets: [{ data:[totalH,totalF], backgroundColor:["#3b82f6","#ec4899"], borderWidth:0 }],
  };
  const doughnutOptions = {
    responsive:true, maintainAspectRatio:false,
    plugins:{ legend:{ position:"bottom", labels:{ color:"#fff", font:{size:11}, boxWidth:10, padding:10 }}},
  };

  // ── tableau détaillé ─────────────────────────────────────────────────────
  // on re-group attendance brut (pas encore regroupé) par date+culte+famille+cellule
  // puis on filtre par tblFamilleId / tblCelluleId
  const rawAttendanceForTable = useMemo(() => {
    // attendances déjà regroupés par date+culte au niveau global
    // Pour le tableau on veut filtrer par famille/cellule du tableau
    // On re-group après filtre
    return attendances; // attendances is already grouped globally — refine below
  }, [attendances]);

  // NOTE: `attendances` state already has famille_id / cellule_id from the first row of each group.
  // For per-famille/cellule filtering we need the raw data — stored separately.
  // We'll do a second pass from the raw grouped data filtered:
  const tableRows = useMemo(() => {
    // filter by tblFamilleId / tblCelluleId
    // attendances already grouped globally; re-filter by fields on records
    let src = attendances;
    if (tblCelluleId) src = src.filter(a => a.cellule_id === tblCelluleId);
    else if (tblFamilleId) src = src.filter(a => a.famille_id === tblFamilleId);

    // re-group by date + numero_culte after filter
    const grouped = {};
    src.forEach(a => {
      const key = `${a.date}_${a.numero_culte || ""}`;
      if (!grouped[key]) grouped[key] = { ...a };
      else {
        grouped[key].hommes = (grouped[key].hommes || 0) + (a.hommes || 0);
        grouped[key].femmes = (grouped[key].femmes || 0) + (a.femmes || 0);
      }
    });

    const sorted = Object.values(grouped).sort((a,b) => a.date.localeCompare(b.date));
    return sorted.map((a, i) => {
      const total = (a.hommes||0) + (a.femmes||0);
      const prev = i > 0 ? sorted[i-1] : null;
      const prevTotal = prev ? (prev.hommes||0)+(prev.femmes||0) : null;
      const pct = prevTotal && prevTotal > 0 ? (((total-prevTotal)/prevTotal)*100).toFixed(1) : null;
      return { ...a, total, pct };
    });
  }, [attendances, tblFamilleId, tblCelluleId]);

  // ── tranches d'âge ───────────────────────────────────────────────────────
  const [membres, setMembres] = useState([]);
  useEffect(() => {
    if (!userProfile?.eglise_id) return;
    supabase
      .from("membres_complets")
      .select("id, age, sexe")
      .eq("eglise_id", userProfile.eglise_id)
      .then(({ data }) => setMembres(data || []));
  }, [userProfile]);

  const tranchesData = useMemo(() => {
    // membre IDs présents dans les presences filtrées
    const presentIds = new Set(presences.map(p => p.membre_id));
    const membresPresents = membres.filter(m => presentIds.has(m.id));

    const counts = {};
    AGE_TRANCHES.forEach(t => { counts[t] = { total: 0, hommes: 0, femmes: 0 }; });

    membresPresents.forEach(m => {
      const t = m.age || "Non renseigné";
      const bucket = AGE_TRANCHES.includes(t) ? t : "Non renseigné";
      counts[bucket].total++;
      if (m.sexe === "Homme") counts[bucket].hommes++;
      else if (m.sexe === "Femme") counts[bucket].femmes++;
    });

    return AGE_TRANCHES.map(t => ({ tranche: t, ...counts[t] }));
  }, [presences, membres]);

  const tranchesBarData = {
    labels: tranchesData.map(t => t.tranche),
    datasets: [
      { label:"Hommes", data: tranchesData.map(t=>t.hommes), backgroundColor:"#3b82f6" },
      { label:"Femmes", data: tranchesData.map(t=>t.femmes), backgroundColor:"#ec4899" },
    ],
  };

  const barOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend:{ labels:{ color:"#fff", font:{size:11} }}},
    scales: {
      y: { beginAtZero:true, ticks:{ color:"#fff" }, grid:{ color:"rgba(255,255,255,0.08)" }},
      x: { ticks:{ color:"#fff", font:{size:10}, maxRotation:30 }, grid:{ display:false }},
    },
  };

  const vuesAccessibles = getVuesAccessibles();

  // ── granularity buttons ──────────────────────────────────────────────────
  const granularityBtns = () => {
    const back = drillSemaine
      ? () => { setDrillSemaine(null); }
      : drillMois
      ? () => { setDrillMois(null); }
      : null;

    return (
      <div className="flex items-center gap-2 flex-wrap mb-3">
        {back && (
          <button onClick={back} className="px-3 py-1 rounded-full text-xs border border-white/30 text-white/70 hover:border-white flex items-center gap-1">
            ← Retour
          </button>
        )}
        {!drillMois && !drillSemaine && (["mois","semaine","jour"]).map(g => (
          <button
            key={g}
            onClick={() => setEvGranularity(g)}
            className={`px-3 py-1 rounded-full text-xs border transition ${
              (evGranularity === "auto" ? effectiveGranularity : evGranularity) === g
                ? "bg-emerald-400 text-white border-emerald-400"
                : "border-white/30 text-white/70 hover:border-white"
            }`}
          >
            {g.charAt(0).toUpperCase()+g.slice(1)}
          </button>
        ))}
        {drillMois && !drillSemaine && (
          <span className="text-white/60 text-xs">
            {fmtMois(new Date(drillMois+"-01"))} — cliquez une semaine pour zoomer
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
                  vue === v ? "bg-emerald-400 text-white border-emerald-400" : "border-white/30 text-white/70 hover:border-white"
                }`}
              >
                {vueLabels[v]}
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {["branche","famille","cellule"].includes(vue) && (
            <div className="flex flex-col">
              <label className="text-sm text-center mb-1">Branche</label>
              <select value={brancheId} onChange={(e) => { setBrancheId(e.target.value); setFamilleId(""); setCelluleId(""); }}
                className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white">
                <option value="">Toutes les branches</option>
                {branches.map((b) => <option key={b.id} value={b.id}>{b.nom}</option>)}
              </select>
            </div>
          )}

          {["famille","cellule"].includes(vue) && (
            <div className="flex flex-col">
              <label className="text-sm text-center mb-1">Famille</label>
              <select value={familleId} onChange={(e) => { setFamilleId(e.target.value); setCelluleId(""); }}
                className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white">
                <option value="">Toutes les familles</option>
                {famillesFiltrees.map((f) => <option key={f.id} value={f.id}>{f.nom}</option>)}
              </select>
            </div>
          )}

          {vue === "cellule" && (
            <div className="flex flex-col">
              <label className="text-sm text-center mb-1">Cellule</label>
              <select value={celluleId} onChange={(e) => setCelluleId(e.target.value)}
                className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white">
                <option value="">Toutes les cellules</option>
                {cellulesFiltrees.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
              </select>
            </div>
          )}

          <div className="flex flex-col">
            <label className="text-sm text-center mb-1">Date de Début</label>
            <input type="date" value={dateDebut} onChange={(e) => setDateDebut(e.target.value)}
              className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white" />
          </div>
          <div className="flex flex-col">
            <label className="text-sm text-center mb-1">Date de Fin</label>
            <input type="date" value={dateFin} onChange={(e) => setDateFin(e.target.value)}
              className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white" />
          </div>
        </div>

        <button onClick={fetchRapport} disabled={loading}
          className="w-full mt-4 h-10 bg-amber-300 text-white font-semibold rounded-lg hover:bg-amber-400 transition disabled:opacity-60">
          {loading ? "⏳ Chargement..." : "Générer"}
        </button>
      </div>

      {message && <p className="text-white mb-4">{message}</p>}

      {attendances.length > 0 && (
        <div className="w-full max-w-4xl">

          {/* MÉTRIQUES */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { label:"Total présences", value: totalPresences.toLocaleString("fr-FR"), color:"text-white" },
              { label:"Hommes",          value: totalH,  color:"text-blue-300" },
              { label:"Femmes",          value: totalF,  color:"text-pink-300" },
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
              { key:"evolution",  label:"Évolution" },
              { key:"repartition",label:"Répartition" },
              { key:"tableau",    label:"Tableau détaillé" },
              { key:"tranches",   label:"Tranches d'âge" },
            ].map(({ key, label }) => (
              <button key={key} onClick={() => setActiveTab(key)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition ${
                  activeTab === key ? "bg-white text-[#333699] border-white" : "border-white/30 text-white/70 hover:border-white"
                }`}>
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
                {[["Hommes","#3b82f6"],["Femmes","#ec4899"]].map(([l,c]) => (
                  <span key={l} className="flex items-center gap-1">
                    <span style={{ background:c }} className="w-3 h-3 rounded-sm inline-block"></span>{l}
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

          {/* ── TAB RÉPARTITION ── */}
          {activeTab === "repartition" && (
            <div className="flex justify-center">
              <div className="bg-white/10 border border-white/20 rounded-xl p-4 w-full max-w-sm">
                <p className="text-white font-semibold mb-3">Par civilité</p>
                <div style={{ height: 200 }}>
                  <Doughnut data={civiliteData} options={doughnutOptions} />
                </div>
              </div>
            </div>
          )}

          {/* ── TAB TABLEAU DÉTAILLÉ ── */}
          {activeTab === "tableau" && (
            <div>
              {/* Filtres tableau */}
              <div className="flex flex-wrap gap-3 mb-3 items-end">
                <div className="flex flex-col">
                  <label className="text-xs text-white/60 mb-1">Filtrer par famille</label>
                  <select value={tblFamilleId}
                    onChange={(e) => { setTblFamilleId(e.target.value); setTblCelluleId(""); }}
                    className="border border-gray-400 rounded-lg px-3 py-1.5 bg-white/10 text-white text-sm">
                    <option value="">Toutes les familles</option>
                    {familles.map(f => <option key={f.id} value={f.id}>{f.nom}</option>)}
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className="text-xs text-white/60 mb-1">Filtrer par cellule</label>
                  <select value={tblCelluleId} onChange={(e) => setTblCelluleId(e.target.value)}
                    className="border border-gray-400 rounded-lg px-3 py-1.5 bg-white/10 text-white text-sm">
                    <option value="">Toutes les cellules</option>
                    {tblCellulesFiltrees.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
                  </select>
                </div>
                {(tblFamilleId || tblCelluleId) && (
                  <button onClick={() => { setTblFamilleId(""); setTblCelluleId(""); }}
                    className="text-xs text-white/50 hover:text-white border border-white/20 rounded-lg px-3 py-1.5">
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
                      <tr><td colSpan={6} className="px-3 py-6 text-center text-white/40">Aucune donnée pour ce filtre</td></tr>
                    ) : tableRows.map((a) => {
                      const pctNum = parseFloat(a.pct);
                      const pctColor = pctNum > 0 ? "#4ade80" : pctNum < 0 ? "#f87171" : "rgba(255,255,255,0.4)";
                      return (
                        <tr key={`${a.date}_${a.numero_culte}`} className="border-t border-white/10 hover:bg-white/5">
                          <td className="px-3 py-2">{new Date(a.date).toLocaleDateString("fr-FR")}</td>
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
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── TAB TRANCHES D'ÂGE ── */}
          {activeTab === "tranches" && (
            <div className="bg-white/10 border border-white/20 rounded-xl p-4">
              <p className="text-white font-semibold mb-4">Répartition par tranche d'âge</p>

              {presences.length === 0 ? (
                <p className="text-white/50 text-sm text-center py-8">
                  Aucune donnée de présences individuelles disponible pour cette période.<br/>
                  <span className="text-xs">(La table presences doit être alimentée)</span>
                </p>
              ) : (
                <>
                  <div style={{ height: 260 }}>
                    <Bar data={tranchesBarData} options={barOptions} />
                  </div>

                  {/* tableau récapitulatif tranches */}
                  <div className="mt-4 overflow-x-auto">
                    <table className="w-full text-sm text-white text-left">
                      <thead>
                        <tr className="text-xs uppercase text-white/50 border-b border-white/10">
                          <th className="py-2 pr-4">Tranche</th>
                          <th className="py-2 pr-4 text-blue-300">H</th>
                          <th className="py-2 pr-4 text-pink-300">F</th>
                          <th className="py-2 text-orange-400">Total</th>
                          <th className="py-2 text-white/40">%</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tranchesData.filter(t => t.total > 0).map(t => {
                          const totalGlobal = tranchesData.reduce((s,x)=>s+x.total,0);
                          return (
                            <tr key={t.tranche} className="border-t border-white/10 hover:bg-white/5">
                              <td className="py-1.5 pr-4">{t.tranche}</td>
                              <td className="py-1.5 pr-4 text-blue-300">{t.hommes}</td>
                              <td className="py-1.5 pr-4 text-pink-300">{t.femmes}</td>
                              <td className="py-1.5 text-orange-400 font-semibold">{t.total}</td>
                              <td className="py-1.5 text-white/50 text-xs">
                                {totalGlobal > 0 ? ((t.total/totalGlobal)*100).toFixed(1) : 0}%
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          )}

        </div>
      )}

      <Footer />
    </div>
  );
}
