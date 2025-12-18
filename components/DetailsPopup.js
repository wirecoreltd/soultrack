"use client";

import { useState, useEffect } from "react";
import BoutonEnvoyer from "./BoutonEnvoyer";

export default function DetailsPopup({
  membre,
  onClose,
  cellules = [],
  conseillers = [],
  handleAfterSend,
  session,
  showToast,
}) {
  if (!membre || !membre.id) return null;

  const [targetType, setTargetType] = useState("");
  const [targetId, setTargetId] = useState("");
  const [openPhoneMenu, setOpenPhoneMenu] = useState(false);

  // fermer menu téléphone
  useEffect(() => {
    const close = (e) => {
      if (!e.target.closest(".phone-menu") && !e.target.closest(".phone-button")) {
        setOpenPhoneMenu(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const cible =
    targetType === "cellule"
      ? cellules.find((c) => c.id === targetId)
      : conseillers.find((c) => c.id === targetId);

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 relative max-h-[90vh] overflow-auto">
        {/* fermer */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          ✖
        </button>

        {/* Nom */}
        <h2 className="text-xl font-bold text-center mb-1">
          {membre.prenom} {membre.nom} {membre.star && "⭐"}
        </h2>

        {/* Téléphone */}
        {membre.telephone && (
          <div className="relative flex justify-center mb-2">
            <button
              className="text-blue-500 underline font-semibold phone-button"
              onClick={() => setOpenPhoneMenu(!openPhoneMenu)}
            >
              {membre.telephone}
            </button>

            {openPhoneMenu && (
              <div className="phone-menu absolute top-full mt-2 bg-white border rounded-lg shadow w-48 z-50">
                <a href={`tel:${membre.telephone}`} className="block px-4 py-2 hover:bg-gray-100">📞 Appeler</a>
                <a href={`sms:${membre.telephone}`} className="block px-4 py-2 hover:bg-gray-100">✉️ SMS</a>
                <a href={`https://wa.me/${membre.telephone.replace(/\D/g, "")}`} target="_blank" className="block px-4 py-2 hover:bg-gray-100">💬 WhatsApp</a>
              </div>
            )}
          </div>
        )}

        {/* Infos */}
        <div className="text-sm text-black space-y-1">
          <p className="text-center">🏙 Ville : {membre.ville || "—"}</p>
          <p className="text-center">🕊 Statut : {membre.statut || "—"}</p>
          <p>🏠 Cellule : {membre.cellule_ville && membre.cellule_nom ? `${membre.cellule_ville} - ${membre.cellule_nom}` : "—"}</p>
          <p>👤 Conseiller : {membre.conseiller_prenom ? `${membre.conseiller_prenom} ${membre.conseiller_nom}` : "—"}</p>
        </div>

        {/* ENVOYER À */}
        <div className="mt-4">
          <label className="font-semibold text-sm">Envoyer à :</label>

          <select
            value={targetType}
            onChange={(e) => {
              setTargetType(e.target.value);
              setTargetId("");
            }}
            className="mt-1 w-full border rounded px-2 py-1 text-sm"
          >
            <option value="">-- Choisir une option --</option>
            <option value="cellule">Une Cellule</option>
            <option value="conseiller">Un Conseiller</option>
          </select>

          {targetType && (
            <select
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              className="mt-2 w-full border rounded px-2 py-1 text-sm"
            >
              <option value="">-- Sélectionner --</option>
              {targetType === "cellule" &&
                cellules.map((c) => (
                  <option key={c.id} value={c.id}>{c.cellule_full}</option>
                ))}
              {targetType === "conseiller" &&
                conseillers.map((c) => (
                  <option key={c.id} value={c.id}>{c.prenom} {c.nom}</option>
                ))}
            </select>
          )}

          {cible && (
            <div className="mt-3">
              <BoutonEnvoyer
                membre={membre}
                type={targetType}
                cible={cible}
                onEnvoyer={(updated) => handleAfterSend(updated, targetType, cible)}
                session={session}
                showToast={showToast}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
