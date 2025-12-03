"use client";

import { useState } from "react";
import supabase from "../lib/supabaseClient";

export default function EditUserModal({ user, onClose, onUpdated }) {
  const [form, setForm] = useState({
    prenom: user.prenom,
    nom: user.nom,
    email: user.email,
    telephone: user.telephone || "",
    role: user.role,
  });

  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);

    const { error } = await supabase
      .from("profiles")
      .update(form)
      .eq("id", user.id);

    setSaving(false);

    if (error) {
      alert("Erreur lors de la mise à jour.");
    } else {
      onUpdated();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md">

        <h2 className="text-xl font-bold text-center mb-4">
          Modifier l’utilisateur
        </h2>

        <div className="flex flex-col gap-4">
          <input
            type="text"
            value={form.prenom}
            onChange={(e) => setForm({ ...form, prenom: e.target.value })}
            className="input"
            placeholder="Prénom"
          />

          <input
            type="text"
            value={form.nom}
            onChange={(e) => setForm({ ...form, nom: e.target.value })}
            className="input"
            placeholder="Nom"
          />

          <input
            type="text"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="input"
            placeholder="Email"
          />

          <input
            type="text"
            value={form.telephone}
            onChange={(e) => setForm({ ...form, telephone: e.target.value })}
            className="input"
            placeholder="Téléphone"
          />

          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="input"
          >
            <option value="admin">Admin</option>
            <option value="responsable">Responsable</option>
            <option value="user">Utilisateur</option>
          </select>

          <div className="flex gap-4 mt-4">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-400 text-white font-bold py-3 rounded-2xl"
            >
              Annuler
            </button>

            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-gradient-to-r from-blue-400 to-indigo-500 text-white font-bold py-3 rounded-2xl"
            >
              {saving ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </div>

        <style jsx>{`
          .input {
            width: 100%;
            border: 1px solid #ccc;
            border-radius: 12px;
            padding: 12px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }
        `}</style>
      </div>
    </div>
  );
}
