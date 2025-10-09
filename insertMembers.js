import { createClient } from "@supabase/supabase-js";

// Remplace par tes infos Supabase
const supabaseUrl = "https://qdxbcbpbjozvxgpusadi.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkeGJjYnBiam96dnhncHVzYWRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyNjQ0NTQsImV4cCI6MjA3Mzg0MDQ1NH0.pWlel0AkViXCmKRHP0cvk84RCBH_VEWsZEZEKJscDZ8";
const supabase = createClient(supabaseUrl, supabaseKey);

// Membres à insérer
const members = [
  {
    prenom: "Alison",
    nom: "Ravina",
    telephone: "54547731",
    email: "alison.ravina@test.com",
    status: "visiteur",
    date_premiere_visite: null,
    welcome_sent_at: null,
    notes: "test",
    responsable_suivi: null,
    how_came: "",
    assignee: "royal road",
    besoin: "",
  },
  {
    prenom: "Allan",
    nom: "Bavajee",
    telephone: "59732188",
    email: "allan.bavajee@test.com",
    status: "veut rejoindre ICC",
    date_premiere_visite: null,
    welcome_sent_at: null,
    notes: "test",
    responsable_suivi: null,
    how_came: "Curepipe",
    assignee: "Curepipe",
    besoin: "",
  },
  {
    prenom: "Anaelle",
    nom: "Allooman",
    telephone: "57171093",
    email: "anaelle.allooman@test.com",
    status: "a déjà mon église",
    date_premiere_visite: null,
    welcome_sent_at: null,
    notes: "test",
    responsable_suivi: null,
    how_came: "RTT",
    assignee: "Road",
    besoin: "",
  },
];

async function insertMembers() {
  try {
    const { data, error } = await supabase.from("membres").insert(members);
    if (error) throw error;
    console.log("✅ Membres ajoutés avec succès :", data);
  } catch (err) {
    console.error("❌ Erreur lors de l'insertion :", err.message);
  }
}

insertMembers();
