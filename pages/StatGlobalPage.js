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
  const [attendanceData, setAttendanceData] = useState([]);

  // Récupérer les stats
  const fetchStats = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc("get_attendance_stats", {
        date_start: dateDebut,
        date_end: dateFin,
      });

      if (error) throw error;

      setAttendanceData(data || []);
    } catch (err) {
      console.error(err);
      setAttendanceData([]);
    }
    setLoading(false);
  };

  // Calcul total
  const total = attendanceData.reduce(
    (acc, r) => {
      acc.hommes += r.hommes || 0;
      acc.femmes += r.femmes || 0;
      acc.jeunes += r.jeunes || 0;
      acc.enfants += r.enfants || 0;
      acc.connectes += r.connectes || 0;
      acc.nouveauxVenus += r.nouveauxVenus || 0;
      acc.nouveauxConvertis += r.nouveauxConvertis || 0;
      acc.moissonneurs += r.moissonneurs || 0;
      return acc;
    },
    { hommes: 0, femmes: 0, jeunes: 0, enfants: 0, connectes: 0, nouveauxVenus: 0, nouveauxConvertis: 0, moissonneurs: 0 }
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
          Filtrer
        </button>
      </div>

      {/* TABLEAU */}
      {!loading && attendanceData.length > 0 && (
        <div className="w-full max-w-full overflow-x-auto mt-6 scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-transparent">
          <div className="w-max space-y-4">
            {/* Parcourir les branches */}
            {attendanceData.map((r, idx) => (
              <div key={idx} className="space-y-1">
                <div className="text-white text-xl font-bold">{r.branche_nom}</div>
                <div className="text-white font-semibold">Culte :</div>
                <div className="flex gap-4 text-white font-medium">
                  <div>Hommes: {r.hommes}</div>
                  <div>Femmes: {r.femmes}</div>
                  <div>Jeunes: {r.jeunes}</div>
                  <div>Total: {r.hommes + r.femmes + r.jeunes}</div>
                  <div>Enfants: {r.enfants}</div>
                  <div>Connectés: {r.connectes}</div>
                  <div>Nouveaux Venus: {r.nouveauxVenus}</div>
                  <div>Nouveau Converti: {r.nouveauxConvertis}</div>
                  <div>Moissonneurs: {r.moissonneurs || 0}</div>
                </div>
              </div>
            ))}

            {/* TOTAL */}
            <div className="mt-6 border-t border-white/40 pt-3 text-white font-bold">
              TOTAL :
              <div className="flex gap-4 mt-1">
                <div>Hommes: {total.hommes}</div>
                <div>Femmes: {total.femmes}</div>
                <div>Jeunes: {total.jeunes}</div>
                <div>Total: {total.hommes + total.femmes + total.jeunes}</div>
                <div>Enfants: {total.enfants}</div>
                <div>Connectés: {total.connectes}</div>
                <div>Nouveaux Venus: {total.nouveauxVenus}</div>
                <div>Nouveau Converti: {total.nouveauxConvertis}</div>
                <div>Moissonneurs: {total.moissonneurs}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading && <div className="text-white mt-6">Chargement...</div>}
      {!loading && attendanceData.length === 0 && (
        <div className="text-white mt-6">Aucune donnée trouvée pour cette période.</div>
      )}

      <Footer />
    </div>
  );
}
