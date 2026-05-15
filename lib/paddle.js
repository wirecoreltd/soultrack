import crypto from "crypto";

const PADDLE_API_BASE = "https://api.paddle.com";

export const PADDLE_PRICE_IDS = {
  starter:   "pri_01krn5g6d2fm0jgtvpzwgz5qkz",   // $19/mois — recurrent
  vision:    "pri_01krn5gxa6d2x6xq1y27w94qex",    // $39/mois — recurrent
  expansion: "pri_01krn5herc36f2vrvaytyyav9n", // $79/mois — recurrent
  enterprise: null,                // sur mesure — contact sales
  free: null,                      // gratuit — pas de paiement
};

export const ONE_TIME_PLANS = [];

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

export async function createPaddleTransaction({ priceId, customerId, egliseId, planId, email }) {
  const payload = {
    items: [{ price_id: priceId, quantity: 1 }],
    customer: customerId ? { id: customerId } : { email },
    custom_data: { eglise_id: egliseId, plan_id: planId },
  };
  return paddleRequest("POST", "/transactions", payload);
}

export async function cancelPaddleSubscription(subscriptionId) {
  return paddleRequest("POST", `/subscriptions/${subscriptionId}/cancel`, {
    effective_from: "next_billing_period",
  });
}

export async function getPaddleSubscription(subscriptionId) {
  return paddleRequest("GET", `/subscriptions/${subscriptionId}`);
}

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
