"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function SignupEglise() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nomEglise: "",
    nomBranche: "",
    denomination: "",
    ville: "",
    localisation: "",
    adminPrenom: "",
    adminNom: "",
    adminEmail: "",
    adminPassword: "",
    adminConfirmPassword: "",
  });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleLogoChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // Vérification format
  const allowedTypes = ["image/png", "image/svg+xml", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    alert("❌ Format invalide. Utilisez PNG, SVG ou WEBP uniquement.");
    e.target.value = "";
    return;
  }

  // Vérification taille (max 500 Ko)
  const maxSize = 500 * 1024;
  if (file.size > maxSize) {
    alert("❌ Image trop lourde. Maximum 500 Ko.");
    e.target.value = "";
    return;
  }

  // Vérification dimensions
  const img = new window.Image();
  img.src = URL.createObjectURL(file);
  img.onload = () => {
    if (img.width !== img.height) {
      alert("❌ Le logo doit être carré (ex: 200x200, 512x512).");
      e.target.value = "";
      URL.revokeObjectURL(img.src);
      return;
    }
    setLogoFile(file);
    setLogoPreview(img.src);
  };
};

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.adminPassword !== formData.adminConfirmPassword) {
      setMessage("❌ Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    setMessage("⏳ Création en cours...");

    try {
      // 1. Upload du logo si présent
      let logoUrl = null;
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
        logoUrl = uploadData.url;
      }

      // 2. Création église + admin
      setMessage("⏳ Création du compte...");
      const res = await fetch("/api/signup-eglise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, logoUrl }),
      });

      const data = await res.json().catch(() => null);

      if (res.ok) {
        setMessage("✅ Église et admin créés avec succès !");
        router.push("/login");
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 via-yellow-50 to-blue-100 p-6">
      <div className="bg-white p-10 rounded-3xl shadow-lg w-full max-w-md flex flex-col items-center">
        <h1 className="text-5xl font-handwriting text-black-800 mb-3 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Image src="/logo.png" alt="Logo SoulTrack" width={48} height={48} />
          SoulTrack
        </h1>
        <p className="text-center text-gray-700 mb-6">
          Créez votre Église et l'administrateur principal pour commencer.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col w-full gap-4">
          <input name="denomination" placeholder="Dénomination" value={formData.denomination} onChange={handleChange} className="input" required />
          <input name="nomEglise" placeholder="Nom de l'église" value={formData.nomEglise} onChange={handleChange} className="input" required />
          <input name="nomBranche" placeholder="Nom de la Branche" value={formData.nomBranche} onChange={handleChange} className="input" required />
          <input name="ville" placeholder="Ville" value={formData.ville} onChange={handleChange} className="input" />
          <input name="localisation" placeholder="Pays" value={formData.localisation} onChange={handleChange} className="input" required />

          <hr className="my-2 border-gray-300" />

          <input name="adminPrenom" placeholder="Prénom de l'Admin" value={formData.adminPrenom} onChange={handleChange} className="input" required />
          <input name="adminNom" placeholder="Nom de l'Admin" value={formData.adminNom} onChange={handleChange} className="input" required />
          <input type="email" name="adminEmail" placeholder="Email de l'Admin" value={formData.adminEmail} onChange={handleChange} className="input" required />
          <input type="password" name="adminPassword" placeholder="Mot de passe" value={formData.adminPassword} onChange={handleChange} className="input" required />
          <input type="password" name="adminConfirmPassword" placeholder="Confirmer le mot de passe" value={formData.adminConfirmPassword} onChange={handleChange} className="input" required />

          {/* Logo upload */}
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-600 font-medium">Logo de l'église (optionnel) — PNG, SVG ou WEBP · Carré · Max 500 Ko</label>
            <label className="cursor-pointer border border-dashed border-gray-400 rounded-xl p-4 flex flex-col items-center gap-2 hover:bg-gray-50 transition">
              {logoPreview ? (
                <img src={logoPreview} alt="Aperçu logo" className="w-20 h-20 object-contain rounded-lg" />
              ) : (
                <>
                  <span className="text-3xl">🖼️</span>
                  <span className="text-sm text-gray-500">Cliquez pour choisir une image</span>
                </>
              )}
              <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
            </label>
            {logoPreview && (
              <button
                type="button"
                onClick={() => { setLogoFile(null); setLogoPreview(null); }}
                className="text-xs text-red-400 hover:text-red-600 underline self-end"
              >
                Supprimer le logo
              </button>
            )}
          </div>

          {message && <p className="text-center text-red-500">{message}</p>}

          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-green-400 to-blue-400 hover:from-green-500 hover:to-blue-500 text-white font-bold py-3 rounded-2xl shadow-md"
          >
            {loading ? "Création..." : "Créer l'Église"}
          </button>
        </form>

        <button onClick={() => router.push("/login")} className="mt-4 text-blue-600 underline hover:text-blue-800">
          Déjà un compte ? Connectez-vous
        </button>

        <style jsx>{`
          .input {
            width: 100%;
            border: 1px solid #ccc;
            border-radius: 12px;
            padding: 12px;
            text-align: left;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            color: black;
          }
        `}</style>
      </div>
    </div>
  );
}
