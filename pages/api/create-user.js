// ═══════════════════════════════════════════════════════════════
// API : Création d'un Utilisateur (create-user)
// ═══════════════════════════════════════════════════════════════
// Description : Crée un compte utilisateur complet (auth + profil +
// membre) avec gestion des rôles spécifiques : création de cellule
// (ResponsableCellule), assignation superviseur (SuperviseurCellule),
// création de famille (ResponsableFamilles), mise à jour ou création
// du membre associé, et insertion des stats de ministère.
//
// Tables Supabase utilisées :
// - profiles                (lecture + écriture) → profil admin + nouvel utilisateur
// - cellules                (lecture + écriture) → création/màj cellule, superviseur
// - familles                (écriture)           → création famille
// - membres_complets        (lecture + écriture) → membre lié au compte
// - stats_ministere_besoin  (écriture)           → statistiques ministère
//
// Auth Supabase : création via supabaseAdmin.auth.admin.createUser
// ═══════════════════════════════════════════════════════════════

import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const ministereOptions = [
  "Intercession", "Louange", "Technique", "Communication",
  "Les Enfants", "Les ados", "Les jeunes", "Finance",
  "Nettoyage", "Conseiller", "Compassion", "Visite",
  "Berger", "Modération",
];

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method Not Allowed" });

  try {
    // ── Auth ──
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token)
      return res.status(401).json({ error: "Non authentifié" });

    const { data: { user } } = await supabaseAdmin.auth.getUser(token);
    if (!user)
      return res.status(401).json({ error: "Non authentifié" });

    const {
      prenom,
      nom,
      email,
      password,
      telephone,
      sexe,
      roles,
      cellule_nom,
      cellule_zone,
      cellule_mere_id,
      ministeresSelected,
      member_id,
      famille_nom,      // ← NOUVEAU
      famille_secteur,  // ← NOUVEAU
    } = req.body;

    if (!prenom || !nom || !email || !password || !roles?.length) {
      return res.status(400).json({ error: "Champs obligatoires manquants" });
    }

    // ── Profil admin connecté ──
    const { data: adminProfile } = await supabaseAdmin
      .from("profiles")
      .select("eglise_id")
      .eq("id", user.id)
      .single();

    if (!adminProfile)
      return res.status(400).json({ error: "Profil admin introuvable" });

    const eglise_id = adminProfile.eglise_id;

    // ── 1️⃣ Création Auth ──
    const { data: authUser, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

    if (authError)
      return res.status(400).json({ error: authError.message });

    const newUserId = authUser.user.id;

    // ── 2️⃣ Création profile ──
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .insert({
        id: newUserId,
        prenom,
        nom,
        email,
        telephone: telephone || null,
        roles,
        role: roles[0],
        must_change_password: true,
        eglise_id,
      });

    if (profileError)
      return res.status(400).json({ error: profileError.message });

    // ── 3️⃣ Création cellule si ResponsableCellule ──
    if (roles.includes("ResponsableCellule") && cellule_nom && cellule_zone) {

      const cellule_full = `${cellule_zone} - ${cellule_nom}`;

      let superviseur_id = null;
      if (cellule_mere_id) {
        const { data: celluleMere } = await supabaseAdmin
          .from("cellules")
          .select("superviseur_id, responsable_id")
          .eq("id", cellule_mere_id)
          .single();

        if (celluleMere?.responsable_id) {
          superviseur_id = celluleMere.responsable_id;
        }
      }

      const { error: celluleError } = await supabaseAdmin
        .from("cellules")
        .insert({
          cellule: cellule_nom,
          ville: cellule_zone,
          responsable: `${prenom} ${nom}`,
          responsable_id: newUserId,
          telephone: telephone || "",
          eglise_id,
          cellule_mere_id: cellule_mere_id || null,
          superviseur_id,
        });

      if (celluleError)
        return res.status(400).json({ error: celluleError.message });
    }

    // ── 4️⃣ SuperviseurCellule → assigner toutes les cellules de l'église ── ← NOUVEAU
    if (roles.includes("SuperviseurCellule")) {

      console.log("famille_nom:", famille_nom);
console.log("famille_secteur:", famille_secteur);
console.log("roles:", roles);

      
      const { error: superviseurError } = await supabaseAdmin
        .from("cellules")
        .update({ superviseur_id: newUserId })
        .eq("eglise_id", eglise_id);

      if (superviseurError)
        console.error("Erreur assignation superviseur cellules:", superviseurError);
    }

    // ── 5️⃣ Création famille si ResponsableFamilles ── ← NOUVEAU
    if (roles.includes("ResponsableFamilles") && famille_nom && famille_secteur) {
      const { error: familleError } = await supabaseAdmin
        .from("familles")
        .insert({
          famille: famille_nom,
          ville: famille_secteur,
          responsable: `${prenom} ${nom}`,
          responsable_id: newUserId,
          telephone: telephone || "",
          eglise_id,
          created_at: new Date(),
        });

      if (familleError)
        return res.status(400).json({ error: familleError.message });
    }

    // ── 6️⃣ Ministères valides ──
    const ministeresValides = Array.isArray(ministeresSelected)
      ? ministeresSelected.filter((m) => ministereOptions.includes(m))
      : [];

    // ── 7️⃣ Création OU mise à jour membre ──
    let createdMember;
    const isExistingMember = member_id && member_id !== "add-serviteur";

    if (isExistingMember) {
      const { data: updatedMember, error: membreError } = await supabaseAdmin
        .from("membres_complets")
        .update({
          email,
          telephone: telephone || null,
          star: true,
          Ministere: JSON.stringify(ministeresValides),
          conseiller_id: roles.includes("Conseiller") ? newUserId : null,
          profile_id: newUserId,
        })
        .eq("id", member_id)
        .select()
        .single();

      if (membreError)
        return res.status(400).json({ error: membreError.message });

      createdMember = updatedMember;

    } else {
      const { data: newMember, error: membreError } = await supabaseAdmin
        .from("membres_complets")
        .insert({
          prenom,
          nom,
          email,
          telephone,
          sexe: sexe || null,
          star: true,
          etat_contact: "existant",
          Ministere: JSON.stringify(ministeresValides),
          conseiller_id: roles.includes("Conseiller") ? newUserId : null,
          profile_id: newUserId,
          eglise_id,
        })
        .select()
        .single();

      if (membreError)
        return res.status(400).json({ error: membreError.message });

      createdMember = newMember;
    }

    // ── 8️⃣ Stats ministère ──
    if (createdMember && ministeresValides.length > 0) {
      const statsRows = ministeresValides.map((ministere) => ({
        membre_id: createdMember.id,
        eglise_id,
        type: "ministere",
        valeur: ministere,
        sexe: sexe || null,
        date_action: new Date().toISOString().split("T")[0],
      }));

      const { error: statsError } = await supabaseAdmin
        .from("stats_ministere_besoin")
        .insert(statsRows);

      if (statsError)
        console.error("Erreur insertion stats ministère:", statsError);
    }

    return res.status(200).json({ message: "Utilisateur + membre créé avec succès" });

  } catch (err) {
    console.error("create-user API error:", err);
    return res.status(500).json({ error: err.message });
  }
}
