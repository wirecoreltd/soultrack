"use client";

import { useState, useEffect } from "react";
import BoutonEnvoyer from "./BoutonEnvoyer";

export default function DetailsPopup({
  membre,
  onClose,
  statusOptions = ["actif", "ancien", "visiteur", "veut rejoindre ICC", "a déjà son église"],
  cellules = [],
  conseillers = [],
  handleAfterSend,
  session,
  showToast,
}) {

  if (!membre || !membre.id) return null; 
  
  const [selectedTargetType, setSelectedTargetType] = useState("");
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [status, setStatus] = useState(membre.statut || "");

  useEffect(() => {
    setStatus(membre.statut || "");
    setSelectedTargetType("");
    setSelectedTarget(null);
  }, [membre]);

  const handleSend = () => {
    if (!selectedTargetType || !selectedTarget) return;

    const cible =
      selectedTargetType === "cellule"
        ? cellules.find((c) => c.id === Number(selectedTarget))
        : conseillers.find((c) => c.id === Number(selectedTarget));

    if (!cible) return;

    handleAfterSend(membre.id, selectedTargetType, cible, status);
    showToast?.("✅ Contact envoyé et suivi enregistré");
    setSelectedTarget(null);
    setSelectedTargetType("");
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

        {/* Titre */}
        <h2 className="text-xl font-bold mb-4 text-center">
          {membre.prenom} {membre.nom} {membre.star && "⭐"}
        </h2>

        {/* Infos du membre */}
        <div className="space-y-2 text-sm text-gray-700">
          <p>📱 Téléphone : {membre.telephone || "—"}</p>
          <p>💬 WhatsApp : {membre.is_whatsapp ? "Oui" : "Non"}</p>
          <p>🏙 Ville : {membre.ville || "—"}</p>
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
          <p>📝 Commentaire Suivis : {membre.commentaire_suivis || "—"}</p>
          <p>🏠 Cellule : {membre.cellule_nom || "—"} - {membre.responsable_nom || "—"}</p>
          <p>👤 Conseiller : {membre.conseiller_prenom || "—"} {membre.conseiller_nom || ""}</p>
        </div>

        {/* Statut */}
        <div className="mt-4">
          <label className="text-gray-700 text-sm font-semibold">🕊 Statut :</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="mt-1 w-full border rounded px-2 py-1 text-sm"
          >
            <option value="">-- Choisir un statut --</option>
            {statusOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Envoyer à */}
        <div className="mt-4">
          <label className="text-gray-700 text-sm font-semibold">Envoyer à :</label>
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
              <option value="">-- Choisir {selectedTargetType} --</option>
              {selectedTargetType === "cellule"
                ? cellules.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.cellule} ({c.responsable})
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
