"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import supabase from "../../lib/supabaseClient";
import HeaderPages from "../../components/HeaderPages";
import ProtectedRoute from "../../components/ProtectedRoute";
import Footer from "../../components/Footer";
import { useLang } from "../../hooks/useLang";

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

const translations = {
  fr: {
    loading: "Chargement...",
    pageTitle: "Modifier les informations de l'",
    pageTitleHighlight: "Église",
    pageSubtitle: "Mettez à jour les informations de votre église.",
    pageSubtitleHighlight: "Ces données apparaissent sur l'ensemble de l'application",
    pageSubtitleSuffix: "et sont visibles par tous les membres.",
    noLogo: "Aucun logo",
    logoAlt: "Logo église",
    changeLogo: "Changer le logo — PNG, SVG ou WEBP · Carré · Max 500 Ko",
    cancelLogoChange: "Annuler le changement de logo",
    denomination: "Dénomination",
    churchName: "Nom de l'église",
    branchName: "Nom de la branche",
    city: "Ville",
    country: "Pays",
    searchCountry: "Rechercher un pays...",
    saving: "Sauvegarde...",
    save: "💾 Sauvegarder",
    errorInvalidFormat: "❌ Format invalide. Utilisez PNG, SVG ou WEBP uniquement.",
    errorTooLarge: "❌ Image trop lourde. Maximum 500 Ko.",
    errorNotSquare: "❌ Le logo doit être carré (ex: 200x200, 512x512).",
    savingInProgress: "⏳ Sauvegarde en cours...",
    uploadingLogo: "⏳ Upload du logo...",
    errorUploadLogo: "Erreur upload logo",
    successSaved: "✅ Informations mises à jour avec succès !",
    errorPrefix: "❌ ",
  },
  en: {
    loading: "Loading...",
    pageTitle: "Edit ",
    pageTitleHighlight: "Church Information",
    pageSubtitle: "Update your church's information.",
    pageSubtitleHighlight: "This data appears throughout the entire application",
    pageSubtitleSuffix: "and is visible to all members.",
    noLogo: "No logo",
    logoAlt: "Church logo",
    changeLogo: "Change logo — PNG, SVG or WEBP · Square · Max 500 KB",
    cancelLogoChange: "Cancel logo change",
    denomination: "Denomination",
    churchName: "Church name",
    branchName: "Branch name",
    city: "City",
    country: "Country",
    searchCountry: "Search a country...",
    saving: "Saving...",
    save: "💾 Save",
    errorInvalidFormat: "❌ Invalid format. Please use PNG, SVG or WEBP only.",
    errorTooLarge: "❌ Image too large. Maximum 500 KB.",
    errorNotSquare: "❌ The logo must be square (e.g. 200x200, 512x512).",
    savingInProgress: "⏳ Saving...",
    uploadingLogo: "⏳ Uploading logo...",
    errorUploadLogo: "Logo upload error",
    successSaved: "✅ Information updated successfully!",
    errorPrefix: "❌ ",
  },
};

export default function EditEglise() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur"]}>
      <EditEgliseContent />
    </ProtectedRoute>
  );
}

