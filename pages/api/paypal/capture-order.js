// pages/api/paypal/capture-order.js
// Capture un paiement unique PayPal après approbation du client

import { capturePayPalOrder } from "../../../lib/paypal";
import { updateSubscription } from "../../../lib/updateSubscription";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { orderId } = req.body;
  if (!orderId) return res.status(400).json({ error: "orderId manquant" });

  try {
    const capture = await capturePayPalOrder(orderId);
    console.log("CAPTURE STATUS:", capture.status);
console.log("CUSTOM_ID RAW:", capture.purchase_units?.[0]?.custom_id);

    if (capture.status !== "COMPLETED") {
      return res.status(400).json({ error: "Paiement non complété", status: capture.status });
    }

    // Récupère eglise_id et plan_id depuis custom_id
    const customId   = capture.purchase_units?.[0]?.custom_id;
    const customData = customId ? JSON.parse(customId) : {};
    const { eglise_id: egliseId, plan_id: planId } = customData;

    if (!egliseId || !planId) {
      console.error("[paypal/capture-order] custom_id manquant dans la capture");
      return res.status(400).json({ error: "Données de commande manquantes" });
    }

    await updateSubscription({
      egliseId,
      planId,
      statut:   "active",
      provider: "paypal",
    });

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error("[paypal/capture-order]", err);
    return res.status(500).json({ error: err.message });
  }
}
