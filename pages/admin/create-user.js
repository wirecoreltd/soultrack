"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import supabase from "../../lib/supabaseClient";

export default function CreateUser() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "ResponsableIntegration",
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "Admin") router.push("/login");
  }, [router]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    const { error } = await supabase.from("profiles").insert([
      {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      },
    ]);

    if (error) {
      setMessage("❌ Erreur lors de la création de l'utilisateur.");
    } else {
      setMessage("✅ Utilisateur créé avec succès !");
      setFormData({ username: "", email: "", password: "", role: "ResponsableIntegration" });
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col justify-center items-center p-6"
      style={{
        background: "linear-gradient(135deg, #09203F 0%, #537895 100%)",
      }}
    >
      <h1 className="text-3xl text-white font-bold mb-6">Créer un utilisateur</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-2xl shadow-md w-96 flex flex-col gap-4"
      >
        <input
          name="username"
          placeholder="Nom d'utilisateur"
          value={formData.username}
          onChange={handleChange}
          required
          className="border border-gray-300 rounded-lg px-3 py-2"
        />

        <input
          name="email"
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
          className="border border-gray-300 rounded-lg px-3 py-2"
        />

        <input
          name="password"
          type="password"
          placeholder="Mot de passe"
          value={formData.password}
          onChange={handleChange}
          required
          className="border border-gray-300 rounded-lg px-3 py-2"
        />

        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="border border-gray-300 rounded-lg px-3 py-2"
        >
          <option value="ResponsableIntegration">Responsable Intégration</option>
          <option value="ResponsableEvangelisation">Responsable Évangélisation</option>
          <option value="Admin">Admin</option>
        </select>

        {message && (
          <p
            className={`text-center text-sm ${
              message.startsWith("✅") ? "text-green-600" : "text-red-500"
            }`}
          >
            {message}
          </p>
        )}

        <button
          type="submit"
          className="bg-gradient-to-r from-green-600 to-lime-400 text-white py-2 rounded-xl font-semibold hover:shadow-lg transition-all"
        >
          Créer
        </button>
      </form>
    </div>
  );
}
