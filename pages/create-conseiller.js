"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "../lib/supabaseClient";

export default function CreateConseiller() {
  const router = useRouter();
  const [userId, setUserId] = useState(null); // ID du responsable connecté
  const [membresStar, setMembresStar] = useState([]);
  const [selectedMembre, setSelectedMembre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // ✅ Récupérer le userId côté client uniquement
  useEffect(() => {
    const id = supabase.auth.getUser?.()?.id || localStorage.getItem("userId");
    setUserId(id);
  }, []);

  // 🔹 Charger les membres "star" pour le menu déroulant
  useEffect(() => {
    const fetchMembresStar = async () => {
      const { data, error } = await supabase
        .from("membres")
        .select("id, prenom, nom, email")
        .eq("star", true);

      if (error) {
        console.error(error);
      } else {
        setMembresStar(data);
      }
    };
    fetchMembresStar();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMembre || !email || !password) {
      alert("Veuillez remplir tous les champs !");
      return;
    }

    setLoading(true);
    setMessage("⏳ Création en cours...");

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

      const data = await res.json().catch(() => null);

      if (res.ok) {
        setMessage("✅ Conseiller créé avec succès !");
        setSelectedMembre("");
        setEmail("");
        setPassword("");
      } else {
        setMessage(`❌ Erreur: ${data?.error || "Réponse vide du serveur"}`);
      }
    } catch (err) {
      setMessage("❌ " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-200 via-pink-100 to-yellow-100 p-6">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-lg relative">

        {/* 🔙 Retour */}
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 flex items-center text-black font-semibold hover:text-gray-800"
        >
          ← Retour
        </button>

        <h1 className="text-3xl font-bold text-center mb-6">
          Créer un Conseiller
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* 🔹 Menu déroulant membres star */}
          <select
            value={selectedMembre}
            onChange={(e) => setSelectedMembre(e.target.value)}
            className="input"
            required
          >
            <option value="">-- Sélectionner un membre star --</option>
            {membresStar.map((m) => (
              <option key={m.id} value={m.id}>
                {m.prenom} {m.nom} ({m.email || "sans email"})
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

          {message && (
            <p className="text-center mt-4 text-sm font-semibold">{message}</p>
          )}
        </form>

        {/* Styles input */}
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
