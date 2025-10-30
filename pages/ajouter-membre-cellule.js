// pages/ajouter-membre-cellule.js
"use client";

import { useState, useEffect } from "react";
import supabase from "../lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function AjouterMembreCellule() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    telephone: "",
    ville: "",
    venu: "",
    besoin: "",
    is_whatsapp: false,
    infos_supplementaires: "",
  });
  const [success, setSuccess] = useState(false);
  const [celluleId, setCelluleId] = useState(null);
  const [loadingCellule, setLoadingCellule] = useState(true);

  // 🔹 Récupération de la cellule du responsable connecté
  useEffect(() => {
    const fetchCellule = async () => {
      try {
        const responsableId = localStorage.getItem("userId"); // stocké à la connexion
        if (!responsableId) throw new Error("Utilisateur non trouvé");

        const { data, error } = await supabase
          .from("cellules")
          .select("id, cellule")
          .eq("responsable_id", responsableId)
          .single();

        if (error || !data) throw new Error("Aucune cellule trouvée pour ce responsable !");
        setCelluleId(data.id);
      } catch (err) {
        alert(err.message);
      } finally {
        setLoadingCellule(false);
      }
    };

    fetchCellule();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!celluleId) return alert("Impossible d’ajouter le membre : cellule introuvable.");

    try {
      const memberData = {
        ...formData,
        statut: "Integrer",
        cellule_id: celluleId,
      };

      const { error } = await supabase.from("membres").insert([memberData]);
      if (error) throw error;

      setSuccess(true);
      setFormData({
        nom: "",
        prenom: "",
        telephone: "",
        ville: "",
        venu: "",
        besoin: "",
        is_whatsapp: false,
        infos_supplementaires: "",
      });

      setTimeout(() => setSuccess(false), 3000); // message succès
    } catch (err) {
      alert(err.message);
    }
  };

  if (loadingCellule) return <p className="text-center mt-10 text-gray-700">Chargement...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 to-blue-200 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-2xl">
        <button
          onClick={() => router.back()}
          className="flex items-center text-orange-600 font-semibold mb-4 hover:text-orange-700 transition-colors"
        >
          ← Retour
        </button>

        <h1 className="text-3xl font-handwriting text-black mb-2 text-center">
          Ajouter un membre à ma cellule
        </h1>
        <p className="text-center text-gray-500 italic mb-6">
          Chaque âme a une valeur infinie 🌱
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="prenom"
            placeholder="Prénom"
            value={formData.prenom}
            onChange={handleChange}
            required
            className="input"
          />
          <input
            type="text"
            name="nom"
            placeholder="Nom"
            value={formData.nom}
            onChange={handleChange}
            required
            className="input"
          />
          <input
            type="text"
            name="telephone"
            placeholder="Téléphone"
            value={formData.telephone}
            onChange={handleChange}
            required
            className="input"
          />
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="is_whatsapp"
              checked={formData.is_whatsapp}
              onChange={handleChange}
            />
            <span>WhatsApp</span>
          </div>
          <input
            type="text"
            name="ville"
            placeholder="Ville"
            value={formData.ville}
            onChange={handleChange}
            className="input"
          />
          <select name="venu" value={formData.venu} onChange={handleChange} className="input">
            <option value="">-- Comment est-il venu ? --</option>
            <option value="invité">Invité</option>
            <option value="réseaux">Réseaux</option>
            <option value="evangelisation">Evangélisation</option>
            <option value="autre">Autre</option>
          </select>
          <select name="besoin" value={formData.besoin} onChange={handleChange} className="input">
            <option value="">-- Besoin de la personne ? --</option>
            <option value="Finances">Finances</option>
            <option value="Santé">Santé</option>
            <option value="Travail">Travail</option>
            <option value="Les Enfants">Les Enfants</option>
            <option value="La Famille">La Famille</option>
          </select>
          <textarea
            name="infos_supplementaires"
            placeholder="Infos supplémentaires..."
            value={formData.infos_supplementaires}
            onChange={handleChange}
            rows={3}
            className="input"
          />

          <div className="flex gap-4 mt-2">
            <button
              type="submit"
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-2xl transition-all"
            >
              Ajouter
            </button>
            <button
              type="button"
              onClick={() =>
                setFormData({
                  nom: "",
                  prenom: "",
                  telephone: "",
                  ville: "",
                  venu: "",
                  besoin: "",
                  is_whatsapp: false,
                  infos_supplementaires: "",
                })
              }
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-black font-bold py-3 rounded-2xl transition-all"
            >
              Annuler
            </button>
          </div>
        </form>

        {success && (
          <p className="text-green-600 font-semibold text-center mt-3">
            ✅ Membre ajouté avec succès !
          </p>
        )}

        <style jsx>{`
          .input {
            width: 100%;
            border: 1px solid #ccc;
            border-radius: 12px;
            padding: 12px;
            text-align: center;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }
        `}</style>
      </div>
    </div>
  );
}
