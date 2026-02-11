"use client";

import { useState } from "react";
import supabase from "../lib/supabaseClient";
import Footer from "../components/Footer";

export default function AcceptInvitationPage() {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [invitation, setInvitation] = useState(null);
  const [error, setError] = useState("");

  // Vérifie le token
  const handleCheckToken = async () => {
    if (!token) {
      setError("⚠️ Veuillez saisir un token.");
      return;
    }

    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("eglise_supervisions")
      .select("*")
      .eq("invitation_token", token)
      .eq("statut", "pending")
      .limit(1)
      .single();

    if (error || !data) {
      setError("⚠️ Token invalide, expiré ou déjà utilisé.");
      setInvitation(null);
      setLoading(false);
      return;
    }

    // Si tout est bon, stocke les infos
    setInvitation(data);
    setLoading(false);
  };

  // Accepte l'invitation
  const handleAccept = async () => {
    if (!invitation) return;

    setLoading(true);

    const { error } = await supabase
      .from("eglise_supervisions")
      .update({
        supervisee_eglise_id: invitation.supervisee_eglise_id || invitation.supervisee_eglise_id,
        supervisee_branche_id: invitation.supervisee_branche_id || invitation.supervisee_branche_id,
        statut: "accepted",
        approved_at: new Date().toISOString()
      })
      .eq("id", invitation.id);

    if (error) {
      setError("⚠️ Impossible d'accepter l'invitation : " + error.message);
      setLoading(false);
      return;
    }

    setError("");
    setInvitation({ ...invitation, statut: "accepted" });
    setLoading(false);
    alert("✅ Invitation acceptée avec succès !");
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-3xl shadow-lg">
      {!invitation ? (
        <>
          <h2 className="text-xl font-bold mb-4">Entrer votre token</h2>
          <input
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Token d'invitation"
            className="w-full border rounded-xl px-4 py-3 mb-4"
          />
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <button
            onClick={handleCheckToken}
            className="w-full py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? "Vérification..." : "Valider le token"}
          </button>
        </>
      ) : (
        <>
          <h2 className="text-xl font-bold mb-4">Invitation validée</h2>
          <p className="mb-2">
            <strong>Superviseur :</strong> {invitation.responsable_prenom} {invitation.responsable_nom}
          </p>
          <p className="mb-4">
            <strong>Église :</strong> {invitation.eglise_nom} ({invitation.eglise_branche || "—"})
          </p>
          {invitation.statut === "accepted" ? (
            <p className="text-green-600 font-bold">✅ Cette invitation a déjà été acceptée.</p>
          ) : (
            <button
              onClick={handleAccept}
              className="w-full py-3 bg-green-500 text-white rounded-xl hover:bg-green-600"
              disabled={loading}
            >
              {loading ? "Acceptation..." : "Accepter l'invitation"}
            </button>
          )}
          {error && <p className="text-red-500 mt-4">{error}</p>}
        </>
      )}
<Footer />
    </div>
  );
}
