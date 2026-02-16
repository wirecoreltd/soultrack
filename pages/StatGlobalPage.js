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

  const [egliseId, setEgliseId] = useState(null);
  const [brancheId, setBrancheId] = useState(null);

  const [attendanceStats, setAttendanceStats] = useState(null);
  const [evanStats, setEvanStats] = useState(null);
  const [baptemeStats, setBaptemeStats] = useState(null);
  const [formationStats, setFormationStats] = useState(null);
  const [cellulesCount, setCellulesCount] = useState(0);

  const [loading, setLoading] = useState(false);

  // ================= PROFILE =================
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

  // ================= FETCH STATS =================
  const fetchStats = async () => {
    if (!egliseId || !brancheId) return;

    setLoading(true);

    // ================= ATTENDANCE =================
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
      reconciliations: 0,
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
      attendanceTotals.reconciliations += Number(r.reconciliations) || 0;
      attendanceTotals.moissonneurs += Number(r.moissonneurs) || 0;
    });

    setAttendanceStats(attendanceTotals);

    // ================= EVANGELISATION =================
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
      nouveauxConvertis: 0,
      reconciliations: 0,
    };

    evanData?.forEach((r) => {
      if (r.sexe === "Homme") evanTotals.hommes++;
      if (r.sexe === "Femme") evanTotals.femmes++;
      if (r.type_conversion === "Nouveau converti") evanTotals.nouveauxConvertis++;
      if (r.type_conversion === "Réconciliation") evanTotals.reconciliations++;
    });

    setEvanStats(evanTotals);

    // ================= BAPTEME =================
    let baptemeQuery = supabase
      .from("baptemes")
      .select("hommes, femmes")
      .eq("eglise_id", egliseId)
      .eq("branche_id", brancheId);

    if (dateDebut) baptemeQuery = baptemeQuery.gte("date", dateDebut);
    if (dateFin) baptemeQuery = baptemeQuery.lte("date", dateFin);

    const { data: baptemeData } = await baptemeQuery;

    setBaptemeStats({
      hommes: baptemeData?.reduce((s, r) => s + Number(r.hommes), 0) || 0,
      femmes: baptemeData?.reduce((s, r) => s + Number(r.femmes), 0) || 0,
    });

    // ================= FORMATION =================
    let formationQuery = supabase
      .from("formations")
      .select("hommes, femmes")
      .eq("eglise_id", egliseId)
      .eq("branche_id", brancheId);

    if (dateDebut) formationQuery = formationQuery.gte("date_debut", dateDebut);
    if (dateFin) formationQuery = formationQuery.lte("date_fin", dateFin);

    const { data: formationData } = await formationQuery;

    setFormationStats({
      hommes: formationData?.reduce((s, r) => s + Number(r.hommes), 0) || 0,
      femmes: formationData?.reduce((s, r) => s + Number(r.femmes), 0) || 0,
    });

    const { count } = await supabase
      .from("cellules")
      .select("id", { count: "exact", head: true })
      .eq("eglise_id", egliseId)
      .eq("branche_id", brancheId);

    setCellulesCount(count || 0);

    setLoading(false);
  };

  const rapports = [
    { label: "Culte", data: attendanceStats },
    { label: "Evangelisation", data: evanStats },
    { label: "Baptême", data: baptemeStats },
    { label: "Formation", data: formationStats },
    { label: "Cellules", data: { total: cellulesCount } },
  ].filter((r) => typeRapport === "Tous" || r.label === typeRapport);

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-[#333699]">
      <HeaderPages />
      <h1 className="text-3xl font-bold text-white mt-4">
        Statistiques Globales
      </h1>

      {/* ================= FILTRES ================= */}
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

        <select
          value={typeRapport}
          onChange={(e) => setTypeRapport(e.target.value)}
          className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white"
        >
          <option className="text-black" value="Tous">Tous</option>
          <option className="text-black" value="Culte">Culte</option>
          <option className="text-black" value="Evangelisation">Evangelisation</option>
          <option className="text-black" value="Baptême">Baptême</option>
          <option className="text-black" value="Formation">Formation</option>
          <option className="text-black" value="Cellules">Cellules</option>
        </select>

        <button
          onClick={fetchStats}
          className="bg-[#2a2f85] px-8 py-3 rounded-2xl font-bold hover:bg-[#1f2366] transition"
        >
          Générer
        </button>
      </div>

      <Footer />
    </div>
  );
}
