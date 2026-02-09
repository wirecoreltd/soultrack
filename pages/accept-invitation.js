"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import supabase from "../lib/supabaseClient";

export default function AcceptInvitation() {
  const router = useRouter();
  const { token } = router.query;

  const [invitation, setInvitation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState("");

  /* ================= FETCH INVITATION ================= */
  useEffect(() => {
    if (!router.isReady) return;

    if (!token) {
      setMessage("❌ Token manquant");
      setLoading(false);
      return;
    }

    const fetchInvitation = async () => {
      const { data, error } = await supabase
        .from("eglise_supervisions")
        .select(`
          id,
          statut,
          eglise_nom,
          eglise_branche,
          responsable_prenom,
          responsable_nom,
          responsable_email,
          responsable_telephone
        `)
        .eq("invitation_token", token)
        .single();

      if (error || !data) {
        setMessage("❌ Invitation invalide ou expirée");
        setInvitation(null);
      } else {
        setInvitation(data);
      }

      setLoading(false);
    };

    fetchInvitation();
  }, [router.isReady, token]);

  /* ================= UPDATE STATUS ================= */
  const updateStatus = async (statut) => {
    setActionLoading(true);
    setMessage("");

    const { error } = await supabase
      .from("eglise_supervisions")
      .update({
        statut,
        approved_at: statut === "acceptee" ? new Date().toISOString() : null,
      })
      .eq("invitation_token", token);

    if (error) {
      console.error(error);
      setMessage("❌ Erreur lors de la mise à jour");
    } else {
      setInvitation((prev) => ({ ...prev, statut }));
      setMessage(
        statut === "acceptee"
          ? "✅ Invitation acceptée avec succès"
          : "❌ Invitation refusée"
      );
    }

    setActionLoading(false);
  };

  /* ================= UI ================= */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Chargement...</p>
      </div>
    );
  }

  if (!invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600 font-semibold">{message}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md space-y-4 text-center">
        <h1 className="text-2xl font-bold">📩 Invitation de supervision</h1>

        <div className="text-sm text-gray-700 space-y-1">
          <p>
            <strong>Église :</strong>{" "}
            {invitation.eglise_nom || "—"}
          </p>

          {invitation.eglise_branche && (
            <p>
              <strong>Branche :</strong>{" "}
              {invitation.eglise_branche}
            </p>
          )}

          <p>
            <strong>Responsable :</strong>{" "}
            {invitation.responsable_prenom}{" "}
            {invitation.responsable_nom}
          </p>

          <p>
            <strong>Email :</strong>{" "}
            {invitation.responsable_email}
          </p>

          {invitation.responsable_telephone && (
            <p>
              <strong>Téléphone :</strong>{" "}
              {invitation.responsable_telephone}
            </p>
          )}
        </div>

        <p className="text-sm">
          Statut actuel :{" "}
          <span className="font-semibold capitalize">
            {invitation.statut}
          </span>
        </p>

        {/* ACTIONS */}
        {invitation.statut === "en_attente" && (
          <div className="flex gap-4 justify-center mt-4">
            <button
              disabled={actionLoading}
              onClick={() => updateStatus("acceptee")}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded font-semibold disabled:opacity-50"
            >
              ✅ Accepter
            </button>

            <button
              disabled={actionLoading}
              onClick={() => updateStatus("refusee")}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded font-semibold disabled:opacity-50"
            >
              ❌ Refuser
            </button>
          </div>
        )}

        {invitation.statut !== "en_attente" && (
          <p className="text-sm text-gray-500">
            Cette invitation a déjà été traitée.
          </p>
        )}

        {message && (
          <p className="text-sm font-semibold text-gray-700 mt-3">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
