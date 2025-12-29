"use client";

import { useState, useEffect } from "react";
import supabase from "../lib/supabaseClient";

export default function EditEvangelisePopup({
  member,
  onClose,
  onUpdateMember,
}) {
  if (!member) return null; // Sécurité si member est undefined

  const besoinsOptions = ["Finances", "Santé", "Travail", "Les Enfants", "La Famille"];

  // Toujours transformer besoin en array
  const initialBesoin =
    Array.isArray(member.besoin) ? member.besoin : JSON.parse(member.besoin || "[]");

  const [formData, setFormData] = useState({
    prenom: member.prenom || "",
    nom: member.nom || "",
    telephone: member.telephone || "",
    ville: member.ville || "",
    sexe: member.sexe || "",
    priere_salut: member.priere_salut === "Oui" ? "Oui" : "Non",
    type_conversion: member.type_conversion || "",
    besoin: initialBesoin,
    infos_supplementaires: member.infos_supplementaires || "",
    commentaire_evangelises: member.commentaire_evangelises || "",
    status_suivis_evangelises: member.status_suivis_evangelises || "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBesoinChange = (e) => {
    const { value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      besoin: checked ? [...prev.besoin, value] : prev.besoin.filter((b) => b !== value),
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("suivis_des_evangelises")
        .update({ ...formData, besoin: formData.besoin })
        .eq("id", member.id)
        .select()
        .single();

      if (error) throw error;

      if (onUpdateMember) onUpdateMember(data);

      setMessage("✅ Modifications enregistrées");
      setTimeout(() => onClose(), 1000);
    } catch (err) {
      console.error(err);
      alert("❌ Erreur lors de la modification");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl w-96 max-h-[90vh] overflow-y-auto relative shadow-xl">
        {/* CROIX */}
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-gray-500 font-bold"
        >
          ✖
        </button>

        <h2 className="text-center font-bold text-lg mb-4">Modifier le suivi</h2>

        <div className="space-y-3 text-sm">
          {/* Infos de base */}
          <input
            name="prenom"
            value={formData.prenom}
            onChange={handleChange}
            className="w-full border rounded px-2 py-1"
            placeholder="Prénom"
          />
          <input
            name="nom"
            value={formData.nom}
            onChange={handleChange}
            className="w-full border rounded px-2 py-1"
            placeholder="Nom"
          />
          <input
            name="telephone"
            value={formData.telephone}
            onChange={handleChange}
            className="w-full border rounded px-2 py-1"
            placeholder="Téléphone"
          />
          <input
            name="ville"
            value={formData.ville}
            onChange={handleChange}
            className="w-full border rounded px-2 py-1"
            placeholder="Ville"
          />

          {/* Sexe */}
          <select
            name="sexe"
            value={formData.sexe}
            onChange={handleChange}
            className="w-full border rounded px-2 py-1"
          >
            <option value="">Sexe</option>
            <option value="Homme">Homme</option>
            <option value="Femme">Femme</option>
          </select>

          {/* Prière du salut */}
          <select
            name="priere_salut"
            value={formData.priere_salut}
            onChange={(e) =>
              setFormData({ ...formData, priere_salut: e.target.value })
            }
            className="w-full border rounded px-2 py-1"
          >
            <option value="Non">Prière du salut ?</option>
            <option value="Oui">Oui</option>
            <option value="Non">Non</option>
          </select>

          {/* Type de conversion */}
          {formData.priere_salut === "Oui" && (
            <select
              name="type_conversion"
              value={formData.type_conversion}
              onChange={handleChange}
              className="w-full border rounded px-2 py-1"
            >
              <option value="">Type</option>
              <option value="Nouveau converti">Nouveau converti</option>
              <option value="Réconciliation">Réconciliation</option>
            </select>
          )}

          {/* Besoins */}
          <div>
            <p className="font-semibold mb-1">Besoins</p>
            {besoinsOptions.map((b) => (
              <label key={b} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  value={b}
                  checked={formData.besoin.includes(b)}
                  onChange={handleBesoinChange}
                />
                {b}
              </label>
            ))}
          </div>

          {/* Infos supplémentaires */}
          <textarea
            name="infos_supplementaires"
            value={formData.infos_supplementaires}
            onChange={handleChange}
            rows={2}
            className="w-full border rounded px-2 py-1"
            placeholder="Infos supplémentaires"
          />

          {/* Commentaire */}
          <textarea
            name="commentaire_evangelises"
            value={formData.commentaire_evangelises}
            onChange={handleChange}
            rows={2}
            className="w-full border rounded px-2 py-1"
            placeholder="Commentaire suivi"
          />

          {/* Statut */}
          <select
            name="status_suivis_evangelises"
            value={formData.status_suivis_evangelises}
            onChange={handleChange}
            className="w-full border rounded px-2 py-1"
          >
            <option value="">Statut</option>
            <option value="En cours">En cours</option>
            <option value="Venu à l’église">Venu à l’église</option>
            <option value="Integrer">Intégré</option>
          </select>

          {message && <p className="text-green-600 text-center">{message}</p>}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-blue-600 text-white rounded py-2 font-bold mt-2"
          >
            {loading ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
}
