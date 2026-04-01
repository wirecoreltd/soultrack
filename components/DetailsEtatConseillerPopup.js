"use client";

import React, { useRef, useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import EditEvangeliseSuiviPopup from "./EditEvangeliseSuiviPopup";

export default function DetailsEtatConseillerPopup({
  member,
  cellules,
  conseillers,
  onClose,
  onUpdate,
}) {
  const popupRef = useRef(null);
  const phoneMenuRef = useRef(null);

  // ✅ On sécurise member avec un objet vide par défaut
  const safeMember = member || {};

  const [openPhoneMenu, setOpenPhoneMenu] = useState(false);
  const [comment, setComment] = useState(safeMember.commentaire_evangelises ?? "");
  const [status, setStatus] = useState(safeMember.status_suivis_evangelises ?? "");
  const [saving, setSaving] = useState(false);
  const [editingEvangelise, setEditingEvangelise] = useState(null);

  const isRefus = status === "Refus";

  const cellule = cellules?.find((c) => c.id === safeMember.cellule_id);
  const conseiller = conseillers?.find((c) => c.id === safeMember.conseiller_id);

  // ================= CLOSE PHONE MENU ON OUTSIDE CLICK =================
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (phoneMenuRef.current && !phoneMenuRef.current.contains(e.target)) {
        setOpenPhoneMenu(false);
      }
    };

    window.addEventListener("mousedown", handleClickOutside, true);
    return () =>
      window.removeEventListener("mousedown", handleClickOutside, true);
  }, []);

  // ================= SAVE =================
  const handleSave = async () => {
    if (!safeMember.id) return;
    setSaving(true);

    try {
      const { error } = await supabase
        .from("suivis_des_evangelises")
        .update({
          commentaire_evangelises: comment,
          status_suivis_evangelises: status,
        })
        .eq("id", safeMember.id);

      if (error) throw error;

      onUpdate &&
        onUpdate(safeMember.id, {
          commentaire_evangelises: comment,
          status_suivis_evangelises: status,
        });

      onClose();
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  const formatBesoin = (b) => {
    if (!b) return "—";
    try {
      const arr = JSON.parse(b);
      return Array.isArray(arr) ? arr.join(", ") : b;
    } catch {
      return b;
    }
  };

   const formatDateFr = (dateString) => {
  if (!dateString) return "—";
  const d = new Date(dateString);

  const day = d.getDate().toString().padStart(2, "0");
  const months = ["Janv", "Févr", "Mars", "Avr", "Mai", "Juin", "Juil", "Août", "Sept", "Oct", "Nov", "Déc"];

  return `${day} ${months[d.getMonth()]} ${d.getFullYear()}`;
};

  return (
    <>
      {/* OVERLAY */}
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
        {/* POPUP */}
        <div
          ref={popupRef}
          onMouseDown={(e) => e.stopPropagation()}
          className="bg-white rounded-lg p-6 w-96 relative shadow-xl max-h-[90vh] overflow-y-auto"
        >
          {/* CLOSE */}
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-gray-500 font-bold"
          >
            ✖
          </button>

          <h2 className="text-lg font-bold text-center mb-3">
            {safeMember.prenom || "—"} {safeMember.nom || ""}
          </h2>

          {/* PHONE */}
          {safeMember.telephone && (
            <div ref={phoneMenuRef} className="relative text-center">
              <button
                onClick={() => setOpenPhoneMenu((prev) => !prev)}
                className="text-orange-500 font-semibold underline"
              >
                {safeMember.telephone}
              </button>

              {openPhoneMenu && (
                <div className="absolute left-1/2 -translate-x-1/2 mt-2 bg-white border rounded-lg shadow w-56 z-50">
                  <a
                    href={`tel:${safeMember.telephone}`}
                    className="block px-4 py-2 hover:bg-gray-100"
                  >
                    📞 Appeler
                  </a>
                  <a
                    href={`sms:${safeMember.telephone}`}
                    className="block px-4 py-2 hover:bg-gray-100"
                  >
                    ✉️ SMS
                  </a>
                  <a
                    href={`https://wa.me/${safeMember.telephone.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-4 py-2 hover:bg-gray-100"
                  >
                    💬 WhatsApp
                  </a>
                </div>
              )}
            </div>
          )}

          {/* INFOS */}
          <div className="text-sm text-center mt-3 space-y-1">            
            <p>
              👤 Conseiller :{" "}
              {conseiller
                ? `${conseiller.prenom} ${conseiller.nom}`
                : "—"}
            </p>
            <p>🏙️ Ville : {safeMember.ville || "—"}</p>
          </div>          
          <div className="mt-4 text-sm space-y-1">
            <p>📅 {safeMember.sexe === "Femme" ? "Évangélisée" : "Évangélisé"} le : {formatDateFr(safeMember.date_evangelise)}</p>    
            <p>📣 Type d'Evangélisation : {safeMember.type_evangelisation|| "—"}</p>  
            <p>🎗️ Civilité : {safeMember.sexe || "—"}</p>
            <p>⏳ Tranche d'age : {safeMember.age || "—"}</p>  
            <p>🙏 Prière du salut : {safeMember.priere_salut ? "Oui" : "Non"}</p>
            <p>☀️ Type de conversion : {safeMember.type_conversion || "—"}</p>
            <p>❓ Difficultés / Besoins : {formatBesoin(safeMember.besoin)}</p>
            <p>📝 Infos supplémentaires :{" "}{safeMember.infos_supplementaires || "—"}</p>
            <p>📝 Commentaire Suivis :{" "}{safeMember.commentaire_evangelises || "—"}</p>  
          </div>                  
        </div>
      </div>      
    </>
  );
}
