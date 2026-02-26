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
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [branches, setBranches] = useState([]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("attendance_stats")
        .select("*")
        .gte("mois", startDate || undefined)
        .lte("mois", endDate || undefined);

      if (error) {
        console.error(error);
        setBranches([]);
        return;
      }

      if (!data) {
        setBranches([]);
        return;
      }

      // Fusion des doublons par nom de branche
      const grouped = {};
      data.forEach((item) => {
        const key = item.branche_nom.trim().toLowerCase();
        if (!grouped[key]) {
          grouped[key] = {
            branche_id: item.branche_id,
            branche_nom: item.branche_nom,
            eglise_nom: item.eglis_nom || "",
            superviseur_id: item.superviseur_id,
            culte: 0,
            hommes: 0,
            femmes: 0,
            jeunes: 0,
            total_hfj: 0,
            enfants: 0,
            connectes: 0,
            nouveaux_venus: 0,
            nouveau_converti: 0,
            moissonneurs: 0,
          };
        }
        grouped[key].culte += item.culte || 0;
        grouped[key].hommes += item.hommes || 0;
        grouped[key].femmes += item.femmes || 0;
        grouped[key].jeunes += item.jeunes || 0;
        grouped[key].total_hfj += item.total_hfj || 0;
        grouped[key].enfants += item.enfants || 0;
        grouped[key].connectes += item.connectes || 0;
        grouped[key].nouveaux_venus += item.nouveaux_venus || 0;
        grouped[key].nouveau_converti += item.nouveau_converti || 0;
        grouped[key].moissonneurs += item.moissonneurs || 0;
      });

      const filtered = Object.values(grouped).filter((b) => {
        const total =
          b.culte +
          b.hommes +
          b.femmes +
          b.jeunes +
          b.total_hfj +
          b.enfants +
          b.connectes +
          b.nouveaux_venus +
          b.nouveau_converti +
          b.moissonneurs;
        if (total === 0) return false;
        if (b.branche_nom.toLowerCase() === "eglise principale" && !b.superviseur_id)
          return false;
        return true;
      });

      setBranches(filtered.sort((a, b) => a.branche_nom.localeCompare(b.branche_nom)));
    } catch (err) {
      console.error(err);
      setBranches([]);
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

      <div className="bg-white/10 p-6 rounded-2xl shadow-lg mt-6 flex gap-4 flex-wrap text-white">
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white"
        />
        <button
          onClick={fetchStats}
          className="bg-[#2a2f85] px-6 py-2 rounded-xl hover:bg-[#1f2366]"
        >
          Générer
        </button>
      </div>

      {!loading && branches.length > 0 && (
        <div className="w-full max-w-full overflow-x-auto mt-6 scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-transparent">
          <div className="w-max space-y-2">
            {/* HEADER */}
            <div className="flex font-semibold uppercase text-white px-4 py-3 border-b border-white/30 bg-white/5 rounded-t-xl whitespace-nowrap">
              <div className="min-w-[200px]">Branche</div>
              <div className="min-w-[120px] text-center">Culte</div>
              <div className="min-w-[120px] text-center">Hommes</div>
              <div className="min-w-[120px] text-center">Femmes</div>
              <div className="min-w-[120px] text-center">Jeunes</div>
              <div className="min-w-[120px] text-center">Total HFJ</div>
              <div className="min-w-[120px] text-center">Enfants</div>
              <div className="min-w-[140px] text-center">Connectés</div>
              <div className="min-w-[150px] text-center">Nouveaux</div>
              <div className="min-w-[180px] text-center">Convertis</div>
              <div className="min-w-[160px] text-center">Moissonneurs</div>
            </div>

            {branches.map((b) => (
              <div
                key={b.branche_id}
                className="flex items-center px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 transition border-l-4 border-blue-400"
              >
                <div className="min-w-[200px] text-white font-semibold">
                  {b.branche_nom} {b.eglis_nom && `(${b.eglis_nom})`}
                </div>
                <div className="min-w-[120px] text-center text-white">{b.culte}</div>
                <div className="min-w-[120px] text-center text-white">{b.hommes}</div>
                <div className="min-w-[120px] text-center text-white">{b.femmes}</div>
                <div className="min-w-[120px] text-center text-white">{b.jeunes}</div>
                <div className="min-w-[120px] text-center text-white">{b.total_hfj}</div>
                <div className="min-w-[120px] text-center text-white">{b.enfants}</div>
                <div className="min-w-[140px] text-center text-white">{b.connectes}</div>
                <div className="min-w-[150px] text-center text-white">{b.nouveaux_venus}</div>
                <div className="min-w-[180px] text-center text-white">{b.nouveau_converti}</div>
                <div className="min-w-[160px] text-center text-white">{b.moissonneurs}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
