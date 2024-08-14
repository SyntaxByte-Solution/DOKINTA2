const express = require("express");
const route = express.Router();

const holidayController = require("../../controller/admin/doctorBusy.controller");
const checkAccess = require('../../middleware/checkAccess')


route.get("/delete", checkAccess(), holidayController.doctorHoliday);

route.get("/delete", checkAccess(), holidayController.delete);


module.exports = route;
