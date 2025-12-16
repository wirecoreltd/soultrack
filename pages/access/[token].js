// pages/access/[token].js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import supabase from "../../lib/supabaseClient";

export default function AccessToken() {
  const router = useRouter();
  const { token } = router.query;

  const [accessType, setAccessType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
      } else {
        setAccessType(data.access_type);
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
      const table = accessType === "ajouter_membre" ? "membres" : "evangelises";
      const { error } = await supabase.from(table).insert([formData]);

      if (error) {
        setSubmitMessage(`Erreur : ${error.message}`);
      } else {
        setSubmitMessage("Enregistrement effectué avec succès !");
        setFormData({
          prenom: "",
          nom: "",
          telephone: "",
          email: "",
          ville: "",
          infos_supplementaires: "",
        });
      }
    } catch (err) {
      setSubmitMessage(`Erreur : ${err.message}`);
    }
  };

  if (loading) return <p className="text-center mt-10">Chargement...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold text-center mb-6">Bienvenue sur SoulTrack</h1>
      <div className="max-w-md mx-auto bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-semibold mb-4">
          {accessType === "ajouter_membre" ? "Ajouter un membre" : "Ajouter un évangélisé"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {["prenom","nom","telephone","email","ville","infos_supplementaires"].map((field) => (
            <div key={field}>
              <label className="block font-semibold">{field.charAt(0).toUpperCase() + field.slice(1)}</label>
              {field === "infos_supplementaires" ? (
                <textarea
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
                  className="w-full border rounded-lg p-2"
                />
              ) : (
                <input
                  type={field === "email" ? "email" : "text"}
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
                  className="w-full border rounded-lg p-2"
                  required={field !== "email" && field !== "ville" && field !== "infos_supplementaires"}
                />
              )}
            </div>
          ))}
          <button
            type="submit"
            className="w-full py-2 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600"
          >
            Enregistrer
          </button>
          {submitMessage && <p className="mt-2 text-center">{submitMessage}</p>}
        </form>
      </div>
    </div>
  );
}
