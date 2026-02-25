"use client";

import { useEffect, useState } from "react";
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
  const [branches, setBranches] = useState([]);
  const [statsParBranche, setStatsParBranche] = useState({});
  const [loading, setLoading] = useState(false);

  // 🔹 Récupérer la branche de l'utilisateur + enfants
  useEffect(() => {
    const fetchBranches = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: userProfile } = await supabase
        .from("profiles")
        .select("branche_id")
        .eq("id", user.id)
        .single();

      if (!userProfile?.branche_id) return;

      const parentId = userProfile.branche_id;

      // Parent
      const { data: parent } = await supabase
        .from("branches")
        .select("id,nom")
        .eq("id", parentId)
        .single();

      // Enfants directs
      const { data: enfants } = await supabase
        .from("branches")
        .select("id,nom")
        .eq("parent_id", parentId);

      const allBranches = [parent, ...(enfants || [])];
      setBranches(allBranches);
    };

    fetchBranches();
  }, []);

  // 🔹 Fonction pour récupérer les stats par branche
  const fetchStats = async () => {
    if (!branches.length) return;
    setLoading(true);

    const newStats = {};

    for (const branche of branches) {
      // -------- ATTENDANCE --------
      const { data: attendanceData } = await supabase
        .from("attendance")
        .select("*")
        .eq("branche_id", branche.id)
        .gte(dateDebut ? "date" : null, dateDebut || undefined)
        .lte(dateFin ? "date" : null, dateFin || undefined);

      const totals = { hommes: 0, femmes: 0, jeunes: 0, enfants: 0, connectes: 0, nouveauxVenus: 0, nouveauxConvertis: 0 };
      attendanceData?.forEach(r => {
        totals.hommes += Number(r.hommes) || 0;
        totals.femmes += Number(r.femmes) || 0;
        totals.jeunes += Number(r.jeunes) || 0;
        totals.enfants += Number(r.enfants) || 0;
        totals.connectes += Number(r.connectes) || 0;
        totals.nouveauxVenus += Number(r.nouveauxVenus) || 0;
        totals.nouveauxConvertis += Number(r.nouveauxConvertis) || 0;
      });

      newStats[branche.id] = totals;
    }

    setStatsParBranche(newStats);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-[#333699]">
      <HeaderPages />
      <h1 className="text-2xl font-bold mt-4 mb-6 text-center text-white">
        Rapport <span className="text-amber-300">Statistiques Globales</span>
      </h1>

      {/* FILTRES */}
      <div className="bg-white/10 p-6 rounded-2xl shadow-lg mt-6 flex gap-4 flex-wrap text-white">
        <input type="date" value={dateDebut} onChange={(e) => setDateDebut(e.target.value)} className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white" />
        <input type="date" value={dateFin} onChange={(e) => setDateFin(e.target.value)} className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white" />
        <button onClick={fetchStats} className="bg-[#2a2f85] px-6 py-2 rounded-xl hover:bg-[#1f2366]">Générer</button>
      </div>

      {/* TABLE */}
      {!loading && Object.keys(statsParBranche).length > 0 && (
        <div className="w-full max-w-full overflow-x-auto mt-6 scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-transparent">
          <div className="w-max space-y-4">
            {branches.map((branche) => (
              <div key={branche.id} className="space-y-2">
                <h2 className="text-xl font-semibold text-white">{branche.nom}</h2>
                <div className="flex font-semibold uppercase text-white px-4 py-2 border-b border-white/30 bg-white/5 rounded-t-xl whitespace-nowrap">
                  <div className="min-w-[180px] ml-1">Type</div>
                  <div className="min-w-[120px] text-center">Hommes</div>
                  <div className="min-w-[120px] text-center">Femmes</div>
                  <div className="min-w-[120px] text-center">Jeunes</div>
                  <div className="min-w-[120px] text-center">Enfants</div>
                  <div className="min-w-[140px] text-center">Connectés</div>
                  <div className="min-w-[150px] text-center">Nouveaux Venus</div>
                  <div className="min-w-[160px] text-center">Nouveau Converti</div>
                </div>

                <div className="flex items-center px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 transition border-l-4 border-blue-400">
                  <div className="min-w-[180px] text-white font-semibold">Culte</div>
                  <div className="min-w-[120px] text-center text-white">{statsParBranche[branche.id]?.hommes ?? 0}</div>
                  <div className="min-w-[120px] text-center text-white">{statsParBranche[branche.id]?.femmes ?? 0}</div>
                  <div className="min-w-[120px] text-center text-white">{statsParBranche[branche.id]?.jeunes ?? 0}</div>
                  <div className="min-w-[120px] text-center text-white">{statsParBranche[branche.id]?.enfants ?? 0}</div>
                  <div className="min-w-[140px] text-center text-white">{statsParBranche[branche.id]?.connectes ?? 0}</div>
                  <div className="min-w-[150px] text-center text-white">{statsParBranche[branche.id]?.nouveauxVenus ?? 0}</div>
                  <div className="min-w-[160px] text-center text-white">{statsParBranche[branche.id]?.nouveauxConvertis ?? 0}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
