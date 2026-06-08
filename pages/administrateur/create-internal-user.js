"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import supabase from "../../lib/supabaseClient";
import Image from "next/image";
import ProtectedRoute from "../../components/ProtectedRoute";
import { useFeature } from "../../components/FeaturesContext";
import { useLang } from "../../hooks/useLang";
import { getPrefixForPays } from "../../lib/phonePrefix";

const translations = {
  fr: {
    retour: "← Retour",
    titre: "Créer un",
    titreAccent: "Utilisateur",
    intro: "Créez un utilisateur en sélectionnant un membre existant ou en ajoutant un nouveau serviteur. Chaque utilisateur doit se voir attribuer au moins un",
    introAccent: "rôle",
    roles: [
      { key: "Administrateur",            label: "Administrateur",                desc: "gestion complète du système" },
      { key: "ResponsableIntegration",    label: "Responsable Intégration",       desc: "gestion des membres" },
      { key: "ResponsableEvangelisation", label: "Responsable Évangélisation",    desc: "suivi de l'évangélisation" },
      { key: "CheckInPresence",           label: "Check-in (Présence)",           desc: "gestion des présences" },
      { key: "ResponsableCheckIn",        label: "Responsable Check-in",          desc: "gestion des sessions de présence" },
      { key: "ResponsableCellule",        label: "Responsable Cellule",           desc: "gestion des cellules",        feature: "cellules" },
      { key: "SuperviseurCellule",        label: "Superviseur Cellule",           desc: "supervision des cellules",    feature: "cellules" },
      { key: "ResponsableFamilles",       label: "Responsable Familles",          desc: "gestion des familles",        feature: "familles" },
      { key: "SuperviseurFamilles",       label: "Superviseur Familles",          desc: "supervision des familles",    feature: "familles" },
      { key: "Conseiller",                label: "Conseiller",                    desc: "accompagnement des membres",  feature: "conseiller" },
    ],
    selectMembre: "-- Choisir un membre existant --",
    ajouterServiteur: "➕ Ajouter un Serviteur",
    dateVenu: "Date de venue",
    civilite: "Civilité",
    civiliteOptions: [
      { value: "Homme", label: "Homme" },
      { value: "Femme", label: "Femme" },
    ],
    prenom: "Prénom",
    nom: "Nom",
    telephone: "Téléphone",
    whatsapp: "Numéro WhatsApp",
    ville: "Ville",
    age: "Âge",
    ageOptions: ["12-17 ans","18-25 ans","26-30 ans","31-40 ans","41-55 ans","56-69 ans","70 ans et plus"],
    statut: "Statut",
    statutOptions: [
      { value: "veut rejoindre l'église", label: "Veut rejoindre l'église" },
      { value: "a déjà son église",       label: "A déjà son église" },
      { value: "nouveau",                 label: "Nouveau" },
      { value: "visiteur",                label: "Visiteur" },
    ],
    venu: "Comment est-il venu ?",
    venuOptions: [
      { value: "invité",         label: "Invité" },
      { value: "réseaux",        label: "Réseaux" },
      { value: "evangélisation", label: "Évangélisation" },
      { value: "autre",          label: "Autre" },
    ],
    priereSalut: "Prière du salut",
    priereSalutOui: "Oui",
    priereSalutNon: "Non",
    typeConversion: "Type de conversion",
    typeConversionOptions: [
      { value: "Nouveau converti", label: "Nouveau converti" },
      { value: "Réconciliation",   label: "Réconciliation" },
    ],
    email: "Email",
    motDePasse: "Mot de passe",
    confirmerMotDePasse: "Confirmer mot de passe",
    titreMinisteres: "Ministères :",
    ministereOptions: [
      "Intercession","Louange","Technique","Communication",
      "Les Enfants","Les ados","Les jeunes","Finance",
      "Nettoyage","Conseiller","Compassion","Visite",
      "Berger","Modération",
    ],
    titreRoles: "Rôles :",
    titreCellule: "📍 Informations de la cellule",
    nomCellule: "Nom de la cellule *",
    zoneCellule: "Zone / Ville *",
    celluleMereLabel: "Cellule mère",
    celluleMereOptional: "(optionnel)",
    celluleMereInfo: "Le responsable de la cellule mère deviendra automatiquement superviseur de cette cellule.",
    aucuneCelluleMere: "-- Aucune cellule mère --",
    titreFamille: "👨‍👩‍👧 Informations de la famille",
    nomFamille: "Nom de la famille *",
    secteurFamille: "Secteur *",
    erreurNomFamille: "❌ Le nom de la famille est obligatoire.",
    erreurSecteurFamille: "❌ Le secteur est obligatoire.",
    annuler: "Annuler",
    creer: "Créer",
    creation: "Création en cours...",
    erreurMotDePasse: "❌ Les mots de passe ne correspondent pas.",
    erreurRole: "❌ Sélectionnez au moins un rôle !",
    erreurNomCellule: "❌ Le nom de la cellule est obligatoire.",
    erreurZoneCellule: "❌ La zone de la cellule est obligatoire.",
    erreurSession: "❌ Session expirée. Veuillez vous reconnecter.",
    erreurMinistere: "❌ Veuillez sélectionner au moins un ministère.",
    succes: "✅ Utilisateur créé !",
    dupPhoneMsg:    (tel, p, n) => `⚠️ Le numéro ${tel} existe déjà pour ${p} ${n}`,
    dupPhoneDetail: (tel, p, n) => `⚠️ Le numéro ${tel} existe déjà pour ${p} ${n}.`,
    dupEmailMsg:    (email, p, n) => `⚠️ L'email ${email} est déjà utilisé par ${p} ${n}`,
    dupEmailDetail: (email, p, n) => `❌ L'email ${email} est déjà utilisé par ${p} ${n}.`,
    annulerDup: "Annuler",
    continuerQuandMeme: "Continuer quand même",
    modifier: "Modifier",
  },
  en: {
    retour: "← Back",
    titre: "Create a",
    titreAccent: "User",
    intro: "Create a user by selecting an existing member or adding a new servant. Each user must be assigned at least one",
    introAccent: "role",
    roles: [
      { key: "Administrateur",            label: "Administrator",              desc: "full system management" },
      { key: "ResponsableIntegration",    label: "Integration Leader",         desc: "member management" },
      { key: "ResponsableEvangelisation", label: "Evangelization Leader",      desc: "evangelization tracking" },
      { key: "CheckInPresence",           label: "Check-in (Attendance)",      desc: "attendance management" },
      { key: "ResponsableCheckIn",        label: "Check-in Coordinator",       desc: "attendance session management" },
      { key: "ResponsableCellule",        label: "Cell Group Leader",          desc: "cell group management",    feature: "cellules" },
      { key: "SuperviseurCellule",        label: "Cell Supervisor",            desc: "cell group supervision",   feature: "cellules" },
      { key: "ResponsableFamilles",       label: "Family Leader",              desc: "family management",        feature: "familles" },
      { key: "SuperviseurFamilles",       label: "Family Supervisor",          desc: "family supervision",       feature: "familles" },
      { key: "Conseiller",                label: "Counselor",                  desc: "member accompaniment",     feature: "conseiller" },
    ],
    selectMembre: "-- Choose an existing member --",
    ajouterServiteur: "➕ Add a Servant",
    dateVenu: "Arrival Date",
    civilite: "Title",
    civiliteOptions: [
      { value: "Homme", label: "Male" },
      { value: "Femme", label: "Female" },
    ],
    prenom: "First name",
    nom: "Last name",
    telephone: "Phone",
    whatsapp: "WhatsApp number",
    ville: "City",
    age: "Age",
    ageOptions: ["12-17 yrs","18-25 yrs","26-30 yrs","31-40 yrs","41-55 yrs","56-69 yrs","70 yrs and over"],
    statut: "Status",
    statutOptions: [
      { value: "veut rejoindre l'église", label: "Wants to join the church" },
      { value: "a déjà son église",       label: "Already has a church" },
      { value: "nouveau",                 label: "New" },
      { value: "visiteur",                label: "Visitor" },
    ],
    venu: "How did they come?",
    venuOptions: [
      { value: "invité",         label: "Invited" },
      { value: "réseaux",        label: "Social media" },
      { value: "evangélisation", label: "Evangelization" },
      { value: "autre",          label: "Other" },
    ],
    priereSalut: "Salvation prayer",
    priereSalutOui: "Yes",
    priereSalutNon: "No",
    typeConversion: "Conversion type",
    typeConversionOptions: [
      { value: "Nouveau converti", label: "New convert" },
      { value: "Réconciliation",   label: "Reconciliation" },
    ],
    email: "Email",
    motDePasse: "Password",
    confirmerMotDePasse: "Confirm password",
    titreMinisteres: "Ministries:",
    ministereOptions: [
      "Intercession","Praise","Technical","Communication",
      "Children","Teens","Youth","Finance",
      "Cleaning","Counselor","Compassion","Visitation",
      "Shepherd","Moderation",
    ],
    titreRoles: "Roles:",
    titreCellule: "📍 Cell group information",
    nomCellule: "Cell group name *",
    zoneCellule: "Area / City *",
    celluleMereLabel: "Parent cell group",
    celluleMereOptional: "(optional)",
    celluleMereInfo: "The leader of the parent cell group will automatically become the supervisor of this cell group.",
    aucuneCelluleMere: "-- No parent cell group --",
    titreFamille: "👨‍👩‍👧 Family information",
    nomFamille: "Family name *",
    secteurFamille: "Sector *",
    erreurNomFamille: "❌ Family name is required.",
    erreurSecteurFamille: "❌ Sector is required.",
    annuler: "Cancel",
    creer: "Create",
    creation: "Creating...",
    erreurMotDePasse: "❌ Passwords do not match.",
    erreurRole: "❌ Please select at least one role!",
    erreurNomCellule: "❌ Cell group name is required.",
    erreurZoneCellule: "❌ Cell group area is required.",
    erreurSession: "❌ Session expired. Please log in again.",
    erreurMinistere: "❌ Please select at least one ministry.",
    succes: "✅ User created!",
    dupPhoneMsg:    (tel, p, n) => `⚠️ The number ${tel} already exists for ${p} ${n}`,
    dupPhoneDetail: (tel, p, n) => `⚠️ The number ${tel} already exists for ${p} ${n}.`,
    dupEmailMsg:    (email, p, n) => `⚠️ The email ${email} is already used by ${p} ${n}`,
    dupEmailDetail: (email, p, n) => `❌ The email ${email} is already used by ${p} ${n}.`,
    annulerDup: "Cancel",
    continuerQuandMeme: "Continue anyway",
    modifier: "Edit",
  },
};

