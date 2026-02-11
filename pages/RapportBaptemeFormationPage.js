"use client";

import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import HeaderPages from "../components/HeaderPages";
import Footer from "../components/Footer";
import ProtectedRoute from "../components/ProtectedRoute";

export default function RapportBaptemeFormationPage() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur", "ResponsableEvangelisation"]}>
      <RapportBaptemeFormation />
    </ProtectedRoute>
  );
}

function RapportBaptemeFormation() {
  const [baptemes, setBaptemes] = useState([]);
  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [egliseId, setEgliseId] = useState(null);
  const [brancheId, setBrancheId] = useState(null);

  // 🔹 Récupérer eglise_id et branche_id de l'utilisateur connecté
  useEffect(() => {
    const fetchUserEglise = async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) return;

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("eglise_id, branche_id")
        .eq("id", session.session.user.id)
        .single();

      if (!error && profile) {
        setEgliseId(profile.eglise_id);
        setBrancheId(profile.branche_id);
      } else {
        console.error("Erreur récupération eglise/branche :", error?.message);
      }
    };
    fetchUserEglise();
  }, []);

  // 🔹 Récupérer les rapports Baptême et Formation
  const fetchRapports = async () => {
    if (!egliseId || !brancheId) return;
    setLoading(true);

    const start = dateStart || "1900-01-01";
    const end = dateEnd || "2100-12-31";

    // 🔹 Baptêmes
    const { data: baptemesData, error: bapError } = await supabase
      .from("baptemes")
      .select("*")
      .gte("date", start)
      .lte("date", end)
      .eq("eglise_id", egliseId)
      .eq("branche_id", brancheId)
      .order("date", { ascending: true });

    if (bapError) console.error(bapError);
    else setBaptemes(baptemesData || []);

    // 🔹 Formations
    const { data: formationsData, error: formError } = await supabase
      .from("formations")
      .select("*")
      .gte("date", start)
      .lte("date", end)
      .eq("eglise_id", egliseId)
      .eq("branche_id", brancheId)
      .order("date", { ascending: true });

    if (formError) console.error(formError);
    else setFormations(formationsData || []);

    setLoading(false);
  };

  useEffect(() => {
    fetchRapports();
  }, [egliseId, brancheId, dateStart, dateEnd]);

  if (loading) return <p className="text-center mt-10">Chargement des rapports...</p>;

  const renderTable = (data, title, columns) => (
    <div className="overflow-x-auto w-full max-w-6xl mt-6">
      <h2 className="text-2xl font-bold text-gray-200 mb-2">{title}</h2>
      <table className="min-w-full border-separate border-spacing-0 shadow-lg rounded-2xl overflow-hidden">
        <thead className="bg-orange-500 text-white">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="py-3 px-4 text-left">{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr
              key={row.id}
              className={`${index % 2 === 0 ? "bg-white" : "bg-orange-50"} hover:bg-orange-100 transition-colors`}
            >
              {columns.map((col) => (
                <td key={col.key} className="py-2 px-4">
                  {col.format ? col.format(row[col.key]) : row[col.key] || "-"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const baptemeColumns = [
    { key: "date", label: "Date", format: (v) => new Date(v).toLocaleDateString() },
    { key: "prenom", label: "Prénom" },
    { key: "nom", label: "Nom" },
    { key: "sexe", label: "Sexe" },
    { key: "ville", label: "Ville" },
    { key: "baptiseur", label: "Baptisé par" },
    { key: "infos_supplementaires", label: "Infos supplémentaires" },
  ];

  const formationColumns = [
    { key: "date", label: "Date", format: (v) => new Date(v).toLocaleDateString() },
    { key: "titre", label: "Titre de la formation" },
    { key: "animateur", label: "Animateur" },
    { key: "participants", label: "Participants" },
    { key: "infos_supplementaires", label: "Infos supplémentaires" },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-[#333699]">
      <HeaderPages />

      <h1 className="text-3xl font-bold text-gray-200 mt-2">Rapports Baptême et Formation</h1>
      <p className="text-gray-300 italic mt-1">Résumé des activités par date</p>

      {/* 🔹 Filtres */}
      <div className="flex gap-4 mt-4 mb-4">
        <div>
          <label className="text-white font-medium">Date début :</label>
          <input
            type="date"
            value={dateStart}
            onChange={(e) => setDateStart(e.target.value)}
            className="input"
          />
        </div>
        <div>
          <label className="text-white font-medium">Date fin :</label>
          <input
            type="date"
            value={dateEnd}
            onChange={(e) => setDateEnd(e.target.value)}
            className="input"
          />
        </div>
      </div>

      {renderTable(baptemes, "Rapport Baptême", baptemeColumns)}
      {renderTable(formations, "Rapport Formation", formationColumns)}

      <Footer />

      <style jsx>{`
        .input {
          padding: 8px 10px;
          border-radius: 8px;
          border: 1px solid #ccc;
        }
      `}</style>
    </div>
  );
}
