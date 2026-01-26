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
    bapteme_eau: member?.bapteme_eau ?? false,
    bapteme_esprit: member?.bapteme_esprit ?? false,
    Formation: member?.Formation || "",
    Soin_Pastoral: member?.Soin_Pastoral || "",
    Commentaire_Suivi_Evangelisation: member?.Commentaire_Suivi_Evangelisation || "",
    priere_salut: member?.priere_salut || "",
    type_conversion: member?.type_conversion || "",
  });

  const [showAutre, setShowAutre] = useState(initialBesoin.includes("Autre"));
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // -------------------- LOAD DATA --------------------
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

  // -------------------- HANDLERS --------------------
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name === "cellule_id" && value) {
      setFormData(prev => ({ ...prev, cellule_id: value, conseiller_id: "" }));
    } else if (name === "conseiller_id" && value) {
      setFormData(prev => ({ ...prev, conseiller_id: value, cellule_id: "" }));
    } else if (name === "bapteme_eau" || name === "bapteme_esprit") {
      setFormData(prev => ({ ...prev, [name]: value === "true" }));
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

  // -------------------- SUBMIT --------------------
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
        bapteme_eau: formData.bapteme_eau,
        bapteme_esprit: formData.bapteme_esprit,
        Formation: formData.Formation || "",
        Soin_Pastoral: formData.Soin_Pastoral || "",
        Commentaire_Suivi_Evangelisation: formData.Commentaire_Suivi_Evangelisation || "",
        priere_salut: formData.priere_salut || "",
        type_conversion: formData.type_conversion || "",
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

  // -------------------- UI --------------------
  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="relative w-full max-w-lg p-6 rounded-3xl shadow-2xl bg-gradient-to-b from-[rgba(46,49,146,0.16)] to-[rgba(46,49,146,0.4)]" style={{ backdropFilter: "blur(8px)" }}>
        <button onClick={onClose} className="absolute top-4 right-4 text-red-600 font-bold text-xl">✕</button>
        <h2 className="text-2xl font-bold text-center mb-6 text-white">
          Modifier le profil {member.prenom} {member.nom}
        </h2>

        <div className="overflow-y-auto max-h-[70vh] flex flex-col gap-4 text-white">

          {/* Prénom / Nom / Téléphone / Ville */}
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

          {/* Bapteme d'eau */}
          <div className="flex flex-col">
            <label className="font-medium">Bapteme d'eau</label>
            <select name="bapteme_eau" value={formData.bapteme_eau.toString()} onChange={handleChange} className="input">
              <option value="true">Oui</option>
              <option value="false">Non</option>
            </select>
          </div>

          {/* Bapteme de feu */}
          <div className="flex flex-col">
            <label className="font-medium">Bapteme de feu</label>
            <select name="bapteme_esprit" value={formData.bapteme_esprit.toString()} onChange={handleChange} className="input">
              <option value="true">Oui</option>
              <option value="false">Non</option>
            </select>
          </div>

          {/* Formation */}
          <div className="flex flex-col">
            <label className="font-medium">Formation</label>
            <textarea name="Formation" value={formData.Formation} onChange={handleChange} className="input" rows={2} />
          </div>

          {/* Soin Pastoral */}
          <div className="flex flex-col">
            <label className="font-medium">Soin Pastoral</label>
            <textarea name="Soin_Pastoral" value={formData.Soin_Pastoral} onChange={handleChange} className="input" rows={2} />
          </div>

          {/* Commentaire Suivi Evangelisation */}
          <div className="flex flex-col">
            <label className="font-medium">Commentaire Suivi Evangelisation</label>
            <textarea name="Commentaire_Suivi_Evangelisation" value={formData.Commentaire_Suivi_Evangelisation} onChange={handleChange} className="input" rows={2} />
          </div>

          {/* Prière du salut */}
          <label className="text-sm sm:text-base font-semibold">Prière du salut</label>
          <select
            className="input"
            value={formData.priere_salut}
            onChange={(e) => {
              const value = e.target.value;
              setFormData({ ...formData, priere_salut: value, type_conversion: value === "Oui" ? formData.type_conversion : "" });
            }}
          >
            <option value="">-- Choisir --</option>
            <option value="Oui">Oui</option>
            <option value="Non">Non</option>
          </select>

          {/* Type de conversion */}
          {formData.priere_salut === "Oui" && (
            <>
              <label className="text-sm sm:text-base font-semibold">Type de conversion</label>
              <select
                className="input"
                value={formData.type_conversion}
                onChange={(e) => setFormData({ ...formData, type_conversion: e.target.value })}
              >
                <option value="">-- Choisir --</option>
                <option value="Nouveau converti">Nouveau converti</option>
                <option value="Réconciliation">Réconciliation</option>
              </select>
            </>
          )}

          {/* WhatsApp */}
          <label className="flex items-center gap-2 text-sm sm:text-base">
            <input
              type="checkbox"
              checked={formData.is_whatsapp}
              onChange={(e) => setFormData({ ...formData, is_whatsapp: e.target.checked })}
            />
            Numéro WhatsApp
          </label>

        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-4">
          <button type="button" onClick={onClose} className="w-full bg-gray-400 hover:bg-gray-500 text-white font-bold py-3 rounded-2xl shadow-md transition-all">Annuler</button>
          <button type="button" onClick={handleSubmit} disabled={loading} className="w-full bg-gradient-to-r from-blue-400 to-indigo-500 hover:from-blue-500 hover:to-indigo-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3 rounded-2xl shadow-md transition-all">
            {loading ? "Enregistrement..." : "Sauvegarder"}
          </button>
        </div>

        {/* Message succès ou erreur */}
        {message && <p className="text-[#25297e] font-semibold text-center mt-3">{message}</p>}

        <style jsx>{`
          label { font-weight: 600; color: white; }
          .input {
            width: 100%;
            border: 1px solid #a0c4ff;
            border-radius: 14px;
            padding: 12px;
            background: rgba(255,255,255,0.1);
            color: white;
            font-weight: 400;
          }
          select.input { font-weight: 400; color: white; }
          select.input option { background: white; color: black; font-weight: 400; }
        `}</style>

      </div>
    </div>
  );
}
