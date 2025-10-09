// /pages/api/send-welcome.js
import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  if (req.headers['x-scheduler-secret'] !== process.env.SCHEDULER_SECRET) {
    return res.status(403).json({ error: 'Forbidden' })
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE
  )

  try {
    const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()

    const { data: members, error } = await supabase
      .from('members')
      .select('*')
      .eq('welcome_sent', false)
      .lte('date_premiere_visite', cutoff)

    if (error) throw error

    let processed = 0
    for (const m of members) {
      // Ici on ne fait pas l’envoi WhatsApp automatique
      // → tu peux gérer manuellement via un bouton WhatsApp dans ton dashboard

      await supabase
        .from('members')
        .update({ welcome_sent: true })
        .eq('id', m.id)

      await supabase.from('suivis').insert([
        {
          member_id: m.id,
          type_action: 'message',
          commentaire:
            'Préparé pour message de bienvenue (48h). Envoi manuel via WhatsApp.',
        },
      ])

      processed++
    }

    res.json({ processed })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
}
