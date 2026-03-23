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
  const [showTable, setShowTable] = useState(false);
  const [filterDebut, setFilterDebut] = useState("");
  const [filterFin, setFilterFin] = useState("");
  const [userData, setUserData] = useState({ eglise_id: null, branche_id: null });

  const fetchUser = async () => {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("eglise_id, branche_id")
      .eq("id", session.session.user.id)
      .single();

    if (profile) setUserData({ eglise_id: profile.eglise_id, branche_id: profile.branche_id });
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchReports = async () => {
    let query = supabase
      .from("etat_cellule_view") // vue SQL que tu crées avec ton SELECT
      .select("*")
      .eq("eglise_id", userData.eglise_id)
      .eq("branche_id", userData.branche_id)
      .order("date_evangelise", { ascending: false });

    if (filterDebut) query = query.gte("date_evangelise", filterDebut);
    if (filterFin) query = query.lte("date_evangelise", filterFin);

    const { data } = await query;
    setReports(data || []);
    setShowTable(true);
  };

  const getMonthNameFR = (monthIndex) => {
    const months = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
    return months[monthIndex] || "";
  };

  const formatDateFR = (dateString) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`;
  };

  const groupByMonth = (rapports) => {
    const map = {};
    rapports.forEach(r => {
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
    .sort((a,b) => {
      const [yA,mA] = a[0].split("-").map(Number);
      const [yB,mB] = b[0].split("-").map(Number);
      return new Date(yA,mA) - new Date(yB,mB);
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
              <div className="min-w-[200px]">Nom & Prénom</div>
              <div className="min-w-[150px]">Téléphone</div>
              <div className="min-w-[150px]">Date Évangélisation</div>
              <div className="min-w-[200px]">Type Évangélisation</div>
              <div className="min-w-[200px]">Statut Suivi</div>
              <div className="min-w-[150px]">Date Intégration</div>
              <div className="min-w-[150px]">Date Baptême</div>
              <div className="min-w-[150px]">Date Ministère</div>
              <div className="min-w-[200px]">Cellule</div>
              <div className="min-w-[200px]">Responsable Cellule</div>
            </div>

            {groupedReports.map(([monthKey, monthRapports], idx) => {
              const [year, monthIndex] = monthKey.split("-").map(Number);
              const monthLabel = `${getMonthNameFR(monthIndex)} ${year}`;
              const isExpanded = expandedMonths[monthKey] || false;

              return (
                <div key={monthKey} className="space-y-1">
                  <div
                    className={`flex items-center px-4 py-2 rounded-lg bg-white/20 cursor-pointer border-l-4 border-orange-500`}
                    onClick={() => toggleMonth(monthKey)}
                  >
                    <div className="min-w-[200px] text-white font-semibold">
                      {isExpanded ? "➖ " : "➕ "} {monthLabel}
                    </div>
                  </div>

                  {(isExpanded || monthRapports.length === 1) &&
                    monthRapports.map(r => (
                      <div
                        key={r.id}
                        className="flex items-center px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition border-l-4 border-yellow-500"
                      >
                        <div className="min-w-[200px] text-white">{r.prenom} {r.nom}</div>
                        <div className="min-w-[150px] text-white">{r.telephone}</div>
                        <div className="min-w-[150px] text-white">{formatDateFR(r.date_evangelise)}</div>
                        <div className="min-w-[200px] text-white">{r.type_evangelisation}</div>
                        <div className="min-w-[200px] text-white">{r.status_suivis_evangelises}</div>
                        <div className="min-w-[150px] text-white">{formatDateFR(r.date_integration)}</div>
                        <div className="min-w-[150px] text-white">{formatDateFR(r.date_baptise)}</div>
                        <div className="min-w-[150px] text-white">{formatDateFR(r.ministere_date)}</div>
                        <div className="min-w-[200px] text-white">{r.cellule_full}</div>
                        <div className="min-w-[200px] text-white">{r.responsable_cellule}</div>
                      </div>
                    ))
                  }
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
          background: rgba(255,255,255,0.05);
          color: white;
        }
      `}</style>
    </div>
  );
}
