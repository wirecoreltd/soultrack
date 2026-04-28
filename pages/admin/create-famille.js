"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import supabase from "../../lib/supabaseClient";
import ProtectedRoute from "../../components/ProtectedRoute";

function CreateFamilleContent() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    nom: "",
    zone: "",
    responsable_id: "",
    responsable_nom: "",
    telephone: "",
  });

  const [responsables, setResponsables] = useState([]);
  const [egliseId, setEgliseId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  /* =========================
     CONTEXTE UTILISATEUR
  ========================= */
  useEffect(() => {
    const initContext = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("eglise_id")
        .eq("id", user.id)
        .single();

      if (!profile) return;

      setEgliseId(profile.eglise_id);
    };

    initContext();
  }, []);

  /* =========================
     RESPONSABLES
  ========================= */
  useEffect(() => {
    if (!egliseId) return;

    const fetchResponsables = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, prenom, nom, telephone")
        .eq("role", "ResponsableFamille")
        .eq("eglise_id", egliseId);

      if (!error) setResponsables(data || []);
    };

    fetchResponsables();
  }, [egliseId]);

  /* =========================
     HANDLERS
  ========================= */
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleResponsableChange = (e) => {
    const selected = responsables.find((r) => r.id === e.target.value);

    setFormData({
      ...formData,
      responsable_id: e.target.value,
      responsable_nom: selected ? `${selected.prenom} ${selected.nom}` : "",
      telephone: selected ? selected.telephone || "" : "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!egliseId) {
      setMessage("❌ Contexte église introuvable");
      return;
    }

    setLoading(true);
    setMessage("⏳ Création en cours...");

    try {
      const res = await fetch("/api/create-famille", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          eglise_id: egliseId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(`❌ ${data.error}`);
      } else {
        setMessage("✅ Famille créée avec succès !");
        setFormData({
          nom: "",
          zone: "",
          responsable_id: "",
          responsable_nom: "",
          telephone: "",
        });
      }
    } catch (err) {
      setMessage("❌ Erreur serveur");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  /* =========================
     UI
  ========================= */
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-200 via-pink-100 to-yellow-100 p-6">
      <div className="bg-white p-8 rounded-3xl shadow-lg w-full max-w-lg relative">

        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 text-gray-700"
        >
          ← Retour
        </button>

        <div className="flex justify-center mb-6">
          <Image src="/logo.png" alt="SoulTrack" width={80} height={80} />
        </div>

        <h1 className="text-2xl font-bold mt-4 mb-6 text-center text-black">
          Créer une <br />
          <span className="text-[#333699]">Famille</span>
        </h1>

        <div className="max-w-3xl w-full mb-6 text-center">
          <p className="italic text-base text-black/90">
            Chaque famille doit être créée avec un responsable pour guider et soutenir le groupe
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="nom"
            placeholder="Nom de la famille"
            value={formData.nom}
            onChange={handleChange}
            className="w-full rounded-xl border p-3 text-black"
            required
          />

          <input
            name="zone"
            placeholder="Zone / Localisation"
            value={formData.zone}
            onChange={handleChange}
            className="w-full rounded-xl border p-3 text-black"
            required
          />

          <select
            value={formData.responsable_id}
            onChange={handleResponsableChange}
            className="w-full rounded-xl border p-3 text-black"
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
              value={formData.telephone}
              readOnly
              className="w-full rounded-xl border p-3 bg-gray-100 text-black"
            />
          )}

          <div className="flex gap-4">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 bg-gray-400 text-white py-2 rounded-2xl"
            >
              Annuler
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-indigo-500 text-white py-2 rounded-2xl"
            >
              {loading ? "Création..." : "Créer"}
            </button>
          </div>
        </form>

        {message && (
          <p className="mt-4 text-center text-sm">{message}</p>
        )}
      </div>
    </div>
  );
}

export default function CreateFamillePage() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur", "SuperviseurFamille"]}>
      <CreateFamilleContent />
    </ProtectedRoute>
  );
}
