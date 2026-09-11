"use client"; 
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import supabase from "../lib/supabaseClient";
import { useLang } from "../hooks/useLang";
import { initPushNotifications } from "../lib/pushNotifications";
import { Great_Vibes } from "next/font/google";
import { Capacitor } from "@capacitor/core";
import { Keyboard } from "@capacitor/keyboard";
import { Eye, EyeOff } from "lucide-react";

const greatVibes = Great_Vibes({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

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
    errorSuspended: "🚫 Ce compte est suspendu en attente de suppression définitive. Accès bloqué.",
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
    errorSuspended: "🚫 This account is suspended pending permanent deletion. Access blocked.",
  },
};

export default function LoginPage() {
  const router = useRouter();
  const { lang, changeLang } = useLang();
  const t = translations[lang];

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorKey, setErrorKey] = useState(null);
  const [loading, setLoading] = useState(false);

  const [checkingSession, setCheckingSession] = useState(true);

  // ── Gestion manuelle du clavier (edge-to-edge empêche le resize automatique) ──
  const [keyboardPadding, setKeyboardPadding] = useState(0);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const showListener = Keyboard.addListener("keyboardWillShow", (info) => {
      setKeyboardPadding(info.keyboardHeight);
    });
    const hideListener = Keyboard.addListener("keyboardWillHide", () => {
      setKeyboardPadding(0);
    });

    return () => {
      showListener.then((l) => l.remove());
      hideListener.then((l) => l.remove());
    };
  }, []);
  // ── FIN gestion clavier ──

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data?.session) {
        router.replace("/hub");
        return;
      }
      setCheckingSession(false);
    };
    checkSession();
  }, [router]);

  const handleLogin = async (e) => {
  e.preventDefault();
  setErrorKey(null);
  setLoading(true);

  try {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError || !authData.user) {
      setErrorKey("errorCredentials");
      setLoading(false);
      return;
    }

    const user = authData.user;

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, role, roles, prenom, nom, telephone, eglise_id")
      .eq("id", user.id)
      .single();

    if (profileError) {
      setErrorKey("errorProfile");
      setLoading(false);
      return;
    }

    // ── Vérification suspension de l'église (demande de suppression) ──
    if (profile.eglise_id) {
      const { data: eglise } = await supabase
        .from("eglises")
        .select("suspended")
        .eq("id", profile.eglise_id)
        .single();

      if (eglise?.suspended) {
        await supabase.auth.signOut();
        setErrorKey("errorSuspended");
        setLoading(false);
        return;
      }
    }
      // ─────────────────────────────────────────────────────────────────

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
      setErrorKey("errorGeneral");
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div
        className="flex items-center justify-center bg-gradient-to-br from-green-100 via-yellow-50 to-blue-100"
        style={{ minHeight: "100dvh" }}
      >
        <img src="/logo.png" alt="Logo SoulTrack" className="w-14 h-14 object-contain animate-pulse" />
      </div>
    );
  }

  return (
    <div
      className="flex flex-col items-center justify-center p-6 text-center space-y-6 overflow-y-auto"
      style={{
        minHeight: "100dvh",
        paddingBottom: keyboardPadding > 0 ? `${keyboardPadding + 24}px` : undefined,
        background: "linear-gradient(to bottom, #3A48A0 0%, #3A48A0 10%, #405BAF 30%, #3E7DCF 55%, #405BAF 80%, #3A48A0 100%)",
        transition: "padding-bottom 0.2s ease-out",
      }}
    >
      <div className="bg-white p-10 rounded-3xl shadow-lg w-full max-w-md flex flex-col items-center">

        <h1 className="text-5xl text-black-800 mb-3 flex flex-col sm:flex-row items-center justify-center gap-3">
          <img src="/logo.png" alt="Logo SoulTrack" className="w-12 h-12 object-contain" />
          <span className={greatVibes.className}>SoulTrack</span>
        </h1>

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
          <div style={{ position: "relative", width: "100%" }}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder={t.placeholderPassword}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="border border-gray-300 p-3 rounded-lg w-full text-center shadow-sm"
              style={{ paddingRight: "44px" }}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
                display: "flex",
                alignItems: "center",
                color: "#6b7280",
              }}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {errorKey && <p className="text-red-500 text-center">{t[errorKey]}</p>}

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
