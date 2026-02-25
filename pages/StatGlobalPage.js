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
  const [typeRapport, setTypeRapport] = useState("Tous");
  const [userBrancheId, setUserBrancheId] = useState(null);
  const [branchIds, setBranchIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [attendanceByBranch, setAttendanceByBranch] = useState({});

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

  // 🔹 Récupérer les stats Attendance
  const fetchStats = async () => {
    if (!branchIds.length) return;
    setLoading(true);

    const { data: attendanceData } = await supabase
      .from("attendance")
      .select(`
        *,
        branches:branches(nom)
      `)
      .in("branche_id", branchIds)
      .gte(dateDebut ? "date" : null, dateDebut || undefined)
      .lte(dateFin ? "date" : null, dateFin || undefined)
      .order("date", { ascending: true });

    // Grouper par branche
    const grouped = {};
    attendanceData?.forEach(r => {
      const brancheNom = r.branches?.nom || r.branche_id;
      if (!grouped[brancheNom]) grouped[brancheNom] = { cultes: [] };
      grouped[brancheNom].cultes.push({
        numero: r.numero_culte,
        hommes: r.hommes,
        femmes: r.femmes,
        jeunes: r.jeunes,
        enfants: r.enfants,
        connectes: r.connectes,
        nouveauxVenus: r.nouveauxVenus,
        nouveauxConvertis: r.nouveauxConvertis,
        moissonneurs: r.moissonneurs,
      });
    });

    setAttendanceByBranch(grouped);
    setLoading(false);
  };

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
        <select value={typeRapport} onChange={(e) => setTypeRapport(e.target.value)} className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white">
          <option value="Tous" className="text-black">Tous</option>
          <option value="Culte" className="text-black">Culte</option>
        </select>
        <button onClick={fetchStats} className="bg-[#2a2f85] px-6 py-2 rounded-xl hover:bg-[#1f2366]">Générer</button>
      </div>

      {/* RAPPORT Attendance par Branche */}
      {!loading && Object.keys(attendanceByBranch).length > 0 && (
        <div className="w-full max-w-full overflow-x-auto mt-6 scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-transparent space-y-4">
          {Object.entries(attendanceByBranch).map(([brancheNom, branch]) => (
            <div key={brancheNom} className="bg-white/10 rounded-xl p-4">
              <div className="font-bold text-lg text-white mb-2">{brancheNom}</div>
              {branch.cultes.map((c, idx) => (
                <div key={idx} className="text-white pl-6 py-1">
                  Culte {c.numero} : {c.hommes} {c.femmes} {c.jeunes} {c.enfants} {c.connectes} {c.nouveauxVenus} {c.nouveauxConvertis} {c.moissonneurs}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {loading && <div className="text-white mt-6">Chargement des statistiques...</div>}

      <Footer />
    </div>
  );
}
