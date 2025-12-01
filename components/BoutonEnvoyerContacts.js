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

const sendToWhatsapp = async () => {
const selected = contacts.filter((c) => checkedContacts[c.id]);
if (selected.length === 0) {
alert("❌ Sélectionnez au moins un contact !");
return;
}

```
if (!cellule && !conseiller) {
  alert("❌ Sélectionnez une cellule ou un conseiller !");
  return;
}

setLoading(true);

try {
  for (const membre of selected) {
    const now = new Date().toISOString();

    // ✅ Insérer dans suivis_membres si c’est une cellule
    if (cellule) {
      const suiviData = {
        prenom: membre.prenom,
        nom: membre.nom,
        telephone: membre.telephone,
        is_whatsapp: membre.is_whatsapp || false,
        ville: membre.ville,
        besoin: membre.besoin,
        infos_supplementaires: membre.infos_supplementaires,
        cellule_id: cellule.id,
        cellule_nom: cellule.cellule,
        responsable: cellule.responsable,
      };

      const { error: insertError } = await supabase
        .from("suivis_membres")
        .insert([suiviData]);

      if (insertError) {
        console.error("Erreur insertion :", insertError.message);
        showToast("❌ Erreur lors de l’enregistrement du suivi.");
        continue;
      }
    }

    // Message WhatsApp
    let message = "";
    if (selected.length === 1) {
      message += `👋 Salut ${cellule?.responsable || conseiller?.prenom || ""},\n\n`;
      message += `🙏 Nouveau contact à suivre :\n\n`;
    } else {
      message += `👋 Salut ${cellule?.responsable || conseiller?.prenom || ""},\n\n`;
      message += `🙏 ${selected.length} nouveaux contacts à suivre :\n\n`;
    }

    message += `- 👤 Nom : ${membre.prenom || ""} ${membre.nom || ""}\n`;
    message += `- 📱 Téléphone : ${membre.telephone || "—"}\n`;
    message += `- 💬 WhatsApp : ${membre.is_whatsapp ? "Oui" : "Non"}\n`;
    message += `- 🏙 Ville : ${membre.ville || "—"}\n`;
    message += `- ❓ Besoin : ${membre.besoin || "—"}\n`;
    message += `- 📝 Remarques : ${membre.infos_supplementaires || "—"}\n\n`;

    message += "🙏 Merci pour ton cœur ❤ et ton amour ✨";

    const phone = (cellule?.telephone || conseiller?.telephone || "")
      .replace(/\D/g, "");

    if (phone) {
      window.open(
        `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
        "_blank"
      );
    }

    if (onEnvoye) onEnvoye(membre.id);
  }

  showToast("✅ Message(s) envoyé(s) avec succès !");
} catch (error) {
  console.error("Erreur lors de l'envoi WhatsApp :", error.message);
  showToast("❌ Une erreur est survenue lors de l’envoi.");
} finally {
  setLoading(false);
}
```

};

return (
<button
onClick={sendToWhatsapp}
disabled={loading}
className={`w-full text-white font-bold px-4 py-2 rounded-xl shadow-md transition-all ${
        loading ? "bg-gray-400 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"
      }`}
>
{loading ? "Envoi..." : "✅ Envoyer par WhatsApp"} </button>
);
}
