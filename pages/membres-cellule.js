"use client";

import { useEffect, useState, useRef } from "react";
import supabase from "../lib/supabaseClient";
import Image from "next/image";
import LogoutLink from "../components/LogoutLink";

export default function MembresCellule() {
  const [contacts, setContacts] = useState([]);
  const [cellules, setCellules] = useState([]);
  const [conseillers, setConseillers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("card");
  const [openPhoneMenuId, setOpenPhoneMenuId] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState({});
  const [checkedContacts, setCheckedContacts] = useState({});
  const [editMember, setEditMember] = useState(null);

  const phoneMenuRef = useRef(null);

  // Fermeture menu téléphone si clic en dehors
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (phoneMenuRef.current && !phoneMenuRef.current.contains(e.target)) {
        setOpenPhoneMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    // Simuler fetch des contacts, cellules, conseillers
    const fetchData = async () => {
      setLoading(true);
      try {
        // Ici mettre la logique supabase réelle
        // Exemple :
        // const { data: contactsData } = await supabase.from("membres_complets").select("*");
        // setContacts(contactsData);
        setContacts([]); // remplacer par données réelles
        setCellules([]);
        setConseillers([]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getBorderColor = (member) => {
    // Couleur dynamique en fonction du statut ou autre logique
    return "#2E3192";
  };

  const handleCheck = (id) => {
    setCheckedContacts(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (loading) {
    return <p className="text-white mt-10 text-center">Chargement...</p>;
  }

  return (
    <div className="min-h-screen p-6" style={{ background: "#2E3192" }}>
      {/* HEADER */}
      <div className="flex justify-between mb-4">
        <button onClick={() => window.history.back()} className="text-white">← Retour</button>
        <LogoutLink />
      </div>

      <Image src="/logo.png" width={80} height={80} alt="logo" className="mx-auto mb-4" />
      <h1 className="text-white text-2xl font-bold text-center mb-6">👥 Membres de mes cellules</h1>

      {/* Toggle Vue Carte / Table */}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-5xl mx-auto">
          {contacts.map((m) => {
            const isOpen = detailsOpen[m.id];
            return (
              <div
                key={m.id}
                className="bg-white rounded-2xl shadow-xl p-4 border-l-4 relative"
                style={{ borderLeftColor: getBorderColor(m) }}
              >
                {/* Nom */}
                <h2 className="font-bold text-center">{m.prenom} {m.nom}</h2>

                {/* Téléphone interactif */}
                <p
                  className="text-center text-sm text-orange-500 underline decoration-orange-400 cursor-pointer font-semibold mt-1"
                  onClick={() => setOpenPhoneMenuId(openPhoneMenuId === m.id ? null : m.id)}
                >
                  {m.telephone || "—"}
                </p>

                {openPhoneMenuId === m.id && (
                  <div
                    ref={phoneMenuRef}
                    className="phone-menu absolute mt-2 bg-white rounded-lg shadow-lg border z-50 w-52 left-1/2 -translate-x-1/2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <a href={m.telephone ? `tel:${m.telephone}` : "#"} className={`block px-4 py-2 text-sm text-black hover:bg-gray-100 ${!m.telephone ? "opacity-50 pointer-events-none" : ""}`}>📞 Appeler</a>
                    <a href={m.telephone ? `sms:${m.telephone}` : "#"} className={`block px-4 py-2 text-sm text-black hover:bg-gray-100 ${!m.telephone ? "opacity-50 pointer-events-none" : ""}`}>✉️ SMS</a>
                    <a href={m.telephone ? `https://wa.me/${m.telephone.replace(/\D/g,"")}?call` : "#"} target="_blank" rel="noopener noreferrer" className={`block px-4 py-2 text-sm text-black hover:bg-gray-100 ${!m.telephone ? "opacity-50 pointer-events-none" : ""}`}>📱 Appel WhatsApp</a>
                    <a href={m.telephone ? `https://wa.me/${m.telephone.replace(/\D/g,"")}` : "#"} target="_blank" rel="noopener noreferrer" className={`block px-4 py-2 text-sm text-black hover:bg-gray-100 ${!m.telephone ? "opacity-50 pointer-events-none" : ""}`}>💬 Message WhatsApp</a>
                  </div>
                )}

                {/* Infos principales */}
                <p className="text-center text-sm mt-2">🏙️ Ville : {m.ville || "—"}</p>
                <p className="text-left mt-2">🏠 Cellule : {m.cellule_id ? `${cellules.find(c => c.id === m.cellule_id)?.cellule_full || "—"}` : "—"}</p>
                <p className="text-left">👤 Conseiller : {m.conseiller_id ? `${conseillers.find(c => c.id === m.conseiller_id)?.prenom || ""} ${conseillers.find(c => c.id === m.conseiller_id)?.nom || ""}`.trim() : "—"}</p>

                {/* Bouton Détails */}
                <button
                  onClick={() => setDetailsOpen(prev => ({ ...prev, [m.id]: !prev[m.id] }))}
                  className="text-orange-500 underline text-sm block mx-auto mt-2"
                >
                  {isOpen ? "Fermer détails" : "Détails"}
                </button>

                {/* Infos étendues */}
                {isOpen && (
                  <div className="text-left text-sm mt-2 space-y-1">
                    <p>💬 WhatsApp : {m.is_whatsapp ? "Oui" : "Non"}</p>
                    <p>🎗️ Sexe : {m.sexe || "—"}</p>
                    <p>🙏 Prière du salut : {m.priere_salut ? "Oui" : "—"}</p>
                    <p>☀️ Type : {m.type_conversion || "—"}</p>
                    <p>❓ Besoin : {m.besoin || "—"}</p>
                    <p>📝 Infos : {m.infos_supplementaires || "—"}</p>
                    <p>🧩 Comment est-il venu : {m.venu || "—"}</p>
                    <p>✨ Raison de la venue : {m.statut_initial || "—"}</p>
                    <p>📝 Commentaire Suivis : {m.commentaire_suivis || "—"}</p>

                    <button
                      onClick={() => setEditMember(m)}
                      className="text-blue-600 text-sm mt-2 w-full text-center"
                    >
                      ✏️ Modifier le contact
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ================= VUE TABLE ================= */}
      {view === "table" && (
        <div className="w-full max-w-6xl overflow-x-auto py-2 mx-auto">
          <div className="min-w-[700px] space-y-2">
            {/* Header */}
            <div className="hidden sm:flex text-sm font-semibold uppercase text-white px-2 py-1 border-b border-gray-400 bg-transparent">
              <div className="flex-[2]">Nom complet</div>
              <div className="flex-[1]">Téléphone</div>
              <div className="flex-[1]">Ville</div>
              <div className="flex-[1] flex justify-center items-center">Sélectionner</div>
              <div className="flex-[1]">Action</div>
            </div>

            {contacts.map((m) => {
              const isOpen = detailsOpen[m.id];
              return (
                <div key={m.id} className="flex flex-col w-full">
                  <div
                    className="flex flex-row items-center px-2 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition duration-150 gap-2 border-l-4"
                    style={{ borderLeftColor: getBorderColor(m) }}
                  >
                    <div className="flex-[2] text-white">{m.prenom} {m.nom}</div>

                    {/* Téléphone interactif */}
                    <div className="flex-[1] text-white relative">
                      <p
                        className="text-sm text-orange-500 underline decoration-orange-400 cursor-pointer font-semibold"
                        onClick={() => setOpenPhoneMenuId(openPhoneMenuId === m.id ? null : m.id)}
                      >
                        {m.telephone || "—"}
                      </p>

                      {openPhoneMenuId === m.id && (
                        <div
                          ref={phoneMenuRef}
                          className="phone-menu absolute mt-2 bg-white rounded-lg shadow-lg border z-50 w-52 left-1/2 -translate-x-1/2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <a href={m.telephone ? `tel:${m.telephone}` : "#"} className={`block px-4 py-2 text-sm text-black hover:bg-gray-100 ${!m.telephone ? "opacity-50 pointer-events-none" : ""}`}>📞 Appeler</a>
                          <a href={m.telephone ? `sms:${m.telephone}` : "#"} className={`block px-4 py-2 text-sm text-black hover:bg-gray-100 ${!m.telephone ? "opacity-50 pointer-events-none" : ""}`}>✉️ SMS</a>
                          <a href={m.telephone ? `https://wa.me/${m.telephone.replace(/\D/g,"")}?call` : "#"} target="_blank" rel="noopener noreferrer" className={`block px-4 py-2 text-sm text-black hover:bg-gray-100 ${!m.telephone ? "opacity-50 pointer-events-none" : ""}`}>📱 Appel WhatsApp</a>
                          <a href={m.telephone ? `https://wa.me/${m.telephone.replace(/\D/g,"")}` : "#"} target="_blank" rel="noopener noreferrer" className={`block px-4 py-2 text-sm text-black hover:bg-gray-100 ${!m.telephone ? "opacity-50 pointer-events-none" : ""}`}>💬 Message WhatsApp</a>
                        </div>
                      )}
                    </div>

                    <div className="flex-[1] text-white">{m.ville || "—"}</div>
                    <div className="flex-[1] flex justify-center items-center">
                      <input type="checkbox" checked={checkedContacts[m.id] || false} onChange={() => handleCheck(m.id)} />
                    </div>
                    <div className="flex-[1]">
                      <button
                        onClick={() => setDetailsOpen(prev => ({ ...prev, [m.id]: !prev[m.id] }))}
                        className="text-orange-500 underline text-sm"
                      >
                        {isOpen ? "Fermer détails" : "Détails"}
                      </button>
                    </div>
                  </div>

                  {isOpen && (
                    <div className="bg-white/20 px-4 py-2 text-left text-sm space-y-1 rounded-b-lg border-l-4" style={{ borderLeftColor: getBorderColor(m) }}>
                      <p>💬 WhatsApp : {m.is_whatsapp ? "Oui" : "Non"}</p>
                      <p>🎗️ Sexe : {m.sexe || "—"}</p>
                      <p>🙏 Prière du salut : {m.priere_salut ? "Oui" : "—"}</p>
                      <p>☀️ Type : {m.type_conversion || "—"}</p>
                      <p>❓ Besoin : {m.besoin || "—"}</p>
                      <p>📝 Infos : {m.infos_supplementaires || "—"}</p>
                      <p>🧩 Comment est-il venu : {m.venu || "—"}</p>
                      <p>✨ Raison de la venue : {m.statut_initial || "—"}</p>
                      <p>📝 Commentaire Suivis : {m.commentaire_suivis || "—"}</p>

                      <button
                        onClick={() => setEditMember(m)}
                        className="text-blue-600 text-sm mt-2 w-full text-center"
                      >
                        ✏️ Modifier le contact
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
