"use client";

import React, { useRef, useEffect, useState } from "react";
import supabase from "@/lib/supabaseClient"; // Assure-toi que ce chemin est correct

export default function DetailEvangeliseSuivisPopup({ member, onClose, onEdit }) {
  const [openPhoneMenu, setOpenPhoneMenu] = useState(false);
  const [commentaire, setCommentaire] = useState(member.commentaire_suivis || "");
  const [statut, setStatut] = useState(member.statut_suivis || "");
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

  // Fermer le popup et menu si clic à l'extérieur
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        popupRef.current && !popupRef.current.contains(e.target)
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  // Fermer menu téléphone si clic en dehors
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        phoneMenuRef.current &&
        !phoneMenuRef.current.contains(e.target)
      ) {
        setOpenPhoneMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSave = async () => {
    if (!member.id) return;
    setSaving(true);

    const updateData = {
      commentaire_suivis: commentaire,
      statut_suivis: Number(statut),
    };

    // Si le statut est "Intégré" (3), on met aussi le contact en statut = "Intégré"
    if (Number(statut) === 3) {
      updateData.statut = "integrer";
    }

    const { error } = await supabase
      .from("membres_complets")
      .update(updateData)
      .eq("id", member.id);

    if (error) {
      console.error("Erreur update suivi:", error.message);
      alert("Impossible de sauvegarder. Voir console.");
    }

    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div
        ref={popupRef}
        className="bg-white rounded-lg p-6 w-96 relative shadow-xl max-h-[90vh] overflow-y-auto"
      >
        {/* Croix fermeture */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 font-bold hover:text-gray-700"
        >
          ✖
        </button>

        {/* Nom */}
        <h2 className="text-lg font-bold text-gray-800 text-center mb-4">
          {member.prenom} {member.nom}
        </h2>

        {/* Téléphone + menu */}
        <div className="relative text-center mb-3">
          <p
            onClick={() => setOpenPhoneMenu(!openPhoneMenu)}
            className="text-orange-500 font-semibold underline cursor-pointer"
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

        {/* Infos principales */}
        <p>🏠 Cellule : {member.cellule_full || "—"}</p>
        <p>👤 Conseiller : {member.responsable || "—"}</p>
        <p>🏙️ Ville : {member.ville || "—"}</p>

        {/* Commentaire & statut */}
        <div className="flex flex-col mt-3">
          <label className="font-semibold text-blue-700 mb-1 text-center">
            Commentaire Suivis
          </label>
          <textarea
            value={commentaire}
            onChange={(e) => setCommentaire(e.target.value)}
            className="w-full border rounded-lg p-2"
            rows={2}
          />

          <label className="font-semibold text-blue-700 mb-1 mt-2 text-center">
            Statut Intégration
          </label>
          <select
            value={statut}
            onChange={(e) => setStatut(e.target.value)}
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

        {/* Infos alignées à gauche */}
        <div className="mt-5 text-sm text-black space-y-1 text-left w-full">
          <p>⚥ Sexe : {member.sexe || "—"}</p>
          <p>🙏 Prière du salut : {member.priere_salut ? "Oui" : "Non"}</p>
          <p>☀️ Type : {member.type_conversion || "—"}</p>
          <p>❓ Besoin : {formatBesoin(member.besoin)}</p>
          <p>📝 Infos : {member.infos_supplementaires || "—"}</p>
        </div>

        {/* Bouton modifier centré */}
        <div className="mt-6 flex justify-center">
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
