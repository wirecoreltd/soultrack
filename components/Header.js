"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "../lib/supabaseClient";

export default function Header() {
  const router = useRouter();

  const [prenom, setPrenom] = useState("Utilisateur");
  const [eglise, setEglise] = useState("Église Principale");
  const [branche, setBranche] = useState("Maurice");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          setLoading(false);
          return;
        }

        const { data: profile, error } = await supabase
          .from("profiles")
          .select("prenom, eglise_nom, branche_nom")
          .eq("id", user.id)
          .single();

        if (error) throw error;

        setPrenom(profile?.prenom || "Utilisateur");
        setEglise(profile?.eglise_nom || "Église Principale");
        setBranche(profile?.branche_nom || "Maurice");
      } catch (err) {
        console.error("❌ Erreur récupération profil :", err);
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

  return (
    <div className="w-full max-w-5xl mx-auto mt-4">
      {/* Top bar */}
      <div className="flex justify-between items-center mb-1">
        <button
          onClick={() => router.back()}
          className="text-amber-300 hover:text-gray-200 transition"
        >
          ← Retour
        </button>

        <button
          onClick={handleLogout}
          className="text-amber-300 text-sm hover:text-gray-200 transition"
        >
          Déconnexion
        </button>
      </div>

      "use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "../lib/supabaseClient";

export default function Header() {
  const router = useRouter();

  const [prenom, setPrenom] = useState("Utilisateur");
  const [eglise, setEglise] = useState("Église Principale");
  const [branche, setBranche] = useState("Maurice");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // ✅ Récupérer l'utilisateur connecté
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          setLoading(false);
          return;
        }

        // ✅ Récupérer prénom + église + branche depuis profiles
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("prenom, eglise_nom, branche_nom")
          .eq("id", user.id)
          .single();

        if (error) throw error;

        // ✅ Mettre à jour les states
        setPrenom(profile?.prenom || "Utilisateur");
        setEglise(profile?.eglise_nom || "Église Principale");
        setBranche(profile?.branche_nom || "Maurice");

      } catch (err) {
        console.error("❌ Erreur récupération profil :", err);
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

  return (
    <div className="w-full max-w-5xl mx-auto mt-4">
      {/* Top bar */}
      <div className="flex justify-between items-center mb-1">
        <button
          onClick={() => router.back()}
          className="text-amber-300 hover:text-gray-200 transition"
        >
          ← Retour
        </button>

        <button
          onClick={handleLogout}
          className="text-amber-300 text-sm hover:text-gray-200 transition"
        >
          Déconnexion
        </button>
      </div>

      {/* Prénom utilisateur aligné à droite */}
      <div className="flex justify-end flex-col text-right space-y-1 mb-6">
        <p className="text-white text-sm">
          👋 Bienvenue{" "}
          <span className="font-semibold">{loading ? "..." : prenom}</span>
        </p>
      </div>

      {/* Logo centré */}
      <div className="flex flex-col justify-center items-center mb-6">
        <img
          src="/logo.png"
          alt="Logo SoulTrack"
          className="w-20 h-auto"
        />
        {/* Église / Branche juste sous le logo */}
        <p className="text-white text-base font-medium mt-2">
          {eglise}{" "}
          <span className="text-amber-300 font-semibold">- {branche}</span>
        </p>
      </div>
    </div>
  );
}


      {/* Logo centré */}
      <div className="flex flex-col justify-center items-center mb-6">
        <img
          src="/logo.png"
          alt="Logo SoulTrack"
          className="w-20 h-auto"
        />
        {/* Église / Branche sous le logo */}
        <p className="text-white text-base font-medium mt-2">
          {eglise} <span className="text-amber-300 font-semibold">- {branche}</span>
        </p>
      </div>
    </div>
  );
}
