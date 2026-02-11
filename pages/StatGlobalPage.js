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

    // 2️⃣ Requête attendance (Rapport Culte)
    let attendanceQuery = supabase
      .from("attendance")
      .select("*")
      .eq("eglise_id", profile.eglise_id)
      .eq("branche_id", profile.branche_id);

    if (dateDebut) attendanceQuery = attendanceQuery.gte("date", dateDebut);
    if (dateFin) attendanceQuery = attendanceQuery.lte("date", dateFin);

    const { data: attendanceData, error: attendanceError } = await attendanceQuery.order("date", { ascending: true });
    if (attendanceError) console.error(attendanceError);

    // 3️⃣ Requête evangelises (Rapport Évangélisation)
    let evangeliseQuery = supabase
      .from("evangelises")
      .select("*")
      .eq("eglise_id", profile.eglise_id)
      .eq("branche_id", profile.branche_id);

    if (dateDebut) evangeliseQuery = evangeliseQuery.gte("created_at", dateDebut);
    if (dateFin) evangeliseQuery = evangeliseQuery.lte("created_at", dateFin + "T23:59:59");

    const { data: evangeliseData, error: evangeliseError } = await evangeliseQuery.order("created_at", { ascending: true });
    if (evangeliseError) console.error(evangeliseError);

    // 4️⃣ Organiser les stats par date
    const statsMap = {};

    // Attendance
    attendanceData?.forEach((a) => {
      const date = a.date;
      if (!statsMap[date]) statsMap[date] = { date, culte: {}, evangelisation: {} };
      statsMap[date].culte = {
        hommes: a.hommes || 0,
        femmes: a.femmes || 0,
        jeunes: a.jeunes || 0,
        enfants: a.enfants || 0,
        connectes: a.connectes || 0,
        priere: a.priere || 0,
        nouveauxVenus: a.nouveauxVenus || 0,
        nouveauxConvertis: a.nouveauxConvertis || 0,
        reconciliation: a.reconciliation || 0,
        moissonneur: a.moissonneurs || 0,
      };
    });

    // Evangelises
    evangeliseData?.forEach((e) => {
      const date = e.created_at.split("T")[0];
      if (!statsMap[date]) statsMap[date] = { date, culte: {}, evangelisation: {} };

      // Pour chaque évangélisé on ajoute les compteurs
      const ev = statsMap[date].evangelisation;
      statsMap[date].evangelisation = {
        hommes: (ev?.hommes || 0) + (e.sexe === "Homme" ? 1 : 0),
        femmes: (ev?.femmes || 0) + (e.sexe === "Femme" ? 1 : 0),
        jeunes: (ev?.jeunes || 0),
        enfants: (ev?.enfants || 0),
        connectes: (ev?.connectes || 0),
        priere: (ev?.priere || 0) + (e.priere_salut ? 1 : 0),
        nouveauxVenus: (ev?.nouveauxVenus || 0) + (e.status_suivi === "Nouveau venu" ? 1 : 0),
        nouveauxConvertis: (ev?.nouveauxConvertis || 0) + (e.type_conversion === "Nouveau converti" ? 1 : 0),
        reconciliation: (ev?.reconciliation || 0) + (e.type_conversion === "Réconciliation" ? 1 : 0),
        moissonneur: (ev?.moissonneur || 0) + 1,
      };
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
              <th className="py-3 px-4">Type</th>
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
            {stats.map((s) => (
              <tr key={s.date + "_culte"} className="bg-white text-center hover:bg-orange-100 transition-colors">
                <td className="py-2 px-4 text-left font-medium">{s.date}</td>
                <td className="py-2 px-4 font-semibold">Rapport Culte</td>
                <td className="py-2 px-4">{s.culte?.hommes || 0}</td>
                <td className="py-2 px-4">{s.culte?.femmes || 0}</td>
                <td className="py-2 px-4">{s.culte?.jeunes || 0}</td>
                <td className="py-2 px-4">{s.culte?.enfants || 0}</td>
                <td className="py-2 px-4">{s.culte?.connectes || 0}</td>
                <td className="py-2 px-4">{s.culte?.priere || 0}</td>
                <td className="py-2 px-4">{s.culte?.nouveauxVenus || 0}</td>
                <td className="py-2 px-4">{s.culte?.nouveauxConvertis || 0}</td>
                <td className="py-2 px-4">{s.culte?.reconciliation || 0}</td>
                <td className="py-2 px-4">{s.culte?.moissonneur || 0}</td>
              </tr>
            ))}
            {stats.map((s) => (
              <tr key={s.date + "_evangelisation"} className="bg-orange-50 text-center hover:bg-orange-100 transition-colors">
                <td className="py-2 px-4 text-left font-medium">{s.date}</td>
                <td className="py-2 px-4 font-semibold">Rapport Évangélisation</td>
                <td className="py-2 px-4">{s.evangelisation?.hommes || 0}</td>
                <td className="py-2 px-4">{s.evangelisation?.femmes || 0}</td>
                <td className="py-2 px-4">{s.evangelisation?.jeunes || 0}</td>
                <td className="py-2 px-4">{s.evangelisation?.enfants || 0}</td>
                <td className="py-2 px-4">{s.evangelisation?.connectes || 0}</td>
                <td className="py-2 px-4">{s.evangelisation?.priere || 0}</td>
                <td className="py-2 px-4">{s.evangelisation?.nouveauxVenus || 0}</td>
                <td className="py-2 px-4">{s.evangelisation?.nouveauxConvertis || 0}</td>
                <td className="py-2 px-4">{s.evangelisation?.reconciliation || 0}</td>
                <td className="py-2 px-4">{s.evangelisation?.moissonneur || 0}</td>
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
