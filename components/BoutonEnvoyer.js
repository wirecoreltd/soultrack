///components/BoutonEnvoyer.js

"use client";
import { useState } from "react";
import supabase from "@/lib/supabaseClient";

export default function BoutonEnvoyer({ membre, cellule }) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSend = async () => {
    if (!membre || !cellule) {
      alert("Informations du membre ou de la cellule manquantes.");
      return;
    }

    setLoading(true);
    try {
      // ✅ insérer le suivi dans la table suivis_membres
      const { error } = await supabase.from("suivis_membres").insert([
        {
          membre_id: membre.id,
          prenom: membre.prenom,
          nom: membre.nom,
          telephone: membre.telephone,
          besoin: membre.besoin,
          infos_supplementaires: membre.infos_supplementaires,
          cellule_id: cellule.id,
          cellule_nom: cellule.cellule,
          responsable: cellule.responsable,
          statut: "envoye",
          statut_membre: membre.statut,
        },
      ]);

      if (error) throw error;

      // ✅ marquer le membre comme "actif"
      await supabase.from("membres").update({ statut: "actif" }).eq("id", membre.id);

      // ✅ retour visuel
      setDone(true);
      setTimeout(() => setDone(false), 3000);
    } catch (err) {
      console.error("Erreur lors de l'envoi :", err);
      alert("Erreur lors de l'envoi du membre.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleSend}
      disabled={loading || done}
      className={`mt-2 w-full py-2 rounded-xl text-white font-bold transition ${
        done
          ? "bg-green-500 cursor-default"
          : loading
          ? "bg-gray-400 cursor-wait"
          : "bg-gradient-to-r from-green-400 via-green-500 to-green-600 hover:opacity-90"
      }`}
    >
      {done ? "✅ Envoyé" : loading ? "Envoi..." : "📤 Envoyer"}
    </button>
  );
}
