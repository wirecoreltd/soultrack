"use client";

import { useState, useEffect } from "react";
import supabase from "../lib/supabaseClient";

export default function EditUserModal({ user, onClose, onUpdated }) {
  const [form, setForm] = useState({
    prenom: "",
    nom: "",
    email: "",
    telephone: "",
    role: "",
    role_description: "",
  });

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  // Liste des rôles techniques + description
  const roles = [
    { value: "Administrateur", label: "Administrateur" },
    { value: "ResponsableCellule", label: "Responsable Cellule" },
    { value: "ResponsableEvangelisation", label: "Responsable Évangélisation" },
    { value: "Conseiller", label: "Conseiller" },
    { value: "ResponsableIntegration", label: "Responsable Intégration" },
  ];

  useEffect(() => {
    if (!user) return;
    setForm({
      prenom: user.prenom || "",
      nom: user.nom || "",
      email: user.email || "",
      telephone: user.telephone || "",
      role: user.role || "",
      role_description: user.role_description || "",
    });
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Quand on change le rôle, on change aussi automatiquement la description
    if (name === "role") {
      const roleFound = roles.find(r => r.value === value);
      setForm(prev => ({
        ...prev,
        role: value,
        role_description: roleFound ? roleFound.label : ""
      }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async () => {
    if (!user?.id) return;
    setSaving(true);

    const { data, error } = await supabase
      .from("profiles")
      .update({
        prenom: form.prenom,
        nom: form.nom,
        email: form.email,
        telephone: form.telephone,
        role: form.role,
        role_description: form.role_description,
      })
      .eq("id", user.id)
      .select();

    setSaving(false);

    if (error) {
      alert("❌ Erreur lors de la mise à jour : " + error.message);
      return;
    }

    if (data && data.length > 0 && onUpdated) {
      onUpdated(data[0]);
    }

    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      onClose();
    }, 700);
  };

  if (!user) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm z-50 p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md">
        <div className="flex flex-col items-center mb-4">
          <img src="/logo.png" alt="Logo" className="w-20 h-20" />
          <h2 className="text-xl font-bold text-center mt-2">Modifier l’utilisateur</h2>
        </div>

        <div className="flex flex-col gap-4">
          <input type="text" name="prenom" value={form.prenom} onChange={handleChange} placeholder="Prénom" className="input" />
          <input type="text" name="nom" value={form.nom} onChange={handleChange} placeholder="Nom" className="input" />
          <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="Email" className="input" />
          <input type="text" name="telephone" value={form.telephone} onChange={handleChange} placeholder="Téléphone" className="input" />

          <select name="role" value={form.role} onChange={handleChange} className="input">
            <option value="">-- Sélectionnez un rôle --</option>
            {roles.map(r => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>

          <div className="flex gap-4 mt-4">
            <button onClick={onClose} className="flex-1 bg-gray-400 text-white font-bold py-3 rounded-2xl hover:bg-gray-500 transition">Annuler</button>
            <button onClick={handleSave} disabled={saving} className="flex-1 bg-gradient-to-r from-blue-400 to-indigo-500 text-white font-bold py-3 rounded-2xl hover:from-blue-500 hover:to-indigo-600 transition">
              {saving ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>

          {success && <p className="text-green-600 font-semibold text-center mt-2">✔️ Modifié avec succès !</p>}
        </div>

        <style jsx>{`
          .input {
            width: 100%;
            border: 1px solid #ccc;
            border-radius: 12px;
            padding: 12px;
            box-shadow: 0 1px 2px rgba(0,0,0,0.1);
          }
        `}</style>
      </div>
    </div>
  );
}
