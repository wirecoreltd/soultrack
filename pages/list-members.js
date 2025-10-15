// pages/list-members.js

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import BoutonEnvoyer from "../components/BoutonEnvoyer";
import LogoutLink from "../components/LogoutLink";
import { supabase } from "../utils/supabaseClient";

export default function ListMembers() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMembers();
  }, []);

  async function fetchMembers() {
    const { data, error } = await supabase.from("members").select("*");
    if (!error) {
      // 🔹 On trie : visiteurs et "veut rejoindre ICC" d'abord
      const sorted = [...data].sort((a, b) => {
        const order = { visiteur: 1, "veut rejoindre ICC": 2, actif: 3, star: 4 };
        return (order[a.status] || 99) - (order[b.status] || 99);
      });
      setMembers(sorted);
    }
    setLoading(false);
  }

  async function updateStatus(id, newStatus) {
    await supabase.from("members").update({ status: newStatus }).eq("id", id);
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: newStatus } : m))
    );
  }

  function getColorByStatus(status) {
    switch (status) {
      case "visiteur":
        return "#3B82F6"; // bleu
      case "veut rejoindre ICC":
        return "#60A5FA"; // bleu clair
      case "actif":
        return "#10B981"; // vert
      case "star":
        return "#FBBF24"; // jaune
      default:
        return "#9CA3AF"; // gris
    }
  }

  function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  const newMembers = members.filter(
    (m) => m.status === "visiteur" || m.status === "veut rejoindre ICC"
  );
  const existingMembers = members.filter(
    (m) => m.status === "actif" || m.status === "star"
  );

  const latestDate =
    newMembers.length > 0
      ? formatDate(
          newMembers.reduce(
            (a, b) => (new Date(a.created_at) > new Date(b.created_at) ? a : b)
          ).created_at
        )
      : null;

  if (loading) return <p className="text-center mt-6">Chargement...</p>;

  return (
    <div className="min-h-screen bg-gray-100 py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Liste des membres</h1>
        <LogoutLink />
      </div>

      {/* 💖 Section nouveaux membres */}
      {newMembers.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-4 text-pink-600">
            💖 Bien aimé venu le {latestDate}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {newMembers.map((member) => {
              const color = getColorByStatus(member.status);
              return (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white shadow rounded-xl p-4 relative"
                  style={{ borderTop: `6px solid ${color}` }}
                >
                  {/* Statut en haut à gauche */}
                  <div className="absolute top-2 left-4 text-sm font-semibold"
                       style={{ color }}>
                    {member.status === "star" ? "⭐ S.T.A.R" : member.status}
                  </div>

                  {/* Nom */}
                  <h3 className="text-lg font-bold mt-6 break-words">
                    {member.prenom}
                    <br />
                    {member.nom}
                  </h3>

                  {/* Téléphone + bouton */}
                  <div className="flex justify-between items-center mt-4">
                    <p className="text-gray-700">{member.telephone}</p>
                    <BoutonEnvoyer
                      label="📤 Envoyer au responsable"
                      onClick={() => updateStatus(member.id, "actif")}
                      color="blue"
                    />
                  </div>

                  {/* Tag nouveau */}
                  {(member.status === "visiteur" ||
                    member.status === "veut rejoindre ICC") && (
                    <span className="absolute top-2 right-4 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                      Nouveau
                    </span>
                  )}
                </motion.div>
              );
            })}
          </div>
        </section>
      )}

      {/* 🧍 Membres existants */}
      <section>
        <h2 className="text-xl font-semibold mb-4 text-green-700">
          Membres existants
        </h2>
        <div className="overflow-x-auto bg-white shadow rounded-xl">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-gray-200 text-left text-sm font-semibold">
                <th className="p-3">Nom complet</th>
                <th className="p-3">Téléphone</th>
                <th className="p-3">Statut</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {existingMembers.map((m) => {
                const color = getColorByStatus(m.status);
                const bgColor = `${color}20`; // fond léger
                return (
                  <tr
                    key={m.id}
                    style={{ backgroundColor: bgColor }}
                    className="border-b last:border-none"
                  >
                    <td className="p-3 font-medium">
                      {m.prenom} {m.nom}
                    </td>
                    <td className="p-3">{m.telephone}</td>
                    <td className="p-3 font-semibold" style={{ color }}>
                      {m.status === "star" ? "⭐ S.T.A.R" : m.status}
                    </td>
                    <td className="p-3">
                      <BoutonEnvoyer
                        label="📤 Envoyer au responsable"
                        onClick={() => updateStatus(m.id, "actif")}
                        color="green"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
