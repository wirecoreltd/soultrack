// pages/admin/creation-utilisateur.js
import { useState } from "react";
import supabase from "../../lib/supabaseClient";

export default function CreationUtilisateur() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [nomComplet, setNomComplet] = useState("");
  const [role, setRole] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleCreateUser = async () => {
    setLoading(true);
    setMessage("");

    if (!username || !email || !nomComplet || !role || !password) {
      setMessage("Tous les champs sont obligatoires !");
      setLoading(false);
      return;
    }

    try {
      // 1️⃣ Créer l'utilisateur dans Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

      if (authError) throw authError;

      const userId = authData.id;

      // 2️⃣ Ajouter le profil dans la table profiles
      const { error: profileError } = await supabase.from("profiles").insert([
        {
          id: userId,
          username,
          email,
          role,
          responsable: nomComplet,
        },
      ]);

      if (profileError) throw profileError;

      setMessage("Utilisateur créé avec succès !");
      setUsername("");
      setEmail("");
      setNomComplet("");
      setRole("");
      setPassword("");
    } catch (error) {
      console.error(error);
      setMessage("Erreur : " + error.message);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-cyan-400 p-6 flex flex-col items-center">
      <h1 className="text-4xl font-bold text-white mb-6">Créer un utilisateur</h1>

      <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-md">
        <div className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Nom complet / Responsable"
            value={nomComplet}
            onChange={(e) => setNomComplet(e.target.value)}
            className="border p-2 rounded"
          />
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="border p-2 rounded"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border p-2 rounded"
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-2 rounded"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="">-- Choisir un rôle --</option>
            <option value="ResponsableCelluleCpe">Responsable Suivi Membres</option>
            <option value="ResponsableCellule">Responsable Cellule</option>
            <option value="ResponsableEvangelisation">Responsable Evangelisation</option>
            <option value="Admin">Admin</option>
          </select>

          <button
            onClick={handleCreateUser}
            disabled={loading}
            className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Création..." : "Créer l'utilisateur"}
          </button>

          {message && <p className="text-red-600 mt-2">{message}</p>}
        </div>
      </div>
    </div>
  );
}
