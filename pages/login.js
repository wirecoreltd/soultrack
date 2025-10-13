//pages/login.js
"use client";
import { useState } from "react";
import { useRouter } from "next/router";
import supabase from "../lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1) Recherche du profil par email
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("email", email)
        .single();

      if (profileError || !profile) {
        setError("Utilisateur introuvable");
        setLoading(false);
        return;
      }

      // 2) Appel du RPC verify_password
      //    ATTENTION: ton RPC doit renvoyer un tableau avec un champ `verify` (true/false)
      const { data: checkPassword, error: rpcError } = await supabase.rpc(
        "verify_password",
        {
          p_password: password,
          p_hash: profile.password_hash,
        }
      );

      if (rpcError) {
        console.error("Erreur RPC verify_password:", rpcError);
        setError("Erreur lors de la vérification du mot de passe");
        setLoading(false);
        return;
      }

      // `checkPassword` peut être un tableau; on vérifie le premier élément
      const verified =
        Array.isArray(checkPassword) && checkPassword[0] && checkPassword[0].verify === true;

      if (!verified) {
        setError("Mot de passe incorrect");
        setLoading(false);
        return;
      }

      // 3) Connexion réussie -> persister l'info côté client
      // Stocke l'id et le role pour que /home et le reste de l'app sachent qui est connecté
      localStorage.setItem("userId", profile.id);
      // suppose que ta table profiles contient un champ "role" (ex: "admin" / "user")
      const role = profile.role || "user";
      localStorage.setItem("userRole", role);

      // 4) Redirection vers la page home
      router.push("/home");
    } catch (err) {
      console.error("Erreur inattendue:", err);
      setError("Erreur inattendue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 via-yellow-50 to-blue-100 p-6">
      <div className="bg-white p-10 rounded-3xl shadow-lg w-full max-w-md flex flex-col items-center">
        {/* Titre avec logo responsive */}
        <h1 className="text-5xl font-handwriting text-black-800 mb-3 flex flex-col sm:flex-row items-center justify-center gap-3">
          <img
            src="/logo.png"
            alt="Logo SoulTrack"
            className="w-12 h-12 object-contain"
          />
          SoulTrack
        </h1>

        {/* Message de bienvenue */}
        <p className="text-center text-gray-700 mb-6">
          Bienvenue sur SoulTrack !<br />
          Une plateforme pour garder le contact, organiser les visites, et soutenir chaque membre dans sa vie spirituelle.
        </p>

        {/* Formulaire login */}
        <form onSubmit={handleLogin} className="flex flex-col w-full gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-gray-300 p-3 rounded-lg w-full text-center shadow-sm focus:outline-green-500 focus:ring-2 focus:ring-green-200 transition"
            required
            autoComplete="email"
          />

          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-gray-300 p-3 rounded-lg w-full text-center shadow-sm focus:outline-green-500 focus:ring-2 focus:ring-green-200 transition"
            required
            autoComplete="current-password"
          />

          {error && <p className="text-red-500 text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-green-400 to-blue-400 hover:from-green-500 hover:to-blue-500 text-white font-bold py-3 rounded-2xl shadow-md transition-all duration-200"
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        {/* Texte biblique sous le bouton */}
        <p className="text-center italic font-semibold mt-4 text-green-600">
          "Aimez-vous les uns les autres comme je vous ai aimés." – Jean 13:34
        </p>
      </div>
    </div>
  );
}
