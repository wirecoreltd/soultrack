"use client";

import { useState, useEffect, useMemo } from "react";
import supabase from "../lib/supabaseClient";
import HeaderPages from "../components/HeaderPages";
import Footer from "../components/Footer";
import ProtectedRoute from "../components/ProtectedRoute";
import { CiviliteDonut, TranchesDonut } from "../components/DonutCharts";
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Legend, Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Legend, Filler
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
const fmtMois  = (d) => { const M=["Jan","Fév","Mar","Avr","Mai","Jun","Jul","Aoû","Sep","Oct","Nov","Déc"]; return `${M[d.getMonth()]} ${d.getFullYear()}`; };
const weekKey  = (d) => { const t=new Date(d); t.setHours(0,0,0,0); t.setDate(t.getDate()-t.getDay()+1); return t.toISOString().slice(0,10); };
const monthKey = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;

const IconCellule = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);

// ── composant principal ──────────────────────────────────────────────────────
function RapportPresence() {
  const [userProfile, setUserProfile] = useState(null);

  const [familles, setFamilles] = useState([]);
  const [cellules, setCellules] = useState([]);
  const [membres,  setMembres]  = useState([]);

  const [allowedCelluleIds, setAllowedCelluleIds] = useState(null);
  const [allowedFamilleIds, setAllowedFamilleIds] = useState(null);

  // filtres formulaire génération
  const [selCelluleId, setSelCelluleId] = useState("");
  const [dateDebut,    setDateDebut]    = useState("");
  const [dateFin,      setDateFin]      = useState("");

  // filtre global unique — affiché après génération, s'applique à tout
  // "" = Tout | "cellule:<id>" | "famille:<id>"
  const [globalFilter, setGlobalFilter] = useState("");

  // données
  const [attendances, setAttendances] = useState([]);
  const [presences,   setPresences]   = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [message,     setMessage]     = useState("");
  const [activeTab,   setActiveTab]   = useState("evolution");

  // drill évolution
  const [evGranularity, setEvGranularity] = useState("auto");
  const [drillMois,     setDrillMois]     = useState(null);
  const [drillSemaine,  setDrillSemaine]  = useState(null);

  // dérivés filtre global
  const globalCelluleId = globalFilter.startsWith("cellule:") ? globalFilter.slice(8) : "";
  const globalFamilleId = globalFilter.startsWith("famille:") ? globalFilter.slice(8) : "";

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
      const egliseId = profile?.eglise_id;
      if (!egliseId) return;

      const { data: fa } = await supabase
        .from("familles")
        .select("id, famille, famille_full, eglise_id, responsable_id, branche_id")
        .eq("eglise_id", egliseId);
      setFamilles(fa || []);

      const { data: ce } = await supabase
        .from("cellules")
        .select("id, cellule, cellule_full, eglise_id, branche_id, responsable_id, superviseur_id");
      const ceFiltered = (ce || []).filter((c) => c.eglise_id === egliseId);
      setCellules(ceFiltered);

      const { data: mb } = await supabase
        .from("membres_complets")
        .select("id, age, sexe, cellule_id, famille_id, eglise_id")
        .eq("eglise_id", egliseId);
      setMembres(mb || []);

      const uid  = profile.id;
      const role = profile.role;

      if (role === "ResponsableCellule") {
        const ids = ceFiltered.filter((c) => c.responsable_id === uid).map((c) => c.id);
        setAllowedCelluleIds(ids);
        setAllowedFamilleIds(null);
      } else if (role === "ResponsableFamilles") {
        const ids = (fa || []).filter((f) => f.responsable_id === uid).map((f) => f.id);
        setAllowedFamilleIds(ids);
        setAllowedCelluleIds(null);
      } else if (["SuperviseurCellule","SuperviseurFamille"].includes(role)) {
        const ids = ceFiltered.filter((c) => c.superviseur_id === uid).map((c) => c.id);
        setAllowedCelluleIds(ids.length > 0 ? ids : null);
        setAllowedFamilleIds(null);
      } else {
        setAllowedCelluleIds(null);
        setAllowedFamilleIds(null);
      }
    })();
  }, []);

  // ── listes visibles selon rôle ────────────────────────────────────────────
  const cellulesVisibles = useMemo(() => {
    if (!allowedCelluleIds) return cellules;
    return cellules.filter((c) => allowedCelluleIds.includes(c.id));
  }, [cellules, allowedCelluleIds]);

  const famillesVisibles = useMemo(() => {
    if (!allowedFamilleIds) return familles;
    return familles.filter((f) => allowedFamilleIds.includes(f.id));
  }, [familles, allowedFamilleIds]);

  // ── fetch ─────────────────────────────────────────────────────────────────
  const fetchRapport = async () => {
    if (!userProfile?.eglise_id) return;
    setLoading(true);
    setMessage("⏳ Chargement...");
    setAttendances([]);
    setPresences([]);
    setGlobalFilter("");
    setDrillMois(null);
    setDrillSemaine(null);
    setActiveTab("evolution");

    try {
      let q = supabase
        .from("attendance")
        .select("*")
        .eq("eglise_id", userProfile.eglise_id)
        .order("date", { ascending: true });

      if (selCelluleId) q = q.eq("cellule_id", selCelluleId);
      if (dateDebut)    q = q.gte("date", dateDebut);
      if (dateFin)      q = q.lte("date", dateFin);

      const { data, error } = await q;
      if (error) throw error;

      const grp = {};
      (data || []).forEach((a) => {
        const k = `${a.date}_${a.numero_culte||""}`;
        if (!grp[k]) grp[k] = { ...a };
        else {
          grp[k].hommes = (grp[k].hommes||0) + (a.hommes||0);
          grp[k].femmes = (grp[k].femmes||0) + (a.femmes||0);
        }
      });
      setAttendances(Object.values(grp));

      const attIds = (data||[]).map((a) => a.id);
      if (attIds.length > 0) {
        let pq = supabase
          .from("presences")
          .select("id, membre_id, attendance_id, date")
          .in("attendance_id", attIds);
        if (dateDebut) pq = pq.gte("date", dateDebut);
        if (dateFin)   pq = pq.lte("date", dateFin);
        const { data: pd } = await pq;
        setPresences(pd || []);
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

  // ── attendances filtrées par filtre global ────────────────────────────────
  // filtre cellule → filtre direct sur attendance.cellule_id
  // filtre famille → pas de lien direct sur attendance, on filtre via membres
  const attendancesFiltered = useMemo(() => {
    if (!globalFilter) return attendances;
    if (globalCelluleId) {
      return attendances.filter((a) => a.cellule_id === globalCelluleId);
    }
    // famille : on garde toutes les attendances, la répartition filtre via membres
    return attendances;
  }, [attendances, globalFilter, globalCelluleId]);

  // ── métriques globales ────────────────────────────────────────────────────
  const totalH         = attendancesFiltered.reduce((s,a) => s+(a.hommes||0), 0);
  const totalF         = attendancesFiltered.reduce((s,a) => s+(a.femmes||0), 0);
  const totalPresences = totalH + totalF;

  // ── membres présents ──────────────────────────────────────────────────────
  const presentMemberIds = useMemo(
    () => new Set(presences.map((p) => p.membre_id)),
    [presences]
  );

  // membres filtrés selon rôle + filtre global
  // cas possibles : cellule_id seul, famille_id seul, les deux, aucun
  const membresRep = useMemo(() => {
    let src = membres;

    // restriction rôle
    if (allowedCelluleIds) {
      src = src.filter((m) => allowedCelluleIds.includes(m.cellule_id));
    } else if (allowedFamilleIds) {
      src = src.filter((m) => allowedFamilleIds.includes(m.famille_id));
    }

    // filtre global : cellule OU famille, indépendamment
    if (globalCelluleId) {
      src = src.filter((m) => m.cellule_id === globalCelluleId);
    } else if (globalFamilleId) {
      src = src.filter((m) => m.famille_id === globalFamilleId);
    }

    return src;
  }, [membres, allowedCelluleIds, allowedFamilleIds, globalCelluleId, globalFamilleId]);

  const membresPresentsRep = useMemo(() => {
    if (presentMemberIds.size > 0)
      return membresRep.filter((m) => presentMemberIds.has(m.id));
    return membresRep;
  }, [membresRep, presentMemberIds]);

  const dispH     = globalFilter
    ? membresPresentsRep.filter((m) => m.sexe === "Homme").length
    : totalH;
  const dispF     = globalFilter
    ? membresPresentsRep.filter((m) => m.sexe === "Femme").length
    : totalF;
  const dispTotal = globalFilter ? membresPresentsRep.length : totalPresences;

  // tranches d'âge — sans tableau récap
  const tranchesData = useMemo(() => {
    const counts = {};
    AGE_TRANCHES.forEach((t) => { counts[t] = 0; });
    membresPresentsRep.forEach((m) => { counts[normalizeAge(m.age)]++; });
    return AGE_TRANCHES
      .map((t) => ({ tranche: t, count: counts[t] }))
      .filter((t) => t.count > 0);
  }, [membresPresentsRep]);

  // ── évolution ─────────────────────────────────────────────────────────────
  const rangeDays = useMemo(() => {
    if (!dateDebut||!dateFin) return 0;
    return (new Date(dateFin) - new Date(dateDebut)) / 86400000;
  }, [dateDebut, dateFin]);

  const effectiveGran = useMemo(() => {
    if (drillSemaine) return "jour";
    if (drillMois)    return "semaine";
    if (evGranularity !== "auto") return evGranularity;
    return rangeDays > 31 ? "mois" : "jour";
  }, [evGranularity, rangeDays, drillMois, drillSemaine]);

  const attsDrill = useMemo(() => {
    let src = attendancesFiltered;
    if (drillSemaine) {
      const lu = new Date(drillSemaine), di = new Date(lu);
      di.setDate(di.getDate() + 6);
      src = src.filter((a) => { const d = new Date(a.date); return d >= lu && d <= di; });
    } else if (drillMois) {
      src = src.filter((a) => a.date.startsWith(drillMois));
    }
    return src;
  }, [attendancesFiltered, drillMois, drillSemaine]);

  const evGrouped = useMemo(() => {
    const map = {};
    attsDrill.forEach((a) => {
      const d = new Date(a.date);
      const k = effectiveGran==="mois" ? monthKey(d) : effectiveGran==="semaine" ? weekKey(d) : a.date;
      if (!map[k]) map[k] = { key:k, hommes:0, femmes:0 };
      map[k].hommes += a.hommes||0;
      map[k].femmes += a.femmes||0;
    });
    return Object.values(map).sort((a,b) => a.key.localeCompare(b.key));
  }, [attsDrill, effectiveGran]);

  const evLabels = evGrouped.map((g) => {
    if (effectiveGran==="mois") { const [y,m]=g.key.split("-"); return fmtMois(new Date(+y,+m-1,1)); }
    if (effectiveGran==="semaine") return `Sem. ${fmt(new Date(g.key))}`;
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
    responsive:true, maintainAspectRatio:false,
    onClick:(_,els) => {
      if (!els.length) return;
      const g = evGrouped[els[0].index];
      if (effectiveGran==="mois")    { setDrillMois(g.key); setDrillSemaine(null); }
      if (effectiveGran==="semaine") setDrillSemaine(g.key);
    },
    plugins:{ legend:{display:false}, tooltip:{callbacks:{footer:effectiveGran!=="jour"?()=>"Cliquez pour zoomer":undefined}} },
    scales:{
      y:{ beginAtZero:false, ticks:{color:"#fff",font:{size:11}}, grid:{color:"rgba(255,255,255,0.08)"} },
      x:{ ticks:{color:"#fff",font:{size:11},maxRotation:45,autoSkip:true,maxTicksLimit:14}, grid:{display:false} },
    },
  };

  // ── tableau ───────────────────────────────────────────────────────────────
  const tableRows = useMemo(() => {
    const grp = {};
    attendancesFiltered.forEach((a) => {
      const k = `${a.date}_${a.numero_culte||""}`;
      if (!grp[k]) grp[k] = { ...a };
      else {
        grp[k].hommes = (grp[k].hommes||0) + (a.hommes||0);
        grp[k].femmes = (grp[k].femmes||0) + (a.femmes||0);
      }
    });
    const sorted = Object.values(grp).sort((a,b) => a.date.localeCompare(b.date));
    return sorted.map((a,i) => {
      const total = (a.hommes||0) + (a.femmes||0);
      const prev  = i > 0 ? sorted[i-1] : null;
      const pt    = prev ? (prev.hommes||0) + (prev.femmes||0) : null;
      const pct   = pt && pt > 0 ? (((total-pt)/pt)*100).toFixed(1) : null;
      return { ...a, total, pct };
    });
  }, [attendancesFiltered]);

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
            className={`px-3 py-1 rounded-full text-xs border transition ${(evGranularity==="auto"?effectiveGran:evGranularity)===g ? "bg-emerald-400 text-white border-emerald-400" : "border-white/30 text-white/70 hover:border-white"}`}>
            {g.charAt(0).toUpperCase()+g.slice(1)}
          </button>
        ))}
        {drillMois && !drillSemaine && <span className="text-white/60 text-xs">{fmtMois(new Date(drillMois+"-01"))} — cliquez une semaine</span>}
        {drillSemaine && <span className="text-white/60 text-xs">Semaine du {fmt(new Date(drillSemaine))}</span>}
      </div>
    );
  };

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-[#333699]">
      <HeaderPages />

      <h1 className="text-2xl font-bold mt-4 mb-2 text-center text-white">
        Rapport <span className="text-emerald-300">Présences</span>
      </h1>
      <p className="italic text-sm text-white/80 mb-6 text-center max-w-2xl">
        Suivez l'évolution des présences. Analysez la croissance et les tendances au fil du temps.
      </p>

      {/* ── FORMULAIRE GÉNÉRATION ── */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 shadow-lg rounded-xl p-4 md:p-6 w-full max-w-2xl mx-auto text-white mb-6">
        <p className="text-sm font-semibold text-red-400 text-center mb-4">Choisissez les paramètres</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex flex-col md:col-span-2">
            <label className="text-sm text-center mb-1 flex items-center justify-center gap-1 text-amber-200">
              <IconCellule /> Filtrer par cellule (optionnel)
            </label>
            <select value={selCelluleId} onChange={(e) => setSelCelluleId(e.target.value)}
              className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white">
              <option value="">Toutes les cellules</option>
              {cellulesVisibles.map((c) => (
                <option key={c.id} value={c.id}>{c.cellule_full || c.cellule}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-sm text-center mb-1">Date de Début</label>
            <input type="date" value={dateDebut} onChange={(e) => setDateDebut(e.target.value)}
              className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white"/>
          </div>
          <div className="flex flex-col">
            <label className="text-sm text-center mb-1">Date de Fin</label>
            <input type="date" value={dateFin} onChange={(e) => setDateFin(e.target.value)}
              className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white"/>
          </div>
        </div>

        <button onClick={fetchRapport} disabled={loading}
          className="w-full mt-4 h-10 bg-amber-300 text-white font-semibold rounded-lg hover:bg-amber-400 transition disabled:opacity-60">
          {loading ? "⏳ Chargement..." : "Générer"}
        </button>
      </div>

      {message && <p className="text-white mb-4">{message}</p>}

      {/* ── RÉSULTATS ── */}
      {attendances.length > 0 && (
        <div className="w-full max-w-4xl">

          {/* MÉTRIQUES GLOBALES */}
          <div className="grid grid-cols-3 gap-3 mb-4">
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

          {/* ── FILTRE GLOBAL UNIQUE — affiché après génération ── */}
          <div className="bg-white/10 border border-white/20 rounded-xl p-3 mb-4 flex flex-wrap items-center gap-3">
            <label className="text-xs text-white/60 whitespace-nowrap">Afficher par</label>
            <select
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="border border-white/20 rounded-lg px-3 py-1.5 bg-white/10 text-white text-sm min-w-[200px] flex-1"
            >
              <option value="">Tout</option>
              {cellulesVisibles.length > 0 && (
                <optgroup label="── Cellules ──">
                  {cellulesVisibles.map((c) => (
                    <option key={c.id} value={`cellule:${c.id}`}>
                      {c.cellule_full || c.cellule}
                    </option>
                  ))}
                </optgroup>
              )}
              {famillesVisibles.length > 0 && (
                <optgroup label="── Familles ──">
                  {famillesVisibles.map((f) => (
                    <option key={f.id} value={`famille:${f.id}`}>
                      {f.famille_full || f.famille}
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
            {globalFilter && (
              <button onClick={() => setGlobalFilter("")}
                className="text-xs text-white/50 hover:text-white border border-white/20 rounded-lg px-3 py-1.5">
                Réinitialiser
              </button>
            )}
          </div>

          {/* ONGLETS */}
          <div className="flex gap-2 mb-4 flex-wrap">
            {[
              { key:"evolution",   label:"Évolution" },
              { key:"repartition", label:"Répartition" },
              { key:"tableau",     label:"Tableau détaillé" },
            ].map(({ key, label }) => (
              <button key={key} onClick={() => setActiveTab(key)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition ${activeTab===key ? "bg-white text-[#333699] border-white" : "border-white/30 text-white/70 hover:border-white"}`}>
                {label}
              </button>
            ))}
          </div>

          {/* ── TAB ÉVOLUTION ── */}
          {activeTab==="evolution" && (
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
                {effectiveGran!=="jour" && <span className="text-white/40 ml-auto">💡 Cliquez pour zoomer</span>}
              </div>
              <div style={{ height:280 }}><Line data={lineData} options={lineOptions}/></div>
            </div>
          )}

          {/* ── TAB RÉPARTITION ── */}
          {activeTab==="repartition" && (
            <div className="bg-white/10 border border-white/20 rounded-xl p-4">
              <p className="text-white font-semibold mb-4">Répartition des présences</p>

              {/* Total uniquement */}
              <div className="mb-5 max-w-[180px]">
                <div className="bg-white/10 border border-white/10 rounded-xl p-3 text-center">
                  <p className="text-xs text-white/50 mb-1">Total présences</p>
                  <p className="text-xl font-bold text-white">{dispTotal}</p>
                </div>
              </div>

              {presentMemberIds.size === 0 && globalFilter && (
                <p className="text-white/40 text-xs text-center mb-3 italic">
                  ℹ️ Composition des membres (présences individuelles non saisies)
                </p>
              )}

              {/* 2 donuts — sans tableau récap */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <p className="text-white/70 text-sm font-medium mb-3 text-center">Par civilité</p>
                  <CiviliteDonut hommes={dispH} femmes={dispF} />
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <p className="text-white/70 text-sm font-medium mb-3 text-center">Par tranche d'âge</p>
                  {tranchesData.length === 0 ? (
                    <div className="flex items-center justify-center h-[180px]">
                      <p className="text-white/30 text-xs text-center">
                        Aucune tranche d'âge<br/>renseignée
                      </p>
                    </div>
                  ) : (
                    <TranchesDonut data={tranchesData} />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── TAB TABLEAU ── */}
          {activeTab==="tableau" && (
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
                    <tr><td colSpan={6} className="px-3 py-6 text-center text-white/40">Aucune donnée</td></tr>
                  ) : tableRows.map((a) => {
                    const pn = parseFloat(a.pct);
                    const pc = pn>0 ? "#4ade80" : pn<0 ? "#f87171" : "rgba(255,255,255,0.4)";
                    return (
                      <tr key={`${a.date}_${a.numero_culte}`} className="border-t border-white/10 hover:bg-white/5">
                        <td className="px-3 py-2">{new Date(a.date).toLocaleDateString("fr-FR")}</td>
                        <td className="px-3 py-2">{a.numero_culte||""}</td>
                        <td className="px-3 py-2 text-blue-300">{a.hommes||""}</td>
                        <td className="px-3 py-2 text-pink-300">{a.femmes||""}</td>
                        <td className="px-3 py-2 text-orange-400 font-semibold">{a.total||""}</td>
                        <td className="px-3 py-2">
                          {a.pct !== null && (
                            <span style={{ color:pc, fontWeight:500 }}>
                              {pn>0?"+":""}{a.pct}%
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
