"use client";

import { useState } from "react";
import supabase from "../lib/supabaseClient";

export default function BoutonEnvoyer({ membre, type = "cellule", cible, session, onEnvoyer, showToast }) {
  const [loading, setLoading] = useState(false);
  const statutIds = { envoye: 1, "en attente": 2, integrer: 3, refus: 4 };

  const sendToWhatsapp = () => {
    if (!session) return alert("❌ Vous devez être connecté.");
    if (!cible || !cible.telephone) return alert("❌ La cible n’a pas de numéro WhatsApp.");

    setLoading(true);

    try {
      // Construire le message
      const message = `
👋 Bonjour ${cible?.responsable || `${cible?.prenom || ""}`} !

✨ Un nouveau membre est placé sous tes soins pour être accompagné et encouragé.

👤 Nom: ${membre.prenom} ${membre.nom}
⚥ Sexe: ${membre.sexe || "—"}
📱 Téléphone: ${membre.telephone || "—"}
💬 WhatsApp: ${membre.is_whatsapp ? "Oui" : "Non"}
🏙 Ville: ${membre.ville || "—"}
🙏 Besoin: ${Array.isArray(membre.besoin) ? membre.besoin.join(", ") : membre.besoin || "—"}
📝 Infos supplémentaires: ${membre.infos_supplementaires || "—"}

Merci pour ton accompagnement et ta bienveillance ❤️
`;

      // Formater le numéro avec indicatif pays
      let phone = cible.telephone.replace(/\D/g, "");
      if (phone.length <= 8) phone = "230" + phone; // exemple pour Maurice

      // 🔹 Ouvrir WhatsApp immédiatement
      window.open(`https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`, "_blank");

      // 🔹 Insert / update Supabase en arrière-plan
      (async () => {
        try {
          // Vérifier si le membre est déjà suivi
          const { data: existing } = await supabase
            .from("suivis_membres")
            .select("*")
            .eq("telephone", membre.telephone || "");

          if (!existing || existing.length === 0) {
            const suiviData = {
              membre_id: membre.id,
              prenom: membre.prenom,
              nom: membre.nom,
              telephone: membre.telephone,
              is_whatsapp: true,
              ville: membre.ville,
              besoin: membre.besoin,
              infos_supplementaires: membre.infos_supplementaires,
              statut_suivis: statutIds["envoye"],
              created_at: new Date().toISOString(),
            };

            if (type === "cellule") {
              suiviData.cellule_id = cible?.id || null;
              suiviData.cellule_nom = cible?.cellule || "—";
              suiviData.responsable = cible?.responsable || "—";
            } else if (type === "conseiller") {
              suiviData.conseiller_id = cible?.id || null;
              suiviData.responsable = `${cible?.prenom || ""} ${cible?.nom || ""}`.trim() || "—";
            }

            await supabase.from("suivis_membres").insert([suiviData]);
          }

          // Mettre à jour le membre
          const { data: updatedMember } = await supabase
            .from("membres")
            .update({ statut: "ancien" })
            .eq("id", membre.id)
            .select()
            .single();

          if (onEnvoyer) onEnvoyer(updatedMember);
          if (showToast)
            showToast(`✅ ${membre.prenom} ${membre.nom} envoyé à ${type === "cellule" ? cible.cellule : `${cible.prenom} ${cible.nom}`}`);
        } catch (err) {
          console.error("Erreur insert/update Supabase :", err);
        } finally {
          setLoading(false);
        }
      })();
    } catch (err) {
      console.error("Erreur sendToWhatsapp :", err);
      setLoading(false);
      alert("❌ Une erreur est survenue lors de l'envoi.");
    }
  };

  return (
    <button
      onClick={sendToWhatsapp}
      disabled={loading}
      className={`w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-[#09203F] to-[#537895] hover:opacity-90 transition ${
        loading ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      {loading ? "Envoi..." : "📤 Envoyer par WhatsApp"}
    </button>
  );
}
