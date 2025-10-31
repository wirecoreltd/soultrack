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
    responsable_nom: "",
    telephone: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [responsables, setResponsables] = useState([]);

  useEffect(() => {
    const fetchResponsables = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, prenom, nom, telephone")
        .in("role", ["ResponsableCellule"]);
      if (!error) setResponsables(data);
    };
    fetchResponsables();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleResponsableChange = (e) => {
    const selected = responsables.find(r => r.id === e.target.value);
    setFormData({
      ...formData,
      responsable_id: e.target.value,
      responsable_nom: selected ? `${selected.prenom} ${selected.nom}` : "",
      telephone: selected ? selected.telephone || "" : "",
    });
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
        setFormData({ nom: "", zone: "", responsable_id: "", responsable_nom: "", telephone: "" });
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
    setFormData({ nom: "", zone: "", responsable_id: "", responsable_nom: "", telephone: "" });
    setMessage("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-200 via-pink-100 to-yellow-100 p-6">
      <div className="bg-white p-8 rounded-3xl shadow-lg w-full max-w-lg relative">

        {/* Flèche retour */}
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 flex items-center text-gray-700 hover:text-gray-900 transition-colors"
        >
          ← Retour
        </button>

        {/* Logo centré */}
        <div className="flex justify-center mb-6">
          <Image src="/logo.png" alt="SoulTrack Logo" className="w-20 h-18 mx-auto" />
        </div>

        {/* Titre */}
        <h1 className="text-3xl font-bold text-center mb-6">Créer une cellule</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="nom"
            placeholder="Nom de la cellule"
            value={formData.nom}
            onChange={handleChange}
            className="w-full rounded-xl border border-gray-300 p-3 text-black"
            required
          />
          <input
            name="zone"
            placeholder="Zone / Localisation"
            value={formData.zone}
            onChange={handleChange}
            className="w-full rounded-xl border border-gray-300 p-3 text-black"
            required
          />

          <select
            name="responsable_id"
            value={formData.responsable_id}
            onChange={handleResponsableChange}
            className="w-full rounded-xl border border-gray-300 p-3 text-black"
            required
          >
            <option value="">-- Sélectionnez un responsable --</option>
            {responsables.map((r) => (
              <option key={r.id} value={r.id}>
                {r.prenom} {r.nom}
              </option>
            ))}
          </select>

          {formData.responsable_id && (
            <input
              name="telephone"
              placeholder="Téléphone du responsable"
              value={formData.telephone}
              readOnly
              className="w-full rounded-xl border border-gray-300 p-3 text-black bg-gray-100 cursor-not-allowed"
            />
          )}

          {/* Boutons côte à côte */}
          <div className="flex gap-4 mt-2">
            {/* Annuler à gauche */}
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 bg-gradient-to-r from-gray-400 to-gray-500 text-white py-2 rounded-2xl hover:from-gray-500 hover:to-gray-600 transition-all"
            >
              Annuler
            </button>

            {/* Créer à droite */}
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-blue-400 to-indigo-500 text-white py-2 rounded-2xl hover:from-blue-500 hover:to-indigo-600 transition-all"
            >
              {loading ? "Création..." : "Créer"}
            </button>
          </div>
        </form>

        {message && (
          <p
            className={`mt-4 text-center text-sm ${message.startsWith("✅") ? "text-green-600" : "text-red-600"}`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
