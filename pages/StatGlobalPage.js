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

  // Fonction pour récupérer toutes les descendants d'une branche
  const getAllDescendants = (branch) => {
    let descendants = [branch.id];
    branch.enfants.forEach((child) => {
      descendants = descendants.concat(getAllDescendants(child));
    });
    return descendants;
  };

  // Toggle expand/collapse
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
      // 🔹 Récupérer user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) throw userError;

      // 🔹 Récupérer branche racine
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("branche_id")
        .eq("id", user.id)
        .single();
      if (profileError) throw profileError;

      const rootIdValue = profileData.branche_id;
      setRootId(rootIdValue);

      // 🔹 Récupérer toutes les branches descendants
      const { data: branchesData, error: branchesError } = await supabase
        .rpc("get_descendant_branches", { root_id: rootIdValue });
      if (branchesError) throw branchesError;

      if (!branchesData || branchesData.length === 0) {
        setBranchesTree([]);
        setAllBranches([]);
        setLoading(false);
        return;
      }

      const branchIds = branchesData.map((b) => b.id);

      // 🔹 Récupérer les stats
      let statsQuery = supabase
        .from("attendance_stats")
        .select("*")
        .in("branche_id", branchIds);

      if (dateDebut) statsQuery = statsQuery.gte("mois", dateDebut);
      if (dateFin) statsQuery = statsQuery.lte("mois", dateFin);

      const { data: statsData, error: statsError } = await statsQuery;
      if (statsError) throw statsError;

      // 🔹 Construire map des stats
      const statsMap = {};
      statsData.forEach((stat) => {
        if (!statsMap[stat.branche_id]) {
          statsMap[stat.branche_id] = {
            hommes: 0,
            femmes: 0,
            jeunes: 0,
            enfants: 0,
            connectes: 0,
            nouveaux_venus: 0,
            nouveau_converti: 0,
            moissonneurs: 0,
          };
        }
        statsMap[stat.branche_id].hommes += Number(stat.hommes) || 0;
        statsMap[stat.branche_id].femmes += Number(stat.femmes) || 0;
        statsMap[stat.branche_id].jeunes += Number(stat.jeunes) || 0;
        statsMap[stat.branche_id].enfants += Number(stat.enfants) || 0;
        statsMap[stat.branche_id].connectes += Number(stat.connectes) || 0;
        statsMap[stat.branche_id].nouveaux_venus += Number(stat.nouveaux_venus) || 0;
        statsMap[stat.branche_id].nouveau_converti += Number(stat.nouveau_converti) || 0;
        statsMap[stat.branche_id].moissonneurs += Number(stat.moissonneurs) || 0;
      });

      // 🔹 Construire arbre hiérarchique
      const map = {};
      branchesData.forEach((b) => {
        map[b.id] = {
          ...b,
          stats: statsMap[b.id] || {
            hommes: 0,
            femmes: 0,
            jeunes: 0,
            enfants: 0,
            connectes: 0,
            nouveaux_venus: 0,
            nouveau_converti: 0,
            moissonneurs: 0,
          },
          enfants: [],
        };
      });

      const tree = [];
      Object.values(map).forEach((b) => {
        if (b.superviseur_id && map[b.superviseur_id]) {
          map[b.superviseur_id].enfants.push(b);
        } else {
          tree.push(b);
        }
      });

      setBranchesTree(tree);
      setAllBranches(Object.values(map));
    } catch (err) {
      console.error("Erreur fetch stats:", err);
      setBranchesTree([]);
      setAllBranches([]);
    }

    setLoading(false);
  };

  const renderBranch = (branch, level = 0) => {
    const total = branch.stats.hommes + branch.stats.femmes + branch.stats.jeunes;

    const borderColor =
      level === 0
        ? "border-green-400"
        : level === 1
        ? "border-orange-400"
        : "border-purple-400";

    return (
      <div key={branch.id} className="mt-8">
        {/* TITRE avec rectangle coloré et [+]/[-] */}
        <div className="flex items-center mb-3">
          {level === 1 && branch.enfants.length > 0 && (
            <button
              onClick={() => toggleExpand(branch.id)}
              className="mr-2 text-xl"
            >
              {expandedBranches.includes(branch.id) ? "➖" : "➕"}
            </button>
          )}
        
          <div className="text-xl font-bold text-amber-300">
            {branch.nom}
          </div>
        </div>

        {/* TABLE */}
        <div className="w-full max-w-full overflow-x-auto">
          <div className="w-max space-y-2">
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

            <div
              className={`flex items-center px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 transition whitespace-nowrap border-l-4 ${borderColor}`}
            >
              <div className="min-w-[180px] text-white font-semibold">Culte</div>
              <div className="min-w-[120px] text-center text-white">{branch.stats.hommes}</div>
              <div className="min-w-[120px] text-center text-white">{branch.stats.femmes}</div>
              <div className="min-w-[120px] text-center text-white">{branch.stats.jeunes}</div>
              <div className="min-w-[120px] text-center text-white">{total}</div>
              <div className="min-w-[120px] text-center text-white">{branch.stats.enfants}</div>
              <div className="min-w-[140px] text-center text-white">{branch.stats.connectes}</div>
              <div className="min-w-[150px] text-center text-white">{branch.stats.nouveaux_venus}</div>
              <div className="min-w-[180px] text-center text-white">{branch.stats.nouveau_converti}</div>
              <div className="min-w-[160px] text-center text-white">{branch.stats.moissonneurs}</div>
            </div>
          </div>
        </div>

        {/* ENFANTS (expand si niveau 1) */}
        {level !== 1 || expandedBranches.includes(branch.id)
          ? branch.enfants.map((child) => renderBranch(child, level + 1))
          : null}
      </div>
    );
  };

  // Options de filtre: enfants directs de la racine
  const superviseurOptions = allBranches.filter((b) => b.superviseur_id === rootId);

  // Filtrage selon superviseur + tous ses descendants
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

      {/* FILTRE */}
      <div className="bg-white/10 p-4 rounded-xl mb-6 flex gap-4 flex-wrap items-end">
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

        <button
          onClick={() => {
            setHasGenerated(true);
            fetchStats();
          }}
          disabled={loading}
          className="px-6 py-2 bg-amber-400 hover:bg-amber-500 text-black font-semibold rounded-lg transition disabled:opacity-50"
        >
          {loading ? "Génération..." : "Générer"}
        </button>

        <div className="flex flex-col">
          <label className="text-sm mb-1">Superviseur</label>
          <select
            value={superviseurFilter}
            onChange={(e) => setSuperviseurFilter(e.target.value)}
            className="px-3 py-2 rounded-lg text-black"
          >
            <option value="">Tous</option>
            {superviseurOptions.map((b) => (
              <option key={b.id} value={b.id}>
                {b.nom}
              </option>
            ))}
          </select>
        </div>
      </div>

      {!hasGenerated && (
        <p className="text-white/60 mt-6">
          Veuillez sélectionner une période puis cliquer sur Générer.
        </p>
      )}

      {hasGenerated && !loading && filteredBranches.map((branch) => renderBranch(branch))}

      <Footer />
    </div>
  );
}
