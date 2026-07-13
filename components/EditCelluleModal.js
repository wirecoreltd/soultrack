"use client";

import { useState, useEffect, useRef } from "react";
import supabase from "../lib/supabaseClient";
import { useLang } from "../hooks/useLang";

const translations = {
  fr: {
    subtitle: "Modifier la cellule",
    sectionInfos: "📋 Informations générales",
    nomCellule: "Nom de la cellule",
    nomGere: "Le nom est géré automatiquement par le système.",
    ville: "Ville",
    villePlaceholder: "Ex : Paris",
    sectionResponsable: "👤 Responsable",
    responsable: "Responsable de cellule",
    responsableDefault: "-- Choisir un responsable --",
    chargement: "Chargement...",
    telephone: "Téléphone du responsable",
    email: "Email",
    emailPlaceholder: "exemple@email.com",
    telephonePlaceholder: "+33 6 00 00 00 00",
    sectionCelluleMere: "🌿 Cellule mère",
    celluleMere: "Responsable supérieur",
    celluleMereDefault: "-- Selectionner un Responsable --",
    annuler: "Annuler",
    sauvegarder: "💾 Sauvegarder",
    enregistrement: "Enregistrement...",
    erreurVille: "❌ La ville est obligatoire.",
    erreurSauvegarde: "❌ Une erreur est survenue lors de l'enregistrement.",
  },
  en: {
    subtitle: "Edit cell group",
    sectionInfos: "📋 General information",
    nomCellule: "Cell group name",
    nomGere: "The name is managed automatically by the system.",
    ville: "City",
    villePlaceholder: "e.g. London",
    sectionResponsable: "👤 Leader",
    responsable: "Cell group leader",
    responsableDefault: "-- Choose a leader --",
    chargement: "Loading...",
    telephone: "Leader's phone number",
    telephonePlaceholder: "+44 7700 000000",
    email: "Email",
    emailPlaceholder: "example@email.com",
    sectionCelluleMere: "🌿 Parent cell",
    celluleMere: "Parent leader",
    celluleMereDefault: "-- Select a Parent --",
    annuler: "Cancel",
    sauvegarder: "💾 Save",
    enregistrement: "Saving...",
    erreurVille: "❌ City is required.",
    erreurSauvegarde: "❌ An error occurred while saving.",
  },
};

