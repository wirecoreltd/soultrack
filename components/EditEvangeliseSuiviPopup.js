"use client";

import { useState } from "react";
import supabase from "../lib/supabaseClient";

export default function EditEvangeliseSuiviPopup({
  member,
  cellules = [],
  conseillers = [],
  onClose,          // ferme uniquement Edit
  closeDetails,     // ferme Details si présent
  onUpdateMember,   // met à jour le parent
}) {
  const besoinsOptions = ["Finances", "Santé", "Travail", "Les Enfants", "La Famille"];
  const initialBesoin =
    typeof member.besoin === "string" ? JSON.parse(member.besoin || "[]") : member.besoin || [];

  const [formData, setFormData] = useState({
    prenom: member.prenom || "",
    nom: member.nom || "",
    telephone: member.telephone || "",
    ville: member.ville || "",
    besoin: initialBesoin,
    autreBesoin: "",
    infos_supplementaires: member.infos_supplementaires || "",
    priere_salut: member.priere_salut || false,
    type_conversion: member.type_conversion || "",
    is_whatsapp: member.is_whatsapp || false,
    commentaire_evangelises: member.commentaire_evangelises || "",
    status_suivis_evangelises: member.status_suivis_evangelises || "Envoyé",
    cellule_id: member.cellule_id || null,
    conseiller_id: member.conseiller_id || null,
    responsable_cellule: member.responsable_cellule || null,
    evangelise_id: member.evangelise_id || null,
    sexe: member.sexe || "",
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
      const updated = checked
        ? [...prev.besoin, value]
        : prev.besoin.filter((b) => b !== value);
      return { ...prev, besoin: updated };
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const besoinsFinal =
        formData.autreBesoin && showAutre
          ? [...formData.besoin.filter((b) => b !== "Autre"), formData.autreBesoin]
          : formData.besoin;

      const cleanData = {
        prenom: formData.prenom,
        nom: formData.nom,
        telephone: formData.telephone,
        ville: formData.ville || null,
        infos_supplementaires: formData.infos_supplementaires || null,
        besoin: JSON.stringify(besoinsFinal),
        priere_salut: formData.priere_salut,
        type_conversion: formData.priere_salut ? formData.type_conversion : "",
        is_whatsapp: formData.is_whatsapp,
        sexe: formData.sexe || null,
        commentaire_evangelises: formData.commentaire_evangelises || null,
        status_suivis_evangelises: formData.status_suivis_evangelises || "Envoyé",
        cellule_id: formData.cellule_id || null,
        conseiller_id: formData.conseiller_id || null,
        responsable_cellule: formData.responsable_cellule || null,
        evangelise_id: formData.evangelise_id || null,
      };

      const { data, error } = await supabase
        .from("suivis_des_evangelises")
        .update(cleanData)
        .eq("id", member.id)
        .select()
        .single();

      if (error) {
        alert("❌ Une erreur est survenue : " + error.message);
      } else {
        if (onUpdateMember) onUpdateMember(data);
        setMessage("✅ Changement enregistré !");
        setTimeout(() => {
          setMessage("");
          onClose(); // ferme Edit
          if (closeDetails) closeDetails(); // ferme Details si présent
        }, 1200);
      }
    } catch (err) {
      alert("❌ Une erreur est survenue : " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div
        className="relative w-full max-w-lg p-6 rounded-3xl shadow-2xl overflow-y-auto max-h-[90vh]"
        style={{ background: "linear-gradient(180deg, rgba(46,49,146,0.16), rgba(46,49,146,0.40))" }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-red-600 font-bold text-xl"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold text-center mb-6 text-white">
          Modifier {member.prenom} {member.nom}
        </h2>

        <div className="flex flex-col gap-4 text-white">
          {["prenom", "nom", "ville", "telephone"].map((f) => (
            <div key={f} className="flex flex-col">
              <label className="font-semibold capitalize">{f}</label>
              <input name={f} value={formData[f]} onChange={handleChange} className="input" />
            </div>
          ))}

          {/* WhatsApp */}
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="is_whatsapp"
              checked={formData.is_whatsapp}
              onChange={handleChange}
              className="accent-[#25297e]"
            />
            WhatsApp
          </label>

          {/* Sexe */}
          <select
            className="input select-black"
            name="sexe"
            value={formData.sexe || ""}
            onChange={handleChange}
          >
            <option value="">Sexe</option>
            <option value="Homme">Homme</option>
            <option value="Femme">Femme</option>
          </select>

          {/* Prière du salut */}
          <select
            className="input"
            value={formData.priere_salut ? "Oui" : "Non"}
            onChange={(e) => {
              const value = e.target.value;
              setFormData({
                ...formData,
                priere_salut: value === "Oui",
                type_conversion: value === "Oui" ? formData.type_conversion : "",
              });
            }}
          >
            <option value="">-- Prière du salut ? --</option>
            <option value="Oui">Oui</option>
            <option value="Non">Non</option>
          </select>

          {/* Type de conversion */}
          {formData.priere_salut && (
            <select
              className="input"
              value={formData.type_conversion || ""}
              onChange={(e) =>
                setFormData({ ...formData, type_conversion: e.target.value })
              }
            >
              <option value="">Type</option>
              <option value="Nouveau converti">Nouveau converti</option>
              <option value="Réconciliation">Réconciliation</option>
            </select>
          )}

          {/* Besoins */}
          <div className="flex flex-col">
            <label className="font-semibold">Besoins</label>
            {besoinsOptions.map((item) => (
              <label key={item} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  value={item}
                  checked={formData.besoin.includes(item)}
                  onChange={handleBesoinChange}
                  className="accent-[#25297e]"
                />
                {item}
              </label>
            ))}
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                value="Autre"
                checked={showAutre}
                onChange={handleBesoinChange}
                className="accent-[#25297e]"
              />
              Autre
            </label>
            {showAutre && (
              <input
                type="text"
                name="autreBesoin"
                value={formData.autreBesoin}
                onChange={handleChange}
                className="input mt-2"
                placeholder="Précisez"
              />
            )}
          </div>

          {/* Infos supplémentaires */}
          <label className="font-semibold">Infos supplémentaires</label>
          <textarea
            name="infos_supplementaires"
            value={formData.infos_supplementaires}
            onChange={handleChange}
            className="input"
            rows={3}
          />

          {/* Commentaire */}
          <label className="font-semibold">Commentaire</label>
          <textarea
            name="commentaire_evangelises"
            value={formData.commentaire_evangelises}
            onChange={handleChange}
            className="input"
            rows={2}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-4">
          <button
            onClick={onClose} // Annuler
            className="w-full bg-gray-400 hover:bg-gray-500 text-white font-bold py-3 rounded-2xl shadow-md"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit} // Sauvegarder et éventuellement fermer Details
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-400 to-indigo-500 hover:from-blue-500 hover:to-indigo-600 disabled:opacity-60 text-white font-bold py-3 rounded-2xl shadow-md"
          >
            {loading ? "Enregistrement..." : "Sauvegarder"}
          </button>
        </div>

        {message && (
          <p className="text-[#25297e] font-semibold text-center mt-3">{message}</p>
        )}

        <style jsx>{`
          label {
            font-weight: 600;
            color: white;
          }
          .input {
            width: 100%;
            border: 1px solid #a0c4ff;
            border-radius: 14px;
            padding: 12px;
            background: rgba(255, 255, 255, 0.1);
            color: white;
            font-weight: 400;
          }
          .select-black option {
            color: black;
          }
        `}</style>
      </div>
    </div>
  );
}
