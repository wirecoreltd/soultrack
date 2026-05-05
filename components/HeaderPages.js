"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "../lib/supabaseClient";
import { useNotifications } from "./NotificationContext";

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
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [showDropdown, setShowDropdown] = useState(false);

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

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".notif-dropdown-container")) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="w-full max-w-5xl mx-auto">

      {/* HEADER RIGHT ALIGNED */}
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
              onClick={() => router.push("/index")}
            />
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex flex-col items-end text-right text-sm leading-tight">

          {/* 🔔 + Déconnexion */}
          <div className="flex items-center gap-2">
            {userRole === "Administrateur" && invitationPending && (
              <button
                onClick={handleClickInvitation}
                className="relative text-amber-300 text-lg hover:text-gray-200 transition"
              >
                🔔
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
            )}

            <button
              onClick={handleLogout}
              className="text-amber-300 text-sm hover:text-gray-200 transition whitespace-nowrap"
            >
              Déconnexion
            </button>
          </div>

          {/* Connecté */}
          <p className="text-white text-sm mt-1">
            Connecté : <span className="font-semibold">{loading ? "..." : prenom}</span>
          </p>
        </div>
      </div>

      {/* RESTE INCHANGÉ */}
      <div className="flex flex-col items-center mb-4">
        {logoUrl && (
          <div className="mt-2">
            <img src={logoUrl} alt="Logo Église" className="w-12 h-12 object-contain mb-2" />
          </div>
        )}

        <p className="text-white font-semibold text-lg mt-2">
          {denomination && (
            <span className="text-amber-300">
              {denomination}{eglise && " - "}
            </span>
          )}
          {eglise}
        </p>

        <p className="text-gray-300 text-sm">
          {branche}
          {branche && ville && <span className="text-amber-300"> - </span>}
          {ville}
        </p>
      </div>

    </div>
  );
}
