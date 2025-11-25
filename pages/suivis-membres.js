"use client";

import { useEffect, useState, useRef } from "react";
import React from "react";
import supabase from "../lib/supabaseClient";
import Image from "next/image";
import LogoutLink from "../components/LogoutLink";
import EditMemberPopup from "../components/EditMemberPopup"; // chemin exact à vérifier

export default function SuivisMembres() {
  const [suivis, setSuivis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [prenom, setPrenom] = useState("");
  const [role, setRole] = useState([]);
  const [detailsOpen, setDetailsOpen] = useState({});
  const [statusChanges, setStatusChanges] = useState({});
  const [commentChanges, setCommentChanges] = useState({});
  const [updating, setUpdating] = useState({});
  const [view, setView] = useState("card");
  const [editMember, setEditMember] = useState(null);
  const [showRefus, setShowRefus] = useState(false);

  // Mapping statut
  const statutIds = {
    "en attente": 2,
    "integrer": 3,
    "refus": 4
  };
  const statutLabels = {
    2: "En attente",
    3: "Intégrer",
    4: "Refus"
  };

  useEffect(() => {
    const fetchSuivis = async () => {
      setLoading(true);
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) throw new Error("Utilisateur non connecté");

        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("id, prenom, nom, role")
          .eq("id", user.id)
          .single();
        if (profileError || !profileData) throw profileError;

        setPrenom(profileData.prenom || "cher membre");
        setRole(profileData.role);

        const tableName = showRefus ? "refus_membres" : "suivis_membres";
        let suivisData = [];

        if (["Administrateur", "ResponsableIntegration"].includes(profileData.role)) {
          const { data, error } = await supabase
            .from(tableName)
            .select("*")
            .order("created_at", { ascending: false });
          if (error) throw error;
          suivisData = data;
        } else if (profileData.role === "Conseiller") {
          const { data, error } = await supabase
            .from(tableName)
            .select("*")
            .eq("conseiller_id", profileData.id)
            .order("created_at", { ascending: false });
          if (error) throw error;
          suivisData = data;
        } else if (profileData.role === "ResponsableCellule") {
          const { data: cellulesData, error: cellulesError } = await supabase
            .from("cellules")
            .select("id")
            .eq("responsable_id", profileData.id);
          if (cellulesError) throw cellulesError;

          const celluleIds = cellulesData?.map(c => c.id) || [];
          if (celluleIds.length > 0) {
            const { data, error } = await supabase
              .from(tableName)
              .select("*")
              .in("cellule_id", celluleIds)
              .order("created_at", { ascending: false });
            if (error) throw error;
            suivisData = data;
          }
        }

        // Convertir le statut_suivis en integer pour correspondre à la table
        suivisData = suivisData.map(s => ({
          ...s,
          statut_suivis: s.statut_suivis ? parseInt(s.statut_suivis, 10) : null
        }));

        // Filtrer les "en attente" si on n'est pas sur la vue refus
        if (!showRefus) {
          suivisData = suivisData.filter(s => s.statut_suivis === statutIds["en attente"]);
        }

        setSuivis(suivisData || []);
        if (!suivisData || suivisData.length === 0) setMessage("Aucun membre à afficher.");
      } catch (err) {
        console.error("❌ Erreur:", err.message || err);
        setMessage("Erreur lors de la récupération des suivis.");
        setSuivis([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSuivis();
  }, [showRefus]);

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

    if (!newStatus && !newComment) {
      setMessage({ type: "info", text: "Aucun changement détecté." });
      return;
    }

    setUpdating((prev) => ({ ...prev, [id]: true }));

    try {
      const payload = { updated_at: new Date() };
      if (newStatus) payload.statut_suivis = newStatus; // déjà integer
      if (newComment) payload.commentaire_suivis = newComment;

      const { data: updatedSuivi, error: updateError } = await supabase
        .from("suivis_membres")
        .update(payload)
        .eq("id", id)
        .select()
        .single();
      if (updateError) throw updateError;

      // Mettre à jour localement
      setSuivis((prev) => prev.map(s => s.id === id ? updatedSuivi : s));
      setDetailsOpen((prev) => ({ ...prev, [id]: false }));
    } catch (err) {
      console.error("Exception updateSuivi:", err);
      setMessage({ type: "error", text: `Erreur durant la mise à jour : ${err.message}` });
    } finally {
      setUpdating((prev) => ({ ...prev, [id]: false }));
    }
  };

  const Details = ({ m }) => {
    const commentRef = useRef(null);

    useEffect(() => {
      if (commentRef.current) {
        commentRef.current.focus();
        commentRef.current.selectionStart = commentRef.current.value.length;
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
        <p>📌 Attribué à : {m.cellule_nom || m.responsable || "—"}</p>

        <div className="mt-5">
          <label className="text-black text-sm mb-1 block">📋 Statut Suivis :</label>
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

          <div className="mt-2">
            <label className="text-gray-700 text-sm">💬 Commentaire :</label>
            <textarea
              ref={commentRef}
              value={commentChanges[m.id] ?? m.commentaire_suivis ?? ""}
              onChange={(e) => handleCommentChange(m.id, e.target.value)}
              rows={2}
              className="w-full border rounded-md px-2 py-1 text-sm mt-1 resize-none"
              placeholder="Ajouter un commentaire..."
            />
          </div>

          <button
            onClick={() => updateSuivi(m.id)}
            disabled={updating[m.id]}
            className={`mt-3 w-full text-white font-semibold py-1 rounded-md transition ${
              updating[m.id] ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {updating[m.id] ? "Mise à jour..." : "Mettre à jour"}
          </button>

          <div className="mt-4 flex justify-center">
            <button
              onClick={() => setEditMember(m)}
              className="text-blue-600 text-sm mt-4"
            >
              ✏️ Modifier le contact
            </button>
          </div>
        </div>
      </div>
    );
  };

  // --- Rendu reste inchangé ---
  // (Carte et Table avec statutLabels pour afficher les valeurs)
  return (
    <div className="min-h-screen flex flex-col items-center p-6" style={{ background: "linear-gradient(135deg, #2E3192 0%, #92EFFD 100%)" }}>
      {/* Header et boutons */}
      {/* ... reste du rendu identique à ton fichier ... */}
    </div>
  );
}
