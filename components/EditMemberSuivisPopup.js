"use client";

import { useState, useEffect, useRef } from "react";
import supabase from "../lib/supabaseClient";
import { useLang } from "../hooks/useLang";

const translations = {
  fr: {
    // Header
    modifierProfil: "Modifier le profil",

    // Section titles
    identite: "👤 Identité",
    vieSpirituelle: "🕊 Vie spirituelle",

    // Identity fields
    civilite: "Civilité",
    civiliteOpt: "-- Civilité --",
    homme: "Homme",
    femme: "Femme",
    prenom: "Prénom",
    nom: "Nom",
    telephone: "Téléphone",
    ville: "Ville",
    numeroWhatsapp: "Numéro WhatsApp",
    age: "Âge",
    ageOpt: "-- Choisir --",
    ages: ["12-17 ans","18-25 ans","26-30 ans","31-40 ans","41-55 ans","56-69 ans","70 ans et plus"],

    // Spiritual life
    baptemeEau: "Baptême d'eau",
    selectionner: "-- Sélectionner --",
    oui: "Oui",
    non: "Non",
    veutBaptiser: "💦 Veut se faire baptiser",
    baptemeFeu: "Baptême de feu",
    priereSalut: "Prière du salut",
    priereSalutOpt: "-- Prière du salut ? --",
    typeConversion: "Type",
    nouveauConverti: "Nouveau converti",
    reconciliation: "Réconciliation",
    formation: "Formation",
    commentVenu: "Comment est-il venu ?",
    commentVenuOpt: "-- Sélectionner --",
    invite: "Invité",
    reseaux: "Réseaux",
    evangelisation: "Évangélisation",
    autre: "Autre",
    infosSup: "Informations supplémentaires",
    statutArrivee: "Statut à l'arrivée",
    statutArriveeOpt: "-- Sélectionner --",
    veutRejoindre: "Veut rejoindre ICC",
    aDejaEglise: "A déjà son église",
    visiteur: "Visiteur",
    pilier: "🎖️ Définir en tant que Pilier",
    leaderDeveloppement: "🏆 Parcours de croissance vers le leadership",
    parcoursChoisir: "Choisis une étape du parcours",
    errParcours: "❌ Veuillez sélectionner une étape du parcours de développement.",
    parcoursStages: [
      { key: "potentiel", emoji: "🌱", label: "Potentiel identifié" },
      { key: "croissance", emoji: "🌿", label: "Serviteur fidèle" },
      { key: "developpement", emoji: "🌳", label: "Responsable en formation" },
      { key: "mature", emoji: "🌲", label: "Leader confirmé" },
    ],

    // Footer
    annuler: "Annuler",
    sauvegarder: "💾 Sauvegarder",
    enregistrement: "Enregistrement...",

    // Validation messages
    erreurPrenom: "❌ Le prénom est obligatoire.",
    erreurNom: "❌ Le nom est obligatoire.",
    erreurEnregistrement: "❌ Une erreur est survenue lors de l'enregistrement.",

    // Field labels for dynamic map
    fieldLabels: {
      prenom: "Prénom",
      nom: "Nom",
      telephone: "Téléphone",
      ville: "Ville",
    },
  },
  en: {
    // Header
    modifierProfil: "Edit profile",

    // Section titles
    identite: "👤 Identity",
    vieSpirituelle: "🕊 Spiritual life",

    // Identity fields
    civilite: "Title",
    civiliteOpt: "-- Title --",
    homme: "Male",
    femme: "Female",
    prenom: "First name",
    nom: "Last name",
    telephone: "Phone",
    ville: "City",
    numeroWhatsapp: "WhatsApp number",
    age: "Age",
    ageOpt: "-- Choose --",
    ages: ["12-17 yrs","18-25 yrs","26-30 yrs","31-40 yrs","41-55 yrs","56-69 yrs","70 yrs and over"],

    // Spiritual life
    baptemeEau: "Water baptism",
    selectionner: "-- Select --",
    oui: "Yes",
    non: "No",
    veutBaptiser: "💦 Wants to be baptised",
    baptemeFeu: "Spirit baptism",
    priereSalut: "Salvation prayer",
    priereSalutOpt: "-- Salvation prayer? --",
    typeConversion: "Type",
    nouveauConverti: "New convert",
    reconciliation: "Reconciliation",
    formation: "Training",
    commentVenu: "How did they come?",
    commentVenuOpt: "-- Select --",
    invite: "Invited",
    reseaux: "Social media",
    evangelisation: "Evangelism",
    autre: "Other",
    infosSup: "Additional information",
    statutArrivee: "Status on arrival",
    statutArriveeOpt: "-- Select --",
    veutRejoindre: "Wants to join ICC",
    aDejaEglise: "Already has a church",
    visiteur: "Visitor",
    pilier: "🎖️ Define as a Pillar",
    leaderDeveloppement: "🏆 Leadership Development Path",
    parcoursChoisir: "Choose a development stage",
    errParcours: "❌ Please select a development stage.",
    parcoursStages: [
      { key: "potentiel", emoji: "🌱", label: "Potential identified" },
      { key: "croissance", emoji: "🌿", label: "Faithful Servant" },
      { key: "developpement", emoji: "🌳", label: "Leader in Training" },
      { key: "mature", emoji: "🌲", label: "Established Leader" },
    ],

    // Footer
    annuler: "Cancel",
    sauvegarder: "💾 Save",
    enregistrement: "Saving...",

    // Validation messages
    erreurPrenom: "❌ First name is required.",
    erreurNom: "❌ Last name is required.",
    erreurEnregistrement: "❌ An error occurred while saving.",

    // Field labels for dynamic map
    fieldLabels: {
      prenom: "First name",
      nom: "Last name",
      telephone: "Phone",
      ville: "City",
    },
  },
};

