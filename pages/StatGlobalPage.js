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
  const [attendanceData, setAttendanceData] = useState([]);

  const [userBrancheId, setUserBrancheId] = useState(null);

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

      if (data?.branche_id) setUserBrancheId(data.branche_id);
    };
    fetchProfile();
  }, []);

  // 🔹 Récupérer les stats
  const fetchStats = async () => {
    if (!userBrancheId) return;
    setLoading(true);

    const { data, error } = await supabase
      .from("attendance_stats")
      .select("*")
      .gte(dateDebut ? "mois" : null, dateDebut || undefined)
      .lte(dateFin ? "mois" : null, dateFin || undefined)
      .order("branche_nom", { ascending: true });

    if (error) console.error(error);
    else setAttendanceData(data || []);

    setLoading(false);
  };

  // 🔹 Grouper par branche
  const groupedData = {};
  attendanceData.forEach(a => {
    if (!a.branche_nom) return; // ignorer les null
    if (!groupedData[a.branche_nom]) groupedData[a.branche_nom] = a;
    else {
      // cumuler si plusieurs lignes pour la même branche
      groupedData[a.branche_nom].hommes += a.hommes || 0;
      groupedData[a.branche_nom].femmes += a.femmes || 0;
      groupedData[a.branche_nom].jeunes += a.jeunes || 0;
      groupedData[a.branche_nom].enfants += a.enfants || 0;
      groupedData[a.branche_nom].connectes += a.connectes || 0;
      groupedData[a.branche_nom].nouveauxVenus += a.nouveauxVenus || 0;
      groupedData[a.branche_nom].nouveauxConvertis += a.nouveauxConvertis || 0;
      groupedData[a.branche_nom].moissonneurs += a.moissonneurs || 0;
    }
  });

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
          Filtrer
        </button>
      </div>

      {/* TABLEAU */}
      {!loading && Object.keys(groupedData).length > 0 && (
        <div className="w-full max-w-full overflow-x-auto mt-6 scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-transparent">
          <div className="w-max space-y-10">

            {Object.entries(groupedData).map(([branche, stats]) => {
              const totalHFJ = (stats.hommes || 0) + (stats.femmes || 0) + (stats.jeunes || 0);
              return (
                <div key={branche} className="space-y-3">
                  {/* NOM BRANCHE */}
                  <h2 className="text-2xl font-bold text-white tracking-wide">{branche.toUpperCase()}</h2>

                  {/* TABLE */}
                  <div className="bg-white/5 rounded-2xl border border-white/10">
                    {/* HEADER */}
                    <div className="flex font-semibold uppercase text-white px-4 py-3 border-b border-white/20 bg-white/10 whitespace-nowrap text-sm">
                      <div className="w-40">Ministère</div>
                      <div className="w-24 text-center">Hommes</div>
                      <div className="w-24 text-center">Femmes</div>
                      <div className="w-24 text-center">Jeunes</div>
                      <div className="w-28 text-center">Total</div>
                      <div className="w-24 text-center">Enfants</div>
                      <div className="w-28 text-center">Connectés</div>
                      <div className="w-32 text-center">Nouveaux Venus</div>
                      <div className="w-36 text-center">Nouveaux Convertis</div>
                      <div className="w-28 text-center">Moissonneurs</div>
                    </div>

                    {/* ROW */}
                    <div className="flex text-white px-4 py-4 whitespace-nowrap text-base">
                      <div className="w-40 font-medium">Culte</div>
                      <div className="w-24 text-center">{stats.hommes}</div>
                      <div className="w-24 text-center">{stats.femmes}</div>
                      <div className="w-24 text-center">{stats.jeunes}</div>
                      <div className="w-28 text-center font-bold text-yellow-400">{totalHFJ}</div>
                      <div className="w-24 text-center">{stats.enfants}</div>
                      <div className="w-28 text-center">{stats.connectes}</div>
                      <div className="w-32 text-center">{stats.nouveauxVenus}</div>
                      <div className="w-36 text-center">{stats.nouveauxConvertis}</div>
                      <div className="w-28 text-center">{stats.moissonneurs}</div>
                    </div>
                  </div>
                </div>
              );
            })}

          </div>
        </div>
      )}

      {/* MESSAGE SI AUCUNE DONNÉE */}
      {!loading && Object.keys(groupedData).length === 0 && (
        <p className="text-white mt-10 text-xl">Aucune donnée trouvée pour cette période.</p>
      )}

      <Footer />
    </div>
  );
}
