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

  const [userBrancheId, setUserBrancheId] = useState(null);
  const [branchIds, setBranchIds] = useState([]);
  const [egls, setEglises] = useState([]);
  const [statsByEglise, setStatsByEglise] = useState({});

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

      if (data?.branche_id) {
        setUserBrancheId(data.branche_id);
        setBranchIds([data.branche_id]); // on garde sa branche
      }
    };
    fetchProfile();
  }, []);

  // 🔹 Récupérer toutes les églises sous supervision
  const fetchEglises = async () => {
    if (!userBrancheId) return;

    const { data, error } = await supabase
      .from("eglises")
      .select("id, nom, pays")
      .eq("parent_eglise_id", userBrancheId);

    if (error) return console.error(error);
    setEglises(data || []);
    return data || [];
  };

  const fetchStats = async () => {
    if (!userBrancheId) return;
    setLoading(true);

    const eglisesSupervisees = await fetchEglises();

    const newStats = {};

    for (let e of eglisesSupervisees) {
      const attendanceData = await supabase
        .from("attendance")
        .select("*")
        .eq("branche_id", e.id)
        .gte(dateDebut ? "date" : null, dateDebut || undefined)
        .lte(dateFin ? "date" : null, dateFin || undefined)
        .then(res => res.data || []);

      const evanData = await supabase
        .from("evangelises")
        .select("*")
        .eq("branche_id", e.id)
        .gte(dateDebut ? "created_at" : null, dateDebut || undefined)
        .lte(dateFin ? "created_at" : null, dateFin || undefined)
        .then(res => res.data || []);

      const baptemeData = await supabase
        .from("baptemes")
        .select("*")
        .eq("branche_id", e.id)
        .gte(dateDebut ? "date" : null, dateDebut || undefined)
        .lte(dateFin ? "date" : null, dateFin || undefined)
        .then(res => res.data || []);

      const formationData = await supabase
        .from("formations")
        .select("*")
        .eq("branche_id", e.id)
        .gte(dateDebut ? "date_debut" : null, dateDebut || undefined)
        .lte(dateFin ? "date_fin" : null, dateFin || undefined)
        .then(res => res.data || []);

      // calcul des totaux pour chaque ministère
      const calcTotals = (arr) => arr.reduce((acc, r) => {
        ["hommes","femmes","enfants","visiteurs","baptêmes"].forEach(c => acc[c] = (acc[c]||0) + (Number(r[c])||0));
        return acc;
      }, {});

      newStats[e.id] = {
        attendance: calcTotals(attendanceData),
        evangelisation: calcTotals(evanData),
        bapteme: calcTotals(baptemeData),
        formation: calcTotals(formationData)
      };
    }

    setStatsByEglise(newStats);
    setLoading(false);
  };

  const renderTable = (e) => {
    const stats = statsByEglise[e.id] || {};
    const ministres = [
      { label: "Culte", data: stats.attendance },
      { label: "Évangélisation", data: stats.evangelisation },
      { label: "Baptême", data: stats.bapteme },
      { label: "Formation", data: stats.formation }
    ];

    return (
      <div key={e.id} className="bg-white/10 rounded-xl p-4 mt-6">
        <h2 className="text-lg font-bold text-white mb-2">{e.nom} - {e.pays}</h2>
        <div className="flex font-semibold uppercase text-white border-b border-white/30">
          <div className="min-w-[180px]">Ministère</div>
          <div className="min-w-[100px] text-center">Hommes</div>
          <div className="min-w-[100px] text-center">Femmes</div>
          <div className="min-w-[100px] text-center">Enfants</div>
          <div className="min-w-[100px] text-center">Visiteurs</div>
          <div className="min-w-[100px] text-center">Baptêmes</div>
          <div className="min-w-[100px] text-center">Total</div>
        </div>

        {ministres.map((m, idx) => {
          const d = m.data || {};
          const total = ["hommes","femmes","enfants","visiteurs","baptêmes"].reduce((s, c) => s + (d[c]||0), 0);
          return (
            <div key={idx} className="flex px-2 py-1 text-white border-b border-white/20">
              <div className="min-w-[180px] font-semibold">{m.label}</div>
              <div className="min-w-[100px] text-center">{d.hommes || 0}</div>
              <div className="min-w-[100px] text-center">{d.femmes || 0}</div>
              <div className="min-w-[100px] text-center">{d.enfants || 0}</div>
              <div className="min-w-[100px] text-center">{d.visiteurs || 0}</div>
              <div className="min-w-[100px] text-center">{d.baptêmes || 0}</div>
              <div className="min-w-[100px] text-center font-bold">{total}</div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-[#333699]">
      <HeaderPages />
      <h1 className="text-2xl font-bold mt-4 mb-6 text-center text-white">
        Rapport <span className="text-amber-300">Statistiques Églises Supervisées</span>
      </h1>

      {/* FILTRES */}
      <div className="bg-white/10 p-6 rounded-2xl shadow-lg mt-6 flex gap-4 flex-wrap text-white">
        <input type="date" value={dateDebut} onChange={(e) => setDateDebut(e.target.value)} className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white" />
        <input type="date" value={dateFin} onChange={(e) => setDateFin(e.target.value)} className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white" />
        <button onClick={fetchStats} className="bg-[#2a2f85] px-6 py-2 rounded-xl hover:bg-[#1f2366]">Générer</button>
      </div>

      {loading && <p className="text-white mt-6">Chargement...</p>}

      {!loading && egls.map(renderTable)}

      <Footer />
    </div>
  );
}
