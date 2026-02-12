"use client";

import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import HeaderPages from "../components/HeaderPages";
import Footer from "../components/Footer";
import ProtectedRoute from "../components/ProtectedRoute";

export default function StatGlobalPage() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur", "ResponsableEvangelisation"]}>
      <StatGlobal />
    </ProtectedRoute>
  );
}

function StatGlobal() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reportType, setReportType] = useState("Tous"); // Menu déroulant
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);

    try {
      // 1️⃣ Récupérer l'ID église et branche de l'utilisateur connecté
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id;
      let eglise_id = null;
      let branche_id = null;
      if (userId) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("eglise_id, branche_id")
          .eq("id", userId)
          .single();
        if (profile) {
          eglise_id = profile.eglise_id;
          branche_id = profile.branche_id;
        }
      }

      // 2️⃣ Construire le filtre date
      let dateFilter = "";
      if (startDate) dateFilter += `&date=gte.${startDate}`;
      if (endDate) dateFilter += `&date=lte.${endDate}`;

      // 3️⃣ Récupérer les rapports Culte
      let cultesQuery = supabase
        .from("attendance")
        .select("*")
        .eq("eglise_id", eglise_id)
        .eq("branche_id", branche_id)
        .order("date", { ascending: true });
      if (startDate) cultesQuery = cultesQuery.gte("date", startDate);
      if (endDate) cultesQuery = cultesQuery.lte("date", endDate);
      const { data: cultes } = await cultesQuery;

      // 4️⃣ Récupérer les rapports Évangélisation
      let evanQuery = supabase
        .from("rapport_evangelisation")
        .select("*")
        .eq("eglise_id", eglise_id)
        .eq("branche_id", branche_id)
        .order("date", { ascending: true });
      if (startDate) evanQuery = evanQuery.gte("date", startDate);
      if (endDate) evanQuery = evanQuery.lte("date", endDate);
      const { data: evangelises } = await evanQuery;

      // 5️⃣ Récupérer les rapports Baptême
      let baptQuery = supabase
        .from("rapport_bapteme")
        .select("*")
        .eq("eglise_id", eglise_id)
        .eq("branche_id", branche_id)
        .order("date", { ascending: true });
      if (startDate) baptQuery = baptQuery.gte("date", startDate);
      if (endDate) baptQuery = baptQuery.lte("date", endDate);
      const { data: baptemes } = await baptQuery;

      // 6️⃣ Récupérer les rapports Formation
      let formQuery = supabase
        .from("rapport_formation")
        .select("*")
        .eq("eglise_id", eglise_id)
        .eq("branche_id", branche_id)
        .order("date", { ascending: true });
      if (startDate) formQuery = formQuery.gte("date", startDate);
      if (endDate) formQuery = formQuery.lte("date", endDate);
      const { data: formations } = await formQuery;

      // 7️⃣ Récupérer le nombre de cellules
      let { count: nbCellules } = await supabase
        .from("cellules")
        .select("id", { count: "exact" })
        .eq("eglise_id", eglise_id)
        .eq("branche_id", branche_id);

      // 8️⃣ Combiner tous les rapports selon le type sélectionné
      let combined = [];
      if (reportType === "Tous" || reportType === "Culte") combined.push(...(cultes || []).map(r => ({ ...r, type: "Culte" })));
      if (reportType === "Tous" || reportType === "Évangélisation") combined.push(...(evangelises || []).map(r => ({ ...r, type: "Évangélisation" })));
      if (reportType === "Tous" || reportType === "Bapteme") combined.push(...(baptemes || []).map(r => ({ ...r, type: "Bapteme" })));
      if (reportType === "Tous" || reportType === "Formation") combined.push(...(formations || []).map(r => ({ ...r, type: "Formation" })));

      setStats(combined);
    } catch (err) {
      console.error("Erreur récupération stats :", err);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchStats();
  }, [startDate, endDate, reportType]);

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-[#333699]">
      <HeaderPages />

      <h1 className="text-3xl font-bold text-gray-800 mt-2">Statistiques Globales</h1>

      {/* Filtres */}
      <div className="flex flex-col md:flex-row gap-4 mt-4 w-full max-w-6xl items-center">
        <div>
          <label className="text-white font-semibold mr-2">Date début :</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="input" />
        </div>
        <div>
          <label className="text-white font-semibold mr-2">Date fin :</label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="input" />
        </div>
        <div>
          <label className="text-white font-semibold mr-2">Type de rapport :</label>
          <select value={reportType} onChange={(e) => setReportType(e.target.value)} className="input">
            <option value="Tous">Tous</option>
            <option value="Culte">Culte</option>
            <option value="Évangélisation">Évangélisation</option>
            <option value="Bapteme">Bapteme</option>
            <option value="Formation">Formation</option>
          </select>
        </div>
      </div>

      {/* Tableau */}
      {loading ? (
        <p className="text-center mt-10 text-white">Chargement des statistiques...</p>
      ) : (
        <div className="overflow-x-auto mt-4 w-full max-w-6xl">
          <table className="min-w-full border-separate border-spacing-0 shadow-lg rounded-2xl overflow-hidden">
            <thead className="bg-orange-500 text-white">
              <tr>
                <th className="py-3 px-4 text-left">Type</th>
                <th className="py-3 px-4 text-left">Date</th>
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
                <th className="py-3 px-4">Cellules</th>
                <th className="py-3 px-4">Nom / Formation / Baptême</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((r, i) => (
                <tr key={i} className={`${i % 2 === 0 ? "bg-white" : "bg-orange-50"} text-center`}>
                  <td className="py-2 px-4">{r.type}</td>
                  <td className="py-2 px-4 text-left">{r.date ? new Date(r.date).toLocaleDateString() : "-"}</td>
                  <td className="py-2 px-4">{r.hommes || "-"}</td>
                  <td className="py-2 px-4">{r.femmes || "-"}</td>
                  <td className="py-2 px-4">{r.jeunes || "-"}</td>
                  <td className="py-2 px-4">{r.enfants || "-"}</td>
                  <td className="py-2 px-4">{r.connectes || "-"}</td>
                  <td className="py-2 px-4">{r.priere_salut ? "Oui" : "-"}</td>
                  <td className="py-2 px-4">{r.nouveauxVenus || "-"}</td>
                  <td className="py-2 px-4">{r.nouveauxConvertis || "-"}</td>
                  <td className="py-2 px-4">{r.reconciliation || "-"}</td>
                  <td className="py-2 px-4">{r.moissonneurs || "-"}</td>
                  <td className="py-2 px-4">{r.type === "Culte" || r.type === "Évangélisation" ? nbCellules : "-"}</td>
                  <td className="py-2 px-4">{r.nom || r.nom_formation || r.nom_bapteme || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

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
