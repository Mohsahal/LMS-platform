const express = require("express");

const router = express.Router();

// Simple contact form handler that doesn't depend on external services
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
    
    // For now, just log the contact form data and return success
    // This prevents 502 errors while we debug the email service
    console.log("=== Contact Form Successfully Processed ===");
    console.log("Contact details logged to server console");
    console.log("===========================================");
    
    return res.status(200).json({ 
      success: true, 
      message: "Contact form received successfully", 
      data: { 
        messageId: "contact-" + Date.now(),
        timestamp: new Date().toISOString()
      }
    });
    
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