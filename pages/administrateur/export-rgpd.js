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
// concernée (membres_complets, familles, suivis,
// suivis_evangelises, eglises, profiles), qui doivent interdire tout
// accès à des lignes dont eglise_id != eglise_id de l'utilisateur
// authentifié, quelle que soit la requête envoyée. Vérifie que ces
// policies existent avant de considérer cet export comme conforme.
//
// ── Changements dans cette révision ──
// 1. Feuille "Infos Eglise" : passée d'une unique ligne à N colonnes
//    (peu lisible) à un format vertical "Champ / Valeur" (une ligne
//    par info), avec largeurs de colonnes ajustées pour un rendu
//    plus propre à l'ouverture.
// 2. Onglet "Cellules" retiré (feuille + requêtes associées
//    supprimées, plus de résolution de cellule_mere / superviseur).
//    ⚠️ Le mapping Cellule sur la feuille "Membres" reste en place
//    (celluleMap), car il ne dépend pas de l'onglet Cellules et sert
//    juste à afficher le nom de la cellule d'un membre.
// 3. Fix "ça commence à une ligne random sur mobile (ex: ligne 157)" :
//    ce n'est pas un souci de contenu du fichier généré, mais très
//    probablement un cache de position de scroll de l'app mobile
//    (WPS / Google Sheets / Excel mobile...) associé au *nom de
//    fichier*. Comme le nom était basé uniquement sur la date
//    (ex: export-rgpd-2026-09-11.xlsx), rouvrir un export généré
//    plusieurs fois le même jour rouvre à la dernière position
//    scrollée du fichier précédent portant le même nom.
//    → Le nom de fichier inclut maintenant l'heure/minute/seconde
//    (et un suffixe aléatoire) pour être unique à chaque export.
//    → Sur mobile (Capacitor), on supprime aussi explicitement tout
//    fichier existant au même chemin avant d'écrire, par sécurité.
// ═══════════════════════════════════════════════════════════════

