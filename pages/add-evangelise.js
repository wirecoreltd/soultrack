"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/router";
import Image from "next/image";

// --- Supabase Client ---
const supabase = createClient(
  "https://qdxbcbpbjozvxgpusadi.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkeGJjYnBiam96dnhncHVzYWRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyNjQ0NTQsImV4cCI6MjA3Mzg0MDQ1NH0.pWlel0AkViXCmKRHP0cvk84RCBH_VEWsZEZEKJscDZ8"
);

export default function AddEvangelise() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    telephone: "",
    ville: "",
    statut: "evangelisé",
    infos_supplementaires: "",
    is_whatsapp: false,
    besoin: [],
  });

  const [showOtherField, setShowOtherField] = useState(false);
  const [otherBesoin, setOtherBesoin] = useState("");
  const [success, setSuccess] = useState(false);

  const besoinsList = [
    "Finances",
    "Santé",
    "Travail",
    "Les Enfants",
    "La Famille",
    "Paix",
  ];

  const handleBesoinChange = (value) => {
    let updated = [...formData.besoin];
    if (updated.includes(value)) {
      updated = updated.filter((b) => b !== value);
    } else {
      updated.push(value);
    }
    setFormData({ ...formData, besoin: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const finalBesoins = [...formData.besoin];
    if (showOtherField && otherBesoin.trim()) {
      finalBesoins.push(otherBesoin.trim());
    }

    try {
      const { error } = await supabase.from("evangelises").insert([
        { ...formData, besoin: finalBesoins }
      ]);
      if (error) throw error;

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);

      setFormData({
        nom: "",
        prenom: "",
        telephone: "",
        ville: "",
        statut: "evangelisé",
        infos_supplementaires: "",
        is_whatsapp: false,
        besoin: [],
      });
      setShowOtherField(false);
      setOtherBesoin("");

    } catch (err) {
      alert(err.message);
    }
  };

  const handleCancel = () => {
    setFormData({
      nom: "",
      prenom: "",
      telephone: "",
      ville: "",
      statut: "evangelisé",
      infos_supplementaires: "",
      is_whatsapp: false,
      besoin: [],
    });
    setShowOtherField(false);
    setOtherBesoin("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-200 via-pink-100 to-yellow-100 p-6">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-lg relative">

        {/* Retour */}
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 text-black hover:text-gray-800 transition"
        >
          ← Retour
        </button>

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Image src="/logo.png" alt="SoulTrack Logo" width={80} height={80} />
        </div>

        <h1 className="text-3xl font-bold text-center mb-2">Ajouter une personne évangélisée</h1>
        <p className="text-center text-gray-500 italic mb-6">
          « Allez, faites de toutes les nations des disciples » – Matthieu 28:19
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
          <input className="input" type="text" name="prenom" placeholder="Prénom" value={formData.prenom} onChange={(e)=>setFormData({...formData,prenom:e.target.value})} required />
          <input className="input" type="text" name="nom" placeholder="Nom" value={formData.nom} onChange={(e)=>setFormData({...formData,nom:e.target.value})} required />
          <input className="input" type="text" name="telephone" placeholder="Téléphone" value={formData.telephone} onChange={(e)=>setFormData({...formData,telephone:e.target.value})} required />

          {/* WhatsApp */}
          <label className="flex items-center gap-2 text-gray-700">
            <input
              type="checkbox"
              className="w-5 h-5 accent-indigo-600 cursor-pointer"
              name="is_whatsapp"
              checked={formData.is_whatsapp}
              onChange={(e)=>setFormData({...formData,is_whatsapp:e.target.checked})}
            />
            WhatsApp
          </label>

          <input className="input" type="text" name="ville" placeholder="Ville" value={formData.ville} onChange={(e)=>setFormData({...formData,ville:e.target.value})} />

          {/* ✅ Besoin avec style correct + coche bleue */}
            <div className="mt-4">
              <p className="font-semibold mb-2">Besoin :</p>
            
              {besoinsList.map((b) => (
                <label key={b} className="flex items-center gap-3 mb-2">
                  <input
                    type="checkbox"
                    name="besoin"
                    value={b}
                    checked={formData.besoin.includes(b)}
                    onChange={() => handleBesoinChange(b)}
                    className="w-5 h-5 rounded border-gray-400 cursor-pointer accent-indigo-600"
                  />
                  <span>{b}</span>
                </label>
              ))}
            
              {/* ✅ Autre */}
              <label className="flex items-center gap-3 mb-2">
                <input
                  type="checkbox"
                  name="besoin"
                  value="Autre"
                  checked={showOtherField}
                  onChange={() => setShowOtherField(!showOtherField)}
                  className="w-5 h-5 rounded border-gray-400 cursor-pointer accent-indigo-600"
                />
                Autre
              </label>
            
              {/* ✅ Champ dynamique */}
              {showOtherField && (
                <input
                  type="text"
                  placeholder="Précisez le besoin..."
                  value={otherBesoin}
                  onChange={(e) => setOtherBesoin(e.target.value)}
                  className="input mt-1"
                />
              )}
            </div>
          <textarea
            className="input"
            name="infos_supplementaires"
            value={formData.infos_supplementaires}
            onChange={(e)=>setFormData({...formData,infos_supplementaires:e.target.value})}
            rows={3}
            placeholder="Informations supplémentaires..."
          />

          {/* Boutons */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-bold py-3 rounded-2xl shadow-md transition-all"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:scale-105 text-white font-bold py-3 rounded-2xl shadow-md transition-all"
            >
              Ajouter
            </button>
          </div>
        </form>

        {/* ✅ Animation validation */}
        {success && (
          <p className="text-green-600 font-semibold text-center mt-3 animate-bounce">
            ✅ Personne évangélisée ajoutée avec succès !
          </p>
        )}

        <style jsx>{`
          .input {
            width: 100%;
            border: 1px solid #ccc;
            border-radius: 12px;
            padding: 12px;
            text-align: left;
            box-shadow: 0 1px 3px rgba(0,0,0,0.08);
            color: black;
          }
        `}</style>
      </div>
    </div>
  );
}
