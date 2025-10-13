"use client";

import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState(""); // messages utilisateurs
  const [user, setUser] = useState(null);

  // Récupère la session utilisateur si présente et écoute les changements d'auth
  useEffect(() => {
    let mounted = true;

    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setUser(data?.session?.user ?? null);
    };

    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setUser(session?.user ?? null);
    });

    return () => {
      mounted = false;
      if (listener?.subscription) listener.subscription.unsubscribe();
    };
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setInfo("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setInfo(error.message);
      } else {
        // on recharge la session côté client (sécurise la persistance)
        await supabase.auth.getSession();
        setInfo("Connexion réussie.");
        setEmail("");
        setPassword("");
      }
    } catch (err) {
      console.error("Erreur login:", err);
      setInfo("Erreur inattendue lors de la connexion.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    setInfo("");
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        setInfo(error.message);
      } else {
        setInfo("Déconnecté.");
        setUser(null);
      }
    } catch (err) {
      console.error("Erreur signOut:", err);
      setInfo("Erreur lors de la déconnexion.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-6">
        <h1 className="text-2xl font-semibold mb-4 text-center">Connexion</h1>

        {/* Affichage info / session */}
        <div className="mb-4">
          {user ? (
            <div className="text-sm bg-green-50 border border-green-100 p-3 rounded">
              <p className="font-medium">Session active</p>
              <p>Utilisateur : {user.email ?? user.id}</p>
              <p className="text-xs text-gray-500">ID : {user.id}</p>
              <button
                onClick={handleSignOut}
                disabled={loading}
                className="mt-3 w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded"
              >
                {loading ? "Déconnexion..." : "Se déconnecter"}
              </button>
            </div>
          ) : (
            <div className="text-sm bg-yellow-50 border border-yellow-100 p-3 rounded">
              <p className="font-medium">Aucune session active</p>
              <p className="text-xs text-gray-500">Connecte-toi ci-dessous.</p>
            </div>
          )}
        </div>

        {/* Message d'info ou d'erreur */}
        {info && (
          <p
            className={`mb-4 text-sm p-2 rounded ${
              info.toLowerCase().includes("erreur") ? "bg-red-50 text-red-700" : "bg-blue-50 text-blue-700"
            }`}
          >
            {info}
          </p>
        )}

        {/* Formulaire login (toujours accessible) */}
        <form onSubmit={handleLogin} className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="email@example.com"
          />

          <label className="block text-sm font-medium text-gray-700">Mot de passe</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="Mot de passe"
          />

          <div className="flex items-center justify-between">
            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded"
            >
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </div>
        </form>

        <p className="mt-4 text-xs text-gray-500">
          Tu peux rester sur cette page même si tu es déjà connecté — pas de redirection automatique.
        </p>
      </div>
    </div>
  );
}
