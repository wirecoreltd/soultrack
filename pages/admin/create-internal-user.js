// pages/admin/create-internal-user.js
"use client";

import { useState } from "react";
import supabase from "../../lib/supabaseClient";
import { useRouter } from "next/router";

// Générateur UUID simple
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Hash mot de passe SHA-256
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export default function CreateInternalUser() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "ResponsableIntegration",
    responsable: "",
  });
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!formData.username || !formData.email || !formData.password) {
      setErrorMsg("Tous les champs obligatoires doivent être remplis.");
      return;
    }

    try {
      const id = generateUUID();
      const password_hash = await hashPassword(formData.password);

      const { data, error } = await supabase
        .from("profiles")
        .insert([{
          id,
          username: formData.username,
          email: formData.email,
          password_hash,
          role: formData.role,
          responsable: formData.responsable || null,
        }]);

      if (error) throw error;

      setSuccessMsg(`Utilisateur "${formData.username}" créé avec succès !`);
      setFormData({
        username: "",
        email: "",
        password: "",
        role: "ResponsableIntegration",
        responsable: "",
      });
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-100 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-2xl">
        <h1 className="text-3xl font-extrabold text-center text-indigo-700 mb-6">
          Créer un utilisateur interne
        </h1>

        {errorMsg && (
          <div className="text-red-600 font-semibold text-center mb-3">{errorMsg}</div>
        )}
        {successMsg && (
          <div className="text-green-600 font-semibold text-center mb-3">{successMsg}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-1">Nom d'utilisateur</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Mot de passe</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Rôle</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <option value="Admin">Admin</option>
              <option value="ResponsableIntegration">Responsable Integration</option>
              <option value="ResponsableEvangelisation">Responsable Evangelisation</option>
            </select>
          </div>          

          <button
            type="submit"
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-md transition-all duration-200"
          >
            Créer l'utilisateur
          </button>
        </form>
      </div>
    </div>
  );
}
