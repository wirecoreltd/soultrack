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

  export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    // ✅ REMPLACEMENT MINIMAL
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ error: "Non authentifié" });
    }

    const {
      data: { user },
      error,
    } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: "Non authentifié" });
    }

    // ⬇️ TOUT LE RESTE = INCHANGÉ
    const { prenom, nom, email, password, telephone, role, cellule_nom, cellule_zone } = req.body;

    if (!prenom || !nom || !email || !password || !role) {
      return res.status(400).json({ error: "Champs obligatoires manquants" });
    }

    const { data: adminProfile, error: adminError } = await supabaseAdmin
      .from("profiles")
      .select("eglise_id, branche_id")
      .eq("id", user.id)
      .single();

    if (adminError || !adminProfile) {
      return res.status(400).json({ error: "Impossible de récupérer l'église/branche de l'admin" });
    }

    const { data: authUser, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

    if (authError) {
      return res.status(400).json({ error: authError.message });
    }

    const userId = authUser.user.id;

    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .insert([{
        id: userId,
        prenom,
        nom,
        email,
        telephone: telephone || null,
        role_description: role,
        cellule_nom: cellule_nom || null,
        cellule_zone: cellule_zone || null,
        eglise_id: adminProfile.eglise_id,
        branche_id: adminProfile.branche_id,
      }]);

    if (profileError) {
      return res.status(400).json({ error: profileError.message });
    }

    return res.status(200).json({ message: "Utilisateur créé avec succès !" });

  } catch (err) {
    console.error("API create-user error:", err);
    return res.status(500).json({ error: err.message });
  }
}

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
      const res = await fetch("/api/create-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // ✅ Nécessaire pour cookie auth
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

  const handleCancel = () => router.push("/admin/list-users");

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-br from-purple-200 via-pink-100 to-yellow-200 p-6">
      <div className="bg-white p-8 rounded-3xl shadow-lg w-full max-w-md relative">
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 flex items-center text-gray-700 hover:text-gray-900 transition-colors"
        >
          ← Retour
        </button>

        <div className="flex justify-center mb-6">
          <Image src="/logo.png" alt="SoulTrack Logo" width={80} height={80} />
        </div>

        <h1 className="text-3xl font-bold text-center mb-6">Créer un utilisateur</h1>

        <form onSubmit={handleSubmit} className="flex flex-col w-full gap-4">
          <input name="prenom" placeholder="Prénom" value={formData.prenom} onChange={handleChange} className="input" required />
          <input name="nom" placeholder="Nom" value={formData.nom} onChange={handleChange} className="input" required />
          <input name="email" placeholder="Email" value={formData.email} onChange={handleChange} className="input" required />
          <input name="password" placeholder="Mot de passe" type="password" value={formData.password} onChange={handleChange} className="input" required />
          <input name="confirmPassword" placeholder="Confirmer le mot de passe" type="password" value={formData.confirmPassword} onChange={handleChange} className="input" required />
          <input name="telephone" placeholder="Téléphone" value={formData.telephone} onChange={handleChange} className="input" />

          <select name="role" value={formData.role} onChange={handleChange} className="input" required>
            <option value="">-- Sélectionne un rôle --</option>
            <option value="Administrateur">Administrateur</option>
            <option value="ResponsableIntegration">Responsable Intégration</option>
            <option value="ResponsableCellule">Responsable de Cellule</option>
            <option value="ResponsableEvangelisation">Responsable Evangélisation</option>
            <option value="SuperviseurCellule">Superviseur des Cellules</option>
            <option value="Conseiller">Conseiller</option>
          </select>

          {formData.role === "ResponsableCellule" && (
            <div className="space-y-3 border-t pt-3">
              <input name="cellule_nom" placeholder="Nom de la cellule (facultatif)" value={formData.cellule_nom} onChange={handleChange} className="input" />
              <input name="cellule_zone" placeholder="Zone / Localisation (facultatif)" value={formData.cellule_zone} onChange={handleChange} className="input" />
            </div>
          )}

          <div className="flex gap-4 mt-4">
            <button type="button" onClick={handleCancel} className="flex-1 bg-gray-400 text-white py-3 rounded-xl">Annuler</button>
            <button type="submit" disabled={loading} className="flex-1 bg-blue-500 text-white py-3 rounded-xl">{loading ? "Création..." : "Créer"}</button>
          </div>
        </form>

        {message && <p className="mt-4 text-center text-sm text-gray-700">{message}</p>}

        <style jsx>{`
          .input {
            width: 100%;
            border: 1px solid #ccc;
            border-radius: 12px;
            padding: 12px;
          }
        `}</style>
      </div>
    </div>
  );
}
