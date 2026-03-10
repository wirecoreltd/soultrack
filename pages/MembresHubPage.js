"use client";

import { useState, useEffect } from "react";
import supabase from "../lib/supabaseClient";
import HeaderPages from "../components/HeaderPages";
import ProtectedRoute from "../components/ProtectedRoute";
import Footer from "../components/Footer";

export default function MembersHubWrapper() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur"]}>
      <MembersHub />
    </ProtectedRoute>
  );
}

function MembersHub() {
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [branchesTree, setBranchesTree] = useState([]);
  const [loading, setLoading] = useState(false);
  const [allBranches, setAllBranches] = useState([]);
  const [rootId, setRootId] = useState(null);
  const [expandedBranches, setExpandedBranches] = useState([]);

  const toggleExpand = (branchId) => {
    setExpandedBranches(prev => 
      prev.includes(branchId) ? prev.filter(id => id !== branchId) : [...prev, branchId]
    );
  };

  const fetchStats = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profileData } = await supabase.from("profiles").select("branche_id").eq("id", user.id).single();
      const rootIdValue = profileData.branche_id;
      setRootId(rootIdValue);

      const { data: branches } = await supabase.rpc("get_descendant_branches", { root_id: rootIdValue });
      if (!branches?.length) {
        setBranchesTree([]);
        setAllBranches([]);
        setLoading(false);
        return;
      }

      const branchIds = branches.map(b => b.id);

      // ===== Membres du hub =====
      let membersQuery = supabase.from("membres_complets").select("id, sexe, age, venu, priere_salut, type_conversion, reconciliation, created_at").in("branche_id", branchIds);
      if (dateDebut) membersQuery = membersQuery.gte("created_at", dateDebut);
      if (dateFin) membersQuery = membersQuery.lte("created_at", dateFin);
      const { data: membersData } = await membersQuery;

      // ===== Évangélisation =====
      let evangeQuery = supabase.from("rapport_evangelisation").select("branche_id, nouveau_converti, reconciliation").in("branche_id", branchIds);
      if (dateDebut) evangeQuery = evangeQuery.gte("date", dateDebut);
      if (dateFin) evangeQuery = evangeQuery.lte("date", dateFin);
      const { data: evangeData } = await evangeQuery;

      // ===== Stats par branche =====
      const statsMap = {};
      branchIds.forEach(id => {
        statsMap[id] = {
          total: 0,
          hommes: 0,
          femmes: 0,
          jeunes: 0,
          enfants: 0,
          reseau: 0,
          invite: 0,
          evang: 0,
          priere_salut: 0,
          conversion: 0,
          reconciliation: 0
        };
      });

      membersData.forEach(m => {
        const s = statsMap[m.branche_id];
        s.total++;
        if (m.sexe === "Homme") s.hommes++;
        if (m.sexe === "Femme") s.femmes++;
        if (["12-17 ans", "18-25 ans"].includes(m.age)) s.jeunes++;
        if (["12-17 ans"].includes(m.age)) s.enfants++;

        if (m.venu === "réseaux") s.reseau++;
        if (m.venu === "invité") s.invite++;
        if (m.venu === "evangélisation") s.evang++;
        if (m.priere_salut === "Oui") s.priere_salut++;
        if (m.type_conversion === "Nouveau converti") s.conversion++;
        if (m.type_conversion === "Réconciliation") s.reconciliation++;
      });

      evangeData?.forEach(e => {
        const s = statsMap[e.branche_id];
        s.conversion += e.nouveau_converti || 0;
        s.reconciliation += e.reconciliation || 0;
      });

      // ===== Construire arbre =====
      const map = {};
      branches.forEach(b => map[b.id] = { ...b, stats: statsMap[b.id], enfants: [] });
      const tree = [];
      Object.values(map).forEach(b => {
        if (b.superviseur_id && map[b.superviseur_id]) map[b.superviseur_id].enfants.push(b);
        else tree.push(b);
      });

      setBranchesTree(tree);
      setAllBranches(Object.values(map));

    } catch (err) {
      console.error("Erreur fetch Members Hub:", err);
      setBranchesTree([]);
      setAllBranches([]);
    }
    setLoading(false);
  };

  const renderBranch = (branch, level = 0) => {
    const isExpanded = expandedBranches.includes(branch.id);
    return (
      <div key={branch.id} className="mt-6">
        <div className="flex items-center mb-2">
          {branch.enfants.length > 0 && (
            <button onClick={() => toggleExpand(branch.id)} className="mr-2 text-xl">
              {isExpanded ? "➖" : "➕"}
            </button>
          )}
          <span className={`text-xl font-semibold ${branch.enfants.length > 0 ? "text-amber-300" : "text-white"}`}>{branch.nom}</span>
        </div>

        <div className="overflow-x-auto">
          <div className="w-max flex gap-4 border border-white/30 p-2 rounded-xl bg-white/5">
            <div className="min-w-[150px] font-semibold">Statistique</div>
            <div className="min-w-[80px] text-center">Total</div>
            <div className="min-w-[80px] text-center">Hommes</div>
            <div className="min-w-[80px] text-center">Femmes</div>
            <div className="min-w-[80px] text-center">Jeunes</div>
            <div className="min-w-[80px] text-center">Enfants</div>
            <div className="min-w-[80px] text-center">Réseau</div>
            <div className="min-w-[80px] text-center">Invité</div>
            <div className="min-w-[80px] text-center">Évangélisation</div>
            <div className="min-w-[80px] text-center">Prière</div>
            <div className="min-w-[80px] text-center">Conversion</div>
            <div className="min-w-[80px] text-center">Réconciliation</div>
          </div>

          <div className="w-max flex gap-4 border border-white/30 p-2 rounded-xl bg-white/10 mt-1">
            <div className="min-w-[150px] font-semibold">Hub {branch.nom}</div>
            <div className="min-w-[80px] text-center">{branch.stats.total}</div>
            <div className="min-w-[80px] text-center">{branch.stats.hommes}</div>
            <div className="min-w-[80px] text-center">{branch.stats.femmes}</div>
            <div className="min-w-[80px] text-center">{branch.stats.jeunes}</div>
            <div className="min-w-[80px] text-center">{branch.stats.enfants}</div>
            <div className="min-w-[80px] text-center">{branch.stats.reseau}</div>
            <div className="min-w-[80px] text-center">{branch.stats.invite}</div>
            <div className="min-w-[80px] text-center">{branch.stats.evang}</div>
            <div className="min-w-[80px] text-center">{branch.stats.priere_salut}</div>
            <div className="min-w-[80px] text-center">{branch.stats.conversion}</div>
            <div className="min-w-[80px] text-center">{branch.stats.reconciliation}</div>
          </div>
        </div>

        {branch.enfants.map(child => isExpanded ? renderBranch(child, level + 1) : null)}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#333699] p-6 text-white">
      <HeaderPages />
      <h1 className="text-2xl font-bold text-center mb-6">Members Hub</h1>

      <div className="flex justify-center mb-6 gap-4">
        <input type="date" value={dateDebut} onChange={e => setDateDebut(e.target.value)} className="px-3 py-2 rounded-lg text-black" />
        <input type="date" value={dateFin} onChange={e => setDateFin(e.target.value)} className="px-3 py-2 rounded-lg text-black" />
        <button onClick={fetchStats} className="bg-[#2a2f85] px-4 py-2 rounded-xl hover:bg-[#1f2366] transition">{loading ? "Chargement..." : "Générer"}</button>
      </div>

      {branchesTree.map(branch => renderBranch(branch))}
      <Footer />
    </div>
  );
}
