// ═══════════════════════════════════════════════════════════════
// PAGE : Création d'un Conseiller (CreateConseillerPage)
// ═══════════════════════════════════════════════════════════════
// Description : Permet à un Administrateur ou Responsable Intégration
// de transformer un membre "star" (serviteur disponible) en Conseiller.
// Sélection du membre, saisie email/mot de passe, et création du
// compte via l'API interne /api/create-conseiller.
//
// Tables Supabase utilisées :
// - profiles           (lecture)  → profil du responsable connecté
// - membres_complets   (lecture)  → membres "star" disponibles
// - profiles           (lecture)  → conseillers existants (filtrage)
//
// API interne : /api/create-conseiller (POST) → création du compte
// ═══════════════════════════════════════════════════════════════

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import supabase from "../../lib/supabaseClient";
import Image from "next/image";
import ProtectedRoute from "../../components/ProtectedRoute";
import Footer from "../../components/Footer";
import { useLang } from "../../hooks/useLang";

const translations = {
  fr: {
    mustBeConnected: "❌ Vous devez être connecté",
    sessionError: "Erreur session :",
    profileError: "Erreur profil :",
    membersError: "Erreur membres :",
    conseillersError: "Erreur conseillers :",
    fetchError: "Erreur fetchUserAndMembers :",
    fillFields: "❌ Remplissez tous les champs !",
    creating: "⏳ Création en cours...",
    success: "✅ Conseiller créé avec succès !",
    emptyServer: "Réponse vide du serveur",
    error: "❌ Erreur:",
    back: "← Retour",
    title: "Créer un",
    conseiller: "Conseiller",
    description1: "Transformez ",
    description2: "un serviteur disponible en ",
    description3: "Conseiller ",
    description4: "au sein de votre équipe. Remplissez ses ",
    description5: "informations",
    description6: ", assignez-lui un rôle et un mot de passe ",
    description7: "sécurisé",
    description8:
      ". Chaque création est guidée pour que le Conseiller commence ",
    description9: "son rôle en toute sérénité",
    chooseServiteur: "-- Choisir un Serviteur --",
    noServiteur: "Aucun serviteur disponible",
    prenom: "Prénom",
    nom: "Nom",
    telephone: "Téléphone",
    email: "Email",
    password: "Mot de passe",
    cancel: "Annuler",
    create: "Créer",
    creatingBtn: "Création...",
  },

  en: {
    mustBeConnected: "❌ You must be logged in",
    sessionError: "Session error:",
    profileError: "Profile error:",
    membersError: "Members error:",
    conseillersError: "Counselors error:",
    fetchError: "fetchUserAndMembers error:",
    fillFields: "❌ Please fill in all fields!",
    creating: "⏳ Creating...",
    success: "✅ Counselor created successfully!",
    emptyServer: "Empty server response",
    error: "❌ Error:",
    back: "← Back",
    title: "Create a",
    conseiller: "Counselor",
    description1: "Transform ",
    description2: "an available servant into a ",
    description3: "Counselor ",
    description4: "within your team. Fill in their ",
    description5: "information",
    description6: ", assign them a role and a ",
    description7: "secure",
    description8:
      " password. Each creation is guided so the Counselor can begin ",
    description9: "their role with confidence",
    chooseServiteur: "-- Choose a Servant --",
    noServiteur: "No servant available",
    prenom: "First Name",
    nom: "Last Name",
    telephone: "Phone",
    email: "Email",
    password: "Password",
    cancel: "Cancel",
    create: "Create",
    creatingBtn: "Creating...",
  },
};

export default function CreateConseillerPage() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur", "ResponsableIntegration"]}>
      <CreateConseiller />
    </ProtectedRoute>
  );
}

