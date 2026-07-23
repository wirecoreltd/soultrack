// ═══════════════════════════════════════════════════════════════
// COMPOSANT : En-tête des pages internes (HeaderPages)
// ═══════════════════════════════════════════════════════════════
// Description : Affiche l'en-tête commun aux pages protégées :
// bouton retour, déconnexion, notifications, invitations en attente,
// informations utilisateur connecté, logo/nom/ville/pays de l'église,
// et éventuel bandeau "Supervisé par" si l'église est sous supervision.
//
// Tables Supabase utilisées :
// - profiles             (lecture) → prénom, rôles, eglise_id
// - eglises               (lecture) → nom, logo_url, denomination, ville, pays
// - eglise_supervisions   (lecture) → lien de supervision accepté
// - eglises (superviseur) (lecture) → infos de l'église superviseure
//
// ⚠️ CORRECTIF (juillet 2026) : le bloc "INFOS EGLISE" réserve
// désormais toujours la même hauteur (skeleton pendant le chargement,
// puis contenu réel) pour éviter que le reste de la page ne soit
// poussé vers le bas quand le logo/nom/ville/pays s'affichent
// après le fetch Supabase.
// ═══════════════════════════════════════════════════════════════

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "../lib/supabaseClient";
import NotificationBell from "./NotificationBell";
import { useLang } from "../hooks/useLang";

const translations = {
  fr: {
    back: "← Retour",
    logout: "Déconnexion",
    connected: "Connecté :",
    supervisedBy: "🔗 Supervisé par :",
  },
  en: {
    back: "← Back",
    logout: "Log out",
    connected: "Logged in:",
    supervisedBy: "🔗 Supervised by:",
  },
};

