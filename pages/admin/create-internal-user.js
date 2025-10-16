//pages/admin/create-user.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import supabase from "../../lib/supabaseClient";
import { canAccessPage } from "../../lib/accessControl";

// 🧮 Fonction pour hasher le mot de passe (compatible navigateur)
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  return hashHex;
}

export default function CreateInternalUserPage() {
  const router = useRouter();
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    prenom: "",
    nom: "",
    email: "",
    password: "",
    role: "Membre",
  });

  // 🧩 Vérification d’accès
  useEffect(() => {
    const storedRole = localStorage.getItem("userRole");
    if (!storedRole) {
      router.replace("/login");
      return;
    }

    const canAccess = canAccessPage(storedRole, router.pathname);
    if (!canAccess) {
      alert("⛔ Accès non autorisé !");
      router.replace("/login");
      return;
    }

    setRole(storedRole);
    setLoading(false);
  }, [router]);

  if (loading) return <div className="text-center mt-20">Chargement...</div>;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 💾 Création utilisateur
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // 1️⃣ Vérifie si l’email existe déjà
      const { data: existingUser } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", formData.email)
        .single();

      if (existingUser) {
        alert("⚠️ Cet email est déjà utilisé !");
        return;
      }

      // 2️⃣ Hachage du mot de passe (SHA-256)
      const hashedPassword = await hashPassword(formData.password);

      // 3️⃣ Insertion dans Supabase
      const { error } = await supabase.from("profiles").insert([
        {
          email: formData.email,
          password_hash: hashedPassword,
          prenom: formData.prenom,
          nom: formData.nom,
          role: formData.role,
        },
      ]);

      if (error) {
        console.error("Erreur Supabase:", error);
        alert("❌ Erreur lors de la création de l’utilisateur !");
        return;
      }

      alert(`✅ Utilisateur "${formData.prenom} ${formData.nom}" créé avec succès !`);
      router.push("/");
    } catch (err) {
      console.error("Erreur inattendue:", err);
      alert("❌ Une erreur inattendue s’est produite");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("userRole");
    router.push("/login");
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{
        background: "linear-gradient(135deg, #2E3192 0%, #92EFFD 100%)",
      }}
    >
      <h1 className="text-4xl font-bold text-white mb-6">
        Créer un utilisateur interne
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md flex flex-col gap-4"
      >
        <div>
          <label className="block text-gray-700 font-semibold mb-1">
            Prénom
          </label>
          <input
            type="text"
            name="prenom"
            value={formData.prenom}
            onChange={handleChange}
            required
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-semibold mb-1">
            Nom
          </label>
          <input
            type="text"
            name="nom"
            value={formData.nom}
            onChange={handleChange}
            required
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-semibold mb-1">
            Adresse email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-semibold mb-1">
            Mot de passe
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-semibold mb-1">Rôle</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="ResponsableIntegration">Responsable Intégration</option>
            <option value="ResponsableEvangelisation">Responsable Évangélisation</option>
            <option value="Membre">Membre</option>
          </select>
        </div>

        <button
          type="submit"
          className="mt-2 bg-gradient-to-r from-blue-600 to-blue-400 text-white font-semibold rounded-xl py-2 hover:opacity-90 transition"
        >
          Créer l’utilisateur
        </button>
      </form>

      <button
        onClick={() => router.push("/")}
        className="mt-4 text-white underline hover:opacity-80"
      >
        ⬅️ Retour à l’accueil
      </button>

      <p
        onClick={handleLogout}
        className="mt-3 text-sm text-white cursor-pointer hover:underline"
      >
        Se déconnecter
      </p>
    </div>
  );
}

