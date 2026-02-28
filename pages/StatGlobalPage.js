"use client";

import { useState, useEffect } from "react";
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

function StatGlobalPage() {
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [branchesTree, setBranchesTree] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [superviseurFilter, setSuperviseurFilter] = useState("");
  const [allBranches, setAllBranches] = useState([]);
  const [rootId, setRootId] = useState(null);
  const [expandedBranches, setExpandedBranches] = useState([]);
  const [ministereMap, setMinistereMap] = useState({});

  const getAllDescendants = (branch) => {
    let descendants = [branch.id];
    branch.enfants.forEach((child) => {
      descendants = descendants.concat(getAllDescendants(child));
    });
    return descendants;
  };

  const toggleExpand = (branchId) => {
    setExpandedBranches((prev) =>
      prev.includes(branchId)
        ? prev.filter((id) => id !== branchId)
        : [...prev, branchId]
    );
  };

  const fetchStats = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profileData } = await supabase
        .from("profiles")
        .select("branche_id")
        .eq("id", user.id)
        .single();

      const rootIdValue = profileData.branche_id;
      setRootId(rootIdValue);

      const { data: branchesData } = await supabase.rpc("get_descendant_branches", { root_id: rootIdValue });
      if (!branchesData?.length) {
        setBranchesTree([]);
        setAllBranches([]);
        setMinistereMap({});
        setLoading(false);
        return;
      }
      const branchIds = branchesData.map((b) => b.id);

      // ================= MINISTÈRE =================
      let ministereQuery = supabase
        .from("membres_complets")
        .select("id, branche_id")
        .in("branche_id", branchIds)
        .eq("star", true);

      if (dateDebut) ministereQuery = ministereQuery.gte("created_at", dateDebut);
      if (dateFin) ministereQuery = ministereQuery.lte("created_at", dateFin);

      const { data: ministereData } = await ministereQuery;

      const minMap = {};
      branchIds.forEach((id) => { minMap[id] = []; });
      ministereData?.forEach((m) => {
        minMap[m.branche_id].push(m.id);
      });
      setMinistereMap(minMap);

      // ================= AUTRES STATS =================
      const statsMap = {};
      branchIds.forEach((id) => {
        statsMap[id] = {
          culte: { hommes: 0, femmes: 0, jeunes: 0, enfants: 0, connectes: 0, nouveaux_venus: 0, nouveau_converti: 0, moissonneurs: 0 },
          formation: { hommes: 0, femmes: 0 },
          bapteme: { hommes: 0, femmes: 0 },
          evangelisation: { hommes: 0, femmes: 0, priere: 0, nouveau_converti: 0, reconciliation: 0, moissonneurs: 0 },
          serviteurs: { hommes: 0, femmes: 0 },   // ✅ Serviteurs ajouté
        };
      });

      const tableFetch = async (table, branchField, dateField) => {
        let query = supabase.from(table).select("*").in(branchField, branchIds);
        if (dateDebut) query = query.gte(dateField, dateDebut);
        if (dateFin) query = query.lte(dateField, dateFin);
        const { data } = await query;
        return data || [];
      };

      const [attendanceData, formationData, baptemeData, evangeData] = await Promise.all([
        tableFetch("attendance_stats", "branche_id", "mois"),
        tableFetch("formations", "branche_id", "date_debut"),
        tableFetch("baptemes", "branche_id", "date"),
        tableFetch("rapport_evangelisation", "branche_id", "date")
      ]);

      attendanceData.forEach((s) => {
        const a = statsMap[s.branche_id].culte;
        a.hommes += Number(s.hommes) || 0;
        a.femmes += Number(s.femmes) || 0;
        a.jeunes += Number(s.jeunes) || 0;
        a.enfants += Number(s.enfants) || 0;
        a.connectes += Number(s.connectes) || 0;
        a.nouveaux_venus += Number(s.nouveaux_venus) || 0;
        a.nouveau_converti += Number(s.nouveau_converti) || 0;
        a.moissonneurs += Number(s.moissonneurs) || 0;
      });

      formationData.forEach((f) => {
        const form = statsMap[f.branche_id].formation;
        form.hommes += Number(f.hommes) || 0;
        form.femmes += Number(f.femmes) || 0;
      });

      baptemeData.forEach((b) => {
        const bap = statsMap[b.branche_id].bapteme;
        bap.hommes += Number(b.hommes) || 0;
        bap.femmes += Number(b.femmes) || 0;
      });

      evangeData.forEach((e) => {
        const ev = statsMap[e.branche_id].evangelisation;
        ev.hommes += Number(e.hommes) || 0;
        ev.femmes += Number(e.femmes) || 0;
        ev.priere += Number(e.priere) || 0;
        ev.nouveau_converti += Number(e.nouveau_converti) || 0;
        ev.reconciliation += Number(e.reconciliation) || 0;
        ev.moissonneurs += Number(e.moissonneurs) || 0;
      });

      // ================= SERVITEURS =================
      const { data: serviteurData } = await supabase
        .from("stats_ministere_besoin")
        .select("membre_id, branche_id")
        .in("branche_id", branchIds)
        .eq("type", "serviteur")
        .not("valeur", "is", null)
        .gte("date_action", dateDebut || "1900-01-01")
        .lte("date_action", dateFin || "2100-12-31");

      // Déduplication par membre_id + branche_id
      const uniqueServiteurs = {};
      serviteurData?.forEach(s => {
        if (!uniqueServiteurs[s.branche_id]) uniqueServiteurs[s.branche_id] = new Set();
        uniqueServiteurs[s.branche_id].add(s.membre_id);
      });

      // Récupération sexe des serviteurs
      const allServIds = [...new Set(serviteurData?.map(s => s.membre_id) || [])];
      let sexeMap = {};
      if (allServIds.length > 0) {
        const { data: membresData } = await supabase
          .from("membres_complets")
          .select("id, sexe")
          .in("id", allServIds);
        membresData?.forEach(m => { sexeMap[m.id] = m.sexe; });
      }

      Object.keys(uniqueServiteurs).forEach(branchId => {
        uniqueServiteurs[branchId].forEach(mId => {
          const sexe = sexeMap[mId];
          if (sexe === "Homme") statsMap[branchId].serviteurs.hommes++;
          if (sexe === "Femme") statsMap[branchId].serviteurs.femmes++;
        });
      });

      // ================= ARBRE =================
      const map = {};
      branchesData.forEach((b) => {
        map[b.id] = { ...b, stats: statsMap[b.id], enfants: [] };
      });
      const tree = [];
      Object.values(map).forEach((b) => {
        if (b.superviseur_id && map[b.superviseur_id]) map[b.superviseur_id].enfants.push(b);
        else tree.push(b);
      });

      setBranchesTree(tree);
      setAllBranches(Object.values(map));
    } catch (err) {
      console.error("Erreur fetch stats:", err);
      setBranchesTree([]);
      setAllBranches([]);
      setMinistereMap({});
    }
    setLoading(false);
  };

  const renderBranch = (branch, level = 0) => {
    const culteTotal = branch.stats.culte.hommes + branch.stats.culte.femmes + branch.stats.culte.jeunes;

    return (
      <div key={branch.id} className="mt-8">
        <div className="flex items-center mb-3">
          {level >= 1 && branch.enfants.length > 0 && (
            <button onClick={() => toggleExpand(branch.id)} className="mr-2 text-xl">
              {expandedBranches.includes(branch.id) ? "➖" : "➕"}
            </button>
          )}
          <div className={`text-xl font-bold ${level === 0 ? "text-amber-300" : "text-white"}`}>
            {branch.nom}
          </div>
        </div>

        <div className="w-full overflow-x-auto">
          <div className="w-max space-y-2">
            {/* HEADER */}
            <div className="flex font-semibold uppercase text-white px-4 py-3 border-b border-white/30 bg-white/5 rounded-t-xl whitespace-nowrap">
              <div className="min-w-[180px]">Type</div>
              <div className="min-w-[120px] text-center">Hommes</div>
              <div className="min-w-[120px] text-center">Femmes</div>
              <div className="min-w-[120px] text-center">Jeunes</div>
              <div className="min-w-[120px] text-center">Total</div>
              <div className="min-w-[120px] text-center">Enfants</div>
              <div className="min-w-[140px] text-center">Connectés</div>
              <div className="min-w-[150px] text-center">Nouveaux Venus</div>
              <div className="min-w-[180px] text-center">Nouveau Converti</div>
              <div className="min-w-[160px] text-center">Moissonneurs</div>
            </div>

            {/* CULTE */}
            <div className="flex items-center px-4 py-3 rounded-xl bg-white/10 border-l-4 border-green-400 whitespace-nowrap">
              <div className="min-w-[180px] font-semibold">Culte</div>
              <div className="min-w-[120px] text-center">{branch.stats.culte.hommes}</div>
              <div className="min-w-[120px] text-center">{branch.stats.culte.femmes}</div>
              <div className="min-w-[120px] text-center">{branch.stats.culte.jeunes}</div>
              <div className="min-w-[120px] text-center">{culteTotal}</div>
              <div className="min-w-[120px] text-center">{branch.stats.culte.enfants}</div>
              <div className="min-w-[140px] text-center">{branch.stats.culte.connectes}</div>
              <div className="min-w-[150px] text-center">{branch.stats.culte.nouveaux_venus}</div>
              <div className="min-w-[180px] text-center">{branch.stats.culte.nouveau_converti}</div>
              <div className="min-w-[160px] text-center">{branch.stats.culte.moissonneurs}</div>
            </div>

            {/* FORMATION */}
            <div className="flex items-center px-4 py-3 rounded-xl bg-white/10 border-l-4 border-blue-400 whitespace-nowrap">
              <div className="min-w-[180px] font-semibold">Formation</div>
              <div className="min-w-[120px] text-center">{branch.stats.formation.hommes}</div>
              <div className="min-w-[120px] text-center">{branch.stats.formation.femmes}</div>
            </div>

            {/* BAPTÊME */}
            <div className="flex items-center px-4 py-3 rounded-xl bg-white/10 border-l-4 border-purple-400 whitespace-nowrap">
              <div className="min-w-[180px] font-semibold">Baptême</div>
              <div className="min-w-[120px] text-center">{branch.stats.bapteme.hommes}</div>
              <div className="min-w-[120px] text-center">{branch.stats.bapteme.femmes}</div>
            </div>

            {/* EVANGÉLISATION */}
            <div className="flex items-center px-4 py-3 rounded-xl bg-white/10 border-l-4 border-pink-400 whitespace-nowrap">
              <div className="min-w-[180px] font-semibold">Évangélisation</div>
              <div className="min-w-[120px] text-center">{branch.stats.evangelisation.hommes}</div>
              <div className="min-w-[120px] text-center">{branch.stats.evangelisation.femmes}</div>
              <div className="min-w-[120px] text-center">{branch.stats.evangelisation.priere}</div>
              <div className="min-w-[120px] text-center">{branch.stats.evangelisation.hommes + branch.stats.evangelisation.femmes}</div>
              <div className="min-w-[120px] text-center">-</div>
              <div className="min-w-[140px] text-center">-</div>
              <div className="min-w-[150px] text-center">-</div>
              <div className="min-w-[180px] text-center">{branch.stats.evangelisation.nouveau_converti}</div>
              <div className="min-w-[160px] text-center">{branch.stats.evangelisation.moissonneurs}</div>
            </div>

            {/* SERVITEURS */}
            <div className="flex items-center px-4 py-3 rounded-xl bg-white/10 border-l-4 border-yellow-400 whitespace-nowrap">
              <div className="min-w-[180px] font-semibold">Serviteurs</div>
              <div className="min-w-[120px] text-center">{branch.stats.serviteurs.hommes}</div>
              <div className="min-w-[120px] text-center">{branch.stats.serviteurs.femmes}</div>
              <div className="min-w-[120px] text-center">
                {branch.stats.serviteurs.hommes + branch.stats.serviteurs.femmes}
              </div>
            </div>

          </div>
        </div>

        {branch.enfants.map((child) =>
          (level === 0 || expandedBranches.includes(branch.id)) 
            ? renderBranch(child, level + 1) 
            : null
        )}
      </div>
    );
  };

  const superviseurOptions = allBranches.filter((b) => b.superviseur_id === rootId);
  const filteredBranches =
    superviseurFilter && rootId
      ? branchesTree.filter((branch) =>
          getAllDescendants(branch).includes(superviseurFilter)
        )
      : branchesTree;

  return (
    <div className="min-h-screen bg-[#333699] p-6 text-white">
      <HeaderPages />

      <h1 className="text-2xl font-bold mb-6">
        Rapport <span className="text-amber-300">Statistiques Globales</span>
      </h1>

      <div className="bg-white/10 p-4 rounded-xl mb-6 flex gap-4 flex-wrap items-end">
        <div className="flex flex-col">
          <label className="text-sm mb-1">Date début</label>
          <input type="date" value={dateDebut} onChange={(e) => setDateDebut(e.target.value)} className="px-3 py-2 rounded-lg text-black"/>
        </div>
        <div className="flex flex-col">
          <label className="text-sm mb-1">Date fin</label>
          <input type="date" value={dateFin} onChange={(e) => setDateFin(e.target.value)} className="px-3 py-2 rounded-lg text-black"/>
        </div>
        <button
          onClick={() => { setHasGenerated(true); fetchStats(); }}
          disabled={loading}
          className="px-6 py-2 bg-amber-400 hover:bg-amber-500 text-black font-semibold rounded-lg transition disabled:opacity-50"
        >
          {loading ? "Génération..." : "Générer"}
        </button>

        <div className="flex flex-col">
          <label className="text-sm mb-1">Superviseur</label>
          <select value={superviseurFilter} onChange={(e) => setSuperviseurFilter(e.target.value)} className="px-3 py-2 rounded-lg text-black">
            <option value="">Tous</option>
            {superviseurOptions.map((b) => (
              <option key={b.id} value={b.id}>{b.nom}</option>
            ))}
          </select>
        </div>
      </div>

      {!hasGenerated && (
        <p className="text-white/60 mt-6">
          Veuillez sélectionner une période puis cliquer sur Générer.
        </p>
      )}

      {hasGenerated && !loading &&
        filteredBranches.map((branch) => renderBranch(branch))
      }

      <Footer />
    </div>
  );
}
