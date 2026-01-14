//components/DetailEvangeliseSuivisPopup.js//
"use client";

import React, { useRef, useEffect, useState } from "react";

export default function DetailEvangeliseSuivisPopup({ member, onClose, onEdit, onSave })
 {
  const [openPhoneMenu, setOpenPhoneMenu] = useState(false);
  const [comment, setComment] = useState(member.commentaire_evangelises || "");
  const [status, setStatus] = useState(member.status_suivis_evangelises || "");
  const [saving, setSaving] = useState(false);

  const phoneMenuRef = useRef(null);
  const popupRef = useRef(null);

  const formatBesoin = (b) => {
    if (!b) return "—";
    try {
      const arr = JSON.parse(b);
      return Array.isArray(arr) ? arr.join(", ") : b;
    } catch {
      return b;
    }
  };

  // Fermer popup si clic extérieur
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  // Fermer menu téléphone
  useEffect(() => {
    const handleClickOutsideMenu = (e) => {
      if (phoneMenuRef.current && !phoneMenuRef.current.contains(e.target)) {
        setOpenPhoneMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutsideMenu);
    return () =>
      document.removeEventListener("mousedown", handleClickOutsideMenu);
  }, []);

  // ================= UPSERT MEMBRE (comme carte) =================
  const upsertMembre = async (suivi) => {
    try {
      const payload = {
        suivi_int_id: Number(suivi.id),
        nom: suivi.nom,
        prenom: suivi.prenom,
        telephone: suivi.telephone,
        ville: suivi.ville,
        sexe: suivi.sexe,
        besoin: suivi.besoin,
        infos_supplementaires: suivi.infos_supplementaires,
        cellule_id: suivi.cellule_id,
        conseiller_id: suivi.conseiller_id,
        statut_initial: "intégré",
        suivi_statut: "Intégré",
        suivi_commentaire_suivis: comment,
        suivi_updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("membres_complets")
        .upsert(payload, { onConflict: "suivi_int_id" });

      if (error) console.error("UPSERT MEMBRE ERROR:", error);
    } catch (err) {
      console.error("Erreur upsert membre:", err.message);
    }
  };

  // ================= SAVE =================
  const handleSave = () => {
  onSave(member.id, {
    ...member,
    commentaire_evangelises: comment,
    status_suivis_evangelises: status,
  });
};

    if (!member.id) return;

    setSaving(true);

    try {
      const { error } = await supabase
        .from("suivis_des_evangelises")
        .update({
          commentaire_evangelises: comment,
          status_suivis_evangelises: status,
        })
        .eq("id", member.id);

      if (error) throw error;

      // ✅ si intégré → membres + retirer de la liste
      if (status === "Intégré") {
        await upsertMembre(member);
      }

      setSaving(false);
      onClose();
    } catch (err) {
      console.error("Erreur lors de la sauvegarde :", err);
      alert("Erreur lors de la sauvegarde. Vérifie la console.");
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div
        ref={popupRef}
        className="bg-white rounded-lg p-6 w-96 relative shadow-xl max-h-[90vh] overflow-y-auto"
      >
        {/* Fermer */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 font-bold hover:text-gray-700"
        >
          ✖
        </button>

        {/* ================= CENTRÉ ================= */}
        <h2 className="text-lg font-bold text-gray-800 text-center mb-4">
          {member.prenom} {member.nom}
        </h2>

        {/* Téléphone */}
        <p
          onClick={() => setOpenPhoneMenu(!openPhoneMenu)}
          className="text-center text-orange-500 font-semibold underline cursor-pointer"
        >
          {member.telephone || "—"}
        </p>

        {/* MENU TELEPHONE */}
        {openPhoneMenu && (
          <div
            ref={phoneMenuRef}
            className="absolute mt-2 bg-white rounded-lg shadow-lg border z-50 w-52 left-1/2 -translate-x-1/2"
            onClick={(e) => e.stopPropagation()}
          >
            <a
              href={member.telephone ? `tel:${member.telephone}` : "#"}
              className={`block px-4 py-2 text-sm text-black hover:bg-gray-100 ${
                !member.telephone ? "opacity-50 pointer-events-none" : ""
              }`}
            >
              📞 Appeler
            </a>
            <a
              href={member.telephone ? `sms:${member.telephone}` : "#"}
              className={`block px-4 py-2 text-sm text-black hover:bg-gray-100 ${
                !member.telephone ? "opacity-50 pointer-events-none" : ""
              }`}
            >
              ✉️ SMS
            </a>
            <a
              href={
                member.telephone
                  ? `https://wa.me/${member.telephone.replace(/\D/g, "")}?call`
                  : "#"
              }
              target="_blank"
              rel="noopener noreferrer"
              className={`block px-4 py-2 text-sm text-black hover:bg-gray-100 ${
                !member.telephone ? "opacity-50 pointer-events-none" : ""
              }`}
            >
              📱 Appel WhatsApp
            </a>
            <a
              href={
                member.telephone
                  ? `https://wa.me/${member.telephone.replace(/\D/g, "")}`
                  : "#"
              }
              target="_blank"
              rel="noopener noreferrer"
              className={`block px-4 py-2 text-sm text-black hover:bg-gray-100 ${
                !member.telephone ? "opacity-50 pointer-events-none" : ""
              }`}
            >
              💬 Message WhatsApp
            </a>
          </div>
        )}

        {/* ================= CENTRÉ ================= */}
        <p className="text-center mt-2">🏠 Cellule : {member.cellule_full || "—"}</p>
        <p className="text-center">👤 Conseiller : {member.responsable || "—"}</p>
        <p className="text-center">🏙️ Ville : {member.ville || "—"}</p>

        {/* ================= COMMENTAIRE & STATUT ================= */}
        <div className="flex flex-col w-full mt-4">
          <label className="font-semibold text-blue-700 mb-1 text-center">
            Commentaire Suivis
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full border rounded-lg p-2"
            rows={2}
          />

          <label className="font-semibold text-blue-700 mb-1 mt-2 text-center">
            Statut du suivis
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full border rounded-lg p-2 mb-2"
          >
            <option value="">-- Sélectionner un statut --</option>
            <option value="En cours">En cours</option>
            <option value="Intégré">Intégré</option>
            <option value="Refus">Refus</option>
          </select>

          <button
            onClick={handleSave}
            disabled={saving}
            className={`mt-2 w-full font-bold py-2 rounded-lg shadow-md transition-all ${
              saving
                ? "bg-blue-300 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-400 to-indigo-500 hover:from-blue-500 hover:to-indigo-600 text-white"
            }`}
          >
            {saving ? "Enregistrement..." : "Sauvegarder"}
          </button>
        </div>

        {/* ================= ALIGN LEFT ================= */}
        <div className="mt-5 text-sm text-black space-y-1 text-left w-full">
          <p>🎗️ Sexe : {member.sexe || "—"}</p>
          <p>🙏 Prière du salut : {member.priere_salut ? "Oui" : "Non"}</p>
          <p>☀️ Type : {member.type_conversion || "—"}</p>
          <p>❓ Besoin : {formatBesoin(member.besoin)}</p>
          <p>📝 Infos supplémentaires : {member.infos_supplementaires || "—"}</p>
        </div>

        {/* ================= CENTRÉ ================= */}
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
