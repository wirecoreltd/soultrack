"use client";

import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import HeaderPages from "../components/HeaderPages";
import ProtectedRoute from "../components/ProtectedRoute";
import Footer from "../components/Footer";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react"; // pour l'icone collapse

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

  const [egliseId, setEgliseId] = useState(null);
  const [brancheId, setBrancheId] = useState(null);

  const [statsByMonth, setStatsByMonth] = useState([]); // tableau des mois avec stats
  const [collapsedMonths, setCollapsedMonths] = useState({}); // pour gérer l'open/close

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
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

    // ================= FETCH TOUT =================
    let query = supabase
      .from("evangelises")
      .select("*")
      .eq("eglise_id", egliseId)
      .eq("branche_id", brancheId);
    
    if (dateDebut) query = query.gte("created_at", dateDebut);
    if (dateFin) query = query.lte("created_at", dateFin);

    const { data } = await query;

    // ================= GROUPE PAR MOIS =================
    const grouped = {};

    data?.forEach((r) => {
      const month = new Date(r.created_at).toLocaleString("fr-FR", { month: "long", year: "numeric" });
      if (!grouped[month]) grouped[month] = [];
      grouped[month].push(r);
    });

    // ================= CALCULE STAT PAR MOIS =================
    const monthsStats = Object.keys(grouped).map((month) => {
      const evanData = grouped[month];

      const attendanceTotals = { hommes: 0, femmes: 0, jeunes: 0, enfants: 0, connectes: 0, nouveauxVenus: 0, nouveauxConvertis: 0, moissonneurs: 0 };
      const serviteurTotals = { hommes: 0, femmes: 0 };

      evanData.forEach((r) => {
        if (r.sexe === "Homme") attendanceTotals.hommes++;
        if (r.sexe === "Femme") attendanceTotals.femmes++;
        if (r.type_conversion === "Nouveau converti") attendanceTotals.nouveauxConvertis++;

        // si c'est serviteur
        if (r.star && ["Existant","Nouveau"].includes(r.etat_contact)) {
          if (r.sexe === "Homme") serviteurTotals.hommes++;
          if (r.sexe === "Femme") serviteurTotals.femmes++;
        }
      });

      return {
        month,
        stats: [
          { label: "Evangelisation", data: attendanceTotals, border: "border-l-green-500" },
          { label: "Serviteur", data: serviteurTotals, border: "border-l-pink-500" },
        ],
      };
    });

    setStatsByMonth(monthsStats);
    setLoading(false);
  };

  const toggleMonth = (month) => {
    setCollapsedMonths(prev => ({ ...prev, [month]: !prev[month] }));
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-[#333699]">
      <HeaderPages />
      <h1 className="text-3xl font-bold text-white mt-4">Statistiques Globales</h1>

      {/* FILTRES */}
      <div className="bg-white/10 p-6 rounded-2xl shadow-lg mt-6 flex gap-4 flex-wrap text-white">
        <input type="date" value={dateDebut} onChange={e => setDateDebut(e.target.value)}
          className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white" />
        <input type="date" value={dateFin} onChange={e => setDateFin(e.target.value)}
          className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white" />
        <select value={typeRapport} onChange={e => setTypeRapport(e.target.value)}
          className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white">
          <option className="text-black" value="Tous">Tous</option>
          <option className="text-black" value="Evangelisation">Evangelisation</option>
          <option className="text-black" value="Serviteur">Serviteur</option>
        </select>
        <button onClick={fetchStats} className="bg-[#2a2f85] px-6 py-2 rounded-xl hover:bg-[#1f2366]">Générer</button>
      </div>

      {!loading && attendanceStats && (
  <div className="w-full max-w-full overflow-x-auto mt-6 scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-transparent">
          <div className="w-max space-y-2">
            {/* On regroupe par mois */}
            {["Février 2026"].map((mois) => {
              const showRows = true; // toggle si besoin
              return (
                <div key={mois}>
                  {/* HEADER MOIS */}
                  <div className="flex items-center justify-between px-4 py-3 bg-white/10 rounded-lg cursor-pointer hover:bg-white/20">
                    <div className="font-semibold text-white">{mois}</div>
                  </div>
        
                  {/* LIGNES DU MOIS */}
                  {showRows && (
                    <div className="space-y-2 mt-1">
                      {/* EVANGELISATION */}
                      <div className="flex items-center px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 transition border-l-4 border-l-green-500">
                        <div className="min-w-[180px] text-white font-semibold">Evangelisation</div>
                        <div className="min-w-[120px] text-center text-white">10</div>
                        <div className="min-w-[120px] text-center text-white">4</div>
                        <div className="min-w-[120px] text-center text-white">-</div>
                        <div className="min-w-[120px] text-center text-white">-</div>
                        <div className="min-w-[140px] text-center text-white">-</div>
                        <div className="min-w-[150px] text-center text-white">-</div>
                        <div className="min-w-[180px] text-center text-white">-</div>
                        <div className="min-w-[140px] text-center text-white">-</div>
                        <div className="min-w-[160px] text-center text-white">-</div>
                      </div>
        
                      {/* SERVITEUR */}
                      <div className="flex items-center px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 transition border-l-4 border-l-yellow-500">
                        <div className="min-w-[180px] text-white font-semibold">Serviteur</div>
                        <div className="min-w-[120px] text-center text-white">0</div>
                        <div className="min-w-[120px] text-center text-white">0</div>
                        <div className="min-w-[120px] text-center text-white">-</div>
                        <div className="min-w-[120px] text-center text-white">-</div>
                        <div className="min-w-[140px] text-center text-white">-</div>
                        <div className="min-w-[150px] text-center text-white">-</div>
                        <div className="min-w-[180px] text-center text-white">-</div>
                        <div className="min-w-[140px] text-center text-white">-</div>
                        <div className="min-w-[160px] text-center text-white">-</div>
                      </div>
        
                      {/* TOTAL GENERAL */}
                      <div className="flex items-center px-4 py-4 mt-1 rounded-xl bg-white/20 border-t border-white/40 font-bold">
                        <div className="min-w-[180px] text-orange-400 font-semibold uppercase ml-1">TOTAL</div>
                        <div className="min-w-[120px] text-center text-orange-400 font-semibold">10</div>
                        <div className="min-w-[120px] text-center text-orange-400 font-semibold">4</div>
                        <div className="min-w-[120px] text-center text-orange-400 font-semibold">-</div>
                        <div className="min-w-[120px] text-center text-orange-400 font-semibold">-</div>
                        <div className="min-w-[140px] text-center text-orange-400 font-semibold">-</div>
                        <div className="min-w-[150px] text-center text-orange-400 font-semibold">-</div>
                        <div className="min-w-[180px] text-center text-orange-400 font-semibold">-</div>
                        <div className="min-w-[140px] text-center text-orange-400 font-semibold">-</div>
                        <div className="min-w-[160px] text-center text-orange-400 font-semibold">-</div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>


      <Footer />
    </div>
  );
}
