"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
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

  // ➤ Récupérer l'ID du responsable connecté
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) setResponsableId(session.user.id);
    };
    fetchUser();
  }, []);

  // ➤ Charge les membres star = true
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

  // ➤ Remplir les infos quand un membre est sélectionné
  useEffect(() => {
    if (!selectedMemberId) {
      setFormData({ ...formData, prenom: "", nom: "", telephone: "" });
      return;
    }
    const member = members.find((m) => m.id === selectedMemberId);
    if (member) {
      setFormData({
        ...formData,
        prenom: member.prenom,
        nom: member.nom,
        telephone: member.telephone,
      });
    }
  }, [selectedMemberId]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMemberId || !formData.email || !formData.password) {
      setMessage("❌ Remplissez tous les champs !");
      return;
    }
    if (!responsableId) {
      setMessage("❌ Impossible de récupérer votre ID de responsable !");
      return;
    }

    setLoading(true);
    setMessage("⏳ Création en cours...");

    try {
      const res = await fetch("/api/create-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          role: "Conseiller",
          responsable_id: responsableId,
        }),
      });

      const data = await res.json().catch(() => null);

      if (res.ok) {
        setMessage("✅ Conseiller créé avec succès !");
        setSelectedMemberId("");
        setFormData({
          prenom: "",
          nom: "",
          telephone: "",
          email: "",
          password: "",
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

  const handleCancel = () => router.push("/");

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

        <h1 className="text-3xl font-bold text-center mb-6">Créer un Conseiller</h1>

        <form onSubmit={handleSubmit} className="flex flex-col w-full gap-4">
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

          <input name="prenom" placeholder="Prénom" value={formData.prenom} className="input" readOnly />
          <input name="nom" placeholder="Nom" value={formData.nom} className="input" readOnly />
          <input name="telephone" placeholder="Téléphone" value={formData.telephone} className="input" readOnly />
          <input name="email" placeholder="Email du conseiller" value={formData.email} onChange={handleChange} className="input" required />
          <input name="password" placeholder="Mot de passe" type="password" value={formData.password} onChange={handleChange} className="input" required />

          <div className="flex gap-4 mt-4">
            <button type="button" onClick={handleCancel} className="flex-1 bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white font-bold py-3 rounded-2xl shadow-md transition-all duration-200">Annuler</button>
            <button type="submit" disabled={loading} className="flex-1 bg-gradient-to-r from-blue-400 to-indigo-500 hover:from-blue-500 hover:to-indigo-600 text-white font-bold py-3 rounded-2xl shadow-md transition-all duration-200">
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
            text-align: left;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            color: black;
          }
        `}</style>
      </div>
    </div>
  );
}
