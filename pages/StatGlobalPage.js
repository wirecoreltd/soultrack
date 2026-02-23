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
  const [serviteurStats, setServiteurStats] = useState(null);
  const [egliseId, setEgliseId] = useState(null);
  const [brancheId, setBrancheId] = useState(null);
  const [attendanceStats, setAttendanceStats] = useState(null);
  const [evanStats, setEvanStats] = useState(null);
  const [baptemeStats, setBaptemeStats] = useState(null);
  const [formationStats, setFormationStats] = useState(null);
  const [cellulesCount, setCellulesCount] = useState(0);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

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

    // ================= ATTENDANCE =================
    let attendanceQuery = supabase
      .from("attendance")
      .select("*")
      .eq("eglise_id", egliseId)
      .eq("branche_id", brancheId);

    if (dateDebut) attendanceQuery = attendanceQuery.gte("date", dateDebut);
    if (dateFin) attendanceQuery = attendanceQuery.lte("date", dateFin);

    const { data: attendanceData } = await attendanceQuery;

    const attendanceTotals = {
      hommes: 0,
      femmes: 0,
      jeunes: 0,
      enfants: 0,
      connectes: 0,
      nouveauxVenus: 0,
      nouveauxConvertis: 0,
      moissonneurs: 0,
    };

    attendanceData?.forEach((r) => {
      attendanceTotals.hommes += Number(r.hommes) || 0;
      attendanceTotals.femmes += Number(r.femmes) || 0;
      attendanceTotals.jeunes += Number(r.jeunes) || 0;
      attendanceTotals.enfants += Number(r.enfants) || 0;
      attendanceTotals.connectes += Number(r.connectes) || 0;
      attendanceTotals.nouveauxVenus += Number(r.nouveauxVenus) || 0;
      attendanceTotals.nouveauxConvertis += Number(r.nouveauxConvertis) || 0;
      attendanceTotals.moissonneurs += Number(r.moissonneurs) || 0;
    });

    setAttendanceStats(attendanceTotals);

    // ================= EVANGELISATION =================
    let evanQuery = supabase
      .from("evangelises")
      .select("*")
      .eq("eglise_id", egliseId)
      .eq("branche_id", brancheId);

    if (dateDebut) evanQuery = evanQuery.gte("created_at", dateDebut);
    if (dateFin) evanQuery = evanQuery.lte("created_at", dateFin);

    const { data: evanData } = await evanQuery;

    const evanTotals = {
      hommes: 0,
      femmes: 0,
      jeunes: 0,
      enfants: 0,
      connectes: 0,
      nouveauxVenus: 0,
      nouveauxConvertis: 0,
      moissonneurs: 0,
    };

    evanData?.forEach((r) => {
      if (r.sexe === "Homme") evanTotals.hommes++;
      if (r.sexe === "Femme") evanTotals.femmes++;
      if (r.type_conversion === "Nouveau converti") evanTotals.nouveauxConvertis++;
    });

    setEvanStats(evanTotals);

    // ================= BAPTEME =================
    let baptemeQuery = supabase
      .from("baptemes")
      .select("hommes, femmes")
      .eq("eglise_id", egliseId)
      .eq("branche_id", brancheId);

    if (dateDebut) baptemeQuery = baptemeQuery.gte("date", dateDebut);
    if (dateFin) baptemeQuery = baptemeQuery.lte("date", dateFin);

    const { data: baptemeData } = await baptemeQuery;

    const baptemeTotals = {
      hommes: baptemeData?.reduce((s, r) => s + Number(r.hommes), 0) || 0,
      femmes: baptemeData?.reduce((s, r) => s + Number(r.femmes), 0) || 0,
    };

    setBaptemeStats(baptemeTotals);

    // ================= FORMATION =================
    let formationQuery = supabase
      .from("formations")
      .select("hommes, femmes")
      .eq("eglise_id", egliseId)
      .eq("branche_id", brancheId);

    if (dateDebut) formationQuery = formationQuery.gte("date_debut", dateDebut);
    if (dateFin) formationQuery = formationQuery.lte("date_fin", dateFin);

    const { data: formationData } = await formationQuery;

    const formationTotals = {
      hommes: formationData?.reduce((s, r) => s + Number(r.hommes), 0) || 0,
      femmes: formationData?.reduce((s, r) => s + Number(r.femmes), 0) || 0,
    };

    setFormationStats(formationTotals);

    const { count } = await supabase
      .from("cellules")
      .select("id", { count: "exact", head: true })
      .eq("eglise_id", egliseId)
      .eq("branche_id", brancheId);

    setCellulesCount(count || 0);

    // ================= SERVITEURS =================
      let serviteurQuery = supabase
        .from("membres_complets")
        .select("id, sexe")
        .eq("eglise_id", egliseId)
        .eq("branche_id", brancheId)
        .eq("star", true)
        .in("etat_contact", ["Existant", "Nouveau"]);
      
      if (dateDebut) serviteurQuery = serviteurQuery.gte("created_at", dateDebut);
      if (dateFin) serviteurQuery = serviteurQuery.lte("created_at", dateFin);
      
      const { data: serviteurData } = await serviteurQuery;
      
      const serviteurTotals = {
        hommes: serviteurData?.filter(r => r.sexe === "Homme").length || 0,
        femmes: serviteurData?.filter(r => r.sexe === "Femme").length || 0,
      };      
      setServiteurStats(serviteurTotals);

    setLoading(false);
  };

  const rapports = [
    { label: "Culte", data: attendanceStats, border: "border-l-orange-500" },
    { label: "Evangelisation", data: evanStats, border: "border-l-green-500" },
    { label: "Baptême", data: baptemeStats, border: "border-l-purple-500" },
    { label: "Formation", data: formationStats, border: "border-l-blue-500" },
    { label: "Cellules", data: { total: cellulesCount }, border: "border-l-yellow-500" },
    { label: "Serviteur", data: serviteurStats, border: "border-l-pink-500" },     
  ].filter((r) => typeRapport === "Tous" || r.label === typeRapport);

  const totalGeneral = rapports.reduce(
  (acc, r) => {
    acc.hommes += Number(r.data?.hommes) || 0;
    acc.femmes += Number(r.data?.femmes) || 0;
    acc.jeunes += Number(r.data?.jeunes) || 0;
    acc.enfants += Number(r.data?.enfants) || 0;
    acc.connectes += Number(r.data?.connectes) || 0;
    acc.nouveauxVenus += Number(r.data?.nouveauxVenus) || 0;
    acc.nouveauxConvertis += Number(r.data?.nouveauxConvertis) || 0;
    acc.reconciliations += Number(r.data?.reconciliations) || 0;
    acc.moissonneurs += Number(r.data?.moissonneurs) || 0;
    return acc;
  },
  {
    hommes: 0,
    femmes: 0,
    jeunes: 0,
    enfants: 0,
    connectes: 0,
    nouveauxVenus: 0,
    nouveauxConvertis: 0,
    reconciliations: 0,
    moissonneurs: 0,
  }
);

