// pages/add-member.js
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import LogoutLink from "../components/LogoutLink";
import Image from "next/image";
import supabase from "../lib/supabaseClient";

export default function AddMemberPage() {
  const router = useRouter();
  const [membre, setMembre] = useState({
    prenom: "",
    nom: "",
    telephone: "",
    email: "",
    ville: "",
    besoin: "",
    infos_supplementaires: "",
  });
  const [loading, setLoading] = useState(false);

  // ✅ Vérification du rôle (optionnelle)
  const [roles, setRoles] = useState([]);
  useEffect(() => {
    const storedRole = localStorage.getItem("userRole");
    if (storedRole) {
      let parsedRoles = [];
      try {
        parsedRoles = JSON.parse(storedRole);
        if (!Array.isArray(parsedRoles)) parsedRoles = [parsedRoles];
      } catch {
        parsedRoles = [storedRole];
      }
      setRoles(parsedRoles.map(r => r.toLowerCase().trim()));
    }
  }, []);

  const hasRole = role =>
    roles.includes(role.toLowerCase()) ||
    (role === "admin" && roles.includes("administrateur")) ||
    (role === "administrateur" && roles.includes("admin"));

  // ✅ Gestion du formulaire
  const handleChange = e => {
    setMembre({ ...membre, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!hasRole("admin") && !hasRole("administrateur")) {
      alert("⛔ Accès non autorisé !");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("membres").insert([membre]);
      if (error) {
        console.error("Erreur ajout membre :", error.message);
        alert("❌ Une erreur est survenue !");
      } else {
        alert("✅ Membre ajouté avec succès !");
        router.push("/membres-hub"); // Redirection après ajout
      }
    } catch (err) {
      console.error(err);
      alert("❌ Une erreur est survenue !");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center p-6"
      style={{ background: "linear-gradient(135deg, #2E3192 0%, #92EFFD 100%)" }}
    >
      <div className="w-full max-w-4xl flex justify-between items-center mb-6">
        <button
          onClick={() => router.back()}
          className="text-white font-semibold hover:text-gray-200 transition"
        >
          ← Retour
        </button>
        <LogoutLink />
      </div>

      <div className="mb-6 text-center">
        <Image src="/logo.png" alt="SoulTrack Logo" width={90} height={90} />
        <h1 className="text-3xl font-handwriting text-white mt-4">
          Ajouter un nouveau membre
        </h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white rounded-3xl p-6 shadow-md flex flex-col gap-4"
      >
        <input
          type="text"
          name="prenom"
          placeholder="Prénom"
          value={membre.prenom}
          onChange={handleChange}
          className="border px-4 py-2 rounded-lg w-full"
          required
        />
        <input
          type="text"
          name="nom"
          placeholder="Nom"
          value={membre.nom}
          onChange={handleChange}
          className="border px-4 py-2 rounded-lg w-full"
          required
        />
        <input
          type="text"
          name="telephone"
          placeholder="Téléphone"
          value={membre.telephone}
          onChange={handleChange}
          className="border px-4 py-2 rounded-lg w-full"
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={membre.email}
          onChange={handleChange}
          className="border px-4 py-2 rounded-lg w-full"
        />
        <input
          type="text"
          name="ville"
          placeholder="Ville"
          value={membre.ville}
          onChange={handleChange}
          className="border px-4 py-2 rounded-lg w-full"
        />
        <textarea
          name="besoin"
          placeholder="Besoin"
          value={membre.besoin}
          onChange={handleChange}
          className="border px-4 py-2 rounded-lg w-full"
        />
        <textarea
          name="infos_supplementaires"
          placeholder="Infos supplémentaires"
          value={membre.infos_supplementaires}
          onChange={handleChange}
          className="border px-4 py-2 rounded-lg w-full"
        />

        <button
          type="submit"
          disabled={loading}
          className={`w-full text-white font-bold px-4 py-2 rounded-lg shadow-lg transition-all ${
            loading ? "bg-gray-400 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"
          }`}
        >
          {loading ? "Enregistrement..." : "Ajouter le membre"}
        </button>
      </form>
    </div>
  );
}

