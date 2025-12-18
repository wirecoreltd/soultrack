"use client";

import React from "react";

export default function BoutonEnvoyerPopup({ membre, type, cible, onEnvoyer, session, showToast }) {
  if (!cible) return null;

  const handleClick = () => {
    if (!cible) return;
    onEnvoyer(membre);
    showToast?.(`✅ Contact envoyé à ${type === "cellule" ? cible.cellule_full : cible.prenom + " " + cible.nom}`);
  };

  return (
    <div className="border-t pt-2 flex flex-col gap-2">
      {/* Bouton principal */}
      <button
        onClick={handleClick}
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md font-semibold"
      >
        Envoyer à {type === "cellule" ? cible.cellule_full : `${cible.prenom} ${cible.nom}`}
      </button>

      {/* Actions rapides */}
      {membre.telephone && (
        <div className="flex flex-col gap-1 text-sm text-gray-700 mt-2">
          <a href={`tel:${membre.telephone}`} className="hover:underline">📞 Appeler</a>
          <a href={`sms:${membre.telephone}`} className="hover:underline">✉️ SMS</a>
          <a href={`https://wa.me/${membre.telephone.replace(/\D/g, "")}`} target="_blank" className="hover:underline">💬 WhatsApp</a>
          <a href={`https://wa.me/${membre.telephone.replace(/\D/g, "")}?text=Bonjour`} target="_blank" className="hover:underline">📱 Message WhatsApp</a>
        </div>
      )}
    </div>
  );
}
