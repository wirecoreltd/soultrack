"use client";

import { useState, useEffect } from "react";
import BoutonEnvoyerPopup from "./BoutonEnvoyerPopup";

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

  const [selectedTargetType, setSelectedTargetType] = useState("");
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [openPhoneMenu, setOpenPhoneMenu] = useState(false);

  // Fermer le menu téléphone si clic en dehors
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".phone-menu") && !e.target.closest(".phone-button")) {
        setOpenPhoneMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Formater les besoins
  const formatBesoins = () => {
    if (!membre.besoin) return "—";
    if (Array.isArray(membre.besoin)) return membre.besoin.join(", ");
    try {
      const arr = JSON.parse(membre.besoin);
      return Array.isArray(arr) ? arr.join(", ") : membre.besoin;
    } catch {
      return membre.besoin;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 relative">
        {/* Bouton fermer */}
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

        {/* Téléphone centré */}
        {membre.telephone && (
          <div className="relative flex justify-center mb-2">
            <button
              className="text-blue-500 underline font-semibold phone-button"
              onClick={() => setOpenPhoneMenu(!openPhoneMenu)}
            >
              {membre.telephone}
            </button>

            {openPhoneMenu && (
              <div
                className="phone-menu absolute top-full mt-2 bg-white border rounded-lg shadow w-48 z-50"
                onClick={(e) => e.stopPropagation()}
              >
                <a href={`tel:${membre.telephone}`} className="block px-4 py-2 hover:bg-gray-100 text-black">📞 Appeler</a>
                <a href={`sms:${membre.telephone}`} className="block px-4 py-2 hover:bg-gray-100 text-black">✉️ SMS</a>
                <a href={`https://wa.me/${membre.telephone.replace(/\D/g, "")}`} target="_blank" className="block px-4 py-2 hover:bg-gray-100 text-black">💬 WhatsApp</a>
                <a href={`https://wa.me/${membre.telephone.replace(/\D/g, "")}?text=Bonjour`} target="_blank" className="block px-4 py-2 hover:bg-gray-100 text-black">📱 Message WhatsApp</a>
              </div>
            )}
          </div>
        )}

        {/* Infos du membre */}
        <div className="text-sm text-black space-y-1">
          <p className="text-center">🏙 Ville : {membre.ville || "—"}</p>
          <p className="text-center">🕊 Statut : {membre.statut || "—"}</p>
          <p>🏠 Cellule : {membre.cellule_ville && membre.cellule_nom ? `${membre.cellule_ville} - ${membre.cellule_nom}` : "—"}</p>
          <p>👤 Conseiller : {(membre.conseiller_prenom || membre.conseiller_nom) ? `${membre.conseiller_prenom || ""} ${membre.conseiller_nom || ""}`.trim() : "—"}</p>
          <p>❓ Besoin : {formatBesoins()}</p>
          <p>📝 Infos : {membre.infos_supplementaires || "—"}</p>
          <p>🧩 Comment est-il venu : {membre.comment_est_il_venu || "—"}</p>
          <p>🧩 Statut initial : {membre.statut_initial || "—"}</p>
          <p>📝 Commentaire Suivis : {membre.commentaire_suivis || "—"}</p>
        </div>

        {/* Envoyer à */}
        <div className="mt-4 w-full">
          <label className="text-sm font-semibold">Envoyer à :</label>

          <select
            value={selectedTargetType}
            onChange={(e) => {
              setSelectedTargetType(e.target.value);
              setSelectedTarget(null);
            }}
            className="mt-1 w-full border rounded px-2 py-1 text-sm"
          >
            <option value="">-- Choisir une option --</option>
            <option value="cellule">Une Cellule</option>
            <option value="conseiller">Un Conseiller</option>
          </select>

          {selectedTargetType && (
            <select
              value={selectedTarget || ""}
              onChange={(e) => setSelectedTarget(Number(e.target.value))}
              className="mt-2 w-full border rounded px-2 py-1 text-sm"
            >
              <option value="">-- Sélectionner --</option>
              {selectedTargetType === "cellule"
                ? cellules.map((c) => <option key={c.id} value={c.id}>{c.cellule_full || "—"}</option>)
                : null}
              {selectedTargetType === "conseiller"
                ? conseillers.map((c) => <option key={c.id} value={c.id}>{c.prenom || "—"} {c.nom || ""}</option>)
                : null}
            </select>
          )}

          {/* Nouveau bouton d'envoi uniquement si cellule/conseiller sélectionné */}
          {selectedTarget && (
            <div className="mt-2 text-center">
              <BoutonEnvoyerPopup
                membre={membre}
                type={selectedTargetType}
                cible={
                  selectedTargetType === "cellule"
                    ? cellules.find(c => c.id === Number(selectedTarget))
                    : conseillers.find(c => c.id === Number(selectedTarget))
                }
                onEnvoyer={(m) => handleAfterSend(
                  m,
                  selectedTargetType,
                  selectedTargetType === "cellule"
                    ? cellules.find(c => c.id === Number(selectedTarget))
                    : conseillers.find(c => c.id === Number(selectedTarget))
                )}
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
