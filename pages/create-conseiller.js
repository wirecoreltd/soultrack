"use client";

import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function CreateConseiller() {
  const [membresStar, setMembresStar] = useState([]);
  const [selectedMembreId, setSelectedMembreId] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const router = useRouter();

  // =====================
  // 1️⃣ Récupérer les membres STAR
  // =====================
  const fetchMembresStar = async () => {
    const { data, error } = await supabase
      .from("membres")
      .select("id, prenom, nom, telephone, email")
      .eq("star", true);

    if (!error) setMembresStar(data);
  };

  // =====================
  // 2️⃣ Récupérer le profil connecté (responsable)
  // =====================
  const getCurrentProfile = async () => {
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user?.id) return null;

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.user.id)
      .single();

    return data;
  };

  useEffect(() => {
    fetchMembresStar();
  }, []);

  // =====================
  // 3️⃣ Soumission du formulaire
  // =====================
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMembreId) return alert("Sélectionnez un membre !");

    setLoading(true);

    // ➤ Récupérer les infos du membre sélectionné
    const { data: membre } = await supabase
      .from("membres")
      .select("*")
      .eq("id", selectedMembreId)
      .single();

    if (!membre) {
      setLoading(false);
      return alert("Membre introuvable.");
    }

    // ➤ Vérifier si ce membre a déjà un profil
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("*")
      .eq("email", membre.email)
      .maybeSingle();

    let profileId = existingProfile?.id;

    // ➤ 3A : Créer un profile si inexistant
    if (!profileId) {
      const { data: newProfile, error: profileError } = await supabase
        .from("profiles")
        .insert([
          {
            email: membre.email,
            prenom: membre.prenom,
            nom: membre.nom,
            telephone: membre.telephone,
            role: "Conseiller",
          },
        ])
        .select()
        .single();

      if (profileError) {
        console.error(profileError);
        setLoading(false);
        return alert("Erreur lors de la création du profil !");
      }

      profileId = newProfile.id;
    }

    // ➤ 3B : Lier le conseiller à son responsable
    const responsable = await getCurrentProfile();

    await supabase
      .from("profiles")
      .update({ responsable_id: responsable.id })
      .eq("id", profileId);

    // ➤ 3C : Mettre à jour le membre pour le relier au conseiller
    await supabase
      .from("membres")
      .update({ conseiller_id: profileId })
      .eq("id", membre.id);

    setLoading(false);
    setSuccess(true);
    setSelectedMembreId("");

    setTimeout(() => setSuccess(false), 3000);
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

        <h1 className="text-3xl font-bold text-center mb-4">
          Ajouter un Conseiller
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {/* Sélection du membre STAR */}
          <select
            value={selectedMembreId}
            onChange={(e) => setSelectedMembreId(e.target.value)}
            className="input"
          >
            <option value="">Sélectionner un membre STAR</option>
            {membresStar.map((m) => (
              <option key={m.id} value={m.id}>
                {m.prenom} {m.nom} — {m.telephone}
              </option>
            ))}
          </select>

          {/* Boutons */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-2xl text-white font-bold bg-gradient-to-r from-blue-400 to-indigo-500 hover:from-blue-500 hover:to-indigo-600"
          >
            {loading ? "Création..." : "Créer le Conseiller"}
          </button>

          {success && (
            <p className="text-green-600 font-semibold text-center mt-4 animate-pulse">
              ✅ Conseiller créé avec succès !
            </p>
          )}
        </form>

        <style jsx>{`
          .input {
            width: 100%;
            border: 1px solid #ccc;
            border-radius: 12px;
            padding: 12px;
            text-align: left;
            color: black;
          }
        `}</style>
      </div>
    </div>
  );
}
