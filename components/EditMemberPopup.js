"use client";

import { useState, useEffect } from "react";
import supabase from "../lib/supabaseClient";

export default function EditMemberPopup({ member, onClose, onUpdateMember }) {
  const besoinsOptions = ["Finances", "Santé", "Travail", "Les Enfants", "La Famille"];

  const initialBesoin =
    typeof member.besoin === "string"
      ? JSON.parse(member.besoin || "[]")
      : member.besoin || [];

  const [cellules, setCellules] = useState([]);
  const [conseillers, setConseillers] = useState([]);

  const [formData, setFormData] = useState({
    prenom: member.prenom || "",
    nom: member.nom || "",
    telephone: member.telephone || "",
    ville: member.ville || "",
    besoin: initialBesoin,
    autreBesoin: "",
    statut: member.statut || "",
    cellule_id: member.cellule_id || "",
    conseiller_id: member.conseiller_id || "",
    infos_supplementaires: member.infos_supplementaires || "",
    is_whatsapp: member.is_whatsapp || false,
    star: member.star === true,
  });

  const [showAutre, setShowAutre] = useState(initialBesoin.includes("Autre"));
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // ---------------------------
  // LOAD CELLULES + CONSEILLERS
  // ---------------------------
  useEffect(() => {
    async function loadData() {
      const { data: cellulesData } = await supabase
        .from("cellules")
        .select("id, cellule");

      const { data: conseillersData } = await supabase
        .from("profiles")
        .select("id, prenom, nom")
        .eq("role", "Conseiller");

      setCellules(cellulesData || []);
      setConseillers(conseillersData || []);
    }
    loadData();
  }, []);

  // ---------------------------
  // HANDLERS
  // ---------------------------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBesoinChange = (e) => {
    const { value, checked } = e.target;

    if (value === "Autre") {
      setShowAutre(checked);
      if (!checked) {
        setFormData((prev) => ({
          ...prev,
          autreBesoin: "",
          besoin: prev.besoin.filter((b) => b !== "Autre"),
        }));
      }
    }

    setFormData((prev) => {
      const updated = checked
        ? [...prev.besoin, value]
        : prev.besoin.filter((b) => b !== value);
      return { ...prev, besoin: updated };
    });
  };

  const toggleStar = () => {
    setFormData((prev) => ({ ...prev, star: !prev.star }));
  };

  // ---------------------------
  // SAVE CHANGES
  // ---------------------------
  const handleSubmit = async () => {
    setLoading(true);

    const sendData = {
      ...formData,
      besoin:
        formData.autreBesoin && showAutre
          ? [...formData.besoin.filter((b) => b !== "Autre"), formData.autreBesoin]
          : formData.besoin,
    };

    const { data, error } = await supabase
      .from("membres")
      .update(sendData)
      .eq("id", member.id)
      .select()
      .single();

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    if (onUpdateMember) onUpdateMember(data);

    setTimeout(() => {
      setSuccess(false);
      onClose();
    }, 1200);

    setLoading(false);
  };

  // ---------------------------
  // UI
  // ---------------------------
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-3xl w-full max-w-md shadow-xl relative overflow-y-auto max-h-[95vh]">

        {/* CLOSE */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-red-500 font-bold text-xl hover:text-red-700"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold text-center mb-4">Modifier le membre</h2>

        {/* STAR */}
        <div className="flex justify-center mb-4">
          <button onClick={toggleStar} className="text-4xl">
            {formData.star ? "⭐" : "☆"}
          </button>
        </div>

        <div className="flex flex-col gap-4">

          <input type="text" placeholder="Prénom" name="prenom" value={formData.prenom} onChange={handleChange} className="input" />
          <input type="text" placeholder="Nom" name="nom" value={formData.nom} onChange={handleChange} className="input" />
          <input type="text" placeholder="Téléphone" name="telephone" value={formData.telephone} onChange={handleChange} className="input" />

          {/* WhatsApp */}
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={formData.is_whatsapp} onChange={(e)=>setFormData({...formData,is_whatsapp:e.target.checked})} />
            WhatsApp
          </label>

          <input type="text" placeholder="Ville" name="ville" value={formData.ville} onChange={handleChange} className="input" />

          {/* STATUT */}
          <select name="statut" value={formData.statut} onChange={handleChange} className="input">
            <option value="">-- Statut --</option>
            <option value="veut rejoindre ICC">Veut rejoindre ICC</option>
            <option value="a déjà son église">A déjà son église</option>
            <option value="visiteur">Visiteur</option>
            <option value="actif">Actif</option>
            <option value="ancien">Ancien</option>
            <option value="Integrer">Intégrer</option>
          </select>

          {/* CELLULE */}
          <select name="cellule_id" value={formData.cellule_id} onChange={handleChange} className="input">
            <option value="">-- Cellule --</option>
            {cellules.map((c) => (
              <option key={c.id} value={c.id}>{c.cellule}</option>
            ))}
          </select>

          {/* CONSEILLER */}
          <select name="conseiller_id" value={formData.conseiller_id} onChange={handleChange} className="input">
            <option value="">-- Conseiller --</option>
            {conseillers.map((c) => (
              <option key={c.id} value={c.id}>{c.prenom} {c.nom}</option>
            ))}
          </select>

          {/* BESOIN */}
          <div>
            <p className="font-semibold mb-2">Besoin :</p>
            {besoinsOptions.map((item) => (
              <label key={item} className="flex items-center gap-3 mb-2">
                <input type="checkbox" value={item} checked={formData.besoin.includes(item)} onChange={handleBesoinChange} />
                {item}
              </label>
            ))}

            {/* AUTRE */}
            <label className="flex items-center gap-3 mb-2">
              <input type="checkbox" value="Autre" checked={showAutre} onChange={handleBesoinChange} />
              Autre
            </label>

            {showAutre && (
              <input
                type="text"
                name="autreBesoin"
                value={formData.autreBesoin}
                onChange={handleChange}
                placeholder="Précisez..."
                className="input"
              />
            )}
          </div>

          <textarea
            name="infos_supplementaires"
            placeholder="Informations supplémentaires..."
            rows={2}
            value={formData.infos_supplementaires}
            onChange={handleChange}
            className="input"
          />

          {/* BUTTONS */}
          <div className="flex gap-4 mt-2">
            <button onClick={onClose} className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-bold py-3 rounded-2xl shadow-md">Annuler</button>
            <button onClick={handleSubmit} disabled={loading} className="flex-1 bg-gradient-to-r from-blue-400 to-indigo-500 hover:from-blue-500 hover:to-indigo-600 text-white font-bold py-3 rounded-2xl shadow-md">
              {loading ? "Enregistrement..." : "Sauvegarder"}
            </button>
          </div>

          {success && (
            <p className="text-green-600 font-semibold text-center mt-3">✔️ Modifié avec succès !</p>
          )}
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
