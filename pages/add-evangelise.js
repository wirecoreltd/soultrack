"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import supabase from "../lib/supabaseClient";

export default function AddEvangelise() {
  const router = useRouter();
  const { token } = router.query;

  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    telephone: "",
    ville: "",
    statut: "evangelisé",
    sexe: "",
    priere_salut: "Non",
    type_conversion: "",
    besoin: [],
    infos_supplementaires: "",
    is_whatsapp: false,
  });

  const [showOtherField, setShowOtherField] = useState(false);
  const [otherBesoin, setOtherBesoin] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const besoinsList = ["Finances", "Santé", "Travail", "Les Enfants", "La Famille", "Paix"];

  // Vérification du token
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
        setLoading(false);
      }
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

    const finalBesoins = [...formData.besoin];
    if (showOtherField && otherBesoin.trim()) finalBesoins.push(otherBesoin.trim());

    // ✅ CORRECTION : Conversion du champ "priere_salut" en boolean
    const finalData = {
      ...formData,
      besoin: finalBesoins,
      priere_salut: formData.priere_salut === "Oui", // <-- Correct
    };

    try {
      // 1️⃣ Ajouter l'évangélisé
      const { error: insertError } = await supabase.from("evangelises").insert([finalData]);
      if (insertError) throw insertError;

      // 2️⃣ Mettre à jour le rapport du jour
      const today = new Date().toISOString().slice(0, 10);

      const hommes = formData.sexe === "Homme" ? 1 : 0;
      const femmes = formData.sexe === "Femme" ? 1 : 0;
      const priere = formData.priere_salut === "Oui" ? 1 : 0;
      const nouveau_converti = formData.type_conversion === "Nouveau converti" ? 1 : 0;
      const reconciliation = formData.type_conversion === "Réconciliation" ? 1 : 0;

      const { data: existingReport, error: fetchError } = await supabase
        .from("rapport_evangelisation")
        .select("*")
        .eq("date", today)
        .single();

      if (fetchError && fetchError.code !== "PGRST116") throw fetchError;

      if (existingReport) {
        await supabase
          .from("rapport_evangelisation")
          .update({
            hommes: existingReport.hommes + hommes,
            femmes: existingReport.femmes + femmes,
            priere: existingReport.priere + priere,
            nouveau_converti: existingReport.nouveau_converti + nouveau_converti,
            reconciliation: existingReport.reconciliation + reconciliation,
          })
          .eq("date", today);
      } else {
        await supabase.from("rapport_evangelisation").insert([
          {
            date: today,
            hommes,
            femmes,
            priere,
            nouveau_converti,
            reconciliation,
          },
        ]);
      }

      // Reset
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);

      setFormData({
        nom: "",
        prenom: "",
        telephone: "",
        ville: "",
        statut: "evangelisé",
        sexe: "",
        priere_salut: "Non",
        type_conversion: "",
        besoin: [],
        infos_supplementaires: "",
        is_whatsapp: false,
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
      sexe: "",
      priere_salut: "Non",
      type_conversion: "",
      besoin: [],
      infos_supplementaires: "",
      is_whatsapp: false,
    });
    setShowOtherField(false);
    setOtherBesoin("");
  };

  if (loading) return <p className="text-center mt-10">Vérification du lien...</p>;
  if (errorMsg) return <p className="text-center mt-10 text-red-600">{errorMsg}</p>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-200 via-pink-100 to-yellow-100 p-6">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-lg relative">

        <button onClick={() => router.back()} className="absolute top-4 left-4 text-black hover:text-gray-800 transition">
          ← Retour
        </button>

        <div className="flex justify-center mb-6">
          <Image src="/logo.png" alt="SoulTrack Logo" width={80} height={80} />
        </div>

        <h1 className="text-3xl font-bold text-center mb-2">Ajouter une personne évangélisée</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
          
          {/* ... (tout le reste du formulaire reste inchangé) ... */}

        </form>

        {success && <p className="text-green-600 font-semibold text-center mt-3 animate-bounce">✅ Personne évangélisée ajoutée !</p>}

      </div>
    </div>
  );
}
