"use client";

import { useState, useEffect } from "react";
import supabase from "../lib/supabaseClient";

export default function SuiviPopup({ member, onClose }) {
  if (!member) return null;

  const [suivis, setSuivis] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    action_type: "Appel",
    statut: "En cours",
    besoin: "",
    commentaire: ""
  });

  const [profile, setProfile] = useState(null);
