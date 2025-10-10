// pages/suivis-evangelisation.js
"use client";

import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import Image from "next/image";

export default function SuivisEvangelisation() {
  const [suivis, setSuivis] = useState([]);
  const [detailsOpen, setDetailsOpen] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSuivis();
  }, []);

  const fetchSuivis = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("suivis_des_evangelises")
      .select("*")
      .order("date_suivi", { ascending: false });

    if (error) {
      console.error("Erreur de chargement :", error.message);
      setSuivis([]);
    } else {
      setSuivis(data || []);
    }
    setLoading(false);
  };

  const toggleDetails = (id) =>
    setDetailsOpen((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-gradient-to-br from-purple-700 to-indigo-500">
      {/* Retour */}
      <button
        onClick={() => window.history.back()}
        className="self-start mb-4 text-white font-semibold hover:text-gray-200"
      >
        ← Retour
      </button>

      {/* Logo */}
      <Image src="/logo.png" alt="Logo" width={80} height={80} className="mb-3" />

      <h1 className="text-4xl font-handwriting text-white text-center mb-3">
        Suivis des Évangélisés
      </h1>

      <p className="text-center text-white text-lg mb-6 font-handwriting-light">
        Voici les personnes confiées pour le suivi spirituel 🌱
      </p>

      {/* Contenu */}
      {loading ? (
        <p className="text-white">Chargement en cours...</p>
      ) : suivis.length === 0 ? (
        <p className="text-white text-lg italic">Aucun contact suivi pour le moment.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-6xl">
          {suivis.map((item) => {
            const isOpen = detailsOpen[item.id];
            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl shadow-lg p-4 flex flex-col items-center transition-all duration-300 hover:shadow-2xl"
              >
                <h2 className="font-bold text-gray-800 text-base text-center mb-1">
                  👤 {item.prenom} {item.nom}
                </h2>

                <p className="text-sm text-gray-700 mb-1">
                  📞 {item.telephone || "—"}
                </p>

                <p className="text-sm text-gray-700 mb-1">
                  🕊 Cellule : {item.cellule_id || "—"}
                </p>

                <p className="text-sm text-gray-700 mb-2">
                  👑 Responsable : {item.responsable_cellule || "—"}
                </p>

                <button
                  onClick={() => toggleDetails(item.id)}
                  className="text-blue-500 underline text-sm"
                >
                  {isOpen ? "Fermer" : "Voir détails"}
                </button>

                {isOpen && (
                  <div className="text-gray-600 text-sm text-center mt-2 space-y-1">
                    <p>🏙 Ville : {item.ville || "—"}</p>
                    <p>🙏 Besoin : {item.besoin || "—"}</p>
                    <p>📝 Infos : {item.infos_supplementaires || "—"}</p>
                    <p>📅 Date du suivi :{" "}
                      {new Date(item.date_suivi).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
