import { useEffect, useState, useRef, useCallback } from "react";
import React from "react";
import supabase from "../../lib/supabaseClient";
import EditMemberSuivisPopup from "../../components/EditMemberSuivisPopup";
import { useMembers } from "../../context/MembersContext";
import { useRouter } from "next/router";
import HeaderPages from "../../components/HeaderPages";
import ProtectedRoute from "../../components/ProtectedRoute";
import useChurchScope from "../../hooks/useChurchScope";
import Footer from "../../components/Footer";
import SuiviPopup from "../../components/SuiviPopup";
import { useLang } from "../../hooks/useLang";

const translations = {
  fr: {
    titre1: "Suivis des",
    titre2: "Membres",
    description: "Ici, vous pouvez voir,",
    descriptionAccent1: " suivre et accompagner ",
    descriptionMid: "chaque membre de votre Assemblée.",
    descriptionAccent2: " Chaque Personne est précieuse ",
    descriptionMid2: ": cette page vous permet de gérer les nouveaux venus, de",
    descriptionAccent3: " soutenir ",
    descriptionMid3: "chaque membre de la famille, et de cultiver la croissance de chaque membre avec",
    descriptionAccent4: " amour et discipline",
    descriptionEnd: ".",
    voirRefus: "Voir les refus",
    voirTous: "Voir tous les suivis",
    aucunMembre: "Aucun membre à afficher.",
    erreurFetch: "Erreur lors de la récupération des membres.",
    utilisateurNonConnecte: "Utilisateur non connecté",
    cellule: "🏠 Cellule :",
    famille: "👨‍👩‍👦 Famille :",
    conseiller: "👤 Conseiller(s) :",
    creeeLe: "Créé le",
    commentaireSuivis: "Commentaire Suivis",
    statutIntegration: "Statut Intégration",
    selectionnerStatut: "-- Sélectionner un statut --",
    enSuivis: "En Suivis",
    integrer: "Intégrer",
    refus: "Refus",
    reactiver: "Réactiver",
    reactivation: "Réactivation...",
    sauvegarder: "Sauvegarder",
    enregistrement: "Enregistrement...",
    details: "Détails",
    fermerDetails: "Fermer détails",
    appeler: "📞 Appeler",
    sms: "✉️ SMS",
    appelWhatsApp: "📱 Appel WhatsApp",
    messageWhatsApp: "💬 Message WhatsApp",
    identite: "👤 Identité",
    civilite: "🎗️ Civilité :",
    age: "⏳ Âge :",
    whatsapp: "💬 WhatsApp :",
    oui: "Oui",
    non: "Non",
    homme: "Homme",
    femme: "Femme",
    suivi: "📊 Suivi",
    arriveLe: "Arrivé le :",
    arrivedLe: "Arrivée le :",
    conseillersLabel: "👤 Conseiller(s) :",
    vieSpirituelle: "🕊 Vie spirituelle",
    baptemeEau: "💧 Baptême d'Eau :",
    baptemeFeu: "🔥 Baptême de Feu :",
    priereSalut: "🙏 Prière du salut :",
    typeConversion: "☀️ Type de conversion :",
    conversionOptions: {
      "Nouveau converti": "Nouveau converti",
      "Réconciliation": "Réconciliation",
    },
    formation: "✒️ Formation :",
    ministere: "💢 Ministère :",
    parcours: "🌱 Parcours",
    commentEstVenu: "🧩 Comment est-il venu :",
    venuOptions: {
      "invité": "Invité",
      "réseaux": "Réseaux",
      "evangélisation": "Évangélisation",
      "autre": "Autre",
    },
    raisonVenue: "✨ Raison de la venue :",
    statutInitialOptions: {
      "veut rejoindre ICC": "Veut rejoindre ICC",
      "a déjà son église": "A déjà son église",
      "visiteur": "Visiteur",
    },
    infos: "📝 Infos :",
    soinPastoral: "❤️‍🩹 Soin pastoral",
    besoins: "❓ Difficultés / Besoins :",
    besoinOptions: {
      "Finances": "Finances",
      "Santé": "Santé",
      "Travail / Études": "Travail / Études",
      "Famille / Enfants": "Famille / Enfants",
      "Relations / Conflits": "Relations / Conflits",
      "Miracle": "Miracle",
      "Délivrance": "Délivrance",
      "Addictions / Dépendances": "Addictions / Dépendances",
      "Guidance spirituelle": "Guidance spirituelle",
      "Logement / Sécurité": "Logement / Sécurité",
      "Communauté / Isolement": "Communauté / Isolement",
      "Dépression / Santé mentale": "Dépression / Santé mentale",
    },
    ajouterVoirSuivis: "💡 Ajouter / Voir suivis",
    modifierContact: "✏️ Modifier le contact",
    months: ["Janv","Févr","Mars","Avr","Mai","Juin","Juil","Août","Sept","Oct","Nov","Déc"],
  },
  en: {
    titre1: "Member",
    titre2: "Follow-ups",
    description: "Here you can view,",
    descriptionAccent1: " track and support ",
    descriptionMid: "every member of your Assembly.",
    descriptionAccent2: " Every person matters ",
    descriptionMid2: ": this page lets you manage newcomers,",
    descriptionAccent3: " support ",
    descriptionMid3: "every family member, and nurture each member's growth with",
    descriptionAccent4: " love and discipline",
    descriptionEnd: ".",
    voirRefus: "View declined",
    voirTous: "View all follow-ups",
    aucunMembre: "No members to display.",
    erreurFetch: "Error fetching members.",
    utilisateurNonConnecte: "User not logged in",
    cellule: "🏠 Cell:",
    famille: "👨‍👩‍👦 Family:",
    conseiller: "👤 Counsellor(s):",
    creeeLe: "Created on",
    commentaireSuivis: "Follow-up Comment",
    statutIntegration: "Integration Status",
    selectionnerStatut: "-- Select a status --",
    enSuivis: "In Follow-up",
    integrer: "Integrated",
    refus: "Declined",
    reactiver: "Reactivate",
    reactivation: "Reactivating...",
    sauvegarder: "Save",
    enregistrement: "Saving...",
    details: "Details",
    fermerDetails: "Close details",
    appeler: "📞 Call",
    sms: "✉️ SMS",
    appelWhatsApp: "📱 WhatsApp Call",
    messageWhatsApp: "💬 WhatsApp Message",
    identite: "👤 Identity",
    civilite: "🎗️ Gender:",
    age: "⏳ Age:",
    whatsapp: "💬 WhatsApp:",
    oui: "Yes",
    non: "No",
    homme: "Man",
    femme: "Woman",
    suivi: "📊 Follow-up",
    arriveLe: "Arrived on:",
    arrivedLe: "Arrived on:",
    conseillersLabel: "👤 Counsellor(s):",
    vieSpirituelle: "🕊 Spiritual life",
    baptemeEau: "💧 Water Baptism:",
    baptemeFeu: "🔥 Spirit Baptism:",
    priereSalut: "🙏 Salvation prayer:",
    typeConversion: "☀️ Conversion type:",
    conversionOptions: {
      "Nouveau converti": "New convert",
      "Réconciliation": "Reconciliation",
    },
    formation: "✒️ Training:",
    ministere: "💢 Ministry:",
    parcours: "🌱 Journey",
    commentEstVenu: "🧩 How they came:",
    venuOptions: {
      "invité": "Invited",
      "réseaux": "Social networks",
      "evangélisation": "Evangelisation",
      "autre": "Other",
    },
    raisonVenue: "✨ Reason for coming:",
    statutInitialOptions: {
      "veut rejoindre ICC": "Wants to join ICC",
      "a déjà son église": "Already has a church",
      "visiteur": "Visitor",
    },
    infos: "📝 Notes:",
    soinPastoral: "❤️‍🩹 Pastoral care",
    besoins: "❓ Difficulties / Needs:",
    besoinOptions: {
      "Finances": "Finances",
      "Santé": "Health",
      "Travail / Études": "Work / Studies",
      "Famille / Enfants": "Family / Children",
      "Relations / Conflits": "Relationships / Conflicts",
      "Miracle": "Miracle",
      "Délivrance": "Deliverance",
      "Addictions / Dépendances": "Addictions / Dependencies",
      "Guidance spirituelle": "Spiritual guidance",
      "Logement / Sécurité": "Housing / Safety",
      "Communauté / Isolement": "Community / Isolation",
      "Dépression / Santé mentale": "Depression / Mental health",
    },
    ajouterVoirSuivis: "💡 Add / View follow-ups",
    modifierContact: "✏️ Edit contact",
    months: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
  },
};

