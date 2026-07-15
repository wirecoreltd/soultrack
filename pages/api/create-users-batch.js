// ═══════════════════════════════════════════════════════════════
// API : Création batch d'utilisateurs (create-users-batch)
// ═══════════════════════════════════════════════════════════════
// Crée plusieurs utilisateurs en parallèle (Auth) puis insère
// profiles, membres, cellules, stats en batch (insert multiple).
// Beaucoup plus rapide que ligne par ligne.
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
    // ── Auth admin ──
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) return res.status(401).json({ error: "Non authentifié" });

    const { data: { user } } = await supabaseAdmin.auth.getUser(token);
    if (!user) return res.status(401).json({ error: "Non authentifié" });

    const { users } = req.body; // tableau de rows
    if (!Array.isArray(users) || users.length === 0)
      return res.status(400).json({ error: "Aucun utilisateur fourni" });

    // ── Profil admin ──
    const { data: adminProfile } = await supabaseAdmin
      .from("profiles")
      .select("eglise_id")
      .eq("id", user.id)
      .single();

    if (!adminProfile)
      return res.status(400).json({ error: "Profil admin introuvable" });

    const eglise_id = adminProfile.eglise_id;

    const results = { success: 0, errors: [] };

    // ── ÉTAPE 1 : Créer tous les comptes Auth en parallèle ──
    const BATCH_SIZE = 10; // max parallèle pour éviter rate limit
    const authResults = [];

    for (let i = 0; i < users.length; i += BATCH_SIZE) {
      const chunk = users.slice(i, i + BATCH_SIZE);
      const chunkResults = await Promise.all(
        chunk.map(async (row, idx) => {
          const { data: authUser, error: authError } =
            await supabaseAdmin.auth.admin.createUser({
              email: row.email,
              password: row.password,
              email_confirm: true,
            });

          if (authError) {
            results.errors.push(`Ligne ${i + idx + 2} — ${authError.message}`);
            return null;
          }
          return { userId: authUser.user.id, row };
        })
      );
      authResults.push(...chunkResults);
    }

    // Séparer les succès des échecs
    const successful = authResults.filter(Boolean);

    if (successful.length === 0) {
      return res.status(200).json({
        success: 0,
        errors: results.errors,
      });
    }

    // ── ÉTAPE 2 : Insérer tous les profiles en batch ──
    const profilesData = successful.map(({ userId, row }) => ({
      id: userId,
      prenom: row.prenom,
      nom: row.nom,
      email: row.email,
      telephone: row.telephone || null,
      roles: row.roles,
      role: row.roles[0],
      must_change_password: true,
      eglise_id,
    }));

    const { error: profilesError } = await supabaseAdmin
      .from("profiles")
      .insert(profilesData);

    if (profilesError) {
      // Rollback Auth users créés
      await Promise.all(
        successful.map(({ userId }) =>
          supabaseAdmin.auth.admin.deleteUser(userId)
        )
      );
      return res.status(400).json({ error: `Profiles: ${profilesError.message}` });
    }

    // ── ÉTAPE 3 : Insérer tous les membres en batch ──
    const membresData = successful.map(({ userId, row }) => ({
      prenom: row.prenom,
      nom: row.nom,
      email: row.email,
      telephone: row.telephone || null,
      sexe: row.sexe || null,
      age: row.age || null,
      date_venu: row.date_venu || null,
      star: true,
      etat_contact: "existant",
      statut: row.statut || null,
      venu: row.venu || null,
      ville: row.ville || null,
      is_whatsapp: row.is_whatsapp || false,
      priere_salut: row.priere_salut || null,
      type_conversion: row.type_conversion || null,
      Ministere: JSON.stringify(
        (row.ministeresSelected || []).filter(m => ministereOptions.includes(m))
      ),
      conseiller_id: row.roles.includes("Conseiller") ? userId : null,
      profile_id: userId,
      eglise_id,
    }));

    const { data: insertedMembres, error: membresError } = await supabaseAdmin
      .from("membres_complets")
      .insert(membresData)
      .select("id, profile_id");

    if (membresError)
      console.error("Erreur membres batch:", membresError);

    // ── ÉTAPE 4 : Cellules en batch ──
    const cellulesData = successful
      .filter(({ row }) =>
        row.roles.includes("ResponsableCellule") &&
        row.cellule_nom &&
        row.cellule_zone
      )
      .map(({ userId, row }) => ({
        cellule: row.cellule_nom,
        ville: row.cellule_zone,
        responsable: `${row.prenom} ${row.nom}`,
        responsable_id: userId,
        telephone: row.telephone || "",
        eglise_id,
        cellule_mere_id: row.cellule_mere_id || null,
      }));

    if (cellulesData.length > 0) {
      const { error: cellulesError } = await supabaseAdmin
        .from("cellules")
        .insert(cellulesData);

      if (cellulesError)
        console.error("Erreur cellules batch:", cellulesError);
    }

    // ── ÉTAPE 5 : Familles en batch ──
    const famillesData = successful
      .filter(({ row }) =>
        row.roles.includes("ResponsableFamilles") &&
        row.famille_nom &&
        row.famille_secteur
      )
      .map(({ userId, row }) => ({
        famille: row.famille_nom,
        ville: row.famille_secteur,
        responsable: `${row.prenom} ${row.nom}`,
        responsable_id: userId,
        telephone: row.telephone || "",
        eglise_id,
        created_at: new Date(),
      }));

    if (famillesData.length > 0) {
      const { error: famillesError } = await supabaseAdmin
        .from("familles")
        .insert(famillesData);

      if (famillesError)
        console.error("Erreur familles batch:", famillesError);
    }

    // ── ÉTAPE 6 : Stats ministère en batch ──
    if (insertedMembres && insertedMembres.length > 0) {
      const statsData = [];

      insertedMembres.forEach((membre) => {
        const matchedUser = successful.find(s => s.userId === membre.profile_id);
        if (!matchedUser) return;

        const ministeres = (matchedUser.row.ministeresSelected || [])
          .filter(m => ministereOptions.includes(m));

        ministeres.forEach((ministere) => {
          statsData.push({
            membre_id: membre.id,
            eglise_id,
            type: "ministere",
            valeur: ministere,
            sexe: matchedUser.row.sexe || null,
            date_action: new Date().toISOString().split("T")[0],
          });
        });
      });

      if (statsData.length > 0) {
        const { error: statsError } = await supabaseAdmin
          .from("stats_ministere_besoin")
          .insert(statsData);

        if (statsError)
          console.error("Erreur stats batch:", statsError);
      }
    }

    results.success = successful.length;

    return res.status(200).json({
      success: results.success,
      errors: results.errors,
      message: `${results.success} utilisateur(s) créé(s) avec succès`,
    });

  } catch (err) {
    console.error("create-users-batch API error:", err);
    return res.status(500).json({ error: err.message });
  }
}
