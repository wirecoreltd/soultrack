"use client";

import React from "react";

export default function BoutonEnvoyerPopup({
  membre,
  type,
  cible,
  onEnvoyer,
  session,
  showToast,
}) {
  if (!membre || !cible) return null;

  const phone = membre.telephone ? membre.telephone.replace(/\D/g, "") : "";

  const handleClick = () => {
    onEnvoyer(membre);
    showToast?.("✅ Contact envoyé et suivi enregistré");
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-2 shadow-md">
      <div className="flex flex-col items-center gap-2">
        <button
          onClick={handleClick}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full"
        >
          Envoyer à {type === "cellule" ? cible.cellule_full : `${cible.prenom} ${cible.nom}`}
        </button>

        {/* Actions téléphone */}
        {phone && (
          <div className="flex justify-between w-full text-sm mt-1">
            <a href={`tel:${membre.telephone}`} className="text-blue-500 hover:underline">📞 Appeler</a>
            <a href={`sms:${membre.telephone}`} className="text-green-500 hover:underline">✉️ SMS</a>
            <a href={`https://wa.me/${phone}`} target="_blank" className="text-green-700 hover:underline">💬 WhatsApp</a>
            <a href={`https://wa.me/${phone}?text=Bonjour`} target="_blank" className="text-purple-600 hover:underline">📱 Message WA</a>
          </div>
        )}
      </div>
    </div>
  );
}
