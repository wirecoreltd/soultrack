"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "../lib/supabaseClient";
import HeaderPages from "../components/HeaderPages";
import Footer from "../components/Footer";
import { useLang } from "../hooks/useLang";

const translations = {
  fr: {
    titre: "Invitation de l'église",
    titreAccent: "superviseur",
    chargement: "Chargement…",
    introuvable: "Invitation introuvable ou expirée.",
    egliseSuperviseuse: "Église superviseuse",
    branche: "Branche",
    ville: "Ville",
    pays: "Pays",
    statutActuel: "Statut actuel",
    labelDecision: "Votre décision",
    choisir: "-- Choisir --",
    accepter: "Accepter",
    refuser: "Refuser",
    enAttente: "En attente",
    confirmer: "Confirmer",
    envoiEnCours: "Traitement…",
    redirection: "Redirection vers le tableau de bord…",
    erreurTraitement: "Une erreur est survenue lors du traitement de l'invitation.",
    msgAcceptee: (denom, nom) => `Vous êtes maintenant sous la supervision de ${denom} — ${nom}`,
    msgRefusee: (denom) => `Vous avez refusé l'invitation de ${denom}`,
    msgPending: "Invitation laissée en attente. Vous pourrez décider plus tard.",
    statutLabels: {
      pending: "En Attente",
      acceptee: "Acceptée",
      refusee: "Refusée",
      lien_casse: "Lien Cassé",
      expired: "Expirée",
    },
  },
  en: {
    titre: "Invitation from the",
    titreAccent: "supervising church",
    chargement: "Loading…",
    introuvable: "Invitation not found or expired.",
    egliseSuperviseuse: "Supervising church",
    branche: "Branch",
    ville: "City",
    pays: "Country",
    statutActuel: "Current status",
    labelDecision: "Your decision",
    choisir: "-- Choose --",
    accepter: "Accept",
    refuser: "Decline",
    enAttente: "Pending",
    confirmer: "Confirm",
    envoiEnCours: "Processing…",
    redirection: "Redirecting to the dashboard…",
    erreurTraitement: "An error occurred while processing the invitation.",
    msgAcceptee: (denom, nom) => `You are now under the supervision of ${denom} — ${nom}`,
    msgRefusee: (denom) => `You have declined the invitation from ${denom}`,
    msgPending: "Invitation left pending. You can decide later.",
    statutLabels: {
      pending: "Pending",
      acceptee: "Accepted",
      refusee: "Refused",
      lien_casse: "Link Broken",
      expired: "Expired",
    },
  },
};

