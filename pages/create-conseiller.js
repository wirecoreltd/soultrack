// pages/create-conseiller.js
"use client";

import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function CreateConseiller() {
  const router = useRouter();
  const [responsableId, setResponsableId] = useState(null);
  const [members, setMembers] = useState([]);
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [selectedMemberInfo, setSelectedMemberInfo] = useState({});
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // ➤ Récupère l'ID du responsable connecté
  useEffect(() => {
    const profile = JSON.parse(localStorage.getItem("profile"));
    if (profile?.id) setResponsableId(profile.id);
  }, []);

  // ➤ Charge les membres "star = true"
  useEffect(() => {
    async function fetchStarMembers() {
      const { data, error } = await supabase
        .from("membres")
        .select("id, prenom, nom, telephone")
        .eq("star", true);

      if (error) console.error(error);
      else setMembers(data);
    }
    fetchStarMembers();
  }, []);

  // ➤ Met à jour les infos du membre sélectionné
  useEffect(() => {
    if (!selectedMemberId) return;
    const member = members.find((m) => m.id === selectedMemberId);
    setSelectedMemberInfo(member || {});
  }, [selectedMemberId, members]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMemberId || !email || !password) {
      setMessage("❌ Remplissez tous les champs !");
      return;
    }

    setLoading(true);
    setMessage("⏳ Création en cours...");

    try {
      const res = await fetch("/api/create-conseiller", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          membre_id: selectedMemberId,
          prenom: selectedMemberInfo.prenom,
          nom: selectedMemberInfo.nom,
          telephone: selectedMemberInfo.telephone,
          email,
          password,
          responsable_id: responsableId,
        }),
      });

      const data = await res.json().catch(() => null);

      if (res.ok) {
        setMessage("✅ Conseiller créé et membre mis à jour avec succès !");
        setSelectedMemberId("");
        setSelectedMemberInfo({});
        setEmail("");
        setPassword("");
      } else {
        setMessage(`❌ Erreur : ${data?.error || "Réponse vide du serveur"}`);
      }
    } catch (err) {
      setMessage("❌ " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-200 via-pink-100 to-yellow-100 p-6">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-lg relative">

        <h1 className="text-3xl font-bold text-center mb-4">Créer un Conseiller</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {/* Sélection du membre star */}
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

          {/* Affichage des infos du membre */}
          {selectedMemberId && (
            <div className="p-3 bg-gray-50 rounded-lg text-gray-700">
              <p><strong>Prénom:</strong> {selectedMemberInfo.prenom}</p>
              <p><strong>Nom:</strong> {selectedMemberInfo.nom}</p>
              <p><strong>Téléphone:</strong> {selectedMemberInfo.telephone}</p>
            </div>
          )}

          <input
            type="email"
            placeholder="Email du conseiller"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
            required
          />

          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
            required
          />

          <div className="flex gap-4 mt-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 py-3 rounded-2xl text-black border border-gray-400 hover:bg-gray-100 transition-all"
            >
              Annuler
            </button>

            <button
              type="submit"
              disabled={loading}
              className={`flex-1 py-3 rounded-2xl text-white shadow-md transition-all
                ${loading
                  ? "bg-gray-400"
                  : "bg-gradient-to-r from-blue-400 to-indigo-500 hover:from-blue-500 hover:to-indigo-600"
                }`}
            >
              {loading ? "Création..." : "Créer"}
            </button>
          </div>
        </form>

        {message && (
          <p className="mt-4 text-center font-semibold text-gray-700">{message}</p>
        )}

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
