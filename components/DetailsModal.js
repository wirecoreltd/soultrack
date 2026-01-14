"use client";

import { useState, useEffect, useRef } from "react";
import EditMemberSuivisPopup from "./EditMemberSuivisPopup";

export default function DetailsModal({
  m,
  onClose,
  commentChanges,
  statusChanges,
  handleCommentChange,
  handleStatusChange,
  updateSuivi,
  reactivateMember,
  updating,
  showRefus,
}) {

  if (!m || !m.id) return null;

  const [editMember, setEditMember] = useState(null);
  const [openPhoneMenu, setOpenPhoneMenu] = useState(false);
  const phoneMenuRef = useRef(null);

  // 🔹 Fermer menu téléphone si clic en dehors
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

        {/* ❌ Fermer */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          ✖
        </button>

        {/* ================= CONTENU CENTRÉ ================= */}
        <div className="flex flex-col items-center text-center">
          <h2 className="text-xl font-bold">
            {m.prenom} {m.nom} {m.star && "⭐"}
          </h2>

          {/* 📞 Téléphone */}
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
                  <a
                    href={`tel:${m.telephone}`}
                    className="block px-4 py-2 hover:bg-gray-100 text-black"
                  >
                    📞 Appeler
                  </a>
                  <a
                    href={`sms:${m.telephone}`}
                    className="block px-4 py-2 hover:bg-gray-100 text-black"
                  >
                    ✉️ SMS
                  </a>
                  <a
                    href={`https://wa.me/${m.telephone.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-4 py-2 hover:bg-gray-100 text-black"
                  >
                    💬 WhatsApp
                  </a>
                  <a
                    href={`https://wa.me/${m.telephone.replace(/\D/g, "")}?text=Bonjour`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-4 py-2 hover:bg-gray-100 text-black"
                  >
                    📱 Message WhatsApp
                  </a>
                </div>
              )}
            </div>
          )}

          <p className="mt-2">🏙 Ville : {m.ville || "—"}</p>
          <p>🏠 Cellule : {m.cellule_full || "—"}</p>
          <p>👤 Conseiller : {m.responsable || "—"}</p>

          {/* ================= COMMENTAIRE & STATUT ================= */}
          <div className="flex flex-col w-full mt-4">
            {/* Commentaire */}
            <label className="font-semibold text-blue-700 mb-1 text-center">
              Commentaire Suivis
            </label>
            <textarea
              value={commentChanges[m.id] ?? m.commentaire_suivis ?? ""}
              onChange={(e) => handleCommentChange(m.id, e.target.value)}
              className="w-full border rounded-lg p-2"
              rows={2}
            />

            {/* Statut */}
            <label className="font-semibold text-blue-700 mb-1 mt-2 text-center">
              Statut Intégration
            </label>
            <select
  value={statusChanges[m.id] ?? String(m.statut_suivis ?? "")}
  onChange={(e) => handleStatusChange(m.id, e.target.value)}
  className="w-full border rounded-lg p-2 mb-2"
>
  <option value="">-- Sélectionner un statut --</option>
  <option value="2">En attente</option>
  <option value="3">Intégré</option>
  <option value="4">Refus</option>
</select>


            {showRefus ? (
  /* 🔴 VUE REFUS → Réactiver */
  <button
    onClick={async () => {
      await reactivateMember(m.id);
      onClose();
    }}
    disabled={updating[m.id]}
    className={`mt-2 py-2 rounded w-full transition ${
      updating[m.id]
        ? "bg-gray-400 cursor-not-allowed"
        : "bg-green-500 hover:bg-green-600 text-white"
    }`}
  >
    {updating[m.id] ? "Réactivation..." : "Réactiver"}
  </button>
) : (
  /* 🔵 VUE NORMALE → Sauvegarder (COMME LA CARTE) */
  <button
    onClick={async () => {
      await updateSuivi(m.id); // ✅ même fonction que la vue carte
      onClose();
    }}
    disabled={updating[m.id]}
    className={`mt-2 py-2 rounded w-full transition ${
      updating[m.id]
        ? "bg-gray-400 cursor-not-allowed"
        : "bg-blue-500 hover:bg-blue-600 text-white"
    }`}
  >
    {updating[m.id] ? "Enregistrement..." : "Sauvegarder"}
  </button>
)}

          </div>

          {/* ================= INFOS DÉTAILLÉES ================= */}
          <div className="mt-5 text-sm text-black space-y-1 text-left w-full">
            <p>💬 WhatsApp : {m.is_whatsapp ? "Oui" : "Non"}</p>
            <p>⚥ Sexe : {m.sexe || "—"}</p>
            <p>
              ❓ Besoin :{" "}
              {m.besoin
                ? Array.isArray(m.besoin)
                  ? m.besoin.join(", ")
                  : m.besoin
                : "—"}
            </p>
            <p>📝 Infos : {m.infos_supplementaires || "—"}</p>
            <p>🧩 Comment est-il venu : {m.venu || "—"}</p>
            <p>📋 Statut initial : {m.statut_initial || "—"}</p>
          </div>

          {/* ✏️ Modifier le contact */}
          <div className="mt-4 flex justify-center w-full">
            <button
              onClick={() => setEditMember(m)}
              className="text-blue-600 text-sm w-full"
            >
              ✏️ Modifier le contact
            </button>
          </div>
        </div>

        {/* ================= POPUP ÉDITION ================= */}
        {editMember && (
          <EditMemberSuivisPopup
            member={editMember}
            onClose={() => {
              setEditMember(null);
              onClose(); // 🔹 ferme DetailsModal également
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
