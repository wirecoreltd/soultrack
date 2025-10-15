// pages/list-members.js

"use client";
import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import BoutonEnvoyer from "../components/BoutonEnvoyer";
import LogoutLink from "../components/LogoutLink";

export default function ListMembersPage() {
  const [members, setMembers] = useState([]);
  const [cellules, setCellules] = useState([]);
  const [selectedCellule, setSelectedCellule] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  useEffect(() => {
    fetchMembers();
    fetchCellules();
  }, []);

  const fetchMembers = async () => {
    const { data, error } = await supabase.from("membres").select("*").order("id", { ascending: false });
    if (!error) setMembers(data);
  };

  const fetchCellules = async () => {
    const { data, error } = await supabase.from("cellules").select("*");
    if (!error) setCellules(data);
  };

  // 🔄 Mise à jour locale instantanée quand un membre devient actif
  const handleStatusUpdate = (id, newStatus) => {
    setMembers(prev =>
      prev.map(m => (m.id === id ? { ...m, statut: newStatus } : m))
    );
  };

  // 💖 Format date locale (sans dépendance externe)
  const formatDate = (isoString) => {
    const date = new Date(isoString);
    const jours = [
      "dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"
    ];
    const jourNom = jours[date.getDay()];
    const options = { day: "numeric", month: "long", year: "numeric" };
    const formattedDate = date.toLocaleDateString("fr-FR", options);
    return `💖 Bien aimé venu le ${jourNom}, ${formattedDate}`;
  };

  const nouveaux = members.filter(m => m.statut !== "actif");
  const existants = members.filter(m => m.statut === "actif");

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold text-gray-700">
          Liste des membres
        </h1>
        <LogoutLink />
      </div>

      {/* SECTION NOUVEAUX */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-teal-700 mb-3">
          Nouveaux contacts
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {nouveaux.map(m => (
              <motion.div
                key={m.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-xl shadow-md p-4 flex flex-col gap-2 relative border-l-4 border-teal-500"
              >
                {/* 🟢 Statut en haut à gauche */}
                <div className="absolute top-2 left-3 text-xs font-semibold text-gray-600">
                  {m.statut === "s.t.a.r" ? "⭐ S.T.A.R" : m.statut}
                </div>

                {/* 💖 Texte de bienvenue */}
                <div className="text-sm text-teal-700 mt-5">{formatDate(m.created_at)}</div>

                {/* Nom sur deux lignes si long */}
                <h3 className="text-lg font-semibold break-words leading-tight">
                  {m.prenom}
                  <br />
                  {m.nom}
                </h3>

                {/* Téléphone + Sélecteur cellule */}
                <div className="flex items-center gap-2">
                  <p className="text-gray-600 text-sm">{m.telephone}</p>
                  <select
                    onChange={(e) =>
                      setSelectedCellule(
                        cellules.find(c => c.id === Number(e.target.value))
                      )
                    }
                    className="flex-1 border border-gray-300 rounded-md text-sm px-2 py-1"
                  >
                    <option value="">Choisir cellule</option>
                    {cellules.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.cellule}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Bouton d'envoi */}
                <BoutonEnvoyer
                  membre={m}
                  cellule={selectedCellule}
                  onStatusUpdate={handleStatusUpdate}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* SECTION EXISTANTS */}
      <div>
        <h2 className="text-xl font-bold text-teal-700 mb-3">
          Membres existants
        </h2>

        <div className="overflow-x-auto rounded-xl shadow-sm border border-gray-200">
          <table className="min-w-full bg-white text-sm">
            <thead className="bg-teal-600 text-white">
              <tr>
                <th className="py-2 px-4 text-left">Nom complet</th>
                <th className="py-2 px-4 text-left">Téléphone</th>
                <th className="py-2 px-4 text-left">Statut</th>
                <th className="py-2 px-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {existants.map(m => (
                <tr key={m.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-4 font-medium text-gray-800">
                    {m.prenom} {m.nom}
                  </td>
                  <td className="py-2 px-4 text-gray-600">{m.telephone}</td>
                  <td className="py-2 px-4 text-gray-700">
                    {m.statut === "s.t.a.r" ? "⭐ S.T.A.R" : m.statut}
                  </td>
                  <td className="py-2 px-4">
                    <button
                      onClick={() => {
                        setSelectedMember(m);
                        setShowPopup(true);
                      }}
                      className="text-teal-600 hover:underline"
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

      {/* POPUP DETAILS */}
      <AnimatePresence>
        {showPopup && selectedMember && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowPopup(false)}
          >
            <motion.div
              className="bg-white rounded-2xl p-6 w-11/12 max-w-md shadow-lg"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-semibold text-teal-700 mb-3">
                {selectedMember.prenom} {selectedMember.nom}
              </h3>
              <p className="text-gray-700 text-sm mb-2">
                📞 {selectedMember.telephone}
              </p>
              <p className="text-gray-700 text-sm mb-2">
                🏷️ Statut :{" "}
                {selectedMember.statut === "s.t.a.r"
                  ? "⭐ S.T.A.R"
                  : selectedMember.statut}
              </p>
              {selectedMember.besoin && (
                <p className="text-gray-600 text-sm mb-2">
                  💬 Besoin : {selectedMember.besoin}
                </p>
              )}
              {selectedMember.infos_supplementaires && (
                <p className="text-gray-600 text-sm">
                  ℹ️ Infos : {selectedMember.infos_supplementaires}
                </p>
              )}
              <button
                onClick={() => setShowPopup(false)}
                className="mt-4 w-full bg-teal-600 hover:bg-teal-700 text-white rounded-lg py-2 font-semibold transition"
              >
                Fermer
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}



