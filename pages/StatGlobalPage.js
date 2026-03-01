"use client";

import { useState, useMemo } from "react";
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

  const toggleExpand = (branchId) => {
    setExpandedBranches((prev) =>
      prev.includes(branchId)
        ? prev.filter((id) => id !== branchId)
        : [...prev, branchId]
    );
  };

  // =========================
  // FETCH STATS
  // =========================
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
        setLoading(false);
        return;
      }

      setAllBranches(branchesData);

      const branchIds = branchesData.map((b) => b.id);

      // ================= INIT STATS MAP =================
      const statsMap = {};
      branchIds.forEach((id) => {
        statsMap[id] = {
          culte: { hommes: 0, femmes: 0, jeunes: 0, enfants: 0, connectes: 0, nouveaux_venus: 0, nouveau_converti: 0, moissonneurs: 0 },
          formation: { hommes: 0, femmes: 0 },
          bapteme: { hommes: 0, femmes: 0 },
          evangelisation: { hommes: 0, femmes: 0, priere: 0, nouveau_converti: 0, reconciliation: 0, moissonneurs: 0 },
          serviteurs: { hommes: 0, femmes: 0 },
          cellules: { total: 0 }
        };
      });

      const tableFetch = async (table, branchField, dateField) => {
        let query = supabase.from(table).select("*").in(branchField, branchIds);
        if (dateDebut) query = query.gte(dateField, dateDebut);
        if (dateFin) query = query.lte(dateField, dateFin);
        const { data } = await query;
        return data || [];
      };

      const [attendanceData, formationData, baptemeData, evangeData, cellulesData] =
        await Promise.all([
          tableFetch("attendance_stats", "branche_id", "mois"),
          tableFetch("formations", "branche_id", "date_debut"),
          tableFetch("baptemes", "branche_id", "date"),
          tableFetch("rapport_evangelisation", "branche_id", "date"),
          tableFetch("cellules", "branche_id", "created_at"),
        ]);

      // ================= REMPLISSAGE =================

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

      // ================= SERVITEURS =================
      const { data: serviteurData } = await supabase
        .from("stats_ministere_besoin")
        .select("membre_id, eglise_id")
        .in("eglise_id", branchIds)
        .in("type", ["serviteur", "ministere"])
        .not("valeur", "is", null);

      const uniqueMap = {};
      serviteurData?.forEach((s) => {
        if (!uniqueMap[s.eglise_id]) uniqueMap[s.eglise_id] = new Set();
        uniqueMap[s.eglise_id].add(s.membre_id);
      });

      const allMembreIds = [...new Set(serviteurData?.map((s) => s.membre_id) || [])];

      if (allMembreIds.length > 0) {
        const { data: membresData } = await supabase
          .from("membres_complets")
          .select("id, sexe")
          .in("id", allMembreIds);

        const sexeMap = {};
        membresData?.forEach((m) => (sexeMap[m.id] = m.sexe));

        Object.keys(uniqueMap).forEach((egliseId) => {
          uniqueMap[egliseId].forEach((membreId) => {
            const sexe = sexeMap[membreId];
            if (sexe === "Homme") statsMap[egliseId].serviteurs.hommes++;
            if (sexe === "Femme") statsMap[egliseId].serviteurs.femmes++;
          });
        });
      }

      // ================= CELLULES =================
      cellulesData.forEach((c) => {
        if (statsMap[c.branche_id]) {
          statsMap[c.branche_id].cellules.total++;
        }
      });

      // ================= BUILD TREE =================
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

    } catch (err) {
      console.error("Erreur fetch stats:", err);
    }

    setLoading(false);
  };

  // ================= FILTRE SUPERVISEUR =================
  const displayedBranches = useMemo(() => {
    if (!superviseurFilter) return branchesTree;
    return branchesTree.filter((b) => b.id === superviseurFilter);
  }, [branchesTree, superviseurFilter]);

  const superviseurOptions = allBranches.filter(
    (b) => b.superviseur_id === rootId
  );

  // ================= RENDER =================

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
            <input type="date" value={dateDebut} onChange={(e) => setDateDebut(e.target.value)} className="px-3 py-2 rounded-lg text-black"/>
          </div>

          <div className="flex flex-col">
            <label className="text-sm mb-1">Date fin</label>
            <input type="date" value={dateFin} onChange={(e) => setDateFin(e.target.value)} className="px-3 py-2 rounded-lg text-black"/>
          </div>

          <div className="flex flex-col">
            <label className="text-sm mb-1">Superviseur</label>
            <select value={superviseurFilter} onChange={(e) => setSuperviseurFilter(e.target.value)} className="px-3 py-2 rounded-lg text-black">
              <option value="">Tous</option>
              {superviseurOptions.map((s) => (
                <option key={s.id} value={s.id}>{s.nom}</option>
              ))}
            </select>
          </div>

          <button onClick={fetchStats} className="bg-[#2a2f85] px-6 py-2 rounded-xl hover:bg-[#1f2366] transition text-white">
            {loading ? "Générer..." : "Générer"}
          </button>

        </div>
      </div>

      {displayedBranches.map((branch) => (
        <div key={branch.id} className="mb-6">
          <div className="text-xl font-bold text-amber-300 mb-2">
            {branch.nom}
          </div>
          <div>Cellules : {branch.stats.cellules.total}</div>
        </div>
      ))}

      <Footer />
    </div>
  );
}
