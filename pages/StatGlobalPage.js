"use client";

import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import HeaderPages from "../components/HeaderPages";
import Footer from "../components/Footer";

export default function StatGlobalPage() {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reportType, setReportType] = useState("all"); // all, evangelisation, attendance

  const fetchSession = async () => {
    const { data } = await supabase.auth.getSession();
    if (data?.session) setSession(data.session);
  };

  const fetchStats = async () => {
    if (!session) return;
    setLoading(true);

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("eglise_id, branche_id")
      .eq("id", session.user.id)
      .single();

    if (profileError) {
      console.error("Erreur récupération eglise/branche :", profileError);
      setLoading(false);
      return;
    }

    const eglise_id = profile.eglise_id;
    const branche_id = profile.branche_id;

    // Construire le filtre de date
    let dateFilter = {};
    if (startDate) dateFilter.gte = startDate;
    if (endDate) dateFilter.lte = endDate;

    // Fonction pour récupérer un type de rapport
    const fetchReport = async (tableName) => {
      const query = supabase
        .from(tableName)
        .select("*")
        .eq("eglise_id", eglise_id)
        .eq("branche_id", branche_id);

      if (startDate) query.gte("date", startDate);
      if (endDate) query.lte("date", endDate);

      const { data, error } = await query;
      if (error) console.error(`Erreur récupération ${tableName}:`, error);
      return data || [];
    };

    const attendanceData = reportType === "all" || reportType === "attendance"
      ? await fetchReport("attendance")
      : [];

    const evangelisationData = reportType === "all" || reportType === "evangelisation"
      ? await fetchReport("evangelisation")
      : [];

    // Combiner les deux datasets
    const combinedStats = [
      ...attendanceData.map(r => ({ ...r, type: "Rapport Culte" })),
      ...evangelisationData.map(r => ({ ...r, type: "Rapport Evangelisation" })),
    ];

    setStats(combinedStats);
    setLoading(false);
  };

  useEffect(() => {
    fetchSession();
  }, []);

  useEffect(() => {
    fetchStats();
  }, [session, startDate, endDate, reportType]);

  return (
    <div className="min-h-screen bg-[#333699] p-6 flex flex-col items-center">
      <HeaderPages />

      <h1 className="text-3xl font-bold text-gray-800 mt-2">Statistiques Globales</h1>

      <div className="flex gap-4 mt-4">
        <div>
          <label className="text-white font-semibold">Date début :</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="ml-2 p-2 rounded"
          />
        </div>
        <div>
          <label className="text-white font-semibold">Date fin :</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="ml-2 p-2 rounded"
          />
        </div>
        <div>
          <label className="text-white font-semibold">Type de rapport :</label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="ml-2 p-2 rounded"
          >
            <option value="all">Tous</option>
            <option value="attendance">Culte</option>
            <option value="evangelisation">Evangelisation</option>
          </select>
        </div>
      </div>

      {loading ? (
        <p className="text-center mt-10 text-white">Chargement des statistiques...</p>
      ) : (
        <div className="overflow-x-auto mt-6 w-full max-w-6xl">
          <table className="min-w-full border-separate border-spacing-0 shadow-lg rounded-2xl overflow-hidden">
            <thead className="bg-orange-500 text-white">
              <tr>
                <th className="py-3 px-4">Type</th>
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
              {stats.map((r, index) => (
                <tr
                  key={r.id || index}
                  className={`text-center ${
                    index % 2 === 0 ? "bg-white" : "bg-orange-50"
                  } hover:bg-orange-100 transition-colors`}
                >
                  <td className="py-2 px-4">{r.type}</td>
                  <td className="py-2 px-4">{r.date ? new Date(r.date).toLocaleDateString() : "-"}</td>
                  <td className="py-2 px-4">{r.hommes || 0}</td>
                  <td className="py-2 px-4">{r.femmes || 0}</td>
                  <td className="py-2 px-4">{r.jeunes || 0}</td>
                  <td className="py-2 px-4">{r.enfants || 0}</td>
                  <td className="py-2 px-4">{r.connectes || 0}</td>
                  <td className="py-2 px-4">{r.priere_salut ? "Oui" : "Non"}</td>
                  <td className="py-2 px-4">{r.nouveauxVenus || 0}</td>
                  <td className="py-2 px-4">{r.nouveauxConvertis || 0}</td>
                  <td className="py-2 px-4">{r.reconciliation || 0}</td>
                  <td className="py-2 px-4">{r.moissonneurs || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Footer />
    </div>
  );
}
