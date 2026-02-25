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
  const [userBrancheId, setUserBrancheId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState([]);

  // Récupère la branche de l'utilisateur
  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("branche_id")
        .eq("id", user.id)
        .single();

      if (data?.branche_id) setUserBrancheId(data.branche_id);
    };
    fetchProfile();
  }, []);

  const fetchStats = async () => {
    if (!userBrancheId) return;
    setLoading(true);

    // 1️⃣ Récupère les églises enfants de la branche
    const { data: eglises } = await supabase
      .from("eglises")
      .select("id, nom")
      .eq("parent_id", userBrancheId);

    // Ajoute la branche elle-même si besoin
    const allBranches = [{ id: null, nom: "Branche entière" }, ...eglises];

    // 2️⃣ Récupère les données d'attendance pour la branche et ses enfants
    const { data: attendanceData } = await supabase
      .from("attendance")
      .select("*")
      .eq("branche_id", userBrancheId)
      .gte(dateDebut ? "date" : null, dateDebut || undefined)
      .lte(dateFin ? "date" : null, dateFin || undefined);

    // 3️⃣ Agrège les données par eglise_id
    const reportsMap = allBranches.map(e => {
      const rows = attendanceData.filter(r => (r.eglise_id || null) === (e.id || null));
      const total = rows.reduce((acc, r) => ({
        hommes: acc.hommes + Number(r.hommes || 0),
        femmes: acc.femmes + Number(r.femmes || 0),
        jeunes: acc.jeunes + Number(r.jeunes || 0),
        enfants: acc.enfants + Number(r.enfants || 0),
        connectes: acc.connectes + Number(r.connectes || 0),
        nouveauxVenus: acc.nouveauxVenus + Number(r.nouveauxVenus || 0),
        nouveauxConvertis: acc.nouveauxConvertis + Number(r.nouveauxConvertis || 0),
      }), { hommes:0,femmes:0,jeunes:0,enfants:0,connectes:0,nouveauxVenus:0,nouveauxConvertis:0 });

      return { nom: e.nom, data: total };
    });

    setReports(reportsMap);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-[#333699]">
      <HeaderPages />
      <h1 className="text-2xl font-bold mt-4 mb-6 text-center text-white">
        Rapport <span className="text-amber-300">Statistiques Globales</span>
      </h1>

      {/* FILTRES */}
      <div className="bg-white/10 p-6 rounded-2xl shadow-lg mt-6 flex gap-4 flex-wrap text-white">
        <input type="date" value={dateDebut} onChange={(e) => setDateDebut(e.target.value)} className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white" />
        <input type="date" value={dateFin} onChange={(e) => setDateFin(e.target.value)} className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white" />
        <button onClick={fetchStats} className="bg-[#2a2f85] px-6 py-2 rounded-xl hover:bg-[#1f2366]">Générer</button>
      </div>

      {/* TABLE */}
      {!loading && reports.length > 0 && (
        <div className="w-full max-w-full overflow-x-auto mt-6 scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-transparent">
          <div className="w-max space-y-4">
            {reports.map((r, idx) => (
              <div key={idx} className="bg-white/10 rounded-xl p-4">
                <h2 className="text-white font-bold text-lg mb-2">{r.nom}</h2>
                <div className="flex font-semibold uppercase text-white px-4 py-2 border-b border-white/30 bg-white/5 rounded-t-xl">
                  <div className="min-w-[120px]">Type</div>
                  <div className="min-w-[100px] text-center">Hommes</div>
                  <div className="min-w-[100px] text-center">Femmes</div>
                  <div className="min-w-[100px] text-center">Jeunes</div>
                  <div className="min-w-[100px] text-center">Enfants</div>
                  <div className="min-w-[120px] text-center">Connectés</div>
                  <div className="min-w-[140px] text-center">Nouveaux Venus</div>
                  <div className="min-w-[140px] text-center">Nouveau Converti</div>
                </div>
                <div className="flex items-center px-4 py-2 rounded-b-lg bg-white/10 hover:bg-white/20 transition">
                  <div className="min-w-[120px] text-white">Culte</div>
                  <div className="min-w-[100px] text-center text-white">{r.data.hommes}</div>
                  <div className="min-w-[100px] text-center text-white">{r.data.femmes}</div>
                  <div className="min-w-[100px] text-center text-white">{r.data.jeunes}</div>
                  <div className="min-w-[100px] text-center text-white">{r.data.enfants}</div>
                  <div className="min-w-[120px] text-center text-white">{r.data.connectes}</div>
                  <div className="min-w-[140px] text-center text-white">{r.data.nouveauxVenus}</div>
                  <div className="min-w-[140px] text-center text-white">{r.data.nouveauxConvertis}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {loading && <p className="text-white mt-4">Chargement des données...</p>}
      <Footer />
    </div>
  );
}
