"use client";
import { useState } from "react";
import supabase from "../lib/supabaseClient";

export default function BoutonEnvoyerContacts({
  contacts,
  checkedContacts,
  cellule,
  conseiller,
  onEnvoye,
  showToast,
}) {
  const [loading, setLoading] = useState(false);

  const contactsACocher = contacts.filter((c) => checkedContacts[c.id]);
  const count = contactsACocher.length;

  const envoyerContacts = async () => {
    if (!cellule && !conseiller) {
      alert("❌ Veuillez sélectionner une cellule ou un conseiller !");
      return;
    }

    if (count === 0) {
      alert("❌ Aucun contact sélectionné !");
      return;
    }

    setLoading(true);

    try {
      const idsEnvoyes = contactsACocher.map((c) => c.id);

      const target = cellule || conseiller;

      // 1️⃣ Enregistrement dans la table suivis_des_evangelises
      const insertData = contactsACocher.map((contact) => ({
        prenom: contact.prenom,
        nom: contact.nom,
        telephone: contact.telephone,
        is_whatsapp: contact.is_whatsapp || false,
        ville: contact.ville,
        besoin: contact.besoin,
        infos_supplementaires: contact.infos_supplementaires,
        cellule_id: cellule ? cellule.id : null,
        responsable_cellule: cible ? cible.responsable : null,
        status_suivis_evangelises: "En cours",
        date_suivi: new Date().toISOString(),
      }));

      const { error: insertError } = await supabase
        .from("suivis_des_evangelises")
        .insert(insertData);

      if (insertError) {
        console.error("Erreur insertion :", insertError.message);
        alert("❌ Une erreur est survenue !");
        setLoading(false);
        return;
      }

      // 2️⃣ Supprimer les contacts envoyés de evangelises
      const { error: deleteError } = await supabase
        .from("evangelises")
        .delete()
        .in("id", idsEnvoyes);

      if (deleteError) console.error("Erreur suppression :", deleteError.message);

      // 3️⃣ Générer le message WhatsApp
      const intro = count === 1 ? "une nouvelle âme" : "des nouvelles âmes";

      let message = `👋 Salut ${target.responsable || target.prenom},\n\n🙏 Nous avons ${intro} qui sont venu Christ à suivre :\n\n`;

      contactsACocher.forEach((contact) => {
        message += `- 👤 Nom : ${contact.prenom} ${contact.nom}\n`;
        message += `- 📱 Téléphone : ${contact.telephone || "—"}\n`;
        message += `- 📲 WhatsApp : ${contact.is_whatsapp ? "Oui" : "Non"}\n`;
        message += `- 🏙 Ville : ${contact.ville || "—"}\n`;
        message += `- 🙏 Besoin : ${contact.besoin || "—"}\n`;
        message += `- 📝 Infos supplémentaires : ${contact.infos_supplementaires || "—"}\n\n`;
      });

      message += "🙏 Merci pour ton cœur ❤ et ton amour ✨";

      if (target.telephone) {
        const phone = target.telephone.replace(/\D/g, "");
        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank");
      }

      // 4️⃣ Mettre à jour la page côté client
      if (onEnvoye) {
        contactsACocher.forEach((c) => onEnvoye(c.id));
      }

      if (showToast) showToast("✅ Tous les contacts sélectionnés ont été envoyés !");
    } catch (err) {
      console.error("Erreur envoi contacts :", err.message);
      alert("❌ Une erreur est survenue !");
    } finally {
      setLoading(false);
    }
  };

  if (count === 0) return null;

  return (
    <button
      onClick={envoyerContacts}
      disabled={loading}
      className={`px-6 py-2 rounded-lg font-bold text-white shadow-md transition-all ${
        loading ? "bg-gray-400 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"
      }`}
    >
      {loading
        ? "Envoi..."
        : count === 1
        ? "Envoyer le contact"
        : "Envoyer les contacts"}
    </button>
  );
}
