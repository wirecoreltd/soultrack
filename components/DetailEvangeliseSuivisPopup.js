"use client";

import React, { useRef, useEffect, useState } from "react";

export default function DetailEvangeliseSuivisPopup({
  member,
  onClose,
  onEdit,
  commentChanges,
  statusChanges,
  handleCommentChange,
  handleStatusChange,
  handleAfterStatusUpdate,
  updating,
  updateSuivi,
}) {
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

  // 🔹 Fermer le popup si clic en dehors
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div
        ref={popupRef}
        className="bg-white rounded-xl p-6 w-96 relative shadow-xl max-h-[90vh] overflow-y-auto"
      >
        {/* ❌ Fermer */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 font-bold hover:text-gray-700"
        >
          ✖
        </button>

        {/* ================= CENTRÉ ================= */}
        <h2 className="text-xl font-bold text-center mb-4">
          {member.prenom} {member.nom} {member.star && "⭐"}
        </h2>

        {/* 📞 Téléphone */}
        <div className="relative mb-2 text-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setOpenPhoneMenu(!openPhoneMenu);
            }}
            className="text-orange-500 underline font-semibold"
          >
            {member.telephone || "—"}
          </button>

          {openPhoneMenu && (
            <div
              ref={phoneMenuRef}
              className="absolute mt-2 bg-white rounded-lg shadow-lg border z-50 w-52 left-1/2 -translate-x-1/2"
              onClick={(e) => e.stopPropagation()}
            >
              <a
                href={member.telephone ? `tel:${member.telephone}` : "#"}
                className={`block px-4 py-2 text-sm text-black hover:bg-gray-100 ${
                  !member.telephone ? "opacity-50 pointer-events-none" : ""
                }`}
              >
                📞 Appeler
              </a>
              <a
                href={member.telephone ? `sms:${member.telephone}` : "#"}
                className={`block px-4 py-2 text-sm text-black hover:bg-gray-100 ${
                  !member.telephone ? "opacity-50 pointer-events-none" : ""
                }`}
              >
                ✉️ SMS
              </a>
              <a
                href={
                  member.telephone
                    ? `https://wa.me/${member.telephone.replace(/\D/g, "")}?call`
                    : "#"
                }
                target="_blank"
                rel="noopener noreferrer"
                className={`block px-4 py-2 text-sm text-black hover:bg-gray-100 ${
                  !member.telephone ? "opacity-50 pointer-events-none" : ""
                }`}
              >
                📱 Appel WhatsApp
              </a>
              <a
                href={
                  member.telephone
                    ? `https://wa.me/${member.telephone.replace(/\D/g, "")}`
                    : "#"
                }
                target="_blank"
                rel="noopener noreferrer"
                className={`block px-4 py-2 text-sm text-black hover:bg-gray-100 ${
                  !member.telephone ? "opacity-50 pointer-events-none" : ""
                }`}
              >
                💬 Message WhatsApp
              </a>
            </div>
          )}
        </div>

        <p className="text-center">🏠 Cellule : {member.cellule_full || "—"}</p>
        <p className="text-center">👤 Conseiller : {member.responsable || "—"}</p>
        <p className="text-center">🏙 Ville : {member.ville || "—"}</p>

        {/* ================= COMMENTAIRE & STATUT ================= */}
        <div className="flex flex-col w-full mt-4">
          {/* Commentaire */}
          <label className="font-semibold text-blue-700 mb-1 text-center">
            Commentaire Suivis
          </label>
          <textarea
            value={commentChanges[member.id] ?? member.commentaire_suivis ?? ""}
            onChange={(e) => handleCommentChange(member.id, e.target.value)}
            className="w-full border rounded-lg p-2"
            rows={2}
          />

          {/* Statut */}
          <label className="font-semibold text-blue-700 mb-1 mt-2 text-center">
            Statut Intégration
          </label>
          <select
            value={statusChanges[member.id] ?? ""}
            onChange={(e) => handleStatusChange(member.id, e.target.value)}
            className="w-full border rounded-lg p-2 mb-2"
          >
            <option value="">-- Sélectionner un statut --</option>
            <option value="2">En attente</option>
            <option value="3">Intégré</option>
            <option value="4">Refus</option>
          </select>

          {/* 💾 Sauvegarder */}
          <button
            onClick={async () => {
              const updated = await updateSuivi(member.id);
              if (updated?.statut_suivis) {
                handleAfterStatusUpdate(Number(updated.statut_suivis));
              }
              onClose(); // 🔹 Fermer popup automatiquement
            }}
            disabled={updating[member.id]}
            className={`mt-2 w-full font-bold py-2 rounded-lg shadow-md transition-all ${
              updating[member.id]
                ? "bg-blue-300 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-400 to-indigo-500 hover:from-blue-500 hover:to-indigo-600 text-white"
            }`}
          >
            {updating[member.id] ? "Enregistrement..." : "Sauvegarder"}
          </button>
        </div>

        {/* ================= INFOS ALIGNÉ À GAUCHE ================= */}
        <div className="mt-5 text-sm text-black space-y-1 text-left w-full">
          <p>⚥ Sexe : {member.sexe || "—"}</p>
          <p>🙏 Prière du salut : {member.priere_salut ? "Oui" : "Non"}</p>
          <p>☀️ Type : {member.type_conversion || "—"}</p>
          <p>❓ Besoin : {formatBesoin(member.besoin)}</p>
          <p>📝 Infos : {member.infos_supplementaires || "—"}</p>
        </div>

        {/* ✏️ Modifier le contact */}
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
