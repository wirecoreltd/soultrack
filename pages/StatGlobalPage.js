"use client";

import { useState, useEffect } from "react";
import supabase from "../lib/supabaseClient";
import HeaderPages from "../components/HeaderPages";
import Footer from "../components/Footer";
import ProtectedRoute from "../components/ProtectedRoute";

export default function StatGlobalPage() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur", "ResponsableIntegration", "ResponsableFormation"]}>
      <StatGlobal />
    </ProtectedRoute>
  );
}

function StatGlobal() {
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [reports, setReports] = useState([]);
  const [showTable, setShowTable] = useState(false);
  const [expandedMonths, setExpandedMonths] = useState({});
  const [superviseur, setSuperviseur] = useState({ eglise_id: null, branche_id: null });

  // Récupération user
  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase
        .from("profiles")
        .select("eglise_id, branche_id")
        .eq("id", user.id)
        .single();
      if (!error && data) setSuperviseur({ eglise_id: data.eglise_id, branche_id: data.branche_id });
    };
    loadUser();
  }, []);

  // Fetch rapports
  const fetchRapports = async () => {
    if (!superviseur.eglise_id || !superviseur.branche_id) return;
    setShowTable(false);

    const types = ["attendance","formations","evangelisation","bapteme"]; // ajoute les autres tables si besoin
    let allReports = [];

    for (let table of types) {
      let query = supabase
        .from(table)
        .select("*")
        .eq("eglise_id", superviseur.eglise_id)
        .eq("branche_id", superviseur.branche_id);

      if (dateDebut) query = query.gte("date", dateDebut).gte("date_debut", dateDebut);
      if (dateFin) query = query.lte("date", dateFin).lte("date_fin", dateFin);

      const { data, error } = await query;
      if (!error && data) {
        // ajouter type pour identification
        allReports.push(...data.map(r => ({ ...r, type })));
      }
    }

    // trier par date
    allReports.sort((a,b) => new Date(a.date || a.date_debut) - new Date(b.date || b.date_debut));

    setReports(allReports);
    setShowTable(true);
  };

  // Utils
  const formatDateFR = (d) => {
    if (!d) return "";
    const dt = new Date(d);
    return `${String(dt.getDate()).padStart(2,"0")}/${String(dt.getMonth()+1).padStart(2,"0")}/${dt.getFullYear()}`;
  };

  const getMonthNameFR = (i) => ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"][i];

  const groupByMonth = (reports) => {
    const map = {};
    reports.forEach(r => {
      const d = new Date(r.date || r.date_debut);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (!map[key]) map[key] = [];
      map[key].push(r);
    });
    return map;
  };

  const toggleMonth = (monthKey) => {
    setExpandedMonths(prev => ({ ...prev, [monthKey]: !prev[monthKey] }));
  };

  const groupedReports = groupByMonth(reports);
  const borderColors = ["border-red-500","border-green-500","border-blue-500","border-yellow-500","border-purple-500"];

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-[#333699]">
      <HeaderPages />
      <h1 className="text-2xl font-bold mt-4 mb-6 text-center">
        <span className="text-white">Statistiques</span> <span className="text-amber-300">Globales</span>
      </h1>

      {/* FILTRE */}
      <div className="bg-white/10 p-4 sm:p-6 rounded-2xl shadow-lg mt-4 flex flex-wrap gap-4 justify-center text-white">
        <input type="date" value={dateDebut} onChange={e => setDateDebut(e.target.value)} className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white"/>
        <input type="date" value={dateFin} onChange={e => setDateFin(e.target.value)} className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white"/>
        <button onClick={fetchRapports} className="bg-[#2a2f85] px-6 py-2 rounded-xl hover:bg-[#1f2366]">Générer</button>
      </div>

      {/* TABLEAU */}
      {showTable && (
        <div className="max-w-6xl w-full mt-6 flex flex-col gap-2">
          {Object.entries(groupedReports).map(([monthKey, monthReports], idx) => {
            const [year, monthIndex] = monthKey.split("-").map(Number);
            const monthLabel = `${getMonthNameFR(monthIndex)} ${year}`;
            const isExpanded = expandedMonths[monthKey] || false;
            const borderColor = borderColors[idx % borderColors.length];

            // Total du mois
            const totalMonth = monthReports.reduce((acc,r) => {
              acc.hommes += Number(r.hommes||0);
              acc.femmes += Number(r.femmes||0);
              acc.jeunes += Number(r.jeunes||0);
              acc.enfants += Number(r.enfants||0);
              acc.connectes += Number(r.connectes||0);
              acc.nouveauxVenus += Number(r.nouveauxVenus||0);
              acc.nouveauxConvertis += Number(r.nouveauxConvertis||0);
              return acc;
            }, {hommes:0,femmes:0,jeunes:0,enfants:0,connectes:0,nouveauxVenus:0,nouveauxConvertis:0});

            return (
              <div key={monthKey} className="space-y-1">
                {/* MOIS */}
                <div className={`flex items-center px-4 py-2 rounded-lg bg-white/20 cursor-pointer border-l-4 ${borderColor}`} onClick={()=>toggleMonth(monthKey)}>
                  <div className="text-white font-semibold min-w-[200px]">{isExpanded?"➖":"➕"} {monthLabel}</div>
                  <div className="text-orange-400 font-semibold ml-4">Total Hommes: {totalMonth.hommes}</div>
                  <div className="text-orange-400 font-semibold ml-4">Total Femmes: {totalMonth.femmes}</div>
                  <div className="text-orange-400 font-semibold ml-4">Total: {totalMonth.hommes + totalMonth.femmes}</div>
                </div>

                {isExpanded && monthReports.map((r) => (
                  <div key={r.id} className={`flex px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 border-l-4 ${borderColor}`}>
                    <div className="min-w-[200px] text-white">{r.eglise_nom || "Église"}</div>
                    <div className="min-w-[150px] text-white">{r.type}</div>
                    <div className="min-w-[120px] text-white text-center">{r.hommes}</div>
                    <div className="min-w-[120px] text-white text-center">{r.femmes}</div>
                    <div className="min-w-[120px] text-white text-center">{r.jeunes || 0}</div>
                    <div className="min-w-[120px] text-white text-center">{r.enfants || 0}</div>
                    <div className="min-w-[120px] text-white text-center">{r.connectes || 0}</div>
                    <div className="min-w-[120px] text-white text-center">{r.nouveauxVenus || 0}</div>
                    <div className="min-w-[120px] text-white text-center">{r.nouveauxConvertis || 0}</div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

      <Footer />
    </div>
  );
}
