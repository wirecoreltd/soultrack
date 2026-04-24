"use client";

import { useEffect, useState } from "react";
import supabase from "../../lib/supabaseClient";
import ProtectedRoute from "../../components/ProtectedRoute";
import HeaderPages from "../../components/HeaderPages";
import Footer from "../../components/Footer";

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={["Superadmin"]}>
      <AdminDashboard />
    </ProtectedRoute>
  );
}

function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([]);
  const [totalBranches, setTotalBranches] = useState(0);
  const [totalMembres, setTotalMembres] = useState(0);

  const fetchData = async () => {
    setLoading(true);

    // 🔥 1. récupérer membres
    const { data: membres, error: err1 } = await supabase
      .from("membres_complets")
      .select("branche_id");

    if (err1) {
      console.error(err1);
      setLoading(false);
      return;
    }

    // 🔥 2. récupérer branches
    const { data: branches, error: err2 } = await supabase
  .from("branches")
  .select("id, nom, pays");

    if (err2) {
      console.error(err2);
      setLoading(false);
      return;
    }

    // 🔥 3. MAP DES BRANCHES
    const branchMap = {};
    branches.forEach((b) => {
      branchMap[b.id] = {
        nom: b.nom,
        pays: b.pays,
        count: 0,
      };
    });

    // 🔥 4. COMPTER MEMBRES
    membres.forEach((m) => {
      if (m.branche_id && branchMap[m.branche_id]) {
        branchMap[m.branche_id].count += 1;
      }
    });

    const result = Object.values(branchMap);

    setStats(result);
    setTotalBranches(result.length);
    setTotalMembres(membres.length);

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center p-4 sm:p-6 bg-[#333699]">

      <HeaderPages />

      {/* TITRE */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-white mt-4">
          📊 Dashboard Réseau
        </h1>

        <p className="text-white/80 mt-2">
          Vue globale des branches et des membres
        </p>
      </div>

      {/* GLOBAL */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 w-full max-w-4xl">

        <div className="bg-white rounded-xl p-6 text-center shadow">
          <h2 className="text-3xl font-bold text-[#333699]">
            {totalBranches}
          </h2>
          <p className="text-gray-600">Branches</p>
        </div>

        <div className="bg-white rounded-xl p-6 text-center shadow">
          <h2 className="text-3xl font-bold text-[#333699]">
            {totalMembres}
          </h2>
          <p className="text-gray-600">Membres</p>
        </div>

      </div>

      {/* LISTE */}
      <div className="w-full max-w-5xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">

        {loading ? (
          <p className="text-white col-span-full text-center">
            Chargement...
          </p>
        ) : stats.length === 0 ? (
          <p className="text-white col-span-full text-center">
            Aucune donnée
          </p>
        ) : (
          stats.map((b, i) => (
            <div
              key={i}
              className="bg-white rounded-xl shadow p-5 text-center hover:shadow-xl transition"
            >
              {/* NOM */}
              <h3 className="font-bold text-lg text-[#333699]">
                {b.nom || "Nom inconnu"}
              </h3>

              {/* PAYS */}
              <p className="text-gray-500 text-sm mb-3">
                🌍 {b.pays || "Pays inconnu"}
              </p>

              {/* COUNT */}
              <div className="text-3xl font-bold text-emerald-600">
                {b.count}
              </div>

              <p className="text-gray-500 text-sm">
                membres
              </p>
            </div>
          ))
        )}

      </div>

      <Footer />
    </div>
  );
}
