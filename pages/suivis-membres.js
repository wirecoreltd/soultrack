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
  const [besoinChanges, setBesoinChanges] = useState({});
  const [updating, setUpdating] = useState({});
  const [message, setMessage] = useState(null);
  const [view, setView] = useState("card");

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
        console.error("Erreur chargement :", error);
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

  const handleBesoinChange = (id, value) =>
    setBesoinChanges((prev) => ({ ...prev, [id]: value }));

  const updateSuivi = async (id) => {
    setMessage(null);
    const payload = {
      statut_suivis: statusChanges[id] ?? suivis.find((s) => s.id === id)?.statut_suivis,
      commentaire: commentChanges[id] ?? suivis.find((s) => s.id === id)?.commentaire,
      besoin: besoinChanges[id] ?? suivis.find((s) => s.id === id)?.besoin,
      updated_at: new Date(),
    };

    setUpdating((prev) => ({ ...prev, [id]: true }));

    try {
      const { data: updatedData, error } = await supabase
        .from("suivis_membres")
        .update(payload)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Erreur update :", error);
        setMessage({ type: "error", text: `Erreur mise à jour : ${error.message}` });
      } else {
        setSuivis((prev) => prev.map((s) => (s.id === id ? updatedData : s)));
        setMessage({ type: "success", text: "Mise à jour réussie." });
        setStatusChanges((prev) => ({ ...prev, [id]: undefined }));
        setCommentChanges((prev) => ({ ...prev, [id]: undefined }));
        setBesoinChanges((prev) => ({ ...prev, [id]: undefined }));
      }
    } catch (err) {
      console.error("Exception updateSuivi:", err);
      setMessage({ type: "error", text: `Exception durant la mise à jour : ${err.message}` });
    } finally {
      setUpdating((prev) => ({ ...prev, [id]: false }));
    }
  };

  const getBorderColor = (item) => {
    const status = item.statut_suivis ?? item.statut ?? "";
    if (status === "actif") return "#4285F4";
    if (status === "en attente") return "#FFA500";
    if (status === "suivi terminé") return "#34A853";
    if (status === "inactif") return "#999999";
    return "#ccc";
  };

  const besoinsOptions = [
    "Finances",
    "Santé",
    "Travail",
    "Les Enfants",
    "La Famille",
  ];

  return (
    <div className="min-h-screen flex flex-col items-center p-6"
      style={{ background: "linear-gradient(135deg, #2E3192 0%, #92EFFD 100%)" }}
    >
      {/* Retour + Logo */}
      <div className="flex justify-between w-full max-w-5xl items-center mb-4">
        <button
          onClick={() => window.history.back()}
          className="flex items-center text-white font-semibold hover:text-gray-200"
        >
          ← Retour
        </button>
        <Image src="/logo.png" alt="Logo" width={80} height={80} />
      </div>

      <h1 className="text-4xl font-handwriting text-white text-center mb-2">
        Suivis des Membres
      </h1>

      {/* Toggle Vue Carte / Table */}
      <div className="flex justify-end w-full max-w-5xl mb-4">
        <button
          onClick={() => setView(view === "card" ? "table" : "card")}
          className="text-white text-sm underline hover:text-gray-200"
        >
          {view === "card" ? "Vue Table" : "Vue Carte"}
        </button>
      </div>

      {message && (
        <div className={`mb-4 px-4 py-2 rounded-md text-sm ${
          message.type === "error" ? "bg-red-200 text-red-800"
          : message.type === "success" ? "bg-green-200 text-green-800"
          : "bg-yellow-100 text-yellow-800"
        }`}>
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
              <div key={item.id} className="bg-white rounded-2xl shadow-lg flex flex-col items-center transition-all duration-300 hover:shadow-2xl">
                {/* Bande colorée intégrée */}
                <div
                  className="rounded-t-2xl w-full"
                  style={{ backgroundColor: getBorderColor(item), height: "6px" }}
                />
                <div className="p-4 flex flex-col items-center w-full">
                  <h2 className="font-bold text-gray-900 text-base text-center mb-1">
                    👤 {item.prenom} {item.nom}
                  </h2>
                  <p className="text-sm text-gray-700 mb-1">📞 {item.telephone || "—"}</p>
                  <p className="text-sm text-gray-700 mb-1">WhatsApp: {item.whatsapp || "—"}</p>
                  <p className="text-sm text-gray-700 mb-1">Ville: {item.ville || "—"}</p>
                  <p className="text-sm text-gray-700 mb-1">Statut: {item.statut || "—"}</p>
                  <p className="text-sm text-gray-700 mb-1">Comment est-il venu: {item.venu || "—"}</p>

                  <button
                    onClick={() => toggleDetails(item.id)}
                    className="text-orange-400 underline text-sm mt-1"
                  >
                    {isOpen ? "Fermer" : "Détails"}
                  </button>

                  {isOpen && (
                    <div className="text-gray-600 text-sm text-center mt-2 space-y-2 w-full">
                      <div>
                        <label className="text-gray-700 text-sm">💬 Commentaire :</label>
                        <textarea
                          value={commentChanges[item.id] ?? item.commentaire ?? ""}
                          onChange={(e) => handleCommentChange(item.id, e.target.value)}
                          rows={2}
                          className="w-full border rounded-md px-2 py-1 text-sm mt-1 resize-none"
                        />
                      </div>

                      <div>
                        <label className="text-gray-700 text-sm">📋 Statut suivi :</label>
                        <select
                          value={statusChanges[item.id] ?? item.statut_suivis ?? ""}
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

                      <div>
                        <label className="text-gray-700 text-sm">🛠 Besoin :</label>
                        <select
                          value={besoinChanges[item.id] ?? item.besoin ?? ""}
                          onChange={(e) => handleBesoinChange(item.id, e.target.value)}
                          className="w-full border rounded-md px-2 py-1 text-sm mt-1"
                        >
                          <option value="">-- Sélectionner --</option>
                          <option value="Finances">Finances</option>
                          <option value="Santé">Santé</option>
                          <option value="Travail">Travail</option>
                          <option value="Les Enfants">Les Enfants</option>
                          <option value="La Famille">La Famille</option>
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
              </div>
            );
          })}
        </div>
      ) : (
        /* === VUE TABLE === */
        <div className="w-full max-w-5xl overflow-x-auto transition duration-200">
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
                <tr key={item.id} className="hover:bg-white/10 transition duration-150 border-b border-blue-300">
                  <td
                    className="px-4 py-2 border-l-4 rounded-l-md"
                    style={{ borderLeftColor: getBorderColor(item) }}
                  >
                    {item.prenom} {item.nom}
                  </td>
                  <td className="px-4 py-2">{item.telephone}</td>
                  <td className="px-4 py-2">{item.statut_suivis ?? item.statut ?? ""}</td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => toggleDetails(item.id)}
                      className="text-orange-400 underline text-sm"
                    >
                      Détails
                    </button>

                    {detailsOpen[item.id] && (
                      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 transition-all duration-200">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative">
                          {/* Bande colorée en haut du popup */}
                          <div
                            className="rounded-t-2xl w-full"
                            style={{ backgroundColor: getBorderColor(item), height: "6px" }}
                          />
                          <div className="p-4">
                            <h2 className="font-bold text-gray-900 text-base text-center mb-1">
                              👤 {item.prenom} {item.nom}
                            </h2>
                            <p className="text-sm text-gray-700 mb-1">📞 {item.telephone || "—"}</p>
                            <p className="text-sm text-gray-700 mb-1">WhatsApp: {item.whatsapp || "—"}</p>
                            <p className="text-sm text-gray-700 mb-1">Ville: {item.ville || "—"}</p>
                            <p className="text-sm text-gray-700 mb-1">Statut: {item.statut || "—"}</p>
                            <p className="text-sm text-gray-700 mb-1">Comment est-il venu: {item.venu || "—"}</p>

                            <div>
                              <label className="text-gray-700 text-sm">💬 Commentaire :</label>
                              <textarea
                                value={commentChanges[item.id] ?? item.commentaire ?? ""}
                                onChange={(e) => handleCommentChange(item.id, e.target.value)}
                                rows={2}
                                className="w-full border rounded-md px-2 py-1 text-sm mt-1 resize-none"
                              />
                            </div>

                            <div>
                              <label className="text-gray-700 text-sm">📋 Statut suivi :</label>
                              <select
                                value={statusChanges[item.id] ?? item.statut_suivis ?? ""}
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

                            <div>
                              <label className="text-gray-700 text-sm">🛠 Besoin :</label>
                              <select
                                value={besoinChanges[item.id] ?? item.besoin ?? ""}
                                onChange={(e) => handleBesoinChange(item.id, e.target.value)}
                                className="w-full border rounded-md px-2 py-1 text-sm mt-1"
                              >
                                <option value="">-- Sélectionner --</option>
                                <option value="Finances">Finances</option>
                                <option value="Santé">Santé</option>
                                <option value="Travail">Travail</option>
                                <option value="Les Enfants">Les Enfants</option>
                                <option value="La Famille">La Famille</option>
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

                            <button
                              onClick={() => toggleDetails(item.id)}
                              className="absolute top-2 right-3 text-gray-500 hover:text-gray-700 text-xl"
                            >
                              ✖
                            </button>
                          </div>
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
