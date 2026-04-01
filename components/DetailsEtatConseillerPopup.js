"use client";

import React, { useRef, useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import EditEvangeliseSuiviPopup from "./EditEvangeliseSuiviPopup";

export default function DetailsEtatConseillerPopup({ memberId, onClose, onUpdate }) {
  const popupRef = useRef(null);
  const phoneMenuRef = useRef(null);

  const [member, setMember] = useState(null);
  const [openPhoneMenu, setOpenPhoneMenu] = useState(false);
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingEvangelise, setEditingEvangelise] = useState(null);
  const [cellules, setCellules] = useState([]);
  const [conseillers, setConseillers] = useState([]);

  const isRefus = status === "Refus";

  // ================= FETCH MEMBER =================
  useEffect(() => {
    if (!memberId) return;

    const fetchMember = async () => {
      try {
        const { data, error } = await supabase
          .from("suivis_des_evangelises")
          .select("*")
          .eq("id", memberId)
          .single();
        if (error) throw error;
        setMember(data);
        setComment(data.commentaire_evangelises || "");
        setStatus(data.status_suivis_evangelises || "");
      } catch (err) {
        console.error("Erreur fetch member:", err);
      }
    };

    fetchMember();
    fetchCellules();
    fetchConseillers();
  }, [memberId]);

  const fetchCellules = async () => {
    const { data } = await supabase.from("cellules").select("*");
    if (data) setCellules(data);
  };

  const fetchConseillers = async () => {
    const { data } = await supabase.from("profiles").select("*");
    if (data) setConseillers(data);
  };

  const cellule = cellules?.find((c) => c.id === member?.cellule_id);
  const conseiller = conseillers?.find((c) => c.id === member?.conseiller_id);

  // ================= CLOSE PHONE MENU ON OUTSIDE CLICK =================
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (phoneMenuRef.current && !phoneMenuRef.current.contains(e.target)) {
        setOpenPhoneMenu(false);
      }
    };
    window.addEventListener("mousedown", handleClickOutside, true);
    return () => window.removeEventListener("mousedown", handleClickOutside, true);
  }, []);

  // ================= SAVE =================
  const handleSave = async () => {
    if (!member?.id) return;
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

      onUpdate && onUpdate(member.id, { commentaire_evangelises: comment, status_suivis_evangelises: status });
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

  const formatDateFR = (d) => {
    if (!d) return "—";
    const date = new Date(d);
    return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth()+1).padStart(2,"0")}/${date.getFullYear()}`;
  };

  if (!member) return null;

  return (
    <>
      {/* OVERLAY */}
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
        {/* POPUP */}
        <div ref={popupRef} onMouseDown={(e) => e.stopPropagation()} className="bg-white rounded-lg p-6 w-96 relative shadow-xl max-h-[90vh] overflow-y-auto">
          {/* CLOSE */}
          <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 font-bold">✖</button>

          <h2 className="text-lg font-bold text-center mb-3">{member.prenom} {member.nom}</h2>

          {/* PHONE */}
          {member.telephone && (
            <div ref={phoneMenuRef} className="relative text-center">
              <button onClick={() => setOpenPhoneMenu(prev => !prev)} className="text-orange-500 font-semibold underline">{member.telephone}</button>
              {openPhoneMenu && (
                <div className="absolute left-1/2 -translate-x-1/2 mt-2 bg-white border rounded-lg shadow w-56 z-50">
                  <a href={`tel:${member.telephone}`} className="block px-4 py-2 hover:bg-gray-100">📞 Appeler</a>
                  <a href={`sms:${member.telephone}`} className="block px-4 py-2 hover:bg-gray-100">✉️ SMS</a>
                  <a href={`https://wa.me/${member.telephone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="block px-4 py-2 hover:bg-gray-100">💬 WhatsApp</a>
                </div>
              )}
            </div>
          )}

          {/* INFOS */}
          <div className="text-sm text-center mt-3 space-y-1">
            <p>🏠 Cellule : {cellule?.cellule_full || "—"}</p>
            <p>👤 Conseiller : {conseiller ? `${conseiller.prenom} ${conseiller.nom}` : "—"}</p>
            <p>🏙️ Ville : {member.ville || "—"}</p>
          </div>

          {/* COMMENT / STATUS */}
          <div className="mt-4">
            <label className="block text-center font-semibold mb-1">Commentaire</label>
            <textarea value={comment} onChange={(e) => setComment(e.target.value)} disabled={isRefus} className="w-full border rounded p-2" rows={2}/>

            <label className="block text-center font-semibold mt-2 mb-1">Statut</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} disabled={isRefus} className="w-full border rounded p-2">
              <option value="">-- Choisir --</option>
              <option value="En cours">En cours</option>
              <option value="Intégré">Intégré</option>
              <option value="Refus">Refus</option>
            </select>

            {!isRefus && (
              <button onClick={handleSave} disabled={saving} className="mt-3 w-full bg-blue-500 text-white py-2 rounded">
                {saving ? "Enregistrement..." : "Sauvegarder"}
              </button>
            )}
          </div>

          {/* EXTRA */}
          <div className="mt-4 text-sm space-y-1">
            <p>🎗️ Sexe : {member.sexe || "—"}</p>
            <p>🙏 Prière du salut : {member.priere_salut ? "Oui" : "Non"}</p>
            <p>☀️ Type : {member.type_conversion || "—"}</p>
            <p>❓ Besoin : {formatBesoin(member.besoin)}</p>
            <p>📝 Infos supplémentaires : {member.infos_supplementaires || "—"}</p>
          </div>

          {!isRefus && (
            <div className="mt-4 rounded-xl w-full p-4 bg-white">
              <button onClick={() => setEditingEvangelise(member)} className="w-full py-2 rounded-md bg-white text-orange-500 shadow-md">
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
            onUpdate && onUpdate(member.id, updates);
            setEditingEvangelise(null);
            onClose();
          }}
        />
      )}
    </>
  );
}
