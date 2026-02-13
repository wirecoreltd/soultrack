"use client";

import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import { useRouter } from "next/router";
import EditEvanRapportLine from "../components/EditEvanRapportLine";
import HeaderPages from "../components/HeaderPages";
import Footer from "../components/Footer";

export default function RapportEvangelisation() {
  const router = useRouter();
  const [rapports, setRapports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedRapport, setSelectedRapport] = useState(null);

  const [egliseId, setEgliseId] = useState(null);
  const [brancheId, setBrancheId] = useState(null);

  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [message, setMessage] = useState("");

  // 🔹 Récupérer eglise_id et branche_id du user connecté
  useEffect(() => {
    const fetchProfile = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;
      if (!user) return;

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("eglise_id, branche_id")
        .eq("id", user.id)
        .single();

      if (error) console.error("Erreur récupération profil :", error);
      else {
        setEgliseId(profile.eglise_id);
        setBrancheId(profile.branche_id);
      }
    };
    fetchProfile();
  }, []);

  // 🔹 Fetch rapports avec filtre eglise + branche + date
  const fetchRapports = async () => {
    if (!egliseId || !brancheId) return;

    setLoading(true);

    let query = supabase
      .from("rapport_evangelisation")
      .select("*")
      .eq("eglise_id", egliseId)
      .eq("branche_id", brancheId)
      .order("date", { ascending: true });

    if (dateDebut) query = query.gte("date", dateDebut);
    if (dateFin) query = query.lte("date", dateFin);

    const { data, error } = await query;

    if (error) console.error(error);
    else setRapports(data || []);

    setLoading(false);
  };

  useEffect(() => {
    if (egliseId && brancheId) fetchRapports();
  }, [egliseId, brancheId]);

  const handleSaveRapport = async (updated) => {
    const { error } = await supabase.from("rapport_evangelisation").upsert(updated);

    if (error) console.error("Erreur mise à jour rapport :", error);
    else {
      fetchRapports();
      setMessage("✅ Rapport mis à jour !");
      // Message disparaît après 3 secondes
      setTimeout(() => setMessage(""), 3000);
    }
  };

  if (loading)
    return <p className="text-center mt-10 text-white">Chargement des rapports...</p>;

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-[#333699]">
      <HeaderPages />

      <h1 className="text-2xl font-bold text-white mt-4">Rapport Évangélisation</h1>

      {/* FILTRES */}
        <div className="bg-white/10 p-6 rounded-2xl shadow-lg mt-6 flex justify-center gap-4 flex-wrap text-white">
          <input
            type="date"
            value={dateDebut}
            onChange={(e) => setDateDebut(e.target.value)}
            className="border border-gray-400 rounded-lg px-4 py-2 bg-transparent text-white"
          />
          <input
            type="date"
            value={dateFin}
            onChange={(e) => setDateFin(e.target.value)}
            className="border border-gray-400 rounded-lg px-4 py-2 bg-transparent text-white"
          />
          <button
            onClick={fetchRapports}
            className="
              bg-gradient-to-r from-blue-400 to-indigo-500
              text-white font-semibold
              px-8 py-2
              rounded-xl
              shadow-md
              hover:from-blue-500 hover:to-indigo-600
              transition-all duration-300
            "
          >
            Générer
          </button>
        </div>

      {message && (
        <div className="text-center text-white mt-4 font-medium">{message}</div>
      )}

      {!loading && (
        <div className="w-full max-w-full overflow-x-auto mt-8 flex justify-center">
          <div className="w-max space-y-2">
        
            {/* HEADER */}
            <div className="flex text-sm font-semibold uppercase text-white px-4 py-3 border-b border-white/30 bg-white/5 rounded-t-xl whitespace-nowrap">
              <div className="min-w-[150px]">Date</div>
              <div className="min-w-[120px] text-center">Hommes</div>
              <div className="min-w-[120px] text-center">Femmes</div>
              <div className="min-w-[120px] text-center">Total</div>
              <div className="min-w-[150px] text-center">Prière du Salut</div>
              <div className="min-w-[180px] text-center">Nouveau Converti</div>
              <div className="min-w-[160px] text-center">Réconciliation</div>
              <div className="min-w-[160px] text-center">Moissonneurs</div>
              <div className="min-w-[140px] text-center">Actions</div>
            </div>
        
            {/* LIGNES */}
            {rapports.map((r) => {
              const total =
                (Number(r.hommes) || 0) +
                (Number(r.femmes) || 0);
        
              return (
                <div
                  key={r.id}
                  className="flex items-center px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 transition border-l-4 border-l-blue-500"
                >
                  <div className="min-w-[150px] text-white font-semibold">
                    {new Date(r.date).toLocaleDateString()}
                  </div>
        
                  <div className="min-w-[120px] text-center text-white">
                    {r.hommes ?? "-"}
                  </div>
        
                  <div className="min-w-[120px] text-center text-white">
                    {r.femmes ?? "-"}
                  </div>
        
                  <div className="min-w-[120px] text-center text-white font-bold">
                    {total}
                  </div>
        
                  <div className="min-w-[150px] text-center text-white">
                    {r.priere ?? "-"}
                  </div>
        
                  <div className="min-w-[180px] text-center text-white">
                    {r.nouveau_converti ?? "-"}
                  </div>
        
                  <div className="min-w-[160px] text-center text-white">
                    {r.reconciliation ?? "-"}
                  </div>
        
                  <div className="min-w-[160px] text-center text-white">
                    {r.moissonneurs ?? "-"}
                  </div>
        
                  <div className="min-w-[140px] text-center">
                    <button
                      onClick={() => {
                        setSelectedRapport(r);
                        setEditOpen(true);
                      }}
                      className="text-orange-400 underline hover:text-orange-500 hover:no-underline px-4 py-1 rounded-xl"
                    >
                      Modifier
                    </button>
                  </div>
                </div>
              );
            })}
        
            {/* TOTAL GENERAL (effet blanc horizontal) */}
            <div className="flex items-center px-4 py-3 mt-2 border-t border-white/50 bg-white/10 rounded-b-xl">
              <div className="min-w-[150px] text-white font-bold">TOTAL</div>
        
              <div className="min-w-[120px] text-center text-white font-bold">
                {rapports.reduce((sum, r) => sum + Number(r.hommes || 0), 0)}
              </div>
        
              <div className="min-w-[120px] text-center text-white font-bold">
                {rapports.reduce((sum, r) => sum + Number(r.femmes || 0), 0)}
              </div>
        
              <div className="min-w-[120px] text-center text-white font-bold">
                {rapports.reduce(
                  (sum, r) =>
                    sum + Number(r.hommes || 0) + Number(r.femmes || 0),
                  0
                )}
              </div>
        
              <div className="min-w-[150px]"></div>
              <div className="min-w-[180px]"></div>
              <div className="min-w-[160px]"></div>
              <div className="min-w-[160px]"></div>
              <div className="min-w-[140px]"></div>
            </div>
        
          </div>
        </div>


              {/* LIGNES */}
              {rapports.map((r) => {
                const total = (Number(r.hommes) || 0) + (Number(r.femmes) || 0) + (Number(r.jeunes) || 0);
                return (
                  <div
                    key={r.id}
                    className="flex items-center px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 transition border-l-4 border-l-green-500"
                  >
                    <div className="min-w-[150px] text-white font-semibold">
                      {new Date(r.date).toLocaleDateString()}
                    </div>
                    <div className="min-w-[120px] text-center text-white">{r.hommes ?? "-"}</div>
                    <div className="min-w-[120px] text-center text-white">{r.femmes ?? "-"}</div>
                    <div className="min-w-[120px] text-center text-orange-400 font-semibold">
                      {total}
                    </div>
                    <div className="min-w-[140px] text-center text-white">{r.priere ?? "-"}</div>
                    <div className="min-w-[180px] text-center text-white">{r.nouveau_converti ?? "-"}</div>
                    <div className="min-w-[160px] text-center text-white">{r.reconciliation ?? "-"}</div>
                    <div className="min-w-[160px] text-center text-white">{r.moissonneurs ?? "-"}</div>
                    <div className="min-w-[140px] text-center">
                      <button
                        onClick={() => {
                          setSelectedRapport(r);
                          setEditOpen(true);
                        }}
                        className="text-orange-400 underline hover:text-orange-500 hover:no-underline px-4 py-1 rounded-xl"
                      >
                        Modifier
                      </button>
                    </div>
                  </div>
                );
              })}

              {rapports.length === 0 && (
                <div className="text-white/70 px-4 py-6 text-center">
                  Aucun rapport trouvé
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {selectedRapport && (
        <EditEvanRapportLine
          isOpen={editOpen}
          onClose={() => setEditOpen(false)}
          rapport={selectedRapport}
          onSave={handleSaveRapport}
        />
      )}

      <Footer />
    </div>
  );
}
