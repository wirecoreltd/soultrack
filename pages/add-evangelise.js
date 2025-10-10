"use client";
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

// 🧩 Initialise Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_KEY
);

export default function AddEvangelise() {
  const [formData, setFormData] = useState({
    prenom: "",
    nom: "",
    telephone: "",
    is_whatsapp: false,
    ville: "",
    besoin: "",
    infos_supplementaires: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // 🔄 Gérer les changements des inputs
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // 💾 Envoi des données à Supabase
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const { data, error } = await supabase.from("evangelises").insert([
        {
          prenom: formData.prenom.trim(),
          nom: formData.nom.trim(),
          telephone: formData.telephone.trim(),
          is_whatsapp: formData.is_whatsapp,
          ville: formData.ville.trim(),
          besoin: formData.besoin.trim(),
          infos_supplementaires: formData.infos_supplementaires.trim(),
        },
      ]);

      if (error) throw error;

      setMessage("✅ Évangélisé ajouté avec succès !");
      setFormData({
        prenom: "",
        nom: "",
        telephone: "",
        is_whatsapp: false,
        ville: "",
        besoin: "",
        infos_supplementaires: "",
      });
    } catch (error) {
      console.error("Erreur Supabase :", error);
      setMessage("❌ Erreur : " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white shadow-md rounded-xl p-6">
      <h2 className="text-2xl font-bold text-center mb-4">
        Ajouter un Évangélisé
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Prénom */}
        <div>
          <label className="block font-semibold">Prénom</label>
          <input
            type="text"
            name="prenom"
            value={formData.prenom}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2"
            required
          />
        </div>

        {/* Nom */}
        <div>
          <label className="block font-semibold">Nom</label>
          <input
            type="text"
            name="nom"
            value={formData.nom}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2"
            required
          />
        </div>

        {/* Téléphone */}
        <div>
          <label className="block font-semibold">Téléphone</label>
          <input
            type="text"
            name="telephone"
            value={formData.telephone}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2"
            required
          />
        </div>

        {/* WhatsApp */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="is_whatsapp"
            checked={formData.is_whatsapp}
            onChange={handleChange}
          />
          <label>WhatsApp</label>
        </div>

        {/* Ville */}
        <div>
          <label className="block font-semibold">Ville</label>
          <input
            type="text"
            name="ville"
            value={formData.ville}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>

        {/* Besoin */}
        <div>
          <label className="block font-semibold">Besoin</label>
          <input
            type="text"
            name="besoin"
            value={formData.besoin}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>

        {/* Infos supplémentaires */}
        <div>
          <label className="block font-semibold">Infos supplémentaires</label>
          <textarea
            name="infos_supplementaires"
            value={formData.infos_supplementaires}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2"
            rows="3"
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold"
        >
          {loading ? "Ajout en cours..." : "Ajouter"}
        </button>
      </form>

      {message && (
        <p className="mt-4 text-center font-semibold text-gray-700">{message}</p>
      )}
    </div>
  );
}
