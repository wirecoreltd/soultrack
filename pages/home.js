// pages/home.js
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import supabase from "../lib/supabaseClient";
import SendLinkPopup from "../components/SendLinkPopup";

export default function Home() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [tokens, setTokens] = useState({ membre: null, evangelise: null });

  useEffect(() => {
    const loadProfile = async () => {
      const userId = localStorage.getItem("userId");

      if (!userId) {
        router.push("/login");
        return;
      }

      // Charger le profil
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error || !data) {
        localStorage.clear();
        router.push("/login");
        return;
      }

      setProfile(data);
      setLoadingProfile(false);

      // Générer ou récupérer les tokens pour l'envoi d'app
      await ensureTokens(userId);
    };

    loadProfile();
  }, [router]);

  // Fonction pour créer ou récupérer un token
  const ensureTokens = async (userId) => {
    try {
      const { data: existingTokens } = await supabase
        .from("suivis")
        .select("*")
        .eq("user_id", userId);

      let membreToken = existingTokens?.find(t => t.type === "membre")?.token;
      let evangeliseToken = existingTokens?.find(t => t.type === "evangelise")?.token;

      // Générer si pas existant
      if (!membreToken) {
        membreToken = crypto.randomUUID();
        await supabase.from("suivis").insert([{ user_id: userId, type: "membre", token: membreToken, created_at: new Date() }]);
      }

      if (!evangeliseToken) {
        evangeliseToken = crypto.randomUUID();
        await supabase.from("suivis").insert([{ user_id: userId, type: "evangelise", token: evangeliseToken, created_at: new Date() }]);
      }

      setTokens({ membre: membreToken, evangelise: evangeliseToken });
    } catch (err) {
      console.error("Erreur génération tokens:", err);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };

  if (loadingProfile) {
    return <p className="text-center mt-10 text-gray-600">Chargement du profil...</p>;
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-between p-6 gap-2 relative"
      style={{ background: "linear-gradient(135deg, #2E3192 0%, #92EFFD 100%)" }}
    >
      {/* Déconnexion */}
      <button
        onClick={handleLogout}
        className="absolute top-4 right-4 bg-white/20 text-white px-4 py-2 rounded-xl font-semibold shadow-sm hover:bg-white/30 transition"
      >
        Déconnexion
      </button>

      {/* Logo */}
      <div className="mt-1">
        <Image src="/logo.png" alt="SoulTrack Logo" width={80} height={80} />
      </div>

      {/* Titre */}
      <h1 className="text-5xl sm:text-5xl font-handwriting text-white text-center mt-1">SoulTrack</h1>

      {/* Sous-titre */}
      <div className="mt-1 mb-2 text-center text-white text-lg font-handwriting-light">
        Chaque personne a une valeur infinie. Ensemble, nous avançons, nous grandissons, et nous partageons l’amour de Christ dans chaque action ❤️
      </div>

      {/* Liens selon rôle */}
      <div className="flex flex-col md:flex-row flex-wrap gap-3 justify-center w-full max-w-5xl mt-2">
        {(profile.role === "ResponsableIntegration" || profile.role === "Admin") && (
          <Link href="/membres-hub" className="flex-1 min-w-[250px]">
            <div className="w-full h-28 bg-white rounded-2xl shadow-md flex flex-col justify-center items-center border-t-4 border-blue-500 p-3 hover:shadow-lg transition-all duration-200 cursor-pointer">
              <div className="text-4xl mb-1">👤</div>
              <div className="text-lg font-bold text-gray-800 text-center">Suivis des membres</div>
            </div>
          </Link>
        )}

        {(profile.role === "ResponsableEvangelisation" || profile.role === "Admin") && (
          <Link href="/evangelisation-hub" className="flex-1 min-w-[250px]">
            <div className="w-full h-28 bg-white rounded-2xl shadow-md flex flex-col justify-center items-center border-t-4 border-green-500 p-3 hover:shadow-lg transition-all duration-200 cursor-pointer">
              <div className="text-4xl mb-1">🙌</div>
              <div className="text-lg font-bold text-gray-800 text-center">Évangélisation</div>
            </div>
          </Link>
        )}

        {profile.role === "Admin" && (
          <>
            <Link href="/rapport" className="flex-1 min-w-[250px]">
              <div className="w-full h-28 bg-white rounded-2xl shadow-md flex flex-col justify-center items-center border-t-4 border-red-500 p-3 hover:shadow-lg transition-all duration-200 cursor-pointer">
                <div className="text-4xl mb-1">📊</div>
                <div className="text-lg font-bold text-gray-800 text-center">Rapport</div>
              </div>
            </Link>

            <Link href="/admin/create-user" className="flex-1 min-w-[250px]">
              <div className="w-full h-28 bg-white rounded-2xl shadow-md flex flex-col justify-center items-center border-t-4 border-blue-400 p-3 hover:shadow-lg transition-all duration-200 cursor-pointer">
                <div className="text-4xl mb-1">🧑‍💻</div>
                <div className="text-lg font-bold text-gray-800 text-center">Créer un utilisateur</div>
              </div>
            </Link>

            <Link href="/admin/create-internal-user" className="flex-1 min-w-[250px]">
              <div className="w-full h-28 bg-white rounded-2xl shadow-md flex flex-col justify-center items-center border-t-4 border-purple-500 p-3 hover:shadow-lg transition-all duration-200 cursor-pointer">
                <div className="text-4xl mb-1">➕</div>
                <div className="text-lg font-bold text-gray-800 text-center">Créer utilisateur interne</div>
              </div>
            </Link>
          </>
        )}
      </div>

      {/* Boutons d'envoi d'app */}
      <div className="flex flex-col gap-3 mt-4 w-full max-w-md">
        {(profile.role === "ResponsableIntegration" || profile.role === "Admin") && tokens.membre && (
          <SendLinkPopup
            label="Envoyer l'appli – Nouveau membre"
            type="ajouter_membre"
            buttonColor="from-[#09203F] to-[#537895]"
            token={tokens.membre}
          />
        )}

        {(profile.role === "ResponsableEvangelisation" || profile.role === "Admin") && tokens.evangelise && (
          <SendLinkPopup
            label="Envoyer l'appli – Évangélisé"
            type="ajouter_evangelise"
            buttonColor="from-[#09203F] to-[#537895]"
            token={tokens.evangelise}
          />
        )}
      </div>

      {/* Verset biblique */}
      <div className="mt-4 mb-2 text-center text-white text-lg font-handwriting-light">
        Car le corps ne se compose pas d’un seul membre, mais de plusieurs. 1 Corinthiens 12:14 ❤️
      </div>
    </div>
  );
}
