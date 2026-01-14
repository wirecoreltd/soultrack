"use client";

import React, { useRef, useEffect, useState } from "react";

export default function DetailEvangeliseSuivisPopup({ member, onClose, onEdit, updateSuivi }) {
  const [openPhoneMenu, setOpenPhoneMenu] = useState(false);
  const [comment, setComment] = useState(member.commentaire_suivis || "");
  const [status, setStatus] = useState(member.statut_suivis ?? "");
  const [saving, setSaving] = useState(false);

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

  // Fermer menu téléphone et popup si clic en dehors
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const handleSave = async () => {
    setSaving(true);
    try {
      // updateSuivi doit accepter { id, commentaire, statut } et renvoyer l'objet mis à jour
      const updated = await updateSuivi({
        id: member.id,
        commentaire_suivis: comment,
        statut_suivis: Number(status),
      });

      if (updated) {
        // si statut = 3 (Intégré), on peut mettre à jour le statut global du contact
        if (Number(status) === 3) {
          // ici tu peux ajouter une fonction pour mettre à jour le membre dans membres_complets
          // ex: updateMembreStatus(member.id, "Intégré")
        }
        onClose(); // fermer popup après succès
      }
    } catch (e) {
      console.error("Erreur sauvegarde suivi :", e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div
        ref={popupRef}
        className="bg-white rounded-xl shadow-lg p-6 w-96 max-h-[90vh] overflow-y-auto relative"
      >
        {/* ❌ Fermer */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 font-bold"
        >
          ✖
        </button>

        {/* ================= CONTENU CENTRÉ ================= */}
        <div className="flex flex-col items-center text-center">
          <h2 className="text-xl font-bold mb-2">
            {member.prenom} {member.nom} {member.star && "⭐"}
          </h2>

          {/* 📞 Téléphone */}
          <div className="relative mb-2">
            <p
              onClick={(e) => {
                e.stopPropagation();
                setOpenPhoneMenu(!openPhoneMenu);
              }}
              className="text-orange-500 underline font-semibold cursor-pointer"
            >
              {member.telephone || "—"}
            </p>

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
                  href={member.telephone ? `https://wa.me/${member.telephone.replace(/\D/g, "")}` : "#"}
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

          <p>🏠 Cellule : {member.cellule_full || "—"}</p>
          <p>👤 Conseiller : {member.responsable || "—"}</p>
          <p>🏙️ Ville : {member.ville || "—"}</p>

          {/* Commentaire & Statut */}
          <div className="flex flex-col w-full mt-4">
            <label className="font-semibold text-blue-700 mb-1 text-center">
              Commentaire Suivis
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full border rounded-lg p-2"
              rows={2}
            />

            <label className="font-semibold text-blue-700 mb-1 mt-2 text-center">
              Statut Intégration
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full border rounded-lg p-2 mb-2"
            >
              <option value="">-- Sélectionner un statut --</option>
              <option value="2">En attente</option>
              <option value="3">Intégré</option>
              <option value="4">Refus</option>
            </select>

            <button
              onClick={handleSave}
              disabled={saving}
              className={`mt-2 w-full font-bold py-2 rounded-lg shadow-md transition-all ${
                saving
                  ? "bg-blue-300 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-400 to-indigo-500 hover:from-blue-500 hover:to-indigo-600 text-white"
              }`}
            >
              {saving ? "Enregistrement..." : "Sauvegarder"}
            </button>
          </div>

          {/* ================= INFOS DÉTAILLÉES ALIGNÉ GAUCHE ================= */}
          <div className="mt-5 text-sm text-black space-y-1 text-left w-full">
            <p>🎗️ Sexe : {member.sexe || "—"}</p>
            <p>🙏 Prière du salut : {member.priere_salut ? "Oui" : "Non"}</p>
            <p>☀️ Type : {member.type_conversion || "—"}</p>
            <p>❓ Besoin : {formatBesoin(member.besoin)}</p>
            <p>📝 Infos supplémentaires : {member.infos_supplementaires || "—"}</p>
          </div>

          {/* Modifier le contact */}
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
    </div>
  );
}
