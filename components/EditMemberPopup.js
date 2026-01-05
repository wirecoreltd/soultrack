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
    star: member?.star === true,
    sexe: member?.sexe || "",
    venu: member?.venu || "",
    besoin: initialBesoin,
    autreBesoin: "",
    commentaire_suivis: member?.commentaire_suivis || "",
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
        .select("id, prenom, nom")
        .eq("role", "Conseiller");
      if (!mounted) return;
      setCellules(cellulesData || []);
      setConseillers(conseillersData || []);
    };
    loadData();
    return () => (mounted = false);
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

      await supabase.from("membres_complets").update(payload).eq("id", member.id);

      const { data: updatedMember } = await supabase
        .from("membres_complets")
        .select("*")
        .eq("id", member.id)
        .single();

      onUpdateMember?.(updatedMember);

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 300);
    } catch (err) {
      console.error(err);
      alert("❌ Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-3xl w-full max-w-md shadow-xl overflow-y-auto max-h-[95vh]">
        <h2 className="text-xl font-bold text-center mb-4">
          Éditer {member.prenom} {member.nom}
        </h2>

        <div className="flex flex-col gap-3">
          {["prenom","nom","telephone","ville"].map(f => (
            <input key={f} name={f} value={formData[f]} onChange={handleChange} className="input" placeholder={f} />
          ))}

          <label><input type="checkbox" name="star" checked={formData.star} onChange={handleChange} /> Serviteur ⭐</label>
          <label><input type="checkbox" name="is_whatsapp" checked={formData.is_whatsapp} onChange={handleChange} /> WhatsApp</label>

          <select name="sexe" value={formData.sexe} onChange={handleChange} className="input">
            <option value="">-- Sexe --</option>
            <option value="Homme">Homme</option>
            <option value="Femme">Femme</option>
          </select>

          {besoinsOptions.map(b => (
            <label key={b}>
              <input type="checkbox" value={b} checked={formData.besoin.includes(b)} onChange={handleBesoinChange} /> {b}
            </label>
          ))}

          <label>
            <input type="checkbox" value="Autre" checked={showAutre} onChange={handleBesoinChange} /> Autre
          </label>

          {showAutre && (
            <input name="autreBesoin" value={formData.autreBesoin} onChange={handleChange} className="input" placeholder="Précisez" />
          )}

          <textarea name="infos_supplementaires" value={formData.infos_supplementaires} onChange={handleChange} className="input" placeholder="Infos supplémentaires" />
          <textarea name="commentaire_suivis" value={formData.commentaire_suivis} onChange={handleChange} className="input" placeholder="Commentaire suivis" />

          <button onClick={handleSubmit} disabled={loading} className="bg-blue-500 text-white py-2 rounded">
            {loading ? "Enregistrement..." : "Sauvegarder"}
          </button>

          {success && <p className="text-green-600 text-center">✔️ Modifié</p>}
        </div>
      </div>
    </div>
  );
}
