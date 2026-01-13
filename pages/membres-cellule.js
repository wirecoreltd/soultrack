"use client";

import { useEffect, useState, useRef } from "react";
import supabase from "../lib/supabaseClient";
import Image from "next/image";
import LogoutLink from "../components/LogoutLink";
import EditMemberPopup from "../components/EditMemberPopup";

export default function MembresCellule() {
  const [contacts, setContacts] = useState([]);
  const [cellules, setCellules] = useState([]);
  const [conseillers, setConseillers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("card");

  const [openPhoneMenuId, setOpenPhoneMenuId] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState({});
  const [checkedContacts, setCheckedContacts] = useState({});
  const [popupMember, setPopupMember] = useState(null);
  const [editMember, setEditMember] = useState(null);

  const phoneMenuRef = useRef(null);

  useEffect(() => {
    // Fermer le menu téléphone si clic en dehors
    const handleClickOutside = (event) => {
      if (phoneMenuRef.current && !phoneMenuRef.current.contains(event.target)) {
        setOpenPhoneMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getBorderColor = (member) => member.statut === "nouveau" ? "#FFB400" : "#2E3192";

  const getCelluleNom = (celluleId) => {
    const c = cellules.find(c => c.id === celluleId);
    return c?.cellule_full || "—";
  };

  const handleCheck = (id) => {
    setCheckedContacts(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // ======== FETCH MEMBRES ========
  useEffect(() => {
    const fetchMembres = async () => {
      setLoading(true);
      try {
        const { data: membresData } = await supabase.from("membres_complets").select("*");
        setContacts(membresData || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMembres();
  }, []);

  if (loading) return <p className="text-white mt-10 text-center">Chargement...</p>;

  return (
    <div className="min-h-screen flex flex-col items-center p-4 sm:p-6" style={{ background: "#2E3192" }}>
      {/* Top Bar */}
      <div className="w-full max-w-5xl flex justify-between items-center mb-2">
        <button onClick={() => window.history.back()} className="flex items-center text-white hover:text-black/20">← Retour</button>
        <LogoutLink className="bg-white/10 text-white px-3 py-1 rounded-lg hover:bg-white/20 text-sm" />
      </div>

      <Image src="/logo.png" alt="Logo" width={80} height={80} className="mx-auto mb-2" />
      <h1 className="text-2xl sm:text-3xl font-bold text-white text-center mb-4">Liste des Membres</h1>

      {/* Toggle Vue Carte / Vue Table */}
      <div className="w-full max-w-6xl flex justify-center gap-4 mb-4">
        <button
          onClick={() => setView(view === "card" ? "table" : "card")}
          className="text-sm font-semibold underline text-white"
        >
          {view === "card" ? "Vue Table" : "Vue Carte"}
        </button>
      </div>

      {/* ================= VUE CARTE ================= */}
      {view === "card" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-5xl justify-items-center">
          {contacts.map((member) => (
            <div key={member.id} className="bg-white rounded-2xl shadow-xl p-4 border-l-4 relative w-full max-w-xs" style={{ borderLeftColor: getBorderColor(member) }}>
              <h2 className="font-bold text-center">{member.prenom} {member.nom}</h2>

              {/* Téléphone interactif */}
              <p 
                className="text-center text-sm text-orange-500 underline decoration-orange-400 cursor-pointer font-semibold mt-1"
                onClick={() => setOpenPhoneMenuId(openPhoneMenuId === member.id ? null : member.id)}
              >
                {member.telephone || "—"}
              </p>
              {openPhoneMenuId === member.id && (
                <div ref={phoneMenuRef} className="phone-menu absolute mt-2 bg-white rounded-lg shadow-lg border z-50 w-52 left-1/2 -translate-x-1/2">
                  <a href={member.telephone ? `tel:${member.telephone}` : "#"} className={`block px-4 py-2 text-sm hover:bg-gray-100`}>📞 Appeler</a>
                  <a href={member.telephone ? `sms:${member.telephone}` : "#"} className="block px-4 py-2 text-sm hover:bg-gray-100">✉️ SMS</a>
                  <a href={member.telephone ? `https://wa.me/${member.telephone.replace(/\D/g,"")}?call` : "#"} target="_blank" rel="noopener noreferrer" className="block px-4 py-2 text-sm hover:bg-gray-100">📱 Appel WhatsApp</a>
                  <a href={member.telephone ? `https://wa.me/${member.telephone.replace(/\D/g,"")}` : "#"} target="_blank" rel="noopener noreferrer" className="block px-4 py-2 text-sm hover:bg-gray-100">💬 Message WhatsApp</a>
                </div>
              )}

              <p className="text-center text-sm mt-2">🏙️ Ville : {member.ville || "—"}</p>
              <p className="text-left mt-2">🏠 Cellule : {getCelluleNom(member.cellule_id)}</p>
              <p className="text-left">👤 Conseiller : {member.conseiller_id ? `${conseillers.find(c => c.id === member.conseiller_id)?.prenom || ""} ${conseillers.find(c => c.id === member.conseiller_id)?.nom || ""}` : "—"}</p>

              {/* Bouton détails */}
              <button 
                onClick={() => setDetailsOpen(prev => ({ ...prev, [member.id]: !prev[member.id] }))} 
                className="text-orange-500 underline text-sm block mx-auto mt-2"
              >
                {detailsOpen[member.id] ? "Fermer détails" : "Détails"}
              </button>

              {detailsOpen[member.id] && (
                <div className="text-left text-sm mt-3 space-y-1">
                  <p>💬 WhatsApp : {member.is_whatsapp ? "Oui" : "Non"}</p>
                  <p>🎗️ Sexe : {member.sexe || "—"}</p>
                  <p>🙏 Prière du salut : {member.priere_salut ? "Oui" : "—"}</p>
                  <p>☀️ Type : {member.type_conversion || "—"}</p>
                  <p>❓ Besoin : {member.besoin || "—"}</p>
                  <p>📝 Infos supplémentaires : {member.infos_supplementaires || "—"}</p>
                  <p>🧩 Comment est-il venu : {member.venu || "—"}</p>
                  <p>✨ Raison de la venue : {member.statut_initial || "—"}</p>
                  <p>📝 Commentaire Suivis : {member.commentaire_suivis || "—"}</p>
                  <button onClick={() => setEditMember(member)} className="mt-4 w-full text-center bg-orange-500 text-white py-2 rounded-lg">
                    ✏️ Modifier le contact
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ================= VUE TABLE / POPUP ================= */}
      {view === "table" && popupMember && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full relative">
            <button 
              onClick={() => setPopupMember(null)} 
              className="absolute top-3 right-3 text-gray-500 hover:text-black"
            >
              ✖
            </button>

            <h2 className="text-lg font-bold text-center mb-4">{popupMember.prenom} {popupMember.nom}</h2>
            <p 
              className="text-center text-sm text-orange-500 underline cursor-pointer mb-2"
              onClick={() => setOpenPhoneMenuId(popupMember.id)}
            >
              {popupMember.telephone || "—"}
            </p>
            {openPhoneMenuId === popupMember.id && (
              <div ref={phoneMenuRef} className="phone-menu absolute mt-2 bg-white rounded-lg shadow-lg border z-50 w-52 left-1/2 -translate-x-1/2">
                <a href={popupMember.telephone ? `tel:${popupMember.telephone}` : "#"} className={`block px-4 py-2 text-sm hover:bg-gray-100`}>📞 Appeler</a>
                <a href={popupMember.telephone ? `sms:${popupMember.telephone}` : "#"} className="block px-4 py-2 text-sm hover:bg-gray-100">✉️ SMS</a>
                <a href={popupMember.telephone ? `https://wa.me/${popupMember.telephone.replace(/\D/g,"")}?call` : "#"} target="_blank" rel="noopener noreferrer" className="block px-4 py-2 text-sm hover:bg-gray-100">📱 Appel WhatsApp</a>
                <a href={popupMember.telephone ? `https://wa.me/${popupMember.telephone.replace(/\D/g,"")}` : "#"} target="_blank" rel="noopener noreferrer" className="block px-4 py-2 text-sm hover:bg-gray-100">💬 Message WhatsApp</a>
              </div>
            )}

            <div className="text-left mt-2 space-y-2 text-sm text-black">
              <p>🏙️ Ville : {popupMember.ville || "—"}</p>
              <p>🏠 Cellule : {getCelluleNom(popupMember.cellule_id)}</p>
              <p>👤 Conseiller : {popupMember.conseiller_id ? `${conseillers.find(c => c.id === popupMember.conseiller_id)?.prenom || ""} ${conseillers.find(c => c.id === popupMember.conseiller_id)?.nom || ""}` : "—"}</p>
              <p>💬 WhatsApp : {popupMember.is_whatsapp ? "Oui" : "Non"}</p>
              <p>🎗️ Sexe : {popupMember.sexe || "—"}</p>
              <p>🙏 Prière du salut : {popupMember.priere_salut ? "Oui" : "—"}</p>
              <p>☀️ Type : {popupMember.type_conversion || "—"}</p>
              <p>❓ Besoin : {popupMember.besoin || "—"}</p>
              <p>📝 Infos supplémentaires : {popupMember.infos_supplementaires || "—"}</p>
              <p>🧩 Comment est-il venu : {popupMember.venu || "—"}</p>
              <p>✨ Raison de la venue : {popupMember.statut_initial || "—"}</p>
              <p>📝 Commentaire Suivis : {popupMember.commentaire_suivis || "—"}</p>
              <button onClick={() => setEditMember(popupMember)} className="mt-4 w-full text-center bg-orange-500 text-white py-2 rounded-lg">
                ✏️ Modifier le contact
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POPUP EDIT */}
      {editMember && (
        <EditMemberPopup
          member={editMember}
          onClose={() => setEditMember(null)}
          onUpdateMember={(updated) => setContacts(prev => prev.map(m => m.id === updated.id ? updated : m))}
        />
      )}
    </div>
  );
}
