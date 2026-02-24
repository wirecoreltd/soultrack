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

  const [userBrancheId, setUserBrancheId] = useState<string | null>(null);
  const [branchIds, setBranchIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const [attendanceStats, setAttendanceStats] = useState<any>(null);
  const [evanStats, setEvanStats] = useState<any>(null);
  const [baptemeStats, setBaptemeStats] = useState<any>(null);
  const [formationStats, setFormationStats] = useState<any>(null);
  const [cellulesCount, setCellulesCount] = useState<number>(0);
  const [serviteurStats, setServiteurStats] = useState<any>(null);

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
        const ids = data?.map((b: any) => b.branche_id) || [];
        setBranchIds([userBrancheId, ...ids]);
      }
    };
    fetchBranches();
  }, [userBrancheId]);

  const fetchStats = async () => {
    if (!branchIds.length) return;
    setLoading(true);

    // -------- ATTENDANCE --------
    let attendanceQuery: any = supabase.from("attendance").select("*").in("branche_id", branchIds);
    if (dateDebut) attendanceQuery = attendanceQuery.gte("date", dateDebut);
    if (dateFin) attendanceQuery = attendanceQuery.lte("date", dateFin);
    const { data: attendanceData } = await attendanceQuery;

    const attendanceTotals = { hommes: 0, femmes: 0, jeunes: 0, enfants: 0, connectes: 0, nouveauxVenus: 0, nouveauxConvertis: 0, moissonneurs: 0 };
    attendanceData?.forEach((r: any) => {
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
    let evanQuery: any = supabase.from("evangelises").select("*").in("branche_id", branchIds);
    if (dateDebut) evanQuery = evanQuery.gte("created_at", dateDebut);
    if (dateFin) evanQuery = evanQuery.lte("created_at", dateFin);
    const { data: evanData } = await evanQuery;

    const evanTotals = { hommes: 0, femmes: 0, nouveauxConvertis: 0 };
    evanData?.forEach((r: any) => {
      if (r.sexe === "Homme") evanTotals.hommes++;
      if (r.sexe === "Femme") evanTotals.femmes++;
      if (r.type_conversion === "Nouveau converti") evanTotals.nouveauxConvertis++;
    });
    setEvanStats(evanTotals);

    // -------- BAPTEME --------
    let baptemeQuery: any = supabase.from("baptemes").select("hommes,femmes").in("branche_id", branchIds);
    if (dateDebut) baptemeQuery = baptemeQuery.gte("date", dateDebut);
    if (dateFin) baptemeQuery = baptemeQuery.lte("date", dateFin);
    const { data: baptemeData } = await baptemeQuery;
    setBaptemeStats({
      hommes: baptemeData?.reduce((s: number, r: any) => s + Number(r.hommes), 0) || 0,
      femmes: baptemeData?.reduce((s: number, r: any) => s + Number(r.femmes), 0) || 0,
    });

    // -------- FORMATION --------
    let formationQuery: any = supabase.from("formations").select("hommes,femmes").in("branche_id", branchIds);
    if (dateDebut) formationQuery = formationQuery.gte("date_debut", dateDebut);
    if (dateFin) formationQuery = formationQuery.lte("date_fin", dateFin);
    const { data: formationData } = await formationQuery;
    setFormationStats({
      hommes: formationData?.reduce((s: number, r: any) => s + Number(r.hommes), 0) || 0,
      femmes: formationData?.reduce((s: number, r: any) => s + Number(r.femmes), 0) || 0,
    });

    // -------- CELLULES --------
    const { count } = await supabase.from("cellules").select("id", { count: "exact", head: true }).in("branche_id", branchIds);
    setCellulesCount(count || 0);

    // -------- SERVITEURS --------
    let servQuery: any = supabase.from("stats_ministere_besoin").select("membre_id,valeur").in("branche_id", branchIds).eq("type", "ministere");
    if (dateDebut) servQuery = servQuery.gte("date_action", dateDebut);
    if (dateFin) servQuery = servQuery.lte("date_action", dateFin);
    const { data: servData } = await servQuery;

    const uniqueMembres = new Map();
    servData?.forEach((s: any) => { if (!uniqueMembres.has(s.membre_id)) uniqueMembres.set(s.membre_id, s.valeur); });

    let hommes = 0, femmes = 0;
    if (uniqueMembres.size > 0) {
      const ids = Array.from(uniqueMembres.keys());
      const { data: membresSexe } = await supabase.from("membres_complets").select("id,sexe").in("id", ids);
      membresSexe?.forEach((m: any) => {
        if (m.sexe === "Homme") hommes++;
        if (m.sexe === "Femme") femmes++;
      });
    }
    setServiteurStats({ hommes, femmes });

    setLoading(false);
  };

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

      {/* Ici tu peux reprendre ton tableau et total général exactement comme ton code actuel */}

      <Footer />
    </div>
  );
}
