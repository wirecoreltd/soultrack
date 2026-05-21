// pages/api/paypal/webhook.js
export default async function handler(req, res) {
  console.log("[paypal/webhook] appelé:", req.method);
  return res.status(200).json({ received: true });
}
