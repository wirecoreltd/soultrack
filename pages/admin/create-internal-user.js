"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import supabase from "../lib/supabaseClient";
import ProtectedRoute from "../components/ProtectedRoute";

export default function CreateInternalUserPage() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur"]}>
      <CreateInternalUserContent />
    </ProtectedRoute>
  );
}

function CreateInternalUserContent() {
  const router = useRouter();

  const [members, setMembers] = useState([]);
  const [selectedMemberId, setSelectedMemberId] = useState("");
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

  // ➤ Récupérer les membres "existants" ou "nouveaux" qui sont Star = true
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const { data: membersData, error } = await supabase
          .from("membres_complets")
          .select("id, prenom, nom, telephone")
          .in("etat_contact", ["Nouveau", "Existant"])
          .eq("star", true);

        if (error) throw error;
        setMembers(membersData || []);
      } catch (err) {
        console.error("Erreur fetch members:", err);
      }
    };
    fetchMembers();
  }, []);

  // ➤ Remplissage automatique des champs quand on sélectionne un membre
  useEffect(() => {
    if (!selectedMemberId) {
      setFormData(prev => ({ ...prev, prenom: "", nom: "", telephone: "" }));
      return;
    }
    const member = members.find(m => m.id === selectedMemberId);
    if (member) {
      setFormData(prev => ({
        ...prev,
        prenom: member.prenom,
        nom: member.nom,
        telephone: member.telephone,
      }));
    }
  }, [selectedMemberId]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setMessage("❌ Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    setMessage("⏳ Création en cours...");

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("❌ Session expirée");

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
        setSelectedMemberId("");
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
        setMessage(`❌ ${data.error || "Erreur lors de la création"}`);
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
        <button onClick={() => router.back()} className="absolute top-4 left-4 text-gray-700">← Retour</button>
        <div className="flex justify-center mb-6"><Image src="/logo.png" alt="SoulTrack Logo" width={80} height={80} /></div>
        <h1 className="text-3xl font-bold text-center mb-6">Créer un utilisateur</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {/* ➤ Menu déroulant pour choisir un membre existant */}
          <select
            value={selectedMemberId}
            onChange={e => setSelectedMemberId(e.target.value)}
            className="input"
          >
            <option value="">-- Choisir un membre existant --</option>
            {members.map(m => (
              <option key={m.id} value={m.id}>
                {m.prenom} {m.nom} ({m.telephone})
              </option>
            ))}
          </select>

          {/* Prénom, Nom, Téléphone */}
          <input name="prenom" placeholder="Prénom" value={formData.prenom} onChange={handleChange} className="input" required readOnly={!!selectedMemberId} />
          <input name="nom" placeholder="Nom" value={formData.nom} onChange={handleChange} className="input" required readOnly={!!selectedMemberId} />
          <input name="telephone" placeholder="Téléphone" value={formData.telephone} onChange={handleChange} className="input" required readOnly={!!selectedMemberId} />

          {/* Email & mot de passe */}
          <input name="email" placeholder="Email" value={formData.email} onChange={handleChange} className="input" required />
          <input name="password" type="password" placeholder="Mot de passe" value={formData.password} onChange={handleChange} className="input" required />
          <input name="confirmPassword" type="password" placeholder="Confirmer le mot de passe" value={formData.confirmPassword} onChange={handleChange} className="input" required />

          {/* Role */}
          <select name="role" value={formData.role} onChange={handleChange} className="input" required>
            <option value="">-- Sélectionne un rôle --</option>
            <option value="Administrateur">Administrateur</option>
            <option value="ResponsableIntegration">Responsable Intégration</option>
            <option value="ResponsableCellule">Responsable Cellule</option>
            <option value="ResponsableEvangelisation">Responsable Evangélisation</option>
            <option value="SuperviseurCellule">Superviseur Cellules</option>
            <option value="Conseiller">Conseiller</option>
          </select>

          {/* Champ Cellule pour ResponsableCellule */}
          {formData.role === "ResponsableCellule" && (
            <>
              <input name="cellule_nom" placeholder="Nom cellule" value={formData.cellule_nom} onChange={handleChange} className="input" />
              <input name="cellule_zone" placeholder="Zone cellule" value={formData.cellule_zone} onChange={handleChange} className="input" />
            </>
          )}

          <div className="flex gap-4 mt-4">
            <button type="button" onClick={handleCancel} className="flex-1 bg-gray-400 text-white py-3 rounded-xl">Annuler</button>
            <button type="submit" disabled={loading} className="flex-1 bg-blue-500 text-white py-3 rounded-xl">{loading ? "Création..." : "Créer"}</button>
          </div>
        </form>

        {message && <p className="mt-4 text-center">{message}</p>}

        <style jsx>{`
          .input {
            width: 100%;
            border: 1px solid #ccc;
            border-radius: 12px;
            padding: 12px;
            color: black;
          }
        `}</style>
      </div>
    </div>
  );
}
