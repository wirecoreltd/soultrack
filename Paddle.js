// lib/paddle.js
// Paddle Billing API v1 client

const PADDLE_API_BASE = "https://api.paddle.com";

// Map your internal plan IDs to Paddle Price IDs
// Replace these with your actual Paddle Price IDs from the Paddle dashboard
export const PADDLE_PRICE_IDS = {
  starter:   "pri_XXXX_starter",   // $19/mois — recurrent
  vision:    "pri_XXXX_vision",    // $39/mois — recurrent
  expansion: "pri_XXXX_expansion", // $79/mois — recurrent
  enterprise: null,                // sur mesure — contact sales
  free: null,                      // gratuit — pas de paiement
};

// Plans with one-time payment (pas de récurrence)
export const ONE_TIME_PLANS = []; // ex: ["starter"] si tu veux one-time

async function paddleRequest(method, path, body = null) {
  const res = await fetch(`${PADDLE_API_BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${process.env.PADDLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.detail || "Paddle API error");
  return data;
}

// Crée une transaction Paddle (checkout)
export async function createPaddleTransaction({ priceId, customerId, egliseId, planId, email }) {
  const isRecurrent = !ONE_TIME_PLANS.includes(planId);

  const payload = {
    items: [{ price_id: priceId, quantity: 1 }],
    customer: customerId
      ? { id: customerId }
      : { email },
    custom_data: { eglise_id: egliseId, plan_id: planId },
    ...(isRecurrent ? {} : {}),
  };

  return paddleRequest("POST", "/transactions", payload);
}

// Annule un abonnement Paddle
export async function cancelPaddleSubscription(subscriptionId) {
  return paddleRequest("POST", `/subscriptions/${subscriptionId}/cancel`, {
    effective_from: "next_billing_period",
  });
}

// Récupère un abonnement Paddle
export async function getPaddleSubscription(subscriptionId) {
  return paddleRequest("GET", `/subscriptions/${subscriptionId}`);
}

// Vérifie la signature du webhook Paddle
import crypto from "crypto";

export function verifyPaddleWebhook(rawBody, signature, secret) {
  const parts = signature.split(";");
  const tsPart = parts.find((p) => p.startsWith("ts="));
  const h1Part = parts.find((p) => p.startsWith("h1="));
  if (!tsPart || !h1Part) return false;

  const ts = tsPart.replace("ts=", "");
  const h1 = h1Part.replace("h1=", "");

  const signedPayload = `${ts}:${rawBody}`;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(signedPayload)
    .digest("hex");

  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(h1));
}
