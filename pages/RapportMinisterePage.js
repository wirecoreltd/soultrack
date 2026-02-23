"use client";

import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import HeaderPages from "../components/HeaderPages";
import Footer from "../components/Footer";
import ProtectedRoute from "../components/ProtectedRoute";

export default function RapportMinisterePage() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur", "ResponsableIntegration"]}>
      <RapportMinistere />
    </ProtectedRoute>
  );
}

function RapportMinistere() {
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [rapports, setRapports] = useState([]);
  const [egliseId, setEgliseId] = useState(null);
  const [brancheId, setBrancheId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [totalServiteurs, setTotalServiteurs] = useState(0);
  const [totalMembres, setTotalMembres] = useState(0);
  const [message, setMessage] = useState("");

  // 🔹 Charger profil utilisateur
  useEffect(() => {
    const fetchUser = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;
      if (!user) return;

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("eglise_id, branche_id")
        .eq("id", user.id)
        .single();

      if (!error && profile) {
        setEgliseId(profile.eglise_id);
        setBrancheId(profile.branche_id);
      }
    };

    fetchUser();
  }, []);

  // 🔹 Générer rapport
  const fetchRapport = async () => {
  setLoading(true);
  setRapports([]);
  setTotalServiteurs(0);
  setTotalMembres(0);
  setMessage("⏳ Chargement...");

  if (!egliseId || !brancheId) {
    setMessage("❌ ID de l'église ou branche manquant");
    setLoading(false);
    return;
  }

  try {
    let query = supabase
      .from("membres_complets")
      .select("id, Ministere, star, etat_contact, created_at, besoin")
      .eq("eglise_id", egliseId)
      .eq("branche_id", brancheId);

    if (dateDebut) query = query.gte("created_at", dateDebut);
    if (dateFin) query = query.lte("created_at", dateFin);

    const { data, error } = await query;
    if (error) throw error;

    let counts = {};
    let totalServiteursLocal = 0;
    let totalMembresLocal = 0;

    // 🔹 Préparer les logs
    let logsToInsert = [];

    data.forEach((membre) => {
      const etat = membre.etat_contact?.toString().trim().toLowerCase();
      const etatOk = ["existant", "nouveau"].includes(etat);

      const isServiteur =
        membre.star === true ||
        membre.star?.toString().trim().toLowerCase() === "true" ||
        membre.star?.toString().trim().toLowerCase() === "oui";

      if (etatOk) totalMembresLocal++;

      // 🔹 Log serviteur
      if (etatOk && isServiteur) {
        totalServiteursLocal++;
        logsToInsert.push({
          membre_id: membre.id,
          eglise_id: egliseId,
          branche_id: brancheId,
          type: "serviteur",
          valeur: null, // pas de valeur particulière, juste le nombre
          date_action: new Date().toISOString().split("T")[0],
        });
      }

      // 🔹 Compter les ministères
      if (etatOk && membre.Ministere) {
        let ministeres = [];
        try {
          if (typeof membre.Ministere === "string") {
            if (membre.Ministere.startsWith("[")) {
              ministeres = JSON.parse(membre.Ministere);
            } else {
              ministeres = membre.Ministere
                .split(",")
                .map((m) => m.trim());
            }
          } else if (Array.isArray(membre.Ministere)) {
            ministeres = membre.Ministere;
          }
        } catch {
          ministeres = membre.Ministere
            .split(",")
            .map((m) => m.trim());
        }

        ministeres.forEach((min) => {
          if (!min) return;
          if (!counts[min]) counts[min] = 0;
          counts[min]++;
          // 🔹 Log ministère
          logsToInsert.push({
            membre_id: membre.id,
            eglise_id: egliseId,
            branche_id: brancheId,
            type: "ministere",
            valeur: min,
            date_action: new Date().toISOString().split("T")[0],
          });
        });
      }

      // 🔹 Log besoins si besoin (optionnel)
      if (etatOk && membre.besoin) {
        let besoins = [];
        try {
          if (typeof membre.besoin === "string") {
            if (membre.besoin.startsWith("[")) {
              besoins = JSON.parse(membre.besoin);
            } else {
              besoins = membre.besoin.split(",").map((b) => b.trim());
            }
          } else if (Array.isArray(membre.besoin)) {
            besoins = membre.besoin;
          }
        } catch {
          besoins = [];
        }

        besoins.forEach((b) => {
          if (!b) return;
          logsToInsert.push({
            membre_id: membre.id,
            eglise_id: egliseId,
            branche_id: brancheId,
            type: "besoin",
            valeur: b,
            date_action: new Date().toISOString().split("T")[0],
          });
        });
      }
    });

    // 🔹 Insérer les logs dans la table
    if (logsToInsert.length > 0) {
      const { error: insertError } = await supabase
        .from("stats_ministere_besoin")
        .insert(logsToInsert);

      if (insertError) console.error("Erreur insertion logs:", insertError);
    }

    setRapports(
      Object.entries(counts).map(([nom, total]) => ({
        ministere: nom,
        total,
      }))
    );

    setTotalServiteurs(totalServiteursLocal);
    setTotalMembres(totalMembresLocal);
    setMessage("");
  } catch (err) {
    console.error(err);
    setMessage("❌ " + err.message);
  }

  setLoading(false);
};


  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-[#333699]">
      <HeaderPages />

      <h1 className="text-2xl font-bold text-white mt-4 mb-6 text-center">
        Rapport Ministère
      </h1>

      {/* 🔹 Filtres */}
      <div className="bg-white/10 p-6 rounded-2xl shadow-lg mt-6 flex justify-center gap-4 flex-wrap text-white">
        <input
          type="date"
          value={dateDebut}
          onChange={(e) => setDateDebut(e.target.value)}
          className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white"
        />
        <input
          type="date"
          value={dateFin}
          onChange={(e) => setDateFin(e.target.value)}
          className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white"
        />
        <button
          onClick={fetchRapport}
          className="bg-[#2a2f85] px-6 py-2 rounded-xl hover:bg-[#1f2366]"
        >
          Générer
        </button>
      </div>

      {/* 🔹 Résumé */}
      {totalMembres > 0 && (
        <div className="flex gap-4 mt-6 flex-wrap justify-center">
          <div className="bg-white/10 px-6 py-4 rounded-2xl text-white text-center min-w-[220px]">
            <div className="text-sm uppercase font-semibold mb-1">
              Nombre de serviteurs
            </div>
            <div className="text-2xl font-bold text-orange-400">
              {totalServiteurs}
            </div>
          </div>

          <div className="bg-white/10 px-6 py-4 rounded-2xl text-white text-center min-w-[220px]">
            <div className="text-sm uppercase font-semibold mb-1">
              % de serviteurs / total
            </div>
            <div className="text-2xl font-bold text-orange-400">
              {totalMembres > 0
                ? ((totalServiteurs / totalMembres) * 100).toFixed(1)
                : 0}{" "}
              %
            </div>
          </div>
        </div>
      )}

      {/* 🔹 Tableau */}
      <div className="w-full flex justify-center mt-6 mb-6">
        <div className="w-max overflow-x-auto space-y-2">
          <div className="flex text-sm font-semibold uppercase text-white px-4 py-3 border-b border-white/30 bg-white/5 rounded-t-xl whitespace-nowrap">
            <div className="min-w-[250px]">Ministère</div>
            <div className="min-w-[150px] text-center text-orange-400">
              Nombre de serviteurs
            </div>
          </div>

          {loading && (
            <div className="text-white text-center py-4">Chargement...</div>
          )}

          {rapports.map((r, index) => (
            <div
              key={index}
              className="flex items-center px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 transition border-l-4 border-l-blue-500"
            >
              <div className="min-w-[250px] text-white font-semibold">
                {r.ministere}
              </div>
              <div className="min-w-[150px] text-center text-orange-400 font-bold">
                {r.total}
              </div>
            </div>
          ))}
        </div>
      </div>

      {message && <p className="text-white text-center">{message}</p>}

      <Footer />
    </div>
  );
}
