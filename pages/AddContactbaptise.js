"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import supabase from "../lib/supabaseClient";

export default function AddContactbaptise() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    prenom: "",
    nom: "",
    telephone: "",
    is_whatsapp: false,
    ville: "",
    sexe: "",
    age: "",
    statut: "",
    venu: "",
    priere_salut: "",
    type_conversion: "",
    besoin: [],
    besoinLibre: "",
    infos_supplementaires: "",
    eglise_id: "",
    branche_id: "",
  });
  const [showBesoinLibre, setShowBesoinLibre] = useState(false);
  const [success, setSuccess] = useState(false);

  const besoinsOptions = [
    "Finances","Santé","Travail / Études","Famille / Enfants","Relations / Conflits","Addictions / Dépendances",
    "Guidance spirituelle","Logement / Sécurité","Communauté / Isolement", "Dépression / Santé mentale"
  ];

  // Récupérer eglise_id et branche_id de l'utilisateur connecté
  useEffect(() => {
    const fetchUserEglise = async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) return;

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("eglise_id, branche_id")
        .eq("id", session.session.user.id)
        .single();

      if (!error && profile) {
        setFormData(prev => ({
          ...prev,
          eglise_id: profile.eglise_id,
          branche_id: profile.branche_id,
        }));
      }
    };

    fetchUserEglise();
  }, []);

  const handleBesoinChange = (e) => {
    const { value, checked } = e.target;
    if (value === "Autre") {
      setShowBesoinLibre(checked);
      if (!checked) setFormData((prev) => ({ ...prev, besoinLibre: "" }));
    }
    setFormData((prev) => {
      const updatedBesoin = checked
        ? [...prev.besoin, value]
        : prev.besoin.filter((b) => b !== value);
      return { ...prev, besoin: updatedBesoin };
    });
  };

  const handleCancel = () => router.back();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const finalBesoin = showBesoinLibre && formData.besoinLibre
      ? [...formData.besoin.filter((b) => b !== "Autre"), formData.besoinLibre]
      : formData.besoin;

    const dataToSend = {
      ...formData,
      etat_contact: "existant",         // forcer à "existant"
      bapteme_eau: "Non",               // non encore baptisé
      veut_se_faire_baptiser: "Oui",    // veut se faire baptiser
      besoin: finalBesoin,
    };

    delete dataToSend.besoinLibre;

    try {
      const { error } = await supabase.from("membres_complets").insert([dataToSend]);
      if (error) throw error;

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);

      setFormData(prev => ({
        ...prev,
        prenom: "",
        nom: "",
        telephone: "",
        is_whatsapp: false,
        ville: "",
        sexe: "",
        age: "",
        statut: "",
        venu: "",
        priere_salut: "",
        type_conversion: "",
        besoin: [],
        besoinLibre: "",
        infos_supplementaires: "",
      }));
      setShowBesoinLibre(false);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-200 via-pink-100 to-yellow-100 p-4 sm:p-6">
      <div className="w-full max-w-md bg-white p-6 sm:p-8 rounded-3xl shadow-lg relative">
        <button
          onClick={() => router.back()}
          className="absolute top-3 left-3 sm:top-4 sm:left-4 flex items-center text-black font-semibold hover:text-gray-800 transition-colors"
        >
          ← Retour
        </button>

        <div className="flex justify-center mb-4 sm:mb-6">
          <Image src="/logo.png" alt="SoulTrack Logo" width={70} height={70} className="sm:w-[80px] sm:h-[60px]" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-2">Ajouter un nouveau bâptié</h1>
        <p className="text-center text-gray-500 italic mb-4 sm:mb-6 text-sm sm:text-base">
          « Allez, faites de toutes les nations des disciples » – Matthieu 28:19
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:gap-4">
            {/* Civilité */}
          <div className="flex flex-col">
            <label className="text-sm sm:text-base font-bold mb-1">Civilité</label>
            <select value={formData.sexe} onChange={e => setFormData({...formData,sexe:e.target.value})} className="input" required>
              <option value="">-- Choisir --</option>
              <option value="Homme">Homme</option>
              <option value="Femme">Femme</option>
            </select>
          </div>
  
          {/* Prénom */}
          <div className="flex flex-col">
            <label className="text-sm sm:text-base font-bold mb-1">Prénom</label>
            <input type="text" value={formData.prenom} onChange={e => setFormData({...formData, prenom:e.target.value})} className="input" required/>
          </div>
          {/* Nom */}
          <div className="flex flex-col">
            <label className="text-sm sm:text-base font-bold mb-1">Nom</label>
            <input type="text" value={formData.nom} onChange={e => setFormData({...formData, nom:e.target.value})} className="input" required/>
          </div>
          {/* Téléphone */}
          <div className="flex flex-col">
            <label className="text-sm sm:text-base font-bold mb-1">Téléphone</label>
            <input type="text" value={formData.telephone} onChange={e => setFormData({...formData, telephone:e.target.value})} className="input"/>
          </div>
          {/* WhatsApp */}
          <label className="flex items-center gap-2 text-sm sm:text-base font-bold mb-1">
            <input type="checkbox" checked={formData.is_whatsapp} onChange={e => setFormData({...formData,is_whatsapp:e.target.checked})} className="w-4 h-4 sm:w-5 sm:h-5" />
            Numéro WhatsApp
          </label>
          {/* Ville */}
          <div className="flex flex-col">
            <label className="text-sm sm:text-base font-bold mb-1">Ville</label>
            <input type="text" value={formData.ville} onChange={e => setFormData({...formData,ville:e.target.value})} className="input"/>
          </div>         

          {/* Boutons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-2">
            <button type="button" onClick={handleCancel} className="w-full bg-gray-400 hover:bg-gray-500 text-white font-bold py-3 rounded-2xl shadow-md transition-all">
              Annuler
            </button>
            <button type="submit" className="w-full bg-gradient-to-r from-blue-400 to-indigo-500 hover:from-blue-500 hover:to-indigo-600 text-white font-bold py-3 rounded-2xl shadow-md transition-all">
              Ajouter
            </button>
          </div>

          {success && <p className="text-green-600 font-semibold text-center mt-4 animate-pulse">✅ Contact ajouté avec succès !</p>}
        </form>

        <style jsx>{`
          .input {
            width: 100%;
            border: 1px solid #ccc;
            border-radius: 12px;
            padding: 12px;
            text-align: left;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            color: black;
            font-size: 0.95rem;
          }
        `}</style>
      </div>
    </div>
  );
}
