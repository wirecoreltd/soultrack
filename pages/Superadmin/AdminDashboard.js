"use client";

import { useEffect, useState } from "react";
import supabase from "../../lib/supabaseClient";
import HeaderPages from "../../components/HeaderPages";
import ProtectedRoute from "../../components/ProtectedRoute";
import Footer from "../../components/Footer";

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={["Superadmin"]}>
      <AdminDashboard />
    </ProtectedRoute>
  );
}

function AdminDashboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [totalEglises, setTotalEglises] = useState(0);
  const [totalMembres, setTotalMembres] = useState(0);

  // 🔥 FETCH DATA
  const fetchData = async () => {
    setLoading(true);

    try {
      // 1. récupérer églises
      const { data: eglises, error: errEglises } = await supabase
        .from("eglises")
        .select("id, nom");

      if (errEglises) throw errEglises;

      // 2. récupérer membres
      const { data: membres, error: errMembres } = await supabase
        .from("membres_complets")
        .select("id, eglise_id");

      if (errMembres) throw errMembres;

      // 3. calcul des membres par église
      const counts = {};

      membres.forEach((m) => {
        if (!counts[m.eglise_id]) {
          counts[m.eglise_id] = 0;
        }
        counts[m.eglise_id]++;
      });

      const result = eglises.map((e) => ({
        ...e,
        total_membres: counts[e.id] || 0,
      }));

      setData(result);
      setTotalEglises(eglises.length);
      setTotalMembres(membres.length);
    } catch (error) {
      console.error("Erreur chargement dashboard:", error);
      setData([]);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 🔍 FILTER
  const filtered = data.filter((e) =>
    e.nom?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      className="min-h-screen flex flex-col items-center p-4 sm:p-6"
      style={{ background: "#333699" }}
    >
      <HeaderPages />

      {/* TITRE */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold mt-4 mb-6 text-white">
          Dashboard des <span className="text-emerald-300">Églises</span>
        </h1>

        <p className="italic text-base text-white/90 max-w-2xl">
          Visualisez le nombre d’églises et de membres par église.
        </p>
      </div>

      {/* STATS */}
      <div className="flex gap-4 mb-6 flex-wrap justify-center">
        <div className="bg-white rounded-xl px-6 py-4 shadow text-center">
          <p className="text-sm text-gray-500">Églises</p>
          <p className="text-xl font-bold">{totalEglises}</p>
        </div>

        <div className="bg-white rounded-xl px-6 py-4 shadow text-center">
          <p className="text-sm text-gray-500">Membres</p>
          <p className="text-xl font-bold">{totalMembres}</p>
        </div>
      </div>

      {/* SEARCH */}
      <div className="w-full max-w-4xl flex justify-center mb-6">
        <input
          type="text"
          placeholder="Recherche église..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-2/3 px-3 py-2 rounded-md border text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* LIST */}
      <div className="w-full max-w-6xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 justify-items-center">
        {loading ? (
          <p className="text-white col-span-full">Chargement...</p>
        ) : filtered.length === 0 ? (
          <p className="text-white col-span-full">Aucune église trouvée.</p>
        ) : (
          filtered.map((e) => (
            <div
              key={e.id}
              className="bg-white rounded-2xl shadow-lg w-full max-w-sm overflow-hidden transition hover:shadow-2xl"
            >
              {/* BAR */}
              <div className="w-full h-[6px] bg-blue-500 rounded-t-2xl" />

              <div className="p-4 flex flex-col items-center">
                {/* NOM */}
                <h2 className="font-bold text-black text-lg text-center mb-2">
                  ⛪ {e.nom}
                </h2>

                {/* MEMBRES */}
                <p className="text-gray-700 text-sm mb-4">
                  👥 {e.total_membres} membres
                </p>

                {/* BOUTON */}
                <button className="px-3 py-2 bg-[#333699] text-white rounded-md text-sm hover:bg-blue-800 w-full">
                  Voir détails
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <Footer />
    </div>
  );
}

