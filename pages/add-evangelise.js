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
    eglise_id: null, // ✅ sera rempli automatiquement
  });

  const [showOtherField, setShowOtherField] = useState(false);
  const [otherBesoin, setOtherBesoin] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const besoinsList = ["Finances", "Santé", "Travail", "Les Enfants", "La Famille", "Paix"];

  // 🔹 Récupérer eglise_id de l'utilisateur connecté
  useEffect(() => {
    const fetchUserEglise = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error || !data?.session?.user) return;

      const userId = data.session.user.id;

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("eglise_id")
        .eq("id", userId)
        .single();

      if (!profileError && profile?.eglise_id) {
        setFormData(prev => ({ ...prev, eglise_id: profile.eglise_id }));
      }
      setLoading(false);
    };

    fetchUserEglise();
  }, []);

  // 🔹 Vérification du token
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
      }
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

    if (!formData.eglise_id) {
      alert("Impossible d'ajouter : église non trouvée.");
      return;
    }

    const finalBesoins = [...formData.besoin];
    if (showOtherField && otherBesoin.trim()) finalBesoins.push(otherBesoin.trim());

    const finalData = {
      nom: formData.nom.trim(),
      prenom: formData.prenom.trim(),
      telephone: formData.telephone.trim() || null,
      ville: formData.ville.trim() || null,
      statut: "evangelisé",
      sexe: formData.sexe || null,
      priere_salut: formData.priere_salut === "Oui",
      type_conversion: formData.priere_salut === "Oui" ? formData.type_conversion || null : null,
      besoin: finalBesoins,
      infos_supplementaires: formData.infos_supplementaires || null,
      is_whatsapp: formData.is_whatsapp,
      eglise_id: formData.eglise_id,
    };

    try {
      const { data: newEvangelise, error: insertError } = await supabase
        .from("evangelises")
        .insert([finalData])
        .select()
        .single();

      if (insertError) throw insertError;

      // ⚡️ Mise à jour rapport du jour
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
          { date: today, hommes, femmes, priere, nouveau_converti, reconciliation },
        ]);
      }

      if (onNewEvangelise) onNewEvangelise(newEvangelise);

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);

      setFormData({
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
        eglise_id: formData.eglise_id, // on garde l'id
      });
      setShowOtherField(false);
      setOtherBesoin("");
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCancel = () => {
    setFormData(prev => ({
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

        <h1 className="text-3xl font-bold text-center mb-2">
          Ajouter une personne évangélisée
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
          {/* ... tous les inputs et selects identiques ... */}

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
              disabled={!formData.eglise_id}
              className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:scale-105 text-white font-bold py-3 rounded-2xl shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
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
