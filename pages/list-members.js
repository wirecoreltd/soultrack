"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import supabase from "../lib/supabaseClient";
import Image from "next/image";
import BoutonEnvoyer from "../components/BoutonEnvoyer";
import LogoutLink from "../components/LogoutLink";
import DetailsMemberPopup from "../components/DetailsMemberPopup";
import EditMemberPopup from "../components/EditMemberPopup";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useSearchParams } from "next/navigation";
import { useMembers } from "../context/MembersContext";
import Header from "../components/Header";

export default function ListMembers() {
  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");
  const [detailsOpen, setDetailsOpen] = useState({});
  const [cellules, setCellules] = useState([]);
  const [conseillers, setConseillers] = useState([]);
  const [view, setView] = useState("card");
  const [popupMember, setPopupMember] = useState(null);
  const [editMember, setEditMember] = useState(null);
  const [session, setSession] = useState(null);
  const [prenom, setPrenom] = useState("");
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const conseillerIdFromUrl = searchParams.get("conseiller_id");

  const [commentChanges, setCommentChanges] = useState({});
  const [statusChanges, setStatusChanges] = useState({});
  const [updating, setUpdating] = useState({});
  const [selectedTargets, setSelectedTargets] = useState({});
  const [selectedTargetType, setSelectedTargetType] = useState({});
  const [toastMessage, setToastMessage] = useState("");
  const [showingToast, setShowingToast] = useState(false);
  const [openPhoneMenuId, setOpenPhoneMenuId] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const { members, setAllMembers, updateMember } = useMembers();

  // -------------------- Toast --------------------
  const showToast = (msg) => {
    setToastMessage(msg);
    setShowingToast(true);
    setTimeout(() => setShowingToast(false), 3500);
  };

  const handleCommentChange = (id, value) => {
    setCommentChanges((prev) => ({ ...prev, [id]: value }));
  };

  const updateSuivi = async (id) => {
    setUpdating((prev) => ({ ...prev, [id]: true }));
    try {
      console.log("Update suivi pour:", id, commentChanges[id], statusChanges[id]);
      setTimeout(() => {
        setUpdating((prev) => ({ ...prev, [id]: false }));
        showToast("✅ Suivi enregistré !");
      }, 1000);
    } catch (err) {
      console.error("Erreur update suivi:", err);
      setUpdating((prev) => ({ ...prev, [id]: false }));
    }
  };

  // -------------------- FETCH --------------------
  const fetchMembers = async (profile = null) => {
    setLoading(true);
    try {
      let query = supabase.from("membres_complets").select("*").order("created_at", { ascending: false });
      if (conseillerIdFromUrl) query = query.eq("conseiller_id", conseillerIdFromUrl);
      else if (profile?.role === "Conseiller") query = query.eq("conseiller_id", profile.id);

      const { data, error } = await query;
      if (error) throw error;
      setAllMembers(data || []);
    } catch (err) {
      console.error("Erreur fetchMembers:", err);
      setAllMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCellules = async () => {
    const { data, error } = await supabase.from("cellules").select("id, cellule_full");
    if (error) console.error("Erreur fetchCellules:", error);
    if (data) setCellules(data);
  };

  const fetchConseillers = async () => {
    const { data } = await supabase.from("profiles").select("id, prenom, nom, telephone").eq("role", "Conseiller");
    if (data) setConseillers(data);
  };

  // -------------------- Détection doublon --------------------
  const isDuplicateByPhone = (member) => {
    if (!member?.telephone) return false;
    const tel = member.telephone.replace(/\D/g, "");
    return members.some((m) => m.id !== member.id && m.telephone?.replace(/\D/g, "") === tel);
  };

  // -------------------- handleAfterSend --------------------
  const handleAfterSend = (memberSent) => {
    // Supprime le membre de la liste des nouveaux
    setFilteredNouveaux((prev) => prev.filter((m) => m.id !== memberSent.id));

    // Met à jour la liste générale si besoin
    setAllMembers((prev) =>
      prev.map((m) => (m.id === memberSent.id ? { ...m, etat_contact: "Existant" } : m))
    );

    showToast(`✅ ${memberSent.prenom} ${memberSent.nom} a été déplacé dans les suivis`);
  };

  // -------------------- useEffect init --------------------
  useEffect(() => {
    const fetchSessionAndProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);

      if (session?.user) {
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("id, prenom, role")
          .eq("id", session.user.id)
          .single();
        if (!profileError) {
          setPrenom(profileData.prenom || "");
          await fetchMembers(profileData);
        } else console.error(profileError);
      } else {
        await fetchMembers();
      }

      fetchCellules();
      fetchConseillers();
    };

    fetchSessionAndProfile();
  }, []);
  // -------------------- Realtime --------------------
  const realtimeChannelRef = useRef(null);
  useEffect(() => {
    if (realtimeChannelRef.current) {
      try { realtimeChannelRef.current.unsubscribe(); } catch (e) {}
      realtimeChannelRef.current = null;
    }

    const channel = supabase.channel("realtime:membres_complets");
    channel.on("postgres_changes", { event: "*", schema: "public", table: "membres_complets" }, () => fetchMembers());
    channel.on("postgres_changes", { event: "*", schema: "public", table: "cellules" }, () => { fetchCellules(); fetchMembers(); });
    channel.on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, () => { fetchConseillers(); fetchMembers(); });
    try { channel.subscribe(); } catch (err) { console.warn("Erreur subscription realtime:", err); }

    realtimeChannelRef.current = channel;
    return () => {
      try { if (realtimeChannelRef.current) { realtimeChannelRef.current.unsubscribe(); realtimeChannelRef.current = null; } } catch (e) {}
    };
  }, []);

  // -------------------- Update après édition --------------------
  const onUpdateMemberHandler = (updatedMember) => {
    updateMember(updatedMember); // Met à jour le contexte
    setEditMember(null);         // Ferme le popup édition

    // ⚡ Si le membre édité est ouvert dans le popup détails, on le met à jour aussi
    setPopupMember(prev =>
      prev?.id === updatedMember.id ? { ...prev, ...updatedMember } : prev
    );

    setRefreshKey(prev => prev + 1); // Forcer rerender pour filtres
  };

  // -------------------- Fermer menu téléphone en cliquant dehors --------------------
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".phone-menu")) setOpenPhoneMenuId(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // -------------------- FILTRAGE CENTRALISE OPTIMISE --------------------
  const { filteredMembers, filteredNouveaux, filteredAnciens } = useMemo(() => {
    const baseFiltered = filter
      ? members.filter((m) => m.etat_contact?.trim().toLowerCase() === filter.toLowerCase())
      : members;

    const searchFiltered = baseFiltered.filter((m) =>
      `${m.prenom || ""} ${m.nom || ""}`.toLowerCase().includes(search.toLowerCase())
    );

    const nouveaux = searchFiltered.filter((m) =>
      ["visiteur", "veut rejoindre ICC", "nouveau"].includes(m.statut)
    );

    const anciens = searchFiltered.filter(
      (m) => !["visiteur", "veut rejoindre ICC", "nouveau"].includes(m.statut)
    );

    return {
      filteredMembers: searchFiltered,
      filteredNouveaux: nouveaux,
      filteredAnciens: anciens,
    };
  }, [members, filter, search, refreshKey]);

  // -------------------- Utilitaires --------------------
  const toggleDetails = (id) => setDetailsOpen((prev) => ({ ...prev, [id]: !prev[id] }));

  const getBorderColor = (m) => {
    if (!m.etat_contact) return "#ccc"; 
    const etat = m.etat_contact.trim().toLowerCase(); 
    if (etat === "existant") return "#34A853";  
    if (etat === "nouveau") return "#34A85e";   
    if (etat === "inactif") return "#999999";   
    return "#ccc"; 
  };

  const formatDate = (dateStr) => {
    try { return format(new Date(dateStr), "EEEE d MMMM yyyy", { locale: fr }); } catch { return ""; }
  };

  const toggleStar = async (member) => {
    try {
      const { error } = await supabase
        .from("membres_complets")
        .update({ star: !member.star })
        .eq("id", member.id);

      if (error) throw error;

      setAllMembers((prev) =>
        prev.map((m) => (m.id === member.id ? { ...m, star: !member.star } : m))
      );
    } catch (err) {
      console.error("Erreur toggleStar:", err);
    }
  };

  const today = new Date();
  const dateDuJour = today.toLocaleDateString("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // -------------------- Rendu Carte --------------------
  const renderMemberCard = (m) => {
    const isOpen = detailsOpen[m.id];
    const besoins = !m.besoin ? "—" : Array.isArray(m.besoin) ? m.besoin.join(", ") : (() => { try { const arr = JSON.parse(m.besoin); return Array.isArray(arr) ? arr.join(", ") : m.besoin; } catch { return m.besoin; } })();
    const formatMinistere = ministere => {
      if (!ministere) return "—";
      try { const parsed = typeof ministere === "string" ? JSON.parse(ministere) : ministere; return Array.isArray(parsed) ? parsed.join(", ") : "—"; } catch { return "—"; }
    };

    return (
      <div key={m.id} className="bg-white px-3 pb-3 pt-1 rounded-xl shadow-md border-l-4 relative">
        {m.isNouveau && (
          <div className="absolute top-2 right-3 flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#2E3192" }}></span>
            <span className="text-xs font-semibold" style={{ color: "#2E3192" }}>Nouveau</span>
          </div>
        )}

        <div className="flex flex-col items-center mt-6">
          <h2 className="text-lg font-bold text-center">{m.prenom} {m.nom}</h2>

          {/* Téléphone avec menu */}
          <div className="relative flex justify-center mt-3">
            {m.telephone ? (
              <>
                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); setOpenPhoneMenuId(openPhoneMenuId === m.id ? null : m.id); }}
                  className="text-orange-500 underline font-semibold text-center"
                >
                  {m.telephone}
                </button>

                {openPhoneMenuId === m.id && (
                  <div className="phone-menu absolute top-full mt-2 bg-white rounded-lg shadow-lg border z-50 w-52" onClick={e => e.stopPropagation()}>
                    <a href={`tel:${m.telephone}`} className="block px-4 py-2 text-sm text-black hover:bg-gray-100">📞 Appeler</a>
                    <a href={`sms:${m.telephone}`} className="block px-4 py-2 text-sm text-black hover:bg-gray-100">✉️ SMS</a>
                    <a href={`https://wa.me/${m.telephone.replace(/\D/g, "")}?call`} target="_blank" rel="noopener noreferrer" className="block px-4 py-2 text-sm text-black hover:bg-gray-100">📱 WhatsApp Call</a>
                    <a href={`https://wa.me/${m.telephone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="block px-4 py-2 text-sm text-black hover:bg-gray-100">💬 WhatsApp Message</a>
                  </div>
                )}
              </>
            ) : (<span className="text-gray-400">—</span>)}
          </div>
          {/* Infos principales */}
          <div className="w-full mt-2 text-sm text-black space-y-1">
            <p className="text-center">🏙️ Ville : {m.ville || "—"}</p>
            <p className="text-center">🕊 Etat Contact : {m.etat_contact || "—"}</p>
            <p>🏠 Cellule : {m.cellule_id ? `${cellules.find(c => c.id === m.cellule_id)?.cellule_full || "—"}` : "—"}</p>
            <p>👤 Conseiller : {m.conseiller_id ? `${conseillers.find(c => c.id === m.conseiller_id)?.prenom || ""} ${conseillers.find(c => c.id === m.conseiller_id)?.nom || ""}`.trim() : "—"}</p>
          </div>

          {/* Select pour envoyer / retirer */}
          <div className="mt-2 w-full">
            <label className="font-semibold text-sm">Envoyer à :</label>
            <select value={selectedTargetType[m.id] || ""} onChange={e => setSelectedTargetType(prev => ({ ...prev, [m.id]: e.target.value }))} className="mt-1 w-full border rounded px-2 py-1 text-sm">
              <option value="">-- Choisir une option --</option>
              <option value="cellule">Une Cellule</option>
              <option value="conseiller">Un Conseiller</option>
            </select>
            {(selectedTargetType[m.id] === "cellule" || selectedTargetType[m.id] === "conseiller") && (
              <select value={selectedTargets[m.id] || ""} onChange={e => setSelectedTargets(prev => ({ ...prev, [m.id]: e.target.value }))} className="mt-1 w-full border rounded px-2 py-1 text-sm">
                <option value="">-- Choisir {selectedTargetType[m.id]} --</option>
                {selectedTargetType[m.id] === "cellule" ? cellules.map(c => <option key={c.id} value={c.id}>{c.cellule_full || "—"}</option>) : null}
                {selectedTargetType[m.id] === "conseiller" ? conseillers.map(c => <option key={c.id} value={c.id}>{c.prenom || "—"} {c.nom || ""}</option>) : null}
              </select>
            )}
            {selectedTargetType[m.id] && selectedTargets[m.id] && (
              <div className="pt-2">
                <BoutonEnvoyer
                  membre={m}
                  type={selectedTargetType[m.id]}
                  cible={selectedTargetType[m.id] === "cellule" ? cellules.find(c => c.id === selectedTargets[m.id]) : conseillers.find(c => c.id === selectedTargets[m.id])}
                  session={session}
                  showToast={showToast}
                  onEnvoyer={(updatedMember) => {
                    handleAfterSend(updatedMember);
                  }}
                  removeFromNouveaux={() => {
                    setFilteredNouveaux(prev => prev.filter(member => member.id !== m.id));
                    showToast(`❌ ${m.prenom} ${m.nom} retiré de la section Nouveau`);
                  }}
                />
              </div>
            )}
          </div>

          {/* Bouton détails */}
          <button onClick={() => toggleDetails(m.id)} className="text-orange-500 underline text-sm mt-2">{isOpen ? "Fermer détails" : "Détails"}</button>

          {/* Détails étendus */}
          {isOpen && (
            <div className="text-black text-sm mt-2 w-full space-y-1">
              <p className="font-semibold text-center" style={{ color: "#2E3192" }}>💡 Statut Suivi: {m.suivi_statut || "—"}</p>
              <p>💬 WhatsApp : {m.is_whatsapp ? "Oui" : "Non"}</p>
              <p>🎗️ Sexe : {m.sexe || "—"}</p>
              <p>💧 Bapteme d'Eau: {m.bapteme_eau === true || m.bapteme_eau === "true" ? "Oui" : "Non"}</p>
              <p>🔥 Bapteme de Feu: {m.bapteme_esprit === true || m.bapteme_esprit === "true" ? "Oui" : "Non"}</p>
              <p>✒️ Formation : {m.Formation || "—"}</p>
              <p>❤️‍🩹 Soin Pastoral : {m.Soin_Pastoral || "—"}</p>
              <p>💢 Ministere : {formatMinistere(m.Ministere)}</p>
              <p>❓ Besoin : {besoins}</p>
              <p>📝 Infos : {m.infos_supplementaires || "—"}</p>
              <p>🧩 Comment est-il venu : {m.venu || "—"}</p>
              <p>✨ Raison de la venue : {m.statut_initial || "—"}</p>
              <p>🙏 Prière du salut : {m.priere_salut || "—"}</p>
              <p>☀️ Type de conversion : {m.type_conversion || "—"}</p>
              <p>📝 Commentaire Suivis : {m.commentaire_suivis || "—"}</p>
              <button onClick={() => setEditMember(m)} className="text-blue-600 text-sm mt-2 w-full">✏️ Modifier le contact</button>
            </div>
          )}
        </div>
      );
    };

  // ===================== Rendu principal (return) =====================
  return (
    <div className="min-h-screen flex flex-col items-center p-4 sm:p-6" style={{ background: "#2E3192" }}>
      <Header />
      <h1 className="text-2xl sm:text-3xl font-bold text-white text-center mb-2">Liste des Membres</h1>

      {/* Barre de recherche */}
      <div className="w-full max-w-4xl flex justify-center mb-2">
        <input type="text" placeholder="Recherche..." value={search} onChange={e => setSearch(e.target.value)} className="w-2/3 px-3 py-1 rounded-md border text-black"/>
      </div>

      {/* Filtre */}
      <div className="w-full max-w-6xl flex justify-center items-center mb-4 gap-2 flex-wrap">
        <select value={filter} onChange={e => setFilter(e.target.value)} className="px-3 py-1 rounded-md border text-black text-sm">
          <option value="">-- Tous les états de contact --</option>
          <option value="nouveau">Nouveau</option>
          <option value="existant">Existant</option>
          <option value="inactif">Inactif</option>
        </select>
        <span className="text-white text-sm ml-2">{filteredMembers.length} membres</span>
      </div>

      {/* Toggle Vue */}
      <div className="w-full max-w-6xl flex justify-center gap-4 mb-4">
        <button onClick={() => setView(view === "card" ? "table" : "card")} className="text-sm font-semibold underline text-white">
          {view === "card" ? "Vue Table" : "Vue Carte"}
        </button>
      </div>

      {/* Vue Carte/Table est gérée via filteredNouveaux et filteredAnciens */}

      {/* Détails et popup */}
      {popupMember && <DetailsMemberPopup membre={popupMember} onClose={() => setPopupMember(null)} cellules={cellules} conseillers={conseillers} session={session} commentChanges={commentChanges} handleCommentChange={handleCommentChange} statusChanges={statusChanges} setStatusChanges={setStatusChanges} updateSuivi={updateSuivi} updating={updating} />}
      {editMember && <EditMemberPopup member={editMember} onClose={() => setEditMember(null)} onUpdateMember={onUpdateMemberHandler} />}

      {/* Toast */}
      {showingToast && <div className="fixed bottom-4 right-4 bg-black text-white px-4 py-2 rounded-lg shadow-lg z-50">{toastMessage}</div>}
    </div>
  );
}
