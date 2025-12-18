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

    // 🔥 CHAMPS AJOUTÉS
    sexe: member?.sexe || "",
    venu: member?.venu || "",
    suivi_commentaire_suivis: member?.suivi_commentaire_suivis || "",
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

    if (name === "cellule_id") {
      setFormData(prev => ({
        ...prev,
        cellule_id: value,
        conseiller_id: value ? "" : prev.conseiller_id
      }));
      return;
    }

    if (name === "conseiller_id") {
      setFormData(prev => ({
        ...prev,
        conseiller_id: value,
        cellule_id: value ? "" : prev.cellule_id
      }));
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleBesoinChange = (e) => {
    const { value, checked } = e.target;

    if (value === "Autre") {
      setShowAutre(checked);
      setFormData(prev => ({
        ...prev,
        autreBesoin: checked ? prev.autreBesoin : "",
        besoin: checked
          ? [...prev.besoin, "Autre"]
          : prev.besoin.filter(b => b !== "Autre")
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

  const toggleStar = () =>
    setFormData(prev => ({ ...prev, star: !prev.star }));

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
        cellule_id: formData.cellule_id || null,
        conseiller_id: formData.conseiller_id || null,
        infos_supplementaires: formData.infos_supplementaires || null,
        is_whatsapp: !!formData.is_whatsapp,
        star: !!formData.star,
        besoin: JSON.stringify(finalBesoin),

        // 🔥 CHAMPS SAUVEGARDÉS
        sexe: formData.sexe || null,
        venu: formData.venu || null,
        suivi_commentaire_suivis: formData.suivi_commentaire_suivis || null,
      };

      const { data, error } = await supabase
        .from("membres")
        .update(payload)
        .eq("id", member.id)
        .select()
        .single();

      if (error) throw error;

      if (onUpdateMember) onUpdateMember(data);

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 900);
    } catch (err) {
      console.error(err);
      alert("❌ Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-3xl w-full max-w-md shadow-xl relative overflow-y-auto max-h-[95vh]">

        <button onClick={onClose} className="absolute top-3 right-3 text-red-500 font-bold text-xl">
          ✕
        </button>

        <h2 className="text-2xl font-bold text-center mb-4">
          Éditer le profil de {member?.prenom} {member?.nom}
        </h2>

        <div className="flex flex-col gap-4">

          <input className="input" name="prenom" value={formData.prenom} onChange={handleChange} placeholder="Prénom" />
          <input className="input" name="nom" value={formData.nom} onChange={handleChange} placeholder="Nom" />

          {/* Sexe */}
          <select name="sexe" value={formData.sexe} onChange={handleChange} className="input">
            <option value="">-- Sexe --</option>
            <option value="Homme">Homme</option>
            <option value="Femme">Femme</option>
          </select>

          {/* Comment il est venu */}
          <input
            className="input"
            name="venu"
            value={formData.venu}
            onChange={handleChange}
            placeholder="Comment est-il venu ?"
          />

          {/* Commentaire suivis */}
          <textarea
            className="input"
            rows={3}
            name="suivi_commentaire_suivis"
            value={formData.suivi_commentaire_suivis}
            onChange={handleChange}
            placeholder="Commentaire de suivis"
          />

          <div className="flex gap-4">
            <button onClick={onClose} className="flex-1 bg-gray-400 text-white py-3 rounded-xl">
              Annuler
            </button>
            <button onClick={handleSubmit} disabled={loading} className="flex-1 bg-blue-500 text-white py-3 rounded-xl">
              {loading ? "Enregistrement..." : "Sauvegarder"}
            </button>
          </div>

          {success && <p className="text-green-600 text-center">✔️ Modifié avec succès</p>}
        </div>

        <style jsx>{`
          .input {
            width: 100%;
            border: 1px solid #ccc;
            border-radius: 12px;
            padding: 12px;
          }
        `}</style>

      </div>
    </div>
  );
}
