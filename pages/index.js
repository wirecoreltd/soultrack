// pages/list-members.js
import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { motion } from "framer-motion";
import { FiFilter, FiList, FiGrid, FiSend } from "react-icons/fi";

export default function ListMembers() {
  const [members, setMembers] = useState([]);
  const [view, setView] = useState("card");
  const [selectedMember, setSelectedMember] = useState(null);
  const [statusFilter, setStatusFilter] = useState("Tous");

  useEffect(() => {
    fetchMembers();
  }, []);

  async function fetchMembers() {
    const { data } = await supabase.from("membres").select("*").order("created_at", { ascending: true });
    setMembers(data || []);
  }

  const filteredMembers =
    statusFilter === "Tous" ? members : members.filter((m) => m.status === statusFilter);

  const nouveaux = filteredMembers.filter(
    (m) => m.status === "visiteur" || m.status === "veut rejoindre icc"
  );
  const anciens = filteredMembers.filter(
    (m) => m.status !== "visiteur" && m.status !== "veut rejoindre icc"
  );

  const dateVisite =
    nouveaux.length > 0
      ? `💖 Bien aimé venu le ${format(new Date(), "EEEE d MMMM yyyy", { locale: fr })}`
      : null;

  const colorMap = {
    visiteur: "#3B82F6",
    "veut rejoindre icc": "#60A5FA",
    membre: "#22C55E",
    serviteur: "#F59E0B",
    partenaire: "#8B5CF6",
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <FiFilter className="text-gray-500" />
          <select
            className="border rounded-lg px-3 py-1 text-gray-700"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option>Tous</option>
            <option>visiteur</option>
            <option>veut rejoindre icc</option>
            <option>membre</option>
            <option>serviteur</option>
            <option>partenaire</option>
          </select>
          <span className="text-gray-500 text-sm">{filteredMembers.length} membres</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setView("table")}>
            <FiList className={`text-xl ${view === "table" ? "text-blue-500" : "text-gray-400"}`} />
          </button>
          <button onClick={() => setView("card")}>
            <FiGrid className={`text-xl ${view === "card" ? "text-blue-500" : "text-gray-400"}`} />
          </button>
        </div>
      </div>

      {view === "card" ? (
        <div className="space-y-6">
          {dateVisite && (
            <div className="text-gray-700 text-sm font-medium ml-1 mb-1">{dateVisite}</div>
          )}

          <div className="grid md:grid-cols-3 gap-4">
            {nouveaux.map((m) => (
              <motion.div
                key={m.id}
                className="bg-white rounded-2xl shadow-md border-l-4"
                style={{ borderColor: colorMap[m.status] }}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <div className="p-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-blue-500 bg-blue-50 px-2 py-0.5 rounded-md">
                      Nouveau
                    </span>
                    <span className="text-sm font-semibold text-gray-600 capitalize">
                      {m.status}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{m.full_name}</h3>
                  <p className="text-gray-600">{m.phone}</p>
                  <div className="pt-2 border-t text-right">
                    <button
                      className="text-blue-600 hover:underline text-sm"
                      onClick={() => setSelectedMember(m)}
                    >
                      Détails
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {nouveaux.length > 0 && (
            <div className="flex items-center my-4">
              <span className="text-sm font-medium text-gray-500 tracking-wide bg-gradient-to-r from-blue-400 to-gray-300 text-transparent bg-clip-text">
                Membres existants
              </span>
              <div className="flex-grow h-px bg-gradient-to-r from-blue-400 to-gray-300 ml-2"></div>
            </div>
          )}

          <div className="grid md:grid-cols-3 gap-4">
            {anciens.map((m) => (
              <motion.div
                key={m.id}
                className="bg-white rounded-2xl shadow-md border-l-4"
                style={{ borderColor: colorMap[m.status] }}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <div className="p-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-gray-600 capitalize">
                      {m.status}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{m.full_name}</h3>
                  <p className="text-gray-600">{m.phone}</p>
                  <div className="pt-2 border-t text-right">
                    <button
                      className="text-green-600 hover:underline text-sm flex items-center gap-1"
                      onClick={() => setSelectedMember(m)}
                    >
                      <FiSend /> Détails
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {dateVisite && (
            <div className="text-gray-700 text-sm font-medium">{dateVisite}</div>
          )}
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-left text-gray-600 bg-gray-50">
                <th className="p-3">Nom complet</th>
                <th className="p-3">Téléphone</th>
                <th className="p-3">Statut</th>
                <th className="p-3 text-center">Cellule</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {nouveaux.map((m) => (
                <tr
                  key={m.id}
                  className="border-b bg-white hover:bg-gray-50 transition-all duration-200"
                >
                  <td className="p-3 border-l-4" style={{ borderColor: colorMap[m.status] }}>
                    {m.full_name}
                  </td>
                  <td className="p-3">{m.phone}</td>
                  <td className="p-3">
                    <span className="text-sm text-blue-600 font-medium capitalize">
                      {m.status}
                    </span>
                    <span className="ml-2 text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md">
                      Nouveau
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <select className="border rounded-lg px-2 py-1 text-sm text-gray-700">
                      <option>Choisir</option>
                      <option>Cellule A</option>
                      <option>Cellule B</option>
                      <option>Cellule C</option>
                    </select>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      className="text-green-600 hover:underline text-sm flex items-center gap-1 mx-auto"
                      onClick={() => setSelectedMember(m)}
                    >
                      <FiSend /> Détails
                    </button>
                  </td>
                </tr>
              ))}

              {nouveaux.length > 0 && (
                <tr>
                  <td colSpan="5" className="pt-4 pb-2">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-500 tracking-wide bg-gradient-to-r from-blue-400 to-gray-300 text-transparent bg-clip-text">
                        Membres existants
                      </span>
                      <div className="flex-grow h-px bg-gradient-to-r from-blue-400 to-gray-300 ml-2"></div>
                    </div>
                  </td>
                </tr>
              )}

              {anciens.map((m) => (
                <tr
                  key={m.id}
                  className="border-b bg-white hover:bg-gray-50 transition-all duration-200"
                >
                  <td className="p-3 border-l-4" style={{ borderColor: colorMap[m.status] }}>
                    {m.full_name}
                  </td>
                  <td className="p-3">{m.phone}</td>
                  <td className="p-3 capitalize text-gray-700 font-medium">{m.status}</td>
                  <td className="p-3 text-center">
                    <select className="border rounded-lg px-2 py-1 text-sm text-gray-700">
                      <option>Choisir</option>
                      <option>Cellule A</option>
                      <option>Cellule B</option>
                      <option>Cellule C</option>
                    </select>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      className="text-green-600 hover:underline text-sm flex items-center gap-1 mx-auto"
                      onClick={() => setSelectedMember(m)}
                    >
                      <FiSend /> Détails
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
