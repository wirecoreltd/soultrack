// pages/add-member.js
"use client";
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function AddMember() {
  const router = useRouter();
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 🔧 Ici tu pourras ajouter ton code Supabase
      // const { error } = await supabase.from("membres").insert([{ nom, prenom, telephone, email }]);
      // if (error) throw error;

      alert("✅ Membre ajouté avec succès !");
      router.push("/admin/liste-membres");
    } catch (error) {
      console.error("Erreur :", error.message);
      alert("❌ Une erreur est survenue lors de l’ajout du membre.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-200 via-sky-100 to-cyan-200 p-6">
      <div className="bg-white/70 rounded-3xl shadow-lg p-8 w-full max-w-md relative">
        
        {/* Bouton retour */}
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 text-white bg-sky-500 hover:bg-sky-600 transition px-3 py-1.5 rounded-full shadow-md"
        >
          ← Retour
        </button>

        {/* Logo */}
        <div className="flex justify-center mb-4 mt-6">
          <Image src="/images/logo.png" alt="Logo" width={80} height={80} />
        </div>

        {/* Titre */}
        <h1 className="text-3xl font-handwriting text-center mb-6 text-gray-800">
          Ajouter un Membre
        </h1>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-2">Nom</label>
            <input
              type="text"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-full border border-gray-300 focus:ring-2 focus:ring-sky-400 outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Prénom</label>
            <input
              type="text"
              value={prenom}
              onChange={(e) => setPrenom(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-full border border-gray-300 focus:ring-2 focus:ring-sky-400 outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Téléphone</label>
            <input
              type="tel"
              value={telephone}
              onChange={(e) => setTelephone(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-full border border-gray-300 focus:ring-2 focus:ring-sky-400 outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-full border border-gray-300 focus:ring-2 focus:ring-sky-400 outline-none"
            />
          </div>

          {/* Boutons */}
          <div className="flex justify-between mt-6">
            <button
              type="button"
              onClick={() => router.push("/admin")}
              className="flex-1 mr-2 bg-gradient-to-r from-sky-400 to-cyan-300 hover:opacity-90 text-white font-semibold py-2 rounded-full shadow-md transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 ml-2 bg-gradient-to-r from-cyan-400 to-sky-400 hover:opacity-90 text-white font-semibold py-2 rounded-full shadow-md transition"
            >
              {loading ? "Ajout..." : "Ajouter"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
