//pages/admin/create-internal-user.js
"use client";

import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import supabase from "../../lib/supabaseClient";

export default function CreateInternalUser() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("ResponsableIntegration");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);

  const handleCreateUser = async () => {
    if (!username || !email || !phone) {
      alert("Remplis tous les champs !");
      return;
    }

    setLoading(true);
    try {
      // 1️⃣ Créer l'utilisateur
      const newUserId = uuidv4();
      const { error: userError } = await supabase
        .from("profiles")
        .insert([
          {
            id: newUserId,
            username,
            email,
            role,
            phone_number: phone,
          },
        ]);

      if (userError) throw userError;

      // 2️⃣ Générer un token pour cet utilisateur
      const newToken = uuidv4();
      const { error: tokenError } = await supabase
        .from("access_tokens")
        .insert([
          {
            profile_id: newUserId,
            user_id: newUserId,
            token: newToken,
            access_type: role === "ResponsableIntegration" ? "ajouter_membre" : "ajouter_evangelise",
            expires_at: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000), // +7 jours
          },
        ]);

      if (tokenError) throw tokenError;

      setUserId(newUserId);
      setToken(newToken);
      alert("Utilisateur créé avec succès ! 🎉");
    } catch (err) {
      console.error("Erreur création utilisateur :", err);
      alert("Erreur lors de la création de l'utilisateur !");
    } finally {
      setLoading(false);
    }
  };

  const handleSendLink = async () => {
    if (!userId || !token) return;

    try {
      // Créer le suivi
      const { error } = await supabase
        .from("suivis")
        .upsert(
          { user_id: userId, token: token, created_at: new Date() },
          { onConflict: ["user_id", "token"] }
        );

      if (error) throw error;

      // Ouvrir WhatsApp
      const link = `${window.location.origin}/access/${token}`;
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(link)}`, "_blank");
    } catch (err) {
      console.error("Erreur envoi lien :", err);
      alert("Erreur lors de l'envoi du lien !");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-6 gap-4 bg-gray-50">
      <h1 className="text-3xl font-bold">Créer un utilisateur interne</h1>

      <div className="flex flex-col gap-3 w-full max-w-md bg-white p-6 rounded-xl shadow-md">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="border px-3 py-2 rounded-md w-full"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border px-3 py-2 rounded-md w-full"
        />
        <input
          type="text"
          placeholder="Téléphone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="border px-3 py-2 rounded-md w-full"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="border px-3 py-2 rounded-md w-full"
        >
          <option value="ResponsableIntegration">ResponsableIntegration</option>
          <option value="ResponsableEvangelisation">ResponsableEvangelisation</option>
          <option value="Admin">Admin</option>
        </select>

        <button
          onClick={handleCreateUser}
          disabled={loading}
          className="bg-blue-600 text-white py-2 rounded-md font-semibold hover:bg-blue-700 transition"
        >
          {loading ? "Création..." : "Créer utilisateur"}
        </button>

        {token && (
          <button
            onClick={handleSendLink}
            className="bg-green-600 text-white py-2 rounded-md font-semibold hover:bg-green-700 transition"
          >
            Envoyer le lien WhatsApp
          </button>
        )}
      </div>
    </div>
  );
}
