"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import supabase from "../lib/supabaseClient";
import HeaderPages from "../components/HeaderPages";

export default function AcceptInvitation() {
  const router = useRouter();
  const { token } = router.query;

  const [invitation, setInvitation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [finalMessage, setFinalMessage] = useState("");

  useEffect(() => {
    if (!router.isReady) return;

    const fetchInvitation = async () => {
      const { data, error } = await supabase
        .from("eglise_supervisions")
        .select("*")
        .eq("invitation_token", token)
        .single();

      if (!error) setInvitation(data);
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

    if (!error) {
      setInvitation((prev) => ({ ...prev, statut }));

      if (statut === "acceptee") {
        setFinalMessage(
          `Vous êtes maintenant sous la supervision de ${invitation.eglise_nom}`
        );
      }

      if (statut === "refusee") {
        setFinalMessage(
          `Vous avez refusé l’invitation de ${invitation.eglise_nom}`
        );
      }

      if (statut === "pending") {
        setFinalMessage(
          "L’invitation est toujours en attente. Vous pouvez décider plus tard."
        );
      }
    }

    setActionLoading(false);
  };

  if (loading) return <div className="p-10">Chargement...</div>;
  if (!invitation) return <div className="p-10">Invitation introuvable</div>;

  return (
    <div className="min-h-screen bg-[#333699] flex flex-col items-center p-6">

      <HeaderPages />

      <h1 className="text-3xl text-white font-bold mt-4 mb-4">
        Invitation de supervision d’église
      </h1>

      <button
        onClick={() => router.push("/index")}
        className="mb-6 bg-white text-[#333699] px-4 py-2 rounded-xl font-semibold"
      >
        ⬅ Retour Dashboard
      </button>

      <div className="bg-white rounded-3xl shadow-xl p-6 max-w-md w-full space-y-3">

        <p><b>Église :</b> {invitation.eglise_nom}</p>
        <p><b>Branche :</b> {invitation.eglise_branche}</p>
        <p><b>Responsable :</b> {invitation.responsable_prenom} {invitation.responsable_nom}</p>
        <p><b>Email :</b> {invitation.responsable_email}</p>
        <p><b>Téléphone :</b> {invitation.responsable_telephone}</p>

        <p className="mt-2">
          <b>Statut actuel :</b> {invitation.statut}
        </p>

        {!finalMessage && (
          <div className="flex gap-2 justify-center mt-4">

            <button
              disabled={actionLoading}
              onClick={() => updateStatus("acceptee")}
              className="bg-green-500 text-white px-4 py-2 rounded-xl font-semibold"
            >
              Accepter
            </button>

            <button
              disabled={actionLoading}
              onClick={() => updateStatus("refusee")}
              className="bg-red-500 text-white px-4 py-2 rounded-xl font-semibold"
            >
              Refuser
            </button>

            <button
              disabled={actionLoading}
              onClick={() => updateStatus("pending")}
              className="bg-gray-400 text-white px-4 py-2 rounded-xl font-semibold"
            >
              En attente
            </button>

          </div>
        )}

        {finalMessage && (
          <div className="mt-6 text-center font-semibold text-lg">
            {finalMessage}
          </div>
        )}

      </div>
    </div>
  );
}
