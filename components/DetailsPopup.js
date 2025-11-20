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

        {/* ====================== NOUVEAUX MEMBRES ====================== */}
        {isNouveau ? (
          <div className="text-gray-700 text-sm mt-3 w-full space-y-2">
                            <p>💬 WhatsApp : {m.is_whatsapp ? "Oui" : "Non"}</p>
                            <p>🏙 Ville : {m.ville || ""}</p>
                            <p>❓Besoin : {
                              (() => {
                                if (!m.besoin) return "—";
                                if (Array.isArray(m.besoin)) return m.besoin.join(", ");
                                try {
                                  const arr = JSON.parse(m.besoin);
                                  return Array.isArray(arr) ? arr.join(", ") : m.besoin;
                                } catch { return m.besoin; }
                              })()
                            }</p>
                            <p>📝 Infos : {m.infos_supplementaires || "—"}</p>

                            <div className="mt-2">
                              <label className="font-semibold text-sm">Envoyer à :</label>
                              <select
                                value={selectedTargetType[m.id] || ""}
                                onChange={(e) => setSelectedTargetType(prev => ({ ...prev, [m.id]: e.target.value }))}
                                className="mt-1 w-full border rounded px-2 py-1 text-sm"
                              >
                                <option value="">-- Choisir une option --</option>
                                <option value="cellule">Une Cellule</option>
                                <option value="conseiller">Un Conseiller</option>
                              </select>

                              {(selectedTargetType[m.id] === "cellule" || selectedTargetType[m.id] === "conseiller") && (
                                <select
                                  value={selectedTargets[m.id] || ""}
                                  onChange={(e) => setSelectedTargets(prev => ({ ...prev, [m.id]: e.target.value }))}
                                  className="mt-1 w-full border rounded px-2 py-1 text-sm"
                                >
                                  <option value="">-- Choisir {selectedTargetType[m.id]} --</option>
                                  {selectedTargetType[m.id] === "cellule"
                                    ? cellules.map(c => <option key={c.id} value={c.id}>{c.cellule} ({c.responsable})</option>)
                                    : conseillers.map(c => <option key={c.id} value={c.id}>{c.prenom} {c.nom}</option>)
                                  }
                                </select>
                              )}

                              {selectedTargets[m.id] && (
                                <div className="pt-2">
                                  <BoutonEnvoyer
                                    membre={m}
                                    type={selectedTargetType[m.id]}
                                    cible={selectedTargetType[m.id] === "cellule"
                                      ? cellules.find(c => c.id === selectedTargets[m.id])
                                      : conseillers.find(c => c.id === selectedTargets[m.id])
                                    }
                                    onEnvoyer={(id) =>
                                      handleAfterSend(
                                        id,
                                        selectedTargetType[m.id],
                                        selectedTargetType[m.id] === "cellule"
                                          ? cellules.find(c => c.id === selectedTargets[m.id])
                                          : conseillers.find(c => c.id === selectedTargets[m.id])
                                      )
                                    }
                                    session={session}
                                    showToast={showToast}
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
