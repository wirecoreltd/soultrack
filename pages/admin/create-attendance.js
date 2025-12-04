"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function CreateAttendance() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    date: "",
    type_event: "",
    hommes: "",
    femmes: "",
    enfants: "",
    jeunes: "",
    evangelises: "",
    baptises: "",
    commentaires: "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("⏳ Enregistrement en cours...");

    try {
      const res = await fetch("/api/create-attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json().catch(() => null);

      if (res.ok) {
        setMessage("✅ Statistiques enregistrées avec succès !");
        setForm({
          date: "",
          type_event: "",
          hommes: "",
          femmes: "",
          enfants: "",
          jeunes: "",
          evangelises: "",
          baptises: "",
          commentaires: "",
        });
      } else {
        setMessage(`❌ Erreur: ${data?.error || "Réponse vide du serveur"}`);
      }
    } catch (err) {
      setMessage("❌ " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-br from-purple-200 via-pink-100 to-yellow-200 p-6">
      <div className="bg-white p-8 rounded-3xl shadow-lg w-full max-w-md relative">

        {/* Bouton Retour */}
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 flex items-center text-gray-700 hover:text-gray-900 transition-colors"
        >
          ← Retour
        </button>

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Image src="/logo.png" alt="SoulTrack Logo" width={80} height={80} />
        </div>

        {/* Titre */}
        <h1 className="text-3xl font-bold text-center mb-6">
          Ajouter des statistiques
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {/* Date */}
          <div>
            <label className="text-sm font-semibold">Date du culte</label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              className="input"
              required
            />
          </div>

          {/* Type d'événement */}
          <div>
            <label className="text-sm font-semibold">Type d'événement</label>
            <select
              name="type_event"
              value={form.type_event}
              onChange={handleChange}
              className="input"
              required
            >
              <option value="">-- Sélectionner --</option>
              <option value="Culte">Culte</option>
              <option value="Jeunes">Jeunes</option>
              <option value="Enfants">Enfants</option>
              <option value="Spécial">Spécial</option>
            </select>
          </div>

          {/* Groupes statistiques */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <input
              name="hommes"
              placeholder="Hommes"
              type="number"
              value={form.hommes}
              onChange={handleChange}
              className="input"
              required
            />

            <input
              name="femmes"
              placeholder="Femmes"
              type="number"
              value={form.femmes}
              onChange={handleChange}
              className="input"
              required
            />

            <input
              name="jeunes"
              placeholder="Jeunes"
              type="number"
              value={form.jeunes}
              onChange={handleChange}
              className="input"
              required
            />

            <input
              name="enfants"
              placeholder="Enfants"
              type="number"
              value={form.enfants}
              onChange={handleChange}
              className="input"
              required
            />

            <input
              name="evangelises"
              placeholder="Évangélisés"
              type="number"
              value={form.evangelises}
              onChange={handleChange}
              className="input"
            />

            <input
              name="baptises"
              placeholder="Baptisés"
              type="number"
              value={form.baptises}
              onChange={handleChange}
              className="input"
            />
          </div>

          {/* Commentaires */}
          <textarea
            name="commentaires"
            placeholder="Commentaires (optionnel)"
            value={form.commentaires}
            onChange={handleChange}
            className="input h-24"
          />

          {/* Boutons */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-400 to-indigo-500 hover:from-blue-500 hover:to-indigo-600 text-white font-bold py-3 rounded-2xl shadow-md transition-all duration-200"
          >
            {loading ? "Enregistrement..." : "Enregistrer"}
          </button>
        </form>

        {message && (
          <p className="mt-4 text-center text-sm text-gray-700">{message}</p>
        )}

        <style jsx>{`
          .input {
            width: 100%;
            border: 1px solid #ccc;
            border-radius: 12px;
            padding: 12px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            text-align: left;
          }
        `}</style>
      </div>
    </div>
  );
}
