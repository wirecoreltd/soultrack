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

  const toggleExpand = (branchId) => {
    setExpandedBranches((prev) =>
      prev.includes(branchId)
        ? prev.filter((id) => id !== branchId)
        : [...prev, branchId]
    );
  };

  const getAllDescendants = (branch) => {
    let descendants = [branch.id];
    branch.enfants.forEach((child) => {
      descendants = descendants.concat(getAllDescendants(child));
    });
    return descendants;
  };

  const fetchStats = async () => {
    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

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

      if (!branchesData || branchesData.length === 0) {
        setBranchesTree([]);
        setAllBranches([]);
        setLoading(false);
        return;
      }

      const branchIds = branchesData.map((b) => b.id);

      /* ================= CULTE ================= */
      let attendanceQuery = supabase
        .from("attendance_stats")
        .select("*")
        .in("branche_id", branchIds);

      if (dateDebut) attendanceQuery = attendanceQuery.gte("mois", dateDebut);
      if (dateFin) attendanceQuery = attendanceQuery.lte("mois", dateFin);

      const { data: attendanceData } = await attendanceQuery;

      /* ================= FORMATION ================= */
      let formationQuery = supabase
        .from("formations")
        .select("*")
        .in("branche_id", branchIds);

      if (dateDebut)
        formationQuery = formationQuery.gte("date_debut", dateDebut);
      if (dateFin) formationQuery = formationQuery.lte("date_fin", dateFin);

      const { data: formationData } = await formationQuery;

      /* ================= BAPTEME (CORRIGÉ) ================= */
      let baptemeQuery = supabase
        .from("baptemes")
        .select("*")
        .in("branche_id", branchIds);

      if (dateDebut) baptemeQuery = baptemeQuery.gte("date", dateDebut);
      if (dateFin) baptemeQuery = baptemeQuery.lte("date", dateFin);

      const { data: baptemeData } = await baptemeQuery;

      /* ================= MAP ================= */
      const statsMap = {};

      branchIds.forEach((id) => {
        statsMap[id] = {
          culte: {
            hommes: 0,
            femmes: 0,
            jeunes: 0,
            enfants: 0,
            connectes: 0,
            nouveaux_venus: 0,
            nouveau_converti: 0,
            moissonneurs: 0,
          },
          formation: { hommes: 0, femmes: 0 },
          bapteme: { hommes: 0, femmes: 0 },
        };
      });

      attendanceData?.forEach((stat) => {
        const s = statsMap[stat.branche_id].culte;
        s.hommes += Number(stat.hommes) || 0;
        s.femmes += Number(stat.femmes) || 0;
        s.jeunes += Number(stat.jeunes) || 0;
        s.enfants += Number(stat.enfants) || 0;
        s.connectes += Number(stat.connectes) || 0;
        s.nouveaux_venus += Number(stat.nouveaux_venus) || 0;
        s.nouveau_converti += Number(stat.nouveau_converti) || 0;
        s.moissonneurs += Number(stat.moissonneurs) || 0;
      });

      formationData?.forEach((f) => {
        const s = statsMap[f.branche_id].formation;
        s.hommes += Number(f.hommes) || 0;
        s.femmes += Number(f.femmes) || 0;
      });

      baptemeData?.forEach((b) => {
        const s = statsMap[b.branche_id].bapteme;
        s.hommes += Number(b.hommes) || 0;
        s.femmes += Number(b.femmes) || 0;
      });

      const map = {};
      branchesData.forEach((b) => {
        map[b.id] = { ...b, stats: statsMap[b.id], enfants: [] };
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
      console.error("Erreur:", err);
    }

    setLoading(false);
  };

  const renderBranch = (branch, level = 0) => {
    const culteTotal =
      branch.stats.culte.hommes +
      branch.stats.culte.femmes +
      branch.stats.culte.jeunes;

    return (
      <div key={branch.id} className="mt-8">
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

        <div className="flex items-center px-4 py-3 rounded-xl bg-white/10 border-l-4 border-green-400">
          <div className="min-w-[180px] font-semibold">Culte</div>
          <div className="min-w-[120px] text-center">
            {branch.stats.culte.hommes}
          </div>
          <div className="min-w-[120px] text-center">
            {branch.stats.culte.femmes}
          </div>
          <div className="min-w-[120px] text-center">
            {branch.stats.culte.jeunes}
          </div>
          <div className="min-w-[120px] text-center">{culteTotal}</div>
        </div>

        {level !== 1 || expandedBranches.includes(branch.id)
          ? branch.enfants.map((child) => renderBranch(child, level + 1))
          : null}
      </div>
    );
  };

  const superviseurOptions = allBranches.filter(
    (b) => b.superviseur_id === rootId
  );

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
          <label>Date début</label>
          <input type="date" value={dateDebut}
            onChange={(e) => setDateDebut(e.target.value)}
            className="px-3 py-2 rounded-lg text-black" />
        </div>

        <div className="flex flex-col">
          <label>Date fin</label>
          <input type="date" value={dateFin}
            onChange={(e) => setDateFin(e.target.value)}
            className="px-3 py-2 rounded-lg text-black" />
        </div>

        <button
          onClick={() => {
            setHasGenerated(true);
            fetchStats();
          }}
          disabled={loading}
          className="px-6 py-2 bg-amber-400 hover:bg-amber-500 text-black font-semibold rounded-lg"
        >
          {loading ? "Génération..." : "Générer"}
        </button>

        <div className="flex flex-col">
          <label>Superviseur</label>
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
        <p className="text-white/60">
          Sélectionnez une période puis cliquez sur Générer.
        </p>
      )}

      {hasGenerated && !loading &&
        filteredBranches.map((branch) => renderBranch(branch))}

      <Footer />
    </div>
  );
}
