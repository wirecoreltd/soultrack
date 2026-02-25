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

  const fetchAttendance = async () => {
    setLoading(true);

    let query = supabase
      .from("attendance_stats")
      .select("*")
      .order("mois", { ascending: true })
      .order("branche_nom", { ascending: true });

    if (dateDebut) query = query.gte("mois", dateDebut);
    if (dateFin) query = query.lte("mois", dateFin);

    const { data, error } = await query;

    if (error) {
      console.error("Erreur récupération attendance :", error);
      setAttendanceData([]);
    } else {
      setAttendanceData(data);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-[#333699]">
      <HeaderPages />
      <h1 className="text-2xl font-bold mt-4 mb-6 text-center text-white">
        Rapport <span className="text-amber-300">Attendance</span>
      </h1>

      {/* FILTRES */}
      <div className="bg-white/10 p-6 rounded-2xl shadow-lg mt-6 flex gap-4 flex-wrap text-white">
        <input
          type="month"
          value={dateDebut}
          onChange={(e) => setDateDebut(e.target.value + "-01")}
          className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white"
          placeholder="Mois début"
        />
        <input
          type="month"
          value={dateFin}
          onChange={(e) => setDateFin(e.target.value + "-01")}
          className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white"
          placeholder="Mois fin"
        />
        <button
          onClick={fetchAttendance}
          className="bg-[#2a2f85] px-6 py-2 rounded-xl hover:bg-[#1f2366]"
        >
          Générer
        </button>
      </div>

      {/* TABLE */}
      {!loading && attendanceData.length === 0 && (
        <div className="text-white mt-6">Aucune donnée trouvée</div>
      )}

      {!loading && attendanceData.length > 0 && (
        <div className="w-full max-w-5xl mt-6 space-y-6 overflow-x-auto">
          {attendanceData.map((r, idx) => (
            <div key={idx} className="bg-white/10 rounded-xl p-4">
              <div className="text-xl font-semibold text-white mb-2">
                {r.branche_nom}
              </div>

              <div className="text-white font-semibold mb-1">Culte :</div>

              {/* Labels */}
              <div className="grid grid-cols-9 gap-2 mb-1 text-white font-medium">
                <span>Hommes</span>
                <span>Femmes</span>
                <span>Jeunes</span>
                <span>Enfants</span>
                <span>Evangelisés</span>
                <span>Baptisés</span>
                <span>Connectés</span>
                <span>NouveauxVenus</span>
                <span>NouveauxConvertis</span>
              </div>

              {/* Valeurs */}
              <div className="grid grid-cols-9 gap-2 text-white">
                <span>{r.hommes ?? 0}</span>
                <span>{r.femmes ?? 0}</span>
                <span>{r.jeunes ?? 0}</span>
                <span>{r.enfants ?? 0}</span>
                <span>{r.evangelises ?? 0}</span>
                <span>{r.baptises ?? 0}</span>
                <span>{r.connectes ?? 0}</span>
                <span>{r.nouveauxVenus ?? 0}</span>
                <span>{r.nouveauxConvertis ?? 0}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <Footer />
    </div>
  );
}
