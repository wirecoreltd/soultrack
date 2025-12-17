"use client";

import { useState } from "react";
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
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [openPhoneMenu, setOpenPhoneMenu] = useState(false);

  const handleSend = () => {
    if (!selectedTargetType || !selectedTarget) return;

    const cible =
      selectedTargetType === "cellule"
        ? cellules.find((c) => c.id === Number(selectedTarget))
        : conseillers.find((c) => c.id === Number(selectedTarget));

    if (!cible) return;

    handleAfterSend(membre.id, selectedTargetType, cible, membre.statut);
    showToast?.("✅ Contact envoyé et suivi enregistré");
    setSelectedTarget(null);
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

        {/* Nom */}
        <h2 className="text-xl font-bold mb-4 text-center">
          {membre.prenom} {membre.nom} {membre.star && "⭐"}
        </h2>

        {/* Infos – IDENTIQUES À LA VUE CARTE */}
        <div className="space-y-2 text-sm text-black">

          {/* Téléphone */}
          <div className="relative">
            <p className="font-semibold">📱 Téléphone :</p>
            {membre.telephone ? (
              <>
                <button
                  onClick={() => setOpenPhoneMenu(!openPhoneMenu)}
                  className="text-blue-600 underline"
                >
                  {membre.telephone}
                </button>

                {openPhoneMenu && (
                  <div className="absolute z-50 mt-2 bg-white border rounded-lg shadow w-44">
                    <a href={`tel:${membre.telephone}`} className="block px-4 py-2 hover:bg-gray-100">
                      📞 Appeler
                    </a>
                    <a href={`sms:${membre.telephone}`} className="block px-4 py-2 hover:bg-gray-100">
                      ✉️ SMS
                    </a>
                    <a
                      href={`https://wa.me/${membre.telephone.replace(/\D/g, "")}`}
                      target="_blank"
                      className="block px-4 py-2 hover:bg-gray-100"
                    >
                      💬 WhatsApp
                    </a>
                  </div>
                )}
              </>
            ) : (
              <span>—</span>
            )}
          </div>

          <p>💬 WhatsApp : {membre.is_whatsapp ? "Oui" : "Non"}</p>
          <p>🏙 Ville : {membre.ville || "—"}</p>
          <p>🕊 Statut : {membre.statut || "—"}</p>

          <p>
            🏠 Cellule :{" "}
            {membre.cellule_nom
              ? `${membre.cellule_ville || "—"} - ${membre.cellule_nom}`
              : "—"}
          </p>

          <p>
            👤 Conseiller :{" "}
            {membre.conseiller_prenom
              ? `${membre.conseiller_prenom} ${membre.conseiller_nom || ""}`
              : "—"}
          </p>

          <p>
            ❓ Besoin :{" "}
            {(() => {
              if (!membre.besoin) return "—";
              if (Array.isArray(membre.besoin)) return membre.besoin.join(", ");
              try {
                const arr = JSON.parse(membre.besoin);
                return Array.isArray(arr) ? arr.join(", ") : membre.besoin;
              } catch {
                return membre.besoin;
              }
            })()}
          </p>

          <p>📝 Infos : {membre.infos_supplementaires || "—"}</p>
          <p>🧩 Comment est-il venu : {membre.comment_est_il_venu || "—"}</p>
          <p>🧩 Statut initial : {membre.statut_initial || "—"}</p>
          <p>📝 Commentaire Suivis : {membre.commentaire_suivis || "—"}</p>
        </div>

        {/* Envoyer à */}
        <div className="mt-5">
          <label className="text-sm font-semibold">Envoyer à :</label>

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
              onChange={(e) => setSelectedTarget(Number(e.target.value))}
              className="mt-2 w-full border rounded px-2 py-1 text-sm"
            >
              <option value="">-- Sélectionner --</option>
              {selectedTargetType === "cellule"
                ? cellules.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.ville} - {c.cellule}
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
            <div className="mt-4 text-center">
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
      </div>
    </div>
  );
}
