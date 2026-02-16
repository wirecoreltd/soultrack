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

  const [activeAccordion, setActiveAccordion] = useState("infos");

  const cellule = cellules?.find(c => c.id === m.cellule_id);
  const conseiller = conseillers?.find(c => c.id === m.conseiller_id);

  // Bloquer scroll du body
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = "auto"; };
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
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 p-2">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full relative max-h-[90vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="font-bold text-lg">{m.prenom} {m.nom} {m.star && "⭐"}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 font-bold text-lg">✖</button>
        </div>

        {/* Contenu scrollable */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm text-gray-800">

          {/* 📞 Téléphone */}
          {m.telephone && (
            <div className="relative" ref={phoneMenuRef}>
              <button
                onClick={() => setOpenPhoneMenu(!openPhoneMenu)}
                className="text-orange-500 underline font-semibold"
              >
                {m.telephone}
              </button>

              {openPhoneMenu && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white text-center border rounded-lg shadow w-56 z-50">
                  <a href={`tel:${m.telephone}`} className="block px-4 py-2 hover:bg-gray-100">📞 Appeler</a>
                  <a href={`sms:${m.telephone}`} className="block px-4 py-2 hover:bg-gray-100">✉️ SMS</a>
                  <a href={`https://wa.me/${m.telephone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="block px-4 py-2 hover:bg-gray-100">💬 WhatsApp</a>
                  <a href={`https://wa.me/${m.telephone.replace(/\D/g, "")}?text=Bonjour`} target="_blank" rel="noopener noreferrer" className="block px-4 py-2 hover:bg-gray-100">📱 Message WhatsApp</a>
                </div>
              )}
            </div>
          )}

          <p>🏙️ Ville : {m.ville || "—"}</p>
          <p>🏠 Cellule : {cellule?.cellule_full || "—"}</p>
          <p>👤 Conseiller : {conseiller ? `${conseiller.prenom} ${conseiller.nom}` : "—"}</p>

          {/* Accordion Sections */}
          {["infos", "suivis", "edition"].map(section => (
            <div key={section} className="border rounded-lg overflow-hidden">
              <button
                className="w-full text-left p-2 bg-gray-100 hover:bg-gray-200 font-semibold flex justify-between items-center"
                onClick={() => setActiveAccordion(activeAccordion === section ? null : section)}
              >
                {section === "infos" && "Infos détaillées"}
                {section === "suivis" && "Commentaire & Statut"}
                {section === "edition" && "Modifier le contact"}
                <span>{activeAccordion === section ? "▲" : "▼"}</span>
              </button>
              {activeAccordion === section && (
                <div className="p-3 space-y-2 bg-white">
                  {section === "infos" && (
                    <>
                      <p>💬 WhatsApp : {m.is_whatsapp ? "Oui" : "Non"}</p>
                      <p>🎗️ Sexe : {m.sexe || "—"}</p>
                      <p>💧 Baptême d'Eau : {m.bapteme_eau ? "Oui" : "Non"}</p>
                      <p>🔥 Baptême de Feu : {m.bapteme_esprit ? "Oui" : "Non"}</p>
                      <p>✒️ Formation : {m.Formation || "—"}</p>
                      <p>❤️‍🩹 Soin Pastoral : {m.Soin_Pastoral || "—"}</p>
                      <p>❓ Besoin : {formatMinistere(m.besoin)}</p>
                      <p>📝 Infos : {m.infos_supplementaires || "—"}</p>
                      <p>🧩 Comment est-il venu : {m.venu || "—"}</p>
                      <p>✨ Raison de la venue : {m.statut_initial || "—"}</p>
                      <p>🙏 Prière du salut : {m.priere_salut || "—"}</p>
                      <p>☀️ Type de conversion : {m.type_conversion || "—"}</p>
                    </>
                  )}
                  {section === "suivis" && (
                    <>
                      <label className="font-semibold text-blue-700">Commentaire Suivis</label>
                      <textarea
                        value={commentChanges[m.id] ?? m.commentaire_suivis ?? ""}
                        onChange={(e) => handleCommentChange(m.id, e.target.value)}
                        className="w-full border rounded-lg p-2"
                        rows={2}
                      />
                      <label className="font-semibold text-blue-700 mt-2">Statut Intégration</label>
                      <select
                        value={statusChanges[m.id] ?? String(m.statut_suivis ?? "")}
                        onChange={(e) => handleStatusChange(m.id, e.target.value)}
                        className="w-full border rounded-lg p-2"
                      >
                        <option value="">-- Sélectionner un statut --</option>
                        <option value="2">En Suivis</option>
                        <option value="3">Intégré</option>
                        <option value="4">Refus</option>
                      </select>
                    </>
                  )}
                  {section === "edition" && (
                    <button
                      onClick={() => setEditMember(m)}
                      className="w-full py-2 rounded-md bg-white text-orange-500 shadow-md"
                    >
                      ✏️ Modifier le contact
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Sticky Footer */}
        <div className="p-4 bg-white border-t flex gap-2 flex-col sm:flex-row">
          {showRefus ? (
            <button
              onClick={async () => { await reactivateMember(m.id); onClose(); }}
              disabled={updating[m.id]}
              className={`flex-1 py-2 rounded transition ${updating[m.id] ? "bg-gray-400 cursor-not-allowed" : "bg-green-500 hover:bg-green-600 text-white"}`}
            >
              {updating[m.id] ? "Réactivation..." : "Réactiver"}
            </button>
          ) : (
            <button
              onClick={async () => { await updateSuivi(m.id); onClose(); }}
              disabled={updating[m.id]}
              className={`flex-1 py-2 rounded transition ${updating[m.id] ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600 text-white"}`}
            >
              {updating[m.id] ? "Enregistrement..." : "Sauvegarder"}
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded bg-gray-300 hover:bg-gray-400"
          >
            Annuler
          </button>
        </div>

        {/* Popup édition sans fermer le parent */}
        {editMember && (
          <EditMemberSuivisPopup
            member={editMember}
            onClose={() => setEditMember(null)}
            onUpdateMember={() => setEditMember(null)}
          />
        )}

      </div>
    </div>
  );
}
