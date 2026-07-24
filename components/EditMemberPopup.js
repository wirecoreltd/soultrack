"use client";

import { useState, useEffect, useRef } from "react";
import supabase from "../lib/supabaseClient";
import { useLang } from "../hooks/useLang";

// ✅ Liste canonique unique des ministères (valeurs stockées en base, en français)
const MINISTERE_KEYS = [
  "Intercession", "Louange", "Administration", "Technique",
  "Communication", "Les Enfants", "Les ados", "Les jeunes",
  "Finance", "Nettoyage", "Conseiller", "Compassion",
  "Visite", "Berger", "Équipe d’accueil", "Modération",
];

const translations = {
  fr: {
    // Header
    editProfile: "Modifier le profil",
    // Loading
    loadingData: "Chargement des données...",
    // Sections
    identity: "👤 Identité",
    followedBy: "📌 Suivi par",
    suivi: "💝 Suivi",
    spiritual: "🕊 Vie spirituelle",
    // Fields labels
    civility: "Civilité",
    age: "Âge",
    cellule: "Cellule",
    famille: "Famille",
    addConseiller: "Ajouter conseiller",
    suiviStatut: "Suivi statut",
    commentaireSuivis: "Commentaire suivis",
    commentaireEvang: "Commentaire suivis Évangélisation",
    baptemeEau: "Baptême d'eau",
    baptemeFeu: "Baptême de feu",
    prieresSalut: "Prière du salut",
    formation: "Formation",
    etatContact: "État du contact",
    dateVenu: "Date de venue",
    howCame: "Comment est-il venu ?",
    extraInfos: "Informations supplémentaires",
    statutArrivee: "Statut à l'arrivée",
    ministere: "Ministère",
    // Select placeholders
    chooseCivility: "-- Civilité --",
    choose: "-- Choisir --",
    chooseCellule: "-- Cellule --",
    chooseFamille: "-- Famille --",
    chooseStatut: "-- Sélectionner un statut --",
    chooseSelect: "-- Sélectionner --",
    choosePriere: "-- Prière du salut ? --",
    chooseType: "Type",
    // Civility options
    homme: "Homme",
    femme: "Femme",
    // Age options
    ages: [
      "12-17 ans", "18-25 ans", "26-30 ans", "31-40 ans",
      "41-55 ans", "56-69 ans", "70 ans et plus",
    ],
    // Suivi statut options
    enAttente: "En Attente",
    integrer: "Intégrer",
    refus: "Refus",
    // Etat contact options
    nouveau: "Nouveau",
    existant: "Existant",
    inactif: "Inactif",
    // How came options
    invite: "Invité",
    reseaux: "Réseaux",
    evangelisation: "Évangélisation",
    autre: "Autre",
    // Statut arrivée options
    veutRejoindre: "Veut rejoindre l'église",
    aDejaEglise: "A déjà son église",
    visiteur: "Visiteur",
    // Conversion types
    nouveauConverti: "Nouveau converti",
    reconciliation: "Réconciliation",
    // Checkboxes
    whatsapp: "Numéro WhatsApp",
    wantsBaptism: "💦 Veut se faire baptiser",
    serviteur: "⭐ Définir en tant que serviteur",
    pilier: "🎖️ Définir en tant que Pilier",
    leaderDev: "🏆 Parcours de croissance vers le leadership",
    parcoursChoisir: "Choisis une étape du parcours",
    errParcours: "❌ Veuillez sélectionner une étape du parcours de développement.",
    parcoursStages: [
      { key: "potentiel", emoji: "🌱", label: "Potentiel identifié" },
      { key: "croissance", emoji: "🌿", label: "Serviteur fidèle" },
      { key: "developpement", emoji: "🌳", label: "Leader en croissance" },
      { key: "mature", emoji: "🌲", label: "Leader confirmé" },
    ],
    // Conseiller search
    searchConseiller: "Rechercher un conseiller...",
    noResult: "Aucun résultat",
    principal: "(principal)",
    // Locked message
    lockedMessage: "🔒 La cellule, la famille et les conseillers sont gérés par un administrateur.",
    // Ministere
    autreMinistere: "Précisez le ministère",
    // ✅ Labels traduits des ministères (clés = valeurs stockées en base)
    ministereLabels: {
      "Intercession": "Intercession",
      "Louange": "Louange",
      "Administration": "Administration",
      "Technique": "Technique",
      "Communication": "Communication",
      "Les Enfants": "Les Enfants",
      "Les ados": "Les ados",
      "Les jeunes": "Les jeunes",
      "Finance": "Finance",
      "Nettoyage": "Nettoyage",
      "Conseiller": "Conseiller",
      "Compassion": "Compassion",
      "Visite": "Visite",
      "Berger": "Berger",
      "Équipe d’accueil": "Équipe d’accueil",
      "Modération": "Modération",
    },
    // Footer buttons
    cancel: "Annuler",
    saving: "Enregistrement...",
    loading: "Chargement...",
    save: "💾 Sauvegarder",
    // Errors
    errPrenom: "❌ Le prénom est obligatoire.",
    errNom: "❌ Le nom est obligatoire.",
    errSave: "❌ Une erreur est survenue lors de l'enregistrement.",
    errMinistere: "❌ Veuillez sélectionner au moins un ministère.",
    errStatsMinistere: "⚠️ Le profil a été sauvegardé, mais l'historique des ministères n'a pas pu être enregistré. Contactez un administrateur.",
  },
  en: {
    editProfile: "Edit profile",
    loadingData: "Loading data...",
    identity: "👤 Identity",
    followedBy: "📌 Followed by",
    suivi: "💝 Follow-up",
    spiritual: "🕊 Spiritual life",
    civility: "Title",
    age: "Age",
    cellule: "Cell",
    famille: "Family",
    addConseiller: "Add counsellor",
    suiviStatut: "Follow-up status",
    commentaireSuivis: "Follow-up comment",
    commentaireEvang: "Evangelisation follow-up comment",
    baptemeEau: "Water baptism",
    baptemeFeu: "Fire baptism",
    prieresSalut: "Prayer of salvation",
    formation: "Training",
    etatContact: "Contact state",
    dateVenu: "Arrival date",
    howCame: "How did they come?",
    extraInfos: "Additional information",
    statutArrivee: "Status on arrival",
    ministere: "Ministry",
    chooseCivility: "-- Title --",
    choose: "-- Choose --",
    chooseCellule: "-- Cell --",
    chooseFamille: "-- Family --",
    chooseStatut: "-- Select a status --",
    chooseSelect: "-- Select --",
    choosePriere: "-- Prayer of salvation? --",
    chooseType: "Type",
    homme: "Man",
    femme: "Woman",
    ages: [
      "12-17 yrs", "18-25 yrs", "26-30 yrs", "31-40 yrs",
      "41-55 yrs", "56-69 yrs", "70 yrs and over",
    ],
    enAttente: "Pending",
    integrer: "Integrate",
    refus: "Refused",
    nouveau: "New",
    existant: "Existing",
    inactif: "Inactive",
    invite: "Invited",
    reseaux: "Social networks",
    evangelisation: "Evangelisation",
    autre: "Other",
    veutRejoindre: "Wants to join church",
    aDejaEglise: "Already has a church",
    visiteur: "Visitor",
    nouveauConverti: "New convert",
    reconciliation: "Reconciliation",
    whatsapp: "WhatsApp number",
    wantsBaptism: "💦 Wants to be baptised",
    serviteur: "⭐ Define as a servant",
    pilier: "🎖️ Define as a Pillar",
    leaderDev: "🏆 Leadership Growth Path",
    parcoursChoisir: "Choose a development stage",
    errParcours: "❌ Please select a development stage.",
    parcoursStages: [
      { key: "potentiel", emoji: "🌱", label: "Potential identified" },
      { key: "croissance", emoji: "🌿", label: "Faithful Servant" },
      { key: "developpement", emoji: "🌳", label: "Growing leader" },
      { key: "mature", emoji: "🌲", label: "Established Leader" },
    ],
    searchConseiller: "Search for a counsellor...",
    noResult: "No results",
    principal: "(main)",
    lockedMessage: "🔒 Cell, family and counsellors are managed by an administrator.",
    autreMinistere: "Specify the ministry",
    // ✅ Translated ministry labels (keys = values stored in DB)
    ministereLabels: {
      "Intercession": "Intercession",
      "Louange": "Worship",
      "Administration": "Administration",
      "Technique": "Technical/AV",
      "Communication": "Communication",
      "Les Enfants": "Children's Ministry",
      "Les ados": "Teens",
      "Les jeunes": "Young Adults",
      "Finance": "Finance",
      "Nettoyage": "Cleaning",
      "Conseiller": "Counselling",
      "Compassion": "Compassion",
      "Visite": "Visitation",
      "Berger": "Pastoral Care",
      "Équipe d’accueil": "Usher Team",
      "Modération": "Moderation",
    },
    cancel: "Cancel",
    saving: "Saving...",
    loading: "Loading...",
    save: "💾 Save",
    errPrenom: "❌ First name is required.",
    errNom: "❌ Last name is required.",
    errSave: "❌ An error occurred while saving.",
    errMinistere: "❌ Please select at least one ministry.",
    errStatsMinistere: "⚠️ The profile was saved, but the ministry history could not be recorded. Please contact an administrator.",
  },
};

