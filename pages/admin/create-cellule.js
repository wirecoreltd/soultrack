"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import supabase from "../../lib/supabaseClient";
import ProtectedRoute from "../../components/ProtectedRoute";
import FooterHub from "../../components/FooterHub";

// ─── Données pays (drapeaux + noms FR/EN) ──────────────────────────────────
const PAYS_DATA = [
  { code: "af", fr: "Afghanistan", en: "Afghanistan" },
  { code: "za", fr: "Afrique du Sud", en: "South Africa" },
  { code: "dz", fr: "Algérie", en: "Algeria" },
  { code: "de", fr: "Allemagne", en: "Germany" },
  { code: "ao", fr: "Angola", en: "Angola" },
  { code: "sa", fr: "Arabie Saoudite", en: "Saudi Arabia" },
  { code: "ae", fr: "Émirats Arabes Unis", en: "United Arab Emirates" },
  { code: "ar", fr: "Argentine", en: "Argentina" },
  { code: "au", fr: "Australie", en: "Australia" },
  { code: "be", fr: "Belgique", en: "Belgium" },
  { code: "bj", fr: "Bénin", en: "Benin" },
  { code: "br", fr: "Brésil", en: "Brazil" },
  { code: "bf", fr: "Burkina Faso", en: "Burkina Faso" },
  { code: "bi", fr: "Burundi", en: "Burundi" },
  { code: "cm", fr: "Cameroun", en: "Cameroon" },
  { code: "ca", fr: "Canada", en: "Canada" },
  { code: "cl", fr: "Chili", en: "Chile" },
  { code: "cn", fr: "Chine", en: "China" },
  { code: "co", fr: "Colombie", en: "Colombia" },
  { code: "cg", fr: "Congo", en: "Congo" },
  { code: "kr", fr: "Corée du Sud", en: "South Korea" },
  { code: "ci", fr: "Côte d'Ivoire", en: "Ivory Coast" },
  { code: "dk", fr: "Danemark", en: "Denmark" },
  { code: "eg", fr: "Egypte", en: "Egypt" },
  { code: "es", fr: "Espagne", en: "Spain" },
  { code: "us", fr: "États-Unis", en: "United States" },
  { code: "et", fr: "Ethiopie", en: "Ethiopia" },
  { code: "fi", fr: "Finlande", en: "Finland" },
  { code: "fr", fr: "France", en: "France" },
  { code: "ga", fr: "Gabon", en: "Gabon" },
  { code: "gh", fr: "Ghana", en: "Ghana" },
  { code: "gn", fr: "Guinée", en: "Guinea" },
  { code: "ht", fr: "Haïti", en: "Haiti" },
  { code: "in", fr: "Inde", en: "India" },
  { code: "id", fr: "Indonésie", en: "Indonesia" },
  { code: "ie", fr: "Irlande", en: "Ireland" },
  { code: "il", fr: "Israël", en: "Israel" },
  { code: "it", fr: "Italie", en: "Italy" },
  { code: "jp", fr: "Japon", en: "Japan" },
  { code: "ke", fr: "Kenya", en: "Kenya" },
  { code: "lb", fr: "Liban", en: "Lebanon" },
  { code: "lu", fr: "Luxembourg", en: "Luxembourg" },
  { code: "mg", fr: "Madagascar", en: "Madagascar" },
  { code: "ml", fr: "Mali", en: "Mali" },
  { code: "ma", fr: "Maroc", en: "Morocco" },
  { code: "mq", fr: "Martinique", en: "Martinique" },
  { code: "mu", fr: "Maurice", en: "Mauritius" },
  { code: "mr", fr: "Mauritanie", en: "Mauritania" },
  { code: "mx", fr: "Mexique", en: "Mexico" },
  { code: "mz", fr: "Mozambique", en: "Mozambique" },
  { code: "na", fr: "Namibie", en: "Namibia" },
  { code: "ne", fr: "Niger", en: "Niger" },
  { code: "ng", fr: "Nigeria", en: "Nigeria" },
  { code: "no", fr: "Norvège", en: "Norway" },
  { code: "nz", fr: "Nouvelle-Zélande", en: "New Zealand" },
  { code: "ug", fr: "Ouganda", en: "Uganda" },
  { code: "pk", fr: "Pakistan", en: "Pakistan" },
  { code: "nl", fr: "Pays-Bas", en: "Netherlands" },
  { code: "pe", fr: "Pérou", en: "Peru" },
  { code: "ph", fr: "Philippines", en: "Philippines" },
  { code: "pl", fr: "Pologne", en: "Poland" },
  { code: "pt", fr: "Portugal", en: "Portugal" },
  { code: "cd", fr: "RDC", en: "DR Congo" },
  { code: "do", fr: "République Dominicaine", en: "Dominican Republic" },
  { code: "ro", fr: "Roumanie", en: "Romania" },
  { code: "gb", fr: "Royaume-Uni", en: "United Kingdom" },
  { code: "rw", fr: "Rwanda", en: "Rwanda" },
  { code: "sn", fr: "Sénégal", en: "Senegal" },
  { code: "sl", fr: "Sierra Leone", en: "Sierra Leone" },
  { code: "sg", fr: "Singapour", en: "Singapore" },
  { code: "so", fr: "Somalie", en: "Somalia" },
  { code: "sd", fr: "Soudan", en: "Sudan" },
  { code: "se", fr: "Suède", en: "Sweden" },
  { code: "ch", fr: "Suisse", en: "Switzerland" },
  { code: "tz", fr: "Tanzanie", en: "Tanzania" },
  { code: "td", fr: "Tchad", en: "Chad" },
  { code: "tg", fr: "Togo", en: "Togo" },
  { code: "tn", fr: "Tunisie", en: "Tunisia" },
  { code: "tr", fr: "Turquie", en: "Turkey" },
  { code: "ua", fr: "Ukraine", en: "Ukraine" },
  { code: "uy", fr: "Uruguay", en: "Uruguay" },
  { code: "ve", fr: "Venezuela", en: "Venezuela" },
  { code: "vn", fr: "Vietnam", en: "Vietnam" },
  { code: "zw", fr: "Zimbabwe", en: "Zimbabwe" },
];

