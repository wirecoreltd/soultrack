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
  const [branchIds, setBranchIds] = useState([]);
  const [attendanceStats, setAttendanceStats] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🔹 Récupérer branche utilisateur
  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("branche_id")
        .eq("id", user.id)
        .single();

      if (data?.branche_id) {
        setBranchIds([data.branche_id]);
      }
    };

    fetchProfile();
  }, []);

  const fetchStats = async () => {
    if (!dateDebut || !dateFin) {
      alert("Sélectionne une date de début et de fin");
      return;
    }

    if (!branchIds.length) {
      alert("Branche introuvable");
      return;
    }

    setLoading(true);

    // 🔹 1️⃣ Récupérer toutes les présences
    const { data: attendanceData, error } = await supabase
      .from("attendance")
      .select("eglise_id, hommes, femmes")
      .in("branche_id", branchIds)
      .gte("date", dateDebut)
      .lte("date", dateFin);

    if (error) {
      console.error("Erreur attendance:", error);
      setLoading(false);
      return;
    }

    if (!attendanceData || attendanceData.length === 0) {
      setAttendanceStats([]);
      setLoading(false);
      return;
    }

    // 🔹 2️⃣ Regrouper par église
    const grouped = {};

    attendanceData.forEach(r => {
      if (!grouped[r.eglise_id]) {
        grouped[r.eglise_id] = { hommes: 0, femmes: 0 };
      }

      grouped[r.eglise_id].hommes += Number(r.hommes) || 0;
      grouped[r.eglise_id].femmes += Number(r.femmes) || 0;
    });

    const egliseIds = Object.keys(grouped);

    // 🔹 3️⃣ Récupérer noms des églises
    const { data: eglisesData } = await supabase
      .from("eglises")
      .select("id, nom")
      .in("id", egliseIds);

    // 🔹 4️⃣ Construire résultat final
    const result = egliseIds.map(id => {
      const egliseInfo = eglisesData?.find(e => e.id === id);

      return {
        eglise: egliseInfo?.nom || "Église inconnue",
        hommes: grouped[id].hommes,
        femmes: grouped[id].femmes,
        total: grouped[id].hommes + grouped[id].femmes,
      };
    });

    setAttendanceStats(result);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-[#333699]">
      <HeaderPages />

      <h1 className="text-2xl font-bold mt-4 mb-6 text-white">
        Rapport <span className="text-amber-300">CULTE</span>
      </h1>

      {/* FILTRES */}
      <div className="bg-white/10 p-6 rounded-2xl shadow-lg flex gap-4 flex-wrap text-white">
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

      {/* LOADING */}
      {loading && (
        <div className="text-white mt-6 text-lg animate-pulse">
          Chargement...
        </div>
      )}

      {/* RESULTATS */}
      {!loading && attendanceStats.map((eglise, index) => (
        <div
          key={index}
          className="mt-8 w-full max-w-4xl bg-white/10 p-6 rounded-2xl shadow-lg"
        >
          <h2 className="text-xl font-bold text-amber-300 mb-4">
            {eglise.eglise}
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-white">
              <thead>
                <tr className="border-b border-white/30 text-left">
                  <th className="py-2">Ministère</th>
                  <th className="py-2 text-center">Hommes</th>
                  <th className="py-2 text-center">Femmes</th>
                  <th className="py-2 text-center">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-white/20">
                  <td className="py-2 font-semibold">Culte</td>
                  <td className="py-2 text-center">{eglise.hommes}</td>
                  <td className="py-2 text-center">{eglise.femmes}</td>
                  <td className="py-2 text-center font-bold">
                    {eglise.total}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ))}

      <Footer />
    </div>
  );
}
