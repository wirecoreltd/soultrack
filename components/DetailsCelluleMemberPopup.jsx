"use client";

import { useState } from "react";
import EditMemberCellulePopup from "./EditMemberCellulePopup";

export default function DetailsCelluleMemberPopup({ member, onClose, getCelluleNom, onEdit }) {
  if (!member) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-3xl w-full max-w-md shadow-xl overflow-y-auto max-h-[95vh] relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-red-500 font-bold text-xl hover:text-red-700"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold text-base text-center mb-4">
          {member.prenom} {member.nom}
        </h2>

        <div className="text-center text-sm space-y-1 mb-3">
          <p>📞 Téléphone : {member.telephone || "—"}</p>
          <p>🏙️ Ville : {member.ville || "—"}</p>
          <p>🏠 Cellule : {getCelluleNom ? getCelluleNom(member.cellule_id) : member.cellule_nom || "—"}</p>
        </div>   

        <div className="flex flex-col gap-2 text-sm mt-3">         
          <p>💬 WhatsApp : {member.is_whatsapp ? "Oui" : "Non"}</p>
          <p>🎗️ Sexe : {member.sexe || "—"}</p>
          <p>💧 Baptême d’Eau : {member.bapteme_eau ? "Oui" : "Non"}</p>
          <p>🔥 Baptême de Feu : {member.bapteme_esprit ? "Oui" : "Non"}</p>
          <p>❓ Besoin : {member.besoin ? JSON.parse(member.besoin).join(", ") : "—"}</p>
          <p>📝 Infos : {member.infos_supplementaires || "—"}</p>
          <p>🧩 Comment est-il venu : {member.venu || ""}</p>                    
          <p>📝 Commentaire Suivis : {member.commentaire_suivis || ""}</p>
        </div>

        {/* Bouton Modifier */}
        <div className="mt-4 rounded-xl w-full p-4 bg-white">
          <button
            onClick={() => onEdit(member)} // <-- on passe au parent
            className="w-full py-2 rounded-md bg-white text-orange-500 shadow-md"
            >
            ✏️ Modifier le contact
          </button>
        </div>
      </div>
    </div>
  );
}
