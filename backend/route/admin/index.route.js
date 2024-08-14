const express = require("express");
const route = express.Router();

const admin = require("./admin.route");
const setting = require("./setting.route");
const user = require("./user.route");
const service = require("./service.route");
const doctorRequest = require("./doctorRequest.route");
const doctor = require("./doctor.route");
const suggestService = require("./suggestService.route");
const coupon = require("./coupon.route");
const review = require("./review.route");
const attendance = require("./attendance.route");
const banner = require("./banner.route");
const complain = require("./complain.route");
const notification = require("./notification.route");
const withdrawRequest = require('./withdrawRequest.route');
const appointment = require('./appointment.route');
const userWallet = require('./userWallet.route');
const doctorWallet = require('./doctorWallet.route');
const doctorBusy = require('./doctorBusy.route');
const dashboard = require('./dashboard.route');

route.use("/dashboard", dashboard)
route.use("/doctorBusy", doctorBusy)
route.use("/doctorWallet", doctorWallet)
route.use("/userWallet", userWallet)
route.use("/appointment", appointment)
route.use("/withdrawRequest", withdrawRequest)
route.use("/notification", notification)
route.use("/complain", complain)
route.use("/banner", banner);
route.use('/attendance',attendance)
route.use('/review',review)
route.use('/coupon',coupon)
route.use('/suggestService',suggestService)
route.use("/doctor", doctor);
route.use("/doctorRequest", doctorRequest);
route.use("/service", service);
route.use("/", admin);
route.use("/setting", setting);
route.use("/user", user);

module.exports = route;
