"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/router";
import supabase from "../../lib/supabaseClient";
import HeaderPages from "../../components/HeaderPages";
import Footer from "../../components/Footer";
import ProtectedRoute from "../../components/ProtectedRoute";
import EditMemberSuivisPopup from "../../components/EditMemberSuivisPopup";
import SuiviPopup from "../../components/SuiviPopup";
import EvaluationLeaderPopup from "../../components/Evaluationleaderpopup";
import PresenceDot from "../../components/PresenceDot";
import { useLang } from "../../hooks/useLang";
import ExportMembrePDF from "../../components/ExportMembrePDF";

const translations = {
  fr: {
    titrePrefix: "Membres de m",
    titreSingulierA: "a ",
    titrePlurielsA: "es ",
    titreCelluleSing: "cellule",
    titreCellulePlur: "cellules",
    intro: "Consultez et gérez facilement les membres de vos cellules.",
    introAccent1: "Recherchez",
    intro2: ", filtrez par cellule,",
    introAccent2: "accédez aux détails complets",
    intro3: "et mettez à jour les informations pour un",
    introAccent3: "suivi précis et personnalisé",
    btnAjouter: "➕ Ajouter un membre",
    btnImporter: "📥 Importer une Liste",
    chargement: "Chargement...",
    aucunMembre: "Aucun membre trouvé",
    erreurChargement: "Erreur de chargement",
    acces: "Accès non autorisé",
    creLe: "Créé le",
    details: "Détails",
    fermerDetails: "Fermer détails",
    appeler: "📞 Appeler",
    sms: "✉️ SMS",
    appelWhatsApp: "📱 Appel WhatsApp",
    msgWhatsApp: "💬 Message WhatsApp",
    identiteLabel: "🫆 Identité",
    civilite: "🎗️ Civilité",
    parcoursStages: {
      potentiel: { emoji: "🌱", label: "Potentiel identifié" },
      croissance: { emoji: "🌿", label: "Leader en croissance" },
      developpement: { emoji: "🌳", label: "Leader en développement" },
      mature: { emoji: "🌲", label: "Leader mature" },
    },
    homme: "Homme",
    femme: "Femme",
    oui: "Oui",
    non: "Non",
    conversionOptions: {
      "Nouveau converti": "Nouveau converti",
      "Réconciliation": "Réconciliation",
    },
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
    typeEvangOptions: {
    "Individuel": "Individuel",
    "Sortie de groupe": "Sortie de groupe",
    "Campagne d'évangélisation": "Campagne d'évangélisation",
    "Évangélisation de rue": "Évangélisation de rue",
    "Évangélisation maison": "Évangélisation maison",
    "Évangélisation stade": "Évangélisation stade",
  },
    age: "⏳ Tranche d'age",
    whatsapp: "💬 WhatsApp",
    oui: "Oui",
    non: "Non",
    suiviLabel: "📊 Suivi",
    envoiSuivi: "📆 Envoyé en suivi",
    statutSuivi: "💡 Statut Suivi",
    spirituelLabel: "🕊 Vie spirituelle",
    baptemeEau: "💧 Baptême d'Eau",
    veutBaptise: "💦 Veut se faire baptiser",
    baptemeFeu: "🔥 Baptême de Feu",
    priereSalut: "🙏 Prière du salut",
    typeConversion: "☀️ Type de conversion",
    formation: "✒️ Formation",
    ministere: "💢 Ministère",
    parcoursLabel: "🌱 Parcours",
    commentVenu: "🧩 Comment est-il venu",
    raisonVenue: "✨ Raison de la venue",
    infos: "📝 Infos",
    commentaireSuivis: "📝 Commentaire Suivis",
    pastoralLabel: "❤️‍🩹 Soin pastoral",
    besoinsDiff: "❓ Difficultés / Besoins",
    btnSuivis: "💡 Ajouter / Voir suivis",
    btnEvalLeader: "🌱 Leader en développement",
    btnModifier: "✏️ Modifier le contact",
    statutLabels: {
      1: "En attente",
      2: "En Suivis",
      3: "Intégré",
      4: "Refus",
    },
    mois: ["Janv","Févr","Mars","Avr","Mai","Juin","Juil","Août","Sept","Oct","Nov","Déc"],
  },
  en: {
    titrePrefix: "Members of m",
    titreSingulierA: "y ",
    titrePlurielsA: "y ",
    titreCelluleSing: "cell group",
    titreCellulePlur: "cell groups",
    intro: "Easily view and manage the members of your cell groups.",
    introAccent1: "Search",
    intro2: ", filter by cell,",
    introAccent2: "access full details",
    intro3: "and update information for",
    introAccent3: "precise, personalized follow-up",
    btnAjouter: "➕ Add a member",
    btnImporter: "📥 Import a list",
    chargement: "Loading...",
    aucunMembre: "No members found",
    erreurChargement: "Loading error",
    acces: "Access denied",
    creLe: "Created on",
    details: "Details",
    fermerDetails: "Close details",
    appeler: "📞 Call",
    sms: "✉️ SMS",
    appelWhatsApp: "📱 WhatsApp call",
    msgWhatsApp: "💬 WhatsApp message",
    identiteLabel: "🫆 Identity",
    civilite: "🎗️ Title",
    parcoursStages: {
      potentiel: { emoji: "🌱", label: "Potential identified" },
      croissance: { emoji: "🌿", label: "Growing leader" },
      developpement: { emoji: "🌳", label: "Developing leader" },
      mature: { emoji: "🌲", label: "Mature leader" },
    },
    homme: "Man",
    femme: "Woman",
    oui: "Yes",
    non: "No",
    conversionOptions: {
      "Nouveau converti": "New convert",
      "Réconciliation": "Reconciliation",
    },
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
    typeEvangOptions: {
    "Individuel": "Individual",
    "Sortie de groupe": "Group outing",
    "Campagne d'évangélisation": "Evangelism campaign",
    "Évangélisation de rue": "Street evangelism",
    "Évangélisation maison": "House evangelism",
    "Évangélisation stade": "Stadium evangelism",
  },
    age: "⏳ Age range",
    whatsapp: "💬 WhatsApp",
    oui: "Yes",
    non: "No",
    suiviLabel: "📊 Follow-up",
    envoiSuivi: "📆 Sent to follow-up",
    statutSuivi: "💡 Follow-up status",
    spirituelLabel: "🕊 Spiritual life",
    baptemeEau: "💧 Water baptism",
    veutBaptise: "💦 Wants to be baptized",
    baptemeFeu: "🔥 Spirit baptism",
    priereSalut: "🙏 Salvation prayer",
    typeConversion: "☀️ Conversion type",
    formation: "✒️ Training",
    ministere: "💢 Ministry",
    parcoursLabel: "🌱 Journey",
    commentVenu: "🧩 How they came",
    raisonVenue: "✨ Reason for coming",
    infos: "📝 Info",
    commentaireSuivis: "📝 Follow-up comment",
    pastoralLabel: "❤️‍🩹 Pastoral care",
    besoinsDiff: "❓ Difficulties / Needs",
    btnSuivis: "💡 Add / View follow-ups",
    btnEvalLeader: "🌱 Development Leader",
    btnModifier: "✏️ Edit contact",
    statutLabels: {
      1: "Pending",
      2: "In follow-up",
      3: "Integrated",
      4: "Refused",
    },
    mois: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
  },
};

