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

    let evanQuery = supabase
      .from("evangelises")
      .select("*")
      .eq("eglise_id", egliseId)
      .eq("branche_id", brancheId);

    if (dateDebut) evanQuery = evanQuery.gte("created_at", dateDebut);
    if (dateFin) evanQuery = evanQuery.lte("created_at", dateFin);

    const { data } = await evanQuery;

    const grouped = {};

    data?.forEach((r) => {
      const month = new Date(r.created_at).toLocaleString("fr-FR", {
        month: "long",
        year: "numeric",
      });

      if (!grouped[month]) grouped[month] = [];
      grouped[month].push(r);
    });

    const monthsStats = Object.keys(grouped).map((month) => {
      const evanData = grouped[month];

      const evanTotals = { hommes: 0, femmes: 0 };
      const serviteurTotals = { hommes: 0, femmes: 0 };

      evanData.forEach((r) => {
        if (r.sexe === "Homme") evanTotals.hommes++;
        if (r.sexe === "Femme") evanTotals.femmes++;

        if (r.star && ["Existant", "Nouveau"].includes(r.etat_contact)) {
          if (r.sexe === "Homme") serviteurTotals.hommes++;
          if (r.sexe === "Femme") serviteurTotals.femmes++;
        }
      });

      return {
        month,
        rapports: [
          { label: "Evangelisation", data: evanTotals, border: "border-l-green-500" },
          { label: "Serviteur", data: serviteurTotals, border: "border-l-pink-500" },
        ],
      };
    });

    setStatsByMonth(monthsStats);
    setLoading(false);
  };

  const toggleMonth = (month) => {
    setCollapsedMonths((prev) => ({
      ...prev,
      [month]: !prev[month],
    }));
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-[#333699]">
      <HeaderPages />
      <h1 className="text-3xl font-bold text-white mt-4">
        Statistiques Globales
      </h1>

      <div className="bg-white/10 p-6 rounded-2xl shadow-lg mt-6 flex gap-4 flex-wrap text-white">
        <input type="date" value={dateDebut} onChange={(e) => setDateDebut(e.target.value)}
          className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white" />
        <input type="date" value={dateFin} onChange={(e) => setDateFin(e.target.value)}
          className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white" />
        <button onClick={fetchStats}
          className="bg-[#2a2f85] px-6 py-2 rounded-xl hover:bg-[#1f2366]">
          Générer
        </button>
      </div>

      {!loading && statsByMonth.length > 0 && (
        <div className="w-full max-w-full overflow-x-auto mt-6">
          <div className="w-max space-y-4">

            {statsByMonth.map((item) => {
              const mois = item.month;
        const isOpen = collapsedMonths[mois] ?? true;

              const totalGeneral = item.rapports.reduce(
                (acc, r) => {
                  acc.hommes += r.data.hommes || 0;
                  acc.femmes += r.data.femmes || 0;
                  return acc;
                },
                { hommes: 0, femmes: 0 }
              );

              return (
                <div key={mois}>

                  {/* HEADER MOIS */}
                  <div
                    onClick={() => toggleMonth(mois)}
                    className="flex items-center justify-between px-4 py-3 bg-white/10 rounded-lg cursor-pointer hover:bg-white/20"
                  >
                    <div className="font-semibold text-white capitalize">
                      {mois}
                    </div>

                    {isOpen ? (
                      <ChevronUpIcon size={20} className="text-white" />
                    ) : (
                      <ChevronDownIcon size={20} className="text-white" />
                    )}
                  </div>

                  {/* LIGNES */}
                  {isOpen && (
                    <div className="space-y-2 mt-2">

                      {item.rapports.map((r, idx) => (
                        <div key={idx}
                          className={`flex items-center px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 transition border-l-4 ${r.border}`}>
                          <div className="min-w-[180px] text-white font-semibold">{r.label}</div>
                          <div className="min-w-[120px] text-center text-white">{r.data.hommes}</div>
                          <div className="min-w-[120px] text-center text-white">{r.data.femmes}</div>
                          <div className="min-w-[120px] text-center text-white">-</div>
                          <div className="min-w-[120px] text-center text-white">-</div>
                          <div className="min-w-[140px] text-center text-white">-</div>
                          <div className="min-w-[150px] text-center text-white">-</div>
                          <div className="min-w-[180px] text-center text-white">-</div>
                          <div className="min-w-[140px] text-center text-white">-</div>
                          <div className="min-w-[160px] text-center text-white">-</div>
                        </div>
                      ))}

                      {/* TOTAL */}
                      <div className="flex items-center px-4 py-4 mt-1 rounded-xl bg-white/20 border-t border-white/40 font-bold">
                        <div className="min-w-[180px] text-orange-400 font-semibold uppercase ml-1">
                          TOTAL
                        </div>
                        <div className="min-w-[120px] text-center text-orange-400 font-semibold">
                          {totalGeneral.hommes}
                        </div>
                        <div className="min-w-[120px] text-center text-orange-400 font-semibold">
                          {totalGeneral.femmes}
                        </div>
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
