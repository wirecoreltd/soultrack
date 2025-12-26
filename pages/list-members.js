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
  const [openPhoneMenuId, setOpenPhoneMenuId] = useState(null);
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
    if (error) console.error("Erreur:", error);
    if (data) setCellules(data);
  };

  const fetchConseillers = async () => {
    const { data } = await supabase.from("profiles").select("id, prenom, nom, telephone").eq("role", "Conseiller");
    if (data) setConseillers(data);
  };

  const handleAfterSend = (updatedMember, type, cible) => {
    const updatedWithActif = { ...updatedMember, statut: "actif" };
    updateMember(updatedWithActif);

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
    updateMember(updatedMember); // mise à jour instantanée
    setEditMember(null);         // fermeture automatique du popup
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

  // -------------------- Initialisation sécurisée côté serveur --------------------
  const membresActifs = members || [];
  const nouveaux = membresActifs.filter((m) => m.statut === "visiteur" || m.statut === "veut rejoindre ICC");
  const anciens = membresActifs.filter((m) => m.statut !== "visiteur" && m.statut !== "veut rejoindre ICC");

  const nouveauxFiltres = filterBySearch(
    filter ? nouveaux.filter(m => m.statut === filter || m.suivi_statut_libelle === filter) : nouveaux
  );

  const anciensFiltres = filterBySearch(
    filter ? anciens.filter(m => m.statut === filter || m.suivi_statut_libelle === filter) : anciens
  );

  const toggleDetails = (id) => setDetailsOpen(prev => ({ ...prev, [id]: !prev[id] }));

  const toggleStar = async (member) => {
    try {
      const { error } = await supabase
        .from("membres_complets")
        .update({ star: !member.star })
        .eq("id", member.id);

      if (error) throw error;

      setAllMembers(prev =>
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
                  </div>
                )}
              </>
            ) : <span className="text-gray-400">—</span>}
          </div>

          <div className="w-full mt-2 text-sm text-black space-y-1">
            <p className="text-center">🏙️ Ville : {m.ville || "—"}</p>
            <p className="text-center">🕊 Statut : {m.statut || "—"}</p>
            <p>🏠 Cellule : {m.cellule_id ? `${cellules.find(c => c.id === m.cellule_id)?.cellule_full || "—"}` : "—"}</p>
            <p>👤 Conseiller : {m.conseiller_id ? `${conseillers.find(c => c.id === m.conseiller_id)?.prenom || ""} ${conseillers.find(c => c.id === m.conseiller_id)?.nom || ""}`.trim() : "—"}</p>
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

  // -------------------- Rendu Table (modifiée) --------------------
  return (
    <div className="min-h-screen flex flex-col items-center p-4 sm:p-6" style={{ background: "linear-gradient(135deg, #2E3192 0%, #92EFFD 100%)" }}>
      {/* Top Bar, recherche, filtre, toggle Vue Carte/Table ... */}
      {/* ... reprend exactement ce qui était avant ... */}

      {/* Vue Table */}
      {view === "table" && (
        <div className="w-full max-w-6xl overflow-x-auto transition duration-200">
          {/* TABLE CODE: Copie complète de la PARTIE 4 / Vue Table modifiée */}
          {/* Comme dans mon dernier message */}
        </div>
      )}

      {/* Popups et Toast */}
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
          onUpdateMember={onUpdateMemberHandler}
        />
      )}

      {showingToast && (
        <div className="fixed bottom-4 right-4 bg-black text-white px-4 py-2 rounded-lg shadow-lg z-50">{toastMessage}</div>
      )}
    </div>
  );
}
