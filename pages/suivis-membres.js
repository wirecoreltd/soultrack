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
        setMessage({ type: "error", text: `Erreur chargement : ${error.message}` });
        setSuivis([]);
      } else {
        setSuivis(data || []);
      }
    } catch (err) {
      setMessage({ type: "error", text: `Exception fetch: ${err.message}` });
      setSuivis([]);
    } finally {
      setLoading(false);
    }
  };

  const getBorderColor = (item) => {
    if (item.statut_suivis === "actif") return "#4285F4";
    if (item.statut_suivis === "en attente") return "#FBC02D";
    if (item.statut_suivis === "suivi terminé") return "#34A853";
    if (item.statut_suivis === "inactif") return "#EA4335";
    return "#ccc";
  };

  const toggleDetails = (id) => setDetailsOpen((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleStatusChange = (id, value) =>
    setStatusChanges((prev) => ({ ...prev, [id]: value }));
  const handleCommentChange = (id, value) =>
    setCommentChanges((prev) => ({ ...prev, [id]: value }));
  const handleBesoinChange = (id, value) =>
    setBesoinChanges((prev) => ({ ...prev, [id]: value }));

  const updateSuivi = async (id) => {
    setMessage(null);
    const payload = {
      updated_at: new Date(),
      ...(statusChanges[id] ? { statut_suivis: statusChanges[id] } : {}),
      ...(commentChanges[id] ? { commentaire: commentChanges[id] } : {}),
      ...(besoinChanges[id] ? { besoin: besoinChanges[id] } : {}),
    };
    if (Object.keys(payload).length === 1) {
      setMessage({ type: "info", text: "Aucun changement détecté." });
      return;
    }
    setUpdating((prev) => ({ ...prev, [id]: true }));
    const { data, error } = await supabase
      .from("suivis_membres")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      setMessage({ type: "error", text: `Erreur mise à jour : ${error.message}` });
    } else {
      setSuivis((prev) => prev.map((it) => (it.id === id ? data : it)));
      setMessage({ type: "success", text: "Mise à jour réussie." });
      setPopupMember(null);
    }
    setUpdating((prev) => ({ ...prev, [id]: false }));
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-gradient-to-br from-purple-700 to-indigo-500">
      <button
        onClick={() => window.history.back()}
        className="self-start mb-4 text-white font-semibold hover:text-gray-200"
      >
        ← Retour
      </button>

      <Image src="/logo.png" alt="Logo" width={80} height={80} className="mb-3" />

      <h1 className="text-4xl font-handwriting text-white text-center mb-2">
        Liste des membres
      </h1>

      {/* Toggle vue sous le titre */}
      <div className="flex justify-start w-full max-w-5xl mb-4">
        <button
          onClick={() => setView(view === "card" ? "table" : "card")}
          className="text-white text-sm underline hover:text-gray-200"
        >
          {view === "card" ? "Vue Table" : "Vue Carte"}
        </button>
      </div>

      <p className="text-center text-white text-lg mb-6 font-handwriting-light">
        Liste des membres envoyés pour suivi 💬
      </p>

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
                className="bg-white rounded-2xl shadow-lg flex flex-col transition-all duration-300 hover:shadow-2xl w-full"
              >
                {/* Bande colorée en haut */}
                <div
                  className="w-full h-2 rounded-t-2xl"
                  style={{ backgroundColor: getBorderColor(item) }}
                ></div>

                <div className="p-4 flex flex-col items-center w-full">
                  <h2 className="text-gray-800 text-base text-center mb-1 font-bold">
                    👤 {item.prenom} {item.nom}
                  </h2>

                  <p className="text-sm text-gray-700 mb-1">📞 {item.telephone || "—"}</p>
                  <p className="text-sm text-gray-700 mb-1">
                    🕊 WhatsApp : {item.is_whatsapp ? "Oui" : "Non"}
                  </p>
                  <p className="text-sm text-gray-700 mb-1">🏙 Ville : {item.ville || "—"}</p>
                  <p className="text-sm text-gray-700 mb-1">Statut : {item.statut || "—"}</p>
                  <p className="text-sm text-gray-700 mb-1">
                    Comment est-il venu : {item.venu || "—"}
                  </p>

                  <button
                    onClick={() => setPopupMember(item)}
                    className="text-orange-400 text-sm underline mt-1"
                  >
                    Détails
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* === VUE TABLE === */
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
              {suivis.map((m) => (
                <tr
                  key={m.id}
                  className="hover:bg-white/10 transition duration-150 border-b border-blue-300"
                >
                  <td
                    className="px-4 py-2 border-l-4 rounded-l-md"
                    style={{ borderLeftColor: getBorderColor(m) }}
                  >
                    {m.prenom} {m.nom}
                  </td>
                  <td className="px-4 py-2">{m.telephone}</td>
                  <td className="px-4 py-2">{m.statut}</td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => setPopupMember(m)}
                      className="text-orange-400 text-sm underline"
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

      {/* === POPUP DETAILS === */}
      {popupMember && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md relative">
            <button
              onClick={() => setPopupMember(null)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl"
            >
              ✖
            </button>
            <h2 className="text-xl font-bold mb-2 text-black">
              {popupMember.prenom} {popupMember.nom}
            </h2>
            <p className="text-sm text-gray-700 mb-1">📞 {popupMember.telephone || "—"}</p>
            <p className="text-sm text-gray-700 mb-1">
              🕊 WhatsApp : {popupMember.is_whatsapp ? "Oui" : "Non"}
            </p>
            <p className="text-sm text-gray-700 mb-1">🏙 Ville : {popupMember.ville || "—"}</p>
            <p className="text-sm text-gray-700 mb-1">Statut : {popupMember.statut || "—"}</p>
            <p className="text-sm text-gray-700 mb-1">
              Comment est-il venu : {popupMember.venu || "—"}
            </p>

            <div className="mt-2">
              <label className="text-gray-700 text-sm">Besoin :</label>
              <select
                value={besoinChanges[popupMember.id] ?? popupMember.besoin ?? ""}
                onChange={(e) => handleBesoinChange(popupMember.id, e.target.value)}
                className="border rounded-lg px-2 py-1 text-sm w-full mt-1"
              >
                <option value="">-- Sélectionner --</option>
                <option value="Finances">Finances</option>
                <option value="Santé">Santé</option>
                <option value="Travail">Travail</option>
                <option value="Les Enfants">Les Enfants</option>
                <option value="La Famille">La Famille</option>
              </select>
            </div>

            <div className="mt-2">
              <label className="text-gray-700 text-sm">💬 Commentaire :</label>
              <textarea
                value={commentChanges[popupMember.id] ?? popupMember.commentaire ?? ""}
                onChange={(e) => handleCommentChange(popupMember.id, e.target.value)}
                rows={2}
                className="w-full border rounded-md px-2 py-1 text-sm mt-1 resize-none"
              ></textarea>
            </div>

            <div className="mt-2">
              <label className="text-gray-700 text-sm">📋 Statut suivi :</label>
              <select
                value={statusChanges[popupMember.id] ?? popupMember.statut_suivis ?? ""}
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
              className={`mt-3 w-full text-white font-semibold py-1 rounded-md transition ${
                updating[popupMember.id]
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {updating[popupMember.id] ? "Mise à jour..." : "Mettre à jour"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


