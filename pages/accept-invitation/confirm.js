"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import supabase from "../../lib/supabaseClient";

export default function AcceptInvitationConfirm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    const action = searchParams.get("action");

    if (!token || !action) {
      setMessage("Lien invalide.");
      setLoading(false);
      return;
    }

    const updateInvitation = async () => {
  try {
    // Appel sécurisé : la fonction RPC vérifie le token et met à jour
    // le statut sans exposer la table eglise_supervisions à un accès
    // public direct (RLS reste strict, seule cette fonction contourne
    // RLS de façon contrôlée, via SECURITY DEFINER).
    const { data, error: rpcError } = await supabase.rpc("repondre_invitation", {
      p_token: token,
      p_action: action,
    });

    if (rpcError) {
      console.error(rpcError);
      setMessage(rpcError.message);
      setLoading(false);
      return;
    }

    if (!data?.success) {
      setMessage(data?.error || "Invitation introuvable ou expirée.");
      setLoading(false);
      return;
    }

    setMessage(
      action === "acceptee"
        ? "Invitation acceptée !"
        : action === "refusee"
        ? "Invitation refusée."
        : "Invitation laissée en attente."
    );
    setTimeout(() => {
      router.push("/");
    }, 2000);
  } catch (err) {
    console.error(err);
    setMessage("Une erreur est survenue.");
  } finally {
    setLoading(false);
  }
};
    updateInvitation();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="p-6 bg-white rounded shadow text-center">
        {loading ? (
          <p>Chargement…</p>
        ) : (
          <>
            <p className="text-lg font-semibold">{message}</p>
            <p className="text-sm mt-2">
              Vous allez être redirigé...
            </p>
          </>
        )}
      </div>
    </div>
  );
}