const totalPrincipal =
  totalGeneral.hommes + totalGeneral.femmes;


  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-[#333699]">
      <HeaderPages />
      <h1 className="text-3xl font-bold text-white mt-4">
        Statistiques Globales
      </h1>

      {/* FILTRES */}
      <div className="bg-white/10 p-6 rounded-2xl shadow-lg mt-6 flex gap-4 flex-wrap text-white">
        <input
          type="date"
          value={dateDebut}
          onChange={(e) => setDateDebut(e.target.value)}
          className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white"
        />
        <input
          type="date"
          value={dateFin}
          onChange={(e) => setDateFin(e.target.value)}
          className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white"
        />
        <select
          value={typeRapport}
          onChange={(e) => setTypeRapport(e.target.value)}
          className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white"
        >
          <option className="text-black" value="Tous">Tous</option>
          <option className="text-black" value="Culte">Culte</option>
          <option className="text-black" value="Evangelisation">Evangelisation</option>
          <option className="text-black" value="Baptême">Baptême</option>
          <option className="text-black" value="Formation">Formation</option>
          <option className="text-black" value="Serviteur">Serviteur</option>            
          <option className="text-black" value="Cellules">Cellules</option>
        </select>

        <button
          onClick={fetchStats}
          className="bg-[#2a2f85] px-6 py-2 rounded-xl hover:bg-[#1f2366]"
        >
          Générer
        </button>
      </div>

      {/* TABLE */}
      {!loading && attendanceStats && (
        <div className="w-full max-w-full overflow-x-auto mt-6 scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-transparent">
          <div className="w-max space-y-2"> {/* plus large pour total */}
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

            {/* LIGNES */}
            {rapports.map((r, idx) => {
              const total =
                (Number(r.data?.hommes) || 0) + (Number(r.data?.femmes) || 0);
              return (
                <div
                  key={idx}
                  className={`flex items-center px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 transition border-l-4 ${r.border}`}
                >
                  <div className="min-w-[180px] text-white font-semibold">{r.label}</div>
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
              );
            })}
  {/* 🔹 TOTAL GENERAL BAS */}
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
