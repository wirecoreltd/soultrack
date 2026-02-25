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
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);

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

  // 🔹 Fetch stats par branche
  const fetchStatsParBranche = async () => {
    if (!userBrancheId) return;
    setLoading(true);

    const branchIds = [userBrancheId];

    // -------- ATTENDANCE --------
    const attendanceQuery = supabase.from("attendance").select("*").in("branche_id", branchIds);
    if (dateDebut) attendanceQuery.gte("date", new Date(dateDebut).toISOString());
    if (dateFin) attendanceQuery.lte("date", new Date(dateFin).toISOString());
    const { data: attendanceData } = await attendanceQuery;

    const attendanceTotals = { hommes: 0, femmes: 0, jeunes: 0, enfants: 0, connectes: 0, nouveauxVenus: 0, nouveauxConvertis: 0, moissonneurs: 0 };
    attendanceData?.forEach(r => {
      attendanceTotals.hommes += Number(r.hommes) || 0;
      attendanceTotals.femmes += Number(r.femmes) || 0;
      attendanceTotals.jeunes += Number(r.jeunes) || 0;
      attendanceTotals.enfants += Number(r.enfants) || 0;
      attendanceTotals.connectes += Number(r.connectes) || 0;
      attendanceTotals.nouveauxVenus += Number(r.nouveauxVenus) || 0;
      attendanceTotals.nouveauxConvertis += Number(r.nouveauxConvertis) || 0;
      attendanceTotals.moissonneurs += Number(r.moissonneurs) || 0;
    });

    // -------- EVANGELISATION --------
    const evanQuery = supabase.from("evangelises").select("*").in("branche_id", branchIds);
    if (dateDebut) evanQuery.gte("created_at", new Date(dateDebut).toISOString());
    if (dateFin) evanQuery.lte("created_at", new Date(dateFin).toISOString());
    const { data: evanData } = await evanQuery;

    const evanTotals = { hommes: 0, femmes: 0, nouveauxConvertis: 0 };
    evanData?.forEach(r => {
      if (r.sexe === "Homme") evanTotals.hommes++;
      if (r.sexe === "Femme") evanTotals.femmes++;
      if (r.type_conversion === "Nouveau converti") evanTotals.nouveauxConvertis++;
    });

    // -------- BAPTEME --------
    const bapQuery = supabase.from("baptemes").select("hommes,femmes").in("branche_id", branchIds);
    if (dateDebut) bapQuery.gte("date", new Date(dateDebut).toISOString());
    if (dateFin) bapQuery.lte("date", new Date(dateFin).toISOString());
    const { data: bapData } = await bapQuery;
    const bapTotals = {
      hommes: bapData?.reduce((s, r) => s + Number(r.hommes), 0) || 0,
      femmes: bapData?.reduce((s, r) => s + Number(r.femmes), 0) || 0,
    };

    // -------- FORMATION --------
    const formationQuery = supabase.from("formations").select("hommes,femmes").in("branche_id", branchIds);
    if (dateDebut) formationQuery.gte("date_debut", new Date(dateDebut).toISOString());
    if (dateFin) formationQuery.lte("date_fin", new Date(dateFin).toISOString());
    const { data: formationData } = await formationQuery;
    const formationTotals = {
      hommes: formationData?.reduce((s, r) => s + Number(r.hommes), 0) || 0,
      femmes: formationData?.reduce((s, r) => s + Number(r.femmes), 0) || 0,
    };

    // -------- CELLULES --------
    const { count: cellulesCount } = await supabase.from("cellules").select("id", { count: "exact", head: true }).in("branche_id", branchIds);

    // -------- SERVITEURS --------
    const servQuery = supabase.from("stats_ministere_besoin").select("membre_id,valeur").in("branche_id", branchIds).eq("type", "ministere");
    if (dateDebut) servQuery.gte("date_action", new Date(dateDebut).toISOString());
    if (dateFin) servQuery.lte("date_action", new Date(dateFin).toISOString());
    const { data: servData } = await servQuery;

    const uniqueMembres = new Map();
    servData?.forEach(s => { if (!uniqueMembres.has(s.membre_id)) uniqueMembres.set(s.membre_id, s.valeur); });

    let hommesServ = 0, femmesServ = 0;
    if (uniqueMembres.size > 0) {
      const ids = Array.from(uniqueMembres.keys());
      const { data: membresSexe } = await supabase.from("membres_complets").select("id,sexe").in("id", ids);
      membresSexe?.forEach(m => { if (m.sexe === "Homme") hommesServ++; if (m.sexe === "Femme") femmesServ++; });
    }

    // 🔹 Mettre à jour le state
    setBranches([{
      id: userBrancheId,
      nom: "Ma Branche",
      rapports: [
        { label: "Culte", data: attendanceTotals, border: "border-blue-400" },
        { label: "Evangelisation", data: evanTotals, border: "border-green-400" },
        { label: "Baptême", data: bapTotals, border: "border-purple-400" },
        { label: "Formation", data: formationTotals, border: "border-yellow-400" },
        { label: "Serviteur", data: { hommes: hommesServ, femmes: femmesServ }, border: "border-pink-400" },
        { label: "Cellules", data: { hommes: cellulesCount }, border: "border-orange-400" },
      ]
    }]);
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
        <input type="date" value={dateDebut} onChange={e => setDateDebut(e.target.value)} className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white" />
        <input type="date" value={dateFin} onChange={e => setDateFin(e.target.value)} className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white" />
        <select value={typeRapport} onChange={e => setTypeRapport(e.target.value)} className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white">
          <option value="Tous" className="text-black">Tous</option>
          <option value="Culte" className="text-black">Culte</option>
          <option value="Evangelisation" className="text-black">Evangelisation</option>
          <option value="Baptême" className="text-black">Baptême</option>
          <option value="Formation" className="text-black">Formation</option>
          <option value="Serviteur" className="text-black">Serviteur</option>
          <option value="Cellules" className="text-black">Cellules</option>
        </select>
        <button onClick={fetchStatsParBranche} className="bg-[#2a2f85] px-6 py-2 rounded-xl hover:bg-[#1f2366]">Générer</button>
      </div>

      {/* TABLE */}
      {!loading && branches.length > 0 && branches.map((b) => (
        <div key={b.id} className="w-full max-w-full overflow-x-auto mt-6 scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-transparent">
          <h2 className="text-xl font-semibold text-white mb-3">{b.nom}</h2>
          <div className="w-max space-y-2">
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

            {b.rapports.map((r, idx) => (
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
          </div>
        </div>
      ))}

      <Footer />
    </div>
  );
}