function CreateConseiller() {
  const router = useRouter();
  const { lang } = useLang();
  const t = translations[lang];

  const [members, setMembers] = useState([]);
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [formData, setFormData] = useState({
    prenom: "",
    nom: "",
    telephone: "",
    email: "",
    password: "",
    membre_id: "",
  });

  const [responsableId, setResponsableId] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [egliseLogoUrl, setEgliseLogoUrl] = useState(null);
  const [egliseNom, setEgliseNom] = useState("");
  const [denomination, setDenomination] = useState("");
  const [ville, setVille] = useState("");

  // ➤ Récupérer l'utilisateur connecté et ses membres disponibles
  useEffect(() => {
    async function fetchUserAndMembers() {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError)
          return console.error(t.sessionError, sessionError);

        if (!session?.user) return setMessage(t.mustBeConnected);

        setResponsableId(session.user.id);

        // 🔹 Profil du responsable
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("id, eglise_id")
          .eq("id", session.user.id)
          .single();
        
        if (profileError)
          return console.error(t.profileError, profileError);
        
        // 🔹 Récupération du logo / infos de l'église
        if (profileData?.eglise_id) {
          const { data: egliseData, error: egliseError } = await supabase
            .from("eglises")
            .select("nom, logo_url, denomination, ville")
            .eq("id", profileData.eglise_id)
            .single();
        
          if (!egliseError && egliseData) {
            setEgliseNom(egliseData.nom || "");
            setEgliseLogoUrl(egliseData.logo_url || null);
            setDenomination(egliseData.denomination || "");
            setVille(egliseData.ville || "");
          }
        }  

        // 🔹 Membres star de la même église
        const { data: membersData, error: membersError } = await supabase
          .from("membres_complets")
          .select("id, prenom, nom, telephone")
          .eq("star", true)
          .eq("eglise_id", profileData.eglise_id);

        if (membersError)
          return console.error(t.membersError, membersError);

        // 🔹 Conseillers existants
        const { data: conseillersExistants, error: conseillersError } =
          await supabase
            .from("profiles")
            .select("prenom, nom, telephone")
            .eq("role", "Conseiller");

        if (conseillersError)
          return console.error(t.conseillersError, conseillersError);

        // 🔹 Créer un Set des conseillers existants
        const conseillersSet = new Set(
          conseillersExistants.map(
            (c) =>
              `${c.prenom.toLowerCase()}-${c.nom.toLowerCase()}-${c.telephone}`
          )
        );

        // 🔹 Filtrer les membres déjà conseillers
        const membresDisponibles = membersData.filter((m) => {
          const key = `${m.prenom.toLowerCase()}-${m.nom.toLowerCase()}-${m.telephone}`;
          return !conseillersSet.has(key);
        });

        setMembers(membresDisponibles || []);
      } catch (err) {
        console.error(t.fetchError, err);
      }
    }

    fetchUserAndMembers();
  }, [t]);

  // ➤ Remplissage automatique des infos
  useEffect(() => {
    if (!selectedMemberId) {
      setFormData({
        ...formData,
        prenom: "",
        nom: "",
        telephone: "",
      });
      return;
    }

    const member = members.find((m) => m.id === selectedMemberId);

    if (member) {
      setFormData({
        ...formData,
        prenom: member.prenom,
        nom: member.nom,
        telephone: member.telephone,
        membre_id: member.id,
      });
    }
  }, [selectedMemberId, members]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedMemberId || !formData.email || !formData.password) {
      setMessage(t.fillFields);
      return;
    }

    setLoading(true);
    setMessage(t.creating);

    try {
      const res = await fetch("/api/create-conseiller", {
        method: "POST",
        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({
          ...formData,
          responsable_id: responsableId,
          membre_id: formData.membre_id,
        }),
      });

      const data = await res.json().catch(() => null);

      if (res.ok) {
        setMessage(t.success);
        setSelectedMemberId("");

        setFormData({
          prenom: "",
          nom: "",
          telephone: "",
          email: "",
          password: "",
        });
      } else {
        setMessage(`${t.error} ${data?.error || t.emptyServer}`);
      }
    } catch (err) {
      setMessage("❌ " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-br from-purple-200 via-pink-100 to-yellow-200 p-6">
      <div className="bg-white p-8 rounded-3xl shadow-lg w-full max-w-md relative">
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 text-gray-700 hover:text-gray-900"
        >
          {t.back}
        </button>

        <div className="flex flex-col items-center mb-6">
          {egliseLogoUrl && (
            <img
              src={egliseLogoUrl}
              alt="Logo église"
              className="w-20 h-20 object-contain mb-2"
            />
          )}
        
          {(denomination || egliseNom) && (
            <p className="text-black font-semibold text-sm text-center">
              {[denomination, egliseNom].filter(Boolean).join(" - ")}
            </p>
          )}
        
          {ville && (
            <p className="text-gray-500 text-xs">{ville}</p>
          )}
        </div>

        <h1 className="text-2xl font-bold mt-4 mb-6 text-center text-black">
          {t.title}{" "}
          <span className="text-[#333699]">{t.conseiller}</span>
        </h1>

        <div className="max-w-3xl w-full mb-6 text-center">
          <p className="italic text-base text-black/90">
            <span className="text-[#FFB07C] font-semibold">
              {t.description1}
            </span>

            {t.description2}

            <span className="text-[#FFB07C] font-semibold">
              {t.description3}
            </span>

            {t.description4}

            <span className="text-[#FFB07C] font-semibold">
              {t.description5}
            </span>

            {t.description6}

            <span className="text-[#FFB07C] font-semibold">
              {t.description7}
            </span>

            {t.description8}

            <span className="text-[#FFB07C] font-semibold">
              {t.description9}
            </span>
            .
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col w-full gap-4"
        >
          <select
            value={selectedMemberId}
            onChange={(e) => setSelectedMemberId(e.target.value)}
            className="input"
            required
          >
            <option value="">{t.chooseServiteur}</option>

            {members.length > 0 ? (
              members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.prenom} {m.nom}
                </option>
              ))
            ) : (
              <option disabled>{t.noServiteur}</option>
            )}
          </select>

          <input
            name="prenom"
            placeholder={t.prenom}
            value={formData.prenom}
            readOnly
            className="input"
          />

          <input
            name="nom"
            placeholder={t.nom}
            value={formData.nom}
            readOnly
            className="input"
          />

          <input
            name="telephone"
            placeholder={t.telephone}
            value={formData.telephone}
            readOnly
            className="input"
          />

          <input
            name="email"
            placeholder={t.email}
            value={formData.email}
            onChange={handleChange}
            className="input"
            required
          />

          <input
            name="password"
            placeholder={t.password}
            type="password"
            value={formData.password}
            onChange={handleChange}
            className="input"
            required
          />

          <div className="flex gap-4 mt-4">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="flex-1 bg-gray-400 hover:bg-gray-500 text-white py-3 rounded-2xl"
            >
              {t.cancel}
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-400 hover:bg-blue-500 text-white py-3 rounded-2xl"
            >
              {loading ? t.creatingBtn : t.create}
            </button>
          </div>
        </form>

        {message && (
          <p className="mt-4 text-center text-sm text-gray-700">
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
          }
        `}</style>
      </div>

      <Footer />
    </div>
  );
}
