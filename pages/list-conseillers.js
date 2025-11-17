"use client";

import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function ListConseillers() {
  const [conseillers, setConseillers] = useState([]);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUserAndConseillers = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { data: userData } = await supabase
        .from("responsables")
        .select("id, prenom, cellule_id")
        .eq("email", session.user.email)
        .single();

      setUser(userData);

      const { data: conseillersData } = await supabase
        .from("conseillers")
        .select("*")
        .eq("created_by", userData.id);

      setConseillers(conseillersData || []);
    };
    fetchUserAndConseillers();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-gradient-to-br from-purple-200 via-pink-100 to-yellow-100">
      <div className="w-full max-w-5xl mb-6 flex justify-between items-center">
        <button onClick={() => router.back()} className="text-black hover:text-gray-800 font-semibold">← Retour</button>
        <h1 className="text-2xl font-bold text-black">Mes Conseillers</h1>
      </div>

      {conseillers.length === 0 && (
        <p className="text-gray-700 text-lg mt-10">Aucun conseiller assigné pour le moment.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 w-full max-w-5xl">
        {conseillers.map(c => (
          <div key={c.id} className="bg-white rounded-xl shadow-md p-4">
            <h2 className="text-lg font-bold">{c.prenom} {c.nom}</h2>
            <p>📱 {c.telephone}</p>
            <p>Disponibilité : {c.disponible ? "✅" : "❌"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
