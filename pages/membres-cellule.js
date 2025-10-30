//pages/membres-cellule.js
"use client";

import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";

export default function MembresCellule() {
  const [membres, setMembres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchMembres = async () => {
      setLoading(true);

      try {
        const userEmail = localStorage.getItem("userEmail");
        const userRole = JSON.parse(localStorage.getItem("userRole") || "[]");

        if (!userEmail) throw new Error("Utilisateur non connecté");
        console.log("📧 Email du user:", userEmail);
        console.log("🛡️ Rôles du user:", userRole);

        // 🔹 Récupérer l'ID du profil connecté
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("id")
          .eq("email", userEmail)
          .single();

        if (profileError) throw profileError;
        const responsableId = profileData.id;
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

        // 🔹 ResponsableCellule → membres de toutes ses cellules
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
          const celluleIds = cellulesData.map(c => c.id);

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

  if (loading) return <p className="text-center mt-10">Chargement...</p>;
  if (message) return <p className="text-center text-gray-600 mt-10">{message}</p>;

  return (
    <div className="p-6 min-h-screen bg-gradient-to-b from-indigo-100 to-indigo-50">
      <h2 className="text-3xl font-bold text-center text-indigo-700 mb-6">👥 Membres de ma/mes cellule(s)</h2>
      <div className="overflow-x-auto bg-white rounded-3xl shadow-2xl p-6">
        <table className="min-w-full text-sm">
          <thead className="bg-indigo-600 text-white">
            <tr>
              <th className="py-3 px-4 text-left">Nom complet</th>
              <th className="py-3 px-4 text-left">Téléphone</th>
              <th className="py-3 px-4 text-left">Ville</th>
              <th className="py-3 px-4 text-left">Cellule</th>
            </tr>
          </thead>
          <tbody>
            {membres.map((membre) => (
              <tr key={membre.id} className="border-b hover:bg-indigo-50 transition-all">
                <td className="py-3 px-4 font-semibold text-gray-700">{membre.nom} {membre.prenom}</td>
                <td className="py-3 px-4">{membre.telephone || "—"}</td>
                <td className="py-3 px-4">{membre.ville || "—"}</td>
                <td className="py-3 px-4 text-indigo-700 font-medium">{membre.cellules?.cellule || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

