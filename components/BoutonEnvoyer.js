"use client";
import { useState } from "react";
import supabase from "../lib/supabaseClient";

export default function BoutonEnvoyer({
  membre,
  type = "cellule",
  cible,
  session,
  onEnvoyer,
  showToast,
}) {
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
      /* ================================
         Vérification doublon
      ================================= */
      const { data: existing, error: selectError } = await supabase
        .from("suivis_membres")
        .select("id")
        .eq("telephone", membre.telephone || "");

      if (selectError) throw selectError;

      if (existing.length > 0) {
        alert(`⚠️ ${membre.prenom} ${membre.nom} est déjà suivi.`);
        setLoading(false);
        return;
      }

      /* ================================
         Données de suivi
      ================================= */
      const suiviData = {
        membre_id: membre.id,
        prenom: membre.prenom,
        nom: membre.nom,
        telephone: membre.telephone,
        is_whatsapp: membre.is_whatsapp,
        ville: membre.ville,
        besoin: membre.besoin,
        infos_supplementaires: membre.infos_supplementaires,
        statut_suivis: statutIds.envoye,
        created_at: new Date().toISOString(),
      };

      let destPrenom = "—";
      let destTelephone = "";

      /* ================================
         CELLULE → RESPONSABLE
      ================================= */
      if (type === "cellule") {
        suiviData.cellule_id = cible.id;
        suiviData.cellule_nom = cible.cellule_full || cible.cellule || "—";
        suiviData.responsable = cible.responsable || "—";

        if (!cible.responsable_id) {
          throw new Error("Responsable de cellule introuvable");
        }

        const { data: responsable, error } = await supabase
          .from("profiles")
          .select("prenom, telephone")
          .eq("id", cible.responsable_id)
          .single();

        if (error || !responsable) {
          throw new Error("Profil du responsable introuvable");
        }

        destPrenom = responsable.prenom;
        destTelephone = responsable.telephone;
      }

      /* ================================
         CONSEILLER
      ================================= */
      if (type === "conseiller") {
        suiviData.conseiller_id = cible.id;
        suiviData.responsable = `${cible.prenom} ${cible.nom}`.trim();

        destPrenom = cible.prenom;
        destTelephone = cible.telephone;
      }

      /* ================================
         Insertion suivi
      ================================= */
      const { data: inserted, error: insertError } = await supabase
        .from("suivis_membres")
        .insert([suiviData])
        .select()
        .single();

      if (insertError) throw insertError;

      await supabase
        .from("membres")
        .update({ statut: "actif" })
        .eq("id", membre.id);

      if (onEnvoyer) onEnvoyer(inserted);

      /* ================================
         MESSAGE WHATSAPP (TON TEXTE)
      ================================= */
      let message = `👋 Bonjour ${destPrenom}\n\n`;
      message += `✨ Un nouveau membre est placé sous tes soins.\n\n`;
      message += `👤 Nom: ${membre.prenom} ${membre.nom}\n`;
      message += `⚥ Sexe: ${membre.sexe || "—"}\n`;
      message += `📱 Téléphone: ${membre.telephone || "—"}\n`;
      message += `💬 WhatsApp: ${membre.is_whatsapp ? "Oui" : "Non"}\n`;
      message += `🏙 Ville: ${membre.ville || "—"}\n`;
      message += `🙏 Besoin: ${
        Array.isArray(membre.besoin)
          ? membre.besoin.join(", ")
          : membre.besoin || "—"
      }\n`;
      message += `📝 Infos supplémentaires: ${
        membre.infos_supplementaires || "—"
      }\n\n`;
      message += `Merci pour ton accompagnement ❤️`;

      const phone = String(destTelephone || "").replace(/\D/g, "");

      if (!phone) {
        alert("❌ Le responsable n'a pas de numéro WhatsApp valide !");
        return;
      }

      window.open(
        `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
        "_blank"
      );

      if (showToast) {
        showToast(
          `✅ ${membre.prenom} ${membre.nom} a été envoyé à ${destPrenom}`
        );
      }
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
        loading
          ? "bg-gray-400 cursor-not-allowed"
          : "bg-green-500 hover:bg-green-600"
      }`}
    >
      {loading ? "Envoi..." : "📤 Envoyer par WhatsApp"}
    </button>
  );
}
