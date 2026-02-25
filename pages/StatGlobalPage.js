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
  const [userBrancheId, setUserBrancheId] = useState(null);
  const [branchIds, setBranchIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [attendanceStats, setAttendanceStats] = useState({}); // groupé par branche

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

      if (data?.branche_id) {
        setUserBrancheId(data.branche_id);
        setBranchIds([data.branche_id]);
      }
    };
    fetchProfile();
  }, []);

  // 🔹 Récupérer les données Attendance
  const fetchAttendance = async () => {
    if (!branchIds.length) return;
    setLoading(true);

    let query = supabase
      .from("attendance")
      .select("*, branches:branches(nom)")
      .in("branche_id", branchIds)
      .order("date", { ascending: true });

    if (dateDebut) query = query.gte("date", dateDebut);
    if (dateFin) query = query.lte("date", dateFin);

    const { data, error } = await query;
    if (error) console.error(error);

    // Grouper par branche
    const grouped = {};
    data?.forEach(r => {
      const brancheNom = r.branches?.nom || r.branche_id;
      if (!grouped[brancheNom]) grouped[brancheNom] = [];
      grouped[brancheNom].push(r);
    });

    setAttendanceStats(grouped);
    setLoading(false);
  };

  // 🔹 Calcul du total général
  const totalGeneral = Object.values(attendanceStats).flat().reduce(
    (tot, r) => ({
      hommes: tot.hommes + Number(r.hommes || 0),
      femmes: tot.femmes + Number(r.femmes || 0),
      jeunes: tot.jeunes + Number(r.jeunes || 0),
      enfants: tot.enfants + Number(r.enfants || 0),
      connectes: tot.connectes + Number(r.connectes || 0),
      nouveauxVenus: tot.nouveauxVenus + Number(r.nouveauxVenus || 0),
      nouveauxConvertis: tot.nouveauxConvertis + Number(r.nouveauxConvertis || 0),
      moissonneurs: tot.moissonneurs + Number(r.moissonneurs || 0),
    }),
    { hommes: 0, femmes: 0, jeunes: 0, enfants: 0, connectes: 0, nouveauxVenus: 0, nouveauxConvertis: 0, moissonneurs: 0 }
  );

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-[#333699]">
      <HeaderPages />
      <h1 className="text-2xl font-bold mt-4 mb-6 text-center text-white">
        Rapport <span className="text-amber-300">Statistiques Globales</span>
      </h1>

      {/* FILTRES */}
      <div className="bg-white/10 p-6 rounded-2xl shadow-lg mt-6 flex gap-4 flex-wrap text-white">
        <input type="date" value={dateDebut} onChange={(e) => setDateDebut(e.target.value)} className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white" />
        <input type="date" value={dateFin} onChange={(e) => setDateFin(e.target.value)} className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white" />
        <button onClick={fetchAttendance} className="bg-[#2a2f85] px-6 py-2 rounded-xl hover:bg-[#1f2366]">Générer</button>
      </div>

      {/* TABLE Attendance */}
      {!loading && Object.keys(attendanceStats).length > 0 && (
        <div className="w-full max-w-4xl mt-6 space-y-4">
          {Object.keys(attendanceStats).map((branche, idx) => (
            <div key={idx} className="bg-white/10 p-4 rounded-xl text-white">
              <div className="font-bold text-lg mb-2">{branche}</div>
              {attendanceStats[branche].map((r, j) => (
                <div key={j} className="flex flex-wrap gap-4 text-sm mb-1">
                  <div className="w-32 font-semibold">Culte {r.numero_culte}</div>
                  <div>Hommes: {r.hommes}</div>
                  <div>Femmes: {r.femmes}</div>
                  <div>Jeunes: {r.jeunes}</div>
                  <div>Enfants: {r.enfants}</div>
                  <div>Connectés: {r.connectes}</div>
                  <div>Nouveaux Venus: {r.nouveauxVenus}</div>
                  <div>Nouveau Converti: {r.nouveauxConvertis}</div>
                  <div>Moissonneurs: {r.moissonneurs}</div>
                </div>
              ))}
            </div>
          ))}

          {/* TOTAL GENERAL */}
          <div className="bg-white/20 p-4 rounded-xl font-bold text-orange-400">
            <div className="mb-2">TOTAL GENERAL</div>
            <div className="flex flex-wrap gap-4 text-sm">
              <div>Hommes: {totalGeneral.hommes}</div>
              <div>Femmes: {totalGeneral.femmes}</div>
              <div>Jeunes: {totalGeneral.jeunes}</div>
              <div>Enfants: {totalGeneral.enfants}</div>
              <div>Connectés: {totalGeneral.connectes}</div>
              <div>Nouveaux Venus: {totalGeneral.nouveauxVenus}</div>
              <div>Nouveau Converti: {totalGeneral.nouveauxConvertis}</div>
              <div>Moissonneurs: {totalGeneral.moissonneurs}</div>
            </div>
          </div>
        </div>
      )}

      {loading && <div className="text-white mt-6">Chargement...</div>}
      <Footer />
    </div>
  );
}
