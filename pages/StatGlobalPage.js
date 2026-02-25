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
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Récupérer l’utilisateur et sa branche
  const [userBrancheId, setUserBrancheId] = useState(null);

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

  const fetchAttendance = async () => {
    if (!userBrancheId) return;
    setLoading(true);

    // ⚠️ Assure-toi d’avoir créé la view `attendance_stats` avec toutes les colonnes
    const { data, error } = await supabase
      .from("attendance_stats")
      .select("*")
      .gte("mois", dateDebut || undefined)
      .lte("mois", dateFin || undefined)
      .order("branche_nom", { ascending: true });

    if (error) console.error(error);
    else setAttendanceData(data);

    setLoading(false);
  };

  // Fonction pour calculer le total Hommes + Femmes + Jeunes
  const calcTotalHFJ = (r) => (Number(r.hommes || 0) + Number(r.femmes || 0) + Number(r.jeunes || 0));

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
          onClick={fetchAttendance}
          className="bg-[#2a2f85] px-6 py-2 rounded-xl hover:bg-[#1f2366]"
        >
          Filtrer
        </button>
      </div>

      {/* TABLEAU */}
      {!loading && attendanceData.length > 0 && (
        <div className="w-full max-w-full overflow-x-auto mt-6 scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-transparent">
          <div className="w-max space-y-4">

            {attendanceData.map((r, idx) => (
              <div key={idx} className="bg-white/10 rounded-xl p-4">
                <div className="text-xl font-bold text-white mb-2">{r.branche_nom}</div>
                <div className="flex font-semibold uppercase text-white border-b border-white/30 pb-2">
                  <div className="min-w-[140px]">Ministère</div>
                  <div className="min-w-[80px] text-center">Hommes</div>
                  <div className="min-w-[80px] text-center">Femmes</div>
                  <div className="min-w-[80px] text-center">Jeunes</div>
                  <div className="min-w-[100px] text-center">Total HFJ</div>
                  <div className="min-w-[80px] text-center">Enfants</div>
                  <div className="min-w-[100px] text-center">Connectés</div>
                  <div className="min-w-[120px] text-center">Nouveaux Venus</div>
                  <div className="min-w-[140px] text-center">Nouveau Converti</div>
                  <div className="min-w-[120px] text-center">Moissonneurs</div>
                </div>

                <div className="flex items-center px-0 py-2 text-white">
                  <div className="min-w-[140px] font-semibold">Culte</div>
                  <div className="min-w-[80px] text-center">{r.hommes || 0}</div>
                  <div className="min-w-[80px] text-center">{r.femmes || 0}</div>
                  <div className="min-w-[80px] text-center">{r.jeunes || 0}</div>
                  <div className="min-w-[100px] text-center">{calcTotalHFJ(r)}</div>
                  <div className="min-w-[80px] text-center">{r.enfants || 0}</div>
                  <div className="min-w-[100px] text-center">{r.connectes || 0}</div>
                  <div className="min-w-[120px] text-center">{r.nouveauxVenus || 0}</div>
                  <div className="min-w-[140px] text-center">{r.nouveauxConvertis || 0}</div>
                  <div className="min-w-[120px] text-center">{r.moissonneurs || 0}</div>
                </div>
              </div>
            ))}

          </div>
        </div>
      )}

      {attendanceData.length === 0 && !loading && (
        <div className="mt-6 text-white font-semibold">Aucune donnée trouvée pour cette période.</div>
      )}

      <Footer />
    </div>
  );
}
