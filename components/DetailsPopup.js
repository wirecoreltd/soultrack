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
        <h2 className="text-lg font-bold text-gray-800 text-center">
                          {m.prenom} {m.nom}
                        </h2>
                        <p className="text-sm text-gray-600 mb-2 text-center">
                          📱 {m.telephone || "—"}
                        </p>
                        <p className="text-sm text-gray-600 mb-2 text-center">
                          🕊 Statut : {m.statut || "—"}
                        </p>
                        <button
                          onClick={() => toggleDetails(m.id)}
                          className="text-orange-500 underline text-sm"
                        >
                          {isOpen ? "Fermer détails" : "Détails"}
                        </button>
                        {isOpen && (
                          <div className="text-gray-700 text-sm mt-2 space-y-2 w-full">
                            <p>💬 WhatsApp : {m.is_whatsapp ? "Oui" : "Non"}</p>
                            <p>🏙 Ville : {m.ville || "—"}</p>
                            <p>🧩 Comment est-il venu : {m.venu || "—"}</p>
                            <p>
                              ❓Besoin :{" "}
                              {(() => {
                                if (!m.besoin) return "—";
                                if (Array.isArray(m.besoin)) return m.besoin.join(", ");
                                try {
                                  const arr = JSON.parse(m.besoin);
                                  return Array.isArray(arr) ? arr.join(", ") : m.besoin;
                                } catch {
                                  return m.besoin;
                                }
                              })()}
                            </p>
                            <p>📝 Infos : {m.infos_supplementaires || "—"}</p>

                            <p className="mt-2 font-semibold text-bleu-600">Statut :</p>
                            <select
                              value={m.statut}
                              onChange={(e) => handleChangeStatus(m.id, e.target.value)}
                              className="border rounded-md px-2 py-1 text-sm text-gray-700 w-full"
                            >
                              {statusOptions.map((s) => (
                                <option key={s}>{s}</option>
                              ))}
                            </select>

                            <p className="mt-2 font-semibold text-green-600">Cellule :</p>
                            <select
                              value={selectedCellules[m.id] || ""}
                              onChange={(e) =>
                                setSelectedCellules((prev) => ({
                                  ...prev,
                                  [m.id]: e.target.value,
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

                            {selectedCellules[m.id] && (
                              <div className="mt-2">
                                <BoutonEnvoyer
                                  membre={m}
                                  cellule={cellules.find((c) => c.id === selectedCellules[m.id])}
                                  onStatusUpdate={handleStatusUpdateFromEnvoyer}
                                  session={session}
                                />
                              </div>
      </div>
    </div>
  );
}
