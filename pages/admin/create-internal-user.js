// pages/admin/create-internal-user.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import supabase from "../../lib/supabaseClient";
import { canAccessPage } from "../../lib/accessControl";

// 🧮 Fonction pour hasher le mot de passe (SHA-256)
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  return hashHex;
}

export default function CreateUserPage() {
  const router = useRouter();
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    prenom: "",
    nom: "",
    email: "",
    password: "",
    roles: [], // ⚡ tableau pour plusieurs rôles
  });

  // 🧩 Vérification d’accès
  useEffect(() => {
    const storedRole = localStorage.getItem("userRole");
    if (!storedRole) {
      router.replace("/login");
      return;
    }

    const canAccess = canAccessPage(storedRole, router.pathname);
    if (!canAccess) {
      alert("⛔ Accès non autorisé !");
      router.replace("/login");
      return;
    }

    setRole(storedRole);
    setLoading(false);
  }, [router]);

  if (loading) return <div className="text-center mt-20">Chargement...</div>;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleChange = (e) => {
    const value = e.target.value;
    let newRoles = [...formData.roles];
    if (e.target.checked) {
      newRoles.push(value);
    } else {
      newRoles = newRoles.filter(r => r !== value);
    }
    setFormData({ ...formData, roles: newRoles });
  };

  // 💾 Création utilisateur
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 1️⃣ Vérifie si l’email existe déjà
      const { data: existingUser } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", formData.email)
        .single();

      if (existingUser) {
        alert("⚠️ Cet email est déjà utilisé !");
        return;
      }

      // 2️⃣ Hachage du mot de passe
      const hashedPassword = await hashPassword(formData.password);

      // 3️⃣ Création du profil avec tableau de rôles
      const { data: newUser, error: createError } = await supabase
        .from("profiles")
        .insert([
          {
            email: formData.email,
            password_hash: hashedPassword,
            prenom: formData.prenom,
            nom: formData.nom,
            roles: formData.roles, // ✅ tableau
          },
        ])
        .select()
        .single();

      if (createError) {
        console.error("Erreur Supabase:", createError);
        alert("❌ Erreur lors de la création de l’utilisateur !");
        return;
      }

      // 4️⃣ Si ResponsableCellule est coché, créer automatiquement une cellule
      if (formData.roles.includes("ResponsableCellule")) {
        const responsableNom = `${formData.prenom} ${formData.nom}`;
        const celluleName = `Cellule de ${formData.prenom}`;

        const { error: celluleError } = await supabase
          .from("cellules")
          .insert([
            {
              cellule: celluleName,
              ville: "À définir",
              responsable: responsableNom,
              telephone: "N/A",
              responsable_id: newUser.id,
            },
          ]);

        if (celluleError) {
          console.error("Erreur création cellule:", celluleError);
          alert("⚠️ Utilisateur créé mais la cellule n’a pas pu être ajoutée.");
        } else {
          console.log(`✅ Cellule "${celluleName}" créée pour ${responsableNom}`);
        }
      }

      alert(`✅ Utilisateur "${formData.prenom} ${formData.nom}" créé avec succès !`);
      router.push("/administrateur");

    } catch (err) {
      console.error("Erreur inattendue:", err);
      alert("❌ Une erreur inattendue s’est produite");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("userRole");
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{ background: "linear-gradient(135deg, #2E3192 0%, #92EFFD 100%)" }}
    >
      <h1 className="text-4xl font-bold text-white mb-6">Créer un utilisateur</h1>

      <form onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md flex flex-col gap-4"
      >
        <input type="text" name="prenom" placeholder="Prénom" value={formData.prenom}
          onChange={handleChange} required className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"/>
        <input type="text" name="nom" placeholder="Nom" value={formData.nom}
          onChange={handleChange} required className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"/>
        <input type="email" name="email" placeholder="Email" value={formData.email}
          onChange={handleChange} required className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"/>
        <input type="password" name="password" placeholder="Mot de passe" value={formData.password}
          onChange={handleChange} required className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"/>

        {/* 🔹 Checkbox pour rôles */}
        <div className="flex flex-col gap-2">
          <label className="font-semibold text-gray-700">Rôles :</label>
          <label>
            <input type="checkbox" value="ResponsableIntegration" onChange={handleRoleChange}/>
            Responsable Intégration
          </label>
          <label>
            <input type="checkbox" value="ResponsableCellule" onChange={handleRoleChange}/>
            Responsable Cellule
          </label>
          <label>
            <input type="checkbox" value="ResponsableEvangelisation" onChange={handleRoleChange}/>
            Responsable Évangélisation
          </label>
          <label>
            <input type="checkbox" value="Admin" onChange={handleRoleChange}/>
            Administrateur
          </label>
        </div>

        <button type="submit"
          className="mt-2 bg-gradient-to-r from-blue-600 to-blue-400 text-white font-semibold rounded-xl py-2 hover:opacity-90 transition">
          Créer l’utilisateur
        </button>
      </form>

      <button onClick={() => router.push("/administrateur")}
        className="mt-4 text-white underline hover:opacity-80">
        ⬅️ Retour à l’accueil
      </button>

      <p onClick={handleLogout} className="mt-3 text-sm text-white cursor-pointer hover:underline">
        Se déconnecter
      </p>
    </div>
  );
}
