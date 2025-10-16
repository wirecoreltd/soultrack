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
  const [popupMember, setPopupMember] = useState(null);
  const [view, setView] = useState("table");

  useEffect(() => {
    fetchSuivis();
  }, []);

  const fetchSuivis = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("suivis_membres")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) {
        console.error("Erreur chargement suivis :", error);
        setSuivis([]);
      } else {
        setSuivis(data || []);
      }
    } catch (err) {
      console.error("Exception fetchSuivis:", err);
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
    setSuivis((prev) =>
      prev.map((m) => (m.id === id ? { ...m, besoin: value } : m))
    );

  const updateSuivi = async (id) => {
    const newStatus = statusChanges[id];
    const newComment = commentChanges[id];

    if (!newStatus && !newComment) return;

    setUpdating((prev) => ({ ...prev, [id]: true }));

    const payload = {};
    if (newStatus) payload["statut_suivis"] = newStatus;
    if (newComment) payload["commentaire"] = newComment;
    payload["updated_at"] = new Date();

    const { data: updatedData, error: updateError } = await supabase
      .from("suivis_membres")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error("Erreur update:", updateError);
    } else if (updatedData) {
      setSuivis((prev) => prev.map((m) => (m.id === id ? updatedData : m)));
    }

    setUpdating((prev) => ({ ...prev, [id]: false }));
    setPopupMember(null);
  };

  const getBorderColor = (m) => {
    switch (m.statut_suivis) {
      case "actif":
        return "#34A853";
      case "en attente":
        return "#F4B400";
      case "suivi terminé":
        return "#4285F4";
      case "inactif":
        return "#EA4335";
      default:
        return "#ccc";
    }
  };

  const statusOptions = ["actif", "en attente", "suivi terminé", "inactif"];
  const besoinOptions = ["Finances", "Santé", "Travail", "Les Enfants", "La Famille"];

  return (
    <div className="min-h-screen flex flex-col items-center p-6 transition-all duration-200"
         style={{ background: "linear-gradient(135deg, #2E3192 0%, #92EFFD 100%)" }}>
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
          className="text-white text-sm underline hover:text-gray-200"
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
                className="bg-white rounded-2xl shadow-lg p-4 flex flex-col items-center transition-all duration-300 hover:shadow-2xl"
                style={{ borderTop: `6px solid ${getBorderColor(item)}` }}
              >
                <h2 className="font-bold text-gray-800 text-base text-center mb-1">
                  👤 {item.prenom} {item.nom}
                </h2>
                <p className="text-sm text-gray-700 mb-1">📞 {item.telephone || "—"}</p>
                <p className="text-sm text-gray-700 mb-1">🕊 : {item.cellule_nom || "—"}</p>
                <p className="text-sm text-gray-700 mb-1">👑 Responsable : {item.responsable || "—"}</p>

                <button
                  onClick={() => setPopupMember(item)}
                  className="text-blue-500 underline text-sm mt-1"
                >
                  Détails
                </button>
              </div>
            );
          })}
        </div>
      ) : (
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
                  <td className="px-4 py-2">{m.statut_suivis}</td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => setPopupMember(m)}
                      className="text-blue-500 underline text-sm"
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

      {/* Popup Détails */}
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
            <p className="text-gray-700 text-sm mb-1">📱 {popupMember.telephone || "—"}</p>
            <p className="text-gray-700 text-sm mb-1">
              Statut : {popupMember.statut_suivis || "—"}
            </p>

            {/* Besoin modifiable */}
            <div className="mt-2">
              <label className="text-gray-700 text-sm">🙏 Besoin :</label>
              <select
                value={popupMember.besoin ?? ""}
                onChange={(e) => handleBesoinChange(popupMember.id, e.target.value)}
                className="w-full border rounded-md px-2 py-1 text-sm mt-1"
              >
                <option value="">-- Sélectionner --</option>
                {besoinOptions.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            {/* Commentaire modifiable */}
            <div className="mt-2">
              <label className="text-gray-700 text-sm">💬 Commentaire :</label>
              <textarea
                value={commentChanges[popupMember.id] ?? popupMember.commentaire ?? ""}
                onChange={(e) =>
                  handleCommentChange(popupMember.id, e.target.value)
                }
                rows={2}
                className="w-full border rounded-md px-2 py-1 text-sm mt-1 resize-none"
                placeholder="Ajouter un commentaire..."
              ></textarea>
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
