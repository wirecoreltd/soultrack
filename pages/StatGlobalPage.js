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

  const [userBrancheId, setUserBrancheId] = useState(null);
  const [branchIds, setBranchIds] = useState([]);
  const [loading, setLoading] = useState(false);

  const [attendanceStats, setAttendanceStats] = useState(null);
  const [evanStats, setEvanStats] = useState(null);
  const [baptemeStats, setBaptemeStats] = useState(null);
  const [formationStats, setFormationStats] = useState(null);
  const [cellulesCount, setCellulesCount] = useState(0);
  const [serviteurStats, setServiteurStats] = useState(null);

  // 🔹 Récupérer la branche de l'utilisateur
  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("branche_id")
        .eq("id", user.id)
        .single();

      if (data?.branche_id) setUserBrancheId(data.branche_id);
    };
    fetchProfile();
  }, []);

  // 🔹 Récupérer toutes les branches supervisées
  useEffect(() => {
    const fetchBranches = async () => {
      if (!userBrancheId) return;

      const { data, error } = await supabase.rpc("get_all_supervised_branches", { start_branche: userBrancheId });
      if (error) {
        console.error("Erreur récupération branches :", error);
        setBranchIds([userBrancheId]);
      } else {
        const ids = data?.map((b) => b.branche_id) || [];
        setBranchIds([userBrancheId, ...ids]);
      }
    };
    fetchBranches();
  }, [userBrancheId]);

  const fetchStats = async () => {
    if (!branchIds.length) return;
    setLoading(true);

    // -------- ATTENDANCE --------
    let attendanceQuery = supabase.from("attendance").select("*").in("branche_id", branchIds);
    if (dateDebut) attendanceQuery = attendanceQuery.gte("date", dateDebut);
    if (dateFin) attendanceQuery = attendanceQuery.lte("date", dateFin);
    const { data: attendanceData } = await attendanceQuery;

    const attendanceTotals = { hommes: 0, femmes: 0, jeunes: 0, enfants: 0, connectes: 0, nouveauxVenus: 0, nouveauxConvertis: 0, moissonneurs: 0 };
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

    // -------- EVANGELISATION --------
    let evanQuery = supabase.from("evangelises").select("*").in("branche_id", branchIds);
    if (dateDebut) evanQuery = evanQuery.gte("created_at", dateDebut);
    if (dateFin) evanQuery = evanQuery.lte("created_at", dateFin);
    const { data: evanData } = await evanQuery;

    const evanTotals = { hommes: 0, femmes: 0, nouveauxConvertis: 0 };
    evanData?.forEach((r) => {
      if (r.sexe === "Homme") evanTotals.hommes++;
      if (r.sexe === "Femme") evanTotals.femmes++;
      if (r.type_conversion === "Nouveau converti") evanTotals.nouveauxConvertis++;
    });
    setEvanStats(evanTotals);

    // -------- BAPTEME --------
    let baptemeQuery = supabase.from("baptemes").select("hommes,femmes").in("branche_id", branchIds);
    if (dateDebut) baptemeQuery = baptemeQuery.gte("date", dateDebut);
    if (dateFin) baptemeQuery = baptemeQuery.lte("date", dateFin);
    const { data: baptemeData } = await baptemeQuery;
    setBaptemeStats({
      hommes: baptemeData?.reduce((s, r) => s + Number(r.hommes), 0) || 0,
      femmes: baptemeData?.reduce((s, r) => s + Number(r.femmes), 0) || 0,
    });

    // -------- FORMATION --------
    let formationQuery = supabase.from("formations").select("hommes,femmes").in("branche_id", branchIds);
    if (dateDebut) formationQuery = formationQuery.gte("date_debut", dateDebut);
    if (dateFin) formationQuery = formationQuery.lte("date_fin", dateFin);
    const { data: formationData } = await formationQuery;
    setFormationStats({
      hommes: formationData?.reduce((s, r) => s + Number(r.hommes), 0) || 0,
      femmes: formationData?.reduce((s, r) => s + Number(r.femmes), 0) || 0,
    });

    // -------- CELLULES --------
    const { count } = await supabase.from("cellules").select("id", { count: "exact", head: true }).in("branche_id", branchIds);
    setCellulesCount(count || 0);

    // -------- SERVITEURS --------
    let servQuery = supabase.from("stats_ministere_besoin").select("membre_id,valeur").in("branche_id", branchIds).eq("type", "ministere");
    if (dateDebut) servQuery = servQuery.gte("date_action", dateDebut);
    if (dateFin) servQuery = servQuery.lte("date_action", dateFin);
    const { data: servData } = await servQuery;

    const uniqueMembres = new Map();
    servData?.forEach((s) => { if (!uniqueMembres.has(s.membre_id)) uniqueMembres.set(s.membre_id, s.valeur); });

    let hommes = 0, femmes = 0;
    if (uniqueMembres.size > 0) {
      const ids = Array.from(uniqueMembres.keys());
      const { data: membresSexe } = await supabase.from("membres_complets").select("id,sexe").in("id", ids);
      membresSexe?.forEach((m) => {
        if (m.sexe === "Homme") hommes++;
        if (m.sexe === "Femme") femmes++;
      });
    }
    setServiteurStats({ hommes, femmes });

    setLoading(false);
  };

  // 🔹 Préparer les rapports pour affichage
  const rapports = [
    { label: "Culte", data: attendanceStats, border: "border-l-orange-500" },
    { label: "Evangelisation", data: evanStats, border: "border-l-green-500" },
    { label: "Baptême", data: baptemeStats, border: "border-l-purple-500" },
    { label: "Formation", data: formationStats, border: "border-l-blue-500" },
    { label: "Cellules", data: { total: cellulesCount }, border: "border-l-yellow-500" },
    { label: "Serviteur", data: serviteurStats, border: "border-l-pink-500" },
  ].filter((r) => typeRapport === "Tous" || r.label === typeRapport);

  // 🔹 Total général
  const totalGeneral = rapports.reduce((acc, r) => {
    acc.hommes += Number(r.data?.hommes) || 0;
    acc.femmes += Number(r.data?.femmes) || 0;
    acc.jeunes += Number(r.data?.jeunes) || 0;
    acc.enfants += Number(r.data?.enfants) || 0;
    acc.connectes += Number(r.data?.connectes) || 0;
    acc.nouveauxVenus += Number(r.data?.nouveauxVenus) || 0;
    acc.nouveauxConvertis += Number(r.data?.nouveauxConvertis) || 0;
    acc.moissonneurs += Number(r.data?.moissonneurs) || 0;
    return acc;
  }, { hommes: 0, femmes: 0, jeunes: 0, enfants: 0, connectes: 0, nouveauxVenus: 0, nouveauxConvertis: 0, moissonneurs: 0 });

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-[#333699]">
      <HeaderPages />
      <h1 className="text-2xl font-bold mt-4 mb-6 text-center text-white">
        Rapport <span className="text-amber-300">Statistiques Globales</span>
      </h1>

      {/* FILTRES */}
      <div className="bg-white/10 p-6 rounded-2xl shadow-lg mt-6 flex gap-4 flex-wrap text-white">
        <input type="date" value={dateDebut} onChange={(e) => setDateDebut(e.target.value)} className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white" />
        <input type="date" value={dateFin} onChange={(e) => setDateFin(e.target.value)} className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white" />
        <select value={typeRapport} onChange={(e) => setTypeRapport(e.target.value)} className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white">
          <option value="Tous" className="text-black">Tous</option>
          <option value="Culte" className="text-black">Culte</option>
          <option value="Evangelisation" className="text-black">Evangelisation</option>
          <option value="Baptême" className="text-black">Baptême</option>
          <option value="Formation" className="text-black">Formation</option>
          <option value="Serviteur" className="text-black">Serviteur</option>
          <option value="Cellules" className="text-black">Cellules</option>
        </select>
        <button onClick={fetchStats} className="bg-[#2a2f85] px-6 py-2 rounded-xl hover:bg-[#1f2366]">Générer</button>
      </div>

      {/* TABLE */}
      {!loading && attendanceStats && (
        <div className="w-full max-w-full overflow-x-auto mt-6 scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-transparent">
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
              <div className="min-w-[160px] text-center">Moissonneurs</div>
            </div>

            {/* LIGNES */}
            {rapports.map((r, idx) => (
              <div key={idx} className={`flex items-center px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 transition border-l-4 ${r.border}`}>
                <div className="min-w-[180px] text-white font-semibold">{r.label}</div>
                <div className="min-w-[120px] text-center text-white">{r.data?.hommes ?? "-"}</div>
                <div className="min-w-[120px] text-center text-white">{r.data?.femmes ?? "-"}</div>
                <div className="min-w-[120px] text-center text-white">{r.data?.jeunes ?? "-"}</div>
                <div className="min-w-[120px] text-center text-white">{r.data?.enfants ?? "-"}</div>
                <div className="min-w-[140px] text-center text-white">{r.data?.connectes ?? "-"}</div>
                <div className="min-w-[150px] text-center text-white">{r.data?.nouveauxVenus ?? "-"}</div>
                <div className="min-w-[180px] text-center text-white">{r.data?.nouveauxConvertis ?? "-"}</div>
                <div className="min-w-[160px] text-center text-white">{r.data?.moissonneurs ?? "-"}</div>
              </div>
            ))}

            {/* TOTAL GENERAL */}
            <div className="flex items-center px-4 py-4 mt-3 rounded-xl bg-white/20 border-t border-white/40 font-bold">
              <div className="min-w-[180px] text-orange-400 font-semibold uppercase ml-1">TOTAL</div>
              <div className="min-w-[120px] text-center text-orange-400 font-semibold">{totalGeneral.hommes}</div>
              <div className="min-w-[120px] text-center text-orange-400 font-semibold">{totalGeneral.femmes}</div>
              <div className="min-w-[120px] text-center text-orange-400 font-semibold">{totalGeneral.jeunes}</div>
              <div className="min-w-[120px] text-center text-orange-400 font-semibold">{totalGeneral.enfants}</div>
              <div className="min-w-[140px] text-center text-orange-400 font-semibold">{totalGeneral.connectes}</div>
              <div className="min-w-[150px] text-center text-orange-400 font-semibold">{totalGeneral.nouveauxVenus}</div>
              <div className="min-w-[180px] text-center text-orange-400 font-semibold">{totalGeneral.nouveauxConvertis}</div>
              <div className="min-w-[160px] text-center text-orange-400 font-semibold">{totalGeneral.moissonneurs}</div>
            </div>

          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
