"use client";

import { useState, useEffect } from "react";
import supabase from "../../lib/supabaseClient";
import HeaderPages from "../../components/HeaderPages";
import ProtectedRoute from "../../components/ProtectedRoute"; 

export default function LinkEglise() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur", "ResponsableEvangelisation"]}>
      <LinkEgliseContent />
    </ProtectedRoute>
  );
}

function LinkEgliseContent() {
  const [user, setUser] = useState(null);
  const [eglises, setEglises] = useState([]);
  const [selectedEglise, setSelectedEglise] = useState("");
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");

  // 🔹 Récupérer l'utilisateur
  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) setUser(data.user);
    };
    fetchUser();
  }, []);

  // 🔹 Récupérer toutes les églises sauf la sienne
  useEffect(() => {
    const fetchEglises = async () => {
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("id, eglise_id")
        .eq("id", user.id)
        .single();

      if (!profile) return;

      const { data: allEglises } = await supabase
        .from("eglises")
        .select("id, nom")
        .neq("id", profile.eglise_id);

      if (allEglises) setEglises(allEglises);
    };
    fetchEglises();
  }, [user]);

  // 🔹 Envoyer invitation supervision
  const sendInvitation = async (method) => {
    if (!selectedEglise) {
      setMessage("⚠️ Veuillez sélectionner une église.");
      return;
    }

    setSending(true);
    setMessage("");

    try {
      const token = crypto.randomUUID();

      const { error } = await supabase
        .from("supervision_invitations")
        .insert([
          {
            eglise_envoie_id: user.id,
            eglise_recoit_id: selectedEglise,
            token,
            status: "pending",
          },
        ]);

      if (error) throw error;

      const link = `${window.location.origin}/accept-supervision?token=${token}`;

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

  return (
    <div className="min-h-screen flex flex-col items-center bg-[#333699] p-6">
      <HeaderPages />

      <h1 className="text-3xl font-bold text-white text-center mb-6">🔗 Relier une Église</h1>

      <div className="bg-white rounded-2xl shadow-md p-6 w-full max-w-md flex flex-col gap-4">
        <label className="font-semibold">Sélectionnez une église :</label>
        <select
          value={selectedEglise}
          onChange={(e) => setSelectedEglise(e.target.value)}
          className="border px-3 py-2 rounded w-full"
        >
          <option value="">-- Choisir une église --</option>
          {eglises.map((e) => (
            <option key={e.id} value={e.id}>{e.nom}</option>
          ))}
        </select>

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

        {message && <p className="mt-2 text-center">{message}</p>}
      </div>
    </div>
  );
}
