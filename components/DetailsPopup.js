"use client";

import { useState } from "react";
import BoutonEnvoyer from "./BoutonEnvoyer";

export default function DetailsPopup({
  member,
  onClose,
  statusOptions = [],
  cellules = [],
  conseillers = [],
  handleChangeStatus,
  handleAfterSend,
  session,
  showToast,
}) {
  const [selectedTargetTypeLocal, setSelectedTargetTypeLocal] = useState({});
  const [selectedTargetsLocal, setSelectedTargetsLocal] = useState({});
  const [loading, setLoading] = useState(false);

  if (!member) return null;

  const isNouveau = member.statut === "visiteur" || member.statut === "veut rejoindre ICC";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 transition-all duration-200">
      <div className="bg-white text-black p-6 rounded-lg w-96 max-h-[90vh] overflow-y-auto relative shadow-xl">
        {/* Bouton de fermeture */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-red-500 font-bold hover:text-red-700"
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
        <div className="mt-2">
                          <label className="text-gray-700 text-sm mr-2">🕊 Statut :</label>
                          <select
                            value={statusChanges[m.id] ?? m.statut ?? ""}
                            onChange={(e) => handleStatusChange(m.id, e.target.value)}
                            className="border rounded-md px-2 py-1 text-sm"
                          >
                            <option value="">-- Choisir un statut --</option>
                            <option value="visiteur">Visiteur</option>
                            <option value="veut rejoindre ICC">Veut rejoindre ICC</option>
                            <option value="membre">Membre</option>
                            <option value="integrer">Intégré</option>
                            <option value="refus">Refus</option>
                            {/* ajoute d'autres statuts si nécessaire */}
                          </select>
                        </div>

        {/* Infos membre */}
        <div className="text-gray-700 text-sm mt-3 w-full space-y-2">
          <p>💬 WhatsApp : {member.is_whatsapp ? "Oui" : "Non"}</p>
          <p>🏙 Ville : {member.ville || "—"}</p>
          {isNouveau && (
            <p>
              ❓Besoin :{" "}
              {(() => {
                if (!member.besoin) return "—";
                if (Array.isArray(member.besoin)) return member.besoin.join(", ");
                try {
                  const arr = JSON.parse(member.besoin);
                  return Array.isArray(arr) ? arr.join(", ") : member.besoin;
                } catch {
                  return member.besoin;
                }
              })()}
            </p>
          )}
          <p>📝 Infos : {member.infos_supplementaires || "—"}</p>
          {!isNouveau && (
            <p className="mt-2">
              🏠 Cellule :{" "}
              <span className="text-gray-700 font-normal ml-1">
                {(() => {
                  const cellule = cellules.find(c => c.id === member.cellule_id);
                  return cellule ? `${cellule.cellule} (${cellule.responsable || "—"})` : "—";
                })()}
              </span>
            </p>
          )}
        </div>

        {/* ENVOYER À */}
        <div className="mt-4">
          <label className="font-semibold text-sm">Envoyer à :</label>
          <select
            value={selectedTargetTypeLocal[member.id] || ""}
            onChange={e =>
              setSelectedTargetTypeLocal(prev => ({ ...prev, [member.id]: e.target.value }))
            }
            className="mt-1 w-full border rounded px-2 py-1 text-sm"
          >
            <option value="">-- Choisir une option --</option>
            <option value="cellule">Une Cellule</option>
            <option value="conseiller">Un Conseiller</option>
          </select>

          {(selectedTargetTypeLocal[member.id] === "cellule" ||
            selectedTargetTypeLocal[member.id] === "conseiller") && (
            <select
              value={selectedTargetsLocal[member.id] || ""}
              onChange={e =>
                setSelectedTargetsLocal(prev => ({ ...prev, [member.id]: e.target.value }))
              }
              className="mt-1 w-full border rounded px-2 py-1 text-sm"
            >
              <option value="">
                -- Choisir {selectedTargetTypeLocal[member.id]} --
              </option>
              {selectedTargetTypeLocal[member.id] === "cellule"
                ? cellules.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.cellule} ({c.responsable})
                    </option>
                  ))
                : conseillers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.prenom} {c.nom}
                    </option>
                  ))}
            </select>
          )}

          {selectedTargetsLocal[member.id] && (
            <div className="pt-2">
              <BoutonEnvoyer
                membre={member}
                type={selectedTargetTypeLocal[member.id]}
                cible={
                  selectedTargetTypeLocal[member.id] === "cellule"
                    ? cellules.find(c => c.id === selectedTargetsLocal[member.id])
                    : conseillers.find(c => c.id === selectedTargetsLocal[member.id])
                }
                onEnvoyer={(id) => {
                  handleAfterSend(
                    id,
                    selectedTargetTypeLocal[member.id],
                    selectedTargetTypeLocal[member.id] === "cellule"
                      ? cellules.find(c => c.id === selectedTargetsLocal[member.id])
                      : conseillers.find(c => c.id === selectedTargetsLocal[member.id])
                  );
                
                  // 🔥 Fermer le popup automatiquement après l'envoi
                  onClose();
                }}
                session={session}
                showToast={showToast}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
