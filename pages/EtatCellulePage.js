"use client";

import { useEffect, useState, useRef } from "react";
import supabase from "../lib/supabaseClient";
import HeaderPages from "../components/HeaderPages";
import Footer from "../components/Footer";
import ProtectedRoute from "../components/ProtectedRoute";

export default function EtatCellulePage() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur", "ResponsableCellule"]}>
      <EtatCellule />
    </ProtectedRoute>
  );
}

function EtatCellule() {
  const [reports, setReports] = useState([]);
  const [expandedMonths, setExpandedMonths] = useState({});
  const [filterDebut, setFilterDebut] = useState("");
  const [filterFin, setFilterFin] = useState("");
  const [showTable, setShowTable] = useState(false);

  const formRef = useRef(null);

  /* ================= FETCH DATA ================= */

  const fetchReports = async () => {
    let query = supabase.from("vue_etat_cellule").select("*").order("date_evangelise", { ascending: false });
    if (filterDebut) query = query.gte("date_evangelise", filterDebut);
    if (filterFin) query = query.lte("date_evangelise", filterFin);

    const { data } = await query;
    setReports(data || []);
    setShowTable(true);
  };

  /* ================= UTIL ================= */

  const getMonthNameFR = (monthIndex) => {
    const months = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
    return months[monthIndex] || "";
  };

  const formatDateFR = (dateString) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const groupByMonth = (data) => {
    const map = {};
    data.forEach(r => {
      const d = new Date(r.date_evangelise);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (!map[key]) map[key] = [];
      map[key].push(r);
    });
    return map;
  };

  const toggleMonth = (monthKey) => setExpandedMonths(prev => ({ ...prev, [monthKey]: !prev[monthKey] }));

  const groupedReports = Object.entries(groupByMonth(reports)).sort((a,b) => new Date(a[0]) - new Date(b[0]));

  const totalGlobal = reports.reduce((acc, r) => {
    acc.total++;
    return acc;
  }, { total: 0 });

  /* ================= RENDER ================= */

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-[#333699]">
      <HeaderPages />

      <h1 className="text-2xl font-bold mt-4 mb-6 text-center">
        <span className="text-white">État de </span>
        <span className="text-amber-300">Cellule</span>
      </h1>

      {/* ================= FILTRES ================= */}
      <div className="bg-white/10 p-6 rounded-2xl shadow-lg mt-2 flex justify-center gap-4 flex-wrap text-white">
        <input type="date" value={filterDebut} onChange={e => setFilterDebut(e.target.value)} className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white"/>
        <input type="date" value={filterFin} onChange={e => setFilterFin(e.target.value)} className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white"/>
        <button onClick={fetchReports} className="bg-[#2a2f85] px-6 py-2 rounded-xl hover:bg-[#1f2366]">Générer</button>
      </div>

      {/* ================= TABLEAU ================= */}
      {showTable && (
        <div className="w-full max-w-full overflow-x-auto mt-6 flex justify-center">
          <div className="w-max space-y-2">

            {/* HEADER TABLE */}
            <div className="flex text-sm font-semibold uppercase text-white px-4 py-3 border-b border-white/30 bg-white/5 rounded-t-xl whitespace-nowrap">
              <div className="min-w-[180px]">Nom</div>
              <div className="min-w-[180px]">Prénom</div>
              <div className="min-w-[150px]">Téléphone</div>
              <div className="min-w-[180px]">Date Évangélisation</div>
              <div className="min-w-[180px]">Type</div>
              <div className="min-w-[200px]">Cellule</div>
              <div className="min-w-[180px]">Responsable</div>
            </div>

            {groupedReports.map(([monthKey, monthData], idx) => {
              const [year, monthIndex] = monthKey.split("-").map(Number);
              const monthLabel = `${getMonthNameFR(monthIndex)} ${year}`;
              const isExpanded = expandedMonths[monthKey] || false;
              const borderColors = ["border-red-500","border-green-500","border-blue-500","border-yellow-500","border-purple-500"];
              const borderColor = borderColors[idx % borderColors.length];

              return (
                <div key={monthKey} className="space-y-1">
                  {/* MONTH ROW */}
                  <div className={`flex items-center px-4 py-2 rounded-lg bg-white/20 cursor-pointer border-l-4 ${borderColor}`} onClick={() => toggleMonth(monthKey)}>
                    <div className="min-w-[180px] text-white font-semibold">{isExpanded ? "➖ " : "➕ "} {monthLabel}</div>
                  </div>

                  {/* ROWS PER MONTH */}
                  {isExpanded && monthData.map(r => (
                    <div key={r.date_evangelise + r.nom} className={`flex items-center px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition border-l-4 ${borderColor}`}>
                      <div className="min-w-[180px] text-white">{r.nom}</div>
                      <div className="min-w-[180px] text-white">{r.prenom}</div>
                      <div className="min-w-[150px] text-white">{r.telephone}</div>
                      <div className="min-w-[180px] text-white">{formatDateFR(r.date_evangelise)}</div>
                      <div className="min-w-[180px] text-white">{r.type_evangelisation}</div>
                      <div className="min-w-[200px] text-white">{r.cellule_full}</div>
                      <div className="min-w-[180px] text-white">{r.responsable_cellule}</div>
                    </div>
                  ))}
                </div>
              );
            })}

          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
