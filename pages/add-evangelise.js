"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import supabase from "../lib/supabaseClient";

export default function AddEvangelise({ onNewEvangelise }) {
  const router = useRouter();
  const { token } = router.query;

  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    telephone: "",
    ville: "",
    statut: "evangelisé",
    sexe: "",
    priere_salut: "",
    type_conversion: "",
    besoin: [],
    infos_supplementaires: "",
    is_whatsapp: false,
    eglise_id: null,
    branche_id: null,
  });

  const [showOtherField, setShowOtherField] = useState(false);
  const [otherBesoin, setOtherBesoin] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const besoinsList = ["Finances","Santé","Travail / Études","Famille / Enfants","Relations / Conflits","Addictions / Dépendances",
  "Guidance spirituelle","Logement / Sécurité","Communauté / Isolement", "Dépression / Santé mentale"];

  // ➤ Récupérer eglise_id et branche_id de l'utilisateur connecté
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
        setFormData((prev) => ({
          ...prev,
          eglise_id: profile.eglise_id,
          branche_id: profile.branche_id,
        }));
        console.log("Eglise ID :", profile.eglise_id, "Branche ID :", profile.branche_id);
      } else {
        console.error("Erreur récupération eglise/branche :", error?.message);
      }
    };
    fetchUserEglise();
  }, []);

  // Vérification du token si nécessaire
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

      if (error || !data) setErrorMsg("Lien invalide ou expiré.");
      setLoading(false);
    };

    verifyToken();
  }, [token]);

  const handleBesoinChange = (value) => {
    let updated = [...formData.besoin];
    if (updated.includes(value)) updated = updated.filter((b) => b !== value);
    else updated.push(value);
    setFormData({ ...formData, besoin: updated });
  };

    const handleSubmit = async (e) => {
  e.preventDefault();

  // 🔹 Vérification que les UUID existent
  if (!formData.eglise_id || !formData.branche_id) {
    console.error("Eglise ID ou Branche ID manquant :", formData.eglise_id, formData.branche_id);
    alert("Erreur : votre compte n'est pas rattaché à une église ou branche.");
    return;
  }

  // 🔹 Préparer les besoins
  const finalBesoins = [...formData.besoin];
  if (showOtherField && otherBesoin.trim()) finalBesoins.push(otherBesoin.trim());

  // 🔹 Préparer les données pour evangelises
  const finalData = {
    nom: formData.nom.trim(),
    prenom: formData.prenom.trim(),
    telephone: formData.telephone.trim() || "", // si vide → null
    ville: formData.ville.trim() || null,
    statut: "evangelisé",
    sexe: formData.sexe || null,
    priere_salut: formData.priere_salut === "Oui",
    type_conversion: formData.priere_salut === "Oui" ? formData.type_conversion || null : null,
    besoin: finalBesoins,
    infos_supplementaires: formData.infos_supplementaires || null,
    is_whatsapp: formData.is_whatsapp,
    eglise_id: formData.eglise_id,
    branche_id: formData.branche_id,
  };

  console.log("DATA ENVOYÉE EVANGELISE :", finalData);

  try {
    // 🔹 Insert dans evangelises
    const { data: newEvangelise, error: insertError } = await supabase
      .from("evangelises")
      .insert([finalData])
      .select()
      .single();

    if (insertError) {
      console.error("ERREUR INSERT EVANGELISE :", insertError);
      alert(insertError.message);
      return;
    }

    // 🔹 Préparer le rapport
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    const { data: existingReport, error: reportError } = await supabase
      .from("rapport_evangelisation")
      .select("*")
      .eq("date", today)
      .eq("eglise_id", formData.eglise_id)
      .eq("branche_id", formData.branche_id)
      .single();

    if (reportError && reportError.code !== "PGRST116") {
      console.error("ERREUR RAPPORT :", reportError);
    }

    if (existingReport) {
      await supabase
        .from("rapport_evangelisation")
        .update({
          hommes: existingReport.hommes + (formData.sexe === "Homme" ? 1 : 0),
          femmes: existingReport.femmes + (formData.sexe === "Femme" ? 1 : 0),
          priere: existingReport.priere + (formData.priere_salut === "Oui" ? 1 : 0),
          nouveau_converti: existingReport.nouveau_converti + (formData.type_conversion === "Nouveau converti" ? 1 : 0),
          reconciliation: existingReport.reconciliation + (formData.type_conversion === "Réconciliation" ? 1 : 0),
          })
        .eq("date", today)
        .eq("eglise_id", formData.eglise_id)
        .eq("branche_id", formData.branche_id);
    } else {
      await supabase
        .from("rapport_evangelisation")
        .insert([{
          date: today,
          hommes: formData.sexe === "Homme" ? 1 : 0,
          femmes: formData.sexe === "Femme" ? 1 : 0,
          priere: formData.priere_salut === "Oui" ? 1 : 0,
          nouveau_converti: formData.type_conversion === "Nouveau converti" ? 1 : 0,
          reconciliation: formData.type_conversion === "Réconciliation" ? 1 : 0,          
          eglise_id: formData.eglise_id,
          branche_id: formData.branche_id,
        }]);
    }

    // 🔹 Afficher le message de succès via le composant
    setSuccess(true);

    // 🔹 Reset formulaire (sauf eglise_id et branche_id)
    setFormData((prev) => ({
      nom: "",
      prenom: "",
      telephone: "",
      ville: "",
      statut: "evangelisé",
      sexe: "",
      priere_salut: "",
      type_conversion: "",
      besoin: [],
      infos_supplementaires: "",
      is_whatsapp: false,
      eglise_id: prev.eglise_id,
      branche_id: prev.branche_id,
    }));
    setShowOtherField(false);
    setOtherBesoin("");

  } catch (err) {
    console.error("ERREUR GLOBALE :", err);
    alert(err.message);
  }
};

  const handleCancel = () => {
    setFormData((prev) => ({
      nom: "",
      prenom: "",
      telephone: "",
      ville: "",
      statut: "evangelisé",
      sexe: "",
      priere_salut: "",
      type_conversion: "",
      besoin: [],
      infos_supplementaires: "",
      is_whatsapp: false,
      eglise_id: prev.eglise_id,
      branche_id: prev.branche_id,
    }));
    setShowOtherField(false);
    setOtherBesoin("");
  };

  if (loading) return <p className="text-center mt-10">Vérification du lien...</p>;
  if (errorMsg) return <p className="text-center mt-10 text-red-600">{errorMsg}</p>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-200 via-pink-100 to-yellow-100 p-6">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-lg">
        <div className="flex justify-center mb-6">
          <Image src="/logo.png" alt="SoulTrack Logo" width={80} height={80} />
        </div>

        <h1 className="text-3xl font-bold text-center mb-2">Ajouter une personne évangélisée</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
    
          <input
            className="input"
            type="text"
            placeholder="Prénom"
            value={formData.prenom}
            onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
            required
          />
          <input
            className="input"
            type="text"
            placeholder="Nom"
            value={formData.nom}
            onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
            required
          />
          <input
            className="input"
            type="text"
            placeholder="Téléphone"
            value={formData.telephone}
            onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
          />
          <input
            className="input"
            type="text"
            placeholder="Ville"
            value={formData.ville}
            onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
          />

          <label className="flex items-center gap-2 text-gray-700">
            <input
              type="checkbox"
              checked={formData.is_whatsapp}
              onChange={(e) => setFormData({ ...formData, is_whatsapp: e.target.checked })}
              className="w-5 h-5 accent-indigo-600 cursor-pointer"
            />
            WhatsApp
          </label>

          <select
            className="input"
            value={formData.sexe}
            onChange={(e) => setFormData({ ...formData, sexe: e.target.value })}
            required
          >
            <option value="">Sexe</option>
            <option value="Homme">Homme</option>
            <option value="Femme">Femme</option>
          </select>

          <select
            className="input"
            value={formData.priere_salut}
            required
            onChange={(e) => {
              const value = e.target.value;
              setFormData({
                ...formData,
                priere_salut: value,
                type_conversion: value === "Oui" ? formData.type_conversion : "",
              });
            }}
          >
            <option value="">-- Prière du salut ? --</option>
            <option value="Oui">Oui</option>
            <option value="Non">Non</option>
          </select>

          {formData.priere_salut === "Oui" && (
            <select
              className="input"
              value={formData.type_conversion}
              onChange={(e) => setFormData({ ...formData, type_conversion: e.target.value })}
              required
            >
              <option value="">Type</option>
              <option value="Nouveau converti">Nouveau converti</option>
              <option value="Réconciliation">Réconciliation</option>
            </select>
          )}

          <div className="mt-4">
            <p className="font-semibold mb-2">Difficultés / Besoins :</p>
            {besoinsList.map((b) => (
              <label key={b} className="flex items-center gap-3 mb-2">
                <input
                  type="checkbox"
                  value={b}
                  checked={formData.besoin.includes(b)}
                  onChange={() => handleBesoinChange(b)}
                  className="w-5 h-5 rounded border-gray-400 cursor-pointer accent-indigo-600"
                />
                <span>{b}</span>
              </label>
            ))}

            <label className="flex items-center gap-3 mb-2">
              <input
                type="checkbox"
                checked={showOtherField}
                onChange={() => setShowOtherField(!showOtherField)}
                className="w-5 h-5 rounded border-gray-400 cursor-pointer accent-indigo-600"
              />
              Autre
            </label>

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
            placeholder="Informations supplémentaires..."
            rows={3}
            value={formData.infos_supplementaires}
            onChange={(e) => setFormData({ ...formData, infos_supplementaires: e.target.value })}
            className="input"
          />

          <div className="flex gap-4">
            <button type="button" onClick={handleCancel} className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-bold py-3 rounded-2xl shadow-md transition-all">
              Annuler
            </button>
            <button type="submit" className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:scale-105 text-white font-bold py-3 rounded-2xl shadow-md transition-all">
              Ajouter
            </button>
          </div>
        </form>

        {success && (
          <p className="text-green-600 font-semibold text-center mt-3 animate-bounce">
            ✅ Personne évangélisée ajoutée avec succès !
          </p>
        )}

        <style jsx>{`
          .input {
            width: 100%;
            padding: 12px;
            border-radius: 12px;
            border: 1px solid #ccc;
          }
        `}</style>
      </div>         
    </div>
  );
}
