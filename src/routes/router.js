const express = require("express");
const authRoutes = require("./authRoutes");
const dashboardRoutes = require("./dashboardRoutes");
const customerRoutes = require("./customerRoutes");
const packageRoutes = require("./packageRoutes");
const transactionRoutes = require("./transactionRoutes");
const verifyToken = require("../middlewares/authMiddleware");
const router = express.Router();

router.use("/auth", authRoutes);
router.use("/dashboard", verifyToken, dashboardRoutes);
router.use("/customer", verifyToken, customerRoutes);
router.use("/package", verifyToken, packageRoutes);
router.use("/transaction", verifyToken, transactionRoutes);

module.exports = router;
