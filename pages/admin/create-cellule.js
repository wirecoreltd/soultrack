"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import supabase from "../../lib/supabaseClient"; // client normal pour fetch

export default function CreateCellule() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nom: "",
    zone: "",
    responsable_id: "",
  });
  const [responsables, setResponsables] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Récupérer tous les responsables de cellules existants
    async function fetchResponsables() {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, prenom, nom")
        .eq("role", "ResponsableCellule");

      if (!error) setResponsables(data);
    }
    fetchResponsables();
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("⏳ Création en cours...");

    const res = await fetch("/api/create-cellule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await res.json().catch(() => null);

    if (res.ok) {
      setMessage("✅ Cellule créée avec succès !");
      setFormData({ nom: "", zone: "", responsable_id: "" });
    } else {
      setMessage(`❌ Erreur: ${data?.error || "Réponse vide du serveur"}`);
    }

    setLoading(false);
  };

  const handleCancel = () => router.push("/"); // retour accueil

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-br from-purple-200 via-pink-100 to-yellow-200 p-6">
      <div className="w-full flex justify-between items-center mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center text-white font-semibold hover:text-gray-200 transition-colors"
        >
          ← Retour
        </button>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-lg w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-4">
          <Image src="/logo.png" alt="SoulTrack Logo" width={80} height={80} />
        </div>

        <h1 className="text-3xl font-handwriting text-black-800 mb-6 text-center">
          Créer une cellule
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col w-full gap-4">
          <input
            name="nom"
            placeholder="Nom de la cellule"
            value={formData.nom}
            onChange={handleChange}
            className="input"
            required
          />
          <input
            name="zone"
            placeholder="Zone / Ville"
            value={formData.zone}
            onChange={handleChange}
            className="input"
            required
          />
          <select
            name="responsable_id"
            value={formData.responsable_id}
            onChange={handleChange}
            className="input"
            required
          >
            <option value="">-- Sélectionnez un responsable --</option>
            {responsables.map(r => (
              <option key={r.id} value={r.id}>{r.prenom} {r.nom}</option>
            ))}
          </select>

          <div className="flex gap-4 mt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-green-400 to-blue-400 hover:from-green-500 hover:to-blue-500 text-white font-bold py-3 rounded-2xl shadow-md transition-all duration-200"
            >
              {loading ? "Création..." : "Créer"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white font-bold py-3 rounded-2xl shadow-md transition-all duration-200"
            >
              Annuler
            </button>
          </div>
        </form>

        {message && <p className="mt-4 text-center text-sm text-gray-700">{message}</p>}

        <style jsx>{`
          .input {
            width: 100%;
            border: 1px solid #ccc;
            border-radius: 12px;
            padding: 12px;
            text-align: center;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }
        `}</style>
      </div>
    </div>
  );
}
