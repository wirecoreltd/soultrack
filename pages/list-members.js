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

  const renderMemberCard = (m) => {
    const isOpen = detailsOpen[m.id];
    const besoins = (() => {
      if (!m.besoin) return "—";
      if (Array.isArray(m.besoin)) return m.besoin.join(", ");
      try { const arr = JSON.parse(m.besoin); return Array.isArray(arr) ? arr.join(", ") : m.besoin; } catch { return m.besoin; }
    })();

    return (
      <div key={m.id} className="bg-white p-2 rounded-lg shadow-md border-l-4 relative flex flex-col items-center" style={{ borderLeftColor: getBorderColor(m) }}>
        {m.star && <span className="absolute top-2 right-2 text-yellow-400 text-lg">⭐</span>}
        <h2 className="text-lg font-bold text-center">{m.prenom} {m.nom}</h2>
        <div className="text-sm w-full flex flex-col items-center space-y-1">
          {/* Numéro */}
          <div className="relative">
            {m.telephone ? (
              <>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setOpenPhoneMenuId(openPhoneMenuId === m.id ? null : m.id); }}
                  className="text-orange-400 font-semibold select-text"
                >
                  {m.telephone}
                </button>
                {openPhoneMenuId === m.id && (
                  <div className="phone-menu absolute top-full mt-1 left-0 bg-white rounded-md shadow-md border w-40 z-50 p-1" onClick={(e) => e.stopPropagation()}>
                    <a href={`tel:${m.telephone}`} className="block text-black px-2 py-1 text-sm hover:bg-gray-100">📞 Appeler</a>
                    <a href={`sms:${m.telephone}`} className="block text-black px-2 py-1 text-sm hover:bg-gray-100">✉️ SMS</a>
                    <a href={`https://wa.me/${m.telephone.replace(/\D/g,"")}`} target="_blank" rel="noopener noreferrer" className="block text-black px-2 py-1 text-sm hover:bg-gray-100">💬 WhatsApp</a>
                    <a href={`https://wa.me/${m.telephone.replace(/\D/g,"")}`} target="_blank" rel="noopener noreferrer" className="block text-black px-2 py-1 text-sm hover:bg-gray-100">📱 Msg WhatsApp</a>
                  </div>
                )}
              </>
            ) : <span className="text-gray-400">—</span>}
          </div>

          <div className="flex flex-col w-full text-xs mt-1 space-y-0.5">
            <div>🏙️ Ville : {m.ville || "—"}</div>
            <div>🕊 Statut : {m.statut || "—"}</div>
            <div>🏠 Cellule / 👤 Conseiller : {m.cellule_nom ? `${m.cellule_nom} (${m.cellule_ville || "—"})` : m.conseiller_prenom ? `${m.conseiller_prenom} ${m.conseiller_nom}` : "—"}</div>
          </div>
        </div>

        {/* Envoi */}
        <div className="w-full mt-1">
          <label className="text-xs font-semibold">Envoyer à :</label>
          <select
            value={selectedTargetType[m.id] || ""}
            onChange={e => setSelectedTargetType(prev => ({ ...prev, [m.id]: e.target.value }))}
            className="w-full text-xs rounded px-1 py-1 border mt-1"
          >
            <option value="">-- Choisir --</option>
            <option value="cellule">Cellule</option>
            <option value="conseiller">Conseiller</option>
          </select>
          {(selectedTargetType[m.id] === "cellule" || selectedTargetType[m.id] === "conseiller") && (
            <select
              value={selectedTargets[m.id] || ""}
              onChange={e => setSelectedTargets(prev => ({ ...prev, [m.id]: e.target.value }))}
              className="w-full text-xs rounded px-1 py-1 border mt-1"
            >
              <option value="">-- Choisir {selectedTargetType[m.id]} --</option>
              {selectedTargetType[m.id] === "cellule" ? cellules.map(c => (
                <option key={c.id} value={c.id}>{c.cellule_full || "—"}</option>
              )) : null}
              {selectedTargetType[m.id] === "conseiller" ? conseillers.map(c => (
                <option key={c.id} value={c.id}>{c.prenom} {c.nom}</option>
              )) : null}
            </select>
          )}
          {selectedTargets[m.id] && (
            <div className="pt-1">
              <BoutonEnvoyer
                membre={m}
                type={selectedTargetType[m.id]}
                cible={selectedTargetType[m.id] === "cellule" ? cellules.find(c => c.id === selectedTargets[m.id]) : conseillers.find(c => c.id === selectedTargets[m.id])}
                onEnvoyer={id => handleAfterSend(
                  id,
                  selectedTargetType[m.id],
                  selectedTargetType[m.id] === "cellule" ? cellules.find(c => c.id === selectedTargets[m.id]) : conseillers.find(c => c.id === selectedTargets[m.id])
                )}
                session={session}
                showToast={showToast}
              />
            </div>
          )}
        </div>

        {/* Détails */}
        <button onClick={() => toggleDetails(m.id)} className="text-orange-500 underline text-xs mt-1 w-full">
          {isOpen ? "Fermer détails" : "Détails"}
        </button>
        {isOpen && (
          <div className="text-black text-xs mt-1 w-full space-y-0.5">
            <p>💬 WhatsApp : {m.is_whatsapp ? "Oui" : "Non"}</p>
            <p>⚥ Sexe : {m.sexe || "—"}</p>
            <p>❓ Besoin : {besoins}</p>
            <p>📝 Infos : {m.infos_supplementaires || "—"}</p>
            <p>🧩 Comment est-il venu : {m.venu || "—"}</p>
            <p>🧩 Statut initial : {m.statut_initial || "—"}</p>
            <p>📝 Commentaire Suivis : {m.suivi_commentaire_suivis || "—"}</p>
            <button onClick={() => setEditMember(m)} className="text-blue-600 text-xs mt-1 w-full">✏️ Modifier le contact</button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-2 sm:p-4 md:p-6 bg-gradient-to-r from-blue-800 to-cyan-300">
      {/* Top Bar */}
      <div className="w-full max-w-5xl flex justify-between items-center mb-2">
        <button onClick={() => window.history.back()} className="flex items-center text-white hover:text-gray-200">← Retour</button>
        <LogoutLink className="bg-white/10 text-white px-3 py-1 rounded-lg hover:bg-white/20 text-sm" />
      </div>
      <div className="w-full max-w-5xl flex justify-end mb-2"><p className="text-orange-200 text-sm">👋 Bienvenue {prenom || "cher membre"}</p></div>
      <Image src="/logo.png" alt="SoulTrack Logo" width={80} height={80} className="mx-auto mb-2" />
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white text-center mb-2">Liste des Membres</h1>

      {/* Filtre avec compteur */}
      <div className="w-full max-w-6xl flex justify-center items-center mb-1 gap-2 flex-wrap">
        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="px-3 py-1 rounded-md border text-black text-sm"
        >
          <option value="">-- Tous les statuts --</option>
          {statusOptions.map((s, idx) => <option key={idx} value={s}>{s}</option>)}
        </select>
        <span className="text-white text-sm ml-2">
          {members.filter(m => !filter || m.statut === filter).length} membres
        </span>
      </div>

      {/* Barre de recherche */}
      <div className="w-full max-w-6xl flex justify-center mb-2">
        <input
          type="text"
          placeholder="Recherche..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 px-3 py-1 rounded-md border text-black text-sm"
        />
      </div>

      {/* Toggle Vue */}
      <div className="w-full max-w-6xl flex justify-center gap-4 mb-2">
        <button onClick={() => setView("card")} className={`text-sm font-semibold ${view === "card" ? "text-white underline" : "text-gray-300"}`}>Vue Carte</button>
        <button onClick={() => setView("table")} className={`text-sm font-semibold ${view === "table" ? "text-white underline" : "text-gray-300"}`}>Vue Table</button>
      </div>

      {/* Liste */}
      {view === "card" ? (
        <div className="w-full max-w-6xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
          {nouveauxFiltres.map(renderMemberCard)}
          {anciensFiltres.map(renderMemberCard)}
        </div>
      ) : (
        <div className="w-full max-w-6xl overflow-x-auto transition duration-200 text-xs">
          <table className="w-full border-separate border-spacing-0">
            <thead className="bg-gray-200 text-black uppercase">
              <tr>
                <th className="px-2 py-1 rounded-tl-lg">Nom complet</th>
                <th className="px-2 py-1">Téléphone</th>
                <th className="px-2 py-1">Statut</th>
                <th className="px-2 py-1">Cellule / Conseiller</th>
                <th className="px-2 py-1 rounded-tr-lg">Actions</th>
              </tr>
            </thead>
            <tbody>
              {nouveauxFiltres.length > 0 && (
                <tr>
                  <td colSpan={5} className="px-2 py-1 text-white font-semibold">💖 Bien aimé venu le {formatDate(nouveauxFiltres[0].created_at)}</td>
                </tr>
              )}
              {nouveauxFiltres.concat(anciensFiltres).map((m) => (
                <tr key={m.id} className="border-b border-gray-300">
                  <td className="px-2 py-1 border-l-4 rounded-l-md flex items-center gap-1 text-white" style={{ borderLeftColor: getBorderColor(m) }}>
                    {m.prenom} {m.nom} {m.star && <span className="text-yellow-400">⭐</span>}
                    {nouveauxFiltres.includes(m) && <span className="bg-blue-500 text-white text-xs px-1 rounded ml-1">Nouveau</span>}
                  </td>
                  <td className="px-2 py-1 text-black relative">
                    {m.telephone ? (
                      <button type="button" onClick={(e) => { e.stopPropagation(); setOpenPhoneMenuId(openPhoneMenuId === m.id ? null : m.id); }} className="text-orange-400 font-semibold select-text">
                        {m.telephone}
                      </button>
                    ) : "—"}
                    {openPhoneMenuId === m.id && (
                      <div className="phone-menu absolute top-full mt-1 left-0 bg-white rounded-md shadow-md border w-40 z-50 p-1">
                        <a href={`tel:${m.telephone}`} className="block text-black px-2 py-1 hover:bg-gray-100">📞 Appeler</a>
                        <a href={`sms:${m.telephone}`} className="block text-black px-2 py-1 hover:bg-gray-100">✉️ SMS</a>
                        <a href={`https://wa.me/${m.telephone.replace(/\D/g,"")}`} target="_blank" rel="noopener noreferrer" className="block text-black px-2 py-1 hover:bg-gray-100">💬 WhatsApp</a>
                        <a href={`https://wa.me/${m.telephone.replace(/\D/g,"")}`} target="_blank" rel="noopener noreferrer" className="block text-black px-2 py-1 hover:bg-gray-100">📱 Msg WhatsApp</a>
                      </div>
                    )}
                  </td>
                  <td className="px-2 py-1 text-white">{m.statut || "—"}</td>
                  <td className="px-2 py-1 text-white">{m.cellule_nom ? `${m.cellule_nom} (${m.cellule_ville || "—"})` : m.conseiller_prenom ? `${m.conseiller_prenom} ${m.conseiller_nom}` : "—"}</td>
                  <td className="px-2 py-1 flex items-center gap-1">
                    <button onClick={() => setPopupMember(popupMember?.id === m.id ? null : m)} className="text-orange-500 underline text-xs">{popupMember?.id === m.id ? "Fermer" : "Détails"}</button>
                    <button onClick={() => setEditMember(m)} className="text-blue-600 underline text-xs">Modifier</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Popups */}
      {editMember && (
        <EditMemberPopup
          member={editMember}
          onClose={() => setEditMember(null)}
          onUpdateMember={(updatedMember) => { updateMemberLocally(updatedMember.id, updatedMember); setEditMember(null); showToast("✅ Membre mis à jour"); }}
        />
      )}
      {popupMember && (
        <DetailsPopup
          membre={popupMember}
          onClose={() => setPopupMember(null)}
          cellules={cellules}
          conseillers={conseillers}
          statusOptions={statusOptions}
          showToast={showToast}
        />
      )}

      {/* Toast */}
      {showingToast && <div className="fixed bottom-2 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-lg text-xs">{toastMessage}</div>}
    </div>
  );
}
