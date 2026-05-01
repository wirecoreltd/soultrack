"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function SignupEglise() {
  const router = useRouter();
  const [planId, setPlanId] = useState("free");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const plan = params.get("plan");
    if (!plan) {
      router.push("/pricing");
    } else {
      setPlanId(plan);
    }
  }, []);

  const PLANS_LABELS = {
    free: "🌱 Départ — Gratuit",
    starter: "📈 Croissance — $19/mois",
    vision: "🔥 Vision — $39/mois",
    expansion: "🌍 Expansion — $79/mois",
    enterprise: "🔗 Réseaux — Sur mesure",
  };

  // Remove the date-fns import entirely, then use this helper:
const addMonths = (date, n) => {
  const d = new Date(date);
  d.setMonth(d.getMonth() + n);
  return d;
};

  const [formData, setFormData] = useState({
    nomEglise: "",
    denomination: "",
    ville: "",
    branche: "",
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
    const file = e.target.files?.[0];
    if (!file) return;

    // Vérification taille max 500 Ko
    if (file.size > 500 * 1024) {
      setMessage("❌ Le logo dépasse 500 Ko. Veuillez choisir une image plus petite.");
      return;
    }

    setLogoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setLogoPreview(reader.result);
    reader.readAsDataURL(file);
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

      setMessage("⏳ Création du compte...");
      const res = await fetch("/api/signup-eglise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, logoUrl, planId }),
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

        <div className="w-full bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-4 text-center">
          <p className="text-xs text-gray-500 mb-1">Plan sélectionné</p>
          <p className="font-bold text-blue-700">{PLANS_LABELS[planId]}</p>
          <button
            type="button"
            onClick={() => router.push("/pricing")}
            className="text-xs text-blue-400 underline mt-1"
          >
            Changer de plan
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col w-full gap-4">

          {/* ── Infos église ── */}
          <input
            name="denomination"
            placeholder="Dénomination (ex: Église de Christ)"
            value={formData.denomination}
            onChange={handleChange}
            className="input"
            required
          />
          <input
            name="nomEglise"
            placeholder="Nom (ex: Centre Missionnaire...)"
            value={formData.nomEglise}
            onChange={handleChange}
            className="input"
          />
          <input
            name="branche"
            placeholder="Branche (ex: Paris Ouest...)"
            value={formData.branche}
            onChange={handleChange}
            className="input"
          />
          <input
            name="ville"
            placeholder="Ville (ex: Paris...)"
            value={formData.ville}
            onChange={handleChange}
            className="input"
            required
          />
          <input
            name="localisation"
            placeholder="Pays (ex: France)"
            value={formData.localisation}
            onChange={handleChange}
            className="input"
            required
          />

          <hr className="my-2 border-gray-300" />

          {/* ── Infos administrateur ── */}
          <p className="text-sm text-gray-500 font-semibold -mb-1">👤 Compte administrateur</p>

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

          {/* ── Logo ── */}
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-600 font-medium">
              Logo de l'église (optionnel) — PNG, SVG ou WEBP · Carré (ex: 200×200) · Max 500 Ko
            </label>
            <label className="cursor-pointer border border-dashed border-gray-400 rounded-xl p-4 flex flex-col items-center gap-2 hover:bg-gray-50 transition">
              {logoPreview ? (
                <img
                  src={logoPreview}
                  alt="Aperçu logo"
                  className="max-h-[200px] max-w-[250px] object-contain rounded-lg"
                />
              ) : (
                <>
                  <span className="text-3xl">🖼️</span>
                  <span className="text-sm text-gray-500">Cliquez pour choisir une image</span>
                </>
              )}
              <input
                type="file"
                accept="image/png,image/svg+xml,image/webp"
                onChange={handleLogoChange}
                className="hidden"
              />
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

          {message && (
            <p
              className={`text-center text-sm font-medium ${
                message.startsWith("✅")
                  ? "text-green-600"
                  : message.startsWith("⏳")
                  ? "text-blue-500"
                  : "text-red-500"
              }`}
            >
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-green-400 to-blue-400 hover:from-green-500 hover:to-blue-500 text-white font-bold py-3 rounded-2xl shadow-md disabled:opacity-60 transition"
          >
            {loading ? "Création..." : "Créer l'Église"}
          </button>
        </form>

        <button
          onClick={() => router.push("/login")}
          className="mt-4 text-blue-600 underline hover:text-blue-800 text-sm"
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
          .input:focus {
            outline: none;
            border-color: #2E3192;
          }
        `}</style>
      </div>
    </div>
  );
}
