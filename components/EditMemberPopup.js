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
        const { data: cellulesData } = await supabase
          .from("cellules")
          .select("id, cellule_full");

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
        besoin: checked
          ? [...prev.besoin, "Autre"]
          : prev.besoin.filter(b => b !== "Autre"),
        autreBesoin: checked ? prev.autreBesoin : ""
      }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      besoin: checked
        ? [...prev.besoin, value]
        : prev.besoin.filter(b => b !== value)
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

      const { error } = await supabase
        .from("membres_complets")
        .update(payload)
        .eq("id", member.id);

      if (error) throw error;

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
    } catch (err) {
      console.error("Erreur EditMemberPopup:", err);
      alert("❌ Une erreur est survenue.");
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

          {/* Tous les champs du membre */}
          <input type="text" name="prenom" value={formData.prenom} onChange={handleChange} className="input" placeholder="Prénom" />
          <input type="text" name="nom" value={formData.nom} onChange={handleChange} className="input" placeholder="Nom" />
          <input type="text" name="telephone" value={formData.telephone} onChange={handleChange} className="input" placeholder="Téléphone" />
          <input type="text" name="ville" value={formData.ville} onChange={handleChange} className="input" placeholder="Ville" />

          <label className="flex items-center gap-3">
            <input type="checkbox" name="star" checked={formData.star} onChange={handleChange} />
            Définir en tant que serviteur ⭐
          </label>

          <select name="statut" value={formData.statut} onChange={handleChange} className="input">
            <option value="">-- Statut --</option>
            <option value="actif">Actif</option>
            <option value="a déjà son église">A déjà son église</option>
            <option value="ancien">Ancien</option>
            <option value="inactif">Inactif</option>
          </select>

          <select name="cellule_id" value={formData.cellule_id ?? ""} onChange={handleChange} className="input">
            <option value="">-- Cellule --</option>
            {cellules.map(c => (
              <option key={c.id} value={c.id}>{c.cellule_full}</option>
            ))}
          </select>

          <select name="conseiller_id" value={formData.conseiller_id ?? ""} onChange={handleChange} className="input">
            <option value="">-- Conseiller --</option>
            {conseillers.map(c => (
              <option key={c.id} value={c.id}>{c.prenom} {c.nom}</option>
            ))}
          </select>

          <select name="sexe" value={formData.sexe} onChange={handleChange} className="input">
            <option value="">-- Sexe --</option>
            <option value="Homme">Homme</option>
            <option value="Femme">Femme</option>
          </select>

          <div>
            {besoinsOptions.map(item => (
              <label key={item} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  value={item}
                  checked={formData.besoin.includes(item)}
                  onChange={handleBesoinChange}
                />
                {item}
              </label>
            ))}

            <label className="flex items-center gap-2">
              <input type="checkbox" value="Autre" checked={showAutre} onChange={handleBesoinChange} />
              Autre
            </label>

            {showAutre && (
              <input
                type="text"
                name="autreBesoin"
                value={formData.autreBesoin}
                onChange={handleChange}
                className="input"
                placeholder="Précisez"
              />
            )}
          </div>

          <select name="venu" value={formData.venu} onChange={handleChange} className="input">
            <option value="">-- Comment est-il venu ? --</option>
            <option value="invité">Invité</option>
            <option value="réseaux">Réseaux</option>
            <option value="evangélisation">Évangélisation</option>
            <option value="autre">Autre</option>
          </select>

          <textarea
            name="infos_supplementaires"
            rows={2}
            value={formData.infos_supplementaires}
            onChange={handleChange}
            className="input"
            placeholder="Informations supplémentaires"
          />

          <select name="statut_initial" value={formData.statut_initial} onChange={handleChange} className="input">
            <option value="">-- Statut à l'arrivée --</option>
            <option value="veut rejoindre ICC">Veut rejoindre ICC</option>
            <option value="a déjà son église">A déjà son église</option>
            <option value="visiteur">Visiteur</option>
          </select>

          <textarea
            name="commentaire_suivis"
            rows={2}
            value={formData.commentaire_suivis}
            onChange={handleChange}
            className="input"
            placeholder="Commentaire suivis"
          />

          <div className="flex gap-4 mt-2">
            <button onClick={onClose} className="flex-1 bg-gray-400 text-white py-2 rounded">
              Annuler
            </button>
            <button onClick={handleSubmit} disabled={loading} className="flex-1 bg-blue-500 text-white py-2 rounded">
              {loading ? "Enregistrement..." : "Sauvegarder"}
            </button>
          </div>

          {success && (
            <p className="text-green-600 text-center mt-2">
              ✔️ Modifié !
            </p>
          )}

        </div>

        <style jsx>{`
          .input {
            width: 100%;
            border: 1px solid #ccc;
            border-radius: 12px;
            padding: 12px;
            margin-bottom: 6px;
          }
        `}</style>

      </div>
    </div>
  );
}
