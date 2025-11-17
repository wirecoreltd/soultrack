"use client";

import { useState, useEffect } from "react";
import supabase from "../lib/supabaseClient";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function CreateConseiller() {
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [starMemberId, setStarMemberId] = useState("");
  const [starMembers, setStarMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [userId, setUserId] = useState(null);

  const router = useRouter();

  // 🔹 Récupérer l'utilisateur connecté
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        alert("Impossible de récupérer vos informations. Connectez-vous ou réessayez.");
        return;
      }
      setUserId(user.id);
    };
    fetchUser();
  }, []);

  // 🔹 Charger les membres "star" pour le menu déroulant
  useEffect(() => {
    const fetchStarMembers = async () => {
      const { data, error } = await supabase
        .from("membres")
        .select("id, prenom, nom")
        .eq("star", true);

      if (error) {
        console.error(error);
        return;
      }
      setStarMembers(data || []);
    };
    fetchStarMembers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prenom || !nom || !telephone || !email || !password || !starMemberId) {
      return alert("Remplissez tous les champs !");
    }
    if (!userId) {
      return alert("Impossible de récupérer votre ID utilisateur.");
    }

    setLoading(true);

    // 🔹 Créer le conseiller dans profiles
    const { error } = await supabase
      .from("profiles")
      .insert([{
        prenom,
        nom,
        telephone,
        email,
        role: "Conseiller",
        responsable_id: userId,
        star_member_id: starMemberId, // relier le conseiller au membre "star" choisi
        password_hash: password // pour l'instant stocké en clair (à sécuriser)
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
      setEmail("");
      setPassword("");
      setStarMemberId("");

      setTimeout(() => setSuccess(false), 3000);
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
        <h1 className="text-3xl font-bold text-center mb-2">
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

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
            required
          />

          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
            required
          />

          {/* 🔹 Menu déroulant pour choisir un membre "star" */}
          <select
            value={starMemberId}
            onChange={(e) => setStarMemberId(e.target.value)}
            className="input"
            required
          >
            <option value="">Sélectionnez un membre Star</option>
            {starMembers.map((m) => (
              <option key={m.id} value={m.id}>
                {m.prenom} {m.nom}
              </option>
            ))}
          </select>

          {/* 🔘 Boutons Annuler / Ajouter */}
          <div className="flex justify-between mt-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="w-1/2 mr-2 py-3 rounded-2xl text-black font-bold border border-gray-400 hover:bg-gray-100 transition-all"
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
              {loading ? "Ajout..." : "Ajouter"}
            </button>
          </div>

          {/* Message Confirm */}
          {success && (
            <p className="text-green-600 font-semibold text-center mt-4 animate-pulse">
              ✅ Conseiller ajouté avec succès !
            </p>
          )}
        </form>

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
