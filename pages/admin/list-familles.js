"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import supabase from "../../lib/supabaseClient";
import HeaderPages from "../../components/HeaderPages";
import ProtectedRoute from "../../components/ProtectedRoute";
import Footer from "../../components/Footer";

/* =========================
   Ligne Famille (RESPONSIVE)
========================= */
function FamilleRow({ c, router }) {
  const [openPhoneMenu, setOpenPhoneMenu] = useState(false);
  const phoneMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (phoneMenuRef.current && !phoneMenuRef.current.contains(e.target)) {
        setOpenPhoneMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const phoneClean = (c.telephone || "").replace(/[^0-9]/g, "");

  return (
    <>
      {/* ================= DESKTOP ================= */}
      <div
        className="hidden sm:flex flex-row items-center px-2 py-2 rounded-lg gap-2 bg-white/15 border-l-4"
        style={{ borderLeftColor: "#F59E0B" }}
      >
        <div className="flex-[2] text-white text-sm">{c.ville}</div>
        <div className="flex-[2] text-white font-semibold text-sm">
           {c.ville} - {c.famille}
         </div>
        <div className="flex-[2] text-white text-sm">{c.responsable}</div>

        {/* Téléphone */}
        <div className="flex-[2] flex justify-center relative text-sm">
          <span
            className="text-orange-400 underline cursor-pointer"
            onClick={() => setOpenPhoneMenu(!openPhoneMenu)}
          >
            {c.telephone || "—"}
          </span>

          {openPhoneMenu && (
            <div
              ref={phoneMenuRef}
              className="absolute top-full mt-1 bg-white rounded-lg shadow-lg border z-[9999] w-56"
            >
              <a href={`tel:${c.telephone}`} className="block px-4 py-2 hover:bg-gray-100">📞 Appeler</a>
              <a href={`sms:${c.telephone}`} className="block px-4 py-2 hover:bg-gray-100">✉️ SMS</a>
              <a href={`https://wa.me/${phoneClean}?call`} target="_blank" className="block px-4 py-2 hover:bg-gray-100">📱 Appel WhatsApp</a>
              <a href={`https://wa.me/${phoneClean}`} target="_blank" className="block px-4 py-2 hover:bg-gray-100">💬 WhatsApp</a>
            </div>
          )}
        </div>

        <div className="flex-[1] flex justify-center text-white text-sm">
          {c.membre_count}
        </div>

        <div className="flex-[1] flex justify-center">
          <span
            className="text-orange-400 underline cursor-pointer text-sm"
            onClick={() => router.push(`/membres-famille?familleId=${c.id}`)}
          >
            Détails
          </span>
        </div>
      </div>

      {/* ================= MOBILE ================= */}
      <div
        className="sm:hidden bg-white/10 backdrop-blur-md rounded-xl p-4 border-l-4 mb-2 relative overflow-visible"
        style={{ borderLeftColor: "#F59E0B" }}
      >
        <div className="text-white font-semibold text-lg">
          {c.ville} - {c.famille}
        </div>

        <div className="text-white text-sm mb-2 mt-3">
          📍 Ville : <span className="font-semibold">{c.ville}</span>
        </div>

        <div className="text-white text-sm mb-2">
          👤 Responsable :{" "}
          <span className="text-amber-300 font-semibold">
            {c.responsable || "—"}
          </span>
        </div>

        <div className="relative mb-2">
          <span
            className="text-sm cursor-pointer"
            onClick={() => setOpenPhoneMenu(!openPhoneMenu)}
          >
            📞{" "}
            <span className="text-orange-400 underline">
              {c.telephone || "—"}
            </span>
          </span>

          {openPhoneMenu && (
            <div
              ref={phoneMenuRef}
              className="absolute z-[9999] mt-2 bg-white rounded-lg shadow-xl border w-56"
            >
              <a href={`tel:${c.telephone}`} className="block px-4 py-2 hover:bg-gray-100">📞 Appeler</a>
              <a href={`sms:${c.telephone}`} className="block px-4 py-2 hover:bg-gray-100">✉️ SMS</a>
              <a href={`https://wa.me/${phoneClean}?call`} target="_blank" className="block px-4 py-2 hover:bg-gray-100">📱 Appel WhatsApp</a>
              <a href={`https://wa.me/${phoneClean}`} target="_blank" className="block px-4 py-2 hover:bg-gray-100">💬 WhatsApp</a>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center mt-3">
          <div className="text-white text-sm">
            👥 {c.membre_count} membre{c.membre_count > 1 ? "s" : ""}
          </div>

          <button
            onClick={() => router.push(`/admin/familles/${c.id}/membres`)}
            className="text-orange-400 underline text-sm"
          >
            Voir détails →
          </button>
        </div>
      </div>
    </>
  );
}

/* =========================
   Page principale
========================= */
export default function ListFamilles() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur", "ResponsableFamille", "SuperviseurFamille"]}>
      <ListFamillesContent />
    </ProtectedRoute>
  );
}

function ListFamillesContent() {
  const router = useRouter();
  const [familles, setFamilles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);

  const [search, setSearch] = useState("");
  const [filterFamille, setFilterFamille] = useState("");

  useEffect(() => {
    fetchFamilles();
  }, []);

  const fetchFamilles = async () => {
    setLoading(true);

    const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (!user) return;

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, role, eglise_id")
      .eq("id", user.id)
      .single();

       if (!profile) return;

    setUserRole(profile.role);

    const { data: familiesData, error: familiesError } = await supabase
      .from("familles")
      .select("*")
      .eq("eglise_id", profile.eglise_id)
      .order("famille_full");
    
    const withCount = (familiesData || []).map((c) => ({ ...c, membre_count: 0 }));    

    setFamilles(withCount);
    setLoading(false);
  };

  const famillesFiltrees = familles.filter((c) => {
  const full = `${c.ville} - ${c.famille}`.toLowerCase();

  const matchSearch = full.includes(search.toLowerCase());
  const matchFilter = filterFamille ? full === filterFamille : true;

  return matchSearch && matchFilter;
});

  if (loading) {
    return <p className="text-center mt-10 text-white">Chargement...</p>;
  }

  return (
    <div className="min-h-screen p-6 bg-[#333699]">
      <HeaderPages />

      <h1 className="text-2xl font-bold mt-4 mb-6 text-white text-center">
        Liste des <span className="text-emerald-300">Familles</span>
      </h1>

      <div className="max-w-3xl w-full mb-6 text-center mx-auto">
        <p className="italic text-base text-white/90">
          Gestion des familles de l’église, suivi des membres et responsables.
        </p>
      </div>

      {/* Recherche */}
      <div className="flex justify-center mb-4">
        <input
          type="text"
          placeholder="Chercher..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md px-3 py-2 rounded-md text-black"
        />
      </div>

      {/* Filtre */}
      <div className="max-w-6xl mx-auto mb-4 flex justify-center gap-4">
       <select
  value={filterFamille}
  onChange={(e) => setFilterFamille(e.target.value)}
  className="px-3 py-2 rounded-md text-black"
>
  <option value="">Toutes</option>

  {familles.map((c) => {
    const full = `${c.ville} - ${c.famille}`;
    return (
      <option key={c.id} value={full}>
        {full}
      </option>
    );
  })}
</select>

        <span className="text-white font-semibold">
          Total : {famillesFiltrees.length}
        </span>
      </div>

      {/* Bouton */}
      <div className="max-w-6xl mx-auto flex justify-end mb-3">
        <button
          onClick={() => router.push("/admin/create-famille")}
          className="text-white font-semibold px-4 py-2 rounded shadow text-sm"
        >
          ➕ Ajouter une Famille
        </button>
      </div>

      {/* Tableau */}
      <div className="max-w-6xl mx-auto space-y-2">
        {famillesFiltrees.length === 0 ? (
          <p className="text-white text-center mt-6">Aucune famille</p>
        ) : (
          famillesFiltrees.map((c) => (
            <FamilleRow key={c.id} c={c} router={router} />
          ))
        )}
      </div>

      <Footer />
    </div>
  );
}
