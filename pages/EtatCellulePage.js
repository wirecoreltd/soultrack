"use client";

import { useEffect, useState, useRef } from "react";
import supabase from "../lib/supabaseClient";
import HeaderPages from "../components/HeaderPages";
import Footer from "../components/Footer";
import ProtectedRoute from "../components/ProtectedRoute";

export default function EtatCelluleWrapper() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur", "ResponsableCellule"]}>
      <EtatCellulePage />
    </ProtectedRoute>
  );
}

function EtatCellulePage() {
  const [reports, setReports] = useState([]);
  const [expandedMonths, setExpandedMonths] = useState({});
  const [filterDebut, setFilterDebut] = useState("");
  const [filterFin, setFilterFin] = useState("");
  const [showTable, setShowTable] = useState(false);
  const formRef = useRef(null);

  // ================= FETCH =================
  const fetchReports = async () => {
    let query = supabase.rpc("get_etat_cellule"); // Remplacer par un rpc ou table si besoin
    if (filterDebut) query = query.gte("date_evangelise", filterDebut);
    if (filterFin) query = query.lte("date_evangelise", filterFin);

    const { data } = await query;
    setReports(data || []);
    setShowTable(true);
  };

  // ================= UTIL =================
  const formatDateFR = (dateString) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const getMonthNameFR = (monthIndex) => {
    const months = [
      "Janvier","Février","Mars","Avril","Mai","Juin",
      "Juillet","Août","Septembre","Octobre","Novembre","Décembre"
    ];
    return months[monthIndex] || "";
  };

  const groupByMonth = (reports) => {
    const map = {};
    reports.forEach(r => {
      if (!r.cellule_full) return; // ignorer si pas de cellule
      const d = new Date(r.date_evangelise);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (!map[key]) map[key] = [];
      map[key].push(r);
    });
    return map;
  };

  const toggleMonth = (monthKey) => {
    setExpandedMonths(prev => ({ ...prev, [monthKey]: !prev[monthKey] }));
  };

  const groupedReports = Object.entries(groupByMonth(reports))
    .sort((a, b) => {
      const [yearA, monthA] = a[0].split("-").map(Number);
      const [yearB, monthB] = b[0].split("-").map(Number);
      return new Date(yearA, monthA) - new Date(yearB, monthB);
    });

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-[#333699]">
      <HeaderPages />

      <h1 className="text-2xl font-bold mt-4 mb-6 text-center text-white">
        État de <span className="text-amber-300">Cellule</span>
      </h1>

      {/* ================= FILTRES ================= */}
      <div className="bg-white/10 p-6 rounded-2xl shadow-lg mt-2 flex justify-center gap-4 flex-wrap text-white">
        <input
          type="date"
          value={filterDebut}
          onChange={(e) => setFilterDebut(e.target.value)}
          className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white"
        />
        <input
          type="date"
          value={filterFin}
          onChange={(e) => setFilterFin(e.target.value)}
          className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white"
        />
        <button
          onClick={fetchReports}
          className="bg-[#2a2f85] px-6 py-2 rounded-xl hover:bg-[#1f2366]"
        >
          Générer
        </button>
      </div>

      {/* ================= TABLEAU ================= */}
      {showTable && (
        <div className="w-full max-w-full overflow-x-auto mt-6 flex justify-center">
          <div className="w-max space-y-2">

            {/* HEADER */}
            <div className="flex text-sm font-semibold uppercase text-white px-4 py-3 border-b border-white/30 bg-white/5 rounded-t-xl whitespace-nowrap">
              <div className="min-w-[200px]">Prénom</div>
              <div className="min-w-[200px]">Nom</div>
              <div className="min-w-[200px]">Cellule</div>
              <div className="min-w-[200px]">Responsable</div>
              <div className="min-w-[150px] text-center">Date Evangelisation</div>
              <div className="min-w-[150px] text-center">Type</div>
              <div className="min-w-[150px] text-center">Status Suivis</div>
              <div className="min-w-[150px] text-center">Date Intégration</div>
              <div className="min-w-[150px] text-center">Date Baptême</div>
              <div className="min-w-[150px] text-center">Date Ministère</div>
            </div>

            {/* LIGNES */}
            {groupedReports.map(([monthKey, monthReports], idx) => {
              const [year, monthIndex] = monthKey.split("-").map(Number);
              const monthLabel = `${getMonthNameFR(monthIndex)} ${year}`;
              const isExpanded = expandedMonths[monthKey] || false;

              return (
                <div key={monthKey} className="space-y-1">
                  {/* Ligne mois */}
                  <div
                    className={`flex items-center px-4 py-2 rounded-lg bg-white/20 cursor-pointer border-l-4 border-orange-500`}
                    onClick={() => toggleMonth(monthKey)}
                  >
                    <div className="min-w-[200px] text-white font-semibold">
                      {isExpanded ? "➖ " : "➕ "} {monthLabel}
                    </div>
                  </div>

                  {/* Détails par personne */}
                  {isExpanded && monthReports.map(r => (
                    <div
                      key={r.evangelise_id}
                      className="flex items-center px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition border-l-4 border-yellow-500 cursor-pointer text-white"
                    >
                      <div className="min-w-[200px]">{r.prenom}</div>
                      <div className="min-w-[200px]">{r.nom}</div>
                      <div className="min-w-[200px]">{r.cellule_full}</div>
                      <div className="min-w-[200px]">{r.responsable_cellule}</div>
                      <div className="min-w-[150px] text-center">{formatDateFR(r.date_evangelise)}</div>
                      <div className="min-w-[150px] text-center">{r.type_evangelisation}</div>
                      <div className="min-w-[150px] text-center">{r.status_suivis_evangelises}</div>
                      <div className="min-w-[150px] text-center">{formatDateFR(r.date_integration)}</div>
                      <div className="min-w-[150px] text-center">{formatDateFR(r.date_baptise)}</div>
                      <div className="min-w-[150px] text-center">{formatDateFR(r.ministere_date)}</div>
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
