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
    };

    try {
      // Insert évangélisé et récupérer l'objet créé
      const { data: newEvangelise, error: insertError } = await supabase
        .from("evangelises")
        .insert([finalData])
        .select()
        .single();

      if (insertError) throw insertError;

      // Mise à jour rapport du jour
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

      // ⚡️ Ajouter le nouvel évangélisé dans la table affichée
      if (onNewEvangelise) onNewEvangelise(newEvangelise);

      // Reset form
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
      priere_salut: "",
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

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
          <input
            className="input"
            type="text"
            placeholder="Prénom"
            value={formData.prenom}
            onChange={(e) =>
              setFormData({ ...formData, prenom: e.target.value })
            }
            required
          />
          <input
            className="input"
            type="text"
            placeholder="Nom"
            value={formData.nom}
            onChange={(e) =>
              setFormData({ ...formData, nom: e.target.value })
            }
            required
          />
          <input
            className="input"
            type="text"
            placeholder="Téléphone"
            value={formData.telephone}
            onChange={(e) =>
              setFormData({ ...formData, telephone: e.target.value })
            }
          />
          <input
            className="input"
            type="text"
            placeholder="Ville"
            value={formData.ville}
            onChange={(e) =>
              setFormData({ ...formData, ville: e.target.value })
            }
          />

          {/* WhatsApp */}
          <label className="flex items-center gap-2 text-gray-700">
            <input
              type="checkbox"
              checked={formData.is_whatsapp}
              onChange={(e) =>
                setFormData({ ...formData, is_whatsapp: e.target.checked })
              }
              className="w-5 h-5 accent-indigo-600 cursor-pointer"
            />
            WhatsApp
          </label>

          {/* Sexe */}
          <select
            className="input"
            value={formData.sexe}
            onChange={(e) =>
              setFormData({ ...formData, sexe: e.target.value })
            }
            required
          >
            <option value="">Sexe</option>
            <option value="Homme">Homme</option>
            <option value="Femme">Femme</option>
          </select>

          {/* Prière du salut */}
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

          {/* Type de conversion */}
          {formData.priere_salut === "Oui" && (
            <select
              className="input"
              value={formData.type_conversion}
              onChange={(e) =>
                setFormData({ ...formData, type_conversion: e.target.value })
              }
              required
            >
              <option value="">Type</option>
              <option value="Nouveau converti">Nouveau converti</option>
              <option value="Réconciliation">Réconciliation</option>
            </select>
          )}

          {/* Besoins */}
          <div className="mt-4">
            <p className="font-semibold mb-2">Besoins :</p>

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
            onChange={(e) =>
              setFormData({ ...formData, infos_supplementaires: e.target.value })
            }
            className="input"
          />

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
