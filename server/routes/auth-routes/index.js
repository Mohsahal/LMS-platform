const express = require("express");
const { registerUser, loginUser } = require("../../controllers/auth-controller/index");
const { strictAuthLimiter, moderateActionLimiter } = require("../../middleware/rate-limiters");
const authenticateMiddleware = require("../../middleware/auth-middleware");
const router = express.Router();

router.post("/register", moderateActionLimiter, registerUser);
router.post("/login", strictAuthLimiter, loginUser);
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

module.exports = router;
