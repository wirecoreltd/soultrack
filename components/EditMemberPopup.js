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
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const [cellules, setCellules] = useState([]);
  const [conseillers, setConseillers] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    prenom: member?.prenom || "",
    nom: member?.nom || "",
    telephone: member?.telephone || "",
    ville: member?.ville || "",
    sexe: member?.sexe || "",
    statut: member?.statut || "",
    statut_initial: member?.statut_initial || "",
    venu: member?.venu || "",
    cellule_id: member?.cellule_id ?? "",
    conseiller_id: member?.conseiller_id ?? "",
    besoin: parseBesoin(member?.besoin),
    infos_supplementaires: member?.infos_supplementaires || "",
    commentaire_suivis: member?.commentaire_suivis || "",
    Formation: member?.Formation || "",
    Soin_Pastoral: member?.Soin_Pastoral || "",
    Ministere: member?.Ministere || "",
    Commentaire_Suivi_Evangelisation: member?.Commentaire_Suivi_Evangelisation || "",
    bapteme_eau: !!member?.bapteme_eau,
    bapteme_esprit: !!member?.bapteme_esprit,
    is_whatsapp: !!member?.is_whatsapp,
    star: !!member?.star,
    priere_salut: member?.priere_salut || "",
    type_conversion: member?.type_conversion || "",
  });

  const [showAutre, setShowAutre] = useState(formData.besoin.includes("Autre"));

  // ---------- LOAD CELLULES & CONSEILLERS ----------
  useEffect(() => {
    const loadData = async () => {
      const { data: cellulesData } = await supabase
        .from("cellules")
        .select("id, cellule_full");

      const { data: conseillersData } = await supabase
        .from("profiles")
        .select("id, prenom, nom")
        .eq("role", "Conseiller");

      setCellules(cellulesData || []);
      setConseillers(conseillersData || []);
      setLoadingData(false);
    };

    loadData();
  }, []);

  // ---------- HANDLERS ----------
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setFormData((p) => ({ ...p, [name]: checked }));
    } else if (name === "bapteme_eau" || name === "bapteme_esprit") {
      setFormData((p) => ({ ...p, [name]: value === "true" }));
    } else {
      setFormData((p) => ({ ...p, [name]: value }));
    }
  };

  const handleBesoinChange = (e) => {
    const { value, checked } = e.target;

    if (value === "Autre") {
      setShowAutre(checked);
      return;
    }

    setFormData((p) => ({
      ...p,
      besoin: checked
        ? [...p.besoin, value]
        : p.besoin.filter((b) => b !== value),
    }));
  };

  // ---------- SUBMIT ----------
  const handleSubmit = async () => {
    setMessage("");
    setLoading(true);

    try {
      const payload = {
        prenom: formData.prenom,
        nom: formData.nom,
        telephone: formData.telephone || null,
        ville: formData.ville || null,
        sexe: formData.sexe || null,
        statut: formData.statut || null,
        statut_initial: formData.statut_initial || null,
        venu: formData.venu || null,
        cellule_id: formData.cellule_id || null,
        conseiller_id: formData.conseiller_id || null,
        besoin: JSON.stringify(formData.besoin),
        infos_supplementaires: formData.infos_supplementaires || null,
        commentaire_suivis: formData.commentaire_suivis || null,
        Formation: formData.Formation || null,
        Soin_Pastoral: formData.Soin_Pastoral || null,
        Ministere: formData.Ministere || null,
        Commentaire_Suivi_Evangelisation: formData.Commentaire_Suivi_Evangelisation || null,
        bapteme_eau: formData.bapteme_eau,
        bapteme_esprit: formData.bapteme_esprit,
        is_whatsapp: formData.is_whatsapp,
        star: formData.star,
        priere_salut: formData.priere_salut || null,
        type_conversion: formData.priere_salut === "Oui" ? formData.type_conversion : null,
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
      onClose();
    } catch (err) {
      console.error(err);
      setMessage("❌ Une erreur est survenue lors de l’enregistrement.");
    } finally {
      setLoading(false);
    }
  };

  // ---------- UI ----------
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-[#25297e] text-white p-6 rounded-3xl w-full max-w-lg overflow-y-auto max-h-[90vh]">
        <h2 className="text-xl font-bold text-center mb-4">
          Modifier {member.prenom} {member.nom}
        </h2>

        {/* Champs */}
        {["prenom", "nom", "telephone", "ville"].map((f) => (
          <input
            key={f}
            name={f}
            value={formData[f]}
            onChange={handleChange}
            placeholder={f}
            className="input mb-2"
          />
        ))}

        {/* Sexe */}
        <select name="sexe" value={formData.sexe} onChange={handleChange} className="input mb-2">
          <option value="">-- Sexe --</option>
          <option value="Homme">Homme</option>
          <option value="Femme">Femme</option>
        </select>

        {/* Baptêmes */}
        <select name="bapteme_eau" value={formData.bapteme_eau.toString()} onChange={handleChange} className="input mb-2">
          <option value="true">Baptême d’eau : Oui</option>
          <option value="false">Baptême d’eau : Non</option>
        </select>

        <select name="bapteme_esprit" value={formData.bapteme_esprit.toString()} onChange={handleChange} className="input mb-2">
          <option value="true">Baptême de feu : Oui</option>
          <option value="false">Baptême de feu : Non</option>
        </select>

        {/* Prière du salut */}
        <select
          name="priere_salut"
          value={formData.priere_salut}
          onChange={handleChange}
          className="input mb-2"
        >
          <option value="">Prière du salut</option>
          <option value="Oui">Oui</option>
          <option value="Non">Non</option>
        </select>

        {formData.priere_salut === "Oui" && (
          <select
            name="type_conversion"
            value={formData.type_conversion}
            onChange={handleChange}
            className="input mb-2"
          >
            <option value="">Type de conversion</option>
            <option value="Nouveau converti">Nouveau converti</option>
            <option value="Réconciliation">Réconciliation</option>
          </select>
        )}

        {/* Textareas */}
        {["Formation", "Soin_Pastoral", "Ministere", "Commentaire_Suivi_Evangelisation", "commentaire_suivis"].map((f) => (
          <textarea
            key={f}
            name={f}
            value={formData[f]}
            onChange={handleChange}
            placeholder={f}
            className="input mb-2"
            rows={2}
          />
        ))}

        <button onClick={handleSubmit} className="w-full bg-white text-[#25297e] font-bold py-3 rounded-xl mt-4">
          Sauvegarder
        </button>

        {message && <p className="text-center mt-2">{message}</p>}
      </div>
    </div>
  );
}
