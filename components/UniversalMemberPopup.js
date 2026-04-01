"use client";

import { useState } from "react";
import supabase from "../lib/supabaseClient";

export default function UniversalMemberPopup({
  type,
  mode,
  data,
  cellules,
  conseillers,
  onClose,
  onUpdate,
}) {
  const member = data || {};

  const [editMode, setEditMode] = useState(mode === "edit");
  const [comment, setComment] = useState(member.commentaire_evangelises || "");
  const [status, setStatus] = useState(member.status_suivis_evangelises || "");

  const cellule = cellules?.find(c => c.id === member.cellule_id);
  const conseiller = conseillers?.find(c => c.id === member.conseiller_id);

  const handleSave = async () => {
    try {
      let table = "";

      if (type === "evangelisation") {
        table = "suivis_des_evangelises";
      } else if (type === "integration") {
        table = "membres_complets";
      }

      const { error } = await supabase
        .from(table)
        .update({
          commentaire_evangelises: comment,
          status_suivis_evangelises: status,
        })
        .eq("id", member.id);

      if (error) throw error;

      onUpdate && onUpdate(member.id, {
        commentaire_evangelises: comment,
        status_suivis_evangelises: status,
      });

      onClose();

    } catch (err) {
      console.error(err);
      alert("Erreur sauvegarde");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg w-96 relative">

        {/* CLOSE */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2"
        >
          ✖
        </button>

        {/* TITLE */}
        <h2 className="text-lg font-bold text-center mb-3">
          {member.prenom} {member.nom}
        </h2>

        {/* INFOS */}
        <div className="text-sm text-center space-y-1">
          <p>📞 {member.telephone || "—"}</p>
          <p>🏠 {cellule?.cellule_full || "—"}</p>
          <p>👤 {conseiller ? `${conseiller.prenom} ${conseiller.nom}` : "—"}</p>
          <p>🏙️ {member.ville || "—"}</p>
        </div>

        {/* MODE VIEW */}
        {!editMode && (
          <div className="mt-4 text-sm space-y-2">
            <p>💬 {comment || "—"}</p>
            <p>📊 {status || "—"}</p>

            <button
              onClick={() => setEditMode(true)}
              className="w-full mt-3 bg-orange-500 text-white py-2 rounded"
            >
              ✏️ Modifier
            </button>
          </div>
        )}

        {/* MODE EDIT */}
        {editMode && (
          <div className="mt-4">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full border p-2 rounded"
            />

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full border p-2 mt-2 rounded"
            >
              <option value="">-- Choisir --</option>
              <option value="En cours">En cours</option>
              <option value="Intégré">Intégré</option>
              <option value="Refus">Refus</option>
            </select>

            <button
              onClick={handleSave}
              className="w-full mt-3 bg-blue-500 text-white py-2 rounded"
            >
              💾 Sauvegarder
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
