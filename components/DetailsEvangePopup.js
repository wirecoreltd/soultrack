"use client";

import { useState } from "react";
import EditEvangelisePopup from "./EditEvangelisePopup";

export default function DetailsEvangePopup({ member, onClose, cellules = [], conseillers = [] }) {
  const [editMember, setEditMember] = useState(null);

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

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg w-96 max-h-[90vh] overflow-y-auto shadow-xl relative">

          {/* Croix fermer */}
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 font-bold text-lg"
          >
            ×
          </button>

          <h2 className="text-lg font-bold text-gray-800 text-center mb-4">
            Détails de {member.prenom} {member.nom}
          </h2>

          <div className="flex flex-col space-y-2 text-sm">
            <p>📱 Téléphone : {member.telephone || "—"}</p>
            <p>🏙 Ville : {member.ville || "—"}</p>
            <p>💬 WhatsApp : {member.is_whatsapp ? "Oui" : "Non"}</p>
            <p>⚥ Sexe : {member.sexe || "—"}</p>
            <p>🙏 Prière du salut : {member.priere_salut ? "Oui" : "Non"}</p>
            <p>☀️ Type : {member.type_conversion || "—"}</p>
            <p>❓ Besoin : {formatBesoin(member.besoin)}</p>
            <p>📝 Infos supplémentaires : {formatBesoin(member.infos_supplementaires)}</p>             
          </div>

          {/* Bouton modifier */}
          <button
            onClick={() => setEditMember(member)}
            className="text-blue-600 text-sm mt-4 w-full"
          >
            ✏️ Modifier le contact
          </button>
        </div>
      </div>

      {editMember && (
        <EditEvangelisePopup
          member={editMember}
          cellules={cellules}
          conseillers={conseillers}
          onClose={() => {
            setEditMember(null);
            onClose(); // ferme aussi le Details popup
          }}
          onUpdateMember={(data) => {
            setEditMember(null);
            onClose(); // ferme aussi le Details popup
          }}
        />
      )}
    </>
  );
}
