"use client";

import BoutonEnvoyer from "./BoutonEnvoyer";
import { useState } from "react";

export default function DetailsPopup({
  member,
  onClose,
  statusOptions = [],
  cellules = [],
  selectedCellules = {},
  setSelectedCellules,
  handleChangeStatus,
  handleStatusUpdateFromEnvoyer,
  session,
}) {
  const [isOpen, setIsOpen] = useState(false);

  if (!member) return null;

  const toggleDetails = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 transition-all duration-200">
      <div className="bg-white text-black p-6 rounded-lg w-80 max-h-[90vh] overflow-y-auto relative shadow-xl">
        {/* Bouton de fermeture */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-red-500 font-bold hover:text-red-700"
          aria-label="Fermer la fenêtre"
        >
          ✕
        </button>

        {/* Titre */}
        <h2 className="text-lg font-bold text-gray-800 text-center">
          {member.prenom} {member.nom}
        </h2>
        <p className="text-sm text-gray-600 mb-2 text-center">
          📱 {member.telephone || "—"}
        </p>
        <p className="text-sm text-gray-600 mb-2 text-center">
          🕊 Statut : {member.statut || "—"}
        </p>

        <button
          onClick={toggleDetails}
          className="text-orange-500 text-center underline text-sm"
        >
          {isOpen ? "Fermer détails" : "Détails"}
        </button>

        {isOpen && (
          <div className="text-gray-700 text-sm mt-2 space-y-2 w-full">
            <p>💬 WhatsApp : {member.is_whatsapp ? "Oui" : "Non"}</p>
            <p>🏙 Ville : {member.ville || "—"}</p>
            <p>🧩 Comment est-il venu : {member.venu || "—"}</p>
            <p>
              ❓Besoin :{" "}
              {(() => {
                if (!member.besoin) return "—";
                if (Array.isArray(member.besoin))
                  return member.besoin.join(", ");
                try {
                  const arr = JSON.parse(member.besoin);
                  return Array.isArray(arr) ? arr.join(", ") : member.besoin;
                } catch {
                  return member.besoin;
                }
              })()}
            </p>
            <p>📝 Infos : {member.infos_supplementaires || "—"}</p>

            <p className="mt-2 font-semibold text-bleu-600">Statut :</p>
            <select
              value={member.statut}
              onChange={(e) => handleChangeStatus(member.id, e.target.value)}
              className="border rounded-md px-2 py-1 text-sm text-gray-700 w-full"
            >
              {statusOptions.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>

            <p className="mt-2 font-semibold text-green-600">Cellule :</p>
            <select
              value={selectedCellules[member.id] || ""}
              onChange={(e) =>
                setSelectedCellules((prev) => ({
                  ...prev,
                  [member.id]: e.target.value,
                }))
              }
              className="border rounded-lg px-2 py-1 text-sm w-full"
            >
              <option value="">-- Sélectionner cellule --</option>
              {cellules.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.cellule} ({c.responsable})
                </option>
              ))}
            </select>

            {selectedCellules[member.id] && (
              <div className="mt-2">
                <BoutonEnvoyer
                  membre={member}
                  cellule={cellules.find(
                    (c) => c.id === selectedCellules[member.id]
                  )}
                  onStatusUpdate={handleStatusUpdateFromEnvoyer}
                  session={session}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
