"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import supabase from "../../lib/supabaseClient";
import Image from "next/image";
import ProtectedRoute from "../../components/ProtectedRoute";

export default function CreateInternalUserPage() {
  return (
    <ProtectedRoute>
      <CreateInternalUserContent />
    </ProtectedRoute>
  );
}

function CreateInternalUserContent() {
  const router = useRouter();
  const [members, setMembers] = useState([]);
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [duplicatePhone, setDuplicatePhone] = useState(null);

  const [formData, setFormData] = useState({
    prenom: "",
    nom: "",
    email: "",
    password: "",
    confirmPassword: "",
    telephone: "",
    roles: [],
    cellule_nom: "",
    cellule_zone: "",
    ministere: [],
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [rolesToHide, setRolesToHide] = useState([]);

  const ministereOptions = [
    "Intercession",
    "Louange",
    "Technique",
    "Communication",
    "Les Enfants",
    "Les ados",
    "Les jeunes",
    "Finance",
    "Nettoyage",
    "Conseiller",
    "Compassion",
    "Visite",
    "Berger",
    "Modération",
  ];

  const allRoles = [
    { key: "Administrateur", label: "Administrateur" },
    { key: "ResponsableIntegration", label: "Responsable Integration" },
    { key: "ResponsableCellule", label: "Responsable Cellule" },
    { key: "ResponsableEvangelisation", label: "Responsable Evangelisation" },
    { key: "SuperviseurCellule", label: "Superviseur Cellule" },
    { key: "Conseiller", label: "Conseiller" },
  ];

  // ➤ Récupérer les membres existants
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;

        const { data: profile } = await supabase
          .from("profiles")
          .select("eglise_id, branche_id")
          .eq("id", session.user.id)
          .single();

        if (!profile) return;

        const { data: membersData } = await supabase
          .from("membres_complets")
          .select("id, prenom, nom, telephone, etat_contact")
          .eq("star", true)
          .eq("eglise_id", profile.eglise_id)
          .eq("branche_id", profile.branche_id)
          .in("etat_contact", ["existant"]);

        setMembers(membersData || []);
      } catch (err) {
        console.error("Erreur fetchMembers:", err);
      }
    };

    fetchMembers();
  }, []);

  // ➤ Pré-remplissage infos et calcul des rôles à cacher
  useEffect(() => {
    if (!selectedMemberId || selectedMemberId === "add-serviteur") {
      setFormData(prev => ({
        ...prev,
        prenom: "",
        nom: "",
        telephone: "",
        roles: [],
        ministere: [],
      }));
      setRolesToHide([]);
      return;
    }

    const member = members.find(m => m.id === selectedMemberId);
    if (member) {
      setFormData(prev => ({
        ...prev,
        prenom: member.prenom,
        nom: member.nom,
        telephone: member.telephone,
        roles: [],
      }));

      const checkExistingRoles = async () => {
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("roles")
          .eq("prenom", member.prenom)
          .eq("nom", member.nom)
          .eq("telephone", member.telephone);

        let hide = [];
        profilesData?.forEach(p => {
          if (p.roles?.length) hide.push(...p.roles);
        });

        setRolesToHide([...new Set(hide)]);
      };

      checkExistingRoles();
    }
  }, [selectedMemberId, members]);

  const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleRoleChange = role => {
    setFormData(prev => {
      const roles = prev.roles.includes(role)
        ? prev.roles.filter(r => r !== role)
        : [...prev.roles, role];
      return { ...prev, roles };
    });
  };

  const handleMinistereChange = ministere => {
    setFormData(prev => {
      const list = prev.ministere.includes(ministere)
        ? prev.ministere.filter(m => m !== ministere)
        : [...prev.ministere, ministere];
      return { ...prev, ministere: list };
    });
  }; 

  // ➤ Soumission du formulaire
  const handleSubmit = async (e, forceCreate = false) => {
  e.preventDefault();

  if (formData.password !== formData.confirmPassword) {
    setMessage("❌ Les mots de passe ne correspondent pas.");
    return;
  }

  if (!formData.roles || formData.roles.length === 0) {
    setMessage("❌ Sélectionnez au moins un rôle !");
    return;
  }

  setLoading(true);

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setMessage("❌ Session expirée");
      setLoading(false);
      return;
    }

    // ✅ 1. VERIFICATION TELEPHONE
    const { data: existingMembers } = await supabase
      .from("membres_complets")
      .select("prenom, nom, telephone")
      .eq("telephone", formData.telephone);
      .neq("etat_contact", "supprime")

    if (existingMembers && existingMembers.length > 0 && !forceCreate) {
      const existing = existingMembers[0];

      setDuplicatePhone(existing);
      setMessage(
        `⚠️ Le numéro ${formData.telephone} existe déjà pour ${existing.prenom} ${existing.nom}`
      );

      setLoading(false);
      return; // 🚨 BLOQUE ICI (IMPORTANT)
    }

    // ✅ 2. CREATION UTILISATEUR
    const res = await fetch("/api/create-user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        ...formData,
        member_id: selectedMemberId,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(`❌ ${data?.error}`);
      setLoading(false);
      return;
    }

    // ✅ SUCCESS
    setMessage("✅ Utilisateur créé !");
    setDuplicatePhone(null);

    setFormData({
      prenom: "",
      nom: "",
      email: "",
      password: "",
      confirmPassword: "",
      telephone: "",
      roles: [],
      cellule_nom: "",
      cellule_zone: "",
      ministere: [],
    });

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

        <div className="flex justify-center mb-6 cursor-pointer" 
          onClick={() => router.push("/index")}>
          <Image  src="/logo.png"  alt="Logo SoulTrack"  width={80}  height={80} />
        </div>
            
        <h1 className="text-3xl font-bold text-center mb-6">Créer un utilisateur</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <select
            value={selectedMemberId}
            onChange={e => setSelectedMemberId(e.target.value)}
            className="input"
            required
          >
            <option value="">-- Choisir un membre existant --</option>
            {members.map(m => (
              <option key={m.id} value={m.id}>{m.prenom} {m.nom}</option>
            ))}
            <option value="add-serviteur">➕ Ajouter un Serviteur</option>
          </select>

          {(selectedMemberId === "add-serviteur" || selectedMemberId) && (
            <>
              <input name="prenom" placeholder="Prénom" value={formData.prenom} onChange={handleChange} className="input" />
              <input name="nom" placeholder="Nom" value={formData.nom} onChange={handleChange} className="input" />
              <input name="telephone" placeholder="Téléphone" value={formData.telephone} onChange={handleChange} className="input" />
            </>
          )}

          {selectedMemberId === "add-serviteur" && (
            <div className="flex flex-col gap-2">
              <label className="font-semibold">Ministères :</label>
              {ministereOptions.map(m => (
                <label key={m} className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.ministere.includes(m)}
                    onChange={() => handleMinistereChange(m)}
                  />
                  {m}
                </label>
              ))}
            </div>
          )}

          <input name="email" placeholder="Email" value={formData.email} onChange={handleChange} className="input" required />
          <input name="password" placeholder="Mot de passe" type="password" value={formData.password} onChange={handleChange} className="input" required />
          <input name="confirmPassword" placeholder="Confirmer mot de passe" type="password" value={formData.confirmPassword} onChange={handleChange} className="input" required />

          <div className="flex flex-col gap-2">
            <label className="font-semibold">Rôles :</label>
            {allRoles.map(role =>
              !rolesToHide.includes(role.key) && (
                <label key={role.key} className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.roles.includes(role.key)}
                    onChange={() => handleRoleChange(role.key)}
                  />
                  {role.label}
                </label>
              )
            )}
          </div>

          {formData.roles.includes("ResponsableCellule") && (
            <div className="flex flex-col gap-2">
              <input name="cellule_nom" placeholder="Nom cellule" value={formData.cellule_nom} onChange={handleChange} className="input" />
              <input name="cellule_zone" placeholder="Zone cellule" value={formData.cellule_zone} onChange={handleChange} className="input" />
            </div>
          )}

          <div className="flex gap-4 mt-4">
  <button
    type="button"
    onClick={handleCancel}
    disabled={!!duplicatePhone}
    className={`flex-1 py-3 rounded-xl text-white ${
      duplicatePhone
        ? "bg-gray-300 cursor-not-allowed"
        : "bg-gray-400 hover:bg-gray-500"
    }`}
  >
    Annuler
  </button>

  <button
    type="submit"
    disabled={loading || !!duplicatePhone}
    className={`flex-1 py-3 rounded-xl text-white ${
      duplicatePhone
        ? "bg-gray-300 cursor-not-allowed"
        : "bg-blue-500 hover:bg-blue-600"
    }`}
  >
    {loading ? "Création..." : "Créer"}
  </button>
</div>
        </form>
          {duplicatePhone && (
  <div className="mt-4 p-4 border border-yellow-500 bg-yellow-100 rounded-lg text-center">
    <p>
      ⚠️ Le numéro {formData.telephone} existe déjà pour {duplicatePhone.prenom} {duplicatePhone.nom}.
    </p>

    <div className="flex justify-center gap-4 mt-2">
      <button
        type="button"
        onClick={() => setDuplicatePhone(null)}
        className="bg-gray-500 text-white py-2 px-4 rounded"
      >
        Annuler
      </button>

      <button
        type="button"
        onClick={(e) => handleSubmit(e, true)}
        className="bg-green-500 text-white py-2 px-4 rounded"
      >
        Continuer quand même
      </button>
    </div>
  </div>
)}
              
                

        <style jsx>{`
          .input { width: 100%; border: 1px solid #ccc; border-radius: 12px; padding: 12px; }
        `}</style>
      </div>
    </div>
  );
}
