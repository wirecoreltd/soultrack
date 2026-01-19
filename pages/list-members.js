"use client";

import { useEffect, useState, useRef } from "react";
import supabase from "../lib/supabaseClient";
import BoutonEnvoyer from "../components/BoutonEnvoyer";
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
  const [popupMember, setPopupMember] = useState(null);
  const [editMember, setEditMember] = useState(null);
  const [session, setSession] = useState(null);
  const [prenom, setPrenom] = useState("");
  const [loading, setLoading] = useState(true);
  const [openPhoneMenuId, setOpenPhoneMenuId] = useState(null);

  const searchParams = useSearchParams();
  const conseillerIdFromUrl = searchParams.get("conseiller_id");

  const { members, setAllMembers, updateMember } = useMembers();

  // --- Gestion de la vue persistante
  const [view, setView] = useState(() => {
    if (typeof window !== "undefined") return localStorage.getItem("membersView") || "card";
    return "card";
  });

  const toggleView = () => {
    setView(prev => {
      const newView = prev === "card" ? "table" : "card";
      localStorage.setItem("membersView", newView);
      return newView;
    });
  };

  // --- Toast
  const [toastMessage, setToastMessage] = useState("");
  const [showingToast, setShowingToast] = useState(false);
  const showToast = (msg) => {
    setToastMessage(msg);
    setShowingToast(true);
    setTimeout(() => setShowingToast(false), 3500);
  };

  // --- Fetch membres, cellules et conseillers
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
    const { data } = await supabase.from("profiles").select("id, prenom, nom").eq("role", "Conseiller");
    if (data) setConseillers(data);
  };

  // --- Load session
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

  // --- Realtime updates
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

  // --- Fermer menu téléphone en cliquant dehors
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".phone-menu")) setOpenPhoneMenuId(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- Filtrage simplifié
  const filteredMembers = members.filter(m =>
    (!filter || m.etat_contact?.toLowerCase() === filter.toLowerCase()) &&
    (!search || `${m.prenom} ${m.nom}`.toLowerCase().includes(search.toLowerCase()))
  );

  const filteredNouveaux = filteredMembers.filter(m =>
    ["visiteur", "veut rejoindre ICC", "nouveau"].includes(m.statut)
  );
  const filteredAnciens = filteredMembers.filter(m =>
    !["visiteur", "veut rejoindre ICC", "nouveau"].includes(m.statut)
  );

  // --- Update après édition
  const onUpdateMemberHandler = (updatedMember) => {
    updateMember(updatedMember); // <-- cela met à jour members et recalculera filteredMembers
    setEditMember(null);
    showToast(`✅ ${updatedMember.prenom} ${updatedMember.nom} mis à jour`);
  };

  const formatDate = (dateStr) => {
    try { return format(new Date(dateStr), "EEEE d MMMM yyyy", { locale: fr }); } catch { return ""; }
  };

  const toggleDetails = (id) => setDetailsOpen(prev => ({ ...prev, [id]: !prev[id] }));

  // --- Border color pour table
  const getBorderColor = (m) => {
    if (!m.etat_contact) return "#ccc";
    const etat = m.etat_contact.trim().toLowerCase();
    if (etat === "existant") return "#34A853";
    if (etat === "nouveau") return "#34A85e";
    if (etat === "inactif") return "#999999";
    return "#ccc";
  };

  // --- Render table row
  const renderTableRow = (m) => (
    <div
      key={m.id}
      className="flex flex-row items-center px-2 py-2 rounded-lg bg-blue-100/30 hover:bg-blue-100/50 transition duration-150 gap-2 border-l-4"
      style={{ borderLeftColor: getBorderColor(m) }}
    >
      <div className="flex-[2] text-white flex items-center gap-1">
        {m.prenom} {m.nom}
        {m.star && <span className="text-yellow-400 ml-1">⭐</span>}
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
          onClick={() => setPopupMember(popupMember?.id === m.id ? null : { ...m })}
          className="text-orange-500 underline text-sm whitespace-nowrap"
        >
          {popupMember?.id === m.id ? "Fermer détails" : "Détails"}
        </button>
      </div>
    </div>
  );

  const today = new Date();
  const dateDuJour = today.toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  // --- Render card (comme avant)
  const renderMemberCard = (m) => {
    return (
      <div key={m.id} className="bg-white p-3 rounded-xl shadow-md border-l-4 relative">
        <h2>{m.prenom} {m.nom}</h2>
      </div>
    ); // simplifié pour exemple
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-4 sm:p-6" style={{ background: "#2E3192" }}>
      <Header />
      <h1 className="text-2xl sm:text-3xl font-bold text-white text-center mb-2">Liste des Membres</h1>

      {/* Recherche et filtre */}
      <div className="w-full max-w-6xl flex gap-2 mb-4 flex-wrap">
        <input
          type="text"
          placeholder="Recherche..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-1/2 px-3 py-1 rounded-md border text-black"
        />
        <select value={filter} onChange={e => setFilter(e.target.value)} className="px-3 py-1 rounded-md border text-black text-sm">
          <option value="">-- Tous les états de contact --</option>
          <option value="nouveau">Nouveau</option>
          <option value="existant">Existant</option>
          <option value="inactif">Inactif</option>
        </select>
        <span className="text-white text-sm ml-2">{filteredMembers.length} membres</span>
      </div>

      {/* Toggle vue */}
      <div className="w-full max-w-6xl flex justify-center gap-4 mb-4">
        <button onClick={toggleView} className="text-sm font-semibold underline text-white">
          {view === "card" ? "Vue Table" : "Vue Carte"}
        </button>
      </div>

      {/* === Vue Carte */}
      {view === "card" && (
        <div className="w-full max-w-6xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
          {filteredMembers.map(renderMemberCard)}
        </div>
      )}

      {/* === Vue Table */}
      {view === "table" && (
        <div className="w-full max-w-6xl overflow-x-auto py-2">
          <div className="min-w-[700px] space-y-2">
            {filteredNouveaux.map(renderTableRow)}
            {filteredAnciens.map(renderTableRow)}
          </div>
        </div>
      )}

      {/* === Popups */}
      {popupMember && (
        <DetailsMemberPopup
          membre={popupMember}
          onClose={() => setPopupMember(null)}
        />
      )}

      {editMember && (
        <EditMemberPopup
          member={editMember}
          onClose={() => setEditMember(null)}
          onUpdateMember={onUpdateMemberHandler}
        />
      )}

      {/* Toast */}
      {showingToast && (
        <div className="fixed bottom-4 right-4 bg-black text-white px-4 py-2 rounded-lg shadow-lg z-50">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
