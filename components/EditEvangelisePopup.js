"use client";

import React, { useRef, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function DetailsEvangePopup({
  member,
  onClose,
  onEdit,
  onAfterStatusUpdate, // navigation / refresh parent
}) {
  const [openPhoneMenu, setOpenPhoneMenu] = useState(false);
  const [status, setStatus] = useState(member.statut_suivis ?? "");
  const [comment, setComment] = useState(member.commentaire_suivis ?? "");
  const [saving, setSaving] = useState(false);

  const phoneMenuRef = useRef(null);
  const popupRef = useRef(null);

  // ================= CLICK OUTSIDE PHONE MENU =================
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        phoneMenuRef.current &&
        !phoneMenuRef.current.contains(e.target)
      ) {
        setOpenPhoneMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ================= FORMAT BESOIN =================
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

  // ================= SAVE =================
  const handleSave = async () => {
    if (!status) return;

    setSaving(true);

    const newStatut = Number(status);

    const updatePayload = {
      statut_suivis: newStatut,
      commentaire_suivis: comment,
      updated_at: new Date().toISOString(),
    };

    // ✅ Si intégré → devient membre intégré
    if (newStatut === 3) {
      updatePayload.statut = "integré";
      updatePayload.etat_contact = "integré";
    }

    const { data, error } = await supabase
      .from("membres_complets")
      .update(updatePayload)
      .eq("id", member.id)
      .select()
      .single();

    setSaving(false);

    if (error) {
      console.error("Erreur update suivi:", error);
      alert("Erreur lors de la mise à jour");
      return;
    }

    // 🔁 logique navigation centrale (comme cartes)
    if (onAfterStatusUpdate && data?.statut_suivis) {
      onAfterStatusUpdate(Number(data.statut_suivis));
    }

    onClose(); // ✅ popup se ferme toujours après action
  };

  if (!member) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div
        ref={popupRef}
        className="bg-white rounded-xl p-6 w-96 relative shadow-xl max-h-[90vh] overflow-y-auto"
      >
        {/* ❌ Fermer */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 font-bold hover:text-gray-700"
        >
          ✖
        </button>

        {/* ================= CENTRÉ ================= */}
        <div className="flex flex-col items-center text-center">
          <h2 className="text-lg font-bold mb-1">
            {member.prenom} {member.nom}
          </h2>

          {/* 📞 TELEPHONE */}
          <div className="relative mt-1">
            <p
              onClick={() => setOpenPhoneMenu((p) => !p)}
              className="text-orange-500 underline font-semibold cursor-pointer"
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
          </div>

          <p className="mt-2">🏠 Cellule : {member.cellule_full || "—"}</p>
          <p>👤 Conseiller : {member.responsable || "—"}</p>
          <p>🏙 Ville : {member.ville || "—"}</p>

          {/* ================= COMMENTAIRE ================= */}
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

            {/* ================= STATUT ================= */}
            <label className="font-semibold text-blue-700 mb-1 mt-2 text-center">
              Statut du Suivis
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full border rounded-lg p-2 mb-2"
            >
              <option value="">-- Sélectionner --</option>
              <option value="2">En attente</option>
              <option value="4">Refus</option>
              <option value="3">Intégré</option>
            </select>

            {/* 💾 SAUVEGARDER */}
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
        </div>

        {/* ================= ALIGNÉ À GAUCHE ================= */}
        <div className="mt-5 text-sm text-black space-y-1 text-left w-full">
          <p>🎗 Sexe : {member.sexe || "—"}</p>
          <p>🙏 Prière du salut : {member.priere_salut ? "Oui" : "Non"}</p>
          <p>☀️ Type : {member.type_conversion || "—"}</p>
          <p>❓ Besoin : {formatBesoin(member.besoin)}</p>
          <p>📝 Infos : {member.infos_supplementaires || "—"}</p>
        </div>

        {/* ================= MODIFIER ================= */}
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
