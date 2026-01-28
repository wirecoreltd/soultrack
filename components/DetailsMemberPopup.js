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
  updateSuivi,
  onDelete,
}) {
  if (!membre?.id) return null;

  const [selectedTargetType, setSelectedTargetType] = useState("");
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [cibleComplete, setCibleComplete] = useState(null);
  const [openPhoneMenu, setOpenPhoneMenu] = useState(false);
  const [editMember, setEditMember] = useState(null);
  const phoneMenuRef = useRef(null);

  // ---------------- HELPERS ----------------
  const formatMinistere = (ministereJson, autreMinistere) => {
    let list = [];
    if (ministereJson) {
      try {
        const parsed = typeof ministereJson === "string" ? JSON.parse(ministereJson) : ministereJson;
        list = Array.isArray(parsed) ? parsed : [parsed];
        list = list.filter(m => m.toLowerCase() !== "autre");
      } catch {
        if (ministereJson.toLowerCase() !== "autre") list = [ministereJson];
      }
    }
    if (autreMinistere?.trim()) list.push(autreMinistere.trim());
    return list.join(", ") || "—";
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

  // Fermer menu téléphone
  useEffect(() => {
    const close = (e) => {
      if (phoneMenuRef.current && !phoneMenuRef.current.contains(e.target)) {
        setOpenPhoneMenu(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative">

        {/* Fermer */}
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-500">
          ✖
        </button>

        {/* ================= HEADER ================= */}
        <div className="flex flex-col items-center text-center">
          <h2 className="text-lg font-semibold">
            {membre.prenom} {membre.nom} {membre.star && "⭐"}
          </h2>

          <p className="text-xs text-gray-500 self-end mt-1">
            créé le : {new Date(membre.created_at).toLocaleDateString()}
          </p>

          {/* Téléphone */}
          {membre.telephone && (
            <div className="relative mt-1" ref={phoneMenuRef}>
              <button
                onClick={() => setOpenPhoneMenu(!openPhoneMenu)}
                className="text-orange-500 underline text-lg font-medium"
              >
                {membre.telephone}
              </button>

              {openPhoneMenu && (
                <div className="absolute top-full mt-2 bg-white border rounded-lg shadow w-56 z-50">
                  <a href={`tel:${membre.telephone}`} className="block px-4 py-2 hover:bg-gray-100">📞 Appeler</a>
                  <a href={`sms:${membre.telephone}`} className="block px-4 py-2 hover:bg-gray-100">✉️ SMS</a>
                  <a
                    href={`https://wa.me/${membre.telephone.replace(/\D/g, "")}`}
                    target="_blank"
                    className="block px-4 py-2 hover:bg-gray-100"
                  >
                    💬 WhatsApp
                  </a>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ================= INFOS PRINCIPALES ================= */}
        <div className="mt-4 space-y-1 text-sm">
          <p><span className="font-medium">🏙️ Ville :</span> {membre.ville || "—"}</p>

          <p><span className="font-medium">🏠 Cellule :</span>{" "}
            {membre.cellule_id
              ? cellules.find(c => c.id === membre.cellule_id)?.cellule_full || "—"
              : "—"}
          </p>

          <p><span className="font-medium">👤 Conseiller :</span>{" "}
            {membre.conseiller_id
              ? `${conseillers.find(c => c.id === membre.conseiller_id)?.prenom || ""} ${
                  conseillers.find(c => c.id === membre.conseiller_id)?.nom || ""
                }`.trim() || "—"
              : "—"}
          </p>
        </div>

        {/* ================= ENVOYER À ================= */}
        <div className="mt-4">
          <label className="text-sm font-medium">Envoyer à :</label>

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
                setCibleComplete(
                  selectedTargetType === "cellule"
                    ? cellules.find(c => c.id === id)
                    : conseillers.find(c => c.id === id)
                );
              }}
              className="mt-2 w-full border rounded px-2 py-1 text-sm"
            >
              <option value="">-- Sélectionner --</option>
              {selectedTargetType === "cellule" &&
                cellules.map(c => (
                  <option key={c.id} value={c.id}>{c.cellule_full}</option>
                ))}
              {selectedTargetType === "conseiller" &&
                conseillers.map(c => (
                  <option key={c.id} value={c.id}>{c.prenom} {c.nom}</option>
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
                onEnvoyer={(data) => handleAfterSend?.(data, selectedTargetType, cibleComplete)}
                showToast={showToast}
              />
            </div>
          )}
        </div>

        {/* ================= MARQUER COMME MEMBRE ================= */}
        {membre.etat_contact === "nouveau" && (
          <div className="flex justify-end mt-4">
            <button
              onClick={() => updateSuivi(membre.id, 3)}
              className="text-green-600 text-sm font-medium"
            >
              ✅ Marquer comme membre
            </button>
          </div>
        )}

        {/* ================= ETAT CONTACT ================= */}
        <div className="mt-4 flex justify-between items-center text-sm">
          <span className="font-medium">🕊 Etat Contact :</span>
          <select
            value={membre.statut_suivis || ""}
            onChange={(e) => updateSuivi(membre.id, Number(e.target.value))}
            className="border rounded px-2 py-1 text-sm"
          >
            <option value="1">Envoyé</option>
            <option value="2">En attente</option>
            <option value="3">Intégré</option>
            <option value="4">Refus</option>
          </select>
        </div>

        {/* ================= AUTRES INFOS ================= */}
        <div className="mt-4 space-y-1 text-sm">
          <p><span className="font-medium">💬 WhatsApp :</span> {membre.is_whatsapp ? "Oui" : "Non"}</p>
          <p><span className="font-medium">🎗️ Sexe :</span> {membre.sexe || "—"}</p>
          <p><span className="font-medium">💧 Baptême d'eau :</span> {membre.bapteme_eau ? "Oui" : "Non"}</p>
          <p><span className="font-medium">🔥 Baptême de feu :</span> {membre.bapteme_esprit ? "Oui" : "Non"}</p>
          <p><span className="font-medium">✒️ Formation :</span> {membre.Formation || "—"}</p>
          <p><span className="font-medium">❤️‍🩹 Soin Pastoral :</span> {membre.Soin_Pastoral || "—"}</p>
          <p><span className="font-medium">💢 Ministère :</span> {formatMinistere(membre.Ministere, membre.Autre_Ministere)}</p>
          <p><span className="font-medium">❓ Besoin :</span> {formatArrayField(membre.besoin)}</p>
          <p><span className="font-medium">📝 Infos :</span> {membre.infos_supplementaires || "—"}</p>
        </div>

        {/* ================= ACTIONS ================= */}
        <div className="mt-5 space-y-2">
          <button onClick={() => setEditMember(membre)} className="text-blue-600 text-sm w-full">
            ✏️ Modifier le contact
          </button>

          <button
            onClick={() => {
              if (!onDelete) return;
              if (confirm("⚠️ Suppression définitive\n\nVoulez-vous vraiment supprimer ce contact ?")) {
                onDelete(membre.id);
                onClose();
              }
            }}
            className="text-red-600 text-sm w-full"
          >
            🗑️ Supprimer le contact
          </button>
        </div>

        {editMember && (
          <EditMemberPopup
            member={editMember}
            onClose={() => setEditMember(null)}
            onUpdateMember={() => setEditMember(null)}
          />
        )}
      </div>
    </div>
  );
}