function EditEgliseContent() {
  const router = useRouter();
  const { lang } = useLang();
  const t = translations[lang];

  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [message, setMessage]   = useState("");
  const [egliseId, setEgliseId] = useState(null);

  // Dropdown pays
  const [paysOpen, setPaysOpen]     = useState(false);
  const [paysSearch, setPaysSearch] = useState("");

  const [formData, setFormData] = useState({
    denomination: "",
    nom: "",
    branche: "",
    ville: "",
    pays: "",
  });

  const [logoUrl, setLogoUrl]         = useState(null);
  const [logoFile, setLogoFile]       = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  useEffect(() => {
    const fetchEglise = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("eglise_id")
        .eq("id", user.id)
        .single();

      if (!profile?.eglise_id) return;
      setEgliseId(profile.eglise_id);

      const { data: eglise } = await supabase
        .from("eglises")
        .select("denomination, nom, branche, ville, pays, logo_url")
        .eq("id", profile.eglise_id)
        .single();

      if (eglise) {
        setFormData({
          denomination: eglise.denomination || "",
          nom:          eglise.nom          || "",
          branche:      eglise.branche      || "",
          ville:        eglise.ville        || "",
          pays:         eglise.pays         || "",
        });
        setLogoUrl(eglise.logo_url || null);
        setLogoPreview(eglise.logo_url || null);
      }

      setLoading(false);
    };

    fetchEglise();
  }, []);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ["image/png", "image/svg+xml", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setMessage(t.errorInvalidFormat);
      e.target.value = "";
      return;
    }

    if (file.size > 500 * 1024) {
      setMessage(t.errorTooLarge);
      e.target.value = "";
      return;
    }

    const img = new window.Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      if (img.width !== img.height) {
        setMessage(t.errorNotSquare);
        e.target.value = "";
        URL.revokeObjectURL(img.src);
        return;
      }
      setLogoFile(file);
      setLogoPreview(img.src);
      setMessage("");
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!egliseId) return;

    setSaving(true);
    setMessage(t.savingInProgress);

    try {
      let newLogoUrl = logoUrl;

      if (logoFile) {
        setMessage(t.uploadingLogo);
        const fd = new FormData();
        fd.append("file", logoFile);
        const uploadRes  = await fetch("/api/upload-logo", { method: "POST", body: fd });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.error || t.errorUploadLogo);
        newLogoUrl = uploadData.url;
      }

      const { error } = await supabase
        .from("eglises")
        .update({
          denomination: formData.denomination,
          nom:          formData.nom,
          branche:      formData.branche,
          ville:        formData.ville,
          pays:         formData.pays,
          logo_url:     newLogoUrl,
        })
        .eq("id", egliseId);

      if (error) throw new Error(error.message);

      setLogoUrl(newLogoUrl);
      setLogoFile(null);
      setLogoPreview(newLogoUrl);
      setMessage(t.successSaved);

    } catch (err) {
      setMessage(t.errorPrefix + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return <p className="text-center mt-10 text-white">{t.loading}</p>;

  return (
    <div className="min-h-screen p-6 bg-[#333699]">
      <HeaderPages />

      <h1 className="text-2xl font-bold mt-8 mb-2 text-center text-white">
        {t.pageTitle}
        <span className="text-emerald-300">{t.pageTitleHighlight}</span>
      </h1>

      <div className="max-w-3xl w-full mb-6 text-center mx-auto">
        <p className="italic text-base text-white/90">
          {t.pageSubtitle}{" "}
          <span className="text-blue-300 font-semibold">{t.pageSubtitleHighlight}</span>{" "}
          {t.pageSubtitleSuffix}
        </p>
      </div>

      <div className="max-w-lg mx-auto bg-white/10 rounded-2xl p-6 flex flex-col gap-4">

        {/* Logo actuel */}
        <div className="flex flex-col items-center gap-3">
          {logoPreview ? (
            <img src={logoPreview} alt={t.logoAlt} className="w-24 h-24 object-contain" />
          ) : (
            <div className="w-24 h-24 rounded-xl bg-white/20 flex items-center justify-center text-white/50 text-sm">
              {t.noLogo}
            </div>
          )}

          <label className="cursor-pointer border border-dashed border-white/40 rounded-xl px-4 py-3 flex flex-col items-center gap-1 hover:bg-white/10 transition w-full">
            <span className="text-2xl">🖼️</span>
            <span className="text-sm text-white/70">{t.changeLogo}</span>
            <input
              type="file"
              accept="image/png,image/svg+xml,image/webp"
              onChange={handleLogoChange}
              className="hidden"
            />
          </label>

          {logoFile && (
            <button
              type="button"
              onClick={() => { setLogoFile(null); setLogoPreview(logoUrl); setMessage(""); }}
              className="text-xs text-red-300 hover:text-red-500 underline"
            >
              {t.cancelLogoChange}
            </button>
          )}
        </div>

        <hr className="border-white/20" />

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          <div className="flex flex-col gap-1">
            <label className="text-white/70 text-sm">{t.denomination}</label>
            <input name="denomination" value={formData.denomination} onChange={handleChange} className="input" required />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-white/70 text-sm">{t.churchName}</label>
            <input name="nom" value={formData.nom} onChange={handleChange} className="input" />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-white/70 text-sm">{t.branchName}</label>
            <input name="branche" value={formData.branche} onChange={handleChange} className="input" />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-white/70 text-sm">{t.city}</label>
            <input name="ville" value={formData.ville} onChange={handleChange} className="input" required />
          </div>

          {/* ── DROPDOWN PAYS CUSTOM ── */}
          <div className="flex flex-col gap-1">
            <label className="text-white/70 text-sm">{t.country}</label>
            <div style={{ position: "relative" }}>

              {/* Bouton trigger */}
              <div
                onClick={() => { setPaysOpen(!paysOpen); setPaysSearch(""); }}
                style={{
                  display: "flex", alignItems: "center", gap: "8px",
                  border: "1px solid rgba(255,255,255,0.2)", borderRadius: "12px",
                  padding: "12px", cursor: "pointer",
                  background: "rgba(255,255,255,0.1)",
                  color: formData.pays ? "white" : "rgba(255,255,255,0.4)",
                }}
              >
                {formData.pays && PAYS[formData.pays] && (
                  <img
                    src={`https://flagcdn.com/w40/${PAYS[formData.pays]}.png`}
                    alt={formData.pays}
                    style={{ width: "24px", height: "16px", borderRadius: "2px", flexShrink: 0 }}
                  />
                )}
                <span style={{ flex: 1, fontSize: "14px" }}>
                  {formData.pays || t.country}
                </span>
                <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px" }}>
                  {paysOpen ? "▲" : "▼"}
                </span>
              </div>

              {/* Dropdown */}
              {paysOpen && (
                <div style={{
                  position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0,
                  background: "#1e2a6e", border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: "12px", boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
                  zIndex: 50, maxHeight: "220px", overflow: "hidden",
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
                        width: "100%", border: "1px solid rgba(255,255,255,0.2)",
                        borderRadius: "8px", padding: "7px 10px", fontSize: "13px",
                        outline: "none", color: "white",
                        background: "rgba(255,255,255,0.1)",
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
                            setFormData({ ...formData, pays: nom });
                            setPaysOpen(false);
                            setPaysSearch("");
                          }}
                          style={{
                            display: "flex", alignItems: "center", gap: "10px",
                            padding: "9px 12px", cursor: "pointer",
                            color: "white", fontSize: "14px",
                            background: formData.pays === nom
                              ? "rgba(255,255,255,0.15)"
                              : "transparent",
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
                          onMouseLeave={(e) => e.currentTarget.style.background = formData.pays === nom ? "rgba(255,255,255,0.15)" : "transparent"}
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
          </div>
          {/* ── FIN DROPDOWN PAYS ── */}

          {message && (
            <p className={`text-center text-sm ${message.startsWith("✅") ? "text-emerald-300" : "text-red-400"}`}>
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="bg-gradient-to-r from-emerald-400 to-blue-400 hover:from-emerald-500 hover:to-blue-500 text-white font-bold py-3 rounded-2xl shadow-md transition"
          >
            {saving ? t.saving : t.save}
          </button>
        </form>
      </div>

      <style jsx>{`
        .input {
          width: 100%;
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 12px;
          padding: 12px;
          background: rgba(255,255,255,0.1);
          color: white;
        }
        .input::placeholder {
          color: rgba(255,255,255,0.4);
        }
      `}</style>

      <Footer />
    </div>
  );
}
