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
  const [rapports, setRapports] = useState([]);
  const [expandedMonths, setExpandedMonths] = useState({});
  const [filterDebut, setFilterDebut] = useState("");
  const [filterFin, setFilterFin] = useState("");
  const [showTable, setShowTable] = useState(false);

  const formRef = useRef(null);

  // ================= FETCH DATA =================
  const fetchRapports = async () => {
    const { data } = await supabase
      .from("vue_etat_cellule") // ta vue SQL
      .select("*")
      .order("date_evangelise", { ascending: false })
      .gte(filterDebut ? "date_evangelise" : "date_evangelise", filterDebut || "1900-01-01")
      .lte(filterFin ? "date_evangelise" : "date_evangelise", filterFin || "2100-12-31");

    setRapports(data || []);
    setShowTable(true);
  };

  // ================= UTIL =================
  const getMonthNameFR = (monthIndex) => {
    const months = [
      "Janvier","Février","Mars","Avril","Mai","Juin",
      "Juillet","Août","Septembre","Octobre","Novembre","Décembre"
    ];
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

  const toggleMonth = (monthKey) => {
    setExpandedMonths(prev => ({ ...prev, [monthKey]: !prev[monthKey] }));
  };

  const groupedReports = Object.entries(groupByMonth(rapports))
    .sort((a,b) => new Date(a[0]) - new Date(b[0]));

  const totalGlobal = rapports.length; // total de personnes

  // ================= RENDER =================
  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-[#333699]">
      <HeaderPages />

      <h1 className="text-2xl font-bold mt-4 mb-6 text-center">
        <span className="text-white">État de </span>
        <span className="text-amber-300">Cellule</span>
      </h1>

      <p className="text-white/80 mb-6">Liste des évangélisés par cellule</p>

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
          onClick={fetchRapports}
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
              <div className="min-w-[220px]">Nom / Prénom</div>
              <div className="min-w-[140px]">Téléphone</div>
              <div className="min-w-[180px]">Date Evangelise</div>
              <div className="min-w-[180px]">Type Evangelisation</div>
              <div className="min-w-[200px]">Status Suivis</div>
              <div className="min-w-[180px]">Date Intégration</div>
              <div className="min-w-[180px]">Date Baptême</div>
              <div className="min-w-[180px]">Ministère Date</div>
              <div className="min-w-[220px]">Cellule</div>
              <div className="min-w-[200px]">Responsable</div>
            </div>

            {groupedReports.map(([monthKey, monthRapports], idx) => {
              const [year, monthIndex] = monthKey.split("-").map(Number);
              const monthLabel = `${getMonthNameFR(monthIndex)} ${year}`;
              const totalMonth = monthRapports.length;
              const isExpanded = expandedMonths[monthKey] || false;
              const borderColors = ["border-red-500","border-green-500","border-blue-500","border-yellow-500"];
              const borderColor = borderColors[idx % borderColors.length];

              return (
                <div key={monthKey} className="space-y-1">
                  {/* HEADER MOIS */}
                  <div
                    className={`flex items-center px-4 py-2 rounded-lg bg-white/20 cursor-pointer border-l-4 ${borderColor}`}
                    onClick={() => toggleMonth(monthKey)}
                  >
                    <div className="min-w-[220px] text-white font-semibold">
                      {isExpanded ? "➖ " : "➕ "} {monthLabel}
                    </div>
                    <div className="min-w-[140px]"></div>
                    <div className="min-w-[180px]"></div>
                    <div className="min-w-[180px]"></div>
                    <div className="min-w-[200px]"></div>
                    <div className="min-w-[180px]"></div>
                    <div className="min-w-[180px]"></div>
                    <div className="min-w-[180px]"></div>
                    <div className="min-w-[220px] text-orange-400 font-bold text-center">{totalMonth}</div>
                    <div className="min-w-[200px]"></div>
                  </div>

                  {/* LIGNES */}
                  {isExpanded && monthRapports.map(r => (
                    <div
                      key={r.evangelise_id}
                      className={`flex items-center px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition border-l-4 ${borderColor}`}
                    >
                      <div className="min-w-[220px] text-white">{r.nom} {r.prenom}</div>
                      <div className="min-w-[140px] text-white">{r.telephone}</div>
                      <div className="min-w-[180px] text-white">{formatDateFR(r.date_evangelise)}</div>
                      <div className="min-w-[180px] text-white">{r.type_evangelisation}</div>
                      <div className="min-w-[200px] text-white">{r.status_suivis_evangelises}</div>
                      <div className="min-w-[180px] text-white">{formatDateFR(r.date_integration)}</div>
                      <div className="min-w-[180px] text-white">{formatDateFR(r.date_baptise)}</div>
                      <div className="min-w-[180px] text-white">{formatDateFR(r.ministere_date)}</div>
                      <div className="min-w-[220px] text-white">{r.cellule_full}</div>
                      <div className="min-w-[200px] text-white">{r.responsable_cellule}</div>
                    </div>
                  ))}
                </div>
              );
            })}

            {/* TOTAL GLOBAL */}
            <div className="flex items-center px-4 py-3 mt-2 border-t border-white/50 bg-white/10 rounded-b-xl">
              <div className="min-w-[220px] text-white font-bold">TOTAL Évangélisés</div>
              <div className="min-w-[140px]"></div>
              <div className="min-w-[180px]"></div>
              <div className="min-w-[180px]"></div>
              <div className="min-w-[200px]"></div>
              <div className="min-w-[180px]"></div>
              <div className="min-w-[180px]"></div>
              <div className="min-w-[180px]"></div>
              <div className="min-w-[220px] text-orange-400 font-bold text-center">{totalGlobal}</div>
              <div className="min-w-[200px]"></div>
            </div>

          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
