"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "../lib/supabaseClient";

function getFlagEmoji(countryName) {
  const flagMap = {
    "Afghanistan": "🇦🇫", "Afrique du Sud": "🇿🇦", "Albanie": "🇦🇱", "Algérie": "🇩🇿",
    "Allemagne": "🇩🇪", "Angola": "🇦🇴", "Arabie Saoudite": "🇸🇦", "Argentine": "🇦🇷",
    "Australie": "🇦🇺", "Autriche": "🇦🇹", "Belgique": "🇧🇪", "Bénin": "🇧🇯",
    "Birmanie": "🇲🇲", "Bolivie": "🇧🇴", "Brésil": "🇧🇷", "Burkina Faso": "🇧🇫",
    "Burundi": "🇧🇮", "Cameroun": "🇨🇲", "Canada": "🇨🇦", "Chili": "🇨🇱",
    "Chine": "🇨🇳", "Colombie": "🇨🇴", "Congo": "🇨🇬", "Corée du Sud": "🇰🇷",
    "Côte d'Ivoire": "🇨🇮", "Cuba": "🇨🇺", "Danemark": "🇩🇰", "Egypte": "🇪🇬",
    "Espagne": "🇪🇸", "États-Unis": "🇺🇸", "USA": "🇺🇸", "Ethiopie": "🇪🇹",
    "Finlande": "🇫🇮", "France": "🇫🇷", "Gabon": "🇬🇦", "Ghana": "🇬🇭",
    "Grèce": "🇬🇷", "Guinée": "🇬🇳", "Haïti": "🇭🇹", "Hongrie": "🇭🇺",
    "Inde": "🇮🇳", "Indonésie": "🇮🇩", "Iran": "🇮🇷", "Irlande": "🇮🇪",
    "Israël": "🇮🇱", "Italie": "🇮🇹", "Jamaïque": "🇯🇲", "Japon": "🇯🇵",
    "Kenya": "🇰🇪", "Liban": "🇱🇧", "Luxembourg": "🇱🇺", "Madagascar": "🇲🇬",
    "Mali": "🇲🇱", "Maroc": "🇲🇦", "Maurice": "🇲🇺", "Mauritanie": "🇲🇷",
    "Mexique": "🇲🇽", "Mozambique": "🇲🇿", "Namibie": "🇳🇦", "Niger": "🇳🇪",
    "Nigeria": "🇳🇬", "Norvège": "🇳🇴", "Nouvelle-Zélande": "🇳🇿", "Ouganda": "🇺🇬",
    "Pakistan": "🇵🇰", "Pays-Bas": "🇳🇱", "Pérou": "🇵🇪", "Philippines": "🇵🇭",
    "Pologne": "🇵🇱", "Portugal": "🇵🇹", "RDC": "🇨🇩",
    "République Démocratique du Congo": "🇨🇩", "République Dominicaine": "🇩🇴",
    "Roumanie": "🇷🇴", "Royaume-Uni": "🇬🇧", "Rwanda": "🇷🇼", "Sénégal": "🇸🇳",
    "Sierra Leone": "🇸🇱", "Singapour": "🇸🇬", "Somalie": "🇸🇴", "Soudan": "🇸🇩",
    "Suède": "🇸🇪", "Suisse": "🇨🇭", "Tanzanie": "🇹🇿", "Tchad": "🇹🇩",
    "Togo": "🇹🇬", "Tunisie": "🇹🇳", "Turquie": "🇹🇷", "Ukraine": "🇺🇦",
    "Uruguay": "🇺🇾", "Venezuela": "🇻🇪", "Vietnam": "🇻🇳", "Zimbabwe": "🇿🇼",
  };

  return flagMap[countryName] || "🌍";
}

  return code
    .toUpperCase()
    .split("")
    .map((char) => String.fromCodePoint(127397 + char.charCodeAt(0)))
    .join("");
}

