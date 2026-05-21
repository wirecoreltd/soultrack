import { capturePayPalOrder } from "../../../lib/paypal";
import { updateSubscription } from "../../../lib/updateSubscription";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { orderId } = req.body;
  console.log("CAPTURE orderId:", orderId);
  if (!orderId) return res.status(400).json({ error: "orderId manquant" });

  try {
    const capture = await capturePayPalOrder(orderId);
    console.log("CAPTURE FULL JSON:", JSON.stringify(capture));

    if (capture.status !== "COMPLETED") {
      return res.status(400).json({ error: "Paiement non complété", status: capture.status });
    }

    // PayPal met custom_id dans purchase_units[0].custom_id
    // mais aussi parfois dans purchase_units[0].payments.captures[0].custom_id
    const unit = capture.purchase_units?.[0];
    const customId =
      unit?.custom_id ||
      unit?.payments?.captures?.[0]?.custom_id;

    console.log("CUSTOM_ID trouvé:", customId);

    const customData = customId ? JSON.parse(customId) : {};
    const { eglise_id: egliseId, plan_id: planId } = customData;

    if (!egliseId || !planId) {
      console.error("custom_id manquant, unit:", JSON.stringify(unit));
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
