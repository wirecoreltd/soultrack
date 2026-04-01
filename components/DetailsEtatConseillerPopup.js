"use client";

import React, { useRef, useEffect } from "react";

export default function DetailsEtatConseillerPopup({ member, onClose, onUpdate }) {
  const popupRef = useRef(null);

  if (!member) return null;

  const isRefus = (member.statut || "").toLowerCase() === "refus";

  // Ferme le popup si clic en dehors
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        onClose();
      }
    };
    window.addEventListener("mousedown", handleClickOutside, true);
    return () => window.removeEventListener("mousedown", handleClickOutside, true);
  }, [onClose]);

  const handleChangeComment = (e) => {
    onUpdate({ commentaire: e.target.value });
  };

  const handleChangeStatus = (e) => {
    onUpdate({ statut: e.target.value });
  };

  const formatDateFR = (dateString) => {
    if (!dateString) return "—";
    const d = new Date(dateString);
    return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div
        ref={popupRef}
        className="bg-white rounded-lg p-6 w-96 relative shadow-xl max-h-[90vh] overflow-y-auto"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Bouton fermer */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 font-bold"
        >
          ✖
        </button>

        <h2 className="text-lg font-bold text-center mb-3">
          {member.nom_complet || "—"}
        </h2>

        {/* Informations principales */}
        <div className="text-sm text-center mt-3 space-y-1">
          <p>📅 Date départ : {formatDateFR(member.date_depart)}</p>
          <p>Type : {member.type_evangelisation || "—"}</p>
          <p>Statut : {member.statut || "—"}</p>
          <p>Conseiller : {member.conseiller || "—"}</p>
          <p>Ville : {member.ville || "—"}</p>
        </div>

        {/* Commentaire / Statut */}
        <div className="mt-4">
          <label className="block font-semibold mb-1 text-center">Commentaire</label>
          <textarea
            value={member.commentaire || ""}
            onChange={handleChangeComment}
            disabled={isRefus}
            className="w-full border rounded p-2"
            rows={2}
          />

          <label className="block font-semibold mt-2 mb-1 text-center">Statut</label>
          <select
            value={member.statut || ""}
            onChange={handleChangeStatus}
            disabled={isRefus}
            className="w-full border rounded p-2"
          >
            <option value="">-- Choisir --</option>
            <option value="En cours">En cours</option>
            <option value="Intégré">Intégré</option>
            <option value="Refus">Refus</option>
          </select>
        </div>

        {/* Informations supplémentaires */}
        <div className="mt-4 text-sm space-y-1">
          <p>📞 Téléphone : {member.telephone || "—"}</p>
          <p>🏠 Cellule : {member.cellule_full || "—"}</p>
          <p>📝 Infos supplémentaires : {member.infos_supplementaires || "—"}</p>
        </div>
      </div>
    </div>
  );
}
