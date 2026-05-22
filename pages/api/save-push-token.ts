import { createClient } from '@supabase/supabase-js';
import type { NextApiRequest, NextApiResponse } from 'next';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const { userId, token } = req.body;
  const { error } = await supabase
    .from('push_tokens')
    .upsert({ user_id: userId, token, updated_at: new Date().toISOString() });
  if (error) return res.status(500).json({ error });
  return res.status(200).json({ success: true });
}
