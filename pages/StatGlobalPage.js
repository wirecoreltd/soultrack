"use client";

import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import HeaderPages from "../components/HeaderPages";
import Footer from "../components/Footer";

export default function StatGlobalAttendancePage() {
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAttendance = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("attendance")
        .select("*, branche:branches(nom)")
        .order("date", { ascending: true });

      if (error) {
        console.error("Erreur fetch attendance:", error);
      } else {
        setAttendanceData(data);
        console.log("Attendance fetched:", data);
      }

      setLoading(false);
    };

    fetchAttendance();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-[#333699]">
      <HeaderPages />
      <h1 className="text-2xl font-bold mt-4 mb-6 text-center text-white">
        Rapport <span className="text-amber-300">Attendance</span>
      </h1>

      {loading && <p className="text-white">Chargement des données...</p>}

      {!loading && attendanceData.length === 0 && (
        <p className="text-white">Aucune donnée trouvée</p>
      )}

      {!loading && attendanceData.length > 0 && (
        <div className="w-full max-w-5xl space-y-4">
          {attendanceData.map((r) => (
            <div key={r.id} className="bg-white/10 rounded-xl p-4">
              <h2 className="text-xl font-semibold text-white">
                {r.branche?.nom || "Nom de la branche"} - {new Date(r.date).toLocaleDateString()}
              </h2>
              <div className="flex flex-wrap gap-4 mt-2 text-white">
                <div>Hommes: {r.hommes}</div>
                <div>Femmes: {r.femmes}</div>
                <div>Jeunes: {r.jeunes}</div>
                <div>Enfants: {r.enfants}</div>
                <div>Connectés: {r.connectes}</div>
                <div>Nouveaux Venus: {r.nouveauxVenus}</div>
                <div>Nouveaux Convertis: {r.nouveauxConvertis}</div>
                <div>Moissonneurs: {r.moissonneurs}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Footer />
    </div>
  );
}
