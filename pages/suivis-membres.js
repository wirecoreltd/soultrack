//pages/suivis-membres.js

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
  const [message, setMessage] = useState(null);
  const [view, setView] = useState("card"); // 👈 ajout toggle vue

  useEffect(() => {
    fetchSuivis();
  }, []);

  const fetchSuivis = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const { data, error } = await supabase
        .from("suivis_membres")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erreur chargement suivis :", error);
        setMessage({ type: "error", text: `Erreur chargement : ${error.message}` });
        setSuivis([]);
      } else {
        setSuivis(data || []);
      }
    } catch (err) {
      console.error("Exception fetchSuivis:", err);
      setMessage({ type: "error", text: `Exception fetch: ${err.message}` });
      setSuivis([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleDetails = (id) =>
    setDetailsOpen((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleStatusChange = (id, value) =>
    setStatusChanges((prev) => ({ ...prev, [id]: value }));

  const handleCommentChange = (id, value) =>
    setCommentChanges((prev) => ({ ...prev, [id]: value }));

  const updateSuivi = async (id) => {
    setMessage(null);
    const newStatus = statusChanges[id];
    const newComment = commentChanges[id];

    if (!newStatus && !newComment) {
      setMessage({ type: "info", text: "Aucun changement détecté." });
      return;
    }

    setUpdating((prev) => ({ ...prev, [id]: true }));

    try {
      const { data: currentData, error: fetchError } = await supabase
        .from("suivis_membres")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError) {
        console.error("Erreur récupération (fetch current) :", fetchError);
        setMessage({ type: "error", text: `Impossible de récupérer : ${fetchError.message}` });
        setUpdating((prev) => ({ ...prev, [id]: false }));
        return;
      }

      const payload = {};
      if (newStatus !== undefined && newStatus !== null) {
        payload["statut_suivis"] = newStatus;
      }
      if (newComment !== undefined && newComment !== null) {
        payload["commentaire"] = newComment;
      }
      payload["updated_at"] = new Date();

      const { data: updatedData, error: updateError } = await supabase
        .from("suivis_membres")
        .update(payload)
        .eq("id", id)
        .select()
        .single();

      if (updateError) {
        console.error("Erreur update :", updateError);
        setMessage({ type: "error", text: `Erreur mise à jour : ${updateError.message}` });
        setUpdating((prev) => ({ ...prev, [id]: false }));
        return;
      }

      if (updatedData) {
        setSuivis((prev) => prev.map((it) => (it.id === id ? updatedData : it)));
        setMessage({ type: "success", text: "Mise à jour enregistrée avec succès." });
      } else {
        await fetchSuivis();
        setMessage({ type: "success", text: "Mise à jour effectuée (rafraîchissement)." });
      }
    } catch (err) {
      console.error("Exception updateSuivi:", err);
      setMessage({ type: "error", text: `Exception : ${err.message}` });
    } finally {
      setUpdating((prev) => ({ ...prev, [id]: false }));
    }
  };

  const getBorderColor = (statut) => {
    if (statut === "actif") return "#4285F4";
    if (statut === "en attente") return "#FBC02D";
    if (statut === "inactif") return "#EA4335";
    if (statut === "suivi terminé") return "#34A853";
    return "#ccc";
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

      <p className="text-center text-white text-lg mb-4 font-handwriting-light">
        Liste des membres envoyés pour suivi 💬
      </p>

      {/* Toggle Vue */}
      <div className="flex justify-end w-full max-w-5xl mb-4">
        <button
          onClick={() => setView(view === "card" ? "table" : "card")}
          className="text-white text-sm underline hover:text-gray-200"
        >
          {view === "card" ? "Vue Table" : "Vue Carte"}
        </button>
      </div>

      {/* Message visible */}
      {message && (
        <div
          className={`mb-4 px-4 py-2 rounded-md text-sm ${
            message.type === "error"
              ? "bg-red-200 text-red-800"
              : message.type === "success"
              ? "bg-green-200 text-green-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Vue Table */}
      {view === "table" && !loading && suivis.length > 0 && (
        <div className="w-full max-w-6xl overflow-x-auto transition duration-200">
          <table className="w-full text-sm text-left text-white border-separate border-spacing-0">
            <thead className="bg-gray-200 text-gray-800 text-sm uppercase rounded-t-md">
              <tr>
                <th className="px-4 py-2 rounded-tl-lg">Nom complet</th>
                <th className="px-4 py-2">Téléphone</th>
                <th className="px-4 py-2">Statut suivi</th>
                <th className="px-4 py-2 rounded-tr-lg">Détails</th>
              </tr>
            </thead>
            <tbody>
              {suivis.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-white/10 transition duration-150 border-b border-blue-300"
                >
                  <td
                    className="px-4 py-2 border-l-4 rounded-l-md"
                    style={{ borderLeftColor: getBorderColor(item.statut_suivis || item.statut) }}
                  >
                    {item.prenom} {item.nom}
                  </td>
                  <td className="px-4 py-2">{item.telephone || "—"}</td>
                  <td className="px-4 py-2">
                    <select
                      value={statusChanges[item.id] ?? item.statut_suivis ?? item.statut ?? ""}
                      onChange={(e) => handleStatusChange(item.id, e.target.value)}
                      className="border rounded-md px-2 py-1 text-sm w-full text-gray-800"
                    >
                      <option value="">-- Choisir --</option>
                      <option value="actif">✅ Actif</option>
                      <option value="en attente">🕓 En attente</option>
                      <option value="suivi terminé">🏁 Terminé</option>
                      <option value="inactif">❌ Inactif</option>
                    </select>
                  </td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => toggleDetails(item.id)}
                      className="text-orange-400 underline text-sm"
                    >
                      Détails
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Vue Carte (originale) */}
      {view === "card" && (
        <>
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
                      🕊 : {item.cellule_nom || "—"}
                    </p>
                    <p className="text-sm text-gray-700 mb-1">
                      👑 Responsable : {item.responsable || "—"}
                    </p>
                    <p className="text-sm text-gray-700 mb-1">
                      📅 Créé le :{" "}
                      {item.created_at
                        ? new Date(item.created_at).toLocaleDateString("fr-FR", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                    </p>

                    <button
                      onClick={() => toggleDetails(item.id)}
                      className="text-blue-500 underline text-sm mt-1"
                    >
                      {isOpen ? "Fermer" : "Voir détails"}
                    </button>

                    {isOpen && (
                      <div className="text-gray-600 text-sm text-center mt-2 space-y-2 w-full">
                        <p>🙏 Besoin : {item.besoin || "—"}</p>
                        <p>🧩 Comment venu : {item.venu || "—"}</p>
                        <p>📝 Infos : {item.infos_supplementaires || "—"}</p>

                        <div className="mt-2">
                          <label className="text-gray-700 text-sm">💬 Commentaire :</label>
                          <textarea
                            value={commentChanges[item.id] ?? item.commentaire ?? ""}
                            onChange={(e) => handleCommentChange(item.id, e.target.value)}
                            rows={2}
                            className="w-full border rounded-md px-2 py-1 text-sm mt-1 resize-none"
                            placeholder="Ajouter un commentaire..."
                          ></textarea>
                        </div>

                        <div className="mt-2">
                          <label className="text-gray-700 text-sm">📋 Statut suivi :</label>
                          <select
                            value={
                              statusChanges[item.id] ??
                              item.statut_suivis ??
                              item.statut ??
                              ""
                            }
                            onChange={(e) => handleStatusChange(item.id, e.target.value)}
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
        </>
      )}
    </div>
  );
}
