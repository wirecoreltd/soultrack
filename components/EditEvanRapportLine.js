"use client";

import { useEffect, useState } from "react";

export default function EditEvanRapportLine({
  isOpen,
  onClose,
  rapport,
  onSave,
}) {
  const [formData, setFormData] = useState({
    date: "",
    hommes: 0,
    femmes: 0,
    priere: 0,
    nouveau_converti: 0,
    reconciliation: 0,
    moissonneurs: "",
  });

  // Met à jour le formulaire quand le rapport change
  useEffect(() => {
    if (rapport) {
      setFormData({
        date: rapport.date || "",
        hommes: rapport.hommes ?? 0,
        femmes: rapport.femmes ?? 0,
        priere: rapport.priere ?? 0,
        nouveau_converti: rapport.nouveau_converti ?? 0,
        reconciliation: rapport.reconciliation ?? 0,
        moissonneurs: rapport.moissonneurs ?? "",
      });
    }
  }, [rapport]);

  if (!isOpen || !rapport) return null;

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  const fields = [
    { key: "date", label: "Date", type: "date", disabled: true },
    { key: "hommes", label: "Hommes", type: "number" },
    { key: "femmes", label: "Femmes", type: "number" },
    { key: "priere", label: "Prière du salut", type: "number" },
    { key: "nouveau_converti", label: "Nouveau converti", type: "number" },
    { key: "reconciliation", label: "Réconciliation", type: "number" },
    { key: "moissonneurs", label: "Moissonneurs", type: "text" },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-80 shadow-lg max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-center">
          Modifier le rapport
        </h2>

        <div className="flex flex-col gap-3">
          {fields.map((f) => (
            <div key={f.key} className="flex flex-col">
              <label className="font-semibold mb-1">{f.label}</label>
              <input
                type={f.type}
                disabled={f.disabled}
                className="input"
                value={formData[f.key]}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    [f.key]:
                      f.type === "number"
                        ? parseInt(e.target.value) || 0
                        : e.target.value,
                  })
                }
                placeholder={f.label}
              />
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-400 rounded hover:bg-gray-500 text-white"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-500 rounded hover:bg-blue-600 text-white"
          >
            Enregistrer
          </button>
        </div>

        <style jsx>{`
          .input {
            width: 100%;
            border: 1px solid #ccc;
            border-radius: 12px;
            padding: 8px;
          }
        `}</style>
      </div>
    </div>
  );
}
