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
  const [popupMember, setPopupMember] = useState(null);

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

  const handleBesoinChange = (id, value) =>
    setBesoinChanges((prev) => ({ ...prev, [id]: value }));

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
      const payload = {};
      if (newStatus) payload["statut_suivis"] = newStatus;
      if (newComment) payload["commentaire"] = newComment;
      if (newBesoin) payload["besoin"] = newBesoin;
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
        setMessage({ type: "success", text: "Mise à jour réussie." });
        setPopupMember(null);
      }
    } catch (err) {
      console.error("Exception updateSuivi:", err);
      setMessage({ type: "error", text: `Exception : ${err.message}` });
    } finally {
      setUpdating((prev) => ({ ...prev, [id]: false }));
    }
  };

  const getBorderColor = (m) => {
    if (m.statut_suivis === "actif") return "#4285F4";
    if (m.statut_suivis === "en attente") return "#FBC02D";
    if (m.statut_suivis === "suivi terminé") return "#34A853";
    if (m.statut_suivis === "inactif") return "#EA4335";
    return "#ccc";
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-6 transition-all duration-200"
      style={{ background: "linear-gradient(135deg, #2E3192 0%, #92EFFD 100%)" }}
    >
      {/* Header */}
      <div className="flex justify-between w-full max-w-5xl items-center mb-4">
        <button
          onClick={() => window.history.back()}
          className="flex items-center text-white font-semibold hover:text-gray-200"
        >
          ← Retour
        </button>
        <button
          onClick={() => setView(view === "card" ? "table" : "card")}
          className="text-white underline text-sm hover:text-gray-200"
        >
          {view === "card" ? "Vue Table" : "Vue Carte"}
        </button>
      </div>

      {/* Logo */}
      <div className="mt-2 mb-2">
        <Image src="/logo.png" alt="Logo" width={80} height={80} />
      </div>

      <h1 className="text-4xl font-handwriting text-white text-center mb-3">
        Suivis des Membres
      </h1>

      <p className="text-center text-white text-lg mb-6 font-handwriting-light">
        Liste des membres envoyés pour suivi 💬
      </p>

      {/* Message */}
      {message && (
        <div className={`mb-4 px-4 py-2 rounded-md text-sm ${
          message.type === "error"
            ? "bg-red-200 text-red-800"
            : message.type === "success"
            ? "bg-green-200 text-green-800"
            : "bg-yellow-100 text-yellow-800"
        }`}>
          {message.text}
        </div>
      )}

      {/* === Vue Carte === */}
      {view === "card" && !loading && suivis.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-6xl">
          {suivis.map((item) => {
            const isOpen = detailsOpen[item.id];
            const borderColor = getBorderColor(item);
            return (
              <div key={item.id}
                className="bg-white rounded-2xl shadow-lg flex flex-col items-center transition-all duration-300 hover:shadow-2xl relative"
              >
                {/* Bord coloré en haut */}
                <div className="w-full h-2 rounded-t-2xl" style={{ backgroundColor: borderColor }}></div>

                <div className="p-4 flex flex-col items-center w-full">
                  <h2 className="font-bold text-gray-800 text-base text-center mb-1">
                    👤 {item.prenom} {item.nom}
                  </h2>
                  <p className="text-sm text-gray-700 mb-1">📞 {item.telephone || "—"}</p>
                  <p className="text-sm text-gray-700 mb-1">🕊 WhatsApp : {item.is_whatsapp ? "Oui" : "Non"}</p>
                  <p className="text-sm text-gray-700 mb-1">🏙 Ville : {item.ville || "—"}</p>
                  <p className="text-sm text-gray-700 mb-1">Statut : {item.statut || "—"}</p>
                  <p className="text-sm text-gray-700 mb-1">🧩 Comment est-il venu : {item.venu || "—"}</p>
                  <p className="text-sm text-gray-700 mb-1">📝 Infos : {item.infos_supplementaires || "—"}</p>

                  {/* Bouton Détails */}
                  <button
                    onClick={() => setPopupMember(item)}
                    className="text-orange-400 underline text-sm mt-2"
                  >
                    Détails
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* === Vue Table === */}
      {view === "table" && !loading && suivis.length > 0 && (
        <div className="w-full max-w-5xl overflow-x-auto transition duration-200">
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
                <tr key={item.id} className="hover:bg-white/10 transition duration-150 border-b border-blue-300">
                  <td className="px-4 py-2 border-l-4 rounded-l-md" style={{ borderLeftColor: getBorderColor(item) }}>
                    {item.prenom} {item.nom}
                  </td>
                  <td className="px-4 py-2">{item.telephone}</td>
                  <td className="px-4 py-2">{item.statut_suivis || item.statut}</td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => setPopupMember(item)}
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

      {/* === Popup Détails (carte + table) === */}
      {popupMember && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 transition-all duration-200">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md relative">
            <button
              onClick={() => setPopupMember(null)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl"
            >
              ✖
            </button>

            <h2 className="text-xl font-bold mb-2 text-indigo-700">
              {popupMember.prenom} {popupMember.nom}
            </h2>

            <p className="text-sm text-gray-700 mb-1">📞 {popupMember.telephone || "—"}</p>
            <p className="text-sm text-gray-700 mb-1">🕊 WhatsApp : {popupMember.is_whatsapp ? "Oui" : "Non"}</p>
            <p className="text-sm text-gray-700 mb-1">🏙 Ville : {popupMember.ville || "—"}</p>
            <p className="text-sm text-gray-700 mb-1">Statut : {popupMember.statut || "—"}</p>
            <p className="text-sm text-gray-700 mb-1">🧩 Comment est-il venu : {popupMember.venu || "—"}</p>

            <div className="mt-2">
              <label className="text-gray-700 text-sm">💬 Besoin :</label>
              <select
                value={besoinChanges[popupMember.id] ?? popupMember.besoin ?? ""}
                onChange={(e) => handleBesoinChange(popupMember.id, e.target.value)}
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

            <p className="text-sm text-gray-700 mt-1">📝 Infos : {popupMember.infos_supplementaires || "—"}</p>

            <div className="mt-2">
              <label className="text-gray-700 text-sm">📋 Statut suivi :</label>
              <select
                value={statusChanges[popupMember.id] ?? popupMember.statut_suivis ?? popupMember.statut ?? ""}
                onChange={(e) => handleStatusChange(popupMember.id, e.target.value)}
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
              onClick={() => updateSuivi(popupMember.id)}
              disabled={updating[popupMember.id]}
              className={`mt-4 w-full text-white font-semibold py-1 rounded-md transition ${
                updating[popupMember.id] ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {updating[popupMember.id] ? "Mise à jour..." : "Mettre à jour"}
            </button>
          </div>
        </div>
      )}

      {loading && <p className="text-white">Chargement...</p>}
      {!loading && suivis.length === 0 && <p className="text-white text-lg italic">Aucun membre en suivi.</p>}
    </div>
  );
}