// ─── PAYS : nom FR (stocké en base) → { code ISO drapeau, traduction EN } ────
// ⚠️ Rodrigues n'a pas de code ISO propre : elle utilise le drapeau "mu"
// (comme Maurice) mais garde son propre nom, y compris traduit.
const PAYS_MAP = {
  "Afghanistan":               { flag: "af", en: "Afghanistan" },
  "Afrique du Sud":            { flag: "za", en: "South Africa" },
  "Albanie":                   { flag: "al", en: "Albania" },
  "Algérie":                   { flag: "dz", en: "Algeria" },
  "Allemagne":                 { flag: "de", en: "Germany" },
  "Angola":                    { flag: "ao", en: "Angola" },
  "Arabie Saoudite":           { flag: "sa", en: "Saudi Arabia" },
  "Émirats Arabes Unis":       { flag: "ae", en: "United Arab Emirates" },
  "Argentine":                 { flag: "ar", en: "Argentina" },
  "Australie":                 { flag: "au", en: "Australia" },
  "Autriche":                  { flag: "at", en: "Austria" },
  "Belgique":                  { flag: "be", en: "Belgium" },
  "Bénin":                     { flag: "bj", en: "Benin" },
  "Birmanie":                  { flag: "mm", en: "Myanmar" },
  "Bolivie":                   { flag: "bo", en: "Bolivia" },
  "Brésil":                    { flag: "br", en: "Brazil" },
  "Burkina Faso":              { flag: "bf", en: "Burkina Faso" },
  "Burundi":                   { flag: "bi", en: "Burundi" },
  "Cameroun":                  { flag: "cm", en: "Cameroon" },
  "Canada":                    { flag: "ca", en: "Canada" },
  "Chili":                     { flag: "cl", en: "Chile" },
  "Chine":                     { flag: "cn", en: "China" },
  "Colombie":                  { flag: "co", en: "Colombia" },
  "Congo":                     { flag: "cg", en: "Congo" },
  "Corée du Sud":              { flag: "kr", en: "South Korea" },
  "Côte d'Ivoire":             { flag: "ci", en: "Ivory Coast" },
  "Cuba":                      { flag: "cu", en: "Cuba" },
  "Danemark":                  { flag: "dk", en: "Denmark" },
  "Egypte":                    { flag: "eg", en: "Egypt" },
  "Espagne":                   { flag: "es", en: "Spain" },
  "États-Unis":                { flag: "us", en: "United States" },
  "USA":                       { flag: "us", en: "United States" },
  "Ethiopie":                  { flag: "et", en: "Ethiopia" },
  "Finlande":                  { flag: "fi", en: "Finland" },
  "France":                    { flag: "fr", en: "France" },
  "Gabon":                     { flag: "ga", en: "Gabon" },
  "Ghana":                     { flag: "gh", en: "Ghana" },
  "Martinique":                { flag: "mq", en: "Martinique" },
  "Rodrigues":                 { flag: "mu", en: "Rodrigues" },
  "Grèce":                     { flag: "gr", en: "Greece" },
  "Guinée":                    { flag: "gn", en: "Guinea" },
  "Haïti":                     { flag: "ht", en: "Haiti" },
  "Hongrie":                   { flag: "hu", en: "Hungary" },
  "Inde":                      { flag: "in", en: "India" },
  "Indonésie":                 { flag: "id", en: "Indonesia" },
  "Iran":                      { flag: "ir", en: "Iran" },
  "Irlande":                   { flag: "ie", en: "Ireland" },
  "Israël":                    { flag: "il", en: "Israel" },
  "Italie":                    { flag: "it", en: "Italy" },
  "Jamaïque":                  { flag: "jm", en: "Jamaica" },
  "Japon":                     { flag: "jp", en: "Japan" },
  "Kenya":                     { flag: "ke", en: "Kenya" },
  "Liban":                     { flag: "lb", en: "Lebanon" },
  "Luxembourg":                { flag: "lu", en: "Luxembourg" },
  "Madagascar":                { flag: "mg", en: "Madagascar" },
  "Mali":                      { flag: "ml", en: "Mali" },
  "Maroc":                     { flag: "ma", en: "Morocco" },
  "Maurice":                   { flag: "mu", en: "Mauritius" },
  "Mauritanie":                { flag: "mr", en: "Mauritania" },
  "Mexique":                   { flag: "mx", en: "Mexico" },
  "Mozambique":                { flag: "mz", en: "Mozambique" },
  "Namibie":                   { flag: "na", en: "Namibia" },
  "Niger":                     { flag: "ne", en: "Niger" },
  "Nigeria":                   { flag: "ng", en: "Nigeria" },
  "Norvège":                   { flag: "no", en: "Norway" },
  "Nouvelle-Zélande":          { flag: "nz", en: "New Zealand" },
  "Ouganda":                   { flag: "ug", en: "Uganda" },
  "Pakistan":                  { flag: "pk", en: "Pakistan" },
  "Pays-Bas":                  { flag: "nl", en: "Netherlands" },
  "Pérou":                     { flag: "pe", en: "Peru" },
  "Philippines":               { flag: "ph", en: "Philippines" },
  "Pologne":                   { flag: "pl", en: "Poland" },
  "Portugal":                  { flag: "pt", en: "Portugal" },
  "RDC":                       { flag: "cd", en: "DR Congo" },
  "République Démocratique du Congo": { flag: "cd", en: "DR Congo" },
  "République Dominicaine":    { flag: "do", en: "Dominican Republic" },
  "Roumanie":                  { flag: "ro", en: "Romania" },
  "Royaume-Uni":               { flag: "gb", en: "United Kingdom" },
  "Rwanda":                    { flag: "rw", en: "Rwanda" },
  "Sénégal":                   { flag: "sn", en: "Senegal" },
  "Sierra Leone":              { flag: "sl", en: "Sierra Leone" },
  "Singapour":                 { flag: "sg", en: "Singapore" },
  "Somalie":                   { flag: "so", en: "Somalia" },
  "Soudan":                    { flag: "sd", en: "Sudan" },
  "Suède":                     { flag: "se", en: "Sweden" },
  "Suisse":                    { flag: "ch", en: "Switzerland" },
  "Tanzanie":                  { flag: "tz", en: "Tanzania" },
  "Tchad":                     { flag: "td", en: "Chad" },
  "Togo":                      { flag: "tg", en: "Togo" },
  "Tunisie":                   { flag: "tn", en: "Tunisia" },
  "Turquie":                   { flag: "tr", en: "Turkey" },
  "Ukraine":                   { flag: "ua", en: "Ukraine" },
  "Uruguay":                   { flag: "uy", en: "Uruguay" },
  "Venezuela":                 { flag: "ve", en: "Venezuela" },
  "Vietnam":                   { flag: "vn", en: "Vietnam" },
  "Zimbabwe":                  { flag: "zw", en: "Zimbabwe" },
};

