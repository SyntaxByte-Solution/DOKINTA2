const express = require("express");
const route = express.Router();

const checkAccess = require("../../middleware/checkAccess");
const appointmentController = require("../../controller/admin/appointment.controller");


route.get("/get", checkAccess(), appointmentController.getAppointMent);

route.get("/getParticularDoctor", checkAccess(), appointmentController.getParticularDoctor);

route.get("/getParticularUser", checkAccess(), appointmentController.getParticularUser);

route.get("/dailyAppointments", checkAccess(), appointmentController.dailyAppointments);

route.get("/monthlyState", checkAccess(), appointmentController.monthlyState);

route.patch("/cancelAppointment", checkAccess(), appointmentController.cancelAppointment);

module.exports = route;
