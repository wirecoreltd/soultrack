"use client";

import { useState } from "react";
import BoutonEnvoyer from "./BoutonEnvoyer";

export default function DetailsPopup({ membre, onClose, cellules = [], conseillers = [], session, showToast }) {
  const [selectedTargetType, setSelectedTargetType] = useState("");
  const [selectedTarget, setSelectedTarget] = useState("");

  if (!membre) return null;

  const besoins = (() => {
    if (!membre.besoin) return "—";
    if (Array.isArray(membre.besoin)) return membre.besoin.join(", ");
    try { const arr = JSON.parse(membre.besoin); return Array.isArray(arr) ? arr.join(", ") : membre.besoin; } catch { return membre.besoin; }
  })();

  return (
    <div
      className="fixed inset-0 bg-black/40 flex justify-center items-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white p-4 rounded-lg w-80 relative"
        onClick={(e) => e.stopPropagation()} // empêcher fermeture quand on clique dans le popup
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-sm text-red-500"
          aria-label="Fermer"
        >
          ❌
        </button>

        <h2 className="text-lg font-bold text-center mb-1">{membre.prenom} {membre.nom}</h2>
        <p className="text-center text-blue-600 font-semibold underline mb-2">{membre.telephone || "—"}</p>
        <p>🏙 Ville : {membre.ville || "—"}</p>
        <p>🕊 Statut : {membre.statut || "—"}</p>
        <p>🏠 Cellule : {(membre.cellule_ville && membre.cellule_nom) ? `${membre.cellule_ville} - ${membre.cellule_nom}` : "—"}</p>
        <p>👤 Conseiller : {(membre.conseiller_prenom || membre.conseiller_nom) ? `${membre.conseiller_prenom || ""} ${membre.conseiller_nom || ""}`.trim() : "—"}</p>

        <p>❓ Besoin : {besoins}</p>
        <p>📝 Infos : {membre.infos_supplementaires || "—"}</p>
        <p>🧩 Comment est-il venu : {membre.venu || "—"}</p>
        <p>🧩 Statut initial : {membre.statut_initial || "—"}</p>
        <p>📝 Commentaire Suivis : {membre.suivi_commentaire_suivis || "—"}</p>

        {/* ===================== Envoyer ===================== */}
        <div className="mt-3 w-full">
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

          {(selectedTargetType === "cellule" || selectedTargetType === "conseiller") && (
            <select
              value={selectedTarget}
              onChange={(e) => setSelectedTarget(e.target.value)}
              className="mt-1 w-full border rounded px-2 py-1 text-sm"
            >
              <option value="">-- Choisir {selectedTargetType} --</option>
              {selectedTargetType === "cellule" &&
                cellules.map(c => <option key={c.id} value={c.id}>{c.cellule_full || "—"}</option>)
              }
              {selectedTargetType === "conseiller" &&
                conseillers.map(c => <option key={c.id} value={c.id}>{c.prenom || "—"} {c.nom || ""}</option>)
              }
            </select>
          )}

          {selectedTarget && (
            <div className="pt-2">
              <BoutonEnvoyer
                membre={membre}
                type={selectedTargetType}
                cible={selectedTargetType === "cellule" ? cellules.find(c => c.id === selectedTarget) : conseillers.find(c => c.id === selectedTarget)}
                onEnvoyer={(id) => {
                  const cibleObj = selectedTargetType === "cellule"
                    ? cellules.find(c => c.id === selectedTarget)
                    : conseillers.find(c => c.id === selectedTarget);
                  showToast(`✅ ${membre.prenom} ${membre.nom} envoyé à ${selectedTargetType === "cellule" ? cibleObj.cellule_full : `${cibleObj.prenom} ${cibleObj.nom}`}`);
                  // tu peux ajouter ici updateMemberLocally si nécessaire
                  setSelectedTarget(""); // reset après envoi
                  setSelectedTargetType(""); // reset après envoi
                  onClose();
                }}
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
