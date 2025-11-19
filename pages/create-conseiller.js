"use client";
import { useState, useEffect } from "react";
import supabase from "../lib/supabaseClient";

export default function CreateConseiller() {
  const [members, setMembers] = useState([]);
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [formData, setFormData] = useState({
    prenom: "",
    nom: "",
    telephone: "",
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [responsableId, setResponsableId] = useState(null);

  // ➤ Récupérer l'utilisateur connecté pour le responsable_id
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setResponsableId(user.id);
    };
    fetchCurrentUser();
  }, []);

  // ➤ Charger les membres star = true
  useEffect(() => {
    const fetchStarMembers = async () => {
      const { data, error } = await supabase
        .from("membres")
        .select("id, prenom, nom, telephone")
        .eq("star", true);

      if (error) console.error(error);
      else setMembers(data);
    };
    fetchStarMembers();
  }, []);

  // ➤ Remplir automatiquement prénom, nom, téléphone quand on sélectionne un membre
  useEffect(() => {
    if (!selectedMemberId) {
      setFormData({ prenom: "", nom: "", telephone: "", email: "", password: "" });
      return;
    }

    const member = members.find((m) => m.id === selectedMemberId);
    if (member) {
      setFormData((prev) => ({
        ...prev,
        prenom: member.prenom,
        nom: member.nom,
        telephone: member.telephone,
      }));
    }
  }, [selectedMemberId, members]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedMemberId || !formData.email || !formData.password) {
      setMessage("❌ Remplissez tous les champs !");
      return;
    }

    if (!responsableId) {
      setMessage("❌ Impossible de récupérer l'utilisateur connecté !");
      return;
    }

    setLoading(true);
    setMessage("⏳ Création en cours...");

    try {
      const { error } = await supabase.from("profiles").insert([
        {
          prenom: formData.prenom,
          nom: formData.nom,
          telephone: formData.telephone,
          email: formData.email,
          password_hash: formData.password, // si tu gères le hash côté API
          role: "Conseiller",
          responsable_id: responsableId,
        },
      ]);

      if (error) {
        setMessage("❌ " + error.message);
      } else {
        setMessage("✅ Conseiller créé avec succès !");
        setSelectedMemberId("");
        setFormData({ prenom: "", nom: "", telephone: "", email: "", password: "" });
      }
    } catch (err) {
      setMessage("❌ " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Créer un Conseiller</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Sélection du membre star */}
        <select
          className="w-full p-2 border rounded"
          value={selectedMemberId}
          onChange={(e) => setSelectedMemberId(e.target.value)}
        >
          <option value="">-- Sélectionnez un membre (star = Oui) --</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.prenom} {m.nom}
            </option>
          ))}
        </select>

        {/* Champs remplis automatiquement */}
        <input
          className="w-full p-2 border rounded"
          placeholder="Prénom"
          value={formData.prenom}
          readOnly
        />
        <input
          className="w-full p-2 border rounded"
          placeholder="Nom"
          value={formData.nom}
          readOnly
        />
        <input
          className="w-full p-2 border rounded"
          placeholder="Téléphone"
          value={formData.telephone}
          readOnly
        />

        {/* Email et mot de passe pour créer le conseiller */}
        <input
          className="w-full p-2 border rounded"
          placeholder="Email"
          value={formData.email}
          name="email"
          onChange={handleChange}
          required
        />
        <input
          className="w-full p-2 border rounded"
          type="password"
          placeholder="Mot de passe"
          value={formData.password}
          name="password"
          onChange={handleChange}
          required
        />

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded w-full"
          disabled={loading}
        >
          {loading ? "Création..." : "Créer le Conseiller"}
        </button>
      </form>

      {message && <p className="mt-4 text-center">{message}</p>}
    </div>
  );
}
