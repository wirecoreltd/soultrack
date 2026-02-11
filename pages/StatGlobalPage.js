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
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);

  const fetchData = async () => {
    setLoading(true);

    // 🔹 Attendance
    const { data: attendanceData, error: attError } = await supabase
      .from("attendance")
      .select("date, hommes, femmes, jeunes, enfants, connectes, nouveauxConvertis");
    if (attError) console.error("Attendance error:", attError);

    // 🔹 Evangelisation
    const { data: evangData, error: evangError } = await supabase
      .from("rapport_evangelisation")
      .select("date, hommes, femmes, priere, nouveau_converti, reconciliation, moissonneurs");
    if (evangError) console.error("Evangelisation error:", evangError);

    // 🔹 Fusionner par date
    const allDates = Array.from(
      new Set([
        ...(attendanceData?.map((a) => a.date) || []),
        ...(evangData?.map((e) => e.date) || []),
      ])
    ).sort();

    const merged = allDates.map((date) => {
      const att = attendanceData?.find((a) => a.date === date) || {};
      const ev = evangData?.find((e) => e.date === date) || {};
      return {
        date,
        att_hommes: att.hommes || 0,
        att_femmes: att.femmes || 0,
        att_jeunes: att.jeunes || 0,
        att_enfants: att.enfants || 0,
        att_connectes: att.connectes || 0,
        att_nouveauxConvertis: att.nouveauxConvertis || 0,
        ev_hommes: ev.hommes || 0,
        ev_femmes: ev.femmes || 0,
        ev_priere: ev.priere || 0,
        ev_nouveau_converti: ev.nouveau_converti || 0,
        ev_reconciliation: ev.reconciliation || 0,
        ev_moissonneurs: ev.moissonneurs || 0,
      };
    });

    setRows(merged);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <p className="text-center mt-10 text-lg">Chargement des statistiques par date...</p>;

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-[#333699] text-white">
      <HeaderPages />
      <h1 className="text-3xl font-bold mb-4">Statistiques Globales par Date</h1>
      <p className="mb-6 italic text-white/80 text-center">
        Combinaison des rapports Attendance et Évangélisation par date
      </p>

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
            {rows.map((r) => (
              <tr key={r.date} className="text-center border-b hover:bg-gray-100 transition-all bg-white/90">
                <td className="py-2 px-4 text-left font-medium">{new Date(r.date).toLocaleDateString()}</td>
                <td>{r.att_hommes}</td>
                <td>{r.att_femmes}</td>
                <td>{r.att_jeunes}</td>
                <td>{r.att_enfants}</td>
                <td>{r.att_connectes}</td>
                <td>{r.att_nouveauxConvertis}</td>
                <td>{r.ev_hommes}</td>
                <td>{r.ev_femmes}</td>
                <td>{r.ev_priere}</td>
                <td>{r.ev_nouveau_converti}</td>
                <td>{r.ev_reconciliation}</td>
                <td>{r.ev_moissonneurs}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Footer />
    </div>
  );
}
