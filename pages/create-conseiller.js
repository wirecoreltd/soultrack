"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import supabase from "../lib/supabaseClient";

export default function CreateConseiller() {
  const router = useRouter();
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

  // ➤ Récupérer le responsable connecté
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setResponsableId(user.id);
    };
    fetchUser();
  }, []);

  // ➤ Charger les membres star = true
  useEffect(() => {
    const fetchStarMembers = async () => {
      const { data, error } = await supabase
        .from("membres")
        .select("id, prenom, nom, telephone")
        .eq("star", true);

      if (!error) setMembers(data);
      else console.error(error);
    };
    fetchStarMembers();
  }, []);

  // ➤ Remplir automatiquement prénom, nom, téléphone
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
      setMessage("❌ Impossible de récupérer le responsable connecté !");
      return;
    }

    setLoading(true);
    setMessage("⏳ Création en cours...");

    try {
      // ➤ Création du user dans Supabase Auth
      const { data: userData, error: createError } = await supabase.auth.admin.createUser({
        email: formData.email,
        password: formData.password,
        email_confirm: true,
      });

      if (createError) throw createError;
      const user = userData.user;

      // ➤ Ajout dans profiles avec responsable_id
      const { error: profileError } = await supabase.from("profiles").insert({
        id: user.id,
        prenom: formData.prenom,
        nom: formData.nom,
        telephone: formData.telephone,
        email: formData.email,
        role: "Conseiller",
        responsable_id: responsableId,
      });

      if (profileError) throw profileError;

      setMessage("✅ Conseiller créé avec succès !");
      setSelectedMemberId("");
      setFormData({ prenom: "", nom: "", telephone: "", email: "", password: "" });
    } catch (err) {
      console.error(err);
      setMessage("❌ " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => router.push("/");

  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-6 bg-gradient-to-br from-purple-200 via-pink-100 to-yellow-200">
      <div className="bg-white p-8 rounded-3xl shadow-lg w-full max-w-md relative">
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 text-gray-700 hover:text-gray-900"
        >
          ← Retour
        </button>

        <h1 className="text-3xl font-bold text-center mb-6">Créer un Conseiller</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Menu déroulant membres star */}
          <select
            value={selectedMemberId}
            onChange={(e) => setSelectedMemberId(e.target.value)}
            className="input"
            required
          >
            <option value="">-- Sélectionnez un membre (star = Oui) --</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.prenom} {m.nom}
              </option>
            ))}
          </select>

          {/* Champs remplis automatiquement */}
          <input className="input" placeholder="Prénom" value={formData.prenom} readOnly />
          <input className="input" placeholder="Nom" value={formData.nom} readOnly />
          <input className="input" placeholder="Téléphone" value={formData.telephone} readOnly />

          {/* Email et mot de passe */}
          <input
            name="email"
            className="input"
            placeholder="Email du conseiller"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            name="password"
            type="password"
            className="input"
            placeholder="Mot de passe"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <div className="flex gap-4 mt-4">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 bg-gray-400 hover:bg-gray-500 text-white py-3 rounded-2xl"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-2xl"
            >
              {loading ? "Création..." : "Créer"}
            </button>
          </div>
        </form>

        {message && <p className="mt-4 text-center text-sm text-gray-700">{message}</p>}

        <style jsx>{`
          .input {
            width: 100%;
            border: 1px solid #ccc;
            border-radius: 12px;
            padding: 12px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            color: black;
          }
        `}</style>
      </div>
    </div>
  );
}
