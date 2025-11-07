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

  useEffect(() => {
    const fetchMembres = async () => {
      setLoading(true);

      try {
        const userEmail = localStorage.getItem("userEmail");
        const userRole = JSON.parse(localStorage.getItem("userRole") || "[]");

        if (!userEmail) throw new Error("Utilisateur non connecté");

        // 🔹 Récupérer l'ID du profil connecté
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
            .select(`
              id,
              nom,
              prenom,
              telephone,
              ville,
              cellule_id,
              cellules (cellule)
            `)
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
            .select(`
              id,
              nom,
              prenom,
              telephone,
              ville,
              cellule_id,
              cellules (cellule)
            `)
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

      {/* ==================== TABLE DES MEMBRES ==================== */}
      <div className="w-full max-w-6xl overflow-x-auto">
        <table className="w-full text-sm text-left text-black border-separate border-spacing-0">
          <thead className="bg-white/10 text-Black uppercase text-sm">
            <tr>
              <th className="py-3 px-4 rounded-tl-lg">Nom complet</th>
              <th className="py-3 px-4">Téléphone</th>
              <th className="py-3 px-4">Ville</th>
              <th className="py-3 px-4 rounded-tr-lg">Cellule</th>              
            </tr>
          </thead>
          <tbody>
            {membres.map((membre, index) => (
              <tr
                key={membre.id}
                className={`border-b ${
                  index % 2 === 0 ? "bg-white/5" : "bg-transparent"
                } hover:bg-white/10 transition-all`}
              >
                <td className="py-3 px-4 font-semibold text-Black">
                  {membre.nom} {membre.prenom}
                </td>
                <td className="py-3 px-4">{membre.telephone || "—"}</td>
                <td className="py-3 px-4">{membre.ville || "—"}</td>
                <td className="py-3 px-4">{membre.cellules?.cellule || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
