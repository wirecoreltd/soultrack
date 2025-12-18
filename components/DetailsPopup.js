"use client";

import { useState, useEffect, useRef } from "react";
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
  const phoneMenuRef = useRef(null);

  // fermer le menu téléphone en cliquant dehors
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (phoneMenuRef.current && !phoneMenuRef.current.contains(e.target)) {
        setOpenPhoneMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSend = () => {
    if (!selectedTargetType || !selectedTarget) return;

    const cible =
      selectedTargetType === "cellule"
        ? cellules.find((c) => c.id === Number(selectedTarget))
        : conseillers.find((c) => c.id === Number(selectedTarget));

    if (!cible) return;

    handleAfterSend?.(membre, selectedTargetType, cible);
    setSelectedTarget("");
    setSelectedTargetType("");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 relative">
        {/* Fermer */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          ✖
        </button>

        {/* ================== DETAILS CENTRÉS ================== */}
        <div className="flex flex-col items-center text-center space-y-1">
          <h3 className="text-xl font-bold">
            {membre.prenom} {membre.nom} {membre.star && "⭐"}
          </h3>

          {/* Téléphone */}
          {membre.telephone ? (
            <div className="relative" ref={phoneMenuRef}>
              <button
                onClick={() => setOpenPhoneMenu(!openPhoneMenu)}
                className="text-orange-500 underline font-semibold"
              >
                {membre.telephone}
              </button>

              {openPhoneMenu && (
                <div className="absolute top-full mt-2 bg-white border rounded-lg shadow-lg z-50 w-64">
                  <a href={`tel:${membre.telephone}`} className="block px-4 py-2 hover:bg-gray-100">
                    📞 Appeler par téléphone
                  </a>
                  <a href={`sms:${membre.telephone}`} className="block px-4 py-2 hover:bg-gray-100">
                    ✉️ Envoyer SMS
                  </a>
                  <a
                    href={`https://wa.me/${membre.telephone.replace(/\D/g, "")}`}
                    target="_blank"
                    className="block px-4 py-2 hover:bg-gray-100"
                  >
                    💬 WhatsApp
                  </a>
                  <a
                    href={`https://wa.me/${membre.telephone.replace(/\D/g, "")}`}
                    target="_blank"
                    className="block px-4 py-2 hover:bg-gray-100"
                  >
                    📱 Envoyer message WhatsApp
                  </a>
                </div>
              )}
            </div>
          ) : (
            <span>—</span>
          )}

          <p>🏙️ Ville : {membre.ville || "—"}</p>
          <p>🕊 Statut : {membre.statut || "—"}</p>
        </div>

        {/* ================== DETAILS ALIGNÉS À GAUCHE ================== */}
        <div className="mt-4 text-left space-y-1">
          <p>
            🏠 Cellule :{" "}
            {membre.cellule_ville && membre.cellule_nom
              ? `${membre.cellule_ville} - ${membre.cellule_nom}`
              : "—"}
          </p>

          <p>
            👤 Conseiller :{" "}
            {membre.conseiller_prenom || membre.conseiller_nom
              ? `${membre.conseiller_prenom || ""} ${membre.conseiller_nom || ""}`.trim()
              : "—"}
          </p>

          {/* Envoyer à */}
          <div className="mt-2">
            <label className="font-semibold text-sm">Envoyer à :</label>
            <select
              value={selectedTargetType}
              onChange={(e) => {
                setSelectedTargetType(e.target.value);
                setSelectedTarget("");
              }}
              className="mt-1 w-full border rounded px-2 py-1 text-sm"
            >
              <option value="">-- Choisir --</option>
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
                {selectedTargetType === "cellule"
                  ? cellules.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.cellule_full}
                      </option>
                    ))
                  : conseillers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.prenom} {c.nom}
                      </option>
                    ))}
              </select>
            )}

            {selectedTarget && (
              <div className="mt-3">
                <BoutonEnvoyer
                  membre={membre}
                  type={selectedTargetType}
                  cible={
                    selectedTargetType === "cellule"
                      ? cellules.find((c) => c.id === Number(selectedTarget))
                      : conseillers.find((c) => c.id === Number(selectedTarget))
                  }
                  onEnvoyer={handleSend}
                  session={session}
                  showToast={showToast}
                />
              </div>
            )}
          </div>

          <p className="mt-2">💬 WhatsApp : {membre.is_whatsapp ? "Oui" : "Non"}</p>
          <p>⚥ Sexe : {membre.sexe || "—"}</p>
          <p>
            ❓ Besoin :{" "}
            {Array.isArray(membre.besoin)
              ? membre.besoin.join(", ")
              : membre.besoin || "—"}
          </p>
          <p>📝 Infos : {membre.infos_supplementaires || "—"}</p>
          <p>🧩 Comment est-il venu : {membre.venu || "—"}</p>
          <p>🧩 Statut initial : {membre.statut_initial || "—"}</p>
          <p className="pt-1">📝 Commentaire Suivis : {membre.suivis_commentaire || "—"}</p>
        </div>
      </div>
    </div>
  );
}
