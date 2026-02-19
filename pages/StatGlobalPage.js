"use client";

import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import HeaderPages from "../components/HeaderPages";
import ProtectedRoute from "../components/ProtectedRoute";
import Footer from "../components/Footer";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";

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

  const [statsByMonth, setStatsByMonth] = useState([]);
  const [collapsedMonths, setCollapsedMonths] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
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
    let evanQuery = supabase
      .from("evangelises")
      .select("*")
      .eq("eglise_id", egliseId)
      .eq("branche_id", brancheId);

    if (dateDebut) evanQuery = evanQuery.gte("created_at", dateDebut);
    if (dateFin) evanQuery = evanQuery.lte("created_at", dateFin);

    const { data: evanData } = await evanQuery;

    let serviteurQuery = supabase
      .from("membres_complets")
      .select("*")
      .eq("eglise_id", egliseId)
      .eq("branche_id", brancheId)
      .eq("star", true)
      .in("etat_contact", ["Existant", "Nouveau"]);

    if (dateDebut) serviteurQuery = serviteurQuery.gte("created_at", dateDebut);
    if (dateFin) serviteurQuery = serviteurQuery.lte("created_at", dateFin);

    const { data: serviteurData } = await serviteurQuery;

    // ================= GROUPE PAR MOIS =================
    const grouped = {};

    // Evangelisation
    evanData?.forEach((r) => {
      const month = new Date(r.created_at).toLocaleString("fr-FR", {
        month: "long",
        year: "numeric",
      });
      if (!grouped[month]) grouped[month] = { Evangelisation: [], Serviteur: [] };
      grouped[month].Evangelisation.push(r);
    });

    // Serviteur
    serviteurData?.forEach((r) => {
      const month = new Date(r.created_at).toLocaleString("fr-FR", {
        month: "long",
        year: "numeric",
      });
      if (!grouped[month]) grouped[month] = { Evangelisation: [], Serviteur: [] };
      grouped[month].Serviteur.push(r);
    });

    // ================= CALCULE STAT PAR MOIS =================
    const monthsStats = Object.keys(grouped).map((month) => {
      const evan = grouped[month].Evangelisation;
      const serv = grouped[month].Serviteur;

      const evanTotals = {
        hommes: evan.filter((r) => r.sexe === "Homme").length,
        femmes: evan.filter((r) => r.sexe === "Femme").length,
      };

      const servTotals = {
        hommes: serv.filter((r) => r.sexe === "Homme").length,
        femmes: serv.filter((r) => r.sexe === "Femme").length,
      };

      return {
        month,
        rapports: [
          { label: "Evangelisation", data: evanTotals, border: "border-l-green-500" },
          { label: "Serviteur", data: servTotals, border: "border-l-yellow-500" },
        ],
      };
    });

    setStatsByMonth(monthsStats);
    setLoading(false);
  };

  const toggleMonth = (month) => {
    setCollapsedMonths((prev) => ({ ...prev, [month]: !prev[month] }));
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
        <button
          onClick={fetchStats}
          className="bg-[#2a2f85] px-6 py-2 rounded-xl hover:bg-[#1f2366]"
        >
          Générer
        </button>
      </div>

      {/* TABLE COLLAPSE */}
      {!loading && statsByMonth.length > 0 && (
        <div className="w-full max-w-full overflow-x-auto mt-6 scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-transparent">
          <div className="w-max space-y-2">
            {statsByMonth.map((monthData) => {
              const isCollapsed = collapsedMonths[monthData.month] ?? true;
              return (
                <div key={monthData.month}>
                  {/* HEADER MOIS */}
                  <div
                    className="flex items-center justify-between px-4 py-3 bg-white/10 rounded-lg cursor-pointer hover:bg-white/20"
                    onClick={() => toggleMonth(monthData.month)}
                  >
                    <div className="font-semibold text-white">{monthData.month}</div>
                    {isCollapsed ? (
                      <ChevronDownIcon className="w-5 h-5 text-white" />
                    ) : (
                      <ChevronUpIcon className="w-5 h-5 text-white" />
                    )}
                  </div>

                  {/* LIGNES DU MOIS */}
                  {!isCollapsed && (
                    <div className="space-y-2 mt-1">
                      {monthData.rapports.map((r, idx) => (
                        <div
                          key={idx}
                          className={`flex items-center px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 transition border-l-4 ${r.border}`}
                        >
                          <div className="min-w-[180px] text-white font-semibold">{r.label}</div>
                          <div className="min-w-[120px] text-center text-white">{r.data?.hommes ?? 0}</div>
                          <div className="min-w-[120px] text-center text-white">{r.data?.femmes ?? 0}</div>
                          <div className="min-w-[120px] text-center text-white">-</div>
                          <div className="min-w-[120px] text-center text-white">-</div>
                          <div className="min-w-[140px] text-center text-white">-</div>
                          <div className="min-w-[150px] text-center text-white">-</div>
                          <div className="min-w-[180px] text-center text-white">-</div>
                          <div className="min-w-[140px] text-center text-white">-</div>
                          <div className="min-w-[160px] text-center text-white">-</div>
                        </div>
                      ))}

                      {/* TOTAL DU MOIS */}
                      <div className="flex items-center px-4 py-4 mt-1 rounded-xl bg-white/20 border-t border-white/40 font-bold">
                        <div className="min-w-[180px] text-orange-400 font-semibold uppercase ml-1">
                          TOTAL
                        </div>
                        {["hommes","femmes"].map((k) => {
                          const total = monthData.rapports.reduce((acc,r) => acc + (r.data?.[k]||0),0);
                          return (
                            <div
                              key={k}
                              className="min-w-[120px] text-center text-orange-400 font-semibold"
                            >
                              {total}
                            </div>
                          );
                        })}
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
      )}

      <Footer />
    </div>
  );
}
