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

  // -------------------- Nouveaux états --------------------
  const [commentChanges, setCommentChanges] = useState({});
  const [statusChanges, setStatusChanges] = useState({});
  const [updating, setUpdating] = useState({});
  const [selectedTargets, setSelectedTargets] = useState({});
  const [selectedTargetType, setSelectedTargetType] = useState({});
  const [toastMessage, setToastMessage] = useState("");
  const [showingToast, setShowingToast] = useState(false);
  const [openPhoneMenuId, setOpenPhoneMenuId] = useState(null);
  const [etatContactFilter, setEtatContactFilter] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const { members, setAllMembers, updateMember } = useMembers();
  const [filteredNouveaux, setFilteredNouveaux] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);

  // -------------------- Helper Toast --------------------
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

  // ==================== FETCH DATA ====================
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

  // -------------------- Session & initial fetch --------------------
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

  // -------------------- Fermer menu téléphone en cliquant dehors --------------------
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".phone-menu")) setOpenPhoneMenuId(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // -------------------- Détection doublon par téléphone --------------------
  const isDuplicateByPhone = (member) => {
    if (!member?.telephone) return false;
    const tel = member.telephone.replace(/\D/g, "");
    return members.some((m) => {
      if (m.id === member.id) return false;
      if (!m.telephone) return false;
      const otherTel = m.telephone.replace(/\D/g, "");
      return otherTel === tel;
    });
  };
  // -------------------- FILTRAGE CENTRALISE OPTIMISE --------------------
  useEffect(() => {
    const nouveaux = members.filter(m =>
      ["visiteur", "veut rejoindre ICC", "nouveau"].includes((m.statut || "").toLowerCase())
    );
    const anciens = members.filter(m =>
      !["visiteur", "veut rejoindre ICC", "nouveau"].includes((m.statut || "").toLowerCase())
    );
    setFilteredNouveaux(nouveaux);
    setFilteredMembers(members);
  }, [members, refreshKey]);

  const getBorderColor = (m) => {
    if (!m.etat_contact) return "#ccc";
    const etat = m.etat_contact.trim().toLowerCase();
    if (etat === "existant") return "#34A853";
    if (etat === "nouveau") return "#34A85e";
    if (etat === "inactif") return "#999999";
    return "#ccc";
  };

  const formatDate = (dateStr) => {
    try {
      return format(new Date(dateStr), "EEEE d MMMM yyyy", { locale: fr });
    } catch {
      return "";
    }
  };

  const toggleStar = async (member) => {
    try {
      const { error } = await supabase
        .from("membres_complets")
        .update({ star: !member.star })
        .eq("id", member.id);

      if (error) throw error;

      setAllMembers(prev =>
        prev.map(m => (m.id === member.id ? { ...m, star: !member.star } : m))
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

  // -------------------- handleAfterSend --------------------
  const handleAfterSend = (memberSent) => {
    // Supprime de la section Nouveau
    setFilteredNouveaux(prev => prev.filter(m => m.id !== memberSent.id));

    // Met à jour le membre dans la liste principale
    setFilteredMembers(prev =>
      prev.map(m => (m.id === memberSent.id ? { ...m, etat_contact: "Existant" } : m))
    );

    showToast(`✅ ${memberSent.prenom} ${memberSent.nom} a été déplacé dans les suivis`);
  };

  // -------------------- Rendu Carte --------------------
  const renderMemberCard = (m) => {
    const isOpen = detailsOpen[m.id];

    const besoins = !m.besoin
      ? "—"
      : Array.isArray(m.besoin)
        ? m.besoin.join(", ")
        : (() => { try { const arr = JSON.parse(m.besoin); return Array.isArray(arr) ? arr.join(", ") : m.besoin; } catch { return m.besoin; } })();

    const formatMinistere = ministere => {
      if (!ministere) return "—";
      try {
        const parsed = typeof ministere === "string" ? JSON.parse(ministere) : ministere;
        return Array.isArray(parsed) ? parsed.join(", ") : "—";
      } catch {
        return "—";
      }
    };

    return (
      <div key={m.id} className="bg-white px-3 pb-3 pt-1 rounded-xl shadow-md border-l-4 relative">
        {/* Badge Nouveau */}
        {m.isNouveau && (
          <div className="absolute top-2 right-3 flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#2E3192" }}></span>
            <span className="text-xs font-semibold" style={{ color: "#2E3192" }}>Nouveau</span>
          </div>
        )}

        {/* Nom centré */}
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
                  <div
                    className="phone-menu absolute top-full mt-2 bg-white rounded-lg shadow-lg border z-50 w-52"
                    onClick={e => e.stopPropagation()}
                  >
                    <a href={`tel:${m.telephone}`} className="block px-4 py-2 text-sm text-black hover:bg-gray-100">📞 Appeler</a>
                    <a href={`sms:${m.telephone}`} className="block px-4 py-2 text-sm text-black hover:bg-gray-100">✉️ SMS</a>
                    <a href={`https://wa.me/${m.telephone.replace(/\D/g, "")}?call`} target="_blank" rel="noopener noreferrer" className="block px-4 py-2 text-sm text-black hover:bg-gray-100">📱 WhatsApp Call</a>
                    <a href={`https://wa.me/${m.telephone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="block px-4 py-2 text-sm text-black hover:bg-gray-100">💬 WhatsApp Message</a>
                  </div>
                )}
              </>
            ) : <span className="text-gray-400">—</span>}
          </div>

          {/* Infos principales */}
          <div className="w-full mt-2 text-sm text-black space-y-1">
            <p className="text-center">🏙️ Ville : {m.ville || "—"}</p>
            <p className="text-center">🕊 Etat Contact : {m.etat_contact || "—"}</p>
            <p>🏠 Cellule : {m.cellule_id ? `${cellules.find(c => c.id === m.cellule_id)?.cellule_full || "—"}` : "—"}</p>
            <p>👤 Conseiller : {m.conseiller_id ? `${conseillers.find(c => c.id === m.conseiller_id)?.prenom || ""} ${conseillers.find(c => c.id === m.conseiller_id)?.nom || ""}`.trim() : "—"}</p>
          </div>

          {/* Select pour envoyer */}
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
                  onEnvoyer={(updatedMember) => handleAfterSend(updatedMember)}
                  removeFromNouveaux={() => {
                    setFilteredNouveaux(prev => prev.filter(member => member.id !== m.id));
                    showToast(`❌ ${m.prenom} ${m.nom} retiré de la section Nouveau`);
                  }}
                />
              </div>
            )}
          </div>

          <button onClick={() => setDetailsOpen(prev => ({ ...prev, [m.id]: !prev[m.id] }))} className="text-orange-500 underline text-sm mt-2">
            {isOpen ? "Fermer détails" : "Détails"}
          </button>
        </div>
      </div>
    );
  };
  // -------------------- Rendu Vue Table --------------------
  const renderMemberTableRow = (m) => {
    const isDuplicate = isDuplicateByPhone(m);

    return (
      <div
        key={m.id}
        className={`flex flex-row items-center px-2 py-2 rounded-lg transition duration-150 gap-2 border-l-4 ${isDuplicate ? "bg-red-100/40 hover:bg-red-100/50" : "bg-blue-100/30 hover:bg-blue-100/50"}`}
        style={{ borderLeftColor: getBorderColor(m) }}
      >
        <div className="flex-[2] text-white font-semibold flex items-center gap-1">
          {m.prenom} {m.nom}
          {m.star && <span className="text-yellow-400 ml-1">⭐</span>}
          {isDuplicate && <span className="text-red-500 ml-1 text-xs font-bold">⚠️ Doublon</span>}
        </div>

        <div className="flex-[1] text-white">{m.telephone || "—"}</div>
        <div className="flex-[1] text-white">{m.etat_contact || "—"}</div>
        <div className="flex-[2] text-white">
          {m.cellule_id
            ? `🏠 ${cellules.find(c => c.id === m.cellule_id)?.cellule_full || "—"}`
            : m.conseiller_id
            ? `👤 ${conseillers.find(c => c.id === m.conseiller_id)?.prenom} ${conseillers.find(c => c.id === m.conseiller_id)?.nom}`
            : "—"}
        </div>
        <div className="flex-[1]">
          <button
            onClick={() => setPopupMember(prev => (prev?.id === m.id ? null : { ...m }))}
            className="text-orange-500 underline text-sm whitespace-nowrap"
          >
            {popupMember?.id === m.id ? "Fermer détails" : "Détails"}
          </button>
        </div>
      </div>
    );
  };

  // -------------------- Rendu principal --------------------
  return (
    <div className="min-h-screen flex flex-col items-center p-4 sm:p-6" style={{ background: "#2E3192" }}>
      <Header />
      <h1 className="text-2xl sm:text-3xl font-bold text-white text-center mb-2">Liste des Membres</h1>

      {/* Barre recherche */}
      <div className="w-full max-w-4xl flex justify-center mb-2">
        <input
          type="text"
          placeholder="Recherche..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-2/3 px-3 py-1 rounded-md border text-black"
        />
      </div>

      {/* Toggle Vue Carte / Table */}
      <div className="w-full max-w-6xl flex justify-center gap-4 mb-4">
        <button
          onClick={() => setView(view === "card" ? "table" : "card")}
          className="text-sm font-semibold underline text-white"
        >
          {view === "card" ? "Vue Table" : "Vue Carte"}
        </button>
      </div>

      {/* ==================== VUE TABLE ==================== */}
      {view === "table" && (
        <div className="w-full max-w-6xl overflow-x-auto py-2">
          <div className="min-w-[700px] space-y-2">
            {/* Header */}
            <div className="hidden sm:flex text-sm font-semibold uppercase text-white px-2 py-1 border-b border-gray-400 bg-transparent">
              <div className="flex-[2]">Nom complet</div>
              <div className="flex-[1]">Téléphone</div>
              <div className="flex-[1]">Statut</div>
              <div className="flex-[2]">Affectation</div>
              <div className="flex-[1]">Actions</div>
            </div>

            {/* Nouveaux Membres */}
            {filteredNouveaux.map(renderMemberTableRow)}

            {/* Membres existants */}
            {filteredAnciens.map(renderMemberTableRow)}
          </div>
        </div>
      )}

      {/* =================== DETAILS MEMBER POPUP =================== */}
      {popupMember && (
        <DetailsMemberPopup
          membre={popupMember}
          onClose={() => setPopupMember(null)}
          cellules={cellules}
          conseillers={conseillers}
          session={session}
          commentChanges={commentChanges}
          handleCommentChange={handleCommentChange}
          statusChanges={statusChanges}
          setStatusChanges={setStatusChanges}
          updateSuivi={updateSuivi}
          updating={updating}
        />
      )}

      {editMember && (
        <EditMemberPopup
          member={editMember}
          onClose={() => setEditMember(null)}
          onUpdateMember={onUpdateMemberHandler}
        />
      )}

      {/* =================== TOAST =================== */}
      {showingToast && (
        <div className="fixed bottom-4 right-4 bg-black text-white px-4 py-2 rounded-lg shadow-lg z-50">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
