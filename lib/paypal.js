// lib/paypal.js
// PayPal REST API v2 client

const PAYPAL_BASE =
  process.env.PAYPAL_MODE === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

// Cache du token d'accès
let _accessToken = null;
let _tokenExpiry  = 0;

async function getAccessToken() {
  if (_accessToken && Date.now() < _tokenExpiry) return _accessToken;

  const credentials = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString("base64");

  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const data = await res.json();
  if (!res.ok) {
  console.error("PAYPAL AUTH ERROR:", data);
  throw new Error(
    data.error_description || data.error || "PayPal auth failed"
  );
}

  _accessToken = data.access_token;
  _tokenExpiry  = Date.now() + (data.expires_in - 60) * 1000;
  return _accessToken;
}

async function paypalRequest(method, path, body = null) {
  const token = await getAccessToken();
  const res = await fetch(`${PAYPAL_BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "PayPal-Request-Id": `soultrack-${Date.now()}`,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "PayPal API error");
  return data;
}

// Plan prices in USD
const PLAN_PRICES = {
  starter:    "19.00",
  vision:     "39.00",
  expansion:  "79.00",
  enterprise: "99.00",
};

// Crée un order PayPal (pour paiement unique)
export async function createPayPalOrder({ planId, planNom, egliseId }) {
  const amount = PLAN_PRICES[planId];
  if (!amount) throw new Error("Plan non payant");

  return paypalRequest("POST", "/v2/checkout/orders", {
    intent: "CAPTURE",
    purchase_units: [{
      reference_id: `${egliseId}_${planId}`,
      description: `SoulTrack — Plan ${planNom}`,
      amount: {
        currency_code: "USD",
        value: amount,
      },
      custom_id: JSON.stringify({ eglise_id: egliseId, plan_id: planId }),
    }],
    application_context: {
      brand_name: "SoulTrack",
      locale: "fr-FR",
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/administrateur/subscription?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/administrateur/subscription?cancelled=true`,
    },
  });
}

// Capture un order PayPal après approbation
export async function capturePayPalOrder(orderId) {
  return paypalRequest("POST", `/v2/checkout/orders/${orderId}/capture`);
}

// Crée un abonnement PayPal récurrent
// Nécessite un plan_id PayPal créé dans le dashboard
export const PAYPAL_PLAN_IDS = {
  starter:   "P-XXXX_starter",
  vision:    "P-XXXX_vision",
  expansion: "P-XXXX_expansion",
};

export async function createPayPalSubscription({ planId, egliseId, email }) {
  const paypalPlanId = PAYPAL_PLAN_IDS[planId];
  if (!paypalPlanId) throw new Error("Pas de plan PayPal pour " + planId);

  return paypalRequest("POST", "/v1/billing/subscriptions", {
    plan_id: paypalPlanId,
    subscriber: { email_address: email },
    custom_id: JSON.stringify({ eglise_id: egliseId, plan_id: planId }),
    application_context: {
      brand_name: "SoulTrack",
      locale: "fr-FR",
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/administrateur/subscription?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/administrateur/subscription?cancelled=true`,
    },
  });
}

// Vérifie la signature d'un webhook PayPal
export async function verifyPayPalWebhook({ headers, rawBody, webhookId }) {
  const token = await getAccessToken();
  const res = await fetch(`${PAYPAL_BASE}/v1/notifications/verify-webhook-signature`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      auth_algo:         headers["paypal-auth-algo"],
      cert_url:          headers["paypal-cert-url"],
      transmission_id:   headers["paypal-transmission-id"],
      transmission_sig:  headers["paypal-transmission-sig"],
      transmission_time: headers["paypal-transmission-time"],
      webhook_id:        webhookId,
      webhook_event:     JSON.parse(rawBody),
    }),
  });

  const data = await res.json();
  return data.verification_status === "SUCCESS";
}
