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
        console.log("📧 Email du user:", userEmail);
        console.log("🛡️ Rôles du user:", userRole);

        // 🔹 Récupération du profil connecté
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("id, prenom")
          .eq("email", userEmail)
          .single();

        if (profileError) throw profileError;
        const responsableId = profileData.id;
        setPrenom(profileData.prenom || "");
        console.log("🆔 ID du responsable:", responsableId);

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
              cellules (id, cellule, responsable)
            `)
            .not("cellule_id", "is", null);

          if (error) throw error;
          membresData = data;
          console.log("✅ Membres récupérés (Admin):", membresData);
        }

        // 🔹 ResponsableCellule → membres de ses cellules
        else if (userRole.includes("ResponsableCellule")) {
          const { data: cellulesData, error: cellulesError } = await supabase
            .from("cellules")
            .select("id, cellule")
            .eq("responsable_id", responsableId);

          if (cellulesError) {
            console.error("❌ Erreur récupération cellules:", cellulesError);
            setMessage("Erreur lors de la récupération des cellules.");
            setMembres([]);
            return;
          }

          if (!cellulesData || cellulesData.length === 0) {
            setMessage("Vous n’êtes responsable d’aucune cellule pour le moment.");
            setMembres([]);
            return;
          }

          console.log("🏠 Cellules trouvées:", cellulesData);
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

          console.log("✅ Membres récupérés (ResponsableCellule):", membresData);
        }

        setMembres(membresData || []);
      } catch (err) {
        console.error("❌ Erreur générale:", err.message || err);
        setMessage("Erreur lors de la récupération des membres.");
        setMembres([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMembres();
  }, []);

  if (loading)
    return <p className="text-center mt-10 text-gray-700">Chargement...</p>;

  if (message)
    return <p className="text-center text-gray-600 mt-10">{message}</p>;

  return (
    <div
      className="min-h-screen flex flex-col items-center p-6 transition-all duration-200"
      style={{
        background: "linear-gradient(135deg, #2E3192 0%, #92EFFD 100%)",
      }}
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
          <p className="text-orange-200 text-sm">
            👋 Bienvenue {prenom || "cher membre"}
          </p>
        </div>
      </div>

      {/* ==================== LOGO ==================== */}
      <div className="mb-4">
        <Image
          src="/logo.png"
          alt="SoulTrack Logo"
          width={80}
          height={80}
          className="mx-auto"
        />
      </div>

      {/* ==================== TITRE ==================== */}
      <div className="text-center mb-4">
        <h1 className="text-3xl font-bold text-white mb-2">
          Liste des Membres
        </h1>
        <p className="text-white text-lg max-w-xl mx-auto leading-relaxed tracking-wide font-light italic">
          Chaque personne a une valeur infinie. Ensemble, nous avançons ❤️
        </p>
      </div>

      {/* ==================== TABLEAU ==================== */}
      <div className="p-6 w-full max-w-5xl bg-white rounded-3xl shadow-2xl">
        <h2 className="text-2xl font-semibold text-indigo-700 mb-4 text-center">
          👥 Membres de ma/mes cellule(s)
        </h2>

        <div className="overflow-x-auto rounded-2xl border border-gray-100">
          <table className="min-w-full text-sm">
            <thead className="bg-indigo-600 text-white rounded-t-2xl">
              <tr>
                <th className="py-3 px-4 text-left rounded-tl-2xl">Nom complet</th>
                <th className="py-3 px-4 text-left">Téléphone</th>
                <th className="py-3 px-4 text-left">Ville</th>
                <th className="py-3 px-4 text-left rounded-tr-2xl">Cellule</th>
              </tr>
            </thead>
            <tbody>
              {membres.map((membre) => (
                <tr
                  key={membre.id}
                  className="border-b hover:bg-indigo-50 transition-all"
                >
                  <td className="py-3 px-4 font-semibold text-gray-700">
                    {membre.nom} {membre.prenom}
                  </td>
                  <td className="py-3 px-4">{membre.telephone || "—"}</td>
                  <td className="py-3 px-4">{membre.ville || "—"}</td>
                  <td className="py-3 px-4 text-indigo-700 font-medium">
                    {membre.cellules?.cellule || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
