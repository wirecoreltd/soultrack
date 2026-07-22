import { createClient } from '@supabase/supabase-js';
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { userId, token } = req.body;
  const { error } = await supabase
    .from('push_tokens')
    .upsert(
      {
        user_id: userId,
        token,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' } // ← ligne ajoutée
    );
  if (error) return res.status(500).json({ error });
  return res.status(200).json({ success: true });
}
