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

  const [collapseMonths, setCollapseMonths] = useState({}); // suivi collapse par mois

  // 🔹 Récupération profil
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

  // 🔹 Fetch Stats
  const fetchStats = async () => {
    if (!egliseId || !brancheId) return;

    setLoading(true);

    // ----- ATTENDANCE -----
    let attendanceQuery = supabase
      .from("attendance")
      .select("*")
      .eq("eglise_id", egliseId)
      .eq("branche_id", brancheId);

    if (dateDebut) attendanceQuery = attendanceQuery.gte("date", dateDebut);
    if (dateFin) attendanceQuery = attendanceQuery.lte("date", dateFin);

    const { data: attendanceData } = await attendanceQuery;
    setAttendanceStats(attendanceData || []);

    // ----- EVANGELISATION -----
    let evanQuery = supabase
      .from("evangelises")
      .select("*")
      .eq("eglise_id", egliseId)
      .eq("branche_id", brancheId);

    if (dateDebut) evanQuery = evanQuery.gte("created_at", dateDebut);
    if (dateFin) evanQuery = evanQuery.lte("created_at", dateFin);

    const { data: evanData } = await evanQuery;
    setEvanStats(evanData || []);

    // ----- BAPTEME -----
    let baptemeQuery = supabase
      .from("baptemes")
      .select("*")
      .eq("eglise_id", egliseId)
      .eq("branche_id", brancheId);

    if (dateDebut) baptemeQuery = baptemeQuery.gte("date", dateDebut);
    if (dateFin) baptemeQuery = baptemeQuery.lte("date", dateFin);

    const { data: baptemeData } = await baptemeQuery;
    setBaptemeStats(baptemeData || []);

    // ----- FORMATION -----
    let formationQuery = supabase
      .from("formations")
      .select("*")
      .eq("eglise_id", egliseId)
      .eq("branche_id", brancheId);

    if (dateDebut) formationQuery = formationQuery.gte("date_debut", dateDebut);
    if (dateFin) formationQuery = formationQuery.lte("date_fin", dateFin);

    const { data: formationData } = await formationQuery;
    setFormationStats(formationData || []);

    // ----- CELLULES -----
    const { count } = await supabase
      .from("cellules")
      .select("id", { count: "exact", head: true })
      .eq("eglise_id", egliseId)
      .eq("branche_id", brancheId);

    setCellulesCount(count || 0);

    setLoading(false);
  };

  // 🔹 Regrouper par mois
  const groupDataByMonth = (data, dateField="date") => {
    const map = {};
    data.forEach((r) => {
      const d = new Date(r[dateField] || r.created_at || r.date_debut);
      if (isNaN(d)) return;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (!map[key]) map[key] = [];
      map[key].push(r);
    });
    return map;
  };

  const attendanceByMonth = groupDataByMonth(attendanceStats, "date");
  const evanByMonth = groupDataByMonth(evanStats, "created_at");
  const baptemeByMonth = groupDataByMonth(baptemeStats, "date");
  const formationByMonth = groupDataByMonth(formationStats, "date_debut");

  const allMonthsKeys = Array.from(
    new Set([
      ...Object.keys(attendanceByMonth),
      ...Object.keys(evanByMonth),
      ...Object.keys(baptemeByMonth),
      ...Object.keys(formationByMonth),
    ])
  ).sort();

  const rapportsGroupedByMonth = allMonthsKeys.map((key) => {
    return {
      monthKey: key,
      rapports: [
        ...(attendanceByMonth[key] || []).map(r => ({ label:"Culte", data:r, border:"border-l-orange-500"})),
        ...(evanByMonth[key] || []).map(r => ({ label:"Evangelisation", data:r, border:"border-l-green-500"})),
        ...(baptemeByMonth[key] || []).map(r => ({ label:"Baptême", data:r, border:"border-l-purple-500"})),
        ...(formationByMonth[key] || []).map(r => ({ label:"Formation", data:r, border:"border-l-blue-500"})),
      ]
    };
  });

  // 🔹 Calcul total général
  const totalGeneral = {
    hommes: 0,
    femmes: 0,
    jeunes: 0,
    enfants: 0,
    connectes: 0,
    nouveauxVenus: 0,
    nouveauxConvertis: 0,
    reconciliations: 0,
    moissonneurs: 0,
  };

  rapportsGroupedByMonth.forEach(month => {
    month.rapports.forEach(r => {
      totalGeneral.hommes += Number(r.data?.hommes || 0);
      totalGeneral.femmes += Number(r.data?.femmes || 0);
      totalGeneral.jeunes += Number(r.data?.jeunes || 0);
      totalGeneral.enfants += Number(r.data?.enfants || 0);
      totalGeneral.connectes += Number(r.data?.connectes || 0);
      totalGeneral.nouveauxVenus += Number(r.data?.nouveauxVenus || 0);
      totalGeneral.nouveauxConvertis += Number(r.data?.nouveauxConvertis || 0);
      totalGeneral.reconciliations += Number(r.data?.reconciliations || 0);
      totalGeneral.moissonneurs += Number(r.data?.moissonneurs || 0);
    });
  });

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-[#333699]">
      <HeaderPages />
      <h1 className="text-3xl font-bold text-white mt-4">Statistiques Globales</h1>

      {/* FILTRES */}
      <div className="bg-white/10 p-6 rounded-2xl shadow-lg mt-6 flex gap-4 flex-wrap text-white">
        <input type="date" value={dateDebut} onChange={(e) => setDateDebut(e.target.value)} className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white" />
        <input type="date" value={dateFin} onChange={(e) => setDateFin(e.target.value)} className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white" />
        <select value={typeRapport} onChange={(e) => setTypeRapport(e.target.value)} className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white">
          <option className="text-black" value="Tous">Tous</option>
          <option className="text-black" value="Culte">Culte</option>
          <option className="text-black" value="Evangelisation">Evangelisation</option>
          <option className="text-black" value="Baptême">Baptême</option>
          <option className="text-black" value="Formation">Formation</option>
          <option className="text-black" value="Cellules">Cellules</option>
        </select>
        <button onClick={fetchStats} className="bg-[#2a2f85] px-6 py-2 rounded-xl hover:bg-[#1f2366]">Générer</button>
      </div>

      {/* RAPPORTS */}
      {!loading && rapportsGroupedByMonth.length > 0 && (
        <div className="w-full max-w-full overflow-x-auto mt-6 scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-transparent">
          {rapportsGroupedByMonth.map((month) => {
            // Totaux du mois
            const monthTotal = month.rapports.reduce((acc, r) => {
              acc.hommes += Number(r.data?.hommes || 0);
              acc.femmes += Number(r.data?.femmes || 0);
              acc.jeunes += Number(r.data?.jeunes || 0);
              acc.enfants += Number(r.data?.enfants || 0);
              acc.connectes += Number(r.data?.connectes || 0);
              acc.nouveauxVenus += Number(r.data?.nouveauxVenus || 0);
              acc.nouveauxConvertis += Number(r.data?.nouveauxConvertis || 0);
              acc.reconciliations += Number(r.data?.reconciliations || 0);
              acc.moissonneurs += Number(r.data?.moissonneurs || 0);
              return acc;
            }, {
              hommes:0, femmes:0, jeunes:0, enfants:0, connectes:0, nouveauxVenus:0, nouveauxConvertis:0, reconciliations:0, moissonneurs:0
            });

            const isOpen = collapseMonths[month.monthKey] ?? false;

            return (
              <div key={month.monthKey} className="mb-4">
                {/* Header collapse */}
                <div 
                  className="cursor-pointer flex justify-between items-center px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold"
                  onClick={() => setCollapseMonths({...collapseMonths, [month.monthKey]: !isOpen})}
                >
                  <span>{month.monthKey}</span>
                  <span className="text-orange-400 font-bold">{monthTotal.hommes + monthTotal.femmes}</span>
                </div>

                {/* Contenu du mois */}
                {isOpen && (
                  <div className="mt-2 space-y-2">
                    {month.rapports.map((r, idx) => {
                      if (typeRapport !== "Tous" && r.label !== typeRapport) return null;
                      return (
                        <div key={idx} className={`flex items-center px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition border-l-4 ${r.border}`}>
                          <div className="min-w-[180px] text-white font-semibold">{r.label}</div>
                          <div className="min-w-[120px] text-center text-white">{r.data?.hommes ?? 0}</div>
                          <div className="min-w-[120px] text-center text-white">{r.data?.femmes ?? 0}</div>
                          <div className="min-w-[120px] text-center text-white">{r.data?.jeunes ?? 0}</div>
                          <div className="min-w-[120px] text-center text-white">{r.data?.enfants ?? 0}</div>
                          <div className="min-w-[140px] text-center text-white">{r.data?.connectes ?? 0}</div>
                          <div className="min-w-[150px] text-center text-white">{r.data?.nouveauxVenus ?? 0}</div>
                          <div className="min-w-[180px] text-center text-white">{r.data?.nouveauxConvertis ?? 0}</div>
                          <div className="min-w-[140px] text-center text-white">{r.data?.reconciliations ?? 0}</div>
                          <div className="min-w-[160px] text-center text-white">{r.data?.moissonneurs ?? 0}</div>
                        </div>
                      );
                    })}

                    {/* Total du mois */}
                    <div className="flex items-center px-4 py-2 mt-2 rounded-lg bg-white/20 border-t border-white/40 font-bold">
                      <div className="min-w-[180px] text-orange-400 font-semibold">TOTAL MOIS</div>
                      <div className="min-w-[120px] text-center text-orange-400 font-semibold">{monthTotal.hommes}</div>
                      <div className="min-w-[120px] text-center text-orange-400 font-semibold">{monthTotal.femmes}</div>
                      <div className="min-w-[120px] text-center text-orange-400 font-semibold">{monthTotal.jeunes}</div>
                      <div className="min-w-[120px] text-center text-orange-400 font-semibold">{monthTotal.enfants}</div>
                      <div className="min-w-[140px] text-center text-orange-400 font-semibold">{monthTotal.connectes}</div>
                      <div className="min-w-[150px] text-center text-orange-400 font-semibold">{monthTotal.nouveauxVenus}</div>
                      <div className="min-w-[180px] text-center text-orange-400 font-semibold">{monthTotal.nouveauxConvertis}</div>
                      <div className="min-w-[140px] text-center text-orange-400 font-semibold">{monthTotal.reconciliations}</div>
                      <div className="min-w-[160px] text-center text-orange-400 font-semibold">{monthTotal.moissonneurs}</div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* TOTAL GENERAL BAS */}
          <div className="flex items-center px-4 py-4 mt-3 rounded-xl bg-white/20 border-t border-white/40 font-bold">
            <div className="min-w-[180px] text-orange-400 font-semibold uppercase">TOTAL GENERAL</div>
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
      )}

      <Footer />
    </div>
  );
}
