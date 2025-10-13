// pages/admin/create-internal-user.js
"use client";

import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import supabase from "../../lib/supabaseClient";

export default function CreateInternalUser() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "ResponsableIntegration",
    responsable: "",
  });

  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Hash du mot de passe
      const passwordHash = bcrypt.hashSync(formData.password, 10);

      const { data, error } = await supabase.from("profiles").insert([{
        id: uuidv4(),
        username: formData.username,
        email: formData.email,
        password_hash: passwordHash,
        role: formData.role,
        responsable: formData.responsable || null
      }]);

      if (error) throw error;

      setSuccess(true);
      setFormData({
        username: "",
        email: "",
        password: "",
        role: "ResponsableIntegration",
        responsable: "",
      });

      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      alert("Erreur : " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-100 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-2xl">
        <h1 className="text-3xl font-extrabold text-center text-indigo-700 mb-6">
          Créer un utilisateur interne
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Nom d'utilisateur</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Mot de passe</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Rôle</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <option value="ResponsableIntegration">ResponsableIntegration</option>
              <option value="ResponsableEvangelisation">ResponsableEvangelisation</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          {/* Responsable */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Responsable (optionnel)</label>
            <input
              type="text"
              name="responsable"
              value={formData.responsable}
              onChange={handleChange}
              placeholder="Nom du responsable"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          {/* Bouton créer */}
          <button
            type="submit"
            className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-2xl shadow-md transition-all duration-200"
          >
            Créer l'utilisateur
          </button>
        </form>

        {success && (
          <div className="text-green-600 font-semibold text-center mt-3">
            ✅ Utilisateur créé avec succès !
          </div>
        )}
      </div>
    </div>
  );
}
