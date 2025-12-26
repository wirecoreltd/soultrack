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

          <div className="flex justify-between mt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-md bg-gray-300 hover:bg-gray-400"
            >
              Fermer
            </button>

            <button
              onClick={() => setEditMember(member)}
              className="px-4 py-2 rounded-md bg-blue-600 text-white font-bold hover:bg-blue-700"
            >
              Modifier
            </button>
          </div>
        </div>
      </div>

      {editMember && (
        <EditEvangelisePopup
          member={editMember}
          cellules={cellules}
          conseillers={conseillers}
          onClose={() => {
            setEditMember(null);
            onClose(); // fermer aussi le Details popup
          }}
          onUpdateMember={(data) => {
            setEditMember(null);
            onClose(); // fermer aussi le Details popup
          }}
        />
      )}
    </>
  );
}
