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

  useEffect(() => {
    if (!router.isReady) return;

    const fetchInvitation = async () => {
      const { data, error } = await supabase
        .from("eglise_supervisions")
        .select("*")
        .eq("invitation_token", token)
        .single();

      if (error) {
        setMessage("Invitation introuvable");
      } else {
        setInvitation(data);
      }
      setLoading(false);
    };

    if (token) fetchInvitation();
  }, [router.isReady, token]);

  const updateStatus = async (statut) => {
    setActionLoading(true);

    const { error } = await supabase
      .from("eglise_supervisions")
      .update({
        statut,
        approved_at: statut === "acceptee" ? new Date().toISOString() : null,
      })
      .eq("invitation_token", token);

    if (error) {
      setMessage("Erreur mise à jour");
    } else {
      setInvitation((prev) => ({ ...prev, statut }));
      setMessage("Statut mis à jour");
    }

    setActionLoading(false);
  };

  if (loading) return <div className="p-10">Chargement...</div>;
  if (!invitation) return <div className="p-10">{message}</div>;

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md space-y-3">

        <h1 className="text-xl font-bold text-center">
          📩 Invitation de supervision
        </h1>

        <p><b>Église :</b> {invitation.eglise_nom}</p>
        <p><b>Branche :</b> {invitation.eglise_branche}</p>
        <p><b>Responsable :</b> {invitation.responsable_prenom} {invitation.responsable_nom}</p>
        <p><b>Email :</b> {invitation.responsable_email}</p>
        <p><b>Téléphone :</b> {invitation.responsable_telephone}</p>

        <p className="mt-3">
          <b>Statut actuel :</b> {invitation.statut}
        </p>

        {/* TOUJOURS VISIBLE */}
        <div className="flex gap-2 justify-center mt-4">

          <button
            disabled={actionLoading}
            onClick={() => updateStatus("acceptee")}
            className="bg-green-500 text-white px-3 py-2 rounded"
          >
            Accepter
          </button>

          <button
            disabled={actionLoading}
            onClick={() => updateStatus("refusee")}
            className="bg-red-500 text-white px-3 py-2 rounded"
          >
            Refuser
          </button>

          <button
            disabled={actionLoading}
            onClick={() => updateStatus("pending")}
            className="bg-gray-500 text-white px-3 py-2 rounded"
          >
            En attente
          </button>

        </div>

        {message && <p className="text-center mt-3">{message}</p>}
      </div>
    </div>
  );
}
