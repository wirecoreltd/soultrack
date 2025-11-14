"use client";

import { useState } from "react";
import BoutonEnvoyer from "./BoutonEnvoyer";
import EditMemberPopup from "./EditMemberPopup";

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
  const [editMember, setEditMember] = useState(null);

  if (!member) return null;

  const isNouveau =
    member.statut === "visiteur" || member.statut === "veut rejoindre ICC";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 transition-all duration-200">
      <div className="bg-white text-black p-6 rounded-lg w-80 max-h-[90vh] overflow-y-auto relative shadow-xl">       

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

        {/* ====================== NOUVEAUX MEMBRES ====================== */}
        {isNouveau ? (
          <div className="text-gray-700 text-sm mt-2 space-y-2 w-full">
            <p>💬 WhatsApp : {member.is_whatsapp ? "Oui" : "Non"}</p>
            <p>🏙 Ville : {member.ville || "—"}</p>
            <p>🧩 Comment est-il venu : {member.venu || "—"}</p>
            <p>
              ❓Besoin :{" "}
              {member.besoin
                ? Array.isArray(member.besoin)
                  ? member.besoin.join(", ")
                  : (() => {
                      try {
                        const arr = JSON.parse(member.besoin);
                        return Array.isArray(arr) ? arr.join(", ") : member.besoin;
                      } catch {
                        return member.besoin;
                      }
                    })()
                : "—"}
            </p>
            <p>📝 Infos : {member.infos_supplementaires || "—"}</p>

            <p className="mt-2 font-semibold text-blue-600">Statut :</p>
            {Array.isArray(statusOptions) && statusOptions.length > 0 && (
              <select
                value={member.statut}
                onChange={(e) => handleChangeStatus(member.id, e.target.value)}
                className="border rounded-md px-2 py-1 text-sm text-gray-700 w-full"
              >
                {statusOptions.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            )}

            <p className="mt-2 font-semibold text-green-600">Cellule :</p>
            {Array.isArray(cellules) && cellules.length > 0 && (
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
            )}

            {selectedCellules?.[member.id] && cellules.length > 0 && (
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
        ) : (
          /* ====================== MEMBRES EXISTANTS ====================== */
          <div className="text-gray-700 text-sm mt-2 space-y-2 w-full">
            <p>💬 WhatsApp : {member.is_whatsapp ? "Oui" : "Non"}</p>
            <p>🏙 Ville : {member.ville || "—"}</p>
            <p>🧩 Comment est-il venu : {member.venu || "—"}</p>
            <p>📝 Infos : {member.infos_supplementaires || "—"}</p>
            <p className="mt-2 text-black-600">
              🏠 Cellule :{" "}
              <span className="text-gray-700 font-normal ml-1">
                {(() => {
                  const cellule = cellules.find((c) => c.id === member.cellule_id);
                  return cellule
                    ? `${cellule.cellule} (${cellule.responsable || "—"})`
                    : "—";
                })()}
              </span>
            </p>

            <div className="text-center mt-3">
              <button
                onClick={onClose} // <-- ferme le popup
                className="text-red-500 underline text-sm hover:text-red-700"
              >
                Fermer les détails
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ====================== POPUP MODIFICATION ====================== */}
      {editMember && (
        <EditMemberPopup
          member={editMember}
          onClose={() => setEditMember(null)}
          cellules={cellules}
          statusOptions={statusOptions}
          handleChangeStatus={handleChangeStatus}
        />
      )}
    </div>
  );
}
