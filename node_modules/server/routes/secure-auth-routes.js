const express = require("express");
const { 
  secureRegisterUser, 
  secureLoginUser, 
  secureInitiatePasswordReset, 
  secureVerifyPasswordReset 
} = require("../controllers/auth-controller/secure-auth-controller");
const { secureContactSubmission } = require("../controllers/secure-contact-controller");
const { 
  bruteForceProtection, 
  registrationProtection, 
  contactFormProtection, 
  passwordResetProtection,
  sanitizeInput,
  xssProtection,
  securityLoggerMiddleware
} = require("../middleware/security-middleware");
const authenticateMiddleware = require("../middleware/auth-middleware");
const router = express.Router();

// Apply security middleware to all routes
router.use(securityLoggerMiddleware);
router.use(xssProtection);
router.use(sanitizeInput);

// Authentication routes with enhanced security
router.post("/register", registrationProtection, secureRegisterUser);
router.post("/login", bruteForceProtection, secureLoginUser);
router.post("/forgot-password", passwordResetProtection, secureInitiatePasswordReset);
router.post("/reset-password", passwordResetProtection, secureVerifyPasswordReset);

// Contact form route with enhanced security
router.post("/contact", contactFormProtection, secureContactSubmission);

// Auth check route
router.get("/check-auth", authenticateMiddleware, (req, res) => {
  const user = req.user;

  res.status(200).json({
    success: true,
    message: "Authenticated user!",
    data: {
      user,
    },
  });
});

// Logout route (client-side token removal)
router.post("/logout", (req, res) => {
  res.clearCookie('accessToken');
  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

module.exports = router;
