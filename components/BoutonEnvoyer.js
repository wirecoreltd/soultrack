///components/BoutonEnvoyer.js

"use client";
import { useState } from "react";
import supabase from "@/lib/supabaseClient";

export default function BoutonEnvoyer({ membre, cellule }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleEnvoyer = async () => {
    if (!membre || !cellule) return;
    setLoading(true);
    setMessage("");

    try {
      // ✅ Vérifie si l'utilisateur est connecté
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Utilisateur non connecté");

      // ✅ Mise à jour du statut du membre
      const { error: updateError } = await supabase
        .from("membres")
        .update({ statut: "actif" })
        .eq("id", membre.id);

      if (updateError) throw updateError;

      // ✅ Insertion dans suivis_membres
      const { error: insertError } = await supabase.from("suivis_membres").insert([
        {
          membre_id: membre.id,
          prenom: membre.prenom,
          nom: membre.nom,
          telephone: membre.telephone,
          besoin: membre.besoin,
          cellule_id: cellule.id,
          cellule_nom: cellule.cellule,
          responsable: cellule.responsable,
          statut: "actif",
        },
      ]);

      if (insertError) throw insertError;

      setMessage("✅ Contact envoyé et suivi créé !");
    } catch (err) {
      console.error("Erreur envoi :", err.message);
      setMessage("❌ Erreur : " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-2">
      <button
        onClick={handleEnvoyer}
        disabled={loading}
        className={`px-4 py-2 rounded-lg text-white transition ${
          loading ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
        }`}
      >
        {loading ? "Envoi..." : "📤 Envoyer vers suivis"}
      </button>
      {message && <p className="text-sm mt-1 text-gray-700">{message}</p>}
    </div>
  );
}

