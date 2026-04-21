"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/router";
import supabase from "../lib/supabaseClient";
import HeaderPages from "../components/HeaderPages";
import Footer from "../components/Footer";
import ProtectedRoute from "../components/ProtectedRoute";
import EditMemberCellulePopup from "../components/EditMemberCellulePopup";

export default function MembresCellule() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur", "ResponsableCellule", "SuperviseurCellule"]}>
      <MembresCelluleContent />
    </ProtectedRoute>
  );
}

function MembresCelluleContent() {
  const router = useRouter();
  const { memberId, celluleId } = router.query;

  const [membres, setMembres] = useState([]);
  const [cellules, setCellules] = useState([]);
  const [filterCellule, setFilterCellule] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [view, setView] = useState("card");
  const [editMember, setEditMember] = useState(null);  
  const [detailsOpen, setDetailsOpen] = useState({});
  const [openPhoneId, setOpenPhoneId] = useState(null);
  const phoneMenuRef = useRef(null);
  const [showBesoinLibre, setshowBesoinLibre] = useState(false);

  const memberIdStr =
    typeof memberId === "string"
      ? memberId
      : Array.isArray(memberId)
      ? memberId[0]
      : null;

  // ------------------- Helpers -------------------
  const parseJsonArray = (value) => {
    if (!value) return [];
    try {
      const parsed = typeof value === "string" ? JSON.parse(value) : value;
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      return [value];
    }
  };

  const formatMinistere = (ministereJson, autreMinistere) => {
    let list = parseJsonArray(ministereJson).filter((m) => m.toLowerCase() !== "autre");
    if (autreMinistere?.trim()) list.push(autreMinistere.trim());
    return list.join(", ") || "—";
  };

  const formatDateFr = (dateString) => {
    if (!dateString) return "—";
    const d = new Date(dateString);
    const day = d.getDate().toString().padStart(2, "0");
    const months = ["Janv","Févr","Mars","Avr","Mai","Juin","Juil","Août","Sept","Oct","Nov","Déc"];
    return `${day} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  const statutSuiviLabels = {
    1: "En attente",
    2: "En Suivis",
    3: "Intégré",
    4: "Refus",
  };

  const getBorderColor = (member) => {
    switch ((member?.etat_contact || "").toLowerCase().trim()) {
      case "nouveau": return "#fb923c";
      case "existant": return "#4ade80";
      case "inactif": return "#9ca3af";
      default: return "#9ca3af";
    }
  };

  const handleUpdateMember = (updated) => {
    setMembres((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
  };

  // ------------------- FETCH USER + CELLULES -------------------
  useEffect(() => {
  const fetchCellules = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, role, eglise_id, branche_id")
      .eq("id", user.id)
      .single();

    if (!profile) return;

    // ✅ PAS DE FILTRE ICI
    const { data } = await supabase
      .from("cellules")
      .select("*")
      .eq("eglise_id", profile.eglise_id)
      .eq("branche_id", profile.branche_id)
      .order("cellule_full");

    setCellules(data || []);
  };

  fetchCellules();
}, []);

  // ------------------- FETCH MEMBRES -------------------
  useEffect(() => {
    if (memberIdStr) return;

    const fetchAllMembers = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from("membres_complets")
          .select("*")
          .eq("statut_suivis", 3)
          .not("cellule_id", "is", null)
          .order("created_at", { ascending: false });

        if (celluleId) {
          query = query.eq("cellule_id", celluleId);
        }

        const { data, error } = await query;

        if (error) throw error;

        setMembres(data || []);
        if (!data || data.length === 0) setMessage("Aucun membre trouvé");
      } catch (err) {
        console.error(err);
        setMessage("Erreur de chargement");
      } finally {
        setLoading(false);
      }
    };

    fetchAllMembers();
  }, [memberIdStr, celluleId]);

  // ------------------- CLICK OUTSIDE -------------------
  const handleClickOutside = useCallback((e) => {
    if (phoneMenuRef.current && !phoneMenuRef.current.contains(e.target)) {
      setOpenPhoneId(null);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [handleClickOutside]);

  useEffect(() => {
    if (celluleId) setFilterCellule(celluleId);
  }, [celluleId]);

  // ------------------- FILTER -------------------
  const filteredMembres = membres.filter(
    (m) =>
      (!filterCellule || m.cellule_id === filterCellule) &&
      (!search ||
        m.prenom.toLowerCase().includes(search.toLowerCase()) ||
        m.nom.toLowerCase().includes(search.toLowerCase()) ||
        (m.telephone && m.telephone.includes(search)))
  );

  // ------------------- RENDER -------------------
  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: "#333699" }}>
      <HeaderPages />

      <h1 className="text-2xl font-bold mt-4 mb-6 text-blue-300 text-center text-white">
        <span className="text-white">
    {cellules.length > 1 ? "Membres de mes " : "Membres de ma "}
  </span>
  <span className="text-emerald-300">
    {cellules.length > 1 ? "cellules" : "cellule"}
  </span>
      </h1>

<div className="max-w-3xl w-full mb-6 text-center mx-auto">
  <p className="italic text-base text-white/90">
   Consultez et gérez facilement les membres de vos cellules.
   <span className="text-blue-300 font-semibold">Recherchez</span>, filtrez par cellule, <span className="text-blue-300 font-semibold">accédez aux détails complets</span> 
   et mettez à jour les informations pour un <span className="text-blue-300 font-semibold">suivi précis et personnalisé</span>.
  </p>
</div>

      {loading && <div className="text-white text-center mt-10">Chargement...</div>}
      {!loading && message && <div className="text-white text-center mt-10">{message}</div>}

      {!loading && !message && (
        <>
        {/* BOUTON */}
           <div className="flex justify-end mt-4 mb-4 gap-2">
        
              <button
                    onClick={() => router.push("/ajouter-membre-cellule")}
                    className="text-white font-semibold px-4 py-2 rounded shadow text-sm"
                  >
                    ➕ Ajouter un membre
                  </button>    
                      
        <button
              onClick={() => router.push("/admin/import")}
              className="text-white font-semibold px-4 py-2 rounded shadow text-sm"
            >
              📥 Importer une Liste
            </button>          
            
          </div>
          <div className="flex justify-center">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl">

              {filteredMembres.map((m) => {
                const cellule = cellules.find(c => c.id === m.cellule_id);
                const besoins = parseJsonArray(m.besoin).join(", ") || "—";
                const isOpen = detailsOpen[m.id];

                return (
                  <div key={m.id} className="bg-white p-4 rounded-2xl shadow-xl border-l-4"
                    style={{ borderLeftColor: getBorderColor(m) }}>

                    <h2 className="text-center font-bold text-lg">
                      {m.prenom} {m.nom}
                    </h2>

                    <p className="text-center text-sm mt-1">🏙️ {m.ville || ""}</p>

                    <p className="text-center text-sm mt-1">
                      🏠 {cellule?.cellule_full || "—"}
                    </p>

                    <p className="text-center text-sm mt-1">
                      👤 {cellule?.responsable || "—"}
                    </p>

                    <button
                      onClick={() =>
                        setDetailsOpen((prev) => ({
                          ...prev,
                          [m.id]: !prev[m.id],
                        }))
                      }
                      className="text-orange-500 underline mt-2 block mx-auto text-sm"
                    >
                      {isOpen ? "Fermer détails" : "Détails"}
                    </button>

                    {isOpen && (
                      <div className="text-black text-sm mt-2 w-full space-y-1">
                        <p className="font-semibold text-center" style={{ color: "#2E3192" }}>
                          💡 Statut Suivi : {statutSuiviLabels[m.statut_suivis] || m.suivi_statut || ""}
                        </p>
                        <p>📆 Envoyé en suivi : {formatDateFr(m.date_envoi_suivi)}</p>
                        <p>🎗️ Civilité : {m.sexe || ""}</p>
                        <p>⏳ Tranche d'age : {m.age || ""}</p>
                        <p>💬 WhatsApp : {m.is_whatsapp ? "Oui" : "Non"}</p>
                        <p>💧 Baptême d’Eau : {m.bapteme_eau || "—"}</p>
                        {m.bapteme_eau === "Non" && m.veut_se_faire_baptiser === "Oui" && (
                          <p className="ml-6">💦 Veut se faire baptiser</p>
                        )}
                        <p>🔥 Baptême de Feu : {m.bapteme_esprit || "—"}</p>
                        <p>✒️ Formation : {m.Formation || ""}</p>
                        <p>❤️‍🩹 Soin Pastoral : {m.Soin_Pastoral || ""}</p>
                        <p>❓ Difficultés / Besoins : {besoins}</p>  
                        <p>💢 Ministère : {formatMinistere(m.Ministere, m.Autre_Ministere)}</p>
                        <p>📝 Infos : {m.infos_supplementaires || "—"}</p>
                        <p>🧩 Comment est-il venu : {m.venu || ""}</p>                    
                        <p>📝 Commentaire Suivis : {m.commentaire_suivis || ""}</p>

                        <button
                          onClick={() => setEditMember(m)}
                          className="text-blue-600 text-sm mt-2 block mx-auto underline"
                        >
                          ✏️ Modifier le contact
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}

            </div>
          </div>
        </>
      )}

        {editMember && (
  <EditMemberCellulePopup
    member={editMember}
    onClose={() => setEditMember(null)}
    onUpdateMember={(updated) => {
      handleUpdateMember(updated);
      setEditMember(null);
    }}
  />
)}
  
      <Footer />
    </div>
  );
}
