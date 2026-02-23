"use client";

import { useState, useEffect, useRef } from "react";
import EditMemberSuivisPopup from "./EditMemberSuivisPopup";

export default function DetailsSuivisPopup({
  m,
  cellules,
  conseillers,
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

  const cellule = cellules?.find(c => c.id === m.cellule_id);
  const conseiller = conseillers?.find(c => c.id === m.conseiller_id);

  // Bloquer scroll de la page derrière
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  // Fermer menu téléphone si clic en dehors
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (phoneMenuRef.current && !phoneMenuRef.current.contains(e.target)) {
        setOpenPhoneMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatbesoin = (besoin) => {
    if (!besoin) return "—";
    try {
      const parsed = typeof besoin === "string" ? JSON.parse(besoin) : besoin;
      return Array.isArray(parsed) ? parsed.join(", ") : parsed;
    } catch {
      return "—";
    }
  };

  const formatMinistere = (ministere) => {
    if (!ministere) return "—";
    try {
      const parsed = typeof ministere === "string" ? JSON.parse(ministere) : ministere;
      return Array.isArray(parsed) ? parsed.join(", ") : parsed;
    } catch {
      return "—";
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      {/* Popup scrollable */}
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 relative max-h-[90vh] overflow-y-auto">
        
        {/* ❌ Fermer */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-lg font-bold"
        >
          ✖
        </button>

        {/* ================= CONTENU ================= */}
        <div className="flex flex-col items-center text-center">
          <h2 className="text-lg font-bold">
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
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white text-center border rounded-lg shadow w-56 z-50">
                  <a href={`tel:${m.telephone}`} className="block px-4 py-2 hover:bg-gray-100 text-black">📞 Appeler</a>
                  <a href={`sms:${m.telephone}`} className="block px-4 py-2 hover:bg-gray-100 text-black">✉️ SMS</a>
                  <a href={`https://wa.me/${m.telephone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="block px-4 py-2 hover:bg-gray-100 text-black">💬 WhatsApp</a>
                  <a href={`https://wa.me/${m.telephone.replace(/\D/g, "")}?text=Bonjour`} target="_blank" rel="noopener noreferrer" className="block px-4 py-2 hover:bg-gray-100 text-black">📱 Message WhatsApp</a>
                </div>
              )}
            </div>
          )}

          <p className="mt-2">🏙️ Ville : {m.ville || "—"}</p>
          <p>🏠 Cellule : {cellule?.cellule_full || "—"}</p>
          <p>👤 Conseiller :{" "}{conseiller? `${conseiller.prenom} ${conseiller.nom}`: "—"}</p>

          {/* Commentaire & Statut */}
          <div className="flex flex-col w-full mt-4">
            <label className="font-semibold text-blue-700 mb-1 text-center">Commentaire Suivis</label>
            <textarea
              value={commentChanges[m.id] ?? m.commentaire_suivis ?? ""}
              onChange={(e) => handleCommentChange(m.id, e.target.value)}
              className="w-full border rounded-lg p-2"
              rows={2}
            />

            <label className="font-semibold text-blue-700 mb-1 mt-2 text-center">Statut Intégration</label>
            <select
              value={statusChanges[m.id] ?? String(m.statut_suivis ?? "")}
              onChange={(e) => handleStatusChange(m.id, e.target.value)}
              className="w-full border rounded-lg p-2 mb-2"
            >
              <option value="">-- Sélectionner un statut --</option>
              <option value="2">En Suivis</option>
              <option value="3">Intégré</option>
              <option value="4">Refus</option>
            </select>

            {showRefus ? (
              <button
                onClick={async () => {
                  await reactivateMember(m.id);
                  onClose();
                }}
                disabled={updating[m.id]}
                className={`mt-2 py-2 rounded w-full transition ${
                  updating[m.id] ? "bg-gray-400 cursor-not-allowed" : "bg-green-500 hover:bg-green-600 text-white"
                }`}
              >
                {updating[m.id] ? "Réactivation..." : "Réactiver"}
              </button>
            ) : (
              <button
                onClick={async () => {
                  await updateSuivi(m.id);
                  onClose();
                }}
                disabled={updating[m.id]}
                className={`mt-2 py-2 rounded w-full transition ${
                  updating[m.id] ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600 text-white"
                }`}
              >
                {updating[m.id] ? "Enregistrement..." : "Sauvegarder"}
              </button>
            )}
          </div>

          {/* Infos détaillées */}
          <div className="mt-5 text-sm text-black space-y-1 text-left w-full">
            <p>💬 WhatsApp : {m.is_whatsapp ? "Oui" : "Non"}</p>
            <p>🎗️ Sexe : {m.sexe || "—"}</p>
            <p>💧 Bapteme d' Eau: {m.bapteme_eau ? "Oui" : "Non"}</p>
            <p>🔥 Bapteme de Feu: {m.bapteme_esprit ? "Oui" : "Non"}</p>
            <p>✒️ Formation : {m.Formation || "—"}</p>
            <p>❤️‍🩹 Soin Pastoral : {m.Soin_Pastoral || "—"}</p>
            <p>❓ Difficultés / Besoins : {formatMinistere(m.besoin)}</p>
            <p>📝 Infos : {m.infos_supplementaires || "—"}</p>
            <p>🧩 Comment est-il venu : {m.venu || "—"}</p>
            <p>✨ Raison de la venue : {m.statut_initial || "—"}</p>
            <p>🙏 Prière du salut : {m.priere_salut || "—"}</p>
            <p>☀️ Type de conversion : {m.type_conversion || "—"}</p>
          </div>

          {/* Modifier le contact */}
          <div className="mt-4 rounded-xl w-full p-4 bg-white">
            <button
              onClick={() => setEditMember(m)}
              className="w-full py-2 rounded-md bg-white text-orange-500 shadow-md"
            >
              ✏️ Modifier le contact
            </button>
          </div>
        </div>

        {/* Popup édition */}
        {editMember && (
          <EditMemberSuivisPopup
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
