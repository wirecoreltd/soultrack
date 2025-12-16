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
  label = "Envoyer par WhatsApp",
}) {
  const [showPopup, setShowPopup] = useState(false);
  const [manualPhone, setManualPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const statutIds = { envoye: 1, "en attente": 2, integrer: 3, refus: 4 };

  const handleSend = () => {
    if (!session) return alert("❌ Vous devez être connecté.");

    setLoading(true);

    try {
      const message = `
👋 Bonjour !

✨ Un nouveau membre est placé sous tes soins pour être accompagné et encouragé.

👤 Nom: ${membre.prenom} ${membre.nom}
⚥ Sexe: ${membre.sexe || "—"}
📱 Téléphone: ${membre.telephone || "—"}
💬 WhatsApp: ${membre.is_whatsapp ? "Oui" : "Non"}
🏙 Ville: ${membre.ville || "—"}
🙏 Besoin: ${Array.isArray(membre.besoin) ? membre.besoin.join(", ") : membre.besoin || "—"}
📝 Infos supplémentaires: ${membre.infos_supplementaires || "—"}

Merci pour ton accompagnement ❤️
`;

      // 🔹 Numéro cible OU numéro manuel
      let phone = (cible?.telephone || manualPhone || "").replace(/\D/g, "");
      if (phone && phone.length <= 8) phone = "230" + phone; // Maurice

      // 🔹 WhatsApp : avec numéro OU choix du contact
      const whatsappUrl = phone
        ? `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`
        : `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;

      window.open(whatsappUrl, "_blank");

      setShowPopup(false);
      setManualPhone("");

      // 🔹 Supabase en arrière-plan
      (async () => {
        try {
          const { data: existing } = await supabase
            .from("suivis_membres")
            .select("id")
            .eq("telephone", membre.telephone || "");

          if (!existing || existing.length === 0) {
            const suiviData = {
              membre_id: membre.id,
              prenom: membre.prenom,
              nom: membre.nom,
              telephone: membre.telephone,
              ville: membre.ville,
              besoin: membre.besoin,
              infos_supplementaires: membre.infos_supplementaires,
              statut_suivis: statutIds.envoye,
              created_at: new Date().toISOString(),
            };

            if (type === "cellule") {
              suiviData.cellule_id = cible?.id || null;
              suiviData.cellule_nom = cible?.cellule || "—";
              suiviData.responsable = cible?.responsable || "—";
            } else if (type === "conseiller") {
              suiviData.conseiller_id = cible?.id || null;
              suiviData.responsable =
                `${cible?.prenom || ""} ${cible?.nom || ""}`.trim() || "—";
            }

            await supabase.from("suivis_membres").insert([suiviData]);
          }

          const { data: updatedMember } = await supabase
            .from("membres")
            .update({ statut: "ancien" })
            .eq("id", membre.id)
            .select()
            .single();

          if (onEnvoyer) onEnvoyer(updatedMember);
          if (showToast)
            showToast(`✅ ${membre.prenom} ${membre.nom} envoyé via WhatsApp`);
        } catch (err) {
          console.error("Erreur Supabase :", err);
        } finally {
          setLoading(false);
        }
      })();
    } catch (err) {
      console.error("Erreur WhatsApp :", err);
      setLoading(false);
    }
  };

  return (
    <>
      {/* BOUTON PRINCIPAL */}
      <button
        onClick={() => setShowPopup(true)}
        disabled={loading}
        className="w-full py-3 rounded-xl font-semibold text-white
                   bg-gradient-to-r from-green-500 to-emerald-600
                   hover:opacity-90 transition"
      >
        {loading ? "Envoi..." : label}
      </button>

      {/* POPUP */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-xl">
            <h2 className="text-xl font-bold mb-3">{label}</h2>

            <p className="text-gray-700 mb-4">
              Cliquez sur <span className="font-semibold">Envoyer</span> pour
              choisir un contact dans WhatsApp ou saisissez un numéro
              manuellement.
            </p>

            <input
              type="tel"
              placeholder="Numéro WhatsApp (optionnel)"
              value={manualPhone}
              onChange={(e) => setManualPhone(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 mb-4
                         focus:outline-none focus:ring-2 focus:ring-green-400"
            />

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowPopup(false);
                  setManualPhone("");
                }}
                className="flex-1 py-3 rounded-2xl font-semibold
                           bg-white border border-green-500 text-green-600
                           hover:bg-green-50 transition"
              >
                Annuler
              </button>

              <button
                onClick={handleSend}
                className="flex-1 py-3 rounded-2xl font-semibold text-white
                           bg-gradient-to-r from-green-500 to-green-700
                           hover:opacity-90 transition"
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
