"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import supabase from "../lib/supabaseClient";
import Image from "next/image";
import BoutonEnvoyer from "../components/BoutonEnvoyer";
import LogoutLink from "../components/LogoutLink";
import DetailsMemberPopup from "../components/DetailsMemberPopup";
import EditMemberPopup from "../components/EditMemberPopup";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useSearchParams } from "next/navigation";
import { useMembers } from "../context/MembersContext";
import Header from "../components/Header";

export default function ListMembers() {
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

  // -------------------- Nouveaux états --------------------
  const [commentChanges, setCommentChanges] = useState({});
  const [statusChanges, setStatusChanges] = useState({});
  const [updating, setUpdating] = useState({});
  const [selectedTargets, setSelectedTargets] = useState({});
  const [selectedTargetType, setSelectedTargetType] = useState({});
  const [toastMessage, setToastMessage] = useState("");
  const [showingToast, setShowingToast] = useState(false);
  const [openPhoneMenuId, setOpenPhoneMenuId] = useState(null);
  const realtimeChannelRef = useRef(null);

  const statutLabels = {
    1: "En cours",
    2: "En attente",
    3: "Intégrer",
    4: "Refus",
  };

  const statusOptions = [
    "actif", "ancien", "visiteur", "nouveau",
    "veut rejoindre ICC", "refus", "integrer",
    "En cours", "a déjà son église",
  ];

  const { members, setAllMembers, updateMember } = useMembers();

  const showToast = (msg) => {
    setToastMessage(msg);
    setShowingToast(true);
    setTimeout(() => setShowingToast(false), 3500);
  };

  const handleCommentChange = (id, value) => {
    setCommentChanges(prev => ({ ...prev, [id]: value }));
  };

  const updateSuivi = async (id) => {
    setUpdating(prev => ({ ...prev, [id]: true }));
    try {
      setTimeout(() => {
        setUpdating(prev => ({ ...prev, [id]: false }));
        showToast("✅ Suivi enregistré !");
      }, 1000);
    } catch (err) {
      console.error("Erreur update suivi:", err);
      setUpdating(prev => ({ ...prev, [id]: false }));
    }
  };

  // -------------------- FETCH --------------------
  const fetchMembers = async (profile = null) => {
    setLoading(true);
    try {
      let query = supabase.from("membres_complets").select("*").order("created_at", { ascending: false });
      if (conseillerIdFromUrl) query = query.eq("conseiller_id", conseillerIdFromUrl);
      else if (profile?.role === "Conseiller") query = query.eq("conseiller_id", profile.id);

      const { data, error } = await query;
      if (error) throw error;
      setAllMembers(data || []);
    } catch (err) {
      console.error("Erreur fetchMembers:", err);
      setAllMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCellules = async () => {
    const { data, error } = await supabase.from("cellules").select("id, cellule_full");
    if (error) console.error("Erreur fetchCellules:", error);
    if (data) setCellules(data);
  };

  const fetchConseillers = async () => {
    const { data } = await supabase.from("profiles").select("id, prenom, nom, telephone").eq("role", "Conseiller");
    if (data) setConseillers(data);
  };

  // -------------------- Détection doublon téléphone --------------------
  const isDuplicateByPhone = (member) => {
    if (!member?.telephone) return false;
    const tel = member.telephone.replace(/\D/g, "");
    return members.some(m => m.id !== member.id && m.telephone?.replace(/\D/g, "") === tel);
  };

  // -------------------- handleAfterSend --------------------
  const handleAfterSend = (memberSent) => {
    // Met à jour la liste générale des membres
    setAllMembers(prev => prev.map(m => m.id === memberSent.id ? { ...m, etat_contact: "Existant" } : m));
    showToast(`✅ ${memberSent.prenom} ${memberSent.nom} a été déplacé dans les suivis`);
  };

  // -------------------- useEffect session --------------------
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
        if (!profileError) {
          setPrenom(profileData.prenom || "");
          await fetchMembers(profileData);
        } else console.error(profileError);
      } else await fetchMembers();

      fetchCellules();
      fetchConseillers();
    };

    fetchSessionAndProfile();
  }, []);

  // -------------------- Realtime --------------------
  useEffect(() => {
    if (realtimeChannelRef.current) {
      try { realtimeChannelRef.current.unsubscribe(); } catch {}
      realtimeChannelRef.current = null;
    }

    const channel = supabase.channel("realtime:membres_complets");
    channel.on("postgres_changes", { event: "*", schema: "public", table: "membres_complets" }, () => fetchMembers());
    channel.on("postgres_changes", { event: "*", schema: "public", table: "cellules" }, () => { fetchCellules(); fetchMembers(); });
    channel.on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, () => { fetchConseillers(); fetchMembers(); });

    try { channel.subscribe(); } catch (err) { console.warn("Erreur subscription realtime:", err); }
    realtimeChannelRef.current = channel;

    return () => {
      try { if (realtimeChannelRef.current) { realtimeChannelRef.current.unsubscribe(); realtimeChannelRef.current = null; } } catch {}
    };
  }, []);

  // -------------------- Update après édition --------------------
  const [refreshKey, setRefreshKey] = useState(0);
  const onUpdateMemberHandler = (updatedMember) => {
    updateMember(updatedMember);
    setEditMember(null);
    setPopupMember(prev => prev?.id === updatedMember.id ? { ...prev, ...updatedMember } : prev);
  };
