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
      reconciliations: 0,
      nouveauxConvertis: 0,
      nouveauxVenus: 0,
      moissonneurs: 0,
    };

    evanData?.forEach((r) => {
      if (r.sexe === "Homme") evanTotals.hommes++;
      if (r.sexe === "Femme") evanTotals.femmes++;
      if (r.priere_salut) evanTotals.prieres++;
      if (r.type_conversion === "Réconciliation") evanTotals.reconciliations++;
      if (r.type_conversion === "Nouveau converti") evanTotals.nouveauxConvertis++;
      if (r.type_conversion === "Nouveau venu") evanTotals.nouveauxVenus++;
      if (r.moissonneur) evanTotals.moissonneurs++;
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

    setBaptemeStats({
      hommes: baptemeData?.reduce((sum, r) => sum + Number(r.hommes), 0) || 0,
      femmes: baptemeData?.reduce((sum, r) => sum + Number(r.femmes), 0) || 0,
    });

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

    setFormationStats({
      hommes: formationData?.reduce((sum, r) => sum + Number(r.hommes), 0) || 0,
      femmes: formationData?.reduce((sum, r) => sum + Number(r.femmes), 0) || 0,
    });

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
          <label>Filtrer par Rapport</label>
          <select
            className="border border-gray-400 rounded-lg px-3 py-2 ml-2 bg-transparent text-white"
            value={rapportFilter}
            onChange={(e) => setRapportFilter(e.target.value)}
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

      {/* TABLEAU */}
      {loading && <p className="text-white mt-6">Chargement...</p>}

      {!loading && attendanceStats && (
        <div className="w-full max-w-6xl mt-6">
          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-300 rounded-xl">
            <div className="min-w-[1200px] space-y-2">
              {/* HEADER */}
              <div className="hidden sm:flex text-sm font-semibold uppercase text-white px-4 py-2 border-b border-gray-400 bg-transparent rounded-t-xl">
                <div className="flex-[2] sticky left-0 bg-transparent z-10 whitespace-nowrap">Rapport</div>
                <div className="flex-[1] whitespace-nowrap">Hommes</div>
                <div className="flex-[1] whitespace-nowrap">Femmes</div>
                <div className="flex-[1] whitespace-nowrap">Jeunes</div>
                <div className="flex-[1] whitespace-nowrap">Enfants</div>
                <div className="flex-[1] whitespace-nowrap">Connectés</div>
                <div className="flex-[2] whitespace-nowrap">Nouveaux Venus</div>
                <div className="flex-[2] whitespace-nowrap">Prière / Réconciliation</div>
                <div className="flex-[2] whitespace-nowrap">Nouveau Converti</div>
                <div className="flex-[1] whitespace-nowrap">Moissonneurs</div>
                <div className="flex-[1] whitespace-nowrap">Total</div>
              </div>

              {/* LIGNES */}
              {[
                { label: "Culte", data: attendanceStats, borderColor: "border-l-orange-500" },
                { label: "Evangelisation", data: evanStats, borderColor: "border-l-green-500" },
                { label: "Baptême", data: baptemeStats, borderColor: "border-l-purple-500" },
                { label: "Formation", data: formationStats, borderColor: "border-l-blue-500" },
                { label: "Cellules", data: { total: cellulesCount }, borderColor: "border-l-yellow-500" },
              ]
                .filter((r) => rapportFilter === "Tous" || r.label === rapportFilter)
                .map((r, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-row items-center px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 transition duration-150 border-l-4 ${r.borderColor}`}
                  >
                    <div className="flex-[2] sticky left-0 bg-white/10 text-white font-semibold z-10">{r.label}</div>
                    <div className="flex-[1] text-white">{r.data?.hommes ?? "-"}</div>
                    <div className="flex-[1] text-white">{r.data?.femmes ?? "-"}</div>
                    <div className="flex-[1] text-white">{r.data?.jeunes ?? "-"}</div>
                    <div className="flex-[1] text-white">{r.data?.enfants ?? "-"}</div>
                    <div className="flex-[1] text-white">{r.data?.connectes ?? "-"}</div>
                    <div className="flex-[2] text-white">{r.data?.nouveauxVenus ?? r.data?.prieres ?? "-"}</div>
                    <div className="flex-[2] text-white">{r.data?.prieres ?? r.data?.reconciliations ?? "-"}</div>
                    <div className="flex-[2] text-white">{r.data?.nouveauxConvertis ?? "-"}</div>
                    <div className="flex-[1] text-white">{r.data?.moissonneurs ?? "-"}</div>
                    <div className="flex-[1] text-white">
                      {r.data?.hommes && r.data?.femmes ? r.data.hommes + r.data.femmes : r.data?.total ?? "-"}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
