"use client";

export default function DetailsEvangePopup({ member, onClose }) {
  const formatBesoin = (b) => {
    if (!b) return "—";
    if (Array.isArray(b)) return b.join(", ");
    try {
      const arr = JSON.parse(b);
      return Array.isArray(arr) ? arr.join(", ") : b;
    } catch {
      return b;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-96 max-h-[90vh] overflow-y-auto shadow-xl relative">
        <h2 className="text-lg font-bold text-gray-800 text-center mb-4">
          Détails de {member.prenom} {member.nom}
        </h2>
        <div className="flex flex-col space-y-2 text-sm">
          <p>📱 Téléphone : {member.telephone || "—"}</p>
          <p>🏙 Ville : {member.ville || "—"}</p>
          <p>💬 WhatsApp : {member.is_whatsapp ? "Oui" : "Non"}</p>
          <p>⚥ Sexe : {member.sexe || "—"}</p>
          <p>🙏 Prière du salut : {member.priere_salut ? "Oui" : "Non"}</p>
          <p>☀️ Type : {member.type_conversion || "—"}</p>
          <p>❓ Besoin : {formatBesoin(member.besoin)}</p>
          <p>📝 Infos supplémentaires : {formatBesoin(member.infos_supplementaires)}</p>
        </div>
        <button
          onClick={onClose}
          className="mt-4 w-full bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
        >
          Fermer
        </button>
      </div>
    </div>
  );
}
