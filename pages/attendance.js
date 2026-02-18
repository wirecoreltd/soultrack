"use client";

import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import HeaderPages from "../components/HeaderPages";
import Footer from "../components/Footer";
import ProtectedRoute from "../components/ProtectedRoute";

export default function RapportMensuelPage() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur", "ResponsableIntegration"]}>
      <RapportMensuel />
    </ProtectedRoute>
  );
}

function RapportMensuel() {
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [egliseId, setEgliseId] = useState(null);
  const [brancheId, setBrancheId] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("eglise_id, branche_id")
        .eq("id", session.session.user.id)
        .single();

      if (profile) {
        setEgliseId(profile.eglise_id);
        setBrancheId(profile.branche_id);
      }
    };

    fetchUser();
  }, []);

  const formatMonth = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString("fr-FR", {
      month: "long",
      year: "numeric",
    });
  };

  const fetchRapport = async () => {
    if (!egliseId || !brancheId) return;

    setLoading(true);
    setGenerated(true);

    let query = supabase
      .from("etat_contact")
      .select("*")
      .eq("eglise_id", egliseId)
      .eq("branche_id", brancheId)
      .order("created_at", { ascending: true });

    if (dateDebut) query = query.gte("created_at", dateDebut);
    if (dateFin) query = query.lte("created_at", dateFin);

    const { data, error } = await query;

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    const grouped = {};

    data.forEach((item) => {
      const monthKey = formatMonth(item.created_at);

      if (!grouped[monthKey]) {
        grouped[monthKey] = {
          hommes: 0,
          femmes: 0,
          enfants: 0,
          connectes: 0,
          nouveauxVenus: 0,
          nouveauxConvertis: 0,
        };
      }

      if (item.sexe === "Homme") grouped[monthKey].hommes++;
      if (item.sexe === "Femme") grouped[monthKey].femmes++;
      if (item.categorie === "Enfant") grouped[monthKey].enfants++;
      if (item.connecte) grouped[monthKey].connectes++;
      if (item.statut === "Nouveau") grouped[monthKey].nouveauxVenus++;
      if (item.converti) grouped[monthKey].nouveauxConvertis++;
    });

    const result = Object.entries(grouped).map(([mois, values]) => ({
      mois,
      ...values,
    }));

    setReports(result);
    setLoading(false);
  };

  const totalGlobal = reports.reduce(
    (acc, r) => ({
      hommes: acc.hommes + r.hommes,
      femmes: acc.femmes + r.femmes,
      enfants: acc.enfants + r.enfants,
      connectes: acc.connectes + r.connectes,
      nouveauxVenus: acc.nouveauxVenus + r.nouveauxVenus,
      nouveauxConvertis: acc.nouveauxConvertis + r.nouveauxConvertis,
    }),
    {
      hommes: 0,
      femmes: 0,
      enfants: 0,
      connectes: 0,
      nouveauxVenus: 0,
      nouveauxConvertis: 0,
    }
  );

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-[#333699]">
      <HeaderPages />

      <h1 className="text-2xl font-bold text-white mt-4 mb-6 text-center">
        Rapport Mensuel
      </h1>

      {/* FORMULAIRE */}
      <div className="bg-white/10 p-6 rounded-2xl shadow-lg mt-6 flex justify-center gap-4 flex-wrap text-white">
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
        <button
          onClick={fetchRapport}
          className="bg-[#2a2f85] px-6 py-3 rounded-xl hover:bg-[#1f2366]"
        >
          Générer
        </button>
      </div>

      {/* TABLE */}
      {generated && (
        <div className="w-full flex justify-center mt-6 mb-6">
          <div className="w-max overflow-x-auto space-y-2">

            {/* HEADER */}
            <div className="flex text-sm font-semibold uppercase text-white px-4 py-3 border-b border-white/30 bg-white/5 rounded-t-xl whitespace-nowrap">
              <div className="min-w-[180px]">Mois</div>
              <div className="min-w-[120px] text-center">Hommes</div>
              <div className="min-w-[120px] text-center">Femmes</div>
              <div className="min-w-[120px] text-center">Enfants</div>
              <div className="min-w-[120px] text-center">Connectés</div>
              <div className="min-w-[150px] text-center">Nouveaux Venus</div>
              <div className="min-w-[170px] text-center">Nouveaux Convertis</div>
            </div>

            {loading && (
              <div className="text-white text-center py-4">
                Chargement...
              </div>
            )}

            {reports.map((r, index) => (
              <div
                key={index}
                className={`flex items-center px-4 py-3 rounded-lg bg-white/10 border-l-4 ${
                  index % 6 === 0
                    ? "border-l-blue-500"
                    : index % 6 === 1
                    ? "border-l-purple-500"
                    : index % 6 === 2
                    ? "border-l-pink-500"
                    : index % 6 === 3
                    ? "border-l-green-500"
                    : index % 6 === 4
                    ? "border-l-yellow-400"
                    : "border-l-red-500"
                }`}
              >
                <div className="min-w-[180px] text-white font-semibold capitalize">
                  {r.mois}
                </div>
                <div className="min-w-[120px] text-center text-white">{r.hommes}</div>
                <div className="min-w-[120px] text-center text-white">{r.femmes}</div>
                <div className="min-w-[120px] text-center text-white">{r.enfants}</div>
                <div className="min-w-[120px] text-center text-white">{r.connectes}</div>
                <div className="min-w-[150px] text-center text-white">{r.nouveauxVenus}</div>
                <div className="min-w-[170px] text-center text-white">{r.nouveauxConvertis}</div>
              </div>
            ))}

            {/* TOTAL GLOBAL */}
            <div className="flex items-center px-4 py-4 mt-6 rounded-lg bg-white/30 text-white font-bold whitespace-nowrap border-t-2 border-white">
              <div className="min-w-[180px]">TOTAL GLOBAL</div>
              <div className="min-w-[120px] text-center">{totalGlobal.hommes}</div>
              <div className="min-w-[120px] text-center">{totalGlobal.femmes}</div>
              <div className="min-w-[120px] text-center">{totalGlobal.enfants}</div>
              <div className="min-w-[120px] text-center">{totalGlobal.connectes}</div>
              <div className="min-w-[150px] text-center">{totalGlobal.nouveauxVenus}</div>
              <div className="min-w-[170px] text-center">{totalGlobal.nouveauxConvertis}</div>
            </div>

          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
