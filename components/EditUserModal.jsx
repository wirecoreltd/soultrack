"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import supabase from "../lib/supabaseClient";
import { useFeature } from "../components/FeaturesContext";
import { useLang } from "../hooks/useLang";

const translations = {
  fr: {
    title: "Modifier l'utilisateur",
    editProfile: "Modifier le profil",
    // Sections
    identity: "👤 Identité",
    roles: "🔐 Rôles",
    cellules: "🏠 Cellules assignées",
    // Field labels
    prenom: "Prénom",
    nom: "Nom",
    email: "Email",
    telephone: "Téléphone",
    // Roles
    administrateur: "Administrateur",
    responsableIntegration: "Responsable Intégration",
    responsableCheckIn: "Responsable CheckIn",
    responsableCellule: "Responsable Cellule",
    superviseurCellule: "Superviseur Cellule",
    responsableEvangelisation: "Responsable Évangélisation",
    conseiller: "Conseiller",
    responsableFamilles: "Responsable Familles",
    // Cellules
    noCellule: "Aucune cellule trouvée pour cette église.",
    dejaAssignee: "(déjà assignée)",
    // Nouvelle cellule
    creerNouvelleCellule: "➕ Créer une nouvelle cellule",
    nomCellule: "Nom de la cellule *",
    zoneCellule: "Zone / Ville *",
    celluleMereLabel: "Cellule mère",
    celluleMereOptional: "(optionnel)",
    celluleMereInfo: "Le responsable de la cellule mère deviendra automatiquement superviseur de cette cellule.",
    aucuneCelluleMere: "-- Aucune cellule mère --",
    // Famille
    titreFamille: "👨‍👩‍👧 Informations de la famille",
    nomFamille: "Nom de la famille *",
    secteurFamille: "Secteur *",
    // Erreurs validation
    erreurNomCellule: "❌ Le nom de la cellule est obligatoire.",
    erreurZoneCellule: "❌ La zone de la cellule est obligatoire.",
    erreurNomFamille: "❌ Le nom de la famille est obligatoire.",
    erreurSecteurFamille: "❌ Le secteur est obligatoire.",
    // Footer
    cancel: "Annuler",
    saving: "Enregistrement...",
    save: "💾 Enregistrer",
    // Success / error
    success: "✔️ Modifié avec succès !",
    errorUpdate: "❌ Erreur lors de la mise à jour : ",
  },
  en: {
    title: "Edit user",
    editProfile: "Edit profile",
    identity: "👤 Identity",
    roles: "🔐 Roles",
    cellules: "🏠 Assigned cells",
    prenom: "First name",
    nom: "Last name",
    email: "Email",
    telephone: "Phone",
    administrateur: "Administrator",
    responsableIntegration: "Integration Manager",
    responsableCheckIn: "CheckIn Manager",
    responsableCellule: "Cell Leader",
    superviseurCellule: "Cell Supervisor",
    responsableEvangelisation: "Evangelisation Manager",
    conseiller: "Counsellor",
    responsableFamilles: "Families Manager",
    noCellule: "No cell found for this church.",
    dejaAssignee: "(already assigned)",
    creerNouvelleCellule: "➕ Create a new cell group",
    nomCellule: "Cell group name *",
    zoneCellule: "Area / City *",
    celluleMereLabel: "Parent cell group",
    celluleMereOptional: "(optional)",
    celluleMereInfo: "The leader of the parent cell group will automatically become the supervisor of this cell group.",
    aucuneCelluleMere: "-- No parent cell group --",
    titreFamille: "👨‍👩‍👧 Family information",
    nomFamille: "Family name *",
    secteurFamille: "Sector *",
    erreurNomCellule: "❌ Cell group name is required.",
    erreurZoneCellule: "❌ Cell group area is required.",
    erreurNomFamille: "❌ Family name is required.",
    erreurSecteurFamille: "❌ Sector is required.",
    cancel: "Cancel",
    saving: "Saving...",
    save: "💾 Save",
    success: "✔️ Updated successfully!",
    errorUpdate: "❌ Error while updating: ",
  },
};

