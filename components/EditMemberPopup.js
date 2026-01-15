"use client";

import { useState } from "react";

export default function EditMemberPopup({ member, onClose, onSave }) {
  const [formData, setFormData] = useState({
    prenom: member?.prenom || "",
    nom: member?.nom || "",
    telephone: member?.telephone || "",
    ville: member?.ville || "",
    sexe: member?.sexe || "",
    star: member?.star || false,

    etat_contact: member?.etat_contact || "",

    bapteme_eau: member?.bapteme_eau || "",
    bapteme_feu: member?.bapteme_feu || "",

    priere_salut: member?.priere_salut || "",
    type_conversion: member?.type_conversion || "",

    cellule_id: member?.cellule_id || "",
    conseiller_id: member?.conseiller_id || "",

    besoins: member?.besoins || [],
    comment_venu: member?.comment_venu || "",
    infos_supp: member?.infos_supp || "",

    statut_arrivee: member?.statut_arrivee || "",
    statut_suivis: member?.statut_suivis ?? "",
    commentaire_suivis: member?.commentaire_suivis || "",
  });

  const besoinsOptions = [
    "Finances",
    "Santé",
    "Travail",
    "Les Enfants",
    "La Famille",
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const toggleBesoin = (besoin) => {
    setFormData((prev) => ({
      ...prev,
      besoins: prev.besoins.includes(besoin)
        ? prev.besoins.filter((b) => b !== besoin)
        : [...prev.besoins, besoin],
    }));
  };

  const handleSubmit = () => {
    onSave({
      ...formData,
      statut_suivis: formData.statut_suivis
        ? Number(formData.statut_suivis)
        : null,
      type_conversion:
        formData.priere_salut === "Oui"
          ? formData.type_conversion
          : null,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl w-full max-w-3xl p-6 overflow-y-auto max-h-[90vh]">

        <h2 className="text-xl font-bold mb-6">Modifier le membre</h2>

        {/* IDENTITÉ */}
        <div className="grid grid-cols-2 gap-4">
          <Field label="Prénom">
            <input name="prenom" value={formData.prenom} onChange={handleChange} className="input" />
          </Field>

          <Field label="Nom">
            <input name="nom" value={formData.nom} onChange={handleChange} className="input" />
          </Field>

          <Field label="Téléphone">
            <input name="telephone" value={formData.telephone} onChange={handleChange} className="input" />
          </Field>

          <Field label="Ville">
            <input name="ville" value={formData.ville} onChange={handleChange} className="input" />
          </Field>

          <Field label="Sexe">
            <select name="sexe" value={formData.sexe} onChange={handleChange} className="input">
              <option value="">-- Sexe --</option>
              <option value="Homme">Homme</option>
              <option value="Femme">Femme</option>
            </select>
          </Field>

          <div className="flex items-center gap-2 mt-6">
            <input
              type="checkbox"
              checked={formData.star}
              onChange={(e) =>
                setFormData({ ...formData, star: e.target.checked })
              }
            />
            <label className="font-medium">Définir en tant que serviteur ⭐</label>
          </div>
        </div>

        {/* ÉTAT CONTACT */}
        <Field label="État du contact">
          <select
            name="etat_contact"
            value={formData.etat_contact}
            onChange={handleChange}
            className="input"
          >
            <option value="">-- État du contact --</option>
            <option value="Nouveau">Nouveau</option>
            <option value="Existant">Existant</option>
            <option value="Inactif">Inactif</option>
          </select>
        </Field>

        {/* BAPTÊMES */}
        <div className="grid grid-cols-2 gap-4">
          <Field label="Baptême d’eau">
            <select name="bapteme_eau" value={formData.bapteme_eau} onChange={handleChange} className="input">
              <option value="">-- Oui / Non --</option>
              <option value="Oui">Oui</option>
              <option value="Non">Non</option>
            </select>
          </Field>

          <Field label="Baptême de feu">
            <select name="bapteme_feu" value={formData.bapteme_feu} onChange={handleChange} className="input">
              <option value="">-- Oui / Non --</option>
              <option value="Oui">Oui</option>
              <option value="Non">Non</option>
            </select>
          </Field>
        </div>

        {/* PRIÈRE DU SALUT */}
        <Field label="Prière du salut">
          <select
            className="input"
            value={formData.priere_salut}
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
        </Field>

        {formData.priere_salut === "Oui" && (
          <Field label="Type de conversion">
            <select
              className="input"
              value={formData.type_conversion}
              onChange={(e) =>
                setFormData({ ...formData, type_conversion: e.target.value })
              }
            >
              <option value="">Type</option>
              <option value="Nouveau converti">Nouveau converti</option>
              <option value="Réconciliation">Réconciliation</option>
            </select>
          </Field>
        )}

        {/* BESOINS */}
        <div>
          <label className="font-medium block mb-2">Besoins</label>
          <div className="grid grid-cols-2 gap-2">
            {besoinsOptions.map((b) => (
              <label key={b} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.besoins.includes(b)}
                  onChange={() => toggleBesoin(b)}
                />
                {b}
              </label>
            ))}
          </div>
        </div>

        {/* STATUT SUIVI */}
        <Field label="Statut du suivi">
          <select
            value={String(formData.statut_suivis ?? "")}
            onChange={(e) =>
              setFormData({ ...formData, statut_suivis: e.target.value })
            }
            className="input"
          >
            <option value="">-- Sélectionner un statut --</option>
            <option value="2">En attente</option>
            <option value="3">Intégré</option>
            <option value="4">Refus</option>
          </select>
        </Field>

        <Field label="Commentaire suivis">
          <textarea
            className="input"
            rows={3}
            value={formData.commentaire_suivis}
            onChange={(e) =>
              setFormData({ ...formData, commentaire_suivis: e.target.value })
            }
          />
        </Field>

        {/* ACTIONS */}
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="btn-secondary">
            Annuler
          </button>
          <button onClick={handleSubmit} className="btn-primary">
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}

/* 🔹 Champ avec label standard */
function Field({ label, children }) {
  return (
    <div className="flex flex-col mb-4">
      <label className="font-medium mb-1">{label}</label>
      {children}
    </div>
  );
}
