"use client";

import { useState, useEffect } from "react";
import supabase from "../lib/supabaseClient";
import HeaderPages from "../components/HeaderPages";
import Footer from "../components/Footer";
import ProtectedRoute from "../components/ProtectedRoute";

export default function StatGlobalPage() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur", "ResponsableIntegration"]}>
      <StatGlobal />
    </ProtectedRoute>
  );
}

function StatGlobal() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showTable, setShowTable] = useState(false);

  const [superviseur, setSuperviseur] = useState({ eglise_id: null, branche_id: null });

  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");

  const [expandedMonths, setExpandedMonths] = useState({});

  // Charger eglise/branche du superviseur connecté
  useEffect(() => {
    const loadSuperviseur = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("eglise_id, branche_id")
        .eq("id", user.id)
        .single();

      if (error) console.error("Erreur fetch superviseur :", error);
      else setSuperviseur({ eglise_id: data.eglise_id, branche_id: data.branche_id });
    };
    loadSuperviseur();
  }, []);

  // Fetch rapports StatGlobal
  const fetchRapports = async () => {
    if (!superviseur.eglise_id || !superviseur.branche_id) return;

    setLoading(true);
    setShowTable(false);

    let query = supabase
      .from("stat_global") // <-- nom de la table Supabase
      .select("*")
      .eq("eglise_id", superviseur.eglise_id)
      .eq("branche_id", superviseur.branche_id);

    if (dateDebut) query = query.gte("date", dateDebut);
    if (dateFin) query = query.lte("date", dateFin);

    query = query.order("date", { ascending: true });

    const { data, error } = await query;
    if (error) console.error("❌ Erreur fetch:", error);
    else setReports(data || []);

    setLoading(false);
    setShowTable(true);
  };

  const formatDateFR = (d) => {
    const dateObj = new Date(d);
    const day = String(dateObj.getDate()).padStart(2, "0");
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const year = dateObj.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const getMonthNameFR = (monthIndex) => {
    const months = [
      "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
      "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
    ];
    return months[monthIndex] || "";
  };

  const groupByMonth = (reports) => {
    const map = {};
    reports.forEach((r) => {
      const d = new Date(r.date);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (!map[key]) map[key] = [];
      map[key].push(r);
    });
    return map;
  };

  const toggleMonth = (monthKey) => {
    setExpandedMonths((prev) => ({
      ...prev,
      [monthKey]: !prev[monthKey],
    }));
  };

  const groupedReports = groupByMonth(reports);

  // TOTAL GLOBAL
  const totalGlobal = reports.reduce((acc, r) => {
    acc.culte += Number(r.culte || 0);
    acc.evangelisation += Number(r.evangelisation || 0);
    acc.bapteme += Number(r.bapteme || 0);
    acc.formation += Number(r.formation || 0);
    acc.cellules += Number(r.cellules || 0);
    acc.serviteur += Number(r.serviteur || 0);
    return acc;
  }, {
    culte: 0,
    evangelisation: 0,
    bapteme: 0,
    formation: 0,
    cellules: 0,
    serviteur: 0,
  });

  const borderColors = ["border-red-500","border-green-500","border-blue-500","border-yellow-500","border-purple-500","border-pink-500","border-indigo-500"];

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-[#333699]">
      <HeaderPages />
      <h1 className="text-2xl font-bold text-white mt-4 mb-6 text-center">Statistiques Globales</h1>

      {/* Filtre date */}
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

      {/* 🔹 Tableau groupé par mois */}
      {showTable && (
        <div className="max-w-5xl w-full overflow-x-auto mt-6 mb-6">
          <div className="w-max space-y-2">
            {/* HEADER */}
            <div className="flex font-semibold uppercase text-white px-4 py-3 border-b border-white/30 bg-white/5 rounded-t-xl whitespace-nowrap">
              <div className="min-w-[150px]">Mois</div>
              <div className="min-w-[120px] text-center">Culte</div>
              <div className="min-w-[150px] text-center">Évangélisation</div>
              <div className="min-w-[120px] text-center">Baptême</div>
              <div className="min-w-[120px] text-center">Formation</div>
              <div className="min-w-[120px] text-center">Cellules</div>
              <div className="min-w-[120px] text-center">Serviteur</div>
            </div>

            {/* LIGNES PAR MOIS */}
            {Object.entries(groupedReports).map(([monthKey, monthReports], idx) => {
              const [year, monthIndex] = monthKey.split("-").map(Number);
              const monthLabel = `${getMonthNameFR(monthIndex)} ${year}`;

              const totalMonth = monthReports.reduce((acc, r) => {
                acc.culte += Number(r.culte || 0);
                acc.evangelisation += Number(r.evangelisation || 0);
                acc.bapteme += Number(r.bapteme || 0);
                acc.formation += Number(r.formation || 0);
                acc.cellules += Number(r.cellules || 0);
                acc.serviteur += Number(r.serviteur || 0);
                return acc;
              }, { culte: 0, evangelisation: 0, bapteme: 0, formation: 0, cellules: 0, serviteur: 0 });

              const isExpanded = expandedMonths[monthKey] || false;
              const borderColor = borderColors[idx % borderColors.length];

              return (
                <div key={monthKey} className="space-y-1">
                  {/* HEADER MOIS */}
                  <div
                    className={`flex items-center px-4 py-2 rounded-lg bg-white/20 cursor-pointer ${borderColor}`}
                    onClick={() => toggleMonth(monthKey)}
                  >
                    <div className="min-w-[150px] text-white font-semibold">
                      {isExpanded ? "➖ " : "➕ "} {monthLabel}
                    </div>
                    <div className="min-w-[120px] text-center text-white font-bold">{totalMonth.culte}</div>
                    <div className="min-w-[150px] text-center text-white font-bold">{totalMonth.evangelisation}</div>
                    <div className="min-w-[120px] text-center text-white font-bold">{totalMonth.bapteme}</div>
                    <div className="min-w-[120px] text-center text-white font-bold">{totalMonth.formation}</div>
                    <div className="min-w-[120px] text-center text-white font-bold">{totalMonth.cellules}</div>
                    <div className="min-w-[120px] text-center text-white font-bold">{totalMonth.serviteur}</div>
                  </div>

                  {/* LIGNES DETAILS */}
                  {isExpanded && monthReports.map((r) => (
                    <div key={r.id} className="flex items-center px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition border-l-4 border-l-blue-500">
                      <div className="min-w-[150px] text-white">{formatDateFR(r.date)}</div>
                      <div className="min-w-[120px] text-center text-white">{r.culte}</div>
                      <div className="min-w-[150px] text-center text-white">{r.evangelisation}</div>
                      <div className="min-w-[120px] text-center text-white">{r.bapteme}</div>
                      <div className="min-w-[120px] text-center text-white">{r.formation}</div>
                      <div className="min-w-[120px] text-center text-white">{r.cellules}</div>
                      <div className="min-w-[120px] text-center text-white">{r.serviteur}</div>
                    </div>
                  ))}
                </div>
              )
            })}

            {/* TOTAL GLOBAL */}
            <div className="flex items-center px-6 py-3 mt-2 border-t border-white/50 bg-white/10 rounded-b-xl text-orange-500 font-semibold">
              <div className="min-w-[150px]">Total Global</div>
              <div className="min-w-[120px] text-center">{totalGlobal.culte}</div>
              <div className="min-w-[150px] text-center">{totalGlobal.evangelisation}</div>
              <div className="min-w-[120px] text-center">{totalGlobal.bapteme}</div>
              <div className="min-w-[120px] text-center">{totalGlobal.formation}</div>
              <div className="min-w-[120px] text-center">{totalGlobal.cellules}</div>
              <div className="min-w-[120px] text-center">{totalGlobal.serviteur}</div>
            </div>

          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
