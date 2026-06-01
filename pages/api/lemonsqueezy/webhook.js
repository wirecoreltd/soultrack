const crypto = require("crypto");
const { createClient } = require("@supabase/supabase-js");

export const config = { api: { bodyParser: false } };

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data",  (chunk) => chunks.push(Buffer.from(chunk)));
    req.on("end",   () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

const DUREE_MOIS = { "1m": 1, "6m": 6, "1a": 12 };

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const rawBody   = await getRawBody(req);
  const signature = req.headers["x-signature"];

  const hmac   = crypto.createHmac("sha256", process.env.LEMONSQUEEZY_WEBHOOK_SECRET);
  const digest = hmac.update(rawBody).digest("hex");

  if (!signature || signature !== digest) {
    console.error("Webhook: signature invalide");
    return res.status(401).json({ error: "Signature invalide" });
  }

  const payload = JSON.parse(rawBody.toString());
  const event   = payload.meta?.event_name;

  console.log("Webhook LS reçu :", event);

  if (event !== "order_created") {
    return res.status(200).json({ received: true, skipped: event });
  }

  const attrs    = payload.data?.attributes;
  const custom   = payload.meta?.custom_data;
  const egliseId = custom?.eglise_id;
  const planId   = custom?.plan_id;
  const duree    = custom?.duree || "1m";

  if (!egliseId || !planId || attrs?.status !== "paid") {
    console.warn("Webhook: données manquantes ou statut non payé");
    return res.status(200).json({ skipped: true });
  }

  const mois      = DUREE_MOIS[duree] || 1;
  const now       = new Date();
  const periodEnd = new Date(now);
  periodEnd.setMonth(periodEnd.getMonth() + mois);

  const { error } = await supabaseAdmin
    .from("subscriptions")
    .update({
      plan_id:              planId,
      statut:               "active",
      current_period_start: now.toISOString(),
      current_period_end:   periodEnd.toISOString(),
      updated_at:           now.toISOString(),
      started_at:           now.toISOString(),
    })
    .eq("eglise_id", egliseId);

  if (error) {
    console.error("Supabase update error:", error);
    return res.status(500).json({ error: error.message });
  }

  console.log(`Subscription mise à jour : eglise=${egliseId} plan=${planId} duree=${duree} (${mois} mois)`);
  return res.status(200).json({ success: true });
}
