"use client";

import { useState, useEffect } from "react";
import supabase from "../lib/supabaseClient";
import { useRouter } from "next/router";

// Composant principal
export default function RelierEglise() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [eglises, setEglises] = useState([]);
  const [selectedEglise, setSelectedEglise] = useState("");
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");

  // 🔹 Récupération utilisateur
  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) setUser(data.user);
    };
    fetchUser();
  }, []);

  // 🔹 Récupérer toutes les églises dans le même pays / branche
  useEffect(() => {
    const fetchEglises = async () => {
      if (!user) return;

      // Récupérer le profil complet
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, role, eglise_id, branche_id, pays")
        .eq("id", user.id)
        .single();

      if (!profile) return;

      // Toutes les églises sauf la sienne
      const { data: allEglises } = await supabase
        .from("eglises")
        .select("id, nom")
        .eq("pays", profile.pays)
        .neq("id", profile.eglise_id);

      if (allEglises) setEglises(allEglises);
    };
    fetchEglises();
  }, [user]);

  // 🔹 Générer lien unique + envoyer
  const sendInvitation = async (method) => {
    if (!selectedEglise) {
      setMessage("⚠️ Veuillez sélectionner une église.");
      return;
    }

    setSending(true);
    setMessage("");

    try {
      // Créer un token unique pour sécuriser le lien
      const token = crypto.randomUUID();

      // Stocker dans la table supervision_invitations
      const { error } = await supabase
        .from("supervision_invitations")
        .insert([
          {
            eglise_envoie_id: user.id, // eglise parent
            eglise_recoit_id: selectedEglise,
            token,
            status: "pending",
            pays: profile.pays,
          },
        ]);

      if (error) throw error;

      // Générer le lien
      const link = `${window.location.origin}/accept-supervision?token=${token}`;

      // Envoyer par WhatsApp ou Email
      if (method === "whatsapp") {
        window.open(`https://wa.me/?text=Vous êtes invité à être supervisé : ${link}`, "_blank");
      } else if (method === "email") {
        window.location.href = `mailto:?subject=Invitation Supervision&body=Vous êtes invité à être supervisé : ${link}`;
      }

      setMessage("✅ Lien envoyé !");
    } catch (err) {
      console.error(err);
      setMessage("❌ Erreur : " + err.message);
    } finally {
      setSending(false);
    }
  };

  if (!user) return <p className="text-center mt-10">Chargement utilisateur...</p>;

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-purple-300 to-blue-200 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6">🔗 Relier une Église</h1>

      <div className="bg-white p-6 rounded-2xl shadow-md w-full max-w-md flex flex-col gap-4">
        {/* Select église */}
        <label className="font-semibold">Sélectionnez une église à superviser :</label>
        <select
          value={selectedEglise}
          onChange={(e) => setSelectedEglise(e.target.value)}
          className="border px-3 py-2 rounded w-full"
        >
          <option value="">-- Choisir une église --</option>
          {eglises.map((e) => (
            <option key={e.id} value={e.id}>
              {e.nom}
            </option>
          ))}
        </select>

        {/* Boutons envoi */}
        <div className="flex gap-3 mt-4">
          <button
            disabled={sending}
            onClick={() => sendInvitation("whatsapp")}
            className="flex-1 bg-green-500 text-white py-2 rounded hover:bg-green-600 transition"
          >
            📱 Envoyer WhatsApp
          </button>
          <button
            disabled={sending}
            onClick={() => sendInvitation("email")}
            className="flex-1 bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
          >
            ✉️ Envoyer Email
          </button>
        </div>

        {/* Feedback */}
        {message && <p className="mt-2 text-center">{message}</p>}
      </div>
    </div>
  );
}
