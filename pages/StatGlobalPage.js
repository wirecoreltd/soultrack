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

  const [statsByBranche, setStatsByBranche] = useState([]);

  // 🔹 Récupérer la branche de l'utilisateur et ses enfants
  useEffect(() => {
    const fetchBranches = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("branche_id")
        .eq("id", user.id)
        .single();

      if (!profile?.branche_id) return;
      setUserBrancheId(profile.branche_id);

      // Récupérer toutes les branches enfants
      const { data: allBranches } = await supabase
        .from("eglises")
        .select("id,nom,pays,parent_eglise_id")
        .or(`id.eq.${profile.branche_id},parent_eglise_id.eq.${profile.branche_id}`);

      setBranches(allBranches || []);
    };
    fetchBranches();
  }, []);

  const fetchStats = async () => {
    if (!branches.length) return;
    setLoading(true);

    const results = [];

    for (const b of branches) {
      // Attendance
      const { data: attendance } = await supabase
        .from("attendance")
        .select("*")
        .eq("branche_id", b.id)
        .gte(dateDebut ? "date" : null, dateDebut || undefined)
        .lte(dateFin ? "date" : null, dateFin || undefined);

      const attendanceTotals = { hommes: 0, femmes: 0, jeunes: 0, enfants: 0, connectes: 0, nouveauxVenus: 0, nouveauxConvertis: 0, moissonneurs: 0 };
      attendance?.forEach(r => {
        attendanceTotals.hommes += Number(r.hommes) || 0;
        attendanceTotals.femmes += Number(r.femmes) || 0;
        attendanceTotals.jeunes += Number(r.jeunes) || 0;
        attendanceTotals.enfants += Number(r.enfants) || 0;
        attendanceTotals.connectes += Number(r.connectes) || 0;
        attendanceTotals.nouveauxVenus += Number(r.nouveauxVenus) || 0;
        attendanceTotals.nouveauxConvertis += Number(r.nouveauxConvertis) || 0;
        attendanceTotals.moissonneurs += Number(r.moissonneurs) || 0;
      });

      // Evangelisation
      const { data: evan } = await supabase
        .from("evangelises")
        .select("*")
        .eq("branche_id", b.id)
        .gte(dateDebut ? "created_at" : null, dateDebut || undefined)
        .lte(dateFin ? "created_at" : null, dateFin || undefined);

      const evanTotals = { hommes: 0, femmes: 0, nouveauxConvertis: 0 };
      evan?.forEach(r => {
        if (r.sexe === "Homme") evanTotals.hommes++;
        if (r.sexe === "Femme") evanTotals.femmes++;
        if (r.type_conversion === "Nouveau converti") evanTotals.nouveauxConvertis++;
      });

      // Baptême
      const { data: bapteme } = await supabase
        .from("baptemes")
        .select("hommes,femmes")
        .eq("branche_id", b.id)
        .gte(dateDebut ? "date" : null, dateDebut || undefined)
        .lte(dateFin ? "date" : null, dateFin || undefined);

      const baptemeTotals = {
        hommes: bapteme?.reduce((s, r) => s + Number(r.hommes), 0) || 0,
        femmes: bapteme?.reduce((s, r) => s + Number(r.femmes), 0) || 0,
      };

      results.push({
        branche: `${b.nom} - ${b.pays || ""}`,
        attendance: attendanceTotals,
        evangelisation: evanTotals,
        bapteme: baptemeTotals,
      });
    }

    setStatsByBranche(results);
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
        <button onClick={fetchStats} disabled={loading || !branches.length} className={`bg-[#2a2f85] px-6 py-2 rounded-xl hover:bg-[#1f2366] ${loading || !branches.length ? "opacity-50 cursor-not-allowed" : ""}`}>
          {loading ? "Chargement..." : "Générer"}
        </button>
      </div>

      {/* TABLE */}
      {!loading && statsByBranche.length > 0 && (
        <div className="w-full max-w-full overflow-x-auto mt-6 scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-transparent">
          <div className="w-max space-y-2">
            {/* HEADER */}
            <div className="flex font-semibold uppercase text-white px-4 py-3 border-b border-white/30 bg-white/5 rounded-t-xl whitespace-nowrap">
              <div className="min-w-[200px]">Branche</div>
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
            {statsByBranche.map((b, idx) => (
              <div key={idx} className="flex items-center px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 transition border-l-4 border-blue-400">
                <div className="min-w-[200px] text-white font-semibold">{b.branche}</div>
                <div className="min-w-[120px] text-center text-white">{b.attendance?.hommes ?? "-"}</div>
                <div className="min-w-[120px] text-center text-white">{b.attendance?.femmes ?? "-"}</div>
                <div className="min-w-[120px] text-center text-white">{b.attendance?.jeunes ?? "-"}</div>
                <div className="min-w-[120px] text-center text-white">{b.attendance?.enfants ?? "-"}</div>
                <div className="min-w-[140px] text-center text-white">{b.attendance?.connectes ?? "-"}</div>
                <div className="min-w-[150px] text-center text-white">{b.attendance?.nouveauxVenus ?? "-"}</div>
                <div className="min-w-[180px] text-center text-white">{b.evangelisation?.nouveauxConvertis ?? "-"}</div>
                <div className="min-w-[160px] text-center text-white">{b.attendance?.moissonneurs ?? "-"}</div>
              </div>
            ))}

          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
