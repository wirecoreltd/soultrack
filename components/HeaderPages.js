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

  // Fermer le dropdown si on clique ailleurs
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
    return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="flex justify-between items-start mb-1">
        <div className="flex flex-col items-start">
          <button
            onClick={() => router.back()}
            className="text-amber-300 hover:text-gray-200 transition"
          >
            ← Retour
          </button>
      
          {/* Logo SoulTrack déplacé ici */}
          <img
            src="/logo.png"
            alt="Logo SoulTrack"
            className="w-10 h-auto mt-1 cursor-pointer hover:opacity-80 transition"
            onClick={() => router.push("/index")}
          />
        </div>

        <div className="flex items-center space-x-3">

          {/* Cloche invitation */}
          {userRole === "Administrateur" && invitationPending && (
            <button
              onClick={handleClickInvitation}
              className="relative text-amber-300 text-lg hover:text-gray-200 transition"
              title="Invitation en attente"
            >
              🔔
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
          )}

          {/* Cloche notifications */}
          <div className="relative notif-dropdown-container">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="relative text-amber-300 text-lg hover:text-gray-200 transition"
              title="Notifications"
            >
              🔔
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {showDropdown && (
              <div className="absolute right-0 top-8 w-72 bg-white rounded-xl shadow-xl border z-50">
                <div className="flex justify-between items-center px-3 py-2 border-b">
                  <span className="font-semibold text-sm text-gray-700">Notifications</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-blue-500 hover:underline"
                    >
                      Tout marquer lu
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-6">
                      Aucune notification
                    </p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          markAsRead(n.id);
                          if (n.lien) router.push(n.lien);
                          setShowDropdown(false);
                        }}
                        className="px-3 py-2 hover:bg-gray-50 cursor-pointer border-b last:border-0"
                      >
                        <p className="text-sm font-semibold text-gray-800">{n.titre}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                        <p className="text-[10px] text-gray-400 mt-1">{formatDate(n.created_at)}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

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
        {logoUrl && (
          <img
            src={logoUrl}
            alt="Logo Église"
            className="w-16 h-16 object-contain mb-2"
          />
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

        {pays && (
          <p className="text-gray-300 mt-2 text-sm flex items-center gap-1">
            <img
              src={`https://flagcdn.com/w20/${getIsoCode(pays)}.png`}
              srcSet={`https://flagcdn.com/w40/${getIsoCode(pays)}.png 2x`}
              width="20"
              height="14"
              alt={pays}
              style={{ borderRadius: "2px", display: "inline-block" }}
            />
            <span className="text-white">{pays}</span>
          </p>
        )}
      </div>
    </div>
  );
}
