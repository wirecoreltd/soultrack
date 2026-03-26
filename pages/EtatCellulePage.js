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
  useEffect(() => {
    const fetchReports = async () => {
      try {
        // Récupérer l'utilisateur courant
        const session = await supabase.auth.getSession();
        const userId = session.data.session?.user?.id;
        if (!userId) return;

        // Récupérer la cellule du responsable
        const { data: celluleData } = await supabase
          .from("cellules")
          .select("id, responsable_id")
          .eq("responsable_id", userId)
          .single();

        const celluleId = celluleData?.id;

        // Fetch Etat Cellule
        const { data: dataCellule } = await supabase
          .from("etat_cellule")
          .select("*")
          .not("cellule_id", "is", null);

        // Fetch Membres venus par eglise
        const { data: dataEglise } = await supabase
          .from("membres_venus_par_eglise")
          .select("*")
          .not("cellule_id", "is", null);

        // Normaliser état cellule
        const normalizedCellule = (dataCellule || []).map((r) => ({
          id: r.id,
          prenom: r.prenom || "",
          nom: r.nom || "",
          nom_complet: `${r.prenom || ""} ${r.nom || ""}`,
          type_evangelisation: r.type_evangelisation || "Evangélisation",
          status_suivis_evangelises: r.status_suivis_evangelises,
          date_evangelise: r.date_evangelise,
          date_suivi: r.date_suivi,
          date_integration: r.date_integration,
          date_baptise: r.date_baptise,
          ministere_date: r.ministere_date,
          cellule_id: r.cellule_id,
          cellule_full: r.cellule_full,
          responsable_cellule: r.responsable_cellule,
        }));

        // Normaliser membres venus par église
        const normalizedEglise = (dataEglise || []).map((r) => ({
          id: r.id,
          prenom: r.prenom || "",
          nom: r.nom || "",
          nom_complet: r.nom_complet || `${r.prenom || ""} ${r.nom || ""}`,
          type_evangelisation: r.type_integration || "Integration",
          status_suivis_evangelises: r.statut || "Inconnu",
          date_evangelise: r.date_venu,
          date_suivi: r.envoyer_au_suivi_le,
          date_integration: r.date_integration,
          date_baptise: r.bapteme_date,
          ministere_date: r.debut_ministere,
          cellule_id: r.cellule_id,
          cellule_full: r.cellule_full,
          responsable_cellule: r.responsable_cellule,
        }));

        // Combiner les deux datasets
        let combined = [...normalizedCellule, ...normalizedEglise];

        // Filtrer uniquement les membres de la cellule du responsable
        if (celluleId) {
          combined = combined.filter(
            (r) => r.cellule_id === celluleId || r.cellule_full?.includes(celluleId)
          );
        }

        // Filtrer par dates
        if (filterDebut) {
          combined = combined.filter(
            (r) => new Date(r.date_evangelise) >= new Date(filterDebut)
          );
        }
        if (filterFin) {
          combined = combined.filter(
            (r) => new Date(r.date_evangelise) <= new Date(filterFin)
          );
        }

        setReports(combined);
        setShowTable(true);
      } catch (error) {
        console.error("Erreur fetch :", error);
      }
    };

    fetchReports();
  }, [filterDebut, filterFin]);

  // ================= UTIL =================
  const getStatusStyles = (status) => {
    if (!status) return { border: "border-gray-400", text: "text-gray-300" };
    const s = status.toLowerCase();
    if (s.includes("intégr") || s.includes("integre"))
      return { border: "border-green-500", text: "text-green-400" };
    if (s.includes("refus")) return { border: "border-red-500", text: "text-red-400" };
    if (s.includes("cours") || s.includes("suivi"))
      return { border: "border-orange-500", text: "text-orange-400" };
    return { border: "border-blue-500", text: "text-blue-400" };
  };

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
    return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`;
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
      return new Date(yearB, monthB) - new Date(yearA, monthA);
    });

  // ================= RENDER =================
  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-[#333699]">
      <HeaderPages />
      <h1 className="text-2xl font-bold mt-4 mb-6 text-center text-white">
        État de <span className="text-amber-300">Cellule</span>
      </h1>

      {/* FILTRES */}
      <div className="bg-white/10 p-6 rounded-2xl shadow-lg mt-2 flex justify-center gap-4 flex-wrap text-white">
        <input type="date" value={filterDebut} onChange={e=>setFilterDebut(e.target.value)} className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white"/>
        <input type="date" value={filterFin} onChange={e=>setFilterFin(e.target.value)} className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white"/>
        <button onClick={() => setShowTable(false)} className="bg-[#2a2f85] px-6 py-2 rounded-xl hover:bg-[#1f2366]">Générer</button>
      </div>

      {showTable && (
        <div className="w-full flex justify-center mt-6 mb-6">
          <div className="w-full max-w-7xl">
            {/* Desktop et Mobile */}
            {groupedReports.map(([monthKey, rows]) => {
              const [year, monthIndex] = monthKey.split("-").map(Number);
              const monthLabel = `${getMonthNameFR(monthIndex)} ${year}`;
              const isExpanded = expandedMonths[monthKey] || false;

              return (
                <div key={monthKey} className="space-y-2">
                  <div className="flex items-center px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 cursor-pointer border-l-4 border-amber-300" onClick={()=>toggleMonth(monthKey)}>
                    <div className="min-w-[150px] text-white font-semibold">{isExpanded ? "➖" : "➕"} {monthLabel} ({rows.length})</div>
                  </div>

                  {isExpanded && rows.map((r,i) => {
                    const statusStyle = getStatusStyles(r.status_suivis_evangelises);
                    return (
                      <div key={i} className={`flex flex-wrap md:flex-nowrap items-center px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 border-l-4 ${statusStyle.border}`}>
                        <div className="min-w-[150px] text-white">{formatDateFR(r.date_evangelise)}</div>
                        <div className="min-w-[200px] text-center text-white">{r.nom_complet}</div>
                        <div className="min-w-[200px] text-center text-white">{r.type_evangelisation}</div>
                        <div className={`min-w-[200px] text-center font-semibold ${statusStyle.text}`}>{r.status_suivis_evangelises}</div>
                        <div className="min-w-[150px] text-center text-white">{formatDateFR(r.date_suivi)}</div>
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
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