// ─── Helper: valeur initiale du formulaire ───
const initialFormData = () => ({
  date_venu: new Date().toISOString().slice(0, 10),
  sexe: "",
  prenom: "",
  nom: "",
  telephone: "",
  is_whatsapp: false,
  ville: "",
  age: "",
  statut: "",
  venu: "",
  priere_salut: "",
  type_conversion: "",
  email: "",
  password: "",
  confirmPassword: "",
  roles: [],
  ministere: [],
  cellule_nom: "",
  cellule_zone: "",
  cellule_mere_id: "",
  famille_nom: "",       // ← NOUVEAU
  famille_secteur: "",   // ← NOUVEAU
});

export default function CreateInternalUserPage() {
  return (
    <ProtectedRoute>
      <CreateInternalUserContent />
    </ProtectedRoute>
  );
}

function CreateInternalUserContent() {
  const { lang } = useLang();
  const t = translations[lang];
  const [phonePrefix, setPhonePrefix] = useState("");
  const cellulesActive   = useFeature("cellules");
  const conseillerActive = useFeature("conseiller");
  const famillesActive   = useFeature("familles");
  const router = useRouter();

  const [members, setMembers]                   = useState([]);
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [duplicatePhone, setDuplicatePhone]     = useState(null);
  const [duplicateEmail, setDuplicateEmail]     = useState(null);
  const [message, setMessage]                   = useState("");
  const [loading, setLoading]                   = useState(false);
  const [rolesToHide, setRolesToHide]           = useState([]);
  const [cellules, setCellules]                 = useState([]);

  const [formData, setFormData] = useState(initialFormData());

  // ─── Navigation logo ───
  const handleLogoClick = () => {
    if (!formData.roles || formData.roles.length === 0) { router.push("/index"); return; }
    if (formData.roles.length > 1) { router.push("/index"); return; }
    const role = formData.roles[0];
    if (role === "ResponsableCellule" || role === "SuperviseurCellule") router.push("/cellule/cellules-hub");
    else if (role === "ResponsableFamilles")       router.push("/famille/familles-hub");
    else if (role === "Conseiller")                router.push("/conseiller/conseiller-hub");
    else if (role === "ResponsableEvangelisation") router.push("/evangelisation/evangelisation-hub");
    else if (role === "ResponsableIntegration")    router.push("/membres/membres-hub");
    else router.push("/index");
  };

  // ─── Rôles filtrés par feature ───
  const allRoles = useMemo(() => {
    const featureMap = { cellules: cellulesActive, familles: famillesActive, conseiller: conseillerActive };
    return t.roles.filter(r => !r.feature || featureMap[r.feature]);
  }, [String(cellulesActive), String(conseillerActive), String(famillesActive), lang]);

  // ─── Fetch membres + cellules ───
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;

        const { data: profile } = await supabase
          .from("profiles")
          .select("eglise_id")
          .eq("id", session.user.id)
          .single();

        if (!profile) return;

        const { data: cellulesData } = await supabase
          .from("cellules")
          .select("id, cellule_full, cellule, ville, responsable")
          .eq("eglise_id", profile.eglise_id)
          .order("cellule_full");

        setCellules(cellulesData || []);

       const { data: membersData } = await supabase
        .from("membres_complets")
        .select("id, prenom, nom, sexe, telephone, is_whatsapp, ville, etat_contact, email")
        .eq("star", true)
        .eq("eglise_id", profile.eglise_id)
        .in("etat_contact", ["existant"]);

        setMembers(membersData || []);
      } catch (err) {
        console.error("Erreur fetchData:", err);
      }
    };
    fetchData();
  }, []);

  // ─── Prefix ───
    useEffect(() => {
      const fetchPrefix = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;
    
        const { data: profile } = await supabase
          .from("profiles")
          .select("eglise_id")
          .eq("id", session.user.id)
          .single();
    
        if (!profile?.eglise_id) return;
    
        const { data: eglise } = await supabase
          .from("eglises")
          .select("pays")
          .eq("id", profile.eglise_id)
          .single();
    
        if (eglise?.pays) {
          const prefix = getPrefixForPays(eglise.pays);
          if (prefix) {
            setPhonePrefix(prefix);
            setFormData(prev => ({
              ...prev,
              telephone: prev.telephone || prefix,
            }));
          }
        }
      };  // ← fermeture de fetchPrefix
      fetchPrefix();
    }, []);

  // ─── Pré-remplissage membre sélectionné ───
  useEffect(() => {
    if (!selectedMemberId || selectedMemberId === "add-serviteur") {
      setFormData(prev => ({
        ...initialFormData(),
        telephone: phonePrefix,
        email: prev.email,
        password: prev.password,
        confirmPassword: prev.confirmPassword,
      }));
      setRolesToHide([]);
      return;
    }

    const member = members.find(m => m.id === selectedMemberId);
    if (member) {
      setFormData(prev => ({
        ...prev,
        prenom:      member.prenom      || "",
        nom:         member.nom         || "",
        sexe:        member.sexe        || "",
        telephone:   member.telephone   || "",
        is_whatsapp: member.is_whatsapp ?? false,
        ville:       member.ville       || "",
        email: member.email || "",
        password:        "",
        confirmPassword: "",
        roles: [],
        famille_nom:     "",
        famille_secteur: "",
      }));

      const checkExistingRoles = async () => {
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("roles")
          .eq("prenom", member.prenom)
          .eq("nom", member.nom)
          .eq("telephone", member.telephone);

        let hide = [];
        profilesData?.forEach(p => { if (p.roles?.length) hide.push(...p.roles); });
        setRolesToHide([...new Set(hide)]);
      };
      checkExistingRoles();
    }
  }, [selectedMemberId, members]);

  // ─── Handlers génériques ───
  const handleChange = e =>
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleRoleChange = role => {
    setFormData(prev => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter(r => r !== role)
        : [...prev.roles, role],
      ...(role === "ResponsableCellule" && prev.roles.includes(role)
        ? { cellule_nom: "", cellule_zone: "", cellule_mere_id: "" }
        : {}),
      // ← NOUVEAU : reset champs famille si on décoche ResponsableFamilles
      ...(role === "ResponsableFamilles" && prev.roles.includes(role)
        ? { famille_nom: "", famille_secteur: "" }
        : {}),
    }));
  };

  const handleMinistereChange = m => {
    setFormData(prev => ({
      ...prev,
      ministere: prev.ministere.includes(m)
        ? prev.ministere.filter(x => x !== m)
        : [...prev.ministere, m],
    }));
  };

  // ─── Soumission ───
  const submitForm = async (forceCreate = false) => {
  if (formData.password !== formData.confirmPassword) {
    setMessage(t.erreurMotDePasse);
    return;
  }
  if (!formData.roles || formData.roles.length === 0) {
    setMessage(t.erreurRole);
    return;
  }

  // ✅ AJOUTER ICI
  if (isNewServant && formData.ministere.length === 0) {
    setMessage(t.erreurMinistere);
    return;
  }

  if (formData.roles.includes("ResponsableCellule")) {
    if (!formData.cellule_nom?.trim()) { setMessage(t.erreurNomCellule); return; }
    if (!formData.cellule_zone?.trim()) { setMessage(t.erreurZoneCellule); return; }
  }

    setLoading(true);
    setMessage("");

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setMessage(t.erreurSession); return; }

      // 1️⃣ Vérification téléphone (nouveau serviteur seulement)
      if (selectedMemberId === "add-serviteur" && formData.telephone && !forceCreate) {
        const { data: existingMembers } = await supabase
          .from("membres_complets")
          .select("prenom, nom, telephone")
          .eq("telephone", formData.telephone)
          .in("etat_contact", ["existant", "nouveau"]);

        if (existingMembers?.length > 0) {
          const existing = existingMembers[0];
          setDuplicatePhone(existing);
          setMessage(t.dupPhoneMsg(formData.telephone, existing.prenom, existing.nom));
          return;
        }
      }

      // 2️⃣ Vérification email
      if (!forceCreate) {
        const { data: existingUsers } = await supabase
          .from("profiles")
          .select("id, email, prenom, nom")
          .eq("email", formData.email);

        if (existingUsers?.length > 0) {
          const existing = existingUsers[0];
          setDuplicateEmail(existing);
          setMessage(t.dupEmailMsg(formData.email, existing.prenom, existing.nom));
          return;
        }
      }

      // 3️⃣ Appel API
      const res = await fetch("/api/create-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          ...formData,
          member_id: selectedMemberId,
          ministeresSelected: formData.ministere,
          famille_nom: formData.famille_nom,           // ← NOUVEAU
          famille_secteur: formData.famille_secteur,   // ← NOUVEAU
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(`❌ ${data?.error ?? "Erreur inconnue du serveur"}`);
        return;
      }

      setMessage(t.succes);
      setDuplicatePhone(null);
      setDuplicateEmail(null);
      setFormData({ ...initialFormData(), telephone: phonePrefix });
      setSelectedMemberId("");

    } catch (err) {
      setMessage("❌ " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    submitForm(false);
  };

  const handleCancel = () => router.back();

   // ✅ Téléphone avec préfixe modifiable
  const handlePhoneChange = (e) => {
  const val = e.target.value;

  setFormData(prev => ({
    ...prev,
    telephone: val,
  }));
};

  // ─── Flags d'affichage ───
  const isExistingMember  = !!selectedMemberId && selectedMemberId !== "add-serviteur";
  const isNewServant      = selectedMemberId === "add-serviteur";
  const showMemberFields  = isExistingMember || isNewServant;
  const showCelluleFields = !!cellulesActive && formData.roles.includes("ResponsableCellule");
  const showFamilleFields = !!famillesActive && formData.roles.includes("ResponsableFamilles"); // ← NOUVEAU

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-br from-purple-200 via-pink-100 to-yellow-200 p-6">
      <div className="bg-white p-8 rounded-3xl shadow-lg w-full max-w-md relative">

        <button onClick={() => router.back()} className="absolute top-4 left-4 text-gray-700 hover:text-gray-900">
          {t.retour}
        </button>

        <div className="flex justify-center mb-6 cursor-pointer" onClick={handleLogoClick}>
          <Image src="/logo.png" alt="Logo SoulTrack" width={40} height={40} className="cursor-pointer hover:opacity-80 transition" />
        </div>

        <h1 className="text-2xl font-bold mt-4 mb-6 text-center text-black">
          {t.titre} <br /><span className="text-[#333699]">{t.titreAccent}</span>
        </h1>

        {/* Description des rôles */}
        <div className="w-full mb-6 text-center space-y-3">
          <p className="italic text-base text-black/90">
            {t.intro}{" "}
            <span className="text-[#FFB07C] font-semibold">{t.introAccent}</span>.
          </p>
          <div className="italic text-sm text-black/90 space-y-1 text-left">
            {t.roles
              .filter(r => {
                if (!r.feature) return true;
                if (r.feature === "cellules")   return cellulesActive;
                if (r.feature === "familles")   return famillesActive;
                if (r.feature === "conseiller") return conseillerActive;
                return true;
              })
              .map(r => (
                <p key={r.key}>
                  • {r.label} – <span className="text-[#FFB07C] font-semibold">{r.desc}</span>
                </p>
              ))
            }
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {/* ── Sélecteur membre ── */}
          <select
            value={selectedMemberId}
            onChange={e => setSelectedMemberId(e.target.value)}
            className="input"
            required
          >
            <option value="">{t.selectMembre}</option>
            {members.map(m => (
              <option key={m.id} value={m.id}>{m.prenom} {m.nom}</option>
            ))}
            <option value="add-serviteur">{t.ajouterServiteur}</option>
          </select>

          {/* ══════════════════════════════════════════
              CHAMPS COMMUNS (membre existant + nouveau serviteur)
          ══════════════════════════════════════════ */}
          {showMemberFields && (
            <>
              {/* Civilité */}
              <label className="text-sm font-semibold">{t.civilite}</label>
              <select
                name="sexe"
                value={formData.sexe}
                onChange={handleChange}
                className="input"
                required
              >
                <option value="">-- {t.civilite} --</option>
                {t.civiliteOptions.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>

              {/* Prénom */}
              <label className="text-sm font-semibold">{t.prenom}</label>
              <input
                name="prenom"
                placeholder={t.prenom}
                value={formData.prenom}
                onChange={handleChange}
                className="input"
                required
              />

              {/* Nom */}
              <label className="text-sm font-semibold">{t.nom}</label>
              <input
                name="nom"
                placeholder={t.nom}
                value={formData.nom}
                onChange={handleChange}
                className="input"
                required
              />

              {/* Téléphone */}
              <label className="text-sm font-semibold">{t.telephone}</label>
                <input
                  type="tel"
                  value={formData.telephone}
                  onChange={e => setFormData(prev => ({ ...prev, telephone: e.target.value }))}
                  className="input"
                  placeholder={t.telephone}
                  required
                />
              {/* WhatsApp */}
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={formData.is_whatsapp}
                  onChange={e => setFormData(prev => ({ ...prev, is_whatsapp: e.target.checked }))}
                />
                {t.whatsapp}
              </label>

              {/* Ville */}
              <label className="text-sm font-semibold">{t.ville}</label>
              <input
                name="ville"
                placeholder={t.ville}
                value={formData.ville}
                onChange={handleChange}
                className="input"
              />
            </>
          )}

          {/* ══════════════════════════════════════════
              CHAMPS NOUVEAU SERVITEUR UNIQUEMENT
          ══════════════════════════════════════════ */}
          {isNewServant && (
            <>
              {/* Date de venue */}
              <label className="text-sm font-semibold">{t.dateVenu}</label>
              <input
                type="date"
                name="date_venu"
                value={formData.date_venu}
                onChange={handleChange}
                className="input"
                required
              />

              {/* Âge */}
              <label className="text-sm font-semibold">{t.age}</label>
              <select
                name="age"
                value={formData.age}
                onChange={handleChange}
                className="input"
                required
              >
                <option value="">-- {t.age} --</option>
                {t.ageOptions.map(v => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>

              {/* Statut */}
              <label className="text-sm font-semibold">{t.statut}</label>
              <select
                name="statut"
                value={formData.statut}
                onChange={handleChange}
                className="input"
                required
              >
                <option value="">-- {t.statut} --</option>
                {t.statutOptions.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>

              {/* Comment venu */}
              <label className="text-sm font-semibold">{t.venu}</label>
              <select
                name="venu"
                value={formData.venu}
                onChange={handleChange}
                className="input"
                required
              >
                <option value="">-- {t.venu} --</option>
                {t.venuOptions.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>

              {/* Prière du salut */}
              <label className="text-sm font-semibold">{t.priereSalut}</label>
              <select
                name="priere_salut"
                value={formData.priere_salut}
                onChange={e => setFormData(prev => ({
                  ...prev,
                  priere_salut: e.target.value,
                  type_conversion: e.target.value === "Oui" ? prev.type_conversion : "",
                }))}
                className="input"
                required
              >
                <option value="">-- {t.priereSalut} --</option>
                <option value="Oui">{t.priereSalutOui}</option>
                <option value="Non">{t.priereSalutNon}</option>
              </select>

              {/* Type de conversion (conditionnel) */}
              {formData.priere_salut === "Oui" && (
                <>
                  <label className="text-sm font-semibold">{t.typeConversion}</label>
                  <select
                    name="type_conversion"
                    value={formData.type_conversion}
                    onChange={handleChange}
                    className="input"
                    required
                  >
                    <option value="">-- {t.typeConversion} --</option>
                    {t.typeConversionOptions.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </>
              )}

              {/* Ministères */}
              <div className="flex flex-col gap-2">
                <label className="font-semibold">{t.titreMinisteres}</label>
                {t.ministereOptions.map(m => (
                  <label key={m} className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.ministere.includes(m)}
                      onChange={() => handleMinistereChange(m)}
                    />
                    {m}
                  </label>
                ))}
              </div>
            </>
          )}

          {/* ══════════════════════════════════════════
              COMPTE + RÔLES (commun aux deux modes)
          ══════════════════════════════════════════ */}
          {showMemberFields && (
            <>
              {/* Email */}
              <label className="text-sm font-semibold">{t.email}</label>
              <input
                name="email"
                placeholder={t.email}
                value={formData.email}
                onChange={handleChange}
                className="input"
                required
              />

              {/* Mot de passe */}
              <label className="text-sm font-semibold">{t.motDePasse}</label>
              <input
                name="password"
                placeholder={t.motDePasse}
                type="password"
                value={formData.password}
                onChange={handleChange}
                className="input"
                required
              />

              {/* Confirmer mot de passe */}
              <label className="text-sm font-semibold">{t.confirmerMotDePasse}</label>
              <input
                name="confirmPassword"
                placeholder={t.confirmerMotDePasse}
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="input"
                required
              />

              {/* Rôles */}
              <div className="flex flex-col gap-2">
                <label className="font-semibold">{t.titreRoles}</label>
                {allRoles
                  .filter(role =>
                    role.key === "ResponsableCellule"
                      ? true
                      : !rolesToHide.includes(role.key)
                  )
                  .map(role => (
                    <label key={role.key} className="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.roles.includes(role.key)}
                        onChange={() => handleRoleChange(role.key)}
                      />
                      {role.label}
                    </label>
                  ))
                }
              </div>
            </>
          )}

          {/* ── Infos cellule (ResponsableCellule seulement) ── */}
          {showCelluleFields && (
            <div className="flex flex-col gap-3 p-4 bg-blue-50 rounded-2xl border border-blue-200">
              <p className="font-semibold text-[#333699]">{t.titreCellule}</p>

              <input
                name="cellule_nom"
                placeholder={t.nomCellule}
                value={formData.cellule_nom}
                onChange={handleChange}
                className="input"
              />
              <input
                name="cellule_zone"
                placeholder={t.zoneCellule}
                value={formData.cellule_zone}
                onChange={handleChange}
                className="input"
              />

              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-700">
                  {t.celluleMereLabel}{" "}
                  <span className="text-gray-400 font-normal">{t.celluleMereOptional}</span>
                </label>
                <p className="text-xs text-gray-500">{t.celluleMereInfo}</p>
                <select
                  name="cellule_mere_id"
                  value={formData.cellule_mere_id}
                  onChange={handleChange}
                  className="input"
                >
                  <option value="">{t.aucuneCelluleMere}</option>
                  {cellules.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.ville} - {c.cellule} ({c.responsable})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* ── Infos famille (ResponsableFamilles seulement) ── */}
          {/* ← NOUVEAU BLOC */}
          {showFamilleFields && (
            <div className="flex flex-col gap-3 p-4 bg-green-50 rounded-2xl border border-green-200">
              <p className="font-semibold text-green-700">{t.titreFamille}</p>
              <input
                name="famille_nom"
                placeholder={t.nomFamille}
                value={formData.famille_nom}
                onChange={handleChange}
                className="input"
              />
              <input
                name="famille_secteur"
                placeholder={t.secteurFamille}
                value={formData.famille_secteur}
                onChange={handleChange}
                className="input"
              />
            </div>
          )}

          {/* ── Boutons ── */}
          <div className="flex gap-4 mt-4">
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading || !!duplicatePhone}
              className={`flex-1 py-3 rounded-xl text-white ${
                loading || duplicatePhone ? "bg-gray-300 cursor-not-allowed" : "bg-gray-400 hover:bg-gray-500"
              }`}
            >
              {t.annuler}
            </button>
            <button
              type="submit"
              disabled={loading || !!duplicatePhone || !!duplicateEmail}
              className={`flex-1 py-3 rounded-xl text-white font-semibold ${
                loading || duplicatePhone || duplicateEmail
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-[#333699] hover:bg-blue-800"
              }`}
            >
              {loading ? t.creation : t.creer}
            </button>
          </div>
        </form>

        {/* ── Doublon téléphone ── */}
        {duplicatePhone && (
          <div className="mt-4 p-4 border border-yellow-500 bg-yellow-100 rounded-lg text-center">
            <p>{t.dupPhoneDetail(formData.telephone, duplicatePhone.prenom, duplicatePhone.nom)}</p>
            <div className="flex justify-center gap-4 mt-2">
              <button
                type="button"
                onClick={() => { setDuplicatePhone(null); setMessage(""); }}
                className="bg-gray-500 text-white py-2 px-4 rounded"
              >
                {t.annulerDup}
              </button>
              <button
                type="button"
                onClick={() => { setDuplicatePhone(null); submitForm(true); }}
                className="bg-green-500 text-white py-2 px-4 rounded"
              >
                {t.continuerQuandMeme}
              </button>
            </div>
          </div>
        )}

        {/* ── Doublon email ── */}
        {duplicateEmail && (
          <div className="mt-4 p-4 border border-red-500 bg-red-100 rounded-lg text-center">
            <p>{t.dupEmailDetail(formData.email, duplicateEmail.prenom, duplicateEmail.nom)}</p>
            <div className="flex justify-center gap-4 mt-2">
              <button
                type="button"
                onClick={() => { setDuplicateEmail(null); setMessage(""); }}
                className="bg-gray-500 text-white py-2 px-4 rounded"
              >
                {t.modifier}
              </button>
            </div>
          </div>
        )}

        {/* ── Message global ── */}
        {message && !duplicatePhone && !duplicateEmail && (
          <p className={`mt-4 text-center font-semibold ${
            message.startsWith("❌") ? "text-red-600"
            : message.startsWith("⚠️") ? "text-yellow-600"
            : "text-green-600"
          }`}>
            {message}
          </p>
        )}

        <style jsx>{`
          .input {
            width: 100%;
            border: 1px solid #ccc;
            border-radius: 12px;
            padding: 12px;
            color: black;
            background: white;
          }
        `}</style>
      </div>
    </div>
  );
}
