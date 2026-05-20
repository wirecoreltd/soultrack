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

  const text = await res.text(); // 🔥 IMPORTANT

  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    console.error("❌ PAYPAL NON-JSON RESPONSE:", text);
    throw new Error("PayPal returned HTML instead of JSON");
  }

  if (!res.ok) {
    console.error("❌ PAYPAL ERROR:", data);
    throw new Error(data?.message || "PayPal API error");
  }

  return data;
}
