"use client";

import { useState } from "react";
import BoutonEnvoyer from "./BoutonEnvoyer";

export default function DetailsPopup({
  member,
  onClose,
  statusOptions,
  cellules,
  conseillers,
  handleAfterSend,
  session,
}) {
  const [selectedTargetType, setSelectedTargetType] = useState("");
  const [selectedTarget, setSelectedTarget] = useState("");
  const [statusChange, setStatusChange] = useState(member.statut);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          ✖
        </button>

        <h2 className="text-lg font-bold mb-4">
          {member.prenom} {member.nom}
        </h2>

        <div className="space-y-2 text-sm text-gray-700">
          <p>📱 Téléphone : {member.telephone || "—"}</p>
          <p>💬 WhatsApp : {member.is_whatsapp ? "Oui" : "Non"}</p>
          <p>🏙 Ville : {member.ville || "—"}</p>
          <p>
            ❓ Besoin :{" "}
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
          <p>📝 Infos : {member.infos_supplementaires || "—"}</p>

          {/* Statut */}
          <div className="mt-2">
            <label className="font-semibold text-sm">Statut :</label>
            <select
              value={statusChange}
              onChange={(e) => setStatusChange(e.target.value)}
              className="mt-1 w-full border rounded px-2 py-1 text-sm"
            >
              {statusOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Envoyer à */}
          <div className="mt-4">
            <label className="font-semibold text-sm">Envoyer à :</label>
            <select
              value={selectedTargetType}
              onChange={(e) => {
                setSelectedTargetType(e.target.value);
                setSelectedTarget(""); // reset cible
              }}
              className="mt-1 w-full border rounded px-2 py-1 text-sm"
            >
              <option value="">-- Choisir une option --</option>
              <option value="cellule">Une Cellule</option>
              <option value="conseiller">Un Conseiller</option>
            </select>

            {selectedTargetType && (
              <select
                value={selectedTarget}
                onChange={(e) => setSelectedTarget(e.target.value)}
                className="mt-1 w-full border rounded px-2 py-1 text-sm"
              >
                <option value="">-- Choisir {selectedTargetType} --</option>
                {selectedTargetType === "cellule"
                  ? cellules.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.cellule} ({c.responsable})
                      </option>
                    ))
                  : conseillers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.prenom} {c.nom}
                      </option>
                    ))}
              </select>
            )}

            {selectedTarget && (
              <div className="mt-2">
                <BoutonEnvoyer
                  membre={member}
                  type={selectedTargetType}
                  cible={
                    selectedTargetType === "cellule"
                      ? cellules.find((c) => c.id === selectedTarget)
                      : conseillers.find((c) => c.id === selectedTarget)
                  }
                  onEnvoyer={() =>
                    handleAfterSend(
                      member.id,
                      selectedTargetType,
                      selectedTargetType === "cellule"
                        ? cellules.find((c) => c.id === selectedTarget)
                        : conseillers.find((c) => c.id === selectedTarget)
                    )
                  }
                  session={session}
                  showToast={(msg) => alert(msg)}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
