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
  const [loading, setLoading] = useState(false);
  const [eglises, setEglises] = useState([]);
  const [statsParEglise, setStatsParEglise] = useState({});

  const [userBrancheId, setUserBrancheId] = useState(null);

  // 🔹 Récupérer la branche de l'utilisateur
  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("branche_id")
        .eq("id", user.id)
        .single();

      if (data?.branche_id) setUserBrancheId(data.branche_id);
    };
    fetchProfile();
  }, []);

  // 🔹 Récupérer les églises supervisées
  const fetchEglises = async () => {
    if (!userBrancheId) return;

    // toutes les églises dont parent_eglise_id = branche de l'utilisateur
    const { data } = await supabase
      .from("eglises")
      .select("id, nom, pays")
      .eq("parent_eglise_id", userBrancheId);

    setEglises(data || []);
  };

  useEffect(() => { fetchEglises(); }, [userBrancheId]);

  // 🔹 Récupérer les stats
  const fetchStats = async () => {
    if (!eglises.length) return;
    setLoading(true);

    const statsTemp = {};

    for (const eglise of eglises) {
      const brancheIds = [eglise.id];

      // ATTENDANCE
      const { data: attendanceData } = await supabase
        .from("attendance")
        .select("hommes,femmes,enfants,visiteurs,baptemes")
        .in("branche_id", brancheIds)
        .gte(dateDebut ? "date" : null, dateDebut || undefined)
        .lte(dateFin ? "date" : null, dateFin || undefined);

      const attendanceTotals = attendanceData?.reduce((tot, r) => ({
        hommes: tot.hommes + (r.hommes || 0),
        femmes: tot.femmes + (r.femmes || 0),
        enfants: tot.enfants + (r.enfants || 0),
        visiteurs: tot.visiteurs + (r.visiteurs || 0),
        baptêmes: tot.baptemes + (r.baptemes || 0),
      }), { hommes:0,femmes:0,enfants:0,visiteurs:0,baptêmes:0 }) || { hommes:0,femmes:0,enfants:0,visiteurs:0,baptêmes:0 };

      // EVANGELISATION
      const { data: evanData } = await supabase
        .from("evangelises")
        .select("hommes,femmes,enfants,visiteurs,baptemes")
        .in("branche_id", brancheIds)
        .gte(dateDebut ? "created_at" : null, dateDebut || undefined)
        .lte(dateFin ? "created_at" : null, dateFin || undefined);

      const evanTotals = evanData?.reduce((tot, r) => ({
        hommes: tot.hommes + (r.hommes || 0),
        femmes: tot.femmes + (r.femmes || 0),
        enfants: tot.enfants + (r.enfants || 0),
        visiteurs: tot.visiteurs + (r.visiteurs || 0),
        baptêmes: tot.baptemes + (r.baptemes || 0),
      }), { hommes:0,femmes:0,enfants:0,visiteurs:0,baptêmes:0 }) || { hommes:0,femmes:0,enfants:0,visiteurs:0,baptêmes:0 };

      // BAPTÊME
      const { data: baptemeData } = await supabase
        .from("baptemes")
        .select("hommes,femmes,enfants,visiteurs,baptemes")
        .in("branche_id", brancheIds)
        .gte(dateDebut ? "date" : null, dateDebut || undefined)
        .lte(dateFin ? "date" : null, dateFin || undefined);

      const baptemeTotals = baptemeData?.reduce((tot, r) => ({
        hommes: tot.hommes + (r.hommes || 0),
        femmes: tot.femmes + (r.femmes || 0),
        enfants: tot.enfants + (r.enfants || 0),
        visiteurs: tot.visiteurs + (r.visiteurs || 0),
        baptêmes: tot.baptemes + (r.baptemes || 0),
      }), { hommes:0,femmes:0,enfants:0,visiteurs:0,baptêmes:0 }) || { hommes:0,femmes:0,enfants:0,visiteurs:0,baptêmes:0 };

      statsTemp[eglise.id] = {
        nom: eglise.nom,
        pays: eglise.pays,
        Culte: attendanceTotals,
        Evangelisation: evanTotals,
        Bapteme: baptemeTotals
      };
    }

    setStatsParEglise(statsTemp);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-[#333699] text-white">
      <HeaderPages />
      <h1 className="text-2xl font-bold mt-4 mb-6 text-center">
        Rapport <span className="text-amber-300">Statistiques Églises Supervisées</span>
      </h1>

      {/* FILTRES */}
      <div className="bg-white/10 p-6 rounded-2xl shadow-lg mt-6 flex gap-4 flex-wrap text-white">
        <input type="date" value={dateDebut} onChange={e => setDateDebut(e.target.value)} className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white"/>
        <input type="date" value={dateFin} onChange={e => setDateFin(e.target.value)} className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white"/>
        <button onClick={fetchStats} className="bg-[#2a2f85] px-6 py-2 rounded-xl hover:bg-[#1f2366]">Générer</button>
      </div>

      {loading && <div className="mt-6 text-white">Chargement...</div>}

      {/* RAPPORT */}
      {!loading && Object.keys(statsParEglise).length > 0 && Object.values(statsParEglise).map((eglise, idx) => (
        <div key={idx} className="w-full max-w-5xl mt-6 p-4 bg-white/10 rounded-2xl">
          <h2 className="text-xl font-bold mb-2">{eglise.nom} - {eglise.pays}</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-white border-collapse">
              <thead>
                <tr className="border-b border-white/30">
                  <th className="px-3 py-2 text-left">Ministère</th>
                  <th className="px-3 py-2 text-center">Hommes</th>
                  <th className="px-3 py-2 text-center">Femmes</th>
                  <th className="px-3 py-2 text-center">Enfants</th>
                  <th className="px-3 py-2 text-center">Visiteurs</th>
                  <th className="px-3 py-2 text-center">Baptêmes</th>
                  <th className="px-3 py-2 text-center">Total</th>
                </tr>
              </thead>
              <tbody>
                {["Culte","Evangelisation","Bapteme"].map(min => {
                  const d = eglise[min];
                  const total = (d.hommes||0)+(d.femmes||0)+(d.enfants||0)+(d.visiteurs||0)+(d.baptêmes||0);
                  return (
                    <tr key={min} className="border-b border-white/20 hover:bg-white/10">
                      <td className="px-3 py-2">{min}</td>
                      <td className="px-3 py-2 text-center">{d.hommes}</td>
                      <td className="px-3 py-2 text-center">{d.femmes}</td>
                      <td className="px-3 py-2 text-center">{d.enfants}</td>
                      <td className="px-3 py-2 text-center">{d.visiteurs}</td>
                      <td className="px-3 py-2 text-center">{d.baptêmes}</td>
                      <td className="px-3 py-2 text-center font-bold">{total}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      <Footer />
    </div>
  );
}
