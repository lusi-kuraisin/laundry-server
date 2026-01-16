const express = require("express");
const dashboardRoutes = express.Router();
const DashboardController = require("../controllers/DashboardController");

dashboardRoutes.get("/stats", DashboardController.getStats);
dashboardRoutes.get("/charts", DashboardController.getChartsData);

module.exports = dashboardRoutes;
