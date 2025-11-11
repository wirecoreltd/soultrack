Skip to content
Chat history

You said:
pourquoi dans le bienvenue... le prenom de la personne ne 'saffice mais c'est utilisatuer qui s'affiche?
//✅ /pages/index.js

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "../lib/supabaseClient";
import LogoutLink from "../components/LogoutLink";

const roleCards = {
  Administrateur: [
    { path: "/membres-hub", label: "Gestion des membres", emoji: "👥", color: "#0E7490" },
    { path: "/evangelisation-hub", label: "Évangélisation", emoji: "✝️", color: "#F97316" },
    { path: "/cellules-hub", label: "Cellule", emoji: "🏠", color: "#10B981" },
    { path: "/rapport", label: "Rapport", emoji: "📈", color: "#FBBF24" },
    { path: "/administrateur", label: "Admin", emoji: "⚙️", color: "#0EA5E9" },
  ],
  ResponsableIntegration: [
    { path: "/membres-hub", label: "Gestion des membres", emoji: "👥", color: "#0284C7" },
  ],
  ResponsableEvangelisation: [
    { path: "/evangelisation-hub", label: "Évangélisation", emoji: "✝️", color: "#0D9488" },
  ],
  ResponsableCellule: [
    { path: "/cellules-hub", label: "Cellule", emoji: "🏠", color: "#06B6D4" },
  ],
  Membre: [],
};

export default function IndexPage() {
  const [userName, setUserName] = useState("");
  const [prenom, setPrenom] = useState(""); // ✅ ajout du prénom
  const [roles, setRoles] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const name = localStorage.getItem("userName") || "Utilisateur";
    const firstName = name.split(" ")[0];
    setUserName(name);
    setPrenom(firstName); // ✅ sauvegarde du prénom

    const storedRoles = localStorage.getItem("userRole");
    if (storedRoles) {
      try {
        const parsedRoles = JSON.parse(storedRoles);
        setRoles(Array.isArray(parsedRoles) ? parsedRoles : [parsedRoles]);
      } catch {
        setRoles([storedRoles]);
      }
    }
  }, []);

  const handleRedirect = (path) => {
    router.push(path.startsWith("/") ? path : "/" + path);
  };

  let cardsToShow = [];
  if (roles.includes("Administrateur")) {
    Object.values(roleCards).forEach((cards) => {
      cards.forEach((card) => {
        if (!cardsToShow.find((c) => c.path === card.path)) {
          cardsToShow.push(card);
        }
      });
    });
  } else {
    roles.forEach((role) => {
      const roleKey = role.trim();
      if (roleCards[roleKey]) {
        roleCards[roleKey].forEach((card) => {
          if (!cardsToShow.find((c) => c.path === card.path)) {
            cardsToShow.push(card);
          }
        });
      }
    });
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center p-6 text-center space-y-6"
      style={{ background: "linear-gradient(135deg, #2E3192 0%, #92EFFD 100%)" }}
    >
      {/* 🔹 Top bar */}
      <div className="w-full max-w-5xl mb-6">
        {/* Ligne principale : Retour à gauche, Déconnexion à droite */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => router.back()}
            className="flex items-center text-white hover:text-gray-200 transition-colors"
          >
            ← Retour
          </button>

          <LogoutLink />
        </div>

        {/* Ligne du dessous : Bienvenue aligné à droite */}
        <div className="flex justify-end mt-2">
          <p className="text-orange-200 text-sm">👋 Bienvenue {prenom || "cher membre"}</p>
        </div>
      </div>

      {/* 🔹 Logo centré */}
      <div className="mb-6">
        <img src="/logo.png" alt="Logo SoulTrack" className="w-20 h-18 mx-auto" />
      </div>

      {/* 🔹 Titre */}
      <h1 className="text-3xl font-login text-white mb-6 text-center font-bold">
        Tableau De Bord
      </h1>

      {/* 🔹 Message motivant */}
      <p className="text-white text-lg italic mb-6 max-w-2xl leading-relaxed tracking-wide font-light">
        La famille est le premier lieu où l'amour, le soutien et la foi se transmettent. 
        Prenez soin de ceux qui vous entourent et soyez un exemple d'unité et de bonté.
      </p>

      {/* 🔹 Cartes des fonctionnalités */}
      <div className="flex flex-col md:flex-row flex-wrap gap-4 justify-center items-center w-full max-w-4xl">
        {cardsToShow.map((card) => (
          <div
            key={card.path}
            onClick={() => handleRedirect(card.path)}
            className="flex-1 min-w-[250px] w-full h-32 bg-white rounded-2xl shadow-md flex flex-col justify-center items-center border-t-4 p-3 hover:shadow-lg transition-all duration-200 cursor-pointer"
            style={{ borderTopColor: card.color }}
          >
            <div className="text-4xl mb-1">{card.emoji}</div>
            <div className="text-lg font-bold text-gray-800">{card.label}</div>
          </div>
        ))}
      </div>

      {/* 🔹 Verset biblique sous les cartes */}
      <div className="text-white text-lg italic max-w-2xl mt-6 leading-relaxed tracking-wide font-light">
        Car le corps ne se compose pas d’un seul membre, mais de plusieurs. <br />
        1 Corinthiens 12:14 ❤️
      </div>
    </div>
  );
}
ChatGPT said:
Merci pour le code. Le problème vient de la façon dont tu récupères le prénom depuis le localStorage. Actuellement, tu fais ceci :

