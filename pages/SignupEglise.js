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
  const [logoError, setLogoError] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    setLogoError("");
    setLogoFile(null);
    setLogoPreview(null);

    if (!file) return;

    // Format
    const allowedTypes = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];
    if (!allowedTypes.includes(file.type)) {
      setLogoError("❌ Format non supporté. Utilisez PNG, JPG, WEBP ou SVG.");
      return;
    }

    // Taille max 2MB
    if (file.size > 2 * 1024 * 1024) {
      setLogoError("❌ Le fichier est trop lourd. Maximum 2 MB.");
      return;
    }

    // Vérifier dimensions via Image
    const img = new window.Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      if (img.width < 32 || img.height < 32) {
        setLogoError("❌ L'image est trop petite. Minimum 32×32 px.");
        return;
      }
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    };
    img.src = url;
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
      // Construire FormData pour envoyer le logo
      const body = new FormData();
      Object.entries(formData).forEach(([k, v]) => body.append(k, v));
      if (logoFile) body.append("logo", logoFile);

      const res = await fetch("/api/signup-eglise", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify(data)
});
      const data = await res.json().catch(() => null);
      if (res.ok) {
        setMessage("✅ Église et admin créés avec succès !");
        setFormData({
          nomEglise: "", nomBranche: "", denomination: "", ville: "",
          localisation: "", adminPrenom: "", adminNom: "",
          adminEmail: "", adminPassword: "", adminConfirmPassword: "",
        });
        setLogoFile(null);
        setLogoPreview(null);
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

          {/* LOGO ÉGLISE */}
          <div className="flex flex-col items-center gap-2">
            <label className="text-sm font-semibold text-gray-700 self-start">
              🖼️ Logo de l'église <span className="text-gray-400 font-normal">(optionnel)</span>
            </label>

            {/* ZONE UPLOAD */}
            <label
              htmlFor="logo-upload"
              className="w-full flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-2xl p-4 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition"
            >
              {logoPreview ? (
                <div className="flex flex-col items-center gap-2">
                  {/* Preview 48×48 — même dimension que le logo SoulTrack */}
                  <img
                    src={logoPreview}
                    alt="Aperçu logo"
                    className="w-12 h-12 object-contain rounded-lg"
                  />
                  <span className="text-xs text-gray-500">{logoFile?.name}</span>
                  <span className="text-xs text-blue-500 underline">Changer</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1 text-gray-400">
                  <span className="text-3xl">📁</span>
                  <span className="text-sm font-medium text-gray-600">Cliquer pour ajouter un logo</span>
                  <span className="text-xs text-center text-gray-400 leading-relaxed">
                    Format : <strong>PNG, JPG, WEBP ou SVG</strong><br />
                    Taille max : <strong>2 MB</strong><br />
                    Dimensions recommandées : <strong>48×48 px</strong> minimum
                  </span>
                </div>
              )}
              <input
                id="logo-upload"
                type="file"
                accept="image/png, image/jpeg, image/webp, image/svg+xml"
                onChange={handleLogoChange}
                className="hidden"
              />
            </label>

            {logoError && (
              <p className="text-red-500 text-xs self-start">{logoError}</p>
            )}
          </div>

          <hr className="my-1 border-gray-200" />

          {/* ÉGLISE & BRANCHE */}
          <input
            name="denomination"
            placeholder="Dénomination"
            value={formData.denomination}
            onChange={handleChange}
            className="input"
            required
          />
          <input
            name="nomEglise"
            placeholder="Nom de l'église"
            value={formData.nomEglise}
            onChange={handleChange}
            className="input"
            required
          />
          <input
            name="nomBranche"
            placeholder="Nom de la Branche"
            value={formData.nomBranche}
            onChange={handleChange}
            className="input"
            required
          />
          <input
            name="ville"
            placeholder="Ville"
            value={formData.ville}
            onChange={handleChange}
            className="input"
          />
          <input
            name="localisation"
            placeholder="Pays"
            value={formData.localisation}
            onChange={handleChange}
            className="input"
            required
          />

          <hr className="my-1 border-gray-300" />

          {/* ADMIN */}
          <input
            name="adminPrenom"
            placeholder="Prénom de l'Admin"
            value={formData.adminPrenom}
            onChange={handleChange}
            className="input"
            required
          />
          <input
            name="adminNom"
            placeholder="Nom de l'Admin"
            value={formData.adminNom}
            onChange={handleChange}
            className="input"
            required
          />
          <input
            type="email"
            name="adminEmail"
            placeholder="Email de l'Admin"
            value={formData.adminEmail}
            onChange={handleChange}
            className="input"
            required
          />
          <input
            type="password"
            name="adminPassword"
            placeholder="Mot de passe"
            value={formData.adminPassword}
            onChange={handleChange}
            className="input"
            required
          />
          <input
            type="password"
            name="adminConfirmPassword"
            placeholder="Confirmer le mot de passe"
            value={formData.adminConfirmPassword}
            onChange={handleChange}
            className="input"
            required
          />

          {message && <p className="text-center text-red-500">{message}</p>}

          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-green-400 to-blue-400 hover:from-green-500 hover:to-blue-500 text-white font-bold py-3 rounded-2xl shadow-md"
          >
            {loading ? "Création..." : "Créer l'Église"}
          </button>
        </form>

        <button
          onClick={() => router.push("/login")}
          className="mt-4 text-blue-600 underline hover:text-blue-800"
        >
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