export default function EditMemberSuivisPopup({
  member,
  cellules,
  familles,
  conseillers,
  onClose,
  onUpdateMember,
  currentUserRoles,
  user,
}) {
  const { lang } = useLang();
  const t = translations[lang];

  const isPrivileged = (currentUserRoles || []).some(r => ["Administrateur", "ResponsableIntegration"].includes(r));  
  const isLeaderManager = (currentUserRoles || []).some(r => ["Administrateur", "SuperviseurCellule", "ResponsableCellule", "ResponsableFamille", "SuperviseurFamilles"].includes(r));

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
    pilier: !!member?.pilier,
    leader_developpement: !!member?.leader_developpement,
    parcours_leader_etape: "",
    etat_contact: member?.etat_contact || "Nouveau",
    bapteme_eau: member?.bapteme_eau ?? null,
    bapteme_esprit: member?.bapteme_esprit ?? null,
    priere_salut: member?.priere_salut || "",
    type_conversion: member?.type_conversion || "",
    cellule_id: member?.cellule_id ?? "",
    famille_id: member?.famille_id ?? "",
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
    if (!member?.id) return;
    const fetchAssignments = async () => {
      const { data, error } = await supabase
        .from("suivi_assignments")
        .select("conseiller_id, role, profiles:conseiller_id(id, prenom, nom)")
        .eq("membre_id", member.id)
        .eq("statut", "actif")
        .order("created_at", { ascending: true });

      if (error) { console.error("fetchAssignments error:", error); return; }

      if (data) {
        const sorted = [...data].sort((a, b) => {
          if (a.role === "principal") return -1;
          if (b.role === "principal") return 1;
          return 0;
        });
        const objects = sorted.map(d => d.profiles).filter(Boolean);
        setSelectedConseillers(objects);
      }
    };
    fetchAssignments();
  }, [member?.id]);

  // ✅ Charge la dernière étape du parcours depuis evaluations_leader
  useEffect(() => {
    if (!member?.id) return;
    const fetchLastStage = async () => {
      const { data } = await supabase
        .from("evaluations_leader")
        .select("parcours_etape")
        .eq("membre_id", member.id)
        .order("date_action", { ascending: false })
        .limit(1)
        .maybeSingle();

      setFormData((prev) => ({ ...prev, parcours_leader_etape: data?.parcours_etape || "" }));
    };
    fetchLastStage();
  }, [member?.id]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  // ✅ Le contrôle "member" arrive maintenant après tous les hooks
  if (!member) return null;

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
    if (!formData.prenom.trim()) return setMessage(t.erreurPrenom);
    if (!formData.nom.trim()) return setMessage(t.erreurNom);

    if (isLeaderManager && formData.leader_developpement && !formData.parcours_leader_etape) {
      return setMessage(t.errParcours);
    }

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
            branche_id: member.branche_id || null,
            sexe: formData.sexe,
            type: "ministere",
          });
        } else {
          await supabase.from("stats_ministere_besoin").delete()
            .eq("membre_id", member.id).eq("type", "ministere");
        }
      }

      // ✅ payload nettoyé : parcours_leader_etape n'est jamais envoyé à membres_complets
      const payload = {
        prenom: formData.prenom,
        nom: formData.nom,
        telephone: formData.telephone || null,
        ville: formData.ville || null,
        sexe: formData.sexe || null,
        age: formData.age || null,
        star: isPrivileged ? !!formData.star : !!member.star,
        pilier: isPrivileged ? !!formData.pilier : !!member.pilier,
        leader_developpement: isLeaderManager ? !!formData.leader_developpement : !!member.leader_developpement,
        etat_contact: formData.etat_contact || "Nouveau",
        bapteme_eau: formData.bapteme_eau,
        bapteme_esprit: formData.bapteme_esprit,
        priere_salut: formData.priere_salut || null,
        type_conversion: formData.type_conversion || null,
        cellule_id: isPrivileged ? (formData.cellule_id || null) : (member.cellule_id || null),
        famille_id: isPrivileged ? (formData.famille_id || null) : (member.famille_id || null),
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
      // ── Auto-intégration : dès qu'une cellule ou famille est attribuée ──
      const celluleOuFamilleAttribuee = !!(payload.cellule_id || payload.famille_id);
      if (celluleOuFamilleAttribuee) {
        payload.statut_suivis = 3;
      }

      const { error } = await supabase.from("membres_complets").update(payload).eq("id", member.id);
      if (error) throw error;

      // ✅ Insertion d'une évaluation minimale si une étape a été choisie
      let newStage = null;
      if (isLeaderManager && formData.leader_developpement && formData.parcours_leader_etape) {
        const { error: evalError } = await supabase.from("evaluations_leader").insert({
          membre_id: member.id,
          created_by: user?.id || null,
          date_action: new Date().toISOString().split("T")[0],
          parcours_etape: formData.parcours_leader_etape,
        });
        if (evalError) {
          console.error("Erreur ajout étape parcours:", evalError);
        } else {
          newStage = formData.parcours_leader_etape;
        }
      }

      if (isPrivileged) {
        await supabase.from("suivi_assignments").delete().eq("membre_id", member.id);
        const rows = selectedConseillers.map((c, index) => ({
          membre_id: member.id,
          conseiller_id: c.id,
          role: index === 0 ? "principal" : "assistant",
          statut: "actif"
        }));
        if (rows.length > 0) await supabase.from("suivi_assignments").insert(rows);
      }

      const { data: updatedMember, error: selectError } = await supabase
        .from("membres_complets").select("*").eq("id", member.id).single();
      if (selectError) throw selectError;

      onUpdateMember(updatedMember, newStage);
      onClose();
    } catch (err) {
      console.error(err);
      setMessage(t.erreurEnregistrement);
    } finally {
      setLoading(false);
    }
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
          <p className="text-blue-100 text-sm mt-1 opacity-80">{t.modifierProfil}</p>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-6 py-5 flex flex-col gap-5" style={{ maxHeight: "68vh" }}>

          {/* Section: Identité */}
          <SectionTitle>{t.identite}</SectionTitle>

          <Field label={t.civilite}>
            <select name="sexe" value={formData.sexe} onChange={handleChange} className="inp">
              <option value="">{t.civiliteOpt}</option>
              <option value="Homme">{t.homme}</option>
              <option value="Femme">{t.femme}</option>
            </select>
          </Field>

          {["prenom", "nom", "telephone", "ville"].map((f) => (
            <Field key={f} label={t.fieldLabels[f]}>
              <input name={f} value={formData[f]} onChange={handleChange} className="inp" />
              {f === "telephone" && (
                <label className="flex items-center gap-2 mt-2 text-sm text-gray-600 cursor-pointer">
                  <input type="checkbox" name="is_whatsapp" checked={formData.is_whatsapp} onChange={handleChange} className="accent-[#2E3192]" />
                  {t.numeroWhatsapp}
                </label>
              )}
            </Field>
          ))}

          <Field label={t.age}>
            <select name="age" value={formData.age} onChange={handleChange} className="inp">
              <option value="">{t.ageOpt}</option>
              {t.ages.map(v => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </Field>

          {/* Section: Vie spirituelle */}
          <SectionTitle>{t.vieSpirituelle}</SectionTitle>

          <Field label={t.baptemeEau}>
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
              <option value="">{t.selectionner}</option>
              <option value="Oui">{t.oui}</option>
              <option value="Non">{t.non}</option>
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
              {t.veutBaptiser}
            </label>
          )}

          <Field label={t.baptemeFeu}>
            <select name="bapteme_esprit" value={formData.bapteme_esprit ?? ""} onChange={handleChange} className="inp">
              <option value="">{t.selectionner}</option>
              <option value="Oui">{t.oui}</option>
              <option value="Non">{t.non}</option>
            </select>
          </Field>

          <Field label={t.priereSalut}>
            <select
              name="priere_salut"
              value={formData.priere_salut}
              onChange={(e) => {
                const value = e.target.value;
                setFormData({ ...formData, priere_salut: value, type_conversion: value === "Oui" ? formData.type_conversion : "" });
              }}
              className="inp"
            >
              <option value="">{t.priereSalutOpt}</option>
              <option value="Oui">{t.oui}</option>
              <option value="Non">{t.non}</option>
            </select>
            {formData.priere_salut === "Oui" && (
              <select name="type_conversion" value={formData.type_conversion} onChange={handleChange} className="inp mt-2">
                <option value="">{t.typeConversion}</option>
                <option value="Nouveau converti">{t.nouveauConverti}</option>
                <option value="Réconciliation">{t.reconciliation}</option>
              </select>
            )}
          </Field>

          <Field label={t.formation}>
            <textarea name="Formation" value={formData.Formation} onChange={handleChange} className="inp" rows={2} />
          </Field>
          
          {isPrivileged && (
            <div className="flex flex-col gap-2 py-2">
              <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-gray-700">
                <input
                  type="checkbox"
                  name="pilier"
                  checked={formData.pilier}
                  onChange={handleChange}
                  className="accent-[#2E3192] w-4 h-4"
                />
                {t.pilier}
              </label>
            </div>
          )}

          {isLeaderManager && (
            <div className="flex flex-col gap-2 py-2">
              <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-gray-700">
                <input
                  type="checkbox"
                  name="leader_developpement"
                  checked={formData.leader_developpement}
                  onChange={handleChange}
                  className="accent-[#6366f1] w-4 h-4"
                />
                {t.leaderDeveloppement}
              </label>

              {formData.leader_developpement && (
                <div className="rounded-xl p-3 border" style={{ background: "#f8faff", borderColor: "#c7cef5" }}>
                  {!formData.parcours_leader_etape && (
                    <p className="text-xs text-gray-400 italic mb-2">{t.parcoursChoisir}</p>
                  )}
                  <div className="flex items-stretch justify-between gap-2">
                    {t.parcoursStages.map((stage) => {
                      const isActive = stage.key === formData.parcours_leader_etape;
                      return (
                        <button
                          key={stage.key}
                          type="button"
                          onClick={() =>
                            setFormData((p) => ({ ...p, parcours_leader_etape: stage.key }))
                          }
                          className="flex-1 flex flex-col items-center gap-1 rounded-lg px-2 py-2 transition-all active:scale-95"
                          style={{
                            background: isActive ? "#2E3192" : "#ffffff",
                            border: `2px solid ${isActive ? "#2E3192" : "#e2e8f0"}`,
                          }}
                        >
                          <span className="text-lg leading-none">{stage.emoji}</span>
                          <span
                            className="text-[10px] font-semibold text-center leading-tight"
                            style={{ color: isActive ? "#fff" : "#334155" }}
                          >
                            {stage.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          <Field label={t.commentVenu}>
            <select name="venu" value={formData.venu} onChange={handleChange} className="inp">
              <option value="">{t.commentVenuOpt}</option>
              <option value="invité">{t.invite}</option>
              <option value="réseaux">{t.reseaux}</option>
              <option value="evangélisation">{t.evangelisation}</option>
              <option value="autre">{t.autre}</option>
            </select>
          </Field>

          <Field label={t.infosSup}>
            <textarea name="infos_supplementaires" value={formData.infos_supplementaires} onChange={handleChange} className="inp" rows={2} />
          </Field>

          <Field label={t.statutArrivee}>
            <select name="statut_initial" value={formData.statut_initial} onChange={handleChange} className="inp">
              <option value="">{t.statutArriveeOpt}</option>
              <option value="veut rejoindre ICC">{t.veutRejoindre}</option>
              <option value="a déjà son église">{t.aDejaEglise}</option>
              <option value="visiteur">{t.visiteur}</option>
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
            {t.annuler}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-white transition-all disabled:opacity-60"
            style={{ background: loading ? "#a0a0c0" : "linear-gradient(135deg, #2E3192 0%, #4f54c9 100%)" }}
          >
            {loading ? t.enregistrement : t.sauvegarder}
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
