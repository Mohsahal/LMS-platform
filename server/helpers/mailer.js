const nodemailer = require("nodemailer");

async function createTransport() {
  if (process.env.USE_JSON_MAIL === "true") {
    const transporter = nodemailer.createTransport({ jsonTransport: true });
    return { transporter, defaultTo: process.env.ADMIN_EMAIL || "mohammedsahal1243@gmail.com" };
  }
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    return { transporter, defaultTo: process.env.ADMIN_EMAIL || process.env.SMTP_USER };
  }

  // Ethereal fallback for development
  try {
    const testAccount = await nodemailer.createTestAccount();
    const transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    return { transporter, defaultTo: testAccount.user };
  } catch (e) {
    // Last-resort: JSON transport (does not send, but returns success for local dev)
    const transporter = nodemailer.createTransport({ jsonTransport: true });
    return { transporter, defaultTo: process.env.ADMIN_EMAIL || "mohammedsahal1243@gmail.com" };
  }
}

async function sendAdminContactEmail({ fromEmail, fromName, message, subject }) {
  const { transporter, defaultTo } = await createTransport();

  const adminEmail = process.env.ADMIN_EMAIL || defaultTo;

  const info = await transporter.sendMail({
    from: fromEmail ? `${fromName || fromEmail} <${fromEmail}>` : adminEmail,
    to: adminEmail,
    subject: subject || "New contact from e-learning platform",
    text: message,
    html: `<p>${(message || "").replace(/\n/g, "<br/>")}</p>`,
  });

  const previewUrl = nodemailer.getTestMessageUrl(info);
  return { messageId: info.messageId, previewUrl };
}

module.exports = { sendAdminContactEmail };


