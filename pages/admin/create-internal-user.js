"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import ProtectedRoute from "../../components/ProtectedRoute";
import supabase from "../../lib/supabaseClient";

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

  // ➤ Récupérer les membres existants (etat_contact = "Nouveau" ou "Existant" et star = true)
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;

        // Profil de l'utilisateur pour eglise_id et branche_id
        const { data: profile } = await supabase
          .from("profiles")
          .select("eglise_id, branche_id")
          .eq("id", session.user.id)
          .single();
        if (!profile) return;

        const { data: membersData, error } = await supabase
        .from("membres_complets")
        .select("id, prenom, nom, telephone")
        .eq("star", "true") // STRING
        .in("etat_contact", ["existant", "nouveau"]) // minuscules
        .eq("eglise_id", profile.eglise_id)
        .eq("branche_id", profile.branche_id);

        console.log("Members récupérés :", membersData);

        setMembers(membersData || []);
      } catch (err) {
        console.error("Erreur fetchMembers:", err);
      }
    };

    fetchMembers();
  }, []);

  // ➤ Remplissage automatique des infos quand on choisit un membre
  useEffect(() => {
    if (!selectedMemberId) {
      setFormData(prev => ({ ...prev, prenom: "", nom: "", telephone: "" }));
      return;
    }
    const member = members.find((m) => m.id === selectedMemberId);
    if (member) {
      setFormData(prev => ({
        ...prev,
        prenom: member.prenom,
        nom: member.nom,
        telephone: member.telephone
      }));
    }
  }, [selectedMemberId, members]);

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
        body: JSON.stringify({ ...formData, member_id: selectedMemberId }),
      });

      const data = await res.json().catch(() => null);

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
        setMessage(`❌ ${data?.error || "Erreur serveur"}`);
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
        <button onClick={() => router.back()} className="absolute top-4 left-4 text-gray-700 hover:text-gray-900">
          ← Retour
        </button>

        <div className="flex justify-center mb-6">
          <Image src="/logo.png" alt="SoulTrack Logo" width={80} height={80} />
        </div>

        <h1 className="text-3xl font-bold text-center mb-6">Créer un utilisateur</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {/* Menu déroulant pour choisir un membre existant */}
          <select value={selectedMemberId} onChange={(e) => setSelectedMemberId(e.target.value)} className="input">
            <option value="">-- Choisir un membre existant --</option>
            {members.length > 0 ? (
              members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.prenom} {m.nom}
                </option>
              ))
            ) : (
              <option disabled>Aucun membre disponible</option>
            )}
          </select>

          {/* Infos pré-remplies */}
          <input name="prenom" placeholder="Prénom" value={formData.prenom} readOnly className="input" />
          <input name="nom" placeholder="Nom" value={formData.nom} readOnly className="input" />
          <input name="telephone" placeholder="Téléphone" value={formData.telephone} readOnly className="input" />

          {/* Email et mot de passe */}
          <input name="email" placeholder="Email" value={formData.email} onChange={handleChange} className="input" required />
          <input name="password" type="password" placeholder="Mot de passe" value={formData.password} onChange={handleChange} className="input" required />
          <input name="confirmPassword" type="password" placeholder="Confirmer mot de passe" value={formData.confirmPassword} onChange={handleChange} className="input" required />

          {/* Rôle */}
          <select name="role" value={formData.role} onChange={handleChange} className="input" required>
            <option value="">-- Sélectionner un rôle --</option>
            <option value="Administrateur">Administrateur</option>
            <option value="ResponsableIntegration">Responsable Intégration</option>
            <option value="ResponsableCellule">Responsable Cellule</option>
            <option value="ResponsableEvangelisation">Responsable Evangélisation</option>
            <option value="SuperviseurCellule">Superviseur Cellules</option>
            <option value="Conseiller">Conseiller</option>   
          </select>

          {/* Cellule si rôle ResponsableCellule */}
          {formData.role === "ResponsableCellule" && (
            <>
              <input name="cellule_nom" placeholder="Nom cellule" value={formData.cellule_nom} onChange={handleChange} className="input" />
              <input name="cellule_zone" placeholder="Zone cellule" value={formData.cellule_zone} onChange={handleChange} className="input" />
            </>
          )}

          <div className="flex gap-4 mt-4">
            <button type="button" onClick={handleCancel} className="flex-1 bg-gray-400 hover:bg-gray-500 text-white py-3 rounded-xl">
              Annuler
            </button>
            <button type="submit" disabled={loading} className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl">
              {loading ? "Création..." : "Créer"}
            </button>
          </div>
        </form>

        {message && <p className="mt-4 text-center">{message}</p>}

        <style jsx>{`
          .input { width: 100%; border: 1px solid #ccc; border-radius: 12px; padding: 12px; }
        `}</style>
      </div>
    </div>
  );
}
