"use client";

import { useState, useEffect } from "react";
import supabase from "../lib/supabaseClient";

export default function EditMemberPopup({ member, onClose, onUpdateMember }) {
  if (!member) return null;

  const besoinsOptions = ["Finances", "Santé", "Travail", "Les Enfants", "La Famille"];

  const parseBesoin = (b) => {
    if (!b) return [];
    if (Array.isArray(b)) return b;
    try {
      const parsed = JSON.parse(b);
      return Array.isArray(parsed) ? parsed : [String(b)];
    } catch {
      return [String(b)];
    }
  };

  const initialBesoin = parseBesoin(member?.besoin);

  const [cellules, setCellules] = useState([]);
  const [conseillers, setConseillers] = useState([]);

  const [formData, setFormData] = useState({
    prenom: member?.prenom || "",
    nom: member?.nom || "",
    telephone: member?.telephone || "",
    ville: member?.ville || "",
    statut: member?.statut || "",
    statut_initial: member?.statut_initial || "",
    cellule_id: member?.cellule_id ?? "",
    conseiller_id: member?.conseiller_id ?? "",
    infos_supplementaires: member?.infos_supplementaires || "",
    is_whatsapp: !!member?.is_whatsapp,
    star: !!member?.star,
    sexe: member?.sexe || "",
    venu: member?.venu || "",
    besoin: initialBesoin,
    autreBesoin: "",
    commentaire_suivis: member?.commentaire_suivis || "",
  });

  const [showAutre, setShowAutre] = useState(initialBesoin.includes("Autre"));
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  /* ===================== LOAD DATA ===================== */
  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      const { data: cellulesData } = await supabase
        .from("cellules")
        .select("id, cellule_full");

      const { data: conseillersData } = await supabase
        .from("profiles")
        .select("id, prenom, nom")
        .eq("role", "Conseiller");

      if (!mounted) return;
      setCellules(cellulesData || []);
      setConseillers(conseillersData || []);
    };

    loadData();
    return () => (mounted = false);
  }, []);

  /* ===================== HANDLERS ===================== */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setFormData((p) => ({ ...p, [name]: checked }));
    } else if (name === "cellule_id" && value) {
      setFormData((p) => ({ ...p, cellule_id: value, conseiller_id: "" }));
    } else if (name === "conseiller_id" && value) {
      setFormData((p) => ({ ...p, conseiller_id: value, cellule_id: "" }));
    } else {
      setFormData((p) => ({ ...p, [name]: value }));
    }
  };

  const handleBesoinChange = (e) => {
    const { value, checked } = e.target;

    if (value === "Autre") {
      setShowAutre(checked);
      setFormData((p) => ({
        ...p,
        besoin: checked ? [...p.besoin, "Autre"] : p.besoin.filter((b) => b !== "Autre"),
        autreBesoin: "",
      }));
      return;
    }

    setFormData((p) => ({
      ...p,
      besoin: checked ? [...p.besoin, value] : p.besoin.filter((b) => b !== value),
    }));
  };

  /* ===================== SUBMIT ===================== */
  const handleSubmit = async () => {
    setErrorMessage("");
    setSuccessMessage("");

    if (!formData.prenom.trim())
      return setErrorMessage("❌ Le prénom est obligatoire.");
    if (!formData.nom.trim())
      return setErrorMessage("❌ Le nom est obligatoire.");

    setLoading(true);

    try {
      let finalBesoin = [...formData.besoin];
      if (showAutre && formData.autreBesoin.trim()) {
        finalBesoin = finalBesoin.filter((b) => b !== "Autre");
        finalBesoin.push(formData.autreBesoin.trim());
      } else {
        finalBesoin = finalBesoin.filter((b) => b !== "Autre");
      }

      const payload = {
        prenom: formData.prenom,
        nom: formData.nom,
        telephone: formData.telephone || null,
        ville: formData.ville || null,
        statut: formData.statut || null,
        statut_initial: formData.statut_initial || null,
        cellule_id: formData.cellule_id || null,
        conseiller_id: formData.conseiller_id || null,
        infos_supplementaires: formData.infos_supplementaires || null,
        is_whatsapp: !!formData.is_whatsapp,
        star: !!formData.star,
        sexe: formData.sexe || null,
        venu: formData.venu || null,
        besoin: JSON.stringify(finalBesoin),
        commentaire_suivis: formData.commentaire_suivis || null,
      };

      const { error } = await supabase
        .from("membres_complets")
        .update(payload)
        .eq("id", member.id);

      if (error) throw error;

      const { data } = await supabase
        .from("membres_complets")
        .select("*")
        .eq("id", member.id)
        .single();

      onUpdateMember?.(data);

      setSuccessMessage("✅ Modification réussie");

      setTimeout(() => {
        onClose();
      }, 900);
    } catch (err) {
      console.error(err);
      setErrorMessage("❌ Une erreur est survenue lors de l’enregistrement.");
    } finally {
      setLoading(false);
    }
  };

  /* ===================== UI ===================== */
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div
        className="relative w-full max-w-lg p-6 rounded-3xl shadow-2xl overflow-y-auto max-h-[90vh]"
        style={{
          background: "linear-gradient(180deg, rgba(46,49,146,0.16), rgba(46,49,146,0.40))",
        }}
      >

        <button onClick={onClose} className="absolute top-4 right-4 text-red-600 font-bold text-xl">✕</button>

        <h2 className="text-2xl font-bold text-center mb-6 text-blue-900">
          Modifier le profil
        </h2>

        <div className="flex flex-col gap-4">

          {["prenom", "nom", "telephone", "ville"].map((field) => (
            <div key={field} className="flex flex-col">
              <label className="font-medium text-blue-900 capitalize">{field}</label>
              <input
                name={field}
                value={formData[field]}
                onChange={handleChange}
                className="input"
              />
            </div>
          ))}

          <label className="flex items-center gap-3 text-blue-900">
            <input type="checkbox" name="star" checked={formData.star} onChange={handleChange} />
            Définir en tant que serviteur ⭐
          </label>

          {/* STATUT */}
          <select name="statut" value={formData.statut} onChange={handleChange} className="input">
            <option value="">-- Statut --</option>
            <option value="actif">Actif</option>
            <option value="ancien">Ancien</option>
            <option value="inactif">Inactif</option>
            <option value="a déjà son église">A déjà son église</option>
          </select>

          {/* CELLULE */}
          <select name="cellule_id" value={formData.cellule_id} onChange={handleChange} className="input">
            <option value="">-- Cellule --</option>
            {cellules.map((c) => (
              <option key={c.id} value={c.id}>{c.cellule_full}</option>
            ))}
          </select>

          {/* CONSEILLER */}
          <select name="conseiller_id" value={formData.conseiller_id} onChange={handleChange} className="input">
            <option value="">-- Conseiller --</option>
            {conseillers.map((c) => (
              <option key={c.id} value={c.id}>{c.prenom} {c.nom}</option>
            ))}
          </select>

          {/* SEXE */}
          <select name="sexe" value={formData.sexe} onChange={handleChange} className="input">
            <option value="">-- Sexe --</option>
            <option value="Homme">Homme</option>
            <option value="Femme">Femme</option>
          </select>

          {/* BESOINS */}
          <div>
            {besoinsOptions.map((b) => (
              <label key={b} className="flex items-center gap-2 text-blue-900">
                <input
                  type="checkbox"
                  value={b}
                  checked={formData.besoin.includes(b)}
                  onChange={handleBesoinChange}
                />
                {b}
              </label>
            ))}

            <label className="flex items-center gap-2 text-blue-900">
              <input type="checkbox" value="Autre" checked={showAutre} onChange={handleBesoinChange} />
              Autre
            </label>

            {showAutre && (
              <input
                name="autreBesoin"
                value={formData.autreBesoin}
                onChange={handleChange}
                className="input mt-2"
                placeholder="Précisez"
              />
            )}
          </div>

          {/* VENU */}
          <select name="venu" value={formData.venu} onChange={handleChange} className="input">
            <option value="">-- Comment est-il venu ? --</option>
            <option value="invité">Invité</option>
            <option value="réseaux">Réseaux</option>
            <option value="evangélisation">Évangélisation</option>
            <option value="autre">Autre</option>
          </select>

          <textarea
            name="infos_supplementaires"
            value={formData.infos_supplementaires}
            onChange={handleChange}
            className="input"
            rows={2}
            placeholder="Informations supplémentaires"
          />

          <select
            name="statut_initial"
            value={formData.statut_initial}
            onChange={handleChange}
            className="input"
          >
            <option value="">-- Statut à l'arrivée --</option>
            <option value="veut rejoindre ICC">Veut rejoindre ICC</option>
            <option value="a déjà son église">A déjà son église</option>
            <option value="visiteur">Visiteur</option>
          </select>

          <textarea
            name="commentaire_suivis"
            value={formData.commentaire_suivis}
            onChange={handleChange}
            className="input"
            rows={2}
            placeholder="Commentaire suivis"
          />

          {/* BUTTONS */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full bg-gray-400 hover:bg-gray-500 text-white font-bold py-3 rounded-2xl shadow-md transition-all"
            >
              Annuler
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-400 to-indigo-500
                         hover:from-blue-500 hover:to-indigo-600
                         disabled:opacity-60 disabled:cursor-not-allowed
                         text-white font-bold py-3 rounded-2xl shadow-md transition-all"
            >
              {loading ? "Enregistrement..." : "Sauvegarder"}
            </button>
          </div>

          {errorMessage && <p className="text-red-600 font-semibold text-center">{errorMessage}</p>}
          {successMessage && <p className="text-green-600 font-semibold text-center">{successMessage}</p>}

        </div>

        <style jsx>{`
          .input {
            width: 100%;
            border: 1px solid #a0c4ff;
            border-radius: 14px;
            padding: 12px;
          }
        `}</style>
      </div>
    </div>
  );
}
