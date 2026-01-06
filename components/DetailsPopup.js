"use client";

import { useEffect, useState, useRef } from "react";
import BoutonEnvoyer from "./BoutonEnvoyer";
import EditMemberPopup from "./EditMemberPopup";

export default function DetailsPopup({
  membre,
  onClose,
  cellules = [],
  conseillers = [],
  session,
  handleAfterSend,
  showToast,
  commentChanges,
  handleCommentChange,
  statusChanges,
  setStatusChanges,
  updateSuivi,
  updating
}) {
  if (!membre || !membre.id) return null;

  const [editMember, setEditMember] = useState(null);
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 relative">

        {/* Fermer DetailsPopup */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          ✖
        </button>

        {/* ================= CENTRÉ ================= */}
        <div className="flex flex-col items-center text-center">

          <h2 className="text-xl font-bold">
            {membre.prenom} {membre.nom} {membre.star && "⭐"}
          </h2>

          {/* Téléphone */}
          {membre.telephone && (
            <div className="relative mt-1" ref={phoneMenuRef}>
              <button
                onClick={() => setOpenPhoneMenu(!openPhoneMenu)}
                className="text-orange-500 underline font-semibold"
              >
                {membre.telephone}
              </button>

              {openPhoneMenu && (
                <div className="absolute top-full mt-2 bg-white border rounded-lg shadow w-56 z-50">
                  <a href={`tel:${membre.telephone}`} className="block px-4 py-2 hover:bg-gray-100 text-black">📞 Appeler</a>
                  <a href={`sms:${membre.telephone}`} className="block px-4 py-2 hover:bg-gray-100 text-black">✉️ SMS</a>
                  <a href={`https://wa.me/${membre.telephone.replace(/\D/g, "")}`} target="_blank" className="block px-4 py-2 hover:bg-gray-100 text-black">💬 WhatsApp</a>
                  <a href={`https://wa.me/${membre.telephone.replace(/\D/g, "")}?text=Bonjour`} target="_blank" className="block px-4 py-2 hover:bg-gray-100 text-black">📱 Message WhatsApp</a>
                </div>
              )}
            </div>
          )}

          <p className="mt-2">🏙 Ville : {membre.ville || "—"}</p>

          <p>🏠 Cellule : {
            membre.suivi_cellule_nom
              ? `${membre.suivi_cellule_nom}`
              : (cellules.find(c => c.id === membre.cellule_id)?.cellule_full || "—")
          }</p>

          <p>👤 Conseiller : {
            membre.suivi_responsable
              ? membre.suivi_responsable
              : (conseillers.find(c => c.id === membre.conseiller_id)
                  ? `${conseillers.find(c => c.id === membre.conseiller_id).prenom} ${conseillers.find(c => c.id === membre.conseiller_id).nom}`
                  : "—")
          }</p>

          {/* ================= COMMENTAIRE ET STATUT ================= */}
          <div className="flex flex-col w-full mt-4 items-center">
            <label className="font-semibold text-blue-700 mb-1 mt-2 text-center">Commentaire Suivis</label>
            <textarea
              value={commentChanges[membre.id] ?? membre.commentaire_suivis ?? ""}
              onChange={(e) => handleCommentChange(membre.id, e.target.value)}
              className="w-full border rounded-lg p-2 text-sm resize-none"
              rows={2}
              placeholder="Écrire un commentaire..."
            />

            <label className="font-semibold text-blue-700 mb-1 mt-2 text-center">Statut Intégration</label>
            <select
              value={statusChanges[membre.id] ?? membre.statut_suivis ?? ""}
              onChange={(e) =>
                setStatusChanges(prev => ({
                  ...prev,
                  [membre.id]: e.target.value
                }))
              }
              className="w-full border rounded-lg p-2 mb-2 text-sm"
            >
              <option value="">-- Sélectionner un statut --</option>
              <option value="2">En attente</option>
              <option value="3">Intégrer</option>
              <option value="4">Refus</option>
            </select>

            <button
              onClick={() => updateSuivi(membre.id)}
              disabled={updating[membre.id]}
              className={`mt-2 w-full font-bold py-2 rounded-lg shadow-md transition-all
                ${updating[membre.id]
                  ? "bg-blue-300 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-400 to-indigo-500 hover:from-blue-500 hover:to-indigo-600 text-white"
                }`}
            >
              {updating[membre.id] ? "Enregistrement..." : "Sauvegarder"}
            </button>
          </div>

        </div>

        {/* ================= ALIGNÉ À GAUCHE ================= */}
        <div className="mt-5 text-sm text-black space-y-1 text-left w-full">
          <p>💬 WhatsApp : {membre.is_whatsapp ? "Oui" : "Non"}</p>
          <p> ⚥ Sexe : {membre.sexe || "—"}</p>
          <p>
            ❓ Besoin :{" "}
            {membre.besoin
              ? (() => {
                  try {
                    const besoins = typeof membre.besoin === "string" ? JSON.parse(membre.besoin) : membre.besoin;
                    return Array.isArray(besoins) ? besoins.join(", ") : besoins;
                  } catch (e) {
                    return membre.besoin;
                  }
                })()
              : "—"
            }
          </p>
          <p>📝 Infos : {membre.infos_supplementaires || "—"}</p>
          <p>🧩 Comment est-il venu : {membre.comment_est_il_venu || "—"}</p>
          <p>📋 Statut initial : {(membre.statut_initial ?? membre.statut) || "—"}</p>
        </div>

        {/* ✏️ Modifier le contact */}
        <div className="mt-4 flex justify-center">
          <button
            onClick={() => setEditMember(membre)}
            className="text-blue-600 text-sm w-full"
          >
            ✏️ Modifier le contact
          </button>
        </div>

        {/* ================= POPUP EDIT MEMBER ================= */}
        {editMember && (
          <EditMemberPopup
            member={editMember}
            onClose={() => {
              setEditMember(null);
              onClose();
            }}
            onUpdateMember={() => {
              setEditMember(null);
              onClose();
            }}
          />
        )}

      </div>
    </div>
  );
}
