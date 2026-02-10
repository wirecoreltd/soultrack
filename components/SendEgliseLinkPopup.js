"use client";

import { useState } from "react";
import supabase from "../lib/supabaseClient";
import { v4 as uuidv4 } from "uuid";

export default function SendEgliseLinkPopup({
  label,
  type,
  superviseur,
  eglise,
  superviseurEgliseId,
  superviseurBrancheId,
  onSuccess
}) {

  const [showPopup, setShowPopup] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {

    if (!superviseur.prenom || !superviseur.nom || !eglise.nom) {
      alert("⚠️ Veuillez remplir le prénom, nom du responsable et le nom de l'église.");
      return;
    }

    setLoading(true);
    const token = uuidv4();

    try {

      const { error } = await supabase
        .from("eglise_supervisions")
        .insert([{
          // SUPERVISEUR
          superviseur_eglise_id: superviseurEgliseId,
          superviseur_branche_id: superviseurBrancheId,

          // SUPERVISÉ (pas encore connu)
          supervisee_eglise_id: null,
          supervisee_branche_id: null,

          // INFOS CONTACT
          responsable_prenom: superviseur.prenom,
          responsable_nom: superviseur.nom,
          responsable_email: superviseur.email || "",
          responsable_telephone: superviseur.telephone || "",

          // INFOS ÉGLISE INVITÉE
          eglise_nom: eglise.nom,
          eglise_branche: eglise.branche,

          invitation_token: token,
          statut: "pending",
          created_at: new Date().toISOString()
        }]);

      if (error) {
        console.error("Erreur en envoyant l'invitation :", error);
        alert("⚠️ Une erreur est survenue : " + error.message);
        setLoading(false);
        return;
      }

      // Générer lien
      const link = `${window.location.origin}/accept-invitation?token=${token}`;

      // Envoi WhatsApp / Email
      if (type === "whatsapp") {

        const whatsappLink = phoneNumber
          ? `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(
              `🙏 Bonjour, invitation de supervision.\n\nSuperviseur : ${superviseur.prenom} ${superviseur.nom}\nÉglise : ${eglise.nom}\nBranche : ${eglise.branche || "—"}\n\nLien : ${link}`
            )}`
          : `https://api.whatsapp.com/send?text=${encodeURIComponent(
              `🙏 Bonjour, invitation de supervision.\n\nSuperviseur : ${superviseur.prenom} ${superviseur.nom}\nÉglise : ${eglise.nom}\nBranche : ${eglise.branche || "—"}\n\nLien : ${link}`
            )}`;

        window.open(whatsappLink, "_blank");

      } else {

        const subject = "Invitation de supervision";
        const body = `Bonjour,\n\nVous êtes invité à être supervisé.\n\nSuperviseur : ${superviseur.prenom} ${superviseur.nom}\nÉglise : ${eglise.nom}\nBranche : ${eglise.branche || "—"}\n\nLien : ${link}`;

        window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      }

      setShowPopup(false);
      setPhoneNumber("");
      setLoading(false);

      if (onSuccess) onSuccess();

    } catch (err) {
      console.error(err);
      alert("Erreur inattendue.");
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowPopup(true)}
        className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-[#09203F] to-[#537895]"
        disabled={loading}
      >
        {loading ? "Envoi..." : label}
      </button>

      {showPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full">

            <h2 className="text-xl font-bold mb-3">{label}</h2>

            {type === "whatsapp" && (
              <input
                type="text"
                placeholder="Numéro WhatsApp"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full border rounded-xl px-4 py-3 mb-4"
              />
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowPopup(false)}
                className="flex-1 py-3 bg-gray-300 rounded-2xl"
              >
                Annuler
              </button>

              <button
                onClick={handleSend}
                className="flex-1 py-3 bg-green-500 text-white rounded-2xl"
              >
                Envoyer
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
