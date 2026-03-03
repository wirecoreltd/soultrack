"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import supabase from "../lib/supabaseClient";
import HeaderInvitation from "../components/HeaderInvitation";
import Footer from "../components/Footer";

export default function AcceptInvitation() {
  const router = useRouter();
  const { token } = router.query;

  const [invitation, setInvitation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [choice, setChoice] = useState("");
  const [message, setMessage] = useState("");
  const [alreadySupervised, setAlreadySupervised] = useState(false);
  const [currentSupervisor, setCurrentSupervisor] = useState(null);

  useEffect(() => {
    if (!router.isReady || !token) return;

    const fetchInvitation = async () => {
      try {
        const { data } = await supabase
          .from("eglise_supervisions")
          .select(`
            *,
            superviseur_branche:branches(id, nom, localisation)
          `)
          .eq("invitation_token", token)
          .single();

        if (!data) {
          setLoading(false);
          return;
        }

        setInvitation(data);
        setChoice(data.statut || "");

        // Vérifier si cette église/branche est déjà supervisée
        const { data: existing } = await supabase
          .from("eglise_supervisions")
          .select(`superviseur_eglise:eglises(nom)`)
          .eq("supervisee_eglise_id", data.supervisee_eglise_id)
          .eq("supervisee_branche_id", data.supervisee_branche_id)
          .eq("statut", "acceptee")
          .maybeSingle();

        if (existing) {
          setAlreadySupervised(true);
          setCurrentSupervisor(existing.superviseur_eglise?.nom || "un autre superviseur");
        }

      } catch (err) {
        console.error("Erreur fetch invitation :", err);
      } finally {
        setLoading(false);
      }
    };

    fetchInvitation();
  }, [router.isReady, token]);

  const handleSubmit = async () => {
    if (!choice || !invitation) return;
    setSubmitting(true);

    try {
      if (choice === "acceptee") {
        // 1️⃣ Récupérer la branche superviseur (celle qui doit devenir superviseur)
        const superviseur_branche_id = invitation.superviseur_branche_id;

        if (!superviseur_branche_id) {
          console.error("Aucune branche superviseur trouvée !");
          setSubmitting(false);
          return;
        }

        const { data: brancheSup, error: brancheError } = await supabase
          .from("branches")
          .select("id, nom")
          .eq("id", superviseur_branche_id)
          .single();

        if (brancheError || !brancheSup) {
          console.error("Impossible de récupérer la branche superviseur :", brancheError);
          setSubmitting(false);
          return;
        }

        // 2️⃣ Mettre à jour l'invitation
        const { error: updateInvitationError } = await supabase
          .from("eglise_supervisions")
          .update({
            statut: "acceptee",
            approved_at: new Date().toISOString(),
            superviseur_branche_id: brancheSup.id
          })
          .eq("id", invitation.id);

        if (updateInvitationError) {
          console.error("Erreur update invitation :", updateInvitationError);
          setSubmitting(false);
          return;
        }

        // 3️⃣ Mettre à jour la branche supervisée
        const { error: updateBrancheError } = await supabase
          .from("branches")
          .update({
            superviseur_id: brancheSup.id,
            superviseur_nom: brancheSup.nom
          })
          .eq("id", invitation.supervisee_branche_id);

        if (updateBrancheError) {
          console.error("Erreur update branche supervisée :", updateBrancheError);
          setSubmitting(false);
          return;
        }

        console.log("✅ Supervision acceptée et branche mise à jour !");
        setMessage("Supervision acceptée avec succès !");
      } else {
        setMessage(`Décision enregistrée : ${choice}`);
      }

      // Redirection après 3 secondes
      setTimeout(() => router.push("/"), 3000);

    } catch (err) {
      console.error("Erreur inattendue :", err);
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
          <p><b>Pays :</b> {invitation.superviseur_branche?.localisation || "Non renseigné"}</p>
        </div>

        <hr />

        <p><b>Statut actuel :</b> <span className="capitalize">{invitation.statut}</span></p>

        {alreadySupervised && (
          <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-xl text-sm">
            ⚠️ Cette église/branche est déjà supervisée par <b>{currentSupervisor}</b>.<br />
            Vous ne pouvez pas accepter une autre supervision.
          </div>
        )}

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
                <option value="acceptee" disabled={alreadySupervised}>Accepter</option>
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

      <Footer />
    </div>
  );
}
