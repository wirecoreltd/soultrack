//✅pages/admin/create-cellule.js

"use client";
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function CreateCellule() {
  const router = useRouter();
  const [nomCellule, setNomCellule] = useState("");
  const [lieu, setLieu] = useState("");
  const [responsable, setResponsable] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 🔧 Ici, ajoute ton code pour insérer la cellule dans Supabase
      // Exemple :
      // const { error } = await supabase.from("cellules").insert([{ nomCellule, lieu, responsable }]);
      // if (error) throw error;

      alert("✅ Cellule créée avec succès !");
      router.push("/admin/liste-cellules");
    } catch (error) {
      console.error("Erreur :", error.message);
      alert("❌ Une erreur est survenue lors de la création de la cellule.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-200 via-lime-100 to-yellow-200 p-6">
      <div className="bg-white/70 rounded-3xl shadow-lg p-8 w-full max-w-md relative">
        
        {/* Bouton retour */}
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 text-white bg-green-500 hover:bg-green-600 transition px-3 py-1.5 rounded-full shadow-md"
        >
          ← Retour
        </button>

        {/* Logo */}
        <div className="flex justify-center mb-4 mt-6">
          <Image src="/images/logo.png" alt="Logo" width={80} height={80} />
        </div>

        {/* Titre */}
        <h1 className="text-3xl font-handwriting text-center mb-6 text-gray-800">
          Créer une Cellule
        </h1>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-2">Nom de la cellule</label>
            <input
              type="text"
              value={nomCellule}
              onChange={(e) => setNomCellule(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-full border border-gray-300 focus:ring-2 focus:ring-green-400 outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Lieu</label>
            <input
              type="text"
              value={lieu}
              onChange={(e) => setLieu(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-full border border-gray-300 focus:ring-2 focus:ring-green-400 outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Responsable</label>
            <input
              type="text"
              value={responsable}
              onChange={(e) => setResponsable(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-full border border-gray-300 focus:ring-2 focus:ring-green-400 outline-none"
            />
          </div>

          {/* Boutons */}
          <div className="flex justify-between mt-6">
            <button
              type="button"
              onClick={() => router.push("/admin")}
              className="flex-1 mr-2 bg-gradient-to-r from-green-400 to-lime-300 hover:opacity-90 text-white font-semibold py-2 rounded-full shadow-md transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 ml-2 bg-gradient-to-r from-lime-400 to-green-400 hover:opacity-90 text-white font-semibold py-2 rounded-full shadow-md transition"
            >
              {loading ? "Création..." : "Créer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
