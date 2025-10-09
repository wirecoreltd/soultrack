import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

export default function GenerateLink() {
  const [tokens, setTokens] = useState([]);
  const [selectedToken, setSelectedToken] = useState("");
  const [generatedLink, setGeneratedLink] = useState("");

  // Charger les tokens depuis la table
  useEffect(() => {
    fetchTokens();
  }, []);

  const fetchTokens = async () => {
    const { data, error } = await supabase
      .from("access_tokens")
      .select("*");
    if (!error && data) setTokens(data);
  };

  const handleGenerateLink = () => {
    if (!selectedToken) return;
    // Générer le lien complet
    const link = `${window.location.origin}/access?token=${selectedToken}`;
    setGeneratedLink(link);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6">Générer un lien d'accès</h1>

      <select
        className="border rounded-lg px-4 py-2 mb-4"
        value={selectedToken}
        onChange={(e) => setSelectedToken(e.target.value)}
      >
        <option value="">-- Choisir un utilisateur / rôle --</option>
        {tokens.map((t) => (
          <option key={t.token} value={t.token}>
            {t.access_type} ({t.token.slice(0, 8)}…)
          </option>
        ))}
      </select>

      <button
        onClick={handleGenerateLink}
        className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
      >
        Générer le lien
      </button>

      {generatedLink && (
        <div className="mt-4 w-full max-w-xl p-4 bg-white rounded-xl shadow-md break-all">
          <p className="font-semibold mb-2">Lien généré :</p>
          <a href={generatedLink} className="text-blue-600 underline" target="_blank">
            {generatedLink}
          </a>
        </div>
      )}
    </div>
  );
}
