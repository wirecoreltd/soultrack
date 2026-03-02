"use client";

import supabase from "../lib/supabaseClient";

export default function SendEgliseLinkPopup({
  label,
  type,
  superviseur,
  responsable,
  eglise,
  onSuccess
}) {

  const handleSend = async () => {
    // 🔹 Vérification de tous les champs obligatoires
    if (!responsable.prenom || !responsable.nom || !eglise.nom || !eglise.branche || !eglise.pays) {
      alert("Veuillez remplir tous les champs obligatoires (Prénom, Nom, Église, Branche, Pays).");
      return;
    }

    if (!type) {
      alert("Veuillez sélectionner un mode d’envoi.");
      return;
    }

    try {
      // 🔹 Création de l'invitation en base
      const { data, error } = await supabase
        .from("eglise_supervisions")
          .insert([
            {
              superviseur_eglise_id: superviseur.eglise_id,
              superviseur_branche_id: superviseur.branche_id,
              responsable_prenom: responsable.prenom,
              responsable_nom: responsable.nom,
              eglise_nom: eglise.nom,
              eglise_branche: eglise.branche,
              eglise_pays: eglise.pays,
              statut: "pending"
            }
          ])
        .select()
        .single();

      if (error) {
        alert(error.message);
        return;
      }

      const invitationToken = data.invitation_token;

      // 🔹 Message formaté
      const message = `
🙏 Bonjour ${responsable.prenom} ${responsable.nom},

${superviseur.prenom} ${superviseur.nom} de ${superviseur.eglise_nom} - ${superviseur.branche_nom} 
vous a envoyé une invitation pour que votre église soit placée sous sa supervision.

Cliquez sur le lien ci-dessous pour accepter, refuser ou laisser l’invitation en attente :

https://soultrack-three.vercel.app/accept-invitation?token=${invitationToken}

Que Dieu vous bénisse 🙏
`;

      // 🔹 Envoi WhatsApp
      if (type === "whatsapp") {
        window.open(
          `https://wa.me/?text=${encodeURIComponent(message)}`,
          "_blank"
        );
      }

      // 🔹 Envoi Email
      if (type === "email") {
        window.location.href = `mailto:?subject=Invitation SoulTrack&body=${encodeURIComponent(message)}`;
      }

      alert("Invitation envoyée avec succès !");
      onSuccess();

    } catch (err) {
      console.error(err);
      alert("Une erreur est survenue lors de l'envoi de l'invitation.");
    }
  };

  return (
    <button
      onClick={handleSend}
      className={`w-full py-2 rounded-xl text-white font-semibold ${
        !type
          ? "bg-gray-400 cursor-not-allowed"
          : "bg-[#333699] hover:bg-[#2a2f85]"
      }`}
    >
      {label}
    </button>
  );
}
