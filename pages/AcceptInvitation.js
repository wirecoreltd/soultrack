"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import supabase from "../lib/supabaseClient";

export default function AcceptInvitation() {
  const router = useRouter();
  const { token } = router.query; // récupère le token depuis l'URL
  const [message, setMessage] = useState("Vérification de l'invitation...");

  useEffect(() => {
    if (!token) return;

    const verifyInvitation = async () => {
      const { data, error } = await supabase
        .from("eglise_supervisions")
        .select("*")
        .eq("invitation_token", token)
        .single();

      if (error || !data) {
        setMessage("Invitation invalide ou expirée.");
        return;
      }

      if (data.statut === "accepted") {
        setMessage("Cette invitation a déjà été acceptée.");
        return;
      }

      // 🔹 Met à jour le statut
      await supabase
        .from("eglise_supervisions")
        .update({ statut: "accepted", approved_at: new Date().toISOString() })
        .eq("id", data.id);

      setMessage(
        `Vous êtes maintenant relié(e) à ${data.eglise_nom}. Bienvenue !`
      );
    };

    verifyInvitation();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#333699] text-white p-6">
      <div className="bg-white text-black p-6 rounded-2xl shadow-lg max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-4">Invitation</h1>
        <p>{message}</p>
      </div>
    </div>
  );
}
