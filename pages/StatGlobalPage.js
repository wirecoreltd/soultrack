"use client";

import { useState } from "react";
import supabase from "../lib/supabaseClient";
import HeaderPages from "../components/HeaderPages";
import ProtectedRoute from "../components/ProtectedRoute";
import Footer from "../components/Footer";

export default function StatGlobalPageWrapper() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur", "Responsable"]}>
      <StatGlobalPage />
    </ProtectedRoute>
  );
}

// ─── UI ATOMS ─────────────────────────────────────────────────
function SectionTitle({ children }) {
  return <p className="text-[11px] font-semibold uppercase tracking-widest text-white/40 mb-3">{children}</p>;
}
function KpiCard({ label, value, sub, accent }) {
  const c = {
    green: "text-emerald-400", red: "text-red-400", amber: "text-amber-400",
    white: "text-white", blue: "text-blue-300", pink: "text-pink-300",
    purple: "text-purple-300", teal: "text-teal-300", orange: "text-orange-300",
    gray: "text-white/40", indigo: "text-indigo-300", yellow: "text-yellow-300",
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
    green: "bg-emerald-900/60 text-emerald-300", red: "bg-red-900/60 text-red-300",
    amber: "bg-amber-900/60 text-amber-300", blue: "bg-blue-900/60 text-blue-300",
    purple: "bg-purple-900/60 text-purple-300", gray: "bg-white/10 text-white/50",
    orange: "bg-orange-900/60 text-orange-300", yellow: "bg-yellow-900/60 text-yellow-300",
    indigo: "bg-indigo-900/60 text-indigo-300", pink: "bg-pink-900/60 text-pink-300",
  };
  return <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${m[color] || m.gray}`}>{children}</span>;
}
function BarreProgression({ pct, color }) {
  const col = color || (pct >= 70 ? "bg-emerald-400" : pct >= 40 ? "bg-amber-400" : "bg-red-400");
  return (
    <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
      <div className={`h-full rounded-full transition-all ${col}`} style={{ width: `${Math.min(pct || 0, 100)}%` }} />
    </div>
  );
}

// ─── STAT ROW ─────────────────────────────────────────────────
function StatRow({ label, color, children }) {
  return (
    <div className={`bg-white/10 rounded-xl px-4 py-3 border-l-2 ${color}`}>
      <p className="text-[11px] font-semibold uppercase tracking-widest text-white/40 mb-2">{label}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}
function StatChip({ label, value, accent }) {
  const c = {
    green: "text-emerald-400", blue: "text-blue-300", purple: "text-purple-300",
    pink: "text-pink-300", yellow: "text-yellow-300", orange: "text-orange-300",
    amber: "text-amber-300", indigo: "text-indigo-300", white: "text-white",
  };
  return (
    <div className="bg-white/5 rounded-xl px-3 py-2 flex flex-col items-center min-w-[70px]">
      <p className={`text-lg font-bold leading-none ${c[accent] || "text-white"}`}>{value}</p>
      <p className="text-[10px] text-white/40 mt-0.5 text-center">{label}</p>
    </div>
  );
}

// ─── BLOC STATS EGLISE ────────────────────────────────────────
function BlocStatsEglise({ stats }) {
  const totalCulte = stats.culte.hommes + stats.culte.femmes + stats.culte.jeunes;
  const totalCulteGlobal = totalCulte + stats.culte.enfants + stats.culte.connectes;

  return (
    <div className="flex flex-col gap-2">
      {/* KPI rapides */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-1">
        <KpiCard label="Culte" value={totalCulteGlobal} sub="total présences" accent="green" />
        <KpiCard label="Évangélisation" value={stats.evangelisation.hommes + stats.evangelisation.femmes} sub="âmes touchées" accent="pink" />
        <KpiCard label="Baptêmes" value={stats.bapteme.hommes + stats.bapteme.femmes} sub="cette période" accent="purple" />
        <KpiCard label="Cellules" value={stats.cellules.total} sub="cellules actives" accent="orange" />
      </div>

      {/* Culte */}
      <StatRow label="Culte" color="border-emerald-500">
        <StatChip label="Hommes" value={stats.culte.hommes} accent="blue" />
        <StatChip label="Femmes" value={stats.culte.femmes} accent="pink" />
        <StatChip label="Jeunes" value={stats.culte.jeunes} accent="amber" />
        <StatChip label="Total H+F+J" value={totalCulte} accent="orange" />
        <StatChip label="Enfants" value={stats.culte.enfants} accent="green" />
        <StatChip label="Connectés" value={stats.culte.connectes} accent="indigo" />
        <StatChip label="Nv Venus" value={stats.culte.nouveaux_venus} accent="purple" />
        <StatChip label="Nv Convertis" value={stats.culte.nouveau_converti} accent="yellow" />
        <StatChip label="Moissonneurs" value={stats.culte.moissonneurs} accent="white" />
        <StatChip label="Total Global" value={totalCulteGlobal} accent="orange" />
      </StatRow>

      {/* Formation */}
      <StatRow label="Formation" color="border-blue-500">
        <StatChip label="Hommes" value={stats.formation.hommes} accent="blue" />
        <StatChip label="Femmes" value={stats.formation.femmes} accent="pink" />
        <StatChip label="Total" value={stats.formation.hommes + stats.formation.femmes} accent="orange" />
      </StatRow>

      {/* Baptême */}
      <StatRow label="Baptême" color="border-purple-500">
        <StatChip label="Hommes" value={stats.bapteme.hommes} accent="blue" />
        <StatChip label="Femmes" value={stats.bapteme.femmes} accent="pink" />
        <StatChip label="Total" value={stats.bapteme.hommes + stats.bapteme.femmes} accent="orange" />
      </StatRow>

      {/* Évangélisation */}
      <StatRow label="Évangélisation" color="border-pink-500">
        <StatChip label="Hommes" value={stats.evangelisation.hommes} accent="blue" />
        <StatChip label="Femmes" value={stats.evangelisation.femmes} accent="pink" />
        <StatChip label="Total" value={stats.evangelisation.hommes + stats.evangelisation.femmes} accent="orange" />
        <StatChip label="Prière" value={stats.evangelisation.priere} accent="indigo" />
        <StatChip label="Nv Convertis" value={stats.evangelisation.nouveau_converti} accent="yellow" />
        <StatChip label="Réconciliation" value={stats.evangelisation.reconciliation} accent="green" />
        <StatChip label="Moissonneurs" value={stats.evangelisation.moissonneurs} accent="white" />
      </StatRow>

      {/* Serviteurs */}
      <StatRow label="Serviteurs" color="border-yellow-500">
        <StatChip label="Hommes" value={stats.serviteurs.hommes} accent="blue" />
        <StatChip label="Femmes" value={stats.serviteurs.femmes} accent="pink" />
        <StatChip label="Total" value={stats.serviteurs.hommes + stats.serviteurs.femmes} accent="orange" />
      </StatRow>

      {/* Entonnoir */}
      {totalCulteGlobal > 0 && (
        <div className="bg-white/10 rounded-xl p-3 flex flex-col gap-2 mt-1">
          <SectionTitle>Entonnoir</SectionTitle>
          {[
            { label: "Présences culte", val: totalCulteGlobal, color: "bg-emerald-400" },
            { label: "Évangélisés", val: stats.evangelisation.hommes + stats.evangelisation.femmes, color: "bg-pink-400" },
            { label: "Baptisés", val: stats.bapteme.hommes + stats.bapteme.femmes, color: "bg-purple-400" },
            { label: "Serviteurs", val: stats.serviteurs.hommes + stats.serviteurs.femmes, color: "bg-yellow-400" },
          ].map(({ label, val, color }) => (
            <div key={label} className="flex items-center gap-3">
              <p className="text-xs text-white/50 w-28 flex-shrink-0">{label}</p>
              <BarreProgression pct={Math.round((val / totalCulteGlobal) * 100)} color={color} />
              <span className="text-xs text-white font-semibold w-8 text-right">{val}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── CARTE EGLISE ─────────────────────────────────────────────
function CarteEglise({ eglise, level, expandedEglises, toggleExpand }) {
  const isExpanded = expandedEglises.includes(eglise.id);
  const hasChildren = eglise.enfants?.length > 0;

  const totalStats = hasChildren && !isExpanded
    ? eglise.enfants.reduce((acc, child) => {
        acc.culte.hommes += child.stats.culte.hommes;
        acc.culte.femmes += child.stats.culte.femmes;
        acc.culte.jeunes += child.stats.culte.jeunes;
        acc.culte.enfants += child.stats.culte.enfants;
        acc.culte.connectes += child.stats.culte.connectes;
        acc.culte.nouveaux_venus += child.stats.culte.nouveaux_venus;
        acc.culte.nouveau_converti += child.stats.culte.nouveau_converti;
        acc.culte.moissonneurs += child.stats.culte.moissonneurs;
        acc.formation.hommes += child.stats.formation.hommes;
        acc.formation.femmes += child.stats.formation.femmes;
        acc.bapteme.hommes += child.stats.bapteme.hommes;
        acc.bapteme.femmes += child.stats.bapteme.femmes;
        acc.evangelisation.hommes += child.stats.evangelisation.hommes;
        acc.evangelisation.femmes += child.stats.evangelisation.femmes;
        acc.evangelisation.priere += child.stats.evangelisation.priere;
        acc.evangelisation.nouveau_converti += child.stats.evangelisation.nouveau_converti;
        acc.evangelisation.reconciliation += child.stats.evangelisation.reconciliation;
        acc.evangelisation.moissonneurs += child.stats.evangelisation.moissonneurs;
        acc.serviteurs.hommes += child.stats.serviteurs.hommes;
        acc.serviteurs.femmes += child.stats.serviteurs.femmes;
        acc.cellules.total += child.stats.cellules.total;
        return acc;
      }, {
        culte: { ...eglise.stats.culte },
        formation: { ...eglise.stats.formation },
        bapteme: { ...eglise.stats.bapteme },
        evangelisation: { ...eglise.stats.evangelisation },
        serviteurs: { ...eglise.stats.serviteurs },
        cellules: { ...eglise.stats.cellules },
      })
    : eglise.stats;

  const totalCulte = totalStats.culte.hommes + totalStats.culte.femmes + totalStats.culte.jeunes;

  return (
    <div className="flex flex-col gap-2">
      {/* Header carte */}
      <div
        className={`bg-white/10 rounded-2xl overflow-hidden border-l-2 ${hasChildren ? "border-amber-400" : "border-blue-400"}`}
        style={{ marginLeft: level * 12 }}
      >
        <button
          onClick={() => toggleExpand(eglise.id)}
          className="w-full flex items-center justify-between px-4 py-4 hover:bg-white/5 transition text-left gap-3"
        >
          <div className="flex flex-col gap-0.5 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className={`font-semibold ${hasChildren ? "text-amber-300" : "text-white"}`}>
                {eglise.nom}
              </span>
              {hasChildren && (
                <Badge color="amber">
                  {eglise.enfants.length} église{eglise.enfants.length > 1 ? "s" : ""}
                </Badge>
              )}
              {hasChildren && !isExpanded && (
                <Badge color="gray">Total général</Badge>
              )}
            </div>
            <span className="text-[11px] text-white/40">
              Culte : {totalCulte} · Baptêmes : {totalStats.bapteme.hommes + totalStats.bapteme.femmes} · Cellules : {totalStats.cellules.total}
            </span>
          </div>
          <span className="text-white/30 text-xs flex-shrink-0">{isExpanded ? "▲" : "▼"}</span>
        </button>

        {isExpanded && (
          <div className="border-t border-white/10 px-4 pb-4 pt-3">
            <BlocStatsEglise stats={totalStats} />
          </div>
        )}
      </div>

      {/* Enfants */}
      {isExpanded && eglise.enfants?.map((child) => (
        <CarteEglise
          key={child.id}
          eglise={child}
          level={level + 1}
          expandedEglises={expandedEglises}
          toggleExpand={toggleExpand}
        />
      ))}
    </div>
  );
}

// ─── PAGE PRINCIPALE ──────────────────────────────────────────
function StatGlobalPage() {
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [eglisesTree, setEglisesTree] = useState([]);
  const [loading, setLoading] = useState(false);
  const [parentFilter, setParentFilter] = useState("");
  const [allEglises, setAllEglises] = useState([]);
  const [rootId, setRootId] = useState(null);
  const [expandedEglises, setExpandedEglises] = useState([]);
  const [ministereMap, setMinistereMap] = useState({});

  const toggleExpand = (egliseId) => {
    setExpandedEglises((prev) =>
      prev.includes(egliseId) ? prev.filter((id) => id !== egliseId) : [...prev, egliseId]
    );
  };

  // ─── Fetch (identique à l'original) ──────────────────────
  const fetchStats = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profileData } = await supabase
        .from("profiles").select("eglise_id").eq("id", user.id).single();

      const rootIdValue = profileData.eglise_id;
      setRootId(rootIdValue);

      const { data: filteredEglisesData } = await supabase.rpc("get_descendant_eglises", { root_id: rootIdValue });

      if (!filteredEglisesData?.length) {
        setEglisesTree([]); setAllEglises([]); setMinistereMap({});
        setLoading(false); return;
      }

      const egliseIds = filteredEglisesData.map((e) => e.id);

      let ministereQuery = supabase.from("membres_complets").select("id, eglise_id")
        .in("eglise_id", egliseIds).eq("star", true);
      if (dateDebut) ministereQuery = ministereQuery.gte("created_at", dateDebut);
      if (dateFin) ministereQuery = ministereQuery.lte("created_at", dateFin);
      const { data: ministereData } = await ministereQuery;
      const minMap = {};
      egliseIds.forEach((id) => { minMap[id] = []; });
      ministereData?.forEach((m) => { minMap[m.eglise_id].push(m.id); });
      setMinistereMap(minMap);

      const statsMap = {};
      egliseIds.forEach((id) => {
        statsMap[id] = {
          culte: { hommes: 0, femmes: 0, jeunes: 0, enfants: 0, connectes: 0, nouveaux_venus: 0, nouveau_converti: 0, moissonneurs: 0 },
          formation: { hommes: 0, femmes: 0 },
          bapteme: { hommes: 0, femmes: 0 },
          evangelisation: { hommes: 0, femmes: 0, priere: 0, nouveau_converti: 0, reconciliation: 0, moissonneurs: 0 },
          serviteurs: { hommes: 0, femmes: 0 },
          cellules: { total: 0 },
        };
      });

      const tableFetch = async (table, dateField) => {
        let query = supabase.from(table).select("*").in("eglise_id", egliseIds);
        if (dateDebut) query = query.gte(dateField, dateDebut);
        if (dateFin) query = query.lte(dateField, dateFin);
        const { data } = await query;
        return data || [];
      };

      const [attendanceData, formationData, baptemeData, evangeData, cellulesData] = await Promise.all([
        tableFetch("attendance_stats", "mois"),
        tableFetch("formations", "date_debut"),
        tableFetch("baptemes", "date"),
        tableFetch("rapport_evangelisation", "date"),
        tableFetch("cellules", "created_at"),
      ]);

      attendanceData.forEach((s) => {
        const a = statsMap[s.eglise_id]?.culte; if (!a) return;
        a.hommes += Number(s.hommes) || 0; a.femmes += Number(s.femmes) || 0;
        a.jeunes += Number(s.jeunes) || 0; a.enfants += Number(s.enfants) || 0;
        a.connectes += Number(s.connectes) || 0; a.nouveaux_venus += Number(s.nouveaux_venus) || 0;
        a.nouveau_converti += Number(s.nouveau_converti) || 0; a.moissonneurs += Number(s.moissonneurs) || 0;
      });
      formationData.forEach((f) => {
        const form = statsMap[f.eglise_id]?.formation; if (!form) return;
        form.hommes += Number(f.hommes) || 0; form.femmes += Number(f.femmes) || 0;
      });
      baptemeData.forEach((b) => {
        const bap = statsMap[b.eglise_id]?.bapteme; if (!bap) return;
        bap.hommes += Number(b.hommes) || 0; bap.femmes += Number(b.femmes) || 0;
      });
      evangeData.forEach((e) => {
        const ev = statsMap[e.eglise_id]?.evangelisation; if (!ev) return;
        ev.hommes += Number(e.hommes) || 0; ev.femmes += Number(e.femmes) || 0;
        ev.priere += Number(e.priere) || 0; ev.nouveau_converti += Number(e.nouveau_converti) || 0;
        ev.reconciliation += Number(e.reconciliation) || 0; ev.moissonneurs += Number(e.moissonneurs) || 0;
      });

      const { data: serviteurData } = await supabase
        .from("stats_ministere_besoin").select("membre_id, eglise_id, sexe, type")
        .in("eglise_id", egliseIds);
      const unique = new Map();
      serviteurData?.forEach((row) => {
        if (row.type !== "ministere") return;
        const key = `${row.eglise_id}_${row.membre_id}`;
        if (!unique.has(key)) unique.set(key, row);
      });
      unique.forEach((row) => {
        if (!row.sexe) return;
        const serv = statsMap[row.eglise_id]?.serviteurs; if (!serv) return;
        const sexe = row.sexe.trim().toLowerCase();
        if (sexe === "homme") serv.hommes += 1;
        else if (sexe === "femme") serv.femmes += 1;
      });

      cellulesData.forEach((c) => {
        if (c.eglise_id && statsMap[c.eglise_id]) statsMap[c.eglise_id].cellules.total++;
      });

      const map = {};
      filteredEglisesData.forEach((e) => {
        map[e.id] = { ...e, stats: statsMap[e.id], enfants: [] };
      });
      const tree = [];
      Object.values(map).forEach((e) => {
        if (e.parent_eglise_id && map[e.parent_eglise_id]) map[e.parent_eglise_id].enfants.push(e);
        else tree.push(e);
      });

      setEglisesTree(tree);
      setAllEglises(Object.values(map));
    } catch (err) {
      console.error("Erreur fetch stats:", err);
      setEglisesTree([]); setAllEglises([]); setMinistereMap({});
    }
    setLoading(false);
  };

  const parentOptions = allEglises.filter((e) => e.parent_eglise_id === rootId);

  const filteredEglises = (() => {
    if (!parentFilter) return eglisesTree;
    const find = (tree) => {
      for (let e of tree) {
        if (e.id === parentFilter) return e;
        const found = find(e.enfants || []);
        if (found) return found;
      }
      return null;
    };
    const found = find(eglisesTree);
    return found ? [found] : [];
  })();

  const hasData = eglisesTree.length > 0;

  return (
    <div className="min-h-screen flex flex-col items-center p-4 sm:p-6" style={{ background: "#333699" }}>
      <HeaderPages />

      <div className="w-full max-w-2xl mt-6 flex flex-col gap-5 mb-10">

        {/* En-tête */}
        <div className="text-center">
          <h1 className="text-2xl font-bold mt-4 mb-2 text-white">
            Rapport <span className="text-emerald-300">Statistiques Globales</span>
          </h1>
          <p className="italic text-base text-white/90">
            Pilotez votre assemblée avec une vision{" "}
            <span className="text-blue-300 font-semibold">globale et structurée</span>.
            Gardez une vue d'ensemble sur les églises sous votre{" "}
            <span className="text-blue-300 font-semibold">supervision</span>, suivez les{" "}
            <span className="text-blue-300 font-semibold">indicateurs clés</span> et accompagnez le{" "}
            <span className="text-blue-300 font-semibold">développement</span> de chaque communauté.
          </p>
        </div>

        {/* Filtres */}
        <div className="bg-white/10 rounded-2xl p-4 flex flex-col gap-3">
          <SectionTitle>Paramètres du rapport</SectionTitle>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-white/50">Date de début</label>
              <input type="date" value={dateDebut} onChange={e => setDateDebut(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-white/40" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-white/50">Date de fin</label>
              <input type="date" value={dateFin} onChange={e => setDateFin(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-white/40" />
            </div>
          </div>

          {parentOptions.length > 0 && (
            <div className="flex flex-col gap-1">
              <label className="text-xs text-white/50">Église parente</label>
              <select value={parentFilter} onChange={e => setParentFilter(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-white/40 appearance-none cursor-pointer">
                <option value="" className="bg-[#2a2d80]">Toutes les églises</option>
                {parentOptions.map((e) => (
                  <option key={e.id} value={e.id} className="bg-[#2a2d80]">{e.nom}</option>
                ))}
              </select>
            </div>
          )}

          <button onClick={fetchStats}
            className="w-full py-2 rounded-xl bg-amber-500/80 hover:bg-amber-500 text-white text-sm font-semibold transition active:scale-95">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Génération…
              </span>
            ) : "Générer le rapport"}
          </button>
        </div>

        {/* Contenu */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
          </div>
        ) : !hasData ? (
          <div className="bg-white/10 rounded-2xl p-8 text-center text-white/40 text-sm">
            Choisissez une période et cliquez sur « Générer le rapport »
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <SectionTitle>{filteredEglises.length} église{filteredEglises.length > 1 ? "s" : ""} affichée{filteredEglises.length > 1 ? "s" : ""}</SectionTitle>
            {filteredEglises.map((eglise) => (
              <CarteEglise
                key={eglise.id}
                eglise={eglise}
                level={0}
                expandedEglises={expandedEglises}
                toggleExpand={toggleExpand}
              />
            ))}
          </div>
        )}

      </div>
      <Footer />
    </div>
  );
}
