"use client";

import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import HeaderPages from "../components/HeaderPages";
import Footer from "../components/Footer";
import ProtectedRoute from "../components/ProtectedRoute";

export default function StatGlobalParDatePage() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur", "ResponsableIntegration", "ResponsableEvangelisation"]}>
      <StatGlobalParDate />
    </ProtectedRoute>
  );
}

function StatGlobalParDate() {
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState("");
  const [row, setRow] = useState(null);

  const fetchData = async (selectedDate) => {
    if (!selectedDate) return;
    setLoading(true);

    // 🔹 Attendance
    const { data: attendanceData } = await supabase
      .from("attendance")
      .select("hommes, femmes, jeunes, enfants, connectes, nouveauxConvertis")
      .eq("date", selectedDate)
      .single();

    // 🔹 Evangelisation
    const { data: evangData } = await supabase
      .from("rapport_evangelisation")
      .select("hommes, femmes, priere, nouveau_converti, reconciliation, moissonneurs")
      .eq("date", selectedDate)
      .single();

    setRow({
      att_hommes: attendanceData?.hommes || 0,
      att_femmes: attendanceData?.femmes || 0,
      att_jeunes: attendanceData?.jeunes || 0,
      att_enfants: attendanceData?.enfants || 0,
      att_connectes: attendanceData?.connectes || 0,
      att_nouveauxConvertis: attendanceData?.nouveauxConvertis || 0,
      ev_hommes: evangData?.hommes || 0,
      ev_femmes: evangData?.femmes || 0,
      ev_priere: evangData?.priere || 0,
      ev_nouveau_converti: evangData?.nouveau_converti || 0,
      ev_reconciliation: evangData?.reconciliation || 0,
      ev_moissonneurs: evangData?.moissonneurs || 0,
    });

    setLoading(false);
  };

  const handleDateChange = (e) => {
    const selected = e.target.value;
    setDate(selected);
    fetchData(selected);
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-[#333699] text-white">
      <HeaderPages />

      <h1 className="text-3xl font-bold mb-4">Statistiques Globales par Date</h1>

      {/* Sélecteur de date */}
      <div className="mb-6">
        <label className="mr-2 font-semibold">Sélectionner la date :</label>
        <input
          type="date"
          value={date}
          onChange={handleDateChange}
          className="rounded-xl px-3 py-2 text-black"
        />
      </div>

      {loading && <p>Chargement...</p>}

      {row && !loading && (
        <div className="max-w-7xl w-full overflow-x-auto">
          <table className="min-w-full bg-white text-black rounded-2xl overflow-hidden shadow-lg">
            <thead className="bg-purple-600 text-white text-center">
              <tr>
                <th className="py-3 px-4 text-left">Date</th>
                <th colSpan={6}>Attendance</th>
                <th colSpan={6}>Évangélisation</th>
              </tr>
              <tr className="bg-purple-500 text-white text-center">
                <th className="py-2 px-4">Date</th>
                <th>Hommes</th>
                <th>Femmes</th>
                <th>Jeunes</th>
                <th>Enfants</th>
                <th>Connectés</th>
                <th>Nouveaux convertis</th>
                <th>Hommes</th>
                <th>Femmes</th>
                <th>Prières</th>
                <th>Nouveaux convertis</th>
                <th>Réconciliations</th>
                <th>Moissonneurs</th>
              </tr>
            </thead>
            <tbody>
              <tr className="text-center border-b hover:bg-gray-100 transition-all bg-white/90">
                <td className="py-2 px-4 text-left font-medium">{new Date(date).toLocaleDateString()}</td>
                <td>{row.att_hommes}</td>
                <td>{row.att_femmes}</td>
                <td>{row.att_jeunes}</td>
                <td>{row.att_enfants}</td>
                <td>{row.att_connectes}</td>
                <td>{row.att_nouveauxConvertis}</td>
                <td>{row.ev_hommes}</td>
                <td>{row.ev_femmes}</td>
                <td>{row.ev_priere}</td>
                <td>{row.ev_nouveau_converti}</td>
                <td>{row.ev_reconciliation}</td>
                <td>{row.ev_moissonneurs}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {!row && date && !loading && (
        <p className="mt-6 text-white/80 text-center">Aucune donnée pour cette date.</p>
      )}

      <Footer />
    </div>
  );
}
