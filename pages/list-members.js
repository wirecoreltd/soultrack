"use client";

/**
 * Page: Liste des Membres
 * Description: Affiche les membres sous forme de carte ou tableau avec filtres et envoi WhatsApp.
 */

import { useEffect, useState, useRef } from "react";
import supabase from "../lib/supabaseClient";
import Image from "next/image";
import BoutonEnvoyer from "../components/BoutonEnvoyer";
import LogoutLink from "../components/LogoutLink";
import DetailsPopup from "../components/DetailsPopup";
import EditMemberPopup from "../components/EditMemberPopup";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useSearchParams } from "next/navigation";
import { useMembers } from "../context/MembersContext";

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

  const [selectedTargets, setSelectedTargets] = useState({});
  const [selectedTargetType, setSelectedTargetType] = useState({});
  const [toastMessage, setToastMessage] = useState("");
  const [showingToast, setShowingToast] = useState(false);

  const [openPhoneMenuId, setOpenPhoneMenuId] = useState(null); // menu téléphone/whatsapp
  const realtimeChannelRef = useRef(null);

  const statutLabels = {
    1: "En cours",
    2: "En attente",
    3: "Intégrer",
    4: "Refus",
  };

  const statusOptions = [
    "actif",
    "ancien",
    "visiteur",
    "veut rejoindre ICC",
    "refus",
    "integrer",
    "En cours",
    "a déjà son église",
  ];

  const { members, setAllMembers, updateMember } = useMembers();

  const showToast = (msg) => {
    setToastMessage(msg);
    setShowingToast(true);
    setTimeout(() => setShowingToast(false), 3500);
  };

  // -------------------- FETCH --------------------
  const fetchMembers = async (profile = null) => {
    setLoading(true);
    try {
      let query = supabase.from("v_membres_full").select("*").order("created_at", { ascending: false });
      if (conseillerIdFromUrl) query = query.eq("conseiller_id", conseillerIdFromUrl);
      else if (profile?.role === "Conseiller") query = query.eq("conseiller_id", profile.id);

      const { data, error } = await query;
      if (error) throw error;

      const withInitial = (data || []).map(m => ({ ...m, statut_initial: m.statut }));
      setAllMembers(data || []);
    } catch (err) {
      console.error("Erreur fetchMembers:", err);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCellules = async () => {
    const { data, error } = await supabase.from("cellules").select("id, cellule_full");
    if (error) console.error("Erreur:", error);
    if (data) setCellules(data);
  };

  const fetchConseillers = async () => {
    const { data } = await supabase.from("profiles").select("id, prenom, nom, telephone").eq("role", "Conseiller");
    if (data) setConseillers(data);
  };

  const handleAfterSend = (updatedMember, type, cible) => {
    const updatedWithActif = { ...updatedMember, statut: "actif" };
    updateMemberLocally(updatedMember.id, updatedWithActif);

    const cibleName = type === "cellule" ? cible.cellule_full : `${cible.prenom} ${cible.nom}`;
    showToast(`✅ ${updatedMember.prenom} ${updatedMember.nom} envoyé à ${cibleName}`);
  };

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
  useEffect(() => {
  if (realtimeChannelRef.current) {
    try { realtimeChannelRef.current.unsubscribe(); } catch (e) {}
    realtimeChannelRef.current = null;
  }

  const channel = supabase.channel("realtime:v_membres_full_and_related");

  // Membres
  channel.on("postgres_changes", { event: "*", schema: "public", table: "membres" }, () => fetchMembers());
  // Cellules
  channel.on("postgres_changes", { event: "*", schema: "public", table: "cellules" }, () => { fetchCellules(); fetchMembers(); });
  // Conseillers
  channel.on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, () => { fetchConseillers(); fetchMembers(); });
  // 🔹 Suivis membres
  channel.on("postgres_changes", { event: "*", schema: "public", table: "suivis_membres" }, ({ new: updatedSuivi }) => {
    setMembers(prev =>
      prev.map(m =>
        m.id === updatedSuivi.membre_id
          ? { ...m, suivi_statut_libelle: updatedSuivi.statut_suivis, commentaire_suivis: updatedSuivi.commentaire_suivis }
          : m
      )
    );
  });

  try { channel.subscribe(); } catch (err) { console.warn("Erreur subscription realtime:", err); }

  realtimeChannelRef.current = channel;
  return () => {
    try { if (realtimeChannelRef.current) { realtimeChannelRef.current.unsubscribe(); realtimeChannelRef.current = null; } } catch (e) {}
  };
}, []);

const onUpdateMember = (updatedMember) => {
  updateMember(updatedMember.id, updatedMember);
};

  // -------------------- Fermer menu téléphone en cliquant dehors --------------------
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".phone-menu")) {
        setOpenPhoneMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // -------------------- UTILS --------------------
  const updateMemberLocally = (id, updatedMember) => {
    setMembers(prev => prev.map(m => (m.id === id ? { ...m, ...updatedMember } : m)));
  };

  const getBorderColor = (m) => {
    const status = m.statut || "";
    const suiviStatus = m.suivi_statut_libelle || "";

    if (status === "refus" || suiviStatus === "refus") return "#f56f22";
    if (status === "actif" || suiviStatus === "actif") return "#4285F4";
    if (status === "a déjà son église" || suiviStatus === "a déjà son église") return "#f21705";
    if (status === "ancien" || suiviStatus === "ancien") return "#999999";
    if (status === "visiteur" || suiviStatus === "visiteur") return "#34A853";
    if (status === "veut rejoindre ICC" || suiviStatus === "veut rejoindre ICC") return "#34A853";

    return "#ccc";
  };

  const formatDate = (dateStr) => {
    try { return format(new Date(dateStr), "EEEE d MMMM yyyy", { locale: fr }); } catch { return ""; }
  };

  const filterBySearch = (list) => list.filter((m) => `${(m.prenom || "")} ${(m.nom || "")}`.toLowerCase().includes(search.toLowerCase()));

  const nouveaux = members.filter((m) => m.statut === "visiteur" || m.statut === "veut rejoindre ICC");
  const anciens = members.filter((m) => m.statut !== "visiteur" && m.statut !== "veut rejoindre ICC");

  const nouveauxFiltres = filterBySearch(
    filter ? nouveaux.filter(
      (m) =>
        m.statut === filter ||
        m.suivi_statut_libelle === filter ||
        (m.statut_suivis_actuel && statutLabels[m.statut_suivis_actuel] === filter)
    ) : nouveaux
  );

  const anciensFiltres = filterBySearch(
    filter ? anciens.filter(
      (m) =>
        m.statut === filter ||
        m.suivi_statut_libelle === filter ||
        (m.statut_suivis_actuel && statutLabels[m.statut_suivis_actuel] === filter)
    ) : anciens
  );

  const toggleDetails = (id) => setDetailsOpen(prev => ({ ...prev, [id]: !prev[id] }));
  const toggleStar = async (member) => {
  try {
    const { error } = await supabase
      .from("membres")
      .update({ star: !member.star })
      .eq("id", member.id);

    if (error) throw error;

    // Mise à jour instantanée locale
    setMembers(prev =>
      prev.map(m =>
        m.id === member.id ? { ...m, star: !member.star } : m
      )
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
  const besoins = (() => {
    if (!m.besoin) return "—";
    if (Array.isArray(m.besoin)) return m.besoin.join(", ");
    try { const arr = JSON.parse(m.besoin); return Array.isArray(arr) ? arr.join(", ") : m.besoin; } catch { return m.besoin; }
  })();

  return (
    <div key={m.id} className="bg-white p-3 rounded-xl shadow-md border-l-4 relative">
      {m.star && <span className="absolute top-3 right-3 text-yellow-400 text-xl">⭐</span>}
      {m.isNouveau && <span className="absolute top-3 left-3 bg-green-400 text-white px-2 py-1 rounded text-xs font-semibold">Nouveau</span>}
      
      <div className="flex flex-col items-center">
        <h2 className="text-lg font-bold text-center">{m.prenom} {m.nom}</h2>
        <div className="relative flex justify-center mt-1">
          {m.telephone ? (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setOpenPhoneMenuId(openPhoneMenuId === m.id ? null : m.id); }}
                className="text-blue-600 underline font-semibold text-center"
              >
                {m.telephone}
              </button>
              {openPhoneMenuId === m.id && (
                <div className="phone-menu absolute top-full mt-2 bg-white rounded-lg shadow-lg border z-50 w-44" onClick={(e) => e.stopPropagation()}>
                  <a href={`tel:${m.telephone}`} className="block px-4 py-2 text-sm text-black hover:bg-gray-100">📞 Appeler</a>
                  <a href={`sms:${m.telephone}`} className="block px-4 py-2 text-sm text-black hover:bg-gray-100">✉️ SMS</a>
                  <a href={`https://wa.me/${m.telephone.replace(/\D/g, "")}`} target="_blank" className="block px-4 py-2 text-sm text-black hover:bg-gray-100">💬 WhatsApp</a>
                  <a href={`https://wa.me/${m.telephone.replace(/\D/g, "")}`} target="_blank" className="block px-4 py-2 text-sm text-black hover:bg-gray-100">📱 Message WhatsApp</a>
                </div>
              )}
            </>
          ) : <span className="text-gray-400">—</span>}
        </div>

        <div className="w-full mt-2 text-sm text-black space-y-1">
          <p className="text-center">🏙️ Ville : {m.ville || "—"}</p>
          <p className="text-center">🕊 Statut : {m.statut || "—"}</p>
          <p>🏠 Cellule : {(m.cellule_ville && m.cellule_nom) ? `${m.cellule_ville} - ${m.cellule_nom}` : "—"}</p>
          <p>👤 Conseiller : {(m.conseiller_prenom || m.conseiller_nom) ? `${m.conseiller_prenom || ""} ${m.conseiller_nom || ""}`.trim() : "—"}</p>
        </div>

        <div className="mt-2 w-full">
          <label className="font-semibold text-sm">Envoyer à :</label>
          <select
            value={selectedTargetType[m.id] || ""}
            onChange={e => setSelectedTargetType(prev => ({ ...prev, [m.id]: e.target.value }))}
            className="mt-1 w-full border rounded px-2 py-1 text-sm"
          >
            <option value="">-- Choisir une option --</option>
            <option value="cellule">Une Cellule</option>
            <option value="conseiller">Un Conseiller</option>
          </select>
        
          {(selectedTargetType[m.id] === "cellule" || selectedTargetType[m.id] === "conseiller") && (
            <select
              value={selectedTargets[m.id] || ""}
              onChange={e => setSelectedTargets(prev => ({ ...prev, [m.id]: e.target.value }))}
              className="mt-1 w-full border rounded px-2 py-1 text-sm"
            >
              <option value="">-- Choisir {selectedTargetType[m.id]} --</option>
              {selectedTargetType[m.id] === "cellule"
                ? cellules.map(c => <option key={c.id} value={c.id}>{c.cellule_full || "—"}</option>)
                : null}
              {selectedTargetType[m.id] === "conseiller"
                ? conseillers.map(c => <option key={c.id} value={c.id}>{c.prenom || "—"} {c.nom || ""}</option>)
                : null}
            </select>
          )}
        
          {/* Affichage du bouton seulement si une option valide est sélectionnée */}
            {selectedTargetType[m.id] && selectedTargets[m.id] && (
              <div className="pt-2">
                <BoutonEnvoyer
                  membre={m}
                  type={selectedTargetType[m.id]}
                  cible={
                    selectedTargetType[m.id] === "cellule"
                      ? cellules.find(c => c.id === selectedTargets[m.id])
                      : conseillers.find(c => c.id === selectedTargets[m.id])
                  }
                  onEnvoyer={id =>
                    handleAfterSend(
                      id,
                      selectedTargetType[m.id],
                      selectedTargetType[m.id] === "cellule"
                        ? cellules.find(c => c.id === selectedTargets[m.id])
                        : conseillers.find(c => c.id === selectedTargets[m.id])
                    )
                  }
                  session={session}
                  showToast={showToast}
                />
              </div>
            )}
          </div>

        <button onClick={() => toggleDetails(m.id)} className="text-orange-500 underline text-sm mt-2" aria-label={`Détails ${m.prenom} ${m.nom}`}>
          {isOpen ? "Fermer détails" : "Détails"}
        </button>

        {isOpen && (
          <div className="text-black text-sm mt-2 w-full space-y-1">
            <p>💬 WhatsApp : {m.is_whatsapp ? "Oui" : "Non"}</p>
            <p>⚥ Sexe : {m.sexe || "—"}</p>
            <p>❓ Besoin : {besoins}</p>
            <p>📝 Infos : {m.infos_supplementaires || "—"}</p>
            <p>🧩 Comment est-il venu : {m.venu || "—"}</p>
            <p>🧩 Statut initial : {m.statut_initial || "—"}</p>
            <p>📝 Commentaire Suivis : {m.commentaire_suivis || "—"}</p>
            <button onClick={() => setEditMember(m)} className="text-blue-600 text-sm mt-2 w-full">
              ✏️ Modifier le contact
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// -------------------- Rendu des sections Nouveau / Ancien --------------------
return (
  <div className="min-h-screen flex flex-col items-center p-4 sm:p-6" style={{ background: "linear-gradient(135deg, #2E3192 0%, #92EFFD 100%)" }}>
    {/* Top Bar */}
    <div className="w-full max-w-5xl flex justify-between items-center mb-2">
      <button onClick={() => window.history.back()} className="flex items-center text-white hover:text-black-200">← Retour</button>
      <LogoutLink className="bg-white/10 text-white px-3 py-1 rounded-lg hover:bg-white/20 text-sm" />
    </div>
    <div className="w-full max-w-5xl flex justify-end mb-2"><p className="text-orange-200 text-sm">👋 Bienvenue {prenom || "cher membre"}</p></div>
    <Image src="/logo.png" alt="SoulTrack Logo" width={80} height={80} className="mx-auto mb-2" />
    <h1 className="text-2xl sm:text-3xl font-bold text-white text-center mb-2">Liste des Membres</h1>

    {/* Barre de recherche */}
    <div className="w-full max-w-4xl flex justify-center mb-2">
      <input
        type="text"
        placeholder="Recherche..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-2/3 px-3 py-1 rounded-md border text-black"
      />
    </div>

    {/* Filtre sous la barre de recherche */}
    <div className="w-full max-w-6xl flex justify-center items-center mb-4 gap-2 flex-wrap">
      <select
        value={filter}
        onChange={e => setFilter(e.target.value)}
        className="px-3 py-1 rounded-md border text-black text-sm"
      >
        <option value="">-- Tous les statuts --</option>
        {statusOptions.map((s, idx) => <option key={idx} value={s}>{s}</option>)}
      </select>
      <span className="text-white text-sm ml-2">{members.filter(m => !filter || m.statut === filter).length} membres</span>
    </div>

    {/* Toggle Vue Carte / Vue Table */}
      <div className="w-full max-w-6xl flex justify-center gap-4 mb-4">
        <button
          onClick={() => setView(view === "card" ? "table" : "card")}
          className="text-sm font-semibold underline text-white"
        >
          {view === "card" ? "Vue Table" : "Vue Carte"}
        </button>
      </div>
      
      {/* Affichage Vue Carte */}
      {view === "card" && (
        <>
          {/* Section Nouveau */}
          {nouveauxFiltres.length > 0 && (
            <>
              <h2 className="w-full max-w-6xl text-white font-bold mb-2 text-lg">
                💖 Bien aimé venu le {dateDuJour}
              </h2>
              <div className="w-full max-w-6xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                {nouveauxFiltres.map(m => renderMemberCard({ ...m, isNouveau: true }))}
              </div>
            </>
          )}
      
          {/* Section Ancien */}
          {anciensFiltres.length > 0 && (
            <>
              <h2 className="w-full max-w-6xl text-white font-bold mb-2 text-lg">
                Membres existants
              </h2>
              <div className="w-full max-w-6xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {anciensFiltres.map(m => renderMemberCard(m))}
              </div>
            </>
          )}
        </>
      )}
      
      {/* Affichage Vue Table */}
      {view === "table" && (
        <div className="w-full max-w-6xl overflow-x-auto">
          {/* Table des membres */}
        </div>
      )}       

      {/* ==================== VUE TABLE ==================== */}
        {view === "table" && (
          <div className="w-full max-w-6xl overflow-x-auto transition duration-200">
            <table className="w-full text-sm text-left border-separate border-spacing-0 table-auto">
              <thead className="bg-gray-200 text-black-800 text-sm uppercase">
                <tr>
                  <th className="px-1 py-1 rounded-tl-lg text-left">Nom complet</th>
                  <th className="px-1 py-1 text-left">Téléphone</th>
                  <th className="px-1 py-1 text-left">Statut</th>
                  <th className="px-1 py-1 text-left">Affectation</th>
                  <th className="px-1 py-1 rounded-tr-lg text-left">Actions</th>
                </tr>
              </thead>
        
              <tbody>
                {/* Nouveaux Membres */}
                {nouveauxFiltres.length > 0 && (
                  <tr>
                    <td colSpan={5} className="px-1 py-1 text-white font-semibold">
                      💖 Bien aimé venu le {formatDate(nouveauxFiltres[0].created_at)}
                    </td>
                  </tr>
                )}
        
                {nouveauxFiltres.map((m) => (
                  <tr key={m.id} className="border-b border-gray-300">
                    <td
                      className="px-1 py-1 border-l-4 rounded-l-md flex items-center gap-1 text-white whitespace-nowrap"
                      style={{ borderLeftColor: getBorderColor(m) }}
                    >
                      {m.prenom} {m.nom}
                      {m.star && <span className="text-yellow-400 ml-1">⭐</span>}
                      <span className="bg-blue-500 text-white text-xs px-1 rounded ml-1">Nouveau</span>
                    </td>
        
                    <td className="px-1 py-1 text-white whitespace-nowrap relative">
                      {m.telephone ? (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenPhoneMenuId(openPhoneMenuId === m.id ? null : m.id);
                            }}
                            className="text-orange-500 underline font-semibold text-sm"
                          >
                            {m.telephone}
                          </button>
        
                          {openPhoneMenuId === m.id && (
                            <div
                              className="absolute top-full mt-1 bg-white border rounded-lg shadow-lg w-40 z-50 phone-menu"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <a href={`tel:${m.telephone}`} className="block px-2 py-1 hover:bg-gray-100 text-black text-sm">📞 Appeler</a>
                              <a href={`sms:${m.telephone}`} className="block px-2 py-1 hover:bg-gray-100 text-black text-sm">✉️ SMS</a>
                              <a href={`https://wa.me/${m.telephone.replace(/\D/g, "")}`} target="_blank" className="block px-2 py-1 hover:bg-gray-100 text-black text-sm">💬 WhatsApp</a>
                              <a href={`https://wa.me/${m.telephone.replace(/\D/g, "")}?text=Bonjour`} target="_blank" className="block px-2 py-1 hover:bg-gray-100 text-black text-sm">📱 Message WhatsApp</a>
                            </div>
                          )}
                        </>
                      ) : "—"}
                    </td>
        
                    <td className="px-1 py-1 text-white whitespace-nowrap">{m.statut || "—"}</td>
        
                    <td className="px-1 py-1 text-white whitespace-nowrap">
                      {m.cellule_nom ? `🏠 ${m.cellule_ville || "—"} - ${m.cellule_nom}` 
                      : m.conseiller_prenom ? `👤 ${m.conseiller_prenom} ${m.conseiller_nom}` 
                      : "—"}
                    </td>
        
                    <td className="px-1 py-1 flex items-center gap-2 whitespace-nowrap">
                      <button
                        onClick={() => setPopupMember(popupMember?.id === m.id ? null : { ...m })}
                        className="text-orange-500 underline text-sm"
                      >
                        {popupMember?.id === m.id ? "Fermer détails" : "Détails"}
                      </button>
                      <button
                        onClick={() => setEditMember(m)}
                        className="text-blue-600 underline text-sm"
                      >
                        Modifier
                      </button>
                    </td>
                  </tr>
                ))}
        
                {/* Anciens Membres */}
                {anciensFiltres.length > 0 && (
                  <>
                    <tr>
                      <td colSpan={5} className="px-1 py-1 font-semibold text-lg text-white">
                        <span
                          style={{
                            background: "linear-gradient(to right, #3B82F6, #D1D5DB)",
                            WebkitBackgroundClip: "text",
                            color: "transparent",
                          }}
                        >
                          Membres existants
                        </span>
                      </td>
                    </tr>
        
                    {anciensFiltres.map((m) => (
                      <tr key={m.id} className="border-b border-gray-300">
                        <td
                          className="px-1 py-1 border-l-4 rounded-l-md flex items-center gap-1 text-white whitespace-nowrap"
                          style={{ borderLeftColor: getBorderColor(m) }}
                        >
                          {m.prenom} {m.nom}
                          {m.star && <span className="text-yellow-400 ml-1">⭐</span>}
                        </td>
        
                        <td className="px-1 py-1 text-white whitespace-nowrap relative">
                          {m.telephone ? (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenPhoneMenuId(openPhoneMenuId === m.id ? null : m.id);
                                }}
                                className="text-orange-500 underline font-semibold text-sm"
                              >
                                {m.telephone}
                              </button>
                              {openPhoneMenuId === m.id && (
                                <div
                                  className="absolute top-full mt-1 bg-white border rounded-lg shadow-lg w-40 z-50 phone-menu"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <a href={`tel:${m.telephone}`} className="block px-2 py-1 hover:bg-gray-100 text-black text-sm">📞 Appeler</a>
                                  <a href={`sms:${m.telephone}`} className="block px-2 py-1 hover:bg-gray-100 text-black text-sm">✉️ SMS</a>
                                  <a href={`https://wa.me/${m.telephone.replace(/\D/g, "")}`} target="_blank" className="block px-2 py-1 hover:bg-gray-100 text-black text-sm">💬 WhatsApp</a>
                                  <a href={`https://wa.me/${m.telephone.replace(/\D/g, "")}?text=Bonjour`} target="_blank" className="block px-2 py-1 hover:bg-gray-100 text-black text-sm">📱 Message WhatsApp</a>
                                </div>
                              )}
                            </>
                          ) : "—"}
                        </td>
        
                        <td className="px-1 py-1 text-white whitespace-nowrap">{m.statut || "—"}</td>
        
                        <td className="px-1 py-1 text-white whitespace-nowrap">
                          {m.cellule_nom ? `🏠 ${m.cellule_ville || "—"} - ${m.cellule_nom}` 
                          : m.conseiller_prenom ? `👤 ${m.conseiller_prenom} ${m.conseiller_nom}` 
                          : "—"}
                        </td>
        
                        <td className="px-1 py-1 flex items-center gap-2 whitespace-nowrap">
                          <button
                            onClick={() => setPopupMember(popupMember?.id === m.id ? null : { ...m })}
                            className="text-orange-500 underline text-sm"
                          >
                            {popupMember?.id === m.id ? "Fermer détails" : "Détails"}
                          </button>
                          <button
                            onClick={() => setEditMember(m)}
                            className="text-blue-600 underline text-sm"
                          >
                            Modifier
                          </button>
                        </td>
                      </tr>
                    ))}
                  </>
                )}
              </tbody>
            </table>
          </div>
        )}


      {popupMember && (
  <DetailsPopup
    membre={popupMember}
    onClose={() => setPopupMember(null)}
    cellules={cellules}
    conseillers={conseillers}
    handleAfterSend={handleAfterSend}
    session={session}
    showToast={showToast}
  />
)}

{editMember && (
  <EditMemberPopup
    member={editMember}
    onClose={() => setEditMember(null)}
    onUpdateMember={(updatedMember) => {
      updateMember(updatedMember.id, updatedMember); // 🔹 mise à jour instantanée
      setEditMember(null); // ferme le popup
    }}
  />
)}
            

      {/* Toast */}
      {showingToast && (
        <div className="fixed bottom-4 right-4 bg-black text-white px-4 py-2 rounded-lg shadow-lg z-50">{toastMessage}</div>
      )}
    </div>
  );
}
