const nodemailer = require("nodemailer");

// ─── Transporter ────────────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS, // Gmail App Password (not account password)
  },
});

// ─── Helpers ────────────────────────────────────────────────────────────────
const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount);

const buildItemsTable = (items) => {
  const rows = items
    .map(
      (item) => `
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid #f0ece4;">${
          item.product?.name || "Product"
        }</td>
        <td style="padding:10px 12px;border-bottom:1px solid #f0ece4;text-align:center;">${item.quantity}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #f0ece4;text-align:right;">${formatCurrency(
          item.price
        )}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #f0ece4;text-align:right;">${formatCurrency(
          item.price * item.quantity
        )}</td>
      </tr>`
    )
    .join("");

  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-top:16px;">
      <thead>
        <tr style="background:#f9f3ea;">
          <th style="padding:10px 12px;text-align:left;font-size:13px;color:#7a5c2e;">Product</th>
          <th style="padding:10px 12px;text-align:center;font-size:13px;color:#7a5c2e;">Qty</th>
          <th style="padding:10px 12px;text-align:right;font-size:13px;color:#7a5c2e;">Unit Price</th>
          <th style="padding:10px 12px;text-align:right;font-size:13px;color:#7a5c2e;">Subtotal</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
};

// ─── Base HTML wrapper ───────────────────────────────────────────────────────
const wrapHtml = (title, content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#fdf8f0;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#fdf8f0;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0"
               style="background:#ffffff;border-radius:12px;overflow:hidden;
                      box-shadow:0 4px 24px rgba(0,0,0,0.08);max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#c8860a 0%,#e6a020 100%);
                        padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:26px;letter-spacing:1px;">
                🛒 Marutham Stores
              </h1>
              <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">
                Premium Quality Products
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9f3ea;padding:20px 40px;text-align:center;
                        border-top:1px solid #ede8de;">
              <p style="margin:0;color:#a07840;font-size:12px;">
                © ${new Date().getFullYear()} Marutham Stores &nbsp;|&nbsp;
                <a href="https://www.maruthamstores.com"
                   style="color:#c8860a;text-decoration:none;">www.maruthamstores.com</a>
              </p>
              <p style="margin:6px 0 0;color:#c0a878;font-size:11px;">
                This is an automated email. Please do not reply.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

// ─── User confirmation email ─────────────────────────────────────────────────
const sendUserOrderEmail = async (order, userEmail, userName) => {
  const subtotal = order.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const total = subtotal + (order.shipping || 0);

  const content = `
    <h2 style="margin:0 0 6px;color:#2d2010;font-size:22px;">
      Thank you for your order, ${userName}! 🎉
    </h2>
    <p style="margin:0 0 24px;color:#6b5030;font-size:15px;">
      Your order has been placed successfully. We'll notify you once it's shipped.
    </p>

    <!-- Order Info -->
    <div style="background:#fdf8f0;border:1px solid #ede8de;border-radius:8px;
                padding:20px;margin-bottom:24px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="color:#7a5c2e;font-size:13px;padding-bottom:8px;">Order ID</td>
          <td style="color:#2d2010;font-size:13px;font-weight:600;
                     text-align:right;padding-bottom:8px;">#${order.code}</td>
        </tr>
        <tr>
          <td style="color:#7a5c2e;font-size:13px;padding-bottom:8px;">Payment Method</td>
          <td style="color:#2d2010;font-size:13px;font-weight:600;
                     text-align:right;padding-bottom:8px;">${order.payment_method}</td>
        </tr>
        <tr>
          <td style="color:#7a5c2e;font-size:13px;padding-bottom:8px;">Payment Status</td>
          <td style="text-align:right;padding-bottom:8px;">
            <span style="background:${order.is_paid ? "#d4edda" : "#fff3cd"};
                         color:${order.is_paid ? "#155724" : "#856404"};
                         padding:2px 10px;border-radius:20px;font-size:12px;font-weight:600;">
              ${order.is_paid ? "Paid" : "Pending"}
            </span>
          </td>
        </tr>
        <tr>
          <td style="color:#7a5c2e;font-size:13px;">Order Status</td>
          <td style="text-align:right;">
            <span style="background:#d1ecf1;color:#0c5460;
                         padding:2px 10px;border-radius:20px;font-size:12px;font-weight:600;">
              ${order.status}
            </span>
          </td>
        </tr>
      </table>
    </div>

    <!-- Items Table -->
    <h3 style="margin:0 0 4px;color:#2d2010;font-size:16px;">Order Items</h3>
    ${buildItemsTable(order.items)}

    <!-- Totals -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
      <tr>
        <td style="padding:6px 12px;color:#6b5030;font-size:14px;">Subtotal</td>
        <td style="padding:6px 12px;text-align:right;color:#2d2010;font-size:14px;">
          ${formatCurrency(subtotal)}
        </td>
      </tr>
      <tr>
        <td style="padding:6px 12px;color:#6b5030;font-size:14px;">Shipping</td>
        <td style="padding:6px 12px;text-align:right;color:#2d2010;font-size:14px;">
          ${order.shipping > 0 ? formatCurrency(order.shipping) : "FREE"}
        </td>
      </tr>
      <tr style="border-top:2px solid #ede8de;">
        <td style="padding:10px 12px;color:#2d2010;font-size:16px;font-weight:700;">Total</td>
        <td style="padding:10px 12px;text-align:right;color:#c8860a;
                   font-size:18px;font-weight:700;">
          ${formatCurrency(total)}
        </td>
      </tr>
    </table>

    <!-- Shipping Address -->
    <div style="margin-top:28px;background:#fdf8f0;border:1px solid #ede8de;
                border-radius:8px;padding:20px;">
      <h3 style="margin:0 0 12px;color:#2d2010;font-size:15px;">📦 Shipping Address</h3>
      <p style="margin:0;color:#4a3520;font-size:14px;line-height:1.6;">
        ${order.full_name}<br/>
        ${order.address}<br/>
        ${order.city}, ${order.state} – ${order.pincode}<br/>
        📞 ${order.phone}
      </p>
    </div>`;

  await transporter.sendMail({
    from: `"Marutham Stores" <${process.env.MAIL_USER}>`,
    to: userEmail,
    subject: `✅ Order Confirmed – #${order.code} | Marutham Stores`,
    html: wrapHtml("Order Confirmed", content),
  });
};

// ─── Admin notification email ────────────────────────────────────────────────
const sendAdminOrderEmail = async (order, userEmail, userName) => {
  const subtotal = order.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const total = subtotal + (order.shipping || 0);

  const content = `
    <h2 style="margin:0 0 6px;color:#2d2010;font-size:22px;">
      🔔 New Order Received!
    </h2>
    <p style="margin:0 0 24px;color:#6b5030;font-size:15px;">
      A new order has been placed on Marutham Stores. Please review and process it.
    </p>

    <!-- Customer Info -->
    <div style="background:#fdf8f0;border:1px solid #ede8de;border-radius:8px;
                padding:20px;margin-bottom:24px;">
      <h3 style="margin:0 0 12px;color:#2d2010;font-size:15px;">👤 Customer Details</h3>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="color:#7a5c2e;font-size:13px;padding-bottom:8px;">Name</td>
          <td style="color:#2d2010;font-size:13px;font-weight:600;
                     text-align:right;padding-bottom:8px;">${userName}</td>
        </tr>
        <tr>
          <td style="color:#7a5c2e;font-size:13px;padding-bottom:8px;">Email</td>
          <td style="color:#2d2010;font-size:13px;text-align:right;padding-bottom:8px;">
            ${userEmail}
          </td>
        </tr>
        <tr>
          <td style="color:#7a5c2e;font-size:13px;">Phone</td>
          <td style="color:#2d2010;font-size:13px;text-align:right;">${order.phone}</td>
        </tr>
      </table>
    </div>

    <!-- Order Summary -->
    <div style="background:#fdf8f0;border:1px solid #ede8de;border-radius:8px;
                padding:20px;margin-bottom:24px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="color:#7a5c2e;font-size:13px;padding-bottom:8px;">Order ID</td>
          <td style="color:#2d2010;font-size:13px;font-weight:600;
                     text-align:right;padding-bottom:8px;">#${order.code}</td>
        </tr>
        <tr>
          <td style="color:#7a5c2e;font-size:13px;padding-bottom:8px;">Payment Method</td>
          <td style="color:#2d2010;font-size:13px;font-weight:600;
                     text-align:right;padding-bottom:8px;">${order.payment_method}</td>
        </tr>
        <tr>
          <td style="color:#7a5c2e;font-size:13px;">Payment Status</td>
          <td style="text-align:right;">
            <span style="background:${order.is_paid ? "#d4edda" : "#fff3cd"};
                         color:${order.is_paid ? "#155724" : "#856404"};
                         padding:2px 10px;border-radius:20px;font-size:12px;font-weight:600;">
              ${order.is_paid ? "Paid" : "Pending"}
            </span>
          </td>
        </tr>
      </table>
    </div>

    <!-- Items Table -->
    <h3 style="margin:0 0 4px;color:#2d2010;font-size:16px;">Order Items</h3>
    ${buildItemsTable(order.items)}

    <!-- Totals -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
      <tr>
        <td style="padding:6px 12px;color:#6b5030;font-size:14px;">Subtotal</td>
        <td style="padding:6px 12px;text-align:right;color:#2d2010;font-size:14px;">
          ${formatCurrency(subtotal)}
        </td>
      </tr>
      <tr>
        <td style="padding:6px 12px;color:#6b5030;font-size:14px;">Shipping</td>
        <td style="padding:6px 12px;text-align:right;color:#2d2010;font-size:14px;">
          ${order.shipping > 0 ? formatCurrency(order.shipping) : "FREE"}
        </td>
      </tr>
      <tr style="border-top:2px solid #ede8de;">
        <td style="padding:10px 12px;color:#2d2010;font-size:16px;font-weight:700;">Total</td>
        <td style="padding:10px 12px;text-align:right;color:#c8860a;
                   font-size:18px;font-weight:700;">
          ${formatCurrency(total)}
        </td>
      </tr>
    </table>

    <!-- Shipping Address -->
    <div style="margin-top:28px;background:#fdf8f0;border:1px solid #ede8de;
                border-radius:8px;padding:20px;">
      <h3 style="margin:0 0 12px;color:#2d2010;font-size:15px;">📦 Delivery Address</h3>
      <p style="margin:0;color:#4a3520;font-size:14px;line-height:1.6;">
        ${order.full_name}<br/>
        ${order.address}<br/>
        ${order.city}, ${order.state} – ${order.pincode}<br/>
        📞 ${order.phone}
      </p>
    </div>

    <div style="margin-top:28px;text-align:center;">
      <a href="${process.env.ADMIN_URL || "https://maruthamstores.com/admin"}/orders"
         style="display:inline-block;background:linear-gradient(135deg,#c8860a,#e6a020);
                color:#ffffff;padding:12px 32px;border-radius:8px;font-size:14px;
                font-weight:600;text-decoration:none;letter-spacing:0.5px;">
        View Order in Dashboard →
      </a>
    </div>`;

  await transporter.sendMail({
    from: `"Marutham Stores" <${process.env.MAIL_USER}>`,
    to: process.env.ADMIN_MAIL,
    subject: `🛒 New Order #${order.code} – ${formatCurrency(total)} | Marutham Stores`,
    html: wrapHtml("New Order Notification", content),
  });
};

module.exports = { sendUserOrderEmail, sendAdminOrderEmail };
