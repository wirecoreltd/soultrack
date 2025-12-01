"use client";

import { useState } from "react";

export default function BoutonEnvoyerContacts({ contacts, checkedContacts, cellule, conseiller, onEnvoye, showToast }) {
const [loading, setLoading] = useState(false);

const sendSelected = () => {
const selected = contacts.filter(c => checkedContacts[c.id]);
if (!selected.length) {
alert("\u26A0\uFE0F Aucun contact sélectionné !");
return;
}

```
setLoading(true);

selected.forEach((membre) => {
  // Emoji via code Unicode uniquement
  const handWave = "\u{1F44B}";
  const praying = "\u{1F64F}";
  const checkMark = "\u2705";
  const phoneEmoji = "\u{1F4F1}";
  const person = "\u{1F464}";
  const city = "\u{1F3D9}";

  let message = "";
  if (selected.length === 1) {
    message += `${handWave} Salut ${cellule?.responsable || conseiller?.prenom || ""},\n\n`;
    message += `${praying} Nouveau contact à suivre :\n\n`;
  } else {
    message += `${handWave} Salut ${cellule?.responsable || conseiller?.prenom || ""},\n\n`;
  }

  message += `- ${person} Nom : ${membre.prenom} ${membre.nom}\n`;
  message += `- ${phoneEmoji} Téléphone : ${membre.telephone || "—"}\n`;
  message += `- ${city} Ville : ${membre.ville || "—"}\n`;
  message += `- ${praying} Besoin : ${Array.isArray(membre.besoin) ? membre.besoin.join(", ") : membre.besoin || "—"}\n\n`;

  const phone = (cellule?.telephone || conseiller?.telephone || "").replace(/\D/g, "");
  if (!phone) {
    alert("\u26A0\uFE0F La cible n'a pas de numéro WhatsApp valide !");
    return;
  }

  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank");

  if (onEnvoye) onEnvoye(membre.id);
  if (showToast) showToast(`${checkMark} ${membre.prenom} ${membre.nom} a été envoyé !`);
});

setLoading(false);
```

};

return (
<button
disabled={loading}
onClick={sendSelected}
className={`w-full text-white font-bold px-4 py-2 rounded-lg shadow-lg transition-all ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"}`}
>
{loading ? "Envoi..." : "\u{1F4E4} Envoyer par WhatsApp"} </button>
);
}