const name = localStorage.getItem("userName") || "Utilisateur";
const firstName = name.split(" ")[0];
setUserName(name);
setPrenom(firstName);
Si dans localStorage la clé "userName" contient "Utilisateur" (par défaut) ou autre valeur générique, alors prenom sera "Utilisateur" au lieu du vrai prénom.

Donc le problème n’est pas dans l’affichage, mais dans ce qui est stocké dans localStorage. Quelques pistes pour corriger :

1️⃣ Vérifier ce qui est stocké dans localStorage
Avant même de splitter, tu peux faire un console.log :

useEffect(() => {
  const name = localStorage.getItem("userName");
  console.log("Nom récupéré dans localStorage :", name);
  const firstName = name ? name.split(" ")[0] : "cher membre";
  setPrenom(firstName);
}, []);
Si tu vois "Utilisateur", c’est que le nom réel n’a jamais été sauvegardé dans le localStorage lors du login.

2️⃣ Stocker le vrai prénom lors du login
Par exemple, quand tu connectes l’utilisateur via Supabase :

const { data: { user }, error } = await supabase.auth.getUser();
if (user) {
  const fullName = user.user_metadata?.full_name || "Utilisateur";
  localStorage.setItem("userName", fullName);
}
Assure-toi que full_name contient le prénom + nom, sinon adapte la clé selon ce que tu as dans Supabase.

3️⃣ Alternative : récupérer directement depuis Supabase
Si tu veux être sûr de ne pas dépendre du localStorage :

useEffect(() => {
  async function fetchUser() {
    const { data, error } = await supabase.auth.getUser();
    if (data.user) {
      const name = data.user.user_metadata?.full_name || "Utilisateur";
      setUserName(name);
      setPrenom(name.split(" ")[0]);
    }
  }
  fetchUser();
}, []);
💡 En résumé :
Le prénom n’apparaît pas car localStorage contient "Utilisateur". Il faut soit stocker le vrai nom lors du login, soit le récupérer directement depuis Supabase.

Si tu veux, je peux te réécrire ton useEffect pour que le prénom s’affiche correctement automatiquement, sans dépendre du localStorage.

Veux‑tu que je fasse ça ?

You said:
je te donne un exemple dans une page qui marche
ChatGPT said:
Parfait ! Donne-moi l’exemple de page où ça fonctionne, et je pourrai comparer avec ton index.js pour voir exactement pourquoi le prénom ne s’affiche pas correctement.

You said:
// ✅ /pages/membres-cellule.js
"use client";

import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import Image from "next/image";
import LogoutLink from "../components/LogoutLink";

