"use client";

import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function ListConseillers() {
  const [conseillers, setConseillers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterResponsable, setFilterResponsable] = useState("");
  const [sortAsc, setSortAsc] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState([]);

  const router = useRouter();

  const fetchConseillers = async () => {
    setLoading(true);
    try {
      // Récupérer tous les conseillers
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, prenom, nom, email, telephone, responsable_id")
        .eq("role", "Conseiller");

      if (profilesError) throw profilesError;

      const conseillersIds = profiles.map((p) => p.id);

      // Récupérer tous les membres assignés
      const { data: membres, error: membresError } = await supabase
        .from("v_membres_full")
        .select("id, prenom, nom, telephone, conseiller_id")
        .in("conseiller_id", conseillersIds);

      if (membresError) throw membresError;

      // Compter contacts par conseiller
      const countMap = {};
      membres?.forEach((m) => {
        if (m.conseiller_id) {
          countMap[m.conseiller_id] = (countMap[m.conseiller_id] || 0) + 1;
        }
      });

      // Récupérer responsables
      const responsablesIds = profiles.map((p) => p.responsable_id).filter(Boolean);
      let responsableMap = {};
      if (responsablesIds.length > 0) {
        const { data: responsables } = await supabase
          .from("profiles")
          .select("id, prenom, nom")
          .in("id", responsablesIds);
        responsables?.forEach((r) => {
          responsableMap[r.id] = `${r.prenom} ${r.nom}`;
        });
      }

      // Fusionner les données
      const list = profiles.map((p) => ({
        ...p,
        responsable_nom: p.responsable_id ? responsableMap[p.responsable_id] || "Aucun" : "Aucun",
        totalContacts: countMap[p.id] || 0,
      }));

      setConseillers(list);
    } catch (err) {
      console.error(err);
      setConseillers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConseillers();
  }, []);

  const filteredList = conseillers
    .filter((c) =>
      c.prenom.toLowerCase().includes(search.toLowerCase()) ||
      c.nom.toLowerCase().includes(search.toLowerCase()) ||
      (c.telephone || "").includes(search)
    )
    .filter((c) =>
      filterResponsable ? c.responsable_nom === filterResponsable : true
    )
    .sort((a, b) =>
      sortAsc
        ? a.responsable_nom.localeCompare(b.responsable_nom)
        : b.responsable_nom.localeCompare(a.responsable_nom)
    );

  const openContacts = async (conseillerId) => {
    const { data: contacts } = await supabase
      .from("v_membres_full")
      .select("id, prenom, nom, telephone, cellule_nom, suivi_responsable, suivi_statut_libelle")
      .eq("conseiller_id", conseillerId);

    setSelectedContacts(contacts || []);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-200 via-pink-100 to-yellow-100 p-6">
      {/* TOP BAR */}
      <div className="w-full max-w-4xl mx-auto mb-6 flex items-center justify-between">
        <button onClick={() => router.back()} className="text-black font-semibold hover:text-gray-700">← Retour</button>
        <h1 className="text-3xl font-bold text-center">Liste des Conseillers</h1>
        <button
          onClick={() => router.push("/create-conseiller")}
          className="px-4 py-2 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600"
        >+ Ajouter</button>
      </div>

      {/* FILTRES / RECHERCHE */}
      <div className="w-full max-w-4xl mx-auto mb-4 flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          placeholder="Recherche par nom/téléphone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded px-2 py-1 flex-1"
        />
        <select
          value={filterResponsable}
          onChange={(e) => setFilterResponsable(e.target.value)}
          className="border rounded px-2 py-1"
        >
          <option value="">-- Filtrer par responsable --</option>
          {[...new Set(conseillers.map((c) => c.responsable_nom))].map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        <button onClick={() => setSortAsc(!sortAsc)} className="px-2 py-1 bg-gray-200 rounded">
          Tri : {sortAsc ? "Asc" : "Desc"}
        </button>
      </div>

      {/* TOTAL */}
      <p className="text-gray-800 mb-4 font-semibold">Total Conseillers : {filteredList.length}</p>

      {/* LISTE */}
      <div className="w-full max-w-4xl mx-auto">
        {loading ? (
          <p className="text-center text-gray-600">Chargement...</p>
        ) : filteredList.length === 0 ? (
          <p className="text-center text-gray-600">Aucun conseiller trouvé.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredList.map((c) => (
              <div key={c.id} className="bg-white p-5 rounded-2xl shadow-md border border-gray-200">
                <h2 className="text-xl font-bold mb-1">{c.prenom} {c.nom}</h2>
                <p className="text-gray-700">📞 {c.telephone || "—"}</p>
                <p className="text-gray-700">✉️ {c.email || "—"}</p>
                <p className="text-gray-700 mt-2">👤 Responsable : <span className="font-semibold">{c.responsable_nom}</span></p>
                <p className="text-gray-800 mt-2 font-semibold">🔔 Contacts assignés : {c.totalContacts}</p>
                <button
                  onClick={() => openContacts(c.id)}
                  className="mt-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Voir les contacts
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL CONTACTS */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl max-w-lg w-full relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-2 right-2 text-gray-600 hover:text-black font-bold"
            >
              ✕
            </button>
            <h3 className="text-lg font-bold mb-4">Contacts assignés</h3>
            {selectedContacts.length === 0 ? (
              <p>Aucun contact.</p>
            ) : (
              <ul className="space-y-2 max-h-64 overflow-y-auto">
                {selectedContacts.map((m) => (
                  <li key={m.id} className="border-b pb-1">
                    {m.prenom} {m.nom} - 📞 {m.telephone || "—"} - 🏠 {m.cellule_nom || "—"} - Statut suivi : {m.suivi_statut_libelle || "—"}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
