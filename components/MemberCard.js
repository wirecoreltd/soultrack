// components/MemberCard.js

"use client";

import { useState } from "react";
import BoutonEnvoyer from "./BoutonEnvoyer";

export default function MemberCard({
  member,
  statusOptions,
  cellules,
  selectedCellules,
  setSelectedCellules,
  handleChangeStatus,
  handleStatusUpdateFromEnvoyer,
  session,
  onEdit,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [localMessage, setLocalMessage] = useState("");

  const isNouveau =
    member.statut === "visiteur" || member.statut === "veut rejoindre ICC";

  const getBorderColor = () => {
    if (member.star) return "#FBC02D";
    if (member.statut === "actif") return "#4285F4";
    if (member.statut === "a déjà mon église") return "#EA4335";
    if (member.statut === "Integrer") return "#FFA500";
    if (member.statut === "ancien") return "#999999";
    if (member.statut === "veut rejoindre ICC" || member.statut === "visiteur")
      return "#34A853";
    return "#ccc";
  };

  const handleLocalStatusChange = async (id, newStatus) => {
    await handleChangeStatus(id, newStatus);
    setLocalMessage("✅ Changement effectué !");
    setTimeout(() => setLocalMessage(""), 2000);
  };

  const handleEnvoyerCallback = (updatedMember) => {
    handleStatusUpdateFromEnvoyer(member.id, member.statut, updatedMember);
    setLocalMessage("✅ Enregistrement réussi !");
    setTimeout(() => setLocalMessage(""), 2000);
  };

  return (
    <div
      className={`bg-white rounded-xl shadow-md border-l-4 overflow-hidden transition-all duration-300 relative ${
        isOpen ? "max-h-[900px]" : "max-h-[150px]"
      }`}
      style={{ borderLeftColor: getBorderColor() }}
    >
      {/* Badge Nouveau */}
      {isNouveau && (
        <span className="absolute top-3 right-[-25px] bg-blue-600 text-white text-[10px] font-bold px-6 py-1 rotate-45 shadow-md">
          Nouveau
        </span>
      )}

      <div className="p-4 flex flex-col items-center">
        <h2 className="text-lg font-bold text-gray-800 text-center">
          {member.prenom} {member.nom} {member.star && "⭐"}
        </h2>
        <p className="text-sm text-gray-600 mb-2 text-center">
          📱 {member.telephone || "—"}
        </p>
        <p className="text-sm text-gray-600 mb-2 text-center">
          🕊 Statut : {member.statut || "—"}
        </p>

        {/* Message local */}
        {localMessage && (
          <p className="text-green-500 font-semibold mb-2">{localMessage}</p>
        )}

        {/* Toggle détails */}
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="text-orange-500 underline text-sm mb-2"
        >
          {isOpen ? "Fermer détails" : "Détails"}
        </button>

        {isOpen && (
          <div className="text-gray-700 text-sm mt-2 w-full space-y-2">
            <p>💬 WhatsApp : {member.is_whatsapp ? "Oui" : "Non"}</p>
            <p>🏙 Ville : {member.ville || "—"}</p>
            <p>🧩 Comment est-il venu : {member.venu || "—"}</p>
            <p>📝 Infos : {member.infos_supplementaires || "—"}</p>

            {isNouveau ? (
              <>
                {/* Statut */}
                <p className="mt-2 font-semibold text-blue-600">Statut :</p>
                <select
                  value={member.statut}
                  onChange={(e) =>
                    handleLocalStatusChange(member.id, e.target.value)
                  }
                  className="border rounded-md px-2 py-1 text-sm text-gray-700 w-full"
                >
                  {statusOptions.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>

                {/* Cellule */}
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

                {/* BoutonEnvoyer pour nouveau membre */}
                {selectedCellules[member.id] && (
                  <div className="mt-2 w-full">
                    <BoutonEnvoyer
                      membre={member}
                      cellule={cellules.find(
                        (c) => c.id === selectedCellules[member.id]
                      )}
                      onStatusUpdate={handleEnvoyerCallback}
                      session={session}
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="text-center mt-3">
                <button
                  onClick={() => onEdit(member)}
                  className="text-blue-600 underline text-sm hover:text-blue-800"
                >
                  ✏️ Modifier le contact
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
