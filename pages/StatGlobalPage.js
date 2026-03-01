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
  const [superviseurFilter, setSuperviseurFilter] = useState("");
  const [allBranches, setAllBranches] = useState([]);
  const [rootId, setRootId] = useState(null);
  const [expandedBranches, setExpandedBranches] = useState([]);
  const [ministereMap, setMinistereMap] = useState({});

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

      const { data: workingBranchesData } = await supabase.rpc(
        "get_descendant_branches",
        { root_id: rootIdValue }
      );

      if (!workingBranchesData?.length) {
        setBranchesTree([]);
        setAllBranches([]);
        setMinistereMap({});
        setLoading(false);
        return;
      }

      // ================= FILTRE SUPERVISEUR =================
      let workingBranches = workingBranchesData;

      if (superviseurFilter) {
        const getDescendantsFlat = (branchId, branches) => {
          const children = branches.filter(
            (b) => b.superviseur_id === branchId
          );

          return children.reduce(
            (acc, child) => [
              ...acc,
              child,
              ...getDescendantsFlat(child.id, branches),
            ],
            []
          );
        };

        const selectedBranch = workingBranchesData.find(
          (b) => b.id === superviseurFilter
        );

        if (selectedBranch) {
          const descendants = getDescendantsFlat(
            superviseurFilter,
            workingBranchesData
          );

          workingBranches = [selectedBranch, ...descendants];
        }
      }

      const branchIds = workingBranches.map((b) => b.id);

      // ================= INITIALISATION STATS =================
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
          evangelisation: {
            hommes: 0,
            femmes: 0,
            priere: 0,
            nouveau_converti: 0,
            reconciliation: 0,
            moissonneurs: 0,
          },
          serviteurs: { hommes: 0, femmes: 0 },
          cellules: { total: 0 },
        };
      });

      const tableFetch = async (table, branchField, dateField) => {
        let query = supabase
          .from(table)
          .select("*")
          .in(branchField, branchIds);

        if (dateDebut) query = query.gte(dateField, dateDebut);
        if (dateFin) query = query.lte(dateField, dateFin);

        const { data } = await query;
        return data || [];
      };

      const [
        attendanceData,
        formationData,
        baptemeData,
        evangeData,
        cellulesData,
      ] = await Promise.all([
        tableFetch("attendance_stats", "branche_id", "mois"),
        tableFetch("formations", "branche_id", "date_debut"),
        tableFetch("baptemes", "branche_id", "date"),
        tableFetch("rapport_evangelisation", "branche_id", "date"),
        tableFetch("cellules", "branche_id", "created_at"),
      ]);

      attendanceData.forEach((s) => {
        const a = statsMap[s.branche_id]?.culte;
        if (!a) return;
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
        const form = statsMap[f.branche_id]?.formation;
        if (!form) return;
        form.hommes += Number(f.hommes) || 0;
        form.femmes += Number(f.femmes) || 0;
      });

      baptemeData.forEach((b) => {
        const bap = statsMap[b.branche_id]?.bapteme;
        if (!bap) return;
        bap.hommes += Number(b.hommes) || 0;
        bap.femmes += Number(b.femmes) || 0;
      });

      evangeData.forEach((e) => {
        const ev = statsMap[e.branche_id]?.evangelisation;
        if (!ev) return;
        ev.hommes += Number(e.hommes) || 0;
        ev.femmes += Number(e.femmes) || 0;
        ev.priere += Number(e.priere) || 0;
        ev.nouveau_converti += Number(e.nouveau_converti) || 0;
        ev.reconciliation += Number(e.reconciliation) || 0;
        ev.moissonneurs += Number(e.moissonneurs) || 0;
      });

      cellulesData.forEach((c) => {
        const id = c.branche_id || c.eglise_id;
        if (id && statsMap[id]) {
          statsMap[id].cellules.total++;
        }
      });

      // ================= CONSTRUCTION ARBRE =================
      const map = {};
      workingBranches.forEach((b) => {
        map[b.id] = {
          ...b,
          stats: statsMap[b.id],
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
      setMinistereMap({});
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
          {level >= 1 && branch.enfants.length > 0 && (
            <button
              onClick={() => toggleExpand(branch.id)}
              className="mr-2 text-xl"
            >
              {expandedBranches.includes(branch.id) ? "➖" : "➕"}
            </button>
          )}
          <div className="text-xl font-bold text-white">
            {branch.nom}
          </div>
        </div>

        <div className="bg-white/10 p-4 rounded-xl">
          <div>Culte Total: {culteTotal}</div>
          <div>Cellules: {branch.stats.cellules.total}</div>
        </div>

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
        Rapport Statistiques Globales
      </h1>

      <div className="flex justify-center mb-8 gap-4">
        <input
          type="date"
          value={dateDebut}
          onChange={(e) => setDateDebut(e.target.value)}
          className="px-3 py-2 rounded-lg text-black"
        />

        <input
          type="date"
          value={dateFin}
          onChange={(e) => setDateFin(e.target.value)}
          className="px-3 py-2 rounded-lg text-black"
        />

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

        <button
          onClick={fetchStats}
          className="bg-[#2a2f85] px-6 py-2 rounded-xl"
        >
          {loading ? "Générer..." : "Générer"}
        </button>
      </div>

      {branchesTree.map((branch) => renderBranch(branch))}

      <Footer />
    </div>
  );
}
