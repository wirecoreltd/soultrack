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

  const statutIds = {
    envoye: 1,
    "en attente": 2,
    integrer: 3,
    refus: 4,
  };

  const sendToWhatsapp = async () => {
    if (!session) {
      alert("❌ Vous devez être connecté.");
      return;
    }

    if (!cible?.id) {
      alert("❌ Cible invalide.");
      return;
    }

    setLoading(true);

    try {
      /* =========================
         1️⃣ Responsable
      ========================= */
      let responsablePrenom = "";
      let responsableTelephone = "";
      let responsableId = null;

      if (type === "cellule") {
        const { data: cellule, error } = await supabase
          .from("cellules")
          .select("id, responsable_id")
          .eq("id", cible.id)
          .single();

        if (error || !cellule?.responsable_id) {
          throw new Error("Responsable de cellule introuvable");
        }

        const { data: responsable, error: respError } = await supabase
          .from("profiles")
          .select("prenom, telephone")
          .eq("id", cellule.responsable_id)
          .single();

        if (respError || !responsable?.telephone) {
          throw new Error("Numéro WhatsApp invalide");
        }

        responsablePrenom = responsable.prenom;
        responsableTelephone = responsable.telephone;
        responsableId = cellule.responsable_id;
      }

      if (type === "conseiller") {
        responsablePrenom = cible.prenom;
        responsableTelephone = cible.telephone;
        responsableId = cible.id;
      }

      /* =========================
         2️⃣ Créer le suivi
      ========================= */
      const { data: suivi, error: suiviError } = await supabase
        .from("suivis_membres")
        .insert([
          {
            membre_id: membre.id,
            prenom: membre.prenom,
            nom: membre.nom,
            telephone: membre.telephone,
            ville: membre.ville,
            sexe: membre.sexe,
            besoin: membre.besoin,
            infos_supplementaires: membre.infos_supplementaires,
            statut_suivis: statutIds.envoye,
            is_whatsapp: membre.is_whatsapp,
            cellule_id: type === "cellule" ? cible.id : null,
            conseiller_id: type === "conseiller" ? cible.id : null,
            responsable: responsablePrenom,
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (suiviError) throw suiviError;

      /* =========================
         3️⃣ Update membre
      ========================= */
      const { error: updateError } = await supabase
        .from("membres_complets")
        .update({
          statut: "actif",
          suivi_id: suivi.id,
          suivi_statut: statutIds.envoye,
          suivi_responsable: responsablePrenom,
          suivi_responsable_id: responsableId,
          suivi_updated_at: new Date().toISOString(),
          cellule_id: type === "cellule" ? cible.id : null,
          conseiller_id: type === "conseiller" ? cible.id : null,
        })
        .eq("id", membre.id);

      if (updateError) throw updateError;

      /* =========================
         4️⃣ Refresh UI
      ========================= */
      if (onEnvoyer) {
        onEnvoyer({ ...membre, statut: "actif" });
      }

      /* =========================
         5️⃣ WhatsApp
      ========================= */
      let besoinsArray = Array.isArray(membre.besoin)
        ? membre.besoin
        : [];

      let message = `👋 Bonjour ${responsablePrenom}\n\n`;
      message += `✨ Un nouveau membre est placé sous tes soins.\n\n`;
      message += `👤 ${membre.prenom} ${membre.nom}\n`;
      message += `📱 ${membre.telephone}\n`;
      message += `🏙 ${membre.ville || "—"}\n`;
      message += `🙏 Besoin: ${
        besoinsArray.length ? besoinsArray.join(", ") : "—"
      }\n\n`;
      message += `Merci pour ton accompagnement ❤️`;

      const phone = responsableTelephone.replace(/\D/g, "");
      window.open(
        `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
        "_blank"
      );

      if (showToast) {
        showToast(
          `✅ ${membre.prenom} ${membre.nom} envoyé à ${responsablePrenom}`
        );
      }
    } catch (err) {
      console.error("Erreur sendToWhatsapp:", err);
      alert(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={sendToWhatsapp}
      disabled={loading}
      className={`w-full text-white font-bold px-4 py-2 rounded-lg shadow-lg ${
        loading
          ? "bg-gray-400 cursor-not-allowed"
          : "bg-green-500 hover:bg-green-600"
      }`}
    >
      {loading ? "Envoi..." : "📤 Envoyer par WhatsApp"}
    </button>
  );
}
