"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateInternalUser() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    prenom: "",
    nom: "",
    email: "",
    password: "",
    telephone: "",
    role: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
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
        setMessage("✅ Utilisateur créé et notifications envoyées !");
        setFormData({ prenom: "", nom: "", email: "", password: "", telephone: "", role: "" });
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
    <div className="min-h-screen flex items-center justify-center p-6">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-md flex flex-col gap-4 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center">Créer un utilisateur</h2>
        <input name="prenom" placeholder="Prénom" value={formData.prenom} onChange={handleChange} className="input" required />
        <input name="nom" placeholder="Nom" value={formData.nom} onChange={handleChange} className="input" required />
        <input name="email" placeholder="Email" value={formData.email} onChange={handleChange} className="input" required />
        <input name="password" placeholder="Mot de passe" type="password" value={formData.password} onChange={handleChange} className="input" required />
        <input name="telephone" placeholder="Téléphone" value={formData.telephone} onChange={handleChange} className="input" />

        <select name="role" value={formData.role} onChange={handleChange} className="input" required>
          <option value="">-- Sélectionner un rôle --</option>
          <option value="Administrateur">Administrateur</option>
          <option value="ResponsableIntegration">Responsable Intégration</option>
          <option value="ResponsableEvangelisation">Responsable Evangélisation</option>
          <option value="Conseiller">Conseiller</option>
        </select>

        <button type="submit" disabled={loading} className="bg-blue-500 text-white py-3 rounded-xl">
          {loading ? "Création..." : "Créer"}
        </button>

        {message && <p className="text-center mt-2">{message}</p>}

        <style jsx>{`
          .input {
            width: 100%;
            border: 1px solid #ccc;
            border-radius: 12px;
            padding: 12px;
          }
        `}</style>
      </form>
    </div>
  );
}
