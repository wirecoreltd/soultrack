// backend/index.js
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const Twilio = require('twilio');

const app = express();
app.use(express.json());

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE; // secret
const TWILIO_SID = process.env.TWILIO_SID;
const TWILIO_TOKEN = process.env.TWILIO_TOKEN;
const TWILIO_WHATSAPP_FROM = process.env.TWILIO_WHATSAPP_FROM; // e.g. "whatsapp:+1415XXXXXXX"
const SCHEDULER_SECRET = process.env.SCHEDULER_SECRET || 'change-me';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE || !TWILIO_SID) {
  console.error("Missing env vars. Set SUPABASE_URL, SUPABASE_SERVICE_ROLE, TWILIO_SID, TWILIO_TOKEN, TWILIO_WHATSAPP_FROM");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);
const twilioClient = Twilio(TWILIO_SID, TWILIO_TOKEN);

app.get('/health', (req,res) => res.send('ok'));

app.post('/tasks/send-welcome', async (req,res) => {
  // Protection simple: header x-scheduler-secret
  if (req.headers['x-scheduler-secret'] !== SCHEDULER_SECRET) {
    return res.status(403).json({ error: 'forbidden' });
  }
  try {
    const cutoff = new Date(Date.now() - 48*60*60*1000).toISOString();
    const { data: members, error } = await supabase
      .from('members')
      .select('*')
      .eq('welcome_sent', false)
      .lte('date_premiere_visite', cutoff);

    if (error) throw error;
    let sent = 0;
    for (const m of members) {
      if (!m.phone_e164) continue; // skip si pas de numéro en E.164
      // Message d'amour — personnalise ici
      const messageBody = `Bonjour ${m.first_name || ''}, nous sommes heureux que vous ayez visité SoulTrack. Que Dieu vous bénisse 🙏 — [Nom de l'Église]`;

      await twilioClient.messages.create({
        from: TWILIO_WHATSAPP_FROM,
        to: `whatsapp:${m.phone_e164}`,
        body: messageBody
      });

      // marque envoyé et crée un suivi
      await supabase.from('members').update({ welcome_sent: true }).eq('id', m.id);
      await supabase.from('suivis').insert([{
        member_id: m.id,
        type_action: 'message',
        commentaire: 'Message de bienvenue automatique envoyé (48h)'
      }]);
      sent++;
    }
    res.json({ sent });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
