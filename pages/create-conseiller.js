"use client";

import { useState, useEffect } from "react";
import supabase from "../lib/supabaseClient";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function CreateConseiller() {
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [user, setUser] = useState(null);

  const router = useRouter();

  // ==================== FETCH RESPONSABLE CONNECTÉ ====================
  useEffect(() => {
    const fetchUser = async () => {
      const { data: userData, error } = await supabase.auth.getUser();
      if (error || !userData) {
        console.error("Utilisateur non trouvé :", error);
        return;
      }

      // Récupérer le responsable correspondant à l'email connecté
      const { data, error: fetchError } = await supabase
        .from("responsables")
        .select("id, prenom, cellule_id")
        .eq("email", userData.email)
        .single();

      if (fetchError || !data) {
        console.error("Responsable non trouvé :", fetchError);
        return;
      }

      setUser(data);
    };
    fetchUser();
  }, []);

  // ==================== HANDLE SUBMIT ====================
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prenom || !nom || !telephone) return alert("Remplissez tous les champs !");
    if (!user) return alert("Impossible de récupérer vos informations. Connectez-vous ou réessayez.");

    setLoading(true);

    const { error } = await supabase
      .from("conseillers")
      .insert([{
        prenom,
        nom,
        telephone,
        disponible: true,
        responsable_id: user.id // Lié au responsable connecté
      }]);

    setLoading(false);

    if (error) {
      console.error(error);
      alert("Erreur lors de l'ajout du conseiller !");
    } else {
      setSuccess(true);

      // Reset fields
      setPrenom("");
      setNom("");
      setTelephone("");

      setTimeout(() => setSuccess(false), 3000);
      router.push("/list-conseillers");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-200 via-pink-100 to-yellow-100 p-6">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-lg relative">

        {/* 🔙 Bouton Retour */}
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 flex items-center text-black font-semibold hover:text-gray-800 transition-colors"
        >
          ← Retour
        </button>

        {/* 🟣 Logo */}
        <div className="flex justify-center mb-6">
          <Image src="/logo.png" alt="SoulTrack Logo" width={80} height={80} />
        </div>

        {/* 📝 Titre */}
        <h1 className="text-3xl font-bold text-center mb-4">
          Ajouter un Conseiller
        </h1>
        <p className="text-center text-gray-500 italic mb-6">
          « Les ouvriers sont peu nombreux » – Matthieu 9:37
        </p>

        {/* FORMULAIRE */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Prénom"
            value={prenom}
            onChange={(e) => setPrenom(e.target.value)}
            className="input"
            required
          />
          <input
            type="text"
            placeholder="Nom"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            className="input"
            required
          />
          <input
            type="text"
            placeholder="Téléphone"
            value={telephone}
            onChange={(e) => setTelephone(e.target.value)}
            className="input"
            required
          />

          {/* 🔘 Boutons */}
          <div className="flex justify-between gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 py-3 rounded-2xl text-black font-bold shadow-md transition-all border border-gray-400 hover:bg-gray-100"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 py-3 rounded-2xl text-white font-bold shadow-md transition-all bg-gradient-to-r
               ${loading
                  ? "from-gray-400 to-gray-500"
                  : "from-blue-400 to-indigo-500 hover:from-blue-500 hover:to-indigo-600"
                }`}
            >
              {loading ? "Création..." : "Ajouter"}
            </button>
          </div>
        </form>

        {/* Message Confirm */}
        {success && (
          <p className="text-green-600 font-semibold text-center mt-4 animate-pulse">
            ✅ Conseiller ajouté avec succès !
          </p>
        )}

        {/* Styles globaux */}
        <style jsx>{`
          .input {
            width: 100%;
            border: 1px solid #ccc;
            border-radius: 12px;
            padding: 12px;
            text-align: left;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            color: black;
          }
        `}</style>
      </div>
    </div>
  );
}
