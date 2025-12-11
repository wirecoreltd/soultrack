//pages/list-members.js✅

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
    const { data } = await supabase.from("cellules").select("id, cellule, responsable, telephone");
    if (data) setCellules(data);
  };

  const fetchConseillers = async () => {
    const { data } = await supabase.from("profiles").select("id, prenom, nom, telephone").eq("role", "Conseiller");
    if (data) setConseillers(data);
  };

  const handleAfterSend = (updatedMember, type, cible) => {
    updateMemberLocally(updatedMember.id, updatedMember);
    const cibleName = type === "cellule" ? cible.cellule : `${cible.prenom} ${cible.nom}`;
    showToast(`✅ ${updatedMember.prenom} ${updatedMember.nom} envoyé à ${cibleName}`);
  };

  useEffect(() => {
    const fetchSessionAndProfile = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
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

  const toggleDetails = (id) => setDetailsOpen(prev => ({ ...prev, [id]: !prev[id] }));

  const renderMemberCard = (m) => {
    const isOpen = detailsOpen[m.id];
    const besoins = (() => {
      if (!m.besoin) return "—";
      if (Array.isArray(m.besoin)) return m.besoin.join(", ");
      try {
        const arr = JSON.parse(m.besoin);
        return Array.isArray(arr) ? arr.join(", ") : m.besoin;
      } catch { return m.besoin; }
    })();

    return (
      <div key={m.id} className="bg-white p-3 rounded-xl shadow-md border-l-4 relative" style={{ borderLeftColor: getBorderColor(m) }}>
        {m.star && <span className="absolute top-3 right-3 text-yellow-400 text-xl">⭐</span>}
        <div className="flex flex-col items-center">
          <h2 className="text-lg font-bold text-center">{m.prenom} {m.nom}</h2>
          <div className="flex flex-col space-y-1 text-sm text-black-600 w-full items-center">
            <div className="flex justify-center items-center space-x-2">📱 {m.telephone || "—"}</div>
            <div className="flex justify-center items-center space-x-2">🏙️ Ville : {m.ville || "—"}</div>
            <div className="flex justify-center items-center space-x-2">🕊 Statut : {m.statut || "—"}</div>
            <div className="flex flex-col items-start space-y-1 w-full">
              <div>🏠 {(m.cellule_ville && m.cellule_nom) ? `${m.cellule_ville} - ${m.cellule_nom}` : m.suivi_cellule_nom || ""}</div>
              <div>👤 {(m.conseiller_prenom || m.conseiller_nom) ? `${m.conseiller_prenom} ${m.conseiller_nom}`.trim() : ""}</div>
            </div>
          </div>

         {/* ENVOYER À */}
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
        ? cellules.map(c => (
            <option key={c.id} value={c.id}>
              {c.ville ? c.ville : "—"} - {c.cellule ? c.cellule : "—"}
            </option>
          ))
        : conseillers.map(c => (
            <option key={c.id} value={c.id}>
              {c.prenom || "—"} {c.nom || ""}
            </option>
          ))
      }
    </select>
  )}

            {selectedTargets[m.id] && (
              <div className="pt-2">
                <BoutonEnvoyer
                  membre={m}
                  type={selectedTargetType[m.id]}
                  cible={selectedTargetType[m.id] === "cellule" ? cellules.find(c => c.id === selectedTargets[m.id]) : conseillers.find(c => c.id === selectedTargets[m.id])}
                  onEnvoyer={id => handleAfterSend(id, selectedTargetType[m.id], selectedTargetType[m.id] === "cellule" ? cellules.find(c => c.id === selectedTargets[m.id]) : conseillers.find(c => c.id === selectedTargets[m.id]))}
                  session={session}
                  showToast={showToast}
                />
              </div>
            )}
          </div>

          {/* Détails */}
          <button onClick={() => toggleDetails(m.id)} className="text-orange-500 underline text-sm mt-2" aria-label={`Détails ${m.prenom} ${m.nom}`}>
            {isOpen ? "Fermer détails" : "Détails"}
          </button>

          {isOpen && (
            <div className="text-black text-sm mt-2 w-full space-y-1">
              <p>💬 WhatsApp : {m.is_whatsapp ? "Oui" : "Non"}</p>
              <p>⚥ Sexe : {m.sexe || "—"}</p>
              <p>❓ Besoin : {besoins}</p>
              <p>📝 Infos : {m.infos_supplementaires || "—"}</p>
              <p>🏷 Statut Suivi : {m.suivi_statut_libelle || "—"}</p>
              <p>📝 Commentaire Suivis : {m.suivi_commentaire_suivis || "—"}</p>
              <button onClick={() => setEditMember(m)} className="text-blue-600 text-sm mt-2 w-full">
                ✏️ Modifier le contact
              </button>
            </div>
          )}
        </div>
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
              <h3 className="text-white text-lg mb-3 font-semibold">Membres existants</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {anciensFiltres.map(renderMemberCard)}
              </div>
            </div>
          )}
        </div>
      )}

            {/* ==================== VUE TABLE ==================== */}
              {view === "table" && (
                <div className="w-full max-w-6xl overflow-x-auto transition duration-200">
                  <table className="w-full text-sm text-left border-separate border-spacing-0">
                    <thead className="bg-gray-200 text-black-800 text-sm uppercase">
                      <tr>
                        <th className="px-4 py-2 rounded-tl-lg">Nom complet</th>
                        <th className="px-4 py-2">Téléphone</th>
                        <th className="px-4 py-2">Statut</th>
                        <th className="px-4 py-2">Cellule</th>
                        <th className="px-4 py-2">Conseiller</th>
                        <th className="px-4 py-2 rounded-tr-lg">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Nouveaux Membres */}
                      {nouveauxFiltres.length > 0 && (
                        <tr>
                          <td colSpan={6} className="px-4 py-2 text-white font-semibold">
                            💖 Bien aimé venu le {formatDate(nouveauxFiltres[0].created_at)}
                          </td>
                        </tr>
                      )}
                      {nouveauxFiltres.map((m) => (
                        <tr key={m.id} className="border-b border-gray-300">
                          <td
                            className="px-4 py-2 border-l-4 rounded-l-md flex items-center gap-2 text-white"
                            style={{ borderLeftColor: getBorderColor(m) }}
                          >
                            {m.prenom} {m.nom} {m.star && <span className="text-yellow-400 ml-1">⭐</span>}
                            <span className="bg-blue-500 text-white text-xs px-1 rounded ml-2">Nouveau</span>
                          </td>
                          <td className="px-4 py-2 text-white">{m.telephone || "—"}</td>
                          <td className="px-4 py-2 text-white">{m.statut || "—"}</td>
                          <td className="px-4 py-2 text-white">{m.cellule_nom ? `${m.cellule_nom} (${m.cellule_ville || "—"})` : "—"}</td>
                          <td className="px-4 py-2 text-white">{m.conseiller_prenom ? `${m.conseiller_prenom} ${m.conseiller_nom}` : "—"}</td>
                          <td className="px-4 py-2 flex items-center gap-2">
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
                            <td colSpan={6} className="px-4 py-2 font-semibold text-lg text-white">
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
                                className="px-4 py-2 border-l-4 rounded-l-md flex items-center gap-2 text-white"
                                style={{ borderLeftColor: getBorderColor(m) }}
                              >
                                {m.prenom} {m.nom} {m.star && <span className="text-yellow-400 ml-1">⭐</span>}
                              </td>
                              <td className="px-4 py-2 text-white">{m.telephone || "—"}</td>
                              <td className="px-4 py-2 text-white">{m.statut || "—"}</td>
                              <td className="px-4 py-2 text-white">{m.cellule_nom ? `${m.cellule_nom} (${m.cellule_ville || "—"})` : "—"}</td>
                              <td className="px-4 py-2 text-white">{m.conseiller_prenom ? `${m.conseiller_prenom} ${m.conseiller_nom}` : "—"}</td>
                              <td className="px-4 py-2 flex items-center gap-2">
                                <button
                                  onClick={() => setPopupMember(popupMember?.id === m.id ? null : m)}
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

      {/* Popups */}
      {editMember && <EditMemberPopup member={editMember} onClose={() => setEditMember(null)} onUpdateMember={(updatedMember) => { updateMemberLocally(updatedMember.id, updatedMember); setEditMember(null); showToast("✅ Membre mis à jour"); }} />}
      {popupMember && <DetailsPopup membre={popupMember} onClose={() => setPopupMember(null)} cellules={cellules} conseillers={conseillers} statusOptions={statusOptions} showToast={showToast} />}

      {/* Toast */}
      {showingToast && <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-lg">{toastMessage}</div>}
    </div>
  );
}
