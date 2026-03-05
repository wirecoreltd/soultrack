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
    const action = searchParams.get("action"); // "acceptee" | "refusee" | "pending"

    if (!token || !action) {
      setMessage("Lien invalide.");
      setLoading(false);
      return;
    }

    const updateInvitation = async () => {
      try {
        // 🔹 Récupérer l’invitation
        const { data: invitation, error: fetchError } = await supabase
          .from("eglise_supervisions")
          .select("*")
          .eq("invitation_token", token)
          .single();

        if (fetchError || !invitation) {
          setMessage("Invitation introuvable ou expirée.");
          return;
        }

        // 🔹 Définir les valeurs à mettre à jour
        const updateData = { statut: action };
        if (action === "refusee" || action === "lien_casse") {
          updateData.superviseur_branche_id = null;
          updateData.superviseur_nom = null;
        }

        // 🔹 Mettre à jour la ligne
        const { error: updateError } = await supabase
          .from("eglise_supervisions")
          .update(updateData)
          .eq("id", invitation.id);

        if (updateError) {
          setMessage("Erreur lors de la mise à jour.");
          console.error(updateError);
          return;
        }

        setMessage(
          action === "acceptee"
            ? "Invitation acceptée !"
            : action === "refusee"
            ? "Invitation refusée."
            : "Invitation laissée en attente."
        );

        // 🔹 Redirection automatique après 2 sec vers page principale
        setTimeout(() => router.push("/"), 2000);
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
          <p className="text-lg font-semibold">{message}</p>
        )}
        {!loading && <p className="text-sm mt-2">Vous allez être redirigé...</p>}
      </div>
    </div>
  );
}
