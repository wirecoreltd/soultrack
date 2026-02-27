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
  const [rapports, setRapports] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    try {
      // 🔹 Récupérer le user connecté
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Utilisateur non connecté");

      // 🔹 Récupérer branche racine du user
      const { data: profile } = await supabase
        .from("profiles")
        .select("branche_id")
        .eq("id", user.id)
        .single();

      const rootBranchId = profile.branche_id;

      // 🔹 Récupérer toutes les branches descendantes
      const { data: branchesData } = await supabase.rpc("get_descendant_branches", { root_id: rootBranchId });
      if (!branchesData || branchesData.length === 0) {
        setRapports([]);
        setLoading(false);
        return;
      }

      const branchIds = branchesData.map(b => b.id);

      // 🔹 Récupérer stats cumulées
      let statsQuery = supabase.from("attendance_stats").select("*").in("branche_id", branchIds);
      if (dateDebut) statsQuery = statsQuery.gte("mois", dateDebut);
      if (dateFin) statsQuery = statsQuery.lte("mois", dateFin);
      const { data: statsData } = await statsQuery;

      // 🔹 Cumuler stats par branche
      const statsMap = {};
      statsData.forEach(stat => {
        if (!statsMap[stat.branche_id]) {
          statsMap[stat.branche_id] = {
            hommes: 0, femmes: 0, jeunes: 0, enfants: 0,
            connectes: 0, nouveauxVenus: 0, nouveauxConvertis: 0, moissonneurs: 0
          };
        }
        const s = statsMap[stat.branche_id];
        s.hommes += Number(stat.hommes) || 0;
        s.femmes += Number(stat.femmes) || 0;
        s.jeunes += Number(stat.jeunes) || 0;
        s.enfants += Number(stat.enfants) || 0;
        s.connectes += Number(stat.connectes) || 0;
        s.nouveauxVenus += Number(stat.nouveaux_venus || stat.nouveauxVenus) || 0;
        s.nouveauxConvertis += Number(stat.nouveau_converti || stat.nouveauxConvertis) || 0;
        s.moissonneurs += Number(stat.moissonneurs) || 0;
      });

      // 🔹 Construire arbre
      const mapBranches = {};
      branchesData.forEach(b => {
        mapBranches[b.id] = {
          ...b,
          stats: statsMap[b.id] || {
            hommes: 0, femmes: 0, jeunes: 0, enfants: 0,
            connectes: 0, nouveauxVenus: 0, nouveauxConvertis: 0, moissonneurs: 0
          },
          enfants: []
        };
      });

      const tree = [];
      Object.values(mapBranches).forEach(b => {
        if (b.superviseur_id && mapBranches[b.superviseur_id]) {
          mapBranches[b.superviseur_id].enfants.push(b);
        } else {
          tree.push(b);
        }
      });

      // 🔹 Aplatir arbre pour table avec couleurs bordure
      const flattened = [];
      const traverse = (branch, color = "border-green-400") => {
        flattened.push({
          label: branch.nom,
          data: branch.stats,
          border: color
        });
        branch.enfants.forEach(child => traverse(child, "border-orange-400"));
      };
      tree.forEach(b => traverse(b));

      setRapports(flattened);
    } catch (err) {
      console.error("Erreur fetch stats:", err);
      setRapports([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStats();
  }, [dateDebut, dateFin]);

  return (
    <div className="min-h-screen bg-[#333699] p-6 text-white">
      <HeaderPages />
      <h1 className="text-2xl font-bold mb-6">
        Rapport <span className="text-amber-300">Statistiques Globales</span>
      </h1>

      {/* FILTRES DATE */}
      <div className="bg-white/10 p-4 rounded-xl mb-6 flex gap-4 flex-wrap">
        <input
          type="date"
          value={dateDebut}
          onChange={e => setDateDebut(e.target.value)}
          className="px-3 py-2 rounded-lg text-black"
        />
        <input
          type="date"
          value={dateFin}
          onChange={e => setDateFin(e.target.value)}
          className="px-3 py-2 rounded-lg text-black"
        />
      </div>

      {/* TABLE */}
      {!loading && rapports.length > 0 && (
        <div className="w-full overflow-x-auto">
          <div className="w-max">
            {/* HEADER */}
            <div className="flex font-semibold uppercase text-white px-4 py-3 border-b border-white/30 bg-white/5 rounded-t-xl whitespace-nowrap">
              <div className="min-w-[180px]">Type</div>
              <div className="min-w-[80px] text-center">Hommes</div>
              <div className="min-w-[80px] text-center">Femmes</div>
              <div className="min-w-[80px] text-center">Jeunes</div>
              <div className="min-w-[80px] text-center">Total</div>
              <div className="min-w-[80px] text-center">Enfants</div>
              <div className="min-w-[80px] text-center">Connectés</div>
              <div className="min-w-[100px] text-center">Nouveaux</div>
              <div className="min-w-[100px] text-center">Convertis</div>
              <div className="min-w-[100px] text-center">Moissonneurs</div>
            </div>

            {/* LIGNES */}
            {rapports.map((r, idx) => (
              <div key={idx} className={`flex items-center px-4 py-3 border-l-4 ${r.border} bg-white/10`}>
                <div className="min-w-[180px] font-semibold">Culte</div>
                <div className="min-w-[80px] text-center">{r.data.hommes}</div>
                <div className="min-w-[80px] text-center">{r.data.femmes}</div>
                <div className="min-w-[80px] text-center">{r.data.jeunes}</div>
                <div className="min-w-[80px] text-center">{r.data.hommes + r.data.femmes + r.data.jeunes}</div>
                <div className="min-w-[80px] text-center">{r.data.enfants}</div>
                <div className="min-w-[80px] text-center">{r.data.connectes}</div>
                <div className="min-w-[100px] text-center">{r.data.nouveauxVenus}</div>
                <div className="min-w-[100px] text-center">{r.data.nouveauxConvertis}</div>
                <div className="min-w-[100px] text-center">{r.data.moissonneurs}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {loading && <p>Chargement...</p>}

      <Footer />
    </div>
  );
}
