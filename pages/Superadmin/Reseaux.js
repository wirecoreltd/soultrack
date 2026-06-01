"use client";

import { useEffect, useState } from "react";
import supabase from "../../lib/supabaseClient";
import HeaderPages from "../../components/HeaderPages";
import ProtectedRoute from "../../components/ProtectedRoute";
import Footer from "../../components/Footer";

export default function AdminReseauxPage() {
  return (
    <ProtectedRoute allowedRoles={["Superadmin"]}>
      <AdminReseaux />
    </ProtectedRoute>
  );
}

function AdminReseaux() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchItems = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("contact")
      .select("*")
      .eq("type", "reseaux")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setItems([]);
    } else {
      setItems(data);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const updateStatus = async (id, status) => {
    await supabase
      .from("contact")
      .update({ status })
      .eq("id", id);

    fetchItems();
  };

  const filtered = items.filter(
    (t) =>
      t.nom?.toLowerCase().includes(search.toLowerCase()) ||
      t.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      className="min-h-screen flex flex-col items-center p-4 sm:p-6"
      style={{ background: "#333699" }}
    >
      <HeaderPages />

      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold mt-4 mb-6 text-white">
          Gestion des <span className="text-emerald-300">Réseaux</span>
        </h1>
        <p className="italic text-base text-white/90 max-w-2xl">
          Gérez les demandes d'intégration de réseaux d'églises souhaitant rejoindre Soutrack.
        </p>
      </div>

      <div className="w-full max-w-4xl flex justify-center mb-6">
        <input
          type="text"
          placeholder="Recherche par nom ou email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-2/3 px-3 py-2 rounded-md border text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      <div className="w-full max-w-6xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 justify-items-center">
        {loading ? (
          <p className="text-white col-span-full">Chargement...</p>
        ) : filtered.length === 0 ? (
          <p className="text-white col-span-full">Aucune demande réseau trouvée.</p>
        ) : (
          filtered.map((t) => (
            <div
              key={t.id}
              className="bg-white rounded-2xl shadow-lg w-full max-w-sm overflow-hidden transition hover:shadow-2xl"
            >
              <div
                className={`w-full h-[6px] ${
                  t.status === "approved"
                    ? "bg-green-500"
                    : t.status === "rejected"
                    ? "bg-red-500"
                    : "bg-yellow-400"
                } rounded-t-2xl`}
              />

              <div className="p-4 flex flex-col items-center">

                <div className="text-3xl mb-2">🌐</div>

                <h2 className="font-bold text-black text-lg text-center mb-1">
                  {t.nom || "Anonyme"}
                </h2>

                <p className="text-gray-500 text-xs mb-2">{t.email}</p>

                <p className="text-gray-800 text-sm italic text-center mb-3">
                  "{t.message}"
                </p>

                <div className="text-xs font-semibold mb-2">
                  {t.status === "approved" && (
                    <span className="text-green-600">✔ Approuvé</span>
                  )}
                  {t.status === "pending" && (
                    <span className="text-yellow-600">⏳ En attente</span>
                  )}
                  {t.status === "rejected" && (
                    <span className="text-red-600">✖ Refusé</span>
                  )}
                </div>

                <p className="text-xs text-gray-400 mb-3">
                  {new Date(t.created_at).toLocaleDateString()}
                </p>

                <div className="flex flex-col gap-2 w-full">
                  <button
                    onClick={() => updateStatus(t.id, "approved")}
                    className="px-3 py-2 bg-green-500 text-white rounded-md text-sm hover:bg-green-600"
                  >
                    ✔ Approuver
                  </button>
                  <button
                    onClick={() => updateStatus(t.id, "rejected")}
                    className="px-3 py-2 bg-red-500 text-white rounded-md text-sm hover:bg-red-600"
                  >
                    ✖ Refuser
                  </button>
                  <button
                    onClick={() => updateStatus(t.id, "pending")}
                    className="px-3 py-2 bg-gray-500 text-white rounded-md text-sm hover:bg-gray-600"
                  >
                    ⏳ Remettre en attente
                  </button>
                </div>

              </div>
            </div>
          ))
        )}
      </div>

      <Footer />
    </div>
  );
}
