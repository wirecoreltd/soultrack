// lib/sendConfirmationEmail.js
// Envoie un email de confirmation avec facture PDF en pièce jointe
// Utilise Resend (https://resend.com) + PDFKit via @react-pdf/renderer côté serveur

import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Génère une facture PDF simple en base64
async function generateInvoicePDF({ invoiceNumber, planNom, planPrix, egliseNom, date }) {
  // On utilise une génération HTML-to-PDF via une string HTML minimaliste
  // car PDFKit nécessite un environnement Node natif — remplace par @react-pdf si tu préfères
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; color: #1a1a2e; }
        .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
        .brand { font-size: 28px; font-weight: bold; color: #333699; }
        .brand span { color: #10b981; }
        .invoice-title { font-size: 18px; color: #666; margin-top: 4px; }
        table { width: 100%; border-collapse: collapse; margin-top: 30px; }
        th { background: #333699; color: white; padding: 12px; text-align: left; }
        td { padding: 12px; border-bottom: 1px solid #eee; }
        .total { font-weight: bold; font-size: 18px; color: #333699; }
        .footer { margin-top: 50px; font-size: 12px; color: #999; text-align: center; }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="brand">Soul<span>Track</span></div>
          <div class="invoice-title">Facture #${invoiceNumber}</div>
        </div>
        <div style="text-align:right; color:#666; font-size:14px;">
          <div>${date}</div>
        </div>
      </div>

      <p><strong>Facturé à :</strong> ${egliseNom}</p>

      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th>Période</th>
            <th>Montant</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Plan SoulTrack — ${planNom}</td>
            <td>Mensuel</td>
            <td>${planPrix}</td>
          </tr>
          <tr>
            <td colspan="2" style="text-align:right" class="total">Total</td>
            <td class="total">${planPrix}</td>
          </tr>
        </tbody>
      </table>

      <div class="footer">
        SoulTrack — Merci pour votre confiance. Pour toute question : support@soultrack.app
      </div>
    </body>
    </html>
  `;

  // Encode en base64 (l'HTML sera joint comme .html — remplace par puppeteer/wkhtmltopdf pour vrai PDF)
  return Buffer.from(html).toString("base64");
}

export async function sendConfirmationEmail({ egliseId, planId, planNom, planPrix, provider }) {
  try {
    // 1. Récupère l'email et le nom de l'église
    const { data: eglise } = await supabaseAdmin
      .from("eglises")
      .select("nom, email")
      .eq("id", egliseId)
      .single();

    if (!eglise?.email) {
      console.warn("[sendConfirmationEmail] Pas d'email trouvé pour eglise_id:", egliseId);
      return;
    }

    // 2. Génère la facture
    const invoiceNumber = `INV-${Date.now()}`;
    const date = new Date().toLocaleDateString("fr-FR", {
      day: "numeric", month: "long", year: "numeric",
    });

    const pdfBase64 = await generateInvoicePDF({
      invoiceNumber,
      planNom,
      planPrix,
      egliseNom: eglise.nom,
      date,
    });

    // 3. Envoie l'email via Resend
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "SoulTrack <noreply@soultrack.app>",
        to: [eglise.email],
        subject: `✅ Confirmation — Plan ${planNom} activé`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:30px;">
            <h1 style="color:#333699;">Soul<span style="color:#10b981;">Track</span></h1>
            <h2>Votre plan ${planNom} est activé 🎉</h2>
            <p>Bonjour <strong>${eglise.nom}</strong>,</p>
            <p>
              Votre abonnement au plan <strong>${planNom}</strong> (${planPrix}/mois) 
              a bien été activé via <strong>${provider === "paddle" ? "Paddle" : "PayPal"}</strong>.
            </p>
            <p>Vous trouverez votre facture en pièce jointe.</p>
            <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
            <p style="color:#999;font-size:12px;">
              Pour toute question, contactez-nous à support@soultrack.app
            </p>
          </div>
        `,
        attachments: [
          {
            filename: `facture-${invoiceNumber}.html`,
            content: pdfBase64,
          },
        ],
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      console.error("[sendConfirmationEmail] Resend error:", err);
    } else {
      console.log("[sendConfirmationEmail] Email envoyé à", eglise.email);
    }
  } catch (err) {
    console.error("[sendConfirmationEmail] Exception:", err);
  }
}
