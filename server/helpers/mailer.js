const nodemailer = require("nodemailer");

async function createTransport() {
  // Use JSON transport if explicitly enabled (for testing)
  if (process.env.USE_JSON_MAIL === "true") {
    console.log("Using JSON transport for email (emails won't be actually sent)");
    const transporter = nodemailer.createTransport({ jsonTransport: true });
    return { transporter, defaultTo: process.env.ADMIN_EMAIL };
  }

  // Use SMTP if configured
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    console.log("Configuring SMTP transporter for production...");
    
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      // Gmail specific settings
      tls: {
        rejectUnauthorized: false
      },
      // Reduced timeouts for faster response on Render
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
    });

    // Skip verification in production to avoid timeout
    if (process.env.NODE_ENV === 'production') {
      console.log("⚡ Production: Skipping SMTP verification for faster startup");
      return { 
        transporter, 
        defaultTo: process.env.ADMIN_EMAIL || process.env.SMTP_USER 
      };
    }

    // Verify SMTP connection in development with timeout
    try {
      const verifyPromise = transporter.verify();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Verification timeout')), 8000)
      );
      
      await Promise.race([verifyPromise, timeoutPromise]);
      console.log("✅ SMTP connection verified successfully");
      return { 
        transporter, 
        defaultTo: process.env.ADMIN_EMAIL || process.env.SMTP_USER 
      };
    } catch (error) {
      console.error("❌ SMTP connection failed:", error.message);
      
      // Fallback to JSON transport if SMTP fails
      console.log("🔄 Falling back to JSON transport due to SMTP failure");
      const fallbackTransporter = nodemailer.createTransport({ jsonTransport: true });
      return { 
        transporter: fallbackTransporter, 
        defaultTo: process.env.ADMIN_EMAIL,
        isFallback: true
      };
    }
  }

  // Final fallback: JSON transport
  console.log("⚠️ No SMTP configured, using JSON transport");
  const transporter = nodemailer.createTransport({ jsonTransport: true });
  return { 
    transporter, 
    defaultTo: process.env.ADMIN_EMAIL,
    isFallback: true
  };
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
  const { transporter, defaultTo, isFallback } = await createTransport();
  const adminEmail = process.env.ADMIN_EMAIL || defaultTo;

  // Process values
  const displayName = (fromName && fromName.trim() !== '') ? fromName : 'Not provided';
  const displayEmail = (fromEmail && fromEmail.trim() !== '') ? fromEmail : 'Not provided';
  const displayPhone = (phoneNumber && phoneNumber.trim() !== '') ? phoneNumber : 'Not provided';
  const displayCourse = (course && course.trim() !== '') ? course : 'Not specified';
  const displaySegment = (segment && segment.trim() !== '') ? segment : 'Not specified';
  const displayInstitution = (institution && institution.trim() !== '') ? institution : 'Not provided';
  const displayMessage = (message && message.trim() !== '') ? message : 'No message provided';

  // Email content
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

  const fromAddress = process.env.SMTP_USER || process.env.ADMIN_EMAIL || defaultTo;
  
  console.log(`📧 Sending email from: ${fromAddress} to: ${adminEmail}`);
  
  try {
    // Add timeout to email sending
    const sendPromise = transporter.sendMail({
      from: `"BravyNex Engineering" <${fromAddress}>`,
      to: adminEmail,
      replyTo: fromEmail && fromEmail.trim() !== '' ? fromEmail : undefined,
      subject: subject || "New contact form submission - BravyNex Engineering",
      text: emailText,
      html: emailHtml,
    });

    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Email send timeout')), 20000)
    );

    const info = await Promise.race([sendPromise, timeoutPromise]);

    if (isFallback || process.env.USE_JSON_MAIL === "true") {
      console.log("📨 Email data prepared (JSON transport - check logs for content)");
      console.log("Email content:", emailText);
    } else {
      console.log("✅ Email sent successfully:", info.messageId);
    }

    return { 
      messageId: info.messageId, 
      success: true,
      method: isFallback ? 'json' : 'smtp'
    };
  } catch (error) {
    console.error("❌ Error sending email:", error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
}

async function sendOTPEmail({ email, otp }) {
  const { transporter, defaultTo, isFallback } = await createTransport();
  const fromAddress = process.env.SMTP_USER || process.env.ADMIN_EMAIL || defaultTo;
  
  console.log(`📧 Sending OTP email to: ${email}`);
  
  try {
    // Add timeout to email sending
    const sendPromise = transporter.sendMail({
      from: `"BravyNex Engineering" <${fromAddress}>`,
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

    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Email send timeout')), 20000)
    );

    const info = await Promise.race([sendPromise, timeoutPromise]);

    if (isFallback || process.env.USE_JSON_MAIL === "true") {
      console.log("📨 OTP email data prepared (JSON transport)");
      console.log(`OTP for ${email}: ${otp}`);
    } else {
      console.log("✅ OTP email sent successfully:", info.messageId);
    }

    return { 
      messageId: info.messageId, 
      success: true,
      method: isFallback ? 'json' : 'smtp'
    };
  } catch (error) {
    console.error("❌ Error sending OTP email:", error);
    throw new Error(`Failed to send OTP email: ${error.message}`);
  }
}

module.exports = { sendAdminContactEmail, sendOTPEmail };
