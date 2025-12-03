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
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  // Charger les données de l'utilisateur
  useEffect(() => {
    if (!user) return;
    setForm({
      prenom: user.prenom || "",
      nom: user.nom || "",
      email: user.email || "",
      telephone: user.telephone || "",
      role: user.role || "",
    });
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!user || !user.id) return;

    setSaving(true);

    try {
      const { data, error } = await supabase
        .from("profiles")
        .update(form)
        .eq("id", user.id)
        .select()
        .single(); // 🔥 important pour récupérer un seul objet

      if (error) {
        alert("❌ Erreur lors de la mise à jour : " + error.message);
        setSaving(false);
        return;
      }

      // Mise à jour instantanée dans la liste
      if (onUpdated) onUpdated(data);

      setSuccess(true);

      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 700);
    } catch (err) {
      console.error("Exception handleSave EditUserModal:", err);
      alert("❌ Une erreur est survenue.");
      setSaving(false);
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm z-[999]">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md">
        <h2 className="text-xl font-bold text-center mb-4">
          Modifier l’utilisateur
        </h2>

        <div className="flex flex-col gap-4">
          <input
            type="text"
            name="prenom"
            value={form.prenom}
            onChange={handleChange}
            className="input"
            placeholder="Prénom"
          />
          <input
            type="text"
            name="nom"
            value={form.nom}
            onChange={handleChange}
            className="input"
            placeholder="Nom"
          />
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="input"
            placeholder="Email"
          />
          <input
            type="text"
            name="telephone"
            value={form.telephone}
            onChange={handleChange}
            className="input"
            placeholder="Téléphone"
          />
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="input"
          >
            <option value="">-- Sélectionnez un rôle --</option>
            <option value="Administrateur">Admin</option>
            <option value="ResponsableCellule">Responsable Cellule</option>
            <option value="ResponsableEvangelisation">Responsable Evangélisation</option>
            <option value="Conseiller">Conseiller</option>
            <option value="ResponsableIntegration">Responsable Intégration</option>
          </select>

          <div className="flex gap-4 mt-4">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-400 text-white font-bold py-3 rounded-2xl hover:bg-gray-500 transition"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-gradient-to-r from-blue-400 to-indigo-500 text-white font-bold py-3 rounded-2xl hover:from-blue-500 hover:to-indigo-600 transition"
            >
              {saving ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>

          {success && (
            <p className="text-green-600 font-semibold text-center mt-3">
              ✔️ Modifié avec succès !
            </p>
          )}
        </div>

        <style jsx>{`
          .input {
            width: 100%;
            border: 1px solid #ccc;
            border-radius: 12px;
            padding: 12px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          }
        `}</style>
      </div>
    </div>
  );
}