export default function EditCelluleModal({ cellule, onClose, onUpdated }) {
  const { lang } = useLang();
  const t = translations[lang];

  const egliseId  = cellule?.eglise_id || "";
  const celluleId = cellule?.id        || "";

  const [ville, setVille]         = useState(cellule?.ville     || "");
  const [telephone, setTelephone] = useState(cellule?.telephone || "");
  const [email, setEmail]         = useState(cellule?.email     || "");
  const [loading, setLoading]     = useState(false);
  const [message, setMessage]     = useState("");

  const [selectedResponsableId, setSelectedResponsableId] = useState(
    cellule?.responsable_id || ""
  );
  const [responsables, setResponsables]               = useState([]);
  const [loadingResponsables, setLoadingResponsables] = useState(true);

  // cellule_mere_id pointe vers une autre cellule,
  // mais on veut afficher/choisir par responsable
  // On stocke l'id du responsable supérieur séparément
  const [selectedParentResponsableId, setSelectedParentResponsableId] = useState(
    cellule?.cellule_mere_id || ""
  );
  const [parentResponsables, setParentResponsables]               = useState([]);
  const [loadingParentResponsables, setLoadingParentResponsables] = useState(true);

  const modalRef = useRef(null);

  // ─── Fetch tous les responsables (pour les deux selects) ───
  useEffect(() => {
    if (!egliseId) {
      setLoadingResponsables(false);
      setLoadingParentResponsables(false);
      return;
    }

    let cancelled = false;

    supabase
      .from("profiles")
      .select("id, prenom, nom, telephone, email, role, roles")
      .eq("eglise_id", egliseId)
      .order("nom")
      .then(({ data, error }) => {
        if (cancelled) return;
        if (!error && data) {
          const filtered = data.filter((p) => {
            const roleStr  = (p.role || "").trim();
            const rolesArr = Array.isArray(p.roles) ? p.roles : [];
            return (
              roleStr === "ResponsableCellule" ||
              rolesArr.some((r) => r.trim() === "ResponsableCellule")
            );
          });

          setResponsables(filtered);

          // Pour "Parent cell" : tous les responsables sauf le responsable actuel de cette cellule
          setParentResponsables(
            filtered.filter((p) => p.id !== (cellule?.responsable_id || ""))
          );
        }
        setLoadingResponsables(false);
        setLoadingParentResponsables(false);
      });

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Fermer en cliquant dehors ───
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  // ─── Sauvegarde ───
  const handleSave = async () => {
    setMessage("");
    if (!ville.trim()) return setMessage(t.erreurVille);

    const responsableObj = responsables.find((r) => r.id === selectedResponsableId);
    const responsableNom = responsableObj
      ? `${responsableObj.prenom} ${responsableObj.nom}`
      : cellule?.responsable || "";

    setLoading(true);
    const { data, error } = await supabase
      .from("cellules")
      .update({
        ville,
        telephone,
        email,
        responsable_id:  selectedResponsableId || null,
        responsable:     responsableNom,
        cellule_mere_id: selectedParentResponsableId || null,
      })
      .eq("id", cellule.id)
      .select("*, superviseur:superviseur_id(nom, prenom)")
      .single();

    setLoading(false);

    if (!error) {
      onUpdated(data);
      onClose();
    } else {
      console.error("❌ UPDATE ERROR:", error);
      setMessage(t.erreurSauvegarde);
    }
  };

  if (!cellule) return null;

  const isLoading = loading || loadingResponsables || loadingParentResponsables;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ background: "rgba(30,35,90,0.35)", backdropFilter: "blur(6px)" }}
    >
      <div
        ref={modalRef}
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
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-white font-bold text-sm"
            style={{ background: "rgba(255,255,255,0.2)" }}
          >
            ✕
          </button>
          <h2 className="text-xl font-bold text-white pr-10">
            🏠 {cellule.cellule_full || cellule.cellule}
          </h2>
          <p className="text-blue-100 text-sm mt-1 opacity-80">{t.subtitle}</p>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-6 py-5 flex flex-col gap-5" style={{ maxHeight: "68vh" }}>

          <SectionTitle>{t.sectionInfos}</SectionTitle>

          <Field label={t.nomCellule}>
            <div className="inp-readonly">{cellule.cellule_full || cellule.cellule}</div>
            <p className="text-xs text-gray-400 mt-1 ml-1">{t.nomGere}</p>
          </Field>

          <Field label={t.ville}>
            <input
              className="inp"
              value={ville}
              onChange={(e) => setVille(e.target.value)}
              placeholder={t.villePlaceholder}
            />
          </Field>

          <SectionTitle>{t.sectionResponsable}</SectionTitle>

          <Field label={t.responsable}>
            {loadingResponsables ? (
              <div className="inp-readonly">
                {cellule.responsable || <span className="text-gray-400">{t.chargement}</span>}
              </div>
            ) : (
              <select
                className="inp"
                value={selectedResponsableId}
                onChange={(e) => {
                  const id  = e.target.value;
                  setSelectedResponsableId(id);
                  const obj = responsables.find((r) => r.id === id);
                  setTelephone(obj?.telephone || "");
                  // Retirer ce responsable de la liste parent si sélectionné
                  setParentResponsables(
                    responsables.filter((r) => r.id !== id)
                  );
                  // Reset parent si c'était ce responsable
                  if (selectedParentResponsableId === id) {
                    setSelectedParentResponsableId("");
                  }
                }}
              >
                <option value="">{t.responsableDefault}</option>
                {responsables.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.prenom} {r.nom}
                  </option>
                ))}
              </select>
            )}
          </Field>

          <Field label={t.telephone}>
            <input
              className="inp"
              value={telephone}
              onChange={(e) => setTelephone(e.target.value)}
              placeholder={t.telephonePlaceholder}
            />
          </Field>

              <Field label={t.email}>
                <input
                  className="inp"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.emailPlaceholder}
                />
              </Field>

          <SectionTitle>{t.sectionCelluleMere}</SectionTitle>

          <Field label={t.celluleMere}>
            {loadingParentResponsables ? (
              <div className="inp flex items-center gap-2 text-gray-400 text-sm">
                <Spinner />
                {t.chargement}
              </div>
            ) : (
              <select
                className="inp"
                value={selectedParentResponsableId}
                onChange={(e) => setSelectedParentResponsableId(e.target.value)}
              >
                <option value="">{t.celluleMereDefault}</option>
                {parentResponsables.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.prenom} {r.nom}
                  </option>
                ))}
              </select>
            )}
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
            onClick={handleSave}
            disabled={isLoading}
            className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-white transition-all disabled:opacity-60"
            style={{
              background: isLoading
                ? "#a0a0c0"
                : "linear-gradient(135deg, #2E3192 0%, #4f54c9 100%)",
            }}
          >
            {loading ? t.enregistrement : isLoading ? t.chargement : t.sauvegarder}
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
          .inp-readonly {
            width: 100%;
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            padding: 10px 12px;
            background: #f1f5f9;
            color: #64748b;
            font-size: 14px;
            font-weight: 600;
          }
        `}</style>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <span
      className="w-4 h-4 rounded-full border-2 animate-spin inline-block"
      style={{ borderColor: "#2E3192", borderTopColor: "transparent" }}
    />
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
