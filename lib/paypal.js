// lib/paypal.js
// PayPal REST API v2 client (SAFE + PRODUCTION READY)

const PAYPAL_BASE =
  process.env.PAYPAL_MODE === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

// Cache token
let _accessToken = null;
let _tokenExpiry = 0;

/**
 * Get PayPal Access Token
 */
async function getAccessToken() {
  if (_accessToken && Date.now() < _tokenExpiry) {
    return _accessToken;
  }

  console.log("===== PAYPAL DEBUG =====");
  console.log("MODE:", process.env.PAYPAL_MODE);
  console.log("BASE:", PAYPAL_BASE);
  console.log("CLIENT ID OK:", !!process.env.PAYPAL_CLIENT_ID);
  console.log("SECRET OK:", !!process.env.PAYPAL_CLIENT_SECRET);

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

  const text = await res.text();

  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    console.error("❌ PAYPAL TOKEN NON JSON:", text);
    throw new Error("PayPal auth invalid response");
  }

  if (!res.ok) {
    console.error("❌ PAYPAL AUTH ERROR:", data);
    throw new Error(data.error_description || "PayPal auth failed");
  }

  _accessToken = data.access_token;
  _tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;

  return _accessToken;
}

/**
 * Core request helper
 */
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

  const text = await res.text();

  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    console.error("❌ PAYPAL NON-JSON RESPONSE:", text);
    throw new Error("PayPal returned invalid JSON (HTML received)");
  }

  if (!res.ok) {
    console.error("❌ PAYPAL API ERROR:", data);
    throw new Error(data?.message || "PayPal API error");
  }

  return data;
}

// ==========================
// PLANS
// ==========================
const PLAN_PRICES = {
  starter: "19.00",
  vision: "39.00",
  expansion: "79.00",
  enterprise: "99.00",
};

// ==========================
// CREATE ORDER
// ==========================
export async function createPayPalOrder({ planId, planNom, egliseId }) {
  const amount = PLAN_PRICES[planId];
  if (!amount) throw new Error("Plan non payant");

  return paypalRequest("POST", "/v2/checkout/orders", {
    intent: "CAPTURE",
    purchase_units: [
      {
        reference_id: planId,
        description: `SoulTrack — Plan ${planNom}`,
        amount: {
          currency_code: "USD",
          value: amount,
        },
        custom_id: JSON.stringify({
          eglise_id: egliseId,
          plan_id: planId,
        }),
      },
    ],
    application_context: {
      brand_name: "SoulTrack",
      locale: "fr-FR",
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/administrateur/subscription?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/administrateur/subscription?cancelled=true`,
    },
  });
}

// ==========================
// CAPTURE ORDER
// ==========================
export async function capturePayPalOrder(orderId) {
  return paypalRequest(
    "POST",
    `/v2/checkout/orders/${orderId}/capture`
  );
}

// ==========================
// SUBSCRIPTIONS
// ==========================
export const PAYPAL_PLAN_IDS = {
  starter: "P-XXXX_starter",
  vision: "P-XXXX_vision",
  expansion: "P-XXXX_expansion",
};

export async function createPayPalSubscription({
  planId,
  egliseId,
  email,
}) {
  const paypalPlanId = PAYPAL_PLAN_IDS[planId];
  if (!paypalPlanId) throw new Error("Pas de plan PayPal");

  return paypalRequest("POST", "/v1/billing/subscriptions", {
    plan_id: paypalPlanId,
    subscriber: {
      email_address: email,
    },
    custom_id: JSON.stringify({
      eglise_id: egliseId,
      plan_id: planId,
    }),
    application_context: {
      brand_name: "SoulTrack",
      locale: "fr-FR",
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/administrateur/subscription?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/administrateur/subscription?cancelled=true`,
    },
  });
}
