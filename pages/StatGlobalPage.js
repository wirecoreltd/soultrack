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
  const [loading, setLoading] = useState(false);
  const [branchesTree, setBranchesTree] = useState([]);
  const [superviseurId, setSuperviseurId] = useState("");

  const fetchStats = async () => {
    if (!superviseurId) {
      alert("Veuillez entrer un ID superviseur.");
      return;
    }

    setLoading(true);

    try {
      // 🔹 Appel de la fonction RPC pour récupérer les stats filtrées par superviseur
      const { data, error } = await supabase
        .rpc("get_branches_stats", {
          supervisor_id_input: superviseurId,
          date_debut_input: dateDebut || null,
          date_fin_input: dateFin || null,
        });

      if (error) {
        console.error("Erreur fetch stats:", error);
        setBranchesTree([]);
        setLoading(false);
        return;
      }

      // 🔹 Construire la map pour hiérarchie
      const mapBranches = {};
      data.forEach((b) => {
        mapBranches[b.id] = {
          id: b.id,
          nom: b.nom,
          superviseur_id: b.superviseur_id,
          stats: {
            hommes: b.hommes,
            femmes: b.femmes,
            jeunes: b.jeunes,
            enfants: b.enfants,
            connectes: b.connectes,
            nouveaux_venus: b.nouveaux_venus,
            nouveau_converti: b.nouveau_converti,
            moissonneurs: b.moissonneurs,
          },
          enfants: [],
        };
      });

      // 🔹 Construire l’arbre hiérarchique
      const tree = [];
      Object.values(mapBranches).forEach((b) => {
        if (b.superviseur_id && mapBranches[b.superviseur_id]) {
          mapBranches[b.superviseur_id].enfants.push(b);
        } else {
          tree.push(b);
        }
      });

      setBranchesTree(tree);
    } catch (err) {
      console.error("Erreur fetch stats:", err);
      setBranchesTree([]);
    } finally {
      setLoading(false);
    }
  };

  const renderBranch = (b) => (
    <div key={b.id} className="w-full">
      <div className="text-xl font-bold text-amber-300 mb-3">{b.nom}</div>

      <div className="flex font-semibold uppercase text-white px-4 py-3 border-b border-white/30 bg-white/5 rounded-t-xl whitespace-nowrap">
        <div className="min-w-[180px] ml-1">Type</div>
        <div className="min-w-[120px] text-center">Hommes</div>
        <div className="min-w-[120px] text-center">Femmes</div>
        <div className="min-w-[120px] text-center">Jeunes</div>
        <div className="min-w-[120px] text-center">Enfants</div>
        <div className="min-w-[140px] text-center">Connectés</div>
        <div className="min-w-[150px] text-center">Nouveaux</div>
        <div className="min-w-[180px] text-center">Convertis</div>
        <div className="min-w-[160px] text-center">Moissonneurs</div>
      </div>

      <div className="flex items-center px-4 py-3 rounded-b-xl bg-white/10 hover:bg-white/20 transition border-l-4 border-blue-400 whitespace-nowrap">
        <div className="min-w-[180px] text-white font-semibold">Culte</div>
        <div className="min-w-[120px] text-center text-white">{b.stats.hommes}</div>
        <div className="min-w-[120px] text-center text-white">{b.stats.femmes}</div>
        <div className="min-w-[120px] text-center text-white">{b.stats.jeunes}</div>
        <div className="min-w-[120px] text-center text-white">{b.stats.enfants}</div>
        <div className="min-w-[140px] text-center text-white">{b.stats.connectes}</div>
        <div className="min-w-[150px] text-center text-white">{b.stats.nouveaux_venus}</div>
        <div className="min-w-[180px] text-center text-white">{b.stats.nouveau_converti}</div>
        <div className="min-w-[160px] text-center text-white">{b.stats.moissonneurs}</div>
      </div>

      {b.enfants.length > 0 && (
        <div className="pl-8 mt-4 space-y-4">
          {b.enfants.map((child) => renderBranch(child))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-[#333699]">
      <HeaderPages />

      <h1 className="text-2xl font-bold mt-4 mb-6 text-center text-white">
        Rapport <span className="text-amber-300">Statistiques Globales</span>
      </h1>

      {/* FILTRES */}
      <div className="bg-white/10 p-6 rounded-2xl shadow-lg mt-6 flex gap-4 flex-wrap text-white">
        <input
          type="date"
          value={dateDebut}
          onChange={(e) => setDateDebut(e.target.value)}
          className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white"
        />
        <input
          type="date"
          value={dateFin}
          onChange={(e) => setDateFin(e.target.value)}
          className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white"
        />
        <input
          type="text"
          placeholder="ID Superviseur"
          value={superviseurId}
          onChange={(e) => setSuperviseurId(e.target.value)}
          className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white"
        />
        <button
          onClick={fetchStats}
          className="bg-[#2a2f85] px-6 py-2 rounded-xl hover:bg-[#1f2366]"
        >
          Générer
        </button>
      </div>

      {/* AFFICHAGE */}
      {!loading && branchesTree.length > 0 && (
        <div className="w-full max-w-full overflow-x-auto mt-8 space-y-8">
          {branchesTree.map((b) => renderBranch(b))}
        </div>
      )}

      {loading && <div className="text-white mt-4">Chargement...</div>}

      <Footer />
    </div>
  );
}
