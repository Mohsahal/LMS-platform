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

async function sendAdminContactEmail({ 
  fromEmail, 
  fromName, 
  phoneNumber,
  course,
  segment,
  institution,
  message, 
  subject 
}) {
  const { transporter, defaultTo } = await createTransport();
  const adminEmail = process.env.ADMIN_EMAIL || defaultTo;

  // Debug what we received
  console.log("=== Mailer Received Values ===");
  console.log("fromName:", fromName);
  console.log("fromEmail:", fromEmail);
  console.log("phoneNumber:", phoneNumber);
  console.log("course:", course);
  console.log("segment:", segment);
  console.log("institution:", institution);
  console.log("message:", message);
  console.log("=============================");

  // Simple, direct approach - handle empty strings properly
  const displayName = (fromName && fromName.trim() !== '') ? fromName : 'Not provided';
  const displayEmail = (fromEmail && fromEmail.trim() !== '') ? fromEmail : 'Not provided';
  const displayPhone = (phoneNumber && phoneNumber.trim() !== '') ? phoneNumber : 'Not provided';
  const displayCourse = (course && course.trim() !== '') ? course : 'Not specified';
  const displaySegment = (segment && segment.trim() !== '') ? segment : 'Not specified';
  const displayInstitution = (institution && institution.trim() !== '') ? institution : 'Not provided';
  const displayMessage = (message && message.trim() !== '') ? message : 'No message provided';

  console.log("=== Processed Display Values ===");
  console.log("displayName:", displayName);
  console.log("displayEmail:", displayEmail);
  console.log("displayPhone:", displayPhone);
  console.log("displayCourse:", displayCourse);
  console.log("displaySegment:", displaySegment);
  console.log("displayInstitution:", displayInstitution);
  console.log("displayMessage:", displayMessage);
  console.log("===============================");

  // Simple text email
  const emailText = `
New Contact Form Submission

Name: ${displayName}
Email: ${displayEmail}
Phone: ${displayPhone}
Course Interest: ${displayCourse}
Segment: ${displaySegment}
Institution: ${displayInstitution}

Message:
${displayMessage}

---
This email was sent from the BravyNex Engineering contact form.
  `.trim();

  // Simple HTML email
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2>New Contact Form Submission</h2>
      
      <div style="background-color: #f8f9fa; padding: 20px; margin: 20px 0;">
        <h3>Contact Information</h3>
        <p><strong>Name:</strong> ${displayName}</p>
        <p><strong>Email:</strong> ${displayEmail}</p>
        <p><strong>Phone:</strong> ${displayPhone}</p>
        <p><strong>Course Interest:</strong> ${displayCourse}</p>
        <p><strong>Segment:</strong> ${displaySegment}</p>
        <p><strong>Institution:</strong> ${displayInstitution}</p>
      </div>
      
      <div style="background-color: #f8f9fa; padding: 20px; margin: 20px 0;">
        <h3>Message</h3>
        <p>${displayMessage.replace(/\n/g, '<br/>')}</p>
      </div>
      
      <p style="text-align: center; color: #666; font-size: 12px;">
        This email was sent from the BravyNex Engineering contact form.
      </p>
    </div>
  `;

  const info = await transporter.sendMail({
    from: fromEmail ? `${fromName || fromEmail} <${fromEmail}>` : adminEmail,
    to: adminEmail,
    subject: subject || "New contact form submission - BravyNex Engineering",
    text: emailText,
    html: emailHtml,
  });

  const previewUrl = nodemailer.getTestMessageUrl(info);
  return { messageId: info.messageId, previewUrl };
}

async function sendOTPEmail({ email, otp }) {
  const { transporter, defaultTo } = await createTransport();

  const info = await transporter.sendMail({
    from: process.env.ADMIN_EMAIL || defaultTo,
    to: email,
    subject: "Password Reset OTP",
    text: `Your OTP for password reset is: ${otp}. This OTP will expire in 10 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset Request</h2>
        <p>You have requested to reset your password. Use the following OTP to proceed:</p>
        <div style="background: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; letter-spacing: 5px; margin: 20px 0;">
          <strong>${otp}</strong>
        </div>
        <p>This OTP will expire in 10 minutes.</p>
        <p>If you didn't request this password reset, please ignore this email.</p>
      </div>
    `,
  });

  const previewUrl = nodemailer.getTestMessageUrl(info);
  return { messageId: info.messageId, previewUrl };
}

module.exports = { sendAdminContactEmail, sendOTPEmail };


