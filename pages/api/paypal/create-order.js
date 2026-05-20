// pages/api/paypal/create-order.js
// Crée un order PayPal (paiement unique) ou un abonnement récurrent
export default async function handler(req, res) {
  console.log("API HIT OK");

  return res.status(200).json({
    ok: true,
    body: req.body,
  });
}
