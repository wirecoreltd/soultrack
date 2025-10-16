//pages/admin/create-user.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { canAccessPage } from "../../lib/accessControl";

export default function CreateInternalUserPage() {
  const router = useRouter();
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "ResponsableIntegration",
  });

  // 🧩 Vérification d’accès (basée sur router.pathname)
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

  // 🔁 Gestion du formulaire
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Ici, tu appelles ton API ou backend pour créer un utilisateur
    console.log("Nouvel utilisateur :", formData);

    alert(`✅ Utilisateur "${formData.name}" créé avec succès !`);
    router.push("/"); // Retour à l’accueil
  };

  // 🔴 Déconnexion
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
            Nom complet
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
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
            Rôle
          </label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="ResponsableIntegration">
              Responsable Intégration
            </option>
            <option value="ResponsableEvangelisation">
              Responsable Évangélisation
            </option>
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

