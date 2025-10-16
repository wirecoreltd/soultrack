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
        console.error(error);
        setMessage({ type: "error", text: `Erreur chargement : ${error.message}` });
        setSuivis([]);
      } else {
        setSuivis(data || []);
      }
    } catch (err) {
      console.error(err);
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
    const payload = {};
    if (statusChanges[id]) payload["statut_suivis"] = statusChanges[id];
    if (commentChanges[id]) payload["commentaire"] = commentChanges[id];
    if (besoinChanges[id]) payload["besoin"] = besoinChanges[id];
    payload["updated_at"] = new Date();

    if (!payload.statut_suivis && !payload.commentaire && !payload.besoin) {
      setMessage({ type: "info", text: "Aucun changement détecté." });
      return;
    }

    setUpdating((prev) => ({ ...prev, [id]: true }));

    try {
      const { data: updatedData, error } = await supabase
        .from("suivis_membres")
        .update(payload)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error(error);
        setMessage({ type: "error", text: `Erreur mise à jour : ${error.message}` });
      } else if (updatedData) {
        setSuivis((prev) => prev.map((it) => (it.id === id ? updatedData : it)));
        setMessage({ type: "success", text: "Mise à jour enregistrée avec succès." });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: `Exception : ${err.message}` });
    } finally {
      setUpdating((prev) => ({ ...prev, [id]: false }));
    }
  };

  const getBorderColor = (item) => {
    switch (item.statut_suivis) {
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

  const besoinOptions = [
    "",
    "Finances",
    "Santé",
    "Travail",
    "Les Enfants",
    "La Famille",
  ];

  return (
    <div
      className="min-h-screen flex flex-col items-center p-6 transition-all duration-200"
      style={{
        background: "linear-gradient(135deg, #2E3192 0%, #92EFFD 100%)",
      }}
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

      {/* Toggle */}
      <div className="flex justify-end w-full max-w-5xl mb-6">
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
          {suivis.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl shadow-lg flex flex-col items-center transition-all duration-300 hover:shadow-2xl overflow-hidden"
            >
              {/* Bande colorée en haut */}
              <div
                className="w-full rounded-t-2xl"
                style={{
                  height: "4px",
                  backgroundColor: getBorderColor(item),
                }}
              />

              <div className="p-4 flex flex-col items-center w-full">
                <h2 className="font-bold text-gray-900 text-base text-center mb-1">
                  👤 {item.prenom} {item.nom}
                </h2>
                <p className="text-sm text-gray-700 mb-1">📞 {item.telephone || "—"}</p>
                <p className="text-sm text-gray-700 mb-1">WhatsApp: {item.whatsapp || "—"}</p>
                <p className="text-sm text-gray-700 mb-1">Ville: {item.ville || "—"}</p>
                <p className="text-sm text-gray-700 mb-1">Statut: {item.statut || "—"}</p>
                <p className="text-sm text-gray-700 mb-1">
                  Comment est-il venu: {item.venu || "—"}
                </p>

                <button
                  onClick={() => toggleDetails(item.id)}
                  className="text-orange-400 underline text-sm mt-1"
                >
                  {detailsOpen[item.id] ? "Fermer" : "Détails"}
                </button>

                {detailsOpen[item.id] && (
                  <PopupDetails
                    item={item}
                    statusChanges={statusChanges}
                    commentChanges={commentChanges}
                    besoinChanges={besoinChanges}
                    updating={updating}
                    handleStatusChange={handleStatusChange}
                    handleCommentChange={handleCommentChange}
                    handleBesoinChange={handleBesoinChange}
                    updateSuivi={updateSuivi}
                    toggleDetails={toggleDetails}
                    getBorderColor={getBorderColor}
                    besoinOptions={besoinOptions}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // === TABLE ===
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
                  <td className="px-4 py-2">{item.statut}</td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => toggleDetails(item.id)}
                      className="text-orange-400 underline text-sm"
                    >
                      Détails
                    </button>
                  </td>

                  {detailsOpen[item.id] && (
                    <tr>
                      <td colSpan="4">
                        <PopupDetails
                          item={item}
                          statusChanges={statusChanges}
                          commentChanges={commentChanges}
                          besoinChanges={besoinChanges}
                          updating={updating}
                          handleStatusChange={handleStatusChange}
                          handleCommentChange={handleCommentChange}
                          handleBesoinChange={handleBesoinChange}
                          updateSuivi={updateSuivi}
                          toggleDetails={toggleDetails}
                          getBorderColor={getBorderColor}
                          besoinOptions={besoinOptions}
                        />
                      </td>
                    </tr>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// === PopupDetails Component ===
function PopupDetails({
  item,
  statusChanges,
  commentChanges,
  besoinChanges,
  updating,
  handleStatusChange,
  handleCommentChange,
  handleBesoinChange,
  updateSuivi,
  toggleDetails,
  getBorderColor,
  besoinOptions,
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2">
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
        <p className="text-gray-700 text-sm mb-1">📞 {item.telephone || "—"}</p>
        <p className="text-gray-700 text-sm mb-1">WhatsApp: {item.whatsapp || "—"}</p>
        <p className="text-gray-700 text-sm mb-1">Ville: {item.ville || "—"}</p>
        <p className="text-gray-700 text-sm mb-1">Statut: {item.statut || "—"}</p>
        <p className="text-gray-700 text-sm mb-1">Comment est-il venu: {item.venu || "—"}</p>

        <div className="mt-2">
          <label className="text-gray-700 text-sm">Besoin :</label>
          <select
            value={besoinChanges[item.id] ?? item.besoin ?? ""}
            onChange={(e) => handleBesoinChange(item.id, e.target.value)}
            className="w-full border rounded-md px-2 py-1 text-sm mt-1"
          >
            {besoinOptions.map((b, idx) => (
              <option key={idx} value={b}>
                {b || "-- Sélectionner --"}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-2">
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

        <div className="mt-3 flex justify-center">
          <button
            onClick={() => updateSuivi(item.id)}
            disabled={updating[item.id]}
            className={`w-full text-white font-semibold py-1 rounded-md transition ${
              updating[item.id]
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {updating[item.id] ? "Mise à jour..." : "Mettre à jour"}
          </button>
        </div>
      </div>
    </div>
  );
}
