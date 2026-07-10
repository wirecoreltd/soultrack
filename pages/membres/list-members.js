// ═══════════════════════════════════════════════════════════════
// PAGE : Liste des Membres (ListMembers)
// ═══════════════════════════════════════════════════════════════
// Description : Affiche la liste des membres de l'église (nouveaux,
// existants, inactifs). Permet de filtrer/rechercher, consulter les
// détails, envoyer un contact en suivi (cellule/famille/conseiller),
// marquer comme membre existant, modifier, supprimer (soft delete),
// exporter en PDF, et gérer les suivis pastoraux.
//
// Tables Supabase utilisées :
// - membres_complets   (lecture + écriture) → données des membres
// - suivi_assignments  (lecture)            → mapping conseiller ↔ membre
// - suivis             (lecture)            → besoins exprimés (filtre ?besoin=)
// - cellules           (lecture)            → liste des cellules (si feature active)
// - familles           (lecture)            → liste des familles (si feature active)
// - profiles           (lecture)            → profil utilisateur + liste conseillers
// - eglises            (lecture)            → infos église (logo, nom) pour export PDF
//
// Realtime : membres_complets, cellules, profiles, suivi_assignments
//
// Edge Function : dynamic-worker (invoquée lors de la suppression d'un membre)
// ═══════════════════════════════════════════════════════════════

"use client";

import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import React from "react";
import supabase from "../../lib/supabaseClient";
import BoutonEnvoyer from "../../components/BoutonEnvoyer";
import LogoutLink from "../../components/LogoutLink";
import DetailsMemberPopup from "../../components/DetailsMemberPopup";
import EditMemberPopup from "../../components/EditMemberPopup";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useSearchParams } from "next/navigation";
import { useMembers } from "../../context/MembersContext";
import HeaderPages from "../../components/HeaderPages";
import Footer from "../../components/Footer";
import { useRouter } from "next/navigation";
import ProtectedRoute from "../../components/ProtectedRoute";
import useChurchScope from "../../hooks/useChurchScope";
import SuiviPopup from "../../components/SuiviPopup";
import EvaluationLeaderPopup from "../../components/Evaluationleaderpopup";
import PresenceDot from "../../components/PresenceDot";
import ImportMembresCSV from "../../components/ImportMembresCSV";
import { useFeature } from "../../components/FeaturesContext";
import ExportMembrePDF from "../../components/ExportMembrePDF";
import { useLang } from "../../hooks/useLang";

