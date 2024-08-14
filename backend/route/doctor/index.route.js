const express = require("express");
const route = express.Router();

const doctorRequest = require("./doctorRequest.route");
const doctor = require("./doctor.route");
const suggestService = require("./suggestService.route");
const doctorBusy = require("./doctorBusy.route");
const appointment = require("./appointment.route");
const attendance = require("./attendance.route");
const complain = require("./complain.route");
const notification = require("./notification.route");
const withdrawRequest = require('./withdrawRequest.route');
const walletHistory = require('./walletHistory.route');
const service = require('./service.route');
const chatTopic = require("./chatTopic.route");
const chat = require("./chat.route");

route.use("/chat", chat)
route.use("/chatTopic", chatTopic)
route.use("/service", service)
route.use("/doctorWalletHistory", walletHistory)
route.use("/withdrawRequest", withdrawRequest)
route.use("/notification", notification)
route.use("/complain", complain)
route.use('/attendance',attendance)
route.use('/appointment',appointment)
route.use('/busyDoctor',doctorBusy)
route.use('/suggestService',suggestService)
route.use('/',doctor)
route.use('/request',doctorRequest)
module.exports = route;
