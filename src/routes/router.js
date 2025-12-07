const express = require("express");
const authRoutes = require("./authRoutes");
const dashboardRoutes = require("./dashboardRoutes");
const customerRoutes = require("./customerRoutes");
const packageRoutes = require("./packageRoutes");
const transactionRoutes = require("./transactionRoutes");
const router = express.Router();

router.use("/auth", authRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/customer", customerRoutes);
router.use("/package", packageRoutes);
router.use("/transaction", transactionRoutes);

module.exports = router;
