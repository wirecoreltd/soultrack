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
      // 1️⃣ Enregistrement dans la base
      const insertData = contactsACocher.map(contact => ({
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
      }));

      const { error } = await supabase
        .from("suivis_des_evangelises")
        .insert(insertData);

      if (error) {
        console.error("Erreur insertion :", error.message);
        alert("❌ Une erreur est survenue !");
        setLoading(false);
        return;
      }

      // 2️⃣ Créer un message WhatsApp regroupé
      let message = `👋 Salut ${cellule.responsable},\n\n🙏 Nouveaux contacts à suivre :\n\n`;
      contactsACocher.forEach(contact => {
        message += `- 👤 ${contact.prenom} ${contact.nom}\n`;
        message += `- 📱 ${contact.telephone || "—"}\n`;
        message += `- 🏙 Ville : ${contact.ville || "—"}\n`;
        message += `- 🙏 Besoin : ${contact.besoin || "—"}\n`;
        message += `- 📝 Infos : ${contact.infos_supplementaires || "—"}\n\n`;
      });
      message += "🙏 Merci pour ton cœur ❤ et ton amour ✨";

      const phone = cellule.telephone.replace(/\D/g, "");
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank");

      // 3️⃣ Retirer les contacts envoyés de la liste
      if (onEnvoye) {
        contactsACocher.forEach(c => onEnvoye(c.id));
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
