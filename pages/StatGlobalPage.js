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
    const { data: baptemeData } = await supabase
      .from("baptemes")
      .select("hommes, femmes")
      .eq("eglise_id", egliseId)
      .eq("branche_id", brancheId);

    setBaptemeStats({
      hommes: baptemeData?.reduce((s, r) => s + Number(r.hommes), 0) || 0,
      femmes: baptemeData?.reduce((s, r) => s + Number(r.femmes), 0) || 0,
    });

    // ================= FORMATION =================
    const { data: formationData } = await supabase
      .from("formations")
      .select("hommes, femmes")
      .eq("eglise_id", egliseId)
      .eq("branche_id", brancheId);

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

  // ================= RAPPORTS =================
  const rapports = [
    { label: "Culte", data: attendanceStats, border: "border-l-orange-500" },
    { label: "Evangelisation", data: evanStats, border: "border-l-green-500" },
    { label: "Baptême", data: baptemeStats, border: "border-l-purple-500" },
    { label: "Formation", data: formationStats, border: "border-l-blue-500" },
    { label: "Cellules", data: { total: cellulesCount }, border: "border-l-yellow-500" },
  ].filter((r) => typeRapport === "Tous" || r.label === typeRapport);

  // ================= TOTAL GENERAL =================
  const totalGeneral = rapports.reduce(
    (acc, r) => {
      acc.hommes += Number(r.data?.hommes) || 0;
      acc.femmes += Number(r.data?.femmes) || 0;
      acc.jeunes += Number(r.data?.jeunes) || 0;
      acc.enfants += Number(r.data?.enfants) || 0;
      acc.connectes += Number(r.data?.connectes) || 0;
      acc.nouveauxVenus += Number(r.data?.nouveauxVenus) || 0;
      acc.nouveauxConvertis += Number(r.data?.nouveauxConvertis) || 0;
      acc.reconciliations += Number(r.data?.reconciliations) || 0;
      acc.moissonneurs += Number(r.data?.moissonneurs) || 0;
      return acc;
    },
    {
      hommes: 0,
      femmes: 0,
      jeunes: 0,
      enfants: 0,
      connectes: 0,
      nouveauxVenus: 0,
      nouveauxConvertis: 0,
      reconciliations: 0,
      moissonneurs: 0,
    }
  );

  const totalFinal = totalGeneral.hommes + totalGeneral.femmes;

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-[#333699]">
      <HeaderPages />
      <h1 className="text-3xl font-bold text-white mt-4">
        Statistiques Globales
      </h1>

      {!loading && attendanceStats && (
        <div className="w-full max-w-full overflow-x-auto mt-6">
          <div className="w-max space-y-2">

            {rapports.map((r, idx) => {
              const total =
                (Number(r.data?.hommes) || 0) +
                (Number(r.data?.femmes) || 0);

              return (
                <div key={idx} className="flex items-center px-4 py-3 rounded-lg bg-white/10 border-l-4">
                  <div className="min-w-[180px] text-white font-semibold">{r.label}</div>
                  <div className="min-w-[120px] text-center text-white">{r.data?.hommes ?? "-"}</div>
                  <div className="min-w-[120px] text-center text-white">{r.data?.femmes ?? "-"}</div>
                  <div className="min-w-[130px] text-center text-white font-bold">{total || r.data?.total || 0}</div>
                </div>
              );
            })}

            <div className="flex items-center px-4 py-4 mt-2 rounded-xl bg-white/20 font-bold">
              <div className="min-w-[180px] text-white uppercase">TOTAL</div>
              <div className="min-w-[120px] text-center text-white">{totalGeneral.hommes}</div>
              <div className="min-w-[120px] text-center text-white">{totalGeneral.femmes}</div>
              <div className="min-w-[130px] text-center text-orange-400 font-bold">{totalFinal}</div>
            </div>

          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
