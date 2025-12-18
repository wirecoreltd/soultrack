"use client";

import { useEffect, useState } from "react";
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

  const [selectedTargetType, setSelectedTargetType] = useState("");
  const [selectedTarget, setSelectedTarget] = useState("");
  const [openPhoneMenu, setOpenPhoneMenu] = useState(false);

  // Fermer menu téléphone si clic extérieur
  useEffect(() => {
    const handler = (e) => {
      if (!e.target.closest(".phone-menu") && !e.target.closest(".phone-button")) {
        setOpenPhoneMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

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

  const cibleObj =
    selectedTargetType === "cellule"
      ? cellules.find((c) => String(c.id) === String(selectedTarget))
      : conseillers.find((c) => String(c.id) === String(selectedTarget));

  return (
    <div className="fixed inset-0 z-[9999] bg-black/40 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-5 relative max-h-[90vh] overflow-y-auto">

        {/* Fermer */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-black text-lg"
          aria-label="Fermer"
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
              type="button"
              className="phone-button text-blue-600 underline font-semibold"
              onClick={() => setOpenPhoneMenu(!openPhoneMenu)}
            >
              {membre.telephone}
            </button>

            {openPhoneMenu && (
              <div
                className="phone-menu absolute top-full mt-2 bg-white border rounded-lg shadow w-44 z-[10000]"
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

        {/* Infos */}
        <div className="text-sm text-black space-y-1">
          <p className="text-center">🏙 Ville : {membre.ville || "—"}</p>
          <p className="text-center">🕊 Statut : {membre.statut || "—"}</p>
          <p>🏠 Cellule : {membre.cellule_ville && membre.cellule_nom ? `${membre.cellule_ville} - ${membre.cellule_nom}` : "—"}</p>
          <p>👤 Conseiller : {(membre.conseiller_prenom || membre.conseiller_nom) ? `${membre.conseiller_prenom || ""} ${membre.conseiller_nom || ""}`.trim() : "—"}</p>
          <p>❓ Besoin : {formatBesoins()}</p>
          <p>📝 Infos : {membre.infos_supplementaires || "—"}</p>
          <p>🧩 Comment est-il venu : {membre.comment_est_il_venu || "—"}</p>
          <p>🧩 Statut initial : {membre.statut_initial || "—"}</p>
          <p>📝 Commentaire suivis : {membre.commentaire_suivis || "—"}</p>
        </div>

        {/* Envoyer à */}
        <div className="mt-4">
          <label className="font-semibold text-sm">Envoyer à :</label>

          <select
            value={selectedTargetType}
            onChange={(e) => {
              setSelectedTargetType(e.target.value);
              setSelectedTarget("");
            }}
            className="mt-1 w-full border rounded px-2 py-1 text-sm"
          >
            <option value="">-- Choisir une option --</option>
            <option value="cellule">Une Cellule</option>
            <option value="conseiller">Un Conseiller</option>
          </select>

          {selectedTargetType && (
            <select
              value={selectedTarget}
              onChange={(e) => setSelectedTarget(e.target.value)}
              className="mt-2 w-full border rounded px-2 py-1 text-sm"
            >
              <option value="">-- Sélectionner --</option>
              {selectedTargetType === "cellule" &&
                cellules.map((c) => (
                  <option key={c.id} value={c.id}>{c.cellule_full || "—"}</option>
                ))}
              {selectedTargetType === "conseiller" &&
                conseillers.map((c) => (
                  <option key={c.id} value={c.id}>{c.prenom || "—"} {c.nom || ""}</option>
                ))}
            </select>
          )}

          {cibleObj && (
            <div className="pt-3 text-center">
              <BoutonEnvoyer
                membre={membre}
                type={selectedTargetType}
                cible={cibleObj}
                onEnvoyer={(updatedMember) =>
                  handleAfterSend(updatedMember, selectedTargetType, cibleObj)
                }
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
