// pages/admin/access.js
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function AdminAccess() {
  const [tokens, setTokens] = useState({});
  const responsables = [
    { nom: "Lucie Des Jardins", numero: "23059244320" },
    { nom: "Clency Ravina", numero: "23059321976" },
  ];

  useEffect(() => {
    fetchTokens();
  }, []);

  const fetchTokens = async () => {
    const { data, error } = await supabase
      .from("access_tokens")
      .select("token, access_type");
    if (!error && data) {
      const mapped = {};
      data.forEach((t) => (mapped[t.access_type] = t.token));
      setTokens(mapped);
    }
  };

  const sendLinkWhatsApp = (accessType, responsable) => {
    const token = tokens[accessType];
    if (!token) return;

    const message = `Salut ${responsable.nom} 🙌, voici ton lien pour accéder à la page ${
      accessType === "ajouter_membre" ? "Ajouter un membre" : "Ajouter un évangélisé"
    } : ${process.env.NEXT_PUBLIC_SITE_URL}/api/validate-token?token=${token}`;

    window.open(`https://wa.me/${responsable.numero}?text=${encodeURIComponent(message)}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold text-center mb-6">Administration des liens d'accès</h1>

      {["ajouter_membre", "ajouter_evangélise"].map((type) => (
        <div
          key={type}
          className="bg-white p-6 rounded-xl shadow-md mb-6 max-w-lg mx-auto"
        >
          <h2 className="text-xl font-bold mb-4">
            {type === "ajouter_membre" ? "Ajouter un membre" : "Ajouter un évangélisé"}
          </h2>

          {responsables.map((resp) => (
            <button
              key={resp.numero}
              onClick={() => sendLinkWhatsApp(type, resp)}
              className="w-full mb-3 py-2 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600"
            >
              Envoyer à {resp.nom} via WhatsApp
            </button>
          ))}

          <p className="text-sm text-gray-600 mt-2">
            Lien visible : <br />
            <span className="break-words">{`${process.env.NEXT_PUBLIC_SITE_URL}/api/validate-token?token=${tokens[type]}`}</span>
          </p>
        </div>
      ))}
    </div>
  );
}
