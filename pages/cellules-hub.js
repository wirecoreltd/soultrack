// pages/cellules-hub.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import supabase from "../lib/supabaseClient";
import Image from "next/image";
import LogoutLink from "../components/LogoutLink";
import { canAccessPage } from "../lib/accessControl";

export default function CellulesHub() {
  const router = useRouter();
  const [role, setRole] = useState(null);
  const [cellule, setCellule] = useState(null);
  const [membres, setMembres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const storedRole = localStorage.getItem("userRole");
    const userId = localStorage.getItem("userId");

    if (!storedRole || !userId) {
      router.push("/login");
      return;
    }

    const canAccess = canAccessPage(storedRole, "/cellules-hub");
    if (!canAccess) {
      alert("⛔ Accès non autorisé !");
      router.push("/login");
      return;
    }

    setRole(storedRole);

    const fetchData = async () => {
      console.log("▶️ Début du chargement des données...");
      try {
        // 🔹 Récupérer le profil
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("prenom, nom, role, id")
          .eq("id", userId)
          .single();

        if (profileError) throw profileError;
        if (!profile) throw new Error("Profil non trouvé !");
        console.log("✅ Profil chargé :", profile);

        if (profile.role === "ResponsableCellule") {
          const responsableNom = `${profile.prenom} ${profile.nom}`;
          console.log("Responsable :", responsableNom);

          // 🔹 Trouver la cellule du responsable
          const { data: celluleData, error: celluleError } = await supabase
            .from("cellules")
            .select("id, cellule, ville, responsable, telephone")
            .eq("responsable", responsableNom)
            .single();

          if (celluleError) throw celluleError;
          if (!celluleData) throw new Error("Cellule non trouvée !");
          console.log("✅ Cellule trouvée :", celluleData);
          setCellule(celluleData);

          // 🔹 Récupérer les membres liés à cette cellule
          const { data: membresData, error: membresError } = await supabase
            .from("membres")
            .select("id, prenom, nom, telephone, cellule_id")
            .eq("cellule_id", celluleData.id);

          if (membresError) throw membresError;
          console.log("✅ Membres trouvés :", membresData);

          setMembres(membresData);
        }

        setLoading(false);
      } catch (err) {
        console.error("❌ Erreur pendant fetchData :", err);
        setErrorMessage(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  // 🔄 Chargement
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-900 to-blue-400">
        <p className="text-white text-xl font-semibold animate-pulse">
          Chargement en cours...
        </p>
      </div>
    );
  }

  // ❌ Erreur
  if (errorMessage) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-red-700 to-red-400">
        <p className="text-white text-2xl font-semibold mb-4">❌ Erreur</p>
        <p className="text-white text-lg">{errorMessage}</p>
        <button
          onClick={() => router.reload()}
          className="mt-6 bg-white text-red-600 px-4 py-2 rounded-xl font-bold"
        >
          🔁 Réessayer
        </button>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center p-6"
      style={{
        background: "linear-gradient(135deg, #2E3192 0%, #92EFFD 100%)",
      }}
    >
      {/* HEADER */}
      <div className="w-full max-w-6xl flex justify-between items-center mb-6">
        <button
          onClick={() => router.back()}
          className="text-white font-semibold hover:text-gray-200 transition"
        >
          ← Retour
        </button>
        <div className="flex items-center gap-4">
          <Image src="/logo.png" alt="SoulTrack Logo" width={50} height={50} />
          <LogoutLink />
        </div>
      </div>

      {/* TITRE */}
      <h1 className="text-3xl font-bold text-white mb-6 text-center">
        📋 Tableau de bord de ta Cellule
      </h1>

      {/* INFOS CELLULE */}
      {cellule ? (
        <div className="bg-white/20 backdrop-blur-md rounded-3xl p-6 shadow-lg w-full max-w-3xl mb-8">
          <h2 className="text-2xl text-white font-semibold mb-2">
            Cellule : {cellule.cellule}
          </h2>
          <p className="text-white">Ville : {cellule.ville}</p>
          <p className="text-white">Responsable : {cellule.responsable}</p>
          <p className="text-white">
            Téléphone : {cellule.telephone || "—"}
          </p>
        </div>
      ) : (
        <p className="text-white mb-8">Aucune cellule trouvée.</p>
      )}

      {/* LISTE DES MEMBRES */}
      <div className="w-full max-w-4xl bg-white/20 backdrop-blur-md rounded-3xl p-6 shadow-lg">
        <h2 className="text-xl font-semibold text-white mb-4">
          👥 Membres de ta cellule
        </h2>

        {membres.length === 0 ? (
          <p className="text-white text-center">
            Aucun membre trouvé pour cette cellule.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {membres.map((membre) => (
              <div
                key={membre.id}
                className="bg-white rounded-2xl shadow-md p-4 border-t-4 border-purple-500 hover:shadow-xl transition"
              >
                <h3 className="text-lg font-bold text-gray-800 mb-1">
                  {membre.prenom} {membre.nom}
                </h3>
                <p className="text-gray-700">
                  📞 {membre.telephone || "Non renseigné"}
                </p>
                <p className="text-gray-600 text-sm mt-2">
                  Cellule : {cellule.cellule}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* VERSET */}
      <div className="mt-10 text-center text-white text-lg font-handwriting max-w-2xl">
        Car le corps ne se compose pas d’un seul membre, mais de plusieurs. <br />
        <span className="font-semibold">1 Corinthiens 12:14 ❤️</span>
      </div>
    </div>
  );
}
