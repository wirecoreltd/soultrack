"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import supabase from "../lib/supabaseClient";
import HeaderInvitation from "../components/HeaderInvitation";

export default function AcceptInvitation() {
  const router = useRouter();
  const { token } = router.query;

  const [invitation, setInvitation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [choice, setChoice] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!router.isReady || !token) return;

    const fetchInvitation = async () => {
      const { data, error } = await supabase
        .from("eglise_supervisions")
        .select("*")
        .eq("invitation_token", token)
        .single();

      if (error || !data) {
        setInvitation(null);
      } else {
        setInvitation(data);
      }
      setLoading(false);
    };

    fetchInvitation();
  }, [router.isReady, token]);

  const handleSubmit = async () => {
  if (!choice || !invitation) return;

  setSubmitting(true);

  try {
    // 🔹 1. Récupérer utilisateur connecté (Supabase v2)
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error("Utilisateur non connecté");
    }

    // 🔹 2. Récupérer la branche du supervisee (celui qui accepte)
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("branche_id")
      .eq("id", user.id)
      .single();

    if (profileError || !profile?.branche_id) {
      throw new Error("Branche du supervisee introuvable");
    }

    const superviseeBrancheId = profile.branche_id;

    // 🔹 3. Mettre à jour le statut de l'invitation
    await supabase
      .from("eglise_supervisions")
      .update({
        statut: choice,
        supervisee_branche_id: superviseeBrancheId,
        approved_at: choice === "acceptee" ? new Date().toISOString() : null,
      })
      .eq("invitation_token", token);

    // 🔹 4. Si accepté → lier les branches
    if (choice === "acceptee") {
      // Récupérer la branche du superviseur
      const { data: brancheSup, error: supError } = await supabase
        .from("branches")
        .select("id, nom")
        .eq("id", invitation.superviseur_branche_id)
        .single();

      if (supError || !brancheSup) {
        throw new Error("Branche du superviseur introuvable");
      }

      // 🔹 Mettre à jour la branche du supervisee
      const { error: updateError } = await supabase
        .from("branches")
        .update({
          superviseur_id: brancheSup.id,
          superviseur_nom: brancheSup.nom,
        })
        .eq("id", superviseeBrancheId);

      if (updateError) {
        throw new Error("Erreur mise à jour branche supervisee");
      }

      setMessage(
        `Vous êtes maintenant sous la supervision de ${brancheSup.nom}`
      );
    }

    if (choice === "refusee") {
      setMessage(
        `Vous avez refusé l’invitation de ${invitation.eglise_nom}`
      );
    }

    if (choice === "pending") {
      setMessage(
        "Invitation laissée en attente. Vous pourrez décider plus tard."
      );
    }

    setTimeout(() => {
      router.push("/");
    }, 3000);

  } catch (error) {
    console.error("Erreur :", error.message);
    setMessage("Une erreur est survenue lors du traitement de l'invitation.");
  } finally {
    setSubmitting(false);
  }
};

  if (loading) return <div className="p-10">Chargement…</div>;
  if (!invitation) return <div className="p-10">Invitation introuvable</div>;

  return (
    <div className="min-h-screen bg-[#333699] flex flex-col items-center p-6">
      <HeaderInvitation />

      <div className="w-full max-w-md flex justify-between items-center mt-4 mb-6">
        <h1 className="text-2xl font-bold text-white">
          Invitation de l'église superviseur
        </h1>
      </div>

      <div className="bg-white rounded-3xl shadow-xl p-6 max-w-md w-full space-y-4">
        <div className="space-y-1">
          <p><b>Église superviseuse :</b> {invitation.eglise_nom}</p>
          <p><b>Branche :</b> {invitation.eglise_branche}</p>
        </div>

        <hr />

        <p>
          <b>Statut actuel :</b>{" "}
          <span className="capitalize">{invitation.statut}</span>
        </p>

        {!message && (
          <>
            <div className="mt-4">
              <label className="block font-semibold mb-1">Votre décision</label>
              <select
                value={choice}
                onChange={(e) => setChoice(e.target.value)}
                className="w-full border rounded-xl p-2"
              >
                <option value="">-- Choisir --</option>
                <option value="acceptee">Accepter</option>
                <option value="refusee">Refuser</option>
                <option value="pending">En attente</option>
              </select>
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting || !choice}
              className="w-full mt-4 bg-[#333699] text-white py-2 rounded-xl font-semibold disabled:opacity-50"
            >
              Confirmer
            </button>
          </>
        )}

        {message && (
          <div className="mt-6 text-center font-semibold text-lg text-[#333699]">
            {message}
            <p className="text-sm mt-2 text-gray-500">
              Redirection vers le dashboard…
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
