"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import supabase from "../lib/supabaseClient";
import BoutonEnvoyer from "../components/BoutonEnvoyer";
import LogoutLink from "../components/LogoutLink";
import DetailsMemberPopup from "../components/DetailsMemberPopup";
import EditMemberPopup from "../components/EditMemberPopup";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useSearchParams } from "next/navigation";
import { useMembers } from "../context/MembersContext";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useRouter } from "next/navigation";
import ProtectedRoute from "../components/ProtectedRoute";
import useChurchScope from "../hooks/useChurchScope";

export default function ListMembers() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur", "Conseiller", "ResponsableCellule"]}>
      <ListMembersContent />
    </ProtectedRoute>
  );
}

function ListMembersContent() {
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
  const searchParams = useSearchParams();
  const conseillerIdFromUrl = searchParams.get("conseiller_id");
  const toBoolean = (val) => val === true || val === "true";
  const [userRole, setUserRole] = useState(null);

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
  const [selectedMember, setSelectedMember] = useState(null);
  const { members, setAllMembers } = useMembers();
  const [openPhoneId, setOpenPhoneId] = useState(null);
  const phoneMenuRef = useRef(null);
  const router = useRouter();
  const [userProfile, setUserProfile] = useState(null);


  const [view, setView] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("members_view") || "card";
    }
    return "card";
  });

  const { scopedQuery } = useChurchScope(); // 🔑 Utilisation correcte du hook scopedQuery

  // -------------------- Toast --------------------
  const showToast = (msg) => {
    setToastMessage(msg);
    setShowingToast(true);
    setTimeout(() => setShowingToast(false), 3500);
  };

  const handleUpdateMember = (updatedMember) => {
    setAllMembers((prev) =>
      prev.map((mem) => (mem.id === updatedMember.id ? updatedMember : mem))
    );
  };

  const statutSuiviLabels = {
    1: "En Suivis",
    2: "En attente",
    3: "Intégré",
    4: "Refus",
  };

  const formatDateFr = (dateString) => {
    if (!dateString) return "—";
    const d = new Date(dateString);
    const day = d.getDate().toString().padStart(2, "0");
    const months = [
      "Janv","Févr","Mars","Avr","Mai","Juin",
      "Juil","Août","Sept","Oct","Nov","Déc",
    ];
    return `${day} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  const formatMinistere = (ministereJson, autreMinistere) => {
    let ministereList = [];
    if (ministereJson) {
      try {
        const parsed =
          typeof ministereJson === "string" ? JSON.parse(ministereJson) : ministereJson;
        ministereList = Array.isArray(parsed) ? parsed : [parsed];
        ministereList = ministereList.filter((m) => m.toLowerCase() !== "autre");
      } catch {
        if (ministereJson.toLowerCase() !== "autre") ministereList = [ministereJson];
      }
    }
    if (autreMinistere?.trim()) {
      ministereList.push(autreMinistere.trim());
    }
    return ministereList.join(", ");
  };

  // -------------------- Supprimer un membre --------------------
  const handleSupprimerMembre = async (id) => {
    const { error } = await supabase
      .from("membres_complets")
      .update({ etat_contact: "supprime" })
      .eq("id", id);
    if (error) {
      console.error("Erreur suppression :", error);
      return;
    }
    setAllMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, etat_contact: "supprime" } : m))
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

  // -------------------- Après showToast --------------------
    const handleAfterSend = (memberId, type, cible) => {
      console.log("Contact envoyé :", memberId, type, cible);
      showToast("✅ Contact envoyé !");
      
      // Optionnel : mettre à jour le membre localement ou rafraîchir la liste
      // Par exemple si tu veux marquer le suivi comme "envoyé"
      setAllMembers(prev =>
        prev.map(m =>
          m.id === memberId
            ? { ...m, suivi_envoye: true } // tu peux créer un champ temporaire pour suivi
            : m
        )
      );
    };


// -------------------- Fetch membres via scopedQuery avec multi-roles --------------------
useEffect(() => {
  if (!scopedQuery || !userProfile) return;

  const fetchMembers = async () => {
    try {
      let query = supabase
        .from("membres_complets")
        .select("*")
        .eq("eglise_id", userProfile.eglise_id)
        .eq("branche_id", userProfile.branche_id);

      // 🔹 userProfile.roles est déjà un ARRAY PostgreSQL, donc on peut utiliser includes
      const rolesArray = Array.isArray(userProfile.roles) ? userProfile.roles : [userProfile.role];

      // 🔐 Filtrage pour les Conseillers
      if (rolesArray.includes("Conseiller") || rolesArray.includes("ResponsableIntegration")) {
        query = query.eq("conseiller_id", userProfile.id);
      }

      // 🔐 Filtrage pour les Responsables de Cellule
      if (rolesArray.includes("ResponsableCellule")) {
        const { data: cellulesData } = await supabase
          .from("cellules")
          .select("id")
          .eq("responsable_id", userProfile.id);

        const celluleIds = cellulesData?.map(c => c.id) || [];
        if (celluleIds.length > 0) {
          query = query.in("cellule_id", celluleIds);
        } else {
          setAllMembers([]);
          setLoading(false);
          return;
        }
      }

      const { data, error } = await query.order("created_at", { ascending: false });
      if (error) throw error;

      setAllMembers(data || []);
      setLoading(false);
    } catch (err) {
      console.error("Erreur fetchMembers:", err);
      setLoading(false);
    }
  };

  fetchMembers();
}, [userProfile, scopedQuery, setAllMembers]);


  // -------------------- Récupérer la session Supabase --------------------
    useEffect(() => {
      const getSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
      };
      getSession();
    
      // Optionnel : écouter les changements de session
      const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
      });
    
      return () => {
        listener.subscription.unsubscribe();
      };
    }, []);

  // -------------------- Fetch cellules et conseillers --------------------
  useEffect(() => {
  const fetchData = async () => {
    // 1. utilisateur connecté
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    // 2. récupérer eglise_id & branche_id
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, eglise_id, branche_id, role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) return;

    setUserProfile(profile);

    // 3. cellules filtrées
    const { data: cellulesData } = await supabase
      .from("cellules")
      .select("id, cellule_full")
      .eq("eglise_id", profile.eglise_id)
      .eq("branche_id", profile.branche_id)
      .order("cellule_full");

    if (cellulesData) setCellules(cellulesData);

    // 4. conseillers filtrés
    const { data: conseillersData } = await supabase
      .from("profiles")
      .select("id, prenom, nom, telephone")
      .eq("role", "Conseiller")
      .eq("eglise_id", profile.eglise_id)
      .eq("branche_id", profile.branche_id)
      .order("prenom");

    if (conseillersData) setConseillers(conseillersData);
  };

  fetchData();
}, []);


  // -------------------- Realtime --------------------
  useEffect(() => {
  if (realtimeChannelRef.current) {
    try {
      realtimeChannelRef.current.unsubscribe();
    } catch (e) {}
    realtimeChannelRef.current = null;
  }

  const channel = supabase.channel("realtime:membres_complets");

  const fetchScopedMembers = async () => {
    if (!scopedQuery) return;
    try {
      const query = scopedQuery("membres_complets");
      if (!query) return;
      const { data } = await query.order("created_at", { ascending: false });
      if (data) setAllMembers(data);
    } catch (err) {
      console.error("Erreur fetchMembers realtime:", err);
    }
  };

  channel.on(
    "postgres_changes",
    { event: "*", schema: "public", table: "membres_complets" },
    fetchScopedMembers
  );

  channel.on(
    "postgres_changes",
    { event: "*", schema: "public", table: "cellules" },
    () => {
      fetchCellules();
      fetchScopedMembers();
    }
  );

  channel.on(
    "postgres_changes",
    { event: "*", schema: "public", table: "profiles" },
    () => {
      fetchConseillers();
      fetchScopedMembers();
    }
  );

  try {
    channel.subscribe();
  } catch (err) {
    console.warn("Erreur subscription realtime:", err);
  }

  realtimeChannelRef.current = channel;

  return () => {
    try {
      if (realtimeChannelRef.current) {
        realtimeChannelRef.current.unsubscribe();
        realtimeChannelRef.current = null;
      }
    } catch (e) {}
  };
}, [scopedQuery, setAllMembers]);

  // -------------------- Filtrage --------------------
  const { filteredMembers, filteredNouveaux, filteredAnciens } = useMemo(() => {
    const actifs = members.filter((m) => m.etat_contact !== "supprime");
    const baseFiltered = filter
      ? actifs.filter((m) => m.etat_contact?.trim().toLowerCase() === filter.toLowerCase())
      : actifs;
    const searchFiltered = baseFiltered.filter(
      (m) => `${m.prenom || ""} ${m.nom || ""}`.toLowerCase().includes(search.toLowerCase())
    );
    const nouveaux = searchFiltered.filter(
      (m) => m.etat_contact?.trim().toLowerCase() === "nouveau"
    );
    const existants = searchFiltered.filter((m) =>
      ["existant", "ancien"].includes(m.etat_contact?.trim().toLowerCase())
    );
    return { filteredMembers: searchFiltered, filteredNouveaux: nouveaux, filteredAnciens: existants };
  }, [members, filter, search]);

  // -------------------- Handlers --------------------
  const toggleDetails = (id) => setDetailsOpen((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleMarquerCommeMembre = async (id) => {
    try {
      const { error } = await supabase
        .from("membres_complets")
        .update({ etat_contact: "existant" })
        .eq("id", id);
      if (error) throw error;

      setAllMembers((prev) =>
        prev.map((m) => (m.id === id ? { ...m, etat_contact: "existant" } : m))
      );
      showToast("✅ Ce contact est maintenant membre existant");
    } catch (err) {
      console.error("Erreur mise à jour statut :", err);
    }
  };

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

  const today = new Date();
  const dateDuJour = today.toLocaleDateString("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // -------------------- Gestion clic en dehors menu téléphone --------------------
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".phone-menu-container")) {
        setOpenPhoneId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // -------------------- Sauvegarde de la vue --------------------
  useEffect(() => {
    localStorage.setItem("members_view", view);
  }, [view]);

  // -------------------- renderMemberCard --------------------
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

    return (
   
        <div key={m.id} className="bg-white px-3 pb-3 pt-1 rounded-xl shadow-md border-l-4 relative">
          
          {/* Badge Nouveau */}
          {m.isNouveau && (
            <div className="absolute top-2 right-3 flex items-center gap-1">
              <span className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600 bg-white px-3 py-1 rounded-md shadow">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-blue-600" />
                Nouveau
              </span>
            </div>
          )}
    
          {/* Nom */}
          <div className="flex flex-col items-center mt-8">
            <h2 className="text-base font-bold text-center">
              {m.prenom} {m.nom}
            </h2>
    
            {/* Téléphone */}
              <div className="relative text-center mt-2 phone-menu-container">
                {m.telephone ? (
                  <>
                    <p
                      className="text-orange-500 underline cursor-pointer font-semibold"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenPhoneId(openPhoneId === m.id ? null : m.id);
                      }}
                    >
                      {m.telephone}
                    </p>
              
                    {openPhoneId === m.id && (
                      <div
                        className="absolute top-full mt-1 left-1/2 -translate-x-1/2 bg-white rounded-lg shadow-lg border z-50 w-56"
                        //onClick={(e) => e.stopPropagation()}
                      >
                        <a
                          href={`tel:${m.telephone}`}
                          className="block px-4 py-2 text-sm text-black hover:bg-gray-100"
                        >
                          📞 Appeler
                        </a>
                        <a
                          href={`sms:${m.telephone}`}
                          className="block px-4 py-2 text-sm text-black hover:bg-gray-100"
                        >
                          ✉️ SMS
                        </a>
                        <a
                          href={`https://wa.me/${m.telephone.replace(/\D/g, "")}?call`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block px-4 py-2 text-sm text-black hover:bg-gray-100"
                        >
                          📱 Appel WhatsApp
                        </a>
                        <a
                          href={`https://wa.me/${m.telephone.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block px-4 py-2 text-sm text-black hover:bg-gray-100"
                        >
                          💬 Message WhatsApp
                        </a>
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
            <div className="w-full flex justify-end mt-3">
                <p className="text-[11px] text-gray-400">
                  Créé le {formatDateFr(m.created_at)}</p></div>   
            <p>🏠 Cellule : {m.cellule_id ? `${cellules.find(c => c.id === m.cellule_id)?.cellule_full || "—"}` : "—"}</p>
            <p>👤 Conseiller : {m.conseiller_id ? `${conseillers.find(c => c.id === m.conseiller_id)?.prenom || ""} ${conseillers.find(c => c.id === m.conseiller_id)?.nom || ""}`.trim() : "—"}</p>
          </div>            

          <div className="mt-2 w-full">
            <label className="font-semibold text-sm">Envoyer ce contact en suivi :</label>
          
            {/* Sélecteur principal */}
            <select
              value={selectedTargetType[m.id] || ""}
              onChange={e => {
                const val = e.target.value;
                setSelectedTargetType(prev => ({ ...prev, [m.id]: val }));
                // réinitialiser la cible si on change de type
                setSelectedTargets(prev => ({ ...prev, [m.id]: "" }));
              }}
              className="mt-1 w-full border rounded px-2 py-1 text-sm"
            >
              <option value="">-- Choisir une option --</option>
              <option value="cellule">Une Cellule</option>
              <option value="conseiller">Un Conseiller</option>
              <option value="numero">Saisir un numéro</option>
            </select>
          
            {/* Si Cellule ou Conseiller → afficher un select */}
            {(selectedTargetType[m.id] === "cellule" || selectedTargetType[m.id] === "conseiller") && (
              <select
                value={selectedTargets[m.id] || ""}
                onChange={e => setSelectedTargets(prev => ({ ...prev, [m.id]: e.target.value }))}
                className="mt-1 w-full border rounded px-2 py-1 text-sm"
              >
                <option value="">-- Choisir {selectedTargetType[m.id]} --</option>
                {selectedTargetType[m.id] === "cellule" &&
                  cellules.map(c => <option key={c.id} value={c.id}>{c.cellule_full || "—"}</option>)}
                {selectedTargetType[m.id] === "conseiller" &&
                  conseillers.map(c => <option key={c.id} value={c.id}>{c.prenom || "—"} {c.nom || ""}</option>)}
              </select>
            )}
          
            {/* Si Numéro → afficher un input */}
            {selectedTargetType[m.id] === "numero" && (
              <input
                type="tel"
                placeholder="Saisir un numéro"
                value={selectedTargets[m.id] || ""}
                onChange={e => setSelectedTargets(prev => ({ ...prev, [m.id]: e.target.value }))}
                className="mt-1 w-full border rounded px-2 py-1 text-sm"
              />
            )}
          
            {/* Bouton Envoyer */}
            {selectedTargetType[m.id] && selectedTargets[m.id] && (
              <div className="pt-2">
                <BoutonEnvoyer
                  membre={m}
                  type={selectedTargetType[m.id]}
                  cible={
                    selectedTargetType[m.id] === "cellule"
                      ? cellules.find(c => c.id === selectedTargets[m.id])
                      : selectedTargetType[m.id] === "conseiller"
                      ? conseillers.find(c => c.id === selectedTargets[m.id])
                      : selectedTargets[m.id] // ici le numéro saisi
                  }
                  onEnvoyer={id =>
                    handleAfterSend(
                      id,
                      selectedTargetType[m.id],
                      selectedTargetType[m.id] === "cellule"
                        ? cellules.find(c => c.id === selectedTargets[m.id])
                        : selectedTargetType[m.id] === "conseiller"
                        ? conseillers.find(c => c.id === selectedTargets[m.id])
                        : selectedTargets[m.id] // le numéro
                    )
                  }
                  session={session}
                  showToast={showToast}
                />
              </div>
            )}
          </div>

              {/* Bouton Marquer comme membre — seulement pour les contacts "Nouveau" */}
                {m.etat_contact?.trim().toLowerCase() === "nouveau" && (
                  <div className="w-full flex justify-end mt-4">
                    <button
                      onClick={() => {
                        if (
                          window.confirm(
                            "⚠️ Confirmation\n\nCe contact n’a plus besoin d’être suivi.\nVoulez-vous vraiment le déplacer dans les membres existants ?"
                          )
                        ) {
                          supabase
                            .from("membres_complets")
                            .update({ etat_contact: "existant" })
                            .eq("id", m.id)
                            .then(({ error, data }) => {
                              if (error) {
                                console.error("Erreur mise à jour :", error);
                                showToast("❌ Erreur lors du déplacement");
                              } else {
                                setAllMembers((prev) =>
                                  prev.map((mem) =>
                                    mem.id === m.id ? { ...mem, etat_contact: "existant" } : mem
                                  )
                                );
                                showToast(
                                  <span className="inline-block bg-white text-green-600 px-2 py-1 rounded shadow text-xs font-semibold">
                                    ✅ Contact déplacé dans membres existants
                                  </span>
                                );
                              }
                            });
                        }
                      }}
                      className="ml-auto bg-white text-green-600 px-3 py-1 rounded-md text-sm font-semibold shadow-sm hover:shadow-md transition-shadow"
                    >
                      ✅ Marquer comme membre
                    </button>
                  </div>
                )}
                            
            {/* Bouton Détails */}
            <button
              onClick={() => toggleDetails(m.id)}
              className="text-orange-500 underline text-sm mt-3"
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
                <p>💧 Baptême d’Eau : {m.bapteme_eau || "—"}</p>
                <p>🔥 Baptême de Feu : {m.bapteme_esprit || "—"}</p>
                <p>✒️ Formation : {m.Formation || ""}</p>
                <p>❤️‍🩹 Soin Pastoral : {m.Soin_Pastoral || ""}</p>
                <p>💢 Ministère : {formatMinistere(m.Ministere, m.Autre_Ministere) || "—"}</p>
                <p>❓ Besoin : {besoins}</p>
                <p>📝 Infos : {m.infos_supplementaires || ""}</p>
                <p>🧩 Comment est-il venu : {m.venu || ""}</p>
                <p>✨ Raison de la venue : {m.statut_initial || ""}</p>
                <p>🙏 Prière du salut : {m.priere_salut || "—"}</p>
                <p>☀️ Type de conversion : {m.type_conversion || ""}</p>
                <p>📝 Commentaire Suivis : {m.commentaire_suivis || ""}</p>
                <p>📑 Commentaire Suivis Evangelisation : {m.Commentaire_Suivi_Evangelisation || ""}</p>   
                <div className="flex flex-col items-center">
                    
                 <div className="flex flex-col items-center w-full p-4 bg-white rounded-lg shadow-md space-y-2">
                    {/* Modifier */}
                    <button
                      onClick={() => setEditMember(m)}
                      className="w-full text-orange-500 text-sm py-2 rounded-md"
                    >
                      ✏️ Modifier le contact
                    </button>
                  
                    {/* ✅ Intégration terminée — visible uniquement pour les Conseillers */}
                    {userRole === "Conseiller" && m.integration_fini !== "fini" && (
                      <button
                        onClick={async () => {
                          const confirmAction = window.confirm(
                            "⚠️ Confirmation\n\nCe contact ne sera plus attribué à vous.\nVoulez-vous continuer ?"
                          );
                          if (!confirmAction) return;
                  
                          try {
                            const { error } = await supabase
                              .from("membres_complets")
                              .update({
                                integration_fini: "fini",
                                conseiller_id: null,
                              })
                              .eq("id", m.id);
                  
                            if (error) throw error;
                  
                            setAllMembers(prev => prev.filter(mem => mem.id !== m.id));
                            showToast("✅ Intégration terminée. Contact détaché.");
                          } catch (err) {
                            console.error("Erreur intégration :", err);
                            showToast("❌ Erreur lors de l'opération");
                          }
                        }}
                        className="ml-auto bg-white text-blue-600 w-full py-2 rounded-md font-semibold shadow-sm"
                      >
                        ✅ Intégration terminée
                      </button>
                    )}
                  
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
                      className="w-full text-red-600 text-xs font-semibold py-1.5 rounded-md"
                    >
                      🗑️ Supprimer le contact
                    </button>
                  </div>  
               </div>
             </div>
            )}
          </div>
        </div>
      );
    };

  // -------------------- Rendu --------------------
  return (
    <div className="min-h-screen flex flex-col items-center p-4 sm:p-6" style={{ background: "#333699" }}>
      {/* Top Bar */}
      <Header />
      <h1 className="text-2xl sm:text-3xl font-bold text-white text-center mb-2">Liste des Membres</h1>

      {/* Barre de recherche */}
      <div className="w-full max-w-4xl flex justify-center mb-2">
        <input type="text" placeholder="Recherche..." value={search} onChange={e => setSearch(e.target.value)} className="w-full sm:w-2/3 px-3 py-1 rounded-md border text-black"/>
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

      <div className="w-full max-w-6xl flex justify-between items-center mb-4">
        {/* Toggle Carte/Table */}
        <button onClick={() => setView(view === "card" ? "table" : "card")} className="text-sm font-semibold underline text-white">
          {view === "card" ? "Vue Table" : "Vue Carte"}
        </button>
      
        {/* Bouton Ajouter un membre */}
        <button
          onClick={() => router.push("/AddContact")}
          className="text-white font-semibold px-4 py-2 rounded shadow text-sm"
        >
          ➕ Ajouter un membre
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
              <div className="px-2 py-1 rounded shadow text-white bg-[#2E3192] rounded">
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
          userRole={userRole} 
          onDelete={handleSupprimerMembre}
          commentChanges={commentChanges}
          handleCommentChange={handleCommentChange}
          statusChanges={statusChanges}
          setStatusChanges={setStatusChanges}
          updateSuivi={updateSuivi}
          setAllMembers={setAllMembers} 
          updating={updating}
        />
      )}

      {editMember && (
        <EditMemberPopup
          member={editMember}
          onClose={() => setEditMember(null)}
          onUpdateMember={(updatedMember) => {
            setAllMembers(prev =>
              prev.map(m => (m.id === updatedMember.id ? { ...m, ...updatedMember } : m))
            );
            setEditMember(null);
            showToast("✅ Contact mis à jour !");
          }}
        />
      )}

      {/* Toast */}
      {showingToast && (
        <div className="fixed bottom-4 right-4 bg-black text-white px-4 py-2 rounded-lg shadow-lg z-50">{toastMessage}</div>
      )}
<Footer />
    </div>
  );
}
