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

        {/* Détails de base */}
        <div className="space-y-2 text-sm">
          <p>📱 <strong>Téléphone :</strong> {member.telephone || "—"}</p>
          <p>💬 <strong>WhatsApp :</strong> {member.is_whatsapp ? "Oui" : "Non"}</p>
          <p>🏙 <strong>Ville :</strong> {member.ville || "—"}</p>
          <p>🧩 <strong>Comment est-il venu :</strong> {member.venu || "—"}</p>
          <p>❓<strong>Besoin :</strong> {member.besoin || "—"}</p>
          <p>📝 <strong>Infos supplémentaires :</strong> {member.infos_supplementaires || "—"}</p>
        </div>

        {/* ==================== STATUT ==================== */}
        <div className="mt-4">
          <p className="mt-2 font-semibold text-blue-600">Statut :</p>
          <select
            value={member.statut || ""}
            onChange={(e) => handleChangeStatus(member.id, e.target.value)}
            className="border rounded-md px-2 py-1 text-sm text-gray-700 w-full"
          >
            {statusOptions.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>

          {/* ==================== CELLULE ==================== */}
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

          {/* ==================== BOUTON ENVOYER ==================== */}
          {selectedCellules[member.id] && (
            <div className="mt-2">
              <BoutonEnvoyer
                membre={member}
                cellule={cellules.find((c) => c.id === selectedCellules[member.id])}
                onStatusUpdate={handleStatusUpdateFromEnvoyer}
                session={session}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
