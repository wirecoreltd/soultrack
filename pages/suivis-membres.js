"use client";

import { useEffect, useState, useRef } from "react";
import React from "react";
import supabase from "../lib/supabaseClient";
import Image from "next/image";
import LogoutLink from "../components/LogoutLink";
import EditMemberSuivisPopup from "../components/EditMemberSuivisPopup";
import DetailsSuivisPopup from "../components/DetailsSuivisPopup";
import { useMembers } from "../context/MembersContext";
import { useRouter } from "next/navigation";
import HeaderPages from "../components/HeaderPages";

export default function SuivisMembres() {
  const router = useRouter();
  const { members, setAllMembers, updateMember } = useMembers();

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [prenom, setPrenom] = useState("");
  const [role, setRole] = useState([]);
  const [DetailsSuivisPopupMember, setDetailsSuivisPopupMember] = useState(null);
  const [statusChanges, setStatusChanges] = useState({});
  const [commentChanges, setCommentChanges] = useState({});
  const [updating, setUpdating] = useState({});  
  const [editMember, setEditMember] = useState(null);
  const [showRefus, setShowRefus] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(null);
  const [cellules, setCellules] = useState([]);
  const [conseillers, setConseillers] = useState([]);
  const [openPhoneMenuId, setOpenPhoneMenuId] = useState(null);
  const phoneMenuRef = useRef(null);

    const [view, setView] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("members_view") || "card";
    }
    return "card";
  });
  
  const toggleDetails = (id) =>
    setDetailsOpen((prev) => (prev === id ? null : id));

  const statutIds = { envoye: 1, "en attente": 2, integrer: 3, refus: 4 };
  const statutLabels = { 1: "Envoyé", 2: "En attente", 3: "Intégrer", 4: "Refus" };

  useEffect(() => {localStorage.setItem("members_view", view);}, [view]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (phoneMenuRef.current && !phoneMenuRef.current.contains(event.target)) {
        setOpenPhoneMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchMembresComplets = async () => {
      setLoading(true);
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) throw new Error("Utilisateur non connecté");

        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("id, prenom, nom, role")
          .eq("id", user.id)
          .single();
        if (profileError || !profileData) throw profileError;

        setPrenom(profileData.prenom || "cher membre");
        setRole(profileData.role);

        let query = supabase.from("membres_complets").select("*").order("created_at", { ascending: false });

        if (profileData.role === "Conseiller") {
          query = query.eq("conseiller_id", profileData.id);
        } else if (profileData.role === "ResponsableCellule") {
          const { data: cellulesData } = await supabase.from("cellules").select("id").eq("responsable_id", profileData.id);
          const celluleIds = cellulesData?.map(c => c.id) || [];
          if (celluleIds.length > 0) query = query.in("cellule_id", celluleIds);
          else query = query.eq("id", -1);
        }

        const { data, error } = await query;
        if (error) throw error;

        setAllMembers(data || []);
        if (!data || data.length === 0) setMessage("Aucun membre à afficher.");
      } catch (err) {
        console.error("❌ Erreur fetchMembresComplets:", err);
        setMessage("Erreur lors de la récupération des membres.");
      } finally {
        setLoading(false);
      }
    };

    const fetchCellulesConseillers = async () => {
      try {
        const { data: cellulesData } = await supabase.from("cellules").select("id, cellule_full");
        const { data: conseillersData } = await supabase.from("profiles").select("id, prenom, nom").eq("role", "Conseiller");
        setCellules(cellulesData || []);
        setConseillers(conseillersData || []);
      } catch (err) {
        console.error("Erreur chargement cellules/conseillers :", err);
      }
    };

    fetchMembresComplets();
    fetchCellulesConseillers();
  }, [setAllMembers]);

  const handleCommentChange = (id, value) => {
    setCommentChanges(prev => ({ ...prev, [id]: value }));
    const member = members.find(m => m.id === id);
    if (member) updateMember(id, { ...member, commentaire_suivis: value });
  };

  const getBorderColor = (m) => {
    if (!m) return "#ccc";
    const status = m.statut_suivis ?? m.suivi_statut;
    if (status === 2) return "#FFA500";
    if (status === 3) return "#34A853";
    if (status === 4) return "#FF4B5C";
    if (status === 1) return "#3B82F6";
    return "#ccc";
  };


  // 🔹 Mettre à jour statut/commentaire
  const updateSuivi = async (id) => {
    const newComment = commentChanges[id];
    const newStatus = statusChanges[id];
    if (newComment === undefined && newStatus === undefined) return;

    setUpdating(prev => ({ ...prev, [id]: true }));

    try {
      const payload = { updated_at: new Date() };
      if (newComment !== undefined) payload.commentaire_suivis = newComment;
      if (newStatus !== undefined) payload.statut_suivis = Number(newStatus);

      const { data: updatedMember, error } = await supabase
        .from("membres_complets")
        .update(payload)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      setAllMembers(prev => prev.map(m => m.id === id ? updatedMember : m));
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(prev => ({ ...prev, [id]: false }));
    }
  };

  const reactivateMember = async (id) => {
    setUpdating(prev => ({ ...prev, [id]: true }));
    try {
      const { data: updatedMember, error } = await supabase
        .from("membres_complets")
        .update({ statut_suivis: 2, updated_at: new Date() })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      setAllMembers(prev => prev.map(m => m.id === id ? updatedMember : m));
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(prev => ({ ...prev, [id]: false }));
    }
  };

  const formatDateFr = (dateString) => {
  if (!dateString) return "—";
  const d = new Date(dateString);

  const day = d.getDate().toString().padStart(2, "0");
  const months = ["Janv", "Févr", "Mars", "Avr", "Mai", "Juin", "Juil", "Août", "Sept", "Oct", "Nov", "Déc"];

  return `${day} ${months[d.getMonth()]} ${d.getFullYear()}`;
};

  const formatOuiNon = (value) => {
  if (value === true || value === "Oui") return "Oui";
  if (value === false || value === "Non") return "Non";
  return "Non"; // par défaut
};

  const filteredMembers = members.filter(m => {
    const status = m.statut_suivis ?? 0;
    if (showRefus) return status === 4;
    return status === 1 || status === 2;
  });
  
  const uniqueMembers = Array.from(new Map(filteredMembers.map(i => [i.id, i])).values());

  const DetailsPopup = ({ m }) => {
    const commentRef = useRef(null);

    useEffect(() => {
      if (commentRef.current) {
        commentRef.current.focus();
        commentRef.current.selectionStart = commentRef.current.value.length;
      }
    }, [commentChanges[m.id]]);

    //  HELPERS  //
    const formatMinistere = (ministere) => {
      if (!ministere) return "—";
      try {
        const parsed = typeof ministere === "string" ? JSON.parse(ministere) : ministere;
        return Array.isArray(parsed) ? parsed.join(", ") : parsed;
      } catch {
        return "—";
      }
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

      const renderMemberCard = (m) => {
        const isOpen = detailsOpen[m.id];
      
        return (
          <div
            key={m.id}
            className="bg-white rounded-2xl shadow-md w-full p-4 border-l-4 transition-all duration-300 hover:shadow-xl"
            style={{ borderLeftColor: getBorderColor(m) }}
          >
            <div className="flex flex-col items-center text-black text-sm space-y-2 w-full">
      
              {/* Nom */}
              <h2 className="font-bold text-base text-center mb-1">
                {m.prenom} {m.nom}
              </h2>
      
              {/* Téléphone */}
              <p
                className="text-orange-500 underline font-semibold mb-1 cursor-pointer"
                onClick={() => setOpenPhoneMenuId(openPhoneMenuId === m.id ? null : m.id)}
              >
                {m.telephone || "—"}
              </p>
              {openPhoneMenuId === m.id && (
                <div
                  ref={phoneMenuRef}
                  className="absolute mt-2 bg-white rounded-lg shadow-lg border z-50 w-52"
                  onClick={(e) => e.stopPropagation()}
                >
                  <a href={m.telephone ? `tel:${m.telephone}` : "#"} className={`block px-4 py-2 text-sm text-black hover:bg-gray-100 ${!m.telephone ? "opacity-50 pointer-events-none" : ""}`}>📞 Appeler</a>
                  <a href={m.telephone ? `sms:${m.telephone}` : "#"} className={`block px-4 py-2 text-sm text-black hover:bg-gray-100 ${!m.telephone ? "opacity-50 pointer-events-none" : ""}`}>✉️ SMS</a>
                  <a href={m.telephone ? `https://wa.me/${m.telephone.replace(/\D/g, "")}?call` : "#"} target="_blank" rel="noopener noreferrer" className={`block px-4 py-2 text-sm text-black hover:bg-gray-100 ${!m.telephone ? "opacity-50 pointer-events-none" : ""}`}>📱 Appel WhatsApp</a>
                  <a href={m.telephone ? `https://wa.me/${m.telephone.replace(/\D/g, "")}` : "#"} target="_blank" rel="noopener noreferrer" className={`block px-4 py-2 text-sm text-black hover:bg-gray-100 ${!m.telephone ? "opacity-50 pointer-events-none" : ""}`}>💬 Message WhatsApp</a>
                </div>
              )}
      
              {/* Cellule & Conseiller */}
              <p className="text-sm text-black-700 mb-1">
                🏠 Cellule : {m.cellule_id ? (cellules.find(c => c.id === m.cellule_id)?.cellule_full || "—") : "—"}
              </p>
              <p className="text-sm text-black-700 mb-1">
                👤 Conseiller : {m.conseiller_id ? `${conseillers.find(c => c.id === m.conseiller_id)?.prenom || ""} ${conseillers.find(c => c.id === m.conseiller_id)?.nom || ""}`.trim() : "—"}
              </p>
      
              {/* Date création */}
              <p className="self-end text-[11px] text-gray-400 mt-1">
                Créé le {formatDateFr(m.created_at)}
              </p>
      
              {/* Bloc infos détaillées */}
              <div className="bg-gray-50 rounded-xl shadow-sm w-full p-3 mt-2 text-black text-sm space-y-1">
                <p>📅 {m.sexe === "Femme" ? "Arrivée" : "Arrivé"} le : {formatDateFr(m.created_at)}</p>
                <p>💬 WhatsApp : {m.is_whatsapp ? "Oui" : "Non"}</p>
                <p>🎗️ Sexe : {m.sexe || "—"}</p>
                <p>💧 Baptême d'Eau : {m.bapteme_eau || "—"}</p>
                <p>🔥 Baptême de Feu : {m.bapteme_esprit || "—"}</p>
                <p>✒️ Formation : {m.Formation || "—"}</p>
                <p>❤️‍🩹 Soin Pastoral : {m.Soin_Pastoral || "—"}</p>
                <p>❓ Besoin : {formatArrayField(m.besoin)}</p>
                <p>📝 Infos : {m.infos_supplementaires || "—"}</p>
                <p>🧩 Comment est-il venu : {m.venu || "—"}</p>
                <p>✨ Raison de la venue : {m.statut_initial ?? m.statut ?? "—"}</p>
                <p>🙏 Prière du salut : {m.priere_salut || "—"}</p>
                <p>☀️ Type de conversion : {m.type_conversion || "—"}</p>
      
                {/* Bouton Modifier */}
                {!showRefus && (
                  <button
                    onClick={() => setEditMember(m)}
                    className="w-full py-2 mt-2 rounded-lg bg-white text-orange-500 font-semibold shadow-sm hover:shadow-md transition-all"
                  >
                    ✏️ Modifier le contact
                  </button>
                )}
              </div>
      
              {/* Détails */}
              <button
                onClick={() => toggleDetails(m.id)}
                className="text-orange-500 underline text-sm mt-3"
              >
                {isOpen ? "Fermer détails" : "Détails"}
              </button>
              <div className={`transition-all duration-500 overflow-hidden ${isOpen ? "max-h-[1000px] mt-3" : "max-h-0"}`}>
                {isOpen && <div className="pt-2"><DetailsPopup m={m} /></div>}
              </div>
      
            </div>
          </div>
        );
      };


      {/* Table View */}
      {view === "table" && (
        <div className="w-full max-w-6xl overflow-x-auto py-2">
          <div className="min-w-[700px] space-y-2">
            <div className="hidden sm:flex text-sm font-semibold uppercase text-white px-2 py-1 border-b border-gray-400 bg-transparent">
              <div className="flex-[2]">Nom complet</div>
              <div className="flex-[1]">Téléphone</div>
              <div className="flex-[1]">Statut Suivis</div>
              <div className="flex-[2]">Attribué à</div>
              <div className="flex-[1]">Actions</div>
            </div>

            {uniqueMembers.length === 0 && <div className="px-2 py-2 text-white text-center bg-gray-600 rounded">Aucun membre en suivi</div>}

            {uniqueMembers.map(m => {
              const attribue = m.conseiller_id
                ? `👤 ${conseillers.find(c => c.id === m.conseiller_id)?.prenom || ""} ${conseillers.find(c => c.id === m.conseiller_id)?.nom || ""}`.trim()
                : m.cellule_id
                ? `🏠 ${cellules.find(c => c.id === m.cellule_id)?.cellule_full || ""}`
                : "—";

              return (
                <div key={m.id} className="flex flex-row items-center px-2 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition duration-150 gap-2 border-l-4" style={{ borderLeftColor: getBorderColor(m) }}>
                  <div className="flex-[2] text-white flex items-center gap-1">{m.prenom} {m.nom}</div>
                  <div className="flex-[1] text-white">{m.telephone || "—"}</div>
                  <div className="flex-[1] text-white">{statutLabels[m.statut_suivis ?? m.suivi_statut] || "—"}</div>
                  <div className="flex-[2] text-white">{attribue}</div>
                  <div className="flex-[1]">
                    <button onClick={() => setDetailsSuivisPopupMember(m)} className="text-orange-500 underline text-sm whitespace-nowrap">Détails</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {DetailsSuivisPopupMember && (
  <DetailsSuivisPopup
    m={DetailsSuivisPopupMember}
    onClose={() => setDetailsSuivisPopupMember(null)}
    handleCommentChange={handleCommentChange}
    handleStatusChange={(id, value) =>
      setStatusChanges(prev => ({ ...prev, [id]: value }))
    }
    commentChanges={commentChanges}
    statusChanges={statusChanges}
    updating={updating}
    updateSuivi={updateSuivi}      // ✅ AJOUT
    reactivateMember={reactivateMember}
    showRefus={showRefus}          // ✅
  />
)}


      {/* Edit Member Popup */}
      {editMember && (
        <EditMemberSuivisPopup
          member={editMember}
          cellules={cellules}
          conseillers={conseillers}
          onClose={() => setEditMember(null)}
          onUpdateMember={updateMember}
        />
      )}
    </div>
  );
}

