"use client";

import { useState, useEffect } from "react";
import supabase from "../lib/supabaseClient";

export default function RapportCulte({ parentEgliseNom }) {
  const [attendance, setAttendance] = useState([]);
  const [eglises, setEglises] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mapping parent → enfants visibles
  const parentChildrenMap = {
    "Cité Royale": ["Cité Royale", "Antioche", "Port Louis"],
    "Antioche": ["Antioche"],
    "Port Louis": ["Port Louis"],
  };

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const { data: attendanceData } = await supabase
        .from("attendance")
        .select("*");

      const { data: eglisesData } = await supabase
        .from("branches")
        .select("*");

      setAttendance(attendanceData);
      setEglises(eglisesData);
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) return <p>Loading...</p>;

  // Églises filtrées selon le parent
  const eglisesVisibles = parentChildrenMap[parentEgliseNom] || [parentEgliseNom];
  const filteredEglises = eglises.filter(e => eglisesVisibles.includes(e.nom));

  // Regroupement par église
  const getAttendanceByEglise = (eglise) => {
    const data = attendance.filter(a => a.branche_id === eglise.id);
    const totalHommes = data.reduce((sum, a) => sum + Number(a.hommes), 0);
    const totalFemmes = data.reduce((sum, a) => sum + Number(a.femmes), 0);
    const total = totalHommes + totalFemmes;
    return { totalHommes, totalFemmes, total };
  };

  // Obtenir mois/année du premier attendance
  const monthYear = attendance.length > 0 
    ? new Date(attendance[0].date).toLocaleString("fr-FR", { month: "long", year: "numeric" })
    : "";

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">{monthYear}</h1>
        <h2 className="text-xl mt-2">Rapport pour {parentEgliseNom}</h2>
      </header>

      {filteredEglises.map(eglise => {
        const { totalHommes, totalFemmes, total } = getAttendanceByEglise(eglise);
        return (
          <div key={eglise.id} className="mb-6 bg-white rounded-xl shadow p-4">
            <h3 className="font-semibold mb-2">{eglise.nom}</h3>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="px-2 py-1">Ministère</th>
                  <th className="px-2 py-1">Hommes</th>
                  <th className="px-2 py-1">Femmes</th>
                  <th className="px-2 py-1">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-2 py-1">Culte</td>
                  <td className="px-2 py-1">{totalHommes}</td>
                  <td className="px-2 py-1">{totalFemmes}</td>
                  <td className="px-2 py-1">{total}</td>
                </tr>
              </tbody>
            </table>
          </div>
        );
      })}

      <footer className="mt-6 text-center text-gray-500">
        Rapport généré automatiquement
      </footer>
    </div>
  );
}
