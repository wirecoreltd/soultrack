/**
 * Description : Page Liste des Membres
 * Affiche tous les membres de l'église avec filtres par statut
 * et possibilité d'envoyer les infos WhatsApp pour certains statuts.
 */

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import MemberCard from "../components/MemberCard";

export default function ListMembers() {
  const [members, setMembers] = useState([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchMembers();
  }, [filter]);

  async function fetchMembers() {
    let query = supabase.from("membres").select("*").order("created_at", { ascending: false });

    if (filter !== "all") {
      query = query.eq("statut", filter);
    }

    const { data, error } = await query;
    if (error) console.error(error);
    else setMembers(data);
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-4">📋 Liste des membres</h1>

      {/* Filtre par statut */}
      <div className="mb-6">
        <label className="mr-2 font-semibold">Filtrer par statut :</label>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-400"
        >
          <option value="all">Tous</option>
          <option value="visiteur">Visiteur</option>
          <option value="veut rejoindre ICC">Veut rejoindre ICC</option>
          <option value="a déjà mon église">A déjà mon église</option>
          <option value="ancien">Ancien</option>
        </select>
      </div>

      {/* Liste des cartes */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.map((member) => (
          <MemberCard key={member.id} member={member} fetchMembers={fetchMembers} />
        ))}
      </div>
    </div>
  );
}
