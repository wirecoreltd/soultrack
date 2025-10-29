"use client";
import { useState } from "react";

export default function CreateInternalUser() {
  const [formData, setFormData] = useState({
    prenom: "",
    nom: "",
    email: "",
    telephone: "",
    password: "",
    role: "Admin",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/create-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        console.error("❌ Réponse non JSON :", text);
        throw new Error("Réponse vide ou non JSON du serveur");
      }

      if (!res.ok) throw new Error(data?.error || "Erreur inconnue");

      setMessage(data.message);
      setFormData({
        prenom: "",
        nom: "",
        email: "",
        telephone: "",
        password: "",
        role: "Admin",
      });
    } catch (err) {
      console.error(err);
      setMessage("❌ " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-100 p-6">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-md w-full max-w-md"
      >
        <h1 className="text-2xl font-bold mb-6 text-center">
          Créer un utilisateur interne
        </h1>

        {["prenom", "nom", "email", "telephone", "password"].map((field) => (
          <input
            key={field}
            type={field === "password" ? "password" : "text"}
            placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
            value={formData[field]}
            onChange={(e) =>
              setFormData({ ...formData, [field]: e.target.value })
            }
            className="w-full mb-4 p-2 border rounded"
            required
          />
        ))}

        <select
          value={formData.role}
          onChange={(e) =>
            setFormData({ ...formData, role: e.target.value })
          }
          className="w-full mb-4 p-2 border rounded"
        >
          <option value="Admin">Admin</option>
          <option value="ResponsableIntegration">Responsable Integration</option>
          <option value="ResponsableEvangelisation">Responsable Evangelisation</option>
          <option value="ResponsableCellule">Responsable Cellule</option>
          <option value="Membre">Membre</option>
        </select>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          {loading ? "Création..." : "Créer l'utilisateur"}
        </button>

        {message && (
          <pre
            className={`mt-4 text-center ${
              message.startsWith("✅") ? "text-green-600" : "text-red-600"
            }`}
          >
            {message}
          </pre>
        )}
      </form>
    </div>
  );
}
