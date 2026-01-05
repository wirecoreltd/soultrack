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
      try {
        const { data: cellulesData } = await supabase.from("cellules").select("id, cellule_full");
        const { data: conseillersData } = await supabase
          .from("profiles")
          .select("id, prenom, nom, telephone")
          .eq("role", "Conseiller");
        if (!mounted) return;
        setCellules(cellulesData || []);
        setConseillers(conseillersData || []);
      } catch (err) {
        console.error("Erreur chargement cellules/conseillers:", err);
      }
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
        infos_supplementaires: formData.infos_supplementaires || null,
        is_whatsapp: !!formData.is_whatsapp,
        star: !!formData.star,
        sexe: formData.sexe || null,
        venu: formData.venu || null,
        besoin: JSON.stringify(finalBesoin),
        commentaire_suivis: formData.commentaire_suivis || null,
      };

      const { error: updateError } = await supabase
        .from("membres_complets")
        .update(payload)
        .eq("id", member.id);
      if (updateError) throw updateError;

      const { data: updatedMember, error: fetchError } = await supabase
        .from("membres_complets")
        .select("*")
        .eq("id", member.id)
        .single();
      if (fetchError) throw fetchError;

      if (onUpdateMember) onUpdateMember(updatedMember);

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 300);
    } catch (err) {
      console.error("Erreur EditMemberPopup:", err);
      alert("❌ Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="popup-bg relative w-full max-w-xl p-8 overflow-y-auto max-h-[90vh]">

        {/* ✕ Close */}
        <button
          onClick={onClose}
          className="absolute top-5 right-6 text-gray-500 hover:text-red-500 text-2xl font-bold transition"
        >
          ✕
        </button>

        {/* Titre */}
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Éditer le profil de {member?.prenom} {member?.nom}
        </h2>

        <div className="grid grid-cols-1 gap-4">

          {/* Prénom */}
          <div className="flex flex-col">
            <label className="text-gray-600 font-semibold text-sm">Prénom</label>
            <input type="text" name="prenom" value={formData.prenom} onChange={handleChange} className="input-modern"/>
          </div>

          {/* Nom */}
          <div className="flex flex-col">
            <label className="text-gray-600 font-semibold text-sm">Nom</label>
            <input type="text" name="nom" value={formData.nom} onChange={handleChange} className="input-modern"/>
          </div>

          {/* Téléphone */}
          <div className="flex flex-col">
            <label className="text-gray-600 font-semibold text-sm">Téléphone</label>
            <input type="text" name="telephone" value={formData.telephone} onChange={handleChange} className="input-modern"/>
          </div>

          {/* Ville */}
          <div className="flex flex-col">
            <label className="text-gray-600 font-semibold text-sm">Ville</label>
            <input type="text" name="ville" value={formData.ville} onChange={handleChange} className="input-modern"/>
          </div>

          {/* ⭐ Serviteur */}
          <label className="flex items-center gap-2 text-gray-700">
            <input type="checkbox" name="star" checked={formData.star} onChange={handleChange} className="accent-blue-500"/>
            Définir en tant que serviteur
          </label>

          {/* Statut */}
          <div className="flex flex-col">
            <label className="text-gray-600 font-semibold text-sm">Statut</label>
            <select name="statut" value={formData.statut} onChange={handleChange} className="input-modern">
              <option value="">-- Statut --</option>
              <option value="actif">Actif</option>
              <option value="a déjà son église">A déjà son église</option>
              <option value="ancien">Ancien</option>
              <option value="inactif">Inactif</option>
            </select>
          </div>

          {/* Cellule */}
          <div className="flex flex-col">
            <label className="text-gray-600 font-semibold text-sm">Cellule</label>
            <select name="cellule_id" value={formData.cellule_id ?? ""} onChange={handleChange} className="input-modern">
              <option value="">-- Cellule --</option>
              {cellules.map(c => (
                <option key={c.id} value={c.id}>{c.cellule_full}</option>
              ))}
            </select>
          </div>

          {/* Conseiller */}
          <div className="flex flex-col">
            <label className="text-gray-600 font-semibold text-sm">Conseiller</label>
            <select name="conseiller_id" value={formData.conseiller_id ?? ""} onChange={handleChange} className="input-modern">
              <option value="">-- Conseiller --</option>
              {conseillers.map(c => (
                <option key={c.id} value={c.id}>{c.prenom} {c.nom}</option>
              ))}
            </select>
          </div>

          {/* Sexe */}
          <div className="flex flex-col">
            <label className="text-gray-600 font-semibold text-sm">Sexe</label>
            <select name="sexe" value={formData.sexe} onChange={handleChange} className="input-modern">
              <option value="">-- Sexe --</option>
              <option value="Homme">Homme</option>
              <option value="Femme">Femme</option>
            </select>
          </div>

          {/* Besoins */}
          <div className="flex flex-col">
            <label className="text-gray-600 font-semibold text-sm">Besoins</label>
            {besoinsOptions.map(item => (
              <label key={item} className="flex items-center gap-2">
                <input type="checkbox" value={item} checked={formData.besoin.includes(item)} onChange={handleBesoinChange} className="accent-blue-500"/>
                {item}
              </label>
            ))}
            <label className="flex items-center gap-2">
              <input type="checkbox" value="Autre" checked={showAutre} onChange={handleBesoinChange} className="accent-blue-500"/>
              Autre
            </label>
            {showAutre && <input type="text" name="autreBesoin" value={formData.autreBesoin} onChange={handleChange} className="input-modern mt-1" placeholder="Précisez"/>}
          </div>

          {/* Commentaire Suivis */}
          <div className="flex flex-col">
            <label className="text-gray-600 font-semibold text-sm">Commentaire suivis</label>
            <textarea name="commentaire_suivis" rows={2} value={formData.commentaire_suivis} onChange={handleChange} className="input-modern"/>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 mt-6">
            <button onClick={onClose} className="flex-1 py-2 bg-gray-300 hover:bg-gray-400 text-white rounded-xl font-semibold transition">
              Annuler
            </button>
            <button onClick={handleSubmit} disabled={loading} className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition">
              {loading ? "Enregistrement..." : "Sauvegarder"}
            </button>
          </div>

          {success && <p className="text-green-600 text-center font-semibold mt-3">✔️ Modifié !</p>}
        </div>

        <style jsx>{`
          .input-modern {
            background: rgba(255,255,255,0.6);
            backdrop-filter: blur(8px);
            border-radius: 12px;
            padding: 10px 14px;
            border: 1px solid rgba(255,255,255,0.3);
            box-shadow: 0 4px 12px rgba(0,0,0,0.08);
            width: 100%;
            transition: all 0.2s ease-in-out;
          }
          .input-modern:focus {
            outline: none;
            border-color: rgba(59,130,246,0.8);
            box-shadow: 0 4px 20px rgba(59,130,246,0.3);
          }
          .popup-bg {
            background: rgba(255,255,255,0.2);
            backdrop-filter: blur(12px);
            border-radius: 2rem;
            box-shadow: 0 12px 30px rgba(0,0,0,0.25);
            border: 1px solid rgba(255,255,255,0.3);
          }
        `}</style>
      </div>
    </div>
  );
}
