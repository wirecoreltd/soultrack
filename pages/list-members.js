"use client";

/**
 * Page: Liste des Membres
 * Description: Affiche les membres sous forme de carte ou tableau avec filtres et envoi WhatsApp.
 */

import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import Image from "next/image";
import BoutonEnvoyer from "../components/BoutonEnvoyer";
import LogoutLink from "../components/LogoutLink";
import DetailsPopup from "../components/DetailsPopup";
import EditMemberPopup from "../components/EditMemberPopup";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useSearchParams } from "next/navigation";

export default function ListMembers() {
  const [members, setMembers] = useState([]);
  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");
  const [detailsOpen, setDetailsOpen] = useState({});
  const [cellules, setCellules] = useState([]);
  const [conseillers, setConseillers] = useState([]);
  const [view, setView] = useState("card");
  const [popupMember, setPopupMember] = useState(null);
  const [editMember, setEditMember] = useState(null);
  const [session, setSession] = useState(null);
  const [prenom, setPrenom] = useState("");
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const conseillerIdFromUrl = searchParams.get("conseiller_id");

  const [selectedTargets, setSelectedTargets] = useState({});
  const [selectedTargetType, setSelectedTargetType] = useState({});
  const [statusChanges, setStatusChanges] = useState({});

  const [toastMessage, setToastMessage] = useState("");
  const [showingToast, setShowingToast] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setShowingToast(true);
    setTimeout(() => setShowingToast(false), 3500);
  };

  const statutLabels = {
    1: "En cours",
    2: "En attente",
    3: "Intégrer",
    4: "Refus"
  };

  // -------------------- FETCH --------------------
  const fetchMembers = async (profile = null) => {
    setLoading(true);
    try {
      let query = supabase.from("v_membres_full").select("*").order("created_at", { ascending: false });

      if (conseillerIdFromUrl) query = query.eq("conseiller_id", conseillerIdFromUrl);
      else if (profile?.role === "Conseiller") query = query.eq("conseiller_id", profile.id);

      const { data, error } = await query;
      if (error) throw error;
      setMembers(data || []);
    } catch (err) {
      console.error("Erreur fetchMembers:", err);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCellules = async () => {
    const { data } = await supabase.from("cellules").select("id, cellule, responsable, telephone");
    if (data) setCellules(data);
  };

  const fetchConseillers = async () => {
    const { data } = await supabase.from("profiles").select("id, prenom, nom, telephone").eq("role", "Conseiller");
    if (data) setConseillers(data);
  };

  useEffect(() => {
    const fetchSessionAndProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);

      if (session?.user) {
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("id, prenom, role")
          .eq("id", session.user.id)
          .single();
        if (profileError) console.error(profileError);
        else {
          setPrenom(profileData.prenom || "");
          await fetchMembers(profileData);
        }
      } else {
        await fetchMembers();
      }

      fetchCellules();
      fetchConseillers();
    };

    fetchSessionAndProfile();
  }, []);

  // -------------------- UTILS --------------------
  const updateMemberLocally = (id, extra = {}) => {
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, ...extra } : m)));
  };

  // -------------------- HANDLE AFTER SEND --------------------
  const handleAfterSend = async (memberId, type, cible, newStatut = "ancien") => {
    try {
      const membre = members.find((m) => m.id === memberId);
      if (!membre) return;

      const update = { statut: newStatut };
      if (type === "cellule") {
        update.cellule_id = cible.id;
        update.cellule_nom = cible.cellule;
      } else if (type === "conseiller") {
        update.conseiller_id = cible.id;
      }

      const { error: updateError } = await supabase
        .from("membres")
        .update(update)
        .eq("id", memberId);
      if (updateError) throw updateError;

      const suiviData = {
        membre_id: memberId,
        cellule_id: type === "cellule" ? cible.id : null,
        conseiller_id: type === "conseiller" ? cible.id : null,
        statut: "envoye",
        created_at: new Date().toISOString(),
        prenom: membre.prenom,
        nom: membre.nom,
        statut_membre: membre.statut,
        besoin: membre.besoin,
        infos_supplementaires: membre.infos_supplementaires,
        telephone: membre.telephone,
        cellule_nom: membre.cellule_nom,
        responsable: membre.responsable_prenom ? `${membre.responsable_prenom} ${membre.responsable_nom}` : null,
        is_whatsapp: membre.is_whatsapp,
        ville: membre.ville,
        commentaire_suivis: "",
      };
      const { error: suiviError } = await supabase.from("suivis_membres").insert([suiviData]);
      if (suiviError) throw suiviError;

      setMembers((prev) =>
        prev.map((m) => (m.id === memberId ? { ...m, ...update } : m))
      );

      showToast("✅ Contact envoyé et suivi enregistré");
    } catch (err) {
      console.error("Erreur handleAfterSend:", err);
      showToast("❌ Une erreur est survenue lors de l'envoi");
    }
  };

  // -------------------- HANDLE STATUS / CELLULE / CONSEILLER CHANGE --------------------
  const handleStatusChange = async (memberId, newValue, type = "statut") => {
    const update = {};
    if (type === "statut") update.statut = newValue;
    else if (type === "cellule") {
      const cellule = cellules.find((c) => c.id === newValue);
      if (!cellule) return;
      update.cellule_id = cellule.id;
      update.cellule_nom = cellule.cellule;
    } else if (type === "conseiller") {
      const conseiller = conseillers.find((c) => c.id === newValue);
      if (!conseiller) return;
      update.conseiller_id = conseiller.id;
    }

    // 1️⃣ Mise à jour locale instantanée
    setMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, ...update } : m))
    );

    // 2️⃣ Sauvegarde dans Supabase
    try {
      const { error } = await supabase
        .from("membres")
        .update(update)
        .eq("id", memberId);
      if (error) throw error;
      showToast("✅ Membre mis à jour avec succès");
    } catch (err) {
      console.error("Erreur mise à jour membre:", err);
      showToast("⚠️ Erreur lors de la mise à jour du membre");
    }
  };

  const getBorderColor = (m) => {
    const status = m.statut || "";
    const suiviStatus = m.suivi_statut_libelle || "";

    if (status === "refus" || suiviStatus === "refus") return "#f56f22";
    if (status === "actif" || suiviStatus === "actif") return "#4285F4";
    if (status === "a déjà son église" || suiviStatus === "a déjà son église") return "#f21705";        
    if (status === "ancien" || suiviStatus === "ancien") return "#999999";
    if (status === "visiteur" || suiviStatus === "visiteur") return "#34A853";
    if (status === "veut rejoindre ICC" || suiviStatus === "veut rejoindre ICC") return "#34A853";
    if (status === "refus" || suiviStatus === "refus") return "#f56f22";
  
    return "#ccc";
  };

  const formatDate = (dateStr) => {
    try {
      return format(new Date(dateStr), "EEEE d MMMM yyyy", { locale: fr });
    } catch {
      return "";
    }
  };

  const filterBySearch = (list) =>
    list.filter((m) => `${m.prenom} ${m.nom}`.toLowerCase().includes(search.toLowerCase()));

  const nouveaux = members.filter((m) => m.statut === "visiteur" || m.statut === "veut rejoindre ICC");
  const anciens = members.filter((m) => m.statut !== "visiteur" && m.statut !== "veut rejoindre ICC");

  const nouveauxFiltres = filterBySearch(
    filter
      ? nouveaux.filter((m) =>
          m.statut === filter || 
          m.suivi_statut_libelle === filter || 
          (m.statut_suivis_actuel && statutLabels[m.statut_suivis_actuel] === filter)
        )
      : nouveaux
  );

  const anciensFiltres = filterBySearch(
    filter
      ? anciens.filter((m) =>
          m.statut === filter || 
          m.suivi_statut_libelle === filter || 
          (m.statut_suivis_actuel && statutLabels[m.statut_suivis_actuel] === filter)
        )
      : anciens
  );

  const statusOptions = ["actif", "ancien", "visiteur", "veut rejoindre ICC", "refus", "integrer", "En cours", "a déjà son église"];
  const totalCount = [...nouveauxFiltres, ...anciensFiltres].length;

  const toggleDetails = (id) => setDetailsOpen((prev) => ({ ...prev, [id]: !prev[id] }));

  // -------------------- RETURN --------------------
  return (
    <div className="min-h-screen flex flex-col items-center p-6" style={{ background: "linear-gradient(135deg, #2E3192 0%, #92EFFD 100%)" }}>
      {/* Top bar */}
      <div className="w-full max-w-5xl mb-6">
        <div className="flex justify-between items-center">
          <button onClick={() => window.history.back()} className="flex items-center text-white hover:text-black-200">← Retour</button>
          <LogoutLink className="bg-white/10 text-white px-4 py-2 rounded-lg hover:bg-white/20" />
        </div>
        <div className="flex justify-end mt-2">
          <p className="text-orange-200 text-sm">👋 Bienvenue {prenom || "cher membre"}</p>
        </div>
      </div>

      <div className="mb-4">
        <Image src="/logo.png" alt="SoulTrack Logo" className="w-20 h-18 mx-auto" />
      </div>

      <div className="text-center mb-4">
        <h1 className="text-3xl font-bold text-white mb-2">Liste des Membres</h1>
        <p className="text-white text-lg font-light italic max-w-xl mx-auto">Chaque personne a une valeur infinie. Ensemble, nous avançons ❤️</p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-center w-full max-w-5xl mb-4">
        <div className="flex items-center space-x-2">
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="px-3 py-2 rounded-lg border text-sm">
            <option value="">Tous les statuts</option>
            {statusOptions.map((s) => <option key={s}>{s}</option>)}
          </select>
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher..." className="px-3 py-2 rounded-lg border text-sm w-48"/>
          <span className="text-white text-sm">({totalCount})</span>
        </div>
        <button onClick={() => setView(view === "card" ? "table" : "card")} className="text-white text-sm underline">
          {view === "card" ? "Vue Table" : "Vue Carte"}
        </button>
      </div>
      {/* ==================== CARDS ==================== */}
      {view === "card" && (
        <div className="w-full max-w-5xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedMembers.map(m => (
            <div key={m.id} className="bg-white p-3 rounded-xl shadow-md border-l-4 relative border-l-blue-500">
              <h2 className="text-lg font-bold text-center">{m.prenom} {m.nom}</h2>
              <p>📱 {m.telephone || "—"}</p>
              <p>🏠 Cellule: {m.cellule_nom || "—"}</p>
              <p>👤 Conseiller: {m.conseiller_prenom || "—"} {m.conseiller_nom || ""}</p>

              <select
                value={m.statut}
                onChange={async (e) => {
                  const newStatus = e.target.value;
                  updateMemberLocally(m.id, { statut: newStatus });
                  await supabase.from("membres").update({ statut: newStatus }).eq("id", m.id);
                  showToast("✅ Statut mis à jour");
                }}
                className="mt-2 w-full border rounded px-2 py-1 text-sm"
              >
                <option value="">-- Statut --</option>
                {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
              </select>

              <button onClick={() => setEditMember(m)} className="mt-2 text-blue-600 text-sm">✏️ Modifier</button>
            </div>
          ))}
        </div>
      )}

      {/* ==================== TABLE ==================== */}
      {view === "table" && (
        <div className="w-full max-w-5xl overflow-x-auto">
          <table className="w-full bg-white rounded-xl shadow-md">
            <thead>
              <tr className="bg-blue-600 text-white">
                <th className="p-2">Nom</th>
                <th className="p-2">Téléphone</th>
                <th className="p-2">Cellule</th>
                <th className="p-2">Conseiller</th>
                <th className="p-2">Statut</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedMembers.map(m => (
                <tr key={m.id} className="border-b">
                  <td className="p-2">{m.prenom} {m.nom}</td>
                  <td className="p-2">{m.telephone || "—"}</td>
                  <td className="p-2">{m.cellule_nom || "—"}</td>
                  <td className="p-2">{m.conseiller_prenom || "—"} {m.conseiller_nom || ""}</td>
                  <td className="p-2">
                    <select
                      value={m.statut}
                      onChange={async (e) => {
                        const newStatus = e.target.value;
                        updateMemberLocally(m.id, { statut: newStatus });
                        await supabase.from("membres").update({ statut: newStatus }).eq("id", m.id);
                        showToast("✅ Statut mis à jour");
                      }}
                      className="border rounded px-2 py-1 text-sm"
                    >
                      <option value="">-- Statut --</option>
                      {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="p-2">
                    <button onClick={() => setEditMember(m)} className="text-blue-600 text-sm">✏️ Modifier</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ==================== POPUPS ==================== */}
      {editMember && (
        <EditMemberPopup
          member={editMember}
          onClose={() => setEditMember(null)}
          onUpdateMember={(updated) => updateMemberLocally(updated.id, updated)}
        />
      )}
    </div>
  );
}
