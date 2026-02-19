"use client";

import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import HeaderPages from "../components/HeaderPages";
import ProtectedRoute from "../components/ProtectedRoute";
import Footer from "../components/Footer";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react"; // icônes collapse

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

  const [statsByMonth, setStatsByMonth] = useState([]); // tableau de mois avec stats
  const [collapsedMonths, setCollapsedMonths] = useState({}); // pour toggle collapse
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

    // ================= CALCULE STATS PAR MOIS =================
    const monthsStats = Object.keys(grouped).map((month) => {
      const evanData = grouped[month];

      // Rapports pour ce mois
      const rapports = [];

      // Evangelisation
      const evanTotals = {
        hommes: 0,
        femmes: 0,
        jeunes: 0,
        enfants: 0,
        connectes: 0,
        nouveauxVenus: 0,
        nouveauxConvertis: 0,
        moissonneurs: 0
      };
      evanData.forEach(r => {
        if (r.sexe === "Homme") evanTotals.hommes++;
        if (r.sexe === "Femme") evanTotals.femmes++;
        if (r.type_conversion === "Nouveau converti") evanTotals.nouveauxConvertis++;
      });
      rapports.push({ label: "Evangelisation", data: evanTotals, border: "border-l-green-500" });

      // Serviteur
      const serviteurTotals = { hommes: 0, femmes: 0 };
      evanData.forEach(r => {
        if (r.star && ["Existant", "Nouveau"].includes(r.etat_contact)) {
          if (r.sexe === "Homme") serviteurTotals.hommes++;
          if (r.sexe === "Femme") serviteurTotals.femmes++;
        }
      });
      rapports.push({ label: "Serviteur", data: serviteurTotals, border: "border-l-pink-500" });

      return { month, rapports };
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
        <select
          value={typeRapport}
          onChange={(e) => setTypeRapport(e.target.value)}
          className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white"
        >
          <option className="text-black" value="Tous">Tous</option>
          <option className="text-black" value="Evangelisation">Evangelisation</option>
          <option className="text-black" value="Serviteur">Serviteur</option>
        </select>
        <button
          onClick={fetchStats}
          className="bg-[#2a2f85] px-6 py-2 rounded-xl hover:bg-[#1f2366]"
        >
          Générer
        </button>
      </div>

      {/* TABLE COLLAPSIBLE PAR MOIS */}
      {!loading && statsByMonth.length > 0 && (
        <div className="w-full max-w-full overflow-x-auto mt-6 scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-transparent">
          <div className="w-max space-y-2">
            {statsByMonth.map(({ month, rapports }) => {
              const isExpanded = collapsedMonths[month] ?? true;

              // Calcul total mois
              const totalMonth = rapports.reduce((acc, r) => {
                acc.hommes += r.data?.hommes || 0;
                acc.femmes += r.data?.femmes || 0;
                return acc;
              }, { hommes: 0, femmes: 0 });

              return (
                <div key={month} className="space-y-1">
                  {/* HEADER MOIS */}
                  <div
                    className="flex items-center px-4 py-2 rounded-lg bg-white/20 cursor-pointer border-l-4 border-l-blue-500"
                    onClick={() => toggleMonth(month)}
                  >
                    <div className="min-w-[200px] text-white font-semibold">
                      {isExpanded ? <ChevronUpIcon className="inline w-5 h-5 mr-1" /> : <ChevronDownIcon className="inline w-5 h-5 mr-1" />}
                      {month}
                    </div>
                    <div className="min-w-[200px]"></div>
                    <div className="min-w-[200px]"></div>
                    <div className="min-w-[120px] text-center text-white font-bold">{totalMonth.hommes}</div>
                    <div className="min-w-[120px] text-center text-white font-bold">{totalMonth.femmes}</div>
                    <div className="min-w-[120px] text-center text-orange-400 font-semibold">{totalMonth.hommes + totalMonth.femmes}</div>
                    <div className="min-w-[150px]"></div>
                  </div>

                  {/* LIGNES RAPPORTS */}
                  {isExpanded && rapports.map((r, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 transition border-l-4 ${r.border}`}
                    >
                      <div className="min-w-[180px] text-white font-semibold">{r.label}</div>
                      <div className="min-w-[120px] text-center text-white">{r.data?.hommes ?? "-"}</div>
                      <div className="min-w-[120px] text-center text-white">{r.data?.femmes ?? "-"}</div>
                      <div className="min-w-[120px] text-center text-white">{r.data?.jeunes ?? "-"}</div>
                      <div className="min-w-[120px] text-center text-white">{r.data?.enfants ?? "-"}</div>
                      <div className="min-w-[140px] text-center text-white">{r.data?.connectes ?? "-"}</div>
                      <div className="min-w-[150px] text-center text-white">{r.data?.nouveauxVenus ?? "-"}</div>
                      <div className="min-w-[180px] text-center text-white">{r.data?.nouveauxConvertis ?? "-"}</div>
                      <div className="min-w-[140px] text-center text-white">{r.data?.reconciliations ?? "-"}</div>
                      <div className="min-w-[160px] text-center text-white">{r.data?.moissonneurs ?? "-"}</div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
