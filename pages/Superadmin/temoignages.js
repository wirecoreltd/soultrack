"use client";

import { useEffect, useState } from "react";
import supabase from "../../lib/supabaseClient";
import HeaderPages from "../../components/HeaderPages";
import ProtectedRoute from "../../components/ProtectedRoute";
import Footer from "../../components/Footer";

export default function AdminTemoignagesPage() {
  return (
    <ProtectedRoute allowedRoles={["Superadmin"]}>
      <AdminTemoignages />
    </ProtectedRoute>
  );
}

function AdminTemoignages() {
  const [temoignages, setTemoignages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // 🔥 FETCH
  const fetchTemoignages = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("contact")
      .select("*")
      .eq("type", "temoignage")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setTemoignages([]);
    } else {
      setTemoignages(data);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchTemoignages();
  }, []);

  // 🔥 UPDATE STATUS
  const updateStatus = async (id, status) => {
    await supabase
      .from("contact")
      .update({ status })
      .eq("id", id);

    fetchTemoignages();
  };

  // 🔍 FILTER
  const filtered = temoignages.filter(
    (t) =>
      t.nom?.toLowerCase().includes(search.toLowerCase()) ||
      t.nom_eglise?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      className="min-h-screen flex flex-col items-center p-4 sm:p-6"
      style={{ background: "#333699" }}
    >
      <HeaderPages />

      {/* TITRE */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold mt-4 mb-6 text-white">
          Gestion des <span className="text-emerald-300">Témoignages</span>
        </h1>

        <p className="italic text-base text-white/90 max-w-2xl">
          Validez, refusez ou mettez en attente les témoignages avant leur publication sur le site.
        </p>
      </div>

      {/* SEARCH */}
      <div className="w-full max-w-4xl flex justify-center mb-6">
        <input
          type="text"
          placeholder="Recherche par nom ou église..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-2/3 px-3 py-2 rounded-md border text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* LIST */}
      <div className="w-full max-w-6xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 justify-items-center">

        {loading ? (
          <p className="text-white col-span-full">Chargement...</p>
        ) : filtered.length === 0 ? (
          <p className="text-white col-span-full">Aucun témoignage trouvé.</p>
        ) : (
          filtered.map((t) => (
            <div
              key={t.id}
              className="bg-white rounded-2xl shadow-lg w-full max-w-sm overflow-hidden transition hover:shadow-2xl"
            >
              {/* STATUS BAR */}
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

                {/* NOM */}
                <h2 className="font-bold text-black text-lg text-center mb-1">
                  {t.nom || "Anonyme"}
                </h2>

                {/* EGLISE */}
                <p className="text-gray-700 text-sm mb-2">
                  ⛪ {t.nom_eglise || "Non renseigné"}
                </p>

                {/* MESSAGE */}
                <p className="text-gray-800 text-sm italic text-center mb-3">
                  "{t.message}"
                </p>

                {/* NOTE */}
                <div className="mb-2">
                  {"⭐".repeat(t.note || 5)}
                </div>

                {/* STATUS TEXT */}
                <div className="text-xs font-semibold mb-2">
                  {t.status === "approved" && (
                    <span className="text-green-600">✔ Validé</span>
                  )}
                  {t.status === "pending" && (
                    <span className="text-yellow-600">⏳ En attente</span>
                  )}
                  {t.status === "rejected" && (
                    <span className="text-red-600">✖ Refusé</span>
                  )}
                </div>

                {/* DATE */}
                <p className="text-xs text-gray-400 mb-3">
                  {new Date(t.created_at).toLocaleDateString()}
                </p>

                {/* ACTION BUTTONS */}
                <div className="flex flex-col gap-2 w-full">

                  <button
                    onClick={() => updateStatus(t.id, "approved")}
                    className="px-3 py-2 bg-green-500 text-white rounded-md text-sm hover:bg-green-600"
                  >
                    ✔ Valider
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