export default function EditMemberPopup({
  member,
  cellules,
  familles,
  conseillers,
  onClose,
  onUpdateMember,
  currentUserRoles,
  user,
}) {
  const { lang } = useLang();
  const t = translations[lang];

  const isPrivileged = (currentUserRoles || []).some((r) =>
    ["Administrateur", "ResponsableIntegration"].includes(r)
  );

  const canManageLeader = (currentUserRoles || []).some((r) =>
    ["Administrateur", "ResponsableAdministration"].includes(r)
  );

  const showCellules = Array.isArray(cellules) && cellules.length > 0;
  const showFamilles = Array.isArray(familles) && familles.length > 0;
  const showConseillers = Array.isArray(conseillers) && conseillers.length > 0;

  const [autreMinistere, setAutreMinistere] = useState("");
  const [search, setSearch] = useState("");
  const [loadingData, setLoadingData] = useState(true);

  const parseBesoin = (b) => {
    if (!b) return [];
    if (Array.isArray(b)) return b;
    try {
      const parsed = JSON.parse(b);
      return Array.isArray(parsed) ? parsed : [String(b)];
    } catch {
      return [String(b)];
    }
  };

  const [formData, setFormData] = useState(null);
  const [showAutre, setShowAutre] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedConseillers, setSelectedConseillers] = useState([]);

  const modalRef = useRef(null);

  useEffect(() => {
    if (!member?.id) return;

    const fetchFreshData = async () => {
      setLoadingData(true);

      const { data: freshMember, error } = await supabase
        .from("membres_complets")
        .select("*")
        .eq("id", member.id)
        .single();

      if (error || !freshMember) {
        console.error("Erreur chargement membre frais:", error);
        initForm(member);
        setLoadingData(false);
        return;
      }

      initForm(freshMember);

      const { data: assignments, error: assignError } = await supabase
        .from("suivi_assignments")
        .select("conseiller_id, role, profiles:conseiller_id(id, prenom, nom)")
        .eq("membre_id", member.id)
        .eq("statut", "actif")
        .order("created_at", { ascending: true });

      if (!assignError && assignments) {
        const sorted = [...assignments].sort((a, b) => {
          if (a.role === "principal") return -1;
          if (b.role === "principal") return 1;
          return 0;
        });
        const objects = sorted.map((d) => d.profiles).filter(Boolean);
        setSelectedConseillers(objects);
      }

      // ✅ Récupère la dernière étape APRÈS que formData soit posé par initForm
      const { data: lastEval } = await supabase
        .from("evaluations_leader")
        .select("parcours_etape")
        .eq("membre_id", member.id)
        .order("date_action", { ascending: false })
        .limit(1)
        .maybeSingle();

      setFormData((prev) =>
        prev ? { ...prev, parcours_leader_etape: lastEval?.parcours_etape || "" } : prev
      );

      setLoadingData(false);
    };

    fetchFreshData();
  }, [member?.id]);

  // ✅ Hook séparé, correctement placé au niveau racine du composant
  useEffect(() => {
    if (!member?.id) return;
    const fetchLastStage = async () => {
      const { data } = await supabase
        .from("evaluations_leader")
        .select("parcours_etape")
        .eq("membre_id", member.id)
        .order("date_action", { ascending: false })
        .limit(1)
        .maybeSingle();

      setFormData((prev) =>
        prev ? { ...prev, parcours_leader_etape: data?.parcours_etape || "" } : prev
      );
    };
    fetchLastStage();
  }, [member?.id]);

  const initForm = (data) => {
    const initialBesoin = parseBesoin(data?.besoin);
    setShowAutre(initialBesoin.includes("Autre"));
    setFormData({
      prenom: data?.prenom || "",
      nom: data?.nom || "",
      telephone: data?.telephone || "",
      ville: data?.ville || "",
      sexe: data?.sexe || "",
      age: data?.age || "",
      star: !!data?.star,
      pilier: !!data?.pilier,
      leader_developpement: !!data?.leader_developpement,
      parcours_leader_etape: "",
      etat_contact: data?.etat_contact || "Nouveau",
      bapteme_eau: data?.bapteme_eau ?? null,
      bapteme_esprit: data?.bapteme_esprit ?? null,
      priere_salut: data?.priere_salut || "",
      type_conversion: data?.type_conversion || "",
      cellule_id: data?.cellule_id ?? "",
      famille_id: data?.famille_id ?? "",
      conseillers_ids: data?.conseillers_ids || [],
      besoin: initialBesoin,
      autreBesoin: "",
      venu: data?.venu || "",
      date_venu: data?.date_venu || "",
      infos_supplementaires: data?.infos_supplementaires || "",
      statut_initial: data?.statut_initial || "",
      suivi_statut: data?.suivi_statut || "",
      commentaire_suivis: data?.commentaire_suivis || "",
      is_whatsapp: !!data?.is_whatsapp,
      Formation: data?.Formation || "",
      Soin_Pastoral: data?.Soin_Pastoral || "",
      Ministere: parseBesoin(data?.Ministere),
      veut_se_faire_baptiser: data?.veut_se_faire_baptiser || "",
      Commentaire_Suivi_Evangelisation:
        data?.Commentaire_Suivi_Evangelisation || "",
      // ✅ FIX : on garde l'eglise_id venant des données FRAÎCHES (data),
      // avec repli sur la prop `member` si jamais `data` ne l'a pas.
      // Avant ce correctif, handleSubmit utilisait `member.eglise_id`
      // (la prop d'origine, potentiellement incomplète si le parent ne
      // sélectionne pas cette colonne), ce qui pouvait être `undefined`
      // et faire échouer silencieusement l'insert dans
      // stats_ministere_besoin (colonne eglise_id NOT NULL).
      eglise_id: data?.eglise_id ?? member?.eglise_id ?? null,
    });

    // ✅ Utilise la même liste canonique que celle affichée pour éviter
    // toute divergence (ex: "Équipe d’accueil" oublié) qui ferait passer
    // à tort une valeur connue pour un "Autre" ministère personnalisé.
    const ministereList = parseBesoin(data?.Ministere);
    const autreVal = ministereList.find(
      (m) => ![...MINISTERE_KEYS, "Autre"].includes(m)
    );
    if (autreVal) {
      setAutreMinistere(autreVal);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  if (!member) return null;

  const filteredConseillers = (conseillers || []).filter((c) =>
    `${c.prenom} ${c.nom}`.toLowerCase().includes(search.toLowerCase())
  );

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
        ...(name === "star" && !checked ? { Ministere: [] } : {}),
        ...(name === "pilier" && checked ? { star: true } : {}),
        ...(name === "leader_developpement" && checked ? { star: true } : {}),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleBesoinChange = (e) => {
    const { value, checked } = e.target;
    if (value === "Autre") {
      setShowAutre(checked);
      setFormData((prev) => ({
        ...prev,
        besoin: checked
          ? [...prev.besoin, "Autre"]
          : prev.besoin.filter((b) => b !== "Autre"),
        autreBesoin: "",
      }));
      return;
    }
    setFormData((prev) => ({
      ...prev,
      besoin: checked
        ? [...prev.besoin, value]
        : prev.besoin.filter((b) => b !== value),
    }));
  };

  const handleSubmit = async () => {
    setMessage("");
    if (!formData.prenom.trim()) return setMessage(t.errPrenom);
    if (!formData.nom.trim()) return setMessage(t.errNom);

    if (formData.star && formData.Ministere.length === 0) {
      return setMessage(t.errMinistere);
    }

    if (canManageLeader && formData.leader_developpement && !formData.parcours_leader_etape) {
      return setMessage(t.errParcours);
    }

    setLoading(true);

    try {
      let finalBesoin = [...formData.besoin];
      if (showAutre && formData.autreBesoin.trim()) {
        finalBesoin = finalBesoin.filter((b) => b !== "Autre");
        finalBesoin.push(formData.autreBesoin.trim());
      } else {
        finalBesoin = finalBesoin.filter((b) => b !== "Autre");
      }

      let finalMinistere = [...formData.Ministere];
      if (finalMinistere.includes("Autre") && autreMinistere?.trim()) {
        finalMinistere = finalMinistere.filter((m) => m !== "Autre");
        finalMinistere.push(autreMinistere.trim());
      }

      // ✅ FIX : eglise_id fiable, capturé une seule fois ici.
      // On utilise formData.eglise_id (rempli dans initForm à partir des
      // données fraîches), avec repli sur member.eglise_id par sécurité.
      const egliseIdFinal = formData.eglise_id || member.eglise_id || null;

      let statsMinistereError = null;

      if (isPrivileged) {
        if (!egliseIdFinal) {
          // On ne tente même pas l'insert : sans eglise_id, la colonne
          // NOT NULL ferait échouer la requête de toute façon. On le
          // détecte ici pour donner un message clair au lieu d'un échec
          // silencieux.
          statsMinistereError = new Error(
            "eglise_id introuvable pour ce membre — impossible d'enregistrer stats_ministere_besoin"
          );
          console.error(statsMinistereError);
        } else if (formData.star) {
          // ⚠️ IMPORTANT — pas de `onConflict` ici, intentionnellement.
          // On veut conserver l'HISTORIQUE complet des changements de ministère :
          // chaque sauvegarde crée une nouvelle ligne "photo" datée du jour, au lieu
          // d'écraser la précédente. RapportMinistere.js reconstruit ensuite l'état
          // d'un serviteur à n'importe quelle date en prenant, pour chaque membre,
          // la ligne la plus récente dont `date_action` est ≤ à la date choisie
          // (logique "photo instantanée", pas d'accumulation).
          // ⚠️ Ne PAS ajouter `onConflict` sans adapter RapportMinistere.js en
          // conséquence, sinon l'historique serait perdu et les rapports passés
          // deviendraient incorrects.
          const { error: upsertError } = await supabase
            .from("stats_ministere_besoin")
            .upsert({
              membre_id: member.id,
              sexe: formData.sexe,
              type: "ministere",
              valeur: finalMinistere.join(","),
              eglise_id: egliseIdFinal,
              date_action: new Date().toISOString().split("T")[0],
            });
          if (upsertError) {
            statsMinistereError = upsertError;
            console.error("Erreur upsert stats_ministere_besoin (star=true):", upsertError);
          }
        } else {
          // ✅ On ne supprime plus l'historique des lignes passées : un serviteur
          // qui n'est plus "star" doit garder ses anciennes affectations intactes
          // pour que les rapports sur des périodes passées restent exacts.
          // On enregistre à la place une ligne "fin de service" (valeur vide)
          // datée d'aujourd'hui : à partir de cette date il n'apparaîtra plus dans
          // aucun ministère dans les rapports, sans effacer ce qu'il a fait avant.
          const { error: upsertError } = await supabase
            .from("stats_ministere_besoin")
            .upsert({
              membre_id: member.id,
              sexe: formData.sexe,
              type: "ministere",
              valeur: "",
              eglise_id: egliseIdFinal,
              date_action: new Date().toISOString().split("T")[0],
            });
          if (upsertError) {
            statsMinistereError = upsertError;
            console.error("Erreur upsert stats_ministere_besoin (star=false):", upsertError);
          }
        }
      }

      // ✅ payload nettoyé : plus de parcours_leader_etape, plus de doublon etat_contact
      const payload = {
        prenom: formData.prenom,
        nom: formData.nom,
        telephone: formData.telephone || null,
        ville: formData.ville || null,
        sexe: formData.sexe || null,
        age: formData.age || null,
        star: isPrivileged ? !!formData.star : !!member.star,
        pilier: isPrivileged ? !!formData.pilier : !!member.pilier,
        leader_developpement: canManageLeader
          ? !!formData.leader_developpement
          : !!member.leader_developpement,
        etat_contact: formData.etat_contact || "Nouveau",
        bapteme_eau: formData.bapteme_eau,
        bapteme_esprit: formData.bapteme_esprit,
        priere_salut: formData.priere_salut || null,
        type_conversion: formData.type_conversion || null,
        cellule_id: isPrivileged
          ? showCellules ? formData.cellule_id || null : member.cellule_id || null
          : member.cellule_id || null,
        famille_id: isPrivileged
          ? showFamilles ? formData.famille_id || null : member.famille_id || null
          : member.famille_id || null,
        besoin: JSON.stringify(finalBesoin),
        venu: formData.venu || null,
        date_venu: formData.date_venu || null,
        infos_supplementaires: formData.infos_supplementaires || null,
        statut_initial: formData.statut_initial || null,
        suivi_statut: formData.suivi_statut || null,
        commentaire_suivis: formData.commentaire_suivis || null,
        is_whatsapp: !!formData.is_whatsapp,
        Formation: formData.Formation || null,
        Soin_Pastoral: formData.Soin_Pastoral || null,
        veut_se_faire_baptiser: formData.veut_se_faire_baptiser || null,
        Commentaire_Suivi_Evangelisation:
          formData.Commentaire_Suivi_Evangelisation || null,
        Ministere:
          isPrivileged && formData.star
            ? JSON.stringify(finalMinistere)
            : member.Ministere,
      };
      // ── Auto-intégration : dès qu'une cellule ou famille est attribuée ──
      const celluleOuFamilleAttribuee = !!(payload.cellule_id || payload.famille_id);
      if (celluleOuFamilleAttribuee) {
        payload.statut_suivis = 3;
      }

      const { error } = await supabase
        .from("membres_complets")
        .update(payload)
        .eq("id", member.id);
      if (error) throw error;

      // ✅ Insertion d'une évaluation minimale si une étape a été choisie
      let newStage = null;
      if (canManageLeader && formData.leader_developpement && formData.parcours_leader_etape) {
        const { error: evalError } = await supabase.from("evaluations_leader").insert({
          membre_id: member.id,
          created_by: user?.id || null,
          date_action: new Date().toISOString().split("T")[0],
          parcours_etape: formData.parcours_leader_etape,
        });
        if (evalError) {
          console.error("Erreur ajout étape parcours:", evalError);
        } else {
          newStage = formData.parcours_leader_etape;
        }
      }

      if (isPrivileged && showConseillers) {
        await supabase
          .from("suivi_assignments")
          .delete()
          .eq("membre_id", member.id);
        const rows = selectedConseillers.map((c, index) => ({
          membre_id: member.id,
          conseiller_id: c.id,
          role: index === 0 ? "principal" : "assistant",
          statut: "actif",
        }));
        if (rows.length > 0)
          await supabase.from("suivi_assignments").insert(rows);
      }

      const { data: updatedMember, error: selectError } = await supabase
        .from("membres_complets")
        .select("*")
        .eq("id", member.id)
        .single();
      if (selectError) throw selectError;

      onUpdateMember(updatedMember, newStage);

      // ✅ Si le profil principal est bien enregistré mais que
      // stats_ministere_besoin a échoué, on le signale clairement au lieu
      // de fermer le popup en silence comme si tout s'était bien passé.
      if (statsMinistereError) {
        setMessage(t.errStatsMinistere);
        setLoading(false);
        return;
      }

      onClose();
    } catch (err) {
      console.error(err);
      setMessage(t.errSave);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{
        background: "rgba(30,35,90,0.35)",
        backdropFilter: "blur(6px)",
      }}
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
        style={{ background: "#ffffff", border: "1px solid #e2e8f0" }}
      >
        {/* Header */}
        <div
          className="px-6 pt-6 pb-4"
          style={{
            background: "linear-gradient(135deg, #2E3192 0%, #4f54c9 100%)",
          }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-white font-bold text-sm transition-all"
            style={{ background: "rgba(255,255,255,0.2)" }}
          >
            ✕
          </button>
          <h2 className="text-xl font-bold text-white pr-10">
            ✏️ {member.prenom} {member.nom}
          </h2>
          <p className="text-blue-100 text-sm mt-1 opacity-80">
            {t.editProfile}
          </p>
        </div>

        {/* Body */}
        <div
          className="overflow-y-auto px-6 py-5 flex flex-col gap-5"
          style={{ maxHeight: "68vh" }}
        >
          {loadingData || !formData ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div
                className="w-8 h-8 rounded-full border-4 border-t-transparent animate-spin"
                style={{ borderColor: "#2E3192", borderTopColor: "transparent" }}
              />
              <p className="text-sm text-gray-400">{t.loadingData}</p>
            </div>
          ) : (
            <>
              <SectionTitle>{t.identity}</SectionTitle>

              <Field label={t.civility}>
                <select
                  name="sexe"
                  value={formData.sexe}
                  onChange={handleChange}
                  className="inp"
                >
                  <option value="">{t.chooseCivility}</option>
                  <option value="Homme">{t.homme}</option>
                  <option value="Femme">{t.femme}</option>
                </select>
              </Field>

              {["prenom", "nom", "telephone", "ville"].map((f) => (
                <Field key={f} label={f.charAt(0).toUpperCase() + f.slice(1)}>
                  <input
                    name={f}
                    value={formData[f]}
                    onChange={handleChange}
                    className="inp"
                  />
                  {f === "telephone" && (
                    <label className="flex items-center gap-2 mt-2 text-sm text-gray-600 cursor-pointer">
                      <input
                        type="checkbox"
                        name="is_whatsapp"
                        checked={formData.is_whatsapp}
                        onChange={handleChange}
                        className="accent-[#2E3192]"
                      />
                      {t.whatsapp}
                    </label>
                  )}
                </Field>
              ))}

              <Field label={t.age}>
                <select
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  className="inp"
                >
                  <option value="">{t.choose}</option>
                  {t.ages.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label={t.dateVenu}>
                <input
                  type="date"
                  name="date_venu"
                  value={formData.date_venu ? formData.date_venu.split("T")[0] : ""}
                  onChange={handleChange}
                  className="inp"
                />
              </Field>

              {isPrivileged && (showCellules || showFamilles || showConseillers) && (
                <SectionTitle>{t.followedBy}</SectionTitle>
              )}

              {isPrivileged ? (
                <>
                  {showCellules && (
                    <Field label={t.cellule}>
                      <select
                        name="cellule_id"
                        value={formData.cellule_id ?? ""}
                        onChange={handleChange}
                        className="inp"
                      >
                        <option value="">{t.chooseCellule}</option>
                        {cellules.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.cellule_full}
                          </option>
                        ))}
                      </select>
                    </Field>
                  )}

                  {showFamilles && (
                    <Field label={t.famille}>
                      <select
                        name="famille_id"
                        value={formData.famille_id ?? ""}
                        onChange={handleChange}
                        className="inp"
                      >
                        <option value="">{t.chooseFamille}</option>
                        {familles.map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.famille_full}
                          </option>
                        ))}
                      </select>
                    </Field>
                  )}

                  {showConseillers && (
                    <>
                      <Field label={t.addConseiller}>
                        <input
                          type="text"
                          placeholder={t.searchConseiller}
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          className="inp mb-2"
                        />
                        <div className="max-h-36 overflow-y-auto rounded-xl border border-gray-200 divide-y divide-gray-100">
                          {filteredConseillers.map((c) => {
                            const alreadySelected = selectedConseillers.some(
                              (s) => s.id === c.id
                            );
                            return (
                              <div
                                key={c.id}
                                onClick={() => {
                                  if (!alreadySelected) {
                                    setSelectedConseillers((prev) => [
                                      ...prev,
                                      { id: c.id, prenom: c.prenom, nom: c.nom },
                                    ]);
                                  }
                                }}
                                className={
                                  "px-3 py-2 text-sm transition-colors " +
                                  (alreadySelected
                                    ? "bg-gray-50 text-gray-300 cursor-not-allowed"
                                    : "cursor-pointer hover:bg-blue-50 text-gray-700")
                                }
                              >
                                {c.prenom} {c.nom} {alreadySelected ? "✓" : ""}
                              </div>
                            );
                          })}
                          {filteredConseillers.length === 0 && (
                            <p className="text-xs text-gray-400 px-3 py-2">
                              {t.noResult}
                            </p>
                          )}
                        </div>
                      </Field>

                      {selectedConseillers.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {selectedConseillers.map((c, index) => (
                            <div
                              key={c.id}
                              className="flex items-center gap-1 px-3 py-1 rounded-full text-sm text-white"
                              style={{
                                background: index === 0 ? "#2E3192" : "#6b7280",
                              }}
                            >
                              <span>
                                {c.prenom} {c.nom}
                              </span>
                              {index === 0 && selectedConseillers.length > 1 && (
                                <span className="text-xs opacity-60 ml-1">
                                  {t.principal}
                                </span>
                              )}
                              <button
                                onClick={() =>
                                  setSelectedConseillers((prev) =>
                                    prev.filter((x) => x.id !== c.id)
                                  )
                                }
                                className="ml-1 opacity-70 hover:opacity-100"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}

                  {!showCellules && !showFamilles && !showConseillers && (
                    <p className="text-sm text-gray-400 italic bg-gray-50 rounded-xl px-4 py-3">
                      {t.lockedMessage}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-sm text-gray-400 italic bg-gray-50 rounded-xl px-4 py-3">
                  {t.lockedMessage}
                </p>
              )}

              <SectionTitle>{t.suivi}</SectionTitle>

              <Field label={t.suiviStatut}>
                <select
                  value={formData.suivi_statut ?? ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      suivi_statut: e.target.value,
                    }))
                  }
                  className="inp"
                >
                  <option value="">{t.chooseStatut}</option>
                  <option value="En Attente">{t.enAttente}</option>
                  <option value="Intégrer">{t.integrer}</option>
                  <option value="Refus">{t.refus}</option>
                </select>
              </Field>

              <Field label={t.commentaireSuivis}>
                <textarea
                  name="commentaire_suivis"
                  value={formData.commentaire_suivis}
                  onChange={handleChange}
                  className="inp"
                  rows={2}
                />
              </Field>

              <Field label={t.commentaireEvang}>
                <textarea
                  name="Commentaire_Suivi_Evangelisation"
                  value={formData.Commentaire_Suivi_Evangelisation}
                  onChange={handleChange}
                  className="inp"
                  rows={2}
                />
              </Field>

              <SectionTitle>{t.spiritual}</SectionTitle>

              <Field label={t.baptemeEau}>
                <select
                  name="bapteme_eau"
                  value={formData.bapteme_eau ?? ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData((prev) => ({
                      ...prev,
                      bapteme_eau: value,
                      veut_se_faire_baptiser:
                        value === "Oui" ? "Non" : prev.veut_se_faire_baptiser,
                    }));
                  }}
                  className="inp"
                >
                  <option value="">{t.chooseSelect}</option>
                  <option value="Oui">Oui</option>
                  <option value="Non">Non</option>
                </select>
              </Field>

              {formData.bapteme_eau === "Non" && (
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer ml-4">
                  <input
                    type="checkbox"
                    checked={formData.veut_se_faire_baptiser === "Oui"}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        veut_se_faire_baptiser: e.target.checked ? "Oui" : "Non",
                      }))
                    }
                    className="accent-[#2E3192]"
                  />
                  {t.wantsBaptism}
                </label>
              )}

              <Field label={t.baptemeFeu}>
                <select
                  name="bapteme_esprit"
                  value={formData.bapteme_esprit ?? ""}
                  onChange={handleChange}
                  className="inp"
                >
                  <option value="">{t.chooseSelect}</option>
                  <option value="Oui">Oui</option>
                  <option value="Non">Non</option>
                </select>
              </Field>

              <Field label={t.prieresSalut}>
                <select
                  name="priere_salut"
                  value={formData.priere_salut}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData({
                      ...formData,
                      priere_salut: value,
                      type_conversion:
                        value === "Oui" ? formData.type_conversion : "",
                    });
                  }}
                  className="inp"
                >
                  <option value="">{t.choosePriere}</option>
                  <option value="Oui">Oui</option>
                  <option value="Non">Non</option>
                </select>
                {formData.priere_salut === "Oui" && (
                  <select
                    name="type_conversion"
                    value={formData.type_conversion}
                    onChange={handleChange}
                    className="inp mt-2"
                  >
                    <option value="">{t.chooseType}</option>
                    <option value="Nouveau converti">{t.nouveauConverti}</option>
                    <option value="Réconciliation">{t.reconciliation}</option>
                  </select>
                )}
              </Field>

              <Field label={t.formation}>
                <textarea
                  name="Formation"
                  value={formData.Formation}
                  onChange={handleChange}
                  className="inp"
                  rows={2}
                />
              </Field>

              {isPrivileged && (
                <>
                  <div className="flex items-center gap-3 py-2">
                    <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-gray-700">
                      <input
                        type="checkbox"
                        name="star"
                        checked={formData.star}
                        onChange={handleChange}
                        className="accent-[#2E3192] w-4 h-4"
                      />
                      {t.serviteur}
                    </label>
                  </div>

                  {formData.star && (
                    <Field label={t.ministere}>
                      <div className="grid grid-cols-2 gap-1 mt-1">
                        {MINISTERE_KEYS.map((m) => (
                          <label
                            key={m}
                            className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer py-1"
                          >
                            <input
                              type="checkbox"
                              value={m}
                              checked={formData.Ministere.includes(m)}
                              onChange={(e) => {
                                const { value, checked } = e.target;
                                setFormData((prev) => ({
                                  ...prev,
                                  Ministere: checked
                                    ? [...prev.Ministere, value]
                                    : prev.Ministere.filter((v) => v !== value),
                                }));
                              }}
                              className="accent-[#2E3192]"
                            />
                            {t.ministereLabels[m] || m}
                          </label>
                        ))}
                        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer py-1">
                          <input
                            type="checkbox"
                            checked={formData.Ministere.includes("Autre")}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setFormData((prev) => ({
                                ...prev,
                                Ministere: checked
                                  ? [...prev.Ministere, "Autre"]
                                  : prev.Ministere.filter((v) => v !== "Autre"),
                              }));
                              if (!checked) setAutreMinistere("");
                            }}
                            className="accent-[#2E3192]"
                          />
                          {t.autre}
                        </label>
                      </div>
                      {formData.Ministere.includes("Autre") && (
                        <input
                          type="text"
                          className="inp mt-2"
                          placeholder={t.autreMinistere}
                          value={autreMinistere}
                          onChange={(e) => setAutreMinistere(e.target.value)}
                        />
                      )}
                    </Field>
                  )}

                  <div className="flex items-center gap-3 py-2">
                    <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-gray-700">
                      <input
                        type="checkbox"
                        name="pilier"
                        checked={formData.pilier}
                        onChange={handleChange}
                        className="accent-[#2E3192] w-4 h-4"
                      />
                      {t.pilier}
                    </label>
                  </div>
                </>
              )}

              {canManageLeader && (
                <div className="flex flex-col gap-2 py-2">
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-gray-700">
                    <input
                      type="checkbox"
                      name="leader_developpement"
                      checked={formData.leader_developpement}
                      onChange={handleChange}
                      className="accent-[#2E3192] w-4 h-4"
                    />
                    {t.leaderDev}
                  </label>

                  {formData.leader_developpement && (
                    <div className="rounded-xl p-3 border" style={{ background: "#f8faff", borderColor: "#c7cef5" }}>
                      {!formData.parcours_leader_etape && (
                        <p className="text-xs text-gray-400 italic mb-2">{t.parcoursChoisir}</p>
                      )}
                      <div className="flex items-stretch justify-between gap-2">
                        {t.parcoursStages.map((stage) => {
                          const isActive = stage.key === formData.parcours_leader_etape;
                          return (
                            <button
                              key={stage.key}
                              type="button"
                              onClick={() =>
                                setFormData((p) => ({ ...p, parcours_leader_etape: stage.key }))
                              }
                              className="flex-1 flex flex-col items-center gap-1 rounded-lg px-2 py-2 transition-all active:scale-95"
                              style={{
                                background: isActive ? "#2E3192" : "#ffffff",
                                border: `2px solid ${isActive ? "#2E3192" : "#e2e8f0"}`,
                              }}
                            >
                              <span className="text-lg leading-none">{stage.emoji}</span>
                              <span
                                className="text-[10px] font-semibold text-center leading-tight"
                                style={{ color: isActive ? "#fff" : "#334155" }}
                              >
                                {stage.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <Field label={t.etatContact}>
                <select
                  name="etat_contact"
                  value={formData.etat_contact}
                  onChange={handleChange}
                  className="inp"
                >
                  <option value="">{t.chooseSelect}</option>
                  <option value="nouveau">{t.nouveau}</option>
                  <option value="existant">{t.existant}</option>
                  <option value="inactif">{t.inactif}</option>
                </select>
              </Field>

              <Field label={t.howCame}>
                <select
                  name="venu"
                  value={formData.venu}
                  onChange={handleChange}
                  className="inp"
                >
                  <option value="">{t.chooseSelect}</option>
                  <option value="invité">{t.invite}</option>
                  <option value="réseaux">{t.reseaux}</option>
                  <option value="evangélisation">{t.evangelisation}</option>
                  <option value="autre">{t.autre}</option>
                </select>
              </Field>

              <Field label={t.extraInfos}>
                <textarea
                  name="infos_supplementaires"
                  value={formData.infos_supplementaires}
                  onChange={handleChange}
                  className="inp"
                  rows={2}
                />
              </Field>

              <Field label={t.statutArrivee}>
                <select
                  name="statut_initial"
                  value={formData.statut_initial}
                  onChange={handleChange}
                  className="inp"
                >
                  <option value="">{t.chooseSelect}</option>
                  <option value="veut rejoindre L'église">{t.veutRejoindre}</option>
                  <option value="a déjà son église">{t.aDejaEglise}</option>
                  <option value="visiteur">{t.visiteur}</option>
                </select>
              </Field>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-gray-600 bg-white border border-gray-200 hover:bg-gray-100 transition-all"
          >
            {t.cancel}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || loadingData || !formData}
            className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-white transition-all disabled:opacity-60"
            style={{
              background: loading || loadingData
                ? "#a0a0c0"
                : "linear-gradient(135deg, #2E3192 0%, #4f54c9 100%)",
            }}
          >
            {loading ? t.saving : loadingData ? t.loading : t.save}
          </button>
        </div>

        {message && (
          <p
            className="text-center text-sm font-semibold px-6 pb-4"
            style={{ color: message.includes("❌") ? "#dc2626" : "#2E3192" }}
          >
            {message}
          </p>
        )}

        <style jsx>{`
          .inp {
            width: 100%;
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            padding: 10px 12px;
            background: #f8fafc;
            color: #1e293b;
            font-size: 14px;
            outline: none;
            transition: border-color 0.2s;
          }
          .inp:focus {
            border-color: #2E3192;
            background: #fff;
          }
          select.inp option {
            background: white;
            color: #1e293b;
          }
        `}</style>
      </div>
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <div className="flex items-center gap-2 pt-2">
      <span
        className="text-xs font-bold uppercase tracking-widest"
        style={{ color: "#2E3192" }}
      >
        {children}
      </span>
      <div className="flex-1 h-px" style={{ background: "#e2e8f0" }} />
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label
        className="text-xs font-semibold uppercase tracking-wide"
        style={{ color: "#64748b" }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}
