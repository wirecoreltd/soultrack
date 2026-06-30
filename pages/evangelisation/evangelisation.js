"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import supabase from "../../lib/supabaseClient";
import HeaderPages from "../../components/HeaderPages";
import EditEvangelisePopup from "../../components/EditEvangelisePopup";
import ProtectedRoute from "../../components/ProtectedRoute";
import useChurchScope from "../../hooks/useChurchScope";
import Footer from "../../components/Footer";
import { useFeature } from "../../components/FeaturesContext";
import { useNotificationsContext } from "../../context/NotificationsContext";
import { useLang } from "../../hooks/useLang";
import { checkLimiteAtteinte } from "../../lib/checkLimite";

const translations = {
  fr: {
    titre1: "Gestion des contacts",
    titre2: " Evangélisés",
    description: "Cette page",
    descAccent1: " centralise ",
    descMid1: "tous les contacts évangélisés et facilite la",
    descAccent2: " gestion de leur suivi.",
    descMid2: "Vous pouvez transmettre chaque contact à un conseiller ou à une cellule, et envoyer les informations directement via WhatsApp. Chaque contact peut être consulté en détail, modifié ou supprimé,",
    descAccent3: " garantissant un suivi précis et organisé de l'évangélisation au sein de votre église",
    descEnd: ".",
    envoyerA: "-- Envoyer à --",
    uneCellule: "Une Cellule",
    uneFamille: "Une Famille",
    unConseiller: "Un Conseiller",
    choisir: "-- Choisir --",
    envoiBtn: "📤 Envoyer WhatsApp",
    envoiLoading: "Envoi...",
    ville: "🏙️ Ville :",
    selectionner: "Sélectionner",
    evangeliseLe: "Evangélisé le",
    details: "Détails",
    fermerDetails: "Fermer détails",
    appeler: "📞 Appeler",
    sms: "✉️ SMS",
    appelWhatsApp: "📱 Appel WhatsApp",
    messageWhatsApp: "💬 Message WhatsApp",
    typeEvang: "📣 Type d'Evangélisation :",
    identite: "👤 Identité",
    civilite: "🎗️ Civilité :",
    age: "⏳ Tranche d'age :",
    whatsapp: "💬 WhatsApp :",
    oui: "Oui",
    non: "Non",
    vieSpirituelle: "🕊 Vie spirituelle",
    priereSalut: "🙏 Prière du salut :",
    typeConversion: "☀️ Type de conversion :",
    soinPastoral: "❤️‍🩹 Soin pastoral",
    besoins: "❓ Difficultés / Besoins :",
    infosSup: "📝 Infos supplémentaires :",
    modifierContact: "✏️ Modifier le contact",
    supprimerContact: "🗑️ Supprimer le contact",
    confirmSuppression: "⚠️ Suppression définitive\n\nVoulez-vous vraiment supprimer ce contact ?",
    confirmIntegrer: "Intégrer ce contact comme membre de l'église ?",
    integrer: "✅ Intégrer à l'église",
    integrating: "Intégration...",
    limitError: "❌ Limite atteinte",
    limitMsg: "membres. Upgradez votre plan.",
    integreSucces: "✅ Contact intégré avec succès",
    integreError: "❌ Erreur lors de l'intégration : ",
    doublonsDetectes: "⚠️ Doublons détectés",
    doublonsInfo: "Ces contacts sont déjà enregistrés dans les suivis.",
    envoyer: "Envoyer",
    annuler: "Annuler",
    fermer: "Fermer",
    whatsappInfo: "Vérifiez les informations du responsable avant d'envoyer.",
    nomResponsable: "👤 Nom du responsable",
    nomResponsablePl: "Nom du responsable",
    numeroWhatsApp: "📞 Numéro WhatsApp",
    numeroWhatsAppPl: "+3363xxx... — laisser vide pour choisir dans vos contacts",
    envoyerBtn: "Envoyer",
    msgBonjour: "👋 Bonjour",
    msgIntroPlural: "Nous te confions avec joie les personnes suivantes rencontrées lors de l'évangélisation.\n\n",
    msgIntroSingular: "Nous te confions avec joie la personne suivante rencontrée lors de l'évangélisation.\n\n",
    msgPersonne: "👥 Personne",
    msgTypeEvang: "📣 Type d'Evangélisation :",
    msgDate: "📅 Date évangélisé :",
    msgCivilite: "🎗️ Civilité :",
    msgNom: "👤 Nom :",
    msgAge: "⏳ Tranche d'age :",
    msgVille: "🏙️ Ville :",
    msgTel: "📞 Téléphone:",
    msgWa: "💬 WhatsApp :",
    msgPriere: "🙏 Prière du salut :",
    msgConversion: "☀️ Type de conversion :",
    msgBesoins: "❓ Difficultés / Besoins :",
    msgInfos: "📝 Infos :",
    msgMerci: "Merci pour ton engagement ✨",
    alertCible: "⚠️ Veuillez sélectionner une cible",
    alertAucunContact: "⚠️ Aucun contact sélectionné",
    alertCibleIntrouvable: "⚠️ Cible introuvable",
    alertSucces: "✅ Contacts envoyés et enregistrés",
    alertErreurSuppression: "❌ Erreur lors de la suppression",
    alertErreurEnvoi: "❌ Erreur lors de l'envoi : ",
    months: ["Janv","Févr","Mars","Avr","Mai","Juin","Juil","Août","Sept","Oct","Nov","Déc"],
  },
  en: {
    titre1: "Evangelism Contact",
    titre2: " Management",
    description: "This page",
    descAccent1: " centralises ",
    descMid1: "all evangelised contacts and simplifies",
    descAccent2: " their follow-up management.",
    descMid2: "You can assign each contact to a counsellor or a cell group, and send information directly via WhatsApp. Each contact can be viewed in detail, edited or deleted,",
    descAccent3: " ensuring accurate and organised evangelism follow-up within your church",
    descEnd: ".",
    envoyerA: "-- Send to --",
    uneCellule: "A Cell group",
    uneFamille: "A Family",
    unConseiller: "A Counsellor",
    choisir: "-- Choose --",
    envoiBtn: "📤 Send via WhatsApp",
    envoiLoading: "Sending...",
    ville: "🏙️ City:",
    selectionner: "Select",
    evangeliseLe: "Evangelised on",
    details: "Details",
    fermerDetails: "Close details",
    appeler: "📞 Call",
    sms: "✉️ SMS",
    appelWhatsApp: "📱 WhatsApp Call",
    messageWhatsApp: "💬 WhatsApp Message",
    typeEvang: "📣 Evangelism type:",
    identite: "👤 Identity",
    civilite: "🎗️ Gender:",
    age: "⏳ Age range:",
    whatsapp: "💬 WhatsApp:",
    oui: "Yes",
    non: "No",
    vieSpirituelle: "🕊 Spiritual life",
    priereSalut: "🙏 Salvation prayer:",
    typeConversion: "☀️ Conversion type:",
    soinPastoral: "❤️‍🩹 Pastoral care",
    besoins: "❓ Difficulties / Needs:",
    infosSup: "📝 Additional info:",
    modifierContact: "✏️ Edit contact",
    supprimerContact: "🗑️ Delete contact",
    confirmSuppression: "⚠️ Permanent deletion\n\nAre you sure you want to delete this contact?",
    confirmIntegrer: "Integrate this contact as a church member?",
    integrer: "✅ Integrate to church",
    integrating: "Integrating...",
    limitError: "❌ Limit reached",
    limitMsg: "members. Upgrade your plan.",
    integreSucces: "✅ Contact successfully integrated",
    integreError: "❌ Integration error: ",
    doublonsDetectes: "⚠️ Duplicates detected",
    doublonsInfo: "These contacts are already registered in the follow-ups.",
    envoyer: "Send",
    annuler: "Cancel",
    fermer: "Close",
    whatsappInfo: "Check the leader's information before sending.",
    nomResponsable: "👤 Leader's name",
    nomResponsablePl: "Leader's name",
    numeroWhatsApp: "📞 WhatsApp number",
    numeroWhatsAppPl: "+3363xxx... — leave blank to choose from your contacts",
    envoyerBtn: "Send",
    msgBonjour: "👋 Hello",
    msgIntroPlural: "We are entrusting you with the following people met during evangelism.\n\n",
    msgIntroSingular: "We are entrusting you with the following person met during evangelism.\n\n",
    msgPersonne: "👥 Person",
    msgTypeEvang: "📣 Evangelism type:",
    msgDate: "📅 Evangelised on:",
    msgCivilite: "🎗️ Gender:",
    msgNom: "👤 Name:",
    msgAge: "⏳ Age range:",
    msgVille: "🏙️ City:",
    msgTel: "📞 Phone:",
    msgWa: "💬 WhatsApp:",
    msgPriere: "🙏 Salvation prayer:",
    msgConversion: "☀️ Conversion type:",
    msgBesoins: "❓ Difficulties / Needs:",
    msgInfos: "📝 Notes:",
    msgMerci: "Thank you for your commitment ✨",
    alertCible: "⚠️ Please select a target",
    alertAucunContact: "⚠️ No contact selected",
    alertCibleIntrouvable: "⚠️ Target not found",
    alertSucces: "✅ Contacts sent and recorded",
    alertErreurSuppression: "❌ Error while deleting",
    alertErreurEnvoi: "❌ Error while sending: ",
    months: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
  },
};

