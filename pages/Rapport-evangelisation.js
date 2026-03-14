"use client";

import { useState } from "react";
import supabase from "../lib/supabaseClient";
import HeaderPages from "../components/HeaderPages";
import Footer from "../components/Footer";
import ProtectedRoute from "../components/ProtectedRoute";

export default function RapportEvangelisation() {
  const [rapports, setRapports] = useState([]);
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFinF = useState("");
  const [message, setMessage] = useState("");
  const [showTable, setShowTable] = useState(false);
  const [expandedMonths, setExpandedMonths] = useState({});
  const [expandedTypes, setExpandedTypes] = useState({});
  const [selectedRapport, setSelectedRapport] = useState(null);
  const [editOpen, setEditOpen] = useState(false);

  const fetchRapports = async () => {
    // Ta logique fetch ici
  };

  const toggleMonth = (monthKey) => {
    setExpandedMonths((prev) => ({
      ...prev,
      [monthKey]: !prev[monthKey],
    }));
  };

  const toggleType = (typeKey) => {
    setExpandedTypes((prev) => ({
      ...prev,
      [typeKey]: !prev[typeKey],
    }));
  };

  const groupByMonth = (data) => {
    // Retourne un objet { "2026-03": [rapports du mois], ... }
  };

  const groupByType = (data) => {
    // Retourne un objet { "Type1": [rapports], "Type2": [rapports], ... }
  };

  const getMonthNameFR = (monthIndex) => {
    const months = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
    return months[monthIndex - 1] || "";
  };

  const groupedReports = groupByMonth(rapports);
  const borderColors = ["border-red-500","border-green-500","border-blue-500","border-yellow-500","border-purple-500","border-pink-500","border-indigo-500"];

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-[#333699]">
      <HeaderPages />

      <h1 className="text-2xl font-bold mt-4 mb-6 text-center">
        <span className="text-white">Rapport </span>
        <span className="text-amber-300">Evangélisation</span>
      </h1>

      {/* FILTRES */}
      <div className="bg-white/10 p-6 rounded-2xl shadow-lg mt-6 flex justify-center gap-4 flex-wrap text-white">
        <div className="flex flex-col w-full sm:w-auto">
          <label htmlFor="dateDebut" className="font-medium mb-1">Date de début</label>
          <input
            type="date"
            value={dateDebut}
            onChange={(e) => setDateDebut(e.target.value)}
            className="border border-gray-400 rounded-lg px-4 py-2 bg-transparent text-white"
          />
        </div>
        <div className="flex flex-col w-full sm:w-auto">
          <label htmlFor="dateFin" className="font-medium mb-1">Date de fin</label>
          <input
            type="date"
            value={dateFin}
            onChange={(e) => setDateFin(e.target.value)}
            className="border border-gray-400 rounded-lg px-4 py-2 bg-transparent text-white"
          />
        </div>
       <button
          onClick={async () => {
            if (!egliseId || !brancheId) {
              // Refetch profile au cas où
              const { data: sessionData } = await supabase.auth.getSession();
              const user = sessionData?.session?.user;
              if (!user) return;
        
              const { data: profile } = await supabase
                .from("profiles")
                .select("eglise_id, branche_id")
                .eq("id", user.id)
                .single();
        
              if (profile) {
                setEgliseId(profile.eglise_id);
                setBrancheId(profile.branche_id);
                await fetchRapports(profile.eglise_id, profile.branche_id); // fetch avec les IDs
              }
            } else {
              fetchRapports();
            }
          }}
          className="bg-[#2a2f85] px-6 py-2 rounded-xl hover:bg-[#1f2366] w-full sm:w-auto self-end"
        >
          Générer
        </button>
      </div>

      {message && <div className="text-center text-white mt-4 font-medium">{message}</div>}

      {/* TABLEAU GROUPÉ PAR MOIS */}
      {showTable && (
        <div className="w-full flex justify-center mt-8">
          <div className="w-full md:w-max space-y-2 overflow-x-auto">
            {/* HEADER Desktop */}
            <div className="hidden md:flex font-semibold uppercase text-white px-4 py-3 border-b border-white/30 bg-white/5 rounded-t-xl whitespace-nowrap">
              <div className="md:min-w-[150px] px-1.5">Date</div>
              <div className="md:min-w-[120px] text-center">Hommes</div>
              <div className="md:min-w-[120px] text-center">Femmes</div>
              <div className="md:min-w-[120px] text-center">Total</div>
              <div className="md:min-w-[150px] text-center">Prière</div>
              <div className="md:min-w-[180px] text-center">Nouveau Converti</div>
              <div className="md:min-w-[160px] text-center">Réconciliation</div>
              <div className="md:min-w-[160px] text-center">Moissonneurs</div>
              <div className="md:min-w-[140px] text-center">Actions</div>
            </div>

            {Object.entries(groupedReports).map(([monthKey, monthReports], idx) => {
              const [year, monthIndex] = monthKey.split("-").map(Number);
              const monthLabel = `${getMonthNameFR(monthIndex)} ${year}`;
              const totalMonth = monthReports.reduce((acc, r) => {
                acc.hommes += Number(r.hommes || 0);
                acc.femmes += Number(r.femmes || 0);
                acc.total += (Number(r.hommes || 0) + Number(r.femmes || 0));
                acc.priere += Number(r.priere || 0);
                acc.nouveau_converti += Number(r.nouveau_converti || 0);
                acc.reconciliation += Number(r.reconciliation || 0);
                acc.moissonneurs += Number(r.moissonneurs || 0);
                return acc;
              }, {hommes:0,femmes:0,total:0,priere:0,nouveau_converti:0,reconciliation:0,moissonneurs:0});

              const isExpanded = expandedMonths[monthKey] || false;
              const borderColor = borderColors[idx % borderColors.length];

              return (
                <div key={monthKey} className="space-y-1">
                  {/* HEADER MOIS */}
                  <div
                    className={`flex items-center px-4 py-2 rounded-lg bg-white/20 cursor-pointer ${borderColor}`}
                    onClick={() => toggleMonth(monthKey)}
                  >
                    <div className="min-w-[150px] text-white font-semibold">
                      {isExpanded ? "➖ " : "➕ "} {monthLabel}
                    </div>
                    <div className="min-w-[120px] text-center text-white font-bold">{totalMonth.hommes}</div>
                    <div className="min-w-[120px] text-center text-white font-bold">{totalMonth.femmes}</div>
                    <div className="min-w-[120px] text-center text-orange-400 font-semibold">{totalMonth.total}</div>
                    <div className="min-w-[150px] text-center text-white font-bold">{totalMonth.priere}</div>
                    <div className="min-w-[180px] text-center text-white font-bold">{totalMonth.nouveau_converti}</div>
                    <div className="min-w-[160px] text-center text-white font-bold">{totalMonth.reconciliation}</div>
                    <div className="min-w-[160px] text-center text-white font-bold">{totalMonth.moissonneurs}</div>
                  </div>

                  {/* Lignes rapports par type */}
                  {isExpanded && Object.entries(groupByType(monthReports)).map(([type, typeReports]) => {
                    const typeKey = `${monthKey}-${type}`;
                    const isTypeExpanded = expandedTypes[typeKey] || false;
                    const totalType = typeReports.reduce((acc, r) => {
                      acc.hommes += Number(r.hommes || 0);
                      acc.femmes += Number(r.femmes || 0);
                      acc.total += (Number(r.hommes || 0) + Number(r.femmes || 0));
                      acc.priere += Number(r.priere || 0);
                      acc.nouveau_converti += Number(r.nouveau_converti || 0);
                      acc.reconciliation += Number(r.reconciliation || 0);
                      acc.moissonneurs += Number(r.moissonneurs || 0);
                      return acc;
                    }, {hommes:0,femmes:0,total:0,priere:0,nouveau_converti:0,reconciliation:0,moissonneurs:0});

                    return (
                      <div key={typeKey} className="space-y-1">
                        {/* HEADER TYPE */}
                        <div
                          className="flex items-center px-4 py-2 rounded-lg bg-white/10 cursor-pointer ml-6"
                          onClick={() => toggleType(typeKey)}
                        >
                          <div className="min-w-[150px] text-white font-semibold">
                            {isTypeExpanded ? "➖ " : "➕ "} {type}
                          </div>
                          <div className="min-w-[120px] text-center text-white">{totalType.hommes}</div>
                          <div className="min-w-[120px] text-center text-white">{totalType.femmes}</div>
                          <div className="min-w-[120px] text-center text-orange-400">{totalType.total}</div>
                          <div className="min-w-[150px] text-center text-white">{totalType.priere}</div>
                          <div className="min-w-[180px] text-center text-white">{totalType.nouveau_converti}</div>
                          <div className="min-w-[160px] text-center text-white">{totalType.reconciliation}</div>
                          <div className="min-w-[160px] text-center text-white">{totalType.moissonneurs}</div>
                        </div>

                        {/* Lignes individuelles */}
                        {isTypeExpanded && typeReports.map((r) => {
                          const total = (Number(r.hommes || 0)) + (Number(r.femmes || 0));
                          return (
                            <div
                              key={r.id}
                              className="flex items-center px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition border-l-4 border-l-blue-500 ml-10"
                            >
                              <div className="min-w-[150px] text-white">{new Date(r.date).toLocaleDateString()}</div>
                              <div className="min-w-[120px] text-center text-white">{r.hommes ?? "-"}</div>
                              <div className="min-w-[120px] text-center text-white">{r.femmes ?? "-"}</div>
                              <div className="min-w-[120px] text-center text-orange-500">{total}</div>
                              <div className="min-w-[150px] text-center text-white">{r.priere ?? "-"}</div>
                              <div className="min-w-[180px] text-center text-white">{r.nouveau_converti ?? "-"}</div>
                              <div className="min-w-[160px] text-center text-white">{r.reconciliation ?? "-"}</div>
                              <div className="min-w-[160px] text-center text-white">{r.moissonneurs ?? "-"}</div>
                              <div className="min-w-[140px] text-center">
                                <button
                                  onClick={() => { setSelectedRapport(r); setEditOpen(true); }}
                                  className="text-orange-400 underline"
                                >
                                  Modifier
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              );
            })}

            {/* TOTAL GENERAL */}
            <div className="flex items-center px-4 py-4 mt-6 rounded-lg bg-white/30 text-white font-bold whitespace-nowrap border-t-2 border-white">
              <div className="min-w-[150px] font-bold text-orange-500">TOTAL</div>
              <div className="min-w-[120px] text-center text-orange-500 font-semibold">{rapports.reduce((s,r)=>s+Number(r.hommes||0),0)}</div>
              <div className="min-w-[120px] text-center text-orange-500 font-semibold">{rapports.reduce((s,r)=>s+Number(r.femmes||0),0)}</div>
              <div className="min-w-[120px] text-center text-orange-500 font-semibold">{rapports.reduce((s,r)=>(s+(Number(r.hommes||0)+Number(r.femmes||0))),0)}</div>
              <div className="min-w-[150px] text-center text-orange-500 font-semibold">{rapports.reduce((s,r)=>s+Number(r.priere||0),0)}</div>
              <div className="min-w-[180px] text-center text-orange-500 font-semibold">{rapports.reduce((s,r)=>s+Number(r.nouveau_converti||0),0)}</div>
              <div className="min-w-[160px] text-center text-orange-500 font-semibold">{rapports.reduce((s,r)=>s+Number(r.reconciliation||0),0)}</div>
              <div className="min-w-[160px] text-center text-orange-500 font-semibold">{rapports.reduce((s,r)=>s+Number(r.moissonneurs||0),0)}</div>
              <div className="min-w-[140px]"></div>
            </div>

            {rapports.length === 0 && (
              <div className="text-white/70 px-4 py-6 text-center">Aucun rapport trouvé</div>
            )}
          </div>
        </div>
      )}

      {selectedRapport && editOpen && (
        <EditModal rapport={selectedRapport} onClose={() => setEditOpen(false)} />
      )}

      <Footer />
    </div>
  );
}
