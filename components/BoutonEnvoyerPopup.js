"use client";

export default function BoutonEnvoyerPopup({
  membre,
  type,          // "cellule" ou "conseiller"
  cible,         // objet cellule ou conseiller
  onEnvoyer,     // fonction appelée au clic
  disabled = false,
}) {
  if (!membre || !cible || !type) return null;

  return (
    <button
      type="button"
      onClick={onEnvoyer}
      disabled={disabled}
      className={`
        w-full mt-2 px-4 py-2 rounded-lg font-semibold text-white
        ${disabled
          ? "bg-gray-400 cursor-not-allowed"
          : "bg-blue-600 hover:bg-blue-700"}
      `}
    >
      📤 Envoyer à{" "}
      {type === "cellule"
        ? "la cellule"
        : "le conseiller"}
    </button>
  );
}
