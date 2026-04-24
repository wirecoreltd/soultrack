"use client";

import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import HeaderPages from "../components/HeaderPages";
import ProtectedRoute from "../components/ProtectedRoute";
import Footer from "../components/Footer";

export default function PresencePage() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur", "ResponsableIntegration", "Conseiller"]}>
      <Presence />
    </ProtectedRoute>
  );
}

function Presence() {
  const [members, setMembers] = useState([]);
  const [presentList, setPresentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const today = selectedDate;

  // 🔥 ABSENTS
  const fetchMembers = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { data: profile } = await supabase
        .from("profiles")
        .select("eglise_id, branche_id")
        .eq("id", user.id)
        .single();

      const { data: presencesToday } = await supabase
        .from("presences")
        .select("membre_id")
        .eq("date", today);

      const presentIds = presencesToday?.map(p => p.membre_id) || [];

      let query = supabase
        .from("membres_complets")
        .select("id, prenom, nom, telephone")
        .eq("eglise_id", profile.eglise_id)
        .eq("branche_id", profile.branche_id);

      if (presentIds.length > 0) {
        query = query.not("id", "in", `(${presentIds.join(",")})`);
      }

      const { data } = await query;
      setMembers(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  // 🔥 PRÉSENTS
  const fetchPresentMembers = async () => {
    try {
      const { data } = await supabase
        .from("presences")
        .select(`
          membre_id,
          membres_complets (prenom, nom)
        `)
        .eq("date", today);

      setPresentList(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAll = async () => {
    setLoading(true);
    await fetchMembers();
    await fetchPresentMembers();
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, [selectedDate]);

  // ✅ MARQUER PRÉSENT
  const markPresent = async (memberId) => {
    try {
      await supabase.from("presences").insert({
        membre_id: memberId,
        date: today,
      });

      fetchAll();
    } catch (err) {
      console.error(err);
    }
  };

  // ❌ REMETTRE ABSENT
  const markAbsent = async (memberId) => {
    try {
      await supabase
        .from("presences")
        .delete()
        .eq("membre_id", memberId)
        .eq("date", today);

      fetchAll();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredMembers = members.filter(
    (m) =>
      m.prenom.toLowerCase().includes(search.toLowerCase()) ||
      m.nom.toLowerCase().includes(search.toLowerCase())
  );

  const filteredPresents = presentList.filter(
    (p) =>
      p.membres_complets?.prenom.toLowerCase().includes(search.toLowerCase()) ||
      p.membres_complets?.nom.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col items-center p-4 sm:p-6" style={{ background: "#333699" }}>
      <HeaderPages />

      {/* HEADER */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold mt-4 text-white">
          📋 Présences
        </h1>

        <div className="flex justify-center mt-4">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 rounded-md text-black"
          />
        </div>
      </div>

      {/* SEARCH */}
      <div className="w-full max-w-4xl flex justify-center mb-6">
        <input
          type="text"
          placeholder="🔍 Rechercher..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-2/3 px-3 py-2 rounded-md border text-black"
        />
      </div>

      {/* PRÉSENTS */}
      <div className="w-full max-w-4xl mb-6">
        <h2 className="text-white font-bold mb-3">
          ✅ Déjà pointés ({presentList.length})
        </h2>

        <div className="grid gap-3">
          {filteredPresents.map((p) => (
            <div
              key={p.membre_id}
              className="bg-white rounded-xl p-4 flex justify-between items-center"
            >
              <span className="font-semibold text-black">
                ✔ {p.membres_complets?.prenom} {p.membres_complets?.nom}
              </span>

              <button
                onClick={() => markAbsent(p.membre_id)}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
              >
                Remettre absent
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ABSENTS */}
      <div className="w-full max-w-4xl">
        <h2 className="text-white font-bold mb-3">
          ⚪ Non pointés ({members.length})
        </h2>

        <div className="grid gap-3">
          {filteredMembers.map((m) => (
            <div
              key={m.id}
              onClick={() => markPresent(m.id)}
              className="bg-white rounded-xl p-4 cursor-pointer hover:bg-green-100 transition"
            >
              <div className="font-bold text-black">
                {m.prenom} {m.nom}
              </div>
              <div className="text-gray-600 text-sm">
                {m.telephone || "—"}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}
