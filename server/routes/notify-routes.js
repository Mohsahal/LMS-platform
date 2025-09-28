const express = require("express");
const { sendAdminContactEmail } = require("../helpers/mailer");

const router = express.Router();

router.post("/contact-admin", async (req, res) => {
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
    
    // Promise.race to prevent hanging on SMTP
    const timeoutMs = Number(process.env.CONTACT_EMAIL_TIMEOUT_MS || 15000);
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Email service timeout")), timeoutMs);
    });

    const sendPromise = sendAdminContactEmail({ 
      fromEmail, 
      fromName, 
      phoneNumber,
      course,
      segment,
      institution,
      message, 
      subject 
    });

    const result = await Promise.race([sendPromise, timeoutPromise]);
    res.status(200).json({ success: true, message: "Email sent", data: result });
  } catch (e) {
    console.log("Mailer error:", e);
    res.status(502).json({ success: false, message: e?.message || "Failed to send email" });
  }
});

module.exports = router;


