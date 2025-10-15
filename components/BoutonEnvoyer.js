"use client";
import { useState } from "react";
import supabase from "../lib/supabaseClient";

export default function BoutonEnvoyer({ membre, cellule, onStatutChange }) {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    // Vérifie la session utilisateur
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      console.error("Erreur de session:", sessionError.message);
      alert("Erreur de session Supabase");
      return;
    }

    if (!session) {
      alert("❌ Erreur : utilisateur non connecté");
      return;
    }

    if (!cellule) {
      alert("⚠️ Sélectionne une cellule avant d’envoyer !");
      return;
    }

    setLoading(true);

    try {
      // 🔹 Insertion dans la table suivis_membres
      const { error } = await supabase.from("suivis_membres").insert([
        {
          membre_id: membre.id,
          cellule_id: cellule.id,
          prenom: membre.prenom,
          nom: membre.nom,
          telephone: membre.telephone,
          statut_membre: membre.statut,
          besoin: membre.besoin,
          infos_supplementaires: membre.infos_supplementaires,
          cellule_nom: cellule.cellule,
          responsable: cellule.responsable,
          statut: "envoye",
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) {
        console.error("Erreur insertion :", error);
        alert("❌ Erreur lors de l’envoi vers le suivi");
      } else {
        // 🔹 Si le membre est "visiteur" ou "veut rejoindre ICC", on le rend "actif"
        if (
          membre.statut === "visiteur" ||
          membre.statut === "veut rejoindre ICC"
        ) {
          const { error: updateError } = await supabase
            .from("membres")
            .update({ statut: "actif" })
            .eq("id", membre.id);

          if (updateError) {
            console.error("Erreur mise à jour statut:", updateError.message);
          } else {
            // 🔹 Mise à jour dynamique du state parent
            onStatutChange?.(membre.id, "actif");
          }
        }

        alert(`✅ ${membre.prenom} ${membre.nom} a été envoyé au responsable ${cellule.responsable}`);
        setSent(true);
      }
    } catch (err) {
      console.error("Exception lors de l’envoi :", err.message);
      alert("Erreur inattendue lors de l’envoi");
    }

    setLoading(false);
  };

  return (
    <button
      onClick={handleSend}
      disabled={loading || sent}
      className={`mt-3 w-full py-2 rounded-lg text-white font-semibold transition duration-300 ${
        sent
          ? "bg-green-500 cursor-not-allowed"
          : loading
          ? "bg-gray-400 cursor-wait"
          : "bg-sky-500 hover:bg-sky-600"
      }`}
    >
      {sent ? "✅ Envoyé" : loading ? "⏳ Envoi..." : "📤 Envoyer au responsable"}
    </button>
  );
}
