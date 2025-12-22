"use client";

import { useState, useEffect } from "react";
import supabase from "../lib/supabaseClient";

export default function EditMemberPopup({ member, onClose, onUpdateMember }) {
  const [formData, setFormData] = useState({ ...member });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setFormData({ ...member });
  }, [member]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = { ...formData };

      const { error } = await supabase
        .from("membres")
        .update(payload)
        .eq("id", member.id);

      if (error) throw error;

      // 🔹 Récupération du membre actualisé
      const { data: refreshedMember, error: viewError } = await supabase
        .from("v_membres_full")
        .select("*")
        .eq("id", member.id)
        .single();

      if (viewError) throw viewError;

      // ⚡ Mise à jour instantanée via contexte
      if (onUpdateMember) onUpdateMember(refreshedMember);

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 300);
    } catch (err) {
      console.error("Erreur EditMemberPopup:", err);
      alert("❌ Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-3xl w-full max-w-md shadow-xl relative overflow-y-auto max-h-[95vh]">
        <button onClick={onClose} className="absolute top-3 right-3 text-red-500 font-bold text-xl hover:text-red-700">✕</button>
        <h2 className="text-2xl font-bold text-center mb-4">Éditer {member.prenom} {member.nom}</h2>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col">
            <label>Prénom :</label>
            <input name="prenom" value={formData.prenom} onChange={handleChange} className="input" />
          </div>

          <div className="flex flex-col">
            <label>Nom :</label>
            <input name="nom" value={formData.nom} onChange={handleChange} className="input" />
          </div>

          <div className="flex flex-col">
            <label>Statut :</label>
            <input name="statut" value={formData.statut} onChange={handleChange} className="input" />
          </div>

          <div className="flex gap-4 mt-2">
            <button onClick={onClose} className="flex-1 bg-gray-400 hover:bg-gray-500 text-white py-2 rounded">Annuler</button>
            <button onClick={handleSubmit} disabled={loading} className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded">
              {loading ? "Enregistrement..." : "Sauvegarder"}
            </button>
          </div>

          {success && <p className="text-green-600 font-semibold text-center mt-2">✔️ Modifié avec succès !</p>}
        </div>

        <style jsx>{`
          .input {
            width: 100%;
            padding: 8px;
            border: 1px solid #ccc;
            border-radius: 8px;
          }
        `}</style>
      </div>
    </div>
  );
}
