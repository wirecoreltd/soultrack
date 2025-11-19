"use client";

import { useState } from "react";
import supabase from "../lib/supabaseClient";
import BoutonEnvoyer from "./BoutonEnvoyer";

export default function EditMemberPopup({
  member,
  cellules = [],
  conseillers = [], // ✅ récupérer depuis props
  onClose,
  onUpdateMember,
  session = null,
  showToast = () => {},
}) {
  const besoinsOptions = ["Finances", "Santé", "Travail", "Les Enfants", "La Famille"];
  const [selectedTargetType, setSelectedTargetType] = useState({});
  const [selectedTargets, setSelectedTargets] = useState({});

  const initialBesoin =
    typeof member.besoin === "string"
      ? JSON.parse(member.besoin || "[]")
      : member.besoin || [];

  const [formData, setFormData] = useState({
    prenom: member.prenom || "",
    nom: member.nom || "",
    telephone: member.telephone || "",
    ville: member.ville || "",
    besoin: initialBesoin,
    autreBesoin: "",
    infos_supplementaires: member.infos_supplementaires || "",
    statut: member.statut || "",
    cellule_id: member.cellule_id || "",
  });

  const [showAutre, setShowAutre] = useState(initialBesoin.includes("Autre"));
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleBesoinChange = (e) => {
    const { value, checked } = e.target;

    if (value === "Autre") {
      setShowAutre(checked);
      if (!checked) {
        setFormData((prev) => ({
          ...prev,
          autreBesoin: "",
          besoin: prev.besoin.filter((b) => b !== "Autre"),
        }));
      }
    }

    setFormData((prev) => {
      const updatedBesoin = checked
        ? [...prev.besoin, value]
        : prev.besoin.filter((b) => b !== value);
      return { ...prev, besoin: updatedBesoin };
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);

    const cleanData = {
      prenom: formData.prenom || member.prenom,
      nom: formData.nom || member.nom,
      ville: formData.ville === "" ? null : formData.ville,
      telephone: formData.telephone === "" ? null : formData.telephone,
      infos_supplementaires: formData.infos_supplementaires === "" ? null : formData.infos_supplementaires,
      statut: formData.statut === "" ? null : formData.statut,
      cellule_id: formData.cellule_id === "" ? null : formData.cellule_id,
      besoin:
        formData.autreBesoin && showAutre
          ? [...formData.besoin.filter((b) => b !== "Autre"), formData.autreBesoin]
          : formData.besoin,
    };

    const { error, data } = await supabase
      .from("membres")
      .update(cleanData)
      .eq("id", member.id)
      .select()
      .single();

    if (error) {
      alert("❌ Erreur lors de la mise à jour : " + error.message);
    } else {
      if (onUpdateMember) onUpdateMember(data);
      setMessage("✅ Changement enregistré !");
      setTimeout(() => {
        setMessage("");
        onClose();
      }, 1500);
    }

    setLoading(false);
  };

  const handleAfterSend = () => {}; // fonction du BoutonEnvoyer

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-96 max-h-[90vh] overflow-y-auto shadow-xl relative">
        {/* Bouton fermer */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-red-500 font-bold hover:text-red-700"
        >
          ✕
        </button>

        <h2 className="text-lg font-bold text-gray-800 text-center mb-4">
          Modifier {member.prenom} {member.nom}
        </h2>

        {/* Formulaire */}
        <div className="flex flex-col space-y-2 text-sm">
          {/* ...tous tes inputs existants restent inchangés... */}

          {/* Partie “Envoyer à” exactement comme ton code */}
          <div className="mt-2">
            <label className="font-semibold text-sm">Envoyer à :</label>
            <select
              value={selectedTargetType[member.id] || ""}
              onChange={(e) =>
                setSelectedTargetType((prev) => ({
                  ...prev,
                  [member.id]: e.target.value,
                }))
              }
              className="mt-1 w-full border rounded px-2 py-1 text-sm"
            >
              <option value="">-- Choisir une option --</option>
              <option value="cellule">Une Cellule</option>
              <option value="conseiller">Un Conseiller</option>
            </select>

            {(selectedTargetType[member.id] === "cellule" ||
              selectedTargetType[member.id] === "conseiller") && (
              <select
                value={selectedTargets[member.id] || ""}
                onChange={(e) =>
                  setSelectedTargets((prev) => ({
                    ...prev,
                    [member.id]: e.target.value,
                  }))
                }
                className="mt-1 w-full border rounded px-2 py-1 text-sm"
              >
                <option value="">
                  -- Choisir {selectedTargetType[member.id]} --
                </option>
                {selectedTargetType[member.id] === "cellule"
                  ? cellules.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.cellule} ({c.responsable})
                      </option>
                    ))
                  : conseillers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.prenom} {c.nom}
                      </option>
                    ))}
              </select>
            )}

            {selectedTargets[member.id] && (
              <div className="pt-2">
                <BoutonEnvoyer
                  membre={member}
                  type={selectedTargetType[member.id]}
                  cible={
                    selectedTargetType[member.id] === "cellule"
                      ? cellules.find((c) => c.id === selectedTargets[member.id])
                      : conseillers.find(
                          (c) => c.id === selectedTargets[member.id]
                        )
                  }
                  onEnvoyer={(id) =>
                    handleAfterSend(
                      id,
                      selectedTargetType[member.id],
                      selectedTargetType[member.id] === "cellule"
                        ? cellules.find((c) => c.id === selectedTargets[member.id])
                        : conseillers.find(
                            (c) => c.id === selectedTargets[member.id]
                          )
                    )
                  }
                  session={session}
                  showToast={showToast}
                />
              </div>
            )}
          </div>

          {/* Bouton enregistrer */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`mt-4 w-full text-white py-2 rounded transition font-bold ${
              loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
}