export default function MembresCellule() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur", "ResponsableCellule", "SuperviseurCellule"]}>
      <MembresCelluleContent />
    </ProtectedRoute>
  );
}

function MembresCelluleContent() {
  const router = useRouter();
  const { lang } = useLang();
  const t = translations[lang];

  const { memberId, celluleId, highlight } = router.query;

  const [membres, setMembres] = useState([]);
  const [cellules, setCellules] = useState([]);
  const [filterCellule, setFilterCellule] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [editMember, setEditMember] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState({});
  const [openPhoneId, setOpenPhoneId] = useState(null);
  const phoneMenuRef = useRef(null);
  const highlightRef = useRef({});
  const highlightDoneRef = useRef(false);
  const [openSuiviMemberId, setOpenSuiviMemberId] = useState(null);
  const [openEvalLeaderMemberId, setOpenEvalLeaderMemberId] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [logoBase64, setLogoBase64] = useState(null);
  const [egliseData, setEgliseData] = useState(null);
  const [leaderParcours, setLeaderParcours] = useState({});

  const memberIdStr =
    typeof memberId === "string"
      ? memberId
      : Array.isArray(memberId)
      ? memberId[0]
      : null;

  // ── Helpers ──
  const parseJsonArray = (value) => {
    if (!value) return [];
    try {
      const parsed = typeof value === "string" ? JSON.parse(value) : value;
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      return [value];
    }
  };

  const formatMinistere = (ministereJson, autreMinistere) => {
    let list = parseJsonArray(ministereJson).filter((m) => m.toLowerCase() !== "autre");
    if (autreMinistere?.trim()) list.push(autreMinistere.trim());
    return list.join(", ") || "—";
  };

  const formatDateFr = (dateString) => {
    if (!dateString) return "—";
    const d = new Date(dateString);
    const day = d.getDate().toString().padStart(2, "0");
    return `${day} ${t.mois[d.getMonth()]} ${d.getFullYear()}`;
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

  const formatBesoinField = (field) => {
  if (!field) return "—";
  const arr = parseJsonArray(field);
  return arr.map((b) => t.besoinOptions[b] || b).join(", ") || "—";
};

  const getBorderColor = (member) => {
    if (member?.leader_developpement) return "#b82e40";
    switch ((member?.etat_contact || "").toLowerCase().trim()) {
      case "nouveau":  return "#fb923c";
      case "existant": return "#4ade80";
      case "inactif":  return "#9ca3af";
      default:         return "#9ca3af";
    }
  };

  const handleUpdateMember = (updated) => {
    setMembres((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
  };

  // ── Highlight animé ──
  useEffect(() => {
    if (!highlight || loading || highlightDoneRef.current) return;

    let attempts = 0;
    const tryHighlight = () => {
      const el = highlightRef.current[highlight];
      if (!el) {
        attempts++;
        if (attempts < 20) setTimeout(tryHighlight, 150);
        return;
      }
      highlightDoneRef.current = true;

      const url = new URL(window.location.href);
      url.searchParams.delete("highlight");
      window.history.replaceState({}, "", url.toString());

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
  }, [highlight, loading]);

  // ── Fetch user + cellules ──
useEffect(() => {
  const fetchCellules = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles").select("id, role, eglise_id").eq("id", user.id).single();
    if (!profile) return;

    setUserRole(profile.role);

    if (profile.role === "ResponsableCellule") {
      const { data: directesData } = await supabase
        .from("cellules")
        .select("*")
        .eq("responsable_id", profile.id)
        .eq("eglise_id", profile.eglise_id);

      const { data: fillesData } = await supabase
        .from("cellules")
        .select("*")
        .eq("cellule_mere_id", profile.id)
        .eq("eglise_id", profile.eglise_id);

      const toutes = [...(directesData || []), ...(fillesData || [])];
      const unique = Array.from(new Map(toutes.map((c) => [c.id, c])).values());
      setCellules(unique);
      return;
    }

    // Administrateur + SuperviseurCellule → toutes les cellules de l'église
    const { data } = await supabase
      .from("cellules")
      .select("*")
      .eq("eglise_id", profile.eglise_id)
      .order("cellule_full");

    setCellules(data || []);
  };

  fetchCellules();
}, []);

  // ── Charger infos église ──
  useEffect(() => {
    const fetchEglise = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles").select("eglise_id").eq("id", user.id).single();
      if (!profile?.eglise_id) return;

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
            reader.onloadend = () => setLogoBase64(reader.result);
            reader.readAsDataURL(blob);
          } catch (err) {
            console.error("Erreur logo:", err);
          }
        }
      }
    };

    fetchEglise();
  }, []);

  // ── Fetch membres ──
  useEffect(() => {
    if (memberIdStr) return;

    const fetchAllMembers = async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
          .from("profiles").select("id, role, eglise_id").eq("id", user.id).single();
        if (!profile) return;

        let query = supabase
          .from("membres_complets")
          .select("*")
          .eq("statut_suivis", 3)
          .eq("eglise_id", profile.eglise_id)
          .not("cellule_id", "is", null)
          .neq("etat_contact", "supprime")
          .order("created_at", { ascending: false });

        let mesCelluleIds = [];

        if (profile.role === "Administrateur") {
          if (celluleId) query = query.eq("cellule_id", celluleId);

       } else if (profile.role === "ResponsableCellule") {
  const { data: cellulesDirect } = await supabase
    .from("cellules").select("id")
    .eq("responsable_id", profile.id)
    .eq("eglise_id", profile.eglise_id);
  const directIds = (cellulesDirect || []).map((c) => c.id);

  // Enfants via profile_id
  const { data: cellulesFillesData } = await supabase
    .from("cellules").select("id")
    .eq("cellule_mere_id", profile.id)
    .eq("eglise_id", profile.eglise_id);
  const fillesIds = (cellulesFillesData || []).map((c) => c.id);

  mesCelluleIds = [...new Set([...directIds, ...fillesIds])];

  if (!mesCelluleIds.length) {
    setMembres([]);
    setMessage(t.aucunMembre);
    setLoading(false);
    return;
  }

  query = query.in("cellule_id", mesCelluleIds);
  if (celluleId && mesCelluleIds.includes(celluleId))
    query = query.eq("cellule_id", celluleId);

       } else if (profile.role === "SuperviseurCellule") {
  if (celluleId) query = query.eq("cellule_id", celluleId);
          const { data: mesCellules } = await supabase
            .from("cellules").select("id")
            .eq("superviseur_id", profile.id)
            .eq("eglise_id", profile.eglise_id);
          mesCelluleIds = (mesCellules || []).map((c) => c.id);

          if (!mesCelluleIds.length) {
            setMembres([]);
            setMessage(t.aucunMembre);
            setLoading(false);
            return;
          }
          query = query.in("cellule_id", mesCelluleIds);
          if (celluleId && mesCelluleIds.includes(celluleId))
            query = query.eq("cellule_id", celluleId);

        } else {
          setMembres([]);
          setMessage(t.acces);
          setLoading(false);
          return;
        }

        const { data, error } = await query;
        if (error) throw error;
        setMembres(data || []);

        const leaderIds = (data || []).filter((m) => m.leader_developpement).map((m) => m.id);
          if (leaderIds.length) {
            const { data: evals } = await supabase
              .from("evaluations_leader")
              .select("membre_id, parcours_etape, date_action")
              .in("membre_id", leaderIds)
              .order("date_action", { ascending: false });
          
            const map = {};
            (evals || []).forEach((e) => {
              if (!map[e.membre_id] && e.parcours_etape) map[e.membre_id] = e.parcours_etape;
            });
            setLeaderParcours(map);
          }
                  
        if (!data || data.length === 0) setMessage(t.aucunMembre);

      } catch (err) {
        setMessage(t.erreurChargement);
      } finally {
        setLoading(false);
      }
    };

    fetchAllMembers();
  }, [memberIdStr, celluleId]);

  // ── Click outside ──
  const handleClickOutside = useCallback((e) => {
    if (phoneMenuRef.current && !phoneMenuRef.current.contains(e.target))
      setOpenPhoneId(null);
  }, []);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [handleClickOutside]);

  useEffect(() => {
    if (celluleId) setFilterCellule(celluleId);
  }, [celluleId]);

  // ── Filtre ──
  const filteredMembres = membres.filter(
    (m) =>
      (!filterCellule || m.cellule_id === filterCellule) &&
      (!search ||
        m.prenom.toLowerCase().includes(search.toLowerCase()) ||
        m.nom.toLowerCase().includes(search.toLowerCase()) ||
        (m.telephone && m.telephone.includes(search)))
  );

  // ── Render ──
  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: "#333699" }}>
      <HeaderPages />

      <h1 className="text-2xl font-bold mt-4 mb-6 text-blue-300 text-center text-white">
        <span className="text-white">
          {t.titrePrefix}{cellules.length > 1 ? t.titrePlurielsA : t.titreSingulierA}
        </span>
        <span className="text-emerald-300">
          {cellules.length > 1 ? t.titreCellulePlur : t.titreCelluleSing}
        </span>
      </h1>

      <div className="max-w-3xl w-full mb-6 text-center mx-auto">
        <p className="italic text-base text-white/90">
          {t.intro}
          <span className="text-blue-300 font-semibold"> {t.introAccent1}</span>
          {t.intro2}{" "}
          <span className="text-blue-300 font-semibold">{t.introAccent2} </span>
          {t.intro3}{" "}
          <span className="text-blue-300 font-semibold">{t.introAccent3}</span>.
        </p>
      </div>

      {loading && (
        <div className="text-white text-center mt-10">{t.chargement}</div>
      )}

      {!loading && (
        <>
          {userRole === "ResponsableCellule" && (
            <div className="flex justify-end mt-4 mb-4 gap-2">
              <button
                onClick={() => router.push("/cellule/ajouter-membre-cellule")}
                className="text-white font-semibold px-4 py-2 rounded shadow text-sm"
              >
                {t.btnAjouter}
              </button>
              <button
                onClick={() => router.push("/admin/import")}
                className="text-white font-semibold px-4 py-2 rounded shadow text-sm"
              >
                {t.btnImporter}
              </button>
            </div>
          )}

          {message && (
            <div className="text-white text-center mt-10">{message}</div>
          )}

          {!message && (
            <div className="flex justify-center">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl">
                {filteredMembres.map((m) => {
                  const cellule = cellules.find((c) => c.id === m.cellule_id);
                  const besoins = formatBesoinField(m.besoin);
                  const isOpen = detailsOpen[m.id];
                  const nomResponsable = cellule?.responsable || "—";

                  return (
                    <div
                      key={m.id}
                      ref={(el) => (highlightRef.current[m.id] = el)}
                      className="bg-white p-4 rounded-2xl shadow-xl border-l-4"
                      style={{ borderLeftColor: getBorderColor(m) }}
                    >
                      <h2 className="relative w-full text-center font-bold text-lg flex items-center justify-center gap-1">
                      {m.pilier === true && <span title="Pilier">🎖️</span>}
                        <span>{m.prenom} {m.nom}</span>
                        {m.star === true &&
                          m.etat_contact?.trim().toLowerCase() === "existant" && (
                            <span className="text-yellow-400">⭐</span>
                          )}
                        <div className="absolute right-2">
                          <PresenceDot
                            memberId={m.id}
                            egliseId={m.eglise_id}
                            dateVonu={m.date_venu}
                          />
                        </div>
                      </h2>                        
                        
                        {m.leader_developpement && leaderParcours[m.id] && t.parcoursStages[leaderParcours[m.id]] && (
                          <p className="text-center font-semibold mt-1 style={{ color: "#333699" }}>
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
                                setOpenPhoneId(
                                  openPhoneId === m.id ? null : m.id
                                );
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
                                  {t.appeler}
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
                                  {t.appelWhatsApp}
                                </a>
                                <a
                                  href={`https://wa.me/${m.telephone.replace(/\D/g, "")}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block px-4 py-2 text-sm text-black hover:bg-gray-100"
                                >
                                  {t.msgWhatsApp}
                                </a>
                              </div>
                            )}
                          </>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </div>

                      <p className="text-center text-sm mt-1">🏙️ {m.ville || ""}</p>
                      <p className="text-center text-sm mt-1">
                        🏠 {cellule?.cellule_full || cellule?.cellule || "—"}
                      </p>
                      <p className="text-center text-sm mt-1">👤 {nomResponsable}</p>

                      <div className="w-full flex flex-col items-end mt-3 gap-2">
                        <p className="text-[11px] text-gray-400">
                          {t.creLe} {formatDateFr(m.date_venu)}
                        </p>
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
                        />
                      </div>

                      <button
                        onClick={() =>
                          setDetailsOpen((prev) => ({
                            ...prev,
                            [m.id]: !prev[m.id],
                          }))
                        }
                        className="text-orange-500 underline mt-2 block mx-auto text-sm"
                      >
                        {isOpen ? t.fermerDetails : t.details}
                      </button>

                      {isOpen && (
                        <div className="text-black text-sm space-y-2 w-full">
                          <div>
                            <p className="font-bold text-[#2E3192] mb-1">
                              {t.identiteLabel}
                            </p>
                            <p>{t.civilite} : {m.sexe === "Homme" ? t.homme : m.sexe === "Femme" ? t.femme : "—"}</p>
                            <p>{t.age} : {m.age || ""}</p>
                            <p>
                              {t.whatsapp} :{" "}
                              {m.is_whatsapp ? t.oui : t.non}
                            </p>
                          </div>
                          <hr />

                          <div>
                            <p className="font-bold text-[#2E3192] mb-1">
                              {t.suiviLabel}
                            </p>
                            <p>
                              {t.envoiSuivi} :{" "}
                              {formatDateFr(m.date_envoi_suivi)}
                            </p>
                            <p>
                              {t.statutSuivi} :{" "}
                              {t.statutLabels[m.statut_suivis] ||
                                m.suivi_statut ||
                                ""}
                            </p>
                          </div>
                          <hr />

                          <div>
                            <p className="font-bold text-[#2E3192] mb-1">
                              {t.spirituelLabel}
                            </p>
                            <p>{t.baptemeEau} : {getYesNo(m.bapteme_eau)}</p>
                              {m.bapteme_eau === "Non" &&
                                m.veut_se_faire_baptiser === "Oui" && (
                                  <p className="ml-6">{t.veutBaptise}</p>
                                )}
                              <p>{t.baptemeFeu} : {getYesNo(m.bapteme_esprit)}</p>
                              <p>{t.priereSalut} : {getYesNo(m.priere_salut)}</p>
                              <p>{t.typeConversion} : {getMapLabel(t.conversionOptions, m.type_conversion)}</p>
                            <p>{t.formation} : {m.Formation || ""}</p>
                            <p>
                              {t.ministere} :{" "}
                              {formatMinistere(m.Ministere, m.Autre_Ministere)}
                            </p>
                          </div>
                          <hr />

                          <div>
                            <p className="font-bold text-[#2E3192] mb-1">
                              {t.parcoursLabel}
                            </p>
                            <p>{t.commentVenu} : {getMapLabel(t.venuOptions, m.venu)}</p>
                            <p>{t.raisonVenue} : {getMapLabel(t.statutInitialOptions, m.statut_initial ?? m.statut)}</p>
                            <p>
                              {t.infos} :{" "}
                              {m.infos_supplementaires || "—"}
                            </p>
                            <p>
                              {t.commentaireSuivis} :{" "}
                              {m.commentaire_suivis || ""}
                            </p>
                          </div>
                          <hr />

                          <div>
                            <p className="font-bold text-[#2E3192] mb-1">
                              {t.pastoralLabel}
                            </p>
                            <p>{t.besoinsDiff} : {besoins}</p>

                            <div className="flex justify-center gap-2 flex-wrap">
                              <button
                                onClick={() => setOpenSuiviMemberId(m.id)}
                                className="mt-2 text-sm bg-[#333699] text-amber-300 px-3 py-1 rounded"
                              >
                                {t.btnSuivis}
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
                              />
                            )}

                            {openEvalLeaderMemberId === m.id && (
                              <EvaluationLeaderPopup
                                member={m}
                                onClose={() => setOpenEvalLeaderMemberId(null)}
                                onSaved={(membreId, etape) =>
                                  setLeaderParcours((prev) => ({ ...prev, [membreId]: etape }))
                                }
                              />
                            )}
                          </div>

                          <div className="mt-4 rounded-xl w-full shadow-md p-4 bg-white">
                            <button
                              onClick={() => setEditMember(m)}
                              className="text-blue-600 text-sm mt-2 block mx-auto underline"
                            >
                              {t.btnModifier}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {editMember && (
        <EditMemberSuivisPopup
          member={editMember}
          currentUserRoles={userRole ? [userRole] : []}
          onClose={() => setEditMember(null)}
          onUpdateMember={(updated) => {
            handleUpdateMember(updated);
            setEditMember(null);
          }}
        />
      )}

      <Footer />
    </div>
  );
}
