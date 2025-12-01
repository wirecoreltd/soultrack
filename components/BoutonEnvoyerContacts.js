"use client";

import { useState } from "react";
import supabase from "../lib/supabaseClient";

export default function BoutonEnvoyerContacts({ membres, type = "cellule", cible, session, onEnvoyer, showToast }) {
  const [loading, setLoading] = useState(false);

  const statutIds = { envoye: 1, "en attente": 2, integrer: 3, refus: 4 };

  const sendToWhatsapp = async () => {
    if (!session) {
      alert("❌ Vous devez être connecté pour envoyer un membre.");
      return;
    }
    if (!cible) {
      alert("❌ Sélectionnez une cible !");
      return;
    }

    setLoading(true);

    try {
      for (const membre of membres) {
        // Vérification par numéro de téléphone dans la table des suivis
        const { data: existing, error: selectError } = await supabase
          .from("suivis_des_evangelises")
          .select("*")
          .eq("telephone", membre.telephone || "");
        if (selectError) throw selectError;

        if (existing.length > 0) {
          alert(`⚠️ Le contact ${membre.prenom} ${membre.nom} est déjà dans les suivis.`);
          continue;
        }

        // Préparer l'objet de suivi
        const suiviData = {
          membre_id: membre.id,
          prenom: membre.prenom,
          nom: membre.nom,
          telephone: membre.telephone,
          is_whatsapp: true,
          ville: membre.ville || null,
          besoin: membre.besoin || null,
          infos_supplementaires: membre.infos_supplementaires || null,
          status_suivis_evangelises: "En cours",
          date_suivi: new Date().toISOString(),
          cellule_id: type === "cellule" ? cible.id : null,
          cellule_nom: type === "cellule" ? cible.cellule : null,
          responsable_cellule: type === "cellule" ? cible.responsable : `${cible.prenom || ""} ${cible.nom || ""}`.trim(),
          evangeliste_nom: "TODO: nom évangéliste", // optionnel
        };

        // Insérer dans la table des suivis
        const { data: insertedData, error: insertError } = await supabase
          .from("suivis_des_evangelises")
          .insert([suiviData])
          .select()
          .single();
        if (insertError) throw insertError;

        // Callback pour suppression du contact sur la page Evangelisation
        if (onEnvoyer) onEnvoyer(insertedData);

        // Préparer message WhatsApp
        let message = `👋 Salut ${cible.responsable || (cible.prenom ? `${cible.prenom} ${cible.nom}` : "")}!\n\n`;
        message += `🙏 Nouveau membre à suivre :\n`;
        message += `- 👤 Nom : ${membre.prenom} ${membre.nom}\n`;
        message += `- 📱 Téléphone : ${membre.telephone || "—"}\n`;
        message += `- 🏙 Ville : ${membre.ville || "—"}\n`;
        message += `- 🙏 Besoin : ${Array.isArray(membre.besoin) ? membre.besoin.join(", ") : membre.besoin || "—"}\n\n🙏 Merci !`;

        const phone = (cible.telephone || "").replace(/\D/g, "");
        if (phone) {
          window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank");
        } else {
          alert("❌ La cible n'a pas de numéro WhatsApp valide !");
        }
      }

      if (showToast) showToast("✅ Contact(s) envoyé(s) !");
    } catch (err) {
      console.error("Erreur sendToWhatsapp:", err);
      alert("❌ Une erreur est survenue lors de l'envoi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={sendToWhatsapp}
      disabled={loading}
      className={`w-full text-white font-bold px-4 py-2 rounded-lg shadow-lg transition-all ${
        loading ? "bg-gray-400 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"
      }`}
    >
      {loading ? "Envoi..." : "📤 Envoyer par WhatsApp"}
    </button>
  );
}
