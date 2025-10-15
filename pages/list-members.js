// pages/list-members.js

"use client";
import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import LogoutLink from "../components/LogoutLink";
import BoutonEnvoyer from "../components/BoutonEnvoyer";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function ListMembers() {
  const [membres, setMembres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cellules, setCellules] = useState([]);
  const [popupMembre, setPopupMembre] = useState(null);

  // 🔹 Récupération des membres
  useEffect(() => {
    fetchMembres();
    fetchCellules();
  }, []);

  const fetchMembres = async () => {
    const { data, error } = await supabase
      .from("membres")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) setMembres(data || []);
    setLoading(false);
  };

  const fetchCellules = async () => {
    const { data, error } = await supabase
      .from("cellules")
      .select("id, cellule, responsable");
    if (!error) setCellules(data || []);
  };

  // 🔄 Mise à jour locale du statut sans refresh
  const handleStatusUpdate = (id, newStatus) => {
    setMembres((prev) =>
      prev.map((m) => (m.id === id ? { ...m, statut: newStatus } : m))
    );
  };

  const nouveauxMembres = membres.filter(
    (m) => m.statut === "visiteur" || m.statut === "veut rejoindre ICC"
  );
  const anciensMembres = membres.filter((m) => m.statut === "actif");

  // 🗓️ Trouver la date la plus récente pour le titre global
  const membreRecent = nouveauxMembres[0];
  const dateTexte = membreRecent
    ? format(new Date(membreRecent.created_at), "EEEE, d MMMM yyyy", {
        locale: fr,
      })
    : null;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header avec logout */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Liste des membres</h1>
        <LogoutLink />
      </div>

      {/* Section nouveaux membres */}
      <div className="mb-10">
        {dateTexte && (
          <h2 className="text-xl font-semibold text-pink-600 mb-4">
            💖 Bien aimé venu le {dateTexte}
          </h2>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {nouveauxMembres.map((membre) => (
              <motion.div
                key={membre.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="bg-white p-4 rounded-xl shadow-md relative border-l-4 border-pink-500"
              >
                {/* Statut en haut à gauche */}
                <div className="absolute top-2 left-4 text-xs font-semibold text-gray-500">
                  {membre.statut === "s.t.a.r" ? "⭐ S.T.A.R" : membre.statut}
                </div>

                {/* Nom et téléphone */}
                <div className="flex justify-between items-center mt-4">
                  <div className="text-lg font-bold text-gray-800 break-words leading-tight">
                    {membre.prenom}
                    <br />
                    {membre.nom}
                  </div>

                  <select
                    className="border rounded-lg px-2 py-1 text-sm"
                    onChange={(e) =>
                      (membre.cellule =
                        cellules.find(
                          (c) => c.id === parseInt(e.target.value)
                        ) || null)
                    }
                  >
                    <option value="">📋 Choisir</option>
                    {cellules.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.cellule}
                      </option>
                    ))}
                  </select>
                </div>

                <p className="text-sm text-gray-600 mt-1">
                  📞 {membre.telephone || "Non renseigné"}
                </p>

                <p className="text-sm text-gray-600 mt-1">
                  📝 {membre.besoin || "Aucun besoin précisé"}
                </p>

                <BoutonEnvoyer
                  membre={membre}
                  cellule={membre.cellule}
                  onStatusUpdate={handleStatusUpdate}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Section anciens membres */}
      <div>
        <h2 className="text-xl font-semibold text-blue-700 mb-4">
          👥 Membres existants
        </h2>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-xl shadow-md overflow-hidden">
            <thead className="bg-blue-100 text-blue-800">
              <tr>
                <th className="py-2 px-4 text-left">Nom complet</th>
                <th className="py-2 px-4 text-left">Téléphone</th>
                <th className="py-2 px-4 text-left">Statut</th>
                <th className="py-2 px-4 text-left">Détails</th>
              </tr>
            </thead>
            <tbody>
              {anciensMembres.map((m) => (
                <tr
                  key={m.id}
                  className="border-b hover:bg-blue-50 transition-colors duration-200"
                >
                  <td className="py-2 px-4">
                    {m.prenom} {m.nom}
                  </td>
                  <td className="py-2 px-4">{m.telephone}</td>
                  <td className="py-2 px-4">
                    {m.statut === "s.t.a.r" ? "⭐ S.T.A.R" : m.statut}
                  </td>
                  <td className="py-2 px-4">
                    <button
                      className="text-blue-600 underline"
                      onClick={() => setPopupMembre(m)}
                    >
                      Détails
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Popup détails membre */}
      {popupMembre && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white rounded-2xl shadow-xl p-6 w-[90%] max-w-md"
          >
            <h3 className="text-lg font-bold mb-3 text-gray-800">
              {popupMembre.prenom} {popupMembre.nom}
            </h3>
            <p>📞 {popupMembre.telephone}</p>
            <p>📝 {popupMembre.besoin}</p>
            <p>ℹ️ {popupMembre.infos_supplementaires}</p>
            <p>
              📅 Ajouté le{" "}
              {format(new Date(popupMembre.created_at), "d MMMM yyyy", {
                locale: fr,
              })}
            </p>

            <button
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              onClick={() => setPopupMembre(null)}
            >
              Fermer
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}

