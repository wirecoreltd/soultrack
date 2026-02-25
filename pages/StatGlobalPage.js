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
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [brancheRacine, setBrancheRacine] = useState(null); // branche de l'utilisateur

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

      if (data?.branche_id) setBrancheRacine(data.branche_id);
    };
    fetchProfile();
  }, []);

  // 🔹 Récupérer les stats hiérarchiques
  const fetchStats = async () => {
    if (!brancheRacine) return;
    setLoading(true);

    const { data, error } = await supabase.rpc("attendance_hierarchy_stats", {
      root_branche_id: brancheRacine,
      start_date: dateDebut || null,
      end_date: dateFin || null
    });

    if (error) console.error("Erreur fetchStats :", error);
    else setAttendanceData(data || []);

    setLoading(false);
  };

  // 🔹 Calcul total général
  const totalGeneral = attendanceData.reduce(
    (tot, r) => ({
      hommes: tot.hommes + (r.hommes || 0),
      femmes: tot.femmes + (r.femmes || 0),
      jeunes: tot.jeunes + (r.jeunes || 0),
      enfants: tot.enfants + (r.enfants || 0),
      evangelises: tot.evangelises + (r.evangelises || 0),
      baptises: tot.baptises + (r.baptises || 0),
      connectes: tot.connectes + (r.connectes || 0),
      nouveauxVenus: tot.nouveauxVenus + (r.nouveauxVenus || 0),
      nouveauxConvertis: tot.nouveauxConvertis + (r.nouveauxConvertis || 0),
    }),
    { hommes:0, femmes:0, jeunes:0, enfants:0, evangelises:0, baptises:0, connectes:0, nouveauxVenus:0, nouveauxConvertis:0 }
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
        <button
          onClick={fetchStats}
          className="bg-[#2a2f85] px-6 py-2 rounded-xl hover:bg-[#1f2366]"
        >
          Générer
        </button>
      </div>

      {/* TABLEAU HIÉRARCHIQUE */}
      {!loading && attendanceData.length > 0 && (
        <div className="w-full max-w-full overflow-x-auto mt-6 scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-transparent">
          {attendanceData.map((row, idx) => (
            <div
              key={idx}
              className={`ml-${(row.niveau - 1) * 6} space-y-1 border-l-2 border-white/20 pl-2`}
            >
              <div className="font-bold text-white">{row.branche_nom}</div>
              <div className="text-white ml-4">
                Culte : {row.hommes} {row.femmes} {row.jeunes} {row.enfants}{" "}
                {row.evangelises} {row.baptises} {row.connectes} {row.nouveauxVenus}{" "}
                {row.nouveauxConvertis}
              </div>
            </div>
          ))}

          {/* TOTAL */}
          <div className="font-bold text-orange-400 mt-3">
            TOTAL : {totalGeneral.hommes} {totalGeneral.femmes} {totalGeneral.jeunes}{" "}
            {totalGeneral.enfants} {totalGeneral.evangelises} {totalGeneral.baptises}{" "}
            {totalGeneral.connectes} {totalGeneral.nouveauxVenus}{" "}
            {totalGeneral.nouveauxConvertis}
          </div>
        </div>
      )}

      {attendanceData.length === 0 && !loading && (
        <div className="text-white mt-6">Aucune donnée trouvée pour ces dates.</div>
      )}

      <Footer />
    </div>
  );
}
