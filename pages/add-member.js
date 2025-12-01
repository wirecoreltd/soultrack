"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import supabase from "../lib/supabaseClient";

export default function AddMember() {
  const router = useRouter();
  const { token } = router.query;

  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    telephone: "",
    ville: "",
    statut: "nouveau",
    venu: "",
    besoin: [],
    autreBesoin: "",
    is_whatsapp: false,
    infos_supplementaires: "",
  });

  const [showAutre, setShowAutre] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const besoinsOptions = ["Finances", "Santé", "Travail", "Les Enfants", "La Famille"];

  // ✅ Vérification du token
  useEffect(() => {
    if (!token) return;

    const verifyToken = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("access_tokens")
        .select("*")
        .eq("token", token)
        .gte("expires_at", new Date().toISOString())
        .single();

      if (error || !data) {
        setErrorMsg("Lien invalide ou expiré.");
        setLoading(false);
      } else {
        setLoading(false); // token valide
      }
    };

    verifyToken();
  }, [token]);

  const handleBesoinChange = (e) => {
    const { value, checked } = e.target;

    if (value === "Autre") {
      setShowAutre(checked);
      if (!checked) {
        setFormData(prev => ({
          ...prev,
          autreBesoin: "",
          besoin: prev.besoin.filter(b => b !== "Autre"),
        }));
      }
    }

    setFormData(prev => {
      const updatedBesoin = checked
        ? [...prev.besoin, value]
        : prev.besoin.filter(b => b !== value);
      return { ...prev, besoin: updatedBesoin };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const dataToSend = {
      ...formData,
      besoin: formData.autreBesoin && showAutre
        ? [...formData.besoin.filter(b => b !== "Autre"), formData.autreBesoin]
        : formData.besoin,
    };

    try {
      const { error } = await supabase.from("membres").insert([dataToSend]);
      if (error) throw error;

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);

      setFormData({
        nom: "",
        prenom: "",
        telephone: "",
        ville: "",
        statut: "nouveau",
        venu: "",
        besoin: [],
        autreBesoin: "",
        is_whatsapp: false,
        infos_supplementaires: "",
      });
      setShowAutre(false);
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
      statut: "nouveau",
      venu: "",
      besoin: [],
      autreBesoin: "",
      is_whatsapp: false,
      infos_supplementaires: "",
    });
    setShowAutre(false);
  };

  if (loading) return <p className="text-center mt-10">Vérification du lien...</p>;
  if (errorMsg) return <p className="text-center mt-10 text-red-600">{errorMsg}</p>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-200 via-pink-100 to-yellow-100 p-6">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-lg relative">
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 flex items-center text-black font-semibold hover:text-gray-800 transition-colors"
        >
          ← Retour
        </button>

        <div className="flex justify-center mb-6">
          <Image src="/logo.png" alt="SoulTrack Logo" width={80} height={80} />
        </div>

        <h1 className="text-3xl font-bold text-center mb-4">Ajouter un nouveau membre</h1>
        <p className="text-center text-gray-500 italic mb-6">
          « Allez, faites de toutes les nations des disciples » – Matthieu 28:19
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input type="text" placeholder="Prénom" value={formData.prenom} onChange={(e)=>setFormData({...formData, prenom:e.target.value})} className="input" required />
          <input type="text" placeholder="Nom" value={formData.nom} onChange={(e)=>setFormData({...formData, nom:e.target.value})} className="input" required />
          <input type="text" placeholder="Téléphone" value={formData.telephone} onChange={(e)=>setFormData({...formData, telephone:e.target.value})} className="input" required />
          <input type="text" placeholder="Ville" value={formData.ville} onChange={(e)=>setFormData({...formData, ville:e.target.value})} className="input" />

          <label className="flex items-center gap-2 mt-1">
            <input type="checkbox" checked={formData.is_whatsapp} onChange={(e)=>setFormData({...formData, is_whatsapp:e.target.checked})} />
            WhatsApp
          </label>

          <select value={formData.statut} onChange={(e)=>setFormData({...formData, statut:e.target.value})} className="input">
            <option value="">-- Statut --</option>
            <option value="veut rejoindre ICC">Veut rejoindre ICC</option>
            <option value="a déjà son église">A déjà son église</option>
            <option value="visiteur">Visiteur</option>
          </select>

          <select value={formData.venu} onChange={(e)=>setFormData({...formData, venu:e.target.value})} className="input">
            <option value="">-- Comment est-il venu ? --</option>
            <option value="invité">Invité</option>
            <option value="réseaux">Réseaux</option>
            <option value="evangélisation">Évangélisation</option>
            <option value="autre">Autre</option>
          </select>

          {/* Besoins */}
          <div>
            <p className="font-semibold mb-2">Besoin :</p>
            {besoinsOptions.map(item => (
              <label key={item} className="flex items-center gap-3 mb-2">
                <input type="checkbox" value={item} checked={formData.besoin.includes(item)} onChange={handleBesoinChange} className="w-5 h-5 rounded border-gray-400 cursor-pointer" />
                <span>{item}</span>
              </label>
            ))}
            <label className="flex items-center gap-3 mb-2">
              <input type="checkbox" value="Autre" checked={showAutre} onChange={handleBesoinChange} className="w-5 h-5 rounded border-gray-400 cursor-pointer" />
              Autre
            </label>
            {showAutre && <input type="text" placeholder="Précisez..." value={formData.autreBesoin} onChange={(e)=>setFormData({...formData, autreBesoin:e.target.value})} className="input mt-1" />}
          </div>

          <textarea placeholder="Informations supplémentaires..." rows={2} value={formData.infos_supplementaires} onChange={(e)=>setFormData({...formData, infos_supplementaires:e.target.value})} className="input" />

          <div className="flex gap-4 mt-2">
            <button type="button" onClick={handleCancel} className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-bold py-3 rounded-2xl shadow-md transition-all">Annuler</button>
            <button type="submit" className="flex-1 bg-gradient-to-r from-blue-400 to-indigo-500 hover:from-blue-500 hover:to-indigo-600 text-white font-bold py-3 rounded-2xl shadow-md transition-all">Ajouter</button>
          </div>
        </form>

        {success && <p className="text-green-600 font-semibold text-center mt-4 animate-pulse">✅ Membre ajouté avec succès !</p>}

        <style jsx>{`
          .input { width: 100%; border: 1px solid #ccc; border-radius: 12px; padding: 12px; text-align: left; box-shadow: 0 1px 3px rgba(0,0,0,0.1); color: black; }
        `}</style>
      </div>
    </div>
  );
}
