"use client";

import { useState, useEffect } from "react";
import supabase from "../lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function CreateConseiller() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [membersStar, setMembersStar] = useState([]);
  const [formData, setFormData] = useState({
    membre_id: "",
    email: "",
    password: "",
  });

  // Récupérer les membres "star"
  useEffect(() => {
    const fetchStarMembers = async () => {
      const { data, error } = await supabase
        .from("membres")
        .select("id, prenom, nom")
        .eq("star", true);

      if (error) {
        console.error(error);
      } else {
        setMembersStar(data || []);
      }
    };
    fetchStarMembers();
  }, []);

  // ID du responsable connecté (profil)
  const [responsableId, setResponsableId] = useState(null);
  useEffect(() => {
    const fetchProfile = async () => {
      const user = supabase.auth.getUser(); // ou getUser() selon la version
      const session = await user;
      if (session?.data?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("email", session.data.user.email)
          .single();
        if (profile) setResponsableId(profile.id);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.membre_id || !formData.email || !formData.password) {
      return setMessage("Remplissez tous les champs !");
    }

    setLoading(true);
    setMessage("⏳ Création en cours...");

    try {
      // 1️⃣ Créer l'utilisateur dans Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: formData.email,
        password: formData.password,
        email_confirm: true,
      });

      if (authError) throw authError;

      const userId = authData.user.id;

      // 2️⃣ Créer le profil dans profiles
      const { data: member } = await supabase
        .from("membres")
        .select("prenom, nom, telephone")
        .eq("id", formData.membre_id)
        .single();

      await supabase.from("profiles").insert([{
        id: userId,
        email: formData.email,
        prenom: member.prenom,
        nom: member.nom,
        telephone: member.telephone,
        role: "Conseiller",
        responsable_id: responsableId,
      }]);

      setMessage("✅ Conseiller créé avec succès !");
      setFormData({ membre_id: "", email: "", password: "" });
    } catch (err) {
      console.error(err);
      setMessage("❌ Erreur: " + (err.message || "Erreur inconnue"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-200 via-pink-100 to-yellow-100 p-6">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-lg">
        <h1 className="text-3xl font-bold text-center mb-4">Créer un Conseiller</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Menu déroulant : choisir le membre star */}
          <select
            name="membre_id"
            value={formData.membre_id}
            onChange={handleChange}
            className="input"
            required
          >
            <option value="">-- Sélectionnez un membre star --</option>
            {membersStar.map((m) => (
              <option key={m.id} value={m.id}>
                {m.prenom} {m.nom}
              </option>
            ))}
          </select>

          <input
            type="email"
            name="email"
            placeholder="Email du conseiller"
            value={formData.email}
            onChange={handleChange}
            className="input"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Mot de passe"
            value={formData.password}
            onChange={handleChange}
            className="input"
            required
          />

          <div className="flex gap-4 mt-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 py-3 rounded-2xl border border-gray-400 text-black hover:bg-gray-100"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 py-3 rounded-2xl text-white font-bold shadow-md transition-all ${
                loading ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"
              }`}
            >
              {loading ? "Création..." : "Créer"}
            </button>
          </div>
        </form>

        {message && <p className="mt-4 text-center font-semibold">{message}</p>}

        <style jsx>{`
          .input {
            width: 100%;
            border: 1px solid #ccc;
            border-radius: 12px;
            padding: 12px;
            text-align: left;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            color: black;
          }
        `}</style>
      </div>
    </div>
  );
}
