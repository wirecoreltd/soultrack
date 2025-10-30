//✅pages/admin/create-cellule.js

"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import supabase from "../../lib/supabaseClient";

export default function CreateCellule() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nom: "",
    zone: "",
    responsable_id: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [responsables, setResponsables] = useState([]);

  useEffect(() => {
    const fetchResponsables = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, prenom, nom")
        .in("role", ["ResponsableCellule"]);
      if (!error) setResponsables(data);
    };
    fetchResponsables();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("⏳ Création en cours...");

    try {
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
    } catch (err) {
      setMessage("❌ Erreur serveur: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({ nom: "", zone: "", responsable_id: "" });
    setMessage("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-pink-50 to-orange-100 p-6">
      <div className="bg-white p-8 rounded-3xl shadow-lg w-full max-w-lg relative">
        {/* Flèche retour */}
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 flex items-center text-gray-700 font-semibold hover:text-gray-900 transition-colors"
        >
          ← Retour
        </button>

        {/* Logo centré */}
        <div className="flex justify-center mb-6">
          <Image src="/logo.png" alt="SoulTrack Logo" width={60} height={60} />
        </div>

        <h1 className="text-2xl font-bold mb-4 text-center">Créer une cellule</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="nom"
            placeholder="Nom de la cellule"
            value={formData.nom}
            onChange={handleChange}
            className="input"
          />
          <input
            name="zone"
            placeholder="Zone / Localisation"
            value={formData.zone}
            onChange={handleChange}
            className="input"
          />

          <select
            name="responsable_id"
            value={formData.responsable_id}
            onChange={handleChange}
            className="input"
          >
            <option value="">-- Sélectionnez un responsable --</option>
            {responsables.map((r) => (
              <option key={r.id} value={r.id}>
                {r.prenom} {r.nom}
              </option>
            ))}
          </select>

          <div className="flex gap-4 mt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-green-400 to-blue-500 text-white py-2 rounded-2xl hover:from-green-500 hover:to-blue-600 transition-all"
            >
              {loading ? "Création..." : "Créer"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 bg-gradient-to-r from-gray-400 to-gray-500 text-white py-2 rounded-2xl hover:from-gray-500 hover:to-gray-600 transition-all"
            >
              Annuler
            </button>
          </div>
        </form>

        {message && (
          <p
            className={`mt-4 text-center text-sm ${
              message.startsWith("✅") ? "text-green-600" : "text-red-600"
            }`}
          >
            {message}
          </p>
        )}
      </div>

      <style jsx>{`
        .input {
          width: 100%;
          border: 1px solid #ccc;
          border-radius: 12px;
          padding: 12px;
        }
      `}</style>
    </div>
  );
}
