"use client";

import { useState, useEffect } from "react";
import supabase from "../lib/supabaseClient";
import { useLang } from "../hooks/useLang";

const translations = {
  fr: {
    title: "Modifier le suivi évangélisé",
    sectionIdentite: "👤 Identité",
    civilite: "Civilité",
    civiliteDefault: "-- Civilité --",
    homme: "Homme",
    femme: "Femme",
    prenom: "Prénom",
    nom: "Nom",
    ville: "Ville",
    telephone: "Téléphone",
    isWhatsapp: "Numéro WhatsApp",
    sectionSuiviPar: "📌 Suivi par",
    cellule: "Cellule",
    famille: "Famille",
    chooseCellule: "-- Cellule --",
    chooseFamille: "-- Famille --",
    sectionConseiller: "👤 Ajouter conseiller",
    searchConseiller: "Rechercher un conseiller...",
    noResult: "Aucun résultat",
    principal: "(principal)",
    lockedMessage: "🔒 La cellule, la famille et les conseillers sont gérés par un administrateur.",
    sectionSpirituel: "🕊 Vie spirituelle",
    priereSalut: "Prière du salut",
    priereSalutDefault: "-- Prière du salut ? --",
    oui: "Oui",
    non: "Non",
    typeConversion: "Type de conversion",
    nouveauConverti: "Nouveau converti",
    reconciliation: "Réconciliation",
    sectionBesoins: "🙏 Besoins",
    autre: "Autre",
    preciser: "Précisez...",
    sectionSuivi: "📝 Suivi",
    infosSupp: "Informations supplémentaires",
    commentaire: "Commentaire",
    annuler: "Annuler",
    sauvegarder: "💾 Sauvegarder",
    enregistrement: "Enregistrement...",
    erreur: "❌ Une erreur est survenue : ",
    succes: "✅ Changement enregistré !",
    besoins: [
      "Finances", "Santé", "Travail / Études", "Famille / Enfants", "Miracle", "Délivrance",
      "Relations / Conflits", "Addictions / Dépendances", "Guidance spirituelle",
      "Logement / Sécurité", "Communauté / Isolement", "Dépression / Santé mentale",
    ],
  },
  en: {
    title: "Edit evangelism follow-up",
    sectionIdentite: "👤 Identity",
    civilite: "Title",
    civiliteDefault: "-- Title --",
    homme: "Male",
    femme: "Female",
    prenom: "First name",
    nom: "Last name",
    ville: "City",
    telephone: "Phone",
    isWhatsapp: "WhatsApp number",
    sectionSuiviPar: "📌 Followed by",
    cellule: "Cell",
    famille: "Family",
    chooseCellule: "-- Cell --",
    chooseFamille: "-- Family --",
    sectionConseiller: "👤 Add counselor",
    searchConseiller: "Search for a counselor...",
    noResult: "No results",
    principal: "(primary)",
    lockedMessage: "🔒 Cell, family and counsellors are managed by an administrator.",
    sectionSpirituel: "🕊 Spiritual life",
    priereSalut: "Salvation prayer",
    priereSalutDefault: "-- Salvation prayer? --",
    oui: "Yes",
    non: "No",
    typeConversion: "Conversion type",
    nouveauConverti: "New convert",
    reconciliation: "Reconciliation",
    sectionBesoins: "🙏 Needs",
    autre: "Other",
    preciser: "Specify...",
    sectionSuivi: "📝 Follow-up",
    infosSupp: "Additional information",
    commentaire: "Comment",
    annuler: "Cancel",
    sauvegarder: "💾 Save",
    enregistrement: "Saving...",
    erreur: "❌ An error occurred: ",
    succes: "✅ Changes saved!",
    besoins: [
      "Finances", "Health", "Work / Studies", "Family / Children", "Miracle", "Deliverance",
      "Relationships / Conflicts", "Addictions / Dependencies", "Spiritual guidance",
      "Housing / Safety", "Community / Isolation", "Depression / Mental health",
    ],
  },
};

