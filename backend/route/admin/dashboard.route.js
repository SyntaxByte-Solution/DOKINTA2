const express = require("express");
const route = express.Router();

const checkAccess = require("../../middleware/checkAccess");
const dashboardController = require("../../controller/admin/dashboard.controller");

route.get("/allStats", checkAccess(), dashboardController.allStats);
route.get("/chart", checkAccess(), dashboardController.chartApiForPenal);
route.get("/topDoctors", checkAccess(), dashboardController.topDoctors);
route.get("/upcomingBookings", checkAccess(), dashboardController.upcomingBookings);

module.exports = route;
