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
         1️⃣ Recharger la cellule ou conseiller
      ========================= */
      let responsablePrenom = "";
      let responsableTelephone = "";

      if (type === "cellule") {
        const { data: cellule, error: celluleError } = await supabase
          .from("cellules")
          .select("id, cellule_full, responsable_id")
          .eq("id", cible.id)
          .single();

        if (celluleError || !cellule?.responsable_id) {
          throw new Error("Responsable de cellule introuvable");
        }

        const { data: responsable, error: respError } = await supabase
          .from("profiles")
          .select("prenom, telephone")
          .eq("id", cellule.responsable_id)
          .single();

        if (respError || !responsable?.telephone) {
          throw new Error("Le responsable n'a pas de numéro WhatsApp valide");
        }

        responsablePrenom = responsable.prenom;
        responsableTelephone = responsable.telephone;
      }

      if (type === "conseiller") {
        if (!cible.telephone) {
          throw new Error("Le conseiller n'a pas de numéro WhatsApp valide");
        }
        responsablePrenom = cible.prenom;
        responsableTelephone = cible.telephone;
      }

      /* =========================
         2️⃣ Créer le suivi
      ========================= */
      const suiviData = {
        membre_id: membre.id,
      
        // snapshot membre
        prenom: membre.prenom,
        nom: membre.nom,
        telephone: membre.telephone,
        ville: membre.ville,
        sexe: membre.sexe,
        besoin: membre.besoin,
        infos_supplementaires: membre.infos_supplementaires,
      
        // suivi
        statut_suivis: statutIds.envoye,
        statut_libelle: "statutIds.envoye",
        is_whatsapp: true,
      
        // affectation
        cellule_id: type === "cellule" ? cible.id : null,
        conseiller_id: type === "conseiller" ? cible.id : null,
        responsable: responsablePrenom,
      
        created_at: new Date().toISOString(),
      };

      if (type === "cellule") {
        suiviData.cellule_id = cible.id;
        suiviData.responsable = responsablePrenom;
      }

      if (type === "conseiller") {
        suiviData.conseiller_id = cible.id;
        suiviData.responsable = responsablePrenom;
      }

      const { data: suivi, error: insertError } = await supabase
        .from("suivis_membres")
        .insert([{
          membre_id: membre.id,
          statut_suivis: statutIds.envoye,
          cellule_id: type === "cellule" ? cible.id : null,
          conseiller_id: type === "conseiller" ? cible.id : null,
          responsable: responsablePrenom,
          created_at: new Date().toISOString(),
        }])
        .select()
        .single();
      
      if (insertError) throw insertError;

      /* =========================
         3️⃣ Mettre à jour le statut du membre
      ========================= */
      const { error: updateError } = await supabase
        .from("membres_complets")
        .update({
          statut: "actif",
          suivi_id: suivi.id,
          suivi_statut: statutIds.envoye,
          suivi_responsable: responsablePrenom,
          suivi_responsable_id:
            type === "cellule"
              ? cellule.responsable_id
              : cible.id,
          suivi_updated_at: new Date().toISOString(),
        })
        .eq("id", membre.id);
      
      if (updateError) throw updateError;

      /* =========================
         4️⃣ Callback pour refresh UI
      ========================= */
      if (onEnvoyer) {
        onEnvoyer({
          ...membre,
          statut: "actif",
          isNouveau: false,
        });
      }

       let besoinsArray = [];
      if (Array.isArray(membre.besoin)) {
        besoinsArray = membre.besoin;
      } else if (typeof membre.besoin === "string" && membre.besoin.startsWith("[")) {
        try {
          besoinsArray = JSON.parse(membre.besoin);
        } catch {
          besoinsArray = [];
        }
      }

      /* =========================
         5️⃣ Message WhatsApp
      ========================= */
      let message = `👋 Bonjour ${responsablePrenom}\n\n`;
      message += `✨ Un nouveau membre est placé sous tes soins.\n\n`;
      message += `👤 Nom: ${membre.prenom} ${membre.nom}\n`;
      message += `⚥ Sexe: ${membre.sexe || "—"}\n`;
      message += `📱 Téléphone: ${membre.telephone || "—"}\n`;
      message += `💬 WhatsApp: ${membre.is_whatsapp ? "Oui" : "Non"}\n`;
      message += `🧩 Comment est-il venu : ${membre.venu || "—"}\n`;
      message += `🏙 Ville: ${membre.ville || "—"}\n`;
      message += `🙏 Besoin: ${
        besoinsArray.length > 0 ? besoinsArray.join(", ") : "—"
      }\n`;
      message += `📝 Infos supplémentaires: ${
        membre.infos_supplementaires || "—"
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
      console.error("Erreur sendToWhatsapp:", err.message);
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
