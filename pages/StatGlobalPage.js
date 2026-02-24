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

      if (data?.branche_id) {
        setUserBrancheId(data.branche_id);
      }
    };
    fetchProfile();
  }, []);

  // 🔹 Récupérer et calculer toutes les stats
  const fetchStats = async () => {
    if (!userBrancheId) return;
    setLoading(true);

    // 🔹 Récupérer toutes les branches enfants
    const { data: childBranches } = await supabase
      .from("eglises")
      .select("id")
      .or(`id.eq.${userBrancheId},parent_eglise_id.eq.${userBrancheId}`);

    const allBranchIds = childBranches?.map(b => b.id) || [userBrancheId];
    setBranchIds(allBranchIds);

    // -------- ATTENDANCE --------
    const { data: attendanceData } = await supabase
      .from("attendance")
      .select("*")
      .in("branche_id", allBranchIds)
      .gte(dateDebut ? "date" : null, dateDebut || undefined)
      .lte(dateFin ? "date" : null, dateFin || undefined);

    const attendanceTotals = {
      hommes: 0, femmes: 0, jeunes: 0, enfants: 0, connectes: 0, nouveauxVenus: 0, nouveauxConvertis: 0, moissonneurs: 0
    };
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
    setAttendanceStats(attendanceTotals);

    // -------- EVANGELISATION --------
    const { data: evanData } = await supabase
      .from("evangelises")
      .select("*")
      .in("branche_id", allBranchIds)
      .gte(dateDebut ? "created_at" : null, dateDebut || undefined)
      .lte(dateFin ? "created_at" : null, dateFin || undefined);

    const evanTotals = { hommes: 0, femmes: 0, nouveauxConvertis: 0 };
    evanData?.forEach(r => {
      if (r.sexe === "Homme") evanTotals.hommes++;
      if (r.sexe === "Femme") evanTotals.femmes++;
      if (r.type_conversion === "Nouveau converti") evanTotals.nouveauxConvertis++;
    });
    setEvanStats(evanTotals);

    // -------- BAPTEME --------
    const { data: baptemeData } = await supabase
      .from("baptemes")
      .select("*")
      .in("branche_id", allBranchIds)
      .gte(dateDebut ? "date" : null, dateDebut || undefined)
      .lte(dateFin ? "date" : null, dateFin || undefined);

    const baptemeTotals = { hommes: 0, femmes: 0 };
    baptemeData?.forEach(r => {
      baptemeTotals.hommes += Number(r.hommes) || 0;
      baptemeTotals.femmes += Number(r.femmes) || 0;
    });
    setBaptemeStats(baptemeTotals);

    // -------- FORMATION --------
    const { data: formationData } = await supabase
      .from("formations")
      .select("*")
      .in("branche_id", allBranchIds)
      .gte(dateDebut ? "date_debut" : null, dateDebut || undefined)
      .lte(dateFin ? "date_fin" : null, dateFin || undefined);

    const formationTotals = { hommes: 0, femmes: 0 };
    formationData?.forEach(r => {
      formationTotals.hommes += Number(r.hommes) || 0;
      formationTotals.femmes += Number(r.femmes) || 0;
    });
    setFormationStats(formationTotals);

    // -------- CELLULES --------
    const { count: cellulesCount } = await supabase
      .from("cellules")
      .select("id", { count: "exact", head: true })
      .in("branche_id", allBranchIds);
    setCellulesCount(cellulesCount || 0);

    // -------- SERVITEURS --------
    const { data: servData } = await supabase
      .from("stats_ministere_besoin")
      .select("membre_id,valeur")
      .in("branche_id", allBranchIds)
      .eq("type", "ministere")
      .gte(dateDebut ? "date_action" : null, dateDebut || undefined)
      .lte(dateFin ? "date_action" : null, dateFin || undefined);

    const servIds = servData?.map(s => s.membre_id) || [];
    let hommesServ = 0, femmesServ = 0;

    if (servIds.length > 0) {
      const { data: membresSexe } = await supabase
        .from("membres_complets")
        .select("id,sexe")
        .in("id", servIds);

      membresSexe?.forEach(m => {
        if (m.sexe === "Homme") hommesServ++;
        if (m.sexe === "Femme") femmesServ++;
      });
    }

    setServiteurStats({ hommes: hommesServ, femmes: femmesServ });

    setLoading(false);
  };

  // 🔹 Préparer les rapports pour l'affichage
  const rapports = [
    { label: "Culte", data: attendanceStats, border: "border-blue-400" },
    { label: "Evangelisation", data: evanStats, border: "border-green-400" },
    { label: "Baptême", data: baptemeStats, border: "border-purple-400" },
    { label: "Formation", data: formationStats, border: "border-yellow-400" },
    { label: "Serviteur", data: serviteurStats, border: "border-pink-400" },
    { label: "Cellules", data: { hommes: cellulesCount }, border: "border-orange-400" },
  ];

  const totalGeneral = rapports.reduce((tot, r) => {
    if (!r.data) return tot;
    return {
      hommes: tot.hommes + (r.data.hommes || 0),
      femmes: tot.femmes + (r.data.femmes || 0),
      jeunes: tot.jeunes + (r.data.jeunes || 0),
      enfants: tot.enfants + (r.data.enfants || 0),
      connectes: tot.connectes + (r.data.connectes || 0),
      nouveauxVenus: tot.nouveauxVenus + (r.data.nouveauxVenus || 0),
      nouveauxConvertis: tot.nouveauxConvertis + (r.data.nouveauxConvertis || 0),
      moissonneurs: tot.moissonneurs + (r.data.moissonneurs || 0),
    };
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
