"use client";

import { useState, useEffect } from "react";
import supabase from "../lib/supabaseClient";

export default function EditMemberPopup({ member, onClose, cellules = [], onUpdate }) {
  const [formData, setFormData] = useState({
    prenom: "",
    nom: "",
    telephone: "",
    ville: "",
    statut: "",
    cellule_id: "",
    is_whatsapp: false,
    infos_supplementaires: "",
    venu: "",
    besoin: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (member) {
      setFormData({
        prenom: member.prenom || "",
        nom: member.nom || "",
        telephone: member.telephone || "",
        ville: member.ville || "",
        statut: member.statut || "",
        cellule_id: member.cellule_id || "",
        is_whatsapp: member.is_whatsapp || false,
        infos_supplementaires: member.infos_supplementaires || "",
        venu: member.venu || "",
        besoin: member.besoin || "",
      });
    }
  }, [member]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("membres")
        .update({
          prenom: formData.prenom,
          nom: formData.nom,
          telephone: formData.telephone,
          ville: formData.ville,
          statut: formData.statut,
          cellule_id: formData.cellule_id || null, // <-- envoyer null si aucune cellule
          is_whatsapp: formData.is_whatsapp,
          infos_supplementaires: formData.infos_supplementaires,
          venu: formData.venu,
          besoin: formData.besoin,
        })
        .eq("id", member.id);

      if (error) throw error;

      if (onUpdate) onUpdate(data[0]); // Mise à jour côté parent
      onClose();
    } catch (err) {
      alert("❌ Erreur lors de la mise à jour : " + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!member) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white text-black p-6 rounded-lg w-80 max-h-[90vh] overflow-y-auto relative shadow-xl">
        {/* Bouton fermer */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-red-500 font-bold hover:text-red-700"
          aria-label="Fermer"
        >
          ✕
        </button>

        <h2 className="text-lg font-bold text-center mb-4">
          Modifier {member.prenom} {member.nom}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-2 text-sm">
          <input
            type="text"
            name="prenom"
            placeholder="Prénom"
            value={formData.prenom}
            onChange={handleChange}
            className="border rounded px-2 py-1 w-full"
            required
          />
          <input
            type="text"
            name="nom"
            placeholder="Nom"
            value={formData.nom}
            onChange={handleChange}
            className="border rounded px-2 py-1 w-full"
            required
          />
          <input
            type="text"
            name="telephone"
            placeholder="Téléphone"
            value={formData.telephone}
            onChange={handleChange}
            className="border rounded px-2 py-1 w-full"
          />
          <input
            type="text"
            name="ville"
            placeholder="Ville"
            value={formData.ville}
            onChange={handleChange}
            className="border rounded px-2 py-1 w-full"
          />
          <select
            name="statut"
            value={formData.statut}
            onChange={handleChange}
            className="border rounded px-2 py-1 w-full"
          >
            <option value="">-- Statut --</option>
            <option value="actif">Actif</option>
            <option value="Integrer">Intégré</option>
            <option value="ancien">Ancien</option>
            <option value="veut rejoindre ICC">Veut rejoindre ICC</option>
            <option value="visiteur">Visiteur</option>
            <option value="a déjà mon église">A déjà mon église</option>
          </select>

          <select
            name="cellule_id"
            value={formData.cellule_id}
            onChange={handleChange}
            className="border rounded px-2 py-1 w-full"
          >
            <option value="">-- Sélectionner cellule --</option>
            {cellules.map((c) => (
              <option key={c.id} value={c.id}>
                {c.cellule} ({c.responsable})
              </option>
            ))}
          </select>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="is_whatsapp"
              checked={formData.is_whatsapp}
              onChange={handleChange}
            />
            <label>💬 WhatsApp</label>
          </div>

          <textarea
            name="infos_supplementaires"
            placeholder="Infos supplémentaires"
            value={formData.infos_supplementaires}
            onChange={handleChange}
            className="border rounded px-2 py-1 w-full"
          />
          <input
            type="text"
            name="venu"
            placeholder="Comment est-il venu"
            value={formData.venu}
            onChange={handleChange}
            className="border rounded px-2 py-1 w-full"
          />
          <input
            type="text"
            name="besoin"
            placeholder="Besoin"
            value={formData.besoin}
            onChange={handleChange}
            className="border rounded px-2 py-1 w-full"
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded w-full hover:bg-blue-700"
          >
            {loading ? "Enregistrement..." : "Enregistrer"}
          </button>
        </form>
      </div>
    </div>
  );
}
