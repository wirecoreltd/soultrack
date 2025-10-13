//pages/suivis-membres.js
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SuivisMembresPage() {
  const [suivis, setSuivis] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🧩 Charger les suivis existants
  const fetchSuivis = async () => {
    try {
      const { data, error } = await supabase
        .from("suivis_membres")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erreur chargement suivis:", error);
      } else {
        setSuivis(data || []);
      }
    } catch (err) {
      console.error("Exception fetchSuivis:", err);
    } finally {
      setLoading(false);
    }
  };

  // ⚡ Realtime listener
  useEffect(() => {
    fetchSuivis();

    const channel = supabase
      .channel("suivis-membres-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "suivis_membres" },
        (payload) => {
          console.log("📡 Nouveau suivi reçu:", payload.new);
          setSuivis((prev) => [payload.new, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // 💄 UI
  if (loading) return <p className="text-center mt-8">Chargement des suivis...</p>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-4">Suivis des membres</h1>

      {suivis.length === 0 ? (
        <p className="text-gray-500">Aucun suivi enregistré pour le moment.</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {suivis.map((s) => (
            <Card key={s.id} className="shadow-md border rounded-2xl">
              <CardHeader>
                <CardTitle>
                  {s.prenom} {s.nom}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  <strong>Téléphone :</strong> {s.telephone || "—"}
                </p>
                <p>
                  <strong>Besoin :</strong> {s.besoin || "—"}
                </p>
                <p>
                  <strong>Cellule :</strong> {s.cellule_nom || "—"}
                </p>
                <p>
                  <strong>Responsable :</strong> {s.responsable || "—"}
                </p>
                <p>
                  <strong>Statut :</strong>{" "}
                  <span
                    className={`px-2 py-1 rounded-md text-white ${
                      s.statut === "actif"
                        ? "bg-green-600"
                        : s.statut === "inactif"
                        ? "bg-gray-500"
                        : "bg-yellow-500"
                    }`}
                  >
                    {s.statut}
                  </span>
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  {new Date(s.created_at).toLocaleString("fr-FR")}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

