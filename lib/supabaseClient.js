// lib/supabaseClient.js
import supabase from "../lib/supabaseClient";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("⚠️ Vérifie tes variables d'environnement Supabase");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);
export default supabase;