export default function MembresCellule() {
  const [membres, setMembres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [prenom, setPrenom] = useState("");
  const [selectedMembre, setSelectedMembre] = useState(null); // ✅ membre sélectionné pour popup

  useEffect(() => {
    const fetchMembres = async () => {
      setLoading(true);
      try {
        const userEmail = localStorage.getItem("userEmail");
        const userRole = JSON.parse(localStorage.getItem("userRole") || "[]");

        if (!userEmail) throw new Error("Utilisateur non connecté");

        // 🔹 Récupération du profil connecté
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("id, prenom")
          .eq("email", userEmail)
          .single();

        if (profileError) throw profileError;

        setPrenom(profileData?.prenom || "cher membre");
        const responsableId = profileData.id;

        let membresData = [];

        // 🔹 ADMIN → tous les membres
        if (userRole.includes("Administrateur")) {
          const { data, error } = await supabase
            .from("membres")
            .select(
              id, nom, prenom, telephone, ville, statut, venu, infos_supplementaires, besoin,
              cellules (cellule)
            )
            .not("cellule_id", "is", null);

          if (error) throw error;
          membresData = data;
        }

        // 🔹 ResponsableCellule → membres de ses cellules
        else if (userRole.includes("ResponsableCellule")) {
          const { data: cellulesData, error: cellulesError } = await supabase
            .from("cellules")
            .select("id, cellule")
            .eq("responsable_id", responsableId);

          if (cellulesError) throw cellulesError;

          if (!cellulesData || cellulesData.length === 0) {
            setMessage("Vous n’êtes responsable d’aucune cellule pour le moment.");
            setMembres([]);
            return;
          }

          const celluleIds = cellulesData.map((c) => c.id);

          const { data, error } = await supabase
            .from("membres")
            .select(
              id, nom, prenom, telephone, ville, statut, venu, infos_supplementaires, besoin,
              cellules (cellule)
            )
            .in("cellule_id", celluleIds);

          if (error) throw error;
          membresData = data;

          if (!membresData || membresData.length === 0) {
            setMessage("Aucun membre assigné à vos cellules.");
          }
        }

        setMembres(membresData || []);
      } catch (err) {
        console.error("❌ Erreur:", err.message || err);
        setMessage("Erreur lors de la récupération des membres.");
        setMembres([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMembres();
  }, []);

  if (loading) return <p className="text-center mt-10 text-white">Chargement...</p>;
  if (message) return <p className="text-center text-white mt-10">{message}</p>;

  return (
    <div
      className="min-h-screen flex flex-col items-center p-6"
      style={{ background: "linear-gradient(135deg, #2E3192 0%, #92EFFD 100%)" }}
    >
      {/* ==================== HEADER ==================== */}
      <div className="w-full max-w-5xl mb-6">
        <div className="flex justify-between items-center">
          <button
            onClick={() => window.history.back()}
            className="flex items-center text-white hover:text-gray-200 transition-colors"
          >
            ← Retour
          </button>

          <LogoutLink className="bg-white/10 text-white px-4 py-2 rounded-lg hover:bg-white/20 transition" />
        </div>

        <div className="flex justify-end mt-2">
          <p className="text-orange-200 text-sm">👋 Bienvenue {prenom}</p>
        </div>
      </div>

      {/* ==================== LOGO ==================== */}
      <div className="mb-4">
        <Image src="/logo.png" alt="SoulTrack Logo" className="w-20 h-18 mx-auto" />
      </div>

      {/* ==================== TITRE ==================== */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">👥 Membres de ma/mes cellule(s)</h1>
        <p className="text-white text-lg max-w-xl mx-auto italic">
          Chaque personne a une valeur infinie. Ensemble, nous avançons ❤️
        </p>
      </div>

      {/* ==================== TABLE ==================== */}
      <div className="w-full max-w-6xl overflow-x-auto">
        <table className="w-full text-sm text-left text-black border-separate border-spacing-0">
          <thead className="bg-white/10 text-black uppercase text-sm">
            <tr>
              <th className="py-3 px-4 rounded-tl-lg">Nom complet</th>
              <th className="py-3 px-4">Téléphone</th>
              <th className="py-3 px-4">Ville</th>
              <th className="py-3 px-4">Cellule</th>
              <th className="py-3 px-4 rounded-tr-lg">Détails</th> {/* ✅ Colonne ajoutée */}
            </tr>
          </thead>
          <tbody>
            {membres.map((membre, index) => (
              <tr
                key={membre.id}
                className={border-b ${
                  index % 2 === 0 ? "bg-white/5" : "bg-transparent"
                } hover:bg-white/10 transition-all}
              >
                <td className="py-3 px-4 text-black">
                  {membre.nom} {membre.prenom}
                </td>
                <td className="py-3 px-4">{membre.telephone || "—"}</td>
                <td className="py-3 px-4">{membre.ville || "—"}</td>
                <td className="py-3 px-4">{membre.cellules?.cellule || "—"}</td>
                <td className="py-3 px-4">
                  <button
                    onClick={() => setSelectedMembre(membre)}
                    className="text-orange-300 hover:text-orange-500 hover:underline transition"
                  >
                    Détails
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ==================== POPUP DÉTAILS ==================== */}
      {selectedMembre && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-[90%] max-w-md shadow-xl text-gray-800 relative">
            <button
              onClick={() => setSelectedMembre(null)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              ✖
            </button>
            <h2 className="text-xl font-bold mb-4 text-center text-indigo-600">
              🧾 Détails du membre
            </h2>
            <div className="text-sm space-y-2">
              <p>📌 <strong>Nom :</strong> {selectedMembre.prenom} {selectedMembre.nom}</p>
              <p>📞 <strong>Téléphone :</strong> {selectedMembre.telephone || "—"}</p>
              <p>🏙 <strong>Ville :</strong> {selectedMembre.ville || "—"}</p>
              <p>🕊 <strong>Statut :</strong> {selectedMembre.statut || "—"}</p>
              <p>🧩 <strong>Venu :</strong> {selectedMembre.venu || "—"}</p>
              <p>📝 <strong>Infos :</strong> {selectedMembre.infos_supplementaires || "—"}</p>
              <p>🙏 <strong>Besoin :</strong> {selectedMembre.besoin || "—"}</p>
            </div>
            <div className="mt-6 text-center">
              <button
                onClick={() => setSelectedMembre(null)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
ChatGPT said:
Ah ! Là je vois exactement la différence ! 😄

Dans ta page membres-cellule.js, tu récupères le prénom directement depuis Supabase :

const { data: profileData, error: profileError } = await supabase
  .from("profiles")
  .select("id, prenom")
  .eq("email", userEmail)
  .single();

setPrenom(profileData?.prenom || "cher membre");
Donc prenom contient le vrai prénom enregistré dans la base.

Dans ton index.js, tu fais :

const name = localStorage.getItem("userName") || "Utilisateur";
const firstName = name.split(" ")[0];
setPrenom(firstName);
✅ Problème :

Tu relies le prénom au localStorage, qui ne contient pas forcément le vrai prénom.

Par défaut, tu mets "Utilisateur", donc tu vois "Utilisateur" au lieu du vrai prénom.

En résumé : membres-cellule.js marche car tu query directement Supabase, alors que index.js dépend d’une valeur stockée côté client, qui peut être générique ou manquante.

💡 Solution pour index.js
Tu peux copier la même logique :

useEffect(() => {
  async function fetchUser() {
    try {
      const userEmail = localStorage.getItem("userEmail");
      if (!userEmail) return setPrenom("cher membre");

      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("prenom")
        .eq("email", userEmail)
        .single();

      if (error) throw error;

      setPrenom(profileData?.prenom || "cher membre");
    } catch (err) {
      console.error(err);
      setPrenom("cher membre");
    }
  }
  fetchUser();
}, []);
Ainsi, tu récupères toujours le vrai prénom de l’utilisateur connecté, comme dans membres-cellule.js.

Si tu veux, je peux te réécrire tout ton index.js avec cette correction intégrée, pour que le “👋 Bienvenue” affiche correctement le prénom. Veux‑tu que je fasse ça ?

You said:
oui
ChatGPT said:
Parfait ! Voici ton index.js entièrement réécrit pour que le prénom s’affiche correctement, en récupérant directement le prénom depuis Supabase au lieu de dépendre du localStorage. Tout le reste reste identique à ton code actuel :

//✅ /pages/index.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "../lib/supabaseClient";
import LogoutLink from "../components/LogoutLink";

const roleCards = {
  Administrateur: [
    { path: "/membres-hub", label: "Gestion des membres", emoji: "👥", color: "#0E7490" },
    { path: "/evangelisation-hub", label: "Évangélisation", emoji: "✝️", color: "#F97316" },
    { path: "/cellules-hub", label: "Cellule", emoji: "🏠", color: "#10B981" },
    { path: "/rapport", label: "Rapport", emoji: "📈", color: "#FBBF24" },
    { path: "/administrateur", label: "Admin", emoji: "⚙️", color: "#0EA5E9" },
  ],
  ResponsableIntegration: [
    { path: "/membres-hub", label: "Gestion des membres", emoji: "👥", color: "#0284C7" },
  ],
  ResponsableEvangelisation: [
    { path: "/evangelisation-hub", label: "Évangélisation", emoji: "✝️", color: "#0D9488" },
  ],
  ResponsableCellule: [
    { path: "/cellules-hub", label: "Cellule", emoji: "🏠", color: "#06B6D4" },
  ],
  Membre: [],
};

export default function IndexPage() {
  const [userName, setUserName] = useState("");
  const [prenom, setPrenom] = useState("");
  const [roles, setRoles] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userEmail = localStorage.getItem("userEmail");
        if (!userEmail) {
          setPrenom("cher membre");
          return;
        }

        // 🔹 Récupération du profil connecté
        const { data: profileData, error } = await supabase
          .from("profiles")
          .select("nom, prenom")
          .eq("email", userEmail)
          .single();

        if (error) throw error;

        const fullName = profileData?.nom ? `${profileData.nom} ${profileData.prenom}` : "Utilisateur";
        setUserName(fullName);
        setPrenom(profileData?.prenom || "cher membre");

        // 🔹 Récupération des rôles depuis le localStorage
        const storedRoles = localStorage.getItem("userRole");
        if (storedRoles) {
          try {
            const parsedRoles = JSON.parse(storedRoles);
            setRoles(Array.isArray(parsedRoles) ? parsedRoles : [parsedRoles]);
          } catch {
            setRoles([storedRoles]);
          }
        }
      } catch (err) {
        console.error("Erreur récupération utilisateur :", err);
        setPrenom("cher membre");
      }
    };

    fetchUser();
  }, []);

  const handleRedirect = (path) => {
    router.push(path.startsWith("/") ? path : "/" + path);
  };

  let cardsToShow = [];
  if (roles.includes("Administrateur")) {
    Object.values(roleCards).forEach((cards) => {
      cards.forEach((card) => {
        if (!cardsToShow.find((c) => c.path === card.path)) {
          cardsToShow.push(card);
        }
      });
    });
  } else {
    roles.forEach((role) => {
      const roleKey = role.trim();
      if (roleCards[roleKey]) {
        roleCards[roleKey].forEach((card) => {
          if (!cardsToShow.find((c) => c.path === card.path)) {
            cardsToShow.push(card);
          }
        });
      }
    });
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center p-6 text-center space-y-6"
      style={{ background: "linear-gradient(135deg, #2E3192 0%, #92EFFD 100%)" }}
    >
      {/* 🔹 Top bar */}
      <div className="w-full max-w-5xl mb-6">
        <div className="flex justify-between items-center">
          <button
            onClick={() => router.back()}
            className="flex items-center text-white hover:text-gray-200 transition-colors"
          >
            ← Retour
          </button>
          <LogoutLink />
        </div>

        <div className="flex justify-end mt-2">
          <p className="text-orange-200 text-sm">👋 Bienvenue {prenom}</p>
        </div>
      </div>

      {/* 🔹 Logo centré */}
      <div className="mb-6">
        <img src="/logo.png" alt="Logo SoulTrack" className="w-20 h-18 mx-auto" />
      </div>

      {/* 🔹 Titre */}
      <h1 className="text-3xl font-login text-white mb-6 text-center font-bold">
        Tableau De Bord
      </h1>

      {/* 🔹 Message motivant */}
      <p className="text-white text-lg italic mb-6 max-w-2xl leading-relaxed tracking-wide font-light">
        La famille est le premier lieu où l'amour, le soutien et la foi se transmettent. 
        Prenez soin de ceux qui vous entourent et soyez un exemple d'unité et de bonté.
      </p>

      {/* 🔹 Cartes des fonctionnalités */}
      <div className="flex flex-col md:flex-row flex-wrap gap-4 justify-center items-center w-full max-w-4xl">
        {cardsToShow.map((card) => (
          <div
            key={card.path}
            onClick={() => handleRedirect(card.path)}
            className="flex-1 min-w-[250px] w-full h-32 bg-white rounded-2xl shadow-md flex flex-col justify-center items-center border-t-4 p-3 hover:shadow-lg transition-all duration-200 cursor-pointer"
            style={{ borderTopColor: card.color }}
          >
            <div className="text-4xl mb-1">{card.emoji}</div>
            <div className="text-lg font-bold text-gray-800">{card.label}</div>
          </div>
        ))}
      </div>

      {/* 🔹 Verset biblique sous les cartes */}
      <div className="text-white text-lg italic max-w-2xl mt-6 leading-relaxed tracking-wide font-light">
        Car le corps ne se compose pas d’un seul membre, mais de plusieurs. <br />
        1 Corinthiens 12:14 ❤️
      </div>
    </div>
  );
}
✅ Points clés de cette version :

Récupération du prénom directement depuis Supabase (profiles.prenom).

userName contient le nom complet si besoin.

Si l’utilisateur n’est pas trouvé, fallback sur "cher membre".

Tout le reste du layout et des cartes reste inchangé.

Si tu veux, je peux aussi te proposer une version optimisée qui ne fait qu’un seul fetch pour récupérer nom, prénom et rôle depuis Supabase, sans dépendre du localStorage. Ça rendrait le code plus fiable et cohérent.

Veux‑tu que je fasse ça ?

You said:
apporte la modificatoin cette page 

/* ✅ pages/cellules-hub.js */

"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import SendLinkPopup from "../components/SendLinkPopup";
import LogoutLink from "../components/LogoutLink";
import AccessGuard from "../components/AccessGuard";
import { useEffect, useState } from "react";

export default function CellulesHub() {
  const router = useRouter();
  const [userName, setUserName] = useState("Utilisateur");

  useEffect(() => {
    const storedName = localStorage.getItem("userName"); // stocké lors du login
    if (storedName) setUserName(storedName.split(" ")[0]); // prend le prénom
  }, []);

  return (
    <AccessGuard allowedRoles={["Administrateur", "ResponsableCellule"]}>
      <div
        className="min-h-screen flex flex-col items-center p-6"
        style={{ background: "linear-gradient(135deg, #2E3192 0%, #92EFFD 100%)" }}
      >
        {/* 🔹 Top bar: Retour + Déconnexion */}
        <div className="w-full max-w-5xl flex justify-between items-center mb-2">
          <button
            onClick={() => router.back()}
            className="flex items-center text-white font-semibold hover:text-gray-200 transition-colors"
          >
            ← Retour
          </button>

          <LogoutLink className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors" />
        </div>

        {/* 🔹 Prénom utilisateur sous déconnexion */}
        <p className="text-left w-full max-w-5xl mb-6 text-gray-200 italic">
          Bienvenue {userName} !
        </p>

        {/* 🔹 Logo centré */}
        <div className="mb-6">
          <Image src="/logo.png" alt="SoulTrack Logo" width={90} height={90} />
        </div>

        {/* 🔹 Cartes principales */}
        <div className="flex flex-col md:flex-row gap-6 justify-center w-full max-w-5xl mb-6 flex-wrap">
          <Link
            href="/ajouter-membre-cellule"
            className="flex-1 min-w-[250px] w-full h-32 bg-white rounded-3xl shadow-md flex flex-col justify-center items-center border-t-4 border-blue-500 p-6 hover:shadow-xl transition-all duration-200 cursor-pointer"
          >
            <div className="text-5xl mb-2">➕</div>
            <div className="text-lg font-bold text-gray-800 text-center">
              Ajouter un membre à la Cellule
            </div>
          </Link>

          <Link
            href="/membres-cellule"
            className="flex-1 min-w-[250px] w-full h-32 bg-white rounded-3xl shadow-md flex flex-col justify-center items-center border-t-4 border-green-500 p-6 hover:shadow-xl transition-all duration-200 cursor-pointer"
          >
            <div className="text-5xl mb-2">👥</div>
            <div className="text-lg font-bold text-gray-800 text-center">
              Membres de la Cellule
            </div>
          </Link>

          <Link
            href="/suivis-evangelisation"
            className="flex-1 min-w-[250px] w-full h-32 bg-white rounded-3xl shadow-md flex flex-col justify-center items-center border-t-4 border-orange-500 p-6 hover:shadow-xl transition-all duration-200 cursor-pointer"
          >
            <div className="text-5xl mb-2">📋</div>
            <div className="text-lg font-bold text-gray-800 text-center">
              Suivis des évangélisés
            </div>
          </Link>

          <Link
            href="/suivis-membres"
            className="flex-1 min-w-[250px] w-full h-32 bg-white rounded-3xl shadow-md flex flex-col justify-center items-center border-t-4 border-yellow-500 p-6 hover:shadow-xl transition-all duration-200 cursor-pointer"
          >
            <div className="text-5xl mb-2">📋</div>
            <div className="text-lg font-bold text-gray-800 text-center">
              Suivis des membres
            </div>
          </Link>
        </div>

        {/* 🔹 Bouton popup ajouté sous les cartes */}
        <div className="w-full max-w-md mb-10">
          <SendLinkPopup
            label="Envoyer l'appli – Évangélisé"
            type="ajouter_evangelise"
            buttonColor="from-[#09203F] to-[#537895]"
          />
        </div>

        {/* 🔹 Verset biblique / texte motivant */}
        <div className="mt-auto mb-4 text-center text-white text-lg font-handwriting max-w-2xl">
          La famille est le plus grand trésor. Prenez soin les uns des autres avec amour et patience. <br />
          1 Corinthiens 12:14 ❤️
        </div>
      </div>
    </AccessGuard>
  );
}
ChatGPT said:
Parfait ! Pour que le prénom s’affiche correctement comme dans membres-cellule.js, il faut remplacer la récupération depuis localStorage par un fetch direct depuis Supabase. Voici ta page cellules-hub.js modifiée :

/* ✅ pages/cellules-hub.js */

"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import SendLinkPopup from "../components/SendLinkPopup";
import LogoutLink from "../components/LogoutLink";
import AccessGuard from "../components/AccessGuard";
import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";

export default function CellulesHub() {
  const router = useRouter();
  const [prenom, setPrenom] = useState("cher membre");

  useEffect(() => {
    const fetchPrenom = async () => {
      try {
        const userEmail = localStorage.getItem("userEmail");
        if (!userEmail) return;

        const { data: profileData, error } = await supabase
          .from("profiles")
          .select("prenom")
          .eq("email", userEmail)
          .single();

        if (error) throw error;
        setPrenom(profileData?.prenom || "cher membre");
      } catch (err) {
        console.error("Erreur récupération prénom :", err);
        setPrenom("cher membre");
      }
    };

    fetchPrenom();
  }, []);

  return (
    <AccessGuard allowedRoles={["Administrateur", "ResponsableCellule"]}>
      <div
        className="min-h-screen flex flex-col items-center p-6"
        style={{ background: "linear-gradient(135deg, #2E3192 0%, #92EFFD 100%)" }}
      >
        {/* 🔹 Top bar: Retour + Déconnexion */}
        <div className="w-full max-w-5xl flex justify-between items-center mb-2">
          <button
            onClick={() => router.back()}
            className="flex items-center text-white font-semibold hover:text-gray-200 transition-colors"
          >
            ← Retour
          </button>

          <LogoutLink className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors" />
        </div>

        {/* 🔹 Prénom utilisateur sous déconnexion */}
        <div className="flex justify-end mt-2">
          <p className="text-orange-200 text-sm">👋 Bienvenue {prenom}</p>
        </div>

        {/* 🔹 Logo centré */}
        <div className="mb-6">
          <Image src="/logo.png" alt="SoulTrack Logo" width={90} height={90} />
        </div>

        {/* 🔹 Cartes principales */}
        <div className="flex flex-col md:flex-row gap-6 justify-center w-full max-w-5xl mb-6 flex-wrap">
          <Link
            href="/ajouter-membre-cellule"
            className="flex-1 min-w-[250px] w-full h-32 bg-white rounded-3xl shadow-md flex flex-col justify-center items-center border-t-4 border-blue-500 p-6 hover:shadow-xl transition-all duration-200 cursor-pointer"
          >
            <div className="text-5xl mb-2">➕</div>
            <div className="text-lg font-bold text-gray-800 text-center">
              Ajouter un membre à la Cellule
            </div>
          </Link>

          <Link
            href="/membres-cellule"
            className="flex-1 min-w-[250px] w-full h-32 bg-white rounded-3xl shadow-md flex flex-col justify-center items-center border-t-4 border-green-500 p-6 hover:shadow-xl transition-all duration-200 cursor-pointer"
          >
            <div className="text-5xl mb-2">👥</div>
            <div className="text-lg font-bold text-gray-800 text-center">
              Membres de la Cellule
            </div>
          </Link>

          <Link
            href="/suivis-evangelisation"
            className="flex-1 min-w-[250px] w-full h-32 bg-white rounded-3xl shadow-md flex flex-col justify-center items-center border-t-4 border-orange-500 p-6 hover:shadow-xl transition-all duration-200 cursor-pointer"
          >
            <div className="text-5xl mb-2">📋</div>
            <div className="text-lg font-bold text-gray-800 text-center">
              Suivis des évangélisés
            </div>
          </Link>

          <Link
            href="/suivis-membres"
            className="flex-1 min-w-[250px] w-full h-32 bg-white rounded-3xl shadow-md flex flex-col justify-center items-center border-t-4 border-yellow-500 p-6 hover:shadow-xl transition-all duration-200 cursor-pointer"
          >
            <div className="text-5xl mb-2">📋</div>
            <div className="text-lg font-bold text-gray-800 text-center">
              Suivis des membres
            </div>
          </Link>
        </div>

        {/* 🔹 Bouton popup ajouté sous les cartes */}
        <div className="w-full max-w-md mb-10">
          <SendLinkPopup
            label="Envoyer l'appli – Évangélisé"
            type="ajouter_evangelise"
            buttonColor="from-[#09203F] to-[#537895]"
          />
        </div>

        {/* 🔹 Verset biblique / texte motivant */}
        <div className="mt-auto mb-4 text-center text-white text-lg font-handwriting max-w-2xl">
          La famille est le plus grand trésor. Prenez soin les uns des autres avec amour et patience. <br />
          1 Corinthiens 12:14 ❤️
        </div>
      </div>
    </AccessGuard>
  );
}
✅ Modifications principales :

Suppression de la dépendance à localStorage.getItem("userName").

Récupération du prénom depuis Supabase (profiles.prenom) grâce à l’email stocké dans localStorage.

Fallback sur "cher membre" si aucun prénom n’est trouvé.

Si tu veux, je peux faire la même correction sur /pages/index.js et /pages/membres-hub.js pour uniformiser partout l’affichage du prénom.

Veux‑tu que je fasse ça ?




No file chosenNo file chosen
ChatGPT can make mistakes. Check important info.
