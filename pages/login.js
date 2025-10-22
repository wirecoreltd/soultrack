"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "../lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      // 🔹 Récupère le profil par email
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("id, email, password_hash, role, roles")
        .ilike("email", email);

      if (error) throw error;
      if (!profiles || profiles.length === 0) {
        setMessage("❌ Utilisateur non trouvé !");
        return;
      }

      const user = profiles[0];

      // 🔹 Vérifie le mot de passe côté serveur avec bcrypt
      const { data: isValid, error: verifyError } = await supabase.rpc(
        "verify_password",
        {
          plain_password: password,
          hashed_password: user.password_hash,
        }
      );

      if (verifyError) throw verifyError;
      if (!isValid) {
        setMessage("❌ Mot de passe incorrect !");
        return;
      }

      // ✅ Sauvegarde la session
      localStorage.setItem("user", JSON.stringify(user));

      // 🔹 Redirection selon rôle
      const roles = user.roles || [];
      if (roles.includes("Admin") || user.role === "admin") {
        router.push("/administrateur");
      } else if (roles.includes("ResponsableCellule")) {
        router.push("/cellules-hub");
      } else if (roles.includes("ResponsableEvangelisation")) {
        router.push("/evangelisation-hub");
      } else if (roles.includes("ResponsableIntegration")) {
        router.push("/membres-hub");
      } else {
        router.push("/index");
      }
    } catch (err) {
      console.error("Erreur de connexion :", err);
      setMessage("❌ Une erreur est survenue lors de la connexion.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-blue-100">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-blue-700">
          Connexion
        </h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Adresse email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border rounded-lg"
            required
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border rounded-lg"
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-700 text-white py-3 rounded-lg hover:bg-blue-800 transition"
          >
            Se connecter
          </button>
        </form>
        {message && (
          <p className="text-center mt-4 text-red-500 font-medium">{message}</p>
        )}
      </div>
    </div>
  );
}
