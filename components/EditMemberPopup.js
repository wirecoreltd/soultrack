"use client";

import { useState, useEffect } from "react";
import supabase from "../lib/supabaseClient";
import BoutonEnvoyer from "./BoutonEnvoyer";

export default function EditMemberPopup({
  member,
  cellules = [],
  conseillers = [],
  onClose,
  onUpdateMember,
  session = null,
  showToast = () => {},
}) {
  const besoinsOptions = ["Finances", "Santé", "Travail", "Les Enfants", "La Famille"];

  const initialBesoin =
    typeof member.besoin === "string"
      ? JSON.parse(member.besoin || "[]")
      : member.besoin || [];

  const [formData, setFormData] = useState({
    prenom: member.prenom || "",
    nom: member.nom || "",
    telephone: member.telephone || "",
    ville: member.ville || "",
    besoin: initialBesoin,
    autreBesoin: "",
    infos_supplementaires: member.infos_supplementaires || "",
    statut: member.statut || "",
    cellule_id: member.cellule_id || "",
  });

  const [showAutre, setShowAutre] = useState(initialBesoin.includes("Autre"));
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Gestion des dropdown “Envoyer à”
  const [selectedTargetType, setSelectedTargetType] = useState({ [member.id]: member.cellule_id ? "cellule" : member.conseiller_id ? "conseiller" : "" });
  const [selectedTargets, setSelectedTargets] = useState({ [member.id]: member.cellule_id || member.conseiller_id || "" });

  const handleBesoinChange = (e) => {
    const { value, checked } = e.target;
    if (value === "Autre") {
      setShowAutre(checked);
      if (!checked) {
        setFormData(prev => ({
          ...prev,
          autreBesoin: "",
          besoin: prev.besoin.filter(b => b !== "Autre")
        }));
      }
    }
    setFormData(prev => {
      const updatedBesoin = checked ? [...prev.besoin, value] : prev.besoin.filter(b => b !== value);
      return { ...prev, besoin: updatedBesoin };
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    const cleanData = {
      prenom: formData.prenom || member.prenom,
      nom: formData.nom || member.nom,
      ville: formData.ville || null,
      telephone: formData.telephone || null,
      infos_supplementaires: formData.infos_supplementaires || null,
      statut: formData.statut || null,
      cellule_id: formData.cellule_id || null,
      besoin: formData.autreBesoin && showAutre
        ? [...formData.besoin.filter(b => b !== "Autre"), formData.autreBesoin]
        : formData.besoin,
    };

    const { error, data } = await supabase
      .from("membres")
      .update(cleanData)
      .eq("id", member.id)
      .select()
      .single();

    if (error) {
      alert("❌ Erreur lors de la mise à jour : " + error.message);
    } else {
      if (onUpdateMember) onUpdateMember(data);
      setMessage("✅ Changement enregistré !");
      setTimeout(() => {
        setMessage("");
        onClose();
      }, 1500);
    }
    setLoading(false);
  };

  const handleAfterSend = (id, type, cible) => {
    showToast("✅ Contact envoyé et suivi enregistré");
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-96 max-h-[90vh] overflow-y-auto shadow-xl relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-red-500 font-bold hover:text-red-700">✕</button>
        <h2 className="text-lg font-bold text-gray-800 text-center mb-4">Modifier {member.prenom} {member.nom}</h2>

        <div className="flex flex-col space-y-2 text-sm">
          <input name="prenom" value={formData.prenom} onChange={handleChange} placeholder="Prénom" className="border rounded px-2 py-1" />
          <input name="nom" value={formData.nom} onChange={handleChange} placeholder="Nom" className="border rounded px-2 py-1" />
          <input name="ville" value={formData.ville} onChange={handleChange} placeholder="Ville" className="border rounded px-2 py-1" />
          <input name="telephone" value={formData.telephone} onChange={handleChange} placeholder="Téléphone" className="border rounded px-2 py-1" />

          <div className="mt-2">
            <p className="font-semibold mb-2">Besoins :</p>
            {besoinsOptions.map(item => (
              <label key={item} className="flex items-center gap-3 mb-2">
                <input type="checkbox" value={item} checked={formData.besoin.includes(item)} onChange={handleBesoinChange} className="w-5 h-5 rounded border-gray-400 cursor-pointer" />
                <span>{item}</span>
              </label>
            ))}
            <label className="flex items-center gap-3 mb-2">
              <input type="checkbox" value="Autre" checked={showAutre} onChange={handleBesoinChange} className="w-5 h-5 rounded border-gray-400 cursor-pointer" />
              Autre
            </label>
            {showAutre && (
              <input type="text" name="autreBesoin" value={formData.autreBesoin} onChange={handleChange} placeholder="Précisez..." className="border rounded px-2 py-1 w-full" />
            )}
          </div>

          <textarea name="infos_supplementaires" value={formData.infos_supplementaires} onChange={handleChange} placeholder="Infos supplémentaires" className="border rounded px-2 py-1" rows={3} />

          <select name="statut" value={formData.statut} onChange={handleChange} className="border rounded px-2 py-1">
            <option value="">-- Statut --</option>
            <option value="actif">actif</option>
            <option value="Integrer">Integrer</option>
            <option value="ancien">ancien</option>
            <option value="veut rejoindre ICC">veut rejoindre ICC</option>
            <option value="visiteur">visiteur</option>
            <option value="a déjà mon église">a déjà mon église</option>
          </select>

          {/* --- Envoi Cellule / Conseiller --- */}
          <div className="mt-2">
            <label className="font-semibold text-sm">Envoyer à :</label>
            <select
              value={selectedTargetType[member.id] || ""}
              onChange={e => {
                setSelectedTargetType(prev => ({ ...prev, [member.id]: e.target.value }));
                setSelectedTargets(prev => ({ ...prev, [member.id]: "" }));
              }}
              className="mt-1 w-full border rounded px-2 py-1 text-sm"
            >
              <option value="">-- Choisir une option --</option>
              <option value="cellule">Une Cellule</option>
              <option value="conseiller">Un Conseiller</option>
            </select>

            {(selectedTargetType[member.id] === "cellule" || selectedTargetType[member.id] === "conseiller") && (
              <select
                value={selectedTargets[member.id] || ""}
                onChange={e => setSelectedTargets(prev => ({ ...prev, [member.id]: e.target.value }))}
                className="mt-1 w-full border rounded px-2 py-1 text-sm"
              >
                <option value="">-- Choisir {selectedTargetType[member.id]} --</option>
                {selectedTargetType[member.id] === "cellule"
                  ? cellules.map(c => <option key={c.id} value={c.id}>{c.cellule} ({c.responsable})</option>)
                  : conseillers.map(c => <option key={c.id} value={c.id}>{c.prenom} {c.nom}</option>)
                }
              </select>
            )}

            {selectedTargets[member.id] && (
              <div className="pt-2">
                <BoutonEnvoyer
                  membre={member}
                  type={selectedTargetType[member.id]}
                  cible={selectedTargetType[member.id] === "cellule"
                    ? cellules.find(c => c.id === selectedTargets[member.id])
                    : conseillers.find(c => c.id === selectedTargets[member.id])
                  }
                  onEnvoyer={id => handleAfterSend(id, selectedTargetType[member.id],
                    selectedTargetType[member.id] === "cellule"
                      ? cellules.find(c => c.id === selectedTargets[member.id])
                      : conseillers.find(c => c.id === selectedTargets[member.id])
                  )}
                  session={session}
                  showToast={showToast}
                />
              </div>
            )}
          </div>
        </div>

        {message && <p className="text-green-600 text-center mt-3 font-semibold">{message}</p>}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`mt-4 w-full text-white py-2 rounded transition font-bold ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
        >
          {loading ? "Enregistrement..." : "Enregistrer"}
        </button>
      </div>
    </div>
  );
}
