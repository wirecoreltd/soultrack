        "use client";

import { useEffect, useState, useRef } from "react";
import React from "react";
import supabase from "../lib/supabaseClient";
import Image from "next/image";
import LogoutLink from "../components/LogoutLink";
import EditMemberSuivisPopup from "../components/EditMemberSuivisPopup";
import DetailsModal from "../components/DetailsModal";
import { useMembers } from "../context/MembersContext";

export default function SuivisMembres() {
  const { members, setAllMembers, updateMember } = useMembers();

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [prenom, setPrenom] = useState("");
  const [role, setRole] = useState([]);
  const [detailsModalMember, setDetailsModalMember] = useState(null);
  const [statusChanges, setStatusChanges] = useState({});
  const [commentChanges, setCommentChanges] = useState({});
  const [updating, setUpdating] = useState({});
  const [view, setView] = useState("card");
  const [editMember, setEditMember] = useState(null);
  const [showRefus, setShowRefus] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(null);

  const [cellules, setCellules] = useState([]);
  const [conseillers, setConseillers] = useState([]);

  const [openPhoneMenuId, setOpenPhoneMenuId] = useState(null);
  const phoneMenuRef = useRef(null);

  const toggleDetails = (id) =>
    setDetailsOpen((prev) => (prev === id ? null : id));

  const statutIds = { envoye: 1, "en attente": 2, integrer: 3, refus: 4 };
  const statutLabels = { 1: "Envoyé", 2: "En attente", 3: "Intégrer", 4: "Refus" };

  // 🔹 Fermer menu téléphone si clic en dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (phoneMenuRef.current && !phoneMenuRef.current.contains(event.target)) {
        setOpenPhoneMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 🔹 Fetch membres_complets
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
          if (celluleIds.length > 0) {
            query = query.in("cellule_id", celluleIds);
          } else {
            query = query.eq("id", -1); // Aucun résultat
          }
        }

        const { data, error } = await query;
        if (error) throw error;

        setAllMembers(data || []);
        if (!data || data.length === 0) setMessage("Aucun membre à afficher.");
      } catch (err) {
        console.error("❌ Erreur fetchMembresComplets:", err.message || err);
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

  // 🔹 Changement commentaire uniquement
  const handleCommentChange = (id, value) => {
    // Mettre à jour l'état local
    setCommentChanges(prev => ({ ...prev, [id]: value }));

    // Mettre à jour le membre dans le contexte pour que l'UI reflète immédiatement
    const member = members.find(m => m.id === id);
    if (member) {
      updateMember(id, { ...member, commentaire_suivis: value });
    }
  };

  const getBorderColor = (m) => {
    if (!m) return "#ccc";
    const status = m.statut_suivis ?? m.suivi_statut;
    if (status === statutIds["en attente"]) return "#FFA500";
    if (status === statutIds["integrer"]) return "#34A853";
    if (status === statutIds["refus"]) return "#FF4B5C";
    if (status === statutIds["envoye"]) return "#3B82F6";
    return "#ccc";
  };

  const updateSuivi = async (id) => {
  const newComment = commentChanges[id];
  const newStatus = statusChanges[id];

  // ✅ SEULE vérification à faire
  if (newComment === undefined && newStatus === undefined) {
    return;
  }

  setUpdating(prev => ({ ...prev, [id]: true }));

  try {
    const payload = {
      updated_at: new Date(),
    };

    if (newComment !== undefined) {
      payload.commentaire_suivis = newComment;
    }

    if (newStatus !== undefined) {
      payload.statut_suivis = Number(newStatus);
    }

    const { data: updatedMember, error } = await supabase
      .from("membres_complets")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    updateMember(updatedMember.id, updatedMember);

  } catch (err) {
    console.error(err);
  } finally {
    setUpdating(prev => ({ ...prev, [id]: false }));
  }
};



  const filteredMembers = members.filter(m => {
  const statut = m.statut_suivis ?? m.suivi_statut ?? null;

  // 🔴 Voir uniquement les refus
  if (showRefus) {
    return statut === 4;
  }

  // 🟢 Vue normale : tout sauf refus
  return statut !== 4;
});



  const uniqueMembers = Array.from(new Map(filteredMembers.map(item => [item.id, item])).values());

  const handleAfterSend = (updatedMember) => {
    updateMember(updatedMember.id, updatedMember);
  };

  const DetailsPopup = ({ m }) => {
    const commentRef = useRef(null);

    useEffect(() => {
      if (commentRef.current) {
        commentRef.current.focus();
        commentRef.current.selectionStart = commentRef.current.value.length;
      }
    }, [commentChanges[m.id]]);

    const celluleNom = m.cellule_id ? (cellules.find(c => c.id === m.cellule_id)?.cellule_full || "—") : "—";
    const conseillerNom = m.conseiller_id
      ? `${conseillers.find(c => c.id === m.conseiller_id)?.prenom || ""} ${conseillers.find(c => c.id === m.conseiller_id)?.nom || ""}`.trim()
      : "—";

    return (
      <div className="text-black text-sm space-y-2 w-full">
        <p>💬 WhatsApp : {m.is_whatsapp ? "Oui" : "Non"}</p>
        <p>🏙 Ville : {m.ville || ""}</p>
        <p>🧩 Comment est-il venu : {m.venu || ""}</p>
        <p>⚥ Sexe : {m.sexe || ""}</p>
        <p>📋 Statut initial : {m.statut_initial ?? m.statut ?? ""}</p>
        <p>❓Besoin : {!m.besoin ? "" : Array.isArray(m.besoin) ? m.besoin.join(", ") : m.besoin}</p>
        <p>📝 Infos : {m.infos_supplementaires || ""}</p>       

        <div className="mt-4 flex justify-center">
          <button onClick={() => setEditMember(m)} className="text-blue-600 text-sm mt-4">✏️ Modifier le contact</button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-6" style={{ background: "linear-gradient(135deg, #2E3192 0%, #92EFFD 100%)" }}>
      <div className="w-full max-w-5xl mb-6">
        <div className="flex justify-between items-center">
          <button onClick={() => window.history.back()} className="flex items-center text-white hover:text-black-200 transition-colors">← Retour</button>
          <LogoutLink className="bg-white/10 text-white px-4 py-2 rounded-lg hover:bg-white/20 transition" />
        </div>
        <div className="flex justify-end mt-2">
          <p className="text-orange-200 text-sm">👋 Bienvenue {prenom}</p>
        </div>
      </div>

      <div className="mb-4">
        <Image src="/logo.png" alt="SoulTrack Logo" className="w-20 h-18 mx-auto" />
      </div>

      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">📋 Suivis des Membres</h1>
        <p className="text-white text-lg max-w-xl mx-auto italic">Chaque personne a une valeur infinie. Ensemble, nous avançons ❤️</p>
      </div>

      <div className="mb-4 flex justify-between w-full max-w-6xl">
        <button onClick={() => setView(view === "card" ? "table" : "card")} className="text-white text-sm underline hover:text-black-200">{view === "card" ? "Vue Table" : "Vue Carte"}</button>
        <button onClick={() => setShowRefus(prev => !prev)} className="text-orange-400 text-sm underline hover:text-orange-500">{showRefus ? "Voir tous les suivis" : "Voir les refus"}</button>

      </div>

      {message && <div className={`mb-4 px-4 py-2 rounded-md text-sm ${message.type === "error" ? "bg-red-200 text-red-800" : message.type === "success" ? "bg-green-200 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>{message.text}</div>}

      {view === "card" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-6xl justify-items-center">
          {uniqueMembers.map(m => (
            <div key={m.id} className="bg-white rounded-2xl shadow-lg w-full transition-all duration-300 hover:shadow-2xl p-4 border-l-4" style={{ borderLeftColor: getBorderColor(m) }}>
              <div className="flex flex-col items-center">
                <h2 className="font-bold text-black text-base text-center mb-1">{m.prenom} {m.nom}</h2>
                
                {/* Numéro cliquable pour ouvrir le menu */}
                <p
                  className="text-orange-500 underline font-semibold mb-1 cursor-pointer"
                  onClick={() => setOpenPhoneMenuId(openPhoneMenuId === m.id ? null : m.id)}
                >
                  {m.telephone || "—"}
                </p>

                {/* Menu actions téléphoniques / WhatsApp */}
                {openPhoneMenuId === m.id && (
                  <div
                    ref={phoneMenuRef}
                    className="phone-menu absolute mt-2 bg-white rounded-lg shadow-lg border z-50 w-52"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <a
                      href={m.telephone ? `tel:${m.telephone}` : "#"}
                      className={`block px-4 py-2 text-sm text-black hover:bg-gray-100 ${!m.telephone ? "opacity-50 pointer-events-none" : ""}`}
                    >
                      📞 Appeler
                    </a>
                    <a
                      href={m.telephone ? `sms:${m.telephone}` : "#"}
                      className={`block px-4 py-2 text-sm text-black hover:bg-gray-100 ${!m.telephone ? "opacity-50 pointer-events-none" : ""}`}
                    >
                      ✉️ SMS
                    </a>
                    <a
                      href={m.telephone ? `https://wa.me/${m.telephone.replace(/\D/g, "")}?call` : "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`block px-4 py-2 text-sm text-black hover:bg-gray-100 ${!m.telephone ? "opacity-50 pointer-events-none" : ""}`}
                    >
                      📱 Appel WhatsApp
                    </a>
                    <a
                      href={m.telephone ? `https://wa.me/${m.telephone.replace(/\D/g, "")}` : "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`block px-4 py-2 text-sm text-black hover:bg-gray-100 ${!m.telephone ? "opacity-50 pointer-events-none" : ""}`}
                    >
                      💬 Message WhatsApp
                    </a>
                  </div>
                )}

                <p className="text-sm text-black-700 mb-1">🏠 Cellule : {m.cellule_id ? (cellules.find(c => c.id === m.cellule_id)?.cellule_full || "—") : "—"}</p>
                <p className="text-sm text-black-700 mb-1">👤 Conseiller : {m.conseiller_id ? `${conseillers.find(c => c.id === m.conseiller_id)?.prenom || ""} ${conseillers.find(c => c.id === m.conseiller_id)?.nom || ""}`.trim() : "—"}</p>

                {/* Commentaire Suivis */}
                <div className="flex flex-col w-full mt-2">
                  <label className="font-semibold text-blue-700 mb-1 mt-2 text-center">Commentaire Suivis</label>
                  <textarea
                    value={commentChanges[m.id] ?? m.commentaire_suivis ?? ""}
                    onChange={(e) => handleCommentChange(m.id, e.target.value)}
                    className="w-full border rounded-lg p-2"
                    rows={2}
                  />

                            <label className="font-semibold text-blue-700 mb-1 text-center">
                          Statut Intégration
                        </label>
                        
                        <select
                          value={statusChanges[m.id] ?? String(m.statut_suivis ?? "")}
                          onChange={(e) =>
                            setStatusChanges(prev => ({
                              ...prev,
                              [m.id]: e.target.value
                            }))
                          }
                          className="w-full border rounded-lg p-2 mb-2"
                        >
                          <option value="">-- Sélectionner un statut --</option>
                          <option value="2">En Attente</option>         
                          <option value="3">Intégrer</option>
                          <option value="4">Refus</option>
                        </select>

                  <button
                          onClick={() => updateSuivi(m.id)}
                          disabled={updating[m.id]}
                          className={`mt-2 py-1 rounded w-full transition ${
                            updating[m.id]
                              ? "bg-gray-400 cursor-not-allowed"
                              : "bg-blue-500 hover:bg-blue-600 text-white"
                          }`}
                        >
                          {updating[m.id] ? "Enregistrement..." : "Sauvegarder"}
                        </button>

                </div>

                <button onClick={() => toggleDetails(m.id)} className="text-orange-500 underline text-sm mt-2">
                  {detailsOpen === m.id ? "Fermer détails" : "Détails"}
                </button>
              </div>

              <div className={`transition-all duration-500 overflow-hidden ${detailsOpen === m.id ? "max-h-[1000px] mt-3" : "max-h-0"}`}>
                {detailsOpen === m.id && <div className="pt-2"><DetailsPopup m={m} /></div>}
              </div>
            </div>
          ))}
        </div>
      )}


              {view === "table" && (
  <div className="w-full max-w-6xl overflow-x-auto py-2">
    <div className="min-w-[700px] space-y-2"> {/* Largeur minimum pour scroll horizontal */}
      
      {/* Header */}
      <div className="hidden sm:flex text-sm font-semibold uppercase text-white px-2 py-1 border-b border-gray-400 bg-transparent">
        <div className="flex-[2]">Nom complet</div>
        <div className="flex-[1]">Téléphone</div>
        <div className="flex-[1]">Statut Suivis</div>
        <div className="flex-[2]">Attribué à</div>
        <div className="flex-[1]">Actions</div>
      </div>

      {uniqueMembers.length === 0 && (
        <div className="px-2 py-2 text-white text-center bg-gray-600 rounded">Aucun membre en suivi</div>
      )}

      {uniqueMembers.map(m => {
        const attribue = m.conseiller_id
          ? `👤 ${conseillers.find(c => c.id === m.conseiller_id)?.prenom || ""} ${conseillers.find(c => c.id === m.conseiller_id)?.nom || ""}`.trim()
          : m.cellule_id
          ? `🏠 ${cellules.find(c => c.id === m.cellule_id)?.cellule_full || "—"}`
          : "—";

        return (
          <div
            key={m.id}
            className="flex flex-row items-center px-2 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition duration-150 gap-2 border-l-4"
            style={{ borderLeftColor: getBorderColor(m) }}
          >
            <div className="flex-[2] text-white flex items-center gap-1">
              {m.prenom} {m.nom}
            </div>
            <div className="flex-[1] text-white">{m.telephone || "—"}</div>
            <div className="flex-[1] text-white">{statutLabels[m.statut_suivis ?? m.suivi_statut] || "—"}</div>
            <div className="flex-[2] text-white">{attribue}</div>
            <div className="flex-[1]">
              <button
                onClick={() => setDetailsModalMember(m)}
                className="text-orange-500 underline text-sm whitespace-nowrap"
              >
                Détails
              </button>
            </div>
          </div>
        );
      })}
    </div>
  </div>
)}


      {detailsModalMember && (
        <DetailsModal
          m={detailsModalMember}
          onClose={() => setDetailsModalMember(null)}
          handleStatusChange={handleStatusChange}
          handleCommentChange={handleCommentChange}
          statusChanges={statusChanges}
          commentChanges={commentChanges}
          updating={updating}
          updateSuivi={updateSuivi}
        />
      )}

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
