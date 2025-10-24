// pages/suivis-membres.js
"use client";

import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import Image from "next/image";
import AccessGuard from "../components/AccessGuard";

export default function SuivisMembres() {
  const [suivis, setSuivis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailsOpen, setDetailsOpen] = useState({});
  const [statusChanges, setStatusChanges] = useState({});
  const [commentChanges, setCommentChanges] = useState({});
  const [updating, setUpdating] = useState({});
  const [view, setView] = useState("card");
  const [message, setMessage] = useState(null);

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

  const getBorderColor = (m) => {
    if (m.statut_suivis === "actif") return "#4285F4";
    if (m.statut_suivis === "en attente") return "#FFA500";
    if (m.statut_suivis === "suivi terminé") return "#34A853";
    if (m.statut_suivis === "inactif") return "#999999";
    return "#ccc";
  };

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
      const payload = {};
      if (newStatus) payload["statut_suivis"] = newStatus;
      if (newComment) payload["commentaire_suivis"] = newComment;
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
      } else if (updatedData) {
        setSuivis((prev) => prev.map((it) => (it.id === id ? updatedData : it)));
        setMessage({ type: "success", text: "Mise à jour enregistrée avec succès." });
      }
    } catch (err) {
      console.error("Exception updateSuivi:", err);
      setMessage({ type: "error", text: `Exception durant la mise à jour : ${err.message}` });
    } finally {
      setUpdating((prev) => ({ ...prev, [id]: false }));
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center p-6 transition-all duration-200"
      style={{ background: "linear-gradient(135deg, #2E3192 0%, #92EFFD 100%)" }}
    >
      <div className="flex justify-between w-full max-w-5xl items-center mb-4">
        <button
          onClick={() => window.history.back()}
          className="flex items-center text-white font-semibold hover:text-gray-200"
        >
          ← Retour
        </button>
        <button
          onClick={() => setView(view === "card" ? "table" : "card")}
          className="text-white text-sm underline hover:text-gray-200"
        >
          {view === "card" ? "Vue Table" : "Vue Carte"}
        </button>
      </div>

      <h1 className="text-4xl font-handwriting text-white text-center mb-3">
        Liste des membres suivis
      </h1>

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

      {loading ? (
        <p className="text-white">Chargement...</p>
      ) : suivis.length === 0 ? (
        <p className="text-white text-lg italic">Aucun membre en suivi pour le moment.</p>
      ) : view === "card" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-6xl">
          {suivis.map((item) => {
            const isOpen = detailsOpen[item.id];
            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl shadow-lg flex flex-col w-full transition-all duration-300 hover:shadow-2xl overflow-hidden"
              >
                {/* ✅ Bande colorée collée à l'intérieur du haut */}
                <div
                  className="w-full h-[6px] rounded-t-2xl"
                  style={{
                    backgroundColor: getBorderColor(item),
                  }}
                />
                <div className="p-4 flex flex-col items-center">
                  <h2 className="font-bold text-black text-base text-center mb-1">
                    {item.prenom} {item.nom}
                  </h2>
                  <p className="text-sm text-gray-700 mb-1">📞 {item.telephone || "—"}</p>
                  <p className="text-sm text-gray-700 mb-1">🏠 Cellule : {item.cellule_nom || "—"}</p>  
                  <p className="text-sm text-gray-700 mb-1">🕊 Statut : {item.statut || "—"}</p>
                  <p className="text-sm text-gray-700 mb-1">
                    📋 Statut Suivis : {item.statut_suivis || "—"}
                  </p>
                  <button
                    onClick={() => toggleDetails(item.id)}
                    className="text-orange-500 underline text-sm mt-1"
                  >
                    {isOpen ? "Fermer détails" : "Détails"}
                  </button>

                  {isOpen && (
                    <div className="text-gray-700 text-sm mt-2 space-y-2 w-full">
                      <p>📌 Prénom Nom : {item.prenom} {item.nom}</p>
                      <p>📞 Téléphone : {item.telephone || "—"}</p>
                      <p>💬 WhatsApp : {item.whatsapp || "—"}</p>
                      <p>🏙 Ville : {item.ville || "—"}</p>
                      <p>🕊 Statut : {item.statut || "—"}</p>
                      <p>🧩 Comment est-il venu : {item.venu || "—"}</p>
                      <p>📝 Infos : {item.infos_supplementaires || "—"}</p>
                      <div>
                        <label className="text-black text-sm">BESOIN :</label>
                        <select
                          value={item.besoin || ""}
                          className="w-full border rounded-md px-2 py-1 text-black text-sm mt-1"
                        >
                          <option value="">-- Sélectionner --</option>
                          <option value="Finances">Finances</option>
                          <option value="Santé">Santé</option>
                          <option value="Travail">Travail</option>
                          <option value="Les Enfants">Les Enfants</option>
                          <option value="La Famille">La Famille</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-black text-sm">📋 Statut Suivis :</label>
                        <select
                          value={statusChanges[item.id] ?? item.statut_suivis ?? ""}
                          onChange={(e) => handleStatusChange(item.id, e.target.value)}
                          className="w-full border rounded-md px-2 py-1 text-black text-sm mt-1"
                        >
                          <option value="">-- Choisir un statut --</option>
                          <option value="actif">✅ Actif</option>
                          <option value="en attente">🕓 En attente</option>
                          <option value="suivi terminé">🏁 Terminé</option>
                          <option value="inactif">❌ Inactif</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-black text-sm">📝 Commentaire Suivis :</label>
                        <textarea
                          value={commentChanges[item.id] ?? item.commentaire_suivis ?? ""}
                          onChange={(e) => handleCommentChange(item.id, e.target.value)}
                          rows={2}
                          className="w-full border rounded-md px-2 py-1 text-black text-sm mt-1 resize-none"
                          placeholder="Ajouter un commentaire..."
                        />
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
              </div>
            );
          })}
        </div>
      ) : (
        // Vue Table identique
        <div className="w-full max-w-6xl overflow-x-auto transition duration-200">
          <table className="w-full text-sm text-left text-white border-separate border-spacing-0">
            <thead className="bg-gray-200 text-gray-800 text-sm uppercase rounded-t-md">
              <tr>
                <th className="px-4 py-2 rounded-tl-lg">Nom complet</th>
                <th className="px-4 py-2">Téléphone</th>
                <th className="px-4 py-2">Statut</th>
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
                    style={{ borderLeftColor: getBorderColor(item) }}
                  >
                    {item.prenom} {item.nom}
                  </td>
                  <td className="px-4 py-2">{item.telephone}</td>
                  <td className="px-4 py-2">{item.statut || "—"}</td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => toggleDetails(item.id)}
                      className="text-orange-500 underline text-sm"
                    >
                      {detailsOpen[item.id] ? "Fermer détails" : "Détails"}
                    </button>

                    {detailsOpen[item.id] && (
                      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 transition-all duration-200">
                        <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md relative">
                          <button
                            onClick={() => toggleDetails(item.id)}
                            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl"
                          >
                            ✖
                          </button>
                          <h2 className="text-xl font-bold mb-2 text-black">
                            {item.prenom} {item.nom}
                          </h2>
                          <p className="text-black text-sm mb-1">
                            📞 {item.telephone || "—"}
                          </p>
                          <p className="text-black text-sm mb-1">
                            💬 WhatsApp : {item.whatsapp || "—"}
                          </p>
                          <p className="text-black text-sm mb-1">🏙 Ville : {item.ville || "—"}</p>
                          <p className="text-black text-sm mb-1">🕊 Statut : {item.statut || "—"}</p>
                          <p className="text-black text-sm mb-1">🧩 Comment est-il venu : {item.venu || "—"}</p>
                          <p className="text-black text-sm mb-1">📝 Infos : {item.infos_supplementaires || "—"}</p>
                          <div>
                            <label className="text-black text-sm">BESOIN :</label>
                            <select
                              value={item.besoin || ""}
                              className="w-full border rounded-md px-2 py-1 text-black text-sm mt-1"
                            >
                              <option value="">-- Sélectionner --</option>
                              <option value="Finances">Finances</option>
                              <option value="Santé">Santé</option>
                              <option value="Travail">Travail</option>
                              <option value="Les Enfants">Les Enfants</option>
                              <option value="La Famille">La Famille</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-black text-sm">📋 Statut Suivis :</label>
                            <select
                              value={statusChanges[item.id] ?? item.statut_suivis ?? ""}
                              onChange={(e) => handleStatusChange(item.id, e.target.value)}
                              className="w-full border rounded-md px-2 py-1 text-black text-sm mt-1"
                            >
                              <option value="">-- Choisir un statut --</option>
                              <option value="actif">✅ Actif</option>
                              <option value="en attente">🕓 En attente</option>
                              <option value="suivi terminé">🏁 Terminé</option>
                              <option value="inactif">❌ Inactif</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-black text-sm">📝 Commentaire Suivis :</label>
                            <textarea
                              value={commentChanges[item.id] ?? item.commentaire_suivis ?? ""}
                              onChange={(e) => handleCommentChange(item.id, e.target.value)}
                              rows={2}
                              className="w-full border rounded-md px-2 py-1 text-black text-sm mt-1 resize-none"
                              placeholder="Ajouter un commentaire..."
                            />
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
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
