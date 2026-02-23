"use client";

import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import HeaderPages from "../components/HeaderPages";
import Footer from "../components/Footer";
import ProtectedRoute from "../components/ProtectedRoute";

export default function RapportMinisterePage() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur", "ResponsableIntegration"]}>
      <RapportMinistere />
    </ProtectedRoute>
  );
}

function RapportMinistere() {
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [egliseId, setEgliseId] = useState(null);
  const [brancheId, setBrancheId] = useState(null);

  const [totalServiteurs, setTotalServiteurs] = useState(0);
  const [totalMembres, setTotalMembres] = useState(0);
  const [serviteursParDate, setServiteursParDate] = useState([]);
  const [ministeres, setMinisteres] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getSession();
      const user = data?.session?.user;
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("eglise_id, branche_id")
        .eq("id", user.id)
        .single();

      if (profile) {
        setEgliseId(profile.eglise_id);
        setBrancheId(profile.branche_id);
      }
    };

    fetchUser();
  }, []);

  const fetchRapport = async () => {
    if (!egliseId || !brancheId) return;

    setLoading(true);

    try {
      let query = supabase
        .from("stats_ministere_besoin")
        .select("membre_id, valeur, date_action")
        .eq("eglise_id", egliseId)
        .eq("branche_id", brancheId)
        .eq("type", "ministere");

      if (dateDebut) query = query.gte("date_action", dateDebut);
      if (dateFin) query = query.lte("date_action", dateFin);

      const { data, error } = await query;
      if (error) throw error;

      const totalSet = new Set();
      const dateMap = {};
      const ministereMap = {};

      data.forEach((row) => {
        // 🔥 CORRECTION ICI
        const date = row.date_action.split("T")[0];
        const membreId = row.membre_id;
        const ministere = row.valeur;

        totalSet.add(membreId);

        if (!dateMap[date]) dateMap[date] = new Set();
        dateMap[date].add(membreId);

        if (!ministereMap[ministere]) ministereMap[ministere] = new Set();
        ministereMap[ministere].add(membreId);
      });

      setTotalServiteurs(totalSet.size);

      const dateResult = Object.entries(dateMap)
        .map(([date, set]) => ({
          date,
          total: set.size,
        }))
        .sort((a, b) => new Date(a.date) - new Date(b.date));

      setServiteursParDate(dateResult);

      const ministereResult = Object.entries(ministereMap).map(
        ([nom, set]) => ({
          nom,
          total: set.size,
        })
      );

      setMinisteres(ministereResult);

      const { data: membres } = await supabase
        .from("membres_complets")
        .select("id, etat_contact")
        .eq("eglise_id", egliseId)
        .eq("branche_id", brancheId);

      const membresValides = membres.filter((m) =>
        ["existant", "nouveau"].includes(
          m.etat_contact?.toLowerCase()
        )
      );

      setTotalMembres(membresValides.length);

    } catch (err) {
      console.error(err.message);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#333699] text-white p-6">
      <HeaderPages />

      <h1 className="text-2xl font-bold mb-6 text-center">
        Rapport Ministère
      </h1>

      <div className="flex gap-4 justify-center mb-6">
        <input
          type="date"
          value={dateDebut}
          onChange={(e) => setDateDebut(e.target.value)}
          className="text-black px-2 py-1 rounded"
        />
        <input
          type="date"
          value={dateFin}
          onChange={(e) => setDateFin(e.target.value)}
          className="text-black px-2 py-1 rounded"
        />
        <button
          onClick={fetchRapport}
          className="bg-orange-500 px-4 py-2 rounded"
        >
          Générer
        </button>
      </div>

      {loading && <p className="text-center">Chargement...</p>}

      <div className="text-center mb-8">
        <h2 className="text-xl">Total serviteurs : {totalServiteurs}</h2>
        <h2>
          % serviteurs / membres :{" "}
          {totalMembres > 0
            ? ((totalServiteurs / totalMembres) * 100).toFixed(1)
            : 0}
          %
        </h2>
      </div>

      {/* TABLE DATE */}
      <div className="bg-white text-black rounded p-4 mb-8 max-w-2xl mx-auto overflow-x-auto">
        <h3 className="font-bold mb-4 text-center">
          Serviteurs par date
        </h3>

        <table className="w-full border border-gray-300">
          <thead className="bg-gray-200">
            <tr>
              <th className="border p-2">Date</th>
              <th className="border p-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {serviteursParDate.map((row, i) => (
              <tr key={i} className="text-center">
                <td className="border p-2">{row.date}</td>
                <td className="border p-2">{row.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* TABLE MINISTERE */}
      <div className="bg-white text-black rounded p-4 max-w-2xl mx-auto overflow-x-auto">
        <h3 className="font-bold mb-4 text-center">
          Serviteurs par ministère
        </h3>

        <table className="w-full border border-gray-300">
          <thead className="bg-gray-200">
            <tr>
              <th className="border p-2">Ministère</th>
              <th className="border p-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {ministeres.map((row, i) => (
              <tr key={i} className="text-center">
                <td className="border p-2">{row.nom}</td>
                <td className="border p-2">{row.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Footer />
    </div>
  );
}
