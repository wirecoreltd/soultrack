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
      const { data } = await supabase
        .from("eglise_supervisions")
        .select("*")
        .eq("invitation_token", token)
        .single();

      setInvitation(data || null);
      setLoading(false);
    };

    fetchInvitation();
  }, [router.isReady, token]);

  const handleSubmit = async () => {
    if (!choice || !invitation) return;

    setSubmitting(true);

    try {
      // 1️⃣ Mettre à jour le statut de l'invitation
      await supabase
        .from("eglise_supervisions")
        .update({
          statut: choice,
          approved_at: choice === "acceptee" ? new Date().toISOString() : null,
        })
        .eq("invitation_token", token);

      // 2️⃣ Si l'invitation est acceptée
      if (choice === "acceptee") {
        // 🔹 Vérifier que supervisee_eglise_id est défini
        if (!invitation.supervisee_eglise_id) {
          setMessage(
            "Impossible de récupérer votre profil, ID d'église supervisee manquant. Redirection…"
          );
          console.error("Erreur récupération profil supervisee : supervisee_eglise_id null");
          setTimeout(() => router.push("/"), 3000);
          return;
        }

        // 🔹 Récupérer le profil du supervisee pour sa branche
        const { data: profileSupervisee, error: profileError } = await supabase
          .from("profiles")
          .select("eglise_id, branche_id")
          .eq("eglise_id", invitation.supervisee_eglise_id)
          .single();

        if (profileError || !profileSupervisee) {
          setMessage("Impossible de récupérer la branche de votre église. Redirection…");
          console.error("Erreur récupération profil supervisee", profileError);
          setTimeout(() => router.push("/"), 3000);
          return;
        }

        const superviseeBrancheId = profileSupervisee.branche_id;

        // 🔹 Récupérer la branche du superviseur
        const { data: brancheSup } = await supabase
          .from("branches")
          .select("id, nom")
          .eq("id", invitation.superviseur_branche_id)
          .single();

        if (!brancheSup) {
          setMessage("Impossible de récupérer la branche du superviseur. Redirection…");
          setTimeout(() => router.push("/"), 3000);
          return;
        }

        // 🔹 Mettre à jour la branche du supervisee avec le superviseur
        await supabase
          .from("branches")
          .update({
            superviseur_id: brancheSup.id,
            superviseur_nom: invitation.eglise_nom,
          })
          .eq("id", superviseeBrancheId);

        setMessage(`Vous êtes maintenant sous la supervision de ${invitation.eglise_nom}`);
      }

      if (choice === "refusee") {
        setMessage(`Vous avez refusé l’invitation de ${invitation.eglise_nom}`);
      }

      if (choice === "pending") {
        setMessage("Invitation laissée en attente. Vous pourrez décider plus tard.");
      }

      setTimeout(() => router.push("/"), 3000);
    } catch (error) {
      console.error("Erreur :", error);
      setMessage("Une erreur est survenue.");
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
            <p className="text-sm mt-2 text-gray-500">Redirection vers le dashboard…</p>
          </div>
        )}
      </div>
    </div>
  );
}
