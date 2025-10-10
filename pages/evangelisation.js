// pages/evangelisation.js
"use client";
import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";

export default function Evangelisation() {
  const [members, setMembers] = useState([]);
  const [cellules, setCellules] = useState([]);
  const [selectedCellule, setSelectedCellule] = useState("");
  const [view, setView] = useState("card"); // 'card' ou 'table'

  useEffect(() => {
    fetchMembers();
    fetchCellules();
  }, []);

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from("suivis_des_evangelises")
        .select("*")
        .order("date_suivi", { ascending: false });
      if (error) throw error;
      setMembers(data || []);
    } catch (err) {
      console.error("Erreur fetchMembers:", err.message);
      setMembers([]);
    }
  };

  const fetchCellules = async () => {
    try {
      const { data, error } = await supabase
        .from("cellules")
        .select("id, cellule, responsable, telephone");
      if (error) throw error;
      setCellules(data || []);
    } catch (err) {
      console.error("Erreur fetchCellules:", err.message);
      setCellules([]);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-gray-100">
      <h1 className="text-4xl font-bold mb-4">Évangélisation</h1>

      {/* Menu déroulant des cellules */}
      <div className="mb-6 w-full max-w-md">
        <select
          value={selectedCellule}
          onChange={(e) => setSelectedCellule(e.target.value)}
          className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <option value="">-- Sélectionner cellule --</option>
          {cellules.map((c) => (
            <option key={c.id} value={c.id}>
              {c.cellule} ({c.responsable})
            </option>
          ))}
        </select>
      </div>

      {/* Toggle Visuel */}
      <p
        className="self-end text-blue-500 cursor-pointer mb-4"
        onClick={() => setView(view === "card" ? "table" : "card")}
      >
        {view === "card" ? "Voir en Table" : "Voir en Card"}
      </p>

      {view === "card" ? (
        <div className="w-full max-w-5xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {members.map((member) => (
            <div
              key={member.id}
              className="bg-white p-4 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300"
            >
              <h2 className="text-lg font-bold text-gray-800 mb-2">
                {member.prenom} {member.nom} {member.is_whatsapp && <span className="ml-1 text-green-500">📱</span>}
              </h2>

              <p className="text-sm text-gray-600 mb-2">
                Ville : {member.ville || "—"} | Besoin : {member.besoin || "—"} | Infos : {member.infos_supplementaires || "—"}
              </p>

              <div className="mt-4 flex justify-center">
                <button className="bg-blue-500 text-white px-4 py-2 rounded-xl font-semibold hover:bg-blue-600 transition-colors">
                  Envoyer
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="w-full max-w-5xl overflow-x-auto">
          <table className="min-w-full bg-white rounded-xl">
            <thead>
              <tr className="bg-gray-200">
                <th className="py-2 px-4">Prénom</th>
                <th className="py-2 px-4">Nom</th>
                <th className="py-2 px-4">Téléphone</th>
                <th className="py-2 px-4">WhatsApp</th>
                <th className="py-2 px-4">Ville</th>
                <th className="py-2 px-4">Besoin</th>
                <th className="py-2 px-4">Infos</th>
                <th className="py-2 px-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.id} className="border-b">
                  <td className="py-2 px-4">{member.prenom}</td>
                  <td className="py-2 px-4">{member.nom}</td>
                  <td className="py-2 px-4">{member.telephone || "—"}</td>
                  <td className="py-2 px-4">{member.is_whatsapp ? "Oui" : "Non"}</td>
                  <td className="py-2 px-4">{member.ville || "—"}</td>
                  <td className="py-2 px-4">{member.besoin || "—"}</td>
                  <td className="py-2 px-4">{member.infos_supplementaires || "—"}</td>
                  <td className="py-2 px-4">
                    <button className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 transition-colors">
                      Envoyer
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