export default function AcceptInvitation() {
  const router = useRouter();
  const { lang } = useLang();
  const t = translations[lang];

  const [token, setToken] = useState(null);  
  const [invitation, setInvitation] = useState(null);
  const [egliseSuperviseuse, setEgliseSuperviseuse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [choice, setChoice] = useState("");
  const [message, setMessage] = useState("");

  // ── Lire le token depuis l'URL manuellement (compatible App Router) ──
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tok = params.get("token");
    if (tok) setToken(tok);
  }, []);

  // ── Charger l'invitation + remplir supervisee_eglise_id (via RPC sécurisée) ──
  useEffect(() => {
    if (!token) return;

    const fetchAndLink = async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        let egliseId = null;

        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("eglise_id")
            .eq("id", user.id)
            .single();
          egliseId = profile?.eglise_id || null;
        }

        // Appel sécurisé : lit l'invitation par token et remplit
        // supervisee_eglise_id si besoin, sans exposer eglise_supervisions
        // à un accès direct (RLS reste strict sur la table).
        const { data, error } = await supabase.rpc("get_invitation_par_token", {
          p_token: token,
          p_eglise_id: egliseId,
        });

       if (error || !data?.success) {
          setInvitation(null);
          setLoading(false);
          return;
        }

        setInvitation(data.invitation);

        // Récupérer les vraies infos de l'église qui a envoyé l'invitation
        setEgliseSuperviseuse(data.eglise_superviseuse || null);

      } catch (err) {
        
        console.error(err);
        setInvitation(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAndLink();
  }, [token]);

  const getStatusStyle = (statut) => {
    switch (statut?.toLowerCase()) {
      case "acceptee": return { text: "text-green-400", border: "border-green-500" };
      case "refusee": return { text: "text-red-400", border: "border-red-500" };
      case "lien_casse": return { text: "text-gray-400", border: "border-gray-400" };
      case "pending": return { text: "text-orange-400", border: "border-orange-400" };
      default: return { text: "text-white", border: "border-white/20" };
    }
  };

  const getStatusLabel = (statut) =>
    t.statutLabels[statut?.toLowerCase()] || statut;

  const handleSubmit = async () => {
    if (!choice || !invitation) return;
    setSubmitting(true);

    try {
      // Appel sécurisé : met à jour le statut de l'invitation et, si acceptée,
      // met à jour parent_eglise_id dans eglises — le tout côté serveur,
      // sans accès direct depuis le frontend.
      const { data, error } = await supabase.rpc("repondre_invitation_complet", {
        p_token: token,
        p_choice: choice,
      });

      if (error || !data?.success) {
        throw new Error(error?.message || data?.error || "Erreur inconnue");
      }

      if (choice === "acceptee") {
        setMessage(t.msgAcceptee(invitation.eglise_denomination, invitation.eglise_nom));
      } else if (choice === "refusee") {
        setMessage(t.msgRefusee(invitation.eglise_denomination));
      } else if (choice === "pending") {
        setMessage(t.msgPending);
      }

      setTimeout(() => router.push("/"), 3000);

    } catch (err) {
      console.error("Erreur :", err.message);
      setMessage(t.erreurTraitement);
    } finally {
      setSubmitting(false);
    }
  };

  const statusStyle = invitation ? getStatusStyle(invitation.statut) : null;

  return (
    <div className="min-h-screen bg-[#333699] text-white flex flex-col items-center p-4">
      <HeaderPages />

      <div className="w-full flex flex-col items-center mb-6 mt-4">
        <h1 className="text-2xl font-bold text-center text-white">
          {t.titre} <span className="text-emerald-300">{t.titreAccent}</span>
        </h1>
      </div>

      {loading && (
        <div className="w-full max-w-md bg-white/10 p-6 rounded-xl text-center text-white/80 italic">
          {t.chargement}
        </div>
      )}

      {!loading && !invitation && (
        <div className="w-full max-w-md bg-white/10 p-6 rounded-xl text-center text-red-400 font-semibold">
          {t.introuvable}
        </div>
      )}

      {!loading && invitation && (
        <div className="w-full max-w-md bg-white/10 p-6 rounded-xl space-y-4">

          <div className="border-b border-white/20 pb-3 space-y-1">
            <p className="text-xs uppercase tracking-wide text-white/50">
              {t.egliseSuperviseuse}
            </p>
            <p className="text-lg font-semibold text-emerald-300">
              {[egliseSuperviseuse?.denomination, egliseSuperviseuse?.nom].filter(Boolean).join(" — ")}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-y-2 text-sm">
            {egliseSuperviseuse?.branche && (
              <>
                <span className="text-white/50">{t.branche}</span>
                <span>{egliseSuperviseuse.branche}</span>
              </>
            )}
            {egliseSuperviseuse?.ville && (
              <>
                <span className="text-white/50">{t.ville}</span>
                <span>{egliseSuperviseuse.ville}</span>
              </>
            )}
            {egliseSuperviseuse?.pays && (
              <>
                <span className="text-white/50">{t.pays}</span>
                <span>{egliseSuperviseuse.pays}</span>
              </>
            )}
          </div>

          <div className={`flex items-center justify-between border-l-4 ${statusStyle.border} bg-white/5 rounded-lg px-3 py-2`}>
            <span className="text-white/70 text-sm">{t.statutActuel}</span>
            <span className={`font-semibold ${statusStyle.text}`}>
              {getStatusLabel(invitation.statut)}
            </span>
          </div>

          {!message && (
            <>
              <div className="mt-2">
                <label className="block text-sm text-white/70 mb-1">
                  {t.labelDecision}
                </label>
                <select
                  value={choice}
                  onChange={(e) => setChoice(e.target.value)}
                  className="w-full p-2 text-black rounded"
                >
                  <option value="">{t.choisir}</option>
                  <option value="acceptee">{t.accepter}</option>
                  <option value="refusee">{t.refuser}</option>
                  <option value="pending">{t.enAttente}</option>
                </select>
              </div>

              <button
                onClick={handleSubmit}
                disabled={submitting || !choice}
                className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded font-semibold transition-colors disabled:opacity-50"
              >
                {submitting ? t.envoiEnCours : t.confirmer}
              </button>
            </>
          )}

          {message && (
            <div className="mt-4 text-center space-y-2">
              <p className="font-semibold text-lg text-emerald-300">{message}</p>
              <p className="text-sm text-white/50 italic">{t.redirection}</p>
            </div>
          )}
        </div>
      )}

      <Footer />
    </div>
  );
}