export default function EditEvangeliseSuiviPopup({
  member,
  cellules = [],
  familles = [],
  conseillers = [],
  onClose,
  closeDetails,
  onUpdateMember,
  currentUserRoles,
}) {
  const { lang } = useLang();
  const t = translations[lang];

  console.log("[EditPopup] currentUserRoles:", currentUserRoles);

const rolesArray = Array.isArray(currentUserRoles)
  ? currentUserRoles
  : typeof currentUserRoles === "string"
  ? [currentUserRoles]
  : [];

const isPrivileged = rolesArray.some((r) =>
  ["Administrateur", "ResponsableEvangelisation", "Superadmin"].includes(r)
);

console.log("[EditPopup] isPrivileged:", isPrivileged);
console.log("[EditPopup] conseillers reçus:", conseillers?.length);

  const showCellules = Array.isArray(cellules) && cellules.length > 0;
  const showFamilles = Array.isArray(familles) && familles.length > 0;
  const showConseillers = Array.isArray(conseillers) && conseillers.length > 0;

  const initialBesoin =
    typeof member.besoin === "string" ? JSON.parse(member.besoin || "[]") : member.besoin || [];

  const [formData, setFormData] = useState({
    prenom: member.prenom || "",
    nom: member.nom || "",
    telephone: member.telephone || "",
    ville: member.ville || "",
    besoin: initialBesoin,
    autreBesoin: "",
    infos_supplementaires: member.infos_supplementaires || "",
    priere_salut: member.priere_salut || false,
    type_conversion: member.type_conversion || "",
    is_whatsapp: member.is_whatsapp || false,
    commentaire_evangelises: member.commentaire_evangelises || "",
    status_suivis_evangelises: member.status_suivis_evangelises || "Envoyé",
    cellule_id: member.cellule_id || null,
    famille_id: member.famille_id || null,
    conseiller_id: member.conseiller_id || null,
    responsable_cellule: member.responsable_cellule || null,
    evangelise_id: member.evangelise_id || null,
    sexe: member.sexe || "",
  });

  const [showAutre, setShowAutre] = useState(initialBesoin.includes("Autre"));
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [selectedConseillers, setSelectedConseillers] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!isPrivileged) return;
    const fetchAssignments = async () => {
      const { data, error } = await supabase
        .from("suivi_assignments_evangelises")
        .select("conseiller_id, role, profiles:conseiller_id(id, prenom, nom)")
        .eq("suivi_evangelise_id", member.id)
        .eq("statut", "actif")
        .order("created_at", { ascending: true });

      if (error) { console.error("fetchAssignments error:", error); return; }
      if (data) {
        const sorted = [...data].sort((a, b) => {
          if (a.role === "principal") return -1;
          if (b.role === "principal") return 1;
          return 0;
        });
        setSelectedConseillers(sorted.map((d) => d.profiles).filter(Boolean));
      }
    };
    fetchAssignments();
  }, [member.id]);

  const filteredConseillers = (conseillers || []).filter((c) =>
    `${c.prenom} ${c.nom}`.toLowerCase().includes(search.toLowerCase())
  );

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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const besoinsFinal =
        formData.autreBesoin && showAutre
          ? [...formData.besoin.filter((b) => b !== "Autre"), formData.autreBesoin]
          : formData.besoin;

      const cleanData = {
        prenom: formData.prenom,
        nom: formData.nom,
        telephone: formData.telephone,
        ville: formData.ville || null,
        infos_supplementaires: formData.infos_supplementaires || null,
        besoin: JSON.stringify(besoinsFinal),
        priere_salut: formData.priere_salut,
        type_conversion: formData.priere_salut ? formData.type_conversion : "",
        is_whatsapp: formData.is_whatsapp,
        sexe: formData.sexe || null,
        commentaire_evangelises: formData.commentaire_evangelises || null,
        status_suivis_evangelises: formData.status_suivis_evangelises || "Envoyé",
        cellule_id: formData.cellule_id || null,
        famille_id: formData.famille_id || null,
        conseiller_id: formData.conseiller_id || null,
        responsable_cellule: formData.responsable_cellule || null,
        evangelise_id: formData.evangelise_id || null,
      };

      const { data, error } = await supabase
        .from("suivis_des_evangelises")
        .update(cleanData)
        .eq("id", member.id)
        .select()
        .single();

      if (error) {
        setMessage(t.erreur + error.message);
        return;
      }

      if (isPrivileged) {
        await supabase
          .from("suivi_assignments_evangelises")
          .delete()
          .eq("suivi_evangelise_id", member.id);

        const rows = selectedConseillers.map((c, index) => ({
          suivi_evangelise_id: member.id,
          conseiller_id: c.id,
          role: index === 0 ? "principal" : "assistant",
          statut: "actif",
        }));
        if (rows.length > 0) {
          await supabase.from("suivi_assignments_evangelises").insert(rows);
        }
      }

      if (onUpdateMember) onUpdateMember(data);
      setMessage(t.succes);
      setTimeout(() => {
        setMessage("");
        onClose();
        if (closeDetails) closeDetails();
      }, 1200);
    } catch (err) {
      setMessage(t.erreur + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ background: "rgba(30,35,90,0.35)", backdropFilter: "blur(6px)" }}
    >
      <div
        className="relative w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
        style={{ background: "#ffffff", border: "1px solid #e2e8f0" }}
      >
        {/* Header */}
        <div
          className="px-6 pt-6 pb-4"
          style={{ background: "linear-gradient(135deg, #2E3192 0%, #4f54c9 100%)" }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-white font-bold text-sm transition-all"
            style={{ background: "rgba(255,255,255,0.2)" }}
          >
            ✕
          </button>
          <h2 className="text-xl font-bold text-white pr-10">
            ✏️ {member.prenom} {member.nom}
          </h2>
          <p className="text-blue-100 text-sm mt-1 opacity-80">{t.title}</p>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-6 py-5 flex flex-col gap-5" style={{ maxHeight: "68vh" }}>

          {/* Section: Identité */}
          <SectionTitle>{t.sectionIdentite}</SectionTitle>

          <Field label={t.civilite}>
            <select name="sexe" value={formData.sexe} onChange={handleChange} className="inp">
              <option value="">{t.civiliteDefault}</option>
              <option value="Homme">{t.homme}</option>
              <option value="Femme">{t.femme}</option>
            </select>
          </Field>

          {[
            { name: "prenom", label: t.prenom },
            { name: "nom", label: t.nom },
            { name: "ville", label: t.ville },
          ].map(({ name, label }) => (
            <Field key={name} label={label}>
              <input name={name} value={formData[name]} onChange={handleChange} className="inp" />
            </Field>
          ))}

          <Field label={t.telephone}>
            <input name="telephone" value={formData.telephone} onChange={handleChange} className="inp" />
            <label className="flex items-center gap-2 mt-2 text-sm text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                name="is_whatsapp"
                checked={formData.is_whatsapp}
                onChange={handleChange}
                className="accent-[#2E3192]"
              />
              {t.isWhatsapp}
            </label>
          </Field>

          {/* Section: Suivi par (cellule / famille / conseiller) */}
          {isPrivileged && (showCellules || showFamilles || showConseillers) && (
            <SectionTitle>{t.sectionSuiviPar}</SectionTitle>
          )}

          {isPrivileged ? (
            <>
              {showCellules && (
                <Field label={t.cellule}>
                  <select
                    name="cellule_id"
                    value={formData.cellule_id ?? ""}
                    onChange={handleChange}
                    className="inp"
                  >
                    <option value="">{t.chooseCellule}</option>
                    {cellules.map((c) => (
                      <option key={c.id} value={c.id}>{c.cellule_full}</option>
                    ))}
                  </select>
                </Field>
              )}

              {showFamilles && (
                <Field label={t.famille}>
                  <select
                    name="famille_id"
                    value={formData.famille_id ?? ""}
                    onChange={handleChange}
                    className="inp"
                  >
                    <option value="">{t.chooseFamille}</option>
                    {familles.map((f) => (
                      <option key={f.id} value={f.id}>{f.famille_full}</option>
                    ))}
                  </select>
                </Field>
              )}

              {showConseillers && (
                <>
                  <SectionTitle>{t.sectionConseiller}</SectionTitle>
                  <input
                    type="text"
                    placeholder={t.searchConseiller}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="inp"
                  />
                  <div
                    className="rounded-xl overflow-hidden divide-y divide-gray-100"
                    style={{ border: "1px solid #e2e8f0", maxHeight: "9rem", overflowY: "auto" }}
                  >
                    {filteredConseillers.map((c) => {
                      const alreadySelected = selectedConseillers.some((s) => s.id === c.id);
                      return (
                        <div
                          key={c.id}
                          onClick={() => {
                            if (!alreadySelected) {
                              setSelectedConseillers((prev) => [
                                ...prev,
                                { id: c.id, prenom: c.prenom, nom: c.nom },
                              ]);
                            }
                          }}
                          className={
                            "px-3 py-2 text-sm transition-colors " +
                            (alreadySelected
                              ? "bg-gray-50 text-gray-300 cursor-not-allowed"
                              : "cursor-pointer hover:bg-blue-50 text-gray-700")
                          }
                        >
                          {c.prenom} {c.nom} {alreadySelected ? "✓" : ""}
                        </div>
                      );
                    })}
                    {filteredConseillers.length === 0 && (
                      <p className="text-xs text-gray-400 px-3 py-2">{t.noResult}</p>
                    )}
                  </div>

                  {selectedConseillers.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedConseillers.map((c, index) => (
                        <div
                          key={c.id}
                          className="flex items-center gap-1 px-3 py-1 rounded-full text-sm text-white"
                          style={{ background: index === 0 ? "#2E3192" : "#6b7280" }}
                        >
                          <span>{c.prenom} {c.nom}</span>
                          {index === 0 && selectedConseillers.length > 1 && (
                            <span className="text-xs opacity-60 ml-1">{t.principal}</span>
                          )}
                          <button
                            onClick={() =>
                              setSelectedConseillers((prev) => prev.filter((x) => x.id !== c.id))
                            }
                            className="ml-1 opacity-70 hover:opacity-100"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {!showCellules && !showFamilles && !showConseillers && (
                <p className="text-sm text-gray-400 italic rounded-xl px-4 py-3" style={{ background: "#f8fafc" }}>
                  {t.lockedMessage}
                </p>
              )}
            </>
          ) : (
            <p className="text-sm text-gray-400 italic rounded-xl px-4 py-3" style={{ background: "#f8fafc" }}>
              {t.lockedMessage}
            </p>
          )}

          {/* Section: Vie spirituelle */}
          <SectionTitle>{t.sectionSpirituel}</SectionTitle>

          <Field label={t.priereSalut}>
            <select
              className="inp"
              value={formData.priere_salut ? t.oui : t.non}
              onChange={(e) => {
                const value = e.target.value;
                setFormData((prev) => ({
                  ...prev,
                  priere_salut: value === t.oui,
                  type_conversion: value === t.oui ? prev.type_conversion : "",
                }));
              }}
            >
              <option value="">{t.priereSalutDefault}</option>
              <option value={t.oui}>{t.oui}</option>
              <option value={t.non}>{t.non}</option>
            </select>
            {formData.priere_salut && (
              <select
                name="type_conversion"
                value={formData.type_conversion}
                onChange={handleChange}
                className="inp mt-2"
              >
                <option value="">{t.typeConversion}</option>
                <option value="Nouveau converti">{t.nouveauConverti}</option>
                <option value="Réconciliation">{t.reconciliation}</option>
              </select>
            )}
          </Field>

          {/* Section: Besoins */}
          <SectionTitle>{t.sectionBesoins}</SectionTitle>

          <div className="flex flex-wrap gap-2 mb-2">
            {t.besoins.map((item) => (
              <label key={item} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  value={item}
                  checked={formData.besoin.includes(item)}
                  onChange={handleBesoinChange}
                  className="accent-[#2E3192]"
                />
                {item}
              </label>
            ))}
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                value="Autre"
                checked={showAutre}
                onChange={handleBesoinChange}
                className="accent-[#2E3192]"
              />
              {t.autre}
            </label>
            {showAutre && (
              <input
                type="text"
                name="autreBesoin"
                value={formData.autreBesoin}
                onChange={handleChange}
                placeholder={t.preciser}
                className="inp mt-1"
              />
            )}
          </div>

          {/* Section: Suivi */}
          <SectionTitle>{t.sectionSuivi}</SectionTitle>

          <Field label={t.infosSupp}>
            <textarea
              name="infos_supplementaires"
              value={formData.infos_supplementaires}
              onChange={handleChange}
              className="inp"
              rows={2}
            />
          </Field>

          <Field label={t.commentaire}>
            <textarea
              name="commentaire_evangelises"
              value={formData.commentaire_evangelises}
              onChange={handleChange}
              className="inp"
              rows={2}
            />
          </Field>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-gray-600 bg-white border border-gray-200 hover:bg-gray-100 transition-all"
          >
            {t.annuler}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-white transition-all disabled:opacity-60"
            style={{
              background: loading
                ? "#a0a0c0"
                : "linear-gradient(135deg, #2E3192 0%, #4f54c9 100%)",
            }}
          >
            {loading ? t.enregistrement : t.sauvegarder}
          </button>
        </div>

        {message && (
          <p
            className="text-center text-sm font-semibold px-6 pb-4"
            style={{ color: message.includes("❌") ? "#dc2626" : "#2E3192" }}
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
          select.inp option {
            background: white;
            color: #1e293b;
          }
        `}</style>
      </div>
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <div className="flex items-center gap-2 pt-2">
      <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#2E3192" }}>
        {children}
      </span>
      <div className="flex-1 h-px" style={{ background: "#e2e8f0" }} />
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#64748b" }}>
        {label}
      </label>
      {children}
    </div>
  );
}
