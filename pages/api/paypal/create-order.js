import {
  createPayPalOrder,
  createPayPalSubscription,
  PAYPAL_PLAN_IDS,
} from "../../../lib/paypal";

export default async function handler(req, res) {
  return res.status(200).json({ ok: true });
}