export default function Evangelisation() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur", "ResponsableEvangelisation"]}>
      <EvangelisationContent />
    </ProtectedRoute>
  );
}

function EvangelisationContent() {
  const router = useRouter();
  const { highlight } = router.query;
  const { lang } = useLang();
  const t = translations[lang];

  const { profile, loading: loadingProfile, error: profileError, scopedQuery } = useChurchScope();
  const famillesActive = useFeature("familles");
  const conseillerActive = useFeature("conseiller");
  const cellulesActive = useFeature("cellules");
  const [contacts, setContacts] = useState([]);
  const [cellules, setCellules] = useState([]);
  const [familles, setFamilles] = useState([]);
  const [conseillers, setConseillers] = useState([]);
  const [selectedTargetType, setSelectedTargetType] = useState("");
  const [selectedTarget, setSelectedTarget] = useState("");
  const [checkedContacts, setCheckedContacts] = useState({});
  const [detailsOpen, setDetailsOpen] = useState({});
  const [editMember, setEditMember] = useState(null);
  const [popupMember, setPopupMember] = useState(null);
  const [loadingSend, setLoadingSend] = useState(false);
  const [integrating, setIntegrating] = useState({});
  const [openPhoneMenuId, setOpenPhoneMenuId] = useState(null);
  const phoneMenuRef = useRef(null);
  const highlightRef = useRef({});
  const [showWhatsappPopup, setShowWhatsappPopup] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [targetName, setTargetName] = useState("");
  const [loading, setLoading] = useState(true);
  const contactsToSendRef = useRef([]);
  const [contactsToSendNow, setContactsToSendNow] = useState([]);
  const [showDoublonPopup, setShowDoublonPopup] = useState(false);
  const [doublonsDetected, setDoublonsDetected] = useState([]);
  const [pendingContacts, setPendingContacts] = useState([]);
  const selectedTargetTypeRef = useRef("");
  const selectedTargetRef = useRef("");
  const { triggerRefresh } = useNotificationsContext();

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
  }, [loading, highlight]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (phoneMenuRef.current && !phoneMenuRef.current.contains(e.target)) {
        setOpenPhoneMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!profile) return;
    fetchContacts();
    if (cellulesActive) fetchCellules();
    if (famillesActive) fetchFamilles();
    if (conseillerActive) fetchConseillers();
  }, [profile, cellulesActive, famillesActive, conseillerActive]);

  const fetchContacts = async () => {
    try {
      const query = scopedQuery("evangelises");
      if (!query) return;
      const { data, error } = await query
        .in("status_suivi", ["Non envoyé", "vu"])
        .order("created_at", { ascending: false })
        .limit(1000);
      if (error) throw error;
      setContacts(data || []);
    } catch (err) {
      console.error("Erreur fetchContacts:", err.message);
      setContacts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCellules = async () => {
    try {
      const query = scopedQuery("cellules");
      if (!query) return;
      const { data, error } = await query.select("id, cellule_full, responsable, telephone, ville");
      if (error) throw error;
      setCellules(data || []);
    } catch (err) {
      console.error("Erreur fetchCellules:", err.message);
      setCellules([]);
    }
  };

  const fetchFamilles = async () => {
    try {
      const query = scopedQuery("familles");
      if (!query) return;
      const { data, error } = await query.select("id, famille_full, responsable, telephone, ville");
      if (error) throw error;
      setFamilles(data || []);
    } catch (err) {
      console.error("Erreur fetchFamilles:", err.message);
      setFamilles([]);
    }
  };

  const fetchConseillers = async () => {
    try {
      const query = scopedQuery("profiles");
      if (!query) return;
      const { data, error } = await query.select("id, prenom, nom, telephone").eq("role", "Conseiller");
      if (error) throw error;
      setConseillers(data || []);
    } catch (err) {
      console.error("Erreur fetchConseillers:", err.message);
      setConseillers([]);
    }
  };

  const handleCheck = (id) =>
    setCheckedContacts((prev) => ({ ...prev, [id]: !prev[id] }));

  const formatBesoin = (b) => {
    if (!b) return "—";
    if (Array.isArray(b)) return b.join(", ");
    try {
      const arr = JSON.parse(b);
      return Array.isArray(arr) ? arr.join(", ") : b;
    } catch { return b; }
  };

  const selectedContacts = contacts?.filter((c) => checkedContacts[c.id]) || [];
  const hasSelectedContacts = selectedContacts.length > 0;

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const d = new Date(dateString);
    const day = d.getDate().toString().padStart(2, "0");
    return `${day} ${t.months[d.getMonth()]} ${d.getFullYear()}`;
  };

  const getBorderColor = (member) => {
    if (member.is_whatsapp) return "#25D366";
    if (member.besoin) return "#FFB800";
    return "#888";
  };

  const resolveCible = (targetType, targetId) => {
    if (targetType === "cellule") return cellules.find((c) => c.id === targetId);
    if (targetType === "famille") return familles.find((f) => f.id === targetId);
    if (targetType === "conseiller") return conseillers.find((c) => c.id === targetId);
    return null;
  };

  const getCibleName = (targetType, cible) => {
    if (!cible) return "";
    if (targetType === "conseiller") return `${cible.prenom} ${cible.nom}`;
    return cible.responsable || cible.cellule_full || cible.famille_full || "";
  };

  const handleSupprimerMembre = async (id) => {
    try {
      const { error } = await supabase
        .from("evangelises")
        .update({ status_suivi: "supprime" })
        .eq("id", id);
      if (error) { console.error("Erreur suppression :", error); alert(t.alertErreurSuppression); return; }
      setContacts((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      console.error(err);
      alert(t.alertErreurSuppression);
    }
  };

  /* ================= INTÉGRER ================= */
  const handleIntegrer = async (member) => {
    const { atteinte, count, limite } = await checkLimiteAtteinte(profile.eglise_id);
    if (atteinte) {
      alert(`${t.limitError} : ${count}/${limite} ${t.limitMsg}`);
      return;
    }
    try {
      setIntegrating((p) => ({ ...p, [member.id]: true }));
      const payload = {
        eglise_id: profile.eglise_id,
        nom: member.nom || "",
        prenom: member.prenom || "",
        telephone: member.telephone || "",
        ville: member.ville || "",
        sexe: member.sexe || "",
        besoin: member.besoin || "",
        infos_supplementaires: member.infos_supplementaires || "",
        etat_contact: "Existant",
        venu: "Évangélisation",
        statut_suivis: 3,
        suivi_updated_at: new Date().toISOString(),
        evangelise_member_id: member.id,
        date_venu: new Date().toISOString(),
        priere_salut: member.priere_salut ?? null,
        type_conversion: member.type_conversion || null,
      };
      const { error } = await supabase.from("membres_complets").insert(payload);
      if (error) throw error;
      await supabase.from("evangelises").update({ status_suivi: "Intégré" }).eq("id", member.id);
      setContacts((prev) => prev.filter((c) => c.id !== member.id));
      alert(t.integreSucces);
    } catch (err) {
      console.error("Erreur intégration :", err.message);
      alert(t.integreError + err.message);
    } finally {
      setIntegrating((p) => ({ ...p, [member.id]: false }));
    }
  };

  const checkDoublons = async () => {
    if (!hasSelectedContacts || !selectedTargetType || !selectedTarget) return;
    selectedTargetTypeRef.current = selectedTargetType;
    selectedTargetRef.current = selectedTarget;
    contactsToSendRef.current = selectedContacts;
    const { data: existingSuivis } = await supabase.from("suivis_des_evangelises").select("telephone");
    const detected = selectedContacts.filter((c) =>
      (existingSuivis || []).some((s) => s.telephone === c.telephone)
    );
    if (detected.length > 0) {
      setDoublonsDetected(detected);
      setPendingContacts(selectedContacts);
      setShowDoublonPopup(true);
    } else {
      setContactsToSendNow(selectedContacts);
      contactsToSendRef.current = selectedContacts;
      const cible = resolveCible(selectedTargetType, selectedTarget);
      const cibleName = getCibleName(selectedTargetType, cible);
      setPhoneNumber(cible?.telephone || "");
      setTargetName(cibleName);
      setShowWhatsappPopup(true);
    }
  };

  const writeAssignments = async (insertedSuivis, targetType, targetId) => {
    if (!insertedSuivis || insertedSuivis.length === 0) return;
    if (targetType !== "conseiller") return;
    if (!targetId) return;
    const assignmentRows = insertedSuivis.map((suivi) => ({
      suivi_evangelise_id: suivi.id,
      conseiller_id: targetId,
      role: "principal",
      statut: "actif",
      assigned_by: profile?.id || null,
    }));
    const { error } = await supabase.from("suivi_assignments_evangelises").insert(assignmentRows).select();
    if (error) console.error("Erreur écriture suivi_assignments_evangelises :", error);
  };

  const sendToWhatsapp = async (contactsToSend, targetType, targetId) => {
    setShowDoublonPopup(false);
    setShowWhatsappPopup(false);
    setLoadingSend(true);
    try {
      if (!targetType || !targetId) { alert(t.alertCible); setLoadingSend(false); return; }
      if (!contactsToSend || contactsToSend.length === 0) { alert(t.alertAucunContact); setLoadingSend(false); return; }
      const cible = resolveCible(targetType, targetId);
      if (!cible) { alert(t.alertCibleIntrouvable); setLoadingSend(false); return; }
      const inserts = contactsToSend.map((m) => ({
        prenom: m.prenom,
        nom: m.nom,
        telephone: m.telephone,
        is_whatsapp: m.is_whatsapp,
        ville: m.ville,
        besoin: m.besoin,
        infos_supplementaires: m.infos_supplementaires,
        sexe: m.sexe,
        type_conversion: m.type_conversion,
        priere_salut: m.priere_salut,
        status_suivis_evangelises: "Envoyé",
        evangelise_id: m.id,
        conseiller_id: targetType === "conseiller" ? targetId : null,
        cellule_id: targetType === "cellule" ? targetId : null,
        famille_id: targetType === "famille" ? targetId : null,
        date_evangelise: m.date_evangelise,
        date_suivi: new Date().toISOString(),
        eglise_id: profile?.eglise_id || null,
        type_evangelisation: m.type_evangelisation,
        notification_responsable: true,
      }));
      const { data: insertedSuivis, error: insertError } = await supabase
        .from("suivis_des_evangelises").insert(inserts).select("id, conseiller_id");
      if (insertError) throw insertError;
      await writeAssignments(insertedSuivis, targetType, targetId);
      const ids = contactsToSend.map((c) => c.id);
      const { error: updateError } = await supabase.from("evangelises").update({ status_suivi: "Envoyé" }).in("id", ids);
      if (updateError) throw updateError;
      setContacts((prev) => prev.filter((c) => !ids.includes(c.id)));
      setCheckedContacts({});
      const cibleName = getCibleName(targetType, cible);
      let message = `${t.msgBonjour} ${cibleName},\n\n`;
      message += contactsToSend.length > 1 ? t.msgIntroPlural : t.msgIntroSingular;
      contactsToSend.forEach((m, i) => {
        message += "────────────────────\n";
        if (contactsToSend.length > 1) message += `${t.msgPersonne} ${i + 1}\n`;
        message += `${t.msgTypeEvang} ${m.type_evangelisation || "—"}
${t.msgDate} ${formatDate(m.date_evangelise)}  
${t.msgCivilite} ${m.sexe || "—"}  
${t.msgNom} ${m.prenom} ${m.nom}      
${t.msgAge} ${m.age || "—"}  
${t.msgVille} ${m.ville || "—"}      
${t.msgTel} ${m.telephone || "—"}  
${t.msgWa} ${m.is_whatsapp ? t.oui : t.non}     
${t.msgPriere} ${m.priere_salut ? t.oui : "—"}      
${t.msgConversion} ${m.type_conversion || "—"}               
${t.msgBesoins} ${formatBesoin(m.besoin)}      
${t.msgInfos} ${m.infos_supplementaires || "—"}

`;
      });
      message += t.msgMerci;
      const rawPhone = phoneNumber ? phoneNumber.replace(/\D/g, "") : "";
      const targetPhone = rawPhone.length >= 8 ? rawPhone : "";
      const whatsappLink = targetPhone
        ? `https://api.whatsapp.com/send?phone=${targetPhone}&text=${encodeURIComponent(message)}`
        : `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
      window.open(whatsappLink, "_blank");
      setPhoneNumber("");
      setTargetName("");
      window.dispatchEvent(new CustomEvent("refresh-notif-count"));
      alert(t.alertSucces);
    } catch (err) {
      console.error("Erreur envoi WhatsApp :", err);
      alert(t.alertErreurEnvoi + err.message);
    } finally {
      setLoadingSend(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-[#333699]">
      <HeaderPages />
      <h1 className="text-2xl font-bold mt-4 mb-6 text-blue-300 text-center text-white">
        {t.titre1}<span className="text-emerald-300">{t.titre2}</span>
      </h1>
      <div className="max-w-3xl w-full mb-6 text-center">
        <p className="italic text-base text-white/90">
          {t.description}<span className="text-blue-300 font-semibold">{t.descAccent1}</span>{t.descMid1}
          <span className="text-blue-300 font-semibold">{t.descAccent2}</span>
          {t.descMid2}{" "}
          <span className="text-blue-300 font-semibold">{t.descAccent3}</span>{t.descEnd}
        </p>
      </div>

      <div className="w-full max-w-md mb-6">
        <select
          value={selectedTargetType}
          onChange={(e) => { setSelectedTargetType(e.target.value); setSelectedTarget(""); }}
          className="w-full border rounded px-3 py-2 mb-3 text-center"
        >
          <option value="">{t.envoyerA}</option>
          {cellulesActive && <option value="cellule">{t.uneCellule}</option>}
          {famillesActive && <option value="famille">{t.uneFamille}</option>}
          {conseillerActive && <option value="conseiller">{t.unConseiller}</option>}
        </select>

        {selectedTargetType && (
          <select
            value={selectedTarget}
            onChange={(e) => setSelectedTarget(e.target.value)}
            className="w-full border rounded px-3 py-2 mb-3 text-center"
          >
            <option value="">{t.choisir}</option>
            {cellulesActive && selectedTargetType === "cellule" && cellules.map((c) => (
              <option key={c.id} value={c.id}>{c.ville ? `${c.cellule_full} - ${c.ville}` : c.cellule_full}</option>
            ))}
            {famillesActive && selectedTargetType === "famille" && familles.map((f) => (
              <option key={f.id} value={f.id}>{f.ville ? `${f.famille_full} - ${f.ville}` : f.famille_full}</option>
            ))}
            {conseillerActive && selectedTargetType === "conseiller" && conseillers.map((c) => (
              <option key={c.id} value={c.id}>{c.prenom} {c.nom}</option>
            ))}
          </select>
        )}

        {hasSelectedContacts && selectedTarget && (
          <button onClick={checkDoublons} disabled={loadingSend} className="w-full bg-green-500 text-white font-bold px-4 py-2 rounded">
            {loadingSend ? t.envoiLoading : t.envoiBtn}
          </button>
        )}
      </div>

      {/* ===== CONTACTS ===== */}
      <div className="w-full max-w-6xl flex flex-col items-center">
        {contacts && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-5xl">
            {contacts.map((member) => (
              <div
                key={member.id}
                ref={(el) => (highlightRef.current[member.id] = el)}
                className="bg-white rounded-2xl shadow-xl p-4 border-l-4 relative"
                style={{ borderLeftColor: getBorderColor(member) }}
              >
                <h2 className="font-bold text-center">{member.prenom} {member.nom}</h2>
                <p
                  className="text-center text-sm text-orange-500 font-semibold underline cursor-pointer"
                  onClick={() => setOpenPhoneMenuId(member.id)}
                >
                  {member.telephone || "—"}
                </p>
                {openPhoneMenuId === member.id && (
                  <div
                    ref={phoneMenuRef}
                    className="phone-menu absolute mt-2 bg-white rounded-lg shadow-lg border z-50 w-52 left-1/2 -translate-x-1/2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <a href={member.telephone ? `tel:${member.telephone}` : "#"} className="block px-4 py-2 text-sm text-black hover:bg-gray-100">{t.appeler}</a>
                    <a href={member.telephone ? `sms:${member.telephone}` : "#"} className="block px-4 py-2 text-sm text-black hover:bg-gray-100">{t.sms}</a>
                    <a href={member.telephone ? `https://wa.me/${member.telephone.replace(/\D/g, "")}?call` : "#"} target="_blank" rel="noopener noreferrer" className="block px-4 py-2 text-sm text-black hover:bg-gray-100">{t.appelWhatsApp}</a>
                    <a href={member.telephone ? `https://wa.me/${member.telephone.replace(/\D/g, "")}` : "#"} target="_blank" rel="noopener noreferrer" className="block px-4 py-2 text-sm text-black hover:bg-gray-100">{t.messageWhatsApp}</a>
                  </div>
                )}
                <p className="text-center mt-3 text-sm">{t.ville} {member.ville || "—"}</p>
                <label className="flex justify-center gap-2 mt-4">
                  <input type="checkbox" checked={checkedContacts[member.id] || false} onChange={() => handleCheck(member.id)} />
                  {" "}{t.selectionner}
                </label>
                <p className="text-[11px] text-gray-400 text-right mt-3">
                  {t.evangeliseLe} {formatDate(member.date_evangelise)}
                </p>

                {/* ===== BOUTON INTÉGRER ===== */}
                <button
                  onClick={() => {
                    if (window.confirm(t.confirmIntegrer)) handleIntegrer(member);
                  }}
                  disabled={integrating[member.id]}
                  className="mt-3 w-full bg-white text-green-600 px-3 py-1 rounded-md text-sm font-semibold shadow-sm hover:shadow-md transition-shadow"
                >
                  {integrating[member.id] ? t.integrating : t.integrer}
                </button>

                <button
                  onClick={() => setDetailsOpen((prev) => ({ ...prev, [member.id]: !prev[member.id] }))}
                  className="text-orange-500 underline text-sm block mx-auto mt-2"
                >
                  {detailsOpen[member.id] ? t.fermerDetails : t.details}
                </button>

                {detailsOpen[member.id] && (
                  <div className="text-black text-sm mt-3 w-full space-y-4">
                    <div>
                      <p>{t.typeEvang} {member.type_evangelisation || ""}</p>
                    </div>
                    <hr />
                    <div>
                      <p className="font-bold text-[#2E3192] mb-1">{t.identite}</p>
                      <p>{t.civilite} {member.sexe || "—"}</p>
                      <p>{t.age} {member.age || "—"}</p>
                      <p>{t.whatsapp} {member.is_whatsapp ? t.oui : t.non}</p>
                    </div>
                    <hr />
                    <div>
                      <p className="font-bold text-[#2E3192] mb-1">{t.vieSpirituelle}</p>
                      <p>{t.priereSalut} {member.priere_salut ? t.oui : "—"}</p>
                      <p>{t.typeConversion} {member.type_conversion || "—"}</p>
                    </div>
                    <hr />
                    <div>
                      <p className="font-bold text-[#2E3192] mb-1">{t.soinPastoral}</p>
                      <p>{t.besoins} {formatBesoin(member.besoin)}</p>
                      <p>{t.infosSup} {formatBesoin(member.infos_supplementaires)}</p>
                    </div>
                    <div className="mt-3 bg-gray-50 rounded-xl shadow-md p-4">
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => { setEditMember(member); setPopupMember(null); }}
                          className="w-full py-2 rounded-lg text-orange-500"
                        >
                          {t.modifierContact}
                        </button>
                        <button
                          onClick={() => { if (window.confirm(t.confirmSuppression)) handleSupprimerMembre(member.id); }}
                          className="w-full py-2 rounded-lg text-red-600 text-xs"
                        >
                          {t.supprimerContact}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {editMember && (
        <EditEvangelisePopup
          member={editMember}
          cellules={cellulesActive ? cellules : []}
          familles={famillesActive ? familles : []}
          conseillers={conseillerActive ? conseillers : []}
          onClose={() => setEditMember(null)}
          onUpdateMember={(updatedMember) => {
            setContacts((prev) => prev.map((c) => (c.id === updatedMember.id ? updatedMember : c)));
            setEditMember(null);
          }}
        />
      )}

      {showDoublonPopup && doublonsDetected.length > 0 && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full space-y-4 text-center">
            <h2 className="text-xl font-bold">{t.doublonsDetectes}</h2>
            <p className="text-sm">{t.doublonsInfo}</p>
            <ul className="text-left list-disc list-inside max-h-60 overflow-y-auto space-y-2">
              {doublonsDetected.map((d) => (
                <li key={d.id} className="flex flex-col sm:flex-row justify-between items-center gap-2 bg-gray-100 p-2 rounded">
                  <span>{d.prenom} {d.nom} - {d.telephone}</span>
                  <div className="flex gap-2 mt-2 sm:mt-0">
                    <button
                      onClick={() => {
                        sendToWhatsapp([d], selectedTargetTypeRef.current, selectedTargetRef.current);
                        setDoublonsDetected((prev) => prev.filter((c) => c.id !== d.id));
                        setShowDoublonPopup(false);
                      }}
                      className="bg-green-500 text-white px-3 py-1 rounded font-semibold"
                    >
                      {t.envoyer}
                    </button>
                    <button
                      onClick={() => setDoublonsDetected((prev) => prev.filter((c) => c.id !== d.id))}
                      className="bg-gray-300 px-3 py-1 rounded font-semibold"
                    >
                      {t.annuler}
                    </button>
                  </div>
                </li>
              ))}
              {doublonsDetected.length === 0 && (
                <div className="mt-4">
                  <button onClick={() => setShowDoublonPopup(false)} className="bg-blue-500 text-white px-4 py-2 rounded font-semibold">
                    {t.fermer}
                  </button>
                </div>
              )}
            </ul>
          </div>
        </div>
      )}

      {showWhatsappPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-xl">
            <p className="text-gray-700 mb-4">{t.whatsappInfo}</p>
            <label className="text-sm font-semibold text-gray-600 mb-1 block">{t.nomResponsable}</label>
            <input
              type="text"
              placeholder={t.nomResponsablePl}
              value={targetName}
              onChange={(e) => setTargetName(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 mb-3"
            />
            <label className="text-sm font-semibold text-gray-600 mb-1 block">{t.numeroWhatsApp}</label>
            <input
              type="text"
              placeholder={t.numeroWhatsAppPl}
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setShowWhatsappPopup(false); setPhoneNumber(""); setTargetName(""); }}
                className="flex-1 py-3 bg-gray-300 rounded-2xl font-semibold"
              >
                {t.annuler}
              </button>
              <button
                onClick={() => sendToWhatsapp(contactsToSendRef.current, selectedTargetTypeRef.current, selectedTargetRef.current)}
                className="flex-1 py-3 bg-green-500 text-white rounded-2xl font-semibold"
              >
                {t.envoyerBtn}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
