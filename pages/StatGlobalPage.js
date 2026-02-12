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
  const [rapportFilter, setRapportFilter] = useState("Tous");

  const [egliseId, setEgliseId] = useState(null);
  const [brancheId, setBrancheId] = useState(null);

  const [attendanceStats, setAttendanceStats] = useState(null);
  const [evanStats, setEvanStats] = useState(null);
  const [baptemeStats, setBaptemeStats] = useState({ hommes: 0, femmes: 0 });
  const [formationStats, setFormationStats] = useState({ hommes: 0, femmes: 0 });
  const [cellulesCount, setCellulesCount] = useState(0);

  const [loading, setLoading] = useState(false);

  // ==========================
  // 🔹 GET USER PROFILE
  // ==========================
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

  // ==========================
  // 🔹 FETCH STATS
  // ==========================
  const fetchStats = async () => {
    if (!egliseId || !brancheId) return;
    setLoading(true);

    // -------- ATTENDANCE --------
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
      moissonneurs: 0,
    };

    attendanceData?.forEach((r) => {
      attendanceTotals.hommes += Number(r.hommes) || 0;
      attendanceTotals.femmes += Number(r.femmes) || 0;
      attendanceTotals.jeunes += Number(r.jeunes) || 0;
      attendanceTotals.enfants += Number(r.enfants) || 0;
      attendanceTotals.connectes += Number(r.connectes) || 0;
      attendanceTotals.nouveauxVenus += Number(r.nouveauxVenus) || 0;
      attendanceTotals.nouveauxConvertis += Number(r.nouveauxConvertis) || 0;
      attendanceTotals.moissonneurs += Number(r.moissonneurs) || 0;
    });

    setAttendanceStats(attendanceTotals);

    // -------- EVANGELISATION --------
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

    // -------- BAPTEME --------
    const { data: baptemeData } = await supabase
      .from("baptemes")
      .select("hommes, femmes")
      .eq("eglise_id", egliseId)
      .eq("branche_id", brancheId);

    setBaptemeStats({
      hommes: baptemeData?.reduce((s, r) => s + Number(r.hommes), 0) || 0,
      femmes: baptemeData?.reduce((s, r) => s + Number(r.femmes), 0) || 0,
    });

    // -------- FORMATION --------
    const { data: formationData } = await supabase
      .from("formations")
      .select("hommes, femmes")
      .eq("eglise_id", egliseId)
      .eq("branche_id", brancheId);

    setFormationStats({
      hommes: formationData?.reduce((s, r) => s + Number(r.hommes), 0) || 0,
      femmes: formationData?.reduce((s, r) => s + Number(r.femmes), 0) || 0,
    });

    // -------- CELLULES --------
    const { count } = await supabase
      .from("cellules")
      .select("id", { count: "exact", head: true })
      .eq("eglise_id", egliseId)
      .eq("branche_id", brancheId);

    setCellulesCount(count || 0);

    setLoading(false);
  };

  // ==========================
  // 🔹 TABLE ROWS
  // ==========================
  const rows = [
    { label: "Culte", data: attendanceStats, border: "border-l-orange-500" },
    { label: "Evangelisation", data: evanStats, border: "border-l-green-500" },
    { label: "Baptême", data: baptemeStats, border: "border-l-purple-500" },
    { label: "Formation", data: formationStats, border: "border-l-blue-500" },
    { label: "Cellules", data: { total: cellulesCount }, border: "border-l-yellow-500" },
  ].filter(r => rapportFilter === "Tous" || r.label === rapportFilter);

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-[#333699]">
      <HeaderPages />
      <h1 className="text-3xl font-bold text-white mt-4">Statistiques Globales</h1>

      {/* FILTRES */}
      <div className="bg-white/10 p-6 rounded-2xl shadow-lg mt-6 flex gap-4 flex-wrap text-white">
        <input
          type="date"
          className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent"
          value={dateDebut}
          onChange={(e) => setDateDebut(e.target.value)}
        />

        <input
          type="date"
          className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent"
          value={dateFin}
          onChange={(e) => setDateFin(e.target.value)}
        />

        <select
          className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent"
          value={rapportFilter}
          onChange={(e) => setRapportFilter(e.target.value)}
        >
          <option>Tous</option>
          <option>Culte</option>
          <option>Evangelisation</option>
          <option>Baptême</option>
          <option>Formation</option>
          <option>Cellules</option>
        </select>

        <button
          onClick={fetchStats}
          className="bg-[#2a2f85] px-6 py-2 rounded-xl hover:bg-[#1f2366]"
        >
          Générer
        </button>
      </div>

      {loading && <p className="text-white mt-6">Chargement...</p>}

      {!loading && attendanceStats && (
        <div className="w-full max-w-6xl overflow-x-auto mt-8">
          <div className="min-w-max space-y-2">

            {/* HEADER */}
            <div className="flex text-sm font-semibold uppercase text-white px-4 py-2">
              {["Rapport","Hommes","Femmes","Jeunes","Enfants","Connectés","Nouveaux Venus","Prière / Réconciliation","Nouveau Converti","Moissonneurs","Total"]
              .map((h,i)=>(
                <div key={i} className="mr-6 whitespace-nowrap">{h}</div>
              ))}
            </div>

            {/* ROWS */}
            {rows.map((r,i)=>(
              <div
                key={i}
                className={`flex items-center px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 transition border-l-4 ${r.border} min-w-max`}
              >
                <div className="mr-6 font-semibold text-white">{r.label}</div>
                <div className="mr-6 text-white">{r.data?.hommes ?? "-"}</div>
                <div className="mr-6 text-white">{r.data?.femmes ?? "-"}</div>
                <div className="mr-6 text-white">{r.data?.jeunes ?? "-"}</div>
                <div className="mr-6 text-white">{r.data?.enfants ?? "-"}</div>
                <div className="mr-6 text-white">{r.data?.connectes ?? "-"}</div>
                <div className="mr-6 text-white">{r.data?.nouveauxVenus ?? "-"}</div>
                <div className="mr-6 text-white">{r.data?.prieres ?? r.data?.reconciliations ?? "-"}</div>
                <div className="mr-6 text-white">{r.data?.nouveauxConvertis ?? "-"}</div>
                <div className="mr-6 text-white">{r.data?.moissonneurs ?? "-"}</div>
                <div className="text-white">
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
