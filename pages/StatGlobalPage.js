"use client";

import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import HeaderPages from "../components/HeaderPages";
import ProtectedRoute from "../components/ProtectedRoute";
import Footer from "../components/Footer";

export default function StatGlobalePage() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur", "ResponsableEvangelisation"]}>
      <StatGlobale />
    </ProtectedRoute>
  );
}

function StatGlobale() {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");

  const fetchStats = async () => {
    setLoading(true);

    // 1️⃣ récupérer l'utilisateur connecté
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("eglise_id, branche_id")
      .eq("id", session.session.user.id)
      .single();

    if (!profile) {
      console.error("Impossible de récupérer l'église/branche de l'utilisateur");
      setLoading(false);
      return;
    }

    // 2️⃣ Requête attendance
    let attendanceQuery = supabase
      .from("attendance")
      .select("*")
      .eq("eglise_id", profile.eglise_id)
      .eq("branche_id", profile.branche_id);

    if (dateDebut) attendanceQuery = attendanceQuery.gte("date", dateDebut);
    if (dateFin) attendanceQuery = attendanceQuery.lte("date", dateFin);

    const { data: attendanceData, error: attendanceError } = await attendanceQuery.order("date", { ascending: true });
    if (attendanceError) console.error(attendanceError);

    // 3️⃣ Requête evangelises
    let evangeliseQuery = supabase
      .from("evangelises")
      .select("*")
      .eq("eglise_id", profile.eglise_id)
      .eq("branche_id", profile.branche_id);

    if (dateDebut) evangeliseQuery = evangeliseQuery.gte("created_at", dateDebut);
    if (dateFin) evangeliseQuery = evangeliseQuery.lte("created_at", dateFin + "T23:59:59");

    const { data: evangeliseData, error: evangeliseError } = await evangeliseQuery.order("created_at", { ascending: true });
    if (evangeliseError) console.error(evangeliseError);

    // 4️⃣ Combiner les stats par date
    const statsMap = {};

    // Attendance
    attendanceData?.forEach((a) => {
      const date = a.date;
      if (!statsMap[date]) statsMap[date] = { date, hommes: 0, femmes: 0, jeunes: 0, enfants: 0, evangelises: 0 };
      statsMap[date].hommes += a.hommes || 0;
      statsMap[date].femmes += a.femmes || 0;
      statsMap[date].jeunes += a.jeunes || 0;
      statsMap[date].enfants += a.enfants || 0;
    });

    // Evangelises
    evangeliseData?.forEach((e) => {
      const date = e.created_at.split("T")[0];
      if (!statsMap[date]) statsMap[date] = { date, hommes: 0, femmes: 0, jeunes: 0, enfants: 0, evangelises: 0 };
      statsMap[date].evangelises += 1;
    });

    setStats(Object.values(statsMap));
    setLoading(false);
  };

  useEffect(() => {
    fetchStats();
  }, [dateDebut, dateFin]);

  if (loading) return <p className="text-center mt-10">Chargement des statistiques...</p>;

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-[#333699]">
      <HeaderPages />

      <h1 className="text-3xl font-bold text-gray-800 mt-2">Statistiques Globales</h1>
      <p className="text-gray-600 italic mt-1">Résumé combiné Attendance + Évangélisation</p>

      {/* Filtre par date */}
      <div className="flex gap-4 mt-4 mb-2">
        <div>
          <label className="text-white font-semibold">Date début :</label>
          <input
            type="date"
            value={dateDebut}
            onChange={(e) => setDateDebut(e.target.value)}
            className="input mt-1"
          />
        </div>
        <div>
          <label className="text-white font-semibold">Date fin :</label>
          <input
            type="date"
            value={dateFin}
            onChange={(e) => setDateFin(e.target.value)}
            className="input mt-1"
          />
        </div>
      </div>

      {/* Tableau */}
      <div className="overflow-x-auto mt-4 w-full max-w-6xl">
        <table className="min-w-full border-separate border-spacing-0 shadow-lg rounded-2xl overflow-hidden">
          <thead className="bg-orange-500 text-white">
            <tr>
              <th className="py-3 px-4 text-left">Date</th>
              <th className="py-3 px-4">Hommes</th>
              <th className="py-3 px-4">Femmes</th>
              <th className="py-3 px-4">Jeunes</th>
              <th className="py-3 px-4">Enfants</th>
              <th className="py-3 px-4">Évangélisés</th>
            </tr>
          </thead>
          <tbody>
            {stats.map((s, index) => (
              <tr
                key={s.date}
                className={`text-center ${index % 2 === 0 ? "bg-white" : "bg-orange-50"} hover:bg-orange-100 transition-colors`}
              >
                <td className="py-2 px-4 text-left font-medium">{s.date}</td>
                <td className="py-2 px-4">{s.hommes}</td>
                <td className="py-2 px-4">{s.femmes}</td>
                <td className="py-2 px-4">{s.jeunes}</td>
                <td className="py-2 px-4">{s.enfants}</td>
                <td className="py-2 px-4">{s.evangelises}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Footer />

      <style jsx>{`
        .input {
          padding: 8px;
          border-radius: 8px;
          border: 1px solid #ccc;
        }
      `}</style>
    </div>
  );
}
