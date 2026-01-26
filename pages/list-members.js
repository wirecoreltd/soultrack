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
  const realtimeChannelRef = useRef(null);
  const [etatContactFilter, setEtatContactFilter] = useState("");

  const { members, setAllMembers, updateMember } = useMembers();

  // -------------------- Toast --------------------
  const showToast = (msg) => {
    setToastMessage(msg);
    setShowingToast(true);
    setTimeout(() => setShowingToast(false), 3500);
  };

   const statutSuiviLabels = {
    1: "Envoyé",
    2: "En attente",
    3: "Intégré",
    4: "Refus",
  };
 
  // -------------------- Supprimer un membre (LOGIQUE) --------------------
   const handleSupprimerMembre = async (id) => {
    const { error } = await supabase
      .from("membres_complets")
      .update({ etat_contact: "supprime" })
      .eq("id", id);
  
    if (error) {
      console.error("Erreur suppression :", error);
      return;
    }
  
    // ✅ MISE À JOUR IMMÉDIATE DU CONTEXT
    setAllMembers((prev) =>
      prev.map((m) =>
        m.id === id
          ? { ...m, etat_contact: "supprime" }
          : m
      )
    );  
    showToast("❌ Contact supprimé");
  };

  // -------------------- Commentaires / suivi --------------------
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

  // -------------------- Fetch data --------------------
  const fetchMembers = async (profile = null) => {
  setLoading(true);
  try {
    let query = supabase
      .from("membres_complets")
      .select("*")
      .neq("etat_contact", "supprime")  // <- filtre ici
      .order("created_at", { ascending: false });

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

  const handleAfterSend = (updatedMember, type, cible) => {
    const updatedWithActif = { ...updatedMember, statut: "actif" };
    updateMember(updatedWithActif);
    const cibleName = type === "cellule" ? cible.cellule_full : `${cible.prenom} ${cible.nom}`;
    showToast(`✅ ${updatedMember.prenom} ${updatedMember.nom} envoyé à ${cibleName}`);
  };

  // -------------------- useEffect initial --------------------
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

     // -------------------- Filtrage --------------------
      const { filteredMembers, filteredNouveaux, filteredAnciens } = useMemo(() => {
  
     // ✅ 1️⃣ EXCLURE LES SUPPRIMÉS (OBLIGATOIRE)
     const actifs = members.filter(
       (m) => m.etat_contact !== "supprime"
     );
   
     // ✅ 2️⃣ FILTRE PAR ÉTAT (nouveau / existant / etc.)
     const baseFiltered = filter
       ? actifs.filter(
           (m) =>
             m.etat_contact?.trim().toLowerCase() === filter.toLowerCase()
         )
       : actifs;
   
     // ✅ 3️⃣ RECHERCHE TEXTE
     const searchFiltered = baseFiltered.filter((m) =>
       `${m.prenom || ""} ${m.nom || ""}`
         .toLowerCase()
         .includes(search.toLowerCase())
     );
   
     // ✅ 4️⃣ LOGIQUE NOUVEAUX / ANCIENS (INCHANGÉE)
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
   }, [members, filter, search]);

  const toggleDetails = (id) => setDetailsOpen((prev) => ({ ...prev, [id]: !prev[id] }));

  const getBorderColor = (m) => {
    if (!m.etat_contact) return "#ccc";
    const etat = m.etat_contact.trim().toLowerCase();
    if (etat === "Existant") return "#34A853";
    if (etat === "Nouveau") return "#34A85e";
    if (etat === "Inactif") return "#999999";
    return "#ccc";
  };

  const formatDate = (dateStr) => {
    try { return format(new Date(dateStr), "EEEE d MMMM yyyy", { locale: fr }); } catch { return ""; }
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
    
      const besoins = !m.besoin
        ? "—"
        : Array.isArray(m.besoin)
        ? m.besoin.join(", ")
        : (() => {
            try {
              const arr = JSON.parse(m.besoin);
              return Array.isArray(arr) ? arr.join(", ") : m.besoin;
            } catch {
              return m.besoin;
            }
          })();
    
      const formatMinistere = (ministere) => {
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
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#2E3192" }} />
              <span className="text-xs font-semibold" style={{ color: "#2E3192" }}>
                Nouveau
              </span>
            </div>
          )}
    
          {/* Nom */}
          <div className="flex flex-col items-center mt-6">
            <h2 className="text-lg font-bold text-center">
              {m.prenom} {m.nom}
            </h2>
    
            {/* Téléphone */}
            <div className="relative flex justify-center mt-3">
              {m.telephone ? (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenPhoneMenuId(openPhoneMenuId === m.id ? null : m.id);
                    }}
                    className="text-orange-500 underline font-semibold"
                  >
                    {m.telephone}
                  </button>
    
                  {openPhoneMenuId === m.id && (
                    <div
                      className="absolute top-full mt-2 bg-white rounded-lg shadow-lg border z-50 w-52"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <a href={`tel:${m.telephone}`} className="block px-4 py-2 text-sm hover:bg-gray-100">📞 Appeler</a>
                      <a href={`sms:${m.telephone}`} className="block px-4 py-2 text-sm hover:bg-gray-100">✉️ SMS</a>
                      <a href={`https://wa.me/${m.telephone.replace(/\D/g, "")}`} target="_blank" 
                      rel="noopener noreferrer"className="block px-4 py-2 text-sm hover:bg-gray-100">💬 WhatsApp</a>
                    </div>
                  )}
                </>
              ) : (
                <span className="text-gray-400">—</span>
              )}
            </div>
    
            {/* Infos principales */}
            <div className="w-full mt-2 text-sm text-black space-y-1">
            <p className="text-center">🏙️ Ville : {m.ville || "—"}</p>
            <p className="text-center">🕊 Etat Contact : {m.etat_contact || "—"}</p>
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
    
            {/* Bouton Détails */}
            <button
              onClick={() => toggleDetails(m.id)}
              className="text-orange-500 underline text-sm mt-2"
            >
              {isOpen ? "Fermer détails" : "Détails"}
            </button>
    
            {/* Détails */}
            {isOpen && (
              <div className="text-black text-sm mt-2 w-full space-y-1">
                <p className="font-semibold text-center" style={{ color: "#2E3192" }}>
                  💡 Statut Suivi : {statutSuiviLabels[m.statut_suivis] || m.suivi_statut || ""}</p>
                <p>💬 WhatsApp : {m.is_whatsapp ? "Oui" : "Non"}</p>
                <p>🎗️ Sexe : {m.sexe || ""}</p>
                //<p>💧 Baptême d’Eau : {m.bapteme_eau ? "Oui" : "Non"}</p>
                //<p>🔥 Baptême de Feu : {m.bapteme_esprit ? "Oui" : "Non"}</p>
                <p>💧 Baptême d’Eau : {m.bapteme_eau === true ? "Oui" : m.bapteme_eau === false ? "Non" : ""}</p>
                <p>🔥 Baptême de Feu : {m.bapteme_esprit === true ? "Oui" : m.bapteme_esprit === false ? "Non" : ""}</p>   
                <p>✒️ Formation : {m.Formation || ""}</p>
                <p>❤️‍🩹 Soin Pastoral : {m.Soin_Pastoral || ""}</p>
                <p>💢 Ministère : {formatMinistere(m.Ministere)}</p>
                <p>❓ Besoin : {besoins}</p>
                <p>📝 Infos : {m.infos_supplementaires || ""}</p>
                <p>🧩 Comment est-il venu : {m.venu || ""}</p>
                <p>✨ Raison de la venue : {m.statut_initial || ""}</p>
                <p>🙏 Prière du salut : {m.priere_salut || "—"}</p>
                <p>☀️ Type de conversion : {m.type_conversion || ""}</p>
                <p>📝 Commentaire Suivis : {m.commentaire_suivis || ""}</p>
                <p>📑 Commentaire Suivis Evangelisation : {m.Commentaire_Suivi_Evangelisation || ""}</p>   
                <div className="flex flex-col items-center">
                 {/* Modifier */}
                 <button
                   onClick={() => setEditMember(m)}
                   className="text-blue-600 text-sm mt-2 w-full"
                 >
                   ✏️ Modifier le contact
                 </button>
               
                 {/* Supprimer */}
                 <button
                   onClick={() => {
                     if (
                       window.confirm(
                         "⚠️ Suppression définitive\n\n" +
                         "Voulez-vous vraiment supprimer ce contact ?\n\n" +
                         "Cette action supprimera également TOUT l’historique du contact (suivi, commentaires, transferts).\n" +
                         "Cette action est irréversible."
                       )
                     ) {
                       handleSupprimerMembre(m.id);
                     }
                   }}
                   className="text-red-600 text-sm mt-2 w-full"
                 >
                   🗑️ Supprimer le contact
                 </button>
               </div>
             </div>
            )}
          </div>
        </div>
      );
    };

  // -------------------- Rendu --------------------
  return (
    <div className="min-h-screen flex flex-col items-center p-4 sm:p-6" style={{ background: "#2E3192" }}>
      {/* Top Bar */}
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

      {/* Toggle Carte/Table */}
      <div className="w-full max-w-6xl flex justify-center gap-4 mb-4">
        <button onClick={() => setView(view === "card" ? "table" : "card")} className="text-sm font-semibold underline text-white">
          {view === "card" ? "Vue Table" : "Vue Carte"}
        </button>
      </div>

      {/* ==================== VUE CARTE ==================== */}
      {view === "card" && (
        <>
          {filteredNouveaux.length > 0 && (
            <>
              <h2 className="w-full max-w-6xl text-white font-bold mb-2 text-lg">💖 Bien aimé venu le {dateDuJour}</h2>
              <div className="w-full max-w-6xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                {filteredNouveaux.map(m => renderMemberCard({ ...m, isNouveau: true }))}
              </div>
            </>
          )}
          {filteredAnciens.length > 0 && (
            <>
              <h2 className="w-full max-w-6xl font-bold mb-2 text-lg bg-gradient-to-r from-blue-500 to-gray-300 bg-clip-text text-transparent">Membres existants</h2>
              <div className="w-full max-w-6xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {filteredAnciens.map(m => renderMemberCard(m))}
              </div>
            </>
          )}
        </>
      )}
      
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
            {filteredNouveaux.length > 0 && (
              <div className="px-2 py-1 text-white bg-[#2E3192] rounded">
                💖 Bien aimé venu le {formatDate(filteredNouveaux[0].created_at)}
              </div>
            )}
      
            {filteredNouveaux.map((m) => (
              <div
                key={m.id}
                className="flex flex-col px-2 py-2 rounded-lg bg-blue-100/30 hover:bg-blue-100/50 transition duration-150 border-l-4"
                style={{ borderLeftColor: getBorderColor(m) }}>                             

                {/* Ligne principale */}
                <div className="flex flex-row items-center gap-2">
                  <div className="flex-[2] text-white font-semibold flex items-center gap-2">
                  <span>{m.prenom} {m.nom}</span>                
                  <span className="flex items-center gap-1 text-xs font-semibold text-orange">
                  <span className="inline-block w-2 h-2 rounded-full bg-orange" />
                    Nouveau
                  </span>
                </div>

                  <div className="flex-[1] text-white">{m.telephone || "—"}</div>
                  <div className="flex-[1] text-white">{m.statut}</div>
                  <div className="flex-[2] text-white">
                    {m.cellule_id
                      ? `🏠 ${cellules.find((c) => c.id === m.cellule_id)?.cellule_full || "—"}`
                      : m.conseiller_id
                      ? `👤 ${conseillers.find((c) => c.id === m.conseiller_id)?.prenom} ${conseillers.find((c) => c.id === m.conseiller_id)?.nom}`
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
              </div>
            ))}
      
            {/* Membres existants */}
            {filteredAnciens.length > 0 && (
              <>
                <div className="px-2 py-1 font-semibold text-lg">
                  <span style={{ background: "linear-gradient(to right, #3B82F6, #D1D5DB)", WebkitBackgroundClip: "text", color: "transparent" }}>
                    Membres existants
                  </span>
                </div>
                {filteredAnciens.map((m) => (
              <div
                key={m.id}
                className="flex flex-row items-center px-2 py-2 rounded-lg bg-blue-100/30 hover:bg-blue-100/50 transition duration-150 gap-2 border-l-4"
                style={{ borderLeftColor: getBorderColor(m) }}
              >
                <div className="flex-[2] text-white font-semibold flex items-center gap-1">
                  <span>{m.prenom} {m.nom}</span>
                  {m.star && <span className="text-yellow-400 ml-1">⭐</span>}
                </div>
            
                <div className="flex-[1] text-white">
                  {m.telephone || "—"}
                </div>
            
                <div className="flex-[1] text-white">
                  {m.etat_contact || "—"}
                </div>
            
                <div className="flex-[2] text-white">
                  {m.cellule_id
                    ? `🏠 ${cellules.find((c) => c.id === m.cellule_id)?.cellule_full || "—"}`
                    : m.conseiller_id
                    ? `👤 ${conseillers.find((c) => c.id === m.conseiller_id)?.prenom} ${conseillers.find((c) => c.id === m.conseiller_id)?.nom}`
                    : "—"}
                </div>
            
                <div className="flex-[1]">
                  <button
                    onClick={() =>
                      setPopupMember(popupMember?.id === m.id ? null : { ...m })
                    }
                    className="text-orange-500 underline text-sm whitespace-nowrap"
                  >
                    {popupMember?.id === m.id ? "Fermer détails" : "Détails"}
                                  </button>
                                </div>
                              </div>
                            ))}
                          </>
                        )}
                      </div>
                    </div>
                  )}
            
                  {/* Popups */}
      {popupMember && (
        <DetailsMemberPopup
          membre={popupMember}
          onClose={() => setPopupMember(null)}
          cellules={cellules}
          conseillers={conseillers}
          session={session}
          onDelete={handleSupprimerMembre}
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
          onUpdateMember={(updatedMember) => {
            updateMember(updatedMember);
            setEditMember(null);
            setPopupMember(prev => prev?.id === updatedMember.id ? { ...prev, ...updatedMember } : prev);
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
