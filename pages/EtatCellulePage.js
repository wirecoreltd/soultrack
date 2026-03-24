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
  const [userCellule, setUserCellule] = useState(null);

  // ================= FETCH USER CELLULE =================
  useEffect(() => {
    const fetchUserCellule = async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) return;

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("cellule_id")
        .eq("id", session.session.user.id)
        .single();

      if (!error && profile) setUserCellule(profile.cellule_id);
    };
    fetchUserCellule();
  }, []);

  // ================= FETCH DATA =================
  const fetchReports = async () => {
    const { data, error } = await supabase
      .from("etat_cellule")
      .select("*")
      .order("date_evangelise", { ascending: false });

    if (error) {
      console.error("Erreur fetch :", error);
      return;
    }

    let filtered = data;

    // Filtrer sur cellule de l'utilisateur si responsable
    if (userCellule) filtered = filtered.filter(r => r.cellule_id === userCellule);

    // Filtrer par date
    if (filterDebut)
      filtered = filtered.filter(r => new Date(r.date_evangelise) >= new Date(filterDebut));
    if (filterFin)
      filtered = filtered.filter(r => new Date(r.date_evangelise) <= new Date(filterFin));

    // Afficher uniquement lignes avec cellule
    filtered = filtered.filter(r => r.cellule_id !== null);

    setReports(filtered);
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

      {showTable && (
        <div className="max-w-6xl w-full mt-6 mb-6">

          {/* HEADER DESKTOP */}
          <div className="hidden md:flex text-sm font-semibold uppercase text-white px-4 py-3 border-b border-white/30 bg-white/5 rounded-t-xl whitespace-nowrap">
            <div className="min-w-[150px]">Date</div>
            <div className="min-w-[200px] text-center">Nom / Prénom</div>
            <div className="min-w-[200px] text-center">Type</div>
            <div className="min-w-[200px] text-center">Suivi</div>
            <div className="min-w-[200px] text-center">Statut</div>
            <div className="min-w-[150px] text-center">Intégration</div>
            <div className="min-w-[150px] text-center">Baptême</div>
            <div className="min-w-[150px] text-center">Ministère</div>
            <div className="min-w-[220px] text-center">Cellule</div>
            <div className="min-w-[200px] text-center">Responsable</div>
          </div>

          {/* LIGNES DESKTOP */}
          {groupedReports.map(([monthKey, rows], idx) => {
            const [year, monthIndex] = monthKey.split("-").map(Number);
            const monthLabel = `${getMonthNameFR(monthIndex)} ${year}`;
            const isExpanded = expandedMonths[monthKey] || false;

            return (
              <div key={monthKey} className="space-y-1">

                {/* MOIS */}
                <div
                  className="hidden md:flex items-center px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition border-l-4 border-amber-300 cursor-pointer"
                  onClick={() => toggleMonth(monthKey)}
                >
                  <div className="min-w-[150px] text-white font-semibold">
                    {isExpanded ? "➖" : "➕"} {monthLabel} ({rows.length})
                  </div>
                </div>

                {/* LIGNES */}
                {isExpanded && rows.map((r, i) => {
                  let borderColor = "border-yellow-500 text-yellow-500";
                  if (r.status_suivis_evangelises === "Intégré") borderColor = "border-green-500 text-green-500";
                  else if (r.status_suivis_evangelises === "Refus") borderColor = "border-red-500 text-red-500";
                  else if (r.status_suivis_evangelises === "En cours") borderColor = "border-orange-500 text-orange-500";

                  return (
                    <div
                      key={i}
                      className={`hidden md:flex items-center px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition border-l-4 ${borderColor}`}
                    >
                      <div className="min-w-[150px] text-white">{formatDateFR(r.date_evangelise)}</div>
                      <div className="min-w-[200px] text-center text-white">{r.nom} {r.prenom}</div>
                      <div className="min-w-[200px] text-center text-white">{r.type_evangelisation}</div>
                      <div className="min-w-[200px] text-center text-white">{r.date_suivi ? formatDateFR(r.date_suivi) : ""}</div>
                      <div className="min-w-[200px] text-center text-white">{r.status_suivis_evangelises}</div>
                      <div className="min-w-[150px] text-center text-white">{formatDateFR(r.date_integration)}</div>
                      <div className="min-w-[150px] text-center text-white">{formatDateFR(r.date_baptise)}</div>
                      <div className="min-w-[150px] text-center text-white">{formatDateFR(r.ministere_date)}</div>
                      <div className="min-w-[220px] text-center text-white">{r.cellule_full}</div>
                      <div className="min-w-[200px] text-center text-white">{r.responsable_cellule}</div>
                    </div>
                  );
                })}

              </div>
            );
          })}

          {/* ================= MOBILE ================= */}
          <div className="md:hidden space-y-4">
            {groupedReports.map(([monthKey, rows]) => {
              const [year, monthIndex] = monthKey.split("-").map(Number);
              const monthLabel = `${getMonthNameFR(monthIndex)} ${year}`;

              return (
                <div key={monthKey} className="space-y-2">
                  <h3 className="text-white font-bold">{monthLabel}</h3>

                  {rows.map((r, i) => {
                    let borderColor = "border-yellow-500 text-yellow-500";
                    if (r.status_suivis_evangelises === "Intégré") borderColor = "border-green-500 text-green-500";
                    else if (r.status_suivis_evangelises === "Refus") borderColor = "border-red-500 text-red-500";
                    else if (r.status_suivis_evangelises === "En cours") borderColor = "border-orange-500 text-orange-500";

                    return (
                      <div
                        key={i}
                        className={`bg-white/10 border-l-4 ${borderColor} rounded-xl p-4 text-white space-y-1`}
                      >
                        <p><strong>Date:</strong> {formatDateFR(r.date_evangelise)}</p>
                        <p><strong>Nom:</strong> {r.nom} {r.prenom}</p>
                        <p><strong>Type:</strong> {r.type_evangelisation}</p>
                        <p><strong>Suivi:</strong> {r.date_suivi ? formatDateFR(r.date_suivi) : ""}</p>
                        <p><strong>Statut:</strong> {r.status_suivis_evangelises}</p>
                        <p><strong>Intégration:</strong> {formatDateFR(r.date_integration)}</p>
                        <p><strong>Baptême:</strong> {formatDateFR(r.date_baptise)}</p>
                        <p><strong>Ministère:</strong> {formatDateFR(r.ministere_date)}</p>
                        <p><strong>Cellule:</strong> {r.cellule_full}</p>
                        <p><strong>Responsable:</strong> {r.responsable_cellule}</p>
                      </div>
                    );
                  })}

                </div>
              );
            })}
          </div>

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
