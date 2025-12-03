"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function CreateInternalUser() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    prenom: "",
    nom: "",
    email: "",
    password: "",
    confirmPassword: "",
    telephone: "",
    role: "",
    cellule_nom: "",
    cellule_zone: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Vérification mot de passe
    if (formData.password !== formData.confirmPassword) {
      setMessage("❌ Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    setMessage("⏳ Création en cours...");

    try {
      const res = await fetch("/api/create-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json().catch(() => null);

      if (res.ok) {
        setMessage("✅ Utilisateur créé avec succès !");
        setFormData({
          prenom: "",
          nom: "",
          email: "",
          password: "",
          confirmPassword: "",
          telephone: "",
          role: "",
          cellule_nom: "",
          cellule_zone: "",
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

  const handleCancel = () => router.push("/"); // Retour à l'accueil ou page admin

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-br from-purple-200 via-pink-100 to-yellow-200 p-6">
      <div className="bg-white p-8 rounded-3xl shadow-lg w-full max-w-md relative">

        {/* Flèche retour */}
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 flex items-center text-gray-700 hover:text-gray-900 transition-colors"
        >
          ← Retour
        </button>

        {/* Logo centré */}
        <div className="flex justify-center mb-6">
          <Image src="/logo.png" alt="SoulTrack Logo" width={80} height={80} />
        </div>

        {/* Titre */}
        <h1 className="text-3xl font-bold text-center mb-6">Créer un utilisateur</h1>

        <form onSubmit={handleSubmit} className="flex flex-col w-full gap-4">
          <input
            name="prenom"
            placeholder="Prénom"
            value={formData.prenom}
            onChange={handleChange}
            className="input"
            required
          />
          <input
            name="nom"
            placeholder="Nom"
            value={formData.nom}
            onChange={handleChange}
            className="input"
            required
          />
          <input
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="input"
            required
          />
          <input
            name="password"
            placeholder="Mot de passe"
            type="password"
            value={formData.password}
            onChange={handleChange}
            className="input"
            required
          />
          <input
            name="confirmPassword"
            placeholder="Confirmer le mot de passe"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="input"
            required
          />
          <input
            name="telephone"
            placeholder="Téléphone"
            value={formData.telephone}
            onChange={handleChange}
            className="input"
          />

          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="input"
            required
          >
            <option value="">-- Sélectionne un rôle --</option>
            <option value="Administrateur">Administrateur</option>
            <option value="ResponsableIntegration">Responsable Intégration</option>
            <option value="ResponsableCellule">Responsable de Cellule</option>
            <option value="ResponsableEvangelisation">Responsable Evangélisation</option>
            <option value="Conseiller">Conseiller</option>
          </select>

          {/* Bloc spécifique pour Responsable de cellule */}
          {formData.role === "ResponsableCellule" && (
            <div className="space-y-3 border-t pt-3">
              <input
                name="cellule_nom"
                placeholder="Nom de la cellule"
                value={formData.cellule_nom}
                onChange={handleChange}
                className="input"
              />
              <input
                name="cellule_zone"
                placeholder="Zone / Localisation"
                value={formData.cellule_zone}
                onChange={handleChange}
                className="input"
              />
            </div>
          )}

          {/* Bloc spécifique pour Conseiller */}
          {formData.role === "Conseiller" && (
            <div className="space-y-3 border-t pt-3">
              {/* Ici tu peux ajouter des champs spécifiques pour Conseiller si besoin */}
              <p className="text-sm text-gray-600">Aucune information supplémentaire requise pour le rôle Conseiller.</p>
            </div>
          )}

          {/* Boutons côte à côte */}
          <div className="flex gap-4 mt-4">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white font-bold py-3 rounded-2xl shadow-md transition-all duration-200"
            >
              Annuler
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-blue-400 to-indigo-500 hover:from-blue-500 hover:to-indigo-600 text-white font-bold py-3 rounded-2xl shadow-md transition-all duration-200"
            >
              {loading ? "Création..." : "Créer"}
            </button>
          </div>
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
            text-align: left;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            color: black;
          }
        `}</style>
      </div>
    </div>
  );
}
