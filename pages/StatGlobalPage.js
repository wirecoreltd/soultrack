"use client";

import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import HeaderPages from "../components/HeaderPages";
import Footer from "../components/Footer";
import ProtectedRoute from "../components/ProtectedRoute";

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

  const [userBrancheId, setUserBrancheId] = useState(null);
  const [branches, setBranches] = useState([]);
  const [statsByBranche, setStatsByBranche] = useState({});

  // 🔹 Récupérer la branche de l’utilisateur
  useEffect(() => {
    const fetchUserBranche = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("branche_id")
        .eq("id", user.id)
        .single();

      if (profile?.branche_id) setUserBrancheId(profile.branche_id);
    };
    fetchUserBranche();
  }, []);

  // 🔹 Récupérer la branche + enfants
  useEffect(() => {
    if (!userBrancheId) return;

    const fetchBranches = async () => {
      const { data: parent } = await supabase
        .from("branches")
        .select("id,nom")
        .eq("id", userBrancheId)
        .single();

      const { data: enfants } = await supabase
        .from("branches")
        .select("id,nom")
        .eq("parent_id", userBrancheId);

      const allBranches = [parent, ...(enfants || [])];
      setBranches(allBranches);
    };

    fetchBranches();
  }, [userBrancheId]);

  // 🔹 Récupérer les stats par branche
  const fetchStats = async () => {
    if (!branches.length) return;
    setLoading(true);

    const newStats = {};

    for (const branche of branches) {
      // Attendance
      const { data: attendanceData } = await supabase
        .from("attendance")
        .select("*")
        .eq("branche_id", branche.id)
        .gte(dateDebut ? "date" : null, dateDebut || undefined)
        .lte(dateFin ? "date" : null, dateFin || undefined);

      const attendanceTotals = { hommes: 0, femmes: 0, jeunes: 0, enfants: 0, connectes: 0, nouveauxVenus: 0, nouveauxConvertis: 0 };
      attendanceData?.forEach(r => {
        attendanceTotals.hommes += Number(r.hommes) || 0;
        attendanceTotals.femmes += Number(r.femmes) || 0;
        attendanceTotals.jeunes += Number(r.jeunes) || 0;
        attendanceTotals.enfants += Number(r.enfants) || 0;
        attendanceTotals.connectes += Number(r.connectes) || 0;
        attendanceTotals.nouveauxVenus += Number(r.nouveauxVenus) || 0;
        attendanceTotals.nouveauxConvertis += Number(r.nouveauxConvertis) || 0;
      });

      newStats[branche.id] = { attendanceTotals };
    }

    setStatsByBranche(newStats);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-[#333699]">
      <HeaderPages />
      <h1 className="text-2xl font-bold mt-4 mb-6 text-center text-white">
        Rapport <span className="text-amber-300">Statistiques Globales</span>
      </h1>

      {/* FILTRE */}
      <div className="bg-white/10 p-6 rounded-2xl shadow-lg mt-6 flex gap-4 flex-wrap text-white">
        <input type="date" value={dateDebut} onChange={(e) => setDateDebut(e.target.value)} className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white" />
        <input type="date" value={dateFin} onChange={(e) => setDateFin(e.target.value)} className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white" />
        <button onClick={fetchStats} className="bg-[#2a2f85] px-6 py-2 rounded-xl hover:bg-[#1f2366]">Générer</button>
      </div>

      {/* TABLES */}
      {!loading && branches.length > 0 && (
        <div className="w-full max-w-full overflow-x-auto mt-6 space-y-8">
          {branches.map((branche) => {
            const stats = statsByBranche[branche.id];
            if (!stats) return null;
            const r = stats.attendanceTotals;

            return (
              <div key={branche.id} className="bg-white/5 rounded-2xl p-4">
                <h2 className="text-xl font-bold text-white mb-2">{branche.nom}</h2>
                <div className="flex font-semibold text-white px-4 py-2 border-b border-white/30">
                  <div className="min-w-[180px]">Type</div>
                  <div className="min-w-[120px] text-center">Hommes</div>
                  <div className="min-w-[120px] text-center">Femmes</div>
                  <div className="min-w-[120px] text-center">Jeunes</div>
                  <div className="min-w-[120px] text-center">Enfants</div>
                  <div className="min-w-[140px] text-center">Connectés</div>
                  <div className="min-w-[150px] text-center">Nouveaux Venus</div>
                  <div className="min-w-[180px] text-center">Nouveau Converti</div>
                </div>
                <div className="flex text-white px-4 py-2 bg-white/10 rounded-b-lg">
                  <div className="min-w-[180px] font-semibold">Culte</div>
                  <div className="min-w-[120px] text-center">{r.hommes}</div>
                  <div className="min-w-[120px] text-center">{r.femmes}</div>
                  <div className="min-w-[120px] text-center">{r.jeunes}</div>
                  <div className="min-w-[120px] text-center">{r.enfants}</div>
                  <div className="min-w-[140px] text-center">{r.connectes}</div>
                  <div className="min-w-[150px] text-center">{r.nouveauxVenus}</div>
                  <div className="min-w-[180px] text-center">{r.nouveauxConvertis}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Footer />
    </div>
  );
}
