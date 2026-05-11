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
        // Récupérer invitation
        const { data: invitation, error: fetchError } = await supabase
          .from("eglise_supervisions")
          .select("*")
          .eq("invitation_token", token)
          .single();

        if (fetchError || !invitation) {
          setMessage("Invitation introuvable ou expirée.");
          setLoading(false);
          return;
        }

        // Mise à jour simple
        const { error: updateError } = await supabase
          .from("eglise_supervisions")
          .update({
            statut: action,
          })
          .eq("id", invitation.id);

        if (updateError) {
          console.error(updateError);
          setMessage(updateError.message);
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
