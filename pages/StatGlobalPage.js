"use client";

import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import HeaderPages from "../components/HeaderPages";
import ProtectedRoute from "../components/ProtectedRoute";
import Footer from "../components/Footer";
import { Line, Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

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

  const [egliseId, setEgliseId] = useState(null);
  const [brancheId, setBrancheId] = useState(null);

  const [attendanceData, setAttendanceData] = useState([]);
  const [evanData, setEvanData] = useState([]);
  const [baptemeData, setBaptemeData] = useState([]);
  const [formationData, setFormationData] = useState([]);
  const [cellulesCount, setCellulesCount] = useState(0);

  const [attendanceStats, setAttendanceStats] = useState(null);
  const [evanStatsAgg, setEvanStatsAgg] = useState(null);
  const [baptemeStatsAgg, setBaptemeStatsAgg] = useState(0);
  const [formationStatsAgg, setFormationStatsAgg] = useState(0);

  const [loading, setLoading] = useState(false);

  // 🔹 Récupérer eglise et branche
  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("profiles")
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

    // -----------------------------
    // Culte
    // -----------------------------
    let attendanceQuery = supabase
      .from("attendance")
      .select("*")
      .eq("eglise_id", egliseId)
      .eq("branche_id", brancheId);
    if (dateDebut) attendanceQuery = attendanceQuery.gte("date", dateDebut);
    if (dateFin) attendanceQuery = attendanceQuery.lte("date", dateFin);
    const { data: attendance } = await attendanceQuery;
    setAttendanceData(attendance || []);

    const totalAttendance = attendance?.reduce(
      (sum, r) =>
        sum +
        (Number(r.hommes) || 0) +
        (Number(r.femmes) || 0),
      0
    );
    setAttendanceStats(totalAttendance);

    // -----------------------------
    // Evangelisation
    // -----------------------------
    let evanQuery = supabase
      .from("evangelises")
      .select("*")
      .eq("eglise_id", egliseId)
      .eq("branche_id", brancheId);
    if (dateDebut) evanQuery = evanQuery.gte("created_at", dateDebut);
    if (dateFin) evanQuery = evanQuery.lte("created_at", dateFin);
    const { data: evan } = await evanQuery;
    setEvanData(evan || []);

    const totalEvan = evan?.length || 0;
    setEvanStatsAgg(totalEvan);

    // -----------------------------
    // Baptême
    // -----------------------------
    let baptemeQuery = supabase
      .from("baptemes")
      .select("*")
      .eq("eglise_id", egliseId)
      .eq("branche_id", brancheId);
    if (dateDebut) baptemeQuery = baptemeQuery.gte("date", dateDebut);
    if (dateFin) baptemeQuery = baptemeQuery.lte("date", dateFin);
    const { data: bapteme } = await baptemeQuery;
    setBaptemeData(bapteme || []);
    const totalBapteme = bapteme?.reduce(
      (sum, r) => sum + (Number(r.hommes) || 0) + (Number(r.femmes) || 0),
      0
    );
    setBaptemeStatsAgg(totalBapteme);

    // -----------------------------
    // Formation
    // -----------------------------
    let formationQuery = supabase
      .from("formations")
      .select("*")
      .eq("eglise_id", egliseId)
      .eq("branche_id", brancheId);
    if (dateDebut) formationQuery = formationQuery.gte("date_debut", dateDebut);
    if (dateFin) formationQuery = formationQuery.lte("date_fin", dateFin);
    const { data: formation } = await formationQuery;
    setFormationData(formation || []);
    const totalFormation = formation?.reduce(
      (sum, r) => sum + (Number(r.hommes) || 0) + (Number(r.femmes) || 0),
      0
    );
    setFormationStatsAgg(totalFormation);

    // -----------------------------
    // Cellules
    // -----------------------------
    const { count: cellulesCountData } = await supabase
      .from("cellules")
      .select("id", { count: "exact", head: true })
      .eq("eglise_id", egliseId)
      .eq("branche_id", brancheId);
    setCellulesCount(cellulesCountData || 0);

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-[#333699]">
      <HeaderPages />
      <h1 className="text-3xl font-bold text-white mt-4">Statistiques Globales</h1>

      {/* FILTRES */}
      <div className="bg-white/10 p-6 rounded-2xl shadow-lg mt-6 flex gap-4 flex-wrap text-white">
        <div>
          <label>Date début</label>
          <input
            type="date"
            className="border border-gray-400 rounded-lg px-3 py-2 ml-2 bg-transparent text-white"
            value={dateDebut}
            onChange={(e) => setDateDebut(e.target.value)}
          />
        </div>
        <div>
          <label>Date fin</label>
          <input
            type="date"
            className="border border-gray-400 rounded-lg px-3 py-2 ml-2 bg-transparent text-white"
            value={dateFin}
            onChange={(e) => setDateFin(e.target.value)}
          />
        </div>
        <button
          onClick={fetchStats}
          className="bg-[#333699] text-white px-6 py-2 rounded-xl hover:bg-[#2a2f85] transition duration-150"
        >
          Générer
        </button>
      </div>

      {/* TABLEAU EXISTANT */}
      {!loading && (
        <div className="overflow-x-auto mt-8 w-full max-w-6xl">
          {/* ...ici tu laisses ton tableau tel quel, inchangé... */}
        </div>
      )}

      {/* DASHBOARD MULTI-BLOCS */}
      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8 w-full max-w-6xl">
          {/* Culte */}
          <div className="bg-white/10 p-4 rounded-2xl shadow-lg text-white">
            <h3 className="font-semibold mb-2">Culte</h3>
            <p className="text-2xl font-bold mb-2">{attendanceStats || 0}</p>
            <Line
              data={{
                labels: attendanceData.map((r) => r.date),
                datasets: [
                  {
                    label: "Total Culte",
                    data: attendanceData.map((r) => (Number(r.hommes) || 0) + (Number(r.femmes) || 0)),
                    borderColor: "rgba(255,165,0,1)",
                    backgroundColor: "rgba(255,165,0,0.2)",
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: { legend: { display: false } },
                scales: { x: { display: false }, y: { display: false } },
                elements: { point: { radius: 0 } },
              }}
              height={50}
            />
          </div>

          {/* Évangélisation */}
          <div className="bg-white/10 p-4 rounded-2xl shadow-lg text-white">
            <h3 className="font-semibold mb-2">Évangélisation</h3>
            <p className="text-2xl font-bold mb-2">{evanStatsAgg || 0}</p>
            <Pie
              data={{
                labels: ["Prières", "Convertis", "Autres"],
                datasets: [
                  {
                    data: [
                      evanData.filter((r) => r.priere_salut).length,
                      evanData.filter((r) => r.type_conversion === "Nouveau converti").length,
                      evanData.length -
                        evanData.filter((r) => r.priere_salut).length -
                        evanData.filter((r) => r.type_conversion === "Nouveau converti").length,
                    ],
                    backgroundColor: ["#22c55e", "#16a34a", "#4ade80"],
                  },
                ],
              }}
              options={{ plugins: { legend: { position: "bottom", labels: { color: "white" } } } }}
              height={80}
            />
          </div>

          {/* Baptême */}
          <div className="bg-white/10 p-4 rounded-2xl shadow-lg text-white">
            <h3 className="font-semibold mb-2">Baptême</h3>
            <p className="text-2xl font-bold mb-2">{baptemeStatsAgg || 0}</p>
            <Bar
              data={{
                labels: ["Total Baptême"],
                datasets: [
                  {
                    data: [baptemeStatsAgg || 0],
                    backgroundColor: ["#a78bfa"],
                  },
                ],
              }}
              options={{ plugins: { legend: { display: false } }, scales: { x: { display: false }, y: { display: false } } }}
              height={50}
            />
          </div>

          {/* Formation */}
          <div className="bg-white/10 p-4 rounded-2xl shadow-lg text-white">
            <h3 className="font-semibold mb-2">Formation</h3>
            <p className="text-2xl font-bold mb-2">{formationStatsAgg || 0}</p>
            <Bar
              data={{
                labels: ["Total Formation"],
                datasets: [
                  {
                    data: [formationStatsAgg || 0],
                    backgroundColor: ["#3b82f6"],
                  },
                ],
              }}
              options={{
                indexAxis: "y",
                plugins: { legend: { display: false } },
                scales: { x: { display: false }, y: { display: false } },
              }}
              height={50}
            />
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
