"use client";
import { useState } from "react";

export default function TestCreateUser() {
  const [message, setMessage] = useState("");

  const handleTest = async () => {
    setMessage("⏳ Envoi de la requête...");

    try {
      const res = await fetch("/api/create-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prenom: "Test",
          nom: "User",
          email: "test@test.com",
          role: "Admin",
        }),
      });

      const data = await res.json();
      console.log(data);
      setMessage(JSON.stringify(data, null, 2));
    } catch (err) {
      console.error(err);
      setMessage("❌ " + err.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <button
        onClick={handleTest}
        className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 mb-4"
      >
        Tester API Create User
      </button>

      {message && (
        <pre className="bg-white p-4 rounded shadow w-full max-w-md">{message}</pre>
      )}
    </div>
  );
}
