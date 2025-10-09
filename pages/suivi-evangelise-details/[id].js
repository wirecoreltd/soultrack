// pages/suivi-evangelise-details/[id].js
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function SuiviEvangeliseDetails() {
  const router = useRouter();
  const { id } = router.query; // membre_id
  const [membre, setMembre] = useState(null);
  const [suivis, setSuivis] = useState([]);

  useEffect(() => {
    if (id) {
      fetchMembre();
      fetchSuivis();
    }
  }, [id]);

  const fetchMembre = async () => {
    const { data, error } = await supabase
      .from("membres")
      .select("*")
      .eq("id", id)
      .single();
    if (!error) setMembre(data);
  };

  const fetchSuivis = async () => {
    const { data, error } = await supabase
      .from("suivis")
      .select(`
        id,
        statut,
        commentaire,
        created_at,
        cellules (cellule)
      `)
      .eq("membre_id", id)
      .order("created_at", { ascending: false });
    if (!error) setSuivis(data);
  };

  if (!membre) return <p className="p-6">Chargement...</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <button
        onClick={() => router.back()}
        className="text-orange-500 font-semibold mb-4 underline hover:text-orange-600"
      >
        ← Retour
      </button>

      <h1 className="text-3xl font-bold text-gray-800 mb-4">
        Détails de {membre.prenom} {membre.nom}
      </h1>

      <div className="bg-white p-4 rounded-xl shadow-md mb-6">
        <p><strong>Téléphone :</strong> {membre.telephone}</p>
        <p><strong>Email :</strong> {membre.email || "—"}</p>
        <p><strong>Ville :</strong> {membre.ville || "—"}</p>
        <p><strong>Besoin :</strong> {membre.besoin || "—"}</p>
        <p><strong>Infos supplémentaires :</strong> {membre.infos_supplementaires || "—"}</p>
        <p><strong>WhatsApp :</strong> {membre.is_whatsapp ? "✅ Oui" : "❌ Non"}</p>
      </div>

      <h2 className="text-2xl font-bold text-gray-800 mb-4">Historique des suivis</h2>
      {suivis.length === 0 ? (
        <p>Aucun suivi pour ce membre.</p>
      ) : (
        <div className="space-y-4">
          {suivis.map((s) => (
            <div key={s.id} className="bg-white p-4 rounded-xl shadow-md">
              <p><strong>Cellule :</strong> {s.cellules.cellule}</p>
              <p><strong>Statut :</strong> {s.statut}</p>
              <p><strong>Commentaire :</strong> {s.commentaire || "—"}</p>
              <p className="text-gray-500 text-sm">
                Créé le {new Date(s.created_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
