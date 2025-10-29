// ✅ /lib/supabaseAdmin.js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("❌ Clé Supabase service_role manquante !");
}

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

export default supabaseAdmin;
