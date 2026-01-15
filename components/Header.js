"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "../lib/supabaseClient";

export default function Header() {
  const router = useRouter();
  const [prenom, setPrenom] = useState("Utilisateur");
  const [debug, setDebug] = useState("");

  useEffect(() => {
    const load = async () => {
      // 1️⃣ USER AUTH
      const { data: authData, error: authError } =
        await supabase.auth.getUser();

      if (authError || !authData?.user) {
        setDebug("❌ Pas de user auth");
        return;
      }

      const userId = authData.user.id;
      setDebug(`✅ User auth OK : ${userId}`);

      // 2️⃣ PROFILE
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("prenom")
        .eq("id", userId)
        .maybeSingle(); // ⚠️ important

      if (profileError) {
        setDebug("❌ Erreur profiles");
        console.error(profileError);
        return;
      }

      if (!profile) {
        setDebug("❌ Aucun profil trouvé");
        return;
      }

      setPrenom(profile.prenom || "Utilisateur");
      setDebug("✅ Profil chargé");
    };

    load();
  }, []);

  return (
    <div className="w-full max-w-5xl mx-auto mt-4">
      <div className="flex justify-between items-center mb-2">
        <button onClick={() => router.back()} className="text-amber-300">
          ← Retour
        </button>
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            router.push("/login");
          }}
          className="text-amber-300 text-sm"
        >
          Déconnexion
        </button>
      </div>

      <p className="text-white text-sm text-right">
        👋 Bienvenue <span className="font-semibold">{prenom}</span>
      </p>

      {/* DEBUG TEMPORAIRE */}
      <p className="text-red-300 text-xs text-right mt-1">{debug}</p>

      <div className="flex justify-center mt-6">
        <img src="/logo.png" className="w-20" />
      </div>
    </div>
  );
}
