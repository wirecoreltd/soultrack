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
        try {
          // ================= USER =================
          const session = await supabase.auth.getSession();
          const userId = session.data.session?.user?.id;
      
          if (!userId) {
            console.error("Utilisateur non connecté");
            return;
          }
      
          // ================= PROFILE =================
          const { data: profile, error: profileError } = await supabase
  .from("profiles")
  .select("roles, eglise_id, branche_id")
  .eq("id", userId)
  .single();

    if (Error) {
      console.error("Erreur profile :", profileError);
      return;
    }
    
    const roles = profile?.roles || [];
    const isAdmin = roles.includes("Administrateur");
    
    const userEgliseId = profile?.eglise_id;
    const userBrancheId = profile?.branche_id;
      
          let data = [];
          let error = null;
      
          // ================= ADMIN =================
          if (isAdmin) {
            const res = await supabase
              .from("etat_cellule")
              .select("*")
              .not("cellule_id", "is", null)
              .in("status_suivis_evangelises", ["Intégré", "Refus", "En attente", "En suivi"])
              .order("date_evangelise", { ascending: false });
      
            data = res.data;
            error = res.error;
      
          } else {

            //===================
            const { data, error } = await supabase
  .from('membres_complets')
  .select('*')
  .is('sent_to_cellule', null)
  .neq('etat_contact', 'supprime')
  .in('statut', ['actif', 'nouveau'])
            
            // ================= RESPONSABLE =================
            const { data: cellules, error: cellulesError } = await supabase
              .from("cellules")
              .select("id")
              .eq("responsable_id", userId);
      
            if (cellulesError) throw cellulesError;
      
            const celluleIds = cellules.map(c => c.id);
      
            if (celluleIds.length === 0) {
              setReports([]);
              setShowTable(true);
              return;
            }
      
            const res = await supabase
              .from("etat_cellule")
              .select("*")
              .in("cellule_id", celluleIds)
              .in("status_suivis_evangelises", ["Intégré", "Refus", "En cours"])
              .eq("eglise_id", userEgliseId)
              .eq("branche_id", userBrancheId)
              .order("date_evangelise", { ascending: false });
            
      
            data = res.data;
            error = res.error;
          }
      
          if (error) throw error;
      
          // ================= FILTER DATE =================
          let filtered = data;
      
          if (filterDebut) {
            filtered = filtered.filter(r =>
              new Date(r.date_evangelise) >= new Date(filterDebut)
            );
          }
      
          if (filterFin) {
            filtered = filtered.filter(r =>
              new Date(r.date_evangelise) <= new Date(filterFin)
            );
          }
      
          setReports(filtered);
          setShowTable(true);
      
        } catch (err) {
          console.error("Erreur fetch :", err);
          setReports([]);
          setShowTable(false);
        }
      };

  //=======================
 const getStatusStyles = (status) => {
  if (!status) return {
    border: "border-gray-400",
    text: "text-gray-300"
  };

  const s = status.toLowerCase();

  // 🟢 INTÉGRÉ
  if (s.includes("intégr") || s.includes("integre")) {
    return {
      border: "border-green-500",
      text: "text-green-400"
    };
  }

  // 🔴 REFUS
  if (s.includes("refus")) {
    return {
      border: "border-red-500",
      text: "text-red-400"
    };
  }

  // 🟠 EN COURS
  if (s.includes("cours") || s.includes("suivi")) {
    return {
      border: "border-orange-500",
      text: "text-orange-400"
    };
  }

  // 🔵 AUTRE
  return {
    border: "border-blue-500",
    text: "text-blue-400"
  };
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

      {showTable && (
  <div className="w-full flex justify-center mt-6 mb-6">
    <div className="w-full max-w-7xl">

      {/* ================= DESKTOP ================= */}
      <div className="hidden md:block w-full overflow-x-auto">
        <div className="w-max mx-auto space-y-2 bg-white/5 p-2 rounded-xl">

          {/* HEADER */}
          <div className="flex text-sm font-semibold uppercase text-white px-4 py-3 border-b border-white/30 bg-white/5 rounded-t-xl whitespace-nowrap">
            <div className="min-w-[150px]">Date Evangelisé</div>
            <div className="min-w-[200px] text-center">Nom Complet</div>
            <div className="min-w-[200px] text-center">Type Evangélisation</div>
            <div className="min-w-[200px] text-center">Statut</div>
            <div className="min-w-[150px] text-center">Envoyer au <br/>Suivi Le</div>
            <div className="min-w-[150px] text-center">Date Intégration</div>
            <div className="min-w-[150px] text-center">Date Baptême</div>
            <div className="min-w-[150px] text-center">Début Ministère</div>
            <div className="min-w-[220px] text-center">Cellule</div>
            <div className="min-w-[200px] text-center">Responsable</div>
          </div>

          {groupedReports.map(([monthKey, rows]) => {
            const [year, monthIndex] = monthKey.split("-").map(Number);
            const monthLabel = `${getMonthNameFR(monthIndex)} ${year}`;
            const isExpanded = expandedMonths[monthKey] || false;

            return (
              <div key={monthKey} className="space-y-1">

                {/* MOIS */}
                <div
                  className="flex items-center px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition border-l-4 border-amber-300 cursor-pointer"
                  onClick={() => toggleMonth(monthKey)}
                >
                  <div className="min-w-[150px] text-white font-semibold">
                    {isExpanded ? "➖" : "➕"} {monthLabel} ({rows.length})
                  </div>
                </div>

                {/* LIGNES */}
                {isExpanded && rows.map((r, i) => {
                  const statusStyle = getStatusStyles(r.status_suivis_evangelises);
                
                  return (
                    <div
                      key={i}
                      className={`flex items-center px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition border-l-4 ${statusStyle.border}`}
                    >
                      {/* DATE */}
                      <div className="min-w-[150px] text-white">
                        {formatDateFR(r.date_evangelise)}
                      </div>
                
                      {/* NOM */}
                      <div className="min-w-[200px] text-center text-white">
                        {r.nom} {r.prenom}
                      </div>
                
                      {/* TYPE */}
                      <div className="min-w-[200px] text-center text-white">
                        {r.type_evangelisation}
                      </div>
                
                      {/* SUIVI */}
                      <div className="min-w-[150px] text-center text-white">
                        {r.date_suivi ? formatDateFR(r.date_suivi) : "—"}
                      </div>
                
                      {/* STATUT */}
                      <div className={`min-w-[200px] text-center font-semibold ${statusStyle.text}`}>
                        {r.status_suivis_evangelises}
                      </div>
                
                      {/* INTEGRATION */}
                      <div className="min-w-[150px] text-center text-white">
                        {formatDateFR(r.date_integration)}
                      </div>
                
                      {/* BAPTEME */}
                      <div className="min-w-[150px] text-center text-white">
                        {formatDateFR(r.date_baptise)}
                      </div>
                
                      {/* MINISTERE */}
                      <div className="min-w-[150px] text-center text-white">
                        {formatDateFR(r.ministere_date)}
                      </div>
                
                      {/* CELLULE */}
                      <div className="min-w-[220px] text-center text-white">
                        {r.cellule_full}
                      </div>
                
                      {/* RESPONSABLE */}
                      <div className="min-w-[200px] text-center text-white">
                        {r.responsable_cellule}
                      </div>
                    </div>
                  );
                })}

              </div>
            );
          })}

        </div>
      </div>

      {/* ================= MOBILE ================= */}
      <div className="md:hidden space-y-4">
        {groupedReports.map(([monthKey, rows]) => {
          const [year, monthIndex] = monthKey.split("-").map(Number);
          const monthLabel = `${getMonthNameFR(monthIndex)} ${year}`;

          return (
            <div key={monthKey} className="space-y-2">

              <h3 className="text-white font-bold">{monthLabel}</h3>

              {rows.map((r, i) => (
                <div key={i} className="bg-white/10 rounded-xl p-4 text-white space-y-1">
                  <p><strong>Date:</strong> {formatDateFR(r.date_evangelise)}</p>
                  <p><strong>Nom:</strong> {r.nom} {r.prenom}</p>
                  <p><strong>Type:</strong> {r.type_evangelisation}</p>
                  <p><strong>Statut:</strong> {r.status_suivis_evangelises}</p>
                  <p><strong>Intégration:</strong> {formatDateFR(r.date_integration)}</p>
                  <p><strong>Baptême:</strong> {formatDateFR(r.date_baptise)}</p>
                  <p><strong>Ministère:</strong> {formatDateFR(r.ministere_date)}</p>
                  <p><strong>Cellule:</strong> {r.cellule_full}</p>
                  <p><strong>Responsable:</strong> {r.responsable_cellule}</p>
                </div>
              ))}

            </div>
          );
        })}
      </div>

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
