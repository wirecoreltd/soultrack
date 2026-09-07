// ═══════════════════════════════════════════════════════════════
// PAGE : Export RGPD (ExportRGPD)
// Route supposée : /administrateur/export-rgpd
// ═══════════════════════════════════════════════════════════════
// Description : Permet à un Administrateur de télécharger un export
// .xlsx complet des données de SA propre église (scope automatique
// sur eglise_id), avec colonnes déjà résolues (noms lisibles au lieu
// des UUID bruts). Génération entièrement côté client, aucun
// stockage serveur du fichier généré.
//
// ⚠️ SÉCURITÉ — IMPORTANT :
// Le filtrage par eglise_id ci-dessous est fait dans les requêtes
// Supabase (.eq("eglise_id", ...)), ce qui est correct et nécessaire,
// MAIS ce n'est pas une garantie de sécurité en soi puisque le code
// s'exécute dans le navigateur : l'utilisateur pourrait techniquement
// modifier la requête. La vraie barrière de sécurité doit venir des
// policies RLS (Row Level Security) Supabase sur CHAQUE table
// concernée (membres_complets, cellules, familles, suivis,
// suivis_evangelises, eglises, profiles), qui doivent interdire tout
// accès à des lignes dont eglise_id != eglise_id de l'utilisateur
// authentifié, quelle que soit la requête envoyée. Vérifie que ces
// policies existent avant de considérer cet export comme conforme.
//
// Tables Supabase utilisées (lecture seule) :
// - profiles              → profil de l'utilisateur connecté + résolution auteurs/conseillers
// - eglises                → infos église + église superviseure
// - eglise_supervisions    → résolution de l'église superviseure (⚠️ à confirmer, cf. Administrateur.js)
// - membres_complets       → feuille "Membres"
// - cellules               → feuille "Cellules" + résolution cellule des membres
// - familles               → résolution famille des membres
// - suivi_assignments      → résolution conseiller(s) par membre
// - suivis                 → feuille "Suivis pastoraux"
// - suivis_evangelises     → feuille "Suivis évangélisation"
// ═══════════════════════════════════════════════════════════════

"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import supabase from "../../lib/supabaseClient"; // ⚠️ adapte le chemin relatif selon l'emplacement réel du fichier
import ProtectedRoute from "../../components/ProtectedRoute";
import HeaderPages from "../../components/HeaderPages";
import Footer from "../../components/Footer";
import { useLang } from "../../hooks/useLang";

const translations = {
  fr: {
    pageTitle: "Export",
    pageTitleHighlight: "RGPD",
    subtitle:
      "Téléchargez un export complet et lisible des données de votre église, au format Excel (une feuille par catégorie).",
    button: "📥 Générer et télécharger l'export (.xlsx)",
    generating: "⏳ Génération en cours...",
    successToast: "✅ Export généré avec succès",
    errorToast: "❌ Erreur lors de la génération de l'export : ",
    notAdmin: "Cette fonctionnalité est réservée aux administrateurs.",
    scopeNotice: (nom) =>
      `L'export ne contiendra que les données de l'église : ${nom || "—"}.`,
    disclaimer:
      "Le fichier est généré directement dans votre navigateur et n'est jamais stocké sur nos serveurs.",
  },
  en: {
    pageTitle: "GDPR",
    pageTitleHighlight: "Export",
    subtitle:
      "Download a complete, readable export of your church's data as an Excel file (one sheet per category).",
    button: "📥 Generate and download export (.xlsx)",
    generating: "⏳ Generating...",
    successToast: "✅ Export generated successfully",
    errorToast: "❌ Error generating export: ",
    notAdmin: "This feature is reserved for administrators.",
    scopeNotice: (nom) => `The export will only contain data for: ${nom || "—"}.`,
    disclaimer:
      "The file is generated directly in your browser and is never stored on our servers.",
  },
};

// ─── Helpers de résolution / formatage ──────────────────────────

function safeParseArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [value];
  } catch {
    return [value];
  }
}

function formatMinistere(ministereJson, autreMinistere) {
  let list = safeParseArray(ministereJson).filter(
    (m) => typeof m === "string" && m.toLowerCase() !== "autre"
  );
  if (autreMinistere?.trim()) list.push(autreMinistere.trim());
  return list.join(", ");
}

function formatBesoins(besoinJson) {
  return safeParseArray(besoinJson)
    .map((b) => (typeof b === "string" ? b : b?.label || ""))
    .filter(Boolean)
    .join(", ");
}

