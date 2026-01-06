"use client";

import { useState, useEffect } from "react";
import supabase from "../lib/supabaseClient";

export default function EditMemberSuivisPopup({ member, onClose, onUpdateMember }) {
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
  const [loadingData, setLoadingData] = useState(true);

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
  const [message, setMessage] = useState("");

  /* ===================== LOAD DATA ===================== */
  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      try {
        const { data: cellulesData } = await supabase.from("cellules").select("id, cellule_full");
        const { data: conseillersData } = await supabase
          .from("profiles")
          .select("id, prenom, nom")
          .eq("role", "Conseiller");
        if (!mounted) return;
        setCellules(cellulesData || []);
        setConseillers(conseillersData || []);
        setLoadingData(false);
      } catch (err) {
        console.error("Erreur chargement cellules/conseillers:", err);
        setLoadingData(false);
      }
    };
    loadData();
    return () => { mounted = false; };
  }, []);

  /* ===================== HANDLERS ===================== */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name === "cellule_id" && value) {
      setFormData(prev => ({ ...prev, cellule_id: value, conseiller_id: "" }));
    } else if (name === "conseiller_id" && value) {
      setFormData(prev => ({ ...prev, conseiller_id: value, cellule_id: "" }));
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
        autreBesoin: ""
      }));
      return;
    }
    setFormData(prev => ({
      ...prev,
      besoin: checked ? [...prev.besoin, value] : prev.besoin.filter(b => b !== value)
    }));
  };

  /* ===================== SUBMIT ===================== */
  const handleSubmit = async () => {
    setMessage("");
    if (!formData.prenom.trim()) return setMessage("❌ Le prénom est obligatoire.");
    if (!formData.nom.trim()) return setMessage("❌ Le nom est obligatoire.");

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

      setMessage("✅ Enregistrement / Modification réussie");

      setTimeout(() => {
        setMessage("");
        onClose();
      }, 3000);
    } catch (err) {
      console.error(err);
      setMessage("❌ Une erreur est survenue lors de l’enregistrement.");
    } finally {
      setLoading(false);
    }
  };

  /* ===================== UI ===================== */
  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-md backdrop-saturate-150 flex items-center justify-center z-50 p-4">
      <div
        className="relative w-full max-w-lg p-6 rounded-3xl shadow-2xl overflow-y-auto max-h-[90vh]"
        style={{
          background: "linear-gradient(180deg, rgba(46,49,146,0.16), rgba(46,49,146,0.40))",
          backdropFilter: "blur(8px)",
        }}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-red-600 font-bold text-xl">✕</button>

        <h2 className="text-2xl font-bold text-center mb-6 text-white">
          Modifier le profil {member.prenom} {member.nom}
        </h2>

        <div className="flex flex-col gap-4 text-white">

          {["prenom","nom","telephone","ville"].map(f => (
            <div key={f} className="flex flex-col">
              <label className="font-medium capitalize">{f}</label>
              <input name={f} value={formData[f]} onChange={handleChange} className="input" />
            </div>
          ))}          

          {/* Sexe */}
          <div className="flex flex-col">
            <label className="font-medium">Sexe</label>
            <select name="sexe" value={formData.sexe} onChange={handleChange} className="input">
              <option value="">-- Sexe --</option>
              <option value="Homme">Homme</option>
              <option value="Femme">Femme</option>
            </select>
          </div>

          {/* Statut */}
          <div>
            <label className="font-semibold text-black block mb-1">Statut</label>
            <select
              name="statut"
              value={formData.statut}
              onChange={handleChange}
              className="input"
            >
              <option value="">-- Statut --</option>
              <option value="actif">Actif</option>
              <option value="a déjà son église">A déjà son église</option>
              <option value="ancien">Ancien</option>
              <option value="inactif">Inactif</option>
            </select>
          </div>          

          {/* Besoins */}
          <div className="flex flex-col">
            <label className="font-medium">Besoins</label>
            {besoinsOptions.map(b => (
              <label key={b} className="flex items-center gap-2">
                <input type="checkbox" value={b} checked={formData.besoin.includes(b)} onChange={handleBesoinChange} className="accent-[#25297e]" />
                {b}
              </label>
            ))}
            <label className="flex items-center gap-2">
              <input type="checkbox" value="Autre" checked={showAutre} onChange={handleBesoinChange} className="accent-[#25297e]" />
              Autre
            </label>
            {showAutre && (
              <input name="autreBesoin" value={formData.autreBesoin} onChange={handleChange} className="input mt-2" placeholder="Précisez" />
            )}
          </div>

          {/* Venu */}
          <div className="flex flex-col">
            <label className="font-medium">Comment est-il venu ?</label>
            <select name="venu" value={formData.venu} onChange={handleChange} className="input">
              <option value="">-- Sélectionner --</option>
              <option value="invité">Invité</option>
              <option value="réseaux">Réseaux</option>
              <option value="evangélisation">Évangélisation</option>
              <option value="autre">Autre</option>
            </select>
          </div>

          {/* Infos supplémentaires */}
          <div className="flex flex-col">
            <label className="font-medium">Informations supplémentaires</label>
            <textarea name="infos_supplementaires" value={formData.infos_supplementaires} onChange={handleChange} className="input" rows={2} />
          </div>

          {/* Statut initial */}
          <div className="flex flex-col">
            <label className="font-medium">Statut à l'arrivée</label>
            <select name="statut_initial" value={formData.statut_initial} onChange={handleChange} className="input">
              <option value="">-- Sélectionner --</option>
              <option value="veut rejoindre ICC">Veut rejoindre ICC</option>
              <option value="a déjà son église">A déjà son église</option>
              <option value="visiteur">Visiteur</option>
            </select>
          </div>       

        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-4">
          <button type="button" onClick={onClose} className="w-full bg-gray-400 hover:bg-gray-500 text-white font-bold py-3 rounded-2xl shadow-md transition-all">Annuler</button>
          <button type="button" onClick={handleSubmit} disabled={loading} className="w-full bg-gradient-to-r from-blue-400 to-indigo-500 hover:from-blue-500 hover:to-indigo-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3 rounded-2xl shadow-md transition-all">
            {loading ? "Enregistrement..." : "Sauvegarder"}
          </button>
        </div>

        {/* Message succès ou erreur sous les boutons */}
        {message && (
          <p className="text-[#25297e] font-semibold text-center mt-3">
            {message}
          </p>
        )}

        <style jsx>{`
  label {
    font-weight: 600; /* semi-bold */
    color: white;
  }

  .input {
    width: 100%;
    border: 1px solid #a0c4ff;
    border-radius: 14px;
    padding: 12px;
    background: rgba(255,255,255,0.1);
    color: white;
    font-weight: 400; /* NORMAL pour les valeurs */
  }

  /* Texte affiché dans le select (avant ouverture) */
  select.input {
    font-weight: 400;
    color: white;
  }

  /* Options du menu déroulant (quand ouvert) */
  select.input option {
    background: white;
    color: black;
    font-weight: 400;
  }
`}</style>

      </div>
    </div>
  );
}
