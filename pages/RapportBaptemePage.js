"use client";

import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import HeaderPages from "../components/HeaderPages";
import Footer from "../components/Footer";
import ProtectedRoute from "../components/ProtectedRoute";

export default function RapportBaptemePage() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur", "ResponsableEvangelisation"]}>
      <RapportBapteme />
    </ProtectedRoute>
  );
}

function RapportBapteme() {
  const [baptemes, setBaptemes] = useState([]);
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

  // 🔹 Récupérer les rapports de baptême
  const fetchBaptemes = async () => {
    if (!egliseId || !brancheId) return;
    setLoading(true);

    let start = dateStart || "1900-01-01";
    let end = dateEnd || "2100-12-31";

    const { data, error } = await supabase
      .from("baptemes")
      .select("*")
      .gte("date", start)
      .lte("date", end)
      .eq("eglise_id", egliseId)
      .eq("branche_id", brancheId)
      .order("date", { ascending: true });

    if (error) console.error(error);
    else setBaptemes(data || []);

    setLoading(false);
  };

  useEffect(() => {
    fetchBaptemes();
  }, [egliseId, brancheId, dateStart, dateEnd]);

  if (loading) return <p className="text-center mt-10">Chargement des rapports de baptême...</p>;

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-[#333699]">
      <HeaderPages />

      <h1 className="text-3xl font-bold text-gray-800 mt-2">Rapport Baptême</h1>
      <p className="text-gray-600 italic mt-1">Résumé des baptêmes par date</p>

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

      {/* 🔹 Tableau */}
      <div className="overflow-x-auto w-full max-w-6xl">
        <table className="min-w-full border-separate border-spacing-0 shadow-lg rounded-2xl overflow-hidden">
          <thead className="bg-orange-500 text-white">
            <tr>
              <th className="py-3 px-4 text-left">Date</th>
              <th className="py-3 px-4">Prénom</th>
              <th className="py-3 px-4">Nom</th>
              <th className="py-3 px-4">Sexe</th>
              <th className="py-3 px-4">Ville</th>
              <th className="py-3 px-4">Baptisé par</th>
              <th className="py-3 px-4">Infos supplémentaires</th>
            </tr>
          </thead>
          <tbody>
            {baptemes.map((b, index) => (
              <tr
                key={b.id}
                className={`${index % 2 === 0 ? "bg-white" : "bg-orange-50"} hover:bg-orange-100 transition-colors`}
              >
                <td className="py-2 px-4 text-left font-medium">{new Date(b.date).toLocaleDateString()}</td>
                <td className="py-2 px-4">{b.prenom}</td>
                <td className="py-2 px-4">{b.nom}</td>
                <td className="py-2 px-4">{b.sexe}</td>
                <td className="py-2 px-4">{b.ville}</td>
                <td className="py-2 px-4">{b.baptiseur}</td>
                <td className="py-2 px-4">{b.infos_supplementaires || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
