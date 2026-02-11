"use client";

import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import HeaderPages from "../components/HeaderPages";
import ProtectedRoute from "../components/ProtectedRoute";
import Footer from "../components/Footer";

export default function StatGlobalPageWrapper() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur", "ResponsableIntegration", "ResponsableEvangelisation"]}>
      <StatGlobalPage />
    </ProtectedRoute>
  );
}

function StatGlobalPage() {
  const [superviseur, setSuperviseur] = useState({ eglise_id: null, branche_id: null });
  const [stats, setStats] = useState({
    hommes: 0,
    femmes: 0,
    jeunes: 0,
    enfants: 0,
    connectes: 0,
    nouveauxVenus: 0,
    nouveauxConvertis: 0,
    evangelises: 0,
    baptises: 0,
    serviteurs: 0,
    ministeres: 0,
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  // 🔹 Charger superviseur connecté
  useEffect(() => {
    const loadSuperviseur = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("eglise_id, branche_id")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Erreur superviseur:", error.message);
        return;
      }
      setSuperviseur({ eglise_id: data.eglise_id, branche_id: data.branche_id });
    };

    loadSuperviseur();
  }, []);

  // 🔹 Fetch stats combinées dès que superviseur ou dateRange change
  useEffect(() => {
    if (!superviseur.eglise_id) return;
    fetchStats();
  }, [superviseur, dateRange]);

  const fetchStats = async () => {
    setLoading(true);

    const start = dateRange.start || "1970-01-01";
    const end = dateRange.end || "2100-12-31";

    try {
      // Attendance
      const { data: attData } = await supabase
        .from("attendance")
        .select("*")
        .eq("eglise_id", superviseur.eglise_id)
        .eq("branche_id", superviseur.branche_id)
        .gte("date", start)
        .lte("date", end);

      // Rapport Evangelisation
      const { data: evanData } = await supabase
        .from("rapport_evangelisation")
        .select("*")
        .eq("eglise_id", superviseur.eglise_id)
        .eq("branche_id", superviseur.branche_id)
        .gte("date", start)
        .lte("date", end);

      // Serviteurs
      const { data: servData } = await supabase
        .from("membres_complets")
        .select("id, ministere")
        .eq("star", true)
        .eq("eglise_id", superviseur.eglise_id)
        .eq("branche_id", superviseur.branche_id);

      // Ministères uniques
      const { data: ministData } = await supabase
        .from("ministere")
        .select("id")
        .eq("eglise_id", superviseur.eglise_id)
        .eq("branche_id", superviseur.branche_id);

      // 🔹 Calculs
      const sumAttendance = attData?.reduce(
        (acc, r) => ({
          hommes: acc.hommes + Number(r.hommes || 0),
          femmes: acc.femmes + Number(r.femmes || 0),
          jeunes: acc.jeunes + Number(r.jeunes || 0),
          enfants: acc.enfants + Number(r.enfants || 0),
          connectes: acc.connectes + Number(r.connectes || 0),
          nouveauxVenus: acc.nouveauxVenus + Number(r.nouveauxVenus || 0),
          nouveauxConvertis: acc.nouveauxConvertis + Number(r.nouveauxConvertis || 0),
        }),
        { hommes: 0, femmes: 0, jeunes: 0, enfants: 0, connectes: 0, nouveauxVenus: 0, nouveauxConvertis: 0 }
      );

      const sumEvan = evanData?.reduce(
        (acc, r) => ({
          evangelises: acc.evangelises + Number(r.hommes || 0) + Number(r.femmes || 0) + Number(r.jeunes || 0) + Number(r.enfants || 0),
          baptises: acc.baptises + Number(r.nouveau_converti || 0),
        }),
        { evangelises: 0, baptises: 0 }
      );

      setStats({
        ...sumAttendance,
        ...sumEvan,
        serviteurs: servData?.length || 0,
        ministeres: ministData?.length || 0,
      });
    } catch (err) {
      console.error("Erreur fetch stats :", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-[#333699]">
      <HeaderPages />

      <h1 className="text-3xl font-bold text-gray-800 mt-2">Statistiques Globales</h1>
      <p className="text-gray-600 italic mt-1 mb-4">Résumé par église et branche, filtré par date</p>

      {/* 🔹 Filtres date */}
      <div className="flex gap-4 mb-6">
        <div>
          <label className="font-medium text-white">Date début</label>
          <input
            type="date"
            className="input"
            value={dateRange.start}
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
          />
        </div>
        <div>
          <label className="font-medium text-white">Date fin</label>
          <input
            type="date"
            className="input"
            value={dateRange.end}
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
          />
        </div>
      </div>

      {loading ? (
        <p className="text-white text-lg">Chargement des statistiques...</p>
      ) : (
        <div className="overflow-x-auto max-w-5xl w-full">
          <table className="min-w-full border-separate border-spacing-0 shadow-lg rounded-2xl overflow-hidden">
            <thead className="bg-orange-500 text-white">
              <tr>
                <th className="py-3 px-4 text-left">Hommes</th>
                <th className="py-3 px-4">Femmes</th>
                <th className="py-3 px-4">Jeunes</th>
                <th className="py-3 px-4">Enfants</th>
                <th className="py-3 px-4">Connectés</th>
                <th className="py-3 px-4">Nouveaux venus</th>
                <th className="py-3 px-4">Nouveaux convertis</th>
                <th className="py-3 px-4">Évangélisés</th>
                <th className="py-3 px-4">Baptisés</th>
                <th className="py-3 px-4">Serviteurs</th>
                <th className="py-3 px-4">Ministères</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-white text-center">
                <td className="py-2 px-4">{stats.hommes}</td>
                <td className="py-2 px-4">{stats.femmes}</td>
                <td className="py-2 px-4">{stats.jeunes}</td>
                <td className="py-2 px-4">{stats.enfants}</td>
                <td className="py-2 px-4">{stats.connectes}</td>
                <td className="py-2 px-4">{stats.nouveauxVenus}</td>
                <td className="py-2 px-4">{stats.nouveauxConvertis}</td>
                <td className="py-2 px-4">{stats.evangelises}</td>
                <td className="py-2 px-4">{stats.baptises}</td>
                <td className="py-2 px-4">{stats.serviteurs}</td>
                <td className="py-2 px-4">{stats.ministeres}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      <Footer />

      <style jsx>{`
        .input {
          border-radius: 12px;
          padding: 10px;
          width: 200px;
          border: 1px solid #ccc;
        }
      `}</style>
    </div>
  );
}