// ─────────────────────────────────────────────────────────────
// DetailsPopup extrait HORS du composant parent
// ─────────────────────────────────────────────────────────────
const DetailsPopup = React.memo(function DetailsPopup({
  m, user, showRefus, openSuiviMemberId, setOpenSuiviMemberId,
  setEditMember, cellules, familles, conseillers, assignmentsMap, t,
}) {
  const formatMinistere = (ministere) => {
    if (!ministere) return "—";
    try {
      const parsed = typeof ministere === "string" ? JSON.parse(ministere) : ministere;
      return Array.isArray(parsed) ? parsed.join(", ") : parsed;
    } catch { return "—"; }
  };

  const formatBesoinField = (field) => {
    if (!field) return "—";
    let arr = [];
    try {
      const parsed = typeof field === "string" ? JSON.parse(field) : field;
      arr = Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      arr = [field];
    }
    return arr.map((b) => t.besoinOptions[b] || b).join(", ");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const d = new Date(dateString);
    const day = d.getDate().toString().padStart(2, "0");
    return `${day} ${t.months[d.getMonth()]} ${d.getFullYear()}`;
  };

  const getYesNo = (value) => {
    if (value === "Oui" || value === true) return t.oui;
    if (value === "Non" || value === false) return t.non;
    return "—";
  };

  const getMapLabel = (map, value) => {
    if (!value) return "—";
    return map[value] || value;
  };

  const getConseillersForMember = (memberId) => {
    const assigned = assignmentsMap?.[memberId];
    if (assigned && assigned.length > 0) {
      return assigned.map((c, i) => (
        <span key={c.id}>
          {c.prenom} {c.nom}
          {i === 0 && assigned.length > 1 ? " (principal)" : ""}
          {i < assigned.length - 1 ? ", " : ""}
        </span>
      ));
    }
    return "—";
  };

  return (
    <div className="text-black text-sm space-y-2 w-full">
      <div>
        <p className="font-bold text-[#2E3192] mb-1">{t.identite}</p>
        <p>{t.civilite} {m.sexe === "Homme" ? t.homme : m.sexe === "Femme" ? t.femme : "—"}</p>
        <p>{t.age} {m.age || "—"}</p>
        <p>{t.whatsapp} {m.is_whatsapp ? t.oui : t.non}</p>
      </div>
      <hr />
      <div>
        <p className="font-bold text-[#2E3192] mb-1">{t.suivi}</p>
        <p>📅 {m.sexe === "Femme" ? t.arrivedLe : t.arriveLe} {formatDate(m.date_venu)}</p>
        <div className="mt-1">
          <span className="font-semibold">{t.conseillersLabel} </span>
          {getConseillersForMember(m.id)}
        </div>
      </div>
      <hr />
      <div>
        <p className="font-bold text-[#2E3192] mb-1">{t.vieSpirituelle}</p>
        <p>{t.baptemeEau} {getYesNo(m.bapteme_eau)}</p>
        <p>{t.baptemeFeu} {getYesNo(m.bapteme_esprit)}</p>
        <p>{t.priereSalut} {getYesNo(m.priere_salut)}</p>
        <p>{t.typeConversion} {getMapLabel(t.conversionOptions, m.type_conversion)}</p>
        <p>{t.formation} {m.Formation || "—"}</p>
        <p>{t.ministere} {formatMinistere(m.Ministere) || "—"}</p>
      </div>
      <hr />
      <div>
        <p className="font-bold text-[#2E3192] mb-1">{t.parcours}</p>
        <p>{t.commentEstVenu} {getMapLabel(t.venuOptions, m.venu)}</p>
        <p>{t.raisonVenue} {getMapLabel(t.statutInitialOptions, m.statut_initial ?? m.statut)}</p>
        <p>{t.infos} {m.infos_supplementaires || "—"}</p>
      </div>
      <hr />
      <div>
        <p className="font-bold text-[#2E3192] mb-1">{t.soinPastoral}</p>
        <p>{t.besoins} {formatBesoinField(m.besoin)}</p>
        <div className="flex justify-center">
          <button
            onClick={() => setOpenSuiviMemberId(m.id)}
            className="mt-2 text-sm bg-[#333699] text-amber-300 px-3 py-1 rounded"
          >
            {t.ajouterVoirSuivis}
          </button>
        </div>
        {openSuiviMemberId === m.id && (
          <SuiviPopup member={m} onClose={() => setOpenSuiviMemberId(null)} user={user} />
        )}
      </div>
      {!showRefus && (
        <div className="mt-4 rounded-xl w-full shadow-md p-4 bg-white">
          <button
            onClick={() => setEditMember(m)}
            className="w-full py-2 rounded-md bg-white text-orange-500 shadow-md"
          >
            {t.modifierContact}
          </button>
        </div>
      )}
    </div>
  );
});

