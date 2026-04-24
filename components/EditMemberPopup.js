"use client";

import { useState, useEffect, useRef } from "react";
import supabase from "../lib/supabaseClient";

// Pass `currentUserRoles` (array) as a prop from the parent
export default function EditMemberPopup({ member, cellules, conseillers, onClose, onUpdateMember, currentUserRoles }) {
  if (!member) return null;


  const ADMIN_ROLES = new Set([
  "Administrateur",
  "ResponsableIntegration"
]);

const isPrivileged = (currentUserRoles || [])
  .some(role => ADMIN_ROLES.has(role));

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

  // Ref for click-outside detection
  const modalRef = useRef(null);

  useEffect(() => {
  const fetchAssignments = async () => {
    const { data, error } = await supabase
      .from("suivi_assignments")
      .select("conseiller_id")
      .eq("membre_id", member.id);

    if (error) {
      console.error(error);
      return;
    }

    if (data) {
      setSelectedConseillers(data.map(d => d.conseiller_id));
    }
  };

  fetchAssignments();
}, [member.id]);

  // Click outside handler
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

  // -------------------- HANDLERS --------------------
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

      if (isPrivileged) {
        if (formData.star) {
          await supabase.from("stats_ministere_besoin").upsert({
            membre_id: member.id,
            branche_id: formData.cellule_id || null,
            sexe: formData.sexe,
            type: "ministere",
          });
        } else {
          await supabase.from("stats_ministere_besoin").delete()
            .eq("membre_id", member.id).eq("type", "ministere");
        }
      }

      const payload = {
        prenom: formData.prenom,
        nom: formData.nom,
        telephone: formData.telephone || null,
        ville: formData.ville || null,
        sexe: formData.sexe || null,
        age: formData.age || null,
        star: isPrivileged ? !!formData.star : !!member.star,
        etat_contact: formData.etat_contact || "Nouveau",
        bapteme_eau: formData.bapteme_eau,
        bapteme_esprit: formData.bapteme_esprit,
        priere_salut: formData.priere_salut || null,
        type_conversion: formData.type_conversion || null,
        cellule_id: isPrivileged ? (formData.cellule_id || null) : (member.cellule_id || null),
        besoin: JSON.stringify(finalBesoin),
        venu: formData.venu || null,
        infos_supplementaires: formData.infos_supplementaires || null,
        statut_initial: formData.statut_initial || null,
        suivi_statut: formData.suivi_statut || null,
        commentaire_suivis: formData.commentaire_suivis || null,
        is_whatsapp: !!formData.is_whatsapp,
        Formation: formData.Formation || null,
        Soin_Pastoral: formData.Soin_Pastoral || null,
        veut_se_faire_baptiser: formData.veut_se_faire_baptiser || null,
        Commentaire_Suivi_Evangelisation: formData.Commentaire_Suivi_Evangelisation || null,
        Ministere: (isPrivileged && formData.star) ? JSON.stringify(finalMinistere) : member.Ministere,
      };

      const { error } = await supabase.from("membres_complets").update(payload).eq("id", member.id);
      if (error) throw error;

      if (isPrivileged) {
        await supabase.from("suivi_assignments").delete().eq("membre_id", member.id);
        const rows = selectedConseillers.map((id, index) => ({
          membre_id: member.id,
          conseiller_id: id,
          role: index === 0 ? "principal" : "assistant",
          statut: "actif"
        }));
        if (rows.length > 0) await supabase.from("suivi_assignments").insert(rows);
      }

      const { data: updatedMember, error: selectError } = await supabase
        .from("membres_complets").select("*").eq("id", member.id).single();
      if (selectError) throw selectError;

      onUpdateMember(updatedMember);
      onClose();
    } catch (err) {
      console.error(err);
      setMessage("❌ Une erreur est survenue lors de l'enregistrement.");
    } finally {
      setLoading(false);
    }
  };

  const getConseiller = (id) => {
  return (conseillers || []).find(c => c.id === id);
};
  // -------------------- UI --------------------
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: "rgba(30,35,90,0.35)", backdropFilter: "blur(6px)" }}>
      <div
        ref={modalRef}
        className="relative w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
        style={{ background: "#ffffff", border: "1px solid #e2e8f0" }}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4" style={{ background: "linear-gradient(135deg, #2E3192 0%, #4f54c9 100%)" }}>
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
          <p className="text-blue-100 text-sm mt-1 opacity-80">Modifier le profil</p>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-6 py-5 flex flex-col gap-5" style={{ maxHeight: "68vh" }}>

          {/* Section: Identité */}
          <SectionTitle>👤 Identité</SectionTitle>

          <Field label="Civilité">
            <select name="sexe" value={formData.sexe} onChange={handleChange} className="inp">
              <option value="">-- Civilité --</option>
              <option value="Homme">Homme</option>
              <option value="Femme">Femme</option>
            </select>
          </Field>

          {["prenom", "nom", "telephone", "ville"].map((f) => (
            <Field key={f} label={f.charAt(0).toUpperCase() + f.slice(1)}>
              <input name={f} value={formData[f]} onChange={handleChange} className="inp" />
              {f === "telephone" && (
                <label className="flex items-center gap-2 mt-2 text-sm text-gray-600 cursor-pointer">
                  <input type="checkbox" name="is_whatsapp" checked={formData.is_whatsapp} onChange={handleChange} className="accent-[#2E3192]" />
                  Numéro WhatsApp
                </label>
              )}
            </Field>
          ))}

          <Field label="Âge">
            <select name="age" value={formData.age} onChange={handleChange} className="inp">
              <option value="">-- Choisir --</option>
              {["12-17 ans","18-25 ans","26-30 ans","31-40 ans","41-55 ans","56-69 ans","70 ans et plus"].map(v => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </Field>

          {/* Section: Suivi — restricted fields */}
          <SectionTitle>📌 Suivi par</SectionTitle>

          {isPrivileged ? (
            <>
              <Field label="Cellule">
                <select name="cellule_id" value={formData.cellule_id ?? ""} onChange={handleChange} className="inp">
                  <option value="">-- Cellule --</option>
                  {(cellules || []).map(c => (
                    <option key={c.id} value={c.id}>{c.cellule_full}</option>
                  ))}
                </select>
              </Field>

              <Field label="Ajouter conseiller">
                <input
                  type="text"
                  placeholder="Rechercher un conseiller..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="inp mb-2"
                />
                <div className="max-h-36 overflow-y-auto rounded-xl border border-gray-200 divide-y divide-gray-100">
                  {filteredConseillers.map(c => (
                    <div
                      key={c.id}
                      onClick={() => {
                        if (!selectedConseillers.includes(c.id)) {
                          setSelectedConseillers(prev => [...prev, c.id]);
                        }
                      }}
                      className="cursor-pointer px-3 py-2 text-sm hover:bg-blue-50 text-gray-700 transition-colors"
                    >
                      {c.prenom} {c.nom}
                    </div>
                  ))}
                  {filteredConseillers.length === 0 && (
                    <p className="text-xs text-gray-400 px-3 py-2">Aucun résultat</p>
                  )}
                </div>
              </Field>

              {selectedConseillers.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedConseillers.map(id => {
  const c = getConseiller(id);

  if (!c) return null; // 🔥 évite crash

  return (
    <div
      key={id}
      className="flex items-center gap-1 px-3 py-1 rounded-full text-sm text-white"
      style={{ background: "#2E3192" }}
    >
      {c.prenom} {c.nom}
      <button
        onClick={() =>
          setSelectedConseillers(prev => prev.filter(x => x !== id))
        }
        className="ml-1 opacity-70 hover:opacity-100"
      >
        ✕
      </button>
    </div>
  );
})}
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-gray-400 italic bg-gray-50 rounded-xl px-4 py-3">
              🔒 La cellule et les conseillers sont gérés par un administrateur.
            </p>
          )}

          {/* Section: Suivi */}
          <SectionTitle>💝 Suivi</SectionTitle>

          <Field label="Suivi statut">
            <select value={formData.suivi_statut ?? ""} onChange={(e) => setFormData(prev => ({ ...prev, suivi_statut: e.target.value }))} className="inp">
              <option value="">-- Sélectionner un statut --</option>
              <option value="En Attente">En Attente</option>
              <option value="Intégrer">Intégrer</option>
              <option value="Refus">Refus</option>
            </select>
          </Field>

          <Field label="Commentaire suivis">
            <textarea name="commentaire_suivis" value={formData.commentaire_suivis} onChange={handleChange} className="inp" rows={2} />
          </Field>

          <Field label="Commentaire suivis Évangélisation">
            <textarea name="Commentaire_Suivi_Evangelisation" value={formData.Commentaire_Suivi_Evangelisation} onChange={handleChange} className="inp" rows={2} />
          </Field>

          {/* Section: Vie spirituelle */}
          <SectionTitle>🕊 Vie spirituelle</SectionTitle>

          <Field label="Baptême d'eau">
            <select
              name="bapteme_eau"
              value={formData.bapteme_eau ?? ""}
              onChange={(e) => {
                const value = e.target.value;
                setFormData(prev => ({
                  ...prev,
                  bapteme_eau: value,
                  veut_se_faire_baptiser: value === "Oui" ? "Non" : prev.veut_se_faire_baptiser
                }));
              }}
              className="inp"
            >
              <option value="">-- Sélectionner --</option>
              <option value="Oui">Oui</option>
              <option value="Non">Non</option>
            </select>
          </Field>

          {formData.bapteme_eau === "Non" && (
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer ml-4">
              <input
                type="checkbox"
                checked={formData.veut_se_faire_baptiser === "Oui"}
                onChange={(e) => setFormData(prev => ({ ...prev, veut_se_faire_baptiser: e.target.checked ? "Oui" : "Non" }))}
                className="accent-[#2E3192]"
              />
              💦 Veut se faire baptiser
            </label>
          )}

          <Field label="Baptême de feu">
            <select name="bapteme_esprit" value={formData.bapteme_esprit ?? ""} onChange={handleChange} className="inp">
              <option value="">-- Sélectionner --</option>
              <option value="Oui">Oui</option>
              <option value="Non">Non</option>
            </select>
          </Field>

          <Field label="Prière du salut">
            <select
              name="priere_salut"
              value={formData.priere_salut}
              onChange={(e) => {
                const value = e.target.value;
                setFormData({ ...formData, priere_salut: value, type_conversion: value === "Oui" ? formData.type_conversion : "" });
              }}
              className="inp"
            >
              <option value="">-- Prière du salut ? --</option>
              <option value="Oui">Oui</option>
              <option value="Non">Non</option>
            </select>
            {formData.priere_salut === "Oui" && (
              <select name="type_conversion" value={formData.type_conversion} onChange={handleChange} className="inp mt-2">
                <option value="">Type</option>
                <option value="Nouveau converti">Nouveau converti</option>
                <option value="Réconciliation">Réconciliation</option>
              </select>
            )}
          </Field>

          <Field label="Formation">
            <textarea name="Formation" value={formData.Formation} onChange={handleChange} className="inp" rows={2} />
          </Field>

          {/* Serviteur — restricted */}
          {isPrivileged && (
            <>
              <div className="flex items-center gap-3 py-2">
                <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-gray-700">
                  <input type="checkbox" name="star" checked={formData.star} onChange={handleChange} className="accent-[#2E3192] w-4 h-4" />
                  ⭐ Définir en tant que serviteur
                </label>
              </div>

              {formData.star && (
                <Field label="Ministère">
                  <div className="grid grid-cols-2 gap-1 mt-1">
                    {ministereOptions.map((m) => (
                      <label key={m} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer py-1">
                        <input
                          type="checkbox"
                          value={m}
                          checked={formData.Ministere.includes(m)}
                          onChange={(e) => {
                            const { value, checked } = e.target;
                            setFormData(prev => ({
                              ...prev,
                              Ministere: checked ? [...prev.Ministere, value] : prev.Ministere.filter(v => v !== value),
                            }));
                          }}
                          className="accent-[#2E3192]"
                        />
                        {m}
                      </label>
                    ))}
                    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer py-1">
                      <input
                        type="checkbox"
                        checked={formData.Ministere.includes("Autre")}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setFormData(prev => ({
                            ...prev,
                            Ministere: checked ? [...prev.Ministere, "Autre"] : prev.Ministere.filter(v => v !== "Autre"),
                          }));
                          if (!checked) setAutreMinistere("");
                        }}
                        className="accent-[#2E3192]"
                      />
                      Autre
                    </label>
                  </div>
                  {formData.Ministere.includes("Autre") && (
                    <input type="text" className="inp mt-2" placeholder="Précisez le ministère" value={autreMinistere} onChange={(e) => setAutreMinistere(e.target.value)} />
                  )}
                </Field>
              )}
            </>
          )}

          {/* État du contact */}
          <Field label="État du contact">
            <select name="etat_contact" value={formData.etat_contact} onChange={handleChange} className="inp">
              <option value="">-- Sélectionner --</option>
              <option value="nouveau">Nouveau</option>
              <option value="existant">Existant</option>
              <option value="inactif">Inactif</option>
            </select>
          </Field>

          <Field label="Comment est-il venu ?">
            <select name="venu" value={formData.venu} onChange={handleChange} className="inp">
              <option value="">-- Sélectionner --</option>
              <option value="invité">Invité</option>
              <option value="réseaux">Réseaux</option>
              <option value="evangélisation">Évangélisation</option>
              <option value="autre">Autre</option>
            </select>
          </Field>

          <Field label="Informations supplémentaires">
            <textarea name="infos_supplementaires" value={formData.infos_supplementaires} onChange={handleChange} className="inp" rows={2} />
          </Field>

          <Field label="Statut à l'arrivée">
            <select name="statut_initial" value={formData.statut_initial} onChange={handleChange} className="inp">
              <option value="">-- Sélectionner --</option>
              <option value="veut rejoindre ICC">Veut rejoindre ICC</option>
              <option value="a déjà son église">A déjà son église</option>
              <option value="visiteur">Visiteur</option>
            </select>
          </Field>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-gray-600 bg-white border border-gray-200 hover:bg-gray-100 transition-all"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-white transition-all disabled:opacity-60"
            style={{ background: loading ? "#a0a0c0" : "linear-gradient(135deg, #2E3192 0%, #4f54c9 100%)" }}
          >
            {loading ? "Enregistrement..." : "💾 Sauvegarder"}
          </button>
        </div>

        {message && (
          <p className="text-center text-sm font-semibold px-6 pb-4" style={{ color: message.includes("❌") ? "#dc2626" : "#2E3192" }}>
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

// ---- Helper sub-components ----
function SectionTitle({ children }) {
  return (
    <div className="flex items-center gap-2 pt-2">
      <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#2E3192" }}>{children}</span>
      <div className="flex-1 h-px" style={{ background: "#e2e8f0" }} />
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#64748b" }}>{label}</label>
      {children}
    </div>
  );
}
