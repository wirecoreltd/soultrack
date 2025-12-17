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
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useSearchParams } from "next/navigation";

export default function ListMembers() {
  const [members, setMembers] = useState([]);
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

  const [phoneMenuOpen, setPhoneMenuOpen] = useState(null); // Carte
  const [phoneActionsOpen, setPhoneActionsOpen] = useState(null); // Table
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

      setMembers(data || []);
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

    const cibleName = type === "cellule" ? cible.cellule : `${cible.prenom} ${cible.nom}`;
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
    channel.on("postgres_changes", { event: "*", schema: "public", table: "membres" }, () => fetchMembers());
    channel.on("postgres_changes", { event: "*", schema: "public", table: "cellules" }, () => { fetchCellules(); fetchMembers(); });
    channel.on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, () => { fetchConseillers(); fetchMembers(); });

    try { channel.subscribe(); } catch (err) { console.warn("Erreur subscription realtime:", err); }

    realtimeChannelRef.current = channel;
    return () => {
      try { if (realtimeChannelRef.current) { realtimeChannelRef.current.unsubscribe(); realtimeChannelRef.current = null; } } catch (e) {}
    };
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

  // -------------------- HANDLE CLICK OUTSIDE --------------------
  useEffect(() => {
    const handleClickOutside = (e) => {
      setPhoneMenuOpen(null);
      setPhoneActionsOpen(null);
      // on ne ferme pas popupMember ici pour que Détails reste ouvert si on clique dedans
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const renderMemberCard = (m) => {
    return (
      <div key={m.id} className="bg-white p-3 rounded-xl shadow-md border-l-4 relative" style={{ borderLeftColor: getBorderColor(m) }} onClick={e => e.stopPropagation()}>
        {m.star && <span className="absolute top-3 right-3 text-yellow-400 text-xl">⭐</span>}

        <h2 className="text-lg font-bold text-center">{m.prenom} {m.nom}</h2>

        {/* TELEPHONE */}
        <div className="relative flex items-center justify-center mt-2">
          {m.telephone ? (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setPhoneMenuOpen(phoneMenuOpen === m.id ? null : m.id); }}
                className="text-orange-400 font-semibold select-text"
              >
                {m.telephone}
              </button>

              {phoneMenuOpen === m.id && (
                <div
                  className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg border z-50 w-44"
                  onClick={e => e.stopPropagation()}
                >
                  <a href={`tel:${m.telephone}`} className="block px-4 py-2 text-sm hover:bg-gray-100">📞 Appeler</a>
                  <a href={`sms:${m.telephone}`} className="block px-4 py-2 text-sm hover:bg-gray-100">✉️ SMS</a>
                  <a href={`https://wa.me/${m.telephone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="block px-4 py-2 text-sm hover:bg-gray-100">💬 WhatsApp</a>
                </div>
              )}
            </>
          ) : <span className="text-gray-400">—</span>}
        </div>

        {/* BOUTONS DETAILS / MODIFIER */}
        <div className="flex justify-center gap-4 mt-4">
          <button
            onClick={(e) => { e.stopPropagation(); setPopupMember(popupMember?.id === m.id ? null : m); }}
            className="text-orange-500 underline text-sm"
          >
            {popupMember?.id === m.id ? "Fermer détails" : "Détails"}
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); setEditMember(editMember?.id === m.id ? null : m); }}
            className="text-blue-600 underline text-sm"
          >
            Modifier
          </button>
        </div>

        {/* POPUP DÉTAILS */}
        {popupMember?.id === m.id && (
          <div className="popup-member absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white p-4 rounded-lg shadow-lg z-50" onClick={e => e.stopPropagation()}>
            <p>💬 WhatsApp : {m.is_whatsapp ? "Oui" : "Non"}</p>
            <p>⚥ Sexe : {m.sexe || "—"}</p>
            <p>❓ Besoin : {m.besoin || "—"}</p>
            <p>📝 Infos : {m.infos_supplementaires || "—"}</p>
            <p>🧩 Comment est-il venu : {m.venu || "—"}</p>
            <p>🧩 Statut initial : {m.statut || "—"}</p>
            <p>📝 Commentaire Suivis : {m.suivi_commentaire_suivis || "—"}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-4 sm:p-6" style={{ background: "linear-gradient(135deg, #2E3192 0%, #92EFFD 100%)" }}>
      {/* Top Bar */}
      <div className="w-full max-w-5xl flex justify-between items-center mb-4">
        <button onClick={() => window.history.back()} className="flex items-center text-white hover:text-black-200">← Retour</button>
        <LogoutLink className="bg-white/10 text-white px-3 py-1 rounded-lg hover:bg-white/20 text-sm" />
      </div>
      <div className="w-full max-w-5xl flex justify-end mb-4"><p className="text-orange-200 text-sm">👋 Bienvenue {prenom || "cher membre"}</p></div>
      <Image src="/logo.png" alt="SoulTrack Logo" width={80} height={80} className="mx-auto mb-4" />
      <h1 className="text-2xl sm:text-3xl font-bold text-white text-center mb-4">Liste des Membres</h1>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row justify-between w-full max-w-5xl gap-2 mb-4">
        <div className="flex flex-wrap items-center gap-2">
          <select value={filter} onChange={e => setFilter(e.target.value)} className="px-2 py-1 rounded-lg border text-sm">
            <option value="">Tous les statuts</option>
            {statusOptions.map(s => (<option key={s}>{s}</option>))}
          </select>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..." className="px-2 py-1 rounded-lg border text-sm w-40 sm:w-48" />
          <span className="text-white text-sm">({nouveauxFiltres.length + anciensFiltres.length})</span>
        </div>
        <button onClick={() => setView(view === "card" ? "table" : "card")} className="text-white text-sm underline">{view === "card" ? "Vue Table" : "Vue Carte"}</button>
      </div>

      {/* Loading */}
      {loading && <div className="text-white text-lg py-6">Chargement des membres...</div>}

      {/* Carte */}
      {!loading && view === "card" && (
        <div className="w-full max-w-5xl space-y-8">
          {nouveauxFiltres.length > 0 && (
            <div>
              <p className="text-white text-lg mb-4 ml-1">💖 Bien aimé venu le {formatDate(nouveauxFiltres[0].created_at)}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {nouveauxFiltres.map(renderMemberCard)}
              </div>
            </div>
          )}
          {anciensFiltres.length > 0 && (
            <div className="mt-8">
              <h3 className="mb-4 text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-gray-300">
                Membres existants
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {anciensFiltres.map(renderMemberCard)}
              </div>
            </div>
          )}
        </div>
      )}
 {/* Popups */}
      {editMember && <EditMemberPopup member={editMember} onClose={() => setEditMember(null)} onUpdateMember={(updatedMember) => { updateMemberLocally(updatedMember.id, updatedMember); setEditMember(null); showToast("✅ Membre mis à jour"); }} />}
      {popupMember && <DetailsPopup membre={popupMember} onClose={() => setPopupMember(null)} cellules={cellules} conseillers={conseillers} statusOptions={statusOptions} showToast={showToast} />}


      {/* Toast */}
      {showingToast && <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-lg">{toastMessage}</div>}
    </div>
  );
}
