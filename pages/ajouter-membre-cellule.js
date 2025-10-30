// pages/ajouter-membre-cellule.js

"use client";
import { useState, useEffect } from "react";
import supabase from "../lib/supabaseClient";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function AjouterMembreCellule() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    prenom: "",
    nom: "",
    telephone: "",
    ville: "",
    venu: "",
    besoin: "",
    is_whatsapp: false,
    infos_supplementaires: "",
  });
  const [success, setSuccess] = useState(false);
  const [responsableCelluleId, setResponsableCelluleId] = useState(null);
  const [celluleId, setCelluleId] = useState(null);
  const [responsableNom, setResponsableNom] = useState("");

  // 🟢 Charger la cellule du responsable connecté
  useEffect(() => {
    const fetchResponsableCellule = async () => {
      const userEmail = localStorage.getItem("userEmail");
      if (!userEmail) return;

      const { data: profileData } = await supabase
        .from("profiles")
        .select("id, prenom, nom")
        .eq("email", userEmail)
        .single();

      if (!profileData) return;

      setResponsableCelluleId(profileData.id);
      setResponsableNom(`${profileData.prenom} ${profileData.nom}`);

      const { data: celluleData } = await supabase
        .from("cellules")
        .select("id")
        .eq("responsable_id", profileData.id)
        .single();

      if (celluleData) setCelluleId(celluleData.id);
    };

    fetchResponsableCellule();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // 🟩 Soumission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!celluleId) {
      alert("Aucune cellule trouvée pour ce responsable !");
      return;
    }

    const membreData = {
      ...formData,
      cellule_id: celluleId,
      statut: "Integrer",
      responsable_suivi: responsableNom,
    };

    const { error } = await supabase.from("membres").insert([membreData]);
    if (error) {
      alert("Erreur : " + error.message);
      return;
    }

    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
    setFormData({
      prenom: "",
      nom: "",
      telephone: "",
      ville: "",
      venu: "",
      besoin: "",
      is_whatsapp: false,
      infos_supplementaires: "",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-100 to-yellow-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-2xl border border-emerald-200">

        {/* Flèche retour */}
        <button
          onClick={() => router.back()}
          className="flex items-center text-emerald-600 font-semibold mb-4 hover:text-emerald-700 transition"
        >
          ← Retour
        </button>

        {/* Logo */}
        <div className="flex justify-center mb-4">
          <Image src="/logo.png" alt="Logo ICC" width={80} height={80} />
        </div>

        <h1 className="text-3xl font-extrabold text-center text-emerald-700 mb-2">
          Ajouter un membre à ma cellule
        </h1>
        <p className="text-center text-gray-500 italic mb-6">
          🌿 « Chaque âme compte » – Luc 15:7
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-gray-700 font-medium mb-1">Prénom</label>
            <input
              name="prenom"
              value={formData.prenom}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-400"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Nom</label>
            <input
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-400"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Téléphone</label>
            <input
              name="telephone"
              value={formData.telephone}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-400"
            />
            <div className="mt-2 flex items-center">
              <input
                type="checkbox"
                name="is_whatsapp"
                checked={formData.is_whatsapp}
                onChange={handleChange}
                className="mr-2"
              />
              <label className="text-gray-700">Numéro WhatsApp</label>
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Ville</label>
            <input
              name="ville"
              value={formData.ville}
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-400"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Comment est-il venu ?
            </label>
            <select
              name="venu"
              value={formData.venu}
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-400"
            >
              <option value="">-- Sélectionner --</option>
              <option value="invité">Invité</option>
              <option value="réseaux">Réseaux</option>
              <option value="evangélisation">Évangélisation</option>
              <option value="autre">Autre</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Besoin</label>
            <select
              name="besoin"
              value={formData.besoin}
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-400"
            >
              <option value="">-- Sélectionner --</option>
              <option value="Finances">Finances</option>
              <option value="Santé">Santé</option>
              <option value="Travail">Travail</option>
              <option value="Famille">Famille</option>
              <option value="Autre">Autre</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Informations supplémentaires
            </label>
            <textarea
              name="infos_supplementaires"
              value={formData.infos_supplementaires}
              onChange={handleChange}
              rows={3}
              placeholder="Ajoute ici d'autres détails utiles..."
              className="w-full px-4 py-3 border rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-400"
            />
          </div>

          <div className="flex gap-4 mt-4">
            <button
              type="button"
              onClick={() =>
                setFormData({
                  prenom: "",
                  nom: "",
                  telephone: "",
                  ville: "",
                  venu: "",
                  besoin: "",
                  is_whatsapp: false,
                  infos_supplementaires: "",
                })
              }
              className="flex-1 py-3 bg-yellow-400 hover:bg-yellow-500 text-white font-bold rounded-2xl shadow-md"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-md"
            >
              Ajouter
            </button>
          </div>
        </form>

        {success && (
          <div className="text-emerald-700 font-semibold text-center mt-3">
            ✅ Membre ajouté avec succès à votre cellule !
          </div>
        )}
      </div>
    </div>
  );
}
