const RESEND_API_KEY = process.env.RESEND_API_KEY;

interface EmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailParams): Promise<boolean> {
  if (!RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not set, skipping email");
    return false;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + RESEND_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "OW SIM <noreply@owsim.com>",
        to: [to],
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Email send failed:", err);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Email error:", error);
    return false;
  }
}

export function getOrderConfirmationHtml(order: {
  id: number;
  totalAmount: number;
  customerName?: string | null;
  items: { planName: string; price: number; quantity: number; qrImage?: string | null; activationCode?: string | null; iccid?: string | null; lpaString?: string | null }[];
}): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; margin: 0; padding: 20px;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
    <!-- Header -->
    <tr>
      <td style="background: linear-gradient(135deg, #0284c7, #0ea5e9); padding: 32px; text-align: center;">
        <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">🌍 OW SIM</h1>
        <p style="color: #bae6fd; margin: 8px 0 0 0; font-size: 16px;">Your eSIM is Ready!</p>
      </td>
    </tr>

    <!-- Content -->
    <tr>
      <td style="padding: 32px;">
        <p style="color: #475569; font-size: 16px; margin: 0 0 8px 0;">Hi ${order.customerName || "there"},</p>
        <p style="color: #475569; font-size: 14px; margin: 0 0 24px 0;">Thank you for your purchase! Your eSIM has been activated and is ready to use.</p>

        <!-- Order Summary -->
        <div style="background: #f1f5f9; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
          <p style="margin: 0 0 4px 0; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Order #${order.id}</p>
          <p style="margin: 0; color: #0f172a; font-size: 28px; font-weight: 700;">$${order.totalAmount.toFixed(2)}</p>
        </div>

        <!-- eSIM Details -->
        ${order.items.map((item) => `
        <div style="border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 16px;">
          <h3 style="color: #0f172a; margin: 0 0 12px 0; font-size: 16px;">📱 ${item.planName}</h3>
          <p style="color: #64748b; font-size: 14px; margin: 0 0 16px 0;">$${item.price.toFixed(2)} × ${item.quantity}</p>

          ${item.qrImage ? `
          <div style="text-align: center; margin: 20px 0; padding: 16px; background: #ffffff; border: 2px dashed #cbd5e1; border-radius: 12px;">
            <p style="color: #475569; font-size: 12px; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.5px;">📷 Scan QR Code</p>
            <img src="${item.qrImage}" alt="eSIM QR Code" style="width: 180px; height: 180px; border-radius: 8px;" />
          </div>
          ` : ''}

          ${item.iccid ? `
          <div style="background: #f8fafc; border-radius: 8px; padding: 12px; margin-bottom: 12px;">
            <p style="color: #64748b; font-size: 11px; margin: 0 0 4px 0; text-transform: uppercase;">ICCID</p>
            <p style="color: #0284c7; font-size: 14px; margin: 0; font-family: monospace; font-weight: 600;">${item.iccid}</p>
          </div>
          ` : ''}

          ${item.lpaString ? `
          <div style="background: #ecfdf5; border-radius: 8px; padding: 12px; margin-bottom: 12px; border: 1px solid #a7f3d0;">
            <p style="color: #059669; font-size: 11px; margin: 0 0 4px 0; text-transform: uppercase;">🔗 LPA String (Manual Activation)</p>
            <p style="color: #047857; font-size: 12px; margin: 0; font-family: monospace; word-break: break-all;">${item.lpaString}</p>
          </div>
          ` : ''}

          ${item.activationCode ? `
          <div style="background: #fef3c7; border-radius: 8px; padding: 12px; margin-bottom: 12px; border: 1px solid #fde68a;">
            <p style="color: #d97706; font-size: 11px; margin: 0 0 4px 0; text-transform: uppercase;">⚡ Activation Code</p>
            <p style="color: #92400e; font-size: 14px; margin: 0; font-family: monospace; font-weight: 600;">${item.activationCode}</p>
          </div>
          ` : ''}
        </div>
        `).join('')}

        <!-- Installation Instructions -->
        <div style="background: linear-gradient(135deg, #0ea5e9, #0284c7); border-radius: 12px; padding: 24px; margin-top: 24px;">
          <h4 style="color: #ffffff; margin: 0 0 16px 0; font-size: 16px;">📲 How to Install Your eSIM</h4>
          
          <div style="margin-bottom: 16px;">
            <p style="color: #ffffff; font-size: 14px; font-weight: 600; margin: 0 0 8px 0;">📱 iOS (iPhone):</p>
            <ol style="color: #bae6fd; font-size: 13px; margin: 0; padding-left: 20px;">
              <li style="margin-bottom: 4px;">Settings → Cellular → Add Cellular Plan</li>
              <li style="margin-bottom: 4px;">Scan the QR code above</li>
              <li>Or tap "Enter Details Manually" and use the LPA String</li>
            </ol>
          </div>
          
          <div>
            <p style="color: #ffffff; font-size: 14px; font-weight: 600; margin: 0 0 8px 0;">🤖 Android:</p>
            <ol style="color: #bae6fd; font-size: 13px; margin: 0; padding-left: 20px;">
              <li style="margin-bottom: 4px;">Settings → Network & Internet → SIM cards</li>
              <li style="margin-bottom: 4px;">Add carrier plan or scan QR</li>
              <li>Use LPA String if QR scan fails</li>
            </ol>
          </div>
        </div>

        <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 24px;">
          Need help? Reply to this email or visit <a href="https://owsim.com/support" style="color: #0284c7;">owsim.com/support</a>
        </p>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="background: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
        <p style="color: #64748b; font-size: 12px; margin: 0;">
          <strong>OW SIM</strong> - OpenWorld eSIM<br>
          <a href="https://owsim.com" style="color: #0284c7; text-decoration: none;">owsim.com</a>
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

export function getOrderConfirmationAdminHtml(order: {
  id: number;
  totalAmount: number;
  customerName?: string | null;
  customerEmail?: string | null;
  items: { planName: string; price: number }[];
}): string {
  return `
<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; padding: 20px;">
  <h2>🆕 New Order #${order.id}</h2>
  <p><strong>Amount:</strong> $${order.totalAmount.toFixed(2)}</p>
  <p><strong>Customer:</strong> ${order.customerName || "N/A"} (${order.customerEmail || "N/A"})</p>
  <h3>Items:</h3>
  <ul>
    ${order.items.map((i) => "<li>" + i.planName + " - $" + i.price.toFixed(2) + "</li>").join("")}
  </ul>
  <p><a href="https://owsim.com/admin/orders">View in Admin Dashboard</a></p>
</body>
</html>
  `;
}