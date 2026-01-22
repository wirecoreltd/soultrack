"use client";

import { useEffect, useState, useRef } from "react";
import BoutonEnvoyer from "./BoutonEnvoyer";
import EditMemberPopup from "./EditMemberPopup";

export default function DetailsMemberPopup({
  membre,
  onClose,
  cellules = [],
  conseillers = [],
  session,
  handleAfterSend,
  showToast,
  commentChanges = {},
  handleCommentChange = () => {},
  statusChanges = {},
  setStatusChanges = () => {},
  updateSuivi = () => {},
  updating = {},
  onDelete, // <-- ✅ AJOUT ICI
}) { 
  if (!membre || !membre.id) return null;

  const [selectedTargetType, setSelectedTargetType] = useState("");
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [cibleComplete, setCibleComplete] = useState(null);
  const [openPhoneMenu, setOpenPhoneMenu] = useState(false);
  const [editMember, setEditMember] = useState(null);
  const phoneMenuRef = useRef(null);

   // ---------------- HELPERS ----------------
  const formatMinistere = (ministere) => {
      if (!ministere) return "—";
    
      try {
        const parsed = typeof ministere === "string" ? JSON.parse(ministere) : ministere;
        return Array.isArray(parsed) ? parsed.join(", ") : parsed;
      } catch {
        return "—";
      }
    };
    const formatArrayField = (field) => {
      if (!field) return "—";
      try {
        const parsed = typeof field === "string" ? JSON.parse(field) : field;
        return Array.isArray(parsed) ? parsed.join(", ") : parsed;
      } catch {
        return "—";
      }
    }; 

      const statutSuiviLabels = {
      1: "Envoyé",
      2: "En attente",
      3: "Intégré",
      4: "Refus",
    };


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
        <div className="flex flex-col items-center text-center w-full">
          <h2 className="text-xl font-bold">{membre.prenom} {membre.nom} {membre.star && "⭐"}</h2>

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

          <p className="mt-2">🏙️ Ville : {membre.ville || "—"}</p>
          <p>
            🏠 Cellule :{" "}
            {membre.cellule_id
              ? cellules.find(c => c.id === membre.cellule_id)?.cellule_full || "—"
              : "—"}
          </p>
          
          <p>
            👤 Conseiller :{" "}
            {membre.conseiller_id
              ? `${conseillers.find(c => c.id === membre.conseiller_id)?.prenom || ""} ${
                  conseillers.find(c => c.id === membre.conseiller_id)?.nom || ""
                }`.trim() || "—"
              : "—"}
          </p>

          {/* ================= Envoyer à ================= */}
          <div className="mt-3 w-full">
            <label className="font-semibold text-sm">Envoyer à :</label>
            <select
              value={selectedTargetType}
              onChange={(e) => {
                setSelectedTargetType(e.target.value);
                setSelectedTarget(null);
                setCibleComplete(null);
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
                onChange={(e) => {
                  const id = e.target.value;
                  setSelectedTarget(id);
                  if (selectedTargetType === "cellule") setCibleComplete(cellules.find(c => c.id === id));
                  else if (selectedTargetType === "conseiller") setCibleComplete(conseillers.find(c => c.id === id));
                }}
                className="mt-2 w-full border rounded px-2 py-1 text-sm"
              >
                <option value="">-- Sélectionner --</option>
                {selectedTargetType === "cellule" && cellules.map(c => (
                  <option key={c.id} value={c.id}>{c.cellule_full || "—"}</option>
                ))}
                {selectedTargetType === "conseiller" && conseillers.map(c => (
                  <option key={c.id} value={c.id}>{c.prenom || "—"} {c.nom || ""}</option>
                ))}
              </select>
            )}

            {cibleComplete && (
              <div className="mt-3">
                <BoutonEnvoyer
                  membre={membre}
                  type={selectedTargetType}
                  cible={cibleComplete}
                  session={session}
                  onEnvoyer={(data) => handleAfterSend && handleAfterSend(data, selectedTargetType, cibleComplete)}
                  showToast={showToast}
                />
              </div>
            )}
          </div>

          {/* ================= ALIGNÉ À GAUCHE ================= */}
          <div className="mt-5 text-sm text-black space-y-1 text-left w-full">
            <p className="font-semibold text-center" style={{ color: "#2E3192" }}>
            💡 Statut Suivi : {statutSuiviLabels[m.statut_suivis] || m.suivi_statut || "—"}</p>
            <p>💬 WhatsApp : {membre.is_whatsapp ? "Oui" : "Non"}</p>
            <p>🎗️ Sexe : {membre.sexe || "—"}</p>
            <p>💧 Bapteme d' Eau: {membre.bapteme_eau === null ? "" : membre.bapteme_eau ? "Oui" : "Non"}</p>
            <p>🔥 Bapteme de Feu: {membre.bapteme_esprit === null ? "" : membre.bapteme_esprit ? "Oui" : "Non"}</p>
            <p>✒️ Formation : {membre.Formation || "—"}</p>  
            <p>❤️‍🩹 Soin Pastoral : {membre.Soin_Pastoral || "—"}</p>
            <p>💢 Ministere : {formatMinistere(membre.Ministere)}</p>
            <p>❓ Besoin : {formatArrayField(membre.besoin)}</p>
            <p>📝 Infos : {membre.infos_supplementaires || "—"}</p>
            <p>🧩 Comment est-il venu : {membre.venu || "—"}</p>
            <p>✨ Raison de la venue : {membre.statut_initial || "—"}</p>
            <p>🙏 Prière du salut : {membre.priere_salut || "—"}</p>  
            <p>☀️ Type de conversion : {membre.type_conversion|| "—"}</p> 
            <p>📝 Commentaire Suivis : {membre.commentaire_suivis || "—"}</p>            
          </div>

         {/* ✏️ Modifier / 🗑️ Supprimer */}
            <div className="mt-4 flex flex-col gap-2 w-full">            
              <button
                onClick={() => setEditMember(membre)}
                className="text-blue-600 text-sm w-full">
                ✏️ Modifier le contact
              </button>
            
              <button
                onClick={() => {
                  if (!onDelete) return;
            
                  const confirmDelete = window.confirm(
                    "⚠️ Suppression définitive\n\n" +
                    "Voulez-vous vraiment supprimer ce contact ?\n\n" +
                    "Cette action supprimera également TOUT l’historique du contact (suivi, commentaires, transferts).\n" +
                    "Cette action est irréversible."
                  );
            
                  if (confirmDelete) {
                    onDelete(membre.id);
                    onClose();
                  }
                }}
                className="w-full flex text-sm items-center justify-center text-red-600">
                🗑️ Supprimer le contact
              </button>
            </div>           
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