// ─────────────────────────────────────────────────────────────

export default function SuivisMembres() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur", "Conseiller", "ResponsableCellule", "ResponsableFamilles", "ResponsableIntegration"]}>
      <SuivisMembresContent />
    </ProtectedRoute>
  );
}

function SuivisMembresContent() {
  const router = useRouter();
  const { lang } = useLang();
  const t = translations[lang];

  const { profile, loading: scopeLoading, error: scopeError, scopedQuery } = useChurchScope();
  const { members, setAllMembers, updateMember } = useMembers();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [prenom, setPrenom] = useState("");
  const [userProfile, setUserProfile] = useState(null);
  const [statusChanges, setStatusChanges] = useState({});
  const [commentChanges, setCommentChanges] = useState({});
  const [updating, setUpdating] = useState({});
  const [editMember, setEditMember] = useState(null);
  const [showRefus, setShowRefus] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(null);
  const [cellules, setCellules] = useState([]);
  const [familles, setFamilles] = useState([]);
  const [conseillers, setConseillers] = useState([]);
  const [openPhoneMenuId, setOpenPhoneMenuId] = useState(null);
  const phoneMenuRef = useRef(null);
  const [openSuiviMemberId, setOpenSuiviMemberId] = useState(null);
  const [assignmentsMap, setAssignmentsMap] = useState({});

  const [view, setView] = useState(() => {
    if (typeof window !== "undefined") return localStorage.getItem("members_view") || "card";
    return "card";
  });

  const toggleDetails = (id) => setDetailsOpen((prev) => (prev === id ? null : id));

  useEffect(() => { localStorage.setItem("members_view", view); }, [view]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (phoneMenuRef.current && !phoneMenuRef.current.contains(event.target)) {
        setOpenPhoneMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ─── fetchAssignments ───
  const fetchAssignments = useCallback(async () => {
    const { data: assignments, error } = await supabase
      .from("suivi_assignments")
      .select("membre_id, conseiller_id, role");

    if (error) { console.error("fetchAssignments error:", error); return; }
    if (!assignments || assignments.length === 0) { setAssignmentsMap({}); return; }

    const conseillerIds = [...new Set(assignments.map(a => a.conseiller_id).filter(Boolean))];
    const { data: profilesData, error: profilesError } = await supabase
      .from("profiles").select("id, prenom, nom").in("id", conseillerIds);

    if (profilesError) { console.error("fetchAssignments profiles error:", profilesError); return; }

    const profileMap = {};
    (profilesData || []).forEach(p => { profileMap[p.id] = p; });

    const map = {};
    assignments.forEach((row) => {
      const profile = profileMap[row.conseiller_id];
      if (!profile) return;
      if (!map[row.membre_id]) map[row.membre_id] = [];
      if (!map[row.membre_id].some(c => c.id === profile.id)) map[row.membre_id].push(profile);
    });

    setAssignmentsMap(map);
  }, []);

  const getConseillersForMember = (memberId) => {
    const assigned = assignmentsMap[memberId];
    if (assigned && assigned.length > 0) return assigned.map((c) => `${c.prenom} ${c.nom}`).join(", ");
    return "—";
  };

  // ─── Realtime ───
  useEffect(() => {
    const channel = supabase
      .channel("realtime:suivi_assignments_suivis")
      .on("postgres_changes", { event: "*", schema: "public", table: "suivi_assignments" }, () => {
        fetchAssignments();
      })
      .subscribe();
    return () => { channel.unsubscribe(); };
  }, [fetchAssignments]);

  useEffect(() => {
    const fetchMembresComplets = async () => {
      setLoading(true);
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) throw new Error(t.utilisateurNonConnecte);

        const { data: profileData, error: profileError } = await supabase
          .from("profiles").select("id, prenom, nom, role, roles, eglise_id").eq("id", user.id).single();
        if (profileError || !profileData) throw profileError;

        setPrenom(profileData.prenom || "");
        setUserProfile(profileData);

        const { data: cellulesData } = await supabase
          .from("cellules").select("id, cellule_full, responsable_id").eq("eglise_id", profileData.eglise_id);
        setCellules(cellulesData || []);

        const { data: famillesData } = await supabase
          .from("familles").select("id, famille_full, responsable_id").eq("eglise_id", profileData.eglise_id);
        setFamilles(famillesData || []);

        const { data: conseillersData } = await supabase
          .from("profiles").select("id, prenom, nom").eq("role", "Conseiller").eq("eglise_id", profileData.eglise_id);
        setConseillers(conseillersData || []);

        let query = supabase
          .from("membres_complets").select("*")
          .eq("eglise_id", profileData.eglise_id)
          .order("created_at", { ascending: false });

        if (profileData.role === "Conseiller") {
          const { data: assignments } = await supabase
            .from("suivi_assignments").select("membre_id").eq("conseiller_id", profileData.id);
          const assignedIds = (assignments || []).map(a => a.membre_id).filter(Boolean);
          if (assignedIds.length > 0) query = query.in("id", assignedIds);
          else query = query.eq("id", -1);

          } else if (profileData.role === "ResponsableCellule") {
  // Cellules directes
  const directIds = cellulesData
    ?.filter(c => c.responsable_id === profileData.id)
    .map(c => c.id) || [];

  // Cellules enfants via profile_id
  const { data: fillesData } = await supabase
    .from("cellules")
    .select("id")
    .eq("cellule_mere_id", profileData.id)
    .eq("eglise_id", profileData.eglise_id);
  const fillesIds = (fillesData || []).map(c => c.id);

  const tousLesIds = [...new Set([...directIds, ...fillesIds])];
  if (tousLesIds.length > 0) query = query.in("cellule_id", tousLesIds);
  else query = query.eq("id", -1);
}
        
        else if (profileData.role === "ResponsableFamilles") {
          const familleIds = famillesData?.filter(f => f.responsable_id === profileData.id).map(f => f.id) || [];
          if (familleIds.length > 0) query = query.in("famille_id", familleIds);
          else query = query.eq("id", -1);
        }

        const { data, error } = await query;
        if (error) throw error;

        setAllMembers(data || []);
        if (!data || data.length === 0) setMessage(t.aucunMembre);

        await fetchAssignments();
      } catch (err) {
        console.error("❌ Erreur fetchMembresComplets:", err);
        setMessage(t.erreurFetch);
      } finally {
        setLoading(false);
      }
    };

    fetchMembresComplets();
  }, [setAllMembers, fetchAssignments]);

  // ✅ Highlight harmonisé avec ListMembers — couleur ambrée
  const highlightDoneRef = useRef(false);

  useEffect(() => {
    const highlightId = router.query?.highlight;
    if (!highlightId || loading || highlightDoneRef.current) return;

    let attempts = 0;
    const maxAttempts = 20;

    const tryHighlight = () => {
      const el = document.getElementById(`member-${highlightId}`);
      if (!el) {
        attempts++;
        if (attempts < maxAttempts) setTimeout(tryHighlight, 150);
        return;
      }
      highlightDoneRef.current = true;
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.style.transition = "box-shadow 0.5s ease, transform 0.5s ease";
      el.style.boxShadow = "0 0 0 4px #f59e0b, 0 0 24px 8px rgba(245,158,11,0.4)";
      el.style.transform = "scale(1.02)";
      setTimeout(() => {
        el.style.transition = "box-shadow 1s ease, transform 1s ease";
        el.style.boxShadow = "";
        el.style.transform = "";
      }, 5000);
    };

    const timer = setTimeout(tryHighlight, 300);
    return () => clearTimeout(timer);
  }, [loading, router.query?.highlight]);

  const handleCommentChange = (id, value) => {
    setCommentChanges(prev => ({ ...prev, [id]: value }));
    const member = members.find(m => m.id === id);
    if (member) updateMember(id, { ...member, commentaire_suivis: value });
  };

  const getBorderColor = (m) => {
    if (!m) return "#ccc";
    const status = m.statut_suivis ?? m.suivi_statut;
    if (status === 2) return "#FFA500";
    if (status === 3) return "#34A853";
    if (status === 4) return "#FF4B5C";
    if (status === 1) return "#3B82F6";
    return "#ccc";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const d = new Date(dateString);
    const day = d.getDate().toString().padStart(2, "0");
    return `${day} ${t.months[d.getMonth()]} ${d.getFullYear()}`;
  };

  const updateSuivi = async (id) => {
    const newComment = commentChanges[id];
    const newStatus = statusChanges[id];
    if (newComment === undefined && newStatus === undefined) return;

    setUpdating(prev => ({ ...prev, [id]: true }));
    try {
      const payload = { updated_at: new Date() };
      if (newComment !== undefined) payload.commentaire_suivis = newComment;

      const member = members.find(m => m.id === id);
      const statusNum = newStatus !== undefined ? Number(newStatus) : Number(member?.statut_suivis);
      if (newStatus !== undefined) payload.statut_suivis = statusNum;
      if ([2, 3, 4].includes(statusNum)) payload.date_statut_Def = new Date().toISOString().split("T")[0];

      const { data: updatedMember, error } = await supabase
        .from("membres_complets").update(payload).eq("id", id).select("*").single();
      if (error) throw error;

      setAllMembers(prev => prev.map(m => (m.id === id ? updatedMember : m)));
    } catch (err) {
      console.error("❌ updateSuivi error:", err);
    } finally {
      setUpdating(prev => ({ ...prev, [id]: false }));
    }
  };

  const reactivateMember = async (id) => {
    setUpdating(prev => ({ ...prev, [id]: true }));
    try {
      const { data: updatedMember, error } = await supabase
        .from("membres_complets").update({ statut_suivis: 2, updated_at: new Date() })
        .eq("id", id).select("*").single();
      if (error) throw error;
      setAllMembers(prev => prev.map(m => m.id === id ? updatedMember : m));
    } catch (err) {
      console.error("❌ reactivateMember error:", err);
    } finally {
      setUpdating(prev => ({ ...prev, [id]: false }));
    }
  };

  const filteredMembers = members.filter(m => {
    if (m.etat_contact === "supprime") return false;
    const status = m.statut_suivis ?? 0;
    if (showRefus) return status === 4;
    return status === 1 || status === 2;
  });

  const uniqueMembers = Array.from(new Map(filteredMembers.map(i => [i.id, i])).values());

  return (
    <div className="min-h-screen flex flex-col items-center p-6" style={{ background: "#333699" }}>
      <HeaderPages />

      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold mt-4 mb-6 text-blue-300 text-center text-white">
          {t.titre1} <span className="text-emerald-300">{t.titre2}</span>
        </h1>
        <div className="max-w-3xl w-full mb-6 text-center">
          <p className="italic text-base text-white/90">
            {t.description}<span className="text-blue-300 font-semibold">{t.descriptionAccent1}</span>{t.descriptionMid}
            <span className="text-blue-300 font-semibold">{t.descriptionAccent2}</span>{t.descriptionMid2}
            <span className="text-blue-300 font-semibold">{t.descriptionAccent3}</span>{t.descriptionMid3}
            <span className="text-blue-300 font-semibold">{t.descriptionAccent4}</span>{t.descriptionEnd}
          </p>
        </div>
      </div>

      <div className="mb-4 flex justify-end w-full max-w-6xl">
        <button
          onClick={() => setShowRefus(prev => !prev)}
          className="text-orange-400 text-sm underline hover:text-orange-500"
        >
          {showRefus ? t.voirTous : t.voirRefus}
        </button>
      </div>

      {message && (
        <div className="mb-4 px-4 py-2 rounded-md text-sm bg-yellow-100 text-yellow-800">
          {typeof message === "string" ? message : message.text}
        </div>
      )}

      {view === "card" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-6xl justify-items-center">
          {uniqueMembers.map((m) => (
            <div
              key={m.id}
              id={`member-${m.id}`}
              className="bg-white rounded-2xl shadow-lg w-full transition-all duration-300 hover:shadow-2xl p-4 border-l-4"
              style={{ borderLeftColor: getBorderColor(m) }}
            >
              <div className="flex flex-col items-center">
                <h2 className="font-bold text-black text-base text-center mb-1">
                  {m.prenom} {m.nom}
                </h2>

                {m.telephone && (
                  <div className="relative inline-block mt-1">
                    <p
                      className="text-orange-500 underline font-semibold cursor-pointer text-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenPhoneMenuId(openPhoneMenuId === m.id ? null : m.id);
                      }}
                    >
                      {m.telephone}
                    </p>
                    {openPhoneMenuId === m.id && (
                      <div
                        ref={phoneMenuRef}
                        className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-white rounded-lg shadow-lg border z-50 w-52 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <a href={`tel:${m.telephone}`} className="block px-4 py-2 hover:bg-gray-100 text-black">{t.appeler}</a>
                        <a href={`sms:${m.telephone}`} className="block px-4 py-2 hover:bg-gray-100 text-black">{t.sms}</a>
                        <a href={`https://wa.me/${m.telephone.replace(/\D/g, "")}?call`} target="_blank" rel="noopener noreferrer" className="block px-4 py-2 hover:bg-gray-100 text-black">{t.appelWhatsApp}</a>
                        <a href={`https://wa.me/${m.telephone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="block px-4 py-2 hover:bg-gray-100 text-black">{t.messageWhatsApp}</a>
                      </div>
                    )}
                  </div>
                )}

                <p className="text-sm text-black-700 mb-1">
                  {t.cellule} {m.cellule_id ? (cellules.find(c => c.id === m.cellule_id)?.cellule_full || "—") : "—"}
                </p>
                <p className="text-sm text-black-700 mb-1">
                  {t.famille} {m.famille_id ? (familles.find(f => f.id === m.famille_id)?.famille_full || "—") : "—"}
                </p>
                <p className="text-sm text-black-700 mb-1">
                  {t.conseiller} {getConseillersForMember(m.id)}
                </p>

                <p className="self-end text-[11px] text-gray-400 mt-3">{t.creeeLe} {formatDate(m.date_envoi_suivi)}</p>

                <div className="flex flex-col w-full mt-2">
                  <label className="font-semibold text-blue-700 mb-1 mt-2 text-center">{t.commentaireSuivis}</label>

                  {showRefus ? (
                    <textarea value={m.commentaire_suivis ?? ""} readOnly className="w-full border rounded-lg p-2 bg-gray-100 text-gray-600 cursor-not-allowed" rows={2} />
                  ) : (
                    <textarea
                      value={commentChanges[m.id] ?? m.commentaire_suivis ?? ""}
                      onChange={(e) => handleCommentChange(m.id, e.target.value)}
                      className="w-full border rounded-lg p-2"
                      rows={2}
                    />
                  )}

                  <label className="font-semibold mb-1 text-center mt-2">{t.statutIntegration}</label>

                  {showRefus ? (
                    <select value="4" disabled className="w-full border rounded-lg p-2 text-red-600 bg-gray-100 cursor-not-allowed">
                      <option value="4">{t.refus}</option>
                    </select>
                  ) : (
                    <select
                      value={statusChanges[m.id] ?? String(m.statut_suivis ?? "")}
                      onChange={(e) => setStatusChanges(prev => ({ ...prev, [m.id]: e.target.value }))}
                      className="w-full border rounded-lg p-2 mb-2"
                    >
                      <option value="1">{t.selectionnerStatut}</option>
                      <option value="2">{t.enSuivis}</option>
                      <option value="3">{t.integrer}</option>
                      <option value="4">{t.refus}</option>
                    </select>
                  )}

                  {showRefus ? (
                    <button onClick={() => reactivateMember(m.id)} disabled={updating[m.id]} className={`mt-2 py-1 rounded w-full transition ${updating[m.id] ? "bg-gray-400 cursor-not-allowed" : "bg-green-500 hover:bg-green-600 text-white"}`}>
                      {updating[m.id] ? t.reactivation : t.reactiver}
                    </button>
                  ) : (
                    <button onClick={() => updateSuivi(m.id)} disabled={updating[m.id]} className={`mt-2 py-1 rounded w-full transition ${updating[m.id] ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600 text-white"}`}>
                      {updating[m.id] ? t.enregistrement : t.sauvegarder}
                    </button>
                  )}
                </div>

                <button onClick={() => toggleDetails(m.id)} className="text-orange-500 underline text-sm mt-2">
                  {detailsOpen === m.id ? t.fermerDetails : t.details}
                </button>
              </div>

              <div className={`transition-all duration-500 overflow-hidden ${detailsOpen === m.id ? "max-h-[1000px] mt-3" : "max-h-0"}`}>
                {detailsOpen === m.id && (
                  <div className="pt-2">
                    <DetailsPopup
                      m={m}
                      user={userProfile}
                      showRefus={showRefus}
                      openSuiviMemberId={openSuiviMemberId}
                      setOpenSuiviMemberId={setOpenSuiviMemberId}
                      setEditMember={setEditMember}
                      cellules={cellules}
                      familles={familles}
                      conseillers={conseillers}
                      assignmentsMap={assignmentsMap}
                      t={t}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {editMember && (
        <EditMemberSuivisPopup
          member={editMember}
          cellules={cellules}
          familles={familles}
          conseillers={conseillers}
          onClose={() => setEditMember(null)}
          onUpdateMember={async (updatedMember) => {
            updateMember(updatedMember.id, updatedMember);
            await fetchAssignments();
            setEditMember(null);
          }}
          currentUserRoles={userProfile?.roles || []}
        />
      )}

      <Footer />
    </div>
  );
}
