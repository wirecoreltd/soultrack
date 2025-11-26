"use client";

/**
 * Page: Liste des Membres
 * Description: Affiche les membres sous forme de carte ou tableau avec filtres et envoi WhatsApp.
 */

import { useEffect, useState, useRef } from "react";
import supabase from "../lib/supabaseClient";
import Image from "next/image";
import BoutonEnvoyer from "../components/BoutonEnvoyer";
import LogoutLink from "../components/LogoutLink";
import EditMemberPopup from "../components/EditMemberPopup";

export default function ListMembers() {
  const [members, setMembers] = useState([]);
  const [detailsOpen, setDetailsOpen] = useState({});
  const [statusChanges, setStatusChanges] = useState({});
  const [commentChanges, setCommentChanges] = useState({});
  const [updating, setUpdating] = useState({});
  const [view, setView] = useState("card");
  const [editMember, setEditMember] = useState(null);
  const [toastMessage, setToastMessage] = useState("");
  const [prenom, setPrenom] = useState("");
  const [loading, setLoading] = useState(true);

  // Mapping statut
  const statutIds = { "en attente": 2, "integrer": 3, "refus": 4 };
  const statutLabels = { 2: "En attente", 3: "Intégrer", 4: "Refus" };

  // Fetch membres
  const fetchMembers = async () => {
    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) throw new Error("Utilisateur non connecté");

      // Fetch membres via la vue
      const { data, error } = await supabase
        .from("membres_avec_cellule")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setMembers(data || []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setMembers([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const toggleDetails = (id) =>
    setDetailsOpen((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleStatusChange = (id, value) =>
    setStatusChanges((prev) => ({ ...prev, [id]: parseInt(value, 10) }));

  const handleCommentChange = (id, value) =>
    setCommentChanges((prev) => ({ ...prev, [id]: value }));

  const getBorderColor = (m) => {
    if (m.statut_suivis === statutIds["en attente"]) return "#FFA500";
    if (m.statut_suivis === statutIds["integrer"]) return "#34A853";
    if (m.statut_suivis === statutIds["refus"]) return "#FF4B5C";
    return "#ccc";
  };

  const updateSuivi = async (id) => {
    const newStatus = statusChanges[id];
    const newComment = commentChanges[id];

    if (!newStatus && !newComment) return;

    setUpdating((prev) => ({ ...prev, [id]: true }));

    try {
      const payload = { updated_at: new Date() };
      if (newStatus) payload.statut_suivis = newStatus;
      if (newComment) payload.commentaire_suivis = newComment;

      const { data: updatedSuivi, error } = await supabase
        .from("membres")
        .update(payload)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      setMembers((prev) =>
        prev.map((m) => (m.id === id ? { ...m, ...updatedSuivi } : m))
      );
      setDetailsOpen((prev) => ({ ...prev, [id]: false }));
      setStatusChanges((prev) => ({ ...prev, [id]: undefined }));
      setCommentChanges((prev) => ({ ...prev, [id]: undefined }));
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating((prev) => ({ ...prev, [id]: false }));
    }
  };

  const Details = ({ m }) => {
    const commentRef = useRef(null);

    useEffect(() => {
      if (commentRef.current) {
        commentRef.current.focus();
        commentRef.current.selectionStart =
          commentRef.current.value.length;
      }
    }, [commentChanges[m.id]]);

    return (
      <div className="text-black text-sm mt-2 space-y-2 w-full">
        <p>🏙 Ville : {m.ville || "—"}</p>
        <p>🧩 Comment est-il venu : {m.venu || "—"}</p>
        <p>
          ❓Besoin :{" "}
          {(() => {
            if (!m.besoin) return "—";
            if (Array.isArray(m.besoin)) return m.besoin.join(", ");
            try {
              const arr = JSON.parse(m.besoin);
              return Array.isArray(arr) ? arr.join(", ") : m.besoin;
            } catch {
              return m.besoin;
            }
          })()}
        </p>
        <p>📝 Infos : {m.infos_supplementaires || "—"}</p>
        <p>
          📝 Statut Suivis : {statutLabels[m.statut_suivis] || "—"}
        </p>
        <p>📝 Commentaire Suivis : {m.commentaire_suivis || "—"}</p>

        <div className="mt-3">
          <label className="text-black text-sm mb-1 block">
            📋 Statut :
          </label>
          <select
            value={statusChanges[m.id] ?? m.statut_suivis ?? ""}
            onChange={(e) => handleStatusChange(m.id, e.target.value)}
            className="w-full border rounded-md px-2 py-1 text-black text-sm mt-1"
          >
            <option value="">-- Choisir un statut --</option>
            <option value={statutIds["en attente"]}>🕓 En attente</option>
            <option value={statutIds["integrer"]}>✅ Intégrer</option>
            <option value={statutIds["refus"]}>❌ Refus</option>
          </select>

          <label className="text-gray-700 text-sm mt-2 block">
            💬 Commentaire :
          </label>
          <textarea
            ref={commentRef}
            value={commentChanges[m.id] ?? m.commentaire_suivis ?? ""}
            onChange={(e) => handleCommentChange(m.id, e.target.value)}
            rows={2}
            className="w-full border rounded-md px-2 py-1 text-sm mt-1 resize-none"
            placeholder="Ajouter un commentaire..."
          />

          <button
            onClick={() => updateSuivi(m.id)}
            disabled={updating[m.id]}
            className={`mt-2 w-full text-white font-semibold py-1 rounded-md transition ${
              updating[m.id]
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {updating[m.id] ? "Mise à jour..." : "Mettre à jour"}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-purple-200 via-pink-100 to-yellow-100">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">Liste des Membres</h1>
          <LogoutLink className="bg-white/10 text-white px-4 py-2 rounded-lg" />
        </div>

        {/* Vue Carte */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {members.map((m) => {
            const isOpen = detailsOpen[m.id];
            return (
              <div
                key={m.id}
                className="bg-white p-3 rounded-xl shadow-md border-l-4"
                style={{ borderLeftColor: getBorderColor(m) }}
              >
                <div className="flex flex-col items-center">
                  <h2 className="text-lg font-bold text-center">
                    {m.prenom} {m.nom}{" "}
                    {m.star && (
                      <span className="text-yellow-400 ml-1">⭐</span>
                    )}
                  </h2>
                  <p className="text-sm text-gray-600">📱 {m.telephone || "—"}</p>
                  <p className="text-sm text-gray-600">🕊 Statut : {m.statut}</p>
                  <p className="text-sm text-gray-600">
                    📝 Attribué à : {m.cellule_nom || "—"} –{" "}
                    {m.responsable_nom || "—"}
                  </p>

                  <button
                    onClick={() => toggleDetails(m.id)}
                    className="text-orange-500 underline text-sm mt-2"
                  >
                    {isOpen ? "Fermer détails" : "Détails"}
                  </button>

                  {isOpen && <Details m={m} />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Popup édition */}
        {editMember && (
          <EditMemberPopup
            member={editMember}
            cellules={[]}
            conseillers={[]}
            onClose={() => setEditMember(null)}
            onUpdate={() => setEditMember(null)}
          />
        )}
      </div>
    </div>
  );
}
