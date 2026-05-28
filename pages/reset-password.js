"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "../lib/supabaseClient";
import { useLang } from "../hooks/useLang";

const translations = {
  fr: {
    title: "Mot de passe oublié",
    subtitle: "Saisis ton adresse email et on t'enverra un lien pour réinitialiser ton mot de passe.",
    placeholderEmail: "Email",
    btnSend: "Envoyer le lien",
    btnLoading: "Envoi en cours...",
    btnBack: "Retour à la connexion",
    successMsg: "✅ Un lien de réinitialisation a été envoyé à ton adresse email.",
    errorNotFound: "❌ Aucun compte trouvé avec cet email.",
    errorGeneral: "❌ Erreur lors de l'envoi. Réessaie.",
  },
  en: {
    title: "Forgot password",
    subtitle: "Enter your email address and we'll send you a link to reset your password.",
    placeholderEmail: "Email",
    btnSend: "Send reset link",
    btnLoading: "Sending...",
    btnBack: "Back to login",
    successMsg: "✅ A reset link has been sent to your email address.",
    errorNotFound: "❌ No account found with this email.",
    errorGeneral: "❌ Error while sending. Please try again.",
  },
};

export default function ResetPasswordPage() {
  const router = useRouter();
  const { lang, changeLang } = useLang();
  const t = translations[lang];

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleReset = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });

      if (resetError) {
        // Supabase returns a generic error; we show a friendly message
        setError(t.errorGeneral);
        setLoading(false);
        return;
      }

      setSuccess(true);
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
              onClick={() => router.push("/login")}
              className="mt-2 text-blue-600 underline hover:text-blue-800"
            >
              {t.btnBack}
            </button>
          </div>
        ) : (
          <form onSubmit={handleReset} className="flex flex-col w-full gap-4">
            <input
              type="email"
              placeholder={t.placeholderEmail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border border-gray-300 p-3 rounded-lg w-full text-center shadow-sm"
            />

            {error && <p className="text-red-500 text-center text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-green-400 to-blue-400 hover:from-green-500 hover:to-blue-500 text-white font-bold py-3 rounded-2xl shadow-md"
            >
              {loading ? t.btnLoading : t.btnSend}
            </button>
          </form>
        )}

        {!success && (
          <button
            onClick={() => router.push("/login")}
            className="mt-4 text-blue-600 underline hover:text-blue-800"
          >
            {t.btnBack}
          </button>
        )}
      </div>
    </div>
  );
}
