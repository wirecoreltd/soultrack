"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import supabase from "../../lib/supabaseClient";
import Image from "next/image";
import LogoutLink from "../../components/LogoutLink";
import EditEvangeliseSuiviPopup from "../../components/EditEvangeliseSuiviPopup";
import SuiviEvanPopup from "../../components/SuiviEvanPopup";
import HeaderPages from "../../components/HeaderPages";
import ProtectedRoute from "../../components/ProtectedRoute";
import Footer from "../../components/Footer";
import { checkLimiteAtteinte } from "../../lib/checkLimite";
import { useFeature } from "../../components/FeaturesContext";
import { useLang } from "../../hooks/useLang";

const translations = {
  fr: {
    loading: "Chargement...",
    notConnected: "Non connecté",
    pageTitle1: "Suivis des",
    pageTitle2: "Evangélisés",
    intro: "Suivez facilement tous vos",
    introHighlight1: "contacts évangélisés et leur progression",
    introMid:
      ". Attribuez-les à un conseiller ou à une cellule, partagez leurs informations via WhatsApp, et",
    introHighlight2: "consultez chaque contact en détail",
    introEnd: ". Vous pouvez modifier ou supprimer des contacts,",
    introHighlight3:
      "assurant un suivi clair et structuré de l'évangélisation dans votre église",
    toggleRefus: "Voir les refus",
    toggleSuivis: "Voir tous les suivis",
    cellule: "🏠 Cellule",
    famille: "👨‍👩‍👦 Famille",
    conseiller: "👤 Conseiller(s)",
    ville: "🏙️ Ville",
    sentToSuivis: "Envoyé au suivis le",
    commentLabel: "Commentaire Suivis",
    statusLabel: "Statut du suivis",
    statusDefault: "-- Sélectionner un statut --",
    statusEnCours: "En Suivis",
    statusIntegre: "Intégrer",
    statusRefus: "Refus",
    processing: "Traitement...",
    reactivate: "🔄 Réactiver",
    save: "Sauvegarder",
    details: "Détails",
    closeDetails: "Fermer détails",
    identiteTitle: "👤 Identité",
    civilite: "🎗️ Civilité",
    age: "⏳ Tranche d'age",
    whatsapp: "💬 WhatsApp",
    oui: "Oui",
    non: "Non",
    spiritualTitle: "🕊 Vie spirituelle",
    priereSalut: "🙏 Prière salut",
    typeConversion: "☀️ Type de conversion",
    parcoursTitle: "🌱 Parcours",
    evangeliseLeM: "📅 Évangélisé le",
    evangeliseLeFemme: "📅 Évangélisée le",
    typeEvang: "📣 Type d'Evangélisation",
    pastoralTitle: "❤️‍🩹 Soin pastoral",
    besoins: "❓ Difficultés / Besoins",
    infos: "📝 Infos",
    addSuivi: "💡 Ajouter / Voir suivis",
    editContact: "✏️ Modifier le contact",
    call: "📞 Appeler",
    sms: "✉️ SMS",
    whatsappCall: "📱 Appel WhatsApp",
    whatsappMsg: "💬 Message WhatsApp",
    limitError: "❌ Limite atteinte",
    limitMsg: "membres. Upgradez votre plan pour intégrer ce contact.",
    saveError: "Erreur lors de la sauvegarde : ",
    reactivateError: "Erreur lors de la réactivation",
    insertError: "Erreur insertion membre : ",
    upsertError: "Erreur upsert membre : ",
  },
  en: {
    loading: "Loading...",
    notConnected: "Not connected",
    pageTitle1: "Follow-ups of",
    pageTitle2: "Evangelised",
    intro: "Easily track all your",
    introHighlight1: "evangelised contacts and their progress",
    introMid:
      ". Assign them to a counsellor or a cell, share their information via WhatsApp, and",
    introHighlight2: "view each contact in detail",
    introEnd: ". You can edit or delete contacts,",
    introHighlight3:
      "ensuring clear and structured evangelisation follow-up in your church",
    toggleRefus: "View refusals",
    toggleSuivis: "View all follow-ups",
    cellule: "🏠 Cell",
    famille: "👨‍👩‍👦 Family",
    conseiller: "👤 Counsellor(s)",
    ville: "🏙️ City",
    sentToSuivis: "Sent to follow-up on",
    commentLabel: "Follow-up comment",
    statusLabel: "Follow-up status",
    statusDefault: "-- Select a status --",
    statusEnCours: "In follow-up",
    statusIntegre: "Integrate",
    statusRefus: "Refusal",
    processing: "Processing...",
    reactivate: "🔄 Reactivate",
    save: "Save",
    details: "Details",
    closeDetails: "Close details",
    identiteTitle: "👤 Identity",
    civilite: "🎗️ Title",
    age: "⏳ Age range",
    whatsapp: "💬 WhatsApp",
    oui: "Yes",
    non: "No",
    spiritualTitle: "🕊 Spiritual life",
    priereSalut: "🙏 Salvation prayer",
    typeConversion: "☀️ Conversion type",
    parcoursTitle: "🌱 Journey",
    evangeliseLeM: "📅 Evangelised on",
    evangeliseLeFemme: "📅 Evangelised on",
    typeEvang: "📣 Evangelisation type",
    pastoralTitle: "❤️‍🩹 Pastoral care",
    besoins: "❓ Difficulties / Needs",
    infos: "📝 Info",
    addSuivi: "💡 Add / View follow-ups",
    editContact: "✏️ Edit contact",
    call: "📞 Call",
    sms: "✉️ SMS",
    whatsappCall: "📱 WhatsApp call",
    whatsappMsg: "💬 WhatsApp message",
    limitError: "❌ Limit reached",
    limitMsg: "members. Upgrade your plan to integrate this contact.",
    saveError: "Save error: ",
    reactivateError: "Reactivation error",
    insertError: "Member insertion error: ",
    upsertError: "Member upsert error: ",
  },
};

