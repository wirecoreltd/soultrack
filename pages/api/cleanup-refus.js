// /pages/api/cleanup-refus.js
import supabase from "../../lib/supabaseClient";

export default async function handler(req, res) {
  try {
    // Vérifier méthode (GET suffira pour cron-job.org)
    if (req.method !== "GET") {
      return res.status(405).json({ message: "Méthode non autorisée" });
    }

    // Calculer la date il y a 3 mois
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    // Supprimer les contacts "refus" créés avant cette date
    const { data, error } = await supabase
      .from("suivis_membres")
      .delete()
      .lt("updated_at", threeMonthsAgo.toISOString())
      .eq("statut_suivis", "refus");

    if (error) throw error;

    return res.status(200).json({
      message: "Nettoyage terminé",
      deletedCount: data.length,
    });
  } catch (err) {
    console.error("Erreur cleanup-refus :", err);
    return res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
}
