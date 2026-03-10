"use client";

import { useState, useEffect } from "react";
import supabase from "../lib/supabaseClient";
import HeaderPages from "../components/HeaderPages";
import Footer from "../components/Footer";
import ProtectedRoute from "../components/ProtectedRoute";

export default function EtatMembresWrapper() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur", "Responsable"]}>
      <EtatMembresPage />
    </ProtectedRoute>
  );
}

function EtatMembresPage() {
  const [branchesTree, setBranchesTree] = useState([]);
  const [allBranches, setAllBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rootId, setRootId] = useState(null);
  const [expandedBranches, setExpandedBranches] = useState([]);

  const toggleExpand = (branchId) => {
    setExpandedBranches(prev =>
      prev.includes(branchId) ? prev.filter(id => id !== branchId) : [...prev, branchId]
    );
  };

  const fetchMembres = async () => {
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

      // Récupérer toutes les branches descendantes
      const { data: branchesData } = await supabase.rpc("get_descendant_branches", { root_id: rootIdValue });
      if (!branchesData?.length) {
        setBranchesTree([]);
        setAllBranches([]);
        setLoading(false);
        return;
      }

      const branchIds = branchesData.map(b => b.id);

      // Récupérer tous les membres de ces branches
      const { data: membresData } = await supabase
        .from("membres_complets")
        .select("id, sexe, age, etat_contact, priere_salut, type_conversion, branche_id, cellule_id, ministry_id")
        .in("branche_id", branchIds);

      // Construire stats par branche
      const statsMap = {};
      branchIds.forEach(id => {
        statsMap[id] = {
          visiteur: 0,
          converti: 0,
          integre: 0,
          cellule: 0,
          ministere: 0,
          hommes: 0,
          femmes: 0
        };
      });

      membresData.forEach(m => {
        const s = statsMap[m.branche_id];
        if (!s) return;

        // Sexe
        if (m.sexe === "Homme") s.hommes++;
        if (m.sexe === "Femme") s.femmes++;

        // Parcours spirituel
        if (m.etat_contact === "visiteur") s.visiteur++;
        if (m.priere_salut === "Oui" && m.type_conversion === "Nouveau converti") s.converti++;
        if (m.etat_contact === "integre") s.integre++;
        if (m.cellule_id) s.cellule++;
        if (m.ministry_id) s.ministere++;
      });

      // Construire l'arbre des branches
      const map = {};
      branchesData.forEach(b => {
        map[b.id] = { ...b, stats: statsMap[b.id], enfants: [] };
      });
      const tree = [];
      Object.values(map).forEach(b => {
        if (b.superviseur_id && map[b.superviseur_id]) map[b.superviseur_id].enfants.push(b);
        else tree.push(b);
      });

      setBranchesTree(tree);
      setAllBranches(Object.values(map));

    } catch (err) {
      console.error("Erreur fetch membres:", err);
      setBranchesTree([]);
      setAllBranches([]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchMembres(); }, []);

  const renderBranch = (branch, level = 0) => {
    const isExpanded = expandedBranches.includes(branch.id);

    // Totaux généraux si superviseur collapsed
    const totalStats = branch.enfants.length > 0 && !isExpanded
      ? branch.enfants.reduce((acc, child) => {
          Object.keys(acc).forEach(k => acc[k] += child.stats[k] || 0);
          return acc;
        }, { ...branch.stats })
      : branch.stats;

    return (
      <div key={branch.id} className="mt-6">
        <div className="flex items-center mb-2">
          {level >= 1 && branch.enfants.length > 0 && (
            <button onClick={() => toggleExpand(branch.id)} className="mr-2 text-xl">
              {isExpanded ? "➖" : "➕"}
            </button>
          )}
          <span className={`text-xl font-semibold ${branch.enfants.length > 0 ? "text-amber-300" : "text-white"}`}>
            {branch.nom}
          </span>
          {branch.enfants.length > 0 && !isExpanded && (
            <span className="text-sm text-amber-300 ml-2">• Total général</span>
          )}
        </div>

        <div className="flex gap-4 flex-wrap">
          <div className="bg-white/10 p-3 rounded-xl border-l-4 border-blue-400">
            <p>Visiteur: {totalStats.visiteur}</p>
            <p>Converti: {totalStats.converti}</p>
            <p>Intégré: {totalStats.integre}</p>
            <p>Cellule: {totalStats.cellule}</p>
            <p>Ministère: {totalStats.ministere}</p>
            <p>Hommes: {totalStats.hommes}</p>
            <p>Femmes: {totalStats.femmes}</p>
          </div>
        </div>

        {branch.enfants.map(child => (level === 0 || isExpanded) ? renderBranch(child, level + 1) : null)}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#333699] p-6 text-white">
      <HeaderPages />
      <h1 className="text-2xl font-bold text-center mb-8">
        État des <span className="text-amber-300">Membres</span>
      </h1>
      {loading ? (
        <p className="text-center mt-10">Chargement des membres...</p>
      ) : (
        branchesTree.map(branch => renderBranch(branch))
      )}
      <Footer />
    </div>
  );
}
