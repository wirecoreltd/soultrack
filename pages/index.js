// pages/index.js - Home page
// pages/index.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import SendLinkPopup from "../components/SendLinkPopup";
import LogoutLink from "../components/LogoutLink";
import { canAccessPage } from "../lib/accessControl";
import supabase from "../lib/supabaseClient";

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (error) console.error(error);
        else setUser(profile);
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  const handleNavigation = (path) => {
    router.push(path);
  };

  if (loading) return <p className="text-center mt-10">Chargement en cours...</p>;

  return (
    <div className="min-h-screen bg-blue-950 flex flex-col items-center justify-center text-white px-4">
      <div className="max-w-3xl text-center">
        <h1 className="text-3xl font-bold mb-4">Bienvenue dans le Hub de l'Église ✝️</h1>
        <p className="text-lg mb-6">
          Chaque personne a une valeur infinie. Ensemble, nous avançons, nous grandissons, et nous partageons
          l’amour de Christ dans chaque action ❤️
        </p>

        <blockquote className="italic text-gray-300 mb-8">
          “Car le corps ne se compose pas d’un seul membre, mais de plusieurs.” — 1 Corinthiens 12:14 ❤️
        </blockquote>

        {/* ✅ BOUTONS SELON LE ROLE */}
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {/* ADMIN → accès à tout */}
          {user?.role === "Admin" && (
            <>
              <button onClick={() => handleNavigation("/admin/create-user")} className="bg-blue-600 hover:bg-blue-700 py-2 px-4 rounded-lg">
                👤 Créer un utilisateur
              </button>
              <button onClick={() => handleNavigation("/admin/create-responsable-cellule")} className="bg-blue-600 hover:bg-blue-700 py-2 px-4 rounded-lg">
                🏠 Créer une cellule
              </button>
              <button onClick={() => handleNavigation("/hub/evangelisation")} className="bg-blue-600 hover:bg-blue-700 py-2 px-4 rounded-lg">
                🙌 Hub Évangélisation
              </button>
              <button onClick={() => handleNavigation("/hub/members")} className="bg-blue-600 hover:bg-blue-700 py-2 px-4 rounded-lg">
                🤝 Hub Membres
              </button>
              <button onClick={() => handleNavigation("/hub/cellule")} className="bg-blue-600 hover:bg-blue-700 py-2 px-4 rounded-lg">
                🏡 Hub Cellule
              </button>
            </>
          )}

          {/* RESPONSABLE ÉVANGÉLISATION */}
          {user?.role === "ResponsableEvangelisation" && (
            <button onClick={() => handleNavigation("/hub/evangelisation")} className="bg-blue-600 hover:bg-blue-700 py-2 px-4 rounded-lg">
              🙌 Hub Évangélisation
            </button>
          )}

          {/* RESPONSABLE INTÉGRATION */}
          {user?.role === "ResponsableIntegration" && (
            <button onClick={() => handleNavigation("/hub/members")} className="bg-blue-600 hover:bg-blue-700 py-2 px-4 rounded-lg">
              🤝 Hub Membres
            </button>
          )}

          {/* RESPONSABLE CELLULE */}
          {user?.role === "ResponsableCellule" && (
            <button onClick={() => handleNavigation("/hub/cellule")} className="bg-blue-600 hover:bg-blue-700 py-2 px-4 rounded-lg">
              🏡 Hub Cellule
            </button>
          )}
        </div>

        <div className="mt-8">
          <LogoutLink />
        </div>
      </div>

      {showPopup && <SendLinkPopup onClose={() => setShowPopup(false)} />}
    </div>
  );
}

