"use client";

import { useState, useEffect } from "react";

export default function DetailsPopup({
  membre,
  onClose,
  cellules = [],
  conseillers = [],
  handleAfterSend,
  showToast,
}) {
  if (!membre || !membre.id) return null;

  const [targetType, setTargetType] = useState("");   // "cellule" | "conseiller"
  const [targetId, setTargetId] = useState("");       // STRING volontairement

  // Reset quand on change de membre
  useEffect(() => {
    setTargetType("");
    setTargetId("");
  }, [membre.id]);

  // Cible réelle (objet)
  const cible =
    targetType === "cellule"
      ? cellules.find(c => String(c.id) === targetId)
      : targetType === "conseiller"
      ? conseillers.find(c => String(c.id) === targetId)
      : null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md rounded-xl p-6 relative">

        {/* Fermer */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-black"
        >
          ✖
        </button>

        {/* Nom */}
        <h2 className="text-xl font-bold text-center mb-4">
          {membre.prenom} {membre.nom}
        </h2>

        {/* Infos */}
        <div className="text-sm space-y-1">
          <p>🏙 Ville : {membre.ville || "—"}</p>
          <p>🕊 Statut : {membre.statut || "—"}</p>
          <p>🏠 Cellule : {membre.cellule_nom || "—"}</p>
          <p>👤 Conseiller : {membre.conseiller_prenom || "—"}</p>
        </div>

        {/* ================= ENVOYER À ================= */}
        <div className="mt-5">
          <label className="font-semibold text-sm">Envoyer à :</label>

          {/* Choix type */}
          <select
            className="mt-1 w-full border rounded px-2 py-1 text-sm"
            value={targetType}
            onChange={(e) => {
              setTargetType(e.target.value);
              setTargetId(""); // reset
            }}
          >
            <option value="">-- Choisir --</option>
            <option value="cellule">Une cellule</option>
            <option value="conseiller">Un conseiller</option>
          </select>

          {/* Choix cible */}
          {targetType && (
            <select
              className="mt-2 w-full border rounded px-2 py-1 text-sm"
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
            >
              <option value="">-- Sélectionner --</option>

              {targetType === "cellule" &&
                cellules.map(c => (
                  <option key={c.id} value={String(c.id)}>
                    {c.cellule_full || "—"}
                  </option>
                ))}

              {targetType === "conseiller" &&
                conseillers.map(c => (
                  <option key={c.id} value={String(c.id)}>
                    {c.prenom} {c.nom}
                  </option>
                ))}
            </select>
          )}

          {/* ===== BOUTON ENVOYER (LA CLE) ===== */}
          {cible && (
            <button
              className="mt-4 w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700"
              onClick={() => {
                handleAfterSend(membre.id, targetType, cible);
                showToast?.("✅ Envoyé avec succès");
                setTargetType("");
                setTargetId("");
              }}
            >
              📤 Envoyer
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
