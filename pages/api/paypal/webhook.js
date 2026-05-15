// pages/api/paddle/webhook.js
// Reçoit et traite les événements Paddle Billing

import { verifyPaddleWebhook } from "../../../lib/paddle";
import { updateSubscription } from "../../../lib/updateSubscription";

// Désactive le body parser de Next.js pour avoir le rawBody (nécessaire pour la vérification)
export const config = { api: { bodyParser: false } };

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const rawBody  = await getRawBody(req);
  const signature = req.headers["paddle-signature"];

  // Vérifie l'authenticité du webhook
  const isValid = verifyPaddleWebhook(rawBody, signature, process.env.PADDLE_WEBHOOK_SECRET);
  if (!isValid) {
    console.warn("[paddle/webhook] Signature invalide");
    return res.status(401).json({ error: "Invalid signature" });
  }

  let event;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return res.status(400).json({ error: "Invalid JSON" });
  }

  const { event_type, data } = event;
  console.log("[paddle/webhook] Event reçu:", event_type);

  try {
    switch (event_type) {

      // ── Abonnement créé ou activé ──
      case "subscription.created":
      case "subscription.activated": {
        const customData = data?.custom_data ?? {};
        const egliseId   = customData.eglise_id;
        const planId     = customData.plan_id;

        if (!egliseId || !planId) {
          console.warn("[paddle/webhook] custom_data manquant:", customData);
          break;
        }

        await updateSubscription({
          egliseId,
          planId,
          statut:                "active",
          provider:              "paddle",
          paddleSubscriptionId:  data.id,
          periodEnd:             data.current_billing_period?.ends_at
            ? new Date(data.current_billing_period.ends_at)
            : null,
        });
        break;
      }

      // ── Renouvellement payé ──
      case "subscription.renewed": {
        const customData = data?.custom_data ?? {};
        const egliseId   = customData.eglise_id;
        const planId     = customData.plan_id;

        if (!egliseId || !planId) break;

        await updateSubscription({
          egliseId,
          planId,
          statut:               "active",
          provider:             "paddle",
          paddleSubscriptionId: data.id,
          periodEnd:            data.current_billing_period?.ends_at
            ? new Date(data.current_billing_period.ends_at)
            : null,
        });
        break;
      }

      // ── Abonnement annulé ──
      case "subscription.canceled": {
        const customData = data?.custom_data ?? {};
        const egliseId   = customData.eglise_id;
        if (!egliseId) break;

        await updateSubscription({
          egliseId,
          planId:               "free",
          statut:               "cancelled",
          provider:             "paddle",
          paddleSubscriptionId: data.id,
        });
        break;
      }

      // ── Paiement échoué ──
      case "subscription.past_due": {
        const customData = data?.custom_data ?? {};
        const egliseId   = customData.eglise_id;
        const planId     = customData.plan_id;
        if (!egliseId) break;

        await updateSubscription({
          egliseId,
          planId,
          statut:               "past_due",
          provider:             "paddle",
          paddleSubscriptionId: data.id,
        });
        break;
      }

      // ── Transaction complétée (one-time) ──
      case "transaction.completed": {
        const customData = data?.custom_data ?? {};
        const egliseId   = customData.eglise_id;
        const planId     = customData.plan_id;
        if (!egliseId || !planId) break;

        await updateSubscription({
          egliseId,
          planId,
          statut:   "active",
          provider: "paddle",
        });
        break;
      }

      default:
        console.log("[paddle/webhook] Event ignoré:", event_type);
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error("[paddle/webhook] Erreur traitement:", err);
    return res.status(500).json({ error: "Internal error" });
  }
}
