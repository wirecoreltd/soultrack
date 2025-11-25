"use client";
import { useState } from "react";
import supabase from "../lib/supabaseClient";

export default function BoutonEnvoyer({ membre, type = "cellule", cible, session, onEnvoyer, showToast }) {
  const [loading, setLoading] = useState(false);

  // 🔹 Mapping texte ↔ integer
  const statutMapping = {
    envoye: 1,
    "en attente": 2,
    integrer: 3,
    refus: 4
  };

  const statutLabelMapping = {
    1: "envoye",
    2: "en attente",
    3: "integrer",
    4: "refus"
  };

  const sendToWhatsapp = async (force = false) => {
    if (!session) return alert("❌ Vous devez être connecté pour envoyer un membre.");
    if (!cible || !cible.id) return alert("❌ Sélectionnez une cellule ou un conseiller !");
    if (!membre || !membre.id) return alert("❌ Le membre sélectionné n'est pas valide !");

    setLoading(true);

    try {
      // 🔹 Vérification si le membre existe déjà
      const { data: existing, error: selectError } = await supabase
        .from("suivis_membres")
        .select("*")
        .eq("membre_id", membre.id);

      if (selectError) throw selectError;

      if (existing.length > 0 && !force) {
        alert(`⚠️ Le contact ${membre.prenom} ${membre.nom} est déjà dans la liste des suivis.`);
        setLoading(false);
        return;
      }

      // 🔹 Préparer les données du suivi
      const suiviData = {
        membre_id: membre.id,
        prenom: membre.prenom || "",
        nom: membre.nom || "",
        telephone: membre.telephone || "",
        is_whatsapp: true,
        ville: membre.ville || "",
        besoin: membre.besoin || "",
        infos_supplementaires: membre.infos_supplementaires || "",
        statut_suivis: statutMapping.envoye, // ✅ integer pour trigger
        created_at: new Date().toISOString(),
      };

      // 🔹 Attribution selon le type
      if (type === "cellule") {
        suiviData.cellule_id = cible.id;
        suiviData.cellule_nom = cible.cellule || "";
        suiviData.responsable = cible.responsable || "";
      } else if (type === "conseiller") {
        suiviData.conseiller_id = cible.id;
        suiviData.responsable = `${cible.prenom || ""} ${cible.nom || ""}`.trim();
      }

      // 🔹 Insertion dans la table suivis_membres
      const { error: insertError } = await supabase.from("suivis_membres").insert([suiviData]);
      if (insertError) throw insertError;

      // 🔹 Mise à jour du statut du membre
      const { error: updateMemberError } = await supabase
        .from("membres")
        .update({ statut: "actif" })
        .eq("id", membre.id);
      if (updateMemberError) throw updateMemberError;

      // 🔹 Callback local
      if (onEnvoyer) onEnvoyer(membre.id, type, cible, "actif");

      // 🔹 Préparer le message WhatsApp
      const phone = (cible.telephone || "").replace(/\D/g, "");
      if (!phone) {
        alert("❌ La cible n'a pas de numéro valide.");
      } else {
        const message = `👋 Salut ${suiviData.responsable}!\n\n` +
          `🙏 Nouveau membre à suivre :\n` +
          `- 👤 Nom : ${membre.prenom} ${membre.nom}\n` +
          `- 📱 Téléphone : ${membre.telephone || "—"}\n` +
          `- 🏙 Ville : ${membre.ville || "—"}\n` +
          `- 🙏 Besoin : ${membre.besoin || "—"}\n` +
          `- 📌 Statut : ${statutLabelMapping[suiviData.statut_suivis]}\n\n🙏 Merci !`;

        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank");
      }

      if (showToast) {
        showToast(`✅ ${membre.prenom} ${membre.nom} a été envoyé à ${type === "cellule" ? cible.cellule : `${cible.prenom} ${cible.nom}`} !`);
      }

    } catch (err) {
      console.error("Erreur sendToWhatsapp:", err);
      alert("❌ Une erreur est survenue lors de l'envoi : " + JSON.stringify(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={() => sendToWhatsapp()}
      disabled={loading}
      className={`w-full text-white font-bold px-4 py-2 rounded-lg shadow-lg transition-all ${
        loading ? "bg-gray-400 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"
      }`}
    >
      {loading ? "Envoi..." : "📤 Envoyer par WhatsApp"}
    </button>
  );
}