export default function EditUserModal({ user, onClose, onUpdated }) {
  const { lang } = useLang();
  const t = translations[lang];

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
  const [message, setMessage] = useState("");
  const [cellules, setCellules] = useState([]);
  const [selectedCelluleIds, setSelectedCelluleIds] = useState([]);

  // ── Nouvelle cellule ──
  const [creerNouvelleCellule, setCreerNouvelleCellule] = useState(false);
  const [celluleNom, setCelluleNom] = useState("");
  const [celluleZone, setCelluleZone] = useState("");
  const [celluleMereId, setCelluleMereId] = useState("");

  // ── Nouvelle famille ──
  const [familleNom, setFamilleNom] = useState("");
  const [familleSecteur, setFamilleSecteur] = useState("");

  const modalRef = useRef(null);

  const allRoles = useMemo(() => [
    { value: "Administrateur",            label: t.administrateur },
    { value: "ResponsableIntegration",    label: t.responsableIntegration },
    { value: "ResponsableCheckIn",        label: t.responsableCheckIn },
    ...(cellulesActive ? [
      { value: "ResponsableCellule",      label: t.responsableCellule },
      { value: "SuperviseurCellule",      label: t.superviseurCellule },
    ] : []),
    { value: "ResponsableEvangelisation", label: t.responsableEvangelisation },
    ...(conseillerActive ? [
      { value: "Conseiller",              label: t.conseiller },
    ] : []),
    ...(famillesActive ? [
      { value: "ResponsableFamilles",     label: t.responsableFamilles },
    ] : []),
  ], [cellulesActive, conseillerActive, famillesActive, lang]);

  // ── Initialisation du formulaire à l'ouverture ──
  useEffect(() => {
    if (!user) return;
    setForm({
      prenom: user.prenom || "",
      nom: user.nom || "",
      email: user.email || "",
      telephone: user.telephone || "",
      roles: user.roles || [],
    });

    // Reset des champs de création à chaque changement d'utilisateur
    setCreerNouvelleCellule(false);
    setCelluleNom("");
    setCelluleZone("");
    setCelluleMereId("");
    setFamilleNom("");
    setFamilleSecteur("");
  }, [user]);

  // ── Chargement des cellules existantes de l'église ──
  useEffect(() => {
    // Toujours repartir d'un état propre pour éviter tout résidu
    setCellules([]);
    setSelectedCelluleIds([]);

    if (!user?.eglise_id || !cellulesActive) return;

    const fetchCellules = async () => {
      const { data, error } = await supabase
        .from("cellules")
        .select("id, cellule_full, ville, cellule, responsable_id")
        .eq("eglise_id", user.eglise_id)
        .order("cellule_full");

      if (error) {
        console.error("Erreur fetch cellules :", error);
        return;
      }

      setCellules(data || []);
      const dejassignees = (data || [])
        .filter((c) => c.responsable_id === user.id)
        .map((c) => c.id);
      setSelectedCelluleIds(dejassignees);
    };

    fetchCellules();
  }, [user, cellulesActive]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  if (!user) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (roleValue) => {
    const hadRole = form.roles.includes(roleValue);

    setForm((prev) => {
      const roles = prev.roles.includes(roleValue)
        ? prev.roles.filter((r) => r !== roleValue)
        : [...prev.roles, roleValue];
      return { ...prev, roles };
    });

    // Si on décoche ResponsableCellule, on nettoie les champs de création cellule
    if (roleValue === "ResponsableCellule" && hadRole) {
      setCreerNouvelleCellule(false);
      setCelluleNom("");
      setCelluleZone("");
      setCelluleMereId("");
    }

    // Si on décoche ResponsableFamilles, on nettoie les champs famille
    if (roleValue === "ResponsableFamilles" && hadRole) {
      setFamilleNom("");
      setFamilleSecteur("");
    }
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
    setMessage("");

    // ✅ Validation cellule (uniquement si on crée une nouvelle cellule)
    if (form.roles.includes("ResponsableCellule") && creerNouvelleCellule) {
      if (!celluleNom.trim()) { setMessage(t.erreurNomCellule); return; }
      if (!celluleZone.trim()) { setMessage(t.erreurZoneCellule); return; }
    }

    // ✅ Validation famille
    if (form.roles.includes("ResponsableFamilles")) {
      if (!familleNom.trim()) { setMessage(t.erreurNomFamille); return; }
      if (!familleSecteur.trim()) { setMessage(t.erreurSecteurFamille); return; }
    }

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
      setMessage(t.errorUpdate + error.message);
      return;
    }

    // ── Gestion des cellules déjà existantes (assignation / retrait) ──
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

    // ── Création d'une nouvelle cellule si demandé ──
    if (cellulesActive && form.roles.includes("ResponsableCellule") && creerNouvelleCellule) {
      let superviseur_id = null;
      if (celluleMereId) {
        const { data: celluleMere } = await supabase
          .from("cellules")
          .select("responsable_id")
          .eq("id", celluleMereId)
          .single();
        if (celluleMere?.responsable_id) superviseur_id = celluleMere.responsable_id;
      }

      const { error: celluleError } = await supabase.from("cellules").insert({
        cellule: celluleNom,
        ville: celluleZone,
        responsable: `${form.prenom} ${form.nom}`,
        responsable_id: user.id,
        telephone: form.telephone || "",
        eglise_id: user.eglise_id,
        cellule_mere_id: celluleMereId || null,
        superviseur_id,
      });

      if (celluleError) {
        console.error("Erreur création cellule :", celluleError);
      }
    }

    // ── Création d'une famille si demandé ──
    if (famillesActive && form.roles.includes("ResponsableFamilles")) {
      const { error: familleError } = await supabase.from("familles").insert({
        famille: familleNom,
        ville: familleSecteur,
        responsable: `${form.prenom} ${form.nom}`,
        responsable_id: user.id,
        telephone: form.telephone || "",
        eglise_id: user.eglise_id,
        created_at: new Date(),
      });

      if (familleError) {
        console.error("Erreur création famille :", familleError);
      }
    }

    setSaving(false);
    if (data && data.length > 0 && onUpdated) onUpdated(data[0]);
    setMessage(t.success);
    setTimeout(() => {
      setMessage("");
      onClose();
    }, 700);
  };

  const showCellules = cellulesActive && form.roles.includes("ResponsableCellule");
  const showFamille = famillesActive && form.roles.includes("ResponsableFamilles");

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{
        background: "rgba(30,35,90,0.35)",
        backdropFilter: "blur(6px)",
      }}
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
        style={{ background: "#ffffff", border: "1px solid #e2e8f0" }}
      >
        {/* Header */}
        <div
          className="px-6 pt-6 pb-4"
          style={{
            background: "linear-gradient(135deg, #2E3192 0%, #4f54c9 100%)",
          }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-white font-bold text-sm transition-all"
            style={{ background: "rgba(255,255,255,0.2)" }}
          >
            ✕
          </button>
          <h2 className="text-xl font-bold text-white pr-10">
            ✏️ {user.prenom} {user.nom}
          </h2>
          <p className="text-blue-100 text-sm mt-1 opacity-80">
            {t.editProfile}
          </p>
        </div>

        {/* Body */}
        <div
          className="overflow-y-auto px-6 py-5 flex flex-col gap-5"
          style={{ maxHeight: "68vh" }}
        >
          <SectionTitle>{t.identity}</SectionTitle>

          {[
            { name: "prenom", label: t.prenom, type: "text" },
            { name: "nom",    label: t.nom,    type: "text" },
            { name: "email",  label: t.email,  type: "email" },
            { name: "telephone", label: t.telephone, type: "text" },
          ].map(({ name, label, type }) => (
            <Field key={name} label={label}>
              <input
                type={type}
                name={name}
                value={form[name]}
                onChange={handleChange}
                className="inp"
              />
            </Field>
          ))}

          <SectionTitle>{t.roles}</SectionTitle>

          <div className="grid grid-cols-1 gap-1">
            {allRoles.map((r) => (
              <label
                key={r.value}
                className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer py-1"
              >
                <input
                  type="checkbox"
                  checked={form.roles.includes(r.value)}
                  onChange={() => handleRoleChange(r.value)}
                  className="accent-[#2E3192] w-4 h-4"
                />
                {r.label}
              </label>
            ))}
          </div>

          {/* ── Bloc Cellules ── */}
          {showCellules && (
            <>
              <SectionTitle>{t.cellules}</SectionTitle>

              {cellules.length === 0 ? (
                <p className="text-sm text-gray-400 italic bg-gray-50 rounded-xl px-4 py-3">
                  {t.noCellule}
                </p>
              ) : (
                <div className="flex flex-col gap-1">
                  {cellules.map((c) => (
                    <label
                      key={c.id}
                      className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer py-1"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCelluleIds.includes(c.id)}
                        onChange={() => handleCelluleChange(c.id)}
                        className="accent-[#2E3192] w-4 h-4"
                      />
                      <span>{c.cellule_full || `${c.ville} - ${c.cellule}`}</span>
                      {c.responsable_id && c.responsable_id !== user.id && (
                        <span className="text-xs text-orange-400">
                          {t.dejaAssignee}
                        </span>
                      )}
                    </label>
                  ))}
                </div>
              )}

              {/* ➕ Créer une nouvelle cellule */}
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer mt-2">
                <input
                  type="checkbox"
                  checked={creerNouvelleCellule}
                  onChange={() => setCreerNouvelleCellule((v) => !v)}
                  className="accent-[#2E3192] w-4 h-4"
                />
                {t.creerNouvelleCellule}
              </label>

              {creerNouvelleCellule && (
                <div className="flex flex-col gap-3 p-4 bg-blue-50 rounded-2xl border border-blue-200">
                  <Field label={t.nomCellule}>
                    <input
                      value={celluleNom}
                      onChange={(e) => setCelluleNom(e.target.value)}
                      className="inp"
                    />
                  </Field>
                  <Field label={t.zoneCellule}>
                    <input
                      value={celluleZone}
                      onChange={(e) => setCelluleZone(e.target.value)}
                      className="inp"
                    />
                  </Field>
                  <div className="flex flex-col gap-1">
                    <label
                      className="text-xs font-semibold uppercase tracking-wide"
                      style={{ color: "#64748b" }}
                    >
                      {t.celluleMereLabel}{" "}
                      <span className="text-gray-400 font-normal normal-case">
                        {t.celluleMereOptional}
                      </span>
                    </label>
                    <p className="text-xs text-gray-500">{t.celluleMereInfo}</p>
                    <select
                      value={celluleMereId}
                      onChange={(e) => setCelluleMereId(e.target.value)}
                      className="inp"
                    >
                      <option value="">{t.aucuneCelluleMere}</option>
                      {cellules.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.cellule_full || `${c.ville} - ${c.cellule}`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── Bloc Famille ── */}
          {showFamille && (
            <>
              <SectionTitle>{t.titreFamille}</SectionTitle>
              <div className="flex flex-col gap-3 p-4 bg-green-50 rounded-2xl border border-green-200">
                <Field label={t.nomFamille}>
                  <input
                    value={familleNom}
                    onChange={(e) => setFamilleNom(e.target.value)}
                    className="inp"
                  />
                </Field>
                <Field label={t.secteurFamille}>
                  <input
                    value={familleSecteur}
                    onChange={(e) => setFamilleSecteur(e.target.value)}
                    className="inp"
                  />
                </Field>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-gray-600 bg-white border border-gray-200 hover:bg-gray-100 transition-all"
          >
            {t.cancel}
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-white transition-all disabled:opacity-60"
            style={{
              background: saving
                ? "#a0a0c0"
                : "linear-gradient(135deg, #2E3192 0%, #4f54c9 100%)",
            }}
          >
            {saving ? t.saving : t.save}
          </button>
        </div>

        {message && (
          <p
            className="text-center text-sm font-semibold px-6 pb-4"
            style={{ color: message.includes("❌") ? "#dc2626" : "#16a34a" }}
          >
            {message}
          </p>
        )}

        <style jsx>{`
          .inp {
            width: 100%;
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            padding: 10px 12px;
            background: #f8fafc;
            color: #1e293b;
            font-size: 14px;
            outline: none;
            transition: border-color 0.2s;
          }
          .inp:focus {
            border-color: #2E3192;
            background: #fff;
          }
        `}</style>
      </div>
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <div className="flex items-center gap-2 pt-2">
      <span
        className="text-xs font-bold uppercase tracking-widest"
        style={{ color: "#2E3192" }}
      >
        {children}
      </span>
      <div className="flex-1 h-px" style={{ background: "#e2e8f0" }} />
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label
        className="text-xs font-semibold uppercase tracking-wide"
        style={{ color: "#64748b" }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}
