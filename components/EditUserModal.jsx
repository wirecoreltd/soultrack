"use client";

import { useState, useEffect } from "react";
import supabase from "../lib/supabaseClient";

export default function EditUserModal({ user, onClose, onUpdated }) {
  const [form, setForm] = useState({
    prenom: "",
    nom: "",
    email: "",
    telephone: "",
    roles: [],
  });

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [cellules, setCellules] = useState([]);
  const [selectedCelluleIds, setSelectedCelluleIds] = useState([]);

  const allRoles = [
    { value: "Administrateur", label: "Administrateur" },
    { value: "ResponsableIntegration", label: "Responsable Intégration" },
    { value: "ResponsableCellule", label: "Responsable Cellule" },
    { value: "ResponsableEvangelisation", label: "Responsable Évangélisation" },
    { value: "SuperviseurCellule", label: "Superviseur Cellule" },
    { value: "Conseiller", label: "Conseiller" },
  ];

  useEffect(() => {
    if (!user) return;
    setForm({
      prenom: user.prenom || "",
      nom: user.nom || "",
      email: user.email || "",
      telephone: user.telephone || "",
      roles: user.roles || [],
    });
  }, [user]);

  // ✅ Charger les cellules de l'église + les cellules déjà assignées à cet utilisateur
  useEffect(() => {
    if (!user?.eglise_id) return;

    const fetchCellules = async () => {
      const { data } = await supabase
        .from("cellules")
        .select("id, cellule_full, ville, cellule, responsable_id")
        .eq("eglise_id", user.eglise_id)
        .order("cellule_full");

      setCellules(data || []);

      // Pré-sélectionner les cellules déjà assignées à cet utilisateur
      const dejassignees = (data || [])
        .filter((c) => c.responsable_id === user.id)
        .map((c) => c.id);
      setSelectedCelluleIds(dejassignees);
    };

    fetchCellules();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (roleValue) => {
    setForm(prev => {
      const roles = prev.roles.includes(roleValue)
        ? prev.roles.filter(r => r !== roleValue)
        : [...prev.roles, roleValue];
      return { ...prev, roles };
    });
  };

  const handleCelluleChange = (celluleId) => {
    setSelectedCelluleIds(prev =>
      prev.includes(celluleId)
        ? prev.filter(id => id !== celluleId)
        : [...prev, celluleId]
    );
  };

  const handleSave = async () => {
    if (!user?.id) return;
    setSaving(true);

    // ✅ Mise à jour du profil
    const { data, error } = await supabase
      .from("profiles")
      .update({
        prenom: form.prenom,
        nom: form.nom,
        email: form.email,
        telephone: form.telephone,
        roles: form.roles,
        role_description: form.roles.join(" / "),
      })
      .eq("id", user.id)
      .select();

    if (error) {
      setSaving(false);
      alert("❌ Erreur lors de la mise à jour : " + error.message);
      return;
    }

    // ✅ Si ResponsableCellule : mettre à jour les cellules
    if (form.roles.includes("ResponsableCellule")) {
      // 1. Retirer ce responsable des cellules qu'il n'a plus
      const cellulesARetirer = cellules
        .filter(c => c.responsable_id === user.id && !selectedCelluleIds.includes(c.id))
        .map(c => c.id);

      if (cellulesARetirer.length > 0) {
        await supabase
          .from("cellules")
          .update({ responsable_id: null })
          .in("id", cellulesARetirer);
      }

      // 2. Assigner ce responsable aux cellules sélectionnées
      if (selectedCelluleIds.length > 0) {
        await supabase
          .from("cellules")
          .update({
            responsable_id: user.id,
            responsable: `${form.prenom} ${form.nom}`,
          })
          .in("id", selectedCelluleIds);
      }
    } else {
      // ✅ Si le rôle ResponsableCellule est retiré → désassigner toutes ses cellules
      await supabase
        .from("cellules")
        .update({ responsable_id: null })
        .eq("responsable_id", user.id);
    }

    setSaving(false);

    if (data && data.length > 0 && onUpdated) {
      onUpdated(data[0]);
    }

    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      onClose();
    }, 700);
  };

  if (!user) return null;

  const isResponsableCellule = form.roles.includes("ResponsableCellule");

  return (
    <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm z-50 p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex flex-col items-center mb-4">
          <img src="/logo.png" alt="Logo" className="w-20 h-20" />
          <h2 className="text-xl font-bold text-center mt-2">Modifier l'utilisateur</h2>
        </div>

        <div className="flex flex-col gap-4">
          <input type="text" name="prenom" value={form.prenom} onChange={handleChange} placeholder="Prénom" className="input" />
          <input type="text" name="nom" value={form.nom} onChange={handleChange} placeholder="Nom" className="input" />
          <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="Email" className="input" />
          <input type="text" name="telephone" value={form.telephone} onChange={handleChange} placeholder="Téléphone" className="input" />

          {/* Rôles */}
          <div className="flex flex-col gap-2">
            <label className="font-semibold">Rôles :</label>
            {allRoles.map(r => (
              <label key={r.value} className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.roles.includes(r.value)}
                  onChange={() => handleRoleChange(r.value)}
                />
                {r.label}
              </label>
            ))}
          </div>

          {/* ✅ Sélecteur de cellules — visible seulement si ResponsableCellule est coché */}
          {isResponsableCellule && (
            <div className="flex flex-col gap-2 mt-2 p-4 bg-green-50 rounded-2xl border border-green-200">
              <label className="font-semibold text-green-800">
                🏠 Cellules assignées :
              </label>
              {cellules.length === 0 ? (
                <p className="text-sm text-gray-500">Aucune cellule trouvée pour cette église.</p>
              ) : (
                cellules.map(c => (
                  <label key={c.id} className="inline-flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selectedCelluleIds.includes(c.id)}
                      onChange={() => handleCelluleChange(c.id)}
                      className="w-4 h-4"
                    />
                    <span>{c.cellule_full || `${c.ville} - ${c.cellule}`}</span>
                    {c.responsable_id && c.responsable_id !== user.id && (
                      <span className="text-xs text-orange-500">(déjà assignée)</span>
                    )}
                  </label>
                ))
              )}
            </div>
          )}

          <div className="flex gap-4 mt-4">
            <button onClick={onClose} className="flex-1 bg-gray-400 text-white font-bold py-3 rounded-2xl hover:bg-gray-500 transition">
              Annuler
            </button>
            <button onClick={handleSave} disabled={saving} className="flex-1 bg-gradient-to-r from-blue-400 to-indigo-500 text-white font-bold py-3 rounded-2xl hover:from-blue-500 hover:to-indigo-600 transition">
              {saving ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>

          {success && <p className="text-green-600 font-semibold text-center mt-2">✔️ Modifié avec succès !</p>}
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
