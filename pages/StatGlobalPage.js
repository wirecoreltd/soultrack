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
  const [loading, setLoading] = useState(false);
  const [rapportsData, setRapportsData] = useState([]);

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

  // 🔹 Fonction pour récupérer toutes les branches enfants
  const fetchBranchesEnfants = async (parentId) => {
    const { data } = await supabase
      .from("eglises")
      .select("id, nom, parent_eglise_id, pays")
      .or(`id.eq.${parentId},parent_eglise_id.eq.${parentId}`);

    // Récupère récursivement tous les enfants
    let allBranches = [];
    const getChildren = (branches, parentId) => {
      branches.forEach(b => {
        if (b.parent_eglise_id === parentId || b.id === parentId) {
          allBranches.push(b);
          getChildren(branches, b.id);
        }
      });
    };
    getChildren(data || [], parentId);
    return allBranches;
  };

  const fetchStats = async () => {
    if (!userBrancheId) return;
    setLoading(true);

    // 🔹 Récupérer toutes les branches enfants
    const branches = await fetchBranchesEnfants(userBrancheId);
    const branchIds = branches.map(b => b.id);

    // 🔹 Récupérer les données pour chaque type
    const [attendanceData, evanData, baptemeData, formationData, servData, cellulesData] = await Promise.all([
      supabase.from("attendance").select("*").in("branche_id", branchIds).gte(dateDebut ? "date" : null, dateDebut || undefined).lte(dateFin ? "date" : null, dateFin || undefined),
      supabase.from("evangelises").select("*").in("branche_id", branchIds).gte(dateDebut ? "created_at" : null, dateDebut || undefined).lte(dateFin ? "created_at" : null, dateFin || undefined),
      supabase.from("baptemes").select("*").in("branche_id", branchIds).gte(dateDebut ? "date" : null, dateDebut || undefined).lte(dateFin ? "date" : null, dateFin || undefined),
      supabase.from("formations").select("*").in("branche_id", branchIds).gte(dateDebut ? "date_debut" : null, dateDebut || undefined).lte(dateFin ? "date_fin" : null, dateFin || undefined),
      supabase.from("stats_ministere_besoin").select("membre_id,valeur,branche_id").in("branche_id", branchIds).eq("type", "ministere").gte(dateDebut ? "date_action" : null, dateDebut || undefined).lte(dateFin ? "date_action" : null, dateFin || undefined),
      supabase.from("cellules").select("id, branche_id").in("branche_id", branchIds)
    ]);

    // 🔹 Construire le rapport par branche
    const rapports = branches.map(b => {
      const att = attendanceData.data?.filter(r => r.branche_id === b.id) || [];
      const evan = evanData.data?.filter(r => r.branche_id === b.id) || [];
      const bap = baptemeData.data?.filter(r => r.branche_id === b.id) || [];
      const form = formationData.data?.filter(r => r.branche_id === b.id) || [];
      const serv = servData.data?.filter(r => r.branche_id === b.id) || [];
      const cellulesCount = cellulesData.data?.filter(c => c.branche_id === b.id)?.length || 0;

      // Attendance totals
      const attendanceTotals = att.reduce((tot, r) => ({
        hommes: tot.hommes + (Number(r.hommes) || 0),
        femmes: tot.femmes + (Number(r.femmes) || 0),
        jeunes: tot.jeunes + (Number(r.jeunes) || 0),
        enfants: tot.enfants + (Number(r.enfants) || 0),
        connectes: tot.connectes + (Number(r.connectes) || 0),
        nouveauxVenus: tot.nouveauxVenus + (Number(r.nouveauxVenus) || 0),
        nouveauxConvertis: tot.nouveauxConvertis + (Number(r.nouveauxConvertis) || 0),
        moissonneurs: tot.moissonneurs + (Number(r.moissonneurs) || 0),
      }), { hommes:0,femmes:0,jeunes:0,enfants:0,connectes:0,nouveauxVenus:0,nouveauxConvertis:0,moissonneurs:0 });

      // Evangelisation totals
      const evanTotals = evan.reduce((tot, r) => ({
        hommes: tot.hommes + (r.sexe === "Homme" ? 1 : 0),
        femmes: tot.femmes + (r.sexe === "Femme" ? 1 : 0),
        nouveauxConvertis: tot.nouveauxConvertis + (r.type_conversion === "Nouveau converti" ? 1 : 0),
      }), { hommes:0,femmes:0,nouveauxConvertis:0 });

      // Baptême totals
      const bapTotals = bap.reduce((tot, r) => ({
        hommes: tot.hommes + (Number(r.hommes) || 0),
        femmes: tot.femmes + (Number(r.femmes) || 0)
      }), { hommes:0,femmes:0 });

      // Formation totals
      const formTotals = form.reduce((tot, r) => ({
        hommes: tot.hommes + (Number(r.hommes) || 0),
        femmes: tot.femmes + (Number(r.femmes) || 0)
      }), { hommes:0,femmes:0 });

      // Serviteurs
      let hommesServ = 0, femmesServ = 0;
      if (serv.length > 0) {
        const ids = serv.map(s => s.membre_id);
        const { data: membresSexe } = await supabase.from("membres_complets").select("id,sexe").in("id", ids);
        membresSexe?.forEach(m => { if(m.sexe==="Homme") hommesServ++; if(m.sexe==="Femme") femmesServ++; });
      }

      return {
        nom: b.nom,
        pays: b.pays,
        attendance: attendanceTotals,
        evangelisation: evanTotals,
        bapteme: bapTotals,
        formation: formTotals,
        serviteur: { hommes: hommesServ, femmes: femmesServ },
        cellules: { hommes: cellulesCount }
      };
    });

    setRapportsData(rapports);
    setLoading(false);
  };

  // 🔹 Calcul total général
  const totalGeneral = rapportsData.reduce((tot, b) => ({
    hommes: tot.hommes + (b.attendance.hommes||0) + (b.evangelisation.hommes||0) + (b.bapteme.hommes||0) + (b.formation.hommes||0) + (b.serviteur.hommes||0) + (b.cellules.hommes||0),
    femmes: tot.femmes + (b.attendance.femmes||0) + (b.evangelisation.femmes||0) + (b.bapteme.femmes||0) + (b.formation.femmes||0) + (b.serviteur.femmes||0) + (b.cellules.femmes||0),
    jeunes: tot.jeunes + (b.attendance.jeunes||0),
    enfants: tot.enfants + (b.attendance.enfants||0),
    connectes: tot.connectes + (b.attendance.connectes||0),
    nouveauxVenus: tot.nouveauxVenus + (b.attendance.nouveauxVenus||0),
    nouveauxConvertis: tot.nouveauxConvertis + (b.attendance.nouveauxConvertis||0) + (b.evangelisation.nouveauxConvertis||0),
    moissonneurs: tot.moissonneurs + (b.attendance.moissonneurs||0)
  }), { hommes:0,femmes:0,jeunes:0,enfants:0,connectes:0,nouveauxVenus:0,nouveauxConvertis:0,moissonneurs:0 });

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-[#333699]">
      <HeaderPages />
      <h1 className="text-2xl font-bold mt-4 mb-6 text-center text-white">
        Rapport <span className="text-amber-300">Statistiques Globales</span>
      </h1>

      {/* FILTRES */}
      <div className="bg-white/10 p-6 rounded-2xl shadow-lg mt-6 flex gap-4 flex-wrap text-white">
        <input type="date" value={dateDebut} onChange={(e)=>setDateDebut(e.target.value)} className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white" />
        <input type="date" value={dateFin} onChange={(e)=>setDateFin(e.target.value)} className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white" />
        <button onClick={fetchStats} className="bg-[#2a2f85] px-6 py-2 rounded-xl hover:bg-[#1f2366]">Générer</button>
      </div>

      {/* TABLEAU */}
      {!loading && rapportsData.length > 0 && (
        <div className="w-full max-w-full overflow-x-auto mt-6 scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-transparent">
          <div className="w-max space-y-2">
            {/* HEADER */}
            <div className="flex font-semibold uppercase text-white px-4 py-3 border-b border-white/30 bg-white/5 rounded-t-xl whitespace-nowrap">
              <div className="min-w-[200px] ml-1">Église | Pays</div>
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
            {rapportsData.map((b, idx) => (
              <div key={idx} className="flex items-center px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 transition border-l-4 border-blue-400">
                <div className="min-w-[200px] text-white font-semibold">{b.nom} - {b.pays}</div>
                <div className="min-w-[120px] text-center text-white">{b.attendance.hommes}</div>
                <div className="min-w-[120px] text-center text-white">{b.attendance.femmes}</div>
                <div className="min-w-[120px] text-center text-white">{b.attendance.jeunes}</div>
                <div className="min-w-[120px] text-center text-white">{b.attendance.enfants}</div>
                <div className="min-w-[140px] text-center text-white">{b.attendance.connectes}</div>
                <div className="min-w-[150px] text-center text-white">{b.attendance.nouveauxVenus}</div>
                <div className="min-w-[180px] text-center text-white">{b.evangelisation.nouveauxConvertis}</div>
                <div className="min-w-[160px] text-center text-white">{b.attendance.moissonneurs}</div>
              </div>
            ))}

            {/* TOTAL GENERAL */}
            <div className="flex items-center px-4 py-4 mt-3 rounded-xl bg-white/20 border-t border-white/40 font-bold">
              <div className="min-w-[200px] text-orange-400 font-semibold uppercase ml-1">TOTAL</div>
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