export default function SuivisEvangelisation() {
  return (
    <ProtectedRoute
      allowedRoles={[
        "Administrateur",
        "ResponsableEvangelisation",
        "ResponsableCellule",
        "ResponsableFamilles",
        "Conseiller",
      ]}
    >
      <SuivisEvangelisationContent />
    </ProtectedRoute>
  );
}

function SuivisEvangelisationContent() {
  const { lang } = useLang();
  const t = translations[lang];

  const famillesActive = useFeature("familles");
  const cellulesActive = useFeature("cellules");
  const conseillerActive = useFeature("conseiller");

  const router = useRouter();
  const { highlight } = router.query;
  const highlightRef = useRef({});

  const [allSuivis, setAllSuivis] = useState([]);
  const [conseillers, setConseillers] = useState([]);
  const [cellules, setCellules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({});
  const [detailsCarteId, setDetailsCarteId] = useState(null);
  const [editingContact, setEditingContact] = useState(null);
  const [suiviEvanMember, setSuiviEvanMember] = useState(null);
  const [commentChanges, setCommentChanges] = useState({});
  const [statusChanges, setStatusChanges] = useState({});
  const [showRefus, setShowRefus] = useState(false);
  const [user, setUser] = useState(null);
  const [phoneMenuId, setPhoneMenuId] = useState(null);
  const phoneMenuRef = useRef(null);
  const [familles, setFamilles] = useState([]);
  const [assignmentsMap, setAssignmentsMap] = useState({});

  /* ================= INIT ================= */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (phoneMenuRef.current && !phoneMenuRef.current.contains(e.target)) {
        setPhoneMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    init();
  }, [cellulesActive, famillesActive, conseillerActive]);

  useEffect(() => {
    if (user) fetchSuivis(user, cellules, familles);
  }, [showRefus]);

  const highlightDoneRef = useRef(false);

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
      el.style.boxShadow =
        "0 0 0 4px #f59e0b, 0 0 24px 8px rgba(245,158,11,0.4)";
      el.style.transform = "scale(1.02)";

      setTimeout(() => {
        el.style.transition = "box-shadow 1s ease, transform 1s ease";
        el.style.boxShadow = "";
        el.style.transform = "";
      }, 5000);
    };

    const timer = setTimeout(tryHighlight, 300);
    return () => clearTimeout(timer);
  }, [loading, highlight]);

  const init = async () => {

      console.log("[init] démarrage");
    
  const userData = await fetchUser();

    console.log("[init] user récupéré:", userData?.role, userData?.roles, userData?.eglise_id);
  console.log("[init] conseillerActive:", conseillerActive);
    
  if (conseillerActive) await fetchConseillers(userData); // ← userData ajouté
  const cellulesData = cellulesActive ? await fetchCellules(userData) : [];
  const famillesData = famillesActive ? await fetchFamilles(userData) : [];
  if (userData) await fetchSuivis(userData, cellulesData, famillesData);
  setLoading(false);
};

  /* ================= USER ================= */
  const fetchUser = async () => {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) return null;
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.session.user.id)
      .single();
    setUser(data);
    return data;
  };

  /* ================= CONSEILLERS ================= */
 const fetchConseillers = async (userData) => {
  const u = userData || user;
  console.log("[fetchConseillers] userData reçu:", u);
  console.log("[fetchConseillers] eglise_id:", u?.eglise_id);
  if (!u) return [];
  
  const { data, error } = await supabase  // ← ajouter "error"
    .from("profiles")
    .select("id, prenom, nom")
    .eq("eglise_id", u.eglise_id)
    .contains("roles", ["Conseiller"]);

  console.log("[fetchConseillers] résultat data:", data);
  console.log("[fetchConseillers] erreur:", error);
  console.log("[fetchConseillers] nombre de conseillers:", data?.length);

  setConseillers(data || []);
  return data || [];
};

  /* ================= CELLULES ================= */
  const fetchCellules = async (userData) => {
    const u = userData || user;
    if (!u) return [];
    const { data, error } = await supabase
      .from("cellules")
      .select("id, cellule_full, responsable_id")
      .eq("eglise_id", u.eglise_id);
    if (error) {
      console.error("Erreur fetchCellules :", error);
      setCellules([]);
      return [];
    }
    setCellules(data || []);
    return data || [];
  };

  /* ================= FAMILLES ================= */
  const fetchFamilles = async (userData) => {
    const u = userData || user;
    if (!u) return [];
    const { data, error } = await supabase
      .from("familles")
      .select("id, famille_full, responsable_id")
      .eq("eglise_id", u.eglise_id);
    if (error) {
      console.error("Erreur fetchFamilles :", error);
      setFamilles([]);
      return [];
    }
    setFamilles(data || []);
    return data || [];
  };

  /* ================= ASSIGNMENTS MAP ================= */
  const fetchAssignmentsForSuivis = async (suivisIds) => {
    if (!suivisIds || suivisIds.length === 0) {
      setAssignmentsMap({});
      return;
    }

    const { data: assignments, error } = await supabase
      .from("suivi_assignments_evangelises")
      .select("suivi_evangelise_id, conseiller_id")
      .in("suivi_evangelise_id", suivisIds)
      .eq("statut", "actif");

    if (error) {
      console.error("Erreur fetchAssignments:", error);
      setAssignmentsMap({});
      return;
    }

    const conseillerIds = [
      ...new Set(
        (assignments || []).map((a) => a.conseiller_id).filter(Boolean)
      ),
    ];

    let profileMap = {};
    if (conseillerIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, prenom, nom")
        .in("id", conseillerIds);
      (profiles || []).forEach((p) => {
        profileMap[p.id] = p;
      });
    }

    const map = {};
    (assignments || []).forEach((row) => {
      const profile = profileMap[row.conseiller_id];
      if (!profile) return;
      if (!map[row.suivi_evangelise_id]) map[row.suivi_evangelise_id] = [];
      if (!map[row.suivi_evangelise_id].some((c) => c.id === profile.id)) {
        map[row.suivi_evangelise_id].push(profile);
      }
    });

    setAssignmentsMap(map);
  };

  /* ================= SUIVIS ================= */
  const fetchSuivis = async (userData, cellulesData, famillesData) => {
    try {
      if (!userData) return;

      const { data, error } = await supabase
        .from("suivis_des_evangelises")
        .select("*")
        .eq("eglise_id", userData.eglise_id)
        .order("id", { ascending: false });

      if (error) {
        console.error("Erreur fetchSuivis:", error);
        setAllSuivis([]);
        return;
      }

      let filtered = data || [];

      if (userData.role === "Conseiller") {
        const { data: myAssignments } = await supabase
          .from("suivi_assignments_evangelises")
          .select("suivi_evangelise_id")
          .eq("conseiller_id", userData.id)
          .eq("statut", "actif");

        const myIds = (myAssignments || []).map((a) => a.suivi_evangelise_id);
        filtered = filtered.filter((m) => myIds.includes(m.id));
      } else if (userData.role === "ResponsableCellule") {
        // Cellules directes
        const directIds = (cellulesData || [])
          .filter((c) => c.responsable_id === userData.id)
          .map((c) => c.id);

        // Cellules enfants via profile_id
        const { data: fillesData } = await supabase
          .from("cellules")
          .select("id")
          .eq("cellule_mere_id", userData.id)
          .eq("eglise_id", userData.eglise_id);
        const fillesIds = (fillesData || []).map((c) => c.id);

        const tousLesIds = [...new Set([...directIds, ...fillesIds])];
        filtered = filtered.filter((m) => tousLesIds.includes(m.cellule_id));
      } else if (userData.role === "ResponsableFamilles") {
        const mesFamillesIds = (famillesData || familles || [])
          .filter((f) => f.responsable_id === userData.id)
          .map((f) => f.id);
        filtered = filtered.filter((m) => mesFamillesIds.includes(m.famille_id));
      }

      setAllSuivis(filtered);

      const suivisIds = filtered.map((s) => s.id);
      await fetchAssignmentsForSuivis(suivisIds);
    } catch (err) {
      console.error("Erreur fetchSuivis:", err.message);
      setAllSuivis([]);
    }
  };

  /* ================= HELPERS ================= */
  const getBorderColor = (m) => {
    const status = m.status_suivis_evangelises;
    if (status === "En cours") return "#FFA500";
    if (status === "Intégré") return "#34A853";
    if (status === "Refus") return "#FF4B5C";
    return "#ccc";
  };

  const formatBesoin = (b) => {
    if (!b) return "—";
    try {
      const arr = JSON.parse(b);
      return Array.isArray(arr) ? arr.join(", ") : b;
    } catch {
      return b;
    }
  };

  const formatDateFr = (dateString) => {
    if (!dateString) return "—";
    const d = new Date(dateString);
    const day = d.getDate().toString().padStart(2, "0");
    const months =
      lang === "fr"
        ? ["Janv","Févr","Mars","Avr","Mai","Juin","Juil","Août","Sept","Oct","Nov","Déc"]
        : ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    return `${day} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  const getConseillersForSuivi = (suiviId) => {
    const assigned = assignmentsMap[suiviId];
    if (assigned && assigned.length > 0) {
      return assigned.map((c) => `${c.prenom} ${c.nom}`).join(", ");
    }
    return "—";
  };

  const suivisAffiches = allSuivis.filter((m) => {
    if (showRefus) return m.status_suivis_evangelises === "Refus";
    return (
      m.status_suivis_evangelises === "En cours" ||
      m.status_suivis_evangelises === "Envoyé"
    );
  });

  const handleCommentChange = (id, value) =>
    setCommentChanges((p) => ({ ...p, [id]: value }));

  const handleStatusChange = (id, value) =>
    setStatusChanges((p) => ({ ...p, [id]: value }));

  /* ================= UPSERT MEMBRE ================= */
  const upsertMembre = async (suivi) => {
    try {
      const payload = {
        suivi_int_id: suivi.id,
        eglise_id: user.eglise_id,
        nom: suivi.nom || "",
        prenom: suivi.prenom || "",
        telephone: suivi.telephone || "",
        ville: suivi.ville || "",
        sexe: suivi.sexe || "",
        cellule_id: suivi.cellule_id || null,
        conseiller_id: suivi.conseiller_id || null,
        besoin: suivi.besoin || "",
        infos_supplementaires: suivi.infos_supplementaires || "",
        Commentaire_Suivi_Evangelisation: suivi.commentaire_evangelises || "",
        etat_contact: "Existant",
        venu: "Évangélisation",
        statut_suivis: 3,
        suivi_updated_at: new Date().toISOString(),
        evangelise_member_id: suivi.evangelise_id || null,
      };

      const { data, error } = await supabase
        .from("membres_complets")
        .upsert(payload, { onConflict: "suivi_int_id" })
        .select("id")
        .single();

      if (error) {
        console.error("Erreur insertion membre :", error);
        alert(t.insertError + error.message);
        return null;
      }

      return data?.id || null;
    } catch (err) {
      console.error("Erreur upsert membre :", err.message);
      alert(t.upsertError + err.message);
      return null;
    }
  };

  /* ================= UPDATE SUIVI ================= */
  const updateSuivi = async (id, m) => {
    const newComment = commentChanges[id] ?? m.commentaire_evangelises ?? "";
    const newStatus = statusChanges[id] ?? m.status_suivis_evangelises ?? "";

    if (!newComment && !newStatus) return;

    try {
      setUpdating((p) => ({ ...p, [id]: true }));

      const { error } = await supabase
        .from("suivis_des_evangelises")
        .update({
          commentaire_evangelises: newComment,
          status_suivis_evangelises: newStatus,
          date_statut: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;

      if (newStatus === "Intégré") {
        const { atteinte, count, limite } = await checkLimiteAtteinte(
          user.eglise_id
        );
        if (atteinte) {
          alert(`${t.limitError} : ${count}/${limite} ${t.limitMsg}`);
          setUpdating((p) => ({ ...p, [id]: false }));
          return;
        }

        const membreId = await upsertMembre({
          ...m,
          status_suivis_evangelises: newStatus,
          commentaire_evangelises: newComment,
        });

        if (membreId) {
          const assigned = assignmentsMap[id];
          if (assigned && assigned.length > 0) {
            const rows = assigned.map((c, index) => ({
              membre_id: membreId,
              conseiller_id: c.id,
              role: index === 0 ? "principal" : "assistant",
              statut: "actif",
            }));
            const { error: assignError } = await supabase
              .from("suivi_assignments")
              .insert(rows);
            if (assignError) {
              console.error(
                "Erreur création suivi_assignments pour membre intégré:",
                assignError
              );
            }
          }
        }

        setAllSuivis((prev) => prev.filter((s) => s.id !== id));
        return;
      }

      setAllSuivis((prev) =>
        prev.map((s) =>
          s.id === id
            ? {
                ...s,
                commentaire_evangelises: newComment,
                status_suivis_evangelises: newStatus,
              }
            : s
        )
      );

      setCommentChanges((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
      setStatusChanges((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    } catch (err) {
      console.error("Erreur lors de la sauvegarde :", err.message);
      alert(t.saveError + err.message);
    } finally {
      setUpdating((p) => ({ ...p, [id]: false }));
    }
  };

  /* ================= RÉACTIVER SUIVI ================= */
  const reactiverSuivi = async (m) => {
    if (!m?.id) return;
    try {
      setUpdating((p) => ({ ...p, [m.id]: true }));
      const { error } = await supabase
        .from("suivis_des_evangelises")
        .update({ status_suivis_evangelises: "En cours" })
        .eq("id", m.id);
      if (error) throw error;
      setAllSuivis((prev) =>
        prev.map((s) =>
          s.id === m.id ? { ...s, status_suivis_evangelises: "En cours" } : s
        )
      );
    } catch (err) {
      console.error("Erreur réactivation :", err.message);
      alert(t.reactivateError);
    } finally {
      setUpdating((p) => ({ ...p, [m.id]: false }));
    }
  };

  const updateSuiviLocal = (id, updates) => {
    setAllSuivis((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  };

  /* ================= RENDER ================= */
  if (loading)
    return <p className="text-center mt-10">{t.loading}</p>;
  if (!user)
    return (
      <p className="text-center mt-10 text-red-600">{t.notConnected}</p>
    );

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-[#333699]">
      <HeaderPages />
      <h1 className="text-2xl font-bold mt-4 mb-6 text-blue-300 text-center text-white">
        {t.pageTitle1}{" "}
        <span className="text-emerald-300">{t.pageTitle2}</span>
      </h1>

      <div className="max-w-3xl w-full mb-6 text-center">
        <p className="italic text-base text-white/90">
          {t.intro}{" "}
          <span className="text-blue-300 font-semibold">
            {t.introHighlight1}
          </span>
          {t.introMid}{" "}
          <span className="text-blue-300 font-semibold">
            {t.introHighlight2}
          </span>
          {t.introEnd}{" "}
          <span className="text-blue-300 font-semibold">
            {t.introHighlight3}
          </span>
          .
        </p>
      </div>

      {/* Toggle Refus */}
      <div className="mb-6 flex justify-end w-full max-w-6xl">
        <button
          onClick={() => setShowRefus(!showRefus)}
          className="text-orange-400 text-sm underline hover:text-orange-500"
        >
          {showRefus ? t.toggleSuivis : t.toggleRefus}
        </button>
      </div>

      {/* ================= VUE CARTE ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-6xl justify-items-center">
        {suivisAffiches.map((m) => {
          const ouvert = detailsCarteId === m.id;
          const cellule = cellulesActive
            ? cellules.find((c) => c.id === m.cellule_id)
            : null;
          const famille = famillesActive
            ? familles.find((f) => f.id === m.famille_id)
            : null;

          return (
            <div
              key={m.id}
              ref={(el) => (highlightRef.current[m.id] = el)}
              className="bg-white rounded-2xl shadow-lg w-full transition-all duration-300 hover:shadow-2xl p-4 border-l-4"
              style={{ borderLeftColor: getBorderColor(m) }}
            >
              <div className="flex flex-col items-center">
                <h2 className="font-bold text-black text-base text-center mb-1">
                  {m.prenom} {m.nom}
                </h2>

                {/* Téléphone */}
                <div className="flex-[1] text-sm text-white relative mb-3">
                  <p
                    onClick={(e) => {
                      e.stopPropagation();
                      setPhoneMenuId(phoneMenuId === m.id ? null : m.id);
                    }}
                    className="text-orange-500 underline font-semibold cursor-pointer"
                  >
                    {m.telephone || "—"}
                  </p>
                  {phoneMenuId === m.id && (
                    <div
                      ref={phoneMenuRef}
                      className="absolute mt-2 bg-white rounded-lg shadow-lg border z-50 w-52 left-1/2 -translate-x-1/2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <a
                        href={m.telephone ? `tel:${m.telephone}` : "#"}
                        className={`block px-4 py-2 text-sm text-black hover:bg-gray-100 ${
                          !m.telephone ? "opacity-50 pointer-events-none" : ""
                        }`}
                      >
                        {t.call}
                      </a>
                      <a
                        href={m.telephone ? `sms:${m.telephone}` : "#"}
                        className={`block px-4 py-2 text-sm text-black hover:bg-gray-100 ${
                          !m.telephone ? "opacity-50 pointer-events-none" : ""
                        }`}
                      >
                        {t.sms}
                      </a>
                      <a
                        href={
                          m.telephone
                            ? `https://wa.me/${m.telephone.replace(/\D/g, "")}?call`
                            : "#"
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`block px-4 py-2 text-sm text-black hover:bg-gray-100 ${
                          !m.telephone ? "opacity-50 pointer-events-none" : ""
                        }`}
                      >
                        {t.whatsappCall}
                      </a>
                      <a
                        href={
                          m.telephone
                            ? `https://wa.me/${m.telephone.replace(/\D/g, "")}`
                            : "#"
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`block px-4 py-2 text-sm text-black hover:bg-gray-100 ${
                          !m.telephone ? "opacity-50 pointer-events-none" : ""
                        }`}
                      >
                        {t.whatsappMsg}
                      </a>
                    </div>
                  )}
                </div>

                {/* Infos conditionnées par feature */}
                <div className="flex flex-col items-center space-y-1 mb-1">
                  {cellulesActive && (
                    <p className="text-sm text-black">
                      {t.cellule} : {cellule?.cellule_full || "—"}
                    </p>
                  )}
                  {famillesActive && (
                    <p className="text-sm text-black">
                      {t.famille} : {famille?.famille_full || "—"}
                    </p>
                  )}
                  {conseillerActive && (
                    <p className="text-sm text-black">
                      {t.conseiller} : {getConseillersForSuivi(m.id)}
                    </p>
                  )}
                  <p className="text-sm text-black">
                    {t.ville} : {m.ville || "—"}
                  </p>
                </div>

                <p className="self-end text-[11px] text-gray-400 mt-2">
                  {t.sentToSuivis} {formatDateFr(m.date_suivi)}
                </p>

                {/* Commentaire + statut */}
                <div className="w-full rounded-xl p-3 mt-2">
                  <label className="block w-full text-center font-semibold text-blue-700 mb-1 mt-2 text-sm">
                    {t.commentLabel}
                  </label>
                  <textarea
                    rows={2}
                    value={
                      commentChanges[m.id] ?? m.commentaire_evangelises ?? ""
                    }
                    onChange={(e) => handleCommentChange(m.id, e.target.value)}
                    disabled={showRefus}
                    className={`w-full rounded-lg border px-3 py-2 text-sm ${
                      showRefus
                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                        : "bg-white"
                    }`}
                  />

                  <label className="block w-full text-center font-semibold text-blue-700 mb-1 mt-2 text-sm">
                    {t.statusLabel}
                  </label>
                  <select
                    value={
                      statusChanges[m.id] ??
                      m.status_suivis_evangelises ??
                      ""
                    }
                    onChange={(e) =>
                      handleStatusChange(m.id, e.target.value)
                    }
                    disabled={showRefus}
                    className={`mt-2 w-full rounded-lg border px-3 py-2 text-sm ${
                      showRefus
                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                        : "bg-white"
                    }`}
                  >
                    <option value="">{t.statusDefault}</option>
                    <option value="En cours">{t.statusEnCours}</option>
                    <option value="Intégré">{t.statusIntegre}</option>
                    <option value="Refus">{t.statusRefus}</option>
                  </select>

                  <button
                    onClick={() =>
                      showRefus ? reactiverSuivi(m) : updateSuivi(m.id, m)
                    }
                    disabled={updating[m.id]}
                    className={`mt-3 w-full py-2 rounded-lg font-semibold shadow-md transition-all ${
                      updating[m.id]
                        ? "bg-slate-300 text-slate-600 cursor-not-allowed"
                        : showRefus
                        ? "bg-green-500 text-white hover:bg-green-600"
                        : "bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700"
                    }`}
                  >
                    {updating[m.id]
                      ? t.processing
                      : showRefus
                      ? t.reactivate
                      : t.save}
                  </button>
                </div>

                <button
                  onClick={() => setDetailsCarteId(ouvert ? null : m.id)}
                  className="text-orange-500 underline text-sm mt-3"
                >
                  {ouvert ? t.closeDetails : t.details}
                </button>
              </div>

              {/* Détails */}
              <div
                className={`transition-all duration-500 overflow-hidden ${
                  ouvert ? "max-h-[1000px] mt-3" : "max-h-0"
                }`}
              >
                {ouvert && (
                  <div className="text-black text-sm mt-3 w-full space-y-4">
                    <div>
                      <p className="font-bold text-[#2E3192] mb-1">
                        {t.identiteTitle}
                      </p>
                      <p>
                        {t.civilite} : {m.sexe || ""}
                      </p>
                      <p>
                        {t.age} : {m.age || ""}
                      </p>
                      <p>
                        {t.whatsapp} : {m.is_whatsapp ? t.oui : t.non}
                      </p>
                    </div>
                    <hr />

                    <div>
                      <p className="font-bold text-[#2E3192] mb-1">
                        {t.spiritualTitle}
                      </p>
                      <p>
                        {t.priereSalut} : {m.priere_salut ? t.oui : t.non}
                      </p>
                      <p>
                        {t.typeConversion} : {m.type_conversion || ""}
                      </p>
                    </div>
                    <hr />

                    <div>
                      <p className="font-bold text-[#2E3192] mb-1">
                        {t.parcoursTitle}
                      </p>
                      <p>
                        {m.sexe === "Femme"
                          ? t.evangeliseLeFemme
                          : t.evangeliseLeM}{" "}
                        {formatDateFr(m.date_evangelise)}
                      </p>
                      <p>
                        {t.typeEvang} : {m.type_evangelisation || ""}
                      </p>
                    </div>
                    <hr />

                    <div>
                      <p className="font-bold text-[#2E3192] mb-1">
                        {t.pastoralTitle}
                      </p>
                      <p>
                        {t.besoins} : {formatBesoin(m.besoin)}
                      </p>
                      <p>
                        {t.infos} : {m.infos_supplementaires || ""}
                      </p>
                    </div>

                    {!showRefus && (
                      <div className="mt-4 flex flex-col gap-2">
                        <button
                          onClick={() => setSuiviEvanMember(m)}
                          className="mt-2 text-sm bg-[#333699] text-amber-300 px-3 py-1 rounded"
                        >
                          {t.addSuivi}
                        </button>
                        <button
                          onClick={() => setEditingContact(m)}
                          className="w-full py-2 rounded-lg bg-white text-orange-500 font-semibold border border-orange-200 shadow-sm hover:shadow-md transition-all"
                        >
                          {t.editContact}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {editingContact && (
          {console.log("[parent] conseillerActive:", conseillerActive, "| conseillers:", conseillers)}
        <EditEvangeliseSuiviPopup
          member={editingContact}
          conseillers={conseillerActive ? conseillers : []}
          cellules={cellulesActive ? cellules : []}
          familles={famillesActive ? familles : []} 
          currentUserRoles={user?.roles || (user?.role ? [user.role] : [])}
          onClose={() => setEditingContact(null)}
          closeDetails={() => {}}
          onUpdateMember={(updates) => {
            updateSuiviLocal(editingContact.id, updates);
            setEditingContact(null);
            fetchSuivis(user, cellules, familles);
          }}
        />
      )}

      {suiviEvanMember && (
        <SuiviEvanPopup
          member={suiviEvanMember}
          user={user}
          onClose={() => setSuiviEvanMember(null)}
        />
      )}

      <Footer />
    </div>
  );
}
