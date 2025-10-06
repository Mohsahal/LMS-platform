const express = require("express");
const fetch = require("node-fetch");
const { sendAdminContactEmail } = require("../helpers/mailer");

const router = express.Router();

// Contact form handler with robust email delivery (SMTP/Ethereal/JSON -> Resend fallback)
const handleContactForm = async (req, res) => {
  console.log("=== Contact Form Request Started ===");
  console.log("Environment:", process.env.NODE_ENV);
  
  try {
    const { 
      fromEmail, 
      fromName, 
      phoneNumber,
      course,
      segment,
      institution,
      message, 
      subject 
    } = req.body || {};
    
    // Debug logging to see what values are received
    console.log("=== Contact Form Data Received ===");
    console.log("fromName:", fromName);
    console.log("fromEmail:", fromEmail);
    console.log("phoneNumber:", phoneNumber);
    console.log("course:", course);
    console.log("segment:", segment);
    console.log("institution:", institution);
    console.log("message:", message);
    console.log("===================================");
    
    if (!message) return res.status(400).json({ success: false, message: "message is required" });
    if (!fromEmail) return res.status(400).json({ success: false, message: "fromEmail is required" });
    if (!fromName) return res.status(400).json({ success: false, message: "fromName is required" });
    
    // 1) Try to send via internal mailer (SMTP/Ethereal/JSON)
    try {
      const result = await sendAdminContactEmail({
        fromEmail,
        fromName,
        phoneNumber,
        course,
        segment,
        institution,
        message,
        subject
      });

      return res.status(200).json({
        success: true,
        message: "Contact form submitted and email sent successfully!",
        data: {
          messageId: result?.messageId || ("contact-" + Date.now()),
          previewUrl: result?.previewUrl || null,
          timestamp: new Date().toISOString()
        }
      });
    } catch (primaryError) {
      console.error("Primary email send failed (mailer):", primaryError.message);

      // 2) Fallback: Try Resend API if configured
      if (process.env.RESEND_API_KEY) {
        try {
          console.log("Attempting fallback via Resend API...");

          const emailData = {
            from: process.env.ADMIN_EMAIL || "mohammedsahal1243@gmail.com",
            to: [process.env.ADMIN_EMAIL || "mohammedsahal1243@gmail.com"],
            reply_to: fromEmail,
            subject: subject || "New Contact Form Submission - BravyNex Engineering",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2>New Contact Form Submission</h2>
                
                <div style="background-color: #f8f9fa; padding: 20px; margin: 20px 0;">
                  <h3>Contact Information</h3>
                  <p><strong>Name:</strong> ${fromName}</p>
                  <p><strong>Email:</strong> ${fromEmail}</p>
                  <p><strong>Phone:</strong> ${phoneNumber || 'Not provided'}</p>
                  <p><strong>Course Interest:</strong> ${course || 'Not specified'}</p>
                  <p><strong>Segment:</strong> ${segment || 'Not specified'}</p>
                  <p><strong>Institution:</strong> ${institution || 'Not provided'}</p>
                </div>
                
                <div style="background-color: #f8f9fa; padding: 20px; margin: 20px 0;">
                  <h3>Message</h3>
                  <p>${message.replace(/\n/g, '<br/>')}</p>
                </div>
                
                <p style="text-align: center; color: #666; font-size: 12px;">
                  This email was sent from the BravyNex Engineering contact form.
                </p>
              </div>
            `,
            text: `
New Contact Form Submission

Name: ${fromName}
Email: ${fromEmail}
Phone: ${phoneNumber || 'Not provided'}
Course Interest: ${course || 'Not specified'}
Segment: ${segment || 'Not specified'}
Institution: ${institution || 'Not provided'}

Message:
${message}

---
This email was sent from the BravyNex Engineering contact form.
            `
          };

          const emailResponse = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(emailData)
          });

          if (!emailResponse.ok) {
            const errorText = await emailResponse.text();
            console.error("Resend API error:", emailResponse.status, errorText);
            throw new Error(`Email service error: ${emailResponse.status}`);
          }

          const emailResult = await emailResponse.json();
          console.log("Email sent successfully via Resend:", emailResult);

          return res.status(200).json({ 
            success: true, 
            message: "Contact form submitted and email sent successfully!", 
            data: { 
              messageId: emailResult.id || emailResult.data?.id,
              timestamp: new Date().toISOString()
            }
          });
        } catch (fallbackError) {
          console.error("Resend fallback failed:", fallbackError.message);
          // Still return success but log the email error to avoid blocking contact form UX
          return res.status(200).json({ 
            success: true, 
            message: "Contact form received (email delivery failed)", 
            data: { 
              messageId: "contact-" + Date.now(),
              timestamp: new Date().toISOString(),
              emailError: fallbackError.message
            }
          });
        }
      }

      // No fallback available: accept form and log
      console.log("No email service configured - message logged. Set SMTP env or RESEND_API_KEY to enable email.");
      return res.status(200).json({ 
        success: true, 
        message: "Contact form received successfully", 
        data: { 
          messageId: "contact-" + Date.now(),
          timestamp: new Date().toISOString()
        }
      });
    }
    
  } catch (e) {
    console.error("=== Contact Form Error ===");
    console.error("Error message:", e?.message);
    console.error("Error stack:", e?.stack);
    console.error("=========================");
    
    return res.status(200).json({ 
      success: false, 
      message: e?.message || "Failed to process contact form",
      error: process.env.NODE_ENV === 'development' ? e?.stack : undefined
    });
  }
};

router.post("/contact-admin", handleContactForm);

module.exports = router;