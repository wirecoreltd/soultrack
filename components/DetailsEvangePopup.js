"use client";

import React, { useRef, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient"; // ⚠️ chemin relatif à adapter si besoin

export default function DetailsEvangePopup({ member, onClose, onEdit }) {
  const [openPhoneMenu, setOpenPhoneMenu] = useState(false);
  const [commentaire, setCommentaire] = useState(member.commentaire_suivis || "");
  const [statutSuivis, setStatutSuivis] = useState(member.statut_suivis || "");
  const [saving, setSaving] = useState(false);

  const phoneMenuRef = useRef(null);
  const popupRef = useRef(null);

   const formatDateFr = (dateString) => {
  if (!dateString) return "—";
  const d = new Date(dateString);

  const day = d.getDate().toString().padStart(2, "0");
  const months = ["Janv", "Févr", "Mars", "Avr", "Mai", "Juin", "Juil", "Août", "Sept", "Oct", "Nov", "Déc"];

  return `${day} ${months[d.getMonth()]} ${d.getFullYear()}`;
};

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

  // Fermer popup si clic en dehors
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
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
        !phoneMenuRef.current.contains(e.target) &&
        popupRef.current &&
        !popupRef.current.contains(e.target)
      ) {
        setOpenPhoneMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ Sauvegarder commentaire et statut
  const handleSave = async () => {
    if (!member.id) return;
    setSaving(true);
    let updateData = {
      commentaire_suivis: commentaire,
      statut_suivis: statutSuivis ? Number(statutSuivis) : null,
      suivi_updated_at: new Date().toISOString(),
    };

    // Si statut intégré, mettre aussi statut principal
    if (statutSuivis === "3") {
      updateData.statut = "intégré";
    }

    const { data, error } = await supabase
      .from("membres_complets")
      .update(updateData)
      .eq("id", member.id)
      .select()
      .single();

    setSaving(false);

    if (error) {
      console.error("Erreur update suivi:", error.message);
      alert("Impossible de sauvegarder. Voir console.");
      return;
    }

    // Fermer popup après sauvegarde
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div
        ref={popupRef}
        className="bg-white rounded-lg p-6 w-96 relative shadow-xl max-h-[90vh] overflow-y-auto"
      >
        {/* ❌ Fermer */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 font-bold hover:text-gray-700"
        >
          ✖
        </button>

        {/* ====== CENTRÉ ====== */}
        <h2 className="text-lg font-bold text-gray-800 text-center mb-2">
          {member.prenom} {member.nom}
        </h2>

        {/* 📞 Numéro et menu */}
        <div className="relative">
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
          <div className="mt-5 text-sm text-black space-y-1 text-left w-full">
          <p className="text-[11px] text-gray-400 text-right mb-1">Crée le {formatDateFr(member.created_at)}</p>
          <p>🏙️ Ville : {member.ville || "—"}</p>    
          <p>🎗️ Sexe : {member.sexe || "—"}</p> 
          <p>🙏 Prière du salut : {member.priere_salut ? "Oui" : "Non"}</p>
          <p>☀️ Type : {member.type_conversion || "—"}</p>
          <p>❓ Besoin : {formatBesoin(member.besoin)}</p>
          <p>📝 Infos supplémentaires : {member.infos_supplementaires || "—"}</p>
        </div>

        {/* ====== CENTRÉ ====== */}
        <div className="mt-4 rounded-xl w-full p-4 bg-white">
          <button
            onClick={() => onEdit(member)}
            className="w-full py-2 rounded-md bg-white text-orange-500 shadow-md"
          >
            ✏️ Modifier le contact
          </button>
        </div>
      </div>
    </div>
  );
}
