"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useLang } from "../hooks/useLang";

// ─── PAYS ─────────────────────────────────────────────────────────────────────
const PAYS = {
  "Afghanistan": "af", "Afrique du Sud": "za", "Albanie": "al", "Algérie": "dz",
  "Allemagne": "de", "Angola": "ao", "Arabie Saoudite": "sa", "Argentine": "ar",
  "Australie": "au", "Autriche": "at", "Belgique": "be", "Bénin": "bj",
  "Birmanie": "mm", "Bolivie": "bo", "Brésil": "br", "Burkina Faso": "bf",
  "Burundi": "bi", "Cameroun": "cm", "Canada": "ca", "Chili": "cl",
  "Chine": "cn", "Colombie": "co", "Congo": "cg", "Corée du Sud": "kr",
  "Côte d'Ivoire": "ci", "Cuba": "cu", "Danemark": "dk", "Egypte": "eg",
  "Espagne": "es", "États-Unis": "us", "Ethiopie": "et", "Finlande": "fi",
  "France": "fr", "Gabon": "ga", "Ghana": "gh", "Grèce": "gr",
  "Guinée": "gn", "Haïti": "ht", "Hongrie": "hu", "Inde": "in",
  "Indonésie": "id", "Iran": "ir", "Irlande": "ie", "Israël": "il",
  "Italie": "it", "Jamaïque": "jm", "Japon": "jp", "Kenya": "ke",
  "Liban": "lb", "Luxembourg": "lu", "Madagascar": "mg", "Mali": "ml",
  "Maroc": "ma", "Martinique": "mq", "Maurice": "mu", "Mauritanie": "mr",
  "Mexique": "mx", "Mozambique": "mz", "Namibie": "na", "Niger": "ne",
  "Nigeria": "ng", "Norvège": "no", "Nouvelle-Zélande": "nz", "Ouganda": "ug",
  "Pakistan": "pk", "Pays-Bas": "nl", "Pérou": "pe", "Philippines": "ph",
  "Pologne": "pl", "Portugal": "pt", "RDC": "cd", "République Dominicaine": "do",
  "Rodrigues": "mu", "Roumanie": "ro", "Royaume-Uni": "gb", "Rwanda": "rw",
  "Sénégal": "sn", "Sierra Leone": "sl", "Singapour": "sg", "Somalie": "so",
  "Soudan": "sd", "Suède": "se", "Suisse": "ch", "Tanzanie": "tz",
  "Tchad": "td", "Togo": "tg", "Tunisie": "tn", "Turquie": "tr",
  "Ukraine": "ua", "Uruguay": "uy", "Venezuela": "ve", "Vietnam": "vn",
  "Zimbabwe": "zw",
};

