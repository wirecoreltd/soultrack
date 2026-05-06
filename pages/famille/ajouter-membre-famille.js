// pages/ajouter-membre-Famille.js

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import supabase from "../../lib/supabaseClient";
import { useMembers } from "../../context/MembersContext";
import ProtectedRoute from "../../components/ProtectedRoute";
import Footer from "../../components/Footer";
import { checkLimiteAtteinte } from "../../lib/checkLimite";

export default function AjouterMembreFamille() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur", "ResponsableFamilles"]}>
      <AjouterMembreFamilleContent />
    </ProtectedRoute>
  );
}

function AjouterMembreFamilleContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAllMembers } = useMembers();

  const urlEgliseId = searchParams.get("eglise_id");
  const urlFamilleId = searchParams.get("famille_id");
  const isFromLink = !!urlEgliseId && !!urlFamilleId;

  const [showBesoinLibre, setShowBesoinLibre] = useState(false);
  const [Familles, setFamilles] = useState([]);
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    sexe: "",
    telephone: "",
    ville: "",
    age: "",
    venu: "",
    priere_salut: "",
    type_conversion: "",
    besoin: [],
    autreBesoin: "",
    Famille_id: urlFamilleId || "",
    infos_supplementaires: "",
    date_venu: new Date().toISOString().slice(0, 10),
    is_whatsapp: false,
  });

  const besoinsOptions = [
    "Finances", "Santé", "Travail / Études", "Famille / Enfants",
    "Relations / Conflits", "Addictions / Dépendances", "Guidance spirituelle",
    "Logement / Sécurité", "Communauté / Isolement", "Dépression / Santé mentale"
  ];

  const [success, setSuccess] = useState(false);

  const [userScope, setUserScope] = useState({
    eglise_id: urlEgliseId || null,
  });

  useEffect(() => {
    if (isFromLink) return;

    const fetchUserScope = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;
      if (!user) return;

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("eglise_id")
        .eq("id", user.id)
        .single();

      if (!error && profile) {
        setUserScope({ eglise_id: profile.eglise_id });
      }
    };

    fetchUserScope();
  }, [isFromLink]);

  useEffect(() => {
    if (!userScope.eglise_id) return;
    if (isFromLink) return;

    const fetchFamilles = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id;

      if (!userId) {
        alert("⚠️ Utilisateur non connecté.");
        return;
      }

      const { data, error } = await supabase
        .from("familles")
        .select("id, ville, famille")
        .eq("responsable_id", userId)
        .eq("eglise_id", userScope.eglise_id);

      if (error || !data || data.length === 0) {
        alert("⚠️ Aucune Famille trouvée pour votre église.");
        return;
      }

      setFamilles(data);
      if (data.length === 1) {
        setFormData((prev) => ({ ...prev, famille_id: data[0].id }));
      }
    };

    fetchFamilles();
  }, [userScope, isFromLink]);

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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userScope.eglise_id) {
      alert("❌ Église non identifiée.");
      return;
    }

    try {
      const { atteinte, count, limite } = await checkLimiteAtteinte(userScope.eglise_id);
      if (atteinte) {
        alert(`❌ Limite atteinte : ${count}/${limite} membres. Upgradez votre plan.`);
        return;
      }

      const newMemberData = {
        nom: formData.nom,
        prenom: formData.prenom,
        telephone: formData.telephone,
        ville: formData.ville,
        venu: formData.venu,
        famille_id: formData.famille_id,
        eglise_id: userScope.eglise_id,
        statut_suivis: 3,
        etat_contact: "existant",
        is_new_in_cellule: "true", // ✅ AJOUT : déclenche les notifications Admin + SuperviseurCellule
        is_whatsapp: formData.is_whatsapp,
        infos_supplementaires: formData.infos_supplementaires,
        besoin: formData.besoin.join(", "),
        autrebesoin: formData.autreBesoin || null,
        sexe: formData.sexe || null,
        age: formData.age || null,
        date_venu: formData.date_venu || null,
        bapteme_eau: false,
        bapteme_esprit: false,
        statut_initial: formData.statut_initial || null,
        priere_salut: formData.priere_salut || null,
        type_conversion: formData.type_conversion || null,
      };

      const { data: newMember, error } = await supabase
        .from("membres_complets")
        .insert([newMemberData])
        .select()
        .single();

      if (error) throw error;

      setAllMembers((prev) => [...prev, newMember]);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);

      setFormData({
        nom: "",
        prenom: "",
        sexe: "",
        age: "",
        telephone: "",
        ville: "",
        venu: "",
        priere_salut: "",
        type_conversion: "",
        date_venu: new Date().toISOString().slice(0, 10),
        besoin: [],
        autreBesoin: "",
        famille_id: urlFamilleId || (Familles.length === 1 ? Familles[0].id : ""),
        infos_supplementaires: "",
        is_whatsapp: false,
      });

    } catch (err) {
      alert("❌ Impossible d'ajouter le membre : " + err.message);
    }
  };

  const handleCancel = () => {
    setFormData({
      nom: "",
      prenom: "",
      sexe: "",
      telephone: "",
      ville: "",
      age: "",
      venu: "",
      priere_salut: "",
      type_conversion: "",
      date_venu: new Date().toISOString().slice(0, 10),
      besoin: [],
      autreBesoin: "",
      famille_id: urlFamilleId || (Familles.length === 1 ? Familles[0].id : ""),
      infos_supplementaires: "",
      is_whatsapp: false,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-200 via-pink-100 to-yellow-100 p-6">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-lg relative">

        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 font-semibold"
        >
          ← Retour
        </button>

        <div className="flex justify-center mb-6">
          <img
            src="/logo.png"
            alt="Logo SoulTrack"
            className="w-20 h-auto cursor-pointer hover:opacity-80 transition"
            onClick={() => router.push("/index")}
          />
        </div>

        <h1 className="text-2xl font-bold mt-4 mb-6 text-center text-black">
          Ajouter un membre<br />à ma <span className="text-[#333699]">Famille</span>
        </h1>

        <div className="max-w-3xl w-full mb-6 text-center">
          <p className="italic text-base text-black/90">
            <span className="text-[#FFB07C] font-semibold">Ajoutez</span> facilement un membre à{" "}
            <span className="text-[#FFB07C] font-semibold">votre Famille</span>. Renseignez ses informations, ses
            <span className="text-[#FFB07C] font-semibold"> besoins et son parcours spirituel</span>, puis associez-le à une Famille
            pour assurer{" "}
            <span className="text-[#FFB07C] font-semibold">un suivi structuré et personnalisé</span>.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {!isFromLink && Familles.length > 1 && (
            <select
              name="famille_id"
              value={formData.famille_id}
              onChange={handleChange}
              className="input"
              required
            >
              <option value="">-- Choisir une Famille --</option>
              {Familles.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.ville} - {c.famille}
                </option>
              ))}
            </select>
          )}

          <input
            type="date"
            value={formData.date_venu}
            onChange={e => setFormData({ ...formData, date_venu: e.target.value })}
            className="input"
            required
          />

          <input name="prenom" placeholder="Prénom" value={formData.prenom} onChange={handleChange} className="input" required />
          <input name="nom" placeholder="Nom" value={formData.nom} onChange={handleChange} className="input" required />

          <select className="input" value={formData.sexe} onChange={(e) => setFormData({ ...formData, sexe: e.target.value })} required>
            <option value="">-- Civilité --</option>
            <option value="Homme">Homme</option>
            <option value="Femme">Femme</option>
          </select>

          <select
            value={formData.age}
            onChange={e => setFormData({ ...formData, age: e.target.value })}
            className="input"
            required
          >
            <option value="">-- Tranche d'âge --</option>
            {["12-17 ans", "18-25 ans", "26-30 ans", "31-40 ans", "41-55 ans", "56-69 ans", "70 ans et plus"].map(v => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>

          <input name="telephone" placeholder="Téléphone" value={formData.telephone} onChange={handleChange} className="input" />
          <label className="flex items-center gap-2">
            <input type="checkbox" name="is_whatsapp" checked={formData.is_whatsapp} onChange={handleChange} />
            WhatsApp
          </label>

          <input name="ville" placeholder="Ville" value={formData.ville} onChange={handleChange} className="input" />

          <select name="venu" value={formData.venu} onChange={handleChange} className="input">
            <option value="">-- Comment est-il venu ? --</option>
            <option value="invité">Invité</option>
            <option value="réseaux">Réseaux</option>
            <option value="evangélisation">Evangélisation</option>
            <option value="autre">Autre</option>
          </select>

          <select
            className="input"
            value={formData.priere_salut || ""}
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
              value={formData.type_conversion || ""}
              onChange={(e) => setFormData({ ...formData, type_conversion: e.target.value })}
              required
            >
              <option value="">Type</option>
              <option value="Nouveau converti">Nouveau converti</option>
              <option value="Réconciliation">Réconciliation</option>
            </select>
          )}

          <label className="text-sm sm:text-base font-bold mb-1">Difficultés / Besoins</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {besoinsOptions.map((item) => (
              <label key={item} className="flex items-center gap-1 text-sm">
                <input
                  type="checkbox"
                  value={item}
                  checked={formData.besoin.includes(item)}
                  onChange={handleBesoinChange}
                  className="w-4 h-4 sm:w-5 sm:h-5"
                />
                {item}
              </label>
            ))}
            <label className="flex items-center gap-1 text-sm">
              <input
                type="checkbox"
                value="Autre"
                checked={showBesoinLibre}
                onChange={handleBesoinChange}
                className="w-4 h-4 sm:w-5 sm:h-5"
              />
              Autre
            </label>
          </div>

          {showBesoinLibre && (
            <input
              type="text"
              placeholder="Précisez..."
              value={formData.besoinLibre}
              onChange={(e) => setFormData({ ...formData, besoinLibre: e.target.value })}
              className="input mb-2"
            />
          )}

          <textarea
            name="infos_supplementaires"
            placeholder="Informations supplémentaires..."
            value={formData.infos_supplementaires}
            onChange={handleChange}
            className="input"
          />

          <div className="flex gap-4 mt-4">
            <button type="button" onClick={handleCancel} className="flex-1 bg-gray-400 text-white py-3 rounded-xl">
              Annuler
            </button>
            <button type="submit" className="flex-1 bg-blue-500 text-white py-3 rounded-xl">
              Ajouter
            </button>
          </div>
        </form>

        {success && (
          <p className="mt-4 text-center text-green-600 font-semibold">
            ✅ Membre ajouté avec succès
          </p>
        )}

        <style jsx>{`
          .input {
            width: 100%;
            border: 1px solid #ccc;
            border-radius: 12px;
            padding: 12px;
          }
        `}</style>
      </div>
    </div>
  );
}
