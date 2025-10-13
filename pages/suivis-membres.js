"use client";

import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import Image from "next/image";

export default function SuivisMembres() {
  const [suivis, setSuivis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailsOpen, setDetailsOpen] = useState({});
  const [statusChanges, setStatusChanges] = useState({});
  const [commentChanges, setCommentChanges] = useState({});
  const [updating, setUpdating] = useState({});

  useEffect(() => {
    fetchSuivis();

    // 🔁 Écoute en temps réel les changements sur la table suivis_membres
    const channel = supabase
      .channel("suivis_membres_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "suivis_membres" },
        (payload) => {
          console.log("🔁 Changement détecté :", payload);
          fetchSuivis();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchSuivis = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("suivis_membres")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erreur chargement suivis :", error.message);
      setSuivis([]);
    } else {
      setSuivis(data || []);
    }
    setLoading(false);
  };

  const toggleDetails = (id) =>
    setDetailsOpen((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleStatusChange = (id, value) =>
    setStatusChanges((prev) => ({ ...prev, [id]: value }));

  const handleCommentChange = (id, value) =>
    setCommentChanges((prev) => ({ ...prev, [id]: value }));

  const updateSuivi = async (id) => {
    const newStatus = statusChanges[id];
    const newComment = commentChanges[id];
    if (!newStatus && !newComment) return;

    setUpdating((prev) => ({ ...prev, [id]: true }));

    const { error } = await supabase
      .from("suivis_membres")
      .update({
        statut: newStatus ?? undefined,
        commentaire: newComment ?? undefined,
        updated_at: new Date(),
      })
      .eq("id", id);

    if (error) {
      console.error("Erreur mise à jour :", error.message);
    } else {
      setSuivis((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                statut: newStatus ?? item.statut,
                commentaire: newComment ?? item.commentaire,
              }
            : item
        )
      );
    }

    setUpdating((prev) => ({ ...prev, [id]: false }));
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-gradient-to-br from-emerald-700 to-teal-500">
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
        Suivis des Membres
      </h1>

      <p className="text-center text-white text-lg mb-6 font-handwriting-light">
        Liste des membres envoyés pour suivi 💬
      </p>

      {loading ? (
        <p className="text-white">Chargement...</p>
      ) : suivis.length === 0 ? (
        <p className="text-white text-lg italic">
          Aucun membre en suivi pour le moment.
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
                <p className="text-sm text-gray-700 mb-1">📞 {item.telephone || "—"}</p>
                <p className="text-sm text-gray-700 mb-1">
                  🕊 Cellule : {item.cellule_nom || "—"}
                </p>
                <p className="text-sm text-gray-700 mb-1">
                  👑 Responsable : {item.responsable || "—"}
                </p>
                <p className="text-sm text-gray-700 mb-1">
                  📅 Créé le :{" "}
                  {new Date(item.created_at).toLocaleDateString("fr-FR", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </p>

                {/* Bouton voir détails */}
                <button
                  onClick={() => toggleDetails(item.id)}
                  className="text-blue-500 underline text-sm mt-1"
                >
                  {isOpen ? "Fermer" : "Voir détails"}
                </button>

                {isOpen && (
                  <div className="text-gray-600 text-sm text-center mt-2 space-y-2 w-full">
                    <p>🙏 Besoin : {item.besoin || "—"}</p>
                    <p>📝 Infos : {item.infos_supplementaires || "—"}</p>
                    <div className="mt-2">
                      <label className="text-gray-700 text-sm">💬 Commentaire :</label>
                      <textarea
                        value={
                          commentChanges[item.id] ??
                          item.commentaire ??
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

                    <div className="mt-2">
                      <label className="text-gray-700 text-sm">📋 Statut :</label>
                      <select
                        value={statusChanges[item.id] ?? item.statut ?? ""}
                        onChange={(e) =>
                          handleStatusChange(item.id, e.target.value)
                        }
                        className="w-full border rounded-md px-2 py-1 text-sm mt-1"
                      >
                        <option value="">-- Choisir un statut --</option>
                        <option value="actif">✅ Actif</option>
                        <option value="en attente">🕓 En attente</option>
                        <option value="suivi terminé">🏁 Terminé</option>
                        <option value="inactif">❌ Inactif</option>
                      </select>
                    </div>

                    <button
                      onClick={() => updateSuivi(item.id)}
                      disabled={updating[item.id]}
                      className={`mt-3 w-full text-white font-semibold py-1 rounded-md transition ${
                        updating[item.id]
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-green-600 hover:bg-green-700"
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
