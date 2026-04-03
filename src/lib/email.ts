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
        "Authorization": `Bearer ${RESEND_API_KEY}`,
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
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0f172a; color: #e2e8f0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: #1e293b; border-radius: 16px; overflow: hidden;">
    <div style="background: linear-gradient(135deg, #0ea5e9, #2563eb); padding: 30px; text-align: center;">
      <h1 style="margin: 0; color: white; font-size: 24px;">🌍 OW SIM</h1>
      <p style="color: #bae6fd; margin: 8px 0 0 0;">Order Confirmed!</p>
    </div>

    <div style="padding: 30px;">
      <p style="color: #94a3b8;">Hi ${order.customerName || "there"},</p>
      <p style="color: #94a3b8;">Thank you for your order! Your eSIM is ready.</p>

      <div style="background: #0f172a; border-radius: 12px; padding: 20px; margin: 20px 0;">
        <p style="margin: 0 0 8px 0; color: #64748b; font-size: 12px;">ORDER #${order.id}</p>
        <p style="margin: 0; color: white; font-size: 24px; font-weight: bold;">$${order.totalAmount.toFixed(2)}</p>
      </div>

      ${order.items.map((item) => `
      <div style="background: #0f172a; border-radius: 12px; padding: 20px; margin: 16px 0;">
        <h3 style="color: white; margin: 0 0 8px 0;">${item.planName}</h3>
        <p style="color: #94a3b8; margin: 0 0 12px 0;">$${item.price.toFixed(2)} × ${item.quantity}</p>

        ${item.qrImage ? `
        <div style="text-align: center; margin: 16px 0;">
          <img src="${item.qrImage}" alt="eSIM QR Code" style="width: 200px; height: 200px; background: white; border-radius: 12px; padding: 8px;" />
        </div>
        ` : ''}

        ${item.iccid ? `<p style="color: #64748b; font-size: 12px; margin: 8px 0 0 0;">ICCID: <span style="color: #0ea5e9;">${item.iccid}</span></p>` : ''}
        ${item.activationCode ? `<p style="color: #64748b; font-size: 12px; margin: 4px 0 0 0;">Activation: <span style="color: #0ea5e9;">${item.activationCode}</span></p>` : ''}
        ${item.lpaString ? `<p style="color: #64748b; font-size: 12px; margin: 4px 0 0 0;">LPA: <span style="color: #10b981;">${item.lpaString}</span></p>` : ''}
      </div>
      `).join('')}

      <div style="margin: 24px 0; padding: 20px; background: #065f46; border-radius: 12px;">
        <p style="margin: 0; color: #6ee7b7;">📱 To activate: Settings → Cellular → Add eSIM → Scan QR Code</p>
      </div>

      <p style="color: #64748b; font-size: 12px; text-align: center; margin-top: 30px;">
        OW SIM - OpenWorld eSIM<br>
        <a href="https://owsim.com" style="color: #0ea5e9;">owsim.com</a>
      </p>
    </div>
  </div>
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
    ${order.items.map((i) => `<li>${i.planName} - $${i.price.toFixed(2)}</li>`).join('')}
  </ul>
  <p><a href="https://owsim.com/admin/orders">View in Admin Dashboard</a></p>
</body>
</html>
  `;
}