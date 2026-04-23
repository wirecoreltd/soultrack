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
import HeaderPages from "../components/HeaderPages";
import Footer from "../components/Footer";
import { useRouter } from "next/navigation";
import ProtectedRoute from "../components/ProtectedRoute";
import useChurchScope from "../hooks/useChurchScope";
import SuiviPopup from "../components/SuiviPopup";

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
  const besoinFromUrl = searchParams.get("besoin");
  const dateDebut = searchParams.get("dateDebut");
  const dateFin = searchParams.get("dateFin");

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
  const [showScrollTop, setShowScrollTop] = useState(false);
  
//--------------------------------------//
   // 🔒 Sécurisation maximale des rôles
  let rolesArray = [];

if (userProfile?.roles) {
  if (Array.isArray(userProfile.roles)) {
    rolesArray = userProfile.roles;
  } else if (typeof userProfile.roles === "string") {
    rolesArray = userProfile.roles
      .replace("{", "")
      .replace("}", "")
      .split(",");
  }
}
  //--------------------------------------//

const role = userProfile?.role;

const canAddMember =
  role === "Administrateur" ||
  role === "ResponsableIntegration";


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
    1: "En Attente",
    2: "En Suivis",
    3: "Intégré",
    4: "Refus",
  };

  const logStats = async (member, updatedMember, userProfile) => {
  if (!userProfile) return;

  const logs = [];

  // 🔹 MINISTERE
  if (updatedMember.Ministere) {
    const ministeres =
      typeof updatedMember.Ministere === "string"
        ? JSON.parse(updatedMember.Ministere)
        : updatedMember.Ministere;

    ministeres.forEach((m) => {
      logs.push({
        membre_id: member.id,
        eglise_id: userProfile.eglise_id,
        branche_id: userProfile.branche_id,
        type: "ministere",
        valeur: m,
      });
    });
  }

  // 🔹 BESOIN
  if (updatedMember.besoin) {
    const besoins =
      typeof updatedMember.besoin === "string"
        ? JSON.parse(updatedMember.besoin)
        : updatedMember.besoin;

    besoins.forEach((b) => {
      logs.push({
        membre_id: member.id,
        eglise_id: userProfile.eglise_id,
        branche_id: userProfile.branche_id,
        type: "besoin",
        valeur: b,
      });
    });
  }

  // 🔹 SERVITEUR
  if (updatedMember.star === true && updatedMember.etat_contact === "existant") {
    logs.push({
      membre_id: member.id,
      eglise_id: userProfile.eglise_id,
      branche_id: userProfile.branche_id,
      type: "serviteur",
      valeur: "true",
    });
  }

  if (logs.length > 0) {
    await supabase.from("stats_ministere_besoin").insert(logs);
  }
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

   // -------------------- Scroll to top--------------------
  useEffect(() => {
  const handleScroll = () => {
    if (window.scrollY > 300) { // montre le bouton après 300px de scroll
      setShowScrollTop(true);
    } else {
      setShowScrollTop(false);
    }
  };

  window.addEventListener("scroll", handleScroll);
  return () => window.removeEventListener("scroll", handleScroll);
}, []);

  const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
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
  
        // 🔹 Si on vient d'un conseiller spécifique
        if (conseillerIdFromUrl) {
          query = query.eq("conseiller_id", conseillerIdFromUrl);
        } else {
          // 🔐 Filtrage selon le rôle
          const rolesArray = Array.isArray(userProfile.roles)
            ? userProfile.roles
            : [userProfile.role];
  
          if (rolesArray.includes("Conseiller") || rolesArray.includes("ResponsableIntegration")) {
            query = query.eq("conseiller_id", userProfile.id);
          }
  
          if (rolesArray.includes("ResponsableCellule")) {
            const { data: cellulesData } = await supabase
              .from("cellules")
              .select("id")
              .eq("responsable_id", userProfile.id);
  
            const celluleIds = cellulesData?.map(c => c.id) || [];
            if (celluleIds.length > 0) query = query.in("cellule_id", celluleIds);
            else {
              setAllMembers([]);
              setLoading(false);
              return;
            }
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
  }, [userProfile, scopedQuery, setAllMembers, conseillerIdFromUrl]);

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
      .select("id, eglise_id, branche_id, roles, role")
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
  .contains("roles", ["Conseiller"]) // 🔥 IMPORTANT
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
 const { filteredMembers, filteredNouveaux, filteredAnciens, filteredInactifs } = useMemo(() => {
  const actifs = members.filter((m) => m.etat_contact !== "supprime");

  const besoinFiltered = besoinFromUrl
    ? actifs.filter((m) => {
        if (!m.besoin) return false;
        let besoinsArray = [];
        try {
          besoinsArray = Array.isArray(m.besoin) ? m.besoin : JSON.parse(m.besoin);
        } catch {
          besoinsArray = m.besoin.split(",");
        }
        return besoinsArray.map(b => b.trim()).includes(besoinFromUrl);
      })
    : actifs;

  const searchFiltered = filter
    ? besoinFiltered.filter((m) => m.etat_contact?.trim().toLowerCase() === filter)
    : besoinFiltered;

  const searchAndNameFiltered = searchFiltered.filter((m) =>
    `${m.prenom || ""} ${m.nom || ""}`.toLowerCase().includes(search.toLowerCase())
  );

  const nouveaux = searchAndNameFiltered.filter(
    (m) => m.etat_contact?.trim().toLowerCase() === "nouveau"
  );
  const existants = searchAndNameFiltered.filter(
    (m) => ["existant", "ancien"].includes(m.etat_contact?.trim().toLowerCase())
  );
  const inactifs = searchAndNameFiltered.filter(
    (m) => m.etat_contact?.trim().toLowerCase() === "inactif"
  );

  return {
    filteredMembers: searchAndNameFiltered,
    filteredNouveaux: nouveaux,
    filteredAnciens: existants,
    filteredInactifs: inactifs,
  };
}, [members, filter, search, besoinFromUrl]);

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

  //---------------
 const getBorderColor = (member) => {
  const etat = (member?.etat_contact || "").toLowerCase().trim();

  switch (etat) {
    case "nouveau":
      return "#fb923c"; // orange
    case "existant":
      return "#4ade80"; // vert
    case "inactif":
      return "#9ca3af"; // gris
    default:
      return "#9ca3af"; // gris par défaut
  }
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

  const getConseillerName = (id) => {
        if (!id) return "—";      
        const conseiller = conseillers.find(
          (c) => String(c.id) === String(id)
        );      
        if (!conseiller) return "—";      
        return `${conseiller.prenom} ${conseiller.nom}`;
      };
  
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
   
        <div
          key={m.id}
          className="bg-white px-3 pb-3 pt-1 rounded-xl shadow-md border-l-4 relative"
        style={{ borderLeftColor: getBorderColor(m) }}
        >
          
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
            <h2 className="text-base font-bold text-center flex items-center justify-center gap-1">
              <span>{m.prenom} {m.nom}</span>
              {m.star === true && m.etat_contact?.trim().toLowerCase() === "existant" && (
                <span className="text-yellow-400">⭐</span>
              )}
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
            <p>🏠 Cellule : {m.cellule_id? cellules.find(c => String(c.id) === String(m.cellule_id))?.cellule_full || "—" : "—"}</p>
            <p>👤 Conseiller : {getConseillerName(m.conseiller_id)}</p>
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
  <div className="text-black text-sm mt-3 w-full space-y-4">

    {/* =========================
        1. IDENTITÉ
    ========================= */}
    <div>
      <p className="font-bold text-[#2E3192] mb-1">👤 Identité</p>
      <p>🎗️ Civilité : {m.sexe || "—"}</p>
      <p>⏳ Tranche d'âge : {m.age || "—"}</p>
      <p>💬 WhatsApp : {m.is_whatsapp ? "Oui" : "Non"}</p>
    </div>

    <hr />

    {/* =========================
        2. SUIVI
    ========================= */}
    <div>
      <p className="font-bold text-[#2E3192] mb-1">📊 Suivi</p>

      <p className="font-semibold text-[#2E3192] text-center">
        💡 Statut : {statutSuiviLabels[m.statut_suivis] || m.suivi_statut || "—"}
      </p>

      <p>📆 Envoyé en suivi : {formatDateFr(m.date_envoi_suivi)}</p>

      <p>📝 Commentaire : {m.commentaire_suivis || "—"}</p>
      <p>📑 Évangélisation : {m.Commentaire_Suivi_Evangelisation || "—"}</p>
    </div>

    <hr />

    {/* =========================
        3. VIE SPIRITUELLE
    ========================= */}
    <div>
      <p className="font-bold text-[#2E3192] mb-1">🕊 Vie spirituelle</p>

      <p>💧 Baptême d’eau : {m.bapteme_eau || "—"}</p>

      {m.bapteme_eau === "Non" && m.veut_se_faire_baptiser === "Oui" && (
        <p className="ml-4">💦 Veut se faire baptiser</p>
      )}

      <p>🔥 Baptême de feu : {m.bapteme_esprit || "—"}</p>
      <p>🙏 Prière du salut : {m.priere_salut || "—"}</p>
      <p>✨ Conversion : {m.type_conversion || "—"}</p>

      <p>✒️ Formation : {m.Formation || "—"}</p>
      <p>💢 Ministère : {formatMinistere(m.Ministere, m.Autre_Ministere) || "—"}</p>
    </div>

    <hr />

    {/* =========================
        4. PARCOURS
    ========================= */}
    <div>
      <p className="font-bold text-[#2E3192] mb-1">🧩 Parcours</p>

      <p>🧩 Comment venu : {m.venu || "—"}</p>
      <p>✨ Raison : {m.statut_initial || "—"}</p>
      <p>📝 Infos : {m.infos_supplementaires || "—"}</p>
    </div>

    <hr />

    {/* =========================
        5. SOIN PASTORAL
    ========================= */}
    <div>
      <p className="font-bold text-[#2E3192] mb-1">❤️‍🩹 Soin pastoral</p>

      <p>❤️‍🩹 Suivi pastoral : {m.Soin_Pastoral || "—"}</p>
      <p>❓ Besoins : {besoins}</p>
        <button onClick={...}>
      💡 Ajouter / Voir suivis
    </button>

    {/* popup */}
    {openSuivi && (
      <SuiviPopup member={m} onClose={...} />
    )}  
    </div>    
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
      <HeaderPages />
       <h1 className="text-2xl font-bold mt-4 mb-6 text-blue-300 text-center text-white">Liste des <span className="text-emerald-300">Membres</span></h1>

        <div className="max-w-3xl w-full mb-6 text-center">
  <p className="italic text-base text-white/90">
    <span className="text-blue-300 font-semibold">Visualisez et gérez</span> tous les membres, 
    <span className="text-blue-300 font-semibold"> nouveaux contacts</span> et 
    <span className="text-blue-300 font-semibold"> membres existants</span>. 
    Vous pouvez filtrer par état, consulter les détails, 
    <span className="text-blue-300 font-semibold"> envoyer des suivis</span> et mettre à jour les informations 
    en toute sécurité selon votre rôle.
  </p>
</div>

      {/* Barre de recherche */}
      <div className="mt-3 w-full max-w-4xl flex justify-center mb-2">
        <input type="text" placeholder="🔍Recherche..." value={search} onChange={e => setSearch(e.target.value)} className="w-full sm:w-2/3 px-3 py-1 rounded-md border text-black"/>
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

      <div className="w-full flex justify-end">
        {canAddMember && (
          <button
            onClick={() => router.push("/AddContact")}
            className="text-white font-semibold px-4 py-2 rounded shadow text-sm"
          >
            ➕ Ajouter un membre
          </button>
        )}
      </div>

      {/* ==================== VUE CARTE ==================== */}
        {view === "card" && (
          <>
            {/* ------------------ Nouveaux ------------------ */}
            {filteredNouveaux.length > 0 && (
              <>
                <h2 className="w-full max-w-6xl text-white font-bold mb-2 text-lg text-sm">
                  💖 Bien aimé venu le {dateDuJour}
                </h2>
                <div className="w-full max-w-6xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                  {filteredNouveaux.map((m) => renderMemberCard({ ...m, isNouveau: true }))}
                </div>
              </>
            )}
        
            {/* ------------------ Existants ------------------ */}
            {filteredAnciens.length > 0 && (
              <>
                <h2 className="w-full max-w-6xl font-bold mb-2 text-lg bg-gradient-to-r from-blue-500 to-gray-300 bg-clip-text text-transparent">
                  Membres existants
                </h2>
                <div className="w-full max-w-6xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                  {filteredAnciens.map((m) => renderMemberCard(m))}
                </div>
              </>
            )}
        
            {/* ------------------ Inactifs ------------------ */}
            {filteredInactifs.length > 0 && (
              <>
                <h2 className="w-full max-w-6xl text-gray-400 font-bold mb-2 text-lg">
                  Contacts inactifs
                </h2>
                <div className="w-full max-w-6xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {filteredInactifs.map((m) => renderMemberCard(m))}
                </div>
              </>
            )}
          </>
        )}         

     <EditMemberPopup
      member={editMember}
      cellules={cellules}
      conseillers={conseillers}
      onClose={() => setEditMember(null)}
      onUpdateMember={async (updatedMember) => {
        await logStats(editMember, updatedMember, userProfile);
    
        setAllMembers(prev =>
          prev.map(m => (m.id === updatedMember.id ? updatedMember : m))
        );
    
        setEditMember(null);
        showToast("✅ Contact mis à jour !");
      }}
    />   

      {/* Toast */}
      {showingToast && (
        <div className="fixed bottom-4 right-4 bg-black text-white px-4 py-2 rounded-lg shadow-lg z-50">{toastMessage}</div>
      )}
        
       {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 text-amber-300 text-3xl font-semibold shadow-lg hover:scale-110 transition-transform"
          title="Retour en haut"
        >
          ↑
        </button>
      )}
       
<Footer />
    </div>
  );
}
