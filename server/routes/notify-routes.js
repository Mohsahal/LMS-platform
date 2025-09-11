const express = require("express");
const { sendAdminContactEmail } = require("../helpers/mailer");

const router = express.Router();

router.post("/contact-admin", async (req, res) => {
  try {
    const { fromEmail, fromName, message, subject } = req.body || {};
    if (!message) return res.status(400).json({ success: false, message: "message is required" });
    if (!fromEmail) return res.status(400).json({ success: false, message: "fromEmail is required" });
    const result = await sendAdminContactEmail({ fromEmail, fromName, message, subject });
    res.status(200).json({ success: true, message: "Email sent", data: result });
  } catch (e) {
    console.log("Mailer error:", e);
    res.status(500).json({ success: false, message: e?.message || "Failed to send email" });
  }
});

module.exports = router;


