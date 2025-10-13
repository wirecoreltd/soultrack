// pages/home.js
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import supabase from "../lib/supabaseClient";

export default function Home() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // États pour afficher les popups
  const [showPopup, setShowPopup] = useState(null); // "nouveau" | "evangelise" | null
  const [phoneNumber, setPhoneNumber] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      const userId = localStorage.getItem("userId");

      if (!userId) {
        router.push("/login");
        return;
      }

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
    };

    loadProfile();
  }, [router]);

  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };

  const handleSendApp = (type) => {
    setShowPopup(type); // ouvre le popup
    setPhoneNumber(""); // reset du champ
  };

  const sendWhatsApp = (type) => {
    const token = type === "nouveau"
      ? "58eff16c-f480-4c73-a6e0-aa4423d2069d"
      : "33dd234f-8146-4818-976c-af7bfdcefe95";

    const link = `${window.location.origin}/${type === "nouveau" ? "add-member" : "add-evangelise"}?token=${token}`;

    const url = phoneNumber
      ? `https://api.whatsapp.com/send?phone=${encodeURIComponent(phoneNumber)}&text=${encodeURIComponent(link)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(link)}`;

    window.open(url, "_blank");
    setShowPopup(null);
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
      <h1 className="text-5xl sm:text-5xl font-handwriting text-white text-center mt-1">
        SoulTrack
      </h1>

      {/* Sous-titre */}
      <div className="mt-1 mb-2 text-center text-white text-lg font-handwriting-light">
        Chaque personne a une valeur infinie. Ensemble, nous avançons, nous
        grandissons, et nous partageons l’amour de Christ dans chaque action ❤️
      </div>

      {/* Boutons principaux */}
      <div className="flex flex-col md:flex-row flex-wrap gap-3 justify-center w-full max-w-5xl mt-2">
        {(profile.role === "ResponsableIntegration" || profile.role === "Admin") && (
          <button
            onClick={() => handleSendApp("nouveau")}
            className="flex-1 min-w-[250px] h-28 bg-white rounded-2xl shadow-md flex flex-col justify-center items-center border-t-4 border-blue-500 p-3 hover:shadow-lg transition-all duration-200"
          >
            <div className="text-4xl mb-1">👤</div>
            <div className="text-lg font-bold text-gray-800 text-center">
              Envoyer l'appli – Nouveau membre
            </div>
          </button>
        )}

        {(profile.role === "ResponsableEvangelisation" || profile.role === "Admin") && (
          <button
            onClick={() => handleSendApp("evangelise")}
            className="flex-1 min-w-[250px] h-28 bg-white rounded-2xl shadow-md flex flex-col justify-center items-center border-t-4 border-green-500 p-3 hover:shadow-lg transition-all duration-200"
          >
            <div className="text-4xl mb-1">🙌</div>
            <div className="text-lg font-bold text-gray-800 text-center">
              Envoyer l'appli – Évangélisé
            </div>
          </button>
        )}
      </div>

      {/* Popup d'envoi */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-lg flex flex-col gap-4">
            <h2 className="text-xl font-bold text-gray-800 text-center">
              {showPopup === "nouveau" ? "Envoyer l'appli – Nouveau membre" : "Envoyer l'appli – Évangélisé"}
            </h2>
            <p className="text-center text-gray-600 text-sm">
              Cliquez sur "Envoyer" si le contact figure déjà dans votre liste WhatsApp,
              ou saisissez un numéro manuellement.
            </p>

            <input
              type="text"
              placeholder="Saisir le numéro manuellement (ex: +2305xxxxxx)"
              className="border border-gray-300 p-3 rounded-lg w-full text-center shadow-sm focus:outline-blue-500 focus:ring-2 focus:ring-blue-200 transition"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />

            <div className="flex gap-4">
              <button
                onClick={() => sendWhatsApp(showPopup)}
                className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-2xl shadow-md transition-all duration-200"
              >
                Envoyer
              </button>
              <button
                onClick={() => setShowPopup(null)}
                className="flex-1 py-3 bg-gray-400 hover:bg-gray-500 text-white font-bold rounded-2xl shadow-md transition-all duration-200"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Verset biblique */}
      <div className="mt-4 mb-2 text-center text-white text-lg font-handwriting-light">
        Car le corps ne se compose pas d’un seul membre, mais de plusieurs. 1 Corinthiens 12:14 ❤️
      </div>
    </div>
  );
}
