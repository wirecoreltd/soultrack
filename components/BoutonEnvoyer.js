"use client";
import { useState } from "react";
import supabase from "../lib/supabaseClient";

export default function BoutonEnvoyer({ membre, type = "cellule", cible, session, onEnvoyer, showToast }) {
  const [loading, setLoading] = useState(false);
  const [showDoublonPopup, setShowDoublonPopup] = useState(false);
  const [doublonDetected, setDoublonDetected] = useState(false);

  const statutIds = { envoye: 1, en_attente: 2, integrer: 3, refus: 4 };

  //=============
  const sendWhatsApp = (phone, message) => {
  if (!phone) {
    alert("❌ Numéro invalide");
    return;
  }

  const num = phone.replace(/\D/g, "");
  const url = `https://wa.me/${num}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank");
};

  // Vérification de doublon
  const checkDoublon = async () => {
    if (!membre.telephone) return false;
    const { data, error } = await supabase
      .from("membres_complets")
      .select("id")
      .eq("telephone", membre.telephone)
      .neq("id", membre.id);

    if (error) {
      alert("❌ Erreur lors de la vérification des doublons");
      return false;
    }

    return data.length > 0;
  };

  const handleClick = async () => {
  if (!session) {
    alert("❌ Vous devez être connecté.");
    return;
  }

  try {
    // 🔹 Vérification de doublon
    if (await checkDoublon()) {
      setDoublonDetected(true);
      setShowDoublonPopup(true);
      return;
    }

    // 🔹 Préparer responsable
    let responsablePrenom = "";
    let responsableTelephone = "";

    if (type === "cellule") {
      const { data: cellule } = await supabase
        .from("cellules")
        .select("id, responsable_id, cellule_full")
        .eq("id", cible.id)
        .single();

      const { data: resp } = await supabase
        .from("profiles")
        .select("prenom, telephone")
        .eq("id", cellule.responsable_id)
        .single();

      responsablePrenom = resp.prenom;
      responsableTelephone = resp.telephone;
      cible.cellule_full = cellule.cellule_full;
    }

    if (type === "conseiller") {
      responsablePrenom = cible.prenom;
      responsableTelephone = cible.telephone;
    }

    if (type === "numero") {
      responsablePrenom = "Responsable";
      responsableTelephone = cible; 
    }

    // 🔹 Message WhatsApp
   let message = `👋 Bonjour ${responsablePrenom},

  Nous te confions cette nouvelle personne avec joie,  
  Merci pour ton engagement et ton cœur pour le suivi des âmes ✨.

📅 Date de Création : ${new Date(membre.created_at).toLocaleString("fr-FR")}
👤 Nom : ${membre.prenom} ${membre.nom}
🏙️ Ville : ${membre.ville || "—"}
🎗️ Sexe : ${membre.sexe || "—"}
⏳ Age : ${membre.age || "—"}
📱 Téléphone : ${membre.telephone || "—"}
💬 WhatsApp : ${membre.is_whatsapp ? "Oui" : "Non"}
✨ Raison de la venue : ${membre.statut_initial || "—"}
🙏 Prière du salut : ${membre.priere_salut ? "Oui" : "Non"}
☀️ Type : ${membre.type_conversion || "—"}

❓ Besoin : ${
  membre.besoin
    ? (() => {
        try {
          const besoins =
            typeof membre.besoin === "string"
              ? JSON.parse(membre.besoin)
              : membre.besoin;
          return Array.isArray(besoins) ? besoins.join(", ") : besoins;
        } catch {
          return membre.besoin;
        }
      })()
    : "—"
}

📝 Infos : ${membre.infos_supplementaires || "—"}
Merci pour ton accompagnement ❤️
`;

    const phone = responsableTelephone?.replace(/\D/g, "");
    if (!phone) {
      alert("❌ Le numéro WhatsApp est invalide.");
      return;
    }

    // 🔹 Ouvrir WhatsApp
    sendWhatsApp(phone, message);

    // 🔹 Mettre à jour la base avec la date
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from("membres_complets")
      .update({
        statut: "actif",
        statut_suivis: statutIds.envoye,
        cellule_id: type === "cellule" ? cible.id : null,
        conseiller_id: type === "conseiller" ? cible.id : null,
        suivi_cellule_nom: type === "cellule" ? cible.cellule_full : null,
        suivi_responsable: type === "conseiller" ? `${cible.prenom} ${cible.nom}` : responsablePrenom,
        suivi_responsable_id: type === "conseiller" ? cible.id : null,
        etat_contact: "Existant",
        date_envoi_suivi: now
      })
      .eq("id", membre.id)
      .select()
      .single();

    if (error) {
      console.error("❌ Erreur mise à jour Supabase :", error);
      alert("❌ Impossible d'enregistrer la date d'envoi du suivi.");
      return;
    }

    if (!data) {
      alert("❌ Aucune ligne mise à jour. Vérifie l'ID du membre.");
      return;
    }

    if (onEnvoyer) onEnvoyer(data);
    if (showToast) showToast(`✅ ${membre.prenom} ${membre.nom} envoyé à ${
      type === "cellule" ? cible.cellule_full : type === "conseiller" ? `${cible.prenom} ${cible.nom}` : cible
    } le ${now}`);
    
  } catch (err) {
    console.error(err);
    alert(`❌ ${err.message}`);
  } finally {
    setShowDoublonPopup(false);
    setDoublonDetected(false);
  }
};

  return (
    <>
      <button
        onClick={handleClick}
        disabled={loading}
        className={`w-full text-white font-bold px-4 py-2 rounded-lg shadow-lg ${
          loading ? "bg-gray-400 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"
        }`}
      >
        {loading ? "Envoi..." : "📤 Envoyer par WhatsApp"}
      </button>

      {showDoublonPopup && doublonDetected && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity">
          <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-xl p-6 w-96 max-w-[90%] text-center animate-fadeIn">
            <h3 className="text-xl font-bold mb-3 text-gray-800">⚠️ Doublon détecté</h3>
            <p className="mb-6 text-gray-700">Ce numéro ({membre.telephone}) existe déjà dans la base.</p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => {
                  const phone = membre.telephone?.replace(/\D/g, "");
                  const msg = message; // ou reconstruire si besoin
                  sendWhatsApp(phone, msg);
                }}
                className="flex-1 bg-green-500 text-white font-semibold px-4 py-2 rounded-lg hover:bg-green-600 transition"
              >
                Envoyer quand même
              </button>
              <button
                onClick={() => setShowDoublonPopup(false)}
                className="flex-1 bg-gray-300 text-gray-800 font-semibold px-4 py-2 rounded-lg hover:bg-gray-400 transition"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
