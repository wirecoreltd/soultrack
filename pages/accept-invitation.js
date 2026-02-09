"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import supabase from "../lib/supabaseClient";
import HeaderPages from "../components/HeaderPages";

export default function AcceptInvitation() {
  const router = useRouter();
  const { token } = router.query;

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("Vérification de l'invitation...");

  useEffect(() => {
    if (!token) return;

    const checkInvitation = async () => {
      const { data, error } = await supabase
        .from("eglise_supervisions")
        .select("*")
        .eq("invitation_token", token)
        .single();

      if (error || !data) {
        setMessage("Invitation invalide ou expirée.");
        setLoading(false);
        return;
      }

      if (data.statut === "accepted") {
        setMessage("Cette invitation a déjà été acceptée.");
        setLoading(false);
        return;
      }

      const { error: updateError } = await supabase
        .from("eglise_supervisions")
        .update({
          statut: "accepted",
          approved_at: new Date().toISOString(),
        })
        .eq("id", data.id);

      if (updateError) {
        setMessage("Erreur lors de l'acceptation.");
      } else {
        setMessage(`Invitation acceptée. Église reliée avec succès.`);
      }

      setLoading(false);
    };

    checkInvitation();
  }, [token]);

  return (
    <div className="min-h-screen bg-[#333699] text-white flex flex-col items-center justify-center p-6">
      <HeaderPages />

      <div className="bg-white text-black rounded-2xl shadow-xl p-6 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-4">Invitation Église</h1>

        {loading ? (
          <p>Chargement...</p>
        ) : (
          <p className="font-semibold">{message}</p>
        )}
      </div>
    </div>
  );
}
