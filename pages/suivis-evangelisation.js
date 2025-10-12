// pages/suivis-evangelisation.js
"use client";

import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import Image from "next/image";

export default function SuivisEvangelisation() {
  const [suivis, setSuivis] = useState([]);
  const [detailsOpen, setDetailsOpen] = useState({});
  const [loading, setLoading] = useState(true);
  const [statusChanges, setStatusChanges] = useState({});
  const [commentChanges, setCommentChanges] = useState({});
  const [updating, setUpdating] = useState({});

  useEffect(() => {
    fetchSuivis();
  }, []);

  const fetchSuivis = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("suivis_des_evangelises")
      .select(`
        *,
        cellules:cellule_id (cellule)
      `)
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

  const handleStatusChange = (id, value) => {
    setStatusChanges((prev) => ({ ...prev, [id]: value }));
  };

  const handleCommentChange = (id, value) => {
    setCommentChanges((prev) => ({ ...prev, [id]: value }));
  };

  const updateStatus = async (id) => {
    const newStatus = statusChanges[id];
    const newComment = commentChanges[id];

    if (!newStatus && !newComment) return;

    setUpdating((prev) => ({ ...prev, [id]: true }));

    const { error } = await supabase
      .from("suivis_des_evangelises")
      .update({
        status_suivis_evangelises: newStatus, // ✅ correction ici
        commentaire_evangelises: newComment,
      })
      .eq("id", id);

    if (error) {
      console.error("Erreur de mise à jour :", error.message);
    } else {
      setSuivis((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                status_suivis_evangelises:
                  newStatus ?? item.status_suivis_evangelises, // ✅ correction ici
                commentaire_evangelises:
                  newComment ?? item.commentaire_evangelises,
              }
            : item
        )
      );
    }

    setUpdating((prev) => ({ ...prev, [id]: false }));
  };

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
        <p className="text-white text-lg italic">
          Aucun contact suivi pour le moment.
        </p>
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
                  🕊 Cellule : {item.cellules?.cellule || "—"}
                </p>

                <p className="text-sm text-gray-700 mb-2">
                  👑 Responsable : {item.responsable_cellule || "—"}
                </p>

                {/* Détails */}
                <button
                  onClick={() => toggleDetails(item.id)}
                  className="text-blue-500 underline text-sm mt-1"
                >
                  {isOpen ? "Fermer" : "Voir détails"}
                </button>

                {isOpen && (
                  <div className="text-gray-600 text-sm text-center mt-2 space-y-2 w-full">
                    <p>🏙 Ville : {item.ville || "—"}</p>
                    <p>🙏 Besoin : {item.besoin || "—"}</p>
                    <p>📝 Infos : {item.infos_supplementaires || "—"}</p>

                    {/* Champ commentaire */}
                    <div className="mt-2">
                      <label className="text-gray-700 text-sm">💬 Commentaire :</label>
                      <textarea
                        value={
                          commentChanges[item.id] ??
                          item.commentaire_evangelises ??
                          ""
                        }
                        onChange={(e) =>
                          handleCommentChange(item.id, e.target.value)
                        }
                        rows={2}
                        className="w-full border rounded-md px-2 py-1 text-sm mt-1 resize-none"
                        placeholder="Ajouter un commentaire..."
                      ></textarea>
                    </div>

                    {/* Menu déroulant statut */}
                    <div className="mt-2">
                      <label className="text-gray-700 text-sm">
                        📋 Statut du suivi :
                      </label>
                      <select
                        value={
                          statusChanges[item.id] ??
                          item.status_suivis_evangelises ?? // ✅ correction ici
                          ""
                        }
                        onChange={(e) =>
                          handleStatusChange(item.id, e.target.value)
                        }
                        className="w-full border rounded-md px-2 py-1 text-sm mt-1"
                      >
                        <option value="">-- Choisir un statut --</option>
                        <option value="En cours">🕊 En cours</option>
                        <option value="Actif">🔥 Actif</option>
                        <option value="Veut venir à l’église">⛪ Veut venir à l’église</option>
                        <option value="Veut venir à la famille d’impact">
                          👨‍👩‍👧‍👦 Veut venir à la famille d’impact
                        </option>
                        <option value="Veut être visité">🏡 Veut être visité</option>
                        <option value="Ne souhaite pas continuer">
                          🚫 Ne souhaite pas continuer
                        </option>
                      </select>
                    </div>

                    {/* Date du suivi */}
                    <p className="mt-2">
                      📅 Date du suivi :{" "}
                      {new Date(item.date_suivi).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>

                    {/* Bouton mise à jour */}
                    <button
                      onClick={() => updateStatus(item.id)}
                      disabled={updating[item.id]}
                      className={`mt-2 w-full text-white font-semibold py-1 rounded-md transition ${
                        updating[item.id]
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-700"
                      }`}
                    >
                      {updating[item.id] ? "Mise à jour..." : "Mettre à jour"}
                    </button>
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
