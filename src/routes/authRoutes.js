const express = require("express");
const authRoutes = express.Router();
const { loginLimit, sendOtpLimit } = require("../middlewares/rateLimiter");
const verifyToken = require("../middlewares/authMiddleware");
const {
  forgotPassword,
  resetPassword,
  logout,
  loginUser,
} = require("../controllers/AuthController");

authRoutes.post("/login", loginLimit, loginUser);

authRoutes.get("/me", verifyToken, (req, res) => {
  res.json({ user: req.user });
});

authRoutes.post("/logout", logout);

authRoutes.post("/forgot-password", sendOtpLimit, forgotPassword);

authRoutes.post("/reset-password", resetPassword);

module.exports = authRoutes;
