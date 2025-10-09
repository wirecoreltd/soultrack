// components/MemberCard.js
import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function MemberCard({ member, fetchMembers = () => {}, cellules = [] }) {
  const [selectedCellule, setSelectedCellule] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const safeStar = member?.star === true || member?.star === "true";

  const getBorderColor = () => {
  const isStar = member?.star === true || member?.star === "true";
  if (isStar) return "#FBC02D"; // ⭐ Jaune Star (prioritaire)

  if (member?.statut === "actif") return "#4285F4"; // Bleu
  if (member?.statut === "a déjà mon église") return "#EA4335"; // Rouge
  if (member?.statut === "ancien") return "#9E9E9E"; // Gris
  if (member?.statut === "visiteur" || member?.statut === "veut rejoindre ICC")
    return "#34A853"; // Vert
  if (member?.statut === "evangelisé") return "#FB8C00"; // Orange

  return "#999"; // par défaut
};


  const handleWhatsApp = async () => {
    try {
      if (!selectedCellule) {
        alert("Sélectionne d'abord une cellule.");
        return;
      }

      const telRaw = selectedCellule.telephone || "";
      // Nettoyer le numéro pour wa.me : garder uniquement chiffres
      const telDigits = telRaw.replace(/\D/g, "");
      if (!telDigits) {
        alert("Le responsable sélectionné n'a pas de téléphone valide.");
        return;
      }

      const prenomResponsable = (selectedCellule.responsable || "").split(" ")[0] || "Frère/Soeur";
      const message = `👋 Salut ${prenomResponsable},

🙏 Dieu nous a envoyé une nouvelle âme à suivre.  
Voici ses infos :  

- 👤 Nom : ${member.prenom || "—"} ${member.nom || "—"}  
- 📱 Téléphone : ${member.telephone || "—"} ${member.is_whatsapp ? "(WhatsApp ✅)" : ""}  
- 📧 Email : ${member.email || "—"}  
- 🏙️ Ville : ${member.ville || "—"}  
- 🙏 Besoin : ${member.besoin || "—"}  
- 📝 Infos supplémentaires : ${member.infos_supplementaires || "—"}  

Merci pour ton cœur ❤️ et ton amour ✨`;

      // ouvrir WhatsApp dans un nouvel onglet
      const waUrl = `https://wa.me/${telDigits}?text=${encodeURIComponent(message)}`;
      window.open(waUrl, "_blank");

      // update statut en 'ancien' (on essaye, on log si erreur)
      try {
        const { error } = await supabase.from("membres").update({ statut: "ancien" }).eq("id", member.id);
        if (error) console.error("Erreur update statut:", error);
      } catch (e) {
        console.error("Erreur lors de l'update supabase:", e);
      }

      // rafraîchir la liste
      try {
        await fetchMembers();
      } catch (e) {
        console.warn("fetchMembers a échoué après envoi WhatsApp:", e);
      }
    } catch (err) {
      console.error("handleWhatsApp error:", err);
      alert("Une erreur s'est produite. Regarde la console pour plus de détails.");
    }
  };

  return (
    <div
      className="bg-white p-4 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300"
      style={{ borderTop: `4px solid ${getBorderColor()}` }}
    >
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-1 flex items-center">
            {member?.prenom || "—"} {member?.nom || "—"}{" "}
            {safeStar && <span className="ml-2 text-yellow-400">⭐</span>}
          </h2>
          <p className="text-sm text-gray-600 mb-1">📱 {member?.telephone || "—"}</p>
          <p className="text-sm text-gray-500">Statut : {member?.statut || "—"}</p>
        </div>
      </div>

      {/* Lien texte bleu pour Détails */}
      <p
        onClick={() => setShowDetails((s) => !s)}
        className="mt-2 text-sm text-blue-500 underline cursor-pointer"
      >
        {showDetails ? "Fermer détails" : "Détails"}
      </p>

      {/* Détails */}
      {showDetails && (
        <div className="mt-3 text-sm text-gray-700 space-y-1">
          <p>Email : {member?.email || "—"}</p>
          <p>Besoin : {member?.besoin || "—"}</p>
          <p>Ville : {member?.ville || "—"}</p>
          <p>WhatsApp : {member?.is_whatsapp ? "✅ Oui" : "❌ Non"}</p>
          <p>Infos supplémentaires : {member?.infos_supplementaires || "—"}</p>
          <p>Comment est-il venu : {member?.how_came || "—"}</p>

          {/* Menu + WhatsApp pour visiteurs / veut rejoindre ICC */}
          {(member?.statut === "visiteur" || member?.statut === "veut rejoindre ICC") && (
            <div className="mt-2">
              <label className="block mb-1 font-semibold">Choisir une cellule :</label>
              <select
                className="w-full p-2 border rounded-lg"
                value={selectedCellule?.cellule || ""}
                onChange={(e) => {
                  const cellule = Array.isArray(cellules)
                    ? cellules.find((c) => String(c?.cellule) === String(e.target.value))
                    : undefined;
                  setSelectedCellule(cellule || null);
                }}
              >
                <option value="">-- Sélectionner --</option>
                {Array.isArray(cellules) && cellules.length > 0 ? (
                  cellules.map((c) => (
                    <option key={c.cellule} value={c.cellule}>
                      {c.cellule} ({c.responsable})
                    </option>
                  ))
                ) : (
                  <option value="">⚠️ Aucune cellule trouvée</option>
                )}
              </select>

              {selectedCellule && (
                <button
                  onClick={handleWhatsApp}
                  className="mt-2 w-full py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600"
                >
                  📤 Envoyer sur WhatsApp
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
