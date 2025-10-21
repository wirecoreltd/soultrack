//pages/admin/create-responsable-cellule.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import supabase from "../../lib/supabaseClient";
import { canAccessPage } from "../../lib/accessControl";

export default function CreateCellulePage() {
  const router = useRouter();
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [responsables, setResponsables] = useState([]);
  const [formData, setFormData] = useState({
    cellule: "",
    ville: "",
    responsable_id: "",
    telephone: "",
  });

  useEffect(() => {
    const storedRole = localStorage.getItem("userRole");
    if (!storedRole) {
      router.replace("/login");
      return;
    }

    if (!canAccessPage(storedRole, router.pathname)) {
      alert("⛔ Accès non autorisé !");
      router.replace("/login");
      return;
    }

    setRole(storedRole);
    setLoading(false);

    // 🔹 Charger les responsables disponibles
    fetchResponsables();
  }, [router]);

  const fetchResponsables = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, prenom, nom, roles")
      .or('roles.cs.{ResponsableCellule,ResponsableIntegration}') // ✅ récupère ceux qui ont ResponsableCellule
      .order('prenom', { ascending: true });

    if (error) {
      console.error("Erreur récupération responsables :", error);
    } else {
      setResponsables(data);
    }
  };

  if (loading) return <div className="text-center mt-20">Chargement...</div>;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.responsable_id) {
      alert("⚠️ Veuillez sélectionner un responsable !");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("cellules")
        .insert([
          {
            cellule: formData.cellule,
            ville: formData.ville,
            responsable_id: formData.responsable_id,
            telephone: formData.telephone,
          },
        ]);

      if (error) {
        console.error("Erreur création cellule :", error);
        alert("❌ Erreur lors de la création de la cellule !");
        return;
      }

      alert(`✅ Cellule "${formData.cellule}" créée avec succès !`);
      router.push("/cellules-hub");

    } catch (err) {
      console.error("Erreur inattendue :", err);
      alert("❌ Une erreur inattendue s'est produite !");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{ background: "linear-gradient(135deg, #2E3192 0%, #92EFFD 100%)" }}
    >
      <h1 className="text-4xl font-bold text-white mb-6">Créer une cellule</h1>

      <form onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md flex flex-col gap-4"
      >
        <input type="text" name="cellule" placeholder="Nom de la cellule"
          value={formData.cellule} onChange={handleChange} required
          className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"/>
        
        <input type="text" name="ville" placeholder="Ville"
          value={formData.ville} onChange={handleChange} required
          className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"/>

        <input type="text" name="telephone" placeholder="Téléphone"
          value={formData.telephone} onChange={handleChange} required
          className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"/>

        {/* 🔹 Menu déroulant responsable */}
        <div className="flex flex-col gap-2">
          <label className="font-semibold text-gray-700">Responsable :</label>
          <select name="responsable_id" value={formData.responsable_id} onChange={handleChange} required
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400">
            <option value="">-- Sélectionnez un responsable --</option>
            {responsables.map((r) => (
              <option key={r.id} value={r.id}>
                {r.prenom} {r.nom} ({r.roles.join(", ")})
              </option>
            ))}
          </select>
        </div>

        <button type="submit"
          className="mt-2 bg-gradient-to-r from-blue-600 to-blue-400 text-white font-semibold rounded-xl py-2 hover:opacity-90 transition">
          Créer la cellule
        </button>
      </form>

      <button onClick={() => router.push("/cellules-hub")}
        className="mt-4 text-white underline hover:opacity-80">
        ⬅️ Retour
      </button>
    </div>
  );
}
