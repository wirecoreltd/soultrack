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
  const [logoError, setLogoError] = useState("");

  // =========================
  // 🔹 Resize automatique
  // =========================
  const resizeImage = (file) => {
    return new Promise((resolve) => {
      const img = new window.Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        const maxWidth = 250;
        const maxHeight = 200;

        let { width, height } = img;

        const ratio = Math.min(maxWidth / width, maxHeight / height, 1);
        width = width * ratio;
        height = height * ratio;

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            const resizedFile = new File([blob], file.name, {
              type: "image/webp",
            });
            resolve(resizedFile);
          },
          "image/webp",
          0.85 // compression
        );

        URL.revokeObjectURL(url);
      };

      img.src = url;
    });
  };

  // =========================
  // 🔹 Load data
  // =========================
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

  // =========================
  // 🔹 Upload logo (avec resize)
  // =========================
  const handleLogoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLogoError("");

    const allowedTypes = ["image/png", "image/svg+xml", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setLogoError("❌ Format invalide. PNG, SVG ou WEBP uniquement.");
      return;
    }

    const maxSize = 500 * 1024;
    if (file.size > maxSize) {
      setLogoError("❌ Image trop lourde. Maximum 500 Ko.");
      return;
    }

    // 🔥 resize auto
    const resizedFile = await resizeImage(file);

    setLogoFile(resizedFile);
    setLogoPreview(URL.createObjectURL(resizedFile));
  };

  // =========================
  // 🔹 Submit
  // =========================
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
        if (!uploadRes.ok)
          throw new Error(uploadData.error || "Erreur upload logo");

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

      <div className="max-w-lg mx-auto bg-white/10 rounded-2xl p-6 flex flex-col gap-4">

        {/* LOGO */}
        <div className="flex flex-col items-center gap-3">
          {logoPreview ? (
            <img
              src={logoPreview}
              alt="Logo église"
              className="max-h-[200px] max-w-[250px] object-contain"
            />
          ) : (
            <div className="w-24 h-24 rounded-xl bg-white/20 flex items-center justify-center text-white/50 text-sm">
              Aucun logo
            </div>
          )}

          <label className="cursor-pointer border border-dashed border-white/40 rounded-xl px-4 py-3 flex flex-col items-center gap-1 hover:bg-white/10 transition w-full">
            <span className="text-2xl">🖼️</span>
            <span className="text-sm text-white/70 text-center">
              PNG, SVG ou WEBP · Max 500 Ko · Max 250×200 px
            </span>
            <input
              type="file"
              accept="image/png,image/svg+xml,image/webp"
              onChange={handleLogoChange}
              className="hidden"
            />
          </label>

          {logoError && (
            <p className="text-red-400 text-xs text-center">
              {logoError}
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input name="denomination" value={formData.denomination} onChange={handleChange} className="input" />
          <input name="nom" value={formData.nom} onChange={handleChange} className="input" />
          <input name="branche" value={formData.branche} onChange={handleChange} className="input" />
          <input name="ville" value={formData.ville} onChange={handleChange} className="input" />
          <input name="pays" value={formData.pays} onChange={handleChange} className="input" />

          {message && (
            <p className="text-center text-sm text-white">{message}</p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="bg-gradient-to-r from-emerald-400 to-blue-400 text-white py-3 rounded-2xl"
          >
            {saving ? "Sauvegarde..." : "💾 Sauvegarder"}
          </button>
        </form>
      </div>

      <Footer />

      <style jsx>{`
        .input {
          width: 100%;
          border-radius: 12px;
          padding: 12px;
          background: rgba(255,255,255,0.1);
          color: white;
        }
      `}</style>
    </div>
  );
}
