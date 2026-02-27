"use client";

import { useState, useEffect } from "react";
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
  const [loading, setLoading] = useState(false);
  const [branches, setBranches] = useState([]);
  const [superviseurId, setSuperviseurId] = useState(null);

  // 🔹 Récupérer le superviseur de l'utilisateur connecté
  useEffect(() => {
    const fetchSuperviseur = async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.log("Erreur Auth:", authError);
        return;
      }

      // ✅ Récupérer le profil via email pour éviter mismatch ID
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("branche_id")
        .eq("email", user.email)
        .single();

      if (profileError || !profile) {
        console.log("Erreur récupération profile:", profileError);
        return;
      }

      // ✅ Trouver la branche et son superviseur racine
      const { data: branch, error: branchError } = await supabase
        .from("branches")
        .select("id, superviseur_id")
        .eq("id", profile.branche_id)
        .single();

      if (branchError || !branch) {
        console.log("Erreur récupération branche:", branchError);
        return;
      }

      const rootSuperviseur = branch.superviseur_id || branch.id;
      console.log("Superviseur défini:", rootSuperviseur);
      setSuperviseurId(rootSuperviseur);
    };

    fetchSuperviseur();
  }, []);

  const fetchStats = async () => {
  if (!superviseurId) {
    alert("Superviseur non défini !");
    return;
  }

  console.log("fetchStats appelé ! SuperviseurId =", superviseurId);
  setLoading(true);

  try {
    // 🔹 1️⃣ Récupérer toutes les branches sous ce superviseur
    const { data: branchesData, error: branchesError } = await supabase
      .from("branches")
      .select("id, nom")
      .or(`(id.eq.${superviseurId},superviseur_id.eq.${superviseurId})`);

    console.log("Branches récupérées:", branchesData, branchesError);

    if (branchesError || !branchesData?.length) {
      setBranches([]);
      console.log("Aucune branche trouvée !");
      setLoading(false);
      return;
    }

    // 🔹 2️⃣ Récupérer les statistiques
    let statsQuery = supabase.from("attendance_stats").select("*");

    if (dateDebut) statsQuery = statsQuery.gte("mois", dateDebut);
    if (dateFin) statsQuery = statsQuery.lte("mois", dateFin);

    const { data: statsData, error: statsError } = await statsQuery;
    console.log("Stats récupérées:", statsData, statsError);

    if (statsError || !statsData?.length) {
      setBranches([]);
      console.log("Aucune stats trouvée !");
      setLoading(false);
      return;
    }

    // 🔹 3️⃣ Filtrer uniquement les stats des branches sous ce superviseur
    const branchIds = branchesData.map((b) => b.id);
    const filteredStats = statsData.filter((s) => branchIds.includes(s.branche_id));
    console.log("Stats filtrées:", filteredStats);

    if (!filteredStats.length) {
      setBranches([]);
      console.log("Aucune stats correspondante aux branches !");
      setLoading(false);
      return;
    }

    // 🔹 4️⃣ Regrouper par branche_nom
    const grouped = {};
    filteredStats.forEach((item) => {
      const key = item.branche_nom?.trim();
      if (!key) return;

      if (!grouped[key]) {
        grouped[key] = {
          branche_nom: key,
          culte: {
            hommes: 0,
            femmes: 0,
            jeunes: 0,
            enfants: 0,
            connectes: 0,
            nouveaux_venus: 0,
            nouveau_converti: 0,
            moissonneurs: 0,
          },
        };
      }

      grouped[key].culte.hommes += Number(item.hommes) || 0;
      grouped[key].culte.femmes += Number(item.femmes) || 0;
      grouped[key].culte.jeunes += Number(item.jeunes) || 0;
      grouped[key].culte.enfants += Number(item.enfants) || 0;
      grouped[key].culte.connectes += Number(item.connectes) || 0;
      grouped[key].culte.nouveaux_venus += Number(item.nouveaux_venus) || 0;
      grouped[key].culte.nouveau_converti += Number(item.nouveau_converti) || 0;
      grouped[key].culte.moissonneurs += Number(item.moissonneurs) || 0;
    });

    setBranches(Object.values(grouped));
    console.log("Branches finales:", Object.values(grouped));
  } catch (err) {
    console.error("Erreur fetchStats:", err);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-[#333699]">
      <HeaderPages />

      <h1 className="text-2xl font-bold mt-4 mb-6 text-center text-white">
        Rapport <span className="text-amber-300">Statistiques Globales</span>
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
        <button
          onClick={fetchStats}
          className="bg-[#2a2f85] px-6 py-2 rounded-xl hover:bg-[#1f2366]"
        >
          Générer
        </button>
      </div>

      {/* AFFICHAGE */}
      {!loading && branches.length > 0 && (
        <div className="w-full max-w-full overflow-x-auto mt-8 space-y-8">
          {branches.map((b, idx) => (
            <div key={idx} className="w-full">
              <div className="text-xl font-bold text-amber-300 mb-3">{b.branche_nom}</div>

              <div className="flex font-semibold uppercase text-white px-4 py-3 border-b border-white/30 bg-white/5 rounded-t-xl whitespace-nowrap">
                <div className="min-w-[180px]">Type</div>
                <div className="min-w-[120px] text-center">Hommes</div>
                <div className="min-w-[120px] text-center">Femmes</div>
                <div className="min-w-[120px] text-center">Jeunes</div>
                <div className="min-w-[120px] text-center">Enfants</div>
                <div className="min-w-[140px] text-center">Connectés</div>
                <div className="min-w-[150px] text-center">Nouveaux</div>
                <div className="min-w-[180px] text-center">Convertis</div>
                <div className="min-w-[160px] text-center">Moissonneurs</div>
              </div>

              <div className="flex items-center px-4 py-3 rounded-b-xl bg-white/10 border-l-4 border-blue-400 whitespace-nowrap">
                <div className="min-w-[180px] text-white font-semibold">Culte</div>
                <div className="min-w-[120px] text-center text-white">{b.culte.hommes}</div>
                <div className="min-w-[120px] text-center text-white">{b.culte.femmes}</div>
                <div className="min-w-[120px] text-center text-white">{b.culte.jeunes}</div>
                <div className="min-w-[120px] text-center text-white">{b.culte.enfants}</div>
                <div className="min-w-[140px] text-center text-white">{b.culte.connectes}</div>
                <div className="min-w-[150px] text-center text-white">{b.culte.nouveaux_venus}</div>
                <div className="min-w-[180px] text-center text-white">{b.culte.nouveau_converti}</div>
                <div className="min-w-[160px] text-center text-white">{b.culte.moissonneurs}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Footer />
    </div>
  );
}
