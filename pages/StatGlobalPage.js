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
      prieres: 0,
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
      jeunes: 0,
      enfants: 0,
      connectes: 0,
      nouveauxVenus: 0,
      prieres: 0,
      nouveauxConvertis: 0,
      moissonneurs: 0,
    };

    evanData?.forEach((r) => {
      if (r.sexe === "Homme") evanTotals.hommes++;
      if (r.sexe === "Femme") evanTotals.femmes++;
      if (r.priere_salut) evanTotals.prieres++;
      if (r.type_conversion === "Nouveau converti") evanTotals.nouveauxConvertis++;
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

    const baptemeTotals = {
      hommes: baptemeData?.reduce((s, r) => s + Number(r.hommes), 0) || 0,
      femmes: baptemeData?.reduce((s, r) => s + Number(r.femmes), 0) || 0,
    };

    setBaptemeStats(baptemeTotals);

    // ================= FORMATION =================
    let formationQuery = supabase
      .from("formations")
      .select("hommes, femmes")
      .eq("eglise_id", egliseId)
      .eq("branche_id", brancheId);

    if (dateDebut) formationQuery = formationQuery.gte("date_debut", dateDebut);
    if (dateFin) formationQuery = formationQuery.lte("date_fin", dateFin);

    const { data: formationData } = await formationQuery;

    const formationTotals = {
      hommes: formationData?.reduce((s, r) => s + Number(r.hommes), 0) || 0,
      femmes: formationData?.reduce((s, r) => s + Number(r.femmes), 0) || 0,
    };

    setFormationStats(formationTotals);

    const { count } = await supabase
      .from("cellules")
      .select("id", { count: "exact", head: true })
      .eq("eglise_id", egliseId)
      .eq("branche_id", brancheId);

    setCellulesCount(count || 0);

    setLoading(false);
  };

  const rapports = [
    { label: "Culte", data: attendanceStats, border: "border-l-orange-500" },
    { label: "Evangelisation", data: evanStats, border: "border-l-green-500" },
    { label: "Baptême", data: baptemeStats, border: "border-l-purple-500" },
    { label: "Formation", data: formationStats, border: "border-l-blue-500" },
    { label: "Cellules", data: { total: cellulesCount }, border: "border-l-yellow-500" },
  ].filter((r) => typeRapport === "Tous" || r.label === typeRapport);

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-[#333699]">
      <HeaderPages />

      <h1 className="text-3xl font-bold text-white mt-4">
        Statistiques Globales
      </h1>

      {/* FILTRES */}
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
          <option value="Tous">Tous</option>
          <option value="Culte">Culte</option>
          <option value="Evangelisation">Evangelisation</option>
          <option value="Baptême">Baptême</option>
          <option value="Formation">Formation</option>
          <option value="Cellules">Cellules</option>
        </select>

        <button
          onClick={fetchStats}
          className="bg-[#2a2f85] px-6 py-2 rounded-xl hover:bg-[#1f2366]"
        >
          Générer
        </button>
      </div>

      {/* TABLE */}
      {!loading && attendanceStats && (
        <div className="w-full max-w-7xl overflow-x-auto mt-6 scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-transparent">
          <div className="min-w-[1300px] space-y-2">
            {/* HEADER */}
            <div className="flex text-sm font-semibold uppercase text-white px-4 py-3 border-b border-white/30 bg-white/5 rounded-t-xl whitespace-nowrap">
              <div className="min-w-[180px]">Rapport</div>
              <div className="min-w-[110px] text-center">Hommes</div>
              <div className="min-w-[110px] text-center">Femmes</div>
              <div className="min-w-[110px] text-center">Jeunes</div>
              <div className="min-w-[110px] text-center">Enfants</div>
              <div className="min-w-[130px] text-center">Connectés</div>
              <div className="min-w-[140px] text-center">Nouveaux Venus</div>
              <div className="min-w-[180px] text-center">Prière / Réconciliation</div>
              <div className="min-w-[170px] text-center">Nouveau Converti</div>
              <div className="min-w-[150px] text-center">Moissonneurs</div>
              <div className="min-w-[110px] text-center">Total</div>
            </div>

            {rapports.map((r, idx) => {
              const total =
                (Number(r.data?.hommes) || 0) +
                (Number(r.data?.femmes) || 0);

              return (
                <div
                  key={idx}
                  className={`flex items-center px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 transition border-l-4 ${r.border}`}
                >
                  <div className="min-w-[180px] text-white font-semibold">
                    {r.label}
                  </div>

                  <div className="min-w-[110px] text-center text-white">{r.data?.hommes ?? "-"}</div>
                  <div className="min-w-[110px] text-center text-white">{r.data?.femmes ?? "-"}</div>
                  <div className="min-w-[110px] text-center text-white">{r.data?.jeunes ?? "-"}</div>
                  <div className="min-w-[110px] text-center text-white">{r.data?.enfants ?? "-"}</div>
                  <div className="min-w-[130px] text-center text-white">{r.data?.connectes ?? "-"}</div>
                  <div className="min-w-[140px] text-center text-white">{r.data?.nouveauxVenus ?? "-"}</div>
                  <div className="min-w-[180px] text-center text-white">{r.data?.prieres ?? "-"}</div>
                  <div className="min-w-[170px] text-center text-white">{r.data?.nouveauxConvertis ?? "-"}</div>
                  <div className="min-w-[150px] text-center text-white">{r.data?.moissonneurs ?? "-"}</div>
                  <div className="min-w-[110px] text-center text-white font-bold">{total || r.data?.total ?? "-"}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