"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
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
  // Format "Champ / Valeur" (une ligne par info) plutôt qu'une seule
  // ligne étalée sur N colonnes : bien plus lisible à l'ouverture,
  // surtout sur mobile où les colonnes larges obligent à scroller
  // horizontalement.
  const buildFeuilleEglise = async (egliseId) => {
    const { data: eglise, error } = await supabase
      .from("eglises")
      .select("id, nom, ville, pays, denomination, branche")
      .eq("id", egliseId)
      .single();

    if (error || !eglise) throw error || new Error("Église introuvable");
    setEgliseNom(eglise.nom);

    // Résolution de l'église superviseure via eglise_supervisions.
    // Schéma confirmé : supervisee_eglise_id / superviseur_eglise_id / statut / eglise_nom.
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
      { Champ: "Nom", Valeur: eglise.nom || "—" },
      { Champ: "Ville", Valeur: eglise.ville || "—" },
      { Champ: "Pays", Valeur: eglise.pays || "—" },
      { Champ: "Dénomination", Valeur: eglise.denomination || "—" },
      { Champ: "Branche", Valeur: eglise.branche || "—" },
      { Champ: "Église superviseure", Valeur: egliseSuperviseureNom },
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

    // On garde la résolution des noms de cellule pour la colonne
    // "Cellule" de la feuille Membres, même si l'onglet Cellules
    // dédié a été retiré (deux besoins indépendants).
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

  // ─── Feuille 3 : Suivis pastoraux ───────────────────────────────
  const buildFeuilleSuivis = async (egliseId) => {
    // ⚠️ La table "suivis" n'a pas de colonne eglise_id directe :
    // on filtre donc via les membres de l'église.
    const { data: membres } = await supabase
      .from("membres_complets")
      .select("id, prenom, nom")
      .eq("eglise_id", egliseId);

    const membreIds = (membres || []).map((m) => m.id);
    const membreMap = Object.fromEntries(
      (membres || []).map((m) => [m.id, `${m.prenom || ""} ${m.nom || ""}`.trim()])
    );
    if (membreIds.length === 0) return [];

    // Colonnes confirmées via information_schema pour "suivis" :
    // l'auteur est "created_by" (pas "auteur_id"), et les champs qualitatifs
    // réels sont etat_general, vie_spirituelle, intention_priere,
    // combats_luttes, blocages, vie_personnelle, besoins_avancement,
    // talents, domaine_service.
    const { data: suivis, error } = await supabase
      .from("suivis")
      .select(
        "membre_id, type, statut, besoin, commentaire, created_by, action_type, date_action, created_at, etat_general, vie_spirituelle, intention_priere, combats_luttes, blocages, vie_personnelle, besoins_avancement, talents, domaine_service"
      )
      .in("membre_id", membreIds);

    if (error) throw error;
    if (!suivis || suivis.length === 0) return [];

    const createdByIds = [...new Set(suivis.map((s) => s.created_by).filter(Boolean))];
    const { data: auteurs } = createdByIds.length
      ? await supabase.from("profiles").select("id, prenom, nom").in("id", createdByIds)
      : { data: [] };
    const auteurMap = Object.fromEntries(
      (auteurs || []).map((a) => [a.id, `${a.prenom || ""} ${a.nom || ""}`.trim()])
    );

    return suivis.map((s) => ({
      Membre: membreMap[s.membre_id] || "—",
      Type: s.type || "—",
      "Type d'action": s.action_type || "—",
      Statut: s.statut || "—",
      Besoin: formatBesoins(s.besoin) || "—",
      Commentaire: s.commentaire || "—",
      "État général": s.etat_general || "—",
      "Vie spirituelle": s.vie_spirituelle || "—",
      "Intention de prière": s.intention_priere || "—",
      "Combats / luttes": s.combats_luttes || "—",
      Blocages: s.blocages || "—",
      "Vie personnelle": s.vie_personnelle || "—",
      "Besoins d'avancement": s.besoins_avancement || "—",
      Talents: s.talents || "—",
      "Domaine de service": s.domaine_service || "—",
      Auteur: auteurMap[s.created_by] || "—",
      "Date action": toDateStr(s.date_action),
      "Créé le": toDateStr(s.created_at),
    }));
  };

  // ─── Feuille 4 : Suivis évangélisation ──────────────────────────
  const buildFeuilleEvangelisation = async (egliseId) => {
    // ⚠️ même remarque que pour "suivis" : filtrage via les évangélisés
    // de l'église (pas de colonne eglise_id directe sur suivis_evangelises).
    const { data: evangelises } = await supabase
      .from("evangelises")
      .select("id, prenom, nom")
      .eq("eglise_id", egliseId);

    const evangeliseIds = (evangelises || []).map((e) => e.id);
    const evangeliseMap = Object.fromEntries(
      (evangelises || []).map((e) => [e.id, `${e.prenom || ""} ${e.nom || ""}`.trim()])
    );
    if (evangeliseIds.length === 0) return [];

    // Colonnes confirmées via information_schema pour "suivis_evangelises" :
    // l'auteur est "created_by" (pas "auteur_id"). Champs qualitatifs réels
    // intégrés ci-dessous (etat_actuel, situation_actuelle, contexte_vie,
    // relation_avec_dieu, perception_spirituelle, besoins_principaux,
    // preoccupations, luttes, ouverture_spirituelle, ouverture_priere,
    // engagement_foi, suivi_souhaite, canal_suivi, talents_identifies,
    // domaine_service, accompagnement_suivi, etudes_parole).
    // Note : la table a deux colonnes quasi-identiques "etudes_parol" et
    // "etudes_parole" (probable doublon/typo historique) — on retient la
    // version correctement orthographiée "etudes_parole".
    const { data: suivis, error } = await supabase
      .from("suivis_evangelises")
      .select(
        "evangelise_id, type, statut, besoin, commentaire, created_by, action_type, date_action, created_at, etat_actuel, situation_actuelle, contexte_vie, relation_avec_dieu, perception_spirituelle, besoins_principaux, preoccupations, luttes, ouverture_spirituelle, ouverture_priere, engagement_foi, suivi_souhaite, canal_suivi, talents_identifies, domaine_service, accompagnement_suivi, etudes_parole"
      )
      .in("evangelise_id", evangeliseIds);

    if (error) throw error;
    if (!suivis || suivis.length === 0) return [];

    const createdByIds = [...new Set(suivis.map((s) => s.created_by).filter(Boolean))];
    const { data: auteurs } = createdByIds.length
      ? await supabase.from("profiles").select("id, prenom, nom").in("id", createdByIds)
      : { data: [] };
    const auteurMap = Object.fromEntries(
      (auteurs || []).map((a) => [a.id, `${a.prenom || ""} ${a.nom || ""}`.trim()])
    );

    return suivis.map((s) => ({
      Évangélisé: evangeliseMap[s.evangelise_id] || "—",
      Type: s.type || "—",
      "Type d'action": s.action_type || "—",
      Statut: s.statut || "—",
      Besoin: formatBesoins(s.besoin) || "—",
      Commentaire: s.commentaire || "—",
      "État actuel": s.etat_actuel || "—",
      "Situation actuelle": s.situation_actuelle || "—",
      "Contexte de vie": s.contexte_vie || "—",
      "Relation avec Dieu": s.relation_avec_dieu || "—",
      "Perception spirituelle": s.perception_spirituelle || "—",
      "Besoins principaux": s.besoins_principaux || "—",
      Préoccupations: s.preoccupations || "—",
      Luttes: s.luttes || "—",
      "Ouverture spirituelle": s.ouverture_spirituelle || "—",
      "Ouverture à la prière": s.ouverture_priere || "—",
      "Engagement de foi": s.engagement_foi || "—",
      "Suivi souhaité": s.suivi_souhaite || "—",
      "Canal de suivi": s.canal_suivi || "—",
      "Talents identifiés": s.talents_identifies || "—",
      "Domaine de service": s.domaine_service || "—",
      "Accompagnement / suivi": s.accompagnement_suivi || "—",
      "Étude de la Parole": s.etudes_parole || "—",
      Auteur: auteurMap[s.created_by] || "—",
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

      const [feuilleEglise, feuilleMembres, feuilleSuivis, feuilleEvang] =
        await Promise.all([
          buildFeuilleEglise(egliseId),
          buildFeuilleMembres(egliseId),
          buildFeuilleSuivis(egliseId),
          buildFeuilleEvangelisation(egliseId),
        ]);

      const workbook = XLSX.utils.book_new();

      // Infos Eglise : format Champ/Valeur, avec largeurs de colonnes
      // ajustées pour un rendu plus propre (label court à gauche,
      // valeur potentiellement longue à droite).
      const wsEglise = XLSX.utils.json_to_sheet(feuilleEglise);
      wsEglise["!cols"] = [{ wch: 22 }, { wch: 45 }];
      XLSX.utils.book_append_sheet(workbook, wsEglise, "Infos Eglise");

      XLSX.utils.book_append_sheet(
        workbook,
        XLSX.utils.json_to_sheet(feuilleMembres.length ? feuilleMembres : [{ "—": "Aucune donnée" }]),
        "Membres"
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

      // Nom de fichier unique à chaque génération (date + heure:min:sec +
      // suffixe aléatoire court). Évite qu'une app mobile de lecture de
      // fichiers (WPS, Google Sheets, Excel mobile...) réouvre un export
      // du jour à la position de scroll d'un export précédent portant
      // le même nom (c'est ce qui causait l'ouverture "à la ligne 157").
      const now = new Date();
      const datePart = now.toISOString().slice(0, 10);
      const timePart = now.toTimeString().slice(0, 8).replace(/:/g, "-"); // HH-MM-SS
      const randomPart = Math.random().toString(36).slice(2, 6);
      const fileName = `export-rgpd-${datePart}_${timePart}-${randomPart}.xlsx`;

      // ⚠️ Sur une app installée via Capacitor, la WebView n'a pas de
      // mécanisme de téléchargement de fichier comme un vrai navigateur :
      // XLSX.writeFile() (basé sur un clic simulé sur un <a download>) ne
      // fait rien, sans erreur. On passe donc par Filesystem + Share pour
      // écrire le fichier puis ouvrir la feuille de partage native, qui
      // permet à l'utilisateur de l'enregistrer où il veut (Fichiers,
      // Drive, etc.). Sur le web, on garde le téléchargement classique.
      if (Capacitor.isNativePlatform()) {
        const base64Data = XLSX.write(workbook, { bookType: "xlsx", type: "base64" });

        // Sécurité supplémentaire : si un fichier existait déjà à ce
        // chemin (peu probable vu le nom unique, mais gratuit), on le
        // supprime avant d'écrire pour éviter tout état résiduel.
        try {
          await Filesystem.deleteFile({ path: fileName, directory: Directory.Cache });
        } catch {
          // Le fichier n'existe pas encore : rien à faire.
        }

        const written = await Filesystem.writeFile({
          path: fileName,
          data: base64Data,
          directory: Directory.Cache, // pas de permission de stockage requise
        });

        await Share.share({
          title: fileName,
          url: written.uri,
          dialogTitle: "Enregistrer ou partager l'export RGPD",
        });
      } else {
        XLSX.writeFile(workbook, fileName);
      }

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
      style={{ background: "linear-gradient(to bottom, #3A48A0 0%, #3A48A0 10%, #405BAF 30%, #3E7DCF 55%, #405BAF 80%, #3A48A0 100%)" }}
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
