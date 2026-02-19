"use client";

import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import HeaderPages from "../components/HeaderPages";
import ProtectedRoute from "../components/ProtectedRoute";
import Footer from "../components/Footer";

export default function StatGlobalPageWrapper() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur", "Responsable"]}>
      <StatGlobalPage />
    </ProtectedRoute>
  );
}

function StatGlobalPage() {
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [statsByMonth, setStatsByMonth] = useState([]);
  const [collapsedMonths, setCollapsedMonths] = useState({});
  const [egliseId, setEgliseId] = useState(null);
  const [brancheId, setBrancheId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("eglise_id, branche_id")
        .eq("id", user.id)
        .single();

      if (data) {
        setEgliseId(data.eglise_id);
        setBrancheId(data.branche_id);
      }
    };
    fetchProfile();
  }, []);

  const fetchStats = async () => {
    if (!egliseId || !brancheId) return;
    setLoading(true);

    // ================= FETCH =================
    let evanQuery = supabase
      .from("evangelises")
      .select("*")
      .eq("eglise_id", egliseId)
      .eq("branche_id", brancheId);

    if (dateDebut) evanQuery = evanQuery.gte("created_at", dateDebut);
    if (dateFin) evanQuery = evanQuery.lte("created_at", dateFin);

    const { data: evanData } = await evanQuery;

    let servQuery = supabase
      .from("membres_complets")
      .select("*")
      .eq("eglise_id", egliseId)
      .eq("branche_id", brancheId)
      .eq("star", true)
      .in("etat_contact", ["Existant", "Nouveau"]);

    if (dateDebut) servQuery = servQuery.gte("created_at", dateDebut);
    if (dateFin) servQuery = servQuery.lte("created_at", dateFin);

    const { data: servData } = await servQuery;

    // ================= GROUP BY MONTH =================
    const grouped = {};

    const addToGroup = (r, type) => {
      const monthKey = new Date(r.created_at).toLocaleString("fr-FR", { month: "long", year: "numeric" });
      if (!grouped[monthKey]) grouped[monthKey] = [];
      grouped[monthKey].push({
        id: r.id || `${type}-${Math.random()}`,
        type,
        hommes: r.hommes || (r.sexe === "Homme" ? 1 : 0),
        femmes: r.femmes || (r.sexe === "Femme" ? 1 : 0),
        jeunes: r.jeunes || 0,
        enfants: r.enfants || 0,
        connectes: r.connectes || 0,
        nouveauxVenus: r.nouveauxVenus || 0,
        nouveauxConvertis: r.nouveauxConvertis || 0,
        moissonneurs: r.moissonneurs || 0,
      });
    };

    evanData?.forEach(r => addToGroup(r, "Evangelisation"));
    servData?.forEach(r => addToGroup(r, "Serviteur"));

    // ================= CALCULE STATS =================
    const monthsStats = Object.keys(grouped).map(monthKey => {
      const monthRapports = grouped[monthKey];
      const totalMonth = monthRapports.reduce((acc, r) => {
        acc.hommes += r.hommes;
        acc.femmes += r.femmes;
        acc.jeunes += r.jeunes;
        acc.enfants += r.enfants;
        acc.connectes += r.connectes;
        acc.nouveauxVenus += r.nouveauxVenus;
        acc.nouveauxConvertis += r.nouveauxConvertis;
        acc.moissonneurs += r.moissonneurs;
        return acc;
      }, { hommes:0,femmes:0,jeunes:0,enfants:0,connectes:0,nouveauxVenus:0,nouveauxConvertis:0,moissonneurs:0 });
      
      return { monthKey, monthLabel: monthKey, monthRapports, totalMonth };
    });

    setStatsByMonth(monthsStats);
    setLoading(false);
  };

  const toggleMonth = (monthKey) => {
    setCollapsedMonths(prev => ({ ...prev, [monthKey]: !prev[monthKey] }));
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-[#333699]">
      <HeaderPages />
      <h1 className="text-3xl font-bold text-white mt-4">Statistiques Globales</h1>

      {/* FILTRES */}
      <div className="bg-white/10 p-6 rounded-2xl shadow-lg mt-6 flex gap-4 flex-wrap text-white">
        <input type="date" value={dateDebut} onChange={e => setDateDebut(e.target.value)} className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white"/>
        <input type="date" value={dateFin} onChange={e => setDateFin(e.target.value)} className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white"/>
        <button onClick={fetchStats} className="bg-[#2a2f85] px-6 py-2 rounded-xl hover:bg-[#1f2366]">Générer</button>
      </div>

      {/* TABLEAU COLLAPSE */}
      {!loading && statsByMonth.length > 0 && (
        <div className="w-full max-w-full overflow-x-auto mt-6 scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-transparent">
          <div className="w-max space-y-1">
            {statsByMonth.map(({ monthKey, monthLabel, monthRapports, totalMonth }) => {
              const isExpanded = collapsedMonths[monthKey] ?? true;
              const borderColor = "border-l-blue-500";
              return (
                <div key={monthKey} className="space-y-1">

                  <div
                    className={`flex items-center px-4 py-2 rounded-lg bg-white/20 cursor-pointer border-l-4 ${borderColor}`}
                    onClick={() => toggleMonth(monthKey)}
                  >
                    <div className="min-w-[200px] text-white font-semibold">
                      {isExpanded ? "➖ " : "➕ "} {monthLabel}
                    </div>
                    <div className="min-w-[200px]"></div>
                    <div className="min-w-[200px]"></div>
                    <div className="min-w-[120px] text-center text-white font-bold">{totalMonth.hommes}</div>
                    <div className="min-w-[120px] text-center text-white font-bold">{totalMonth.femmes}</div>
                    <div className="min-w-[120px] text-center text-orange-400 font-semibold">
                      {totalMonth.hommes + totalMonth.femmes}
                    </div>
                    <div className="min-w-[150px]"></div>
                  </div>

                  {(isExpanded || monthRapports.length === 1) &&
                    monthRapports.map(r => {
                      const total = r.hommes + r.femmes;
                      return (
                        <div
                          key={r.id}
                          className={`flex items-center px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 transition border-l-4 ${borderColor}`}
                        >
                          <div className="min-w-[200px] text-white">{r.type}</div>
                          <div className="min-w-[200px] text-white"></div>
                          <div className="min-w-[200px] text-center text-white"></div>
                          <div className="min-w-[120px] text-center text-white">{r.hommes}</div>
                          <div className="min-w-[120px] text-center text-white">{r.femmes}</div>
                          <div className="min-w-[120px] text-center text-white font-bold">{total}</div>
                          <div className="min-w-[150px]"></div>
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
