// ═══════════════════════════════════════════════════════════════
// PAGE : Liste des Conseillers (ListConseillersPage)
// ═══════════════════════════════════════════════════════════════
// Description : Affiche la liste des Conseillers de l'église de
// l'utilisateur connecté, avec recherche par nom/prénom, affichage
// de leur responsable et du nombre de contacts (membres) qui leur
// sont assignés via les suivis pastoraux. Permet de naviguer vers
// la création d'un conseiller ou vers la liste de ses contacts.
//
// Tables Supabase utilisées :
// - profiles             (lecture) → profil utilisateur connecté
// - profiles             (lecture) → conseillers de l'église (rôle "Conseiller")
// - suivi_assignments    (lecture) → mapping conseiller ↔ membres assignés
// - profiles             (lecture) → responsables des conseillers
//
// Navigation :
// - /membres/create-conseiller           → création d'un conseiller
// - /membres/list-members?conseiller_id  → contacts assignés à un conseiller
// ═══════════════════════════════════════════════════════════════

"use client";

import { useEffect, useState } from "react";
import React from "react";
import supabase from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";
import HeaderPages from "../../components/HeaderPages";
import ProtectedRoute from "../../components/ProtectedRoute";
import Footer from "../../components/Footer";
import { useLang } from "../../hooks/useLang";

const translations = {
  fr: {
    notConnected: "Utilisateur non connecté",
    profileNotFound: "Profil introuvable",
    fetchError: "Erreur fetchConseillers :",
    title: "Liste des",
    conseillers: "Conseillers",
    description1: "Retrouvez tous les ",
    description2: "Conseillers",
    description3: " de votre assemblée en un seul endroit. Vous pouvez ",
    description4: "rechercher",
    description5: " un conseiller, ",
    description6: "consulter",
    description7:
      " ses informations de contact et voir ",
    description8: "le nombre de membres qu'il accompagne",
    searchPlaceholder: "Recherche...",
    addConseiller: "➕ Ajouter un Conseiller",
    loading: "Chargement...",
    noConseiller:
      "Aucun conseiller trouvé pour votre église.",
    responsable: "👤 Responsable :",
    noResponsable: "Aucun",
    assignedContacts: "🔔 Contacts assignés :",
    viewContacts: "Voir les contacts",
  },

  en: {
    notConnected: "User not connected",
    profileNotFound: "Profile not found",
    fetchError: "fetchConseillers error:",
    title: "List of",
    conseillers: "Counselors",
    description1: "Find all the ",
    description2: "Counselors",
    description3:
      " of your church in one place. You can ",
    description4: "search",
    description5: " for a counselor, ",
    description6: "view",
    description7:
      " their contact information and see ",
    description8: "the number of members they follow",
    searchPlaceholder: "Search...",
    addConseiller: "➕ Add a Counselor",
    loading: "Loading...",
    noConseiller:
      "No counselor found for your church.",
    responsable: "👤 Supervisor :",
    noResponsable: "None",
    assignedContacts: "🔔 Assigned contacts :",
    viewContacts: "View contacts",
  },
};

export default function ListConseillersPage() {
  return (
    <ProtectedRoute
      allowedRoles={[
        "Administrateur",
        "Superadmin",
        "ResponsableIntegration",
      ]}
    >
      <ListConseillers />
    </ProtectedRoute>
  );
}

