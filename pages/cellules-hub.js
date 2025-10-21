// pages/cellules-hub.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import supabase from "../lib/supabaseClient";
import Image from "next/image";
import LogoutLink from "../components/LogoutLink";
import { canAccessPage } from "../lib/accessControl";

export default function CellulesHub() {
  const router = useRouter();
  const [role, setRole] = useState(null);
  const [cellules, setCellules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  const fetchCellules = async (role, userId) => {
    let query = supabase.from("cellules").select("*").order("created_at", { ascending: false });

    // 🔹 Si c’est un ResponsableCellule, on filtre selon son profil
    if (role === "ResponsableCellule" && userId) {
      // On récupère le profil du responsable pour connaître son nom ou email
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("prenom, nom, email")
        .eq("id", userId)
        .single();

      if (profileError || !profile) {
        console.error("Profil non trouvé :", profileError);
        setCellules([]);
        setLoading(false);
        return;
      }

      // 🔹 On filtre la table "cellules" selon le nom du responsable
      query = query.eq("responsable", `${profile.prenom} ${profile.nom}`);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Erreur lors du chargement :", error);
    } else {
      setCellules(data);
    }

    setLoading(false);
  };

  useEffect(() => {
    const storedRole = localStorage.getItem("userRole");
    const storedUserId = localStorage.getItem("userId");

    if (!storedRole || !storedUserId) {
      router.push("/login");
      return;
    }

    const canAccess = canAccessPage(storedRole, "/cellules-hub");
    if (!canAccess) {
      alert("⛔ Accès non autorisé !");
      router.push("/login");
      return;
    }

    setRole(storedRole);
    setUserId(storedUserId);
    fetchCellules(storedRole, storedUserId);
  }, [router]);

  if (loading)
    return <div className="text-center mt-20 text-white">Chargement...</div>;

  return (
    <div
      className="min-h-screen flex flex-col items-center p-6"
      style={{ background: "linear-gradient(135deg, #2E3192 0%, #92EFFD 100%)" }}
    >
      <div className="w-full max-w-6xl flex justify-between items-center mb-6">
        <button
          onClick={() => router.back()}
          className="text-white font-semibold hover:text-gray-200 transition"
        >
          ← Retour
        </button>
        <div className="flex items-center gap-4">
          <Image src="/logo.png" alt="SoulTrack Logo" width={50} height={50} />
          <LogoutLink />
        </div>
      </div>

      <h1 className="text-3xl font-login text-white mb-6 text-center">
        Gestion des Cellules
      </h1>

      {role === "Admin" && (
        <button
          onClick={() => router.push("/admin/create-responsable-cellule")}
          className="mb-8 bg-gradient-to-r from-purple-500 to-pink-400 text-white px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition font-semibold"
        >
          ➕ Créer un Responsable de Cellule
        </button>
      )}

      <div className="w-full max-w-5xl bg-white/20 backdrop-blur-md rounded-3xl p-6 shadow-lg">
        <h2 className="text-xl font-semibold text-white mb-4">
          📋 Liste des Cellules
        </h2>

        {cellules.length === 0 ? (
          <p className="text-white text-center">Aucune cellule enregistrée.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cellules.map((cellule) => (
              <div
                key={cellule.id}
                className="bg-white rounded-2xl shadow-md p-4 border-t-4 border-purple-500 hover:shadow-xl transition"
              >
                <h3 className="text-lg font-bold text-gray-800 mb-1">
                  {cellule.cellule}
                </h3>
                <p className="text-gray-700">
                  <strong>Ville :</strong> {cellule.ville}
                </p>
                <p className="text-gray-700">
                  <strong>Responsable :</strong> {cellule.responsable}
                </p>
                <p className="text-gray-700">
                  <strong>Téléphone :</strong>{" "}
                  {cellule.telephone_responsable || cellule.telephone}
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  Créée le {new Date(cellule.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-10 text-center text-white text-lg font-handwriting max-w-2xl">
        Car le corps ne se compose pas d’un seul membre, mais de plusieurs. <br />
        1 Corinthiens 12:14 ❤️
      </div>
    </div>
  );
}
