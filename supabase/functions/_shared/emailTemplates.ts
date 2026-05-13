export function wrapEmail(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Style Saplings</title>
</head>
<body style="margin:0;padding:0;background:#FAF7F2;font-family:Arial,Helvetica,sans-serif;color:#333;">
  <!-- Header -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#C4622D;">
    <tr>
      <td align="center" style="padding:24px 16px;">
        <span style="font-family:Georgia,serif;font-size:24px;font-weight:bold;color:#ffffff;letter-spacing:1px;">
          Style Saplings 🌿
        </span>
      </td>
    </tr>
  </table>

  <!-- Body -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF7F2;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;max-width:600px;width:100%;">
          <tr>
            <td style="padding:32px 24px;">
              ${content}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>

  <!-- Footer -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF7F2;">
    <tr>
      <td align="center" style="padding:24px 16px;">
        <p style="font-size:12px;color:#999;margin:0 0 4px;">
          Style Saplings · Shivaya Enterprises · Vasant Kunj, New Delhi 110070
        </p>
        <p style="font-size:12px;color:#999;margin:0 0 4px;">
          Questions? <a href="mailto:support@stylesaplings.com" style="color:#C4622D;">support@stylesaplings.com</a>
        </p>
        <p style="font-size:11px;color:#bbb;margin:0;">
          <a href="mailto:support@stylesaplings.com?subject=Unsubscribe" style="color:#bbb;">Unsubscribe</a>
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function orderItemsTable(items: Array<{
  name: string;
  size?: string;
  quantity: number;
  price: number;
}>): string {
  const rows = items
    .map(
      (item) => `
    <tr>
      <td style="padding:8px 4px;border-bottom:1px solid #eee;font-size:14px;">${item.name}${item.size ? ` <span style="color:#999;">(${item.size})</span>` : ""}</td>
      <td style="padding:8px 4px;border-bottom:1px solid #eee;font-size:14px;text-align:center;">${item.quantity}</td>
      <td style="padding:8px 4px;border-bottom:1px solid #eee;font-size:14px;text-align:right;">₹${(item.price * item.quantity).toLocaleString("en-IN")}</td>
    </tr>`
    )
    .join("");

  return `
  <table width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;">
    <thead>
      <tr style="background:#FAF7F2;">
        <th style="padding:8px 4px;text-align:left;font-size:12px;text-transform:uppercase;color:#999;">Product</th>
        <th style="padding:8px 4px;text-align:center;font-size:12px;text-transform:uppercase;color:#999;">Qty</th>
        <th style="padding:8px 4px;text-align:right;font-size:12px;text-transform:uppercase;color:#999;">Price</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>`;
}

export function ctaButton(text: string, url: string): string {
  return `
  <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
    <tr>
      <td align="center">
        <a href="${url}" style="display:inline-block;background:#C4622D;color:#ffffff;font-size:14px;font-weight:bold;padding:12px 32px;border-radius:6px;text-decoration:none;">
          ${text}
        </a>
      </td>
    </tr>
  </table>`;
}

export function taxInvoiceNote(invoiceNumber: string): string {
  return `
  <p style="font-size:12px;color:#999;margin-top:16px;border-top:1px solid #eee;padding-top:12px;">
    Tax Invoice #${invoiceNumber} · This is a computer-generated invoice and does not require a signature.
  </p>`;
}

export function formatCurrency(amount: number): string {
  return `₹${Number(amount).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}
