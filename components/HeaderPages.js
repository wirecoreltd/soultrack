"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "../lib/supabaseClient";
import NotificationBell from "./NotificationBell";

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

export default function HeaderPages() {
  const router = useRouter();

  const [prenom, setPrenom] = useState("Utilisateur");
  const [eglise, setEglise] = useState("");
  const [denomination, setDenomination] = useState("");
  const [ville, setVille] = useState("");
  const [pays, setPays] = useState("");
  const [logoUrl, setLogoUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  const [roles, setRoles] = useState([]); // ✅ roles tableau
  const [userRole, setUserRole] = useState([]); // ✅ utilisé pour UI

  const [invitationPending, setInvitationPending] = useState(false);
  const [pendingToken, setPendingToken] = useState(null);

  const [egliseId, setEgliseId] = useState(null);
  const [userId, setUserId] = useState(null);

  // 🔁 Récupérer rôles depuis localStorage
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

  // 🔁 Fetch profil
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
        }

      } catch (err) {
        console.error("Erreur récupération profil :", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // 🔁 Navigation intelligente via logo
  const handleLogoClick = () => {
    if (!roles || roles.length === 0) {
      router.push("/index");
      return;
    }

    if (roles.length > 1) {
      router.push("/index");
      return;
    }

    const role = roles[0];

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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const handleClickInvitation = () => {
    if (pendingToken) {
      router.push(`/accept-invitation?token=${pendingToken}`);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto">

      {/* HEADER */}
      <div className="flex justify-between items-start mb-1">

        {/* LEFT */}
        <div className="flex flex-col items-center">
          <button
            onClick={() => router.back()}
            className="text-amber-300 hover:text-gray-200 transition"
          >
            ← Retour
          </button>

          <div className="mt-2">
            <img
              src="/logo.png"
              alt="Logo SoulTrack"
              className="w-10 h-auto cursor-pointer hover:opacity-80 transition"
              onClick={handleLogoClick}
            />
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex flex-col items-end text-right text-sm leading-tight">

          <div className="flex items-center gap-3">

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
              Déconnexion
            </button>
          </div>

          <p className="text-white text-sm mt-1">
            Connecté : <span className="font-semibold">{loading ? "..." : prenom}</span>
          </p>
        </div>
      </div>

      {/* INFOS EGLISE */}
      <div className="flex flex-col items-center mb-4">
        {logoUrl && (
          <img src={logoUrl} className="w-12 h-12 object-contain mb-2" />
        )}

        <p className="text-white font-semibold text-lg mt-2">
          {denomination && `${denomination} - `}{eglise}
        </p>

        <p className="text-amber-300 mt-2 text-sm">{ville}</p>

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
