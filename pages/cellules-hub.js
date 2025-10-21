"use client";

import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";

export default function CellulesHub() {
  const [cellule, setCellule] = useState(null);
  const [membres, setMembres] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      console.log("▶️ Début du chargement des données...");
      try {
        const userId = localStorage.getItem("userId");

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("prenom, nom, role, id")
          .eq("id", userId)
          .single();

        if (profileError) throw profileError;
        if (!profile) throw new Error("Profil non trouvé !");
        console.log("✅ Profil chargé :", profile);

        if (profile.role === "ResponsableCellule") {
          const responsableNom = `${profile.prenom} ${profile.nom}`;
          console.log("Responsable :", responsableNom);

          // 🔹 Récupère toutes les cellules (au cas où le responsable en a plusieurs)
          const { data: cellulesData, error: celluleError } = await supabase
            .from("cellules")
            .select("id, cellule, ville, responsable, telephone")
            .eq("responsable", responsableNom);

          if (celluleError) throw celluleError;
          if (!cellulesData || cellulesData.length === 0)
            throw new Error("Aucune cellule trouvée !");
          console.log("✅ Cellules trouvées :", cellulesData);

          // 🔹 On prend la première cellule du responsable
          const celluleData = cellulesData[0];
          setCellule(celluleData);

          // 🔹 On charge les membres liés à cette cellule
          const { data: membresData, error: membresError } = await supabase
            .from("membres")
            .select("id, prenom, nom, telephone, cellule_id")
            .eq("cellule_id", celluleData.id);

          if (membresError) throw membresError;

          if (!membresData || membresData.length === 0) {
            console.warn("Aucun membre trouvé pour cette cellule.");
          } else {
            console.log("✅ Membres :", membresData);
          }

          setMembres(membresData);
        }

        setLoading(false);
      } catch (err) {
        console.error("❌ Erreur pendant fetchData :", err);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <p className="text-center mt-10">Chargement en cours...</p>;

  return (
    <div className="p-4">
      {cellule ? (
        <>
          <h1 className="text-2xl font-bold mb-4">
            📍 Cellule : {cellule.cellule}
          </h1>
          <p className="text-sm text-gray-600 mb-2">
            Responsable : {cellule.responsable}
          </p>
          <p className="text-sm text-gray-600 mb-4">Ville : {cellule.ville}</p>

          <h2 className="text-xl font-semibold mb-3">👥 Membres de la cellule</h2>

          {membres.length > 0 ? (
            <ul className="space-y-2">
              {membres.map((m) => (
                <li
                  key={m.id}
                  className="border rounded-lg p-3 bg-white shadow-sm"
                >
                  <p className="font-medium">
                    {m.prenom} {m.nom}
                  </p>
                  <p className="text-sm text-gray-500">{m.telephone}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">Aucun membre trouvé pour cette cellule.</p>
          )}
        </>
      ) : (
        <p className="text-gray-500">Aucune cellule assignée.</p>
      )}
    </div>
  );
}
