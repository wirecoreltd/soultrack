//pages/suivis-membres.js
"use client";

import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import Image from "next/image";

export default function SuivisMembres() {
  const [suivis, setSuivis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailsOpen, setDetailsOpen] = useState(null); // id du popup ouvert
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

  const toggleDetails = (id) => setDetailsOpen(detailsOpen === id ? null : id);

  const handleStatusChange = (id, value) =>
    setStatusChanges((prev) => ({ ...prev, [id]: value }));
  const handleCommentChange = (id, value) =>
    setCommentChanges((prev) => ({ ...prev, [id]: value }));
  const handleBesoinChange = (id, value) =>
    setBesoinChanges((prev) => ({ ...prev, [id]: value }));

  const getBorderColor = (status) => {
    switch (status) {
      case "actif":
        return "#4285F4";
      case "en attente":
        return "#FBC02D";
      case "suivi terminé":
        return "#34A853";
      case "inactif":
        return "#EA4335";
      default:
        return "#ccc";
    }
  };

  const updateSuivi = async (id) => {
    setMessage(null);
    const newStatus = statusChanges[id];
    const newComment = commentChanges[id];
    const newBesoin = besoinChanges[id];

    if (!newStatus && !newComment && !newBesoin) {
      setMessage({ type: "info", text: "Aucun changement détecté." });
      return;
    }

    setUpdating((prev) => ({ ...prev, [id]: true }));

    try {
      const payload = { updated_at: new Date() };
      if (newStatus) payload.statut_suivis = newStatus;
      if (newComment) payload.commentaire = newComment;
      if (newBesoin) payload.besoin = newBesoin;

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
        setSuivis((prev) => prev.map((it) => (it.id === id ? updatedData : it)));
        setMessage({ type: "success", text: "Mise à jour enregistrée avec succès." });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: `Exception durant la mise à jour : ${err.message}` });
    } finally {
      setUpdating((prev) => ({ ...prev, [id]: false }));
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center p-6"
      style={{ background: "linear-gradient(135deg, #2E3192 0%, #92EFFD 100%)" }}
    >
      <button
        onClick={() => window.history.back()}
        className="self-start mb-4 text-white font-semibold hover:text-gray-200"
      >
        ← Retour
      </button>

      <Image src="/logo.png" alt="Logo" width={80} height={80} className="mb-3" />
      <h1 className="text-4xl font-handwriting text-white text-center mb-2">
        Suivis des Membres
      </h1>

      {/* Toggle à droite */}
      <div className="flex justify-end w-full max-w-5xl mb-4">
        <button
          onClick={() => setView(view === "card" ? "table" : "card")}
          className="text-white text-sm underline hover:text-gray-200"
        >
          {view === "card" ? "Vue Table" : "Vue Carte"}
        </button>
      </div>

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
            const borderColor = getBorderColor(item.statut_suivis);
            const isOpen = detailsOpen === item.id;
            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl shadow-lg flex flex-col items-center transition-all duration-300 hover:shadow-2xl w-full"
              >
                {/* Bande colorée en haut, moitié hauteur */}
                <div
                  className="w-full h-1.5 rounded-t-2xl"
                  style={{ backgroundColor: borderColor }}
                ></div>

                <div className="p-4 flex flex-col items-center w-full">
                  <h2 className="font-bold text-black text-base text-center mb-1">
                    👤 {item.prenom} {item.nom}
                  </h2>
                  <p className="text-sm text-gray-700 mb-1">📞 {item.telephone || "—"}</p>

                  <button
                    onClick={() => toggleDetails(item.id)}
                    className="text-orange-500 underline text-sm mt-2"
                  >
                    {isOpen ? "Fermer" : "Détails"}
                  </button>

                  {isOpen && (
                    <div className="mt-2 w-full text-center space-y-2">
                      {/* Tous les champs comme popup */}
                      <div>
                        <label className="text-gray-700 text-sm">💬 WhatsApp :</label>
                        <p>{item.whatsapp || "—"}</p>
                      </div>
                      <div>
                        <label className="text-gray-700 text-sm">🏙️ Ville :</label>
                        <p>{item.ville || "—"}</p>
                      </div>
                      <div>
                        <label className="text-gray-700 text-sm">⚡ Statut :</label>
                        <p>{item.statut || "—"}</p>
                      </div>
                      <div>
                        <label className="text-gray-700 text-sm">🧩 Comment est-il venu :</label>
                        <p>{item.venu || "—"}</p>
                      </div>
                      <div>
                        <label className="text-gray-700 text-sm">📝 Infos :</label>
                        <p>{item.infos_supplementaires || "—"}</p>
                      </div>

                      {/* Besoin */}
                      <div>
                        <label className="text-gray-700 text-sm">🙏 Besoin :</label>
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

                      {/* Statut suivis */}
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
                        <label className="text-gray-700 text-sm">📝 Commentaire :</label>
                        <textarea
                          value={commentChanges[item.id] ?? item.commentaire ?? ""}
                          onChange={(e) => handleCommentChange(item.id, e.target.value)}
                          rows={2}
                          className="w-full border rounded-md px-2 py-1 text-sm mt-1 resize-none"
                          placeholder="Ajouter un commentaire..."
                        ></textarea>
                      </div>

                      <button
                        onClick={() => updateSuivi(item.id)}
                        disabled={updating[item.id]}
                        className={`mt-2 w-full text-white font-semibold py-1 rounded-md transition ${
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
        // Table simplifiée
        <div className="w-full max-w-5xl overflow-x-auto">
          <table className="w-full text-sm text-left text-white border-separate border-spacing-0">
            <thead className="bg-gray-200 text-gray-800 text-sm uppercase">
              <tr>
                <th className="px-4 py-2 rounded-tl-lg">Nom complet</th>
                <th className="px-4 py-2">Téléphone</th>
                <th className="px-4 py-2">Statut</th>
                <th className="px-4 py-2 rounded-tr-lg">Détails</th>
              </tr>
            </thead>
            <tbody>
              {suivis.map((item) => {
                const borderColor = getBorderColor(item.statut_suivis);
                const isOpen = detailsOpen === item.id;
                return (
                  <tr key={item.id} className="hover:bg-white/10 transition duration-150 border-b border-blue-300">
                    <td className="px-4 py-2 border-l-4 rounded-l-md" style={{ borderLeftColor: borderColor }}>
                      {item.prenom} {item.nom}
                    </td>
                    <td className="px-4 py-2">{item.telephone}</td>
                    <td className="px-4 py-2">{item.statut}</td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => toggleDetails(item.id)}
                        className="text-orange-500 underline text-sm"
                      >
                        {isOpen ? "Fermer" : "Détails"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Popup global pour table */}
          {detailsOpen && (
            <div className="fixed inset-0 bg-black/40 flex justify-center items-start pt-20 z-50">
              <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md">
                {suivis
                  .filter((item) => item.id === detailsOpen)
                  .map((item) => {
                    return (
                      <div key={item.id} className="space-y-2">
                        <h2 className="font-bold text-black text-lg text-center">
                          👤 {item.prenom} {item.nom}
                        </h2>
                        <p>📞 {item.telephone || "—"}</p>
                        <p>💬 WhatsApp : {item.whatsapp || "—"}</p>
                        <p>🏙️ Ville : {item.ville || "—"}</p>
                        <p>⚡ Statut : {item.statut || "—"}</p>
                        <p>🧩 Comment est-il venu : {item.venu || "—"}</p>
                        <p>📝 Infos : {item.infos_supplementaires || "—"}</p>

                        {/* Besoin */}
                        <div>
                          <label className="text-gray-700 text-sm">🙏 Besoin :</label>
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

                        {/* Statut suivis */}
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
                          <label className="text-gray-700 text-sm">📝 Commentaire :</label>
                          <textarea
                            value={commentChanges[item.id] ?? item.commentaire ?? ""}
                            onChange={(e) => handleCommentChange(item.id, e.target.value)}
                            rows={2}
                            className="w-full border rounded-md px-2 py-1 text-sm mt-1 resize-none"
                            placeholder="Ajouter un commentaire..."
                          ></textarea>
                        </div>

                        <button
                          onClick={() => updateSuivi(item.id)}
                          disabled={updating[item.id]}
                          className={`mt-2 w-full text-white font-semibold py-1 rounded-md transition ${
                            updating[item.id]
                              ? "bg-gray-400 cursor-not-allowed"
                              : "bg-green-600 hover:bg-green-700"
                          }`}
                        >
                          {updating[item.id] ? "Mise à jour..." : "Mettre à jour"}
                        </button>

                        <button
                          onClick={() => setDetailsOpen(null)}
                          className="mt-2 w-full text-gray-600 border border-gray-300 rounded-md py-1 hover:bg-gray-100"
                        >
                          Fermer
                        </button>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
