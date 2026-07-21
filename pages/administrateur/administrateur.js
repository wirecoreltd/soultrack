"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import supabase from "../../lib/supabaseClient";
import HeaderPages from "../../components/HeaderPages";
import FooterHub from "../../components/FooterHub";
import ProtectedRoute from "../../components/ProtectedRoute";
import { useLang } from "../../hooks/useLang";

// ─── TRADUCTIONS ──────────────────────────────────────────────────────────────
const translations = {
  fr: {
    title: "Espace Administrateur",
    subtitle1: "Cet espace vous permet de",
    highlight1: "gérer",
    subtitle2: "les utilisateurs,",
    highlight2: "organiser",
    subtitle3: "les rôles et établir les",
    highlight3: "liens entre églises",
    subtitle4: ". Vous êtes au cœur de la",
    highlight4: "structure et du bon fonctionnement",
    subtitle5: "de l'ensemble.",
    invitationPending: "Invitation en attente",
    invitationRefused: "Invitation refusée",
    cards: {
      listUsers:    "Liste des Utilisateurs",
      linkEglise:   "Invitations & Liens d'églises",
      createUser:   "Créer un Utilisateur",
      subscription: "Subscription",
      deleteAccount: "Supprimer le compte",
      editEglise:   "Modifier l'église",
    },
  },
  en: {
    title: "Administrator Space",
    subtitle1: "This space allows you to",
    highlight1: "manage",
    subtitle2: "users,",
    highlight2: "organise",
    subtitle3: "roles and establish",
    highlight3: "church links",
    subtitle4: ". You are at the heart of the",
    highlight4: "structure and smooth running",
    subtitle5: "of the whole.",
    invitationPending: "Pending invitation",
    invitationRefused: "Refused invitation",
    cards: {
      listUsers:    "Users list",
      linkEglise:   "Invitations & Church links",
      createUser:   "Create a User",
      subscription: "Subscription",
      deleteAccount: "Delete account",
      editEglise:   "Edit church",
    },
  },
};

export default function Administrateur() {
  const { lang } = useLang();
  const t = translations[lang];

  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState("Utilisateur");
  const [invitation, setInvitation] = useState(null);

  useEffect(() => {
    const fetchUserAndInvitation = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) return;
      setUser(user);

      const storedName = localStorage.getItem("userName");
      if (storedName) setUserName(storedName.split(" ")[0]);

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select(`eglise_id, eglises(denomination, pays)`)
        .eq("id", user.id)
        .single();
      if (profileError) {
        console.error("❌ Erreur profile :", profileError);
        return;
      }

      const egliseId = profile?.eglise_id;
      const denomination = profile?.eglises?.denomination;
      const pays = profile?.eglises?.pays;

      // Tant que l'invitation n'a pas été ouverte une première fois,
      // supervisee_eglise_id est encore null (rempli plus tard par le RPC
      // get_invitation_par_token). En attendant, on compare aux infos de
      // SA PROPRE église (denomination + pays, déjà connues via son profil) —
      // jamais une recherche dans les autres églises.
      const orFilters = [];
      if (egliseId) orFilters.push(`supervisee_eglise_id.eq.${egliseId}`);
      if (denomination && pays) {
        orFilters.push(`and(supervisee_eglise_id.is.null,eglise_denomination.eq.${denomination},eglise_pays.eq.${pays})`);
      }
      if (orFilters.length === 0) return;

      const { data: invites, error: inviteError } = await supabase
        .from("eglise_supervisions")
        .select("*")
        .or(orFilters.join(","))
        .in("statut", ["pending", "refusee"])
        .limit(1);

      if (!inviteError && invites && invites.length > 0) setInvitation(invites[0]);
    };

    fetchUserAndInvitation();
  }, []);

  const cardClass =
    "flex-1 min-w-[250px] w-full h-32 bg-white rounded-2xl shadow-md flex flex-col justify-center items-center border-t-4 p-3 hover:shadow-lg transition-all duration-200 cursor-pointer";

  return (
    <ProtectedRoute allowedRoles={["Administrateur"]}>
      <div className="min-h-screen flex flex-col items-center p-6 text-center space-y-6 bg-gradient-to-br from-[#2E3192] to-[#92EFFD]">

        <HeaderPages />

        <h1 className="text-3xl font-extrabold mt-4 mb-6 text-white drop-shadow-lg">{t.title}</h1>

        <div className="max-w-3xl w-full mb-6 text-center">
          <p className="italic text-base text-white/90">
            {t.subtitle1} <span className="text-blue-300 font-semibold">{t.highlight1}</span> {t.subtitle2}{" "}
            <span className="text-blue-300 font-semibold">{t.highlight2}</span> {t.subtitle3}{" "}
            <span className="text-blue-300 font-semibold">{t.highlight3}</span>{t.subtitle4}{" "}
            <span className="text-blue-300 font-semibold">{t.highlight4}</span> {t.subtitle5}
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-6 justify-center w-full max-w-5xl mb-6 flex-wrap">

          {invitation && (
            <Link href={`/accept-invitation?token=${invitation.invitation_token}`}
              className={cardClass} style={{ borderTopColor: "#F59E0B" }}>
              <div className="text-4xl mb-1">📩</div>
              <div className="text-lg font-bold text-gray-800 text-center">
                {invitation.statut === "pending" ? t.invitationPending : t.invitationRefused}
              </div>
            </Link>
          )}

          <Link href="/administrateur/list-users" className={cardClass} style={{ borderTopColor: "#0E7490" }}>
            <div className="text-4xl mb-1">👤</div>
            <div className="text-lg font-bold text-gray-800 text-center">{t.cards.listUsers}</div>
          </Link>

          <Link href="/administrateur/link-eglise" className={cardClass} style={{ borderTopColor: "#8B5CF6" }}>
            <div className="text-4xl mb-1">🔗</div>
            <div className="text-lg font-bold text-gray-800 text-center">{t.cards.linkEglise}</div>
          </Link>

          <Link href="/administrateur/create-internal-user" className={cardClass} style={{ borderTopColor: "#0EA5E9" }}>
            <div className="text-4xl mb-1">🧑‍💻</div>
            <div className="text-lg font-bold text-gray-800 text-center">{t.cards.createUser}</div>
          </Link>

          <Link href="/administrateur/subscription" className={cardClass} style={{ borderTopColor: "#F97316" }}>
            <div className="text-4xl mb-1">💳</div>
            <div className="text-lg font-bold text-gray-800 text-center">{t.cards.subscription}</div>
          </Link>

          <Link href="/administrateur/edit-eglise" className={cardClass} style={{ borderTopColor: "#F97316" }}>
            <div className="text-4xl mb-1">🔧</div>
            <div className="text-lg font-bold text-gray-800 text-center">{t.cards.editEglise}</div>
          </Link>

          <Link href="/site/contact?type=delete_account" className={cardClass} style={{ borderTopColor: "#EF4444" }}>
            <div className="text-4xl mb-1">🗑️</div>
            <div className="text-lg font-bold text-gray-800 text-center">{t.cards.deleteAccount}</div>
          </Link>

        </div>

        <FooterHub />
      </div>
    </ProtectedRoute>
  );
}