function ListConseillers() {
  const [conseillers, setConseillers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const router = useRouter();

  const { lang } = useLang();
  const t = translations[lang];

  const fetchConseillers = async () => {
    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error(t.notConnected);

      const { data: currentUserProfile } = await supabase
        .from("profiles")
        .select(
          "id, prenom, nom, email, telephone, role, eglise_id"
        )
        .eq("id", user.id)
        .single();

      if (!currentUserProfile)
        throw new Error(t.profileNotFound);

      const eglise_id = String(
        currentUserProfile.eglise_id
      );

      // 1️⃣ Fetch les conseillers de l'église
      const {
        data: profiles,
        error: errConseillers,
      } = await supabase
        .from("profiles")
        .select(
          "id, prenom, nom, email, telephone, roles, responsable_id"
        )
        .contains("roles", ["Conseiller"])
        .eq("eglise_id", eglise_id);

      if (errConseillers) throw errConseillers;

      if (!profiles || profiles.length === 0) {
        setConseillers([]);
        setLoading(false);
        return;
      }

      const conseillersIds = profiles.map((p) => p.id);

      // 2️⃣ Compter depuis suivi_assignments
      const {
        data: assignments,
        error: errAssignments,
      } = await supabase
        .from("suivi_assignments")
        .select("conseiller_id, membre_id")
        .in("conseiller_id", conseillersIds);

      if (errAssignments) throw errAssignments;

      // Construire map conseiller_id → Set de membre_id uniques
      const contactSetMap = {};

      (assignments || []).forEach((a) => {
        if (!a.conseiller_id) return;

        if (!contactSetMap[a.conseiller_id]) {
          contactSetMap[a.conseiller_id] = new Set();
        }

        contactSetMap[a.conseiller_id].add(a.membre_id);
      });

      // 3️⃣ Fetch les responsables
      const responsablesIds = profiles
        .map((p) => p.responsable_id)
        .filter(Boolean);

      let responsableMap = {};

      if (responsablesIds.length > 0) {
        const { data: responsables } = await supabase
          .from("profiles")
          .select("id, prenom, nom")
          .in("id", responsablesIds);

        responsables?.forEach((r) => {
          responsableMap[r.id] = `${r.prenom} ${r.nom}`;
        });
      }

      // 4️⃣ Assembler la liste finale
      const list = profiles.map((p) => ({
        ...p,

        responsable_nom: p.responsable_id
          ? responsableMap[p.responsable_id] ||
            t.noResponsable
          : t.noResponsable,

        totalContacts:
          contactSetMap[p.id]?.size || 0,
      }));

      // Trier par nombre de contacts décroissant
      list.sort(
        (a, b) => b.totalContacts - a.totalContacts
      );

      setConseillers(list);
    } catch (err) {
      console.error(t.fetchError, err);
      setConseillers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConseillers();
  }, [lang]);

  const filteredConseillers = conseillers.filter(
    (c) =>
      c.prenom
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      c.nom
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  return (
    <div
      className="min-h-screen flex flex-col items-center p-4 sm:p-6"
      style={{ background: "#333699" }}
    >
      <HeaderPages />

      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold mt-4 mb-6 text-blue-300 text-center text-white">
          {t.title}{" "}
          <span className="text-emerald-300">
            {t.conseillers}
          </span>
        </h1>

        <div className="max-w-3xl w-full mb-6 text-center">
          <p className="italic text-base text-white/90">
            {t.description1}

            <span className="text-blue-300 font-semibold">
              {t.description2}
            </span>

            {t.description3}

            <span className="text-blue-300 font-semibold">
              {t.description4}
            </span>

            {t.description5}

            <span className="text-blue-300 font-semibold">
              {t.description6}
            </span>

            {t.description7}

            <span className="text-blue-300 font-semibold">
              {t.description8}
            </span>
            .
          </p>
        </div>
      </div>

      {/* Barre de recherche */}
      <div className="w-full max-w-4xl flex justify-center mb-4">
        <input
          type="text"
          placeholder={t.searchPlaceholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-2/3 px-3 py-2 rounded-md border text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* Bouton Ajouter un conseiller */}
      <div className="w-full max-w-6xl flex justify-end mb-6 px-2 sm:px-0">
        <button
          onClick={() =>
            router.push("/membres/create-conseiller")
          }
          className="text-white font-semibold px-4 py-2 rounded shadow text-sm sm:text-base hover:shadow-lg transition"
        >
          {t.addConseiller}
        </button>
      </div>

      {/* Liste cartes */}
      <div className="w-full max-w-6xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 justify-items-center">
        {loading ? (
          <p className="text-center text-white col-span-full">
            {t.loading}
          </p>
        ) : filteredConseillers.length === 0 ? (
          <p className="text-center text-white col-span-full">
            {t.noConseiller}
          </p>
        ) : (
          filteredConseillers.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-2xl shadow-lg w-full max-w-sm overflow-hidden transition hover:shadow-2xl"
            >
              <div className="w-full h-[6px] bg-blue-500 rounded-t-2xl" />

              <div className="p-4 flex flex-col items-center">
                <h2 className="font-bold text-black text-base sm:text-lg text-center mb-1">
                  {c.prenom} {c.nom}
                </h2>

                <p className="text-sm sm:text-base text-gray-700 mb-1">
                  📞 {c.telephone || "—"}
                </p>

                <p className="text-sm sm:text-base text-gray-700 mb-1">
                  ✉️ {c.email || "—"}
                </p>

                <p className="text-sm sm:text-base text-gray-700 mt-2">
                  {t.responsable}{" "}
                  <span className="font-semibold">
                    {c.responsable_nom}
                  </span>
                </p>

                <p className="text-sm sm:text-base text-gray-800 mt-2 font-semibold">
                  {t.assignedContacts} {c.totalContacts}
                </p>

                <button
                  onClick={() =>
                    router.push(
                      `/membres/list-members?conseiller_id=${c.id}`
                    )
                  }
                  className="mt-2 px-3 py-1 bg-[#333699] text-white rounded-md hover:bg-blue-600 text-sm sm:text-base"
                >
                  {t.viewContacts}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <Footer />
    </div>
  );
}
