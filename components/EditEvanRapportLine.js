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
    moissonneurs: "",
  });

  useEffect(() => {
    if (rapport) {
      setFormData({
        date: rapport.date,
        moissonneurs: rapport.moissonneurs || "",
      });
    }
  }, [rapport]);

  if (!isOpen || !rapport) return null;

  const handleSave = () => {
    onSave({
      date: formData.date,
      moissonneurs: formData.moissonneurs,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-80 shadow-lg">
        <h2 className="text-xl font-bold mb-4 text-center">
          Modifier les moissonneurs
        </h2>

        <div className="flex flex-col gap-3">
          <div className="flex flex-col">
            <label className="font-semibold mb-1">Date</label>
            <input
              type="date"
              className="input"
              value={formData.date}
              disabled
            />
          </div>

          <div className="flex flex-col">
            <label className="font-semibold mb-1">Moissonneurs</label>
            <input
              type="text"
              className="input"
              value={formData.moissonneurs}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  moissonneurs: e.target.value,
                })
              }
              placeholder="Ex: Jean, Paul, Marie"
            />
          </div>
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
