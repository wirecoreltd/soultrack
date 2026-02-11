"use client";

import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import HeaderPages from "../components/HeaderPages";
import Footer from "../components/Footer";
import ProtectedRoute from "../components/ProtectedRoute";

export default function StatGlobalPage() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur", "ResponsableIntegration", "ResponsableEvangelisation"]}>
      <StatGlobal />
    </ProtectedRoute>
  );
}

function StatGlobal() {
  const [loading, setLoading] = useState(true);
  const [attendanceTotals, setAttendanceTotals] = useState({});
  const [evangelisationTotals, setEvangelisationTotals] = useState({});
  const [serviteursTotals, setServiteursTotals] = useState([]);
  const [totalServiteurs, setTotalServiteurs] = useState(0);

  // 🔹 Fetch attendance totals
  const fetchAttendance = async () => {
    const { data, error } = await supabase
      .from("attendance")
      .select("hommes, femmes, jeunes, enfants, connectes, nouveauxConvertis");

    if (error) {
      console.error("Erreur attendance:", error);
      return;
    }

    const totals = data.reduce(
      (acc, row) => {
        acc.hommes += row.hommes || 0;
        acc.femmes += row.femmes || 0;
        acc.jeunes += row.jeunes || 0;
        acc.enfants += row.enfants || 0;
        acc.connectes += row.connectes || 0;
        acc.nouveauxConvertis += row.nouveauxConvertis || 0;
        return acc;
      },
      { hommes: 0, femmes: 0, jeunes: 0, enfants: 0, connectes: 0, nouveauxConvertis: 0 }
    );

    setAttendanceTotals(totals);
  };

  // 🔹 Fetch evangelisation totals
  const fetchEvangelisation = async () => {
    const { data, error } = await supabase
      .from("rapport_evangelisation")
      .select("hommes, femmes, priere, nouveau_converti, reconciliation, moissonneurs");

    if (error) {
      console.error("Erreur evangelisation:", error);
      return;
    }

    const totals = data.reduce(
      (acc, row) => {
        acc.hommes += row.hommes || 0;
        acc.femmes += row.femmes || 0;
        acc.priere += row.priere || 0;
        acc.nouveau_converti += row.nouveau_converti || 0;
        acc.reconciliation += row.reconciliation || 0;
        acc.moissonneurs += row.moissonneurs || 0;
        return acc;
      },
      { hommes: 0, femmes: 0, priere: 0, nouveau_converti: 0, reconciliation: 0, moissonneurs: 0 }
    );

    setEvangelisationTotals(totals);
  };

  // 🔹 Fetch serviteurs totals
  const fetchServiteurs = async () => {
    const { data, error } = await supabase
      .from("membres_complets")
      .select("ministere")
      .eq("star", true);

    if (error) {
      console.error("Erreur serviteurs:", error);
      return;
    }

    const totalByMinistere = data.reduce((acc, row) => {
      const key = row.ministere || "Sans ministère";
      if (!acc[key]) acc[key] = 0;
      acc[key]++;
      return acc;
    }, {});

    const servList = Object.entries(totalByMinistere).map(([ministere, count]) => ({
      ministere,
      count
    }));

    setServiteursTotals(servList);
    setTotalServiteurs(data.length);
  };

  // 🔹 Load all totals
  useEffect(() => {
    const loadTotals = async () => {
      setLoading(true);
      await Promise.all([fetchAttendance(), fetchEvangelisation(), fetchServiteurs()]);
      setLoading(false);
    };
    loadTotals();
  }, []);

  if (loading) return <p className="text-center mt-10 text-lg">Chargement des statistiques...</p>;

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-[#333699] text-white">
      <HeaderPages />
      <h1 className="text-3xl font-bold mb-4">Statistiques Globales</h1>
      <p className="mb-6 text-center italic text-white/80">Résumé global des rapports et serviteurs</p>

      {/* Tableau général */}
      <div className="max-w-5xl w-full overflow-x-auto mb-8">
        <table className="min-w-full bg-white text-black rounded-2xl overflow-hidden shadow-lg">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="py-3 px-4 text-left">Type</th>
              <th className="py-3 px-4">Hommes</th>
              <th className="py-3 px-4">Femmes</th>
              <th className="py-3 px-4">Jeunes</th>
              <th className="py-3 px-4">Enfants</th>
              <th className="py-3 px-4">Connectés</th>
              <th className="py-3 px-4">Nouveaux convertis</th>
              <th className="py-3 px-4">Prières</th>
              <th className="py-3 px-4">Réconciliations</th>
              <th className="py-3 px-4">Moissonneurs</th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-white text-center border-b hover:bg-gray-100 transition-all">
              <td className="py-2 px-4 font-medium text-left">Attendance</td>
              <td>{attendanceTotals.hommes}</td>
              <td>{attendanceTotals.femmes}</td>
              <td>{attendanceTotals.jeunes}</td>
              <td>{attendanceTotals.enfants}</td>
              <td>{attendanceTotals.connectes}</td>
              <td>{attendanceTotals.nouveauxConvertis}</td>
              <td>-</td>
              <td>-</td>
              <td>-</td>
            </tr>
            <tr className="bg-white/50 text-center border-b hover:bg-gray-100 transition-all">
              <td className="py-2 px-4 font-medium text-left">Évangélisation</td>
              <td>{evangelisationTotals.hommes}</td>
              <td>{evangelisationTotals.femmes}</td>
              <td>-</td>
              <td>-</td>
              <td>-</td>
              <td>{evangelisationTotals.nouveau_converti}</td>
              <td>{evangelisationTotals.priere}</td>
              <td>{evangelisationTotals.reconciliation}</td>
              <td>{evangelisationTotals.moissonneurs}</td>
            </tr>
            <tr className="bg-white text-center border-b hover:bg-gray-100 transition-all">
              <td className="py-2 px-4 font-medium text-left">Serviteurs</td>
              <td colSpan={9}>Total: {totalServiteurs}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Tableau serviteurs par ministère */}
      <div className="max-w-3xl w-full overflow-x-auto mb-8">
        <table className="min-w-full bg-white text-black rounded-2xl overflow-hidden shadow-lg">
          <thead className="bg-green-600 text-white">
            <tr>
              <th className="py-3 px-4 text-left">Ministère</th>
              <th className="py-3 px-4 text-center">Nombre de serviteurs</th>
            </tr>
          </thead>
          <tbody>
            {serviteursTotals.map((s) => (
              <tr key={s.ministere} className="bg-white text-center border-b hover:bg-gray-100 transition-all">
                <td className="py-2 px-4 text-left">{s.ministere}</td>
                <td className="py-2 px-4">{s.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Footer />
    </div>
  );
}
