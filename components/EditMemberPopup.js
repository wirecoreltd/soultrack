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
    infos_supplementaires: member?.infos_supplementaires || "", // ➕ AJOUT
    is_whatsapp: !!member?.is_whatsapp,                       // ➕ AJOUT
    star: member?.star === true,                               // ➕ AJOUT
    sexe: member?.sexe || "",                                  // ➕ AJOUT
    venu: member?.venu || "",                                  // ➕ AJOUT
    besoin: initialBesoin,
    autreBesoin: "",
    commentaire_suivis: member?.commentaire_suivis || "",     // ➕ AJOUT
  });

  const [showAutre, setShowAutre] = useState(initialBesoin.includes("Autre"));
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      const { data: cellulesData } = await supabase.from("cellules").select("id, cellule_full");
      const { data: conseillersData } = await supabase
        .from("profiles")
        .select("id, prenom, nom, telephone")
        .eq("role", "Conseiller");
      if (!mounted) return;
      setCellules(cellulesData || []);
      setConseillers(conseillersData || []);
    };
    loadData();
    return () => { mounted = false; };
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name === "conseiller_id" && value) {
      setFormData(prev => ({ ...prev, conseiller_id: value, cellule_id: "" }));
    } else if (name === "cellule_id" && value) {
      setFormData(prev => ({ ...prev, cellule_id: value, conseiller_id: "" }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleBesoinChange = (e) => {
    const { value, checked } = e.target;
    if (value === "Autre") {
      setShowAutre(checked);
      setFormData(prev => ({
        ...prev,
        besoin: checked ? [...prev.besoin, "Autre"] : prev.besoin.filter(b => b !== "Autre"),
        autreBesoin: checked ? prev.autreBesoin : ""
      }));
      return;
    }
    setFormData(prev => ({
      ...prev,
      besoin: checked ? [...prev.besoin, value] : prev.besoin.filter(b => b !== value)
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      let finalBesoin = [...formData.besoin];
      if (showAutre && formData.autreBesoin.trim()) {
        finalBesoin = finalBesoin.filter(b => b !== "Autre");
        finalBesoin.push(formData.autreBesoin.trim());
      } else {
        finalBesoin = finalBesoin.filter(b => b !== "Autre");
      }

      const payload = {
        prenom: formData.prenom || null,
        nom: formData.nom || null,
        telephone: formData.telephone || null,
        ville: formData.ville || null,
        statut: formData.statut || null,
        statut_initial: formData.statut_initial || null,
        cellule_id: formData.cellule_id === "" ? null : formData.cellule_id,
        conseiller_id: formData.conseiller_id === "" ? null : formData.conseiller_id,
        infos_supplementaires: formData.infos_supplementaires || null, // ➕ AJOUT
        is_whatsapp: !!formData.is_whatsapp,                           // ➕ AJOUT
        star: !!formData.star,                                         // ➕ AJOUT
        sexe: formData.sexe || null,                                   // ➕ AJOUT
        venu: formData.venu || null,                                   // ➕ AJOUT
        besoin: JSON.stringify(finalBesoin),
        commentaire_suivis: formData.commentaire_suivis || null,       // ➕ AJOUT
      };

      await supabase.from("membres_complets").update(payload).eq("id", member.id);

      const { data: updatedMember } = await supabase
        .from("membres_complets")
        .select("*")
        .eq("id", member.id)
        .single();

      if (onUpdateMember) onUpdateMember(updatedMember);

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 300);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-3xl w-full max-w-md shadow-xl relative overflow-y-auto max-h-[95vh]">

        <h2 className="text-2xl font-bold text-center mb-4">
          Éditer le profil de {member?.prenom} {member?.nom}
        </h2>

        <div className="flex flex-col gap-3">
          {["prenom","nom","telephone","ville"].map(field => (
            <div key={field}>
              <label className="font-semibold block mb-1 capitalize">{field}</label>
              <input name={field} value={formData[field]} onChange={handleChange} className="input" />
            </div>
          ))}

          {/* ➕ AJOUT DES CHAMPS MANQUANTS */}
          <label className="flex items-center gap-2">
            <input type="checkbox" name="star" checked={formData.star} onChange={handleChange} />
            Serviteur ⭐
          </label>

          <label className="flex items-center gap-2">
            <input type="checkbox" name="is_whatsapp" checked={formData.is_whatsapp} onChange={handleChange} />
            WhatsApp
          </label>

          <select name="sexe" value={formData.sexe} onChange={handleChange} className="input">
            <option value="">-- Sexe --</option>
            <option value="Homme">Homme</option>
            <option value="Femme">Femme</option>
          </select>

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
            placeholder="Informations supplémentaires"
          />

          <textarea
            name="commentaire_suivis"
            value={formData.commentaire_suivis}
            onChange={handleChange}
            className="input"
            placeholder="Commentaire de suivi"
          />

          <div className="flex gap-4">
            <button onClick={onClose} className="flex-1 bg-gray-400 text-white py-2 rounded">Annuler</button>
            <button onClick={handleSubmit} className="flex-1 bg-blue-500 text-white py-2 rounded">
              Sauvegarder
            </button>
          </div>

          {success && <p className="text-green-600 text-center">✔️ Modifié !</p>}
        </div>
      </div>
    </div>
  );
}
