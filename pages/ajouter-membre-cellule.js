"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import supabase from "../lib/supabaseClient";

export default function AjouterMembreCellule() {
  const router = useRouter();
  const [cellules, setCellules] = useState([]);
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    telephone: "",
    ville: "",
    statut: "nouveau",
    venu: "",
    besoin: "",
    cellule_id: "",
    infos_supplementaires: "",
  });

  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchCellules = async () => {
      const userId = localStorage.getItem("userId");
      const { data, error } = await supabase
        .from("cellules")
        .select("id, cellule")
        .eq("responsable_id", userId);

      if (error || !data || data.length === 0) {
        alert("⚠️ Vous n'avez pas encore de cellule assignée. Contactez l'administrateur !");
        return;
      }

      setCellules(data);
      setFormData((prev) => ({ ...prev, cellule_id: data[0].id }));
    };

    fetchCellules();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from("membres").insert([formData]);
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
        besoin: "",
        cellule_id: cellules[0]?.id || "",
        infos_supplementaires: "",
      });
    } catch (err) {
      alert("❌ Impossible d’ajouter le membre : " + err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-indigo-100 to-indigo-50 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-2xl">
        <h1 className="text-3xl font-extrabold text-center text-indigo-700 mb-6">
          Ajouter un membre à votre cellule
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" name="prenom" placeholder="Prénom" value={formData.prenom} onChange={handleChange} required
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"/>
          <input type="text" name="nom" placeholder="Nom" value={formData.nom} onChange={handleChange} required
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"/>
          <input type="text" name="telephone" placeholder="Téléphone" value={formData.telephone} onChange={handleChange} required
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"/>

          <select name="cellule_id" value={formData.cellule_id} onChange={handleChange} required
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400">
            {cellules.map(c => <option key={c.id} value={c.id}>{c.cellule}</option>)}
          </select>

          <select name="statut" value={formData.statut} onChange={handleChange} required
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400">
            <option value="nouveau">Nouveau</option>
            <option value="Integrer">Intégré</option>
            <option value="Venu à l’église">Venu à l’église</option>
            <option value="Visiteur">Visiteur</option>
          </select>

          <textarea name="infos_supplementaires" value={formData.infos_supplementaires} onChange={handleChange} rows={3}
            placeholder="Infos supplémentaires..." className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"></textarea>

          <button type="submit" className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-2xl">Ajouter</button>
        </form>

        {success && <p className="text-green-600 text-center mt-3">✅ Membre ajouté avec succès !</p>}
      </div>
    </div>
  );
}
