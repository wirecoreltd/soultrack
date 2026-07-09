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
    titleMyFamilies: "Membres de mes",
    titleMyFamily: "Membres de ma",
    titleHighlight: "familles",
    intro: "Consultez et gérez facilement les membres de vos familles.",
    introSearch: " Recherchez",
    introMid: ", filtrez par famille,",
    introDetails: " accédez aux détails complets ",
    introEnd: "et mettez à jour les informations pour un",
    introFollow: " suivi précis et personnalisé",
    loading: "Chargement...",
    noMember: "Aucun membre trouvé",
    loadError: "Erreur de chargement",
    accessDenied: "Accès non autorisé",
    addMember: "➕ Ajouter un membre",
    importList: "📥 Importer une Liste",
    createdOn: "Créé le",
    details: "Détails",
    closeDetails: "Fermer détails",
    call: "📞 Appeler",
    sms: "✉️ SMS",
    whatsappCall: "📱 Appel WhatsApp",
    whatsappMsg: "💬 Message WhatsApp",
    identiteTitle: "🫆 Identité",
    civilite: "🎗️ Civilité",
    age: "⏳ Tranche d'age",
    whatsapp: "💬 WhatsApp",
    oui: "Oui",
    non: "Non",
    suiviTitle: "📊 Suivi",
    envoiSuivi: "📆 Envoyé en suivi",
    statutSuivi: "💡 Statut Suivi",
    spiritualTitle: "🕊 Vie spirituelle",
    baptemeEau: "💧 Baptême d'Eau",
    veutBaptise: "💦 Veut se faire baptiser",
    baptemeFeu: "🔥 Baptême de Feu",
    priereSalut: "🙏 Prière du salut",
    typeConversion: "☀️ Type de conversion",
    formation: "✒️ Formation",
    ministere: "💢 Ministère",
    parcoursTitle: "🌱 Parcours",
    commentVenu: "🧩 Comment est-il venu",
    raisonVenue: "✨ Raison de la venue",
    infos: "📝 Infos",
    commentaireSuivi: "📝 Commentaire Suivis",
    pastoralTitle: "❤️‍🩹 Soin pastoral",
    besoins: "❓ Difficultés / Besoins",
    addSuivi: "💡 Ajouter / Voir suivis",
    editContact: "✏️ Modifier le contact",
    ville: "🏙️",
    famille: "🏠",
    responsable: "👤",
    statutLabels: {
      1: "En attente",
      2: "En Suivis",
      3: "Intégré",
      4: "Refus",
    },
    btnEvalLeader: "🌱 Leader en développement",
    parcoursStages: {
      potentiel: { emoji: "🌱", label: "Potentiel identifié" },
      croissance: { emoji: "🌿", label: "Leader en croissance" },
      developpement: { emoji: "🌳", label: "Leader en développement" },
      mature: { emoji: "🌲", label: "Leader mature" },
    },
  },
  en: {
    titleMyFamilies: "Members of my",
    titleMyFamily: "Members of my",
    titleHighlight: "families",
    intro: "Easily view and manage the members of your families.",
    introSearch: " Search",
    introMid: ", filter by family,",
    introDetails: " access full details ",
    introEnd: "and update information for",
    introFollow: " precise, personalised follow-up",
    loading: "Loading...",
    noMember: "No member found",
    loadError: "Loading error",
    accessDenied: "Access denied",
    addMember: "➕ Add a member",
    importList: "📥 Import a list",
    createdOn: "Created on",
    details: "Details",
    closeDetails: "Close details",
    call: "📞 Call",
    sms: "✉️ SMS",
    whatsappCall: "📱 WhatsApp call",
    whatsappMsg: "💬 WhatsApp message",
    identiteTitle: "🫆 Identity",
    civilite: "🎗️ Title",
    age: "⏳ Age range",
    whatsapp: "💬 WhatsApp",
    oui: "Yes",
    non: "No",
    suiviTitle: "📊 Follow-up",
    envoiSuivi: "📆 Sent to follow-up",
    statutSuivi: "💡 Follow-up status",
    spiritualTitle: "🕊 Spiritual life",
    baptemeEau: "💧 Water baptism",
    veutBaptise: "💦 Wants to be baptised",
    baptemeFeu: "🔥 Spirit baptism",
    priereSalut: "🙏 Salvation prayer",
    typeConversion: "☀️ Conversion type",
    formation: "✒️ Training",
    ministere: "💢 Ministry",
    parcoursTitle: "🌱 Journey",
    commentVenu: "🧩 How they came",
    raisonVenue: "✨ Reason for coming",
    infos: "📝 Info",
    commentaireSuivi: "📝 Follow-up comment",
    pastoralTitle: "❤️‍🩹 Pastoral care",
    besoins: "❓ Difficulties / Needs",
    addSuivi: "💡 Add / View follow-ups",
    editContact: "✏️ Edit contact",
    ville: "🏙️",
    famille: "🏠",
    responsable: "👤",
    statutLabels: {
      1: "Pending",
      2: "In follow-up",
      3: "Integrated",
      4: "Refusal",
    },
    btnEvalLeader: "🌱 Development Leader",
    parcoursStages: {
      potentiel: { emoji: "🌱", label: "Potential identified" },
      croissance: { emoji: "🌿", label: "Growing leader" },
      developpement: { emoji: "🌳", label: "Developing leader" },
      mature: { emoji: "🌲", label: "Mature leader" },
    },
  },
};

