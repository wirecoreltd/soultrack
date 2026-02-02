// components/MemberDetailsPopup.jsx
"use client";

export default function DetailsCelluleMemberPopup({ member, onClose }) {
  if (!member) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-3xl w-full max-w-md shadow-xl overflow-y-auto max-h-[95vh]">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-red-500 font-bold text-xl hover:text-red-700"
          aria-label="Fermer"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold text-center mb-4">
          {member.prenom} {member.nom}
        </h2>
         <p>📞 Téléphone : {member.telephone || "—"}</p>
         <p>🏙️ Ville : {member.ville || "—"}</p>
         <p>🏠 Cellule : {member.cellule_nom || member.suivi_cellule_nom || "—"}</p>      
        
        <div className="flex flex-col gap-2 text-sm">         
          <p>💬 WhatsApp : {member.is_whatsapp ? "Oui" : "Non"}</p>
          <p>🎗️ Sexe : {member.sexe || "—"}</p>
          <p>💧 Baptême d’Eau : {toBoolean(member.bapteme_eau) ? "Oui" : "Non"}</p>
          <p>🔥 Baptême de Feu : {toBoolean(member.bapteme_esprit) ? "Oui" : "Non"}</p>
          <p>❓ Besoin : {member.besoin ? JSON.parse(member.besoin).join(", ") : "—"}</p>
          <p>📝 Infos : {member.infos_supplementaires || "—"}</p>
          <p>🧩 Comment est-il venu : {member.venu || ""}</p>                    
          <p>📝 Commentaire Suivis : {member.commentaire_suivis || ""}</p>
          
        </div>

        <div className="flex justify-center mt-4">
          <button
            onClick={onClose}
            className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-2xl"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
