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

  const handleBesoinChange = (id, value) =>
    setSuivis((prev) =>
      prev.map((m) => (m.id === id ? { ...m, besoin: value } : m))
    );

  const updateSuivi = async (id) => {
    setMessage(null);
    const newStatus = statusChanges[id];
    const newComment = commentChanges[id];
    const updatedBesoin = suivis.find((m) => m.id === id)?.besoin;

    if (!newStatus && !newComment && !updatedBesoin) {
      setMessage({ type: "info", text: "Aucun changement détecté." });
      return;
    }

    setUpdating((prev) => ({ ...prev, [id]: true }));

    try {
      const payload = {};
      if (newStatus) payload["statut_suivis"] = newStatus;
      if (newComment) payload["commentaire"] = newComment;
      if (updatedBesoin) payload["besoin"] = updatedBesoin;
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

  const getBorderColor = (m) => {
    if (m.statut_suivis === "actif") return "#4285F4";
    if (m.statut_suivis === "en attente") return "#FBC02D";
    if (m.statut_suivis === "suivi terminé") return "#34A853";
    if (m.statut_suivis === "inactif") return "#EA4335";
    return "#ccc";
  };

  const statusOptions = [
    "actif",
    "en attente",
    "suivi terminé",
    "inactif"
  ];

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-gradient-to-br from-purple-700 to-indigo-500">
      <button
        onClick={() => window.history.back()}
        className="self-start mb-4 text-white font-semibold hover:text-gray-200"
      >
        ← Retour
      </button>

      <Image src="/logo.png" alt="Logo" width={80} height={80} className="mb-3" />

      <h1 className="text-4xl font-handwriting text-white text-center mb-3">
        Suivis des Membres
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
        <p className="text-white text-lg italic">
          Aucun membre en suivi pour le moment.
        </p>
      ) : (
        <>
          {/* Toggle Vue Carte / Table */}
          <div className="flex justify-end w-full max-w-6xl mb-4">
            <button
              onClick={() => setView(view === "card" ? "table" : "card")}
              className="text-white text-sm underline hover:text-gray-200"
            >
              {view === "card" ? "Vue Table" : "Vue Carte"}
            </button>
          </div>

          {/* Table */}
          <div className="w-full max-w-6xl overflow-x-auto">
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
                    <td className="px-4 py-2">{m.telephone || "—"}</td>
                    <td className="px-4 py-2">{m.statut_suivis || "—"}</td>
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
        </>
      )}

      {/* Popup détails */}
      {popupMember && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
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

            <p className="text-gray-700 text-sm mb-1">
              📞 {popupMember.telephone || "—"}
            </p>

            <p className="text-sm text-gray-700 mb-2">
              Statut :
              <select
                value={statusChanges[popupMember.id] ?? popupMember.statut_suivis ?? ""}
                onChange={(e) => handleStatusChange(popupMember.id, e.target.value)}
                className="ml-2 border rounded-md px-2 py-1 text-sm"
              >
                {statusOptions.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </p>

            <div className="mt-2">
              <label className="text-gray-700 text-sm">💬 Commentaire :</label>
              <textarea
                value={commentChanges[popupMember.id] ?? popupMember.commentaire ?? ""}
                onChange={(e) => handleCommentChange(popupMember.id, e.target.value)}
                rows={2}
                className="w-full border rounded-md px-2 py-1 text-sm mt-1 resize-none"
                placeholder="Ajouter un commentaire..."
              ></textarea>
            </div>

            <div className="mt-2">
              <label className="text-gray-700 text-sm">🙏 Besoin :</label>
              <select
                value={popupMember.besoin || ""}
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

            <button
              onClick={() => updateSuivi(popupMember.id)}
              disabled={updating[popupMember.id]}
              className={`mt-3 w-full text-white font-semibold py-1 rounded-md transition ${
                updating[popupMember.id]
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
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
