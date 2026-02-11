"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import supabase from "../../lib/supabaseClient";
import ProtectedRoute from "../../components/ProtectedRoute";

function CreateCelluleContent() {
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
  const [brancheId, setBrancheId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  /* =========================
     CONTEXTE UTILISATEUR
     (eglise_id / branche_id)
  ========================= */
  useEffect(() => {
    const initContext = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("eglise_id, branche_id")
        .eq("id", user.id)
        .single();

      if (!profile) return;

      setEgliseId(profile.eglise_id);
      setBrancheId(profile.branche_id);
    };

    initContext();
  }, []);

  /* =========================
     RESPONSABLES (FILTRÉS)
  ========================= */
  useEffect(() => {
    if (!egliseId || !brancheId) return;

    const fetchResponsables = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, prenom, nom, telephone")
        .eq("role", "ResponsableCellule")
        .eq("eglise_id", egliseId)
        .eq("branche_id", brancheId);

      if (!error) setResponsables(data || []);
    };

    fetchResponsables();
  }, [egliseId, brancheId]);

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

    if (!egliseId || !brancheId) {
      setMessage("❌ Contexte église/branche introuvable");
      return;
    }

    setLoading(true);
    setMessage("⏳ Création en cours...");

    try {
      const res = await fetch("/api/create-cellule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          eglise_id: egliseId,
          branche_id: brancheId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(`❌ ${data.error}`);
      } else {
        setMessage("✅ Cellule créée avec succès !");
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

        <h1 className="text-3xl font-bold text-center mb-6">
          Créer une cellule
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="nom"
            placeholder="Nom de la cellule"
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
 export default function CreateCellulePage() {
  return (
    <div>
    <ProtectedRoute allowedRoles={["Administrateur", "ResponsableCellule", "SuperviseurCellule"]}>
      <CreateCelluleContent />
    </ProtectedRoute>   
    </div>
  );
}
