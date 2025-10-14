//pages/admin/create-user.js

"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import supabase from "../../lib/supabaseClient";

export default function CreateUser() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    prenom: "",
    nom: "",
    email: "",
    password: "",
    role: "ResponsableIntegration",
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    if (role !== "admin") router.push("/login");
  }, [router]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      // 1️⃣ Vérifie si l'email existe déjà
      const { data: existingUser, error: existingError } = await supabase
        .from("profiles")
        .select("email")
        .eq("email", formData.email)
        .maybeSingle();

      if (existingError) throw existingError;

      if (existingUser) {
        setMessage("❌ Cet email existe déjà.");
        return;
      }

      // 2️⃣ Hash le mot de passe via RPC (on utilise la même logique que login)
      const { data: hashResult, error: hashError } = await supabase.rpc(
        "hash_password",
        { p_password: formData.password }
      );

      if (hashError) throw hashError;

      const password_hash = Array.isArray(hashResult)
        ? hashResult[0]
        : hashResult;

      // 3️⃣ Insère le nouvel utilisateur
      const { error: insertError } = await supabase.from("profiles").insert([
        {
          email: formData.email,
          password_hash: password_hash,
          prenom: formData.prenom,
          nom: formData.nom,
          role: formData.role,
        },
      ]);

      if (insertError) throw insertError;

      // 4️⃣ Succès
      setMessage("✅ Utilisateur créé avec succès !");
      setFormData({
        prenom: "",
        nom: "",
        email: "",
        password: "",
        role: "ResponsableIntegration",
      });
    } catch (err) {
      console.error(err);
      setMessage("❌ Erreur : " + err.message);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col justify-center items-center p-6"
      style={{
        background: "linear-gradient(135deg, #09203F 0%, #537895 100%)",
      }}
    >
      <h1 className="text-3xl text-white font-bold mb-6">
        Créer un utilisateur
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-2xl shadow-md w-96 flex flex-col gap-4"
      >
        <input
          name="prenom"
          placeholder="Prénom"
          value={formData.prenom}
          onChange={handleChange}
          required
          className="border border-gray-300 rounded-lg px-3 py-2"
        />

        <input
          name="nom"
          placeholder="Nom"
          value={formData.nom}
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
          <option value="admin">Admin</option>
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
