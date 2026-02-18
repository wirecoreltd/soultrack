"use client";

import { useState, useEffect } from "react";
import supabase from "../lib/supabaseClient";
import HeaderPages from "../components/HeaderPages";
import Footer from "../components/Footer";
import ProtectedRoute from "../components/ProtectedRoute";

// 🔹 Fonction utilitaire pour formater la date
const formatDateFR = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

// 🔹 Fonction pour grouper les rapports par mois
const groupByMonth = (reports) => {
  const map = {};
  reports.forEach((r) => {
    const d = new Date(r.date);
    const key = `${d.getFullYear()}-${d.getMonth() + 1}`; // "2026-2"
    if (!map[key]) map[key] = [];
    map[key].push(r);
  });
  return map;
};

export default function AttendancePage() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur", "ResponsableIntegration"]}>
      <Attendance />
    </ProtectedRoute>
  );
}

function Attendance() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [superviseur, setSuperviseur] = useState({ eglise_id: null, branche_id: null });
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [expandedMonths, setExpandedMonths] = useState({}); // pour collapse/expand

  // 🔹 Charger eglise/branche du superviseur connecté
  useEffect(() => {
    const loadSuperviseur = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase
        .from("profiles")
        .select("eglise_id, branche_id")
        .eq("id", user.id)
        .single();
      if (!error) setSuperviseur({ eglise_id: data.eglise_id, branche_id: data.branche_id });
    };
    loadSuperviseur();
  }, []);

  // 🔹 Fetch rapports
  const fetchRapports = async () => {
    if (!superviseur.eglise_id || !superviseur.branche_id) return;
    setLoading(true);
    let query = supabase
      .from("attendance")
      .select("*")
      .eq("eglise_id", superviseur.eglise_id)
      .eq("branche_id", superviseur.branche_id)
      .order("date", { ascending: false });

    if (dateDebut) query = query.gte("date", dateDebut);
    if (dateFin) query = query.lte("date", dateFin);

    const { data, error } = await query;
    if (!error) setReports(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchRapports();
  }, [superviseur]);

  const toggleMonth = (monthKey) => {
    setExpandedMonths((prev) => ({ ...prev, [monthKey]: !prev[monthKey] }));
  };

  const groupedReports = groupByMonth(reports);

  if (loading)
    return <p className="text-center mt-10 text-lg text-white">Chargement...</p>;

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-[#333699]">
      <HeaderPages />

      <h1 className="text-2xl font-bold text-white mt-4 mb-6 text-center">
        Rapports d'assistance
      </h1>

      {/* 🔹 FILTRE DATE */}
      <div className="bg-white/10 p-4 sm:p-6 rounded-2xl shadow-lg mt-4 flex flex-wrap justify-center gap-4 text-white w-full max-w-3xl">
        <div className="flex flex-col w-full sm:w-auto">
          <label htmlFor="dateDebut" className="font-medium mb-1">Date de début</label>
          <input
            type="date"
            id="dateDebut"
            value={dateDebut}
            onChange={(e) => setDateDebut(e.target.value)}
            className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white"
          />
        </div>
        <div className="flex flex-col w-full sm:w-auto">
          <label htmlFor="dateFin" className="font-medium mb-1">Date de fin</label>
          <input
            type="date"
            id="dateFin"
            value={dateFin}
            onChange={(e) => setDateFin(e.target.value)}
            className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white"
          />
        </div>
        <button
          onClick={fetchRapports}
          className="bg-[#2a2f85] px-6 py-2 rounded-xl hover:bg-[#1f2366] w-full sm:w-auto self-end"
        >
          Générer
        </button>
      </div>

      {/* 🔹 Tableau */}
      <div className="max-w-5xl w-full overflow-x-auto mt-6 mb-6">
        <div className="w-max space-y-2">
          {/* HEADER */}
          <div className="flex font-semibold uppercase text-white px-4 py-3 border-b border-white/30 bg-white/5 rounded-t-xl whitespace-nowrap">
            <div className="min-w-[150px] ml-1">Date</div>
            <div className="min-w-[120px] text-center">Hommes</div>
            <div className="min-w-[120px] text-center">Femmes</div>
            <div className="min-w-[120px] text-center">Jeunes</div>
            <div className="min-w-[130px] text-center text-orange-400 font-semibold">Total</div>
            <div className="min-w-[120px] text-center">Enfants</div>
            <div className="min-w-[140px] text-center">Connectés</div>
            <div className="min-w-[150px] text-center">Nouveaux Venus</div>
            <div className="min-w-[180px] text-center">Nouveaux Convertis</div>
          </div>

          {/* LIGNES GROUPÉES */}
          {Object.entries(groupedReports).map(([monthKey, monthReports]) => {
            const totalMonth = monthReports.reduce((acc, r) => {
              acc.hommes += Number(r.hommes);
              acc.femmes += Number(r.femmes);
              acc.jeunes += Number(r.jeunes);
              return acc;
            }, { hommes: 0, femmes: 0, jeunes: 0 });

            const isExpanded = expandedMonths[monthKey] || false;

            return (
              <div key={monthKey} className="space-y-1">
                {/* LIGNE DU MOIS */}
                {monthReports.length > 1 && (
                  <div
                    className="flex items-center px-4 py-2 rounded-lg bg-white/20 cursor-pointer"
                    onClick={() => toggleMonth(monthKey)}
                  >
                    <div className="min-w-[150px] text-white font-semibold">
                      {isExpanded ? "➖ " : "➕ "} {monthKey}
                    </div>
                    <div className="min-w-[120px] text-center text-white font-bold">{totalMonth.hommes}</div>
                    <div className="min-w-[120px] text-center text-white font-bold">{totalMonth.femmes}</div>
                    <div className="min-w-[120px] text-center text-white font-bold">{totalMonth.jeunes}</div>
                    <div className="min-w-[130px] text-center text-orange-400 font-semibold">
                      {totalMonth.hommes + totalMonth.femmes + totalMonth.jeunes}
                    </div>
                  </div>
                )}

                {/* LIGNES DÉTAILLÉES */}
                {isExpanded &&
                  monthReports.map((r) => {
                    const total = Number(r.hommes) + Number(r.femmes) + Number(r.jeunes);
                    return (
                      <div
                        key={r.id}
                        className="flex items-center px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition border-l-4 border-l-green-500"
                      >
                        <div className="min-w-[150px] text-white">{formatDateFR(r.date)}</div>
                        <div className="min-w-[120px] text-center text-white">{r.hommes}</div>
                        <div className="min-w-[120px] text-center text-white">{r.femmes}</div>
                        <div className="min-w-[120px] text-center text-white">{r.jeunes}</div>
                        <div className="min-w-[130px] text-center text-orange-400 font-semibold">{total}</div>
                        <div className="min-w-[120px] text-center text-white">{r.enfants}</div>
                        <div className="min-w-[140px] text-center text-white">{r.connectes}</div>
                        <div className="min-w-[150px] text-center text-white">{r.nouveauxVenus}</div>
                        <div className="min-w-[180px] text-center text-white">{r.nouveauxConvertis}</div>
                      </div>
                    );
                  })}

                {/* LIGNE UNIQUE POUR MOIS AVEC 1 JOUR */}
                {monthReports.length === 1 && !isExpanded &&
                  (() => {
                    const r = monthReports[0];
                    const total = Number(r.hommes) + Number(r.femmes) + Number(r.jeunes);
                    return (
                      <div
                        key={r.id}
                        className="flex items-center px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition border-l-4 border-l-green-500"
                      >
                        <div className="min-w-[150px] text-white">{formatDateFR(r.date)}</div>
                        <div className="min-w-[120px] text-center text-white">{r.hommes}</div>
                        <div className="min-w-[120px] text-center text-white">{r.femmes}</div>
                        <div className="min-w-[120px] text-center text-white">{r.jeunes}</div>
                        <div className="min-w-[130px] text-center text-orange-400 font-semibold">{total}</div>
                        <div className="min-w-[120px] text-center text-white">{r.enfants}</div>
                        <div className="min-w-[140px] text-center text-white">{r.connectes}</div>
                        <div className="min-w-[150px] text-center text-white">{r.nouveauxVenus}</div>
                        <div className="min-w-[180px] text-center text-white">{r.nouveauxConvertis}</div>
                      </div>
                  )})}

              </div>
            );
          })}
        </div>
      </div>

      <Footer />
    </div>
  );
}
