"use client";

import { useState } from "react";
import BoutonEnvoyer from "./BoutonEnvoyer";

export default function MemberCard({
  member,
  statusOptions,
  cellules,
  conseillers,
  selectedDestinations,
  setSelectedDestinations,
  handleStatusUpdateFromEnvoyer,
  session,
  onEdit,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [sendTo, setSendTo] = useState("cellule"); // cellule ou conseiller

  const isNouveau =
    member.statut === "visiteur" || member.statut === "veut rejoindre ICC";

  const getBorderColor = () => {
    if (member.star) return "#FBC02D";
    if (member.statut === "actif") return "#4285F4";
    if (member.statut === "a déjà son église") return "#f21705";
    if (member.statut === "integrer") return "#FFA500";
    if (member.statut === "ancien") return "#999999";
    if (member.statut === "veut rejoindre ICC" || member.statut === "visiteur")
      return "#34A853";
    return "#ccc";
  };

  const selectedDest = selectedDestinations[member.id] || "";

  return (
    <div
      className={`bg-white rounded-xl shadow-md border-l-4 overflow-hidden transition-all duration-300 relative ${
        isOpen ? "max-h-[900px]" : "max-h-[150px]"
      }`}
      style={{ borderLeftColor: getBorderColor() }}
    >
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
            <p>📝 Infos : {member.infos_supplementaires || "—"}</p>
            <p>📝 Commentaire Suivis : {member.commentaire_suivis || "—"}</p>  

            {/* Choix Cellule / Conseiller */}
            <div className="flex items-center gap-4 mt-2">
              <label>
                <input
                  type="radio"
                  name={`sendTo-${member.id}`}
                  value="cellule"
                  checked={sendTo === "cellule"}
                  onChange={() => {
                    setSendTo("cellule");
                    setSelectedDestinations((prev) => ({ ...prev, [member.id]: "" }));
                  }}
                />{" "}
                Cellule
              </label>
              <label>
                <input
                  type="radio"
                  name={`sendTo-${member.id}`}
                  value="conseiller"
                  checked={sendTo === "conseiller"}
                  onChange={() => {
                    setSendTo("conseiller");
                    setSelectedDestinations((prev) => ({ ...prev, [member.id]: "" }));
                  }}
                />{" "}
                Conseiller
              </label>
            </div>

            {/* Dropdown selon choix */}
            <select
              value={selectedDest}
              onChange={(e) =>
                setSelectedDestinations((prev) => ({
                  ...prev,
                  [member.id]: e.target.value,
                }))
              }
              className="border rounded-lg px-2 py-1 text-sm w-full mt-1"
            >
              <option value="">
                {sendTo === "cellule" ? "-- Sélectionner cellule --" : "-- Sélectionner un conseiller --"}
              </option>
              {sendTo === "cellule"
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

            {/* Bouton Envoyer */}
            {selectedDest && (
              <div className="mt-2 w-full">
                <BoutonEnvoyer
                  membre={member}
                  type={sendTo}
                  cible={
                    sendTo === "cellule"
                      ? cellules.find((c) => c.id === selectedDest)
                      : conseillers.find((c) => c.id === selectedDest)
                  }
                  session={session}
                  onEnvoyer={(id, type, cible, newStatut) =>
                    handleStatusUpdateFromEnvoyer(member.id, member.statut, {
                      ...member,
                      statut: newStatut,
                      cellule_id: type === "cellule" ? cible.id : member.cellule_id,
                      conseiller_id: type === "conseiller" ? cible.id : member.conseiller_id,
                    })
                  }
                />
              </div>
            )}

            {/* Modifier */}
            {!isNouveau && (
              <div className="flex justify-center mt-4">
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