const translations = {
  fr: {
    pageTitle: "Liste des",
    pageTitleHighlight: "Membres",
    pageSubtitle1: "Visualisez et gérez",
    pageSubtitle2: "tous les membres,",
    pageSubtitle3: "nouveaux contacts",
    pageSubtitle4: "et",
    pageSubtitle5: "membres existants",
    pageSubtitle6: ". Vous pouvez filtrer par état, consulter les détails,",
    pageSubtitle7: "envoyer des suivis",
    pageSubtitle8: "et mettre à jour les informations en toute sécurité selon votre rôle.",
    search: "🔍Recherche...",
    allStates: "-- Tous les états de contact --",
    nouveau: "Nouveau",
    existant: "Existant",
    inactif: "Inactif",
    membersCount: (n) => `${n} membres`,
    addMember: "➕ Ajouter un membre",
    importList: "📥 Importer une liste",
    loading: "Chargement...",
    newMembersTitle: (date) => `💖 Bien aimé venu le ${date}`,
    existingTitle: "Membres existants",
    inactifTitle: "Contacts inactifs",
    city: "🏙️ Ville :",
    etatContact: "🕊 Etat Contact :",
    months: ["Janv","Févr","Mars","Avr","Mai","Juin","Juil","Août","Sept","Oct","Nov","Déc"],
    createdAt: "Créé le",
    cellule: "🏠 Cellule :",
    famille: "👨‍👩‍👦 Famille :",
    conseiller: "👤 Conseiller(s) :",
    sendToSuivi: "Envoyer ce contact en suivi :",
    chooseOption: "-- Choisir une option --",
    oneCellule: "Une Cellule",
    oneConseiller: "Un Conseiller",
    oneFamille: "Une Famille",
    enterNumber: "Saisir un numéro",
    chooseTarget: (type) => `-- Choisir ${type} --`,
    enterNumberPlaceholder: "Saisir un numéro",
    markAsMember: "✅ Marquer comme membre",
    closeDetails: "Fermer détails",
    details: "Détails",
    identity: "🫆 Identité",
    civility: "🎗️ Civilité :",
    homme: "Homme",
    femme: "Femme",
    ouiVal: "Oui",
    nonVal: "Non",
    venuOptions: {
      "invité": "Invité",
      "réseaux": "Réseaux",
      "evangélisation": "Évangélisation",
      "autre": "Autre",
    },
    statutInitialOptions: {
      "veut rejoindre ICC": "Veut rejoindre ICC",
      "a déjà son église": "A déjà son église",
      "visiteur": "Visiteur",
    },
    age: "⏳ Tranche d'âge :",
    whatsapp: "💬 WhatsApp :",
    yes: "Oui",
    no: "Non",
    suivi: "📊 Suivi",
    status: "💡 Statut :",
    sentDate: "📆 Envoyé en suivi :",
    comment: "📝 Commentaire :",
    evangComment: "📑 Évangélisation :",
    spiritual: "🕊 Vie spirituelle",
    baptemeEau: "💧 Baptême d'eau :",
    wantsBaptism: "💦 Veut se faire baptiser",
    baptemeFeu: "🔥 Baptême de feu :",
    prayer: "🙏 Prière du salut :",
    conversion: "✨ Conversion :",
    formation: "✒️ Formation :",
    ministere: "💢 Ministère :",
    parcours: "🌱 Parcours",
    howCame: "🧩 Comment venu :",
    reason: "✨ Raison :",
    infos: "📝 Infos :",
    pastoral: "❤️‍🩹 Soin pastoral",
    needs: "❓ Besoins :",
    addSuivi: "💡 Ajouter / Voir suivis",
    editContact: "✏️ Modifier le contact",
    integrationDone: "✅ Intégration terminée",
    deleteContact: "🗑️ Supprimer le contact",
    confirmMember: "⚠️ Confirmation\n\nCe contact n'a plus besoin d'être suivi.\nVoulez-vous vraiment le déplacer dans les membres existants ?",
    confirmDetach: "⚠️ Confirmation\n\nCe contact ne sera plus attribué à vous.\nVoulez-vous continuer ?",
    confirmDelete: "⚠️ Suppression définitive\n\nVoulez-vous vraiment supprimer ce contact ?\n\nCette action supprimera également TOUT l'historique du contact.\nCette action est irréversible.",
    toastMoved: "✅ Contact déplacé dans membres existants",
    toastMoveError: "❌ Erreur lors du déplacement",
    toastIntegDone: "✅ Intégration terminée. Contact détaché.",
    toastIntegError: "❌ Erreur lors de l'opération",
    toastDeleted: "✅ Contact supprimé définitivement",
    toastDeleteError: "❌ Erreur lors de la suppression : ",
    toastSent: "✅ Contact envoyé !",
    toastUpdated: "✅ Contact mis à jour !",
    toastSuivi: "✅ Suivi enregistré !",
    statutSuivi: { 1: "En Attente", 2: "En Suivis", 3: "Intégré", 4: "Refus" },
    call: "📞 Appeler",
    sms: "✉️ SMS",
    waCall: "📱 Appel WhatsApp",
    waMsg: "💬 Message WhatsApp",
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
    conversion: "✨ Conversion :",    
    conversionOptions: [
    { value: "Nouveau converti", label: "Nouveau converti" },
    { value: "Réconciliation",   label: "Réconciliation" },
  ],
    btnEvalLeader: "🏆 Suivi de la progression en leadership",
    parcoursStages: {
      potentiel: { emoji: "🌱", label: "Potentiel identifié" },
      croissance: { emoji: "🌿", label: "Serviteur fidèle" },
      developpement: { emoji: "🌳", label: "Leader en croissance" },
      mature: { emoji: "🌲", label: "Leader confirmé" },
    },
  },
  en: {
    pageTitle: "Members",
    pageTitleHighlight: "List",
    pageSubtitle1: "View and manage",
    pageSubtitle2: "all members,",
    pageSubtitle3: "new contacts",
    pageSubtitle4: "and",
    pageSubtitle5: "existing members",
    pageSubtitle6: ". You can filter by status, view details,",
    pageSubtitle7: "send follow-ups",
    pageSubtitle8: "and update information securely according to your role.",
    search: "🔍Search...",
    allStates: "-- All contact states --",
    nouveau: "New",
    existant: "Existing",
    inactif: "Inactive",
    membersCount: (n) => `${n} members`,
    addMember: "➕ Add a member",
    importList: "📥 Import a list",
    loading: "Loading...",
    newMembersTitle: (date) => `💖 Beloved who came on ${date}`,
    existingTitle: "Existing members",
    inactifTitle: "Inactive contacts",
    city: "🏙️ City:",
    etatContact: "🕊 Contact state:",
    months: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
    createdAt: "Created on",
    cellule: "🏠 Cell:",
    famille: "👨‍👩‍👦 Family:",
    conseiller: "👤 Counsellor(s):",
    sendToSuivi: "Send this contact for follow-up:",
    chooseOption: "-- Choose an option --",
    oneCellule: "A Cell",
    oneConseiller: "A Counsellor",
    oneFamille: "A Family",
    enterNumber: "Enter a number",
    chooseTarget: (type) => `-- Choose ${type} --`,
    enterNumberPlaceholder: "Enter a number",
    markAsMember: "✅ Mark as member",
    closeDetails: "Close details",
    details: "Details",
    identity: "🫆 Identity",
    civility: "🎗️ Title:",
     homme: "Man",
      femme: "Woman",
      ouiVal: "Yes",
      nonVal: "No",
      venuOptions: {
        "invité": "Invited",
        "réseaux": "Social networks",
        "evangélisation": "Evangelisation",
        "autre": "Other",
      },
      statutInitialOptions: {
        "veut rejoindre ICC": "Wants to join ICC",
        "a déjà son église": "Already has a church",
        "visiteur": "Visitor",
      },
    age: "⏳ Age range:",
    whatsapp: "💬 WhatsApp:",
    yes: "Yes",
    no: "No",
    suivi: "📊 Follow-up",
    status: "💡 Status:",
    sentDate: "📆 Sent for follow-up:",
    comment: "📝 Comment:",
    evangComment: "📑 Evangelisation:",
    spiritual: "🕊 Spiritual life",
    baptemeEau: "💧 Water baptism:",
    wantsBaptism: "💦 Wants to be baptised",
    baptemeFeu: "🔥 Fire baptism:",
    prayer: "🙏 Prayer of salvation:",
    conversion: "✨ Conversion:",
    formation: "✒️ Training:",
    ministere: "💢 Ministry:",
    parcours: "🌱 Journey",
    howCame: "🧩 How they came:",
    reason: "✨ Reason:",
    infos: "📝 Info:",
    pastoral: "❤️‍🩹 Pastoral care",
    needs: "❓ Needs:",
    addSuivi: "💡 Add / View follow-ups",
    editContact: "✏️ Edit contact",
    integrationDone: "✅ Integration complete",
    deleteContact: "🗑️ Delete contact",
    confirmMember: "⚠️ Confirmation\n\nThis contact no longer needs follow-up.\nDo you really want to move them to existing members?",
    confirmDetach: "⚠️ Confirmation\n\nThis contact will no longer be assigned to you.\nDo you want to continue?",
    confirmDelete: "⚠️ Permanent deletion\n\nDo you really want to delete this contact?\n\nThis will also delete ALL the contact's history.\nThis action is irreversible.",
    toastMoved: "✅ Contact moved to existing members",
    toastMoveError: "❌ Error moving contact",
    toastIntegDone: "✅ Integration complete. Contact detached.",
    toastIntegError: "❌ Error during operation",
    toastDeleted: "✅ Contact permanently deleted",
    toastDeleteError: "❌ Error during deletion: ",
    toastSent: "✅ Contact sent!",
    toastUpdated: "✅ Contact updated!",
    toastSuivi: "✅ Follow-up saved!",
    statutSuivi: { 1: "Pending", 2: "In Follow-up", 3: "Integrated", 4: "Refused" },
    call: "📞 Call",
    sms: "✉️ SMS",
    waCall: "📱 WhatsApp Call",
    waMsg: "💬 WhatsApp Message",
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
    conversion: "✨ Conversion:",
    conversionOptions: [
    { value: "Nouveau converti", label: "New convert" },
    { value: "Réconciliation",   label: "Reconciliation" },
  ],
    btnEvalLeader: "🏆 Leadership Growth Tracking",
    parcoursStages: {
      potentiel: { emoji: "🌱", label: "Potential identified" },
      croissance: { emoji: "🌿", label: "Faithful Servant" },
      developpement: { emoji: "🌳", label: "Growing leader" },
      mature: { emoji: "🌲", label: "Established Leader" },
    },
  },
};

