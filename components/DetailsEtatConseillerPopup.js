"use client";

import React, { useRef, useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";

export default function DetailsEtatConseillerPopup({ member, onClose, onUpdate }) {
  const popupRef = useRef(null);

  // Sécurisation : member peut être null
  const safeMember = member || {};

  const [comment, setComment] = useState(safeMember.commentaire || "");
  const [status, setStatus] = useState(safeMember.statut || "");
  const [saving, setSaving] = useState(false);

  const isRefus = status?.toLowerCase() === "refus";

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        onClose();
      }
    };

    window.addEventListener("mousedown", handleClickOutside, true);
    return () => window.removeEventListener("mousedown", handleClickOutside, true);
  }, [onClose]);

  // Save updates
  const handleSave = async () => {
    if (!safeMember.id) return;
    setSaving(true);

    try {
      const { error } = await supabase
        .from("vue_flow_conseillers") // ou la table réelle si tu veux UPDATE
        .update({
          commentaire: comment,
          statut: status,
        })
        .eq("id", safeMember.id);

      if (error) throw error;

      onUpdate && onUpdate(safeMember.id, { commentaire: comment, statut: status });
      onClose();
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  const formatDateFR = (dateString) => {
    if (!dateString) return "-";
    const d = new Date(dateString);
    return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`;
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
        {/* Popup */}
        <div
          ref={popupRef}
          onMouseDown={(e) => e.stopPropagation()}
          className="bg-white rounded-lg p-6 w-96 relative shadow-xl max-h-[90vh] overflow-y-auto"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-gray-500 font-bold"
          >
            ✖
          </button>

          <h2 className="text-lg font-bold text-center mb-3">
            {safeMember.nom_complet || "—"}
          </h2>

          {/* Informations principales */}
          <div className="text-sm text-center mt-3 space-y-1">
            <p>📅 Date départ : {formatDateFR(safeMember.date_depart)}</p>
            <p>Type : {safeMember.type_evangelisation || "—"}</p>
            <p>Statut : {safeMember.statut || "—"}</p>
            <p>Conseiller : {safeMember.conseiller || "—"}</p>
            <p>Ville : {safeMember.ville || "—"}</p>
          </div>

          {/* Commentaire / Statut */}
          <div className="mt-4">
            <label className="block font-semibold mb-1 text-center">Commentaire</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              disabled={isRefus}
              className="w-full border rounded p-2"
              rows={2}
            />

            <label className="block font-semibold mt-2 mb-1 text-center">Statut</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              disabled={isRefus}
              className="w-full border rounded p-2"
            >
              <option value="">-- Choisir --</option>
              <option value="En cours">En cours</option>
              <option value="Intégré">Intégré</option>
              <option value="Refus">Refus</option>
            </select>

            {!isRefus && (
              <button
                onClick={handleSave}
                disabled={saving}
                className="mt-3 w-full bg-blue-500 text-white py-2 rounded"
              >
                {saving ? "Enregistrement..." : "Sauvegarder"}
              </button>
            )}
          </div>

          {/* Informations supplémentaires */}
          <div className="mt-4 text-sm space-y-1">
            <p>📞 Téléphone : {safeMember.telephone || "—"}</p>
            <p>🏠 Cellule : {safeMember.cellule_full || "—"}</p>
            <p>📝 Infos supplémentaires : {safeMember.infos_supplementaires || "—"}</p>
          </div>
        </div>
      </div>
    </>
  );
}
