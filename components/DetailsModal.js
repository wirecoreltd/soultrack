"use client";

import { useState, useEffect, useRef } from "react";
import BoutonEnvoyer from "./BoutonEnvoyer";

export default function DetailsModal({
  m,                  // membre
  onClose,
  cellules = [],
  conseillers = [],
  session,
  handleStatusChange,
  handleCommentChange,
  statusChanges = {},
  commentChanges = {},
  updating = {},
  updateSuivi,
  handleAfterSend,
  showToast,
}) {
  if (!m || !m.id) return null;

  const [selectedTargetType, setSelectedTargetType] = useState("");
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [openPhoneMenu, setOpenPhoneMenu] = useState(false);
  const phoneMenuRef = useRef(null);

  // Fermer menu téléphone en cliquant dehors
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (phoneMenuRef.current && !phoneMenuRef.current.contains(e.target)) {
        setOpenPhoneMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const celluleNom = m.cellule_id ? (cellules.find(c => c.id === m.cellule_id)?.cellule_full || "—") : "—";
  const conseillerNom = m.conseiller_id
    ? `${conseillers.find(c => c.id === m.conseiller_id)?.prenom || ""} ${conseillers.find(c => c.id === m.conseiller_id)?.nom || ""}`.trim()
    : "—";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 relative overflow-y-auto max-h-[90vh]">

        {/* Fermer */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          ✖
        </button>

        {/* CENTRÉ */}
        <div className="flex flex-col items-center text-center">
          <h2 className="text-xl font-bold">
            {m.prenom} {m.nom} {m.star && "⭐"}
          </h2>

          {/* Téléphone */}
          {m.telephone && (
            <div className="relative mt-1" ref={phoneMenuRef}>
              <button
                onClick={() => setOpenPhoneMenu(!openPhoneMenu)}
                className="text-orange-500 underline font-semibold"
              >
                {m.telephone}
              </button>
              {openPhoneMenu && (
                <div className="absolute top-full mt-2 bg-white border rounded-lg shadow w-56 z-50">
                  <a href={`tel:${m.telephone}`} className="block px-4 py-2 hover:bg-gray-100 text-black">📞 Appeler</a>
                  <a href={`sms:${m.telephone}`} className="block px-4 py-2 hover:bg-gray-100 text-black">✉️ Envoyer SMS</a>
                  <a href={`https://wa.me/${m.telephone.replace(/\D/g, "")}`} target="_blank" className="block px-4 py-2 hover:bg-gray-100 text-black">💬 WhatsApp</a>
                  <a href={`https://wa.me/${m.telephone.replace(/\D/g, "")}?text=Bonjour`} target="_blank" className="block px-4 py-2 hover:bg-gray-100 text-black">📱 Envoyer message WhatsApp</a>
                </div>
              )}
            </div>
          )}

          <p className="mt-2">🏙 Ville : {m.ville || "—"}</p>
          <p>🕊 Statut : {m.statut || "—"}</p>

          {/* Envoyer à */}
          <div className="mt-3 w-full">
            <label className="font-semibold text-sm">Envoyer à :</label>
            <select
              value={selectedTargetType}
              onChange={(e) => {
                setSelectedTargetType(e.target.value);
                setSelectedTarget(null);
              }}
              className="mt-1 w-full border rounded px-2 py-1 text-sm"
            >
              <option value="">-- Choisir --</option>
              <option value="cellule">Une Cellule</option>
              <option value="conseiller">Un Conseiller</option>
            </select>

            {selectedTargetType && (
              <select
                value={selectedTarget || ""}
                onChange={(e) => setSelectedTarget(e.target.value)}
                className="mt-2 w-full border rounded px-2 py-1 text-sm"
              >
                <option value="">-- Sélectionner --</option>
                {selectedTargetType === "cellule"
                  ? cellules.map((c) => (
                      <option key={c.id} value={c.id}>{c.cellule_full || c.cellule}</option>
                    ))
                  : conseillers.map((c) => (
                      <option key={c.id} value={c.id}>{c.prenom} {c.nom}</option>
                    ))}
              </select>
            )}

            {selectedTarget && (() => {
              const cibleId = selectedTarget;
              return (
                <div className="mt-3">
                  <BoutonEnvoyer
                    membre={m}
                    type={selectedTargetType}
                    cible={{ id: cibleId }}
                    session={session}
                    onEnvoyer={(data) => handleAfterSend && handleAfterSend(data, selectedTargetType)}
                    showToast={showToast}
                  />
                </div>
              );
            })()}
          </div>
        </div>

        {/* ALIGNÉ À GAUCHE - DÉTAILS COMPLÈTES */}
        <div className="mt-5 text-sm text-black space-y-1">
          <p>🏠 Cellule : {celluleNom}</p>
          <p>👤 Conseiller : {conseillerNom}</p>
          <p>💬 WhatsApp : {m.is_whatsapp ? "Oui" : "Non"}</p>
          <p>⚥ Sexe : {m.sexe || "—"}</p>
          <p>❓ Besoin : {Array.isArray(m.besoin) ? m.besoin.join(", ") : m.besoin || "—"}</p>
          <p>📝 Infos : {m.infos_supplementaires || "—"}</p>
          <p>🧩 Comment est-il venu : {m.comment_est_il_venu || "—"}</p>
          <p>📋 Statut initial : {m.statut_initial ?? m.statut || "—"}</p>
          <p>📝 Commentaire Suivis : {m.commentaire_suivis || "—"}</p>
        </div>
      </div>
    </div>
  );
}
