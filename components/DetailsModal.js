"use client";

import { useState, useEffect, useRef } from "react";
import BoutonEnvoyer from "./BoutonEnvoyer";

export default function DetailsModal({
  m,
  onClose,
  session,
  handleAfterSend,
  showToast,
  statusChanges,
  commentChanges,
  updating,
  updateSuivi,
}) {
  if (!m || !m.id) return null;

  const [openPhoneMenu, setOpenPhoneMenu] = useState(false);
  const phoneMenuRef = useRef(null);

  const statutIds = { envoye: 1, "en attente": 2, integrer: 3, refus: 4 };
  const statutLabels = { 1: "Envoyé", 2: "En attente", 3: "Intégrer", 4: "Refus" };

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

        {/* ================= CENTRÉ ================= */}
        <div className="flex flex-col items-center text-center space-y-2">
          <h2 className="text-xl font-bold">{m.prenom} {m.nom} {m.star && "⭐"}</h2>

          {/* Téléphone */}
          {m.telephone && (
            <div className="relative" ref={phoneMenuRef}>
              <button
                onClick={() => setOpenPhoneMenu(!openPhoneMenu)}
                className="text-orange-500 underline font-semibold"
              >
                {m.telephone}
              </button>
              {openPhoneMenu && (
                <div className="absolute top-full mt-2 bg-white border rounded-lg shadow w-56 z-50">
                  <a href={`tel:${m.telephone}`} className="block px-4 py-2 hover:bg-gray-100 text-black">📞 Appeler</a>
                  <a href={`sms:${m.telephone}`} className="block px-4 py-2 hover:bg-gray-100 text-black">✉️ SMS</a>
                  <a href={`https://wa.me/${m.telephone.replace(/\D/g, "")}`} target="_blank" className="block px-4 py-2 hover:bg-gray-100 text-black">💬 WhatsApp</a>
                </div>
              )}
            </div>
          )}

          {/* Cellule / Conseiller */}
          <p className="text-black font-medium">
            {m.conseiller_id ? `👤 ${m.responsable}` : m.cellule_id ? `🏠 ${m.cellule_full}` : "—"}
          </p>

          {/* Commentaire Suivis (textarea) */}
          <textarea
            value={commentChanges[m.id] ?? m.commentaire_suivis ?? ""}
            onChange={(e) =>
              commentChanges && (commentChanges[m.id] = e.target.value)
            }
            placeholder="Commentaire Suivis"
            className="w-full mt-2 border rounded px-2 py-1 text-sm resize-none"
          />

          {/* Statut Intégration (menu déroulant) */}
          <select
            value={statusChanges[m.id] ?? m.statut_suivis ?? ""}
            onChange={(e) =>
              statusChanges && (statusChanges[m.id] = e.target.value)
            }
            className="w-full mt-2 border rounded px-2 py-1 text-sm"
          >
            <option value="">-- Sélectionner statut --</option>
            {Object.entries(statutIds).map(([label, value]) => (
              <option key={value} value={value}>
                {label.charAt(0).toUpperCase() + label.slice(1)}
              </option>
            ))}
          </select>

          {/* Bouton Sauvegarder */}
          <div className="mt-2 w-full flex justify-center">
            <button
              onClick={() => updateSuivi(m.id)}
              disabled={updating[m.id]}
              className={`font-bold py-2 px-4 rounded shadow-md transition-all
                ${updating[m.id]
                  ? "bg-blue-300 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-400 to-indigo-500 hover:from-blue-500 hover:to-indigo-600 text-white"
                }`}
            >
              {updating[m.id] ? "Enregistrement..." : "Sauvegarder"}
            </button>
          </div>
        </div>

        {/* ================= ALIGNÉ À GAUCHE ================= */}
        <div className="mt-5 text-sm text-black space-y-1 text-left">
          <p>💬 WhatsApp : {m.is_whatsapp ? "Oui" : "Non"}</p>
          <p>🏙️ Ville : {m.ville || "—"}</p>
          <p>🧩 Comment est-il venu : {m.venu || "—"}</p>
          <p>⚥ Sexe : {m.sexe || "—"}</p>
          <p>📋 Statut initial : {(m.statut_initial ?? m.statut) || "—"}</p>
          <p>❓ Besoin : {!m.besoin ? "—" : Array.isArray(m.besoin) ? m.besoin.join(", ") : m.besoin}</p>
          <p>📝 Infos : {m.infos_supplementaires || "—"}</p>
        </div>

        {/* ================= CENTRÉ MODIFIER ================= */}
        <div className="mt-4 flex justify-center">
          <button
            onClick={() => console.log("Modifier le contact")}
            className="text-blue-600 underline font-semibold"
          >
            ✏️ Modifier le contact
          </button>
        </div>
      </div>
    </div>
  );
}
