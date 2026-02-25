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

  const [eglises, setEglises] = useState([]);
  const [statsParEglise, setStatsParEglise] = useState({});

  // 🔹 Charger toutes les églises supervisées
  useEffect(() => {
    const fetchEglises = async () => {
      const { data, error } = await supabase
        .from("eglises")
        .select("id, nom");

      if (!error && data) {
        setEglises(data);
      }
    };

    fetchEglises();
  }, []);

  const fetchStats = async () => {
    if (!eglises.length) return;

    setLoading(true);
    let resultats = {};

    for (const eglise of eglises) {

      // 🔹 Récupérer toutes les branches de cette église
      const { data: branches } = await supabase
        .from("branches")
        .select("id")
        .eq("eglise_id", eglise.id);

      const branchIds = branches?.map(b => b.id) || [];

      if (!branchIds.length) continue;

      // 🔹 Attendance
      let attendanceQuery = supabase
        .from("attendance")
        .select("*")
        .in("branche_id", branchIds);

      if (dateDebut) attendanceQuery = attendanceQuery.gte("date", dateDebut);
      if (dateFin) attendanceQuery = attendanceQuery.lte("date", dateFin);

      const { data: attendance } = await attendanceQuery;

      let hommes = 0;
      let femmes = 0;

      attendance?.forEach(r => {
        hommes += Number(r.hommes) || 0;
        femmes += Number(r.femmes) || 0;
      });

      // 🔹 Baptêmes
      let baptemeQuery = supabase
        .from("baptemes")
        .select("hommes,femmes")
        .in("branche_id", branchIds);

      if (dateDebut) baptemeQuery = baptemeQuery.gte("date", dateDebut);
      if (dateFin) baptemeQuery = baptemeQuery.lte("date", dateFin);

      const { data: baptemes } = await baptemeQuery;

      let baptemeHommes = 0;
      let baptemeFemmes = 0;

      baptemes?.forEach(r => {
        baptemeHommes += Number(r.hommes) || 0;
        baptemeFemmes += Number(r.femmes) || 0;
      });

      resultats[eglise.nom] = {
        culte: { hommes, femmes },
        bapteme: { hommes: baptemeHommes, femmes: baptemeFemmes }
      };
    }

    setStatsParEglise(resultats);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-[#333699]">
      <HeaderPages />

      <h1 className="text-2xl font-bold mt-4 mb-6 text-white">
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
          Générer
        </button>
      </div>

      {/* RAPPORT */}
      {loading && (
        <div className="text-white mt-6">Chargement...</div>
      )}

      {!loading && Object.keys(statsParEglise).length > 0 && (
        <div className="w-full max-w-5xl mt-8 space-y-8">
          {Object.entries(statsParEglise).map(([egliseNom, stats]) => (
            <div key={egliseNom} className="bg-white/10 p-6 rounded-2xl">

              <h2 className="text-xl font-bold text-amber-300 mb-4">
                {egliseNom}
              </h2>

              <table className="w-full text-white">
                <thead>
                  <tr className="border-b border-white/30">
                    <th className="text-left py-2">Ministère</th>
                    <th className="text-center">Hommes</th>
                    <th className="text-center">Femmes</th>
                    <th className="text-center">Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-2">Culte</td>
                    <td className="text-center">{stats.culte.hommes}</td>
                    <td className="text-center">{stats.culte.femmes}</td>
                    <td className="text-center">
                      {stats.culte.hommes + stats.culte.femmes}
                    </td>
                  </tr>

                  <tr>
                    <td className="py-2">Baptême</td>
                    <td className="text-center">{stats.bapteme.hommes}</td>
                    <td className="text-center">{stats.bapteme.femmes}</td>
                    <td className="text-center">
                      {stats.bapteme.hommes + stats.bapteme.femmes}
                    </td>
                  </tr>
                </tbody>
              </table>

            </div>
          ))}
        </div>
      )}

      <Footer />
    </div>
  );
}
