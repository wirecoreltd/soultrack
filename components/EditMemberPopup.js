"use client";

import { useState, useEffect } from "react";
import supabase from "../lib/supabaseClient";

export default function EditMemberPopup({ member, onClose, onUpdateMember }) {
  if (!member) return null;

  const besoinsOptions = ["Finances", "Santé", "Travail", "Les Enfants", "La Famille"];
  const [autreMinistere, setAutreMinistere] = useState("");

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
    sexe: member?.sexe || "",
    star: !!member?.star,
    etat_contact: member?.etat_contact || "Nouveau",
    bapteme_eau: member?.bapteme_eau ?? null,
    bapteme_esprit: member?.bapteme_esprit ?? null,
    priere_salut: member?.priere_salut || "",
    type_conversion: member?.type_conversion || "",
    cellule_id: member?.cellule_id ?? "",
    conseiller_id: member?.conseiller_id ?? "",
    besoin: initialBesoin,
    autreBesoin: "",
    venu: member?.venu || "",
    infos_supplementaires: member?.infos_supplementaires || "",
    statut_initial: member?.statut_initial || "",
    suivi_statut: member?.suivi_statut || "",
    commentaire_suivis: member?.commentaire_suivis || "",
    is_whatsapp: !!member?.is_whatsapp,
    Formation: member?.Formation || "",
    Soin_Pastoral: member?.Soin_Pastoral || "",
    Ministere: parseBesoin(member?.Ministere),
    Commentaire_Suivi_Evangelisation: member?.Commentaire_Suivi_Evangelisation || "",

  });
  
    const ministereOptions = [
    "Intercession",
    "Louange",
    "Technique",
    "Communication",
    "Les Enfants",
    "Les ados",
    "Les jeunes",
    "Finance",
    "Nettoyage",
    "Conseiller",
    "Compassion",
    "Visite",
    "Berger",
    "Modération",
  ];

  const [showAutre, setShowAutre] = useState(initialBesoin.includes("Autre"));
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // -------------------- LOAD DATA --------------------
  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      try {
        const { data: cellulesData } = await supabase.from("cellules").select("id, cellule_full");
        const { data: conseillersData, error } = await supabase
        .from("profiles")
        .select("id, prenom, nom")
        .or('role.eq.Conseiller,roles.cs.{"Conseiller"}');
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
    setFormData(prev => ({
      ...prev,
      [name]: checked,
      // si on décoche "serviteur", on vide Ministere
      ...(name === "star" && !checked ? { Ministere: [] } : {}),
    }));

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

    let finalMinistere = [...formData.Ministere];
    if (finalMinistere.includes("Autre") && autreMinistere?.trim()) {
      finalMinistere = finalMinistere.filter(m => m !== "Autre");
      finalMinistere.push(autreMinistere.trim());
    }

    const payload = {
      prenom: formData.prenom,
      nom: formData.nom,
      telephone: formData.telephone || null,
      ville: formData.ville || null,
      sexe: formData.sexe || null,
      star: !!formData.star,
      etat_contact: formData.etat_contact || "Nouveau",
      bapteme_eau: formData.bapteme_eau,
      bapteme_esprit: formData.bapteme_esprit,
      priere_salut: formData.priere_salut || null,
      type_conversion: formData.type_conversion || null,
      cellule_id: formData.cellule_id || null,
      conseiller_id: formData.conseiller_id || null,
      besoin: JSON.stringify(finalBesoin),
      venu: formData.venu || null,
      infos_supplementaires: formData.infos_supplementaires || null,
      statut_initial: formData.statut_initial || null,
      suivi_statut: formData.suivi_statut || null,
      commentaire_suivis: formData.commentaire_suivis || null,
      is_whatsapp: !!formData.is_whatsapp,
      Formation: formData.Formation || null,
      Soin_Pastoral: formData.Soin_Pastoral || null,
      Commentaire_Suivi_Evangelisation: formData.Commentaire_Suivi_Evangelisation || null,
      Ministere: formData.star ? JSON.stringify(finalMinistere) : null,
    };

    // 1️⃣ Update
    const { error } = await supabase
      .from("membres_complets")
      .update(payload)
      .eq("id", member.id);

    if (error) throw error;

    // 2️⃣ Récupérer le membre exact depuis Supabase
    const { data: updatedMember, error: selectError } = await supabase
      .from("membres_complets")
      .select("*")
      .eq("id", member.id)
      .single();

    if (selectError) throw selectError;

    // 3️⃣ Passer au parent → mise à jour instantanée de la table
    onUpdateMember(updatedMember);
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

          {["prenom", "nom", "telephone", "ville"].map((f) => (
            <div key={f} className="flex flex-col">
              <label className="font-medium capitalize">{f}</label>
          
              <input
                name={f}
                value={formData[f]}
                onChange={handleChange}
                className="input"
              />
          
              {/* Checkbox WhatsApp sous téléphone */}
              {f === "telephone" && (
                <div className="flex items-center gap-3 mt-3">
                  <label className="font-medium">Numéro Whatsapp</label>
                  <input
                    type="checkbox"
                    name="is_whatsapp"
                    checked={formData.is_whatsapp}
                    onChange={handleChange}
                    className="accent-[#25297e]"
                  />
                </div>
              )}
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

          {/* Serviteur */}         
          <div className="flex items-center gap-3 mt-3">
            <label className="font-medium">
              Définir en tant que serviteur
            </label>
            <input
              type="checkbox"
              name="star"
              checked={formData.star}
              onChange={handleChange}
              className="accent-[#25297e]"
            />
          </div>
            
          {/* Ministere */}    
          {formData.star && (
            <div className="flex flex-col gap-2">
              <label className="font-medium">Ministère</label>
          
              {ministereOptions.map((m) => (
                <label
                  key={m}
                  className="flex items-center gap-3"
                >
                  <input
                    type="checkbox"
                    value={m}
                    checked={formData.Ministere.includes(m)}
                    onChange={(e) => {
                      const { value, checked } = e.target;
                      setFormData(prev => ({
                        ...prev,
                        Ministere: checked
                          ? [...prev.Ministere, value]
                          : prev.Ministere.filter(v => v !== value),
                      }));
                    }}
                    className="accent-[#25297e]"
                  />
                  <span>{m}</span>
                </label>
              ))}
          
              {/* OPTION AUTRE */}
              <label className="flex items-center gap-3 mt-2">
                <input
                  type="checkbox"
                  checked={formData.Ministere.includes("Autre")}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setFormData(prev => ({
                      ...prev,
                      Ministere: checked
                        ? [...prev.Ministere, "Autre"]
                        : prev.Ministere.filter(v => v !== "Autre"),
                    }));
                    if (!checked) setAutreMinistere("");
                  }}
                  className="accent-[#25297e]"
                />
                <span>Autre</span>
              </label>
          
              {/* CHAMP TEXTE AUTRE */}
              {formData.Ministere.includes("Autre") && (
                <input
                  type="text"
                  className="input mt-2"
                  placeholder="Précisez le ministère"
                  value={autreMinistere}
                  onChange={(e) => setAutreMinistere(e.target.value)}
                />
              )}
            </div>
          )}
          {/* État du contact */}
          <div className="flex flex-col">
            <label className="font-medium">État du contact</label>
            <select name="etat_contact" value={formData.etat_contact} onChange={handleChange} className="input">
              <option value="">-- Sélectionner --</option>
              <option value="Nouveau">Nouveau</option>
              <option value="Existant">Existant</option>
              <option value="Inactif">Inactif</option>
            </select>
          </div>

            {/* Bapteme de d'eau */}
          <div className="flex flex-col">
            <label className="font-medium">Baptême d'eau</label>
            <select
              name="bapteme_eau"
              value={formData.bapteme_eau ?? ""}
              onChange={handleChange}
              className="input"
            >
              <option value="">-- Sélectionner --</option>
              <option value="Oui">Oui</option>
              <option value="Non">Non</option>
            </select>
          </div>

          {/* Bapteme de feu */}
          <div className="flex flex-col">
              <label className="font-medium">Baptême de feu</label>
              <select
                name="bapteme_esprit"
                value={formData.bapteme_esprit ?? ""}
                onChange={handleChange}
                className="input"
              >
                <option value="">-- Sélectionner --</option>
                <option value="Oui">Oui</option>
                <option value="Non">Non</option>
              </select>
            </div>



           {/* Formation*/}
          <div className="flex flex-col">
            <label className="font-medium">Formation</label>
            <textarea
              name="Formation"
              value={formData.Formation}
              onChange={handleChange}
              className="input"
              rows={2}
            />
          </div>

          {/* Soin Pastoral*/}
          <div className="flex flex-col">
            <label className="font-medium">Soin_Pastoral</label>
            <textarea
              name="Soin_Pastoral"
              value={formData.Soin_Pastoral}
              onChange={handleChange}
              className="input"
              rows={2}
            />
          </div>
            
          {/* Prière du salut */}
          <div className="flex flex-col">
            <label className="font-medium">Prière du salut</label>
            <select
              className="input"
              name="priere_salut"
              value={formData.priere_salut}
              required
              onChange={(e) => {
                const value = e.target.value;
                setFormData({
                  ...formData,
                  priere_salut: value,
                  type_conversion: value === "Oui" ? formData.type_conversion : "",
                });
              }}
            >
              <option value="">-- Prière du salut ? --</option>
              <option value="Oui">Oui</option>
              <option value="Non">Non</option>
            </select>

            {/* Type de conversion */}
            {formData.priere_salut === "Oui" && (
              <select
                className="input mt-2"
                name="type_conversion"
                value={formData.type_conversion}
                onChange={handleChange}
                required
              >
                <option value="">Type</option>
                <option value="Nouveau converti">Nouveau converti</option>
                <option value="Réconciliation">Réconciliation</option>
              </select>
            )}
          </div>

          {/* Cellule */}
          <div className="flex flex-col">
            <label className="font-medium">Cellule</label>
            <select name="cellule_id" value={formData.cellule_id ?? ""} onChange={handleChange} className="input" disabled={loadingData}>
              <option value="">-- Cellule --</option>
              {cellules.map(c => (
                <option key={c.id} value={c.id}>{c.cellule_full}</option>
              ))}
            </select>
          </div>

          {/* Conseiller */}
          <div className="flex flex-col">
            <label className="font-medium">Conseiller</label>
            <select name="conseiller_id" value={formData.conseiller_id ?? ""} onChange={handleChange} className="input" disabled={loadingData}>
              <option value="">-- Conseiller --</option>
              {conseillers.map(c => (
                <option key={c.id} value={c.id}>{c.prenom} {c.nom}</option>
              ))}
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
                       {/* Comment est-il venu ? */}
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

          {/* Informations supplémentaires */}
          <div className="flex flex-col">
            <label className="font-medium">Informations supplémentaires</label>
            <textarea
              name="infos_supplementaires"
              value={formData.infos_supplementaires}
              onChange={handleChange}
              className="input"
              rows={2}
            />
          </div>

          {/* Statut à l'arrivée */}
          <div className="flex flex-col">
            <label className="font-medium">Statut à l'arrivée</label>
            <select
              name="statut_initial"
              value={formData.statut_initial}
              onChange={handleChange}
              className="input"
            >
              <option value="">-- Sélectionner --</option>
              <option value="veut rejoindre ICC">Veut rejoindre ICC</option>
              <option value="a déjà son église">A déjà son église</option>
              <option value="visiteur">Visiteur</option>
            </select>
          </div>

          {/* Suivi statut */}
          <div className="flex flex-col">
            <label className="font-medium">Suivi statut</label>
            <select
              value={formData.suivi_statut ?? ""}
              onChange={(e) => setFormData(prev => ({ ...prev, suivi_statut: e.target.value }))}
              className="input"
            >
              <option value="">-- Sélectionner un statut --</option>
              <option value="En Attente">En Attente</option>
              <option value="Intégrer">Intégrer</option>
              <option value="Refus">Refus</option>
            </select>
          </div>

          {/* Commentaire suivis */}
          <div className="flex flex-col">
            <label className="font-medium">Commentaire suivis</label>
            <textarea
              name="commentaire_suivis"
              value={formData.commentaire_suivis}
              onChange={handleChange}
              className="input"
              rows={2}
            />
          </div>

                {/* Commentaire suivis Evangélisation */}
          <div className="flex flex-col">
            <label className="font-medium">Commentaire suivis Evangélisation</label>
            <textarea
              name="Commentaire_Suivi_Evangelisation"
              value={formData.Commentaire_Suivi_Evangelisation}
              onChange={handleChange}
              className="input"
              rows={2}
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full bg-gray-400 hover:bg-gray-500 text-white font-bold py-3 rounded-2xl shadow-md transition-all"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-400 to-indigo-500 hover:from-blue-500 hover:to-indigo-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3 rounded-2xl shadow-md transition-all"
          >
            {loading ? "Enregistrement..." : "Sauvegarder"}
          </button>
        </div>

        {/* Message succès ou erreur sous les boutons */}
        {message && (
          <p className="text-[#25297e] font-semibold text-center mt-3">
            {message}
          </p>
        )}

        {/* Styles */}
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
            font-weight: 400;
          }

          select.input {
            font-weight: 400;
            color: white;
          }

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
