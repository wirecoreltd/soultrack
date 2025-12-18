"use client";

export default function BoutonEnvoyerPopup({ membre, type, cible, onEnvoyer, session, showToast }) {
  if (!cible) return null;

  const handleClick = () => {
    // Ici tu peux gérer l'envoi réel
    onEnvoyer(membre);
    showToast?.(`✅ ${membre.prenom} envoyé à ${type === "cellule" ? cible.cellule_full : `${cible.prenom} ${cible.nom}`}`);
  };

  return (
    <div className="flex flex-col items-center space-y-2">
      <button
        onClick={handleClick}
        className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded"
      >
        Envoyer
      </button>

      {/* Actions rapides */}
      {membre.telephone && (
        <div className="flex space-x-2 mt-1 text-sm">
          <a href={`tel:${membre.telephone}`} className="text-blue-500 underline">📞 Appeler</a>
          <a href={`sms:${membre.telephone}`} className="text-blue-500 underline">✉️ SMS</a>
          <a href={`https://wa.me/${membre.telephone.replace(/\D/g, "")}`} target="_blank" className="text-blue-500 underline">💬 WhatsApp</a>
        </div>
      )}
    </div>
  );
}
