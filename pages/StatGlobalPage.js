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
  const [loading, setLoading] = useState(false);
  const [attendanceStats, setAttendanceStats] = useState([]);

  const [userBrancheId, setUserBrancheId] = useState(null);
  const [branchIds, setBranchIds] = useState([]);

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
        setBranchIds([data.branche_id]);
      }
    };
    fetchProfile();
  }, []);

  // 🔹 Fetch Attendance depuis la vue
  const fetchAttendanceStats = async () => {
    if (!branchIds.length) return;
    setLoading(true);

    const { data } = await supabase
      .from("attendance_stats")
      .select("*")
      .in("branche_id", branchIds)
      .gte(dateDebut ? "mois" : null, dateDebut || undefined)
      .lte(dateFin ? "mois" : null, dateFin || undefined)
      .order("mois", { ascending: true })
      .order("branche_nom", { ascending: true });

    setAttendanceStats(data || []);
    setLoading(false);
  };

  // 🔹 Grouper par mois pour l'affichage
  const groupedAttendance = attendanceStats?.reduce((acc, row) => {
    const mois = new Date(row.mois).toLocaleString("fr-FR", { month: "long", year: "numeric" });
    if (!acc[mois]) acc[mois] = [];
    acc[mois].push(row);
    return acc;
  }, {});

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-[#333699]">
      <HeaderPages />
      <h1 className="text-2xl font-bold mt-4 mb-6 text-center text-white">
        Rapport <span className="text-amber-300">Statistiques Attendance</span>
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
          onClick={fetchAttendanceStats}
          className="bg-[#2a2f85] px-6 py-2 rounded-xl hover:bg-[#1f2366]"
        >
          Générer
        </button>
      </div>

      {/* RAPPORT */}
      {!loading && attendanceStats.length > 0 ? (
        <div className="w-full max-w-full overflow-x-auto mt-6 scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-transparent">
          {Object.entries(groupedAttendance).map(([mois, branches]) => (
            <div key={mois} className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">{mois}</h2>
              {branches.map((b) => (
                <div key={b.branche_nom} className="mb-4 text-white">
                  <div className="font-semibold text-xl">{b.branche_nom}</div>
                  <div className="ml-4">
                    <span className="font-semibold">Culte :</span>{" "}
                    {b.hommes} {b.femmes} {b.jeunes} {b.enfants} {b.evangelises}{" "}
                    {b.baptises} {b.connectes} {b.nouveauxVenus} {b.nouveauxConvertis}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : (
        !loading && (
          <div className="text-white mt-6 font-semibold text-lg">
            Rapport Attendance : Aucune donnée trouvée
          </div>
        )
      )}

      {loading && <div className="text-white mt-6 font-semibold text-lg">Chargement...</div>}

      <Footer />
    </div>
  );
}
