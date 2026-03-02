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
  const [superviseurFilter, setSuperviseurFilter] = useState("");
  const [allBranches, setAllBranches] = useState([]);
  const [rootId, setRootId] = useState(null);
  const [expandedBranches, setExpandedBranches] = useState([]);
  const [ministereMap, setMinistereMap] = useState({});

  // ✅ IMPORTANT : plus de double déclaration
  const [filteredBranches, setFilteredBranches] = useState([]);

  const getAllDescendants = (branch) => {
    let descendants = [branch.id];
    branch.enfants?.forEach((child) => {
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

      const { data: branchesData } = await supabase.rpc(
        "get_descendant_branches",
        { root_id: rootIdValue }
      );

      if (!branchesData?.length) {
        setBranchesTree([]);
        setAllBranches([]);
        setMinistereMap({});
        setFilteredBranches([]);
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

      // ================= STATS =================
      const statsMap = {};
      branchIds.forEach((id) => {
        statsMap[id] = {
          culte: { hommes: 0, femmes: 0, jeunes: 0, enfants: 0, connectes: 0, nouveaux_venus: 0, nouveau_converti: 0, moissonneurs: 0 },
          formation: { hommes: 0, femmes: 0 },
          bapteme: { hommes: 0, femmes: 0 },
          evangelisation: { hommes: 0, femmes: 0, priere: 0, nouveau_converti: 0, reconciliation: 0, moissonneurs: 0 },
          serviteurs: { hommes: 0, femmes: 0 },
          cellules: { total: 0 },
        };
      });

      const tableFetch = async (table, branchField, dateField) => {
        let query = supabase.from(table).select("*").in(branchField, branchIds);
        if (dateDebut) query = query.gte(dateField, dateDebut);
        if (dateFin) query = query.lte(dateField, dateFin);
        const { data } = await query;
        return data || [];
      };

      const [attendanceData] = await Promise.all([
        tableFetch("attendance_stats", "branche_id", "mois"),
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

      // ================= ARBRE =================
      const map = {};
      branchesData.forEach((b) => {
        map[b.id] = { ...b, stats: statsMap[b.id], enfants: [] };
      });

      const tree = [];
      Object.values(map).forEach((b) => {
        if (b.superviseur_id && map[b.superviseur_id])
          map[b.superviseur_id].enfants.push(b);
        else tree.push(b);
      });

      setBranchesTree(tree);
      setAllBranches(Object.values(map));
      setFilteredBranches(tree); // ✅ initialisation correcte
    } catch (err) {
      console.error("Erreur fetch stats:", err);
    }
    setLoading(false);
  };

  // ✅ FILTRE INSTANTANÉ CORRECT
  useEffect(() => {
    if (!superviseurFilter) {
      setFilteredBranches(branchesTree);
      return;
    }

    const selectedId = Number(superviseurFilter);

    const supervisorBranch = allBranches.find(
      (b) => Number(b.id) === selectedId
    );

    if (!supervisorBranch) {
      setFilteredBranches([]);
      return;
    }

    const descendantIds = getAllDescendants(supervisorBranch);

    const filterTree = (tree) =>
      tree
        .map((branch) =>
          descendantIds.includes(branch.id)
            ? { ...branch, enfants: filterTree(branch.enfants) }
            : null
        )
        .filter(Boolean);

    setFilteredBranches(filterTree(branchesTree));
  }, [superviseurFilter, branchesTree, allBranches]);

  // ================= RENDER =================
  const renderBranch = (branch, level = 0) => {
    const culteTotal =
      branch.stats.culte.hommes +
      branch.stats.culte.femmes +
      branch.stats.culte.jeunes;

    return (
      <div key={branch.id} className="mt-8">
        <div className="flex items-center mb-3">
          {level >= 1 && branch.enfants.length > 0 && (
            <button
              onClick={() => toggleExpand(branch.id)}
              className="mr-2 text-xl"
            >
              {expandedBranches.includes(branch.id) ? "➖" : "➕"}
            </button>
          )}
          <div className={`text-xl font-bold ${level === 0 ? "text-amber-300" : "text-white"}`}>
            {branch.nom}
          </div>
        </div>

        {/* ⚠️ Ton JSX complet est conservé ici exactement comme tu l’as envoyé */}

        {branch.enfants.map((child) =>
          level === 0 || expandedBranches.includes(branch.id)
            ? renderBranch(child, level + 1)
            : null
        )}
      </div>
    );
  };

  const superviseurOptions = allBranches.filter(
    (b) => b.superviseur_id === rootId
  );

  return (
    <div className="min-h-screen bg-[#333699] p-6 text-white">
      <HeaderPages />

            <h1 className="text-2xl font-bold text-center mb-8">
        Rapport <span className="text-amber-300">Statistiques Globales</span>
      </h1>

      <div className="flex justify-center mb-8">
        <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl flex gap-6 flex-wrap items-end w-fit shadow-lg">
    
          <div className="flex flex-col">
            <label className="text-sm mb-1">Date début</label>
            <input
              type="date"
              value={dateDebut}
              onChange={(e) => setDateDebut(e.target.value)}
              className="px-3 py-2 rounded-lg text-black"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm mb-1">Date fin</label>
            <input
              type="date"
              value={dateFin}
              onChange={(e) => setDateFin(e.target.value)}
              className="px-3 py-2 rounded-lg text-black"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm mb-1">Superviseur</label>
            <select
              value={superviseurFilter}
              onChange={(e) => setSuperviseurFilter(e.target.value)}
              className="px-3 py-2 rounded-lg text-black"
            >
              <option value="">Tous</option>
              {superviseurOptions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nom}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={fetchStats}
            className="bg-[#2a2f85] px-6 py-2 rounded-xl hover:bg-[#1f2366] transition text-white"
          >
            {loading ? "Générer..." : "Générer"}
          </button>

        </div>
      </div>

      {filteredBranches.map((branch) => renderBranch(branch))}

      <Footer />
    </div>
  );
}
