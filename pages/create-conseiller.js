"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import supabase from "../lib/supabaseClient";
import Image from "next/image";

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
  const [responsableId, setResponsableId] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Récupérer le responsable connecté
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) setResponsableId(session.user.id);
    });
  }, []);

  // Charger les membres star
  useEffect(() => {
    async function loadMembers() {
      const { data } = await supabase
        .from("membres")
        .select("id, prenom, nom, telephone")
        .eq("star", true);
      setMembers(data || []);
    }
    loadMembers();
  }, []);

  // Auto-remplissage
  useEffect(() => {
    if (!selectedMemberId) {
      setFormData({ ...formData, prenom: "", nom: "", telephone: "" });
      return;
    }
    const m = members.find((x) => x.id === selectedMemberId);
    if (m) {
      setFormData({
        ...formData,
        prenom: m.prenom,
        nom: m.nom,
        telephone: m.telephone,
      });
    }
  }, [selectedMemberId]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMemberId) {
      setMessage("❌ Sélectionnez un membre !");
      return;
    }

    setLoading(true);
    setMessage("⏳ Création du conseiller...");

    // ⭐ Récupérer le token pour l’envoyer à l’API
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const token = session?.access_token;

    const res = await fetch("/api/create-conseiller", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // ⭐ CRITIQUE
      },
      body: JSON.stringify({
        ...formData,
        role: "Conseiller",
        responsable_id: responsableId, // ⭐ finalement envoyé correctement
      }),
    });

    const data = await res.json();

    if (res.ok) {
      setMessage("✅ Conseiller créé !");
      setSelectedMemberId("");
      setFormData({
        prenom: "",
        nom: "",
        telephone: "",
        email: "",
        password: "",
      });
    } else {
      setMessage("❌ " + data.error);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-br from-purple-200 via-pink-100 to-yellow-200 p-6">
      <div className="bg-white p-8 rounded-3xl shadow-lg w-full max-w-md relative">
        <button onClick={() => router.back()} className="absolute top-4 left-4 text-gray-700 hover:text-gray-900">
          ← Retour
        </button>

        <div className="flex justify-center mb-6">
          <Image src="/logo.png" width={80} height={80} alt="Logo" />
        </div>

        <h1 className="text-3xl font-bold text-center mb-6">Créer un Conseiller</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <select
            value={selectedMemberId}
            onChange={(e) => setSelectedMemberId(e.target.value)}
            className="input"
            required
          >
            <option value="">-- Sélectionnez un membre (star=Oui) --</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.prenom} {m.nom}
              </option>
            ))}
          </select>

          <input className="input" name="prenom" value={formData.prenom} readOnly />
          <input className="input" name="nom" value={formData.nom} readOnly />
          <input className="input" name="telephone" value={formData.telephone} readOnly />

          <input className="input" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
          <input className="input" name="password" type="password" placeholder="Password" value={formData.password} onChange={handleChange} required />

          <button disabled={loading} className="bg-blue-500 text-white py-3 rounded-xl">
            {loading ? "Création..." : "Créer"}
          </button>
        </form>

        {message && <p className="text-center mt-4">{message}</p>}

        <style jsx>{`
          .input {
            width: 100%;
            padding: 12px;
            border-radius: 12px;
            border: 1px solid #ccc;
          }
        `}</style>
      </div>
    </div>
  );
}
