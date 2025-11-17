//pages/create-conseiller.js

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

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data } = await supabase
          .from("responsables")
          .select("id, prenom, cellule_id")
          .eq("email", session.user.email)
          .single();
        setUser(data);
      }
    };
    fetchUser();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prenom || !nom || !telephone) return alert("Remplissez tous les champs !");

    if (!user) return alert("❌ Impossible de récupérer vos informations.");

    setLoading(true);

    const { error } = await supabase
      .from("conseillers")
      .insert([{
        prenom,
        nom,
        telephone,
        disponible: true,
        created_by: user.id,
        cellule_id: user.cellule_id
      }]);

    setLoading(false);

    if (error) {
      console.error(error);
      alert("Erreur lors de l'ajout du conseiller !");
    } else {
      setSuccess(true);
      setPrenom("");
      setNom("");
      setTelephone("");
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-200 via-pink-100 to-yellow-100 p-6">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-lg relative">
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 flex items-center text-black font-semibold hover:text-gray-800 transition-colors"
        >
          ← Retour
        </button>

        <div className="flex justify-center mb-6">
          <Image src="/logo.png" alt="SoulTrack Logo" width={80} height={80} />
        </div>

        <h1 className="text-3xl font-bold text-center mb-4">Ajouter un Conseiller</h1>
        <p className="text-center text-gray-500 italic mb-6">
          « Les ouvriers sont peu nombreux » – Matthieu 9:37
        </p>

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

          <div className="flex justify-between mt-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="w-1/2 mr-2 py-3 rounded-2xl border font-bold text-gray-700 hover:bg-gray-100 transition-all"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`w-1/2 ml-2 py-3 rounded-2xl text-white font-bold shadow-md transition-all bg-gradient-to-r
                ${loading
                  ? "from-gray-400 to-gray-500"
                  : "from-blue-400 to-indigo-500 hover:from-blue-500 hover:to-indigo-600"
                }`}
            >
              {loading ? "Création..." : "Ajouter"}
            </button>
          </div>
        </form>

        {success && (
          <p className="text-green-600 font-semibold text-center mt-4 animate-pulse">
            ✅ Conseiller ajouté avec succès !
          </p>
        )}

        <style jsx>{`
          .input {
            width: 100%;
            border: 1px solid #ccc;
            border-radius: 12px;
            padding: 12px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }
        `}</style>
      </div>
    </div>
  );
}

