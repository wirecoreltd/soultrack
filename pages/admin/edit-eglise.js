"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import supabase from "../../lib/supabaseClient";
import HeaderPages from "../../components/HeaderPages";
import ProtectedRoute from "../../components/ProtectedRoute";
import Footer from "../../components/Footer";

export default function EditEglise() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur"]}>
      <EditEgliseContent />
    </ProtectedRoute>
  );
}

function EditEgliseContent() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [egliseId, setEgliseId] = useState(null);

  const [formData, setFormData] = useState({
    denomination: "",
    nom: "",
    branche: "",
    ville: "",
    pays: "",
  });

  const [logoUrl, setLogoUrl] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  // Chargement des données actuelles
  useEffect(() => {
    const fetchEglise = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("eglise_id")
        .eq("id", user.id)
        .single();

      if (!profile?.eglise_id) return;
      setEgliseId(profile.eglise_id);

      const { data: eglise } = await supabase
        .from("eglises")
        .select("denomination, nom, branche, ville, pays, logo_url")
        .eq("id", profile.eglise_id)
        .single();

      if (eglise) {
        setFormData({
          denomination: eglise.denomination || "",
          nom: eglise.nom || "",
          branche: eglise.branche || "",
          ville: eglise.ville || "",
          pays: eglise.pays || "",
        });
        setLogoUrl(eglise.logo_url || null);
        setLogoPreview(eglise.logo_url || null);
      }

      setLoading(false);
    };

    fetchEglise();
  }, []);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ["image/png", "image/svg+xml", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setMessage("❌ Format invalide. Utilisez PNG, SVG ou WEBP uniquement.");
      e.target.value = "";
      return;
    }

    const maxSize = 500 * 1024;
    if (file.size > maxSize) {
      setMessage("❌ Image trop lourde. Maximum 500 Ko.");
      e.target.value = "";
      return;
    }

    const img = new window.Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      if (img.width !== img.height) {
        setMessage("❌ Le logo doit être carré (ex: 200x200, 512x512).");
        e.target.value = "";
        URL.revokeObjectURL(img.src);
        return;
      }
      setLogoFile(file);
      setLogoPreview(img.src);
      setMessage("");
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!egliseId) return;

    setSaving(true);
    setMessage("⏳ Sauvegarde en cours...");

    try {
      let newLogoUrl = logoUrl;

      if (logoFile) {
        setMessage("⏳ Upload du logo...");
        const fd = new FormData();
        fd.append("file", logoFile);
        const uploadRes = await fetch("/api/upload-logo", {
          method: "POST",
          body: fd,
        });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.error || "Erreur upload logo");
        newLogoUrl = uploadData.url;
      }

      const { error } = await supabase
        .from("eglises")
        .update({
          denomination: formData.denomination,
          nom: formData.nom,
          branche: formData.branche,
          ville: formData.ville,
          pays: formData.pays,
          logo_url: newLogoUrl,
        })
        .eq("id", egliseId);

      if (error) throw new Error(error.message);

      setLogoUrl(newLogoUrl);
      setLogoFile(null);
      setLogoPreview(newLogoUrl);
      setMessage("✅ Informations mises à jour avec succès !");
      // ✅ PAS de setTimeout ni de reload ici

    } catch (err) {
      setMessage("❌ " + err.message);
    } finally {
      setSaving(false);
    }
  }; 

  if (loading)
    return <p className="text-center mt-10 text-white">Chargement...</p>;

  return (
    <div className="min-h-screen p-6 bg-[#333699]">
      <HeaderPages />

      <h1 className="text-2xl font-bold mt-8 mb-2 text-center text-white">
        Modifier les informations de l'
        <span className="text-emerald-300">Église</span>
      </h1>

      <div className="max-w-3xl w-full mb-6 text-center mx-auto">
        <p className="italic text-base text-white/90">
          Mettez à jour les informations de votre église.{" "}
          <span className="text-blue-300 font-semibold">
            Ces données apparaissent sur l'ensemble de l'application
          </span>{" "}
          et sont visibles par tous les membres.
        </p>
      </div>

      <div className="max-w-lg mx-auto bg-white/10 rounded-2xl p-6 flex flex-col gap-4">

        {/* Logo actuel */}
        <div className="flex flex-col items-center gap-3">
          {logoPreview ? (
            <img
              src={logoPreview}
              alt="Logo église"
              className="w-24 h-24 object-contain"
            />
          ) : (
            <div className="w-24 h-24 rounded-xl bg-white/20 flex items-center justify-center text-white/50 text-sm">
              Aucun logo
            </div>
          )}

          <label className="cursor-pointer border border-dashed border-white/40 rounded-xl px-4 py-3 flex flex-col items-center gap-1 hover:bg-white/10 transition w-full">
            <span className="text-2xl">🖼️</span>
            <span className="text-sm text-white/70">
              Changer le logo — PNG, SVG ou WEBP · Carré · Max 500 Ko
            </span>
            <input
              type="file"
              accept="image/png,image/svg+xml,image/webp"
              onChange={handleLogoChange}
              className="hidden"
            />
          </label>

          {logoFile && (
            <button
              type="button"
              onClick={() => {
                setLogoFile(null);
                setLogoPreview(logoUrl);
                setMessage("");
              }}
              className="text-xs text-red-300 hover:text-red-500 underline"
            >
              Annuler le changement de logo
            </button>
          )}
        </div>

        <hr className="border-white/20" />

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-white/70 text-sm">Dénomination</label>
            <input
              name="denomination"
              value={formData.denomination}
              onChange={handleChange}
              className="input"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-white/70 text-sm">Nom de l'église</label>
            <input
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              className="input"              
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-white/70 text-sm">Nom de la branche</label>
            <input
              name="branche"
              value={formData.branche}
              onChange={handleChange}
              className="input"
              />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-white/70 text-sm">Ville</label>
            <input
              name="ville"
              value={formData.ville}
              onChange={handleChange}
              className="input"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-white/70 text-sm">Pays</label>
            <input
              name="pays"
              value={formData.pays}
              onChange={handleChange}
              className="input"
              required
            />
          </div>

          {message && (
            <p className={`text-center text-sm ${message.startsWith("✅") ? "text-emerald-300" : "text-red-400"}`}>
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="bg-gradient-to-r from-emerald-400 to-blue-400 hover:from-emerald-500 hover:to-blue-500 text-white font-bold py-3 rounded-2xl shadow-md transition"
          >
            {saving ? "Sauvegarde..." : "💾 Sauvegarder"}
          </button>
        </form>
      </div>

      <style jsx>{`
        .input {
          width: 100%;
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 12px;
          padding: 12px;
          background: rgba(255,255,255,0.1);
          color: white;
        }
        .input::placeholder {
          color: rgba(255,255,255,0.4);
        }
      `}</style>

      <Footer />
    </div>
  );
}
