// pages/list-members.js
"use client";
import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import BoutonEnvoyer from "../components/BoutonEnvoyer";
import LogoutLink from "../components/LogoutLink";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";

export default function ListMembers() {
  const [membres, setMembres] = useState([]);
  const [cellules, setCellules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMembres();
    fetchCellules();
  }, []);

  async function fetchMembres() {
    const { data, error } = await supabase.from("membres").select("*");
    if (error) console.error(error);
    else setMembres(data);
    setLoading(false);
  }

  async function fetchCellules() {
    const { data, error } = await supabase.from("cellules").select("*");
    if (error) console.error(error);
    else setCellules(data);
  }

  // 🔹 Gérer le changement dynamique du statut d’un membre
  const handleStatutChange = (id, newStatut) => {
    setMembres((prev) =>
      prev.map((m) => (m.id === id ? { ...m, statut: newStatut } : m))
    );
  };

  // 🔹 Séparation des membres selon le statut
  const nouveauxMembres = membres.filter(
    (m) =>
      m.statut !== "actif" &&
      m.statut !== "s.t.a.r" &&
      m.statut !== "responsable"
  );
  const anciensMembres = membres.filter(
    (m) =>
      m.statut === "actif" ||
      m.statut === "s.t.a.r" ||
      m.statut === "responsable"
  );

  // 🔹 Titre global pour la section Nouveaux membres (basé sur created_at le plus récent)
  const dateDernier =
    nouveauxMembres.length > 0
      ? new Date(
          Math.max(...nouveauxMembres.map((m) => new Date(m.created_at)))
        )
      : null;

  const titreNouveaux = dateDernier
    ? `💖 Bien aimé venu le ${format(dateDernier, "EEEE, d MMMM yyyy", {
        locale: fr,
      })}`
    : "💖 Nouveaux contacts";

  if (loading) return <p className="text-center mt-10">Chargement...</p>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* ✅ Bouton de déconnexion stylé */}
      <div className="flex justify-end mb-4">
        <LogoutLink className="bg-gray-800 text-white px-4 py-2 rounded-lg shadow-md hover:bg-gray-700 transition duration-300" />
      </div>

      {/* Section Nouveaux Membres */}
      <section>
        <h2 className="text-2xl font-semibold text-sky-700 mb-4">
          {titreNouveaux}
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {nouveauxMembres.map((membre) => (
              <motion.div
                key={membre.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.2 } }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-xl shadow-md p-4 border-l-4 border-sky-500"
              >
                {/* 🔹 Statut en haut à gauche */}
                <p className="text-xs uppercase font-bold text-gray-600 mb-1">
                  {membre.statut === "s.t.a.r" ? "⭐ S.T.A.R" : membre.statut}
                </p>

                {/* 🔹 Nom / prénom avec coupure si trop long */}
                <h3 className="text-lg font-semibold break-words leading-tight">
                  {membre.prenom}
                  <br />
                  {membre.nom}
                </h3>

                {/* 🔹 Statut texte à droite du nom */}
                <p className="text-sm text-gray-500 italic">{membre.statut}</p>

                {/* 🔹 Téléphone + menu déroulant cellule */}
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-gray-700 font-medium">
                    📞 {membre.telephone}
                  </span>
                  <select
                    onChange={(e) => {
                      const selected = cellules.find(
                        (c) => c.id === parseInt(e.target.value)
                      );
                      membre.selectedCellule = selected;
                    }}
                    defaultValue=""
                    className="flex-1 border border-gray-300 rounded-md px-2 py-1"
                  >
                    <option value="">Choisir cellule</option>
                    {cellules.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.cellule}
                      </option>
                    ))}
                  </select>
                </div>

                <BoutonEnvoyer
                  membre={membre}
                  cellule={membre.selectedCellule}
                  onStatutChange={handleStatutChange}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </section>

      {/* Section Membres existants */}
      <section className="mt-10">
        <h2 className="text-2xl font-semibold text-green-700 mb-4">
          Membres existants
        </h2>

        <div className="overflow-x-auto bg-white rounded-xl shadow">
          <table className="min-w-full text-sm text-left border-collapse">
            <thead className="bg-green-100 text-green-700">
              <tr>
                <th className="px-4 py-2 border-b">Nom complet</th>
                <th className="px-4 py-2 border-b">Téléphone</th>
                <th className="px-4 py-2 border-b">Statut</th>
              </tr>
            </thead>
            <tbody>
              {anciensMembres.map((m) => (
                <tr
                  key={m.id}
                  className="hover:bg-green-50 transition-colors duration-150"
                >
                  <td className="px-4 py-2 border-b">
                    {m.prenom} {m.nom}
                  </td>
                  <td className="px-4 py-2 border-b">{m.telephone}</td>
                  <td className="px-4 py-2 border-b text-gray-700">
                    {m.statut === "s.t.a.r" ? "⭐ S.T.A.R" : m.statut}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

