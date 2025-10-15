// pages/list-members.js

import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import LogoutLink from "../components/LogoutLink";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { FaStar } from "react-icons/fa";

export default function ListMembers() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Récupération des membres
  useEffect(() => {
    const fetchMembers = async () => {
      const { data, error } = await supabase
        .from("membres")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error) setMembers(data || []);
      setLoading(false);
    };

    fetchMembers();
  }, []);

  // ✅ Gestion du changement de statut
  const handleStatusChange = async (id, newStatus) => {
    const { error } = await supabase
      .from("membres")
      .update({ status: newStatus })
      .eq("id", id);

    if (!error) {
      setMembers((prev) =>
        prev.map((m) => (m.id === id ? { ...m, status: newStatus } : m))
      );
    }
  };

  // ✅ Séparer nouveaux et anciens membres
  const nouveauxMembres = members.filter(
    (m) =>
      m.status === "visiteur" || m.status === "veut rejoindre ICC"
  );

  const anciensMembres = members.filter(
    (m) => m.status !== "visiteur" && m.status !== "veut rejoindre ICC"
  );

  // ✅ Formater la date du premier "nouveau membre"
  const datePremierNouveau =
    nouveauxMembres.length > 0 && nouveauxMembres[0].created_at
      ? format(new Date(nouveauxMembres[0].created_at), "EEEE d MMMM yyyy", {
          locale: fr,
        })
      : null;

  // ✅ Couleurs selon le statut
  const getStatusColor = (status) => {
    switch (status) {
      case "visiteur":
      case "veut rejoindre ICC":
        return "border-blue-400 bg-blue-50 text-blue-700";
      case "actif":
        return "border-green-400 bg-green-50 text-green-700";
      case "s.t.a.r":
        return "border-yellow-400 bg-yellow-50 text-yellow-700";
      default:
        return "border-gray-300 bg-gray-50 text-gray-700";
    }
  };

  if (loading) return <p className="text-center mt-10">Chargement...</p>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Liste des membres</h1>
        <LogoutLink />
      </div>

      {/* 💖 Bien aimé venu le ... */}
      {nouveauxMembres.length > 0 && (
        <p className="text-right text-pink-600 font-medium mb-4">
          💖 Bien aimé venu le {datePremierNouveau}
        </p>
      )}

      {/* 🆕 Nouveaux Membres */}
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {nouveauxMembres.map((member) => (
            <motion.div
              key={member.id}
              layout
              className={`border-t-4 rounded-2xl shadow p-4 bg-white ${getStatusColor(
                member.status
              )}`}
            >
              {/* Statut en haut */}
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-semibold capitalize">
                  {member.status}
                </p>
                {(member.status === "visiteur" ||
                  member.status === "veut rejoindre ICC") && (
                  <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-md">
                    Nouveau
                  </span>
                )}
              </div>

              {/* Nom */}
              <h2 className="text-lg font-bold break-words">
                {member.prenom}
                <br />
                {member.nom}
              </h2>

              {/* Téléphone */}
              <p className="text-sm mt-1 text-gray-600">
                📞 {member.telephone}
              </p>

              {/* Menu déroulant pour statut */}
              <select
                value={member.status}
                onChange={(e) =>
                  handleStatusChange(member.id, e.target.value)
                }
                className="mt-2 border rounded px-2 py-1 text-sm w-full bg-gray-50"
              >
                <option value="visiteur">visiteur</option>
                <option value="veut rejoindre ICC">veut rejoindre ICC</option>
                <option value="actif">actif</option>
                <option value="s.t.a.r">s.t.a.r</option>
              </select>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Ligne grise + titre Membres existants */}
      <div className="flex items-center justify-center my-8">
        <hr className="flex-grow border-gray-300" />
        <span className="mx-3 text-gray-500 font-medium">
          Membres existants ───
        </span>
        <hr className="flex-grow border-gray-300" />
      </div>

      {/* 🧑‍🤝‍🧑 Membres existants */}
      <div className="overflow-x-auto mt-4">
        <table className="min-w-full bg-white rounded-2xl shadow">
          <thead className="bg-gray-200">
            <tr>
              <th className="py-2 px-3 text-left">Nom complet</th>
              <th className="py-2 px-3 text-left">Téléphone</th>
              <th className="py-2 px-3 text-left">Statut</th>
              <th className="py-2 px-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {anciensMembres.map((member) => (
              <tr
                key={member.id}
                className={`${getStatusColor(member.status)} transition`}
              >
                <td className="py-2 px-3">
                  {member.prenom} {member.nom}
                </td>
                <td className="py-2 px-3">{member.telephone}</td>
                <td className="py-2 px-3">
                  <div className="flex items-center gap-2">
                    {member.status === "s.t.a.r" && (
                      <FaStar className="text-yellow-500" />
                    )}
                    <select
                      value={member.status}
                      onChange={(e) =>
                        handleStatusChange(member.id, e.target.value)
                      }
                      className="border rounded px-2 py-1 text-sm bg-gray-50"
                    >
                      <option value="visiteur">visiteur</option>
                      <option value="veut rejoindre ICC">
                        veut rejoindre ICC
                      </option>
                      <option value="actif">actif</option>
                      <option value="s.t.a.r">s.t.a.r</option>
                    </select>
                  </div>
                </td>
                <td className="py-2 px-3">
                  <button className="text-sm text-indigo-600 hover:underline">
                    Détails
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
