"use client";

import { useState, useEffect } from "react";
import supabase from "../lib/supabaseClient";

export default function AjouterConseiller() {
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [responsables, setResponsables] = useState([]);
  const [responsableId, setResponsableId] = useState("");

  useEffect(() => {
    const fetchResponsables = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, prenom, nom")
        .eq("role", "ResponsableIntegration");

      if (!error) {
        setResponsables(data);
      }
    };

    fetchResponsables();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!responsableId) {
      alert("Sélectionne un responsable !");
      return;
    }

    const { error } = await supabase.from("profiles").insert([
      {
        email,
        prenom,
        nom,
        telephone,
        role: "Conseiller",
        responsable_id: responsableId,
      },
    ]);

    if (error) {
      console.log(error);
      alert("Erreur lors de la création !");
    } else {
      alert("Conseiller créé avec succès !");
      setPrenom("");
      setNom("");
      setEmail("");
      setTelephone("");
      setResponsableId("");
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Ajouter un Conseiller</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          className="w-full p-2 border rounded"
          placeholder="Prénom"
          value={prenom}
          onChange={(e) => setPrenom(e.target.value)}
        />

        <input
          className="w-full p-2 border rounded"
          placeholder="Nom"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
        />

        <input
          className="w-full p-2 border rounded"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="w-full p-2 border rounded"
          placeholder="Téléphone"
          value={telephone}
          onChange={(e) => setTelephone(e.target.value)}
        />

        <select
          className="w-full p-2 border rounded"
          value={responsableId}
          onChange={(e) => setResponsableId(e.target.value)}
        >
          <option value="">-- Sélectionne un Responsable --</option>

          {responsables.map((r) => (
            <option key={r.id} value={r.id}>
              {r.prenom} {r.nom}
            </option>
          ))}
        </select>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Créer le Conseiller
        </button>
      </form>
    </div>
  );
}