export default function MembresFamille() {
  return (
    <ProtectedRoute
      allowedRoles={["Administrateur", "ResponsableFamilles"]}
      requiredFeature="familles"
    >
      <MembresFamilleContent />
    </ProtectedRoute>
  );
}

function MembresFamilleContent() {
  const { lang } = useLang();
  const t = translations[lang];

  const router = useRouter();
  const { memberId, familleId, highlight } = router.query;

  const [membres, setMembres] = useState([]);
  const [familles, setFamilles] = useState([]);
  const [filterFamille, setFilterFamille] = useState("");
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
  const [leaderParcours, setLeaderParcours] = useState({});
  const [userRole, setUserRole] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [logoBase64, setLogoBase64] = useState(null);
  const [egliseData, setEgliseData] = useState(null);

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
    let list = parseJsonArray(ministereJson).filter(
      (m) => m.toLowerCase() !== "autre"
    );
    if (autreMinistere?.trim()) list.push(autreMinistere.trim());
    return list.join(", ") || "—";
  };

  const formatDateFr = (dateString) => {
    if (!dateString) return "—";
    const d = new Date(dateString);
    const day = d.getDate().toString().padStart(2, "0");
    const monthsFr = ["Janv","Févr","Mars","Avr","Mai","Juin","Juil","Août","Sept","Oct","Nov","Déc"];
    const monthsEn = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const months = lang === "en" ? monthsEn : monthsFr;
    return `${day} ${months[d.getMonth()]} ${d.getFullYear()}`;
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

  // ── Highlight animé (même pattern que les autres pages) ──
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

  // ── Fetch user + familles ──
  useEffect(() => {
    const fetchFamilles = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("id, role, roles, eglise_id")
        .eq("id", user.id)
        .single();
      if (!profile) return;

      setUserRole(profile.role);
      setUserProfile(profile);

      let query = supabase
        .from("familles")
        .select("*")
        .eq("eglise_id", profile.eglise_id)
        .order("famille_full");

      if (
        profile.roles?.includes("ResponsableFamilles") &&
        !profile.roles?.includes("Administrateur")
      ) {
        query = query.eq("responsable_id", profile.id);
      }

      const { data } = await query;
      setFamilles(data || []);
    };

    fetchFamilles();
  }, []);

  // ── Fetch église ──
  useEffect(() => {
    const fetchEglise = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("eglise_id")
        .eq("id", user.id)
        .single();
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
          .from("profiles")
          .select("id, role, roles, eglise_id")
          .eq("id", user.id)
          .single();
        if (!profile) return;

        let query = supabase
          .from("membres_complets")
          .select("*")
          .eq("statut_suivis", 3)
          .eq("eglise_id", profile.eglise_id)
          .not("famille_id", "is", null)
          .neq("etat_contact", "supprime")
          .order("created_at", { ascending: false });

        let mesFamilleIds = [];

        if (profile.role === "Administrateur") {
          if (familleId) query = query.eq("famille_id", familleId);

        } else if (profile.role === "ResponsableFamilles") {
          const { data: mesFamilles } = await supabase
            .from("familles").select("id")
            .eq("responsable_id", profile.id)
            .eq("eglise_id", profile.eglise_id);
          mesFamilleIds = (mesFamilles || []).map((f) => f.id);

          if (!mesFamilleIds.length) {
            setMembres([]); setMessage(t.noMember); setLoading(false); return;
          }
          query = query.in("famille_id", mesFamilleIds);
          if (familleId && mesFamilleIds.includes(familleId))
            query = query.eq("famille_id", familleId);

        } else if (profile.role === "SuperviseurFamilles") {
          const { data: mesFamilles } = await supabase
            .from("familles").select("id")
            .eq("superviseur_id", profile.id)
            .eq("eglise_id", profile.eglise_id);
          mesFamilleIds = (mesFamilles || []).map((f) => f.id);

          if (!mesFamilleIds.length) {
            setMembres([]); setMessage(t.noMember); setLoading(false); return;
          }
          query = query.in("famille_id", mesFamilleIds);
          if (familleId && mesFamilleIds.includes(familleId))
            query = query.eq("famille_id", familleId);

        } else {
          setMembres([]); setMessage(t.accessDenied); setLoading(false); return;
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

        if (!data || data.length === 0) setMessage(t.noMember);

      } catch (err) {
        console.error(err);
        setMessage(t.loadError);
      } finally {
        setLoading(false);
      }
    };

    fetchAllMembers();
  }, [memberIdStr, familleId]);

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
    if (familleId) setFilterFamille(familleId);
  }, [familleId]);

  // ── Filtre ──
  const filteredMembres = membres.filter(
    (m) =>
      (!filterFamille || m.famille_id === filterFamille) &&
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
          {familles.length > 1 ? t.titleMyFamilies : t.titleMyFamily}{" "}
        </span>
        <span className="text-emerald-300">{t.titleHighlight}</span>
      </h1>

      <div className="max-w-3xl w-full mb-6 text-center mx-auto">
        <p className="italic text-base text-white/90">
          {t.intro}
          <span className="text-blue-300 font-semibold">{t.introSearch}</span>
          {t.introMid}{" "}
          <span className="text-blue-300 font-semibold">{t.introDetails}</span>
          {t.introEnd}{" "}
          <span className="text-blue-300 font-semibold">{t.introFollow}</span>.
        </p>
      </div>

      {loading && (
        <div className="text-white text-center mt-10">{t.loading}</div>
      )}
      {!loading && message && (
        <div className="text-white text-center mt-10">{message}</div>
      )}

      {!loading && !message && (
        <>
          {userRole === "ResponsableFamilles" && (
            <div className="flex justify-end mt-4 mb-4 gap-2">
              <button
                onClick={() => router.push("/ajouter-membre-famille")}
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
            </div>
          )}

          <div className="flex justify-center">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl">
              {filteredMembres.map((m) => {
                const famille = familles.find((c) => c.id === m.famille_id);
                const besoins = parseJsonArray(m.besoin).join(", ") || "—";
                const isOpen = detailsOpen[m.id];

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
                        <div className="absolute right-2 top-1/2 -translate-y-1/2">
                          <PresenceDot
                            memberId={m.id}
                            egliseId={m.eglise_id}
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
                              <a href={`tel:${m.telephone}`} className="block px-4 py-2 text-sm text-black hover:bg-gray-100">
                                {t.call}
                              </a>
                              <a href={`sms:${m.telephone}`} className="block px-4 py-2 text-sm text-black hover:bg-gray-100">
                                {t.sms}
                              </a>
                              <a
                                href={`https://wa.me/${m.telephone.replace(/\D/g, "")}?call`}
                                target="_blank" rel="noopener noreferrer"
                                className="block px-4 py-2 text-sm text-black hover:bg-gray-100"
                              >
                                {t.whatsappCall}
                              </a>
                              <a
                                href={`https://wa.me/${m.telephone.replace(/\D/g, "")}`}
                                target="_blank" rel="noopener noreferrer"
                                className="block px-4 py-2 text-sm text-black hover:bg-gray-100"
                              >
                                {t.whatsappMsg}
                              </a>
                            </div>
                          )}
                        </>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </div>

                    <p className="text-center text-sm mt-1">{t.ville} {m.ville || ""}</p>
                    <p className="text-center text-sm mt-1">
                      {t.famille} {m.famille_full || famille?.famille_full || "—"}
                    </p>
                    <p className="text-center text-sm mt-1">
                      {t.responsable} {m.responsable || famille?.responsable || "—"}
                    </p>

                    <div className="w-full flex flex-col items-end mt-3 gap-2">
                      <p className="text-[11px] text-gray-400">
                        {t.createdOn} {formatDateFr(m.date_venu)}
                      </p>
                      <ExportMembrePDF
                        membre={m}
                        logoBase64={logoBase64}
                        eglise={egliseData}
                        churchName={egliseData?.nom}
                        familleName={
                          m.famille_full ||
                          familles.find((c) => String(c.id) === String(m.famille_id))?.famille_full
                        }
                      />
                    </div>

                    <button
                      onClick={() =>
                        setDetailsOpen((prev) => ({ ...prev, [m.id]: !prev[m.id] }))
                      }
                      className="text-orange-500 underline mt-2 block mx-auto text-sm"
                    >
                      {isOpen ? t.closeDetails : t.details}
                    </button>

                    {isOpen && (
                      <div className="text-black text-sm space-y-2 w-full">
                        <div>
                          <p className="font-bold text-[#2E3192] mb-1">{t.identiteTitle}</p>
                          <p>{t.civilite} : {m.sexe || ""}</p>
                          <p>{t.age} : {m.age || ""}</p>
                          <p>{t.whatsapp} : {m.is_whatsapp ? t.oui : t.non}</p>
                        </div>
                        <hr />

                        <div>
                          <p className="font-bold text-[#2E3192] mb-1">{t.suiviTitle}</p>
                          <p>{t.envoiSuivi} : {formatDateFr(m.date_envoi_suivi)}</p>
                          <p>
                            {t.statutSuivi} :{" "}
                            {t.statutLabels[m.statut_suivis] || m.suivi_statut || ""}
                          </p>
                        </div>
                        <hr />

                        <div>
                          <p className="font-bold text-[#2E3192] mb-1">{t.spiritualTitle}</p>
                          <p>{t.baptemeEau} : {m.bapteme_eau || "—"}</p>
                          {m.bapteme_eau === "Non" && m.veut_se_faire_baptiser === "Oui" && (
                            <p className="ml-6">{t.veutBaptise}</p>
                          )}
                          <p>{t.baptemeFeu} : {m.bapteme_esprit || "—"}</p>
                          <p>{t.priereSalut} : {m.priere_salut || "—"}</p>
                          <p>{t.typeConversion} : {m.type_conversion || "—"}</p>
                          <p>{t.formation} : {m.Formation || ""}</p>
                          <p>{t.ministere} : {formatMinistere(m.Ministere, m.Autre_Ministere)}</p>
                        </div>
                        <hr />

                        <div>
                          <p className="font-bold text-[#2E3192] mb-1">{t.parcoursTitle}</p>
                          <p>{t.commentVenu} : {m.venu || ""}</p>
                          <p>{t.raisonVenue} : {m.statut_initial ?? m.statut ?? "—"}</p>
                          <p>{t.infos} : {m.infos_supplementaires || "—"}</p>
                          <p>{t.commentaireSuivi} : {m.commentaire_suivis || ""}</p>
                        </div>
                        <hr />

                        <div>
                          <p className="font-bold text-[#2E3192] mb-1">{t.pastoralTitle}</p>
                          <p>{t.besoins} : {besoins}</p>
                        
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
                            {t.editContact}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {editMember && (
        <EditMemberSuivisPopup
          member={editMember}
          currentUserRoles={userRole ? [userRole] : []}
          user={userProfile}
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
