// pages/access.js
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/router";

export default function Access() {
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
    is_whatsapp: false,
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
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitMessage("");

    try {
      const table = accessType === "add_member" ? "membres" : "evangelises";

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
          is_whatsapp: false,
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
        {accessType === "add_member" && <h2 className="text-xl font-semibold mb-4">Ajouter un membre</h2>}
        {accessType === "add_evangelise" && <h2 className="text-xl font-semibold mb-4">Ajouter un évangélisé</h2>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-semibold">Prénom</label>
            <input
              type="text"
              name="prenom"
              value={formData.prenom}
              onChange={handleChange}
              required
              className="w-full border rounded-lg p-2"
            />
          </div>

          <div>
            <label className="block font-semibold">Nom</label>
            <input
              type="text"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              required
              className="w-full border rounded-lg p-2"
            />
          </div>

          <div>
            <label className="block font-semibold">Téléphone</label>
            <input
              type="text"
              name="telephone"
              value={formData.telephone}
              onChange={handleChange}
              required
              className="w-full border rounded-lg p-2"
            />
          </div>

          <div>
            <label className="block font-semibold">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border rounded-lg p-2"
            />
          </div>

          <div>
            <label className="block font-semibold">Ville</label>
            <input
              type="text"
              name="ville"
              value={formData.ville}
              onChange={handleChange}
              className="w-full border rounded-lg p-2"
            />
          </div>

          <div>
            <label className="block font-semibold">Infos supplémentaires</label>
            <textarea
              name="infos_supplementaires"
              value={formData.infos_supplementaires}
              onChange={handleChange}
              className="w-full border rounded-lg p-2"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="is_whatsapp"
              checked={formData.is_whatsapp}
              onChange={handleChange}
            />
            <span>Disponible sur WhatsApp</span>
          </div>

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
