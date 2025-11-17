"use client";

import { useState } from "react";
import supabase from "../lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function CreateConseiller() {
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prenom || !nom || !telephone) return alert("Remplissez tous les champs !");
    setLoading(true);
    const { error } = await supabase
      .from("conseillers")
      .insert([{ prenom, nom, telephone, disponible: true }]);
    setLoading(false);
    if (error) {
      console.error(error);
      alert("Erreur lors de l'ajout du conseiller !");
    } else {
      alert("✅ Conseiller ajouté !");
      setPrenom(""); setNom(""); setTelephone("");
      router.push("/"); // ou redirige vers la liste des membres
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Créer un Conseiller</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm space-y-4">
        <input type="text" placeholder="Prénom" value={prenom} onChange={e => setPrenom(e.target.value)} className="w-full border px-3 py-2 rounded" />
        <input type="text" placeholder="Nom" value={nom} onChange={e => setNom(e.target.value)} className="w-full border px-3 py-2 rounded" />
        <input type="text" placeholder="Téléphone" value={telephone} onChange={e => setTelephone(e.target.value)} className="w-full border px-3 py-2 rounded" />
        <button type="submit" disabled={loading} className={`w-full py-2 px-4 rounded text-white font-bold ${loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"}`}>
          {loading ? "Création..." : "Créer le Conseiller"}
        </button>
      </form>
    </div>
  );
}
