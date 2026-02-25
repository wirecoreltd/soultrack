"use client";

import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import HeaderPages from "../components/HeaderPages";
import Footer from "../components/Footer";
import ProtectedRoute from "../components/ProtectedRoute";

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
  const [loading, setLoading] = useState(false);

  const [branches, setBranches] = useState([]);

  // 🔹 Récupérer la branche de l'utilisateur et son nom
  useEffect(() => {
    const fetchUserBranche = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profileData } = await supabase
        .from("profiles")
        .select("branche_id")
        .eq("id", user.id)
        .single();

      if (!profileData?.branche_id) return;

      const { data: brancheData } = await supabase
        .from("branches")
        .select("id, nom")
        .eq("id", profileData.branche_id)
        .single();

      if (brancheData) {
        setBranches([{ id: brancheData.id, nom: brancheData.nom, rapports: null }]);
      }
    };

    fetchUserBranche();
  }, []);

  const fetchStats = async () => {
    if (!branches.length) return;
    setLoading(true);

    const updatedBranches = [];

    for (const b of branches) {
      const branchId = b.id;

      // -------- ATTENDANCE --------
      const { data: attendanceData } = await supabase
        .from("attendance")
        .select("*")
        .eq("branche_id", branchId)
        .gte(dateDebut ? "date" : null, dateDebut || undefined)
        .lte(dateFin ? "date" : null, dateFin || undefined);

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
      const { data: evanData } = await supabase
        .from("evangelises")
        .select("*")
        .eq("branche_id", branchId)
        .gte(dateDebut ? "created_at" : null, dateDebut || undefined)
        .lte(dateFin ? "created_at" : null, dateFin || undefined);

      const evanTotals = { hommes: 0, femmes: 0, nouveauxConvertis: 0 };
      evanData?.forEach(r => {
        if (r.sexe === "Homme") evanTotals.hommes++;
        if (r.sexe === "Femme") evanTotals.femmes++;
        if (r.type_conversion === "Nouveau converti") evanTotals.nouveauxConvertis++;
      });

      // -------- BAPTEME --------
      const { data: baptemeData } = await supabase
        .from("baptemes")
        .select("hommes,femmes")
        .eq("branche_id", branchId)
        .gte(dateDebut ? "date" : null, dateDebut || undefined)
        .lte(dateFin ? "date" : null, dateFin || undefined);

      const baptemeTotals = {
        hommes: baptemeData?.reduce((s, r) => s + Number(r.hommes), 0) || 0,
        femmes: baptemeData?.reduce((s, r) => s + Number(r.femmes), 0) || 0,
      };

      // -------- FORMATION --------
      const { data: formationData } = await supabase
        .from("formations")
        .select("hommes,femmes")
        .eq("branche_id", branchId)
        .gte(dateDebut ? "date_debut" : null, dateDebut || undefined)
        .lte(dateFin ? "date_fin" : null, dateFin || undefined);

      const formationTotals = {
        hommes: formationData?.reduce((s, r) => s + Number(r.hommes), 0) || 0,
        femmes: formationData?.reduce((s, r) => s + Number(r.femmes), 0) || 0,
      };

      // -------- CELLULES --------
      const { count: cellulesCount } = await supabase
        .from("cellules")
        .select("id", { count: "exact", head: true })
        .eq("branche_id", branchId);

      // -------- SERVITEURS --------
      const { data: servData } = await supabase
        .from("stats_ministere_besoin")
        .select("membre_id,valeur")
        .eq("branche_id", branchId)
        .eq("type", "ministere")
        .gte(dateDebut ? "date_action" : null, dateDebut || undefined)
        .lte(dateFin ? "date_action" : null, dateFin || undefined);

      const uniqueMembres = new Map();
      servData?.forEach(s => { if (!uniqueMembres.has(s.membre_id)) uniqueMembres.set(s.membre_id, s.valeur); });

      let hommesServ = 0, femmesServ = 0;
      if (uniqueMembres.size > 0) {
        const ids = Array.from(uniqueMembres.keys());
        const { data: membresSexe } = await supabase
          .from("membres_complets")
          .select("id,sexe")
          .in("id", ids);
        membresSexe?.forEach(m => {
          if (m.sexe === "Homme") hommesServ++;
          if (m.sexe === "Femme") femmesServ++;
        });
      }

      const rapports = [
        { label: "Culte", data: attendanceTotals, border: "border-blue-400" },
        { label: "Evangelisation", data: evanTotals, border: "border-green-400" },
        { label: "Baptême", data: baptemeTotals, border: "border-purple-400" },
        { label: "Formation", data: formationTotals, border: "border-yellow-400" },
        { label: "Serviteur", data: { hommes: hommesServ, femmes: femmesServ }, border: "border-pink-400" },
        { label: "Cellules", data: { hommes: cellulesCount }, border: "border-orange-400" },
      ];

      updatedBranches.push({ ...b, rapports });
    }

    setBranches(updatedBranches);
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

      {/* TABLES PAR BRANCHE */}
      {branches.map((b, idx) => (
        b.rapports && (
          <div key={idx} className="w-full max-w-full overflow-x-auto mt-6 scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-transparent">
            <h2 className="text-xl font-bold text-white mb-2">{b.nom}</h2>
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
              {b.rapports.map((r, idx2) => (
                <div key={idx2} className={`flex items-center px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 transition border-l-4 ${r.border}`}>
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
        )
      ))}

      <Footer />
    </div>
  );
}