// ─── TRADUCTIONS ──────────────────────────────────────────────────────────────
const translations = {
  fr: {
    title: "Créez votre Église et l'administrateur principal pour commencer.",
    planSelected: "Plan sélectionné",
    adminSection: "👤 Compte administrateur",
    logoLabel: "Logo de l'église (optionnel) — PNG, SVG ou WEBP · Carré (ex: 200×200) · Max 500 Ko",
    logoClick: "Cliquez pour choisir une image",
    logoDelete: "Supprimer le logo",
    btnCreate: "Créer l'Église",
    btnCreating: "Création...",
    alreadyAccount: "Déjà un compte ? Connectez-vous",
    errorPassword: "❌ Les mots de passe ne correspondent pas.",
    errorLogo: "❌ Le logo dépasse 500 Ko. Veuillez choisir une image plus petite.",
    errorServer: "❌ Réponse vide du serveur",
    msgUploading: "⏳ Upload du logo...",
    msgCreatingAccount: "⏳ Création du compte...",
    msgCreating: "⏳ Création en cours...",
    msgSuccess: "✅ Église et admin créés avec succès !",
    searchCountry: "Rechercher un pays...",
    fields: {
      denomination: "Dénomination (ex: Église de Christ)",
      nomEglise: "Nom (ex: Centre Missionnaire...)",
      branche: "Branche (ex: Paris Ouest...)",
      ville: "Ville (ex: Paris...)",
      localisation: "Pays",
      adminPrenom: "Prénom de l'Admin",
      adminNom: "Nom de l'Admin",
      adminEmail: "Email de l'Admin",
      adminPassword: "Mot de passe",
      adminConfirmPassword: "Confirmer le mot de passe",
    },
    plans: {
      free:       { label: "🌱 Départ",     range: "0 – 50 membres",        price: "Gratuit"    },
      starter:    { label: "📈 Croissance",  range: "51 – 200 membres",      price: "$19/mois"   },
      vision:     { label: "🔥 Vision",      range: "201 – 500 membres",     price: "$39/mois"   },
      expansion:  { label: "🌍 Expansion",   range: "501 – 1500 membres",    price: "$79/mois"   },
      enterprise: { label: "🔗 Réseaux",     range: "1500+ • Multi-églises", price: "Sur mesure" },
    },
  },
  en: {
    title: "Create your Church and the main administrator to get started.",
    planSelected: "Selected plan",
    adminSection: "👤 Administrator account",
    logoLabel: "Church logo (optional) — PNG, SVG or WEBP · Square (e.g. 200×200) · Max 500 KB",
    logoClick: "Click to choose an image",
    logoDelete: "Remove logo",
    btnCreate: "Create Church",
    btnCreating: "Creating...",
    alreadyAccount: "Already have an account? Log in",
    errorPassword: "❌ Passwords do not match.",
    errorLogo: "❌ Logo exceeds 500 KB. Please choose a smaller image.",
    errorServer: "❌ Empty response from server",
    msgUploading: "⏳ Uploading logo...",
    msgCreatingAccount: "⏳ Creating account...",
    msgCreating: "⏳ Creating...",
    msgSuccess: "✅ Church and admin created successfully!",
    searchCountry: "Search a country...",
    fields: {
      denomination: "Denomination (e.g. Church of Christ)",
      nomEglise: "Name (e.g. Missionary Centre...)",
      branche: "Branch (e.g. West Paris...)",
      ville: "City (e.g. Paris...)",
      localisation: "Country",
      adminPrenom: "Admin first name",
      adminNom: "Admin last name",
      adminEmail: "Admin email",
      adminPassword: "Password",
      adminConfirmPassword: "Confirm password",
    },
    plans: {
      free:       { label: "🌱 Starter",    range: "0 – 50 members",         price: "Free"       },
      starter:    { label: "📈 Growth",      range: "51 – 200 members",       price: "$19/month"  },
      vision:     { label: "🔥 Vision",      range: "201 – 500 members",      price: "$39/month"  },
      expansion:  { label: "🌍 Expansion",   range: "501 – 1500 members",     price: "$79/month"  },
      enterprise: { label: "🔗 Networks",    range: "1500+ • Multi-churches", price: "Custom"     },
    },
  },
};

