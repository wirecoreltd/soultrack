"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import supabase from "../../lib/supabaseClient";
import Image from "next/image";
import ProtectedRoute from "../../components/ProtectedRoute";
import { useFeature } from "../../components/FeaturesContext";
import { useLang } from "../../hooks/useLang";

const translations = {
  fr: {
    // En-tête
    retour: "← Retour",
    titre: "Créer un",
    titreAccent: "Utilisateur",

    // Intro
    intro: "Créez un utilisateur en sélectionnant un membre existant ou en ajoutant un nouveau serviteur. Chaque utilisateur doit se voir attribuer au moins un",
    introAccent: "rôle",
    roles: [
      { key: "Administrateur",            label: "Administrateur",                desc: "gestion complète du système" },
      { key: "ResponsableIntegration",    label: "Responsable Intégration",       desc: "gestion des membres" },
      { key: "ResponsableEvangelisation", label: "Responsable Évangélisation",    desc: "suivi de l'évangélisation" },
      { key: "ResponsableCellule",        label: "Responsable Cellule",           desc: "gestion des cellules",           feature: "cellules" },
      { key: "SuperviseurCellule",        label: "Superviseur Cellule",           desc: "supervision des cellules",       feature: "cellules" },
      { key: "ResponsableFamilles",       label: "Responsable Familles",          desc: "gestion des familles",           feature: "familles" },
      { key: "SuperviseurFamilles",       label: "Superviseur Familles",          desc: "supervision des familles",       feature: "familles" },
      { key: "Conseiller",                label: "Conseiller",                    desc: "accompagnement des membres",     feature: "conseiller" },
    ],

    // Formulaire — sélecteur membre
    selectMembre: "-- Choisir un membre existant --",
    ajouterServiteur: "➕ Ajouter un Serviteur",

    // Champs
    civilite: "Civilité",
    prenom: "Prénom",
    nom: "Nom",
    telephone: "Téléphone",
    email: "Email",
    motDePasse: "Mot de passe",
    confirmerMotDePasse: "Confirmer mot de passe",

    // Ministères
    titreMinisteres: "Ministères :",
    ministereOptions: [
      "Intercession", "Louange", "Technique", "Communication",
      "Les Enfants", "Les ados", "Les jeunes", "Finance",
      "Nettoyage", "Conseiller", "Compassion", "Visite",
      "Berger", "Modération",
    ],

    // Rôles
    titreRoles: "Rôles :",

    // Cellule
    titreCellule: "📍 Informations de la cellule",
    nomCellule: "Nom de la cellule *",
    zoneCellule: "Zone / Ville *",
    celluleMereLabel: "Cellule mère",
    celluleMereOptional: "(optionnel)",
    celluleMereInfo: "Le responsable de la cellule mère deviendra automatiquement superviseur de cette cellule.",
    aucuneCelluleMere: "-- Aucune cellule mère --",

    // Boutons
    annuler: "Annuler",
    creer: "Créer",
    creation: "Création en cours...",

    // Messages
    erreurMotDePasse: "❌ Les mots de passe ne correspondent pas.",
    erreurRole: "❌ Sélectionnez au moins un rôle !",
    erreurNomCellule: "❌ Le nom de la cellule est obligatoire.",
    erreurZoneCellule: "❌ La zone de la cellule est obligatoire.",
    erreurSession: "❌ Session expirée. Veuillez vous reconnecter.",
    succes: "✅ Utilisateur créé !",

    // Doublons
    dupPhoneMsg: (tel, prenom, nom) => `⚠️ Le numéro ${tel} existe déjà pour ${prenom} ${nom}`,
    dupPhoneDetail: (tel, prenom, nom) => `⚠️ Le numéro ${tel} existe déjà pour ${prenom} ${nom}.`,
    dupEmailMsg: (email, prenom, nom) => `⚠️ L'email ${email} est déjà utilisé par ${prenom} ${nom}`,
    dupEmailDetail: (email, prenom, nom) => `❌ L'email ${email} est déjà utilisé par ${prenom} ${nom}.`,
    annulerDup: "Annuler",
    continuerQuandMeme: "Continuer quand même",
    modifier: "Modifier",
  },
  en: {
    // En-tête
    retour: "← Back",
    titre: "Create a",
    titreAccent: "User",

    // Intro
    intro: "Create a user by selecting an existing member or adding a new servant. Each user must be assigned at least one",
    introAccent: "role",
    roles: [
      { key: "Administrateur",            label: "Administrator",                 desc: "full system management" },
      { key: "ResponsableIntegration",    label: "Integration Leader",            desc: "member management" },
      { key: "ResponsableEvangelisation", label: "Evangelization Leader",         desc: "evangelization tracking" },
      { key: "ResponsableCellule",        label: "Cell Group Leader",             desc: "cell group management",          feature: "cellules" },
      { key: "SuperviseurCellule",        label: "Cell Supervisor",               desc: "cell group supervision",         feature: "cellules" },
      { key: "ResponsableFamilles",       label: "Family Leader",                 desc: "family management",              feature: "familles" },
      { key: "SuperviseurFamilles",       label: "Family Supervisor",             desc: "family supervision",             feature: "familles" },
      { key: "Conseiller",                label: "Counselor",                     desc: "member accompaniment",           feature: "conseiller" },
    ],

    // Formulaire — sélecteur membre
    selectMembre: "-- Choose an existing member --",
    ajouterServiteur: "➕ Add a Servant",

    // Champs
    civilite: "Title",
    prenom: "First name",
    nom: "Last name",
    telephone: "Phone",
    email: "Email",
    motDePasse: "Password",
    confirmerMotDePasse: "Confirm password",

    // Ministères
    titreMinisteres: "Ministries:",
    ministereOptions: [
      "Intercession", "Praise", "Technical", "Communication",
      "Children", "Teens", "Youth", "Finance",
      "Cleaning", "Counselor", "Compassion", "Visitation",
      "Shepherd", "Moderation",
    ],

    // Rôles
    titreRoles: "Roles:",

    // Cellule
    titreCellule: "📍 Cell group information",
    nomCellule: "Cell group name *",
    zoneCellule: "Area / City *",
    celluleMereLabel: "Parent cell group",
    celluleMereOptional: "(optional)",
    celluleMereInfo: "The leader of the parent cell group will automatically become the supervisor of this cell group.",
    aucuneCelluleMere: "-- No parent cell group --",

    // Boutons
    annuler: "Cancel",
    creer: "Create",
    creation: "Creating...",

    // Messages
    erreurMotDePasse: "❌ Passwords do not match.",
    erreurRole: "❌ Please select at least one role!",
    erreurNomCellule: "❌ Cell group name is required.",
    erreurZoneCellule: "❌ Cell group area is required.",
    erreurSession: "❌ Session expired. Please log in again.",
    succes: "✅ User created!",

    // Doublons
    dupPhoneMsg: (tel, prenom, nom) => `⚠️ The number ${tel} already exists for ${prenom} ${nom}`,
    dupPhoneDetail: (tel, prenom, nom) => `⚠️ The number ${tel} already exists for ${prenom} ${nom}.`,
    dupEmailMsg: (email, prenom, nom) => `⚠️ The email ${email} is already used by ${prenom} ${nom}`,
    dupEmailDetail: (email, prenom, nom) => `❌ The email ${email} is already used by ${prenom} ${nom}.`,
    annulerDup: "Cancel",
    continuerQuandMeme: "Continue anyway",
    modifier: "Edit",
  },
};

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

  const [formData, setFormData] = useState({
    prenom: "", nom: "", sexe: "", email: "",
    password: "", confirmPassword: "", telephone: "",
    roles: [], cellule_nom: "", cellule_zone: "",
    cellule_mere_id: "", ministere: [],
  });

  const handleLogoClick = () => {
    if (!formData.roles || formData.roles.length === 0) { router.push("/index"); return; }
    if (formData.roles.length > 1) { router.push("/index"); return; }

    const role = formData.roles[0];
    if (role === "ResponsableCellule" || role === "SuperviseurCellule") {
      router.push("/cellule/cellules-hub");
    } else if (role === "ResponsableFamilles") {
      router.push("/famille/familles-hub");
    } else if (role === "Conseiller") {
      router.push("/conseiller/conseiller-hub");
    } else if (role === "ResponsableEvangelisation") {
      router.push("/evangelisation/evangelisation-hub");
    } else if (role === "ResponsableIntegration") {
      router.push("/membres/membres-hub");
    } else {
      router.push("/index");
    }
  };

  // Construire allRoles à partir des translations + features
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
          .select("id, prenom, nom, sexe, telephone, etat_contact")
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

  // ─── Pré-remplissage membre sélectionné ───
  useEffect(() => {
    if (!selectedMemberId || selectedMemberId === "add-serviteur") {
      setFormData(prev => ({
        ...prev,
        prenom: "", nom: "", sexe: "", telephone: "",
        roles: [], ministere: [],
      }));
      setRolesToHide([]);
      return;
    }

    const member = members.find(m => m.id === selectedMemberId);
    if (member) {
      setFormData(prev => ({
        ...prev,
        prenom: member.prenom,
        nom: member.nom,
        sexe: member.sexe,
        telephone: member.telephone,
        roles: [],
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
    if (formData.roles.includes("ResponsableCellule")) {
      if (!formData.cellule_nom?.trim()) {
        setMessage(t.erreurNomCellule);
        return;
      }
      if (!formData.cellule_zone?.trim()) {
        setMessage(t.erreurZoneCellule);
        return;
      }
    }

    setLoading(true);
    setMessage("");

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setMessage(t.erreurSession);
        return;
      }

      // 1️⃣ Vérification téléphone
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
      setFormData({
        prenom: "", nom: "", sexe: "", email: "",
        password: "", confirmPassword: "", telephone: "",
        roles: [], cellule_nom: "", cellule_zone: "",
        cellule_mere_id: "", ministere: [],
      });
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

  const showCelluleFields =
    !!cellulesActive &&
    formData.roles.includes("ResponsableCellule");

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-br from-purple-200 via-pink-100 to-yellow-200 p-6">
      <div className="bg-white p-8 rounded-3xl shadow-lg w-full max-w-md relative">

        <button onClick={() => router.back()} className="absolute top-4 left-4 text-gray-700 hover:text-gray-900">
          {t.retour}
        </button>

        <div className="flex justify-center mb-6 cursor-pointer" onClick={() => router.push("/index")}>
          <Image src="/logo.png" alt="Logo SoulTrack" className="w-10 h-auto cursor-pointer hover:opacity-80 transition" onClick={handleLogoClick} />
        </div>

        <h1 className="text-2xl font-bold mt-4 mb-6 text-center text-black">
          {t.titre} <br /><span className="text-[#333699]">{t.titreAccent}</span>
        </h1>

        <div className="max-w-3xl w-full mb-6 text-center space-y-3">
          <p className="italic text-base text-black/90">
            {t.intro}{" "}
            <span className="text-[#FFB07C] font-semibold">{t.introAccent}</span>.
          </p>
          <div className="italic text-sm text-black/90 space-y-1 text-left">
            {t.roles
              .filter(r => {
                if (!r.feature) return true;
                if (r.feature === "cellules") return cellulesActive;
                if (r.feature === "familles") return famillesActive;
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

          {(selectedMemberId === "add-serviteur" || selectedMemberId) && (
            <>
              <input name="sexe" placeholder={t.civilite} value={formData.sexe} onChange={handleChange} className="input" required />
              <input name="prenom" placeholder={t.prenom} value={formData.prenom} onChange={handleChange} className="input" required />
              <input name="nom" placeholder={t.nom} value={formData.nom} onChange={handleChange} className="input" required />
              <input name="telephone" placeholder={t.telephone} value={formData.telephone} onChange={handleChange} className="input" required />
            </>
          )}

          {selectedMemberId === "add-serviteur" && (
            <div className="flex flex-col gap-2">
              <label className="font-semibold">{t.titreMinisteres}</label>
              {t.ministereOptions.map(m => (
                <label key={m} className="inline-flex items-center gap-2">
                  <input type="checkbox" checked={formData.ministere.includes(m)} onChange={() => handleMinistereChange(m)} />
                  {m}
                </label>
              ))}
            </div>
          )}

          <input name="email" placeholder={t.email} value={formData.email} onChange={handleChange} className="input" required />
          <input name="password" placeholder={t.motDePasse} type="password" value={formData.password} onChange={handleChange} className="input" required />
          <input name="confirmPassword" placeholder={t.confirmerMotDePasse} type="password" value={formData.confirmPassword} onChange={handleChange} className="input" required />

          {(selectedMemberId === "add-serviteur" || selectedMemberId) && (
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
          )}

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

          <div className="flex gap-4 mt-4">
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading || !!duplicatePhone}
              className={`flex-1 py-3 rounded-xl text-white ${loading || duplicatePhone ? "bg-gray-300 cursor-not-allowed" : "bg-gray-400 hover:bg-gray-500"}`}
            >
              {t.annuler}
            </button>
            <button
              type="submit"
              disabled={loading || !!duplicatePhone || !!duplicateEmail}
              className={`flex-1 py-3 rounded-xl text-white font-semibold ${loading || duplicatePhone || duplicateEmail ? "bg-gray-300 cursor-not-allowed" : "bg-[#333699] hover:bg-blue-800"}`}
            >
              {loading ? t.creation : t.creer}
            </button>
          </div>
        </form>

        {duplicatePhone && (
          <div className="mt-4 p-4 border border-yellow-500 bg-yellow-100 rounded-lg text-center">
            <p>{t.dupPhoneDetail(formData.telephone, duplicatePhone.prenom, duplicatePhone.nom)}</p>
            <div className="flex justify-center gap-4 mt-2">
              <button type="button" onClick={() => { setDuplicatePhone(null); setMessage(""); }} className="bg-gray-500 text-white py-2 px-4 rounded">
                {t.annulerDup}
              </button>
              <button type="button" onClick={() => { setDuplicatePhone(null); submitForm(true); }} className="bg-green-500 text-white py-2 px-4 rounded">
                {t.continuerQuandMeme}
              </button>
            </div>
          </div>
        )}

        {duplicateEmail && (
          <div className="mt-4 p-4 border border-red-500 bg-red-100 rounded-lg text-center">
            <p>{t.dupEmailDetail(formData.email, duplicateEmail.prenom, duplicateEmail.nom)}</p>
            <div className="flex justify-center gap-4 mt-2">
              <button type="button" onClick={() => { setDuplicateEmail(null); setMessage(""); }} className="bg-gray-500 text-white py-2 px-4 rounded">
                {t.modifier}
              </button>
            </div>
          </div>
        )}

        {message && !duplicatePhone && !duplicateEmail && (
          <p className={`mt-4 text-center font-semibold ${message.startsWith("❌") ? "text-red-600" : message.startsWith("⚠️") ? "text-yellow-600" : "text-green-600"}`}>
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
