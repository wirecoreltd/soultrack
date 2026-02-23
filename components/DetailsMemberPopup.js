"use client";

import { useEffect, useState, useRef } from "react";
import BoutonEnvoyer from "./BoutonEnvoyer";
import EditMemberPopup from "./EditMemberPopup";
import supabase from "../lib/supabaseClient";

export default function DetailsMemberPopup({
  membre,
  onClose,
  cellules = [],
  conseillers = [],
  session,
  userRole,
  handleAfterSend,
  showToast,
  updateSuivi,
  setAllMembers,
  onDelete,
}) {
  if (!membre || !membre.id) return null;

  const [selectedTargetType, setSelectedTargetType] = useState("");
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [cibleComplete, setCibleComplete] = useState(null);
  const [openPhoneMenu, setOpenPhoneMenu] = useState(false);
  const [editMember, setEditMember] = useState(null);
  const phoneMenuRef = useRef(null);

  // Bloquer le scroll de la page derrière
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  // Fermer menu téléphone si clic en dehors
  useEffect(() => {
    const close = (e) => {
      if (phoneMenuRef.current && !phoneMenuRef.current.contains(e.target)) {
        setOpenPhoneMenu(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const statutSuiviLabels = {
    1: "En Suivis",
    2: "En attente",
    3: "Intégré",
    4: "Refus",
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      {/* Popup scrollable */}
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 relative max-h-[90vh] overflow-y-auto">
        
        {/* Bouton fermer */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 text-lg font-bold"
        >
          ✖
        </button>

        {/* Header */}
        <div className="flex flex-col items-center text-center">
          <h2 className="text-lg font-bold">
            {membre.prenom} {membre.nom} {membre.star && "⭐"}
          </h2>

          {/* Téléphone */}
          {membre.telephone && (
            <div className="relative mt-1" ref={phoneMenuRef}>
              <button
                onClick={() => setOpenPhoneMenu(!openPhoneMenu)}
                className="text-lg text-orange-500 underline font-semibold"
              >
                {membre.telephone}
              </button>

              {openPhoneMenu && (
                <div className="absolute top-full mt-2 bg-white border rounded-lg shadow w-56 z-50">
                  <a href={`tel:${membre.telephone}`} className="block px-4 py-2 hover:bg-gray-100">📞 Appeler</a>
                  <a href={`sms:${membre.telephone}`} className="block px-4 py-2 hover:bg-gray-100">✉️ SMS</a>
                  <a href={`https://wa.me/${membre.telephone?.replace(/\D/g, "")}?call`} target="_blank" rel="noopener noreferrer" className="block px-4 py-2 hover:bg-gray-100"> 📱 Appel WhatsApp </a>
                  <a href={`https://wa.me/${membre.telephone.replace(/\D/g, "")}`} target="_blank" className="block px-4 py-2 hover:bg-gray-100"> 💬 WhatsApp </a>                    
                </div>
              )}
            </div>
          )}
        </div>

        {/* Infos principales */}
        <div className="mt-4 text-sm space-y-1">
          <p className="text-center">🏙️ Ville : {membre.ville || ""}</p>
          <p className="text-center">🕊 Etat Contact : {membre.etat_contact || ""}</p>
          <p className="text-right text-[11px] text-gray-400">
            Créé le {new Date(membre.created_at).toLocaleDateString("fr-FR")}
          </p>
          <p>🏠 Cellule : {cellules.find(c => c.id === membre.cellule_id)?.cellule_full || "—"}</p>
          <p>
            👤 Conseiller :{" "}
            {membre.conseiller_id
              ? `${conseillers.find(c => c.id === membre.conseiller_id)?.prenom || ""} ${conseillers.find(c => c.id === membre.conseiller_id)?.nom || ""}`
              : "—"}
          </p>
        </div>

        {/* Envoyer pour suivi */}
        <div className="mt-4">
          <label className="font-semibold text-sm">Envoyer pour suivi :</label>
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
              className="mt-2 w-full border rounded px-2 py-1 text-sm"
              onChange={(e) => {
                const id = e.target.value;
                setSelectedTarget(id);
                setCibleComplete(
                  selectedTargetType === "cellule"
                    ? cellules.find(c => c.id === id)
                    : conseillers.find(c => c.id === id)
                );
              }}
            >
              <option value="">-- Sélectionner --</option>
              {(selectedTargetType === "cellule" ? cellules : conseillers).map(c => (
                <option key={c.id} value={c.id}>
                  {c.cellule_full || `${c.prenom || ""} ${c.nom || ""}`}
                </option>
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
                onEnvoyer={handleAfterSend}
                showToast={showToast}
              />
            </div>
          )}
        </div>

        {/* Bouton Marquer comme membre */}
        {membre.etat_contact?.trim().toLowerCase() === "nouveau" && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={async () => {
                const confirmMove = window.confirm(
                  "⚠️ Confirmation\n\nCe contact n’a plus besoin d’être suivi.\nVoulez-vous vraiment le déplacer dans les membres existants ?"
                );
                if (!confirmMove) return;

                try {
                  const { error } = await supabase
                    .from("membres_complets")
                    .update({ etat_contact: "existant" })
                    .eq("id", membre.id);

                  if (error) throw error;

                  setAllMembers(prev =>
                    prev.map(mem =>
                      mem.id === membre.id
                        ? { ...mem, etat_contact: "existant" }
                        : mem
                    )
                  );

                  onClose();

                  showToast(
                    <span className="inline-block bg-white text-green-600 px-2 py-1 rounded shadow text-xs font-semibold">
                      ✅ Contact déplacé dans membres existants
                    </span>
                  );
                } catch (err) {
                  console.error("Erreur marquer membre :", err);
                  showToast("❌ Erreur lors du déplacement");
                }
              }}
              className="ml-auto bg-white text-green-600 px-3 py-1 rounded-md text-sm font-semibold shadow-sm hover:shadow-md transition-shadow"
            >
              ✅ Marquer comme membre
            </button>
          </div>
        )}

        {/* Détails */}
        <div className="mt-5 text-sm space-y-1">
          <p className="font-semibold text-center text-blue-700">
            💡 Statut Suivi : {statutSuiviLabels[membre.statut_suivis] || ""}
          </p>
          <p>💬 WhatsApp : {membre.is_whatsapp ? "Oui" : "Non"}</p>
          <p>🎗️ Sexe : {membre.sexe || ""}</p>
          <p>💧 Baptême d’Eau : {membre.bapteme_eau ? "Oui" : "Non"}</p>
          <p>🔥 Baptême de Feu : {membre.bapteme_esprit ? "Oui" : "Non"}</p>
          <p>✒️ Formation : {membre.Formation || ""}</p>
          <p>❤️‍🩹 Soin Pastoral : {membre.Soin_Pastoral || ""}</p>
          <p>💢 Ministère : {formatMinistere(membre.Ministere, membre.Autre_Ministere)}</p>
          <p>❓ Difficultés / Besoins : {formatArrayField(membre.besoin)}</p>
          <p>📝 Infos : {membre.infos_supplementaires || ""}</p>
          <p>🧩 Comment est-il venu : {membre.venu || ""}</p>
          <p>✨ Raison de la venue : {membre.statut_initial || ""}</p>
          <p>🙏 Prière du salut : {membre.priere_salut || ""}</p>
          <p>☀️ Type de conversion : {membre.type_conversion || ""}</p>
          <p>📝 Commentaire Suivis : {membre.commentaire_suivis || ""}</p>
          <p>📑 Commentaire Suivis Evangelisation : {membre.Commentaire_Suivi_Evangelisation || ""}</p>
        </div>

        {/* Bloc Actions – carte unique */}
          <div className="bg-white shadow-md rounded-xl p-4 mt-3 flex flex-col gap-4">
            {/* Modifier le contact */}
            <button
              onClick={() => setEditMember(membre)}
              className="text-orange-500 font-semibold text-sm"
            >
              ✏️ Modifier le contact
            </button>
          
            {/* Intégration terminée - visible pour Conseiller */}
            {userRole === "Conseiller" && membre.integration_fini !== "fini" && (
              <button
                onClick={async () => {
                  const confirmAction = window.confirm(
                    "⚠️ Confirmation\n\nCe contact ne sera plus attribué à vous.\nVoulez-vous continuer ?"
                  );
                  if (!confirmAction) return;
          
                  try {
                    const { error } = await supabase
                      .from("membres_complets")
                      .update({ integration_fini: "fini", conseiller_id: null })
                      .eq("id", membre.id);
          
                    if (error) throw error;
          
                    setAllMembers(prev => prev.filter(mem => mem.id !== membre.id));
                    onClose();
          
                    showToast(
                      <span className="inline-block bg-white text-blue-600 px-2 py-1 rounded shadow text-xs font-semibold">
                        ✅ Intégration terminée. Contact détaché.
                      </span>
                    );
                  } catch (err) {
                    console.error("Erreur intégration :", err);
                    showToast("❌ Erreur lors de l'opération");
                  }
                }}
                className="text-blue-600 font-semibold text-sm"
              >
                ✅ Intégration terminée
              </button>
            )}
          
            {/* Supprimer le contact */}
            <button
              onClick={() => {
                if (
                  window.confirm(
                    "⚠️ Suppression définitive\n\n" +
                      "Voulez-vous vraiment supprimer ce contact ?\n\n" +
                      "Cette action supprimera également TOUT l’historique du contact (suivi, commentaires, transferts).\n" +
                      "Cette action est irréversible."
                  )
                ) {
                  onDelete(membre.id);
                  onClose();
                }
              }}
              className="text-red-500 font-semibold text-xs"
            >
              🗑️ Supprimer le contact
            </button>
          </div>        

            {editMember && (
              <EditMemberPopup
                member={editMember}
                onClose={() => {
                  setEditMember(null); // Ferme juste le popup EditMember
                  onClose();           // Ferme aussi DetailsMemberPopup
                }}
                onUpdateMember={(updatedMember) => {
                  setAllMembers(prev =>
                    prev.map(m => (m.id === updatedMember.id ? updatedMember : m))
                  );
            
                  setEditMember(null);
                  onClose(); // Ferme DetailsMemberPopup après la sauvegarde
            
                  showToast(
                    <span className="inline-block bg-white text-green-600 px-2 py-1 rounded shadow text-xs font-semibold">
                      ✅ Contact mis à jour !
                    </span>
                  );
                }}
              />
            )}
      </div>
    </div>
  );
}
