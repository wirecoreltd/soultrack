// components/EditRapportLine.jsx
"use client";
import { useState } from "react";

export default function EditRapportLine({ rapport, onSave }) {
  const [moissonneurs, setMoissonneurs] = useState(rapport.moissonneurs || "");

  const handleSave = () => {
    onSave({ ...rapport, moissonneurs });
  };

  return (
    <tr className="text-center border-b">
      <td className="py-2 px-3">{rapport.date}</td>
      <td className="py-2 px-3">{rapport.hommes}</td>
      <td className="py-2 px-3">{rapport.femmes}</td>
      <td className="py-2 px-3">{rapport.priere}</td>
      <td className="py-2 px-3">{rapport.nouveau_converti}</td>
      <td className="py-2 px-3">{rapport.reconciliation}</td>
      <td className="py-2 px-3">
        <input
          type="text"
          value={moissonneurs}
          onChange={(e) => setMoissonneurs(e.target.value)}
          className="border px-2 py-1 rounded w-24 text-center"
          placeholder="Nombre ou noms"
        />
      </td>
      <td className="py-2 px-3">
        <button
          onClick={handleSave}
          className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Enregistrer
        </button>
      </td>
    </tr>
  );
}