function getRoles(profile) {
  if (!profile) return [];
  if (Array.isArray(profile.roles)) return profile.roles;
  if (typeof profile.roles === "string") {
    return profile.roles
      .replace("{", "")
      .replace("}", "")
      .split(",")
      .map((r) => r.trim());
  }
  if (profile.role) return [profile.role];
  return [];
}

export default function ListMembers() {
  return (
    <ProtectedRoute
      allowedRoles={[
        "Administrateur",
        "Conseiller",
        "ResponsableIntegration",
        "ResponsableCellule",
      ]}
    >
      <ListMembersContent />
    </ProtectedRoute>
  );
}

function ListMembersContent() {
  const { lang } = useLang();
  const t = translations[lang];

  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");
  const [detailsOpen, setDetailsOpen] = useState({});
  const [cellules, setCellules] = useState([]);
  const [familles, setFamilles] = useState([]);
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

  // ─── FIX : IDs filtrés depuis suivis.besoin ───────────────────
  const [besoinMembreIds, setBesoinMembreIds] = useState(null);

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
  const [openSuiviMemberId, setOpenSuiviMemberId] = useState(null);
  const [openEvalLeaderMemberId, setOpenEvalLeaderMemberId] = useState(null);
  const [leaderParcours, setLeaderParcours] = useState({});
  const [egliseData, setEgliseData] = useState(null);
  const [logoBase64, setLogoBase64] = useState(null);

  const [assignmentsMap, setAssignmentsMap] = useState({});
  const [conseillerMembreIds, setConseillerMembreIds] = useState(null);

  const userProfileRef = useRef(null);
  const assignmentsLoadedRef = useRef(false);
  const [fetchTrigger, setFetchTrigger] = useState(0);

  const localUpdateInProgressRef = useRef(false);

  const famillesActive = useFeature("familles");
  const cellulesActive = useFeature("cellules");
  const conseillerActive = useFeature("conseiller");

  const roles = getRoles(userProfile);
  const isAdmin = roles.includes("Administrateur");
  const isIntegration = roles.includes("ResponsableIntegration");
  const canAddMember = isAdmin || isIntegration;
  const canEditSensitiveFields = isAdmin || isIntegration;

  const getLabel = (options, value) => {
  if (!value) return "—";
  const found = options.find((o) => o.value === value);
  return found ? found.label : value;
  };

  const getMapLabel = (map, value) => {
  if (!value) return "—";
  return map[value] || value;
};

const getYesNo = (value) => {
  if (value === "Oui" || value === true) return t.ouiVal;
  if (value === "Non" || value === false) return t.nonVal;
  return "—";
};

  const [view, setView] = useState(() => {
    if (typeof window !== "undefined")
      return localStorage.getItem("members_view") || "card";
    return "card";
  });

  const { scopedQuery } = useChurchScope();

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

  const statutSuiviLabels = t.statutSuivi;  
      
  const formatDateFr = (dateString) => {
  if (!dateString) return "—";
  const d = new Date(dateString);
  const day = d.getDate().toString().padStart(2, "0");
  return `${day} ${t.months[d.getMonth()]} ${d.getFullYear()}`;
};

  const formatMinistere = (ministereJson, autreMinistere) => {
    let ministereList = [];
    if (ministereJson) {
      try {
        const parsed =
          typeof ministereJson === "string"
            ? JSON.parse(ministereJson)
            : ministereJson;
        ministereList = Array.isArray(parsed) ? parsed : [parsed];
        ministereList = ministereList.filter(
          (m) => m.toLowerCase() !== "autre"
        );
      } catch {
        if (ministereJson.toLowerCase() !== "autre")
          ministereList = [ministereJson];
      }
    }
    if (autreMinistere?.trim()) ministereList.push(autreMinistere.trim());
    return ministereList.join(", ");
  };

  // ─── FIX : charge les membre_ids depuis suivis.besoin ─────────
  useEffect(() => {
    if (!besoinFromUrl || !userProfile) return;

    const fetchBesoinIds = async () => {
      let query = supabase
        .from("suivis")
        .select("membre_id, besoin, date_action");

      if (dateDebut) query = query.gte("date_action", dateDebut);
      if (dateFin)   query = query.lte("date_action", dateFin);

      const { data, error } = await query;
      if (error || !data) {
        console.error("fetchBesoinIds error:", error);
        setBesoinMembreIds([]);
        return;
      }

      const ids = new Set();
      data.forEach((s) => {
        if (!s.besoin) return;
        let items = [];
        try {
          items = Array.isArray(s.besoin) ? s.besoin : JSON.parse(s.besoin);
        } catch { return; }

        items.forEach((item) => {
          const label = typeof item === "string" ? item.trim() : item?.label?.trim();
          if (getCanonicalBesoin(label) === getCanonicalBesoin(besoinFromUrl)) ids.add(s.membre_id);
        });
      });

      setBesoinMembreIds([...ids]);
    };

    fetchBesoinIds();
  }, [besoinFromUrl, userProfile, dateDebut, dateFin]);

  // ─── fetchAssignments ──────────────────────────────────────────
  const fetchAssignments = useCallback(async (currentUserProfile) => {
    const { data: assignments, error } = await supabase
      .from("suivi_assignments")
      .select("membre_id, conseiller_id, role");

    if (error) {
      console.error("fetchAssignments error:", error);
      return;
    }
    if (!assignments || assignments.length === 0) {
      setAssignmentsMap({});
      setConseillerMembreIds([]);
      assignmentsLoadedRef.current = true;
      return;
    }

    const conseillerIds = [
      ...new Set(assignments.map((a) => a.conseiller_id).filter(Boolean)),
    ];

    const { data: profilesData, error: profilesError } = await supabase
      .from("profiles")
      .select("id, prenom, nom")
      .in("id", conseillerIds);

    if (profilesError) {
      console.error("fetchAssignments profiles error:", profilesError);
      return;
    }

    const profileMap = {};
    (profilesData || []).forEach((p) => {
      profileMap[p.id] = p;
    });

    const map = {};
    assignments.forEach((row) => {
      const profile = profileMap[row.conseiller_id];
      if (!profile) return;
      if (!map[row.membre_id]) map[row.membre_id] = [];
      if (!map[row.membre_id].some((c) => c.id === profile.id)) {
        map[row.membre_id].push(profile);
      }
    });
    setAssignmentsMap(map);

    const profile = currentUserProfile || userProfileRef.current;
    if (profile) {
      const rolesArray = getRoles(profile);
      if (rolesArray.includes("Conseiller")) {
        const ids = assignments
          .filter((a) => a.conseiller_id === profile.id)
          .map((a) => a.membre_id);
        setConseillerMembreIds(ids);
      } else {
        setConseillerMembreIds(null);
      }
    }
    assignmentsLoadedRef.current = true;
  }, []);

  const [showImport, setShowImport] = useState(false);

  // -------------------- Scroll to top --------------------
  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  // -------------------- Supprimer --------------------
  const handleSupprimerMembre = async (id) => {
    localUpdateInProgressRef.current = true;

    try {
      const { data: membreData, error: fetchError } = await supabase
        .from("membres_complets")
        .select("profile_id")
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;

      const profileId = membreData?.profile_id;

      if (profileId) {
        const { error: authError } = await supabase.functions.invoke("dynamic-worker", {
          body: { member_id: profileId },
        });
        if (authError) console.warn("Edge Function:", authError);
      }

      const { error: updateError } = await supabase
        .from("membres_complets")
        .update({ etat_contact: "supprime" })
        .eq("id", id);

      if (updateError) throw updateError;

      setAllMembers((prev) => prev.filter((m) => m.id !== id));
      showToast(t.toastDeleted);

    } catch (err) {
      console.error("Erreur suppression :", err);
      showToast(t.toastDeleteError + (err.message || "inconnue"));
    } finally {
      setTimeout(() => {
        localUpdateInProgressRef.current = false;
      }, 2000);
    }
  };

  const handleCommentChange = (id, value) =>
    setCommentChanges((prev) => ({ ...prev, [id]: value }));

  const updateSuivi = async (id) => {
    setUpdating((prev) => ({ ...prev, [id]: true }));
    try {
      setTimeout(() => {
        setUpdating((prev) => ({ ...prev, [id]: false }));
        showToast(t.toastSuivi);
      }, 1000);
    } catch (err) {
      console.error("Erreur update suivi:", err);
      setUpdating((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleAfterSend = async (memberId, type, cible) => {
    localUpdateInProgressRef.current = true;

    const updateData = { etat_contact: "existant" };
    if (type === "famille" && cible?.id) updateData.famille_id = cible.id;
    if (type === "cellule" && cible?.id) updateData.cellule_id = cible.id;

    await supabase
      .from("membres_complets")
      .update(updateData)
      .eq("id", memberId);

    setAllMembers((prev) =>
      prev.map((m) =>
        m.id === memberId
          ? { ...m, suivi_envoye: true, etat_contact: "existant", ...updateData }
          : m
      )
    );

    showToast(t.toastSent);
    setTimeout(() => {
      localUpdateInProgressRef.current = false;
    }, 2000);
  };

  // -------------------- Fetch membres --------------------
  useEffect(() => {
    if (!userProfile) return;

    const rolesArray = getRoles(userProfile);
    const isConseiller = rolesArray.includes("Conseiller");

    if (isConseiller) {
      if (!assignmentsLoadedRef.current) return;
      if (!conseillerIdFromUrl && conseillerMembreIds === null) return;
    }

    let isMounted = true;

    const fetchMembers = async () => {
      try {
        setLoading(true);

        let query = supabase
          .from("membres_complets")
          .select(`
              id, prenom, nom, telephone, ville, sexe, age, star, pilier, etat_contact,
              date_venu, created_at, cellule_id, famille_id, is_whatsapp,
              statut_suivis, suivi_statut, date_envoi_suivi, commentaire_suivis,
              Commentaire_Suivi_Evangelisation, bapteme_eau, veut_se_faire_baptiser,
              bapteme_esprit, priere_salut, type_conversion, Formation, Ministere,
              Autre_Ministere, venu, statut_initial, infos_supplementaires, besoin,
              integration_fini, leader_developpement
            `)  
          .eq("eglise_id", userProfile.eglise_id);

        if (conseillerIdFromUrl) {
          const { data: assignments, error } = await supabase
            .from("suivi_assignments")
            .select("membre_id")
            .eq("conseiller_id", conseillerIdFromUrl);

          if (error) throw error;

          const ids = assignments?.map((a) => a.membre_id) || [];

          if (ids.length === 0) {
            if (isMounted) {
              setAllMembers([]);
              setLoading(false);
            }
            return;
          }

          query = query.in("id", ids);
        } else {
          if (isConseiller) {
            if (!conseillerMembreIds || conseillerMembreIds.length === 0) {
              if (isMounted) {
                setAllMembers([]);
                setLoading(false);
              }
              return;
            }
            query = query.in("id", conseillerMembreIds);
          }

          if (rolesArray.includes("ResponsableCellule")) {
            const { data: cellulesData } = await supabase
              .from("cellules")
              .select("id")
              .eq("responsable_id", userProfile.id);

            const celluleIds = cellulesData?.map((c) => c.id) || [];

            if (celluleIds.length === 0) {
              if (isMounted) {
                setAllMembers([]);
                setLoading(false);
              }
              return;
            }

            query = query.in("cellule_id", celluleIds);
          }
        }

        const { data, error } = await query.order("created_at", {
          ascending: false,
        });

        if (error) throw error;

        if (isMounted) {
          setAllMembers(data || []);
        }
      } catch (err) {
        console.error("Erreur fetchMembers:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchMembers();

    return () => {
      isMounted = false;
    };
  }, [userProfile, conseillerIdFromUrl, conseillerMembreIds, fetchTrigger]);

  // -------------------- Session --------------------
  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);
    };
    getSession();
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => setSession(session)
    );
    return () => listener.subscription.unsubscribe();
  }, []);

  // -------------------- Fetch parcours leaders --------------------
useEffect(() => {
  const leaderIds = members
    .filter((m) => m.leader_developpement)
    .map((m) => m.id);

  if (!leaderIds.length) {
    setLeaderParcours({});
    return;
  }

  const fetchParcours = async () => {
    const { data: evals, error } = await supabase
      .from("evaluations_leader")
      .select("membre_id, parcours_etape, date_action")
      .in("membre_id", leaderIds)
      .order("date_action", { ascending: false });

    if (error) {
      console.error("fetchParcours error:", error);
      return;
    }

    const map = {};
    (evals || []).forEach((e) => {
      if (!map[e.membre_id] && e.parcours_etape) map[e.membre_id] = e.parcours_etape;
    });
    setLeaderParcours(map);
  };

  fetchParcours();
}, [members]);

  // -------------------- Fetch cellules, familles, conseillers, profile --------------------
  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, eglise_id, roles, role")
        .eq("id", user.id)
        .single();
      if (profileError || !profile) return;

      userProfileRef.current = profile;
      setUserProfile(profile);

      const { data: egliseInfo } = await supabase
        .from("eglises")
        .select("*")
        .eq("id", profile.eglise_id)
        .single();

      if (egliseInfo) {
        setEgliseData(egliseInfo);

        if (egliseInfo.logo_url) {
          try {
            const response = await fetch(egliseInfo.logo_url);
            const blob = await response.blob();
            const reader = new FileReader();
            reader.onloadend = () => {
              setLogoBase64(reader.result);
            };
            reader.readAsDataURL(blob);
          } catch (err) {
            console.error("Erreur logo:", err);
          }
        }
      }

      const rolesArray = getRoles(profile);
      if (rolesArray.includes("Conseiller")) {
        setUserRole("Conseiller");
      } else {
        setUserRole(rolesArray[0] || null);
      }

      if (cellulesActive) {
        const { data: cellulesData } = await supabase
          .from("cellules")
          .select("id, cellule_full")
          .eq("eglise_id", profile.eglise_id)
          .order("cellule_full");
        if (cellulesData) setCellules(cellulesData);
      }

      if (famillesActive) {
        const { data: famillesData } = await supabase
          .from("familles")
          .select("id, ville, famille_full")
          .eq("eglise_id", profile.eglise_id)
          .order("famille_full");
        if (famillesData) setFamilles(famillesData);
      }

      if (conseillerActive) {
        const { data: conseillersData } = await supabase
          .from("profiles")
          .select("id, prenom, nom, telephone")
          .contains("roles", ["Conseiller"])
          .eq("eglise_id", profile.eglise_id)
          .order("prenom");
        if (conseillersData) setConseillers(conseillersData);
      }

      await fetchAssignments(profile);
    };

    fetchData();
  }, [fetchAssignments, famillesActive, cellulesActive, conseillerActive]);

  // -------------------- Realtime --------------------
  useEffect(() => {
    if (realtimeChannelRef.current) {
      try {
        realtimeChannelRef.current.unsubscribe();
      } catch (e) {}
      realtimeChannelRef.current = null;
    }

    const channel = supabase.channel("realtime:membres_complets");

    const handleMembresChange = () => {
      if (localUpdateInProgressRef.current) return;
      setFetchTrigger((t) => t + 1);
    };

    const handleAssignmentsChange = () => {
      fetchAssignments(userProfileRef.current);
    };

    channel.on(
      "postgres_changes",
      { event: "*", schema: "public", table: "membres_complets" },
      handleMembresChange
    );
    channel.on(
      "postgres_changes",
      { event: "*", schema: "public", table: "cellules" },
      handleMembresChange
    );
    channel.on(
      "postgres_changes",
      { event: "*", schema: "public", table: "profiles" },
      handleMembresChange
    );
    channel.on(
      "postgres_changes",
      { event: "*", schema: "public", table: "suivi_assignments" },
      handleAssignmentsChange
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
  }, [fetchAssignments]);

  // -------------------- Filtrage --------------------
  const { filteredMembers, filteredNouveaux, filteredAnciens, filteredInactifs } =
    useMemo(() => {
      const actifs = members.filter((m) => m.etat_contact !== "supprime");

      // ─── FIX : filtre sur suivis.besoin via besoinMembreIds ───
      const besoinFiltered = besoinFromUrl
        ? besoinMembreIds === null
          ? [] // chargement en cours
          : actifs.filter((m) => besoinMembreIds.includes(m.id))
        : actifs;

      const searchFiltered = filter
        ? besoinFiltered.filter(
            (m) => m.etat_contact?.trim().toLowerCase() === filter
          )
        : besoinFiltered;

      const searchAndNameFiltered = searchFiltered.filter((m) =>
        `${m.prenom || ""} ${m.nom || ""}`
          .toLowerCase()
          .includes(search.toLowerCase())
      );

      return {
        filteredMembers: searchAndNameFiltered,
        filteredNouveaux: searchAndNameFiltered.filter(
          (m) => m.etat_contact?.trim().toLowerCase() === "nouveau"
        ),
        filteredAnciens: searchAndNameFiltered.filter((m) =>
          ["existant", "ancien"].includes(m.etat_contact?.trim().toLowerCase())
        ),
        filteredInactifs: searchAndNameFiltered.filter(
          (m) => m.etat_contact?.trim().toLowerCase() === "inactif"
        ),
      };
    }, [members, filter, search, besoinFromUrl, besoinMembreIds]);

  const toggleDetails = (id) =>
    setDetailsOpen((prev) => ({ ...prev, [id]: !prev[id] }));

  const getBorderColor = (member) => {
  if (member?.leader_developpement) return "#b82e40";
  const etat = (member?.etat_contact || "").toLowerCase().trim();
  switch (etat) {
    case "nouveau": return "#fb923c";
    case "existant": return "#4ade80";
    case "inactif": return "#9ca3af";
    default: return "#9ca3af";
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

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".phone-menu-container")) setOpenPhoneId(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    localStorage.setItem("members_view", view);
  }, [view]);

  const getConseillersForMember = (memberId) => {
    const assigned = assignmentsMap[memberId];
    if (assigned && assigned.length > 0) {
      return assigned.map((c) => `${c.prenom} ${c.nom}`).join(", ");
    }
    return "—";
  };

  useEffect(() => {
    const highlightId = searchParams.get("highlight");
    if (!highlightId || loading) return;

    const timer = setTimeout(() => {
      const el = document.getElementById(`member-${highlightId}`);
      if (!el) return;

      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.style.transition = "box-shadow 0.5s ease, transform 0.5s ease";
      el.style.boxShadow = "0 0 0 4px #f59e0b, 0 0 24px 8px rgba(245,158,11,0.4)";
      el.style.transform = "scale(1.02)";

      setTimeout(() => {
        el.style.transition = "box-shadow 1s ease, transform 1s ease";
        el.style.boxShadow = "";
        el.style.transform = "";
      }, 5000);
    }, 500);

    return () => clearTimeout(timer);
  }, [loading, searchParams]);

  // -------------------- renderMemberCard --------------------
  const renderMemberCard = (m) => {
    const isOpen = detailsOpen[m.id];
      const besoinsArray = !m.besoin
        ? []
        : Array.isArray(m.besoin)
        ? m.besoin
        : (() => {
            try {
              const arr = JSON.parse(m.besoin);
              return Array.isArray(arr) ? arr : [m.besoin];
            } catch {
              return [m.besoin];
            }
          })();
      const besoins = besoinsArray.length
        ? besoinsArray.map((b) => t.besoinOptions[b] || b).join(", ")
        : "—";

    return (
      <div
        key={m.id}
        id={`member-${m.id}`}
        className="bg-white px-3 pb-3 pt-1 rounded-xl shadow-md border-l-4 relative"
        style={{ borderLeftColor: getBorderColor(m) }}
      >
        {m.isNouveau && (
          <div className="absolute top-2 right-3 flex items-center gap-1">
            <span className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600 bg-white px-3 py-1 rounded-md shadow">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-blue-600" />
              {t.nouveau}
            </span>
          </div>
        )}

        <div className="flex flex-col items-center mt-8">
          <h2 className="text-base font-bold text-center flex items-center justify-center gap-1">
            {m.pilier === true && <span title="Pilier">🎖️</span>}
              <span>
                {m.prenom} {m.nom}
              </span>
              {m.star === true &&
                m.etat_contact?.trim().toLowerCase() === "existant" && (
                  <span className="text-yellow-400">⭐</span>
                )}
              <div className="absolute right-8">
                <PresenceDot
                  memberId={m.id}
                  egliseId={userProfile?.eglise_id}
                  dateVenu={m.date_venu}
                />
              </div>
            </h2>
            
            {m.leader_developpement && leaderParcours[m.id] && t.parcoursStages[leaderParcours[m.id]] && (
              <p className="text-center text-sm font-semibold mt-1" style={{ color: "#333699" }}>
                {t.parcoursStages[leaderParcours[m.id]].emoji} {t.parcoursStages[leaderParcours[m.id]].label}
              </p>
            )}

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
                  <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 bg-white rounded-lg shadow-lg border z-50 w-56">
                    <a
                      href={`tel:${m.telephone}`}
                      className="block px-4 py-2 text-sm text-black hover:bg-gray-100"
                    >
                      {t.call}
                    </a>
                    <a
                      href={`sms:${m.telephone}`}
                      className="block px-4 py-2 text-sm text-black hover:bg-gray-100"
                    >
                      {t.sms}
                    </a>
                    <a
                      href={`https://wa.me/${m.telephone.replace(/\D/g, "")}?call`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block px-4 py-2 text-sm text-black hover:bg-gray-100"
                    >
                      {t.waCall}
                    </a>
                    <a
                      href={`https://wa.me/${m.telephone.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block px-4 py-2 text-sm text-black hover:bg-gray-100"
                    >
                      {t.waMsg}
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
            <p className="text-center">{t.city} {m.ville || "—"}</p>
            <p className="text-center">
              {t.etatContact} {m.etat_contact || "—"}
            </p>
            <div className="w-full flex justify-end mt-3">
              <p className="text-[11px] text-gray-400">
                {t.createdAt} {formatDateFr(m.date_venu)}
              </p>
            </div>

            {cellulesActive && (
              <p>
                {t.cellule}{" "}
                {m.cellule_id
                  ? cellules.find(
                      (c) => String(c.id) === String(m.cellule_id)
                    )?.cellule_full || "—"
                  : "—"}
              </p>
            )}

            {famillesActive && (
              <p>
                {t.famille}{" "}
                {m.famille_id
                  ? familles.find(
                      (f) => String(f.id) === String(m.famille_id)
                    )?.famille_full || "—"
                  : "—"}
              </p>
            )}

            {conseillerActive && (
              <p>{t.conseiller} {getConseillersForMember(m.id)}</p>
            )}
          </div>

          {/* Envoyer en suivi */}
          <div className="mt-2 w-full">
            <label className="font-semibold text-sm">
              {t.sendToSuivi}
            </label>
            <select
              value={selectedTargetType[m.id] || ""}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedTargetType((prev) => ({ ...prev, [m.id]: val }));
                setSelectedTargets((prev) => ({ ...prev, [m.id]: "" }));
              }}
              className="mt-1 w-full border rounded px-2 py-1 text-sm"
            >
              <option value="">{t.chooseOption}</option>
              {cellulesActive && (
                <option value="cellule">{t.oneCellule}</option>
              )}
              {conseillerActive && (
                <option value="conseiller">{t.oneConseiller}</option>
              )}
              {famillesActive && (
                <option value="famille">{t.oneFamille}</option>
              )}
              <option value="numero">{t.enterNumber}</option>
            </select>

            {(
              (cellulesActive && selectedTargetType[m.id] === "cellule") ||
              (conseillerActive && selectedTargetType[m.id] === "conseiller") ||
              (famillesActive && selectedTargetType[m.id] === "famille")
            ) && (
              <select
                value={selectedTargets[m.id] || ""}
                onChange={(e) =>
                  setSelectedTargets((prev) => ({
                    ...prev,
                    [m.id]: e.target.value,
                  }))
                }
                className="mt-1 w-full border rounded px-2 py-1 text-sm"
              >
                <option value="">
                  {t.chooseTarget(selectedTargetType[m.id])}
                </option>
                {cellulesActive &&
                  selectedTargetType[m.id] === "cellule" &&
                  cellules.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.cellule_full || "—"}
                    </option>
                  ))}
                {conseillerActive &&
                  selectedTargetType[m.id] === "conseiller" &&
                  conseillers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.prenom || "—"} {c.nom || ""}
                    </option>
                  ))}
                {famillesActive &&
                  selectedTargetType[m.id] === "famille" &&
                  familles.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.famille_full || "—"}
                    </option>
                  ))}
              </select>
            )}

            {selectedTargetType[m.id] === "numero" && (
              <input
                type="tel"
                placeholder={t.enterNumberPlaceholder}
                value={selectedTargets[m.id] || ""}
                onChange={(e) =>
                  setSelectedTargets((prev) => ({
                    ...prev,
                    [m.id]: e.target.value,
                  }))
                }
                className="mt-1 w-full border rounded px-2 py-1 text-sm"
              />
            )}

            {selectedTargetType[m.id] && selectedTargets[m.id] && (
              <div className="pt-2">
                <BoutonEnvoyer
                  membre={m}
                  type={selectedTargetType[m.id]}
                  cible={
                    selectedTargetType[m.id] === "cellule"
                      ? cellules.find((c) => c.id === selectedTargets[m.id])
                      : selectedTargetType[m.id] === "conseiller"
                      ? conseillers.find((c) => c.id === selectedTargets[m.id])
                      : selectedTargetType[m.id] === "famille"
                      ? familles.find((f) => f.id === selectedTargets[m.id])
                      : selectedTargets[m.id]
                  }
                  onEnvoyer={(id) =>
                    handleAfterSend(
                      id,
                      selectedTargetType[m.id],
                      selectedTargetType[m.id] === "cellule"
                        ? cellules.find((c) => c.id === selectedTargets[m.id])
                        : selectedTargetType[m.id] === "conseiller"
                        ? conseillers.find(
                            (c) => c.id === selectedTargets[m.id]
                          )
                        : selectedTargetType[m.id] === "famille"
                        ? familles.find((f) => f.id === selectedTargets[m.id])
                        : selectedTargets[m.id]
                    )
                  }
                  session={session}
                  showToast={showToast}
                />
              </div>
            )}
          </div>

          {/* Marquer comme membre */}
          {m.etat_contact?.trim().toLowerCase() === "nouveau" && (
            <div className="w-full flex justify-end mt-4">
              <button
                onClick={() => {
                  if (window.confirm(t.confirmMember)) {
                    localUpdateInProgressRef.current = true;
                    supabase
                      .from("membres_complets")
                      .update({ etat_contact: "existant" })
                      .eq("id", m.id)
                      .then(({ error }) => {
                        if (error) {
                          showToast(t.toastMoveError);
                          localUpdateInProgressRef.current = false;
                        } else {
                          setAllMembers((prev) =>
                            prev.map((mem) =>
                              mem.id === m.id
                                ? { ...mem, etat_contact: "existant" }
                                : mem
                            )
                          );
                          showToast(t.toastMoved);
                          setTimeout(() => {
                            localUpdateInProgressRef.current = false;
                          }, 2000);
                        }
                      });
                  }
                }}
                className="ml-auto bg-white text-green-600 px-3 py-1 rounded-md text-sm font-semibold shadow-sm hover:shadow-md transition-shadow"
              >
                {t.markAsMember}
              </button>
            </div>
          )}

          {/* Bouton Détails */}
          <button
            onClick={() => toggleDetails(m.id)}
            className="text-orange-500 underline text-sm mt-3"
          >
            {isOpen ? t.closeDetails : t.details}
          </button>

          {/* Bouton PDF */}
          <div className="w-full flex justify-end mt-3">
            <ExportMembrePDF
              membre={m}
              logoBase64={logoBase64}
              eglise={egliseData}
              churchName={egliseData?.nom}
              celluleName={
                cellules.find(
                  (c) => String(c.id) === String(m.cellule_id)
                )?.cellule_full
              }
              familleName={
                familles.find(
                  (f) => String(f.id) === String(m.famille_id)
                )?.famille_full
              }
              conseillerName={getConseillersForMember(m.id)}
            />
          </div>

          {/* Détails */}
          {isOpen && (
            <div className="text-black text-sm mt-3 w-full space-y-4">
              <div>
                <p className="font-bold text-[#2E3192] mb-1">{t.identity}</p>
                <p>{t.civility} {m.sexe === "Homme" ? t.homme : m.sexe === "Femme" ? t.femme : "—"}</p>
                <p>{t.age} {m.age || "—"}</p>
                <p>{t.whatsapp} {m.is_whatsapp ? t.yes : t.no}</p>
              </div>
              <hr />

              <div>
                <p className="font-bold text-[#2E3192] mb-1">{t.suivi}</p>
                <p className="font-semibold text-[#2E3192]">
                  {t.status}{" "}
                  {statutSuiviLabels[m.statut_suivis] ||
                    m.suivi_statut ||
                    "—"}
                </p>
                <p>{t.sentDate} {formatDateFr(m.date_envoi_suivi)}</p>
                <p>{t.comment} {m.commentaire_suivis || "—"}</p>
                <p>{t.evangComment} {m.Commentaire_Suivi_Evangelisation || "—"}</p>
              </div>
              <hr />

              <div>
                <p className="font-bold text-[#2E3192] mb-1">{t.spiritual}</p>
                <p>{t.baptemeEau} {getYesNo(m.bapteme_eau)}</p>
                  {m.bapteme_eau === "Non" &&
                    m.veut_se_faire_baptiser === "Oui" && (
                      <p className="ml-4">{t.wantsBaptism}</p>
                    )}
                <p>{t.baptemeFeu} {getYesNo(m.bapteme_esprit)}</p>
                <p>{t.prayer} {getYesNo(m.priere_salut)}</p>
                <p>{t.conversion} {getLabel(t.conversionOptions, m.type_conversion)}</p>
                <p>{t.formation} {m.Formation || "—"}</p>
                <p>
                  {t.ministere}{" "}
                  {formatMinistere(m.Ministere, m.Autre_Ministere) || "—"}
                </p>
              </div>
              <hr />

              <div>
                <p className="font-bold text-[#2E3192] mb-1">{t.parcours}</p>
                <p>{t.howCame} {getMapLabel(t.venuOptions, m.venu)}</p>
                <p>{t.reason} {getMapLabel(t.statutInitialOptions, m.statut_initial)}</p>
                <p>{t.infos} {m.infos_supplementaires || "—"}</p>
              </div>
              <hr />

              <div>
                <p className="font-bold text-[#2E3192] mb-1">{t.pastoral}</p>
                <p>{t.needs} {besoins}</p>
                <div className="flex justify-center gap-2 flex-wrap">
                  <button
                    onClick={() => setOpenSuiviMemberId(m.id)}
                    className="mt-2 text-sm bg-[#333699] text-amber-300 px-3 py-1 rounded"
                  >
                    {t.addSuivi}
                  </button>
                  {m.leader_developpement && (
                    <button
                      onClick={() => setOpenEvalLeaderMemberId(m.id)}
                      className="mt-2 text-sm px-3 py-1 rounded text-white font-semibold"
                      style={{ background: "linear-gradient(135deg, #2E3192 0%, #6366f1 100%)" }}
                    >
                      {t.btnEvalLeader}
                    </button>
                  )}
                </div>
                {openSuiviMemberId === m.id && (
                  <SuiviPopup
                    member={m}
                    onClose={() => setOpenSuiviMemberId(null)}
                    user={userProfile}
                  />
                )}
                {openEvalLeaderMemberId === m.id && (
                  <EvaluationLeaderPopup
                    member={m}
                    user={userProfile}
                    onClose={() => setOpenEvalLeaderMemberId(null)}
                    onSaved={(membreId, etape) =>
                      setLeaderParcours((prev) => ({ ...prev, [membreId]: etape }))
                    }
                  />
                )}
              </div>

              <div className="flex flex-col items-center">
                <div className="flex flex-col items-center w-full p-4 bg-white rounded-lg shadow-md space-y-2">
                  <button
                    onClick={() => setEditMember(m)}
                    className="w-full text-orange-500 text-sm py-2 rounded-md"
                  >
                    {t.editContact}
                  </button>

                  {userRole === "Conseiller" &&
                    m.integration_fini !== "fini" && (
                      <button
                        onClick={async () => {
                          if (!window.confirm(t.confirmDetach)) return;
                          try {
                            const { error } = await supabase
                              .from("membres_complets")
                              .update({
                                integration_fini: "fini",
                                conseiller_id: null,
                              })
                              .eq("id", m.id);
                            if (error) throw error;
                            setAllMembers((prev) =>
                              prev.filter((mem) => mem.id !== m.id)
                            );
                            showToast(t.toastIntegDone);
                          } catch (err) {
                            showToast(t.toastIntegError);
                          }
                        }}
                        className="ml-auto bg-white text-blue-600 w-full py-2 rounded-md font-semibold shadow-sm"
                      >
                        {t.integrationDone}
                      </button>
                    )}

                  <button
                    onClick={() => {
                      if (window.confirm(t.confirmDelete)) {
                        handleSupprimerMembre(m.id);
                      }
                    }}
                    className="w-full text-red-600 text-xs font-semibold py-1.5 rounded-md"
                  >
                    {t.deleteContact}
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
    <div
      className="min-h-screen flex flex-col items-center p-4 sm:p-6"
      style={{ background: "#333699" }}
    >
      <HeaderPages />
      <h1 className="text-2xl font-bold mt-4 mb-6 text-blue-300 text-center text-white">
        {t.pageTitle} <span className="text-emerald-300">{t.pageTitleHighlight}</span>
      </h1>

      <div className="max-w-3xl w-full mb-6 text-center">
        <p className="italic text-base text-white/90">
          <span className="text-blue-300 font-semibold">{t.pageSubtitle1}</span>{" "}
          {t.pageSubtitle2}{" "}
          <span className="text-blue-300 font-semibold">{t.pageSubtitle3}</span>{" "}
          {t.pageSubtitle4}{" "}
          <span className="text-blue-300 font-semibold">{t.pageSubtitle5}</span>
          {t.pageSubtitle6}{" "}
          <span className="text-blue-300 font-semibold">{t.pageSubtitle7}</span>{" "}
          {t.pageSubtitle8}
        </p>
      </div>

      <div className="mt-3 w-full max-w-4xl flex justify-center mb-2">
        <input
          type="text"
          placeholder={t.search}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-2/3 px-3 py-1 rounded-md border text-black"
        />
      </div>

      <div className="w-full max-w-6xl flex justify-center items-center mb-4 gap-2 flex-wrap">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-1 rounded-md border text-black text-sm"
        >
          <option value="">{t.allStates}</option>
          <option value="nouveau">{t.nouveau}</option>
          <option value="existant">{t.existant}</option>
          <option value="inactif">{t.inactif}</option>
        </select>
        <span className="text-white text-sm ml-2">
          {t.membersCount(filteredMembers.length)}
        </span>
      </div>

      <div className="w-full flex justify-end gap-2">
        {canAddMember && (
          <>
            <button
              onClick={() => router.push("/AddContact")}
              className="text-white font-semibold px-4 py-2 rounded shadow text-sm"
            >
              {t.addMember}
            </button>
            <button
              onClick={() => router.push("/admin/import")}
              className="text-white font-semibold px-4 py-2 rounded shadow text-sm"
            >
              {t.importList}
            </button>
          </>
        )}
      </div>

      {view === "card" && (
        <>
          {loading ? (
            <p className="text-white text-center w-full">{t.loading}</p>
          ) : (
            <>
              {filteredNouveaux.length > 0 && (
                <>
                  <h2 className="w-full max-w-6xl text-white font-bold mb-2 text-lg text-sm">
                    {t.newMembersTitle(dateDuJour)}
                  </h2>
                  <div className="w-full max-w-6xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                    {filteredNouveaux.map((m) =>
                      renderMemberCard({ ...m, isNouveau: true })
                    )}
                  </div>
                </>
              )}

              {filteredAnciens.length > 0 && (
                <>
                  <h2 className="w-full max-w-6xl font-bold mb-2 text-lg bg-gradient-to-r from-blue-500 to-gray-300 bg-clip-text text-transparent">
                    {t.existingTitle}
                  </h2>
                  <div className="w-full max-w-6xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                    {filteredAnciens.map((m) => renderMemberCard(m))}
                  </div>
                </>
              )}

              {filteredInactifs.length > 0 && (
                <>
                  <h2 className="w-full max-w-6xl text-gray-400 font-bold mb-2 text-lg">
                    {t.inactifTitle}
                  </h2>
                  <div className="w-full max-w-6xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {filteredInactifs.map((m) => renderMemberCard(m))}
                  </div>
                </>
              )}
            </>
          )}
        </>
      )}

      <EditMemberPopup
        member={editMember}
        cellules={cellulesActive ? cellules : []}
        familles={famillesActive ? familles : []}
        conseillers={conseillerActive ? conseillers : []}
        currentUserRoles={getRoles(userProfile)}
        user={userProfile}
        onClose={() => setEditMember(null)}
        onUpdateMember={async (updatedMember, newStage) => {          
          setAllMembers((prev) =>
            prev.map((m) =>
              m.id === updatedMember.id ? updatedMember : m
            )
          );
          if (newStage) {
            setLeaderParcours((prev) => ({ ...prev, [updatedMember.id]: newStage }));
          }
          await fetchAssignments(userProfile);
          setEditMember(null);
          showToast(t.toastUpdated);
        }}
      />

      {showingToast && (
        <div className="fixed bottom-4 right-4 bg-black text-white px-4 py-2 rounded-lg shadow-lg z-50">
          {toastMessage}
        </div>
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
