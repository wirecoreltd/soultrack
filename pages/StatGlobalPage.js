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
  const [loading, setLoading] = useState(false);
  const [branchIds, setBranchIds] = useState([]);
  const [culteData, setCulteData] = useState([]);

  const [total, setTotal] = useState({ hommes: 0, femmes: 0, jeunes: 0, enfants: 0, connectes: 0, nouveauxVenus: 0, nouveauxConvertis: 0 });

  // 🔹 Récupérer la branche de l'utilisateur
  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("branche_id")
        .eq("id", user.id)
        .single();

      if (data?.branche_id) setBranchIds([data.branche_id]);
    };
    fetchProfile();
  }, []);

  const fetchCulteStats = async () => {
    if (!branchIds.length) return;
    setLoading(true);

    let query = supabase.from("attendance").select("*").in("branche_id", branchIds);
    if (dateDebut) query = query.gte("date", dateDebut);
    if (dateFin) query = query.lte("date", dateFin);

    const { data, error } = await query;

    if (error) {
      console.error("Erreur fetch attendance:", error);
      setLoading(false);
      return;
    }

    if (!data || !data.length) {
      setCulteData([]);
      setTotal({ hommes: 0, femmes: 0, jeunes: 0, enfants: 0, connectes: 0, nouveauxVenus: 0, nouveauxConvertis: 0 });
      setLoading(false);
      return;
    }

    // Group by eglise
    const grouped = {};
    data.forEach((r) => {
      const egliseId = r.eglise_id || "undefined";
      if (!grouped[egliseId]) grouped[egliseId] = { nom: `Église ${egliseId}`, hommes: 0, femmes: 0, jeunes: 0, enfants: 0, connectes: 0, nouveauxVenus: 0, nouveauxConvertis: 0 };
      grouped[egliseId].hommes += Number(r.hommes) || 0;
      grouped[egliseId].femmes += Number(r.femmes) || 0;
      grouped[egliseId].jeunes += Number(r.jeunes) || 0;
      grouped[egliseId].enfants += Number(r.enfants) || 0;
      grouped[egliseId].connectes += Number(r.connectes) || 0;
      grouped[egliseId].nouveauxVenus += Number(r.nouveauxVenus) || 0;
      grouped[egliseId].nouveauxConvertis += Number(r.nouveauxConvertis) || 0;
    });

    setCulteData(Object.values(grouped));

    // Total général
    const tot = Object.values(grouped).reduce(
      (acc, r) => {
        acc.hommes += r.hommes;
        acc.femmes += r.femmes;
        acc.jeunes += r.jeunes;
        acc.enfants += r.enfants;
        acc.connectes += r.connectes;
        acc.nouveauxVenus += r.nouveauxVenus;
        acc.nouveauxConvertis += r.nouveauxConvertis;
        return acc;
      },
      { hommes: 0, femmes: 0, jeunes: 0, enfants: 0, connectes: 0, nouveauxVenus: 0, nouveauxConvertis: 0 }
    );
    setTotal(tot);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-[#333699]">
      <HeaderPages />
      <h1 className="text-2xl font-bold mt-4 mb-6 text-center text-white">
        Rapport <span className="text-amber-300">Culte</span>
      </h1>

      {/* FILTRES */}
      <div className="bg-white/10 p-6 rounded-2xl shadow-lg mt-6 flex gap-4 flex-wrap text-white">
        <input type="date" value={dateDebut} onChange={(e) => setDateDebut(e.target.value)} className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white" />
        <input type="date" value={dateFin} onChange={(e) => setDateFin(e.target.value)} className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white" />
        <button onClick={fetchCulteStats} className="bg-[#2a2f85] px-6 py-2 rounded-xl hover:bg-[#1f2366]">Générer</button>
      </div>

      {/* TABLE */}
      {!loading && (
        <div className="w-full max-w-full overflow-x-auto mt-6 scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-transparent">
          {culteData.length === 0 ? (
            <div className="text-white text-center py-6">Aucune donnée pour cette période.</div>
          ) : (
            culteData.map((r, idx) => (
              <div key={idx} className="mb-8">
                <h2 className="text-xl font-semibold text-white mb-2">{r.nom}</h2>
                <div className="flex font-semibold uppercase text-white px-4 py-3 border-b border-white/30 bg-white/5 rounded-t-xl whitespace-nowrap">
                  <div className="min-w-[180px]">Ministère</div>
                  <div className="min-w-[120px] text-center">Hommes</div>
                  <div className="min-w-[120px] text-center">Femmes</div>
                  <div className="min-w-[120px] text-center">Jeunes</div>
                  <div className="min-w-[120px] text-center">Enfants</div>
                  <div className="min-w-[140px] text-center">Connectés</div>
                  <div className="min-w-[150px] text-center">Nouveaux Venus</div>
                  <div className="min-w-[180px] text-center">Nouveau Converti</div>
                </div>
                <div className="flex items-center px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 transition border-l-4 border-blue-400">
                  <div className="min-w-[180px] font-semibold text-white">Culte</div>
                  <div className="min-w-[120px] text-center text-white">{r.hommes}</div>
                  <div className="min-w-[120px] text-center text-white">{r.femmes}</div>
                  <div className="min-w-[120px] text-center text-white">{r.jeunes}</div>
                  <div className="min-w-[120px] text-center text-white">{r.enfants}</div>
                  <div className="min-w-[140px] text-center text-white">{r.connectes}</div>
                  <div className="min-w-[150px] text-center text-white">{r.nouveauxVenus}</div>
                  <div className="min-w-[180px] text-center text-white">{r.nouveauxConvertis}</div>
                </div>
              </div>
            ))
          )}

          {/* TOTAL GENERAL */}
          {culteData.length > 0 && (
            <div className="flex items-center px-4 py-4 mt-3 rounded-xl bg-white/20 border-t border-white/40 font-bold">
              <div className="min-w-[180px] text-orange-400 font-semibold uppercase ml-1">TOTAL</div>
              <div className="min-w-[120px] text-center text-orange-400 font-semibold">{total.hommes}</div>
              <div className="min-w-[120px] text-center text-orange-400 font-semibold">{total.femmes}</div>
              <div className="min-w-[120px] text-center text-orange-400 font-semibold">{total.jeunes}</div>
              <div className="min-w-[120px] text-center text-orange-400 font-semibold">{total.enfants}</div>
              <div className="min-w-[140px] text-center text-orange-400 font-semibold">{total.connectes}</div>
              <div className="min-w-[150px] text-center text-orange-400 font-semibold">{total.nouveauxVenus}</div>
              <div className="min-w-[180px] text-center text-orange-400 font-semibold">{total.nouveauxConvertis}</div>
            </div>
          )}
        </div>
      )}

      <Footer />
    </div>
  );
}
