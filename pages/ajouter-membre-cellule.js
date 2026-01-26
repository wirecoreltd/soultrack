// pages/ajouter-membre-cellule.js
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import supabase from "../lib/supabaseClient";
import Image from "next/image";
import { useMembers } from "../context/MembersContext";

export default function AjouterMembreCellule() {
  const router = useRouter();
  const { setAllMembers } = useMembers();

  const [cellules, setCellules] = useState([]);
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    sexe: "",
    telephone: "",
    ville: "",
    venu: "",
    priere_salut: "",
    type_conversion: "",
    besoin: [],
    autreBesoin: "",
    cellule_id: "", // ✅ TOUJOURS vide par défaut
    infos_supplementaires: "",
    is_whatsapp: false,
  });

  const [success, setSuccess] = useState(false);

  // ================== FETCH CELLULES ==================
  useEffect(() => {
    const fetchCellules = async () => {
      const userId = localStorage.getItem("userId");

      const { data, error } = await supabase
        .from("cellules")
        .select("id, ville, cellule")
        .eq("responsable_id", userId);

      if (error || !data || data.length === 0) {
        alert("⚠️ Vous n'avez pas encore de cellule assignée. Contactez l'administrateur !");
        return;
      }

      setCellules(data);

      // ✅ SÉLECTION AUTO UNIQUEMENT SI 1 CELLULE
      if (data.length === 1) {
        setFormData((prev) => ({
          ...prev,
          cellule_id: data[0].id,
        }));
      }
      // ❌ SI PLUSIEURS → ON NE FAIT RIEN
    };

    fetchCellules();
  }, []);

  // ================== HANDLERS ==================
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // ================== SUBMIT ==================
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const newMemberData = {
        nom: formData.nom,
        prenom: formData.prenom,
        sexe: formData.sexe,
        telephone: formData.telephone,
        ville: formData.ville,
        venu: formData.venu,
        cellule_id: formData.cellule_id,
        statut_suivis: 3,
        is_whatsapp: formData.is_whatsapp,
        priere_salut: formData.priere_salut,
        type_conversion: formData.type_conversion || null,
        infos_supplementaires: formData.infos_supplementaires,
        besoin: formData.besoin.join(", "),
        autrebesoin: formData.autreBesoin || null,
        etat_contact: "Existant",
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

      // ✅ RESET PROPRE
      setFormData({
        nom: "",
        prenom: "",
        sexe: "",
        telephone: "",
        ville: "",
        venu: "",
        priere_salut: "",
        type_conversion: "",
        besoin: [],
        autreBesoin: "",
        cellule_id: cellules.length === 1 ? cellules[0].id : "",
        infos_supplementaires: "",
        is_whatsapp: false,
      });
    } catch (err) {
      alert("❌ Impossible d’ajouter le membre : " + err.message);
    }
  };

  const handleCancel = () => {
    setFormData({
      nom: "",
      prenom: "",
      sexe: "",
      telephone: "",
      ville: "",
      venu: "",
      priere_salut: "",
      type_conversion: "",
      besoin: [],
      autreBesoin: "",
      cellule_id: cellules.length === 1 ? cellules[0].id : "",
      infos_supplementaires: "",
      is_whatsapp: false,
    });
  };

  // ================== RENDER ==================
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
          <Image src="/logo.png" alt="SoulTrack Logo" width={80} height={80} />
        </div>

        <h1 className="text-3xl font-bold text-center mb-6">
          Ajouter un membre à ma cellule
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {/* ✅ MENU DÉROULANT : PAR DÉFAUT "-- Choisir une cellule --" */}
          {cellules.length > 1 && (
            <select
              name="cellule_id"
              value={formData.cellule_id}
              onChange={handleChange}
              className="input"
              required
            >
              <option value="">-- Choisir une cellule --</option>
              {cellules.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.ville} - {c.cellule}
                </option>
              ))}
            </select>
          )}

          <input name="prenom" placeholder="Prénom" value={formData.prenom} onChange={handleChange} className="input" required />
          <input name="nom" placeholder="Nom" value={formData.nom} onChange={handleChange} className="input" required />

          <select
            className="input"
            value={formData.sexe}
            onChange={(e) => setFormData({ ...formData, sexe: e.target.value })}
            required
          >
            <option value="">-- Sexe --</option>
            <option value="Homme">Homme</option>
            <option value="Femme">Femme</option>
          </select>

          <input name="telephone" placeholder="Téléphone" value={formData.telephone} onChange={handleChange} className="input" />

          <label className="flex items-center gap-2">
            <input type="checkbox" name="is_whatsapp" checked={formData.is_whatsapp} onChange={handleChange} />
            WhatsApp
          </label>

          <input name="ville" placeholder="Ville" value={formData.ville} onChange={handleChange} className="input" />

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
