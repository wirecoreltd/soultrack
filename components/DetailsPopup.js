"use client";

import BoutonEnvoyer from "./BoutonEnvoyer";

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
  if (!member) return null;

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
        <h3 className="text-lg font-semibold mb-3 text-center">
          {member.prenom || ""} {member.nom || ""}
        </h3>
        <p className="text-sm text-gray-600 mb-2 text-center">
          📱 {member.telephone || "—"}
        </p>

        {/* Détails de base */}
        <div className="space-y-2 text-sm">
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
          <p>📝 Infos supplémentaires : {member.infos_supplementaires || "—"}</p>
        </div>

        {/* ==================== STATUT ET CELLULE ==================== */}
        <div className="mt-4 space-y-2 text-sm">
          {/* Statut affiché en lecture seule */}
          <p className="mt-2 font-semibold text-gray-800">
            Statut :{" "}
            <span className="text-blue-600 font-medium">
              {member.statut || "—"}
            </span>
          </p>

          {/* Cellule affichée sur la même ligne */}
          <p className="mt-2 font-semibold text-green-600">
            Cellule :
            <span className="text-gray-700 font-normal ml-1">
              {(() => {
                const cellule = cellules.find((c) => c.id === member.cellule_id);
                return cellule
                  ? `${cellule.cellule} (${cellule.responsable || "—"})`
                  : "—";
              })()}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
