import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'DELETE') return res.status(405).end();

  const { eglise_id } = req.body;
  if (!eglise_id) return res.status(400).json({ error: 'eglise_id requis' });

  const token = req.headers.authorization?.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
  if (authError || !user) return res.status(401).json({ error: 'Non autorisé' });

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'Superadmin') return res.status(403).json({ error: 'Accès refusé' });

  try {
    // 1. Récupérer les profiles AVANT suppression
    const { data: profiles } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('eglise_id', eglise_id);

    const userIds = profiles?.map(p => p.id) ?? [];

    // 2. Supprimer l'église → CASCADE supprime tout en base
    const { error: deleteError } = await supabaseAdmin
      .from('eglises')
      .delete()
      .eq('id', eglise_id);

    if (deleteError) throw deleteError;

    // 3. Supprimer les Auth users (non couvert par CASCADE)
    const authErrors = [];
    for (const uid of userIds) {
      const { error } = await supabaseAdmin.auth.admin.deleteUser(uid);
      if (error) authErrors.push({ uid, error: error.message });
    }

    return res.status(200).json({
      success: true,
      deleted_users: userIds.length,
      auth_errors: authErrors,
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
