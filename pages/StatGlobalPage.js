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

      const { data: filteredBranchesData } = await supabase.rpc("get_descendant_branches", { root_id: rootIdValue });
      let filteredfilteredBranchesData = filteredBranchesData;

      // ✅ Application du filtre superviseur
      if (superviseurFilter) {
        filteredfilteredBranchesData = filteredBranchesData.filter(
          (b) => getAllDescendants(b).includes(superviseurFilter)
        );
      }

      if (!filteredfilteredBranchesData?.length) {
        setBranchesTree([]);
        setAllBranches([]);
        setMinistereMap({});
        setLoading(false);
        return;
      }

      const branchIds = filteredfilteredBranchesData.map((b) => b.id);

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

      const [attendanceData, formationData, baptemeData, evangeData, cellulesData] = await Promise.all([
        tableFetch("attendance_stats", "branche_id", "mois"),
        tableFetch("formations", "branche_id", "date_debut"),
        tableFetch("baptemes", "branche_id", "date"),
        tableFetch("rapport_evangelisation", "branche_id", "date"),
        tableFetch("cellules", "branche_id", "created_at")
      ]);

      // ================= REMPLISSAGE STATS =================
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
      let serviteurQuery = supabase
        .from("stats_ministere_besoin")
        .select("membre_id, eglise_id")
        .in("eglise_id", branchIds)
        .in("type", ["serviteur", "ministere"])
        .not("valeur", "is", null);

      if (dateDebut) serviteurQuery = serviteurQuery.gte("date_action", dateDebut);
      if (dateFin) serviteurQuery = serviteurQuery.lte("date_action", dateFin);

      const { data: serviteurData } = await serviteurQuery;

      const uniqueMap = {};
      serviteurData?.forEach((s) => {
        if (!uniqueMap[s.eglise_id]) uniqueMap[s.eglise_id] = new Set();
        uniqueMap[s.eglise_id].add(s.membre_id);
      });

      const allMembreIds = [...new Set(serviteurData?.map(s => s.membre_id) || [])];
      if (allMembreIds.length > 0) {
        const { data: membresData } = await supabase
          .from("membres_complets")
          .select("id, sexe")
          .in("id", allMembreIds);

        const sexeMap = {};
        membresData?.forEach(m => { sexeMap[m.id] = m.sexe; });

        Object.keys(uniqueMap).forEach((egliseId) => {
          uniqueMap[egliseId].forEach((membreId) => {
            const sexe = sexeMap[membreId];
            if (sexe === "Homme") statsMap[egliseId].serviteurs.hommes++;
            if (sexe === "Femme") statsMap[egliseId].serviteurs.femmes++;
          });
        });
      }

      // ================= CELLULES =================
      cellulesData.forEach(c => {
        const id = c.branche_id || c.eglise_id;
        if (id && statsMap[id]) {
          statsMap[id].cellules.total++;
        } else {
          console.warn("Cellule non comptée (id non trouvé dans statsMap):", c);
        }
      });

      // ================= ARBRE =================
      const map = {};
      filteredfilteredBranchesData.forEach((b) => {
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
        {/* … === Le render est identique au fichier original, inchangé === … */}
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
      {/* … === Rendu identique, inchangé === … */}
      <Footer />
    </div>
  );
}
