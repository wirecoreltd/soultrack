"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import supabase from "../../lib/supabaseClient";
import EditCelluleModal from "../../components/EditCelluleModal";

export default function ListCellules() {
  const router = useRouter();

  const [cellules, setCellules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [selectedCellule, setSelectedCellule] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    fetchCellules();
  }, []);

  const fetchCellules = async () => {
    setLoading(true);
    setMessage("");

    try {
      // 🔐 User connecté
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) throw userError;

      // 👤 Profil
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, role")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;

      // ✅ rôle NORMALISÉ
      const role = profile.role?.trim();
      setUserRole(role);

      // 📦 Requête cellules
      let query = supabase
        .from("cellules")
        .select(`
          id,
          cellule,
          ville,
          responsable,
          telephone,
          responsable_id
        `)
        .order("ville", { ascending: true });

      // 🔒 Responsable → uniquement ses cellules
      if (role === "ResponsableCellule") {
        query = query.eq("responsable_id", profile.id);
      }

      const { data, error } = await query;
      if (error) throw error;

      setCellules(data || []);
    } catch (err) {
      console.error("❌ Erreur récupération cellules :", err);
      setMessage("Erreur lors de la récupération des cellules.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdated = (updated) => {
    setCellules((prev) =>
      prev.map((c) => (c.id === updated.id ? updated : c))
    );
  };

  if (loading) {
    return (
      <p className="text-center mt-10 text-lg">
        Chargement des cellules...
      </p>
    );
  }

  if (message) {
    return (
      <p className="text-center text-red-600 mt-10">
        {message}
      </p>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-green-200 via-orange-100 to-purple-200">

      {/* ⬅️ Retour */}
      <button
        onClick={() => router.back()}
        className="absolute top-4 left-4 text-black font-semibold hover:text-gray-700"
      >
        ← Retour
      </button>

      {/* 🏷️ Logo + Titre */}
      <div className="flex flex-col items-center mb-6">
        <Image src="/logo.png" alt="Logo" width={80} height={80} />
        <h1 className="text-3xl font-bold text-center mt-2 text-purple-700">
          🏠 Liste des cellules
        </h1>
      </div>

      {/* 🔘 BOUTONS (LOGIQUE CORRECTE) */}
      {userRole && (
        <div className="max-w-5xl mx-auto mb-4 flex justify-end gap-4">

          {/* ➕ Créer un responsable : Admin + Superviseur */}
          {(userRole === "Administrateur" ||
            userRole === "SuperviseurCellule") && (
            <button
              onClick={() => router.push("/admin/create-internal-user")}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl shadow-md transition"
            >
              ➕ Créer un responsable
            </button>
          )}

          {/* ➕ Créer une cellule : TOUS */}
          {(userRole === "Administrateur" ||
            userRole === "SuperviseurCellule" ||
            userRole === "ResponsableCellule") && (
            <button
              onClick={() => router.push("/admin/create-cellule")}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl shadow-md transition"
            >
              ➕ Créer une cellule
            </button>
          )}

        </div>
      )}

      {/* 📋 TABLE */}
      <div className="max-w-5xl mx-auto border border-gray-200 rounded-xl overflow-hidden bg-white shadow-xl">
        <div className="grid grid-cols-[2fr_2fr_2fr_2fr_auto] gap-4 px-4 py-2 bg-purple-600 text-white font-semibold">
          <span>Zone / Ville</span>
          <span>Nom de la cellule</span>
          <span>Responsable</span>
          <span>Téléphone</span>
          <span className="text-center">Actions</span>
        </div>

        {cellules.length === 0 && (
          <div className="text-center py-6 text-gray-500">
            Aucune cellule attribuée.
          </div>
        )}

        {cellules.map((c) => (
          <div
            key={c.id}
            className="grid grid-cols-[2fr_2fr_2fr_2fr_auto] gap-4 px-4 py-3 border-b border-gray-200 hover:bg-purple-50 transition-all"
          >
            <span>{c.ville}</span>
            <span className="font-semibold text-gray-700">{c.cellule}</span>
            <span className="text-purple-700 font-medium">{c.responsable}</span>
            <span>{c.telephone}</span>

            <div className="flex justify-center">
              <button
                onClick={() => setSelectedCellule(c)}
                className="text-blue-600 hover:text-blue-800 text-xl"
                title="Modifier"
              >
                ✏️
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ✏️ MODAL */}
      {selectedCellule && (
        <EditCelluleModal
          cellule={selectedCellule}
          onClose={() => setSelectedCellule(null)}
          onUpdated={handleUpdated}
        />
      )}
    </div>
  );
}
