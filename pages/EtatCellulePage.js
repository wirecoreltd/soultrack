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
  const [userId, setUserId] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        // Récupérer l'utilisateur connecté
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Récupérer le rôle depuis profiles
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        setUserId(user.id);
        setUserRole(profile?.role || null);

        fetchReports(user.id, profile?.role || null);
      } catch (err) {
        console.error("Erreur init :", err);
      }
    };
    init();
  }, []);

  const fetchReports = async (currentUserId, currentUserRole) => {
    try {
      setShowTable(false);

      const { data: dataCellule } = await supabase
        .from("etat_cellule")
        .select("*")
        .not("cellule_id", "is", null)
        .order("date_evangelise", { ascending: false });

      const { data: dataEglise } = await supabase
        .from("membres_venus_par_eglise")
        .select("*")
        .order("date_evangelise", { ascending: false });

      // Normaliser datasets
      let combined = [
        ...(dataCellule || []).map((r) => ({
          ...r,
          nom_complet: `${r.prenom} ${r.nom}`,
          type_evangelisation: r.type_evangelisation || "Evangélisation",
        })),
        ...(dataEglise || []).map((r) => ({
          ...r,
          nom_complet: r.nom_complet || `${r.prenom} ${r.nom}`,
          type_evangelisation: r.type_integration || "Integration",
          status_suivis_evangelises: r.statut || "Inconnu",
        })),
      ];

      // Filtrer contacts sans cellule
      combined = combined.filter((r) => r.cellule_full);

      // Si responsable, ne garder que ses cellules
      if (currentUserRole === "ResponsableCellule") {
        combined = combined.filter((r) => r.responsable_cellule === currentUserId);
      }

      // Filtrer par date
      if (filterDebut) combined = combined.filter((r) => new Date(r.date_evangelise) >= new Date(filterDebut));
      if (filterFin) combined = combined.filter((r) => new Date(r.date_evangelise) <= new Date(filterFin));

      setReports(combined);
      setShowTable(true);
    } catch (error) {
      console.error("Erreur fetch :", error);
      setReports([]);
      setShowTable(false);
    }
  };

  // ==== UTIL ====
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

  const getMonthNameFR = (monthIndex) => ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"][monthIndex] || "";

  const formatDateFR = (dateString) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`;
  };

  const groupByMonth = (reports) => {
    const map = {};
    reports.forEach((r) => {
      const d = new Date(r.date_evangelise);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (!map[key]) map[key] = [];
      map[key].push(r);
    });
    return map;
  };

  const toggleMonth = (monthKey) => setExpandedMonths((prev) => ({ ...prev, [monthKey]: !prev[monthKey] }));

  const groupedReports = Object.entries(groupByMonth(reports))
    .sort((a,b) => new Date(b[0].split("-")[0], b[0].split("-")[1]) - new Date(a[0].split("-")[0], a[0].split("-")[1]));

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-[#333699]">
      <HeaderPages />
      <h1 className="text-2xl font-bold mt-4 mb-6 text-center text-white">
        État de <span className="text-amber-300">Cellule</span>
      </h1>

      <div className="bg-white/10 p-6 rounded-2xl shadow-lg mt-2 flex justify-center gap-4 flex-wrap text-white">
        <input type="date" value={filterDebut} onChange={(e)=>setFilterDebut(e.target.value)} className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white"/>
        <input type="date" value={filterFin} onChange={(e)=>setFilterFin(e.target.value)} className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white"/>
        <button onClick={()=>fetchReports(userId,userRole)} className="bg-[#2a2f85] px-6 py-2 rounded-xl hover:bg-[#1f2366]">Générer</button>
      </div>

      {/* Tableau (desktop/mobile identique à ton admin) */}
      {showTable && (
        <div className="w-full flex justify-center mt-6 mb-6">
          <div className="w-full max-w-7xl">
            {/* Desktop */}
            <div className="hidden md:block w-full overflow-x-auto">
              <div className="w-max mx-auto space-y-2 bg-white/5 p-2 rounded-xl">
                <div className="flex text-sm font-semibold uppercase text-white px-4 py-3 border-b border-white/30 bg-white/5 rounded-t-xl whitespace-nowrap">
                  <div className="min-w-[150px]">Date Evangelisé</div>
                  <div className="min-w-[200px] text-center">Nom Complet</div>
                  <div className="min-w-[200px] text-center">Type</div>
                  <div className="min-w-[200px] text-center">Statut</div>
                  <div className="min-w-[150px] text-center">Envoyer au Suivi Le</div>
                  <div className="min-w-[150px] text-center">Date Intégration</div>
                  <div className="min-w-[150px] text-center">Date Baptême</div>
                  <div className="min-w-[150px] text-center">Début Ministère</div>
                  <div className="min-w-[220px] text-center">Cellule</div>
                  <div className="min-w-[200px] text-center">Responsable</div>
                </div>

                {groupedReports.map(([monthKey, rows])=>{
                  const [year, monthIndex]=monthKey.split("-").map(Number);
                  const monthLabel=`${getMonthNameFR(monthIndex)} ${year}`;
                  const isExpanded=expandedMonths[monthKey]||false;
                  return (
                    <div key={monthKey} className="space-y-1">
                      <div className="flex items-center px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition border-l-4 border-amber-300 cursor-pointer" onClick={()=>toggleMonth(monthKey)}>
                        <div className="min-w-[150px] text-white font-semibold">{isExpanded ? "➖" : "➕"} {monthLabel} ({rows.length})</div>
                      </div>
                      {isExpanded && rows.map((r,i)=>{
                        const statusStyle=getStatusStyles(r.status_suivis_evangelises);
                        return (
                          <div key={i} className={`flex items-center px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition border-l-4 ${statusStyle.border}`}>
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
                        )
                      })}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Mobile */}
            <div className="md:hidden space-y-4">
              {groupedReports.map(([monthKey, rows])=>{
                const [year, monthIndex]=monthKey.split("-").map(Number);
                const monthLabel=`${getMonthNameFR(monthIndex)} ${year}`;
                return (
                  <div key={monthKey} className="space-y-2">
                    <h3 className="text-white font-bold">{monthLabel}</h3>
                    {rows.map((r,i)=>(
                      <div key={i} className="bg-white/10 rounded-xl p-4 text-white space-y-1">
                        <p><strong>Date:</strong> {formatDateFR(r.date_evangelise)}</p>
                        <p><strong>Nom:</strong> {r.nom_complet}</p>
                        <p><strong>Type:</strong> {r.type_evangelisation}</p>
                        <p><strong>Statut:</strong> {r.status_suivis_evangelises}</p>
                        <p><strong>Envoyé au suivi:</strong> {formatDateFR(r.date_suivi)}</p>
                        <p><strong>Date Intégration:</strong> {formatDateFR(r.date_integration)}</p>
                        <p><strong>Baptême:</strong> {formatDateFR(r.date_baptise)}</p>
                        <p><strong>Début Ministère:</strong> {formatDateFR(r.ministere_date)}</p>
                        <p><strong>Cellule:</strong> {r.cellule_full}</p>
                        <p><strong>Responsable:</strong> {r.responsable_cellule}</p>
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      <Footer/>
    </div>
  );
}
