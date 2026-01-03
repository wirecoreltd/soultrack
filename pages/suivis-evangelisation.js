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
    priere_salut: "", // ✅ valeur neutre
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

  const besoinsList = [
    "Finances",
    "Santé",
    "Travail",
    "Les Enfants",
    "La Famille",
    "Paix",
  ];

  // 🔐 Vérification du token
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

    const finalData = {
      ...formData,
      besoin: finalBesoins,
      priere_salut: formData.priere_salut === "Oui", // BOOLEAN en DB
    };

    try {
      // 1️⃣ Insert évangélisé
      const { error: insertError } = await supabase
        .from("evangelises")
        .insert([finalData]);

      if (insertError) throw insertError;

      // 2️⃣ Rapport du jour
      const today = new Date().toISOString().slice(0, 10);

      const hommes = formData.sexe === "Homme" ? 1 : 0;
      const femmes = formData.sexe === "Femme" ? 1 : 0;
      const priere = formData.priere_salut === "Oui" ? 1 : 0;
      const nouveau_converti =
        formData.type_conversion === "Nouveau converti" ? 1 : 0;
      const reconciliation =
        formData.type_conversion === "Réconciliation" ? 1 : 0;

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
            nouveau_converti:
              existingReport.nouveau_converti + nouveau_converti,
            reconciliation:
              existingReport.reconciliation + reconciliation,
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

      // ✅ Reset form
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);

      setFormData({
        nom: "",
        prenom: "",
        telephone: "",
        ville: "",
        statut: "evangelisé",
        sexe: "",
        priere_salut: "", // ✅ reset propre
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
      priere_salut: "", // ✅ reset propre
      type_conversion: "",
      besoin: [],
      infos_supplementaires: "",
      is_whatsapp: false,
    });

    setShowOtherField(false);
    setOtherBesoin("");
  };

  if (loading)
    return <p className="text-center mt-10">Vérification du lien...</p>;
  if (errorMsg)
    return <p className="text-center mt-10 text-red-600">{errorMsg}</p>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-200 via-pink-100 to-yellow-100 p-6">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-lg">

        <div className="flex justify-center mb-6">
          <Image src="/logo.png" alt="SoulTrack Logo" width={80} height={80} />
        </div>

        <h1 className="text-3xl font-bold text-center mb-2">
          Ajouter une personne évangélisée
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          <input className="input" placeholder="Prénom" required
            value={formData.prenom}
            onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
          />

          <input className="input" placeholder="Nom" required
            value={formData.nom}
            onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
          />

          <input className="input" placeholder="Téléphone"
            value={formData.telephone}
            onChange={(e) =>
              setFormData({ ...formData, telephone: e.target.value })
            }
          />

          <input className="input" placeholder="Ville"
            value={formData.ville}
            onChange={(e) =>
              setFormData({ ...formData, ville: e.target.value })
            }
          />

          <select className="input" required
            value={formData.sexe}
            onChange={(e) =>
              setFormData({ ...formData, sexe: e.target.value })
            }
          >
            <option value="">Sexe</option>
            <option value="Homme">Homme</option>
            <option value="Femme">Femme</option>
          </select>

          {/* ✅ PRIER DU SALUT */}
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
            <option value="" disabled hidden>
              Prière du salut ?
            </option>
            <option value="Oui">Oui</option>
            <option value="Non">Non</option>
          </select>

          {formData.priere_salut === "Oui" && (
            <select className="input" required
              value={formData.type_conversion}
              onChange={(e) =>
                setFormData({ ...formData, type_conversion: e.target.value })
              }
            >
              <option value="">Type</option>
              <option value="Nouveau converti">Nouveau converti</option>
              <option value="Réconciliation">Réconciliation</option>
            </select>
          )}

          <div className="flex gap-4">
            <button type="button" onClick={handleCancel}
              className="flex-1 bg-gray-400 text-white py-3 rounded-2xl">
              Annuler
            </button>

            <button type="submit"
              className="flex-1 bg-indigo-600 text-white py-3 rounded-2xl">
              Ajouter
            </button>
          </div>
        </form>

        {success && (
          <p className="text-green-600 text-center mt-3">
            ✅ Ajout réussi !
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
