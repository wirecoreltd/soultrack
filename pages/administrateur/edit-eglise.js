"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import supabase from "../../lib/supabaseClient";
import HeaderPages from "../../components/HeaderPages";
import ProtectedRoute from "../../components/ProtectedRoute";
import Footer from "../../components/Footer";
import { useLang } from "../../hooks/useLang";

// ─── PAYS (code ISO → { fr, en }) ────────────────────────────────────────────
const PAYS_DATA = [
  { code: "af", fr: "Afghanistan",                en: "Afghanistan"              },
  { code: "za", fr: "Afrique du Sud",             en: "South Africa"             },
  { code: "al", fr: "Albanie",                    en: "Albania"                  },
  { code: "dz", fr: "Algérie",                    en: "Algeria"                  },
  { code: "de", fr: "Allemagne",                  en: "Germany"                  },
  { code: "ao", fr: "Angola",                     en: "Angola"                   },
  { code: "sa", fr: "Arabie Saoudite",            en: "Saudi Arabia"             },
  { code: "ae", fr: "Émirats Arabes Unis",        en: "United Arab Emirates"     },
  { code: "ar", fr: "Argentine",                  en: "Argentina"                },
  { code: "au", fr: "Australie",                  en: "Australia"                },
  { code: "at", fr: "Autriche",                   en: "Austria"                  },
  { code: "be", fr: "Belgique",                   en: "Belgium"                  },
  { code: "bj", fr: "Bénin",                      en: "Benin"                    },
  { code: "mm", fr: "Birmanie",                   en: "Myanmar"                  },
  { code: "bo", fr: "Bolivie",                    en: "Bolivia"                  },
  { code: "br", fr: "Brésil",                     en: "Brazil"                   },
  { code: "bf", fr: "Burkina Faso",               en: "Burkina Faso"             },
  { code: "bi", fr: "Burundi",                    en: "Burundi"                  },
  { code: "cm", fr: "Cameroun",                   en: "Cameroon"                 },
  { code: "ca", fr: "Canada",                     en: "Canada"                   },
  { code: "cl", fr: "Chili",                      en: "Chile"                    },
  { code: "cn", fr: "Chine",                      en: "China"                    },
  { code: "co", fr: "Colombie",                   en: "Colombia"                 },
  { code: "cg", fr: "Congo",                      en: "Congo"                    },
  { code: "kr", fr: "Corée du Sud",               en: "South Korea"              },
  { code: "ci", fr: "Côte d'Ivoire",              en: "Ivory Coast"              },
  { code: "cu", fr: "Cuba",                       en: "Cuba"                     },
  { code: "dk", fr: "Danemark",                   en: "Denmark"                  },
  { code: "eg", fr: "Egypte",                     en: "Egypt"                    },
  { code: "es", fr: "Espagne",                    en: "Spain"                    },
  { code: "us", fr: "États-Unis",                 en: "United States"            },
  { code: "et", fr: "Ethiopie",                   en: "Ethiopia"                 },
  { code: "fi", fr: "Finlande",                   en: "Finland"                  },
  { code: "fr", fr: "France",                     en: "France"                   },
  { code: "ga", fr: "Gabon",                      en: "Gabon"                    },
  { code: "gh", fr: "Ghana",                      en: "Ghana"                    },
  { code: "gr", fr: "Grèce",                      en: "Greece"                   },
  { code: "gn", fr: "Guinée",                     en: "Guinea"                   },
  { code: "ht", fr: "Haïti",                      en: "Haiti"                    },
  { code: "hu", fr: "Hongrie",                    en: "Hungary"                  },
  { code: "in", fr: "Inde",                       en: "India"                    },
  { code: "id", fr: "Indonésie",                  en: "Indonesia"                },
  { code: "ir", fr: "Iran",                       en: "Iran"                     },
  { code: "ie", fr: "Irlande",                    en: "Ireland"                  },
  { code: "il", fr: "Israël",                     en: "Israel"                   },
  { code: "it", fr: "Italie",                     en: "Italy"                    },
  { code: "jm", fr: "Jamaïque",                   en: "Jamaica"                  },
  { code: "jp", fr: "Japon",                      en: "Japan"                    },
  { code: "ke", fr: "Kenya",                      en: "Kenya"                    },
  { code: "lb", fr: "Liban",                      en: "Lebanon"                  },
  { code: "lu", fr: "Luxembourg",                 en: "Luxembourg"               },
  { code: "mg", fr: "Madagascar",                 en: "Madagascar"               },
  { code: "ml", fr: "Mali",                       en: "Mali"                     },
  { code: "ma", fr: "Maroc",                      en: "Morocco"                  },
  { code: "mq", fr: "Martinique",                 en: "Martinique"               },
  { code: "mu", fr: "Maurice",                    en: "Mauritius"                },
  { code: "mr", fr: "Mauritanie",                 en: "Mauritania"               },
  { code: "mx", fr: "Mexique",                    en: "Mexico"                   },
  { code: "mz", fr: "Mozambique",                 en: "Mozambique"               },
  { code: "na", fr: "Namibie",                    en: "Namibia"                  },
  { code: "ne", fr: "Niger",                      en: "Niger"                    },
  { code: "ng", fr: "Nigeria",                    en: "Nigeria"                  },
  { code: "no", fr: "Norvège",                    en: "Norway"                   },
  { code: "nz", fr: "Nouvelle-Zélande",           en: "New Zealand"              },
  { code: "ug", fr: "Ouganda",                    en: "Uganda"                   },
  { code: "pk", fr: "Pakistan",                   en: "Pakistan"                 },
  { code: "nl", fr: "Pays-Bas",                   en: "Netherlands"              },
  { code: "pe", fr: "Pérou",                      en: "Peru"                     },
  { code: "ph", fr: "Philippines",                en: "Philippines"              },
  { code: "pl", fr: "Pologne",                    en: "Poland"                   },
  { code: "pt", fr: "Portugal",                   en: "Portugal"                 },
  { code: "cd", fr: "RDC",                        en: "DR Congo"                 },
  { code: "do", fr: "République Dominicaine",     en: "Dominican Republic"       },
  { code: "mu", fr: "Rodrigues",                  en: "Rodrigues"                },
  { code: "ro", fr: "Roumanie",                   en: "Romania"                  },
  { code: "gb", fr: "Royaume-Uni",                en: "United Kingdom"           },
  { code: "rw", fr: "Rwanda",                     en: "Rwanda"                   },
  { code: "sn", fr: "Sénégal",                    en: "Senegal"                  },
  { code: "sl", fr: "Sierra Leone",               en: "Sierra Leone"             },
  { code: "sg", fr: "Singapour",                  en: "Singapore"                },
  { code: "so", fr: "Somalie",                    en: "Somalia"                  },
  { code: "sd", fr: "Soudan",                     en: "Sudan"                    },
  { code: "se", fr: "Suède",                      en: "Sweden"                   },
  { code: "ch", fr: "Suisse",                     en: "Switzerland"              },
  { code: "tz", fr: "Tanzanie",                   en: "Tanzania"                 },
  { code: "td", fr: "Tchad",                      en: "Chad"                     },
  { code: "tg", fr: "Togo",                       en: "Togo"                     },
  { code: "tn", fr: "Tunisie",                    en: "Tunisia"                  },
  { code: "tr", fr: "Turquie",                    en: "Turkey"                   },
  { code: "ua", fr: "Ukraine",                    en: "Ukraine"                  },
  { code: "uy", fr: "Uruguay",                    en: "Uruguay"                  },
  { code: "ve", fr: "Venezuela",                  en: "Venezuela"                },
  { code: "vn", fr: "Vietnam",                    en: "Vietnam"                  },
  { code: "zw", fr: "Zimbabwe",                   en: "Zimbabwe"                 },
];

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
  // formData.pays stocke le CODE ISO (ex: "mu") en interne
  // mais on sauvegarde le NOM FR en base (ex: "Maurice") — identique à signup
  const [paysOpen, setPaysOpen]     = useState(false);
  const [paysSearch, setPaysSearch] = useState("");

  const [formData, setFormData] = useState({
    denomination: "",
    nom: "",
    branche: "",
    ville: "",
    pays: "", // code ISO en interne (ex: "mu")
  });

  const [logoUrl, setLogoUrl]         = useState(null);
  const [logoFile, setLogoFile]       = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  // Pays trié selon la langue active
  const paysTries = [...PAYS_DATA].sort((a, b) => a[lang].localeCompare(b[lang]));

  // Filtre recherche dans fr ET en
  const paysFiltres = paysTries.filter((p) =>
    p[lang].toLowerCase().includes(paysSearch.toLowerCase()) ||
    p.fr.toLowerCase().includes(paysSearch.toLowerCase()) ||
    p.en.toLowerCase().includes(paysSearch.toLowerCase())
  );

  // Objet pays actuellement sélectionné
  const paysSelectionne = PAYS_DATA.find((p) => p.code === formData.pays) || null;

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
        // La BDD stocke le nom FR (ex: "Maurice") → on cherche le code ISO correspondant
        const codeISO = PAYS_DATA.find((p) => p.fr === eglise.pays)?.code || "";

        setFormData({
          denomination: eglise.denomination || "",
          nom:          eglise.nom          || "",
          branche:      eglise.branche      || "",
          ville:        eglise.ville        || "",
          pays:         codeISO,            // code ISO pour le dropdown
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

      // On convertit le code ISO → nom FR avant de sauvegarder en base
      // (cohérent avec signup qui stocke toujours le nom FR)
      const nomFRpays = PAYS_DATA.find((p) => p.code === formData.pays)?.fr || formData.pays;

      const { error } = await supabase
        .from("eglises")
        .update({
          denomination: formData.denomination,
          nom:          formData.nom,
          branche:      formData.branche,
          ville:        formData.ville,
          pays:         nomFRpays,   // ✅ stocké en nom FR, comme signup
          logo_url:     newLogoUrl,
        })
        .eq("id", egliseId);

      if (error) throw new Error(error.message);

      setLogoUrl(newLogoUrl);
      setLogoFile(null);
      setLogoPreview(newLogoUrl);
      setMessage(t.successSaved);

      // ✅ Notifie le HeaderPages de se rafraîchir immédiatement sans reload
      window.dispatchEvent(new CustomEvent("eglise-updated", {
        detail: {
          denomination: formData.denomination,
          nom:          formData.nom,
          branche:      formData.branche,
          ville:        formData.ville,
          pays:         nomFRpays,
          logo_url:     newLogoUrl,
          // On passe aussi le code ISO et le drapeau pour que le header
          // puisse afficher le pavillon directement sans re-fetch
          pays_code:    formData.pays,
          pays_flag:    `https://flagcdn.com/w40/${formData.pays}.png`,
        },
      }));

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

              {/* Trigger */}
              <div
                onClick={() => { setPaysOpen(!paysOpen); setPaysSearch(""); }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: "12px",
                  padding: "12px",
                  cursor: "pointer",
                  background: "rgba(255,255,255,0.1)",
                  color: paysSelectionne ? "white" : "rgba(255,255,255,0.4)",
                }}
              >
                {/* ✅ Drapeau affiché via le code ISO de paysSelectionne */}
                {paysSelectionne && (
                  <img
                    src={`https://flagcdn.com/w40/${paysSelectionne.code}.png`}
                    alt={paysSelectionne[lang]}
                    style={{ width: "24px", height: "16px", borderRadius: "2px", flexShrink: 0 }}
                  />
                )}

                <span style={{ flex: 1, fontSize: "14px" }}>
                  {paysSelectionne ? paysSelectionne[lang] : t.country}
                </span>

                <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px" }}>
                  {paysOpen ? "▲" : "▼"}
                </span>
              </div>

              {/* Dropdown liste */}
              {paysOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 4px)",
                    left: 0,
                    right: 0,
                    background: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "12px",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                    zIndex: 50,
                    maxHeight: "220px",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <div style={{ padding: "8px" }}>
                    <input
                      autoFocus
                      placeholder={t.searchCountry}
                      value={paysSearch}
                      onChange={(e) => setPaysSearch(e.target.value)}
                      style={{
                        width: "100%",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        padding: "7px 10px",
                        fontSize: "13px",
                        outline: "none",
                        color: "black",
                      }}
                    />
                  </div>

                  <div style={{ overflowY: "auto", flex: 1 }}>
                    {paysFiltres.map((pays) => (
                      <div
                        key={`${pays.code}-${pays.fr}`}
                        onClick={() => {
                          // ✅ On stocke le code ISO en interne
                          setFormData({ ...formData, pays: pays.code });
                          setPaysOpen(false);
                          setPaysSearch("");
                        }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          padding: "9px 12px",
                          cursor: "pointer",
                          color: "black",
                          background: formData.pays === pays.code ? "#eff6ff" : "transparent",
                          fontSize: "14px",
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = "#f9fafb"}
                        onMouseLeave={(e) => e.currentTarget.style.background = formData.pays === pays.code ? "#eff6ff" : "transparent"}
                      >
                        <img
                          src={`https://flagcdn.com/w40/${pays.code}.png`}
                          alt={pays[lang]}
                          style={{ width: "24px", height: "16px", borderRadius: "2px", flexShrink: 0 }}
                        />
                        <span style={{ flex: 1 }}>{pays[lang]}</span>
                        {/* Nom dans l'autre langue en gris */}
                        <span style={{ fontSize: "11px", color: "#9ca3af" }}>
                          {lang === "fr" ? pays.en : pays.fr}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* ── FIN DROPDOWN PAYS ── */}

          {message && (
            <p className={`text-center text-sm font-medium ${
              message.startsWith("✅") ? "text-emerald-300" :
              message.startsWith("⏳") ? "text-blue-300" :
              "text-red-400"
            }`}>
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="bg-gradient-to-r from-emerald-400 to-blue-400 hover:from-emerald-500 hover:to-blue-500 text-white font-bold py-3 rounded-2xl shadow-md disabled:opacity-60 transition"
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
        .input:focus {
          outline: none;
          border-color: rgba(255,255,255,0.5);
        }
      `}</style>

      <Footer />
    </div>
  );
}
