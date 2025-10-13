// pages/admin/creation-utilisateur.js
"use client";

import { useState } from "react";
import supabase from "../../lib/supabaseClient";
import { useRouter } from "next/router";

export default function CreateUser() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("ResponsableIntegration");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .insert([{ username, role, email, phone_number: phone }])
        .select()
        .single();

      if (error) throw error;

      alert("Utilisateur créé avec succès !");
      router.push("/home");
    } catch (err) {
      console.error("Erreur création utilisateur :", err);
      alert("Erreur lors de la création de l'utilisateur.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow-md">
      <h1 className="text-2xl font-bold mb-4">Créer un utilisateur</h1>

      <input
        type="text"
        placeholder="Nom d'utilisateur"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="w-full p-2 border rounded mb-3"
      />

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full p-2 border rounded mb-3"
      />

      <input
        type="text"
        placeholder="Numéro de téléphone"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className="w-full p-2 border rounded mb-3"
      />

      <select
        value={role}
        onChange={(e) => setRole(e.target.value)}
        className="w-full p-2 border rounded mb-3"
      >
        <option value="Admin">Admin</option>
        <option value="ResponsableIntegration">ResponsableIntegration</option>
        <option value="ResponsableEvangelisation">ResponsableEvangelisation</option>
      </select>

      <button
        onClick={handleCreate}
        disabled={loading}
        className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
      >
        {loading ? "Création..." : "Créer l'utilisateur"}
      </button>
    </div>
  );
}
