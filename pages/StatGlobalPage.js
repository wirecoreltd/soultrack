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
  const [typeRapport, setTypeRapport] = useState("Tous");

  const [egliseId, setEgliseId] = useState(null);
  const [brancheId, setBrancheId] = useState(null);

  const [attendanceStats, setAttendanceStats] = useState([]);
  const [evanStats, setEvanStats] = useState([]);
  const [baptemeStats, setBaptemeStats] = useState([]);
  const [formationStats, setFormationStats] = useState([]);
  const [cellulesCount, setCellulesCount] = useState(0);

  const [loading, setLoading] = useState(false);
  const [expandedMonths, setExpandedMonths] = useState({});

  // 🔹 UTIL: nom du mois en français
  const getMonthNameFR = (m) => [
    "Janvier","Février","Mars","Avril","Mai","Juin",
    "Juillet","Août","Septembre","Octobre","Novembre","Décembre"
  ][m] || "";

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

  const toggleMonth = (monthKey) => {
    setExpandedMonths(prev => ({ ...prev, [monthKey]: !prev[monthKey] }));
  };

  const fetchStats = async () => {
    if (!egliseId || !brancheId) return;

    setLoading(true);

    // ---------------- ATTENDANCE ----------------
    let attendanceQuery = supabase.from("attendance").select("*")
      .eq("eglise_id", egliseId).eq("branche_id", brancheId);
    if (dateDebut) attendanceQuery = attendanceQuery.gte("date", dateDebut);
    if (dateFin) attendanceQuery = attendanceQuery.lte("date", dateFin);
    const { data: attendanceData } = await attendanceQuery;
    setAttendanceStats(attendanceData || []);

    // ---------------- EVANGELISATION ----------------
    let evanQuery = supabase.from("evangelises").select("*")
      .eq("eglise_id", egliseId).eq("branche_id", brancheId);
    if (dateDebut) evanQuery = evanQuery.gte("created_at", dateDebut);
    if (dateFin) evanQuery = evanQuery.lte("created_at", dateFin);
    const { data: evanData } = await evanQuery;
    setEvanStats(evanData || []);

    // ---------------- BAPTEME ----------------
    let baptemeQuery = supabase.from("baptemes").select("*")
      .eq("eglise_id", egliseId).eq("branche_id", brancheId);
    if (dateDebut) baptemeQuery = baptemeQuery.gte("date", dateDebut);
    if (dateFin) baptemeQuery = baptemeQuery.lte("date", dateFin);
    const { data: baptemeData } = await baptemeQuery;
    setBaptemeStats(baptemeData || []);

    // ---------------- FORMATION ----------------
    let formationQuery = supabase.from("formations").select("*")
      .eq("eglise_id", egliseId).eq("branche_id", brancheId);
    if (dateDebut) formationQuery = formationQuery.gte("date_debut", dateDebut);
    if (dateFin) formationQuery = formationQuery.lte("date_fin", dateFin);
    const { data: formationData } = await formationQuery;
    setFormationStats(formationData || []);

    // ---------------- CELLULES ----------------
    const { count } = await supabase.from("cellules").select("id", { count: "exact", head: true })
      .eq("eglise_id", egliseId).eq("branche_id", brancheId);
    setCellulesCount(count || 0);

    setLoading(false);
  };

  // 🔹 Grouper par mois
  const groupByMonth = (data) => {
    const map = {};
    data.forEach(r => {
      const d = new Date(r.date || r.created_at || r.date_debut);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (!map[key]) map[key] = [];
      map[key].push(r);
    });
    return map;
  };

  // 🔹 Combiner tous les rapports
  const combinedRapports = [
    ...attendanceStats.map(r => ({ label: "Culte", data: r, border: "border-l-orange-500" })),
    ...evanStats.map(r => ({ label: "Evangelisation", data: r, border: "border-l-green-500" })),
    ...baptemeStats.map(r => ({ label: "Baptême", data: r, border: "border-l-purple-500" })),
    ...formationStats.map(r => ({ label: "Formation", data: r, border: "border-l-blue-500" })),
  ];

  const filteredRapports = typeRapport === "Tous" 
    ? combinedRapports
    : combinedRapports.filter(r => r.label === typeRapport);

  const groupedRapports = groupByMonth(filteredRapports);

  // 🔹 Totaux généraux
  const totalGeneral = filteredRapports.reduce((acc, r) => {
    const d = r.data;
    acc.hommes += Number(d?.hommes || 0);
    acc.femmes += Number(d?.femmes || 0);
    acc.jeunes += Number(d?.jeunes || 0);
    acc.enfants += Number(d?.enfants || 0);
    acc.connectes += Number(d?.connectes || 0);
    acc.nouveauxVenus += Number(d?.nouveauxVenus || 0);
    acc.nouveauxConvertis += Number(d?.nouveauxConvertis || 0);
    acc.reconciliations += Number(d?.reconciliations || 0);
    acc.moissonneurs += Number(d?.moissonneurs || 0);
    return acc;
  }, {hommes:0,femmes:0,jeunes:0,enfants:0,connectes:0,nouveauxVenus:0,nouveauxConvertis:0,reconciliations:0,moissonneurs:0});

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-[#333699]">
      <HeaderPages />
      <h1 className="text-3xl font-bold text-white mt-4 mb-4">Statistiques Globales</h1>

      {/* FILTRES */}
      <div className="bg-white/10 p-6 rounded-2xl shadow-lg mt-2 flex gap-4 flex-wrap text-white">
        <input type="date" value={dateDebut} onChange={(e)=>setDateDebut(e.target.value)}
          className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white"/>
        <input type="date" value={dateFin} onChange={(e)=>setDateFin(e.target.value)}
          className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white"/>
        <select value={typeRapport} onChange={(e)=>setTypeRapport(e.target.value)}
          className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white">
          <option className="text-black" value="Tous">Tous</option>
          <option className="text-black" value="Culte">Culte</option>
          <option className="text-black" value="Evangelisation">Evangelisation</option>
          <option className="text-black" value="Baptême">Baptême</option>
          <option className="text-black" value="Formation">Formation</option>
        </select>
        <button onClick={fetchStats} className="bg-[#2a2f85] px-6 py-2 rounded-xl hover:bg-[#1f2366]">
          Générer
        </button>
      </div>

      {/* TABLEAU */}
      {!loading && (
        <div className="w-full max-w-full overflow-x-auto mt-6">
          <div className="w-max space-y-2">

            {/* HEADER */}
            <div className="flex font-semibold uppercase text-white px-4 py-3 border-b border-white/30 bg-white/5 rounded-t-xl whitespace-nowrap">
              <div className="min-w-[180px] ml-1">Type</div>
              <div className="min-w-[120px] text-center">Hommes</div>
              <div className="min-w-[120px] text-center">Femmes</div>
              <div className="min-w-[120px] text-center">Jeunes</div>
              <div className="min-w-[120px] text-center">Enfants</div>
              <div className="min-w-[140px] text-center">Connectés</div>
              <div className="min-w-[150px] text-center">Nouveaux Venus</div>
              <div className="min-w-[180px] text-center">Nouveau Converti</div>
              <div className="min-w-[140px] text-center">Réconciliation</div>
              <div className="min-w-[160px] text-center">Moissonneurs</div>
            </div>

            {/* LIGNES PAR MOIS */}
            {Object.entries(groupedRapports).map(([monthKey, monthData]) => {
              const [year, monthIndex] = monthKey.split("-").map(Number);
              const monthLabel = `${getMonthNameFR(monthIndex)} ${year}`;
              const isExpanded = expandedMonths[monthKey] || false;

              const totalMonth = monthData.reduce((acc,r)=>{
                const d = r.data;
                acc.hommes += Number(d?.hommes || 0);
                acc.femmes += Number(d?.femmes || 0);
                acc.jeunes += Number(d?.jeunes || 0);
                acc.enfants += Number(d?.enfants || 0);
                acc.connectes += Number(d?.connectes || 0);
                acc.nouveauxVenus += Number(d?.nouveauxVenus || 0);
                acc.nouveauxConvertis += Number(d?.nouveauxConvertis || 0);
                acc.reconciliations += Number(d?.reconciliations || 0);
                acc.moissonneurs += Number(d?.moissonneurs || 0);
                return acc;
              }, {hommes:0,femmes:0,jeunes:0,enfants:0,connectes:0,nouveauxVenus:0,nouveauxConvertis:0,reconciliations:0,moissonneurs:0});

              return (
                <div key={monthKey} className="space-y-1">
                  {/* HEADER MOIS */}
                  <div className="flex items-center px-4 py-2 rounded-lg bg-white/20 cursor-pointer"
                       onClick={()=>toggleMonth(monthKey)}>
                    <div className="min-w-[180px] text-white font-semibold">{isExpanded ? "➖" : "➕"} {monthLabel}</div>
                    <div className="min-w-[120px] text-center text-white font-bold">{totalMonth.hommes}</div>
                    <div className="min-w-[120px] text-center text-white font-bold">{totalMonth.femmes}</div>
                    <div className="min-w-[120px] text-center text-white font-bold">{totalMonth.jeunes}</div>
                    <div className="min-w-[120px] text-center text-white font-bold">{totalMonth.enfants}</div>
                    <div className="min-w-[140px] text-center text-white font-bold">{totalMonth.connectes}</div>
                    <div className="min-w-[150px] text-center text-white font-bold">{totalMonth.nouveauxVenus}</div>
                    <div className="min-w-[180px] text-center text-white font-bold">{totalMonth.nouveauxConvertis}</div>
                    <div className="min-w-[140px] text-center text-white font-bold">{totalMonth.reconciliations}</div>
                    <div className="min-w-[160px] text-center text-white font-bold">{totalMonth.moissonneurs}</div>
                  </div>

                  {/* LIGNES DETAIL */}
                  {isExpanded && monthData.map((r,i)=>(
                    <div key={i} className="flex items-center px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition">
                      <div className="min-w-[180px] text-white">{r.label || r.type || "-"}</div>
                      <div className="min-w-[120px] text-center text-white">{r.data?.hommes ?? "-"}</div>
                      <div className="min-w-[120px] text-center text-white">{r.data?.femmes ?? "-"}</div>
                      <div className="min-w-[120px] text-center text-white">{r.data?.jeunes ?? "-"}</div>
                      <div className="min-w-[120px] text-center text-white">{r.data?.enfants ?? "-"}</div>
                      <div className="min-w-[140px] text-center text-white">{r.data?.connectes ?? "-"}</div>
                      <div className="min-w-[150px] text-center text-white">{r.data?.nouveauxVenus ?? "-"}</div>
                      <div className="min-w-[180px] text-center text-white">{r.data?.nouveauxConvertis ?? "-"}</div>
                      <div className="min-w-[140px] text-center text-white">{r.data?.reconciliations ?? "-"}</div>
                      <div className="min-w-[160px] text-center text-white">{r.data?.moissonneurs ?? "-"}</div>
                    </div>
                  ))}
                </div>
              );
            })}

            {/* TOTAL GENERAL BAS */}
            <div className="flex items-center px-4 py-4 mt-3 rounded-xl bg-white/20 border-t border-white/40 font-bold">
              <div className="min-w-[180px] text-orange-400 font-semibold uppercase ml-1">TOTAL</div>
              <div className="min-w-[120px] text-center text-orange-400 font-semibold">{totalGeneral.hommes}</div>
              <div className="min-w-[120px] text-center text-orange-400 font-semibold">{totalGeneral.femmes}</div>
              <div className="min-w-[120px] text-center text-orange-400 font-semibold">{totalGeneral.jeunes}</div>
              <div className="min-w-[120px] text-center text-orange-400 font-semibold">{totalGeneral.enfants}</div>
              <div className="min-w-[140px] text-center text-orange-400 font-semibold">{totalGeneral.connectes}</div>
              <div className="min-w-[150px] text-center text-orange-400 font-semibold">{totalGeneral.nouveauxVenus}</div>
              <div className="min-w-[180px] text-center text-orange-400 font-semibold">{totalGeneral.nouveauxConvertis}</div>
              <div className="min-w-[140px] text-center text-orange-400 font-semibold">{totalGeneral.reconciliations}</div>
              <div className="min-w-[160px] text-center text-orange-400 font-semibold">{totalGeneral.moissonneurs}</div>
            </div>

          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
