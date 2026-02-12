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

      if (r.type_conversion === "Nouveau converti")
        evanTotals.nouveauxConvertis++;

      if (r.type_conversion === "Réconciliation")
        evanTotals.reconciliations++;
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

    setBaptemeStats({
      hommes: totalBaptemeHommes,
      femmes: totalBaptemeFemmes,
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

    const totalFormationHommes =
      formationData?.reduce((sum, r) => sum + Number(r.hommes), 0) || 0;

    const totalFormationFemmes =
      formationData?.reduce((sum, r) => sum + Number(r.femmes), 0) || 0;

    setFormationStats({
      hommes: totalFormationHommes,
      femmes: totalFormationFemmes,
    });

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-[#333699]">
      <HeaderPages />

      <h1 className="text-3xl font-bold text-white mt-4">
        Statistiques Globales
      </h1>

      {/* FILTRES */}
      <div className="bg-white p-6 rounded-2xl shadow-lg mt-6 flex gap-4 flex-wrap text-black">
        <div>
          <label>Date début</label>
          <input
            type="date"
            className="border rounded-lg px-3 py-2 ml-2"
            value={dateDebut}
            onChange={(e) => setDateDebut(e.target.value)}
          />
        </div>

        <div>
          <label>Date fin</label>
          <input
            type="date"
            className="border rounded-lg px-3 py-2 ml-2"
            value={dateFin}
            onChange={(e) => setDateFin(e.target.value)}
          />
        </div>

        <button
          onClick={fetchStats}
          className="bg-[#333699] text-white px-6 py-2 rounded-xl hover:bg-[#2a2f85]"
        >
          Générer
        </button>
      </div>

      {/* TABLEAU */}
      {loading && <p className="text-white mt-6">Chargement...</p>}

      {!loading && attendanceStats && (
        <div className="overflow-x-auto mt-8 w-full max-w-6xl">
          <table className="min-w-full bg-white rounded-2xl overflow-hidden shadow-lg text-center">
            <thead className="bg-orange-500 text-white">
              <tr>
                <th className="py-3 px-4 text-left">Rapport</th>
                <th>Hommes</th>
                <th>Femmes</th>
                <th>Jeunes</th>
                <th>Enfants</th>
                <th>Connectés</th>
                <th>Prière</th>
                <th>Nouveaux</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {/* CULTE */}
              <tr className="bg-orange-50 font-semibold">
                <td className="text-left px-4">Rapport Culte</td>
                <td>{attendanceStats.hommes}</td>
                <td>{attendanceStats.femmes}</td>
                <td>{attendanceStats.jeunes}</td>
                <td>{attendanceStats.enfants}</td>
                <td>{attendanceStats.connectes}</td>
                <td>-</td>
                <td>{attendanceStats.nouveauxVenus}</td>
                <td>
                  {attendanceStats.hommes +
                    attendanceStats.femmes +
                    attendanceStats.jeunes +
                    attendanceStats.enfants}
                </td>
              </tr>

              {/* EVANGELISATION */}
              <tr className="bg-green-100 font-semibold">
                <td className="text-left px-4">Rapport Evangelisation</td>
                <td>{evanStats?.hommes}</td>
                <td>{evanStats?.femmes}</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td>{evanStats?.prieres}</td>
                <td>{evanStats?.nouveauxConvertis}</td>
                <td>{evanStats?.hommes + evanStats?.femmes}</td>
              </tr>

              {/* BAPTEME */}
              <tr className="bg-purple-100 font-semibold">
                <td className="text-left px-4">Rapport Baptême</td>
                <td>{baptemeStats.hommes}</td>
                <td>{baptemeStats.femmes}</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td>{baptemeStats.hommes + baptemeStats.femmes}</td>
              </tr>

              {/* FORMATION */}
              <tr className="bg-blue-100 font-semibold">
                <td className="text-left px-4">Rapport Formation</td>
                <td>{formationStats.hommes}</td>
                <td>{formationStats.femmes}</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td>{formationStats.hommes + formationStats.femmes}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      <Footer />
    </div>
  );
}
