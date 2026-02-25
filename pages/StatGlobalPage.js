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
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState([]);

  // Récupérer les stats depuis la view
  const fetchStats = async () => {
    if (!dateDebut || !dateFin) return;
    setLoading(true);

    const { data, error } = await supabase
      .from("attendance_stats")
      .select("*")
      .gte("mois", dateDebut)
      .lte("mois", dateFin)
      .order("branche_nom", { ascending: true });

    if (error) {
      console.error("Erreur fetch stats:", error);
      setStats([]);
    } else {
      // filtrer branches null ou indésirables
      const filtered = data.filter(
        (d) => d.branche_nom && d.branche_nom !== "Eglise Principale"
      );
      setStats(filtered);
    }

    setLoading(false);
  };

  // Calcul total général
  const totalGeneral = stats.reduce(
    (tot, r) => ({
      hommes: tot.hommes + (r.hommes || 0),
      femmes: tot.femmes + (r.femmes || 0),
      jeunes: tot.jeunes + (r.jeunes || 0),
      total_hfj: tot.total_hfj + (r.total_hfj || 0),
      enfants: tot.enfants + (r.enfants || 0),
      connectes: tot.connectes + (r.connectes || 0),
      nouveauxVenus: tot.nouveauxVenus + (r.nouveauxVenus || 0),
      nouveauxConvertis: tot.nouveauxConvertis + (r.nouveauxConvertis || 0),
      moissonneurs: tot.moissonneurs + (r.moissonneurs || 0),
    }),
    {
      hommes: 0,
      femmes: 0,
      jeunes: 0,
      total_hfj: 0,
      enfants: 0,
      connectes: 0,
      nouveauxVenus: 0,
      nouveauxConvertis: 0,
      moissonneurs: 0,
    }
  );

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-[#333699]">
      <HeaderPages />
      <h1 className="text-2xl font-bold mt-4 mb-6 text-center text-white">
        Rapport <span className="text-amber-300">Statistiques Globales</span>
      </h1>

      {/* FILTRE */}
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
          Filtrer
        </button>
      </div>

      {/* TABLE */}
      {!loading && stats.length > 0 && (
        <div className="w-full max-w-full overflow-x-auto mt-6 scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-transparent">
          <div className="w-max space-y-4">
            {stats.map((r, idx) => (
              <div key={idx} className="space-y-1">
                {/* Branche */}
                <div className="text-lg font-bold text-white">
                  {r.branche_nom}
                </div>

                {/* Table Header */}
                <div className="flex font-semibold uppercase text-white px-4 py-2 border-b border-white/30 bg-white/5 rounded-t-xl whitespace-nowrap">
                  <div className="min-w-[180px]">Ministère</div>
                  <div className="min-w-[100px] text-center">Hommes</div>
                  <div className="min-w-[100px] text-center">Femmes</div>
                  <div className="min-w-[100px] text-center">Jeunes</div>
                  <div className="min-w-[120px] text-center">Total HFJ</div>
                  <div className="min-w-[100px] text-center">Enfants</div>
                  <div className="min-w-[120px] text-center">Connectés</div>
                  <div className="min-w-[140px] text-center">Nouveaux Venus</div>
                  <div className="min-w-[140px] text-center">Nouveau Converti</div>
                  <div className="min-w-[120px] text-center">Moissonneurs</div>
                </div>

                {/* Ligne Culte */}
                <div className="flex items-center px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 transition">
                  <div className="min-w-[180px] font-semibold text-white">Culte</div>
                  <div className="min-w-[100px] text-center text-white">{r.hommes}</div>
                  <div className="min-w-[100px] text-center text-white">{r.femmes}</div>
                  <div className="min-w-[100px] text-center text-white">{r.jeunes}</div>
                  <div className="min-w-[120px] text-center text-white">{r.total_hfj}</div>
                  <div className="min-w-[100px] text-center text-white">{r.enfants}</div>
                  <div className="min-w-[120px] text-center text-white">{r.connectes}</div>
                  <div className="min-w-[140px] text-center text-white">{r.nouveauxVenus}</div>
                  <div className="min-w-[140px] text-center text-white">{r.nouveauxConvertis}</div>
                  <div className="min-w-[120px] text-center text-white">{r.moissonneurs}</div>
                </div>
              </div>
            ))}

            {/* TOTAL GENERAL */}
            <div className="flex items-center px-4 py-4 mt-4 rounded-xl bg-white/20 border-t border-white/40 font-bold">
              <div className="min-w-[180px] text-orange-400 font-semibold uppercase">
                TOTAL
              </div>
              <div className="min-w-[100px] text-center text-orange-400 font-semibold">
                {totalGeneral.hommes}
              </div>
              <div className="min-w-[100px] text-center text-orange-400 font-semibold">
                {totalGeneral.femmes}
              </div>
              <div className="min-w-[100px] text-center text-orange-400 font-semibold">
                {totalGeneral.jeunes}
              </div>
              <div className="min-w-[120px] text-center text-orange-400 font-semibold">
                {totalGeneral.total_hfj}
              </div>
              <div className="min-w-[100px] text-center text-orange-400 font-semibold">
                {totalGeneral.enfants}
              </div>
              <div className="min-w-[120px] text-center text-orange-400 font-semibold">
                {totalGeneral.connectes}
              </div>
              <div className="min-w-[140px] text-center text-orange-400 font-semibold">
                {totalGeneral.nouveauxVenus}
              </div>
              <div className="min-w-[140px] text-center text-orange-400 font-semibold">
                {totalGeneral.nouveauxConvertis}
              </div>
              <div className="min-w-[120px] text-center text-orange-400 font-semibold">
                {totalGeneral.moissonneurs}
              </div>
            </div>
          </div>
        </div>
      )}

      {!loading && stats.length === 0 && (
        <div className="text-white mt-8 text-center">
          Aucune donnée trouvée pour cette période.
        </div>
      )}

      {loading && (
        <div className="text-white mt-8 text-center">Chargement...</div>
      )}

      <Footer />
    </div>
  );
}
