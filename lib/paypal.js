// lib/paypal.js

const PAYPAL_BASE_URL = process.env.PAYPAL_MODE === "live"
  ? "https://api-m.paypal.com"
  : "https://api-m.sandbox.paypal.com";

export const PAYPAL_PLAN_IDS = {
  starter:   process.env.PAYPAL_PLAN_ID_STARTER,
  vision:    process.env.PAYPAL_PLAN_ID_VISION,
  expansion: process.env.PAYPAL_PLAN_ID_EXPANSION,
};

const PLAN_PRICES = {
  starter:    "19.00",
  vision:     "39.00",
  expansion:  "79.00",
  enterprise: "99.00",
};

// ── Auth ──────────────────────────────────────────────────────────────────────

async function getAccessToken() {
  const credentials = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString("base64");

  const res = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error_description || "PayPal auth failed");
  return data.access_token;
}

// ── Base request ──────────────────────────────────────────────────────────────

async function paypalRequest(method, path, body = null) {
  const token = await getAccessToken();
  
  const res = await fetch(`${PAYPAL_BASE_URL}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "PayPal-Request-Id": `soultrack-${Date.now()}`,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const text = await res.text();
  console.log("PayPal raw response:", res.status, text);

  if (!text) throw new Error(`PayPal réponse vide (status ${res.status})`);
  
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`PayPal réponse non-JSON: ${text}`);
  }

  if (!res.ok) throw new Error(data?.message || data?.error_description || JSON.stringify(data));
  return data;
}

// ── One-time order ────────────────────────────────────────────────────────────

export async function createPayPalOrder({ planId, planNom, egliseId }) {
  return paypalRequest("POST", "/v2/checkout/orders", {
    intent: "CAPTURE",
    purchase_units: [
      {
        amount: {
          currency_code: "USD",
          value: PLAN_PRICES[planId] ?? "0.00",
        },
        description: `SoulTrack – Plan ${planNom}`,
        custom_id: JSON.stringify({ eglise_id: egliseId, plan_id: planId }),
      },
    ],
    application_context: {
      brand_name: "SoulTrack",
      user_action: "PAY_NOW",
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/administrateur/subscription?success=true`,
      cancel_url:  `${process.env.NEXT_PUBLIC_APP_URL}/administrateur/subscription?cancelled=true`,
    },
  });
}

// ── Subscription ──────────────────────────────────────────────────────────────

export async function createPayPalSubscription({ planId, egliseId, email }) {
  const paypalPlanId = PAYPAL_PLAN_IDS[planId];
  if (!paypalPlanId) throw new Error("Pas de plan PayPal pour " + planId);

  return paypalRequest("POST", "/v2/billing/subscriptions", {
    plan_id: paypalPlanId,
    subscriber: {
      email_address: email,
    },
    custom_id: JSON.stringify({ eglise_id: egliseId, plan_id: planId }),
    application_context: {
      brand_name:  "SoulTrack",
      locale:      "fr-FR",
      user_action: "SUBSCRIBE_NOW",
      return_url:  `${process.env.NEXT_PUBLIC_APP_URL}/administrateur/subscription?success=true`,
      cancel_url:  `${process.env.NEXT_PUBLIC_APP_URL}/administrateur/subscription?cancelled=true`,
    },
  });
}

// ── Capture order ─────────────────────────────────────────────────────────────

export async function capturePayPalOrder(orderId) {
  return paypalRequest("POST", `/v2/checkout/orders/${orderId}/capture`, {});
}
