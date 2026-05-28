"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import supabase from "../lib/supabaseClient";
import { useLang } from "../hooks/useLang";

const translations = {
  fr: {
    title: "Nouveau mot de passe",
    subtitle: "Choisis un nouveau mot de passe pour ton compte.",
    placeholderPassword: "Nouveau mot de passe",
    placeholderConfirm: "Confirmer le mot de passe",
    btnUpdate: "Mettre à jour",
    btnLoading: "Mise à jour...",
    btnLogin: "Retour à la connexion",
    successMsg: "✅ Mot de passe mis à jour. Tu peux te connecter.",
    errorMatch: "❌ Les mots de passe ne correspondent pas.",
    errorShort: "❌ Le mot de passe doit faire au moins 6 caractères.",
    errorSession: "❌ Lien invalide ou expiré. Demande un nouveau lien.",
    errorGeneral: "❌ Erreur lors de la mise à jour.",
  },
  en: {
    title: "New password",
    subtitle: "Choose a new password for your account.",
    placeholderPassword: "New password",
    placeholderConfirm: "Confirm password",
    btnUpdate: "Update password",
    btnLoading: "Updating...",
    btnLogin: "Back to login",
    successMsg: "✅ Password updated. You can now log in.",
    errorMatch: "❌ Passwords do not match.",
    errorShort: "❌ Password must be at least 6 characters.",
    errorSession: "❌ Invalid or expired link. Please request a new one.",
    errorGeneral: "❌ Error updating password.",
  },
};

export default function UpdatePasswordPage() {
  const router = useRouter();
  const { lang, changeLang } = useLang();
  const t = translations[lang];

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [sessionReady, setSessionReady] = useState(false);

  // Supabase injects the session from the URL hash when the user clicks the email link.
  // We listen for the PASSWORD_RECOVERY event to know the session is ready.
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" && session) {
        setSessionReady(true);
      }
    });

    // Also check if there's already an active session (e.g. page reload)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setSessionReady(true);
    });

    return () => listener?.subscription?.unsubscribe();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError(null);

    if (!sessionReady) {
      setError(t.errorSession);
      return;
    }

    if (password.length < 6) {
      setError(t.errorShort);
      return;
    }

    if (password !== confirm) {
      setError(t.errorMatch);
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });

      if (updateError) {
        setError(t.errorGeneral);
        setLoading(false);
        return;
      }

      setSuccess(true);
      // Auto-redirect to login after 2.5s
      setTimeout(() => router.replace("/login"), 2500);
    } catch (err) {
      console.error(err);
      setError(t.errorGeneral);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 via-yellow-50 to-blue-100 p-6">
      <div className="bg-white p-10 rounded-3xl shadow-lg w-full max-w-md flex flex-col items-center">

        {/* LOGO */}
        <h1 className="text-5xl font-handwriting text-black-800 mb-3 flex flex-col sm:flex-row items-center justify-center gap-3">
          <img src="/logo.png" alt="Logo SoulTrack" className="w-12 h-12 object-contain" />
          SoulTrack
        </h1>

        {/* LANG SWITCHER */}
        <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "12px" }}>
          <button onClick={() => changeLang("fr")} title="Français"
            style={{ background: "none", border: "none", cursor: "pointer", padding: 0, opacity: lang === "fr" ? 1 : 0.4, transition: "opacity 0.2s" }}>
            <img src="https://flagcdn.com/w40/fr.png" srcSet="https://flagcdn.com/w80/fr.png 2x" width="32" height="22" alt="Français" style={{ display: "block", borderRadius: "3px" }} />
          </button>
          <button onClick={() => changeLang("en")} title="English"
            style={{ background: "none", border: "none", cursor: "pointer", padding: 0, opacity: lang === "en" ? 1 : 0.4, transition: "opacity 0.2s" }}>
            <img src="https://flagcdn.com/w40/gb.png" srcSet="https://flagcdn.com/w80/gb.png 2x" width="32" height="22" alt="English" style={{ display: "block", borderRadius: "3px" }} />
          </button>
        </div>

        <h2 className="text-xl font-bold text-gray-800 mb-2">{t.title}</h2>
        <p className="text-center text-gray-600 mb-6 text-sm">{t.subtitle}</p>

        {success ? (
          <div className="w-full flex flex-col items-center gap-4">
            <p className="text-green-600 text-center font-medium">{t.successMsg}</p>
            <button
              onClick={() => router.replace("/login")}
              className="mt-2 text-blue-600 underline hover:text-blue-800"
            >
              {t.btnLogin}
            </button>
          </div>
        ) : (
          <form onSubmit={handleUpdate} className="flex flex-col w-full gap-4">
            <input
              type="password"
              placeholder={t.placeholderPassword}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="border border-gray-300 p-3 rounded-lg w-full text-center shadow-sm"
            />
            <input
              type="password"
              placeholder={t.placeholderConfirm}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              className="border border-gray-300 p-3 rounded-lg w-full text-center shadow-sm"
            />

            {error && <p className="text-red-500 text-center text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-green-400 to-blue-400 hover:from-green-500 hover:to-blue-500 text-white font-bold py-3 rounded-2xl shadow-md"
            >
              {loading ? t.btnLoading : t.btnUpdate}
            </button>
          </form>
        )}

        {!success && (
          <button
            onClick={() => router.push("/login")}
            className="mt-4 text-blue-600 underline hover:text-blue-800"
          >
            {t.btnLogin}
          </button>
        )}
      </div>
    </div>
  );
}