function getIsoCode(countryName) {
  const found = PAYS_DATA.find((p) => p.fr === countryName || p.en === countryName);
  return found?.code || "un";
}

function CreateCelluleContent() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    nom: "",
    zone: "",
    responsable_id: "",
    responsable_nom: "",
    telephone: "",
    superviseur_id: "",
  });

  const [responsables, setResponsables] = useState([]);
  const [superviseurs, setSuperviseurs] = useState([]);
  const [egliseId, setEgliseId] = useState(null);
  const [egliseInfo, setEgliseInfo] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // ─── Avertissement : responsable déjà assigné à une cellule ─────────────
  const [showResponsableWarning, setShowResponsableWarning] = useState(false);
  const [existingCelluleResponsable, setExistingCelluleResponsable] = useState(null);

  // ─── Contexte utilisateur ─────────────────────────────────────────────────
  useEffect(() => {
    const initContext = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("eglise_id, role")
        .eq("id", user.id)
        .single();

      if (!profile) return;
      setEgliseId(profile.eglise_id);
      setUserRole(profile.role);
      setUserId(user.id);

      // ✅ Si SuperviseurCellule → on met son id automatiquement
      if (profile.role === "SuperviseurCellule") {
        setFormData((prev) => ({ ...prev, superviseur_id: user.id }));
      }
    };

    initContext();
  }, []);

  // ─── Infos église (logo, branche, ville, pays) ────────────────────────────
  useEffect(() => {
    if (!egliseId) return;

    const fetchEglise = async () => {
      const { data, error } = await supabase
        .from("eglises")
        .select("nom, branche, ville, pays, logo_url, denomination")
        .eq("id", egliseId)
        .single();

      if (!error && data) setEgliseInfo(data);
    };

    fetchEglise();
  }, [egliseId]);

  // ─── Responsables + Superviseurs ──────────────────────────────────────────
  useEffect(() => {
    if (!egliseId) return;

    const fetchProfiles = async () => {
      // Responsables de cellule
      const { data: resp } = await supabase
        .from("profiles")
        .select("id, prenom, nom, telephone")
        .eq("role", "ResponsableCellule")
        .eq("eglise_id", egliseId);

      setResponsables(resp || []);

      // Superviseurs de cellule
      const { data: sup } = await supabase
        .from("profiles")
        .select("id, prenom, nom")
        .eq("role", "SuperviseurCellule")
        .eq("eglise_id", egliseId);

      setSuperviseurs(sup || []);
    };

    fetchProfiles();
  }, [egliseId]);

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleResponsableChange = (e) => {
    const selected = responsables.find((r) => r.id === e.target.value);
    setFormData({
      ...formData,
      responsable_id: e.target.value,
      responsable_nom: selected ? `${selected.prenom} ${selected.nom}` : "",
      telephone: selected ? selected.telephone || "" : "",
    });

    // On réinitialise l'avertissement si l'utilisateur change de responsable
    setShowResponsableWarning(false);
    setExistingCelluleResponsable(null);
  };

  const handleAnnulerResponsable = () => {
    setShowResponsableWarning(false);
    setExistingCelluleResponsable(null);
  };

  // ─── Appel API de création (utilisé par les 2 chemins) ────────────────────
  const creerCellule = async () => {
    setLoading(true);
    setMessage("⏳ Création en cours...");

    try {
      const res = await fetch("/api/create-cellule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          eglise_id: egliseId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(`❌ ${data.error}`);
      } else {
        setMessage("✅ Cellule créée avec succès !");
        setFormData({
          nom: "",
          zone: "",
          responsable_id: "",
          responsable_nom: "",
          telephone: "",
          superviseur_id: "",
        });
        setShowResponsableWarning(false);
        setExistingCelluleResponsable(null);
      }
    } catch (err) {
      setMessage("❌ Erreur serveur");
    } finally {
      setLoading(false);
    }
  };

  // ─── Clic sur "Créer" : on vérifie d'abord le responsable ────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!egliseId) {
      setMessage("❌ Contexte église introuvable");
      return;
    }

    if (!formData.responsable_id) {
      setMessage("❌ Veuillez sélectionner un responsable");
      return;
    }

    setLoading(true);
    setMessage("");

    const { data, error } = await supabase
      .from("cellules")
      .select("id, cellule, ville")
      .eq("responsable_id", formData.responsable_id)
      .eq("eglise_id", egliseId);

    if (error) {
      console.error("Erreur vérification responsable déjà assigné :", error);
      setLoading(false);
      setMessage("❌ Erreur lors de la vérification du responsable");
      return;
    }

    if (data && data.length > 0) {
      // Conflit détecté → on bloque la création et on affiche l'avertissement
      setExistingCelluleResponsable(data[0]);
      setShowResponsableWarning(true);
      setLoading(false);
      return;
    }

    // Pas de conflit → création directe
    await creerCellule();
  };

  // ─── Clic sur "Procéder et créer" : on confirme et on crée en un clic ────
  const handleProcederEtCreer = async () => {
    setShowResponsableWarning(false);
    await creerCellule();
  };

  // ─── UI ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-200 via-pink-100 to-yellow-100 p-6">
      <div className="bg-white p-8 rounded-3xl shadow-lg w-full max-w-lg relative">

        <button onClick={() => router.back()} className="absolute top-4 left-4 text-gray-700">
          ← Retour
        </button>

        {/* Logo + infos église */}
        <div className="flex flex-col items-center mb-3 sm:mb-6 gap-2 mt-6">
          {egliseInfo?.logo_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={egliseInfo.logo_url}
              alt={egliseInfo.nom || "Logo"}
              style={{ width: 50, height: 50, objectFit: "contain" }}
            />
          )}

          {(egliseInfo?.denomination || egliseInfo?.nom) && (
            <p className="font-semibold text-base text-[#c31850] text-center w-full break-words px-2">
              {[egliseInfo.denomination, egliseInfo.nom].filter(Boolean).join(" - ")}
            </p>
          )}

          {egliseInfo?.branche && (
            <p className="text-sm text-[#c31850] text-center">{egliseInfo.branche}</p>
          )}

          {(egliseInfo?.ville || egliseInfo?.pays) && (
            <div className="text-sm text-[#c31850] flex items-center justify-center gap-1">
              {egliseInfo?.ville && (
                <span>{egliseInfo.ville}{egliseInfo?.pays ? " •" : ""}</span>
              )}
              {egliseInfo?.pays && (
                <>
                  <img
                    src={`https://flagcdn.com/w20/${getIsoCode(egliseInfo.pays)}.png`}
                    width="20"
                    height="14"
                    alt={egliseInfo.pays}
                  />
                  <span>
                    {(() => {
                      const found = PAYS_DATA.find(
                        (p) => p.fr === egliseInfo.pays || p.en === egliseInfo.pays
                      );
                      return found?.fr || egliseInfo.pays;
                    })()}
                  </span>
                </>
              )}
            </div>
          )}
        </div>

        <h1 className="text-2xl font-bold mt-4 mb-6 text-center text-black">
          Créer une <span className="text-[#333699]">Cellule</span>
        </h1>

        <div className="max-w-3xl w-full mb-6 text-center">
          <p className="italic text-base text-black/90">
            Chaque cellule doit être créée avec un responsable et un superviseur pour guider et soutenir le groupe.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          <input
            name="nom"
            placeholder="Nom de la cellule"
            value={formData.nom}
            onChange={handleChange}
            className="w-full rounded-xl border p-3 text-black"
            required
          />

          <input
            name="zone"
            placeholder="Zone / Localisation"
            value={formData.zone}
            onChange={handleChange}
            className="w-full rounded-xl border p-3 text-black"
            required
          />

          {/* Responsable */}
          <select
            value={formData.responsable_id}
            onChange={handleResponsableChange}
            className="w-full rounded-xl border p-3 text-black"
            required
          >
            <option value="">-- Sélectionnez un responsable --</option>
            {responsables.map((r) => (
              <option key={r.id} value={r.id}>
                {r.prenom} {r.nom}
              </option>
            ))}
          </select>

          {/* Avertissement : responsable déjà assigné à une cellule (déclenché au clic sur Créer) */}
          {showResponsableWarning && (
            <div className="rounded-xl border border-yellow-400 bg-yellow-50 p-4 text-sm text-yellow-800">
              <p className="mb-3">
                ⚠️ Ce responsable est déjà responsable de la cellule «{" "}
                <strong>
                  {existingCelluleResponsable?.ville ? `${existingCelluleResponsable.ville} - ` : ""}
                  {existingCelluleResponsable?.cellule}
                </strong>
                {" "}». Voulez-vous continuer quand même ?
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleAnnulerResponsable}
                  className="flex-1 bg-gray-400 text-white py-2 rounded-xl"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleProcederEtCreer}
                  disabled={loading}
                  className="flex-1 bg-indigo-500 text-white py-2 rounded-xl"
                >
                  {loading ? "Création..." : "Procéder et créer"}
                </button>
              </div>
            </div>
          )}

          {/* Téléphone auto-rempli */}
          {formData.responsable_id && (
            <input
              value={formData.telephone}
              readOnly
              placeholder="Téléphone du responsable"
              className="w-full rounded-xl border p-3 bg-gray-100 text-black"
            />
          )}

          {/* ✅ Superviseur — visible seulement pour l'Administrateur */}
          {userRole === "Administrateur" && (
            <select
              value={formData.superviseur_id}
              onChange={(e) => setFormData({ ...formData, superviseur_id: e.target.value })}
              className="w-full rounded-xl border p-3 text-black"
            >
              <option value="">-- Sélectionnez un superviseur (optionnel) --</option>
              {superviseurs.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.prenom} {s.nom}
                </option>
              ))}
            </select>
          )}

          {/* Boutons standards masqués pendant l'avertissement pour éviter la confusion */}
          {!showResponsableWarning && (
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 bg-gray-400 text-white py-2 rounded-2xl"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-indigo-500 text-white py-2 rounded-2xl"
              >
                {loading ? "Création..." : "Créer"}
              </button>
            </div>
          )}
        </form>

        {message && <p className="mt-4 text-center text-sm">{message}</p>}

        <FooterHub />
      </div>
    </div>
  );
}

export default function CreateCellulePage() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur", "SuperviseurCellule"]}>
      <CreateCelluleContent />
    </ProtectedRoute>
  );
}
