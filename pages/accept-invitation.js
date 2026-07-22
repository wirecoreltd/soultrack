"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "../lib/supabaseClient";
import HeaderPages from "../components/HeaderPages";
import Footer from "../components/Footer";
import { useLang } from "../hooks/useLang";

// ─── PAYS (code interne unique → { fr, en, flagCode }) ───────────────────────
// Même liste que /administrateur/edit-eglise.jsx, utilisée ici pour retrouver
// le drapeau et le nom traduit du pays de l'église superviseuse à partir du
// nom FR stocké en base.
// ⚠️ Idéalement à extraire dans un fichier partagé (ex: /lib/paysData.js)
// pour éviter la duplication entre les deux pages.
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
  { code: "mu", fr: "Maurice",                    en: "Mauritius",  flagCode: "mu" },
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
  { code: "rod", fr: "Rodrigues",                 en: "Rodrigues",  flagCode: "mu" },
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
    retourDashboard: "← Retour au tableau de bord",
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
    retourDashboard: "← Back to dashboard",
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

  // ── Charger l'invitation + l'église superviseuse (via RPC sécurisée) ──
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

        // Appel sécurisé : lit l'invitation par token, remplit supervisee_eglise_id
        // si besoin, et renvoie aussi les infos de l'église superviseuse
        // (contourne le RLS via SECURITY DEFINER, nécessaire car l'invité
        // n'appartient pas encore à cette église).
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

  // Retrouve le pays dans PAYS_DATA à partir du nom FR stocké en base,
  // pour afficher le nom traduit + le drapeau correspondant.
  const paysInfo = egliseSuperviseuse?.pays
    ? PAYS_DATA.find((p) => p.fr === egliseSuperviseuse.pays)
    : null;
  const paysAffiche = paysInfo ? paysInfo[lang] : egliseSuperviseuse?.pays;
  const paysFlagCode = paysInfo?.flagCode || paysInfo?.code;

  const handleSubmit = async () => {
    if (!choice || !invitation) return;
    setSubmitting(true);

    try {
      // Appel sécurisé : met à jour le statut de l'invitation et, si acceptée,
      // met à jour parent_eglise_id dans eglises — le tout côté serveur.
      const { data, error } = await supabase.rpc("repondre_invitation_complet", {
        p_token: token,
        p_choice: choice,
      });

      if (error || !data?.success) {
        throw new Error(error?.message || data?.error || "Erreur inconnue");
      }

      const denomAffichee = egliseSuperviseuse?.denomination || invitation.eglise_denomination;
      const nomAffiche = egliseSuperviseuse?.nom || invitation.eglise_nom;

      if (choice === "acceptee") {
        setMessage(t.msgAcceptee(denomAffichee, nomAffiche));
      } else if (choice === "refusee") {
        setMessage(t.msgRefusee(denomAffichee));
      } else if (choice === "pending") {
        setMessage(t.msgPending);
      }

      setTimeout(() => router.push("/dashboard"), 3000);

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

          <div className="space-y-1.5 text-sm">
            {egliseSuperviseuse?.branche && (
              <div className="flex items-center gap-1.5">
                <span className="text-white/50">{t.branche} :</span>
                <span>{egliseSuperviseuse.branche}</span>
              </div>
            )}
            {egliseSuperviseuse?.ville && (
              <div className="flex items-center gap-1.5">
                <span className="text-white/50">{t.ville} :</span>
                <span>{egliseSuperviseuse.ville}</span>
              </div>
            )}
            {egliseSuperviseuse?.pays && (
              <div className="flex items-center gap-1.5">
                <span className="text-white/50">{t.pays} :</span>
                {paysFlagCode && (
                  <img
                    src={`https://flagcdn.com/w40/${paysFlagCode}.png`}
                    alt={paysAffiche}
                    className="w-5 h-3.5 rounded-sm"
                  />
                )}
                <span>{paysAffiche}</span>
              </div>
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

          {!message && (
            <button
              onClick={() => router.push("/dashboard")}
              className="w-full mt-2 border border-white/30 text-white/80 py-2 rounded font-semibold hover:bg-white/10 transition-colors"
            >
              {t.retourDashboard}
            </button>
          )}
        </div>
      )}

      <Footer />
    </div>
  );
}
