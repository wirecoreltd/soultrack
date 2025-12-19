"use client";

import { useState, useEffect } from "react";
import supabase from "../lib/supabaseClient";

export default function EditMemberPopup({ member, onClose, onUpdateMember }) {
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
    besoin: initialBesoin,
    autreBesoin: "",
    statut: member?.statut || "",
    cellule_id: member?.cellule_id ?? "",
    conseiller_id: member?.conseiller_id ?? "",
    infos_supplementaires: member?.infos_supplementaires || "",
    is_whatsapp: !!member?.is_whatsapp,
    star: member?.star === true,
    sexe: member?.sexe || "",
    venu: member?.venu || "",
    commentaire_suivis: member?.commentaire_suivis || "",
  });

  const [showAutre, setShowAutre] = useState(initialBesoin.includes("Autre"));
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function loadData() {
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
    }
    loadData();
    return () => { mounted = false; };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const toggleStar = (e) => {
    const checked = e.target.checked;
    setFormData(prev => ({
      ...prev,
      star: checked
    }));
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
      let finalBesoin = Array.isArray(formData.besoin) ? [...formData.besoin] : parseBesoin(formData.besoin);
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
        cellule_id: formData.cellule_id === "" ? null : formData.cellule_id,
        conseiller_id: formData.conseiller_id === "" ? null : formData.conseiller_id,
        infos_supplementaires: formData.infos_supplementaires || null,
        is_whatsapp: !!formData.is_whatsapp,
        star: !!formData.star,
        besoin: JSON.stringify(finalBesoin),
        sexe: formData.sexe || null,
        venu: formData.venu || null,
        commentaire_suivis: formData.commentaire_suivis || null,
      };

      const { error } = await supabase
        .from("membres")
        .update(payload)
        .eq("id", member.id);

      if (error) throw error;

      const { data: refreshedMember, error: viewError } = await supabase
        .from("v_membres_full")
        .select("*")
        .eq("id", member.id)
        .single();

      if (viewError) throw viewError;

      if (onUpdateMember) onUpdateMember(refreshedMember);

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 300);
    } catch (err) {
      console.error("Erreur handleSubmit EditMemberPopup:", err);
      alert("❌ Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-3xl w-full max-w-md shadow-xl relative overflow-y-auto max-h-[95vh]">

        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-red-500 font-bold text-xl hover:text-red-700"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold text-center mb-4">
          Éditer le profil de {member?.prenom} {member?.nom}
        </h2>

        <div className="flex flex-col gap-4">

          {/* Prénom */}
          <div className="flex flex-col">
            <label className="font-medium mb-1 text-left">Prénom :</label>
            <input type="text" name="prenom" value={formData.prenom} onChange={handleChange} className="input" />
          </div>

          {/* Nom */}
          <div className="flex flex-col">
            <label className="font-medium mb-1 text-left">Nom :</label>
            <input type="text" name="nom" value={formData.nom} onChange={handleChange} className="input" />
          </div>

          {/* ⭐ DÉFINIR EN TANT QUE SERVITEUR */}
          <label className="flex items-center gap-3 text-lg font-medium">
            <input
              type="checkbox"
              name="star"
              checked={formData.star}
              onChange={toggleStar}
              className="h-5 w-5"
            />
            Définir en tant que serviteur ⭐
          </label>  

          {/* Ville */}
          <div className="flex flex-col">
            <label className="font-medium mb-1 text-left">Ville :</label>
            <input type="text" name="ville" value={formData.ville} onChange={handleChange} className="input" />
          </div>

          {/* Statut */}
          <div className="flex flex-col">
            <label className="font-medium mb-1 text-left">Statut :</label>
            <select name="statut" value={formData.statut} onChange={handleChange} className="input">
              <option value="">-- Statut --</option>
              <option value="veut rejoindre ICC">Veut rejoindre ICC</option>
              <option value="a déjà son église">A déjà son église</option>
              <option value="visiteur">Visiteur</option>
              <option value="actif">Actif</option>
              <option value="ancien">Ancien</option>
              <option value="Integrer">Intégrer</option>
            </select>
          </div>

          {/* Sexe */}
          <div className="flex flex-col">
            <label className="font-medium mb-1 text-left">Sexe :</label>
            <select name="sexe" value={formData.sexe} onChange={handleChange} className="input">
              <option value="">-- Sexe --</option>
              <option value="Homme">Homme</option>
              <option value="Femme">Femme</option>
            </select>
          </div>

          {/* Besoins */}
          <div className="flex flex-col">
            <label className="font-medium mb-2 text-left">Besoin :</label>
            {besoinsOptions.map(item => (
              <label key={item} className="flex items-center gap-3 mb-2">
                <input
                  type="checkbox"
                  value={item}
                  checked={Array.isArray(formData.besoin) && formData.besoin.includes(item)}
                  onChange={handleBesoinChange}
                />
                {item}
              </label>
            ))}
            <label className="flex items-center gap-3 mb-2">
              <input type="checkbox" value="Autre" checked={showAutre} onChange={handleBesoinChange} />
              Autre
            </label>
            {showAutre && (
              <div className="flex flex-col mt-2">
                <label className="font-medium mb-1">Précisez :</label>
                <input type="text" name="autreBesoin" value={formData.autreBesoin} onChange={handleChange} className="input" />
              </div>
            )}
          </div>
          
          {/* Comment il est venu */}
          <div className="flex flex-col">
            <label className="font-medium mb-1 text-left">Comment est-il venu :</label>
            <select name="venu" value={formData.venu} onChange={handleChange} className="input">
              <option value="">-- Comment est-il venu ? --</option>
              <option value="invité">Invité</option>
              <option value="réseaux">Réseaux</option>
              <option value="evangélisation">Évangélisation</option>
              <option value="autre">Autre</option>
            </select>
          </div>

            {/* Infos supplémentaires */}
          <div className="flex flex-col">
            <label className="font-medium mb-1 text-left">Informations :</label>
            <textarea name="infos_supplementaires" rows={2} value={formData.infos_supplementaires} onChange={handleChange} className="input" />
          </div>

          {/* Commentaire suivis */}
          <div className="flex flex-col">
            <label className="font-medium mb-1 text-left">Commentaire Suivis :</label>
            <textarea
              name="commentaire_suivis"
              rows={2}
              value={formData.commentaire_suivis}
              onChange={handleChange}
              className="input"
            />
          </div>          

          {/* Buttons */}
          <div className="flex gap-4 mt-2">
            <button onClick={onClose} className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-bold py-3 rounded-2xl shadow-md">Annuler</button>
            <button onClick={handleSubmit} disabled={loading} className="flex-1 bg-gradient-to-r from-blue-400 to-indigo-500 hover:from-blue-500 hover:to-indigo-600 text-white font-bold py-3 rounded-2xl shadow-md">
              {loading ? "Enregistrement..." : "Sauvegarder"}
            </button>
          </div>

          {success && <p className="text-green-600 font-semibold text-center mt-3">✔️ Modifié avec succès !</p>}

        </div>

        <style jsx>{`
          .input {
            width: 100%;
            border: 1px solid #ccc;
            border-radius: 12px;
            padding: 12px;
            box-shadow: 0 1px 2px rgba(0,0,0,0.1);
          }
        `}</style>

      </div>
    </div>
  );
}
