"use client";
export default function DetailsPopup({ member, onClose }) {
  if (!member) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 transition-all duration-200">
      <div className="bg-white text-black p-6 rounded-lg w-80 max-h-[90vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-red-500 font-bold"
        >
          ✕
        </button>
        <h3 className="text-lg font-semibold">
          {member.prenom} {member.nom}
        </h3>
        <p>📱 {member.telephone || "—"}</p>
        <p>💬 WhatsApp : {member.is_whatsapp || "—"}</p>
        <p>🏙 Ville : {member.ville || "—"}</p>
        <p>🕊 Statut : {member.statut || "—"}</p>
        <p>🧩 Comment est-il venu : {member.venu || "—"}</p>
        <p>❓Besoin : {member.besoin || "—"}</p>
        <p>📝 Infos : {member.infos_supplementaires || "—"}</p>
      </div>
    </div>
  );
}
