const express = require("express");
const route = express.Router();

const checkAccess = require("../../middleware/checkAccess");
const historyController = require("../../controller/doctor/doctorWalletHistory.controller");


route.get("/get", checkAccess(), historyController.get);

module.exports = route;
