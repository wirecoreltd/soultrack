"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "../lib/supabaseClient";
import HeaderInvitation from "../components/HeaderInvitation";

export default function AcceptInvitation() {
  const router = useRouter();

  const [token, setToken] = useState(null);
  const [invitation, setInvitation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [choice, setChoice] = useState("");
  const [message, setMessage] = useState("");

  // ── Lire le token depuis l'URL manuellement (compatible App Router) ──
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token");
    if (t) setToken(t);
  }, []);

  // ── Charger l'invitation + remplir supervisee_eglise_id ──
  useEffect(() => {
    if (!token) return;

    const fetchAndLink = async () => {
      setLoading(true);
      try {
        // 1. Récupérer l'invitation
        const { data, error } = await supabase
          .from("eglise_supervisions")
          .select("*")
          .eq("invitation_token", token)
          .single();

        if (error || !data) {
          setInvitation(null);
          setLoading(false);
          return;
        }

        setInvitation(data);

        // 2. Récupérer l'église de l'utilisateur connecté
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("eglise_id")
          .eq("id", user.id)
          .single();

        // 3. Remplir supervisee_eglise_id si pas encore rempli
        if (profile?.eglise_id && !data.supervisee_eglise_id) {
          await supabase
            .from("eglise_supervisions")
            .update({ supervisee_eglise_id: profile.eglise_id })
            .eq("invitation_token", token);
        }

      } catch (err) {
        console.error(err);
        setInvitation(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAndLink();
  }, [token]);

  const handleSubmit = async () => {
  if (!choice || !invitation) return;
  setSubmitting(true);

  try {
    // 1. Mettre à jour le statut de l'invitation
    const { error } = await supabase
      .from("eglise_supervisions")
      .update({
        statut: choice,
        approved_at: choice === "acceptee" ? new Date().toISOString() : null,
      })
      .eq("invitation_token", token);

    if (error) throw new Error(error.message);

    // 2. Si acceptée → mettre à jour parent_eglise_id dans eglises
    if (choice === "acceptee" && invitation.supervisee_eglise_id && invitation.superviseur_eglise_id) {
      const { error: linkError } = await supabase
        .from("eglises")
        .update({ parent_eglise_id: invitation.superviseur_eglise_id })
        .eq("id", invitation.supervisee_eglise_id);

      if (linkError) throw new Error(linkError.message);
    }

    if (choice === "acceptee") {
      setMessage(`Vous êtes maintenant sous la supervision de ${invitation.eglise_denomination} — ${invitation.eglise_nom}`);
    } else if (choice === "refusee") {
      setMessage(`Vous avez refusé l'invitation de ${invitation.eglise_denomination}`);
    } else if (choice === "pending") {
      setMessage("Invitation laissée en attente. Vous pourrez décider plus tard.");
    }

    setTimeout(() => router.push("/"), 3000);

  } catch (err) {
    console.error("Erreur :", err.message);
    setMessage("Une erreur est survenue lors du traitement de l'invitation.");
  } finally {
    setSubmitting(false);
  }
};
  
  if (loading) return <div className="p-10 text-white">Chargement…</div>;
  if (!invitation) return <div className="p-10 text-red-400">Invitation introuvable ou expirée.</div>;

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
          <p><b>Église superviseuse :</b> {invitation.eglise_denomination} — {invitation.eglise_nom}</p>
          <p><b>Branche :</b> {invitation.eglise_branche}</p>
          <p><b>Ville :</b> {invitation.eglise_ville}</p>
          <p><b>Pays :</b> {invitation.eglise_pays}</p>
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
