// pages/list-members.js
"use client";

import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";

export default function ListMembers() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailsOpen, setDetailsOpen] = useState({});
  const [statusChanges, setStatusChanges] = useState({});
  const [commentChanges, setCommentChanges] = useState({});
  const [updating, setUpdating] = useState({});
  const [view, setView] = useState("card");
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const { data, error } = await supabase
        .from("membres")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erreur chargement membres :", error);
        setMessage({ type: "error", text: `Erreur : ${error.message}` });
        setMembers([]);
      } else {
        setMembers(data || []);
      }
    } catch (err) {
      console.error("Exception fetchMembers:", err);
      setMessage({ type: "error", text: `Exception : ${err.message}` });
      setMembers([]);
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
    if (m.statut === "actif") return "#4285F4";
    if (m.statut === "visiteur" || m.statut === "veut rejoindre icc") return "#00BFFF";
    if (m.statut === "inactif") return "#999999";
    return "#ccc";
  };

  const updateMember = async (id) => {
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
      if (newStatus) payload["statut"] = newStatus;
      if (newComment) payload["commentaire"] = newComment;
      payload["updated_at"] = new Date();

      const { data: updatedData, error: updateError } = await supabase
        .from("membres")
        .update(payload)
        .eq("id", id)
        .select()
        .single();

      if (updateError) {
        console.error("Erreur update :", updateError);
        setMessage({ type: "error", text: `Erreur : ${updateError.message}` });
      } else if (updatedData) {
        setMembers((prev) => prev.map((it) => (it.id === id ? updatedData : it)));
        setMessage({ type: "success", text: "Mise à jour enregistrée." });
      }
    } catch (err) {
      console.error("Exception updateMember:", err);
      setMessage({ type: "error", text: `Erreur : ${err.message}` });
    } finally {
      setUpdating((prev) => ({ ...prev, [id]: false }));
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center p-6 transition-all duration-200"
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
          className="text-white text-sm underline hover:text-gray-200"
        >
          {view === "card" ? "Vue Table" : "Vue Carte"}
        </button>
      </div>

      <h1 className="text-4xl font-handwriting text-white text-center mb-3">
        Liste des membres
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
      ) : members.length === 0 ? (
        <p className="text-white italic text-lg">
          Aucun membre enregistré pour le moment.
        </p>
      ) : view === "card" ? (
        // === 🌟 VUE CARTE ===
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-6xl">
          {members.map((m) => {
            const isOpen = detailsOpen[m.id];
            const isNew =
              m.statut?.toLowerCase() === "visiteur" ||
              m.statut?.toLowerCase() === "veut rejoindre icc";

            return (
              <div
                key={m.id}
                className="relative bg-white rounded-2xl shadow-lg flex flex-col w-full transition-all duration-300 hover:shadow-2xl overflow-hidden"
              >
                {/* Bande colorée */}
                <div
                  className="w-full h-[6px] rounded-t-2xl"
                  style={{ backgroundColor: getBorderColor(m) }}
                />

                {/* Tag "Nouveau" */}
                {isNew && (
                  <span className="absolute top-2 right-2 bg-blue-500 text-white text-[11px] font-semibold px-2 py-0.5 rounded-full shadow-sm">
                    Nouveau
                  </span>
                )}

                {/* Contenu principal de la carte */}
                <div className="p-3 flex flex-col items-center text-sm">
                  <h2 className="font-bold text-black text-center mb-0.5">
                    {m.prenom} {m.nom}
                  </h2>
                  <p className="text-gray-700 mb-0.5">📞 {m.telephone || "—"}</p>
                  <p className="text-gray-700 mb-0.5">
                    🏠 Cellule : {m.cellule_nom || "—"}
                  </p>
                  <p className="text-gray-700 mb-0.5">🕊 Statut : {m.statut || "—"}</p>

                  <button
                    onClick={() => toggleDetails(m.id)}
                    className="text-orange-500 underline text-xs mt-1"
                  >
                    {isOpen ? "Fermer détails" : "Détails"}
                  </button>

                  {/* === DETAILS === */}
                  {isOpen && (
                    <div className="text-gray-700 text-xs mt-2 space-y-1.5 w-full">
                      <p>💬 WhatsApp : {m.whatsapp || "—"}</p>
                      <p>🏙 Ville : {m.ville || "—"}</p>
                      <p>🧩 Comment est-il venu : {m.venu || "—"}</p>
                      <p>📝 Infos : {m.infos_supplementaires || "—"}</p>

                      <div>
                        <label className="text-black text-xs">Statut :</label>
                        <select
                          value={statusChanges[m.id] ?? m.statut ?? ""}
                          onChange={(e) => handleStatusChange(m.id, e.target.value)}
                          className="w-full border rounded-md px-2 py-1 text-black text-xs mt-1"
                        >
                          <option value="">-- Choisir un statut --</option>
                          <option value="actif">✅ Actif</option>
                          <option value="visiteur">👋 Visiteur</option>
                          <option value="veut rejoindre icc">🙌 Veut rejoindre ICC</option>
                          <option value="inactif">❌ Inactif</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-black text-xs">📝 Commentaire :</label>
                        <textarea
                          value={commentChanges[m.id] ?? m.commentaire ?? ""}
                          onChange={(e) =>
                            handleCommentChange(m.id, e.target.value)
                          }
                          rows={2}
                          className="w-full border rounded-md px-2 py-1 text-black text-xs mt-1 resize-none"
                          placeholder="Ajouter un commentaire..."
                        />
                      </div>

                      <button
                        onClick={() => updateMember(m.id)}
                        disabled={updating[m.id]}
                        className={`mt-2 w-full text-white font-semibold py-1 rounded-md transition ${
                          updating[m.id]
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-green-600 hover:bg-green-700"
                        }`}
                      >
                        {updating[m.id]
                          ? "Mise à jour..."
                          : "Mettre à jour"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // === 🧾 VUE TABLE (inchangée) ===
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
              {members.map((m) => (
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
                  <td className="px-4 py-2">{m.statut || "—"}</td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => toggleDetails(m.id)}
                      className="text-orange-500 underline text-sm"
                    >
                      {detailsOpen[m.id] ? "Fermer détails" : "Détails"}
                    </button>
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
