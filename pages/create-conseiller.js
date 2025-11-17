// pages/create-conseiller.js
"use client";

import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function CreateConseiller() {
  const [membresStar, setMembresStar] = useState([]);
  const [selectedMembre, setSelectedMembre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const router = useRouter();

  const userId = supabase.auth.getUser?.()?.id || localStorage.getItem("userId");

  // 🔹 Charger tous les membres « star »
  const fetchMembresStar = async () => {
    const { data, error } = await supabase
      .from("membres")
      .select("id, prenom, nom, email, telephone")
      .eq("star", true);

    if (error) {
      console.error(error);
      return;
    }
    setMembresStar(data);
  };

  useEffect(() => {
    fetchMembresStar();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMembre || !email || !password) {
      setErrorMessage("Veuillez sélectionner un membre et remplir l'email + mot de passe");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/create-conseiller", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          membre_id: selectedMembre,
          email,
          password,
          responsable_id: userId,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data?.error || "Erreur serveur");

      setSuccess(true);
      setSelectedMembre("");
      setEmail("");
      setPassword("");

      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
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

        <h1 className="text-3xl font-bold text-center mb-4">
          Créer un Conseiller
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="font-semibold">Sélectionner un membre (star)</label>
          <select
            className="input"
            value={selectedMembre}
            onChange={(e) => setSelectedMembre(e.target.value)}
            required
          >
            <option value="">-- Choisir un membre --</option>
            {membresStar.map((m) => (
              <option key={m.id} value={m.id}>
                {m.prenom} {m.nom} ({m.telephone || "—"})
              </option>
            ))}
          </select>

          <input
            type="email"
            placeholder="Email du conseiller"
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

          {/* Boutons */}
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
              {loading ? "Création..." : "Créer"}
            </button>
          </div>

          {success && (
            <p className="text-green-600 font-semibold text-center mt-4 animate-pulse">
              ✅ Conseiller créé avec succès !
            </p>
          )}

          {errorMessage && (
            <p className="text-red-600 font-semibold text-center mt-2">{errorMessage}</p>
          )}
        </form>

        <style jsx>{`
          .input {
            width: 100%;
            border: 1px solid #ccc;
            border-radius: 12px;
            padding: 12px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            color: black;
          }
        `}</style>
      </div>
    </div>
  );
}
