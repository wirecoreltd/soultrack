"use client";
import { useState } from "react";
import supabase from "../lib/supabaseClient";

export default function BoutonEnvoyerContacts({ contacts, checkedContacts, cellule, onEnvoye, showToast }) {
  const [loading, setLoading] = useState(false);

  const envoyerContacts = async () => {
    if (!cellule) {
      alert("❌ Veuillez sélectionner une cellule !");
      return;
    }

    const contactsACocher = contacts.filter(c => checkedContacts[c.id]);
    if (contactsACocher.length === 0) {
      alert("❌ Aucun contact sélectionné !");
      return;
    }

    setLoading(true);

    try {
      for (const contact of contactsACocher) {
        // 1️⃣ Enregistrement dans la table suivis_des_evangelises
        const suiviData = {
          prenom: contact.prenom,
          nom: contact.nom,
          telephone: contact.telephone,
          is_whatsapp: contact.is_whatsapp || false,
          ville: contact.ville,
          besoin: contact.besoin,
          infos_supplementaires: contact.infos_supplementaires,
          cellule_id: cellule.id,
          responsable_cellule: cellule.responsable,
          status_suivis_evangelises: "En cours",
          date_suivi: new Date().toISOString(),
        };

        const { error } = await supabase
          .from("suivis_des_evangelises")
          .insert([suiviData]);

        if (error) {
          console.error("Erreur insertion :", error.message);
          continue;
        }

        // 2️⃣ Préparation du message WhatsApp
        let message = `👋 Salut ${cellule.responsable},\n\n🙏 Nous avons un nouveau contact à suivre :\n`;
        message += `- 👤 Nom : ${contact.prenom || ""} ${contact.nom || ""}\n`;
        message += `- 📱 Téléphone : ${contact.telephone || "—"}\n`;
        message += `- 📲 WhatsApp : ${contact.is_whatsapp ? "Oui" : "Non"}\n`;
        message += `- 🏙 Ville : ${contact.ville || "—"}\n`;
        message += `- 🙏 Besoin : ${contact.besoin || "—"}\n`;
        message += `- 📝 Infos supplémentaires : ${contact.infos_supplementaires || "—"}\n\n`;
        message += "🙏 Merci pour ton cœur ❤ et ton amour ✨";

        const phone = cellule.telephone.replace(/\D/g, "");
        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank");

        // 3️⃣ Callback pour le parent pour retirer le contact de la liste
        if (onEnvoye) onEnvoye(contact.id);
      }

      if (showToast) showToast("✅ Tous les contacts sélectionnés ont été envoyés !");
    } catch (err) {
      console.error("Erreur envoi contacts :", err.message);
      alert("❌ Une erreur est survenue !");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={envoyerContacts}
      disabled={loading}
      className={`w-full px-4 py-2 rounded-lg font-bold text-white shadow-md transition-all ${
        loading ? "bg-gray-400 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"
      }`}
    >
      {loading ? "Envoi..." : "Envoyer les contacts sélectionnés"}
    </button>
  );
}
