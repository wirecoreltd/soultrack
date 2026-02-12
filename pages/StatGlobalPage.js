"use client";

import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import HeaderPages from "../components/HeaderPages";
import Footer from "../components/Footer";
import { useSession } from "@supabase/auth-helpers-react";

export default function StatsGlobalPage() {
  const { data: session } = useSession();
  const [rapportType, setRapportType] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [stats, setStats] = useState([]);
  const [nbCellules, setNbCellules] = useState(0);
  const [loading, setLoading] = useState(true);

  const userEgliseId = session?.user?.eglise_id;
  const userBrancheId = session?.user?.branche_id;

  // 🔹 Récupération des stats
  const fetchStats = async () => {
    if (!userEgliseId || !userBrancheId) return;
    setLoading(true);

    try {
      let attendanceQuery = supabase
        .from("attendance")
        .select("*")
        .eq("eglise_id", userEgliseId)
        .eq("branche_id", userBrancheId);

      let evangelisationQuery = supabase
        .from("evangelises")
        .select("*")
        .eq("eglise_id", userEgliseId)
        .eq("branche_id", userBrancheId);

      // Filtre par date si défini
      if (startDate) {
        attendanceQuery = attendanceQuery.gte("date", startDate);
        evangelisationQuery = evangelisationQuery.gte("date", startDate);
      }
      if (endDate) {
        attendanceQuery = attendanceQuery.lte("date", endDate);
        evangelisationQuery = evangelisationQuery.lte("date", endDate);
      }

      const [{ data: attendData }, { data: evangData }] = await Promise.all([
        attendanceQuery,
        evangelisationQuery,
      ]);

      // Fusion des stats par type
      let combinedStats = [];

      if (rapportType === "Attendance" || rapportType === "All") {
        combinedStats.push(
          ...attendData.map((r) => ({
            type: "Rapport Culte",
            date: r.date,
            hommes: r.hommes,
            femmes: r.femmes,
            jeunes: r.jeunes,
            enfants: r.enfants,
            connectes: r.connectes,
            priere: r.priere,
            nouveauxVenus: r.nouveauxVenus,
            nouveauxConvertis: r.nouveauxConvertis,
            reconciliation: r.reconciliation,
            moissonneur: r.moissonneur,
          }))
        );
      }

      if (rapportType === "Evangelisation" || rapportType === "All") {
        combinedStats.push(
          ...evangData.map((r) => ({
            type: "Rapport Évangélisation",
            date: r.date,
            hommes: r.hommes,
            femmes: r.femmes,
            jeunes: r.jeunes,
            enfants: r.enfants,
            connectes: r.connectes,
            priere: r.priere,
            nouveauxVenus: r.nouveauxVenus,
            nouveauxConvertis: r.nouveauxConvertis,
            reconciliation: r.reconciliation,
            moissonneur: r.moissonneur,
          }))
        );
      }

      setStats(combinedStats);
    } catch (err) {
      console.error("Erreur fetch stats :", err);
    }

    setLoading(false);
  };

  // 🔹 Nombre de cellules
  const fetchNbCellules = async () => {
    if (!userEgliseId || !userBrancheId) return;

    const { data, error } = await supabase
      .from("cellules")
      .select("id", { count: "exact" })
      .eq("eglise_id", userEgliseId)
      .eq("branche_id", userBrancheId);

    if (error) console.error("Erreur récupération cellules :", error);
    else setNbCellules(data?.length || 0);
  };

  useEffect(() => {
    fetchStats();
    fetchNbCellules();
  }, [startDate, endDate, rapportType, userEgliseId, userBrancheId]);

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-[#333699]">
      <HeaderPages />

      <h1 className="text-3xl font-bold text-gray-800 mt-2">Statistiques Globales</h1>

      <div className="mt-4 flex flex-wrap gap-4 items-center">
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="input"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="input"
        />
        <select
          value={rapportType}
          onChange={(e) => setRapportType(e.target.value)}
          className="input"
        >
          <option value="All">Tous les rapports</option>
          <option value="Attendance">Rapport Culte</option>
          <option value="Evangelisation">Rapport Évangélisation</option>
          {/* On pourra rajouter Baptême, Formation, etc. */}
        </select>
      </div>

      {loading ? (
        <p className="text-center mt-10 text-white">Chargement des statistiques...</p>
      ) : (
        <div className="overflow-x-auto mt-4 w-full max-w-6xl">
          <table className="min-w-full border-separate border-spacing-0 shadow-lg rounded-2xl overflow-hidden">
            <thead className="bg-orange-500 text-white">
              <tr>
                <th className="py-3 px-4 text-left">Type</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Hommes</th>
                <th className="py-3 px-4">Femmes</th>
                <th className="py-3 px-4">Jeunes</th>
                <th className="py-3 px-4">Enfants</th>
                <th className="py-3 px-4">Connectés</th>
                <th className="py-3 px-4">Prière du salut</th>
                <th className="py-3 px-4">Nouveaux venus</th>
                <th className="py-3 px-4">Nouveaux convertis</th>
                <th className="py-3 px-4">Réconciliation</th>
                <th className="py-3 px-4">Moissonneur</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-gray-200 font-semibold">
                <td className="py-2 px-4 text-left">Cellules</td>
                <td className="py-2 px-4">-</td>
                <td className="py-2 px-4">{nbCellules}</td>
                <td className="py-2 px-4">-</td>
                <td className="py-2 px-4">-</td>
                <td className="py-2 px-4">-</td>
                <td className="py-2 px-4">-</td>
                <td className="py-2 px-4">-</td>
                <td className="py-2 px-4">-</td>
                <td className="py-2 px-4">-</td>
                <td className="py-2 px-4">-</td>
                <td className="py-2 px-4">-</td>
              </tr>
              {stats.map((r, i) => (
                <tr
                  key={i}
                  className={`text-center ${i % 2 === 0 ? "bg-white" : "bg-orange-50"} hover:bg-orange-100 transition-colors`}
                >
                  <td className="py-2 px-4 text-left font-medium">{r.type}</td>
                  <td className="py-2 px-4">{new Date(r.date).toLocaleDateString()}</td>
                  <td className="py-2 px-4">{r.hommes || 0}</td>
                  <td className="py-2 px-4">{r.femmes || 0}</td>
                  <td className="py-2 px-4">{r.jeunes || 0}</td>
                  <td className="py-2 px-4">{r.enfants || 0}</td>
                  <td className="py-2 px-4">{r.connectes || 0}</td>
                  <td className="py-2 px-4">{r.priere || 0}</td>
                  <td className="py-2 px-4">{r.nouveauxVenus || 0}</td>
                  <td className="py-2 px-4">{r.nouveauxConvertis || 0}</td>
                  <td className="py-2 px-4">{r.reconciliation || 0}</td>
                  <td className="py-2 px-4">{r.moissonneur || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Footer />

      <style jsx>{`
        .input {
          padding: 10px;
          border-radius: 10px;
          border: 1px solid #ccc;
        }
      `}</style>
    </div>
  );
}
