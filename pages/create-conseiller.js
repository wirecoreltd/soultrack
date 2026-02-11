"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import supabase from "../lib/supabaseClient";
import Image from "next/image";
import ProtectedRoute from "../components/ProtectedRoute";
import Footer from "../components/Footer";

export default function CreateConseillerPage() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur", "ResponsableIntegration"]}>
      <CreateConseiller />
    </ProtectedRoute>
  );
}

function CreateConseiller() {
  const router = useRouter();
  const [members, setMembers] = useState([]);
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [formData, setFormData] = useState({
    prenom: "",
    nom: "",
    telephone: "",
    email: "",
    password: "",
  });
  const [responsableId, setResponsableId] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);


  // ➤ Récupérer l'utilisateur connecté et ses membres disponibles
  useEffect(() => {
    async function fetchUserAndMembers() {
      try {
        // 🔹 Session utilisateur
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) return console.error("Erreur session :", sessionError);
        if (!session?.user) return setMessage("❌ Vous devez être connecté");
        setResponsableId(session.user.id);

        // 🔹 Profil du responsable
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("id, eglise_id, branche_id")
          .eq("id", session.user.id)
          .single();
        if (profileError) return console.error("Erreur profil :", profileError);

        // 🔹 Membres star de la même église/branche
        const { data: membersData, error: membersError } = await supabase
          .from("membres_complets")
          .select("id, prenom, nom, telephone")
          .eq("star", true)
          .eq("eglise_id", profileData.eglise_id)
          .eq("branche_id", profileData.branche_id);
        if (membersError) return console.error("Erreur membres :", membersError);

        // 🔹 Conseillers existants
        const { data: conseillersExistants, error: conseillersError } = await supabase
          .from("profiles")
          .select("prenom, nom, telephone")
          .eq("role", "Conseiller");
        if (conseillersError) return console.error("Erreur conseillers :", conseillersError);

        // 🔹 Créer un Set des conseillers existants (clé unique prenom-nom-telephone)
        const conseillersSet = new Set(
          conseillersExistants.map(c => `${c.prenom.toLowerCase()}-${c.nom.toLowerCase()}-${c.telephone}`)
        );

        // 🔹 Filtrer les membres déjà conseillers
        const membresDisponibles = membersData.filter(m => {
          const key = `${m.prenom.toLowerCase()}-${m.nom.toLowerCase()}-${m.telephone}`;
          return !conseillersSet.has(key);
        });

        setMembers(membresDisponibles || []);
      } catch (err) {
        console.error("Erreur fetchUserAndMembers :", err);
      }
    }

    fetchUserAndMembers();
  }, []);

  // ➤ Remplissage automatique des infos
  useEffect(() => {
    if (!selectedMemberId) {
      setFormData({ ...formData, prenom: "", nom: "", telephone: "" });
      return;
    }
    const member = members.find((m) => m.id === selectedMemberId);
    if (member) {
      setFormData({ ...formData, prenom: member.prenom, nom: member.nom, telephone: member.telephone });
    }
  }, [selectedMemberId]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMemberId || !formData.email || !formData.password) {
      setMessage("❌ Remplissez tous les champs !");
      return;
    }
    setLoading(true);
    setMessage("⏳ Création en cours...");

    try {
      const res = await fetch("/api/create-conseiller", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, responsable_id: responsableId }),
      });

      const data = await res.json().catch(() => null);

      if (res.ok) {
        setMessage("✅ Conseiller créé avec succès !");
        setSelectedMemberId("");
        setFormData({ prenom: "", nom: "", telephone: "", email: "", password: "" });
      } else {
        setMessage(`❌ Erreur: ${data?.error || "Réponse vide du serveur"}`);
      }
    } catch (err) {
      setMessage("❌ " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-br from-purple-200 via-pink-100 to-yellow-200 p-6">
      <div className="bg-white p-8 rounded-3xl shadow-lg w-full max-w-md relative">
        <button onClick={() => router.back()} className="absolute top-4 left-4 text-gray-700 hover:text-gray-900">← Retour</button>
        <div className="flex justify-center mb-6"><Image src="/logo.png" alt="Logo" width={80} height={80} /></div>
        <h1 className="text-3xl font-bold text-center mb-6">Créer un Conseiller</h1>

        <form onSubmit={handleSubmit} className="flex flex-col w-full gap-4">
          <select value={selectedMemberId} onChange={(e) => setSelectedMemberId(e.target.value)} className="input" required>
            <option value="">-- Choisir un Serviteur --</option>
            {members.length > 0 ? (
              members.map((m) => (
                <option key={m.id} value={m.id}>{m.prenom} {m.nom}</option>
              ))
            ) : (
              <option disabled>Aucun serviteur disponible</option>
            )}
          </select>

          <input name="prenom" placeholder="Prénom" value={formData.prenom} readOnly className="input" />
          <input name="nom" placeholder="Nom" value={formData.nom} readOnly className="input" />
          <input name="telephone" placeholder="Téléphone" value={formData.telephone} readOnly className="input" />
          <input name="email" placeholder="Email" value={formData.email} onChange={handleChange} className="input" required />
          <input name="password" placeholder="Mot de passe" type="password" value={formData.password} onChange={handleChange} className="input" required />

          <div className="flex gap-4 mt-4">
            <button type="button" onClick={() => router.push("/")} className="flex-1 bg-gray-400 hover:bg-gray-500 text-white py-3 rounded-2xl">Annuler</button>
            <button type="submit" disabled={loading} className="flex-1 bg-blue-400 hover:bg-blue-500 text-white py-3 rounded-2xl">{loading ? "Création..." : "Créer"}</button>
          </div>
        </form>

        {message && <p className="mt-4 text-center text-sm text-gray-700">{message}</p>}

        <style jsx>{`
          .input { width:100%; border:1px solid #ccc; border-radius:12px; padding:12px; color:black; }
        `}</style>
      </div>
          <Footer />
    </div>
  );
}
