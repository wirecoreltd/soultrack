"use client";

import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import HeaderPages from "../components/HeaderPages";
import Footer from "../components/Footer";
import ProtectedRoute from "../components/ProtectedRoute";

export default function StatGlobalPage() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur", "ResponsableIntegration", "ResponsableEvangelisation"]}>
      <StatGlobal />
    </ProtectedRoute>
  );
}

function StatGlobal() {
  const [loading, setLoading] = useState(false);
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [stats, setStats] = useState(null);
  const [superviseur, setSuperviseur] = useState({ eglise_id: null, branche_id: null });

  // 🔹 Charger l’église/branche du superviseur connecté
  useEffect(() => {
    const loadSuperviseur = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("eglise_id, branche_id")
        .eq("id", user.id)
        .single();

      if (!error) setSuperviseur({ eglise_id: data.eglise_id, branche_id: data.branche_id });
    };
    loadSuperviseur();
  }, []);

  // 🔹 Charger les stats quand dateDebut/dateFin changent
  useEffect(() => {
    if (!dateDebut || !dateFin) return;
    if (!superviseur.eglise_id) return;

    const fetchStats = async () => {
      setLoading(true);

      // 🔹 Attendance
      const { data: attData } = await supabase
        .from("attendance")
        .select("hommes, femmes, jeunes, enfants, connectes, nouveauxConvertis")
        .gte("date", dateDebut)
        .lte("date", dateFin)
        .eq("eglise_id", superviseur.eglise_id)
        .eq("branche_id", superviseur.branche_id);

      // 🔹 Évangélisation
      const { data: evangData } = await supabase
        .from("rapport_evangelisation")
        .select("hommes, femmes, priere, nouveau_converti, reconciliation, moissonneurs")
        .gte("date", dateDebut)
        .lte("date", dateFin)
        .eq("eglise_id", superviseur.eglise_id)
        .eq("branche_id", superviseur.branche_id);

      // 🔹 Serviteurs
      const { data: serviteurs } = await supabase
        .from("membres_complets")
        .select("id, ministere")
        .eq("star", true)
        .eq("eglise_id", superviseur.eglise_id)
        .eq("branche_id", superviseur.branche_id);

      // 🔹 Totaux
      const sumAttendance = attData?.reduce((acc, r) => {
        acc.hommes += r.hommes || 0;
        acc.femmes += r.femmes || 0;
        acc.jeunes += r.jeunes || 0;
        acc.enfants += r.enfants || 0;
        acc.connectes += r.connectes || 0;
        acc.nouveauxConvertis += r.nouveauxConvertis || 0;
        return acc;
      }, { hommes:0, femmes:0, jeunes:0, enfants:0, connectes:0, nouveauxConvertis:0 });

      const sumEvang = evangData?.reduce((acc, r) => {
        acc.hommes += r.hommes || 0;
        acc.femmes += r.femmes || 0;
        acc.priere += r.priere || 0;
        acc.nouveau_converti += r.nouveau_converti || 0;
        acc.reconciliation += r.reconciliation || 0;
        acc.moissonneurs += r.moissonneurs || 0;
        return acc;
      }, { hommes:0, femmes:0, priere:0, nouveau_converti:0, reconciliation:0, moissonneurs:0 });

      // 🔹 Serviteurs par ministère
      const servParMinistere = {};
      serviteurs?.forEach(s => {
        if (!s.ministere) return;
        servParMinistere[s.ministere] = (servParMinistere[s.ministere] || 0) + 1;
      });

      setStats({ sumAttendance, sumEvang, totalServiteurs: serviteurs?.length || 0, servParMinistere });

      setLoading(false);
    };

    fetchStats();
  }, [dateDebut, dateFin, superviseur]);

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-[#333699] text-white">
      <HeaderPages />

      <h1 className="text-3xl font-bold mb-4">Statistiques Globales</h1>

      <div className="mb-6 flex gap-4">
        <div>
          <label className="font-semibold mr-2">Date de début :</label>
          <input type="date" value={dateDebut} onChange={e=>setDateDebut(e.target.value)} className="rounded-xl px-3 py-2 text-black"/>
        </div>
        <div>
          <label className="font-semibold mr-2">Date de fin :</label>
          <input type="date" value={dateFin} onChange={e=>setDateFin(e.target.value)} className="rounded-xl px-3 py-2 text-black"/>
        </div>
      </div>

      {loading && <p>Chargement...</p>}

      {stats && !loading && (
        <div className="max-w-7xl w-full overflow-x-auto">
          <table className="min-w-full bg-white text-black rounded-2xl shadow-lg overflow-hidden">
            <thead className="bg-purple-600 text-white text-center">
              <tr>
                <th className="py-3 px-4 text-left">Statistique</th>
                <th colSpan={6}>Attendance</th>
                <th colSpan={6}>Évangélisation</th>
              </tr>
              <tr className="bg-purple-500 text-white text-center">
                <th></th>
                <th>Hommes</th>
                <th>Femmes</th>
                <th>Jeunes</th>
                <th>Enfants</th>
                <th>Connectés</th>
                <th>Nouveaux convertis</th>
                <th>Hommes</th>
                <th>Femmes</th>
                <th>Prières</th>
                <th>Nouveaux convertis</th>
                <th>Réconciliations</th>
                <th>Moissonneurs</th>
              </tr>
            </thead>
            <tbody>
              <tr className="text-center border-b hover:bg-gray-100 transition-all bg-white/90">
                <td className="py-2 px-4 font-medium">Totaux</td>
                <td>{stats.sumAttendance.hommes}</td>
                <td>{stats.sumAttendance.femmes}</td>
                <td>{stats.sumAttendance.jeunes}</td>
                <td>{stats.sumAttendance.enfants}</td>
                <td>{stats.sumAttendance.connectes}</td>
                <td>{stats.sumAttendance.nouveauxConvertis}</td>
                <td>{stats.sumEvang.hommes}</td>
                <td>{stats.sumEvang.femmes}</td>
                <td>{stats.sumEvang.priere}</td>
                <td>{stats.sumEvang.nouveau_converti}</td>
                <td>{stats.sumEvang.reconciliation}</td>
                <td>{stats.sumEvang.moissonneurs}</td>
              </tr>
              <tr className="text-center border-b hover:bg-gray-100 transition-all bg-white/90">
                <td className="py-2 px-4 font-medium">Serviteurs</td>
                <td colSpan={12}>{stats.totalServiteurs}</td>
              </tr>
              {Object.entries(stats.servParMinistere).map(([ministere, count]) => (
                <tr key={ministere} className="text-center border-b hover:bg-gray-100 transition-all bg-white/90">
                  <td className="py-2 px-4 font-medium">{ministere}</td>
                  <td colSpan={12}>{count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!stats && !loading && <p className="mt-6 text-white/80 text-center">Sélectionnez une plage de dates pour afficher les statistiques.</p>}

      <Footer />
    </div>
  );
}
