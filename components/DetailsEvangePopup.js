"use client";

import React, { useRef, useEffect, useState } from "react";

export default function DetailsEvangePopup({ member, onClose, onEdit }) {
  const [openPhoneMenu, setOpenPhoneMenu] = useState(false);
  const phoneMenuRef = useRef(null);
  const popupRef = useRef(null);

  const formatBesoin = (b) => {
    if (!b) return "—";
    if (Array.isArray(b)) return b.join(", ");
    try {
      const arr = JSON.parse(b);
      return Array.isArray(arr) ? arr.join(", ") : b;
    } catch {
      return b;
    }
  };

  // Fermer le menu si clic à l'extérieur
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        phoneMenuRef.current &&
        !phoneMenuRef.current.contains(e.target) &&
        !popupRef.current.contains(e.target)
      ) {
        setOpenPhoneMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div ref={popupRef} className="bg-white rounded-lg p-6 w-96 relative shadow-xl max-h-[90vh] overflow-y-auto">
        
        {/* Croix fermeture */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 font-bold hover:text-gray-700"
        >
          ✖
        </button>

        <h2 className="text-lg font-bold text-gray-800 text-center mb-4">
          {member.prenom} {member.nom}
        </h2>

        <div className="text-sm space-y-2">
          {/* Numéro centré et interactif */}
          <p 
            onClick={() => setOpenPhoneMenu(!openPhoneMenu)}
            className="text-center text-orange-500 font-semibold underline cursor-pointer"
          >
            {member.telephone || "—"}
          </p>

          {/* Menu téléphone popup */}
          {openPhoneMenu && (
            <div
              ref={phoneMenuRef}
              className="phone-menu absolute mt-2 bg-white rounded-lg shadow-lg border z-50 w-52 left-1/2 -translate-x-1/2"
              onClick={(e) => e.stopPropagation()} // empêche la propagation à document
            >
              <a href={member.telephone ? `tel:${member.telephone}` : "#"} className={`block px-4 py-2 text-sm text-black hover:bg-gray-100 ${!member.telephone ? "opacity-50 pointer-events-none" : ""}`}>📞 Appeler</a>
              <a href={member.telephone ? `sms:${member.telephone}` : "#"} className={`block px-4 py-2 text-sm text-black hover:bg-gray-100 ${!member.telephone ? "opacity-50 pointer-events-none" : ""}`}>✉️ SMS</a>
              <a href={member.telephone ? `https://wa.me/${member.telephone.replace(/\D/g,"")}?call` : "#"} target="_blank" rel="noopener noreferrer" className={`block px-4 py-2 text-sm text-black hover:bg-gray-100 ${!member.telephone ? "opacity-50 pointer-events-none" : ""}`}>📱 Appel WhatsApp</a>
              <a href={member.telephone ? `https://wa.me/${member.telephone.replace(/\D/g,"")}` : "#"} target="_blank" rel="noopener noreferrer" className={`block px-4 py-2 text-sm text-black hover:bg-gray-100 ${!member.telephone ? "opacity-50 pointer-events-none" : ""}`}>💬 Message WhatsApp</a>
            </div>
          )}

          <p>🏙️ Ville : {member.ville || "—"}</p>
          <p>💬 WhatsApp : {member.is_whatsapp ? "Oui" : "Non"}</p>
          <p>🎗️ Sexe : {member.sexe || "—"}</p>
          <p>🙏 Prière du salut : {member.priere_salut ? "Oui" : "Non"}</p>
          <p>☀️ Type : {member.type_conversion || "—"}</p>
          <p>❓ Besoin : {formatBesoin(member.besoin)}</p>
          <p>📝 Infos supplémentaires : {member.infos_supplementaires || "—"}</p>
        </div>

        {/* Bouton Modifier centré */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => onEdit(member)}
            className="text-blue-600 text-sm font-semibold hover:underline"
          >
            ✏️ Modifier le contact
          </button>
        </div>
      </div>
    </div>
  );
}
