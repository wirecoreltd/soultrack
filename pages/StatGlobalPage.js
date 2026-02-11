"use client";

import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import HeaderPages from "../components/HeaderPages";
import ProtectedRoute from "../components/ProtectedRoute";
import Footer from "../components/Footer";

export default function StatGlobalPage() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur", "ResponsableIntegration", "ResponsableEvangelisation"]}>
      <StatGlobal />
    </ProtectedRoute>
  );
}

function StatGlobal() {
  const [superviseur, setSuperviseur] = useState({
    eglise_id: null,
    branche_id: null,
  });

  const [dateRange, setDateRange] = useState({
    start: "",
    end: "",
  });

  const [stats, setStats] = useState({
    sumAttendance: {},
    sumEvang: {},
    serviteurs: 0,
    servParMinistere: [],
  });

  const [loading, setLoading] = useState(true);

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

      if (!error && data) setSuperviseur({ eglise_id: data.eglise_id, branche_id: data.branche_id });
    };
    loadSuperviseur();
  }, []);

  // 🔹 Charger statistiques
  const fetchStats = async () => {
    if (!superviseur.eglise_id) return;
    setLoading(true);

    const { start, end } = dateRange;

    try {
      // --- Attendance ---
      const { data: attData = [] } = await supabase
        .from("attendance")
        .select("*")
        .eq("eglise_id", superviseur.eglise_id)
        .eq("branche_id", superviseur.branche_id)
        .gte("date", start || "1970-01-01")
        .lte("date", end || "2100-12-31");

      const sumAttendance = attData.reduce(
        (acc, r) => ({
          hommes: acc.hommes + Number(r.hommes || 0),
          femmes: acc.femmes + Number(r.femmes || 0),
          jeunes: acc.jeunes + Number(r.jeunes || 0),
          enfants: acc.enfants + Number(r.enfants || 0),
          connectes: acc.connectes + Number(r.connectes || 0),
          nouveauxConvertis: acc.nouveauxConvertis + Number(r.nouveauxConvertis || 0),
        }),
        { hommes: 0, femmes: 0, jeunes: 0, enfants: 0, connectes: 0, nouveauxConvertis: 0 }
      );

      // --- Evangélisation ---
      const { data: evangData = [] } = await supabase
        .from("rapport_evangelisation")
        .select("*")
        .eq("eglise_id", superviseur.eglise_id)
        .eq("branche_id", superviseur.branche_id)
        .gte("date", start || "1970-01-01")
        .lte("date", end || "2100-12-31");

      const sumEvang = evangData.reduce(
        (acc, r) => ({
          hommes: acc.hommes + Number(r.hommes || 0),
          femmes: acc.femmes + Number(r.femmes || 0),
          priere: acc.priere + Number(r.priere || 0),
          nouveau_converti: acc.nouveau_converti + Number(r.nouveau_converti || 0),
          reconciliation: acc.reconciliation + Number(r.reconciliation || 0),
          moissonneurs: acc.moissonneurs + Number(r.moissonneurs || 0),
        }),
        { hommes: 0, femmes: 0, priere: 0, nouveau_converti: 0, reconciliation: 0, moissonneurs: 0 }
      );

      // --- Serviteurs ---
      const { data: servData = [] } = await supabase
        .from("membres_complets")
        .select("id, ministere")
        .eq("star", true)
        .eq("eglise_id", superviseur.eglise_id)
        .eq("branche_id", superviseur.branche_id);

      const servParMinistere = {};
      servData.forEach((s) => {
        if (!s.ministere) return;
        if (!servParMinistere[s.ministere]) servParMinistere[s.ministere] = 0;
        servParMinistere[s.ministere]++;
      });

      setStats({
        sumAttendance,
        sumEvang,
        serviteurs: servData.length,
        servParMinistere: Object.entries(servParMinistere),
      });
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchStats();
  }, [superviseur, dateRange]);

  if (loading) return <p className="text-center mt-10 text-lg">Chargement des statistiques...</p>;

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-[#333699] text-white">
      <HeaderPages />

      <h1 className="text-3xl font-bold text-center mb-2 text-white">Statistiques Globales</h1>

      <div className="flex gap-4 my-4">
        <div>
          <label>Date de début</label>
          <input
            type="date"
            className="px-3 py-2 rounded-xl text-black"
            value={dateRange.start}
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
          />
        </div>
        <div>
          <label>Date de fin</label>
          <input
            type="date"
            className="px-3 py-2 rounded-xl text-black"
            value={dateRange.end}
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
          />
        </div>
      </div>

      {/* Tableau global */}
      <div className="overflow-x-auto w-full max-w-6xl mt-4 bg-white text-black rounded-3xl p-6 shadow-lg">
        <table className="min-w-full text-sm">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="py-2 px-4">Type</th>
              <th className="py-2 px-4">Hommes</th>
              <th className="py-2 px-4">Femmes</th>
              <th className="py-2 px-4">Jeunes / Enfants</th>
              <th className="py-2 px-4">Connectés / Prière</th>
              <th className="py-2 px-4">Nouveaux convertis / Réconciliation</th>
              <th className="py-2 px-4">Moissonneurs</th>
            </tr>
          </thead>
          <tbody>
            <tr className="text-center bg-gray-100 text-black">
              <td className="py-2 px-4 font-medium">Attendance</td>
              <td className="py-2 px-4">{stats.sumAttendance?.hommes || 0}</td>
              <td className="py-2 px-4">{stats.sumAttendance?.femmes || 0}</td>
              <td className="py-2 px-4">{(stats.sumAttendance?.jeunes || 0) + (stats.sumAttendance?.enfants || 0)}</td>
              <td className="py-2 px-4">{stats.sumAttendance?.connectes || 0}</td>
              <td className="py-2 px-4">{stats.sumAttendance?.nouveauxConvertis || 0}</td>
              <td className="py-2 px-4">—</td>
            </tr>
            <tr className="text-center bg-gray-50 text-black">
              <td className="py-2 px-4 font-medium">Évangélisation</td>
              <td className="py-2 px-4">{stats.sumEvang?.hommes || 0}</td>
              <td className="py-2 px-4">{stats.sumEvang?.femmes || 0}</td>
              <td className="py-2 px-4">—</td>
              <td className="py-2 px-4">{stats.sumEvang?.priere || 0}</td>
              <td className="py-2 px-4">{stats.sumEvang?.nouveau_converti || 0} / {stats.sumEvang?.reconciliation || 0}</td>
              <td className="py-2 px-4">{stats.sumEvang?.moissonneurs || 0}</td>
            </tr>
            <tr className="text-center bg-gray-100 text-black">
              <td className="py-2 px-4 font-medium">Serviteurs</td>
              <td colSpan={6}>
                Total : {stats.serviteurs} | Par ministère : {stats.servParMinistere.map(([min, nb]) => `${min}: ${nb}`).join(" / ")}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <Footer />
    </div>
  );
}
