"use client";

import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import HeaderPages from "../components/HeaderPages";
import Footer from "../components/Footer";
import ProtectedRoute from "../components/ProtectedRoute";

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
  const [eglisesData, setEglisesData] = useState([]);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🔹 Récupérer la branche de l'utilisateur
  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("branche_id")
        .eq("id", user.id)
        .single();

      if (profile?.branche_id) setBranchIds([profile.branche_id]);
    };
    fetchProfile();
  }, []);

  // 🔹 Récupérer les stats CULTE
  const fetchStats = async () => {
    if (!branchIds.length) return;
    setLoading(true);

    // ✅ 1. Récupérer toutes les églises de la branche
    const { data: eglises } = await supabase
      .from("eglises")
      .select("id, nom")
      .in("branche_id", branchIds);

    setEglisesData(eglises || []);

    const egliseIds = eglises?.map(e => e.id) || [];

    if (!egliseIds.length) {
      setStats([]);
      setLoading(false);
      return;
    }

    // ✅ 2. Récupérer les attendance pour ces églises et dates
    let query = supabase.from("attendance").select("*").in("eglise_id", egliseIds);

    if (dateDebut) query = query.gte("date", dateDebut);
    if (dateFin) query = query.lte("date", dateFin);

    const { data: attendanceData } = await query;

    // ✅ 3. Grouper par église
    const grouped = {};
    attendanceData?.forEach(a => {
      if (!grouped[a.eglise_id]) grouped[a.eglise_id] = { hommes: 0, femmes: 0 };
      grouped[a.eglise_id].hommes += Number(a.hommes) || 0;
      grouped[a.eglise_id].femmes += Number(a.femmes) || 0;
    });

    // ✅ 4. Construire résultat final
    const result = Object.entries(grouped).map(([egliseId, s]) => {
      const egliseInfo = eglises.find(e => e.id === egliseId);
      return {
        eglise: egliseInfo?.nom || `Église ${egliseId?.slice(0, 6)}`,
        hommes: s.hommes,
        femmes: s.femmes,
        total: s.hommes + s.femmes,
      };
    });

    setStats(result);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-[#333699]">
      <HeaderPages />
      <h1 className="text-2xl font-bold mt-4 mb-6 text-center text-white">
        Rapport <span className="text-amber-300">CULTE</span>
      </h1>

      {/* FILTRES */}
      <div className="bg-white/10 p-6 rounded-2xl shadow-lg mt-6 flex gap-4 flex-wrap text-white">
        <input
          type="date"
          value={dateDebut}
          onChange={e => setDateDebut(e.target.value)}
          className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white"
        />
        <input
          type="date"
          value={dateFin}
          onChange={e => setDateFin(e.target.value)}
          className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white"
        />
        <button
          onClick={fetchStats}
          className="bg-[#2a2f85] px-6 py-2 rounded-xl hover:bg-[#1f2366]"
        >
          Générer
        </button>
      </div>

      {/* TABLE */}
      {loading && <p className="text-white mt-6">Chargement...</p>}

      {!loading && stats.length > 0 && (
        <div className="w-full max-w-4xl mt-6 space-y-6">
          {stats.map((s, idx) => (
            <div key={idx} className="bg-white/10 rounded-xl p-4">
              <h2 className="text-xl text-white font-semibold mb-2">{s.eglise}</h2>
              <div className="grid grid-cols-4 gap-4 text-white font-semibold">
                <div>Ministère</div>
                <div className="text-center">Hommes</div>
                <div className="text-center">Femmes</div>
                <div className="text-center">Total</div>
              </div>
              <div className="grid grid-cols-4 gap-4 text-white mt-1">
                <div>Culte</div>
                <div className="text-center">{s.hommes}</div>
                <div className="text-center">{s.femmes}</div>
                <div className="text-center">{s.total}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && stats.length === 0 && (
        <p className="text-white mt-6">Aucune donnée pour cette période.</p>
      )}

      <Footer />
    </div>
  );
}
