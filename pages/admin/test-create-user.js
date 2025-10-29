"use client";
import { useState } from "react";

export default function TestApiButton() {
  const [result, setResult] = useState("");

  const handleTest = async () => {
    setResult("Chargement...");
    try {
      const res = await fetch("/api/create-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prenom: "Test",
          nom: "User",
          email: "test@test.com",
          role: "Admin",
          password: "Test123!"
        }),
      });

      const text = await res.text(); // récupère tout le corps
      let data;
      try {
        data = JSON.parse(text); // essaie de parser en JSON
      } catch {
        throw new Error("Réponse vide ou non JSON du serveur : " + text);
      }

      if (!res.ok) throw new Error(data?.error || "Erreur inconnue");

      setResult(JSON.stringify(data, null, 2));
    } catch (err) {
      setResult(err.message);
    }
  };

  return (
    <div className="p-4">
      <button
        onClick={handleTest}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Test API Create User
      </button>
      <pre className="mt-4 bg-gray-100 p-4 rounded">{result}</pre>
    </div>
  );
}
