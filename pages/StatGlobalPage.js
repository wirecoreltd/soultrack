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

  const [egliseId, setEgliseId] = useState(null);
  const [brancheId, setBrancheId] = useState(null);

  const [attendanceStats, setAttendanceStats] = useState(null);
  const [evanStats, setEvanStats] = useState(null);
  const [baptemeStats, setBaptemeStats] = useState({ hommes: 0, femmes: 0 });
  const [formationStats, setFormationStats] = useState({ hommes: 0, femmes: 0 });
  const [cellulesCount, setCellulesCount] = useState(0);

  const [loading, setLoading] = useState(false);
  const [selectedRapport, setSelectedRapport] = useState("Tous");

  // 🔹 Récupérer eglise_id et branche_id automatiquement
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

    // ==========================
    // 🔹 ATTENDANCE
    // ==========================
    let attendanceQuery = supabase
      .from("attendance")
      .select("*")
      .eq("eglise_id", egliseId)
      .eq("branche_id", brancheId);

    if (dateDebut) attendanceQuery = attendanceQuery.gte("date", dateDebut);
    if (dateFin) attendanceQuery = attendanceQuery.lte("date", dateFin);

    const { data: attendanceData } = await attendanceQuery;

    const attendanceTotals = {
      hommes: 0,
      femmes: 0,
      jeunes: 0,
      enfants: 0,
      connectes: 0,
      nouveauxVenus: 0,
      nouveauxConvertis: 0,
    };

    attendanceData?.forEach((r) => {
      attendanceTotals.hommes += Number(r.hommes) || 0;
      attendanceTotals.femmes += Number(r.femmes) || 0;
      attendanceTotals.jeunes += Number(r.jeunes) || 0;
      attendanceTotals.enfants += Number(r.enfants) || 0;
      attendanceTotals.connectes += Number(r.connectes) || 0;
      attendanceTotals.nouveauxVenus += Number(r.nouveauxVenus) || 0;
      attendanceTotals.nouveauxConvertis += Number(r.nouveauxConvertis) || 0;
    });

    setAttendanceStats(attendanceTotals);

    // ==========================
    // 🔹 EVANGELISATION
    // ==========================
    let evanQuery = supabase
      .from("evangelises")
      .select("*")
      .eq("eglise_id", egliseId)
      .eq("branche_id", brancheId);

    if (dateDebut) evanQuery = evanQuery.gte("created_at", dateDebut);
    if (dateFin) evanQuery = evanQuery.lte("created_at", dateFin);

    const { data: evanData } = await evanQuery;

    const evanTotals = {
      hommes: 0,
      femmes: 0,
      prieres: 0,
      nouveauxConvertis: 0,
      reconciliations: 0,
    };

    evanData?.forEach((r) => {
      if (r.sexe === "Homme") evanTotals.hommes++;
      if (r.sexe === "Femme") evanTotals.femmes++;
      if (r.priere_salut) evanTotals.prieres++;
      if (r.type_conversion === "Nouveau converti") evanTotals.nouveauxConvertis++;
      if (r.type_conversion === "Réconciliation") evanTotals.reconciliations++;
    });

    setEvanStats(evanTotals);

    // ==========================
    // 🔹 BAPTEME
    // ==========================
    let baptemeQuery = supabase
      .from("baptemes")
      .select("hommes, femmes")
      .eq("eglise_id", egliseId)
      .eq("branche_id", brancheId);

    if (dateDebut) baptemeQuery = baptemeQuery.gte("date", dateDebut);
    if (dateFin) baptemeQuery = baptemeQuery.lte("date", dateFin);

    const { data: baptemeData } = await baptemeQuery;

    const totalBaptemeHommes =
      baptemeData?.reduce((sum, r) => sum + Number(r.hommes), 0) || 0;
    const totalBaptemeFemmes =
      baptemeData?.reduce((sum, r) => sum + Number(r.femmes), 0) || 0;

    setBaptemeStats({ hommes: totalBaptemeHommes, femmes: totalBaptemeFemmes });

    // ==========================
    // 🔹 FORMATION
    // ==========================
    let formationQuery = supabase
      .from("formations")
      .select("hommes, femmes")
      .eq("eglise_id", egliseId)
      .eq("branche_id", brancheId);

    if (dateDebut) formationQuery = formationQuery.gte("date_debut", dateDebut);
    if (dateFin) formationQuery = formationQuery.lte("date_fin", dateFin);

    const { data: formationData } = await formationQuery;

    const totalFormationHommes =
      formationData?.reduce((sum, r) => sum + Number(r.hommes), 0) || 0;
    const totalFormationFemmes =
      formationData?.reduce((sum, r) => sum + Number(r.femmes), 0) || 0;

    setFormationStats({ hommes: totalFormationHommes, femmes: totalFormationFemmes });

    // ==========================
    // 🔹 CELLULES
    // ==========================
    const { count: cellulesCountData } = await supabase
      .from("cellules")
      .select("id", { count: "exact", head: true })
      .eq("eglise_id", egliseId)
      .eq("branche_id", brancheId);

    setCellulesCount(cellulesCountData || 0);

    setLoading(false);
  };

  // 📊 Cartes pour dashboard
  const dashboardCards = [
    {
      label: "Culte",
      data: attendanceStats,
      borderColor: "border-orange-500",
      trend: "+5%",
    },
    {
      label: "Evangelisation",
      data: evanStats,
      borderColor: "border-green-500",
      trend: "+3%",
    },
    {
      label: "Baptême",
      data: baptemeStats,
      borderColor: "border-purple-500",
      trend: "+2%",
    },
    {
      label: "Formation",
      data: formationStats,
      borderColor: "border-blue-500",
      trend: "+4%",
    },
    {
      label: "Cellules",
      data: { total: cellulesCount },
      borderColor: "border-yellow-500",
      trend: "+1%",
    },
  ];

  // 🔹 Lignes pour tableau détaillé
  const tableLines = [
    { label: "Rapport Culte", data: attendanceStats, borderColor: "border-l-orange-500" },
    { label: "Rapport Evangelisation", data: evanStats, borderColor: "border-l-green-500" },
    { label: "Rapport Baptême", data: baptemeStats, borderColor: "border-l-purple-500" },
    { label: "Rapport Formation", data: formationStats, borderColor: "border-l-blue-500" },
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
        <div>
          <label>Filtrer par rapport</label>
          <select
            value={selectedRapport}
            onChange={(e) => setSelectedRapport(e.target.value)}
            className="px-3 py-2 rounded-lg bg-white/10 text-white border border-gray-400 ml-2"
          >
            <option value="Tous">Tous</option>
            <option value="Culte">Culte</option>
            <option value="Evangelisation">Evangelisation</option>
            <option value="Baptême">Baptême</option>
            <option value="Formation">Formation</option>
            <option value="Cellules">Cellules</option>
          </select>
        </div>
        <button
          onClick={fetchStats}
          className="bg-[#333699] text-white px-6 py-2 rounded-xl hover:bg-[#2a2f85] transition duration-150"
        >
          Générer
        </button>
      </div>

      {/* DASHBOARD CARTES */}
      {!loading && (
        <div className="w-full max-w-6xl mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {dashboardCards
            .filter((c) => selectedRapport === "Tous" || c.label.includes(selectedRapport))
            .map((card, idx) => (
              <div
                key={idx}
                className={`p-4 bg-white/10 rounded-2xl border-l-4 ${card.borderColor} shadow hover:bg-white/20 transition`}
              >
                <div className="text-white font-semibold text-lg">{card.label}</div>
                <div className="text-white mt-2">
                  {card.data?.hommes ?? "-"} Hommes | {card.data?.femmes ?? card.data?.total ?? "-"} Femmes
                </div>
                <div className="text-green-400 mt-1 flex items-center gap-1">
                  {card.trend} ↑
                </div>
                <div className="h-10 mt-2 bg-white/20 rounded-lg"></div>
              </div>
            ))}
        </div>
      )}

      {/* TABLEAU DÉTAILLÉ */}
      {loading && <p className="text-white mt-6">Chargement...</p>}

      {!loading && attendanceStats && (
        <div className="w-full max-w-6xl overflow-x-auto py-2 mt-6">
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
            {tableLines
              .filter((r) => selectedRapport === "Tous" || r.label.includes(selectedRapport))
              .map((r, idx) => (
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

      <Footer />
    </div>
  );
}
