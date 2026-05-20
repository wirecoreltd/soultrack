"use client";

import HeaderPages from "../../components/HeaderPages";
import Footer from "../../components/Footer";
import { useLang } from "../../hooks/useLang";

const translations = {
  fr: {
    title: "Conditions d'utilisation",
    intro: "En utilisant SoulTrack, vous acceptez les conditions suivantes.",
    use: "Utilisation du service",
    useText: "Vous vous engagez à utiliser la plateforme de manière légale et responsable.",
    account: "Comptes",
    accountText: "Vous êtes responsable de la sécurité de votre compte.",
    contact: "Contact",
  },
  en: {
    title: "Terms of Service",
    intro: "By using SoulTrack, you agree to the following terms.",
    use: "Use of Service",
    useText: "You agree to use the platform legally and responsibly.",
    account: "Accounts",
    accountText: "You are responsible for your account security.",
    contact: "Contact",
  },
};

export default function TermsPage() {
  const { lang } = useLang();
  const t = translations[lang];

  return (
    <div className="min-h-screen bg-[#333699] p-6 text-white">
      <HeaderPages />

      <div className="max-w-4xl mx-auto mt-10">
        <h1 className="text-3xl font-bold mb-4 text-blue-300">{t.title}</h1>

        <p className="mb-6 text-white/90">{t.intro}</p>

        <h2 className="text-xl font-semibold text-amber-300">{t.use}</h2>
        <p className="mb-4">{t.useText}</p>

        <h2 className="text-xl font-semibold text-amber-300">{t.account}</h2>
        <p className="mb-4">{t.accountText}</p>

        <h2 className="text-xl font-semibold text-amber-300">{t.contact}</h2>
        <p>support@soultrack.com</p>
      </div>

      <Footer />
    </div>
  );
}
