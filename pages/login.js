"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import supabase from "../lib/supabaseClient";
import { useLang } from "../hooks/useLang";
import { initPushNotifications } from "../lib/pushNotifications";

// ─── TRADUCTIONS ──────────────────────────────────────────────────────────────
const translations = {
  fr: {
    welcome: "Bienvenue sur SoulTrack ! Une plateforme pour garder le contact et suivre chaque membre.",
    placeholderEmail: "Email",
    placeholderPassword: "Mot de passe",
    btnLogin: "Se connecter",
    btnLoading: "Connexion...",
    forgotPassword: "Mot de passe oublié ?",
    createAccount: "Création de compte",
    errorCredentials: "❌ Email ou mot de passe incorrect",
    errorProfile: "❌ Impossible de récupérer le profil",
    errorGeneral: "❌ Erreur lors de la connexion",
  },
  en: {
    welcome: "Welcome to SoulTrack! A platform to stay connected and follow every member.",
    placeholderEmail: "Email",
    placeholderPassword: "Password",
    btnLogin: "Log in",
    btnLoading: "Logging in...",
    forgotPassword: "Forgot password?",
    createAccount: "Create account",
    errorCredentials: "❌ Incorrect email or password",
    errorProfile: "❌ Unable to retrieve profile",
    errorGeneral: "❌ Error during login",
  },
};

export default function LoginPage() {
  const router = useRouter();
  const { lang, changeLang } = useLang();
  const t = translations[lang];

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // ✅ CORRECTIF : tant qu'on ne sait pas si une session existe déjà,
  // on n'affiche RIEN (ni le formulaire, ni un flash) → évite le
  // clignotement du login avant la redirection vers /hub.
  const [checkingSession, setCheckingSession] = useState(true);

  // Vérifie si déjà connecté
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data?.session) {
        router.replace("/hub");
        // Pas besoin de setCheckingSession(false) ici :
        // la redirection est en cours, on reste sur l'écran neutre
        // jusqu'à ce que Next.js démonte cette page.
        return;
      }
      setCheckingSession(false);
    };
    checkSession();
  }, [router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });

      if (authError || !authData.user) {
        setError(t.errorCredentials);
        setLoading(false);
        return;
      }

      const user = authData.user;

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, role, roles, prenom, nom, telephone")
        .eq("id", user.id)
        .single();

      if (profileError) {
        setError(t.errorProfile);
        setLoading(false);
        return;
      }

     const roles = profile.roles || [];
      localStorage.setItem("userRole", JSON.stringify(roles));
      localStorage.setItem("profile", JSON.stringify(profile));
      localStorage.setItem("userEmail", email);
      localStorage.setItem("userId", user.id);

      await initPushNotifications(user.id);      
      
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get("redirect");
      if (redirect) {
        router.replace(redirect);
        return;
      }
      // ← FIN AJOUT
      
      if (roles.length > 1) { router.replace("/hub"); return; }            

      if (roles.includes("ResponsableCellule") || roles.includes("SuperviseurCellule")) {
        router.replace("/cellule/cellules-hub");
      } else if (roles.includes("ResponsableFamilles")) {
        router.replace("/famille/familles-hub");
      } else if (roles.includes("Conseiller")) {
        router.replace("/conseiller/conseiller-hub");
      } else if (roles.includes("ResponsableEvangelisation")) {
        router.replace("/evangelisation/evangelisation-hub");
      } else if (roles.includes("ResponsableIntegration")) {
        router.replace("/membres/membres-hub");
      } else {
        router.replace("/hub");
      }

    } catch (err) {
      console.error(err);
      setError(t.errorGeneral);
    } finally {
      setLoading(false);
    }
  };

  // ✅ CORRECTIF : écran neutre (ou vide) tant qu'on vérifie la session.
  // Remplace ce bloc par un spinner/logo si tu préfères un visuel,
  // mais JAMAIS le formulaire tant que checkingSession est true.
  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 via-yellow-50 to-blue-100">
        <img src="/logo.png" alt="Logo SoulTrack" className="w-14 h-14 object-contain animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 via-yellow-50 to-blue-100 p-6">
      <div className="bg-white p-10 rounded-3xl shadow-lg w-full max-w-md flex flex-col items-center">

        {/* LOGO */}
        <h1 className="text-5xl font-handwriting text-black-800 mb-3 flex flex-col sm:flex-row items-center justify-center gap-3">
          <img src="/logo.png" alt="Logo SoulTrack" className="w-12 h-12 object-contain" />
          SoulTrack
        </h1>

        {/* SWITCHER LANGUE */}
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

        <p className="text-center text-gray-700 mb-6">{t.welcome}</p>

        <form onSubmit={handleLogin} className="flex flex-col w-full gap-4">
          <input
            type="email" placeholder={t.placeholderEmail} value={email}
            onChange={(e) => setEmail(e.target.value)} required
            className="border border-gray-300 p-3 rounded-lg w-full text-center shadow-sm"
          />
          <input
            type="password" placeholder={t.placeholderPassword} value={password}
            onChange={(e) => setPassword(e.target.value)} required
            className="border border-gray-300 p-3 rounded-lg w-full text-center shadow-sm"
          />

          {error && <p className="text-red-500 text-center">{error}</p>}

          <button type="submit" disabled={loading}
            className="bg-gradient-to-r from-green-400 to-blue-400 hover:from-green-500 hover:to-blue-500 text-white font-bold py-3 rounded-2xl shadow-md">
            {loading ? t.btnLoading : t.btnLogin}
          </button>
        </form>

        <button onClick={() => router.push("/reset-password")}
          className="mt-4 text-blue-600 underline hover:text-blue-800">
          {t.forgotPassword}
        </button>

        <button onClick={() => router.push("/SignupEglise")}
          className="mt-4 text-orange-400 underline hover:text-orange-400">
          {t.createAccount}
        </button>
      </div>
    </div>
  );
}
