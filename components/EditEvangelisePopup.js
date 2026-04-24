"use client";

import { useState, useEffect, useRef } from "react";
import supabase from "../lib/supabaseClient";

export default function EditMemberSuivisPopup({
  member,
  cellules,
  conseillers,
  onClose,
  onUpdateMember,
  currentUserRoles
}) {
  if (!member) return null;

  const isPrivileged = (currentUserRoles || []).some(r =>
    ["Administrateur", "ResponsableIntegration"].includes(r)
  );

  const [autreMinistere, setAutreMinistere] = useState("");
  const [search, setSearch] = useState("");

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

  const [formData, setFormData] = useState({
    prenom: member?.prenom || "",
    nom: member?.nom || "",
    telephone: member?.telephone || "",
    ville: member?.ville || "",
    sexe: member?.sexe || "",
    age: member?.age || "",
    star: !!member?.star,
    etat_contact: member?.etat_contact || "Nouveau",
    bapteme_eau: member?.bapteme_eau ?? null,
    bapteme_esprit: member?.bapteme_esprit ?? null,
    priere_salut: member?.priere_salut || "",
    type_conversion: member?.type_conversion || "",
    cellule_id: member?.cellule_id ?? "",
    conseillers_ids: member?.conseillers_ids || [],
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
    veut_se_faire_baptiser: member?.veut_se_faire_baptiser || "",
    Commentaire_Suivi_Evangelisation: member?.Commentaire_Suivi_Evangelisation || "",
  });

  const ministereOptions = [
    "Intercession", "Louange", "Administration", "Technique",
    "Communication", "Les Enfants", "Les ados", "Les jeunes",
    "Finance", "Nettoyage", "Conseiller", "Compassion",
    "Visite", "Berger", "Modération",
  ];

  const [showAutre, setShowAutre] = useState(initialBesoin.includes("Autre"));
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedConseillers, setSelectedConseillers] = useState([]);

  const modalRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const filteredConseillers = (conseillers || []).filter(c =>
    `${c.prenom} ${c.nom}`.toLowerCase().includes(search.toLowerCase())
  );

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setFormData(prev => ({
        ...prev,
        [name]: checked,
        ...(name === "star" && !checked ? { Ministere: [] } : {}),
      }));
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

  const handleSubmit = async () => {
    setMessage("");
    setLoading(true);

    try {
      const { error } = await supabase
        .from("membres_complets")
        .update({ ...formData })
        .eq("id", member.id);

      if (error) throw error;

      setMessage("✔️ Enregistré avec succès");
      onUpdateMember?.();
      onClose();
    } catch (err) {
      setMessage("❌ Erreur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/40 backdrop-blur-sm">

      <div
        ref={modalRef}
        className="w-full max-w-2xl rounded-3xl shadow-2xl bg-white overflow-hidden border border-gray-100"
      >

        {/* HEADER */}
        <div className="px-6 py-5 bg-gradient-to-r from-[#2E3192] to-[#4f54c9] relative">

          <button
            onClick={onClose}
            className="absolute right-4 top-4 w-9 h-9 rounded-full bg-white/20 text-white"
          >
            ✕
          </button>

          <h2 className="text-white text-xl font-bold">
            ✏️ {member.prenom} {member.nom}
          </h2>
          <p className="text-white/70 text-sm">Édition du suivi évangélisation</p>
        </div>

        {/* BODY */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">

          <Section title="👤 Identité">
            <Grid>
              <Input label="Prénom" name="prenom" value={formData.prenom} onChange={handleChange} />
              <Input label="Nom" name="nom" value={formData.nom} onChange={handleChange} />
              <Input label="Téléphone" name="telephone" value={formData.telephone} onChange={handleChange} />
              <Input label="Ville" name="ville" value={formData.ville} onChange={handleChange} />
            </Grid>
          </Section>

          <Section title="🕊 Spirituel">
            <Grid>
              <Select label="Baptême eau" name="bapteme_eau" value={formData.bapteme_eau} onChange={handleChange} />
              <Select label="Baptême esprit" name="bapteme_esprit" value={formData.bapteme_esprit} onChange={handleChange} />
              <Select label="Prière salut" name="priere_salut" value={formData.priere_salut} onChange={handleChange} />
            </Grid>
          </Section>

          <Section title="📌 Suivi">
            <Textarea label="Formation" name="Formation" value={formData.Formation} onChange={handleChange} />
            <Textarea label="Infos" name="infos_supplementaires" value={formData.infos_supplementaires} onChange={handleChange} />
          </Section>

        </div>

        {/* FOOTER */}
        <div className="p-5 border-t bg-gray-50 flex gap-3">

          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border bg-white"
          >
            Annuler
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-white font-semibold bg-gradient-to-r from-[#2E3192] to-[#4f54c9]"
          >
            {loading ? "..." : "Sauvegarder"}
          </button>

        </div>

        {message && (
          <div className="text-center text-sm py-2 text-gray-600">
            {message}
          </div>
        )}

      </div>
    </div>
  );
}

/* ---------------- UI COMPONENTS ---------------- */

function Section({ title, children }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold text-[#2E3192] uppercase">
          {title}
        </span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>
      {children}
    </div>
  );
}

function Grid({ children }) {
  return <div className="grid grid-cols-2 gap-3">{children}</div>;
}

function Input(props) {
  return (
    <input
      {...props}
      className="w-full p-2.5 rounded-xl border bg-gray-50 focus:bg-white focus:border-[#2E3192]"
    />
  );
}

function Textarea(props) {
  return (
    <textarea
      {...props}
      rows={3}
      className="w-full p-2.5 rounded-xl border bg-gray-50 focus:bg-white focus:border-[#2E3192]"
    />
  );
}

function Select(props) {
  return (
    <select
      {...props}
      className="w-full p-2.5 rounded-xl border bg-gray-50 focus:bg-white focus:border-[#2E3192]"
    >
      <option value="">--</option>
      <option value="Oui">Oui</option>
      <option value="Non">Non</option>
    </select>
  );
}
