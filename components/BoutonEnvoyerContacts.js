"use client";

import { useState } from "react";
import supabase from "../lib/supabaseClient";

export default function BoutonEnvoyerContacts({ membres, type, cible, session, showToast }) {
const [loading, setLoading] = useState(false);

const sendToWhatsapp = async () => {
if (!session || !session.user) {
showToast("❌ Vous devez être connecté pour envoyer un membre.");
return;
}

if (!cible) {
  showToast("❌ Cible invalide.");
  return;
}

const cibleId = type === "cellule" ? parseInt(cible.id, 10) : cible.id;
if (!cibleId) {
  showToast("❌ ID de la cible invalide.");
  return;
}

// Récupération et nettoyage des numéros
const numeros = membres
  .map(m => m.telephone?.replace(/\D/g, '')) // ne garder que les chiffres
  .filter(Boolean);

if (numeros.length === 0) {
  showToast("❌ Aucun numéro valide à envoyer.");
  return;
}

setLoading(true);

try {
  const { data, error } = await supabase
    .from("evangelises")
    .insert(
      numeros.map(n => ({
        telephone: n,
        cible_id: cibleId,
        type_cible: type,
        envoyé_par: session.user.id
      }))
    );

  if (error) throw error;
  showToast("✅ Envoi réussi !");
} catch (err) {
  console.error("Erreur sendToWhatsapp:", err);
  showToast("❌ Une erreur est survenue lors de l'envoi.");
} finally {
  setLoading(false);
}

};

return (
<button
onClick={sendToWhatsapp}
disabled={loading}
className={mt-2 w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-md transition ${loading ? "opacity-50 cursor-not-allowed" : ""}}
>
{loading ? "Envoi en cours..." : 📤 Envoyer ${membres.length} contact(s)}

);
}
