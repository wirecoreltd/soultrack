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
import ProtectedRoute from "../components/ProtectedRoute";

export default function SuivisMembres() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur", "ResponsableIntegration"]}>
      <SuivisMembresContent />
    </ProtectedRoute>
  );
}

  function SuivisMembresContent() {
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

  const statutIds = { envoye: 1, "En Suivis": 2, integrer: 3, refus: 4 };
  const statutLabels = { 1: "En Suivis", 2: "En Suivis", 3: "Intégrer", 4: "Refus" };

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

      let query = supabase.from("membres_complets").select("*");

      if (profileData.role === "Conseiller") {
        query = query.eq("conseiller_id", profileData.id);
      } else if (profileData.role === "ResponsableCellule") {
        const { data: cellulesData } = await supabase
          .from("cellules")
          .select("id")
          .eq("responsable_id", profileData.id);
        const celluleIds = cellulesData?.map(c => c.id) || [];
        if (celluleIds.length > 0) query = query.in("cellule_id", celluleIds);
        else query = query.eq("id", -1); // pas de cellule → aucun membre
      }

      // ⚠️ Toujours mettre l'ordre après avoir construit query
      query = query.order("created_at", { ascending: false });

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

  fetchMembresComplets();
  // fetchCellulesConseillers(); // <-- supprimer ou définir avant
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
  
  const uniqueMembers = members;

  const DetailsPopup = ({ m }) => {
    const commentRef = useRef(null);

    useEffect(() => {
      if (commentRef.current) {
        commentRef.current.focus();
        commentRef.current.selectionStart = commentRef.current.value.length;
      }
    }, [commentChanges[m.id]]);

    const uniqueMembersFiltered = uniqueMembers.filter(m => showRefus ? m.statut_suivis === 4 : true);

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

return (
      <div className="text-black text-sm space-y-2 w-full">
        <p>📅 {m.sexe === "Femme" ? "Arrivée" : "Arrivé"} le : {formatDateFr(m.created_at)}</p> 
        <p>💬 WhatsApp : {m.is_whatsapp ? "Oui" : "Non"}</p>
        <p>🎗️ Sexe : {m.sexe || ""}</p>
        <p>💧 Baptême d'Eau : {m.bapteme_eau || ""}</p>
        <p>🔥 Baptême de Feu : {m.bapteme_esprit || ""}</p>        
        <p>✒️ Formation : {m.Formation || "—"}</p>  
        <p>❤️‍🩹 Soin Pastoral : {m.Soin_Pastoral || ""}</p>      
        <p>❓ Besoin : {formatArrayField(m.besoin)}</p>
        <p>📝 Infos : {m.infos_supplementaires || ""}</p>
        <p>🧩 Comment est-il venu : {m.venu || ""}</p>
        <p>✨ Raison de la venue : {m.statut_initial ?? m.statut ?? ""}</p>
        <p>🙏 Prière du salut : {m.priere_salut || ""}</p>
        <p>☀️ Type de conversion : {m.type_conversion || ""}</p>

        {!showRefus && (
          <div className="mt-4 rounded-xl w-full shadow-md p-4 bg-white">
            <button
              onClick={() => setEditMember(m)}
              className="w-full py-2 rounded-md bg-white text-orange-500 shadow-md"
            >
              ✏️ Modifier le contact
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-6" style={{ background: "#333699" }}>

      {/* Header avec logo et infos */}
      <HeaderPages />

      {/* Title */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Suivis des Membres</h1>
        <p className="text-white text-lg max-w-xl mx-auto italic">Chaque personne a une valeur infinie. Ensemble, nous avançons ❤️</p>
      </div>

      {/* View & Filter Buttons */}
      <div className="mb-4 flex justify-between w-full max-w-6xl">
        <button onClick={() => setView(view === "card" ? "table" : "card")} className="text-white text-sm underline hover:text-black-200">{view === "card" ? "Vue Table" : "Vue Carte"}</button>
        <button onClick={() => setShowRefus(prev => !prev)} className="text-orange-400 text-sm underline hover:text-orange-500">{showRefus ? "Voir tous les suivis" : "Voir les refus"}</button>
      </div>

      {message && <div className={`mb-4 px-4 py-2 rounded-md text-sm ${message.type === "error" ? "bg-red-200 text-red-800" : message.type === "success" ? "bg-green-200 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>{message.text}</div>}

      {/* Cards View */}
        {view === "card" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-6xl justify-items-center">
            {uniqueMembers.map((m) => (
              <div
                key={m.id}
                className="bg-white rounded-2xl shadow-lg w-full transition-all duration-300 hover:shadow-2xl p-4 border-l-4"
                style={{ borderLeftColor: getBorderColor(m) }}
              >
                <div className="flex flex-col items-center">
                  <h2 className="font-bold text-black text-base text-center mb-1">
                    {m.prenom} {m.nom}
                  </h2>
        
                  {/* 📞 Téléphone */}
                    {m.telephone && (
                      <div className="relative inline-block mt-1">
                        <p
                          className="text-orange-500 underline font-semibold cursor-pointer text-center"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenPhoneMenuId(openPhoneMenuId === m.id ? null : m.id);
                          }}
                        >
                          {m.telephone}
                        </p>
                    
                        {openPhoneMenuId === m.id && (
                          <div
                            ref={phoneMenuRef}
                            className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-white rounded-lg shadow-lg border z-50 w-52 text-center"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <a href={`tel:${m.telephone}`} className="block px-4 py-2 hover:bg-gray-100 text-black">
                              📞 Appeler
                            </a>
                            <a href={`sms:${m.telephone}`} className="block px-4 py-2 hover:bg-gray-100 text-black">
                              ✉️ SMS
                            </a>
                            <a
                              href={`https://wa.me/${m.telephone.replace(/\D/g, "")}?call`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block px-4 py-2 hover:bg-gray-100 text-black"
                            >
                              📱 Appel WhatsApp
                            </a>
                            <a
                              href={`https://wa.me/${m.telephone.replace(/\D/g, "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block px-4 py-2 hover:bg-gray-100 text-black"
                            >
                              💬 Message WhatsApp
                            </a>
                          </div>
                        )}
                      </div>
                    )}
        
                  <p className="text-sm text-black-700 mb-1">
                    🏠 Cellule : {m.cellule_id ? (cellules.find(c => c.id === m.cellule_id)?.cellule_full || "—") : "—"}
                  </p>
                  <p className="text-sm text-black-700 mb-1">
                    👤 Conseiller : {m.conseiller_id ? `${conseillers.find(c => c.id === m.conseiller_id)?.prenom || ""} ${conseillers.find(c => c.id === m.conseiller_id)?.nom || ""}`.trim() : "—"}
                  </p>
                    
                  <p className="self-end text-[11px] text-gray-400 mt-3">Créé le {formatDateFr(m.date_premiere_visite)}</p>
        
                  {/* Commentaire & Statut */}
                  <div className="flex flex-col w-full mt-2">
                    <label className="font-semibold text-blue-700 mb-1 mt-2 text-center">Commentaire Suivis</label>
        
                    {showRefus ? (
                      <textarea
                        value={m.commentaire_suivis ?? ""}
                        readOnly
                        className="w-full border rounded-lg p-2 bg-gray-100 text-gray-600 cursor-not-allowed"
                        rows={2}
                      />
                    ) : (
                      <textarea
                        value={commentChanges[m.id] ?? m.commentaire_suivis ?? ""}
                        onChange={(e) => handleCommentChange(m.id, e.target.value)}
                        className="w-full border rounded-lg p-2"
                        rows={2}
                      />
                    )}
        
                    <label className="font-semibold mb-1 text-center mt-2">Statut Intégration</label>
        
                    {showRefus ? (
                      <select
                        value="4"
                        disabled
                        className="w-full border rounded-lg p-2 text-red-600 bg-gray-100 cursor-not-allowed"
                      >
                        <option value="4">Refus</option>
                      </select>
                    ) : (
                      <select
                        value={statusChanges[m.id] ?? String(m.statut_suivis ?? "")}
                        onChange={(e) => setStatusChanges(prev => ({ ...prev, [m.id]: e.target.value }))}
                        className="w-full border rounded-lg p-2 mb-2"
                      >
                        <option value="">-- Sélectionner un statut --</option>
                        <option value="2">En Suivis</option>
                        <option value="3">Intégrer</option>
                        <option value="4">Refus</option>
                      </select>
                    )}
        
                    {showRefus ? (
                      <button
                        onClick={() => reactivateMember(m.id)}
                        disabled={updating[m.id]}
                        className={`mt-2 py-1 rounded w-full transition ${updating[m.id] ? "bg-gray-400 cursor-not-allowed" : "bg-green-500 hover:bg-green-600 text-white"}`}
                      >
                        {updating[m.id] ? "Réactivation..." : "Réactiver"}
                      </button>
                    ) : (
                      <button
                        onClick={() => updateSuivi(m.id)}
                        disabled={updating[m.id]}
                        className={`mt-2 py-1 rounded w-full transition ${updating[m.id] ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600 text-white"}`}
                      >
                        {updating[m.id] ? "Enregistrement..." : "Sauvegarder"}
                      </button>
                    )}
                  </div>       
                    
                  {/* Bouton Détails */}
                  <button
                    onClick={() => toggleDetails(m.id)}
                    className="text-orange-500 underline text-sm mt-2"
                  >
                    {detailsOpen === m.id ? "Fermer détails" : "Détails"}
                  </button>
                </div>
        
                {/* Contenu Détails */}
                <div className={`transition-all duration-500 overflow-hidden ${detailsOpen === m.id ? "max-h-[1000px] mt-3" : "max-h-0"}`}>
                  {detailsOpen === m.id && <div className="pt-2"><DetailsPopup m={m} /></div>}
                </div>
              </div>
            ))}
          </div>
        )}

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
           cellules={cellules}
          conseillers={conseillers}
          onClose={() => setDetailsSuivisPopupMember(null)}
          handleCommentChange={handleCommentChange}
          handleStatusChange={(id, value) =>
            setStatusChanges(prev => ({ ...prev, [id]: value }))
          }
          commentChanges={commentChanges}
          statusChanges={statusChanges}
          updating={updating}
          updateSuivi={updateSuivi}
          reactivateMember={reactivateMember}
          showRefus={showRefus}
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

