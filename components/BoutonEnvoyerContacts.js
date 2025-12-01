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
  smallButton = false, // nouvelle prop
}) {
  const [loading, setLoading] = useState(false);

  const envoyerContacts = async () => {
    const target = cellule || conseiller;
    if (!target) {
      alert("❌ Veuillez sélectionner une cellule ou un conseiller !");
      return;
    }

    const contactsACocher = contacts.filter(c => checkedContacts[c.id]);
    if (contactsACocher.length === 0) {
      alert("❌ Aucun contact sélectionné !");
      return;
    }

    setLoading(true);

    try {
      const idsEnvoyes = contactsACocher.map(c => c.id);

      // 1️⃣ Enregistrement dans la table suivis_des_evangelises
      const insertData = contactsACocher.map(contact => ({
        prenom: contact.prenom,
        nom: contact.nom,
        telephone: contact.telephone,
        is_whatsapp: contact.is_whatsapp || false,
        ville: contact.ville,
        besoin: contact.besoin,
        infos_supplementaires: contact.infos_supplementaires,
        cellule_id: cellule ? cellule.id : null,
        responsable_cellule: cellule ? cellule.responsable : null,
        conseiller_id: conseiller ? conseiller.id : null,
        responsable_conseiller: conseiller ? `${conseiller.prenom} ${conseiller.nom}` : null,
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
      const intro = contactsACocher.length === 1 ? "une nouvelle âme" : "des nouvelles âmes";

      let message = `👋 Salut ${cellule ? cellule.responsable : `${conseiller.prenom} ${conseiller.nom}`},\n\n🙏 Nous avons ${intro} à suivre :\n\n`;

      contactsACocher.forEach(contact => {
        message += `- 👤 Nom : ${contact.prenom} ${contact.nom}\n`;
        message += `- 📱 Téléphone : ${contact.telephone || "—"}\n`;
        message += `- 📲 WhatsApp : ${contact.is_whatsapp ? "Oui" : "Non"}\n`;
        message += `- 🏙 Ville : ${contact.ville || "—"}\n`;
        message += `- 🙏 Besoin : ${contact.besoin || "—"}\n`;
        message += `- 📝 Infos supplémentaires : ${contact.infos_supplementaires || "—"}\n\n`;
      });

      message += "🙏 Merci pour ton cœur ❤ et ton amour ✨";

      const phone = (cellule ? cellule.telephone : conseiller.telephone).replace(/\D/g, "");
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank");

      // 4️⃣ Mettre à jour la page côté client
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
    <div className="flex justify-center w-full">
      <button
        onClick={envoyerContacts}
        disabled={loading}
        className={`px-4 py-2 rounded-lg font-bold text-white shadow-md transition-all ${
          loading ? "bg-gray-400 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"
        } ${smallButton ? "w-auto" : "w-full"}`}
      >
        {loading ? "Envoi..." : "Envoyer les contacts sélectionnés"}
      </button>
    </div>
  );
}
