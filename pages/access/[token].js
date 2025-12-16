"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import supabase from "../../lib/supabaseClient";

export default function AccessTokenPage() {
  const router = useRouter();
  const { token } = router.query;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    prenom: "",
    nom: "",
    telephone: "",
    email: "",
    ville: "",
    infos_supplementaires: "",
  });
  const [submitMessage, setSubmitMessage] = useState("");

  useEffect(() => {
    if (!token) return;

    const validateToken = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("access_tokens")
        .select("access_type")
        .eq("token", token)
        .single();

      if (error || !data) {
        setError("Token invalide ou expiré.");
      }
      setLoading(false);
    };

    validateToken();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitMessage("");

    try {
      const table = "membres";
      const { error } = await supabase.from(table).insert([formData]);

      if (error) setSubmitMessage(`Erreur : ${error.message}`);
      else {
        setSubmitMessage("Enregistrement effectué avec succès !");
        setFormData({ prenom: "", nom: "", telephone: "", email: "", ville: "", infos_supplementaires: "" });
      }
    } catch (err) {
      setSubmitMessage(`Erreur : ${err.message}`);
    }
  };

  if (loading) return <p className="text-center mt-10">Chargement...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-md mx-auto bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-semibold mb-4">Ajouter un membre</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" name="prenom" value={formData.prenom} onChange={handleChange} placeholder="Prénom" required className="w-full border rounded-lg p-2"/>
          <input type="text" name="nom" value={formData.nom} onChange={handleChange} placeholder="Nom" required className="w-full border rounded-lg p-2"/>
          <input type="text" name="telephone" value={formData.telephone} onChange={handleChange} placeholder="Téléphone" required className="w-full border rounded-lg p-2"/>
          <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" className="w-full border rounded-lg p-2"/>
          <input type="text" name="ville" value={formData.ville} onChange={handleChange} placeholder="Ville" className="w-full border rounded-lg p-2"/>
          <textarea name="infos_supplementaires" value={formData.infos_supplementaires} onChange={handleChange} placeholder="Infos supplémentaires" className="w-full border rounded-lg p-2"/>
          <button type="submit" className="w-full py-2 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600">Enregistrer</button>
          {submitMessage && <p className="mt-2 text-center">{submitMessage}</p>}
        </form>
      </div>
    </div>
  );
}
