"use client";

import { useState } from "react";
import supabase from "../lib/supabaseClient";

export default function BoutonEnvoyer({ membre, type = "cellule", cible, session, onEnvoyer, showToast, label = "Envoyer par WhatsApp", buttonColor = "from-[#09203F] to-[#537895]" }) {
  const [showPopup, setShowPopup] = useState(false);
  const [manualPhone, setManualPhone] = useState("");
  const statutIds = { envoye: 1, "en attente": 2, integrer: 3, refus: 4 };
  const [loading, setLoading] = useState(false);

  const getPhone = () => {
    let phone = (cible?.telephone || manualPhone).replace(/\D/g, "");
    if (!phone) return null;
    if (phone.length <= 8) phone = "230" + phone; // indicatif pays Maurice
    return phone;
  };

  const handleSend = () => {
    if (!session) return alert("❌ Vous devez être connecté.");

    const phone = getPhone();
    if (!phone) return alert("❌ Veuillez saisir un numéro WhatsApp !");

    setLoading(true);

    try {
      // Préparer le message
      const message = `
👋 Bonjour ${cible?.responsable || (cible?.prenom || "")} !

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

      // Ouvrir WhatsApp immédiatement
      window.open(`https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`, "_blank");

      // Insert / update Supabase en arrière-plan
      (async () => {
        try {
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

      // Fermer le popup et réinitialiser le numéro manuel
      setShowPopup(false);
      setManualPhone("");
    } catch (err) {
      console.error("Erreur handleSend :", err);
      setLoading(false);
      alert("❌ Une erreur est survenue lors de l'envoi.");
    }
  };

  return (
    <>
      <button
        onClick={() => setShowPopup(true)}
        className={`w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r ${buttonColor} hover:opacity-90 transition`}
        disabled={loading}
      >
        {loading ? "Envoi..." : label}
      </button>

      {showPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-xl relative">
            <h2 className="text-xl font-bold mb-3">{label}</h2>
            <p className="text-gray-700 mb-4">
              Cliquez sur <span className="font-semibold">Envoyer</span> si le contact figure déjà dans votre liste WhatsApp,
              ou saisissez un numéro manuellement.
            </p>

            {!cible?.telephone && (
              <input
                type="tel"
                placeholder="Saisir le numéro WhatsApp"
                value={manualPhone}
                onChange={(e) => setManualPhone(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            )}

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => { setShowPopup(false); setManualPhone(""); }}
                className="flex-1 py-3 bg-gray-300 hover:bg-gray-400 rounded-2xl font-semibold transition"
              >
                Annuler
              </button>
              <button
                onClick={handleSend}
                className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-white rounded-2xl font-semibold transition"
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
