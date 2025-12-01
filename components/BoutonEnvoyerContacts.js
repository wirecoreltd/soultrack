"use client";

import { useState } from "react";

export default function BoutonEnvoyerContacts({
contacts,
checkedContacts,
cellule,
conseiller,
onEnvoye,
showToast,
}) {
const [loading, setLoading] = useState(false);

const handleSend = () => {
const selected = contacts.filter((c) => checkedContacts[c.id]);

```
if (selected.length === 0) {
  showToast("⚠️ Veuillez sélectionner au moins un contact.");
  return;
}

setLoading(true);

let message = "";
if (selected.length === 1) {
  message += `👋 Salut ${cellule?.responsable || conseiller?.prenom || ""},\n\n`;
  message += `🙏 Nouveau contact à suivre :\n\n`;
} else {
  message += `👋 Salut ${cellule?.responsable || conseiller?.prenom || ""},\n\n`;
  message += `🙏 ${selected.length} nouveaux contacts à suivre :\n\n`;
}

selected.forEach((c, index) => {
  message += `• ${c.prenom} ${c.nom} — 📱 ${c.telephone || "—"}\n`;
});

const phone = (cellule?.telephone || conseiller?.telephone || "").replace(/\D/g, "");
if (!phone) {
  showToast("⚠️ La cible n'a pas de numéro WhatsApp valide !");
  setLoading(false);
  return;
}

// Ouverture de WhatsApp
window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank");

// Marquer contacts comme envoyés
selected.forEach((c) => onEnvoye(c.id));

setLoading(false);
showToast("✅ Message envoyé !");
```

};

return (
<button
onClick={handleSend}
disabled={loading}
className={`w-full px-4 py-2 rounded-xl text-white font-bold shadow-md transition ${
        loading ? "bg-gray-400 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"
      }`}
>
{loading ? "⏳ Envoi..." : "📨 Envoyer"} </button>
);
}
