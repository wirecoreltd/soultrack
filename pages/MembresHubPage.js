"use client";

import { useState, useEffect } from "react";
import supabase from "../lib/supabaseClient";

export default function MembresHubPage() {
  const [loading, setLoading] = useState(true);
  const [membresData, setMembresData] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    venuParReseaux: 0,
    invite: 0,
    evangelisation: 0,
    priereSalut: 0,
    conversion: 0,
    reconciliation: 0,
    trancheAge: {
      "12-17": 0,
      "18-25": 0,
      "26-30": 0,
      "31-40": 0,
      "41-55": 0,
      "56-69": 0,
      "70+": 0
    }
  });

  useEffect(() => {
    const fetchMembres = async () => {
      setLoading(true);
      try {
        const { data: sessionData } = await supabase.auth.getUser();
        const userId = sessionData.user.id;

        // Récupère le branche_id du user
        const { data: profile } = await supabase
          .from("profiles")
          .select("branche_id")
          .eq("id", userId)
          .single();

        if (!profile?.branche_id) {
          console.warn("Aucune branche trouvée pour l'utilisateur");
          setLoading(false);
          return;
        }

        const brancheId = profile.branche_id;

        // Récupère tous les membres de la branche
        const { data: membres, error } = await supabase
          .from("membres_complets")
          .select("*")
          .eq("branche_id", brancheId);

        if (error) throw error;

        console.log("Membres récupérés :", membres);
        setMembresData(membres);

        // Calcul des stats
        const newStats = { ...stats };
        newStats.total = membres.length;

        membres.forEach((m) => {
          // Venu par réseaux
          if (m.venu?.toLowerCase() === "réseaux") newStats.venuParReseaux++;

          // Invité
          if (m.venu?.toLowerCase() === "invité") newStats.invite++;

          // Évangélisation
          if (m.venu?.toLowerCase() === "evangélisation") newStats.evangelisation++;

          // Prières du salut
          if (m.priere_salut?.toLowerCase() === "oui") {
            newStats.priereSalut++;

            // Conversion
            if (m.type_conversion?.toLowerCase() === "nouveau converti") newStats.conversion++;
            if (m.type_conversion?.toLowerCase() === "réconciliation") newStats.reconciliation++;
          }

          // Tranche d'âge
          if (m.age) {
            switch (m.age) {
              case "12-17 ans": newStats.trancheAge["12-17"]++; break;
              case "18-25 ans": newStats.trancheAge["18-25"]++; break;
              case "26-30 ans": newStats.trancheAge["26-30"]++; break;
              case "31-40 ans": newStats.trancheAge["31-40"]++; break;
              case "41-55 ans": newStats.trancheAge["41-55"]++; break;
              case "56-69 ans": newStats.trancheAge["56-69"]++; break;
              case "70 ans et plus": newStats.trancheAge["70+"]++; break;
              default: break;
            }
          }
        });

        console.log("Stats calculées :", newStats);
        setStats(newStats);

      } catch (err) {
        console.error("Erreur fetch MembresHub :", err);
      }
      setLoading(false);
    };

    fetchMembres();
  }, []);

  if (loading) return <p className="text-white text-center mt-10">Chargement...</p>;

  return (
    <div className="min-h-screen bg-[#333699] p-6 text-white">
      <h1 className="text-2xl font-bold text-center mb-6">Membres Hub - Statistiques</h1>

      <div className="bg-white/10 rounded-xl p-4 max-w-2xl mx-auto">
        <p>Total membres dans le hub : <strong>{stats.total}</strong></p>
        <p>Venu par réseaux : <strong>{stats.venuParReseaux}</strong></p>
        <p>Invité : <strong>{stats.invite}</strong></p>
        <p>Évangélisation : <strong>{stats.evangelisation}</strong></p>
        <p>Prières du salut : <strong>{stats.priereSalut}</strong></p>
        <p>Conversion : <strong>{stats.conversion}</strong></p>
        <p>Réconciliation : <strong>{stats.reconciliation}</strong></p>
        <div className="mt-2">
          <p>Tranche d'âge :</p>
          <ul className="list-disc list-inside">
            {Object.entries(stats.trancheAge).map(([age, count]) => (
              <li key={age}>{age} : {count}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
