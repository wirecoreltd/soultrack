"use client";

import React, { useRef, useEffect, useState } from "react";

export default function DetailEvangeliseSuivisPopup({
  member,
  onClose,
  onEdit,
  commentChanges = {},
  statusChanges = {},
  handleCommentChange = () => {},
  handleStatusChange = () => {},
  handleAfterStatusUpdate = () => {},
  updating = {},
  updateSuivi = async () => {},
}) {
  if (!member || !member.id) return null; // ✅ Sécurité

  const [openPhoneMenu, setOpenPhoneMenu] = useState(false);
  const phoneMenuRef = useRef(null);
  const popupRef = useRef(null);

  const formatBesoin = (b) => {
    if (!b) return "—";
    if (Array.isArray(b)) return b.join(", ");
    try {
      const arr = JSON.parse(b);
      return Array.isArray(arr) ? arr.join(", ") : b;
    } catch {
      return b;
    }
  };

  // Fermer menu téléphone ou popup si clic à l'extérieur
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(e.target)
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div ref={popupRef} className="bg-white rounded-lg p-6 w-96 relative shadow-xl max-h-[90vh] overflow-y-auto">

        {/* ❌ Fermer */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 font-bold hover:text-gray-700"
        >
          ✖
        </button>

        {/* ✅ Titre */}
        <h2 className="text-lg font-bold text-gray-800 text-center mb-4">
          {member.prenom} {member.nom}
        </h2>

        {/* Téléphone avec menu */}
        <div className="relative mb-2">
          <p
            onClick={() => setOpenPhoneMenu(!openPhoneMenu)}
            className="text-center text-orange-500 font-semibold underline cursor-pointer"
          >
            {member.telephone || "—"}
          </p>

          {openPhoneMenu && (
            <div
              ref={phoneMenuRef}
              className="absolute mt-2 bg-white rounded-lg shadow-lg border z-50 w-52 left-1/2 -translate-x-1/2"
              onClick={(e) => e.stopPropagation()}
            >
              <a href={member.telephone ? `tel:${member.telephone}` : "#"} className={`block px-4 py-2 text-sm text-black hover:bg-gray-100 ${!member.telephone ? "opacity-50 pointer-events-none" : ""}`}>📞 Appeler</a>
              <a href={member.telephone ? `sms:${member.telephone}` : "#"} className={`block px-4 py-2 text-sm text-black hover:bg-gray-100 ${!member.telephone ? "opacity-50 pointer-events-none" : ""}`}>✉️ SMS</a>
              <a href={member.telephone ? `https://wa.me/${member.telephone.replace(/\D/g,"")}?call` : "#"} target="_blank" rel="noopener noreferrer" className={`block px-4 py-2 text-sm text-black hover:bg-gray-100 ${!member.telephone ? "opacity-50 pointer-events-none" : ""}`}>📱 Appel WhatsApp</a>
              <a href={member.telephone ? `https://wa.me/${member.telephone.replace(/\D/g,"")}` : "#"} target="_blank" rel="noopener noreferrer" className={`block px-4 py-2 text-sm text-black hover:bg-gray-100 ${!member.telephone ? "opacity-50 pointer-events-none" : ""}`}>💬 Message WhatsApp</a>
            </div>
          )}
        </div>

        {/* Cellule, Conseiller, Ville */}
        <p>🏠 Cellule : {member.cellule_full || "—"}</p>
        <p>👤 Conseiller : {member.responsable || "—"}</p>
        <p>🏙️ Ville : {member.ville || "—"}</p>

        {/* Commentaire & statut */}
        <div className="mt-4">
          <label className="font-semibold text-blue-700 mb-1 block">Commentaire Suivis</label>
          <textarea
            value={commentChanges?.[member.id] ?? member.commentaire_suivis ?? ""}
            onChange={(e) => handleCommentChange(member.id, e.target.value)}
            className="w-full border rounded-lg p-2"
            rows={2}
          />

          <label className="font-semibold text-blue-700 mb-1 mt-2 block">Statut Intégration</label>
          <select
            value={statusChanges?.[member.id] ?? member.statut_suivis ?? ""}
            onChange={(e) => handleStatusChange(member.id, e.target.value)}
            className="w-full border rounded-lg p-2 mb-2"
          >
            <option value="">-- Sélectionner un statut --</option>
            <option value="2">En attente</option>
            <option value="3">Intégré</option>
            <option value="4">Refus</option>
          </select>

          <button
            onClick={async () => {
              if (!member?.id) return;
              const updated = await updateSuivi(member.id);
              if (updated?.statut_suivis) {
                handleAfterStatusUpdate(Number(updated.statut_suivis));
              }
              onClose();
            }}
            disabled={updating?.[member.id]}
            className={`mt-2 w-full font-bold py-2 rounded-lg shadow-md transition-all ${
              updating?.[member.id]
                ? "bg-blue-300 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-400 to-indigo-500 hover:from-blue-500 hover:to-indigo-600 text-white"
            }`}
          >
            {updating?.[member.id] ? "Enregistrement..." : "Sauvegarder"}
          </button>
        </div>

        {/* Infos alignées à gauche */}
        <div className="mt-5 text-sm text-black space-y-1 text-left">
          <p>⚥ Sexe : {member.sexe || "—"}</p>
          <p>🙏 Prière du salut : {member.priere_salut ? "Oui" : "Non"}</p>
          <p>☀️ Type : {member.type_conversion || "—"}</p>
          <p>❓ Besoin : {formatBesoin(member.besoin)}</p>
          <p>📝 Infos : {member.infos_supplementaires || "—"}</p>
        </div>

        {/* Modifier contact centré */}
        <div className="mt-4 flex justify-center w-full">
          <button
            onClick={() => onEdit(member)}
            className="text-blue-600 text-sm font-semibold hover:underline"
          >
            ✏️ Modifier le contact
          </button>
        </div>

      </div>
    </div>
  );
}
