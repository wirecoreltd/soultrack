"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@supabase/supabase-js";
import ProtectedRoute from "../../components/ProtectedRoute";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

function CreateInternalUserContent() {
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

    if (formData.password !== formData.confirmPassword) {
      setMessage("❌ Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    setMessage("⏳ Création en cours...");

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setMessage("❌ Session expirée");
        setLoading(false);
        return;
      }

      const res = await fetch("/api/create-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

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
        setMessage(`❌ ${data.error}`);
      }
    } catch (err) {
      setMessage("❌ " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => router.push("/admin/list-users");

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-br from-purple-200 via-pink-100 to-yellow-200 p-6">
      <div className="bg-white p-8 rounded-3xl shadow-lg w-full max-w-md relative">
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 text-gray-700"
        >
          ← Retour
        </button>

        <div className="flex justify-center mb-6">
          <Image src="/logo.png" alt="SoulTrack Logo" width={80} height={80} />
        </div>

        <h1 className="text-3xl font-bold text-center mb-6">
          Créer un utilisateur
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input name="prenom" placeholder="Prénom" value={formData.prenom} onChange={handleChange} className="input" required />
          <input name="nom" placeholder="Nom" value={formData.nom} onChange={handleChange} className="input" required />
          <input name="email" placeholder="Email" value={formData.email} onChange={handleChange} className="input" required />
          <input name="password" type="password" placeholder="Mot de passe" value={formData.password} onChange={handleChange} className="input" required />
          <input name="confirmPassword" type="password" placeholder="Confirmer le mot de passe" value={formData.confirmPassword} onChange={handleChange} className="input" required />
          <input name="telephone" placeholder="Téléphone" value={formData.telephone} onChange={handleChange} className="input" />

          <select name="role" value={formData.role} onChange={handleChange} className="input" required>
            <option value="">-- Sélectionne un rôle --</option>
            <option value="Administrateur">Administrateur</option>
            <option value="ResponsableIntegration">Responsable Intégration</option>
            <option value="ResponsableCellule">Responsable Cellule</option>
            <option value="ResponsableEvangelisation">Responsable Evangélisation</option>
            <option value="SuperviseurCellule">Superviseur Cellules</option>
            <option value="Conseiller">Conseiller</option>   
          </select>

          {formData.role === "ResponsableCellule" && (
            <>
              <input name="cellule_nom" placeholder="Nom cellule" value={formData.cellule_nom} onChange={handleChange} className="input" />
              <input name="cellule_zone" placeholder="Zone cellule" value={formData.cellule_zone} onChange={handleChange} className="input" />
            </>
          )}

          <div className="flex gap-4 mt-4">
            <button type="button" onClick={handleCancel} className="flex-1 bg-gray-400 text-white py-3 rounded-xl">
              Annuler
            </button>
            <button type="submit" disabled={loading} className="flex-1 bg-blue-500 text-white py-3 rounded-xl">
              {loading ? "Création..." : "Créer"}
            </button>
          </div>
        </form>

        {message && <p className="mt-4 text-center">{message}</p>}
      </div>

      <style jsx>{`
        .input {
          width: 100%;
          border: 1px solid #ccc;
          border-radius: 12px;
          padding: 12px;
        }
      `}</style>
    </div>
  );
}

/* =========================
   PAGE PROTÉGÉE
========================= */
export default function CreateInternalUserPage() {
  return (
    <>
      <ProtectedRoute allowedRoles={["Administrateur"]}>
        <CreateInternalUserContent />
      </ProtectedRoute>     
    </>
  );
}