export default function HeaderPages() {
  const router = useRouter();

  const [prenom, setPrenom] = useState("Utilisateur");
  const [eglise, setEglise] = useState("");
  const [branche, setBranche] = useState("");
  const [denomination, setDenomination] = useState("");
  const [ville, setVille] = useState("");
  const [pays, setPays] = useState("");
  const [superviseur, setSuperviseur] = useState("");
  const [logoUrl, setLogoUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [invitationPending, setInvitationPending] = useState(false);
  const [pendingToken, setPendingToken] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) return;

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("prenom, eglise_id, branche_id, role")
          .eq("id", user.id)
          .single();
        if (profileError) throw profileError;

        setPrenom(profile?.prenom || "Utilisateur");
        setUserRole(profile?.role || null);

        if (profile?.eglise_id) {
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

        if (profile?.branche_id) {
          const { data: brancheData } = await supabase
            .from("branches")
            .select("nom, superviseur_nom")
            .eq("id", profile.branche_id)
            .single();

          if (brancheData) {
            setBranche(brancheData.nom || "");
            if (brancheData.superviseur_nom) setSuperviseur(brancheData.superviseur_nom);
          }

          if (profile.role === "Administrateur") {
            const { data: invites } = await supabase
              .from("eglise_supervisions")
              .select("invitation_token")
              .eq("supervisee_branche_id", profile.branche_id)
              .eq("statut", "pending")
              .limit(1);

            if (invites && invites.length > 0) {
              setInvitationPending(true);
              setPendingToken(invites[0].invitation_token);
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
    if (pendingToken) {
      router.push(`/accept-invitation?token=${pendingToken}`);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto mt-4">
      <div className="flex justify-between items-center mb-1">
        <button
          onClick={() => router.back()}
          className="text-amber-300 hover:text-gray-200 transition"
        >
          ← Retour
        </button>

        <div className="flex items-center space-x-2">
          {userRole === "Administrateur" && invitationPending && (
            <button
              onClick={handleClickInvitation}
              className="relative text-amber-300 text-lg hover:text-gray-200 transition mr-2"
              title="Invitation en attente"
            >
              🔔
              <span className="absolute top-0 right-0 transform translate-x-1/17 -translate-y-1/10 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
          )}

          <button
            onClick={handleLogout}
            className="text-amber-300 text-sm hover:text-gray-200 transition"
          >
            Déconnexion
          </button>
        </div>
      </div>

      <div className="flex justify-end flex-col text-right space-y-1 mb-2 text-sm">
        <p className="text-white text-sm">
          Connecté : <span className="font-semibold">{loading ? "..." : prenom}</span>
        </p>
        {superviseur && (
          <p className="flex justify-end space-x-1 text-right mb-2 text-sm">
            <span style={{ color: "#fcd34d" }}>Superviseur :</span>
            <span className="text-white">{superviseur}</span>
          </p>
        )}
      </div>

      <div className="flex flex-col items-center mb-4">
        <div className="flex items-center justify-center gap-4">
          <img
            src="/logo.png"
            alt="Logo SoulTrack"
            className="w-20 h-auto cursor-pointer hover:opacity-80 transition"
            onClick={() => router.push("/index")}
          />
          {logoUrl && (
            <img
              src={logoUrl}
              alt="Logo Église"
              className="w-20 h-20 object-contain"
            />
          )}
        </div>

        {/* Ligne 1 : Dénomination - Nom église */}
        <p className="text-white font-semibold text-lg mt-2">
          {denomination && <span className="text-amber-300">{denomination} - </span>}
          {eglise}
        </p>

        {/* Ligne 2 : Branche */}
        <p className="text-gray-300 text-sm">
          {branche}
          {ville && <span className="text-amber-300"> - {ville}</span>}
        </p>

        {/* Ligne 3 : Pays avec drapeau */}
        {pays && (
          <p className="text-gray-300 text-sm mt-2">
            {getFlagEmoji(pays)} <span className="text-white">{pays}</span>
          </p>
        )}
      </div>
    </div>
  );
}
