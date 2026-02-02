"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import supabase from "../../../lib/supabaseClient";
import HeaderPages from "../../../components/HeaderPages";
import EditMemberCellulePopup from "../../../components/EditMemberCellulePopup";
import MemberDetailsPopup from "../../../components/MemberDetailsPopup";

export default function MembresParCellule() {
  const router = useRouter();
  const { id: celluleId } = router.query; // 🔹 Pages Router

  const [cellule, setCellule] = useState(null);
  const [membres, setMembres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [view, setView] = useState("card");
  const [search, setSearch] = useState("");
  const [editMember, setEditMember] = useState(null);
  const [detailsMember, setDetailsMember] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState({});

  const toBoolean = (val) => val === true || val === "true";

  useEffect(() => {
    if (!celluleId) return;

    const fetchData = async () => {
      setLoading(true);
      setMessage("");

      try {
        // CELLULE
        const { data: celluleData, error: celluleError } = await supabase
          .from("cellules")
          .select("*")
          .eq("id", celluleId)
          .single();

        if (celluleError || !celluleData) throw new Error("Cellule non trouvée");
        setCellule(celluleData);

        // MEMBRES
        const { data: membresData, error: membresError } = await supabase
          .from("membres_complets")
          .select("*")
          .eq("cellule_id", celluleId)
          .eq("statut_suivis", 3)
          .order("created_at", { ascending: false });

        if (membresError) throw membresError;

        if (!membresData || membresData.length === 0) {
          setMessage("Aucun membre intégré dans cette cellule.");
        } else {
          setMembres(membresData);
        }
      } catch (err) {
        console.error(err);
        setMessage("Erreur de chargement.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [celluleId]);

  const handleUpdateMember = (updated) => {
    setMembres(prev =>
      prev.map(m => (m.id === updated.id ? updated : m))
    );
  };

  const filteredMembres = membres.filter(m =>
    !search ||
    m.prenom.toLowerCase().includes(search.toLowerCase()) ||
    m.nom.toLowerCase().includes(search.toLowerCase()) ||
    (m.telephone && m.telephone.includes(search))
  );

  if (loading) return <p className="text-white mt-10 text-center">Chargement...</p>;
  if (message) return <p className="text-white mt-10 text-center">{message}</p>;

  return (
    <div className="min-h-screen p-6 bg-[#333699]">
      <HeaderPages />

      <h1 className="text-white text-2xl font-bold text-center mb-4">
        Membres de la cellule : {cellule?.cellule || "—"}
      </h1>

      {/* Recherche */}
      <div className="w-full max-w-4xl flex justify-center mb-4">
        <input
          type="text"
          placeholder="Recherche..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-2/3 px-3 py-1 rounded-md border text-black focus:outline-none"
        />
      </div>

      {/* Vue carte / table */}
      <div className="w-full max-w-6xl flex justify-center mb-6">
        <button
          onClick={() => setView(view === "card" ? "table" : "card")}
          className="text-sm font-semibold underline text-white"
        >
          {view === "card" ? "Vue Table" : "Vue Carte"}
        </button>
      </div>

      {/* Carte */}
      {view === "card" && (
        <div className="flex justify-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl">
            {filteredMembres.map(m => (
              <div
                key={m.id}
                className="bg-white p-4 rounded-2xl shadow-xl border-l-4"
                style={{ borderLeftColor: m.is_whatsapp ? "#22c55e" : "#3b82f6" }}
              >
                <h2 className="text-center font-bold text-lg">{m.prenom} {m.nom}</h2>
                <p className="text-center text-orange-500 underline font-semibold">{m.telephone || ""}</p>
                <p className="text-center text-sm mt-1">🏙️ {m.ville || ""}</p>
                <p className="text-center text-sm">🏠 {cellule?.cellule || "—"}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Table */}
      {view === "table" && (
        <div className="w-full max-w-6xl overflow-x-auto py-2 mx-auto">
          <div className="min-w-[700px] space-y-2">
            <div className="hidden sm:flex text-sm font-semibold uppercase text-white px-2 py-1 border-b border-gray-400 bg-transparent">
              <div className="flex-[2]">Nom complet</div>
              <div className="flex-[1]">Téléphone</div>
              <div className="flex-[1]">Ville</div>
              <div className="flex-[1] flex justify-center items-center">Cellule</div>
            </div>
            {filteredMembres.map(m => (
              <div
                key={m.id}
                className="flex flex-row items-center px-2 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition duration-150 gap-2 border-l-4"
                style={{ borderLeftColor: m.is_whatsapp ? "#22c55e" : "#3b82f6" }}
              >
                <div className="flex-[2] text-white">{m.prenom} {m.nom}</div>
                <div className="flex-[1] text-white">{m.telephone || "—"}</div>
                <div className="flex-[1] text-white">{m.ville || "—"}</div>
                <div className="flex-[1] text-white flex justify-center items-center">{cellule?.cellule || "—"}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