// Code ISO du drapeau à partir du nom FR stocké en base
function getIsoCode(countryNameFr) {
  return PAYS_MAP[countryNameFr]?.flag || "un";
}

// Nom du pays traduit selon la langue active (fallback : nom FR d'origine)
function getPaysLabel(countryNameFr, lang) {
  if (!countryNameFr) return "";
  if (lang === "en") return PAYS_MAP[countryNameFr]?.en || countryNameFr;
  return countryNameFr;
}

// Libellé complet de l'église superviseure : "Denomination-Nom - Ville - Pays"
// Exemple : "Christ Church-Love of God - New York - États-Unis"
function getSupervisionLabel({ denomination, nom, ville, pays }, lang) {
  return [
    [denomination, nom].filter(Boolean).join("-"),
    (ville || "").trim(),
    getPaysLabel(pays, lang),
  ]
    .filter(Boolean)
    .join(" - ");
}

export default function HeaderPages() {
  const router = useRouter();
  const { lang } = useLang();
  const t = translations[lang];

  const [prenom, setPrenom] = useState("Utilisateur");
  const [eglise, setEglise] = useState("");
  const [denomination, setDenomination] = useState("");
  const [ville, setVille] = useState("");
  const [pays, setPays] = useState("");
  const [logoUrl, setLogoUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  const [roles, setRoles] = useState([]);
  const [userRole, setUserRole] = useState([]);

  const [invitationPending, setInvitationPending] = useState(false);
  const [pendingToken, setPendingToken] = useState(null);

  const [egliseId, setEgliseId] = useState(null);
  const [userId, setUserId] = useState(null);

  const [supervision, setSupervision] = useState(null);

  useEffect(() => {
    const storedRoles = localStorage.getItem("userRole");
    if (storedRoles) {
      try {
        const parsed = JSON.parse(storedRoles);
        setRoles(Array.isArray(parsed) ? parsed : [parsed]);
      } catch {
        setRoles([storedRoles]);
      }
    }
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) return;

        setUserId(user.id);

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("prenom, eglise_id, roles")
          .eq("id", user.id)
          .single();

        if (profileError) throw profileError;

        setPrenom(profile?.prenom || "Utilisateur");
        setUserRole(profile?.roles || []);

        if (profile?.eglise_id) {
          setEgliseId(profile.eglise_id);

          const { data: egliseData } = await supabase
            .from("eglises")
            .select("nom, logo_url, denomination, ville, pays")
            .eq("id", profile.eglise_id)
            .single();

          if (egliseData) {
            setEglise(egliseData.nom || "");
            setLogoUrl(egliseData.logo_url || null);
            setDenomination(egliseData.denomination || "");
            setVille(egliseData.ville || "");
            setPays(egliseData.pays || "");
          }

          // Appel sécurisé (SECURITY DEFINER) : contourne la RLS sur "eglises"
          // pour récupérer les infos de l'église superviseure sans y donner
          // un accès direct depuis le frontend.
          const { data: supervisionData } = await supabase.rpc(
            "get_supervision_active",
            { p_eglise_id: profile.eglise_id }
          );

          if (supervisionData) {
            setSupervision({
              denomination: supervisionData.denomination,
              nom: supervisionData.nom,
              branche: supervisionData.branche,
              ville: supervisionData.ville,
              pays: supervisionData.pays,
            });
          }
        }
      } catch (err) {
        console.error("Erreur récupération profil :", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // ✅ Écoute les mises à jour émises par EditEglise (drapeau/pays instantanés)
  useEffect(() => {
    const handleEgliseUpdated = (e) => {
      const detail = e.detail || {};
      if (detail.denomination !== undefined) setDenomination(detail.denomination);
      if (detail.nom !== undefined) setEglise(detail.nom);
      if (detail.ville !== undefined) setVille(detail.ville);
      if (detail.pays !== undefined) setPays(detail.pays);
      if (detail.logo_url !== undefined) setLogoUrl(detail.logo_url);
    };
    window.addEventListener("eglise-updated", handleEgliseUpdated);
    return () => window.removeEventListener("eglise-updated", handleEgliseUpdated);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const handleClickInvitation = () => {
    if (pendingToken) router.push(`/accept-invitation?token=${pendingToken}`);
  };

  return (
    <div
      className="w-full max-w-5xl mx-auto px-4 pt-6 sm:pt-4"
      style={{ paddingTop: "max(1.5rem, env(safe-area-inset-top))" }}
    >
      {/* HEADER — ligne 1 : retour / cloche / déconnexion (fine, actions) */}
      <div className="flex justify-between items-center pb-2 border-b border-white/10">
        <button
          onClick={() => router.back()}
          className="text-amber-300 text-xs hover:text-gray-200 transition"
        >
          {t.back}
        </button>

        <div className="flex items-center gap-3">
          {/* Invitation */}
          {userRole?.includes("Administrateur") && invitationPending && (
            <button
              onClick={handleClickInvitation}
              className="relative text-amber-300 text-sm hover:text-gray-200 transition"
            >
              📩
              <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-red-500 rounded-full" />
            </button>
          )}

          {/* Notifications — taille réduite */}
          {egliseId && userId && (
            <div className="scale-75 origin-center">
              <NotificationBell
                egliseId={egliseId}
                userRole={userRole}
                userId={userId}
              />
            </div>
          )}

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="text-amber-300 text-xs hover:text-gray-200 transition"
          >
            {t.logout}
          </button>
        </div>
      </div>

      {/* HEADER — ligne 2 : identité connectée */}
      <div className="py-2 border-b border-white/10">
        <p className="text-white text-xs">
          {t.connected} <span className="font-semibold">{loading ? "..." : prenom}</span>
        </p>
      </div>

      {/* Ligne "supervisé par" toujours présente (hauteur réservée),
          contenu vide si pas de supervision → pas de saut de mise en page */}
      <p className="text-sky-300 text-xs mt-1 leading-snug break-words min-h-[1rem]">
        {supervision ? `${t.supervisedBy} ${getSupervisionLabel(supervision, lang)}` : ""}
      </p>

      {/* INFOS EGLISE — hauteur fixe garantie par min-h, peu importe l'état */}
      <div className="flex flex-col items-center mb-4 min-h-[150px] justify-center">
        {loading ? (
          // Skeleton complet : logo + nom + ville + pays, même hauteur que le contenu réel
          <div className="flex flex-col items-center animate-pulse">
            <div className="w-12 h-12 rounded-full bg-white/10 mb-2" />
            <div className="h-5 w-40 bg-white/10 rounded mt-2" />
            <div className="h-4 w-24 bg-white/10 rounded mt-2" />
            <div className="h-4 w-28 bg-white/10 rounded mt-2" />
          </div>
        ) : (
          <>
            <div
              className="relative w-12 h-12 mb-2 cursor-pointer group"
              onClick={() => router.push("/index")}
            >
              {logoUrl ? (
                <>
                  <img
                    src={logoUrl}
                    className="w-12 h-12 object-contain group-hover:opacity-80 transition"
                    alt="Logo église"
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-white border-[1.5px] border-[#333699]/50" />
                </>
              ) : (
                // Pas de logo en base → visuel de remplacement fixe (pas de skeleton qui pulse)
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center group-hover:opacity-80 transition">
                  <span className="text-amber-300 text-xl">⛪</span>
                </div>
              )}
            </div>

            {(denomination || eglise) && (
              <p className="text-white font-semibold text-lg mt-2">
                {[denomination, eglise].filter(Boolean).join(" - ")}
              </p>
            )}

            {ville && <p className="text-amber-300 mt-2 text-sm">{ville}</p>}

            {pays && (
              <p className="text-white mt-2 text-sm flex items-center gap-1">
                <img
                  src={`https://flagcdn.com/w20/${getIsoCode(pays)}.png`}
                  width="20"
                  height="14"
                  alt={pays}
                />
                {getPaysLabel(pays, lang)}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
