"use client";

import { useEffect, useState } from "react";
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

  // ================= FETCH DATA =================
  const fetchReports = async () => {
    const sqlQuery = `
      SELECT
        e.prenom,
        e.nom,
        e.telephone,
        e.date_evangelise,
        e.type_evangelisation,
        e.status_suivis_evangelises,
        m.created_at AS date_integration,
        b.date AS date_baptise,
        MAX(s.created_at) AS ministere_date,
        c.cellule_full,
        c.responsable AS responsable_cellule
      FROM suivis_des_evangelises e
      LEFT JOIN membres_complets m 
        ON m.evangelise_member_id::uuid = e.evangelise_id
      LEFT JOIN baptemes b 
        ON b.evangelise_member_id::uuid = e.evangelise_id
      LEFT JOIN stats_ministere_besoin s 
        ON s.membre_id::uuid = m.id
      LEFT JOIN cellules c
        ON c.id::uuid = e.cellule_id
      WHERE e.cellule_id IS NOT NULL
      GROUP BY
        e.prenom,
        e.nom,
        e.telephone,
        e.date_evangelise,
        e.type_evangelisation,
        e.status_suivis_evangelises,
        m.created_at,
        b.date,
        c.cellule_full,
        c.responsable
      ORDER BY e.date_evangelise DESC;
    `;

    const { data, error } = await supabase.rpc("run_sql", { query: sqlQuery });

    if (error) {
      console.error("Erreur fetch :", error);
    } else {
      let filtered = data;
      if (filterDebut) filtered = filtered.filter(r => new Date(r.date_evangelise) >= new Date(filterDebut));
      if (filterFin) filtered = filtered.filter(r => new Date(r.date_evangelise) <= new Date(filterFin));

      setReports(filtered);
      setShowTable(true);
    }
  };

  // ================= UTIL =================
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

  const groupByMonth = (reports) => {
    const map = {};
    reports.forEach(r => {
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
      return new Date(yearB, monthB) - new Date(yearA, monthA); // tri décroissant
    });

  // ================= RENDER =================
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

      {/* ================= CARDS ================= */}
      {showTable && (
        <div className="w-full max-w-4xl mt-6 space-y-4">
          {groupedReports.map(([monthKey, monthReports], idx) => {
            const [year, monthIndex] = monthKey.split("-").map(Number);
            const monthLabel = `${getMonthNameFR(monthIndex)} ${year}`;
            const isExpanded = expandedMonths[monthKey] || false;

            return (
              <div key={monthKey} className="bg-white/10 rounded-2xl shadow-lg overflow-hidden">
                <div
                  className="flex justify-between items-center px-4 py-3 cursor-pointer bg-white/20 hover:bg-white/30 transition"
                  onClick={() => toggleMonth(monthKey)}
                >
                  <h2 className="text-white font-semibold">{monthLabel} ({monthReports.length})</h2>
                  <span className="text-white">{isExpanded ? "➖" : "➕"}</span>
                </div>

                {isExpanded && (
                  <div className="p-4 space-y-2">
                    {monthReports.map(r => (
                      <div key={r.evangelise_id} className="bg-white/10 p-3 rounded-lg flex flex-col space-y-1 hover:bg-white/20 transition">
                        <div><strong>Nom / Prénom:</strong> {r.nom} {r.prenom}</div>
                        <div><strong>Téléphone:</strong> {r.telephone}</div>
                        <div><strong>Date Évangélisé:</strong> {formatDateFR(r.date_evangelise)}</div>
                        <div><strong>Type:</strong> {r.type_evangelisation}</div>
                        <div><strong>Status:</strong> {r.status_suivis_evangelises}</div>
                        <div><strong>Date Intégration:</strong> {formatDateFR(r.date_integration)}</div>
                        <div><strong>Date Baptême:</strong> {formatDateFR(r.date_baptise)}</div>
                        <div><strong>Date Ministère:</strong> {formatDateFR(r.ministere_date)}</div>
                        <div><strong>Cellule:</strong> {r.cellule_full}</div>
                        <div><strong>Responsable:</strong> {r.responsable_cellule}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Footer />

      <style jsx>{`
        input {
          border: 1px solid #ccc;
          padding: 10px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.05);
          color: white;
        }
      `}</style>
    </div>
  );
}
