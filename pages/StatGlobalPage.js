"use client";

import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import HeaderPages from "../components/HeaderPages";
import ProtectedRoute from "../components/ProtectedRoute";
import Footer from "../components/Footer";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
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

  // 🔹 States pour données brutes
  const [attendanceData, setAttendanceData] = useState([]);
  const [evanData, setEvanData] = useState([]);
  const [baptemeData, setBaptemeData] = useState([]);
  const [formationData, setFormationData] = useState([]);
  const [cellulesCount, setCellulesCount] = useState(0);

  const [loading, setLoading] = useState(false);

  // 🔹 States pour stats agrégées (tableau)
  const [attendanceStats, setAttendanceStats] = useState(null);
  const [evanStatsAgg, setEvanStatsAgg] = useState(null);
  const [baptemeStatsAgg, setBaptemeStatsAgg] = useState({ hommes: 0, femmes: 0 });
  const [formationStatsAgg, setFormationStatsAgg] = useState({ hommes: 0, femmes: 0 });

  // 🔹 Récupérer automatiquement eglise_id et branche_id
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

    // -----------------------------
    // Attendance
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

    const attendanceTotals = {
      hommes: 0,
      femmes: 0,
      jeunes: 0,
      enfants: 0,
      connectes: 0,
      nouveauxVenus: 0,
      nouveauxConvertis: 0,
    };

    attendance?.forEach((r) => {
      attendanceTotals.hommes += Number(r.hommes) || 0;
      attendanceTotals.femmes += Number(r.femmes) || 0;
      attendanceTotals.jeunes += Number(r.jeunes) || 0;
      attendanceTotals.enfants += Number(r.enfants) || 0;
      attendanceTotals.connectes += Number(r.connectes) || 0;
      attendanceTotals.nouveauxVenus += Number(r.nouveauxVenus) || 0;
      attendanceTotals.nouveauxConvertis += Number(r.nouveauxConvertis) || 0;
    });
    setAttendanceStats(attendanceTotals);

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

    const evanTotals = {
      hommes: 0,
      femmes: 0,
      prieres: 0,
      nouveauxConvertis: 0,
    };
    evan?.forEach((r) => {
      if (r.sexe === "Homme") evanTotals.hommes++;
      if (r.sexe === "Femme") evanTotals.femmes++;
      if (r.priere_salut) evanTotals.prieres++;
      if (r.type_conversion === "Nouveau converti") evanTotals.nouveauxConvertis++;
    });
    setEvanStatsAgg(evanTotals);

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

    const totalBaptemeHommes =
      bapteme?.reduce((sum, r) => sum + Number(r.hommes), 0) || 0;
    const totalBaptemeFemmes =
      bapteme?.reduce((sum, r) => sum + Number(r.femmes), 0) || 0;
    setBaptemeStatsAgg({ hommes: totalBaptemeHommes, femmes: totalBaptemeFemmes });

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

    const totalFormationHommes =
      formation?.reduce((sum, r) => sum + Number(r.hommes), 0) || 0;
    const totalFormationFemmes =
      formation?.reduce((sum, r) => sum + Number(r.femmes), 0) || 0;
    setFormationStatsAgg({ hommes: totalFormationHommes, femmes: totalFormationFemmes });

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

  // -----------------------------
  // Préparer les lignes du tableau
  // -----------------------------
  const tableLines = [
    { label: "Rapport Culte", data: attendanceStats, borderColor: "border-l-orange-500" },
    { label: "Rapport Evangelisation", data: evanStatsAgg, borderColor: "border-l-green-500" },
    { label: "Rapport Baptême", data: baptemeStatsAgg, borderColor: "border-l-purple-500" },
    { label: "Rapport Formation", data: formationStatsAgg, borderColor: "border-l-blue-500" },
    { label: "Nombre de Cellules", data: { total: cellulesCount }, borderColor: "border-l-yellow-500" },
  ];

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

      {/* TABLEAU */}
      {!loading && (
        <div className="overflow-x-auto mt-8 w-full max-w-6xl">
          <div className="min-w-[700px] space-y-2">
            {/* HEADER */}
            <div className="hidden sm:flex text-sm font-semibold uppercase text-white px-4 py-2 border-b border-gray-400 bg-transparent rounded-t-xl">
              <div className="flex-[2]">Rapport</div>
              <div className="flex-[1]">Hommes</div>
              <div className="flex-[1]">Femmes</div>
              <div className="flex-[1]">Jeunes</div>
              <div className="flex-[1]">Enfants</div>
              <div className="flex-[1]">Connectés</div>
              <div className="flex-[1]">Prière</div>
              <div className="flex-[1]">Nouveaux</div>
              <div className="flex-[1]">Total</div>
            </div>

            {/* LIGNES */}
            {tableLines.map((r, idx) => (
              <div
                key={idx}
                className={`flex flex-row items-center px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 transition duration-150 border-l-4 ${r.borderColor}`}
              >
                <div className="flex-[2] text-white font-semibold">{r.label}</div>
                <div className="flex-[1] text-white">{r.data?.hommes ?? "-"}</div>
                <div className="flex-[1] text-white">{r.data?.femmes ?? r.data?.total ?? "-"}</div>
                <div className="flex-[1] text-white">{r.data?.jeunes ?? "-"}</div>
                <div className="flex-[1] text-white">{r.data?.enfants ?? "-"}</div>
                <div className="flex-[1] text-white">{r.data?.connectes ?? "-"}</div>
                <div className="flex-[1] text-white">{r.data?.prieres ?? "-"}</div>
                <div className="flex-[1] text-white">
                  {r.data?.nouveauxConvertis ?? r.data?.nouveauxVenus ?? r.data?.total ?? "-"}
                </div>
                <div className="flex-[1] text-white">
                  {r.data?.hommes && r.data?.femmes
                    ? r.data.hommes + r.data.femmes
                    : r.data?.total ?? "-"}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DASHBOARD GRAPHIQUE SOUS LE TABLEAU */}
      {!loading && (
        <div className="w-full max-w-6xl mt-8 p-4 bg-[#222288] rounded-2xl shadow-lg">
          <Line
            data={{
              labels: attendanceData.map((r) => r.date),
              datasets: [
                {
                  label: "Culte Hommes",
                  data: attendanceData.map((r) => Number(r.hommes)),
                  borderColor: "rgba(255,165,0,1)",
                  backgroundColor: "rgba(255,165,0,0.2)",
                },
                {
                  label: "Culte Femmes",
                  data: attendanceData.map((r) => Number(r.femmes)),
                  borderColor: "rgba(255,140,0,1)",
                  backgroundColor: "rgba(255,140,0,0.2)",
                },
                {
                  label: "Évangélisés",
                  data: evanData.map((r) => 1), // simplifié pour count par item
                  borderColor: "rgba(0,128,0,1)",
                  backgroundColor: "rgba(0,128,0,0.2)",
                },
                {
                  label: "Prières",
                  data: evanData.map((r) => r.priere_salut ? 1 : 0),
                  borderColor: "rgba(34,139,34,1)",
                  backgroundColor: "rgba(34,139,34,0.2)",
                },
                {
                  label: "Convertis",
                  data: evanData.map((r) => r.type_conversion === "Nouveau converti" ? 1 : 0),
                  borderColor: "rgba(0,100,0,1)",
                  backgroundColor: "rgba(0,100,0,0.2)",
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: {
                legend: { position: "top", labels: { color: "white" } },
                title: { display: true, text: "Évolution des rapports", color: "white" },
              },
              scales: {
                x: { ticks: { color: "white" }, grid: { color: "rgba(255,255,255,0.1)" } },
                y: { ticks: { color: "white" }, grid: { color: "rgba(255,255,255,0.1)" } },
              },
            }}
          />
        </div>
      )}

      <Footer />
    </div>
  );
}
