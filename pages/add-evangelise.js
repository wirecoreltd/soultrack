"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import supabase from "../lib/supabaseClient";

export default function AddEvangelise({ onNewEvangelise }) {
  const router = useRouter();
  const { token } = router.query;

  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    telephone: "",
    ville: "",
    statut: "evangelisé",
    sexe: "",
    age: "",
    priere_salut: "",
    type_conversion: "",
    besoin: [],
    infos_supplementaires: "",
    is_whatsapp: false,
    eglise_id: null,
    branche_id: null,
    type_evangelisation: "",
  });

  const [showOtherField, setShowOtherField] = useState(false);
  const [otherBesoin, setOtherBesoin] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false); // ✅ fix: was true, blocked render without token
  const [errorMsg, setErrorMsg] = useState("");

  const besoinsList = [
    "Finances", "Santé", "Travail / Études", "Famille / Enfants",
    "Relations / Conflits", "Addictions / Dépendances", "Guidance spirituelle",
    "Logement / Sécurité", "Communauté / Isolement", "Dépression / Santé mentale",
  ];

  useEffect(() => {
    const fetchUserEglise = async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) return;

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("eglise_id, branche_id")
        .eq("id", session.session.user.id)
        .single();

      if (!error && profile) {
        setFormData((prev) => ({
          ...prev,
          eglise_id: profile.eglise_id,
          branche_id: profile.branche_id,
        }));
      } else {
        console.error("Erreur récupération eglise/branche :", error?.message);
      }
    };
    fetchUserEglise();
  }, []);

  useEffect(() => {
    if (!token) return;

    const verifyToken = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("access_tokens")
        .select("*")
        .eq("token", token)
        .gte("expires_at", new Date().toISOString())
        .single();

      if (error || !data) setErrorMsg("Lien invalide ou expiré.");
      setLoading(false);
    };

    verifyToken();
  }, [token]);

  const handleBesoinChange = (value) => {
    let updated = [...formData.besoin];
    if (updated.includes(value)) updated = updated.filter((b) => b !== value);
    else updated.push(value);
    setFormData({ ...formData, besoin: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.eglise_id || !formData.branche_id) {
      alert("Erreur : votre compte n'est pas rattaché à une église ou branche.");
      return;
    }

    const finalBesoins = [...formData.besoin];
    if (showOtherField && otherBesoin.trim()) finalBesoins.push(otherBesoin.trim());

    const finalData = {
      nom: formData.nom.trim(),
      prenom: formData.prenom.trim(),
      telephone: formData.telephone.trim() || "",
      ville: formData.ville.trim() || null,
      statut: "evangelisé",
      sexe: formData.sexe || null,
      age: formData.age || null,
      priere_salut: formData.priere_salut === "Oui",
      type_conversion: formData.priere_salut === "Oui" ? formData.type_conversion || null : null,
      besoin: finalBesoins,
      infos_supplementaires: formData.infos_supplementaires || null,
      is_whatsapp: formData.is_whatsapp,
      eglise_id: formData.eglise_id,
      branche_id: formData.branche_id,
      type_evangelisation: formData.type_evangelisation,
    };

    try {
      const { data: newEvangelise, error: insertError } = await supabase
        .from("evangelises")
        .insert([finalData])
        .select()
        .single();

      if (insertError) {
        alert(insertError.message);
        return;
      }

      const today = new Date().toISOString().slice(0, 10);

      const { data: existingReport, error: reportError } = await supabase
        .from("rapport_evangelisation")
        .select("*")
        .eq("date", today)
        .eq("eglise_id", formData.eglise_id)
        .eq("branche_id", formData.branche_id)
        .eq("type_evangelisation", formData.type_evangelisation)
        .single();

      if (reportError && reportError.code !== "PGRST116") {
        console.error("ERREUR RAPPORT :", reportError);
      }

      if (existingReport) {
        await supabase
          .from("rapport_evangelisation")
          .update({
            hommes: existingReport.hommes + (formData.sexe === "Homme" ? 1 : 0),
            femmes: existingReport.femmes + (formData.sexe === "Femme" ? 1 : 0),
            priere: existingReport.priere + (formData.priere_salut === "Oui" ? 1 : 0),
            nouveau_converti: existingReport.nouveau_converti + (formData.type_conversion === "Nouveau converti" ? 1 : 0),
            reconciliation: existingReport.reconciliation + (formData.type_conversion === "Réconciliation" ? 1 : 0),
            type_evangelisation: formData.type_evangelisation,
          })
          .eq("date", today)
          .eq("eglise_id", formData.eglise_id)
          .eq("branche_id", formData.branche_id);
      } else {
        await supabase
          .from("rapport_evangelisation")
          .insert([{
            date: today,
            hommes: formData.sexe === "Homme" ? 1 : 0,
            femmes: formData.sexe === "Femme" ? 1 : 0,
            priere: formData.priere_salut === "Oui" ? 1 : 0,
            nouveau_converti: formData.type_conversion === "Nouveau converti" ? 1 : 0,
            reconciliation: formData.type_conversion === "Réconciliation" ? 1 : 0,
            eglise_id: formData.eglise_id,
            branche_id: formData.branche_id,
            type_evangelisation: formData.type_evangelisation,
          }]);
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);

      setFormData((prev) => ({
        nom: "",
        prenom: "",
        telephone: "",
        ville: "",
        statut: "evangelisé",
        sexe: "",
        age: "",
        priere_salut: "",
        type_conversion: "",
        besoin: [],
        infos_supplementaires: "",
        is_whatsapp: false,
        eglise_id: prev.eglise_id,
        branche_id: prev.branche_id,
        type_evangelisation: prev.type_evangelisation,
      }));
      setShowOtherField(false);
      setOtherBesoin("");
    } catch (err) {
      console.error("ERREUR GLOBALE :", err);
      alert(err.message);
    }
  };

  const handleCancel = () => {
    setFormData((prev) => ({
      nom: "",
      prenom: "",
      telephone: "",
      ville: "",
      statut: "evangelisé",
      sexe: "",
      age: "",
      priere_salut: "",
      type_conversion: "",
      besoin: [],
      infos_supplementaires: "",
      is_whatsapp: false,
      eglise_id: prev.eglise_id,
      branche_id: prev.branche_id,
      type_evangelisation: prev.type_evangelisation,
    }));
    setShowOtherField(false);
    setOtherBesoin("");
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-pink-50 to-yellow-50">
      <p className="text-center text-gray-500 text-sm animate-pulse px-4">Vérification du lien...</p>
    </div>
  );

  if (errorMsg) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-pink-50 to-yellow-50 px-4">
      <p className="text-center text-red-600 text-sm font-medium">{errorMsg}</p>
    </div>
  );

  return (
    <>
      {/* ── Global mobile-first styles ── */}
      <style jsx global>{`
        *, *::before, *::after { box-sizing: border-box; }

        body {
          margin: 0;
          -webkit-text-size-adjust: 100%;
          font-family: 'Segoe UI', system-ui, sans-serif;
        }

        /* Prevent iOS zoom on focus */
        input, select, textarea {
          font-size: 16px !important;
        }

        .st-page {
          min-height: 100dvh;
          min-height: 100vh;
          background: linear-gradient(135deg, #ede9fe 0%, #fce7f3 50%, #fef9c3 100%);
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: 16px;
        }

        .st-card {
          width: 100%;
          max-width: 480px;
          background: #fff;
          border-radius: 24px;
          box-shadow: 0 8px 40px rgba(99, 60, 180, 0.12);
          padding: 24px 20px 32px;
          margin: 0 auto;
        }

        @media (min-width: 640px) {
          .st-page  { padding: 32px 16px; align-items: center; }
          .st-card  { padding: 36px 32px; }
        }

        .st-logo   { display: flex; justify-content: center; margin-bottom: 18px; }
        .st-title  {
          font-size: clamp(1.25rem, 5vw, 1.6rem);
          font-weight: 700;
          text-align: center;
          color: #1e1b4b;
          margin: 0 0 20px;
          line-height: 1.3;
        }

        .st-form   { display: flex; flex-direction: column; gap: 12px; text-align: left; }

        /* ── Field label / section ── */
        .st-section-label {
          font-weight: 600;
          font-size: 0.9rem;
          color: #374151;
          margin: 4px 0 6px;
        }

        /* ── Inputs & selects ── */
        .st-input {
          width: 100%;
          padding: 13px 14px;
          border-radius: 14px;
          border: 1.5px solid #e5e7eb;
          background: #f9fafb;
          color: #111827;
          transition: border-color .2s, box-shadow .2s;
          outline: none;
          appearance: none;
          -webkit-appearance: none;
        }
        .st-input:focus {
          border-color: #818cf8;
          box-shadow: 0 0 0 3px rgba(129, 140, 248, .2);
          background: #fff;
        }
        .st-input::placeholder { color: #9ca3af; }

        /* Select arrow */
        .st-select-wrap { position: relative; }
        .st-select-wrap::after {
          content: "▾";
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
          color: #6b7280;
          font-size: 0.85rem;
        }
        .st-select-wrap .st-input { padding-right: 36px; cursor: pointer; }

        textarea.st-input { resize: vertical; min-height: 80px; }

        /* ── Checkbox row ── */
        .st-checkbox-row {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          border-radius: 14px;
          border: 1.5px solid #e5e7eb;
          background: #f9fafb;
          cursor: pointer;
          transition: border-color .2s;
          user-select: none;
        }
        .st-checkbox-row:hover { border-color: #a5b4fc; }
        .st-checkbox-row input[type="checkbox"] {
          width: 18px;
          height: 18px;
          accent-color: #6366f1;
          cursor: pointer;
          flex-shrink: 0;
        }
        .st-checkbox-row span { font-size: 0.9rem; color: #374151; }

        /* Besoins grid – 2 cols on wider screens */
        .st-besoins-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 8px;
        }
        @media (min-width: 400px) {
          .st-besoins-grid { grid-template-columns: 1fr 1fr; }
        }

        /* ── Buttons ── */
        .st-btn-row { display: flex; gap: 10px; margin-top: 8px; }
        .st-btn {
          flex: 1;
          padding: 14px 12px;
          border: none;
          border-radius: 16px;
          font-size: 0.95rem;
          font-weight: 700;
          cursor: pointer;
          transition: transform .15s, box-shadow .15s, opacity .15s;
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
        }
        .st-btn:active { transform: scale(0.97); }

        .st-btn-cancel {
          background: #e5e7eb;
          color: #374151;
        }
        .st-btn-cancel:hover { background: #d1d5db; }

        .st-btn-submit {
          background: linear-gradient(135deg, #6366f1, #4f46e5);
          color: #fff;
          box-shadow: 0 4px 14px rgba(99, 102, 241, .4);
        }
        .st-btn-submit:hover { opacity: .9; transform: translateY(-1px); box-shadow: 0 6px 18px rgba(99, 102, 241, .45); }

        /* ── Success toast ── */
        .st-success {
          margin-top: 16px;
          padding: 12px 16px;
          border-radius: 14px;
          background: #d1fae5;
          color: #065f46;
          font-weight: 600;
          font-size: 0.9rem;
          text-align: center;
          animation: fadeIn .3s ease;
        }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }

        /* ── Divider ── */
        .st-divider {
          height: 1px;
          background: #f3f4f6;
          margin: 4px 0;
        }
      `}</style>

      <div className="st-page">
        <div className="st-card">

          {/* Logo */}
          <div className="st-logo">
            <Image src="/logo.png" alt="SoulTrack Logo" width={70} height={70} />
          </div>

          <h1 className="st-title">Ajouter une personne évangélisée</h1>

          <form onSubmit={handleSubmit} className="st-form" noValidate>

            {/* Type d'évangélisation */}
            <div className="st-select-wrap">
              <select
                className="st-input"
                value={formData.type_evangelisation}
                onChange={(e) => setFormData({ ...formData, type_evangelisation: e.target.value })}
                required
              >
                <option value="">Type d'Évangélisation</option>
                <option value="Sortie de groupe">Sortie de groupe</option>
                <option value="Campagne d'évangélisation">Campagne d'évangélisation</option>
                <option value="Évangélisation de rue">Évangélisation de rue</option>
                <option value="Évangélisation maison">Évangélisation maison</option>
                <option value="Évangélisation stade">Évangélisation stade</option>
              </select>
            </div>

            <div className="st-divider" />

            {/* Civilité */}
            <div className="st-select-wrap">
              <select
                className="st-input"
                value={formData.sexe}
                onChange={(e) => setFormData({ ...formData, sexe: e.target.value })}
                required
              >
                <option value="">Civilité</option>
                <option value="Homme">Homme</option>
                <option value="Femme">Femme</option>
              </select>
            </div>

            {/* Prénom + Nom – side by side on wider screens */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <input
                className="st-input"
                type="text"
                placeholder="Prénom"
                value={formData.prenom}
                onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                required
                autoComplete="given-name"
              />
              <input
                className="st-input"
                type="text"
                placeholder="Nom"
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                required
                autoComplete="family-name"
              />
            </div>

            {/* Tranche d'âge */}
            <div className="st-select-wrap">
              <select
                className="st-input"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              >
                <option value="">Tranche d'âge</option>
                <option value="12-17 ans">12-17 ans</option>
                <option value="18-25 ans">18-25 ans</option>
                <option value="26-30 ans">26-30 ans</option>
                <option value="31-40 ans">31-40 ans</option>
                <option value="41-55 ans">41-55 ans</option>
                <option value="56-69 ans">56-69 ans</option>
                <option value="70 ans et plus">70 ans et plus</option>
              </select>
            </div>

            {/* Téléphone + Ville – side by side */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <input
                className="st-input"
                type="tel"
                placeholder="Téléphone"
                value={formData.telephone}
                onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                autoComplete="tel"
                inputMode="tel"
              />
              <input
                className="st-input"
                type="text"
                placeholder="Ville"
                value={formData.ville}
                onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
                autoComplete="address-level2"
              />
            </div>

            {/* WhatsApp */}
            <label className="st-checkbox-row">
              <input
                type="checkbox"
                checked={formData.is_whatsapp}
                onChange={(e) => setFormData({ ...formData, is_whatsapp: e.target.checked })}
              />
              <span>📱 Disponible sur WhatsApp</span>
            </label>

            <div className="st-divider" />

            {/* Prière du salut */}
            <div className="st-select-wrap">
              <select
                className="st-input"
                value={formData.priere_salut}
                required
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData({
                    ...formData,
                    priere_salut: value,
                    type_conversion: value === "Oui" ? formData.type_conversion : "",
                  });
                }}
              >
                <option value="">Prière du salut ?</option>
                <option value="Oui">Oui ✓</option>
                <option value="Non">Non</option>
              </select>
            </div>

            {formData.priere_salut === "Oui" && (
              <div className="st-select-wrap">
                <select
                  className="st-input"
                  value={formData.type_conversion}
                  onChange={(e) => setFormData({ ...formData, type_conversion: e.target.value })}
                  required
                >
                  <option value="">Type de conversion</option>
                  <option value="Nouveau converti">Nouveau converti</option>
                  <option value="Réconciliation">Réconciliation</option>
                </select>
              </div>
            )}

            <div className="st-divider" />

            {/* Besoins */}
            <p className="st-section-label">Difficultés / Besoins :</p>
            <div className="st-besoins-grid">
              {besoinsList.map((b) => (
                <label key={b} className="st-checkbox-row">
                  <input
                    type="checkbox"
                    value={b}
                    checked={formData.besoin.includes(b)}
                    onChange={() => handleBesoinChange(b)}
                  />
                  <span>{b}</span>
                </label>
              ))}

              <label className="st-checkbox-row">
                <input
                  type="checkbox"
                  checked={showOtherField}
                  onChange={() => setShowOtherField(!showOtherField)}
                />
                <span>Autre…</span>
              </label>
            </div>

            {showOtherField && (
              <input
                type="text"
                placeholder="Précisez le besoin..."
                value={otherBesoin}
                onChange={(e) => setOtherBesoin(e.target.value)}
                className="st-input"
              />
            )}

            <div className="st-divider" />

            {/* Infos supplémentaires */}
            <textarea
              placeholder="Informations supplémentaires..."
              rows={3}
              value={formData.infos_supplementaires}
              onChange={(e) => setFormData({ ...formData, infos_supplementaires: e.target.value })}
              className="st-input"
            />

            {/* Boutons */}
            <div className="st-btn-row">
              <button type="button" onClick={handleCancel} className="st-btn st-btn-cancel">
                Annuler
              </button>
              <button type="submit" className="st-btn st-btn-submit">
                Ajouter ✦
              </button>
            </div>
          </form>

          {success && (
            <div className="st-success">
              ✅ Personne évangélisée ajoutée avec succès !
            </div>
          )}
        </div>
      </div>
    </>
  );
}
