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

      {/* COLLAPSE PAR MOIS */}
      <div className="w-full max-w-full mt-6">
        {statsByMonth.map(({ month, stats }) => {
          const collapsed = collapsedMonths[month];
          const totalGeneral = stats.reduce((acc, r) => {
            acc.hommes += r.data?.hommes || 0;
            acc.femmes += r.data?.femmes || 0;
            return acc;
          }, { hommes: 0, femmes: 0 });

          return (
            <div key={month} className="mb-4 bg-white/10 rounded-2xl">
              {/* HEADER MOIS */}
              <div
                className="flex justify-between items-center px-6 py-3 cursor-pointer font-semibold text-white border-b border-white/30"
                onClick={() => toggleMonth(month)}
              >
                <span>{month}</span>
                {collapsed ? <ChevronUpIcon className="w-5 h-5"/> : <ChevronDownIcon className="w-5 h-5"/>}
              </div>

              {/* CONTENU COLLAPSIBLE */}
              {collapsed && (
                <div className="px-4 py-3 space-y-2">
                  {stats.map((r, idx) => (
                    <div key={idx} className={`flex items-center px-4 py-3 rounded-lg bg-white/10 border-l-4 ${r.border}`}>
                      <div className="min-w-[180px] text-white font-semibold">{r.label}</div>
                      <div className="min-w-[120px] text-center text-white">{r.data?.hommes ?? "-"}</div>
                      <div className="min-w-[120px] text-center text-white">{r.data?.femmes ?? "-"}</div>
                    </div>
                  ))}

                  {/* TOTAL MOIS */}
                  <div className="flex items-center px-4 py-3 mt-2 rounded-lg bg-white/20 border-t border-white/40 font-bold">
                    <div className="min-w-[180px] text-orange-400 font-semibold">TOTAL</div>
                    <div className="min-w-[120px] text-center text-orange-400 font-semibold">{totalGeneral.hommes}</div>
                    <div className="min-w-[120px] text-center text-orange-400 font-semibold">{totalGeneral.femmes}</div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Footer />
    </div>
  );
}
