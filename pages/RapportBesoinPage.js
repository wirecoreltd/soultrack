"use client";


import { useState } from "react";
import supabase from "../lib/supabaseClient";
import HeaderPages from "../components/HeaderPages";
import Footer from "../components/Footer";
import ProtectedRoute from "../components/ProtectedRoute";

export default function RapportBesoinPage() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur", "ResponsableSuivi"]}>
      <RapportBesoin />
    </ProtectedRoute>
  );
}

function RapportBesoin() {
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [besoinsCount, setBesoinsCount] = useState({});
  const [totalMembres, setTotalMembres] = useState(0);
  const [message, setMessage] = useState("");

  const fetchRapport = async () => {
    setMessage("⏳ Chargement...");
    setBesoinsCount({});
    setTotalMembres(0);

    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("eglise_id, branche_id")
        .eq("id", session.session.user.id)
        .single();

      // 🔹 Total membres valides pour %
      const { data: membres, error: errorMembres } = await supabase
        .from("membres_complets")
        .select("id, etat_contact, sexe, created_at")
        .eq("eglise_id", profile.eglise_id)
        .eq("branche_id", profile.branche_id)
        .gte("created_at", dateDebut || "1900-01-01")
        .lte("created_at", dateFin || "2999-12-31");

      if (errorMembres) throw errorMembres;

      const totalMembresLocal = membres.filter((m) =>
        ["existant", "nouveau"].includes(m.etat_contact?.toLowerCase())
      ).length;
      setTotalMembres(totalMembresLocal);

      // 🔹 Compter besoins avec sexe
      const { data: besoinsData, error: errorBesoins } = await supabase
        .from("stats_ministere_besoin")
        .select("membre_id, valeur, date_action")
        .eq("eglise_id", profile.eglise_id)
        .eq("branche_id", profile.branche_id)
        .eq("type", "besoin")
        .gte("date_action", dateDebut || "1900-01-01")
        .lte("date_action", dateFin || "2999-12-31");

      if (errorBesoins) throw errorBesoins;

      const count = {}; // { besoin: { total: X, hommes: Y, femmes: Z } }

      (besoinsData || []).forEach((r) => {
        if (!r.valeur) return;

        // trouver le membre correspondant pour le sexe
        const membre = membres.find((m) => m.id === r.membre_id);
        const sexe = membre?.sexe?.toLowerCase() === "homme" ? "hommes" : "femmes";

        let besoinsArray = [];
        try {
          if (r.valeur.startsWith("[")) {
            besoinsArray = JSON.parse(r.valeur);
          } else {
            besoinsArray = r.valeur.split(",");
          }
        } catch {
          besoinsArray = r.valeur.split(",");
        }

        besoinsArray.forEach((b) => {
          const clean = b.trim();
          if (!clean) return;
          if (!count[clean]) count[clean] = { total: 0, hommes: 0, femmes: 0 };
          count[clean].total++;
          if (sexe === "hommes") count[clean].hommes++;
          else count[clean].femmes++;
        });
      });

      setBesoinsCount(count);
      setMessage("");
    } catch (err) {
      console.error(err);
      setMessage("❌ " + err.message);
    }
  };

  const labels = Object.keys(besoinsCount);
  const values = Object.values(besoinsCount);

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-[#333699]">
      <HeaderPages />

      
      <h1 className="text-2xl font-bold mt-4 mb-6 text-blue-300 text-center text-white">
        Rapport <span className="text-emerald-300">Difficultés / Besoins</span>
      </h1>  

   <div className="max-w-3xl w-full mb-6 text-center">
        <p className="italic text-base text-white/90">
          Comprenez <span className="text-blue-300 font-semibold">les besoins réels de votre assemblée</span>.
Identifiez les difficultés <span className="text-blue-300 font-semibold">exprimées par les membres</span>, observez les tendances et accompagnez chaque personne avec <span className="text-blue-300 font-semibold">discernement et un suivi adapté à sa situation</span>.
    </p>
      </div>
      

      {/* FILTRES */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 shadow-lg rounded-xl p-4 md:p-6 mt-2 w-full max-w-lg mx-auto flex flex-col text-white">
        <p className="text-base text-red-400 font-semibold text-center mb-4">
          Choisissez les paramètres pour générer le rapport
        </p>
        <div className="flex flex-col w-full">
  <label className="text-center text-base mb-1">Date de Début</label>
  <input
    type="date"
            value={dateDebut}
            onChange={(e) => setDateDebut(e.target.value)}
            className="w-full border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white"
          />
        </div>

        <div className="flex flex-col w-full mt-2">
  <label className="text-center text-base mb-1">Date de Fin</label>
  <input
    type="date"
            type="date"
            value={dateFin}
            onChange={(e) => setDateFin(e.target.value)}
            className="w-full border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white"
          />
        </div>

        <div className="flex flex-col w-full md:w-auto">
          <label className="text-base text-center mb-1 opacity-0">btn</label>
          <button
            onClick={fetchRapport}
            className="w-full md:w-auto h-10 bg-amber-300 text-white font-semibold px-6 rounded-lg hover:bg-amber-400 transition"
          >
            Générer
          </button>
        </div>
      </div>

  <div className="max-w-3xl w-full mb-6 text-center">
        <p className="italic text-base text-white/90">
          Analyse des besoins exprimés par les membres selon la période sélectionnée.  
Les données sont réparties par catégorie avec la répartition Hommes / Femmes et le pourcentage du total des membres.
              </p>
      </div>


  <div className="hidden md:flex w-full overflow-x-auto mt-4 justify-center">
  <div className="w-max">

    {/* HEADER */}
    <div className="flex text-sm font-semibold uppercase text-white px-3 py-2 border-b border-white/20 bg-white/5 rounded-t-lg whitespace-nowrap">
      <div className="w-[220px]">Catégorie</div>
      <div className="w-[100px] text-center">Hommes</div>
      <div className="w-[100px] text-center">Femmes</div>
      <div className="w-[100px] text-center">Total</div>
      <div className="w-[160px] text-center">% Membres</div>
    </div>

    {/* LIGNES */}
    {labels.map((b, i) => {
      const data = values[i];
      const percent =
        totalMembres > 0
          ? ((data.total / totalMembres) * 100).toFixed(1)
          : 0;

      return (
        <div key={b} className="mt-2">

          <div className="flex items-center px-3 py-2 rounded-md bg-white/10 hover:bg-white/20 transition border-l-4 border-amber-300">

            {/* Catégorie */}
            <div className="w-[220px] text-white font-medium">
              {b}
            </div>

            {/* Hommes */}
            <div className="w-[100px] text-center text-white">
              {data.hommes}
            </div>

            {/* Femmes */}
            <div className="w-[100px] text-center text-white">
              {data.femmes}
            </div>

            {/* Total */}
            <div className="w-[100px] text-center text-orange-400 font-semibold">
              {data.total}
            </div>

            {/* % */}
            <div className="w-[160px] text-center text-white font-semibold">
              {percent} %
            </div>

          </div>

        </div>
      );
    })}

  </div>
</div>

       {/* MOBILE */}
<div className="md:hidden w-full mt-6 space-y-2">

  {labels.map((b, i) => {
    const data = values[i];
    const percent =
      totalMembres > 0 ? ((data.total / totalMembres) * 100).toFixed(1) : 0;

    return (
      <div
        key={b}
        className="bg-white/10 rounded-lg px-4 py-3 text-white border-l-4 border-amber-300"
      >

        {/* HEADER MOBILE */}
        <div className="flex justify-between items-center">
          
          {/* catégorie */}
          <div className="font-semibold text-white">
            {b}
          </div>

          {/* H F TOTAL */}
          <div className="flex gap-3 text-sm text-orange-300 whitespace-nowrap">
            <span>H: {data.hommes}</span>
            <span>F: {data.femmes}</span>
            <span className="text-orange-400 font-semibold">
              Total: {data.total}
            </span>
          </div>
        </div>

        {/* % ligne 2 */}
        <div className="mt-1 text-right text-sm text-white/80">
          {percent} % du total membres
        </div>

      </div>
    );
  })}

</div>

      <Footer />
    </div>
  );
}
