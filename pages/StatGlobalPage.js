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
  const [branches, setBranches] = useState([]); // {id, nom} pour toutes les branches
  const [loading, setLoading] = useState(false);

  const [statsByBranch, setStatsByBranch] = useState([]);

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

  const fetchStats = async () => {
    if (!userBrancheId) return;
    setLoading(true);

    // 🔹 Récupérer toutes les branches enfants + la branche parent
    const { data: branchData } = await supabase
      .from("eglises")
      .select("id,nom")
      .or(`id.eq.${userBrancheId},parent_eglise_id.eq.${userBrancheId}`);

    const allBranches = branchData || [];
    setBranches(allBranches);

    // 🔹 Pour chaque branche, récupérer les stats
    const results = [];

    for (const b of allBranches) {
      const brancheId = b.id;

      // ATTENDANCE
      const { data: attendanceData } = await supabase
        .from("attendance")
        .select("*")
        .eq("branche_id", brancheId)
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

      // EVANGELISATION
      const { data: evanData } = await supabase
        .from("evangelises")
        .select("*")
        .eq("branche_id", brancheId)
        .gte(dateDebut ? "created_at" : null, dateDebut || undefined)
        .lte(dateFin ? "created_at" : null, dateFin || undefined);

      const evanTotals = { hommes: 0, femmes: 0, nouveauxConvertis: 0 };
      evanData?.forEach(r => {
        if (r.sexe === "Homme") evanTotals.hommes++;
        if (r.sexe === "Femme") evanTotals.femmes++;
        if (r.type_conversion === "Nouveau converti") evanTotals.nouveauxConvertis++;
      });

      // BAPTEME
      const { data: baptemeData } = await supabase
        .from("baptemes")
        .select("*")
        .eq("branche_id", brancheId)
        .gte(dateDebut ? "date" : null, dateDebut || undefined)
        .lte(dateFin ? "date" : null, dateFin || undefined);

      const baptemeTotals = { hommes: 0, femmes: 0 };
      baptemeData?.forEach(r => {
        baptemeTotals.hommes += Number(r.hommes) || 0;
        baptemeTotals.femmes += Number(r.femmes) || 0;
      });

      // FORMATION
      const { data: formationData } = await supabase
        .from("formations")
        .select("*")
        .eq("branche_id", brancheId)
        .gte(dateDebut ? "date_debut" : null, dateDebut || undefined)
        .lte(dateFin ? "date_fin" : null, dateFin || undefined);

      const formationTotals = { hommes: 0, femmes: 0 };
      formationData?.forEach(r => {
        formationTotals.hommes += Number(r.hommes) || 0;
        formationTotals.femmes += Number(r.femmes) || 0;
      });

      // CELLULES
      const { count: cellulesCount } = await supabase
        .from("cellules")
        .select("id", { count: "exact", head: true })
        .eq("branche_id", brancheId);

      // SERVITEURS
      const { data: servData } = await supabase
        .from("stats_ministere_besoin")
        .select("membre_id")
        .eq("branche_id", brancheId)
        .eq("type", "ministere")
        .gte(dateDebut ? "date_action" : null, dateDebut || undefined)
        .lte(dateFin ? "date_action" : null, dateFin || undefined);

      let hommesServ = 0, femmesServ = 0;
      const servIds = servData?.map(s => s.membre_id) || [];
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

      results.push({
        branche: b.nom,
        attendance: attendanceTotals,
        evangelisation: evanTotals,
        bapteme: baptemeTotals,
        formation: formationTotals,
        serviteur: { hommes: hommesServ, femmes: femmesServ },
        cellules: { hommes: cellulesCount },
      });
    }

    setStatsByBranch(results);
    setLoading(false);
  };

  // 🔹 Calculer les totaux généraux
  const totalGeneral = statsByBranch.reduce((tot, r) => {
    return {
      hommes: tot.hommes + (r.attendance?.hommes || 0) + (r.evangelisation?.hommes || 0) + (r.bapteme?.hommes || 0) + (r.formation?.hommes || 0) + (r.serviteur?.hommes || 0) + (r.cellules?.hommes || 0),
      femmes: tot.femmes + (r.attendance?.femmes || 0) + (r.evangelisation?.femmes || 0) + (r.bapteme?.femmes || 0) + (r.formation?.femmes || 0) + (r.serviteur?.femmes || 0),
      jeunes: tot.jeunes + (r.attendance?.jeunes || 0),
      enfants: tot.enfants + (r.attendance?.enfants || 0),
      connectes: tot.connectes + (r.attendance?.connectes || 0),
      nouveauxVenus: tot.nouveauxVenus + (r.attendance?.nouveauxVenus || 0),
      nouveauxConvertis: tot.nouveauxConvertis + (r.attendance?.nouveauxConvertis || 0) + (r.evangelisation?.nouveauxConvertis || 0),
      moissonneurs: tot.moissonneurs + (r.attendance?.moissonneurs || 0),
    };
  }, { hommes:0,femmes:0,jeunes:0,enfants:0,connectes:0,nouveauxVenus:0,nouveauxConvertis:0,moissonneurs:0 });

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
        <button onClick={fetchStats} className="bg-[#2a2f85] px-6 py-2 rounded-xl hover:bg-[#1f2366]">Générer</button>
      </div>

      {/* TABLE */}
      {!loading && statsByBranch.length > 0 && (
        <div className="w-full max-w-full overflow-x-auto mt-6 scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-transparent">
          <div className="w-max space-y-2">
            {/* HEADER */}
            <div className="flex font-semibold uppercase text-white px-4 py-3 border-b border-white/30 bg-white/5 rounded-t-xl whitespace-nowrap">
              <div className="min-w-[180px] ml-1">Branche</div>
              <div className="min-w-[120px] text-center">Hommes</div>
              <div className="min-w-[120px] text-center">Femmes</div>
              <div className="min-w-[120px] text-center">Jeunes</div>
              <div className="min-w-[120px] text-center">Enfants</div>
              <div className="min-w-[140px] text-center">Connectés</div>
              <div className="min-w-[150px] text-center">Nouveaux Venus</div>
              <div className="min-w-[180px] text-center">Nouveau Converti</div>
              <div className="min-w-[160px] text-center">Moissonneurs</div>
            </div>

            {/* LIGNES PAR BRANCHE */}
            {statsByBranch.map((r, idx) => (
              <div key={idx} className="flex items-center px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 transition border-l-4 border-blue-400">
                <div className="min-w-[180px] text-white font-semibold">{r.branche}</div>
                <div className="min-w-[120px] text-center text-white">{r.attendance?.hommes || 0}</div>
                <div className="min-w-[120px] text-center text-white">{r.attendance?.femmes || 0}</div>
                <div className="min-w-[120px] text-center text-white">{r.attendance?.jeunes || 0}</div>
                <div className="min-w-[120px] text-center text-white">{r.attendance?.enfants || 0}</div>
                <div className="min-w-[140px] text-center text-white">{r.attendance?.connectes || 0}</div>
                <div className="min-w-[150px] text-center text-white">{r.attendance?.nouveauxVenus || 0}</div>
                <div className="min-w-[180px] text-center text-white">{r.attendance?.nouveauxConvertis + r.evangelisation?.nouveauxConvertis || 0}</div>
                <div className="min-w-[160px] text-center text-white">{r.attendance?.moissonneurs || 0}</div>
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