function toDateStr(value) {
  if (!value) return "";
  try {
    return new Date(value).toISOString().slice(0, 10);
  } catch {
    return "";
  }
}

// ─── Composant ───────────────────────────────────────────────────

export default function ExportRGPD() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur"]}>
      {/* ⚠️ Décision ouverte du résumé : si "ResponsableAdministration" doit
          aussi avoir accès, ajoute-le ici : ["Administrateur", "ResponsableAdministration"] */}
      <ExportRGPDContent />
    </ProtectedRoute>
  );
}

function ExportRGPDContent() {
  const { lang } = useLang();
  const t = translations[lang];

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [egliseNom, setEgliseNom] = useState(null);

  const showToast = (msg, isError = false) => {
    setToast({ msg, isError });
    setTimeout(() => setToast(null), 4000);
  };

  // ─── Récupère le profil courant (id, eglise_id, roles) ────────
  const getCurrentProfile = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Utilisateur non authentifié");

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("id, eglise_id, roles, role")
      .eq("id", user.id)
      .single();

    if (error || !profile) throw error || new Error("Profil introuvable");
    return profile;
  };

  // ─── Feuille 1 : Infos Église ───────────────────────────────────
  const buildFeuilleEglise = async (egliseId) => {
    const { data: eglise, error } = await supabase
      .from("eglises")
      .select("*") // ⚠️ colonnes exactes à confirmer (nom, ville, pays, denomination, branche...)
      .eq("id", egliseId)
      .single();

    if (error || !eglise) throw error || new Error("Église introuvable");
    setEgliseNom(eglise.nom);

    // Résolution de l'église superviseure via eglise_supervisions.
    // Schéma confirmé : supervisee_eglise_id / superviseur_eglise_id / statut.
    let egliseSuperviseureNom = "—";
    try {
      const { data: supervision } = await supabase
        .from("eglise_supervisions")
        .select("superviseur_eglise_id, eglise_nom, statut")
        .eq("supervisee_eglise_id", egliseId)
        .eq("statut", "accepted")
        .maybeSingle();

      if (supervision?.superviseur_eglise_id) {
        const { data: sup } = await supabase
          .from("eglises")
          .select("nom")
          .eq("id", supervision.superviseur_eglise_id)
          .single();
        // Repli sur eglise_nom (snapshot stocké sur la ligne de supervision)
        // si la jointure vers eglises échoue pour une raison quelconque.
        egliseSuperviseureNom = sup?.nom || supervision.eglise_nom || "—";
      }
    } catch (e) {
      console.warn("Résolution église superviseure impossible:", e);
    }

    return [
      {
        Nom: eglise.nom || "—",
        Ville: eglise.ville || "—",
        Pays: eglise.pays || "—",
        Dénomination: eglise.denomination || "—",
        Branche: eglise.branche || "—",
        "Église superviseure": egliseSuperviseureNom,
      },
    ];
  };

  // ─── Feuille 2 : Membres ────────────────────────────────────────
  const buildFeuilleMembres = async (egliseId) => {
    const { data: membres, error } = await supabase
      .from("membres_complets")
      .select(`
        id, prenom, nom, telephone, ville, sexe, age, etat_contact,
        date_venu, created_at, cellule_id, famille_id, is_whatsapp,
        statut_suivis, suivi_statut, date_envoi_suivi, commentaire_suivis,
        Commentaire_Suivi_Evangelisation, bapteme_eau, veut_se_faire_baptiser,
        bapteme_esprit, priere_salut, type_conversion, Formation, Ministere,
        Autre_Ministere, venu, statut_initial, infos_supplementaires, besoin
      `)
      .eq("eglise_id", egliseId)
      .neq("etat_contact", "supprime");

    if (error) throw error;
    if (!membres || membres.length === 0) return [];

    const [{ data: cellules }, { data: familles }, { data: assignments }] =
      await Promise.all([
        supabase.from("cellules").select("id, cellule_full").eq("eglise_id", egliseId),
        supabase.from("familles").select("id, famille_full").eq("eglise_id", egliseId),
        supabase.from("suivi_assignments").select("membre_id, conseiller_id"),
      ]);

    const celluleMap = Object.fromEntries(
      (cellules || []).map((c) => [String(c.id), c.cellule_full])
    );
    const familleMap = Object.fromEntries(
      (familles || []).map((f) => [String(f.id), f.famille_full])
    );

    const conseillerIds = [
      ...new Set((assignments || []).map((a) => a.conseiller_id).filter(Boolean)),
    ];
    let profileMap = {};
    if (conseillerIds.length > 0) {
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, prenom, nom") // ⚠️ jamais password_hash ni autre champ sensible
        .in("id", conseillerIds);
      profileMap = Object.fromEntries(
        (profilesData || []).map((p) => [p.id, `${p.prenom || ""} ${p.nom || ""}`.trim()])
      );
    }
    const conseillersParMembre = {};
    (assignments || []).forEach((a) => {
      const nom = profileMap[a.conseiller_id];
      if (!nom) return;
      if (!conseillersParMembre[a.membre_id]) conseillersParMembre[a.membre_id] = [];
      if (!conseillersParMembre[a.membre_id].includes(nom)) {
        conseillersParMembre[a.membre_id].push(nom);
      }
    });

    return membres.map((m) => ({
      Prénom: m.prenom || "—",
      Nom: m.nom || "—",
      Téléphone: m.telephone || "—",
      Ville: m.ville || "—",
      Sexe: m.sexe || "—",
      "Tranche d'âge": m.age || "—",
      WhatsApp: m.is_whatsapp ? "Oui" : "Non",
      "État contact": m.etat_contact || "—",
      "Date venue": toDateStr(m.date_venu),
      "Créé le": toDateStr(m.created_at),
      Cellule: celluleMap[String(m.cellule_id)] || "—",
      Famille: familleMap[String(m.famille_id)] || "—",
      "Conseiller(s)": (conseillersParMembre[m.id] || []).join(", ") || "—",
      "Statut suivi": m.statut_suivis ?? m.suivi_statut ?? "—",
      "Date envoi suivi": toDateStr(m.date_envoi_suivi),
      "Commentaire suivi": m.commentaire_suivis || "—",
      "Commentaire évangélisation": m.Commentaire_Suivi_Evangelisation || "—",
      "Baptême d'eau": m.bapteme_eau || "—",
      "Veut se faire baptiser": m.veut_se_faire_baptiser || "—",
      "Baptême de feu": m.bapteme_esprit || "—",
      "Prière du salut": m.priere_salut || "—",
      Conversion: m.type_conversion || "—",
      Formation: m.Formation || "—",
      Ministère: formatMinistere(m.Ministere, m.Autre_Ministere) || "—",
      "Comment venu": m.venu || "—",
      Raison: m.statut_initial || "—",
      "Infos complémentaires": m.infos_supplementaires || "—",
      "Besoins pastoraux": formatBesoins(m.besoin) || "—",
    }));
  };

  // ─── Feuille 3 : Cellules ───────────────────────────────────────
  const buildFeuilleCellules = async (egliseId) => {
    const { data: cellules, error } = await supabase
      .from("cellules")
      .select(
        // ⚠️ noms de colonnes à confirmer avec le schéma réel
        "id, ville, cellule_full, responsable_nom, telephone_responsable, superviseur_id, cellule_mere_id, branche_id, created_at"
      )
      .eq("eglise_id", egliseId);

    if (error) throw error;
    if (!cellules || cellules.length === 0) return [];

    const superviseurIds = [...new Set(cellules.map((c) => c.superviseur_id).filter(Boolean))];
    const celluleMereIds = [...new Set(cellules.map((c) => c.cellule_mere_id).filter(Boolean))];
    const brancheIds = [...new Set(cellules.map((c) => c.branche_id).filter(Boolean))];

    const [{ data: superviseurs }, { data: cellulesMeres }, { data: branches }] =
      await Promise.all([
        superviseurIds.length
          ? supabase.from("profiles").select("id, prenom, nom").in("id", superviseurIds)
          : Promise.resolve({ data: [] }),
        celluleMereIds.length
          ? supabase.from("cellules").select("id, cellule_full").in("id", celluleMereIds)
          : Promise.resolve({ data: [] }),
        brancheIds.length
          ? supabase.from("branches").select("id, nom").in("id", brancheIds) // ⚠️ table/colonnes "branches" à confirmer
          : Promise.resolve({ data: [] }),
      ]);

    const superviseurMap = Object.fromEntries(
      (superviseurs || []).map((p) => [p.id, `${p.prenom || ""} ${p.nom || ""}`.trim()])
    );
    const celluleMereMap = Object.fromEntries(
      (cellulesMeres || []).map((c) => [c.id, c.cellule_full])
    );
    const brancheMap = Object.fromEntries((branches || []).map((b) => [b.id, b.nom]));

    return cellules.map((c) => ({
      Ville: c.ville || "—",
      Nom: c.cellule_full || "—",
      Responsable: c.responsable_nom || "—",
      "Téléphone responsable": c.telephone_responsable || "—",
      Superviseur: superviseurMap[c.superviseur_id] || "—",
      "Cellule mère": celluleMereMap[c.cellule_mere_id] || "—",
      Branche: brancheMap[c.branche_id] || "—",
      "Créée le": toDateStr(c.created_at),
    }));
  };

  // ─── Feuille 4 : Suivis pastoraux ───────────────────────────────
  const buildFeuilleSuivis = async (egliseId) => {
    // ⚠️ La table "suivis" n'a probablement pas de colonne eglise_id directe :
    // on filtre donc via les membres de l'église. À adapter si "suivis" a
    // bien sa propre colonne eglise_id.
    const { data: membres } = await supabase
      .from("membres_complets")
      .select("id, prenom, nom")
      .eq("eglise_id", egliseId);

    const membreIds = (membres || []).map((m) => m.id);
    const membreMap = Object.fromEntries(
      (membres || []).map((m) => [m.id, `${m.prenom || ""} ${m.nom || ""}`.trim()])
    );
    if (membreIds.length === 0) return [];

    const { data: suivis, error } = await supabase
      .from("suivis")
      .select(
        // ⚠️ liste de champs qualitatifs à compléter selon le schéma réel
        // (vie spirituelle, combats, blocages, talents, etc. mentionnés au point 4)
        "membre_id, type, statut, besoin, commentaire, auteur_id, date_action, created_at"
      )
      .in("membre_id", membreIds);

    if (error) throw error;
    if (!suivis || suivis.length === 0) return [];

    const auteurIds = [...new Set(suivis.map((s) => s.auteur_id).filter(Boolean))];
    const { data: auteurs } = auteurIds.length
      ? await supabase.from("profiles").select("id, prenom, nom").in("id", auteurIds)
      : { data: [] };
    const auteurMap = Object.fromEntries(
      (auteurs || []).map((a) => [a.id, `${a.prenom || ""} ${a.nom || ""}`.trim()])
    );

    return suivis.map((s) => ({
      Membre: membreMap[s.membre_id] || "—",
      Type: s.type || "—",
      Statut: s.statut || "—",
      Besoin: formatBesoins(s.besoin) || "—",
      Commentaire: s.commentaire || "—",
      // ⚠️ AJOUTER ICI les autres champs qualitatifs réels de la table
      // "suivis" (vie spirituelle, combats, blocages, talents...) une fois
      // le schéma confirmé, sur le même modèle que les lignes ci-dessus.
      Auteur: auteurMap[s.auteur_id] || "—",
      "Date action": toDateStr(s.date_action),
      "Créé le": toDateStr(s.created_at),
    }));
  };

  // ─── Feuille 5 : Suivis évangélisation ──────────────────────────
  const buildFeuilleEvangelisation = async (egliseId) => {
    // ⚠️ même remarque que pour "suivis" : filtrage via les évangélisés
    // de l'église, à adapter si la table a sa propre colonne eglise_id.
    const { data: evangelises } = await supabase
      .from("evangelises") // ⚠️ nom de table à confirmer
      .select("id, prenom, nom")
      .eq("eglise_id", egliseId);

    const evangeliseIds = (evangelises || []).map((e) => e.id);
    const evangeliseMap = Object.fromEntries(
      (evangelises || []).map((e) => [e.id, `${e.prenom || ""} ${e.nom || ""}`.trim()])
    );
    if (evangeliseIds.length === 0) return [];

    const { data: suivis, error } = await supabase
      .from("suivis_evangelises")
      .select(
        // ⚠️ champs qualitatifs à compléter selon le schéma réel
        "evangelise_id, type, statut, commentaire, auteur_id, date_action, created_at"
      )
      .in("evangelise_id", evangeliseIds);

    if (error) throw error;
    if (!suivis || suivis.length === 0) return [];

    const auteurIds = [...new Set(suivis.map((s) => s.auteur_id).filter(Boolean))];
    const { data: auteurs } = auteurIds.length
      ? await supabase.from("profiles").select("id, prenom, nom").in("id", auteurIds)
      : { data: [] };
    const auteurMap = Object.fromEntries(
      (auteurs || []).map((a) => [a.id, `${a.prenom || ""} ${a.nom || ""}`.trim()])
    );

    return suivis.map((s) => ({
      Évangélisé: evangeliseMap[s.evangelise_id] || "—",
      Type: s.type || "—",
      Statut: s.statut || "—",
      Commentaire: s.commentaire || "—",
      // ⚠️ AJOUTER ICI les autres champs qualitatifs réels de la table
      // "suivis_evangelises" une fois le schéma confirmé.
      Auteur: auteurMap[s.auteur_id] || "—",
      "Date action": toDateStr(s.date_action),
      "Créé le": toDateStr(s.created_at),
    }));
  };

  // ─── Génération et téléchargement du fichier ────────────────────
  const handleExport = async () => {
    setLoading(true);
    try {
      const profile = await getCurrentProfile();

      // Garde-fou côté client (en plus de ProtectedRoute) : ne jamais
      // lancer l'export si le rôle n'est pas Administrateur.
      const rolesArray = Array.isArray(profile.roles)
        ? profile.roles
        : typeof profile.roles === "string"
        ? profile.roles.replace("{", "").replace("}", "").split(",").map((r) => r.trim())
        : profile.role
        ? [profile.role]
        : [];
      if (!rolesArray.includes("Administrateur")) {
        showToast(t.notAdmin, true);
        setLoading(false);
        return;
      }

      const egliseId = profile.eglise_id;

      const [feuilleEglise, feuilleMembres, feuilleCellules, feuilleSuivis, feuilleEvang] =
        await Promise.all([
          buildFeuilleEglise(egliseId),
          buildFeuilleMembres(egliseId),
          buildFeuilleCellules(egliseId),
          buildFeuilleSuivis(egliseId),
          buildFeuilleEvangelisation(egliseId),
        ]);

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(
        workbook,
        XLSX.utils.json_to_sheet(feuilleEglise),
        "Infos Eglise"
      );
      XLSX.utils.book_append_sheet(
        workbook,
        XLSX.utils.json_to_sheet(feuilleMembres.length ? feuilleMembres : [{ "—": "Aucune donnée" }]),
        "Membres"
      );
      XLSX.utils.book_append_sheet(
        workbook,
        XLSX.utils.json_to_sheet(feuilleCellules.length ? feuilleCellules : [{ "—": "Aucune donnée" }]),
        "Cellules"
      );
      XLSX.utils.book_append_sheet(
        workbook,
        XLSX.utils.json_to_sheet(feuilleSuivis.length ? feuilleSuivis : [{ "—": "Aucune donnée" }]),
        "Suivis pastoraux"
      );
      XLSX.utils.book_append_sheet(
        workbook,
        XLSX.utils.json_to_sheet(feuilleEvang.length ? feuilleEvang : [{ "—": "Aucune donnée" }]),
        "Suivis evangelisation"
      );

      const dateStr = new Date().toISOString().slice(0, 10);
      XLSX.writeFile(workbook, `export-rgpd-${dateStr}.xlsx`);

      showToast(t.successToast);
    } catch (err) {
      console.error("Erreur export RGPD:", err);
      showToast(t.errorToast + (err.message || "inconnue"), true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center p-4 sm:p-6"
      style={{ background: "#333699" }}
    >
      <HeaderPages />

      <h1 className="text-2xl font-bold mt-4 mb-4 text-white text-center">
        {t.pageTitle} <span className="text-emerald-300">{t.pageTitleHighlight}</span>
      </h1>

      <div className="max-w-2xl w-full text-center mb-6">
        <p className="text-white/90">{t.subtitle}</p>
        {egliseNom && (
          <p className="text-amber-300 text-sm mt-2">{t.scopeNotice(egliseNom)}</p>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 max-w-md w-full flex flex-col items-center gap-3">
        <button
          onClick={handleExport}
          disabled={loading}
          className="bg-[#333699] text-amber-300 font-semibold px-4 py-2 rounded-md shadow disabled:opacity-60"
        >
          {loading ? t.generating : t.button}
        </button>
        <p className="text-xs text-gray-500 text-center">{t.disclaimer}</p>
      </div>

      {toast && (
        <div
          className={`fixed bottom-4 right-4 px-4 py-2 rounded-lg shadow-lg z-50 text-white ${
            toast.isError ? "bg-red-600" : "bg-black"
          }`}
        >
          {toast.msg}
        </div>
      )}

      <Footer />
    </div>
  );
}
