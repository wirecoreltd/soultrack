"use client";

import { useState, useEffect } from "react";
import supabase from "../lib/supabaseClient";
import HeaderPages from "../components/HeaderPages";
import Footer from "../components/Footer";

export default function StatGlobalePage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([]);
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [egliseId, setEgliseId] = useState(null);
  const [brancheId, setBrancheId] = useState(null);
  const [typeFilter, setTypeFilter] = useState("all");

  // Récupérer eglise et branche de l'utilisateur
  useEffect(() => {
    const fetchUserEglise = async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) return;

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("eglise_id, branche_id")
        .eq("id", session.session.user.id)
        .single();

      if (!error && profile) {
        setEgliseId(profile.eglise_id);
        setBrancheId(profile.branche_id);
      } else console.error(error);
    };
    fetchUserEglise();
  }, []);

  const fetchStats = async () => {
    if (!egliseId || !brancheId) return;
    setLoading(true);

    const start = dateStart || "1900-01-01";
    const end = dateEnd || "2100-12-31";

    // Attendance
    const { data: attendanceData } = await supabase
      .from("attendance")
      .select("*")
      .gte("date", start)
      .lte("date", end)
      .eq("eglise_id", egliseId)
      .eq("branche_id", brancheId);

    // Evangelises
    const { data: evangelisesData } = await supabase
      .from("evangelises")
      .select("*")
      .gte("created_at", start)
      .lte("created_at", end)
      .eq("eglise_id", egliseId)
      .eq("branche_id", brancheId);

    // Construire stats combinées
    const combined = [];

    // Attendance
    attendanceData?.forEach((r) => {
      combined.push({
        date: r.date,
        type: "Culte",
        hommes: r.hommes || 0,
        femmes: r.femmes || 0,
        jeunes: r.jeunes || 0,
        enfants: r.enfants || 0,
        connectes: r.connectes || 0,
        priere_salut: "-",
        nouveauxVenus: r.nouveauxVenus || 0,
        nouveauxConvertis: r.nouveauxConvertis || 0,
        reconciliation: "-",
        moissonneur: "-",
      });
    });

    // Evangelises
    const groupedEv = {};
    evangelisesData?.forEach((ev) => {
      const dateKey = new Date(ev.created_at).toISOString().split("T")[0];
      if (!groupedEv[dateKey]) {
        groupedEv[dateKey] = {
          date: dateKey,
          type: "Évangélisation",
          hommes: 0,
          femmes: 0,
          jeunes: 0,
          enfants: 0,
          connectes: 0,
          priere_salut: 0,
          nouveauxVenus: 0,
          nouveauxConvertis: 0,
          reconciliation: 0,
          moissonneur: 0,
        };
      }

      if (ev.sexe === "Homme") groupedEv[dateKey].hommes += 1;
      else if (ev.sexe === "Femme") groupedEv[dateKey].femmes += 1;

      if (ev.priere_salut) groupedEv[dateKey].priere_salut += 1;
      if (ev.type_conversion === "Nouveau converti") groupedEv[dateKey].nouveauxConvertis += 1;
      if (ev.type_conversion === "Réconciliation") groupedEv[dateKey].reconciliation += 1;

      groupedEv[dateKey].nouveauxVenus += ev.status_suivi === "Non envoyé" ? 1 : 0;
    });

    Object.values(groupedEv).forEach((r) => combined.push(r));

    // Filtrer par type
    const filtered =
      typeFilter === "all" ? combined : combined.filter((r) => r.type === typeFilter);

    filtered.sort((a, b) => new Date(a.date) - new Date(b.date));

    setStats(filtered);
    setLoading(false);
  };

  useEffect(() => {
    fetchStats();
  }, [egliseId, brancheId, dateStart, dateEnd, typeFilter]);

  if (loading) return <p className="text-center mt-10">Chargement des statistiques...</p>;

  // Calcul total
  const total = stats.reduce(
    (acc, r) => {
      acc.hommes += r.hommes || 0;
      acc.femmes += r.femmes || 0;
      acc.jeunes += r.jeunes || 0;
      acc.enfants += r.enfants || 0;
      acc.connectes += r.connectes || 0;
      acc.priere_salut += r.priere_salut === "-" ? 0 : r.priere_salut;
      acc.nouveauxVenus += r.nouveauxVenus || 0;
      acc.nouveauxConvertis += r.nouveauxConvertis || 0;
      acc.reconciliation += r.reconciliation === "-" ? 0 : r.reconciliation;
      acc.moissonneur += r.moissonneur === "-" ? 0 : r.moissonneur;
      return acc;
    },
    {
      hommes: 0,
      femmes: 0,
      jeunes: 0,
      enfants: 0,
      connectes: 0,
      priere_salut: 0,
      nouveauxVenus: 0,
      nouveauxConvertis: 0,
      reconciliation: 0,
      moissonneur: 0,
    }
  );

  const getTypeColor = (type) => (type === "Culte" ? "border-purple-600" : "border-orange-500");

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-[#16acea]">
      <HeaderPages />
      <h1 className="text-3xl font-bold mb-2">Statistiques Globales</h1>

      {/* Filtres */}
      <div className="flex flex-wrap gap-4 mb-4">
        <div>
          <label className="font-medium">Date début :</label>
          <input
            type="date"
            value={dateStart}
            onChange={(e) => setDateStart(e.target.value)}
            className="input"
          />
        </div>
        <div>
          <label className="font-medium">Date fin :</label>
          <input
            type="date"
            value={dateEnd}
            onChange={(e) => setDateEnd(e.target.value)}
            className="input"
          />
        </div>
        <div>
          <label className="font-medium">Type :</label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="input"
          >
            <option value="all">Tous</option>
            <option value="Culte">Culte</option>
            <option value="Évangélisation">Évangélisation</option>
          </select>
        </div>
      </div>

      {/* Tableau */}
      <div className="overflow-x-auto w-full max-w-6xl">
        <table className="min-w-full bg-white rounded-2xl shadow-lg overflow-hidden">
          <thead className="bg-purple-600 text-white">
            <tr>
              <th className="py-2 px-4 text-left">Date</th>
              <th className="py-2 px-4 text-left">Type</th>
              <th className="py-2 px-4">Hommes</th>
              <th className="py-2 px-4">Femmes</th>
              <th className="py-2 px-4">Jeunes</th>
              <th className="py-2 px-4">Enfants</th>
              <th className="py-2 px-4">Connectés</th>
              <th className="py-2 px-4">Prière du salut</th>
              <th className="py-2 px-4">Nouveaux venus</th>
              <th className="py-2 px-4">Nouveaux convertis</th>
              <th className="py-2 px-4">Réconciliation</th>
              <th className="py-2 px-4">Moissonneur</th>
            </tr>
          </thead>
          <tbody>
            {stats.map((r, idx) => (
              <tr
                key={idx}
                className={`${idx % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-gray-100 border-l-4 ${getTypeColor(
                  r.type
                )}`}
              >
                <td className="py-2 px-4 font-medium">{new Date(r.date).toLocaleDateString()}</td>
                <td className="py-2 px-4">{r.type}</td>
                <td className="py-2 px-4">{r.hommes}</td>
                <td className="py-2 px-4">{r.femmes}</td>
                <td className="py-2 px-4">{r.jeunes}</td>
                <td className="py-2 px-4">{r.enfants}</td>
                <td className="py-2 px-4">{r.connectes}</td>
                <td className="py-2 px-4">{r.priere_salut}</td>
                <td className="py-2 px-4">{r.nouveauxVenus}</td>
                <td className="py-2 px-4">{r.nouveauxConvertis}</td>
                <td className="py-2 px-4">{r.reconciliation}</td>
                <td className="py-2 px-4">{r.moissonneur}</td>
              </tr>
            ))}

            {/* Total général */}
            <tr className="bg-gray-200 font-bold border-t-2 border-gray-400">
              <td className="py-2 px-4 text-left">Total</td>
              <td className="py-2 px-4"></td>
              <td className="py-2 px-4">{total.hommes}</td>
              <td className="py-2 px-4">{total.femmes}</td>
              <td className="py-2 px-4">{total.jeunes}</td>
              <td className="py-2 px-4">{total.enfants}</td>
              <td className="py-2 px-4">{total.connectes}</td>
              <td className="py-2 px-4">{total.priere_salut}</td>
              <td className="py-2 px-4">{total.nouveauxVenus}</td>
              <td className="py-2 px-4">{total.nouveauxConvertis}</td>
              <td className="py-2 px-4">{total.reconciliation}</td>
              <td className="py-2 px-4">{total.moissonneur}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <Footer />

      <style jsx>{`
        .input {
          padding: 8px 10px;
          border-radius: 8px;
          border: 1px solid #ccc;
        }
      `}</style>
    </div>
  );
}
