"use client";

import React, { useEffect, useRef, useState } from "react";

export default function DetailsModal({
  m,
  onClose,
  handleStatusChange,
  handleCommentChange,
  statusChanges,
  commentChanges,
  updating,
  updateSuivi
}) {
  const commentRef = useRef(null);

  useEffect(() => {
    if (commentRef.current) {
      commentRef.current.focus();
      commentRef.current.selectionStart = commentRef.current.value.length;
    }
  }, [commentChanges[m.id]]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto relative">

        {/* X FERMER */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-black font-bold"
        >
          ✖
        </button>

        {/* INFORMATIONS */}
        <h2 className="text-xl font-bold mb-4">{m.prenom} {m.nom}</h2>
        <p>📞 {m.telephone || "—"}</p>
        <p>🏙 Ville : {m.ville || "—"}</p>
        <p>❓Besoin : {(!m.besoin ? "—" : Array.isArray(m.besoin) ? m.besoin.join(", ") : (() => { try { const arr = JSON.parse(m.besoin); return Array.isArray(arr) ? arr.join(", ") : m.besoin; } catch { return m.besoin; } })())}</p>
        <p>📝 Infos : {m.infos_supplementaires || "—"}</p>

        {/* STATUT & COMMENTAIRE */}
        <div className="mt-4">
          <label className="font-semibold">📋 Statut Suivis :</label>
          <select
            value={statusChanges[m.id] ?? m.statut_suivis ?? ""}
            onChange={(e) => handleStatusChange(m.id, e.target.value)}
            className="w-full border rounded-md px-2 py-1 mt-2"
          >
            <option value="">-- Choisir un statut --</option>
            <option value={1}>🕓 En attente</option>
            <option value={3}>✅ Intégrer</option>
            <option value={4}>❌ Refus</option>
          </select>

          <textarea
            ref={commentRef}
            value={commentChanges[m.id] ?? m.commentaire_suivis ?? ""}
            onChange={(e) => handleCommentChange(m.id, e.target.value)}
            rows={3}
            className="w-full border rounded-md px-2 py-1 mt-2 resize-none"
            placeholder="Ajouter un commentaire..."
          />

          {/* BOUTON METTRE À JOUR */}
          <button
            onClick={() => updateSuivi(m.id)}
            disabled={updating[m.id]}
            className={`mt-3 w-full text-white font-semibold py-1 rounded-md transition ${
              updating[m.id] ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {updating[m.id] ? "Mise à jour..." : "Mettre à jour"}
          </button>
        </div>
      </div>
    </div>
  );
}
