"use client";

import React, { useRef, useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import EditEvangeliseSuiviPopup from "./EditEvangeliseSuiviPopup";

export default function DetailsEtatConseillerPopup({
  member,
  cellules,
  conseillers,
  onClose,
  onUpdate,
}) {
  const popupRef = useRef(null);
  const phoneMenuRef = useRef(null);

  // ✅ On sécurise member avec un objet vide par défaut
  const safeMember = member || {};

  const [openPhoneMenu, setOpenPhoneMenu] = useState(false);
  const [comment, setComment] = useState(safeMember.commentaire_evangelises ?? "");
  const [status, setStatus] = useState(safeMember.status_suivis_evangelises ?? "");
  const [saving, setSaving] = useState(false);
  const [editingEvangelise, setEditingEvangelise] = useState(null);

  const isRefus = status === "Refus";

  const cellule = cellules?.find((c) => c.id === safeMember.cellule_id);
  const conseiller = conseillers?.find((c) => c.id === safeMember.conseiller_id);

  // ================= CLOSE PHONE MENU ON OUTSIDE CLICK =================
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (phoneMenuRef.current && !phoneMenuRef.current.contains(e.target)) {
        setOpenPhoneMenu(false);
      }
    };

    window.addEventListener("mousedown", handleClickOutside, true);
    return () =>
      window.removeEventListener("mousedown", handleClickOutside, true);
  }, []);

  // ================= SAVE =================
  const handleSave = async () => {
    if (!safeMember.id) return;
    setSaving(true);

    try {
      const { error } = await supabase
        .from("suivis_des_evangelises")
        .update({
          commentaire_evangelises: comment,
          status_suivis_evangelises: status,
        })
        .eq("id", safeMember.id);

      if (error) throw error;

      onUpdate &&
        onUpdate(safeMember.id, {
          commentaire_evangelises: comment,
          status_suivis_evangelises: status,
        });

      onClose();
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  const formatBesoin = (b) => {
    if (!b) return "—";
    try {
      const arr = JSON.parse(b);
      return Array.isArray(arr) ? arr.join(", ") : b;
    } catch {
      return b;
    }
  };

  return (
    <>
      {/* OVERLAY */}
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
        {/* POPUP */}
        <div
          ref={popupRef}
          onMouseDown={(e) => e.stopPropagation()}
          className="bg-white rounded-lg p-6 w-96 relative shadow-xl max-h-[90vh] overflow-y-auto"
        >
          {/* CLOSE */}
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-gray-500 font-bold"
          >
            ✖
          </button>

          <h2 className="text-lg font-bold text-center mb-3">
            {safeMember.prenom || "—"} {safeMember.nom || ""}
          </h2>

          {/* PHONE */}
          {safeMember.telephone && (
            <div ref={phoneMenuRef} className="relative text-center">
              <button
                onClick={() => setOpenPhoneMenu((prev) => !prev)}
                className="text-orange-500 font-semibold underline"
              >
                {safeMember.telephone}
              </button>

              {openPhoneMenu && (
                <div className="absolute left-1/2 -translate-x-1/2 mt-2 bg-white border rounded-lg shadow w-56 z-50">
                  <a
                    href={`tel:${safeMember.telephone}`}
                    className="block px-4 py-2 hover:bg-gray-100"
                  >
                    📞 Appeler
                  </a>
                  <a
                    href={`sms:${safeMember.telephone}`}
                    className="block px-4 py-2 hover:bg-gray-100"
                  >
                    ✉️ SMS
                  </a>
                  <a
                    href={`https://wa.me/${safeMember.telephone.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-4 py-2 hover:bg-gray-100"
                  >
                    💬 WhatsApp
                  </a>
                </div>
              )}
            </div>
          )}

          {/* INFOS */}
          <div className="text-sm text-center mt-3 space-y-1">
            <p>🏠 Cellule : {cellule?.cellule_full || "—"}</p>
            <p>
              👤 Conseiller :{" "}
              {conseiller
                ? `${conseiller.prenom} ${conseiller.nom}`
                : "—"}
            </p>
            <p>🏙️ Ville : {safeMember.ville || "—"}</p>
          </div>

          {/* COMMENT / STATUS */}
          <div className="mt-4">
            <label className="block text-center font-semibold mb-1">
              Commentaire
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              disabled={isRefus}
              className="w-full border rounded p-2"
              rows={2}
            />

            <label className="block text-center font-semibold mt-2 mb-1">
              Statut
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              disabled={isRefus}
              className="w-full border rounded p-2"
            >
              <option value="">-- Choisir --</option>
              <option value="En cours">En cours</option>
              <option value="Intégré">Intégré</option>
              <option value="Refus">Refus</option>
            </select>

            {!isRefus && (
              <button
                onClick={handleSave}
                disabled={saving}
                className="mt-3 w-full bg-blue-500 text-white py-2 rounded"
              >
                {saving ? "Enregistrement..." : "Sauvegarder"}
              </button>
            )}
          </div>

          {/* EXTRA */}
          <div className="mt-4 text-sm space-y-1">
            <p>🎗️ Sexe : {safeMember.sexe || "—"}</p>
            <p>🙏 Prière du salut : {safeMember.priere_salut ? "Oui" : "Non"}</p>
            <p>☀️ Type : {safeMember.type_conversion || "—"}</p>
            <p>❓ Besoin : {formatBesoin(safeMember.besoin)}</p>
            <p>
              📝 Infos supplémentaires :{" "}
              {safeMember.infos_supplementaires || "—"}
            </p>
          </div>

          {!isRefus && (
            <div className="mt-4 rounded-xl w-full p-4 bg-white">
              <button
                onClick={() => setEditingEvangelise(safeMember)}
                className="w-full py-2 rounded-md bg-white text-orange-500 shadow-md"
              >
                ✏️ Modifier le contact
              </button>
            </div>
          )}
        </div>
      </div>

      {/* SOUS-POPUP */}
      {editingEvangelise && (
        <EditEvangeliseSuiviPopup
          member={editingEvangelise}
          onClose={() => setEditingEvangelise(null)}
          onUpdateMember={(updates) => {
            if (onUpdate) onUpdate(safeMember.id, updates);
            setEditingEvangelise(null);
            onClose();
          }}
        />
      )}
    </>
  );
}
