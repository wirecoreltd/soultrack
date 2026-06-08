"use client";

import { useState, useEffect, useMemo } from "react";
import supabase from "../lib/supabaseClient";
import { useFeature } from "../components/FeaturesContext";

export default function EditUserModal({ user, onClose, onUpdated }) {
  // ✅ Tous les hooks en premier — avant tout return conditionnel
  const cellulesActive = useFeature("cellules");
  const conseillerActive = useFeature("conseiller");
  const famillesActive = useFeature("familles");

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

  // ✅ allRoles conditionné par features — seuls les rôles actifs sont proposés
  const allRoles = useMemo(() => [
    { value: "Administrateur",            label: "Administrateur" },
    { value: "ResponsableIntegration",    label: "Responsable Intégration" },
    { value: "ResponsableCheckIn",        label: "Responsable CheckIn" },
    ...(cellulesActive ? [
      { value: "ResponsableCellule",      label: "Responsable Cellule" },
      { value: "SuperviseurCellule",      label: "Superviseur Cellule" },
    ] : []),
    { value: "ResponsableEvangelisation", label: "Responsable Évangélisation" },
    ...(conseillerActive ? [
      { value: "Conseiller",              label: "Conseiller" },
    ] : []),
    ...(famillesActive ? [
      { value: "ResponsableFamilles",     label: "Responsable Familles" },
    ] : []),
  ], [cellulesActive, conseillerActive, famillesActive]);

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

  // ✅ Chargement Supabase conditionné par la feature cellules
  useEffect(() => {
    if (!user?.eglise_id) return;
    if (!cellulesActive) return;

    const fetchCellules = async () => {
      const { data } = await supabase
        .from("cellules")
        .select("id, cellule_full, ville, cellule, responsable_id")
        .eq("eglise_id", user.eglise_id)
        .order("cellule_full");

      setCellules(data || []);

      const dejassignees = (data || [])
        .filter((c) => c.responsable_id === user.id)
        .map((c) => c.id);
      setSelectedCelluleIds(dejassignees);
    };

    fetchCellules();
  }, [user, cellulesActive]);

  // ✅ Guard APRÈS tous les hooks
  if (!user) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (roleValue) => {
    setForm((prev) => {
      const roles = prev.roles.includes(roleValue)
        ? prev.roles.filter((r) => r !== roleValue)
        : [...prev.roles, roleValue];
      return { ...prev, roles };
    });
  };

  const handleCelluleChange = (celluleId) => {
    setSelectedCelluleIds((prev) =>
      prev.includes(celluleId)
        ? prev.filter((id) => id !== celluleId)
        : [...prev, celluleId]
    );
  };

  const handleSave = async () => {
    if (!user?.id) return;
    setSaving(true);

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

    // ✅ Gestion cellules — seulement si la feature est active
    if (cellulesActive) {
      if (form.roles.includes("ResponsableCellule")) {
        const cellulesARetirer = cellules
          .filter((c) => c.responsable_id === user.id && !selectedCelluleIds.includes(c.id))
          .map((c) => c.id);

        if (cellulesARetirer.length > 0) {
          await supabase
            .from("cellules")
            .update({ responsable_id: null })
            .in("id", cellulesARetirer);
        }

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
        await supabase
          .from("cellules")
          .update({ responsable_id: null })
          .eq("responsable_id", user.id);
      }
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

  const showCellules = cellulesActive && form.roles.includes("ResponsableCellule");

  return (
    <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm z-50 p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex flex-col items-center mb-4">
          <img src="/logo.png" alt="Logo" className="w-20 h-20" />
          <h2 className="text-xl font-bold text-center mt-2">
            Modifier l'utilisateur
          </h2>
        </div>

        <div className="flex flex-col gap-4">
          <input type="text" name="prenom" value={form.prenom} onChange={handleChange} placeholder="Prénom" className="input" />
          <input type="text" name="nom" value={form.nom} onChange={handleChange} placeholder="Nom" className="input" />
          <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="Email" className="input" />
          <input type="text" name="telephone" value={form.telephone} onChange={handleChange} placeholder="Téléphone" className="input" />

          {/* ✅ Rôles — uniquement ceux dont la feature est active */}
          <div className="flex flex-col gap-2">
            <label className="font-semibold">Rôles :</label>
            {allRoles.map((r) => (
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

          {/* ✅ Sélecteur cellules — visible seulement si feature active ET rôle coché */}
          {showCellules && (
            <div className="flex flex-col gap-2 mt-2 p-4 bg-green-50 rounded-2xl border border-green-200">
              <label className="font-semibold text-green-800">
                🏠 Cellules assignées :
              </label>
              {cellules.length === 0 ? (
                <p className="text-sm text-gray-500">Aucune cellule trouvée pour cette église.</p>
              ) : (
                cellules.map((c) => (
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

          {success && (
            <p className="text-green-600 font-semibold text-center mt-2">
              ✔️ Modifié avec succès !
            </p>
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