export default function SignupEglise() {
  const router = useRouter();
  const { lang, changeLang } = useLang();
  const t = translations[lang];

  const [planId, setPlanId] = useState("free");
  const [paysOpen, setPaysOpen] = useState(false);
  const [paysSearch, setPaysSearch] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const plan = params.get("plan");
    if (plan) setPlanId(plan);
    else setPlanId("free");
  }, []);

  const [formData, setFormData] = useState({
    nomEglise: "", denomination: "", ville: "", branche: "",
    localisation: "", adminPrenom: "", adminNom: "",
    adminEmail: "", adminPassword: "", adminConfirmPassword: "",
  });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500 * 1024) { setMessage(t.errorLogo); return; }
    setLogoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setLogoPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.adminPassword !== formData.adminConfirmPassword) {
      setMessage(t.errorPassword);
      return;
    }
    setLoading(true);
    setMessage(t.msgCreating);
    try {
      let logoUrl = null;
      if (logoFile) {
        setMessage(t.msgUploading);
        const fd = new FormData();
        fd.append("file", logoFile);
        const uploadRes = await fetch("/api/upload-logo", { method: "POST", body: fd });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.error || "Erreur upload logo");
        logoUrl = uploadData.url;
      }
      setMessage(t.msgCreatingAccount);
      const res = await fetch("/api/signup-eglise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, logoUrl, planId }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok) {
        setMessage(t.msgSuccess);
        // ← Redirection selon le plan choisi
        if (planId !== "free") {
          router.push(`/login?redirect=/administrateur/subscription?plan=${planId}`);
        } else {
          router.push("/login");
        }
      } else {
        setMessage(`❌ Erreur: ${data?.error || t.errorServer}`);
      }
    } catch (err) {
      setMessage("❌ " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 via-yellow-50 to-blue-100 p-6">
      <div className="bg-white p-10 rounded-3xl shadow-lg w-full max-w-md flex flex-col items-center">

        {/* LOGO + TITRE */}
        <h1 className="text-5xl font-handwriting text-black-800 mb-3 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Image src="/logo.png" alt="Logo SoulTrack" width={48} height={48} />
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

        <p className="text-center text-gray-700 mb-6">{t.title}</p>

        {/* PLAN */}
        <div className="w-full bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-4 text-center">
          <p className="text-xs text-gray-500 mb-1">{t.planSelected}</p>
          <select value={planId} onChange={(e) => setPlanId(e.target.value)}
            className="w-full mt-2 border border-blue-200 rounded-lg p-3 text-center font-semibold text-blue-700 bg-white">
            {Object.entries(t.plans).map(([key, plan]) => (
              <option key={key} value={key}>{plan.label}</option>
            ))}
          </select>
          <div className="mt-3 bg-white border border-blue-100 rounded-xl p-4 text-center shadow-sm">
            <p className="text-sm text-gray-500 mt-1">{t.plans[planId]?.range}</p>
            <p className="text-2xl font-extrabold text-green-600 mt-2">{t.plans[planId]?.price}</p>
          </div>
        </div>

        {/* FORMULAIRE */}
        <form onSubmit={handleSubmit} className="flex flex-col w-full gap-4">

          {/* Champs église */}
          {[
            { name: "denomination", required: true },
            { name: "nomEglise" },
            { name: "branche" },
            { name: "ville", required: true },
          ].map(({ name, required }) => (
            <input key={name} name={name} placeholder={t.fields[name]}
              value={formData[name]} onChange={handleChange}
              className="input" required={required} />
          ))}

          {/* ── DROPDOWN PAYS CUSTOM ── */}
          <div style={{ position: "relative" }}>
            {/* Bouton trigger */}
            <div
              onClick={() => { setPaysOpen(!paysOpen); setPaysSearch(""); }}
              style={{
                display: "flex", alignItems: "center", gap: "8px",
                border: "1px solid #ccc", borderRadius: "12px", padding: "12px",
                cursor: "pointer", background: "#fff",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                color: formData.localisation ? "black" : "#9ca3af",
              }}
            >
              {formData.localisation && PAYS[formData.localisation] && (
                <img
                  src={`https://flagcdn.com/w40/${PAYS[formData.localisation]}.png`}
                  alt={formData.localisation}
                  style={{ width: "24px", height: "16px", borderRadius: "2px", flexShrink: 0 }}
                />
              )}
              <span style={{ flex: 1, fontSize: "14px" }}>
                {formData.localisation || t.fields.localisation}
              </span>
              <span style={{ color: "#9ca3af", fontSize: "12px" }}>{paysOpen ? "▲" : "▼"}</span>
            </div>

            {/* Dropdown */}
            {paysOpen && (
              <div style={{
                position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0,
                background: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px",
                boxShadow: "0 8px 24px rgba(0,0,0,0.12)", zIndex: 50,
                maxHeight: "220px", overflow: "hidden",
                display: "flex", flexDirection: "column",
              }}>
                {/* Recherche */}
                <div style={{ padding: "8px" }}>
                  <input
                    autoFocus
                    placeholder={t.searchCountry}
                    value={paysSearch}
                    onChange={(e) => setPaysSearch(e.target.value)}
                    style={{
                      width: "100%", border: "1px solid #e5e7eb", borderRadius: "8px",
                      padding: "7px 10px", fontSize: "13px", outline: "none", color: "black",
                    }}
                  />
                </div>

                {/* Liste */}
                <div style={{ overflowY: "auto", flex: 1 }}>
                  {Object.entries(PAYS)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .filter(([nom]) => nom.toLowerCase().includes(paysSearch.toLowerCase()))
                    .map(([nom, code]) => (
                      <div
                        key={`${nom}-${code}`}
                        onClick={() => {
                          setFormData({ ...formData, localisation: nom });
                          setPaysOpen(false);
                          setPaysSearch("");
                        }}
                        style={{
                          display: "flex", alignItems: "center", gap: "10px",
                          padding: "9px 12px", cursor: "pointer", color: "black",
                          background: formData.localisation === nom ? "#eff6ff" : "transparent",
                          fontSize: "14px",
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = "#f9fafb"}
                        onMouseLeave={(e) => e.currentTarget.style.background = formData.localisation === nom ? "#eff6ff" : "transparent"}
                      >
                        <img
                          src={`https://flagcdn.com/w40/${code}.png`}
                          alt={nom}
                          style={{ width: "24px", height: "16px", borderRadius: "2px", flexShrink: 0 }}
                        />
                        {nom}
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
          {/* ── FIN DROPDOWN PAYS ── */}

          <hr className="my-2 border-gray-300" />
          <p className="text-sm text-gray-500 font-semibold -mb-1">{t.adminSection}</p>

          {[
            { name: "adminPrenom", type: "text", required: true },
            { name: "adminNom", type: "text", required: true },
            { name: "adminEmail", type: "email", required: true },
            { name: "adminPassword", type: "password", required: true },
            { name: "adminConfirmPassword", type: "password", required: true },
          ].map(({ name, type, required }) => (
            <input key={name} type={type} name={name} placeholder={t.fields[name]}
              value={formData[name]} onChange={handleChange}
              className="input" required={required} />
          ))}

          {/* LOGO */}
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-600 font-medium">{t.logoLabel}</label>
            <label className="cursor-pointer border border-dashed border-gray-400 rounded-xl p-4 flex flex-col items-center gap-2 hover:bg-gray-50 transition">
              {logoPreview ? (
                <img src={logoPreview} alt="Aperçu logo" className="max-h-[200px] max-w-[250px] object-contain rounded-lg" />
              ) : (
                <>
                  <span className="text-3xl">🖼️</span>
                  <span className="text-sm text-gray-500">{t.logoClick}</span>
                </>
              )}
              <input type="file" accept="image/png,image/svg+xml,image/webp" onChange={handleLogoChange} className="hidden" />
            </label>
            {logoPreview && (
              <button type="button" onClick={() => { setLogoFile(null); setLogoPreview(null); }}
                className="text-xs text-red-400 hover:text-red-600 underline self-end">
                {t.logoDelete}
              </button>
            )}
          </div>

          {message && (
            <p className={`text-center text-sm font-medium ${message.startsWith("✅") ? "text-green-600" : message.startsWith("⏳") ? "text-blue-500" : "text-red-500"}`}>
              {message}
            </p>
          )}

          <button type="submit" disabled={loading}
            className="bg-gradient-to-r from-green-400 to-blue-400 hover:from-green-500 hover:to-blue-500 text-white font-bold py-3 rounded-2xl shadow-md disabled:opacity-60 transition">
            {loading ? t.btnCreating : t.btnCreate}
          </button>
        </form>

        <button onClick={() => router.push("/login")}
          className="mt-4 text-blue-600 underline hover:text-blue-800 text-sm">
          {t.alreadyAccount}
        </button>

        <style jsx>{`
          .input { width: 100%; border: 1px solid #ccc; border-radius: 12px; padding: 12px; text-align: left; box-shadow: 0 1px 3px rgba(0,0,0,0.1); color: black; }
          .input:focus { outline: none; border-color: #2E3192; }
        `}</style>
      </div>
    </div>
  );
}
