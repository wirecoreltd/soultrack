//pages/ajouter-membre-cellule.js
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import supabase from "../lib/supabaseClient";
import Image from "next/image";

export default function AjouterMembreCellule() {
  const router = useRouter();
  const [cellules, setCellules] = useState([]);
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    telephone: "",
    ville: "",
    statut: "nouveau",
    venu: "",
    besoin: "",
    cellule_id: "",
    infos_supplementaires: "",
    is_whatsapp: false,
  });

  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchCellules = async () => {
      const userId = localStorage.getItem("userId");
      const { data, error } = await supabase
        .from("cellules")
        .select("id, cellule")
        .eq("responsable_id", userId);

      if (error || !data || data.length === 0) {
        alert("⚠️ Vous n'avez pas encore de cellule assignée. Contactez l'administrateur !");
        return;
      }

      setCellules(data);
      setFormData((prev) => ({ ...prev, cellule_id: data[0].id }));
    };

    fetchCellules();
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
    try {
      const { error } = await supabase.from("membres").insert([formData]);
      if (error) throw error;
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);

      setFormData({
        nom: "",
        prenom: "",
        telephone: "",
        ville: "",
        statut: "nouveau",
        venu: "",
        besoin: "",
        cellule_id: cellules[0]?.id || "",
        infos_supplementaires: "",
        is_whatsapp: false,
      });
    } catch (err) {
      alert("❌ Impossible d’ajouter le membre : " + err.message);
    }
  };

  const handleCancel = () => {
    setFormData({
      nom: "",
      prenom: "",
      telephone: "",
      ville: "",
      statut: "nouveau",
      venu: "",
      besoin: "",
      cellule_id: cellules[0]?.id || "",
      infos_supplementaires: "",
      is_whatsapp: false,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-200 via-pink-100 to-yellow-100 p-6">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-lg relative">

        {/* Flèche retour */}
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 flex items-center text-black font-semibold hover:text-gray-800 transition-colors"
        >
          ← Retour
        </button>

        {/* Logo centré */}
        <div className="flex justify-center mb-6">
          <Image src="/logo.png" alt="SoulTrack Logo" width={80} height={80} />
        </div>

        <h1 className="text-3xl font-bold text-center mb-2">Ajouter un membre à ma cellule</h1>
        <p className="text-center text-gray-500 italic mb-6">
          « Allez, faites de toutes les nations des disciples » – Matthieu 28:19
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            name="prenom"
            placeholder="Prénom"
            value={formData.prenom}
            onChange={handleChange}
            className="input"
            required
          />
          <input
            type="text"
            name="nom"
            placeholder="Nom"
            value={formData.nom}
            onChange={handleChange}
            className="input"
            required
          />
          <input
            type="text"
            name="telephone"
            placeholder="Téléphone"
            value={formData.telephone}
            onChange={handleChange}
            className="input"
            required
          />

          <label className="flex items-center gap-2 mt-1">
            <input
              type="checkbox"
              name="is_whatsapp"
              className="w-5 h-5 accent-indigo-600 cursor-pointer"
              checked={formData.is_whatsapp}
              onChange={handleChange}
            />
            WhatsApp
          </label>

          <input
            type="text"
            name="ville"
            placeholder="Ville"
            value={formData.ville}
            onChange={handleChange}
            className="input"
          />

          <select
            name="venu"
            value={formData.venu}
            onChange={handleChange}
            className="input"
          >
            <option value="">-- Comment est-il venu ? --</option>
            <option value="invité">Invité</option>
            <option value="réseaux">Réseaux</option>
            <option value="evangélisation">Evangélisation</option>
            <option value="autre">Autre</option>
          </select>
          {/* ✅ Besoins avec checkboxes */}
            <div className="text-left">
              <p className="font-semibold mb-2">Besoin :</p>
            
              {[
                "Finances",
                "Santé",
                "Travail",
                "Les Enfants",
                "La Famille"
              ].map((item) => (
                <label key={item} className="flex items-center gap-3 mb-2 cursor-pointer">
                  <input
                    type="checkbox"
                    value={item}
                    checked={Array.isArray(formData.besoin) && formData.besoin.includes(item)}
                    onChange={(e) => {
                      const { checked } = e.target;
                      setFormData((prev) => ({
                        ...prev,
                        besoin: checked
                          ? [...prev.besoin, item]
                          : prev.besoin.filter((b) => b !== item),
                      }));
                    }}
                    className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
                  />
                  {item}
                </label>
              ))}
            
              {/* ✅ Checkbox AUTRE */}
              <label className="flex items-center gap-3 mb-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.besoin.includes("Autre")}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setFormData((prev) => ({
                      ...prev,
                      besoin: checked
                        ? [...prev.besoin, "Autre"]
                        : prev.besoin.filter((b) => b !== "Autre"),
                    }));
                  }}
                  className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
                />
                Autre
              </label>
            
              {/* ✅ Champ texte visible si Autre sélectionné */}
              {formData.besoin.includes("Autre") && (
                <input
                  type="text"
                  placeholder="Précisez..."
                  value={formData.autreBesoin || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      autreBesoin: e.target.value,
                    })
                  }
                  className="input mt-1"
                />
              )}
</div>

          

          <textarea
            name="infos_supplementaires"
            value={formData.infos_supplementaires}
            onChange={handleChange}
            rows={3}
            placeholder="Informations supplémentaires..."
            className="input"
          />

          {/* Boutons */}
          <div className="flex gap-4 mt-4">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white font-bold py-3 rounded-2xl shadow-md transition-all"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-400 to-indigo-500 hover:from-blue-500 hover:to-indigo-600 text-white font-bold py-3 rounded-2xl shadow-md transition-all"
            >
              Ajouter
            </button>
          </div>
        </form>

        {success && (
          <p className="mt-4 text-center text-green-600 font-semibold">
            ✅ Membre ajouté avec succès à ta cellule !
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
            color: black;
          }
        `}</style>
      </div>
    </div>
  );
}
