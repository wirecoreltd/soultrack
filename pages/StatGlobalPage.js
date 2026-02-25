"use client";

import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import HeaderPages from "../components/HeaderPages";
import ProtectedRoute from "../components/ProtectedRoute";
import Footer from "../components/Footer";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

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
  const [typeRapport, setTypeRapport] = useState("Tous");
  const [userBrancheId, setUserBrancheId] = useState(null);
  const [branchIds, setBranchIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [attendanceStats, setAttendanceStats] = useState(null);

  // 🔹 Récupérer la branche de l'utilisateur
  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("branche_id")
        .eq("id", user.id)
        .single();

      if (data?.branche_id) {
        setUserBrancheId(data.branche_id);
        // 🔹 Récupérer ses enfants seulement
        const { data: children } = await supabase
          .from("branches")
          .select("id")
          .eq("parent_id", data.branche_id);

        setBranchIds([data.branche_id, ...(children?.map(c => c.id) || [])]);
      }
    };
    fetchProfile();
  }, []);

  const fetchStats = async () => {
    if (!branchIds.length) return;
    setLoading(true);

    const { data: attendanceData } = await supabase
      .from("attendance")
      .select("*")
      .in("branche_id", branchIds)
      .gte(dateDebut ? "date" : null, dateDebut || undefined)
      .lte(dateFin ? "date" : null, dateFin || undefined);

    const totals = { hommes: 0, femmes: 0, jeunes: 0, enfants: 0 };
    attendanceData?.forEach(r => {
      totals.hommes += Number(r.hommes) || 0;
      totals.femmes += Number(r.femmes) || 0;
      totals.jeunes += Number(r.jeunes) || 0;
      totals.enfants += Number(r.enfants) || 0;
    });

    setAttendanceStats(totals);
    setLoading(false);
  };

  // 🔹 Format mois
  let affichageMois = "";
  if (dateDebut) {
    const d = new Date(dateDebut);
    affichageMois = format(d, "MMMM yyyy", { locale: fr });
    affichageMois = affichageMois.charAt(0).toUpperCase() + affichageMois.slice(1);
  }

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
        <select value={typeRapport} onChange={(e) => setTypeRapport(e.target.value)} className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white">
          <option value="Tous" className="text-black">Tous</option>
          <option value="Culte" className="text-black">Culte</option>
        </select>
        <button onClick={fetchStats} className="bg-[#2a2f85] px-6 py-2 rounded-xl hover:bg-[#1f2366]">Générer</button>
      </div>

      {!loading && attendanceStats && (
        <div className="w-full max-w-full overflow-x-auto mt-6 scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-transparent">
          <h2 className="text-xl font-semibold text-white mb-3">{affichageMois}</h2>

          <div className="w-max space-y-2">
            <div className="flex font-semibold uppercase text-white px-4 py-3 border-b border-white/30 bg-white/5 rounded-t-xl whitespace-nowrap">
              <div className="min-w-[180px] ml-1">Type</div>
              <div className="min-w-[120px] text-center">Hommes</div>
              <div className="min-w-[120px] text-center">Femmes</div>
              <div className="min-w-[120px] text-center">Jeunes</div>
              <div className="min-w-[120px] text-center">Enfants</div>
            </div>

            {/* LIGNE CULTE */}
            <div className="flex items-center px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 transition border-l-4 border-blue-400">
              <div className="min-w-[180px] text-white font-semibold">Culte</div>
              <div className="min-w-[120px] text-center text-white">{attendanceStats.hommes}</div>
              <div className="min-w-[120px] text-center text-white">{attendanceStats.femmes}</div>
              <div className="min-w-[120px] text-center text-white">{attendanceStats.jeunes}</div>
              <div className="min-w-[120px] text-center text-white">{attendanceStats.enfants}</div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
