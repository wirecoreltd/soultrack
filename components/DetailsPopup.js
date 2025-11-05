"use client";
export default function DetailsPopup({ member, onClose }) {
  if (!member) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 transition-all duration-200">
      <div className="bg-white text-black p-6 rounded-lg w-80 max-h-[90vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-red-500 font-bold"
        >
          ✕
        </button>
        <h3 className="text-lg font-semibold">
          {member.prenom} {member.nom}
        </h3>
        <p>📱 {member.telephone || "—"}</p>
        <p>💬 WhatsApp : {member.is_whatsapp || "—"}</p>
        <p>🏙 Ville : {member.ville || "—"}</p>
        <p>🕊 Statut : {member.statut || "—"}</p>
        <p>🧩 Comment est-il venu : {member.venu || "—"}</p>
        <p>❓Besoin : {member.besoin || "—"}</p>
        <p>📝 Infos : {member.infos_supplementaires || "—"}</p>
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
                                  cellule={cellules.find(
                                    (c) => c.id === selectedCellules[m.id]
                                  )}
                                  onStatusUpdate={handleStatusUpdateFromEnvoyer}
                                  session={session}
                                />
                              </div>
      </div>
    </div>
  );
}
