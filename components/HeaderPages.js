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

function getIsoCode(countryName) {
  const isoMap = {
    "Afghanistan": "af", "Afrique du Sud": "za", "Albanie": "al", "Algérie": "dz",
    "Allemagne": "de", "Angola": "ao", "Arabie Saoudite": "sa", "Argentine": "ar",
    "Australie": "au", "Autriche": "at", "Belgique": "be", "Bénin": "bj",
    "Birmanie": "mm", "Bolivie": "bo", "Brésil": "br", "Burkina Faso": "bf",
    "Burundi": "bi", "Cameroun": "cm", "Canada": "ca", "Chili": "cl",
    "Chine": "cn", "Colombie": "co", "Congo": "cg", "Corée du Sud": "kr",
    "Côte d'Ivoire": "ci", "Cuba": "cu", "Danemark": "dk", "Egypte": "eg",
    "Espagne": "es", "États-Unis": "us", "USA": "us", "Ethiopie": "et",
    "Finlande": "fi", "France": "fr", "Gabon": "ga", "Ghana": "gh", "Martinique": "mq",
    "Rodrigues": "mu", "Grèce": "gr", "Guinée": "gn", "Haïti": "ht", "Hongrie": "hu",
    "Inde": "in", "Indonésie": "id", "Iran": "ir", "Irlande": "ie",
    "Israël": "il", "Italie": "it", "Jamaïque": "jm", "Japon": "jp",
    "Kenya": "ke", "Liban": "lb", "Luxembourg": "lu", "Madagascar": "mg",
    "Mali": "ml", "Maroc": "ma", "Maurice": "mu", "Mauritanie": "mr",
    "Mexique": "mx", "Mozambique": "mz", "Namibie": "na", "Niger": "ne",
    "Nigeria": "ng", "Norvège": "no", "Nouvelle-Zélande": "nz", "Ouganda": "ug",
    "Pakistan": "pk", "Pays-Bas": "nl", "Pérou": "pe", "Philippines": "ph",
    "Pologne": "pl", "Portugal": "pt", "RDC": "cd",
    "République Démocratique du Congo": "cd", "République Dominicaine": "do",
    "Roumanie": "ro", "Royaume-Uni": "gb", "Rwanda": "rw", "Sénégal": "sn",
    "Sierra Leone": "sl", "Singapour": "sg", "Somalie": "so", "Soudan": "sd",
    "Suède": "se", "Suisse": "ch", "Tanzanie": "tz", "Tchad": "td",
    "Togo": "tg", "Tunisie": "tn", "Turquie": "tr", "Ukraine": "ua",
    "Uruguay": "uy", "Venezuela": "ve", "Vietnam": "vn", "Zimbabwe": "zw",
  };
  return isoMap[countryName] || "un";
}

function abbrevDenomination(str) {
  return (str || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase())
    .join("");
}

function getSupervisionLabel({ denomination, nom, branche, ville }) {
  return [
    abbrevDenomination(denomination),
    (nom || "").trim(),
    (branche || "").trim(),
    (ville || "").trim(),
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

          const { data: supervisionData } = await supabase
            .from("eglise_supervisions")
            .select("superviseur_eglise_id")
            .eq("supervisee_eglise_id", profile.eglise_id)
            .eq("statut", "acceptee")
            .maybeSingle();

          if (supervisionData?.superviseur_eglise_id) {
            const { data: superviseurEglise } = await supabase
              .from("eglises")
              .select("nom, denomination, ville, branche")
              .eq("id", supervisionData.superviseur_eglise_id)
              .single();

            if (superviseurEglise) {
              setSupervision({
                denomination: superviseurEglise.denomination,
                nom: superviseurEglise.nom,
                branche: superviseurEglise.branche,
                ville: superviseurEglise.ville,
              });
            }
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const handleClickInvitation = () => {
    if (pendingToken) router.push(`/accept-invitation?token=${pendingToken}`);
  };

  return (
    <div className="w-full max-w-5xl mx-auto">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-1">

        {/* LEFT — Retour aligné avec Déconnexion */}
        <div className="flex items-center">
          <button
            onClick={() => router.back()}
            className="text-amber-300 hover:text-gray-200 transition"
          >
            {t.back}
          </button>
        </div>

        {/* RIGHT */}
        <div className="flex flex-col items-end text-right text-sm leading-tight">

          <div className="flex items-center gap-3 mt-3">

            {/* Invitation */}
            {userRole?.includes("Administrateur") && invitationPending && (
              <button
                onClick={handleClickInvitation}
                className="relative text-amber-300 text-lg hover:text-gray-200 transition"
              >
                📩
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
              </button>
            )}

            {/* Notifications */}
            {egliseId && userId && (
              <NotificationBell
                egliseId={egliseId}
                userRole={userRole}
                userId={userId}
              />
            )}

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="text-amber-300 text-sm hover:text-gray-200 transition"
            >
              {t.logout}
            </button>
          </div>

          <p className="text-white text-sm mt-1">
            {t.connected} <span className="font-semibold">{loading ? "..." : prenom}</span>
          </p>

          {supervision && (
            <p className="text-amber-300 text-sm mt-0.5 text-right leading-snug break-words max-w-[220px]">
              {t.supervisedBy} {getSupervisionLabel(supervision)}
            </p>
          )}
        </div>
      </div>

      {/* INFOS EGLISE */}
      <div className="flex flex-col items-center mb-4">
        {logoUrl && (
          <div
            className="relative w-12 h-12 mb-2 cursor-pointer group"
            onClick={() => router.push("/index")}
          >
            <img
              src={logoUrl}
              className="w-12 h-12 object-contain group-hover:opacity-80 transition"
              alt="Logo église"
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-white border border-[#333699] shadow-[0_0_0_1px_rgba(255,255,255,0.4),0_1px_3px_rgba(0,0,0,0.3)]" />
          </div>
        )}

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
            {pays}
          </p>
        )}
      </div>
    </div>
  );
}
